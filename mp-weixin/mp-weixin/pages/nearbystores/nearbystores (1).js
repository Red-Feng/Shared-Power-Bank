"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const __default__ = {
  data() {
    return {};
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "nearbystores",
  setup(__props) {
    const toDetail = (near) => {
      common_vendor.index.navigateTo({
        url: "/pages/detail/detail?near=" + JSON.stringify(near)
      });
    };
    var QQMapWX = require("../../static/js/qqmap-wx-jssdk.min.js");
    const qqmapsdk = new QQMapWX({
      key: "BGBBZ-S3ZWI-6GIGD-UUYSX-5WSQO-ZSBQJ"
      // 必填
    });
    const centerPosition = common_vendor.ref(
      { latitude: 39.984104, longitude: 116.307503 }
    );
    // 搜索框输入值
    const searchValue = common_vendor.ref("");
    
    // 生成5个分散的充电栈位置（武汉市范围内，围绕市政府分散分布）
    const generateChargingStations = (centerLat, centerLng) => {
      const stations = [];
      // 5个充电栈的位置偏移（分散分布，符合实际充电宝栈分布）
      const offsets = [
        { lat: 0.015, lng: 0.012 },   // 东北方向
        { lat: -0.018, lng: 0.010 },  // 东南方向
        { lat: -0.018, lng: -0.015 }, // 西南方向
        { lat: 0.018, lng: -0.010 },  // 西北方向
        { lat: 0.008, lng: 0.025 }    // 正东方向
      ];
      
      offsets.forEach((offset, index) => {
        stations.push({
          id: `station_${index + 1}`,
          latitude: (centerLat + offset.lat).toFixed(6),
          longitude: (centerLng + offset.lng).toFixed(6),
          iconPath: "/static/images/网点.png",
          width: 30,
          height: 30,
          title: `充电栈${index + 1}`
        });
      });
      
      return stations;
    };
    
    // 初始markers：包含定位图标和充电栈
    const initialMarkers = () => {
      const centerLat = parseFloat(centerPosition.value.latitude);
      const centerLng = parseFloat(centerPosition.value.longitude);
      
      // 定位图标
      const locationMarker = {
        id: "location_marker",
        latitude: centerLat.toString(),
        longitude: centerLng.toString(),
        iconPath: "/static/images/定位.png",
        width: 40,
        height: 40,
        title: "当前位置"
      };
      
      // 5个分散的充电栈
      const chargingStations = generateChargingStations(centerLat, centerLng);
      
      return [locationMarker, ...chargingStations];
    };
    
    const markers = common_vendor.ref(initialMarkers());
    const scollViewId = common_vendor.ref("");
    const clickMark = (e) => {
      console.log(e);
      scollViewId.value = e.markerId;
      currentItemId.value = e.markerId;
    };
    const currentItemId = common_vendor.ref("");
    const nearbyList = common_vendor.ref([]);
    
    // 根据坐标判断城市
    const getCityByLocation = (lat, lng) => {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      // 北京：纬度约39.9，经度约116.3
      if (latitude > 39.5 && latitude < 40.2 && longitude > 116.0 && longitude < 116.8) {
        return "beijing";
      }
      // 上海：纬度约31.2，经度约121.5
      else if (latitude > 31.0 && latitude < 31.5 && longitude > 121.0 && longitude < 121.8) {
        return "shanghai";
      }
      // 武汉：纬度约30.6，经度约114.3
      else if (latitude > 30.4 && latitude < 30.8 && longitude > 114.0 && longitude < 114.6) {
        return "wuhan";
      }
      // 默认返回北京
      return "beijing";
    };
    
    // 生成测试门店数据（根据城市生成真实地址）
    const generateTestStores = (centerLat, centerLng) => {
      const city = getCityByLocation(centerLat, centerLng);
      const lat = parseFloat(centerLat);
      const lng = parseFloat(centerLng);
      
      let testStores = [];
      
      if (city === "beijing") {
        // 北京市真实门店数据
        testStores = [
          {
            id: "store_1",
            name: "书亦烧仙草（王府井店）",
            fullAddress: "北京市东城区王府井大街255号",
            businessHours: "营业时间：24小时",
            distance: "150",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/1.jpg",
            // latitude: (lat + 0.008).toFixed(6),
            // longitude: (lng + 0.010).toFixed(6)
          },
          {
            id: "store_2",
            name: "东方新茶铺（三里屯店）",
            fullAddress: "北京市朝阳区三里屯路19号",
            businessHours: "营业时间：06:00-24:00",
            distance: "380",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/2.jpg",
            // latitude: (lat - 0.012).toFixed(6),
            // longitude: (lng + 0.015).toFixed(6)
          },
          {
            id: "store_3",
            name: "HeyTea喜茶（国贸店）",
            fullAddress: "北京市朝阳区建国门外大街1号",
            businessHours: "营业时间：07:00-23:00",
            distance: "620",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/3.jpg",
            // latitude: (lat - 0.015).toFixed(6),
            // longitude: (lng - 0.012).toFixed(6)
          },
          {
            id: "store_4",
            name: "鲜烧客（中关村店）",
            fullAddress: "北京市海淀区中关村大街1号",
            businessHours: "营业时间：24小时",
            distance: "850",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/4.jpg",
            // latitude: (lat + 0.018).toFixed(6),
            // longitude: (lng - 0.010).toFixed(6)
          },
          {
            id: "store_5",
            name: "鸡柳大人（西单店）",
            fullAddress: "北京市西城区西单北大街176号",
            businessHours: "营业时间：06:30-23:30",
            distance: "1100",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/5.jpg",
            // latitude: (lat + 0.010).toFixed(6),
            // longitude: (lng + 0.020).toFixed(6)
          }
        ];
      } else if (city === "shanghai") {
        // 上海市真实门店数据
        testStores = [
          {
            id: "store_1",
            name: "地锅小鲜鸡（南京路店）",
            fullAddress: "上海市黄浦区南京东路299号",
            businessHours: "营业时间：24小时",
            distance: "180",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/6.jpg",
            // latitude: (lat + 0.008).toFixed(6),
            // longitude: (lng + 0.010).toFixed(6)
          },
          {
            id: "store_2",
            name: "塔斯汀（陆家嘴店）",
            fullAddress: "上海市浦东新区陆家嘴环路1000号",
            businessHours: "营业时间：06:00-24:00",
            distance: "420",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/7.jpg",
            // latitude: (lat - 0.012).toFixed(6),
            // longitude: (lng + 0.015).toFixed(6)
          },
          {
            id: "store_3",
            name: "隆江猪脚饭（淮海路店）",
            fullAddress: "上海市黄浦区淮海中路300号",
            businessHours: "营业时间：07:00-23:00",
            distance: "650",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/8.jpg",
            // latitude: (lat - 0.015).toFixed(6),
            // longitude: (lng - 0.012).toFixed(6)
          },
          {
            id: "store_4",
            name: "至尊比萨（徐家汇店）",
            fullAddress: "上海市徐汇区徐家汇路618号",
            businessHours: "营业时间：24小时",
            distance: "880",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/9.jpg",
            // latitude: (lat + 0.018).toFixed(6),
            // longitude: (lng - 0.010).toFixed(6)
          },
          {
            id: "store_5",
            name: "KenGee仟吉（静安寺店）",
            fullAddress: "上海市静安区南京西路1618号",
            businessHours: "营业时间：06:30-23:30",
            distance: "1150",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/10.jpg",
            // latitude: (lat + 0.010).toFixed(6),
            // longitude: (lng + 0.020).toFixed(6)
          }
        ];
      } else if (city === "wuhan") {
        // 武汉市真实门店数据
        testStores = [
          {
            id: "store_1",
            name: "鲍汁肥牛鸡（江汉路店）",
            fullAddress: "武汉市江汉区江汉路步行街128号",
            businessHours: "营业时间：24小时",
            distance: "120",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/11.jpg",
            // latitude: (lat + 0.008).toFixed(6),
            // longitude: (lng + 0.010).toFixed(6)
          },
          {
            id: "store_2",
            name: "霸碗（光谷店）",
            fullAddress: "武汉市洪山区光谷步行街200号",
            businessHours: "营业时间：06:00-24:00",
            distance: "350",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/12.jpg",
            // latitude: (lat - 0.012).toFixed(6),
            // longitude: (lng + 0.015).toFixed(6)
          },
          {
            id: "store_3",
            name: "一点点（汉街店）",
            fullAddress: "武汉市武昌区楚河汉街88号",
            businessHours: "营业时间：07:00-23:00",
            distance: "580",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/11.webp",
            // latitude: (lat - 0.015).toFixed(6),
            // longitude: (lng - 0.012).toFixed(6)
          },
          {
            id: "store_4",
            name: "牛约堡（徐东店）",
            fullAddress: "武汉市武昌区徐东大街168号",
            businessHours: "营业时间：24小时",
            distance: "820",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/14.jpg",
            // latitude: (lat + 0.018).toFixed(6),
            // longitude: (lng - 0.010).toFixed(6)
          },
          {
            id: "store_5",
            name: "佰田家（街道口店）",
            fullAddress: "武汉市洪山区街道口珞喻路100号",
            businessHours: "营业时间：06:30-23:30",
            distance: "1050",
            isUsable: "1",
            isReturn: "1",
            imageUrl: "/static/images/15.jpg",
            // latitude: (lat + 0.010).toFixed(6),
            // // longitude: (lng + 0.020).toFixed(6)
          }
        ];
      }
      
      return testStores;
    };
    
    // 显示测试门店（不调用接口，直接使用测试数据）
    const showTestStores = (latitude = "39.984104", longitude = "116.307503") => {
      const centerLat = parseFloat(latitude);
      const centerLng = parseFloat(longitude);
      
      // 生成测试门店数据
      const stores = generateTestStores(centerLat, centerLng);
      nearbyList.value = stores;
      
      if (stores.length > 0) {
        currentItemId.value = stores[0].id;
      }
      
      // 为门店添加地图标记
      var mks = [];
      for (var i = 0; i < stores.length; i++) {
        mks.push({
          title: stores[i].name,
          id: stores[i].id,
          latitude: stores[i].latitude,
          longitude: stores[i].longitude,
          iconPath: "/static/images/Flag.png",
          width: 20,
          height: 20
        });
      }
      
      // 保留定位图标和充电栈，只添加门店标记
      const existingMarkers = markers.value.filter(m => 
        m.id === "location_marker" || (m.id && m.id.startsWith("station_"))
      );
      markers.value = [...existingMarkers, ...mks];
    };
    
    const getNearbyStation = async (latitude = "39.984104", longitude = "116.307503") => {
      // 使用测试数据，不调用接口
      showTestStores(latitude, longitude);
      
      // 原始接口调用代码（已注释，保留用于参考）
      /*
      const result = await utils_request.request(`/device/device/nearbyStation/${latitude}/${longitude}`);
      if (result.code === 200) {
        console.log(result.data);
        nearbyList.value = result.data;
        currentItemId.value = nearbyList.value[0].id;
        var mks = [];
        for (var i = 0; i < nearbyList.value.length; i++) {
          mks.push({
            // 获取返回结果，放到mks数组中
            title: nearbyList.value[i].name,
            id: nearbyList.value[i].id,
            latitude: nearbyList.value[i].latitude,
            longitude: nearbyList.value[i].longitude,
            iconPath: "/static/images/Flag.png",
            //图标路径
            width: 20,
            height: 20
          });
        }
        // 保留定位图标和充电栈，只添加门店标记
        const existingMarkers = markers.value.filter(m => 
          m.id === "location_marker" || (m.id && m.id.startsWith("station_"))
        );
        markers.value = [...existingMarkers, ...mks];
      } else {
        common_vendor.index.showToast({
          title: "获取附近门店失败"
        });
      }
      */
    };
    // 搜索功能
    const onSearchInput = (e) => {
      searchValue.value = e.detail.value;
    };
    
    // 执行搜索
    const handleSearch = () => {
      const keyword = searchValue.value.trim();
      if (!keyword) {
        common_vendor.index.showToast({
          title: "请输入搜索内容",
          icon: "none"
        });
        return;
      }
      
      // 根据关键词判断城市并定位
      let targetLat, targetLng, cityName;
      
      if (keyword.includes("北京")) {
        // 北京市政府坐标：39.9042, 116.4074
        targetLat = 39.9042;
        targetLng = 116.4074;
        cityName = "北京市";
      } else if (keyword.includes("上海")) {
        // 上海市政府坐标：31.2304, 121.4737
        targetLat = 31.2304;
        targetLng = 121.4737;
        cityName = "上海市";
      } else if (keyword.includes("武汉")) {
        // 武汉市政府坐标：30.5928, 114.3055
        targetLat = 30.5928;
        targetLng = 114.3055;
        cityName = "武汉市";
      }
      
      if (targetLat && targetLng) {
        // 更新地图中心位置
        centerPosition.value = {
          latitude: targetLat,
          longitude: targetLng
        };
        
        // 添加定位图标（市政府位置）
        const locationMarker = {
          id: "location_marker",
          latitude: targetLat.toString(),
          longitude: targetLng.toString(),
          iconPath: "/static/images/定位.png",
          width: 40,
          height: 40,
          title: "当前位置"
        };
        
        // 生成5个分散的充电栈标记
        const chargingStations = generateChargingStations(targetLat, targetLng);
        
        // 更新markers：定位图标 + 充电栈（先清空原有markers，避免重复）
        markers.value = [locationMarker, ...chargingStations];
        
        // 显示测试门店（使用新坐标）
        setTimeout(() => {
          showTestStores(targetLat.toString(), targetLng.toString());
        }, 100);
        
        common_vendor.index.showToast({
          title: `已定位到${cityName}`,
          icon: "success",
          duration: 1500
        });
      } else {
        // 使用腾讯地图地理编码API搜索其他地址
        qqmapsdk.geocoder({
          address: keyword,
          success: (res) => {
            if (res.result && res.result.location) {
              const lat = res.result.location.lat;
              const lng = res.result.location.lng;
              
              // 更新地图中心位置
              centerPosition.value = {
                latitude: lat,
                longitude: lng
              };
              
              // 添加定位图标
              const locationMarker = {
                id: "location_marker",
                latitude: lat.toString(),
                longitude: lng.toString(),
                iconPath: "/static/images/定位.png",
                width: 40,
                height: 40,
                title: res.result.title || "搜索结果"
              };
              
              // 生成5个分散的充电栈标记
              const chargingStations = generateChargingStations(lat, lng);
              
              // 更新markers
              markers.value = [locationMarker, ...chargingStations];
              
              // 显示测试门店
              setTimeout(() => {
                showTestStores(lat.toString(), lng.toString());
              }, 100);
              
              common_vendor.index.showToast({
                title: "搜索成功",
                icon: "success",
                duration: 1500
              });
            } else {
              common_vendor.index.showToast({
                title: "未找到该地址",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            console.error("地理编码失败:", err);
            common_vendor.index.showToast({
              title: "搜索失败，请重试",
              icon: "none"
            });
          }
        });
      }
    };
    
    common_vendor.onMounted(() => {
      getNearbyStation();
    });
    return (_ctx, _cache) => {
      return {
        a: markers.value,
        b: centerPosition.value.latitude,
        c: centerPosition.value.longitude,
        d: common_vendor.o(clickMark),
        e: common_vendor.f(nearbyList.value, (near, k0, i0) => {
          return {
            a: near.imageUrl,
            b: common_vendor.t(near.name),
            c: common_vendor.t(near.fullAddress),
            d: common_vendor.t(near.businessHours),
            e: common_vendor.t(near.distance),
            f: common_vendor.t(near.isUsable === "1" ? "可借" : "不可借"),
            g: common_vendor.t(near.isReturn === "1" ? "可还" : "不可还"),
            h: common_vendor.o(($event) => toDetail(near), near.id),
            i: near.id,
            j: "scroll" + near.id,
            k: common_vendor.n(near.id === currentItemId.value && "active")
          };
        }),
        f: "scroll" + scollViewId.value,
        g: searchValue.value,
        h: common_vendor.o(onSearchInput),
        i: common_vendor.o(handleSearch)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/nearbystores/nearbystores.vue"]]);
wx.createPage(MiniProgramPage);
