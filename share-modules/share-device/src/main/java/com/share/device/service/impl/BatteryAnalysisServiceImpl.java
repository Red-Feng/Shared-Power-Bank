package com.share.device.service.impl;

import com.share.device.service.IBatteryAnalysisService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

@Service
public class BatteryAnalysisServiceImpl implements IBatteryAnalysisService {

    @Override
    public Map<String, Object> getBatteryAnalysisData() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 读取Excel文件
            ClassPathResource resource = new ClassPathResource("battery-analysis/BatteryData.xlsx");
            InputStream inputStream = resource.getInputStream();
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            
            List<Map<String, Object>> dataList = new ArrayList<>();
            List<Double> cyclesList = new ArrayList<>();
            List<Double> tempList = new ArrayList<>();
            List<Double> healthList = new ArrayList<>();
            
            // 读取表头
            Row headerRow = sheet.getRow(0);
            Map<Integer, String> headerMap = new HashMap<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    headerMap.put(i, getCellValue(cell));
                }
            }
            
            // 读取数据（从第2行开始，跳过表头）
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Map<String, Object> rowData = new HashMap<>();
                boolean hasData = false;
                
                for (int j = 0; j < headerMap.size(); j++) {
                    Cell cell = row.getCell(j);
                    String header = headerMap.get(j);
                    Object value = getCellValue(cell);
                    
                    if (value != null && !value.toString().trim().isEmpty()) {
                        hasData = true;
                        rowData.put(header, value);
                        
                        // 提取数值用于图表
                        if (header != null) {
                            if (header.contains("充放电次数") || header.contains("次数")) {
                                try {
                                    double cycles = Double.parseDouble(value.toString().replaceAll("[^0-9.]", ""));
                                    cyclesList.add(cycles);
                                } catch (Exception e) {
                                    // 忽略解析错误
                                }
                            } else if (header.contains("环境温度") || header.contains("温度")) {
                                try {
                                    double temp = Double.parseDouble(value.toString().replaceAll("[^0-9.]", ""));
                                    tempList.add(temp);
                                } catch (Exception e) {
                                    // 忽略解析错误
                                }
                            } else if (header.contains("电池量") || header.contains("健康")) {
                                try {
                                    double health = Double.parseDouble(value.toString().replaceAll("[^0-9.]", ""));
                                    healthList.add(health);
                                } catch (Exception e) {
                                    // 忽略解析错误
                                }
                            }
                        }
                    }
                }
                
                if (hasData) {
                    dataList.add(rowData);
                }
            }
            
            workbook.close();
            inputStream.close();
            
            // 生成模拟数据（如果Excel数据不足）
            if (dataList.size() < 10) {
                return generateMockData();
            }
            
            result.put("dataList", dataList);
            result.put("cyclesList", cyclesList);
            result.put("tempList", tempList);
            result.put("healthList", healthList);
            result.put("total", dataList.size());
            
        } catch (Exception e) {
            // 如果读取失败，返回模拟数据
            return generateMockData();
        }
        
        return result;
    }
    
    @Override
    public Map<String, Object> getBatteryStatistics() {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> analysisData = getBatteryAnalysisData();
        
        @SuppressWarnings("unchecked")
        List<Double> healthList = (List<Double>) analysisData.get("healthList");
        
        if (healthList != null && !healthList.isEmpty()) {
            double sum = healthList.stream().mapToDouble(Double::doubleValue).sum();
            double avg = sum / healthList.size();
            double max = healthList.stream().mapToDouble(Double::doubleValue).max().orElse(0);
            double min = healthList.stream().mapToDouble(Double::doubleValue).min().orElse(0);
            
            // 统计健康度分布
            long excellent = healthList.stream().filter(h -> h >= 0.8).count();
            long good = healthList.stream().filter(h -> h >= 0.6 && h < 0.8).count();
            long fair = healthList.stream().filter(h -> h >= 0.4 && h < 0.6).count();
            long poor = healthList.stream().filter(h -> h < 0.4).count();
            
            result.put("total", healthList.size());
            result.put("average", Math.round(avg * 10000.0) / 100.0);
            result.put("max", Math.round(max * 10000.0) / 100.0);
            result.put("min", Math.round(min * 10000.0) / 100.0);
            result.put("excellent", excellent);
            result.put("good", good);
            result.put("fair", fair);
            result.put("poor", poor);
        } else {
            result.put("total", 0);
            result.put("average", 0);
            result.put("max", 0);
            result.put("min", 0);
            result.put("excellent", 0);
            result.put("good", 0);
            result.put("fair", 0);
            result.put("poor", 0);
        }
        
        return result;
    }
    
    private String getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    private Map<String, Object> generateMockData() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> dataList = new ArrayList<>();
        List<Double> cyclesList = new ArrayList<>();
        List<Double> tempList = new ArrayList<>();
        List<Double> healthList = new ArrayList<>();
        
        Random random = new Random();
        for (int i = 0; i < 100; i++) {
            double cycles = 10 + (i * 3.2);
            double temp = 12 + (i * 0.43) + random.nextGaussian() * 2;
            double health = 1.0 - (cycles * 0.0012) - (temp * 0.0005) + random.nextGaussian() * 0.01;
            health = Math.max(0.1, Math.min(1.0, health));
            
            Map<String, Object> rowData = new HashMap<>();
            rowData.put("充放电次数", String.format("%.0f", cycles));
            rowData.put("环境温度", String.format("%.1f", temp));
            rowData.put("电池量", String.format("%.4f", health));
            
            dataList.add(rowData);
            cyclesList.add(cycles);
            tempList.add(temp);
            healthList.add(health);
        }
        
        result.put("dataList", dataList);
        result.put("cyclesList", cyclesList);
        result.put("tempList", tempList);
        result.put("healthList", healthList);
        result.put("total", dataList.size());
        
        return result;
    }
}

