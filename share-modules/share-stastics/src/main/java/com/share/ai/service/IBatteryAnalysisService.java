package com.share.ai.service;

import java.util.Map;

public interface IBatteryAnalysisService {
    
    /**
     * 获取电池分析数据
     * @return 分析数据
     */
    Map<String, Object> getBatteryAnalysisData();
    
    /**
     * 获取电池数据统计
     * @return 统计数据
     */
    Map<String, Object> getBatteryStatistics();
}

