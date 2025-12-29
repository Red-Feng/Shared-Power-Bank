package com.share.device.controller;

import com.alibaba.fastjson.JSONObject;
import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

/**
 * 地图服务Controller
 */
@Tag(name = "地图服务接口")
@RestController
@RequestMapping("/map")
public class MapController extends BaseController {

    @Autowired
    private RestTemplate restTemplate;

    private String key = "GT5BZ-ARVWZ-H37XT-TXB3T-OGESQ-C4BRV";
    // 签名密钥（在腾讯位置服务控制台的Key设置中获取）
    private String sk = "OW1PlnluAmY7nwi3Gw75rZpR8XrgTZeB";

    /**
     * 生成签名
     */
    private String generateSig(String path, Map<String, String> params) {
        try {
            StringBuilder sb = new StringBuilder(path + "?");
            params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(e -> sb.append(e.getKey()).append("=").append(e.getValue()).append("&"));
            sb.deleteCharAt(sb.length() - 1);
            sb.append(sk);

            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(sb.toString().getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : digest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * 根据经纬度获取地址
     */
    @Operation(summary = "根据经纬度获取地址")
    @GetMapping("/calculateAddress/{latitude}/{longitude}")
    public AjaxResult calculateAddress(@PathVariable String latitude,
                                       @PathVariable String longitude) {
        // 构建参数用于签名
        Map<String, String> params = new HashMap<>();
        params.put("location", latitude + "," + longitude);
        params.put("key", key);

        // 生成签名
        String sig = generateSig("/ws/geocoder/v1/", params);

        // 带签名的请求URL
        String url = "https://apis.map.qq.com/ws/geocoder/v1/?location={location}&key={key}&sig={sig}";

        Map<String, String> map = new HashMap<>();
        map.put("location", latitude + "," + longitude);
        map.put("key", key);
        map.put("sig", sig);

        JSONObject result = restTemplate.getForObject(url, JSONObject.class, map);
        if (result == null || result.getIntValue("status") != 0) {
            return error("地图服务调用失败");
        }

        JSONObject data = new JSONObject();
        JSONObject resultObj = result.getJSONObject("result");
        data.put("address", resultObj.getString("address"));
        data.put("lat", latitude);
        data.put("lng", longitude);

        return success(data);
    }

    /**
     * 根据关键字获取经纬度
     */
    @Operation(summary = "根据关键字获取经纬度")
    @GetMapping("/calculateLatLng/{keyword}")
    public AjaxResult calculateLatLng(@PathVariable String keyword) {
        // 构建参数用于签名
        Map<String, String> params = new HashMap<>();
        params.put("address", keyword);
        params.put("key", key);

        // 生成签名
        String sig = generateSig("/ws/geocoder/v1/", params);

        // 带签名的请求URL
        String url = "https://apis.map.qq.com/ws/geocoder/v1/?address={address}&key={key}&sig={sig}";

        Map<String, String> map = new HashMap<>();
        map.put("address", keyword);
        map.put("key", key);
        map.put("sig", sig);

        JSONObject result = restTemplate.getForObject(url, JSONObject.class, map);
        if (result == null || result.getIntValue("status") != 0) {
            return error("地图服务调用失败");
        }

        JSONObject data = new JSONObject();
        JSONObject location = result.getJSONObject("result").getJSONObject("location");
        data.put("lat", location.getBigDecimal("lat"));
        data.put("lng", location.getBigDecimal("lng"));

        return success(data);
    }
}
