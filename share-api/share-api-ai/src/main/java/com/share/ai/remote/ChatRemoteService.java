package com.share.ai.remote;

import com.ai.common.core.domain.R;
import com.share.ai.domain.dto.ChatRequest;
import com.ai.common.core.domain.dto.ChatResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * 聊天远程服务
 */
@FeignClient(contextId = "remoteChatService", value = "share-ai")
public interface ChatRemoteService {

    /**
     * 发送聊天请求
     */
    @PostMapping("/ai/chat/completions")
    R<ChatResponse> chat(@RequestBody ChatRequest request);

    /**
     * 发送流式聊天请求
     */
    @PostMapping(value = "/ai/chat/completions/stream", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    Flux<ChatResponse> chatStream(@RequestBody ChatRequest request);

    /**
     * 获取可用模型列表
     */
    @GetMapping("/ai/model/available")
    R<?> getAvailableModels();

    /**
     * 获取默认模型
     */
    @GetMapping("/ai/model/default")
    R<?> getDefaultModel();

    /**
     * 自动路由聊天请求
     */
    @PostMapping("/ai/route/chat")
    R<ChatResponse> routeChat(@RequestBody ChatRequest request);

    /**
     * 自动路由流式聊天请求
     */
    @PostMapping(value = "/ai/route/chat/stream", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    Flux<ChatResponse> routeChatStream(@RequestBody ChatRequest request);
}