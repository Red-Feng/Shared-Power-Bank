"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
new Proxy({}, {
  get(_, key) {
    throw new Error(`Module "console" has been externalized for browser compatibility. Cannot access "console.${key}" in client code.  See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
  }
});
const __default__ = {
  data() {
    return {};
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "orderDetail",
  setup(__props) {
    const currentOrderId = common_vendor.ref("");
    const currentOrder = common_vendor.ref({});
    common_vendor.onLoad((option) => {
      currentOrderId.value = option.orderId;
    });
    // 根据订单 ID 返回本地示例订单详情（与列表中的订单一一对应）
    const getMockOrderById = (id) => {
      switch (id) {
        case "DEMO_ORDER_1":
          return {
            status: "2",
            // 已支付
            duration: 30,
            totalAmount: 5.8,
            feeRule: "前30分钟免费，之后0.5元/10分钟，上限20元/天",
            createTime: "2025-01-01 12:00:00",
            startStationName: "示例门店A（测试用）",
            endTime: "2025-01-01 12:30:00",
            endStationName: "示例门店A（测试用）",
            powerBankNo: "DEMO-SN-001",
            orderNo: "DEMO_ORDER_1"
          };
        case "DEMO_ORDER_2":
          return {
            status: "1",
            // 未支付
            duration: 15,
            totalAmount: 3.5,
            feeRule: "起租1小时3.5元，之后0.5元/10分钟",
            createTime: "2025-02-01 18:20:00",
            startStationName: "示例门店B（测试用）",
            endTime: null,
            // 未归还
            endStationName: null,
            powerBankNo: "DEMO-SN-002",
            orderNo: "DEMO_ORDER_2"
          };
        case "DEMO_ORDER_3":
          return {
            status: "0",
            // 充电中
            duration: 5,
            totalAmount: 0,
            feeRule: "前10分钟免费，之后0.5元/10分钟",
            createTime: "2025-03-10 09:10:00",
            startStationName: "示例门店C（测试用）",
            endTime: null,
            endStationName: null,
            powerBankNo: "DEMO-SN-003",
            orderNo: "DEMO_ORDER_3"
          };
        default:
          return {
            status: "2",
            duration: 20,
            totalAmount: 4.2,
            feeRule: "0.5元/10分钟，上限20元/天",
            createTime: "2025-04-01 10:00:00",
            startStationName: "示例门店（默认）",
            endTime: "2025-04-01 10:20:00",
            endStationName: "示例门店（默认）",
            powerBankNo: "DEMO-SN-000",
            orderNo: id || "DEMO_ORDER_DEFAULT"
          };
      }
    };
    const getOrderById = async () => {
      try {
        const result = await utils_request.request(`/order/orderInfo/getOrderInfo/${currentOrderId.value}`);
        if (result.code === 200 && result.data) {
          currentOrder.value = result.data;
          return;
        }
      } catch (e) {
        // 本地预览时接口大概率不可用，直接走本地示例数据
        console.log("getOrderById error:", e);
      }
      // 使用与列表对应的本地示例数据
      currentOrder.value = getMockOrderById(currentOrderId.value);
    };
    common_vendor.onMounted(() => {
      getOrderById();
    });
    const toIndex = () => {
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    };
    let timer = null;
    const pay = async () => {
      const result = await utils_request.request("/payment/wxPay/createWxPayment", {
        "orderNo": currentOrder.value.orderNo
      }, "POST");
      if (result.code === 200) {
        common_vendor.wx$1.requestPayment({
          appId: result.data.appId,
          "timeStamp": result.data.timeStamp,
          "nonceStr": result.data.nonceStr,
          "package": result.data.packageVal,
          "signType": result.data.signType,
          "paySign": result.data.paySign,
          "success": function(res) {
          },
          fail: (e) => {
            clearInterval(timer);
            timer = null;
          }
        });
        if (!timer) {
          timer = setInterval(async () => {
            const result2 = await utils_request.request(`/payment/wxPay/queryPayStatus/${currentOrder.value.orderNo}`);
            if (result2.code === 200) {
              if (result2.data) {
                clearInterval(timer);
                timer = null;
                common_vendor.index.navigateTo({
                  url: "/pages/order/order"
                });
              }
            }
          }, 2e3);
        }
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentOrder.value.status === "0"
      }, currentOrder.value.status === "0" ? {} : {}, {
        b: currentOrder.value.status === "1"
      }, currentOrder.value.status === "1" ? {} : {}, {
        c: currentOrder.value.status === "2"
      }, currentOrder.value.status === "2" ? {} : {}, {
        d: common_vendor.t(currentOrder.value.duration === null ? 0 : currentOrder.value.duration),
        e: common_vendor.t(currentOrder.value.totalAmount),
        f: common_vendor.t(currentOrder.value.feeRule),
        g: common_vendor.t(currentOrder.value.createTime),
        h: common_vendor.t(currentOrder.value.startStationName),
        i: common_vendor.t(currentOrder.value.endTime === null ? "待归还" : currentOrder.value.endTime),
        j: common_vendor.t(currentOrder.value.endStationName === null ? "待归还" : currentOrder.value.endStationName),
        k: common_vendor.t(currentOrder.value.powerBankNo),
        l: common_vendor.t(currentOrder.value.orderNo),
        m: currentOrder.value.status === "1"
      }, currentOrder.value.status === "1" ? {
        n: common_vendor.o(pay)
      } : {
        o: common_vendor.o(toIndex)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/orderDetail/orderDetail.vue"]]);
wx.createPage(MiniProgramPage);
