package com.share.device.controller;

import com.share.common.core.web.controller.BaseController;
import com.share.common.core.web.domain.AjaxResult;
import com.share.common.core.web.domain.BaseEntity;
import com.share.common.core.web.page.TableDataInfo;
import com.share.device.domain.Station;
import com.share.device.domain.StationVo;
import com.share.device.service.IDeviceService;
import com.share.device.service.IStationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "站点接口管理")
@RestController
@RequestMapping("/station")
public class StationController extends BaseController {

    @Autowired
    private IStationService stationService;

    @Autowired
    private IDeviceService deviceService;

    //分页查询
    @Operation(summary = "查询站点列表")
    @GetMapping("/list")
    public TableDataInfo<BaseEntity> list(Station station) {
        //设置分页参数
        startPage();
        //查询
        List<Station> list = stationService.selectStationList(station);
        TableDataInfo<BaseEntity> tableDataInfo = getDataTable(list);
        return tableDataInfo;
    }

    //添加
    @Operation(summary = "新增站点")
    @PostMapping
    public AjaxResult add(@RequestBody Station station) {
        return toAjax(stationService.saveStation(station));
    }

    //修改
    @Operation(summary = "修改站点")
    @PutMapping
    public AjaxResult edit(@RequestBody Station station) {
        return toAjax(stationService.updateStation(station));
    }

    //根据id查询详情
    @Operation(summary = "根据id查询站点详情")
    @GetMapping("{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        Station station = stationService.getById(id);
        return success(station);
    }

    //删除
    @Operation(summary = "删除站点")
    @DeleteMapping("{ids}")
    public AjaxResult delete(@PathVariable Long[] ids) {
        return toAjax(stationService.removeBatchByIds(java.util.Arrays.asList(ids)));
    }

    //查询附近站点
    @Operation(summary = "根据经纬度搜索附近站点")
    @GetMapping("/nearbyStation/{latitude}/{longitude}")
    public AjaxResult nearbyStation(@PathVariable String latitude,
                                    @PathVariable String longitude) {
        List<StationVo> stationVoList = deviceService.nearbyStation(latitude, longitude);
        return success(stationVoList);
    }
}
