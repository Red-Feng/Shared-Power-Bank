package com.share.ai.controller;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import com.share.common.log.annotation.Log;
import com.share.common.log.enums.BusinessType;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * AI聊天控制器
 *
 * @author share
 */
@Tag(name = "AI聊天管理")
@RestController
@RequestMapping("/ai")
public class AiChatController extends BaseController
{
    // 使用内存存储聊天记录（生产环境建议使用数据库）
    private static final Map<String, List<ChatMessage>> chatHistory = new ConcurrentHashMap<>();
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${spring.ai.ollama.base-url}")
    private String ollamaBaseUrl;
    
    @Value("${spring.ai.ollama.chat.options.model}")
    private String model;
    
    @Value("${spring.ai.ollama.chat.system-prompt:}")
    private String systemPrompt;
    
    @Value("${spring.ai.dify.base-url:http://192.168.22.139/v1}")
    private String difyBaseUrl;
    
    @Value("${spring.ai.dify.api-key:}")
    private String difyApiKey;
    
    /**
     * 聊天消息实体类
     */
    public static class ChatMessage {
        private String query;
        private String answer;
        
        public ChatMessage() {}
        
        public ChatMessage(String query, String answer) {
            this.query = query;
            this.answer = answer;
        }
        
        public String getQuery() {
            return query;
        }
        
        public void setQuery(String query) {
            this.query = query;
        }
        
        public String getAnswer() {
            return answer;
        }
        
        public void setAnswer(String answer) {
            this.answer = answer;
        }
    }
    
    /**
     * 聊天接口 - 流式响应
     */
    @Log(title = "AI聊天", businessType = BusinessType.OTHER)
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestParam String prompt, @RequestParam(required = false) String chatId) {
        // 创建SSE发射器，设置超时时间（流式响应需要更长的超时时间）
        final SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        // 如果没有chatId，生成一个新的
        if (chatId == null || chatId.equals("null")) {
            chatId = "chat_" + System.currentTimeMillis();
            
            try {
                // 发送自定义事件头，包含chatId
                emitter.send(SseEmitter.event().name("chat-id").data(chatId));
            } catch (Exception e) {
                emitter.completeWithError(e);
                return emitter;
            }
        }
        
        // 将变量声明为final，以便在lambda表达式中使用
        final String finalChatId = chatId;
        final String finalPrompt = prompt;
        final StringBuilder fullResponse = new StringBuilder(); // 用于保存完整响应
        
        // 在新线程中处理聊天请求
        new Thread(() -> {
            try {
                // 准备Ollama API请求
                final String url = ollamaBaseUrl + "/api/generate";
                
                // 合并系统提示词和用户输入
                String fullPrompt = finalPrompt;
                if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                    fullPrompt = systemPrompt.trim() + "\n\n" + finalPrompt;
                }
                
                // 构建请求体 - 设置stream=true，启用流式响应
                Map<String, Object> requestBody = new ConcurrentHashMap<>();
                requestBody.put("model", model);
                requestBody.put("prompt", fullPrompt);
                requestBody.put("stream", true); // 启用流式响应
                
                // 设置请求头
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                // 创建请求实体
                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
                
                // 使用RestTemplate处理流式响应
                ObjectMapper objectMapper = new ObjectMapper();
                String requestBodyJson = objectMapper.writeValueAsString(requestBody);
                
                // 配置RestTemplate支持流式响应
                SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout(5000);
                factory.setReadTimeout(300000); // 5分钟读取超时
                RestTemplate streamingRestTemplate = new RestTemplate(factory);
                
                // 创建请求回调
                RequestCallback requestCallback = request -> {
                    request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                    request.getBody().write(requestBodyJson.getBytes(StandardCharsets.UTF_8));
                };
                
                // 创建响应提取器，处理流式响应
                ResponseExtractor<Void> responseExtractor = response -> {
                    try (InputStream inputStream = response.getBody();
                         BufferedReader reader = new BufferedReader(
                             new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                        
                        String line;
                        while ((line = reader.readLine()) != null) {
                            if (line.trim().isEmpty()) continue;
                            
                            try {
                                // 解析JSON响应
                                Map<String, Object> jsonResponse = objectMapper.readValue(line, Map.class);
                                
                                // 提取response字段
                                if (jsonResponse.containsKey("response")) {
                                    String chunk = (String) jsonResponse.get("response");
                                    if (chunk != null && !chunk.isEmpty()) {
                                        fullResponse.append(chunk);
                                        // 流式发送每个chunk给前端
                                        emitter.send(SseEmitter.event().data(chunk));
                                    }
                                }
                                
                                // 检查是否完成
                                Boolean done = (Boolean) jsonResponse.get("done");
                                if (Boolean.TRUE.equals(done)) {
                                    break;
                                }
                            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                                // 忽略JSON解析错误，继续处理下一行
                                continue;
                            }
                        }
                        
                        // 保存完整聊天记录
                        saveChatMessage(finalChatId, finalPrompt, fullResponse.toString());
                        
                        // 标记完成
                        emitter.complete();
                    } catch (Exception e) {
                        try {
                            String errorMessage = "处理流式响应异常: " + e.getMessage();
                            emitter.send(SseEmitter.event().data(errorMessage));
                            saveChatMessage(finalChatId, finalPrompt, errorMessage);
                            emitter.complete();
                        } catch (Exception ex) {
                            emitter.completeWithError(ex);
                        }
                    }
                    return null;
                };
                
                // 执行请求
                try {
                    streamingRestTemplate.execute(url, HttpMethod.POST, requestCallback, responseExtractor);
                } catch (Exception e) {
                    String errorMessage = "AI服务请求异常: " + e.getMessage();
                    emitter.send(SseEmitter.event().data(errorMessage));
                    saveChatMessage(finalChatId, finalPrompt, errorMessage);
                    emitter.complete();
                }
                    
            } catch (Exception e) {
                try {
                    String errorMessage = "AI服务异常: " + e.getMessage();
                    emitter.send(SseEmitter.event().data(errorMessage));
                    saveChatMessage(finalChatId, finalPrompt, errorMessage);
                    emitter.complete();
                } catch (Exception ex) {
                    emitter.completeWithError(ex);
                }
            }
        }).start();
        
        return emitter;
    }
    
    /**
     * 获取聊天历史记录列表
     */
    @Log(title = "获取聊天历史", businessType = BusinessType.OTHER)
    @GetMapping("/history")
    public AjaxResult getChatHistory() {
        // 模拟返回聊天历史记录ID列表
        // 实际项目中应该从数据库查询
        
        // 这里简化处理，返回所有chatId和对应的第一条消息作为标题
        return success(chatHistory.keySet().stream().map(chatId -> {
            Map<String, Object> item = new ConcurrentHashMap<>();
            item.put("id", chatId);
            
            // 获取第一条消息作为标题
            List<ChatMessage> messages = chatHistory.get(chatId);
            if (messages != null && !messages.isEmpty()) {
                String firstQuery = messages.get(0).getQuery();
                // 限制标题长度
                String title = firstQuery.length() > 20 ? 
                    firstQuery.substring(0, 20) + "..." : firstQuery;
                item.put("name", title);
            } else {
                item.put("name", "新会话");
            }
            
            return item;
        }).toList());
    }
    
    /**
     * 获取特定聊天记录详情
     */
    @Log(title = "获取聊天详情", businessType = BusinessType.OTHER)
    @GetMapping("/history/{chatId}")
    public AjaxResult getChatHistoryDetail(@PathVariable String chatId) {
        List<ChatMessage> messages = chatHistory.get(chatId);
        return success(messages != null ? messages : List.of());
    }
    
    /**
     * 删除聊天记录
     */
    @Log(title = "删除聊天记录", businessType = BusinessType.DELETE)
    @DeleteMapping("/history/{chatId}")
    public AjaxResult deleteChatHistory(@PathVariable String chatId) {
        chatHistory.remove(chatId);
        return success();
    }
    
    /**
     * Dify聊天接口 - 流式响应
     */
    @Log(title = "Dify AI聊天", businessType = BusinessType.OTHER)
    @PostMapping(value = "/dify/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter difyChat(@RequestBody Map<String, Object> requestBody) {
        // 创建SSE发射器
        final SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
        
        // 提取请求参数
        String query = (String) requestBody.get("query");
        String conversationId = requestBody.containsKey("conversation_id") ? 
            (String) requestBody.get("conversation_id") : null;
        String user = requestBody.containsKey("user") ? 
            (String) requestBody.get("user") : "default-user";
        
        if (query == null || query.trim().isEmpty()) {
            try {
                emitter.send(SseEmitter.event().data("错误：查询内容不能为空"));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }
        
        // 在新线程中处理Dify请求
        new Thread(() -> {
            try {
                // 构建Dify API请求
                final String url = difyBaseUrl + "/chat-messages";
                
                // 记录配置信息（不记录完整API Key，只记录前几位）
                String apiKeyMasked = (difyApiKey != null && difyApiKey.length() > 8) ? 
                    difyApiKey.substring(0, 8) + "..." : "未配置";
                System.out.println("=== Dify配置信息 ===");
                System.out.println("URL: " + url);
                System.out.println("API Key前缀: " + apiKeyMasked);
                System.out.println("API Key长度: " + (difyApiKey != null ? difyApiKey.length() : 0));
                System.out.println("API Key是否为空: " + (difyApiKey == null || difyApiKey.isEmpty()));
                
                Map<String, Object> difyRequestBody = new ConcurrentHashMap<>();
                difyRequestBody.put("query", query);
                difyRequestBody.put("response_mode", "streaming");
                difyRequestBody.put("user", user);
                if (conversationId != null && !conversationId.isEmpty()) {
                    difyRequestBody.put("conversation_id", conversationId);
                }
                difyRequestBody.put("inputs", new ConcurrentHashMap<>());
                
                // 设置请求头
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                if (difyApiKey != null && !difyApiKey.isEmpty()) {
                    String authHeader = "Bearer " + difyApiKey;
                    headers.set("Authorization", authHeader);
                    System.out.println("Authorization头已设置，长度: " + authHeader.length());
                    System.out.println("Authorization头前缀: " + authHeader.substring(0, Math.min(20, authHeader.length())));
                } else {
                    System.err.println("❌ 错误: Dify API Key未配置或为空！");
                    String errorMsg = "Dify API Key未配置，请在application.yml中配置spring.ai.dify.api-key";
                    emitter.send(SseEmitter.event().data("data: {\"event\":\"error\",\"message\":\"" + errorMsg + "\"}\n"));
                    emitter.complete();
                    return;
                }
                
                // 创建请求实体
                ObjectMapper objectMapper = new ObjectMapper();
                String requestBodyJson = objectMapper.writeValueAsString(difyRequestBody);
                HttpEntity<String> requestEntity = new HttpEntity<>(requestBodyJson, headers);
                
                // 配置RestTemplate支持流式响应
                SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout(5000);
                factory.setReadTimeout(300000);
                RestTemplate streamingRestTemplate = new RestTemplate(factory);
                
                // 创建请求回调
                RequestCallback requestCallback = request -> {
                    request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                    if (difyApiKey != null && !difyApiKey.isEmpty()) {
                        request.getHeaders().set("Authorization", "Bearer " + difyApiKey);
                    }
                    request.getBody().write(requestBodyJson.getBytes(StandardCharsets.UTF_8));
                };
                
                // 创建响应提取器，处理Dify流式响应
                ResponseExtractor<Void> responseExtractor = response -> {
                    try (InputStream inputStream = response.getBody();
                         BufferedReader reader = new BufferedReader(
                             new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                        
                        String line;
                        boolean isMessageEnd = false;
                        
                        while ((line = reader.readLine()) != null && !isMessageEnd) {
                            if (line.trim().isEmpty()) continue;
                            
                            // Dify格式: data: {"event": "message", "answer": "chunk", ...}
                            if (line.startsWith("data:")) {
                                String jsonData = line.substring(5).trim();
                                
                                // 直接转发给前端（保持Dify原始格式）
                                emitter.send(SseEmitter.event().data(line + "\n"));
                                
                                // 检查是否是结束事件
                                try {
                                    Map<String, Object> data = objectMapper.readValue(jsonData, Map.class);
                                    if ("message_end".equals(data.get("event"))) {
                                        isMessageEnd = true;
                                        break;
                                    }
                                    if ("error".equals(data.get("event"))) {
                                        isMessageEnd = true;
                                        break;
                                    }
                                } catch (Exception e) {
                                    // 忽略JSON解析错误，继续转发
                                }
                            } else {
                                // 如果不是data:开头，也转发（可能是其他格式）
                                emitter.send(SseEmitter.event().data(line + "\n"));
                            }
                        }
                        
                        emitter.complete();
                    } catch (Exception e) {
                        try {
                            String errorMessage = "处理Dify流式响应异常: " + e.getMessage();
                            emitter.send(SseEmitter.event().data("data: {\"event\":\"error\",\"message\":\"" + 
                                errorMessage.replace("\"", "\\\"") + "\"}\n"));
                            emitter.complete();
                        } catch (Exception ex) {
                            emitter.completeWithError(ex);
                        }
                    }
                    return null;
                };
                
                // 执行请求
                try {
                    streamingRestTemplate.execute(url, HttpMethod.POST, requestCallback, responseExtractor);
                } catch (org.springframework.web.client.HttpClientErrorException e) {
                    // 处理HTTP错误（如401）
                    System.err.println("❌ Dify API请求失败:");
                    System.err.println("状态码: " + e.getStatusCode());
                    System.err.println("状态文本: " + e.getStatusText());
                    System.err.println("响应体: " + e.getResponseBodyAsString());
                    
                    String errorMessage = "Dify服务请求异常: " + e.getStatusCode() + " " + e.getStatusText();
                    if (e.getResponseBodyAsString() != null && !e.getResponseBodyAsString().isEmpty()) {
                        errorMessage += ": " + e.getResponseBodyAsString();
                    }
                    
                    // 如果是401错误，提供更详细的提示
                    if (e.getStatusCode().value() == 401) {
                        errorMessage += "\n\n可能的原因：\n" +
                            "1. API Key配置不正确或未生效（请重启服务）\n" +
                            "2. API Key已过期或被撤销\n" +
                            "3. API Key格式不正确（应以'app-'开头）\n" +
                            "4. 配置文件路径不正确";
                    }
                    
                    // 转义JSON字符串中的特殊字符
                    String escapedMessage = errorMessage.replace("\\", "\\\\")
                                                       .replace("\"", "\\\"")
                                                       .replace("\n", "\\n")
                                                       .replace("\r", "\\r");
                    emitter.send(SseEmitter.event().data("data: {\"event\":\"error\",\"message\":\"" + escapedMessage + "\"}\n"));
                    emitter.complete();
                } catch (Exception e) {
                    String errorMessage = "Dify服务请求异常: " + e.getMessage();
                    // 转义JSON字符串中的特殊字符
                    String escapedMessage = errorMessage.replace("\\", "\\\\")
                                                       .replace("\"", "\\\"")
                                                       .replace("\n", "\\n")
                                                       .replace("\r", "\\r");
                    emitter.send(SseEmitter.event().data("data: {\"event\":\"error\",\"message\":\"" + escapedMessage + "\"}\n"));
                    emitter.complete();
                }
            } catch (Exception e) {
                try {
                    String errorMessage = "Dify服务异常: " + e.getMessage();
                    // 转义JSON字符串中的特殊字符
                    String escapedMessage = errorMessage.replace("\\", "\\\\")
                                                       .replace("\"", "\\\"")
                                                       .replace("\n", "\\n")
                                                       .replace("\r", "\\r");
                    emitter.send(SseEmitter.event().data("data: {\"event\":\"error\",\"message\":\"" + escapedMessage + "\"}\n"));
                    emitter.complete();
                } catch (Exception ex) {
                    emitter.completeWithError(ex);
                }
            }
        }).start();
        
        return emitter;
    }
    
    /**
     * 保存聊天消息
     */
    private void saveChatMessage(String chatId, String query, String answer) {
        List<ChatMessage> messages = chatHistory.computeIfAbsent(chatId, k -> new java.util.ArrayList<>());
        messages.add(new ChatMessage(query, answer));
    }
}