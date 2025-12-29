package com.share.order.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.share.common.core.utils.StringUtils;
import com.share.common.core.utils.poi.ExcelUtil;
import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import com.share.common.core.web.domain.BaseEntity;
import com.share.common.core.web.page.TableDataInfo;
import com.share.common.core.domain.R;
import com.share.order.domain.OrderInfo;
import com.share.order.domain.OrderSqlVo;
import com.share.order.service.IOrderInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

/**
 * 订单管理Controller（后台管理）
 */
@Tag(name = "订单管理接口")
@RestController
@RequestMapping("/orderInfo")
public class OrderInfoController extends BaseController {

    @Autowired
    private IOrderInfoService orderInfoService;

    /**
     * 查询订单列表
     */
    @Operation(summary = "查询订单列表")
    @GetMapping("/list")
    public TableDataInfo<BaseEntity> list(OrderInfo orderInfo) {
        startPage();
        LambdaQueryWrapper<OrderInfo> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotEmpty(orderInfo.getOrderNo())) {
            wrapper.like(OrderInfo::getOrderNo, orderInfo.getOrderNo());
        }
        if (StringUtils.isNotEmpty(orderInfo.getStatus())) {
            wrapper.eq(OrderInfo::getStatus, orderInfo.getStatus());
        }
        wrapper.orderByDesc(OrderInfo::getId);
        List<OrderInfo> list = orderInfoService.list(wrapper);
        return getDataTable(list);
    }

    /**
     * 获取订单详细信息
     */
    @Operation(summary = "获取订单详细信息")
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        return success(orderInfoService.selectOrderInfoById(id));
    }

    /**
     * 根据用户ID查询订单列表
     */
    @Operation(summary = "根据用户ID查询订单列表")
    @GetMapping("/userList/{userId}")
    public AjaxResult getUserOrderList(@PathVariable Long userId) {
        List<OrderInfo> list = orderInfoService.selectOrderListByUserId(userId);
        return success(list);
    }

    /**
     * 导出订单列表
     */
    @Operation(summary = "导出订单列表")
    @PostMapping("/export")
    public void export(HttpServletResponse response, OrderInfo orderInfo) {
        LambdaQueryWrapper<OrderInfo> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotEmpty(orderInfo.getOrderNo())) {
            wrapper.like(OrderInfo::getOrderNo, orderInfo.getOrderNo());
        }
        if (StringUtils.isNotEmpty(orderInfo.getStatus())) {
            wrapper.eq(OrderInfo::getStatus, orderInfo.getStatus());
        }
        wrapper.orderByDesc(OrderInfo::getId);
        List<OrderInfo> list = orderInfoService.list(wrapper);
        ExcelUtil<OrderInfo> util = new ExcelUtil<>(OrderInfo.class);
        util.exportExcel(response, list, "订单数据");
    }

    /**
     * 订单报表统计（远程调用）
     */
    @Operation(summary = "订单报表统计")
    @PostMapping("/getOrderCount")
    public R<Map<String, Object>> getOrderCount(@RequestBody OrderSqlVo orderSqlVo) {
        try {
            if (orderSqlVo == null || StringUtils.isEmpty(orderSqlVo.getSql())) {
                return R.fail("SQL语句不能为空");
            }
            
            String sql = orderSqlVo.getSql();
            // 记录SQL（仅记录前200个字符，避免日志过长）
            String sqlPreview = sql.length() > 200 ? sql.substring(0, 200) + "..." : sql;
            org.slf4j.LoggerFactory.getLogger(OrderInfoController.class)
                .info("执行订单统计SQL: {}", sqlPreview);
            
            Map<String, Object> map = orderInfoService.getOrderCount(sql);
            
            if (map == null) {
                return R.fail("执行SQL查询返回结果为空");
            }
            
            return R.ok(map);
        } catch (Exception e) {
            org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(OrderInfoController.class);
            logger.error("执行订单统计查询失败", e);
            
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = e.getClass().getSimpleName();
            }
            // 限制错误消息长度
            if (errorMessage.length() > 200) {
                errorMessage = errorMessage.substring(0, 200) + "...";
            }
            return R.fail("执行订单统计查询失败: " + errorMessage);
        }
    }

    /**
     * 获取未完成订单（远程调用）
     */
    @Operation(summary = "获取未完成订单")
    @GetMapping("/getNoFinishOrder/{userId}")
    public R<OrderInfo> getNoFinishOrder(@PathVariable Long userId) {
        return R.ok(orderInfoService.getNoFinishOrder(userId));
    }

    /**
     * 根据订单号获取订单信息（远程调用）
     */
    @Operation(summary = "根据订单号获取订单信息")
    @GetMapping("/getByOrderNo/{orderNo}")
    public R<OrderInfo> getByOrderNo(@PathVariable String orderNo) {
        OrderInfo orderInfo = orderInfoService.getByOrderNo(orderNo);
        return R.ok(orderInfo);
    }
}
