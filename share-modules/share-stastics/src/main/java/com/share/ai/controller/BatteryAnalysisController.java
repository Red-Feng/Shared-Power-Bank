package com.share.ai.controller;

import com.share.ai.service.IBatteryAnalysisService;
import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "电池分析接口管理")
@RestController
@RequestMapping({"/sta/device/battery", "/sta/battery"})
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

    @Operation(summary = "获取损失曲线图片")
    @GetMapping("/image/loss")
    public ResponseEntity<Resource> getLossImage() {
        try {
            // 使用 image1.png 作为损失曲线图片
            Resource resource = new ClassPathResource("battery-analysis/image1.png");
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("image/png"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"loss.png\"")
                    .body(resource);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "获取准确率曲线图片")
    @GetMapping("/image/accuracy")
    public ResponseEntity<Resource> getAccuracyImage() {
        try {
            // 使用 image.png 作为准确率曲线图片
            Resource resource = new ClassPathResource("battery-analysis/image.png");
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("image/png"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"accuracy.png\"")
                    .body(resource);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.notFound().build();
    }
}

