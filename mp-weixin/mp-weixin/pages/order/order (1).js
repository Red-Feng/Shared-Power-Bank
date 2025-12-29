"use strict";
const common_vendor = require("../../common/vendor.js");
const __default__ = {
  data() {
    return {};
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "order",
  setup(__props) {
    const toDetail = (orderId) => {
      common_vendor.index.navigateTo({
        url: "/pages/orderDetail/orderDetail?orderId=" + orderId
      });
    };
    const orderList = common_vendor.ref([]);
    const total = common_vendor.ref(1);
    // 仅使用本地假数据，不再请求后端
    const getOrderList = () => {
      if (orderList.value.length > 0)
        return;
      const mockOrders = [
        {
          id: "DEMO_ORDER_1",
          status: "2",
          // 已支付
          startTime: "2025-01-01 12:00:00",
          startStationName: "示例门店A（测试用）",
          duration: 30,
          totalAmount: 5.8
        },
        {
          id: "DEMO_ORDER_2",
          status: "1",
          // 未支付
          startTime: "2025-02-01 18:20:00",
          startStationName: "示例门店B（测试用）",
          duration: 15,
          totalAmount: 3.5
        },
        {
          id: "DEMO_ORDER_3",
          status: "0",
          // 充电中
          startTime: "2025-03-10 09:10:00",
          startStationName: "示例门店C（测试用）",
          duration: 5,
          totalAmount: 0
        }
      ];
      orderList.value = mockOrders;
      total.value = mockOrders.length;
    };
    common_vendor.onMounted(() => {
      getOrderList();
    });
    const scrolltolower = () => {
      getOrderList();
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(orderList.value, (order, k0, i0) => {
          return common_vendor.e({
            a: order.status === "0"
          }, order.status === "0" ? {} : {}, {
            b: order.status === "1"
          }, order.status === "1" ? {} : {}, {
            c: order.status === "2"
          }, order.status === "2" ? {} : {}, {
            d: common_vendor.t(order.startTime),
            e: common_vendor.t(order.startStationName),
            f: common_vendor.t(order.duration),
            g: common_vendor.t(order.totalAmount),
            h: common_vendor.o(($event) => toDetail(order.id), order.id),
            i: order.id
          });
        }),
        b: common_vendor.o(scrolltolower)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/order/order.vue"]]);
wx.createPage(MiniProgramPage);
