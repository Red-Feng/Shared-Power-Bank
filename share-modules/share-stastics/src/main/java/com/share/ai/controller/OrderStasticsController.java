package com.share.ai.controller;

import com.share.common.core.domain.R;
import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import com.share.order.api.RemoteOrderInfoService;
import com.share.order.domain.OrderSqlVo;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Tag(name = "AI数据统计")
@RestController
@RequestMapping("/sta")
public class OrderStasticsController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(OrderStasticsController.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RemoteOrderInfoService remoteOrderInfoService;

    @Value("${spring.ai.ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${spring.ai.ollama.chat.options.model}")
    private String model;

    @Value("${spring.ai.ollama.order-report.use-ai:true}")
    private boolean useAi;
    
    @Value("${spring.ai.ollama.order-report.system-prompt:}")
    private String orderReportSystemPrompt;

    @GetMapping("/orderData")
    public AjaxResult getOrderData(@RequestParam(value = "message", defaultValue = "hello")
                                       String message) {
        try {
            log.info("收到订单数据查询请求，用户输入: {}", message);
            
            // 根据配置选择使用AI或直接生成SQL
            String sql;
            if (useAi) {
                sql = generateSqlFromOllama(message);
                log.info("AI生成的SQL语句: {}", sql);
            } else {
                sql = generateSqlDirectly(message);
                log.info("直接生成的SQL语句: {}", sql);
            }
            
            // 根据sql获取报表数据
            OrderSqlVo orderSqlVo = new OrderSqlVo();
            orderSqlVo.setSql(sql);
            
            log.info("准备调用远程订单服务，SQL: {}", sql);
            R<Map<String, Object>> result = null;
            try {
                result = remoteOrderInfoService.getOrderCount(orderSqlVo);
            } catch (Exception e) {
                log.error("远程服务调用异常", e);
                return error("远程服务调用失败: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
            }
            
            log.info("远程服务调用结果 - code: {}, msg: {}", 
                    result != null ? result.getCode() : "null", 
                    result != null ? result.getMsg() : "null");
            
            // 检查远程服务调用是否成功
            if (result == null) {
                log.error("远程服务返回null");
                return error("远程服务调用失败，返回结果为空");
            }
            
            if (result.getCode() != R.SUCCESS) {
                String errorMsg = result.getMsg() != null ? result.getMsg() : "未知错误";
                log.error("远程服务调用失败，错误信息: {}", errorMsg);
                return error("获取订单数据失败: " + errorMsg);
            }
            
            Map<String, Object> map = result.getData();
            if (map == null) {
                log.warn("远程服务返回数据为null");
                return error("未获取到订单数据");
            }
            
            log.info("成功获取订单数据，dateList大小: {}, countList大小: {}", 
                    map.get("dateList") != null ? ((java.util.List<?>)map.get("dateList")).size() : 0,
                    map.get("countList") != null ? ((java.util.List<?>)map.get("countList")).size() : 0);
            
            return success(map);
        } catch (Exception e) {
            log.error("处理订单数据查询请求时发生异常", e);
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = e.getClass().getSimpleName();
            }
            // 限制错误消息长度，避免过长
            if (errorMessage.length() > 200) {
                errorMessage = errorMessage.substring(0, 200) + "...";
            }
            return error("处理请求失败: " + errorMessage);
        }
    }

    @GetMapping("/ordersta")
    public AjaxResult getOrderSta(@RequestParam(value = "message", defaultValue = "查询所有订单数量")
                                      String message) {
        // 调用 orderData 接口
        return getOrderData(message);
    }

    /**
     * 使用本地Ollama模型生成SQL语句
     */
    private String generateSqlFromOllama(String userMessage) {
        // 准备Ollama API请求
        final String url = ollamaBaseUrl + "/api/generate";

        // 构建系统提示词（专门用于SQL生成）
        String systemPrompt = orderReportSystemPrompt;
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            systemPrompt = "你是一个专业的SQL生成助手。根据用户的需求，生成对应的SQL查询语句。" +
                    "只返回SQL语句，不要包含其他解释性文字。";
        }

        // 合并系统提示词和用户输入
        String fullPrompt = systemPrompt.trim() + "\n\n用户需求：" + userMessage;
        log.debug("发送给Ollama的完整提示词: {}", fullPrompt);

        // 构建请求体
        Map<String, Object> requestBody = new ConcurrentHashMap<>();
        requestBody.put("model", model);
        requestBody.put("prompt", fullPrompt);
        requestBody.put("stream", false);
        
        log.info("调用Ollama API - URL: {}, Model: {}", url, model);

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 创建请求实体
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // 发送请求，获取单个JSON响应
        @SuppressWarnings({"unchecked", "rawtypes"})
        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

        log.info("Ollama API响应状态: {}", response.getStatusCode());
        log.debug("Ollama API完整响应: {}", response.getBody());

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> responseMap = response.getBody();
            log.info("Ollama响应包含的键: {}", responseMap.keySet());
            
            if (responseMap != null && responseMap.containsKey("response")) {
                String sqlResponse = (String) responseMap.get("response");
                log.info("AI原始SQL响应: {}", sqlResponse);
                
                if (sqlResponse != null) {
                    // 清理SQL响应，移除可能的markdown代码块标记
                    String originalSql = sqlResponse;
                    sqlResponse = sqlResponse.trim();
                    if (sqlResponse.startsWith("```sql")) {
                        sqlResponse = sqlResponse.substring(6);
                    }
                    if (sqlResponse.startsWith("```")) {
                        sqlResponse = sqlResponse.substring(3);
                    }
                    if (sqlResponse.endsWith("```")) {
                        sqlResponse = sqlResponse.substring(0, sqlResponse.length() - 3);
                    }
                    String cleanedSql = sqlResponse.trim();
                    
                    // 验证和修复SQL格式
                    cleanedSql = validateAndFixSql(cleanedSql);
                    
                    log.info("清理后的SQL语句: {}", cleanedSql);
                    return cleanedSql;
                } else {
                    log.error("AI响应中response字段为null");
                }
            } else {
                log.error("AI响应格式错误，缺少response字段。完整响应: {}", responseMap);
            }
            throw new RuntimeException("AI响应格式错误: " + responseMap.toString());
        } else {
            log.error("Ollama API请求失败，状态码: {}", response.getStatusCode());
            throw new RuntimeException("AI服务请求失败: " + response.getStatusCode());
        }
    }
    
    /**
     * 验证和修复SQL格式，确保返回正确的字段名
     */
    private String validateAndFixSql(String sql) {
        if (sql == null || sql.trim().isEmpty()) {
            throw new RuntimeException("生成的SQL为空");
        }
        
        // 移除多余的空白字符，但保留基本格式
        sql = sql.replaceAll("\\s+", " ").trim();
        
        // 转换为小写进行验证（不改变原SQL）
        String sqlLower = sql.toLowerCase();
        
        // 检查是否包含必要的字段别名
        boolean hasOrderDate = sqlLower.contains("as order_date") || 
                              sqlLower.contains("order_date");
        boolean hasOrderCount = sqlLower.contains("as order_count") || 
                               sqlLower.contains("order_count");
        
        // 验证基本结构
        if (!sqlLower.startsWith("select")) {
            throw new RuntimeException("生成的SQL不是SELECT语句: " + sql.substring(0, Math.min(50, sql.length())));
        }
        
        if (!sqlLower.contains("from order_info") && !sqlLower.contains("from `order_info`")) {
            log.warn("SQL中可能缺少order_info表，SQL: {}", sql.substring(0, Math.min(100, sql.length())));
        }
        
        // 如果缺少必要字段，记录警告但继续执行（让数据库报错更明确）
        if (!hasOrderDate || !hasOrderCount) {
            log.warn("生成的SQL可能缺少必要字段别名。order_date: {}, order_count: {}, SQL: {}", 
                    hasOrderDate, hasOrderCount, sql.substring(0, Math.min(200, sql.length())));
        }
        
        return sql;
    }
    
    /**
     * 直接根据用户输入生成SQL，不经过AI
     */
    private String generateSqlDirectly(String userMessage) {
        String message = userMessage != null ? userMessage.trim().toLowerCase() : "";
        String whereClause = "";
        String dateFormat = "DATE_FORMAT(create_time, '%Y-%m')"; // 默认按月统计
        String groupByExpr = dateFormat; // GROUP BY必须使用完整表达式，不能使用别名
        int currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR);
        
        // 解析月份（1-12月）
        if (message.contains("1月") || message.contains("一月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-01'";
        } else if (message.contains("2月") || message.contains("二月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-02'";
        } else if (message.contains("3月") || message.contains("三月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-03'";
        } else if (message.contains("4月") || message.contains("四月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-04'";
        } else if (message.contains("5月") || message.contains("五月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-05'";
        } else if (message.contains("6月") || message.contains("六月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-06'";
        } else if (message.contains("7月") || message.contains("七月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-07'";
        } else if (message.contains("8月") || message.contains("八月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-08'";
        } else if (message.contains("9月") || message.contains("九月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-09'";
        } else if (message.contains("10月") || message.contains("十月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-10'";
        } else if (message.contains("11月") || message.contains("十一月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-11'";
        } else if (message.contains("12月") || message.contains("十二月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = '" + currentYear + "-12'";
        } else if (message.contains("今天") || message.contains("今日")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m-%d')";
            groupByExpr = dateFormat;
            whereClause = "WHERE DATE(create_time) = CURDATE()";
        } else if (message.contains("昨天") || message.contains("昨日")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m-%d')";
            groupByExpr = dateFormat;
            whereClause = "WHERE DATE(create_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
        } else if (message.contains("本周") || message.contains("这周")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m-%d')";
            groupByExpr = dateFormat;
            whereClause = "WHERE YEARWEEK(create_time, 1) = YEARWEEK(CURDATE(), 1)";
        } else if (message.contains("上周") || message.contains("上星期")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m-%d')";
            groupByExpr = dateFormat;
            whereClause = "WHERE YEARWEEK(create_time, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)";
        } else if (message.contains("本月") || message.contains("这个月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')";
        } else if (message.contains("上月") || message.contains("上个月")) {
            whereClause = "WHERE DATE_FORMAT(create_time, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')";
        } else if (message.contains("今年")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m')";
            groupByExpr = dateFormat;
            whereClause = "WHERE YEAR(create_time) = YEAR(CURDATE())";
        } else if (message.contains("去年")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m')";
            groupByExpr = dateFormat;
            whereClause = "WHERE YEAR(create_time) = YEAR(CURDATE()) - 1";
        } else if (message.contains("按日") || message.contains("每天")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y-%m-%d')";
            groupByExpr = dateFormat;
        } else if (message.contains("按年") || message.contains("每年")) {
            dateFormat = "DATE_FORMAT(create_time, '%Y')";
            groupByExpr = dateFormat;
        }
        
        // 构建SQL语句 - GROUP BY必须使用完整表达式，不能使用别名
        String sql = String.format(
            "SELECT %s AS order_date, COUNT(*) AS order_count FROM order_info %s GROUP BY %s ORDER BY %s",
            dateFormat,
            whereClause,
            groupByExpr,
            groupByExpr
        );
        
        log.debug("生成的SQL: {}", sql);
        return sql;
    }
}
