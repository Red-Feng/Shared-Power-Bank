"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _component_mask = common_vendor.resolveComponent("mask");
  _component_mask();
}
const __default__ = {
  data() {
    return {
      title: "Hello"
    };
  },
  onLoad() {
  },
  methods: {}
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "index",
  setup(__props) {
    var QQMapWX = require("../../static/js/qqmap-wx-jssdk.min.js");
    new QQMapWX({
      key: "BGBBZ-S3ZWI-6GIGD-UUYSX-5WSQO-ZSBQJ"
      // 必填
    });
    common_vendor.ref({});
    // 地图中心位置（默认北京）
    const mapLatitude = common_vendor.ref(39.984104);
    const mapLongitude = common_vendor.ref(116.307503);
    // 地图缩放级别
    const mapScale = common_vendor.ref(10);
    
    // 生成充电宝栈点（围绕北京默认位置）
    const generateChargingStations = () => {
      const centerLat = 39.984104;
      const centerLng = 116.307503;
      const stations = [];
      // 5个充电栈的位置偏移（分散分布）
      const offsets = [
        { lat: 0.008, lng: 0.010 },   // 东北方向
        { lat: -0.010, lng: 0.012 },  // 东南方向
        { lat: -0.012, lng: -0.010 }, // 西南方向
        { lat: 0.012, lng: -0.008 },  // 西北方向
        { lat: 0.006, lng: 0.015 }    // 正东方向
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
    
    const markers = common_vendor.ref([
      {
        id: 0,
        latitude: 39.984104,
        longitude: 116.307503,
        width: 30,
        height: 30,
        title: "中心点"
      }
    ]);
    // 获取用户当前位置
    const getUserLocation = async () => {
      try {
        // 调用获取位置的API接口
        const result = await utils_request.request("/location/getCurrentLocation", {}, "POST");
        if (result.code === 200) {
          console.log("获取位置成功:", result.data);
          // 可以在这里更新地图中心位置
          // 如果需要更新地图，可以修改 markers 或 centerPosition
        } else {
          // 请求失败，显示弹窗
          common_vendor.index.showModal({
            title: "提示",
            content: "位置请求失败请打开定位",
            showCancel: false,
            confirmText: "确定"
          });
        }
      } catch (error) {
        console.error("获取位置失败:", error);
        // 请求失败，显示弹窗
        common_vendor.index.showModal({
          title: "提示",
          content: "位置请求失败请打开定位",
          showCancel: false,
          confirmText: "确定"
        });
      }
    };
    
    common_vendor.onMounted(() => {
      // 界面加载时获取用户位置
      getUserLocation();
    });
    const isShowMask = common_vendor.ref(false);
    let timer = null;
    const scan = () => {
      // 先检查 自定义手机号登录
      const loginUser = common_vendor.index.getStorageSync("loginUser");
      if (!loginUser || !loginUser.phone) {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        return;
      }
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo.depositStatus === "0") {
        common_vendor.index.navigateTo({
          url: "/pages/verify/verify"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在扫描"
      });
      isShowMask.value = true;
      common_vendor.index.scanCode({
        success: async (res) => {
          let cabinetNo = res.result;
          const result = await utils_request.request(`/device/device/scanCharge/${cabinetNo}`);
          console.log(result);
          if (result.code === 200) {
            if (result.data.status === "1") {
              if (!timer) {
                timer = setInterval(async () => {
                  const status1 = await utils_request.request("/order/orderInfo/getNoFinishOrder");
                  if (status1.code === 200 && status1.data.id) {
                    console.log(status1.data.id);
                    clearInterval(timer);
                    timer = null;
                    common_vendor.index.navigateTo({
                      url: "/pages/orderDetail/orderDetail?orderId=" + status1.data.id
                    });
                    common_vendor.index.hideLoading();
                    isShowMask.value = false;
                  }
                }, 2e3);
              }
            } else if (result.data.status === "2") {
              common_vendor.index.showToast({
                title: result.data.message,
                duration: 3e3
              });
              common_vendor.index.hideLoading();
              isShowMask.value = false;
            } else if (result.data.status === "3") {
              const status3 = await utils_request.request("/order/orderInfo/getNoFinishOrder");
              if (status3.code === 200 && status3.data.id) {
                console.log(status3.data.id);
                clearInterval(timer);
                timer = null;
                common_vendor.index.navigateTo({
                  url: "/pages/orderDetail/orderDetail?orderId=" + status3.data.id
                });
                common_vendor.index.hideLoading();
                isShowMask.value = false;
              }
            }
          } else {
            common_vendor.index.showToast({
              title: result.msg,
              duration: 3e3
            });
            common_vendor.index.hideLoading();
            isShowMask.value = false;
          }
        },
        fail: (err) => {
          console.error("扫描失败：" + err);
          common_vendor.index.showToast({
            title: "扫描失败",
            icon: "none"
          });
          common_vendor.index.navigateTo({
            url: "/pages/index/index"
          });
        }
      });
    };
    const toNear = () => {
      common_vendor.index.navigateTo({
        url: "/pages/nearbystores/nearbystores"
      });
    };
    const toCenter = () => {
      common_vendor.index.navigateTo({
        url: "/pages/center/center"
      });
    };
    
    // 左侧浮窗功能跳转
    const toSearch = () => {
      // 搜索功能跳转到附近门店界面
      common_vendor.index.navigateTo({
        url: "/pages/nearbystores/nearbystores"
      });
    };
    
    const toService = () => {
      // 客服中心跳转到客服界面
      common_vendor.index.navigateTo({
        url: "/pages/service/service"
      });
    };
    
    const toLocation = () => {
      // 定位功能：放大地图并定位到默认位置（北京）
      mapLatitude.value = 39.984104;
      mapLongitude.value = 116.307503;
      mapScale.value = 15; // 放大地图
      
      // 添加充电宝栈点标记
      const chargingStations = generateChargingStations();
      markers.value = [
        {
          id: 0,
          latitude: 39.984104,
          longitude: 116.307503,
          width: 30,
          height: 30,
          title: "中心点"
        },
        ...chargingStations
      ];
    };
    
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: markers.value,
        b: common_vendor.o(toNear),
        c: common_vendor.o(scan),
        d: common_vendor.o(toCenter),
        e: isShowMask.value,
        f: common_vendor.o(toSearch),
        g: common_vendor.o(toService),
        h: common_vendor.o(toLocation),
        i: mapLatitude.value,
        j: mapLongitude.value,
        k: mapScale.value
      }, isShowMask.value ? {
        l: common_vendor.o(_ctx.hideMask)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
