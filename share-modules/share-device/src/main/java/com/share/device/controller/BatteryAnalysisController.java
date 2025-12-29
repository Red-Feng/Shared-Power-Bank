package com.share.device.controller;

import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import com.share.device.service.IBatteryAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "电池分析接口管理")
@RestController
@RequestMapping("/device/battery")
public class BatteryAnalysisController extends BaseController {

    @Autowired
    private IBatteryAnalysisService batteryAnalysisService;

    @Operation(summary = "获取电池分析数据")
    @GetMapping("/analysis")
    public AjaxResult getBatteryAnalysis() {
        Map<String, Object> result = batteryAnalysisService.getBatteryAnalysisData();
        return success(result);
    }

    @Operation(summary = "获取电池数据统计")
    @GetMapping("/statistics")
    public AjaxResult getBatteryStatistics() {
        Map<String, Object> result = batteryAnalysisService.getBatteryStatistics();
        return success(result);
    }
}

