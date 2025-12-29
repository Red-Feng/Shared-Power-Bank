package com.share.device.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.share.device.domain.Cabinet;
import com.share.device.domain.Station;
import com.share.device.domain.StationLocation;
import com.share.device.mapper.StationMapper;
import com.share.device.repository.StationLocationRepository;
import com.share.device.service.ICabinetService;
import com.share.device.service.IRegionService;
import com.share.device.service.IStationService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class StationServiceImpl extends ServiceImpl<StationMapper, Station>
        implements IStationService {

    @Autowired
    private StationMapper stationMapper;

    @Autowired
    private ICabinetService cabinetService;

    @Autowired
    private IRegionService regionService;

    @Autowired
    private StationLocationRepository stationLocationRepository;

    //分页查询
    @Override
    public List<Station> selectStationList(Station station) {
        //调用mapper方法
        List<Station> list = stationMapper.selectStationList(station);
        //获取每个Station里面对应柜机编号，封装到每个对象里面
        //当前Station里面只有柜机id，根据柜机id查询获取柜机编号
        for (Station sta:list) {
            //获取每个站点对象里面柜机id
            Long cabinetId = sta.getCabinetId();
            //根据柜机id获取对应柜机编号
            if (cabinetId != null) {
                Cabinet cabinet = cabinetService.getById(cabinetId);
                if (cabinet != null) {
                    String cabinetNo = cabinet.getCabinetNo();
                    //封装到站点对象里面
                    sta.setCabinetNo(cabinetNo);
                } else {
                    // 如果柜机不存在，设置为空字符串或null
                    sta.setCabinetNo(null);
                }
            } else {
                // 如果柜机ID为空，设置为null
                sta.setCabinetNo(null);
            }
        }
        return list;
    }

    //添加
    @Override
    public int saveStation(Station station) {
        String provinceName = regionService.getNameByCode(station.getProvinceCode());
        String cityName = regionService.getNameByCode(station.getCityCode());
        String districtName = regionService.getNameByCode(station.getDistrictCode());
        station.setFullAddress(provinceName + cityName + districtName + station.getAddress());
        int rows = stationMapper.insert(station);

        StationLocation stationLocation = new StationLocation();
        stationLocation.setId(ObjectId.get().toString());
        stationLocation.setStationId(station.getId());
        stationLocation.setLocation(new GeoJsonPoint(station.getLongitude().doubleValue(), station.getLatitude().doubleValue()));
        stationLocation.setCreateTime(new Date());
        stationLocationRepository.save(stationLocation);

        return rows;
    }

    //修改
    @Override
    public int updateStation(Station station) {
        String provinceName = regionService.getNameByCode(station.getProvinceCode());
        String cityName = regionService.getNameByCode(station.getCityCode());
        String districtName = regionService.getNameByCode(station.getDistrictCode());
        station.setFullAddress(provinceName + cityName + districtName + station.getAddress());
        int rows = stationMapper.updateById(station);

        StationLocation stationLocation = stationLocationRepository.getByStationId(station.getId());
        stationLocation.setLocation(new GeoJsonPoint(station.getLongitude().doubleValue(), station.getLatitude().doubleValue()));
        stationLocationRepository.save(stationLocation);
        return rows;
    }
}
