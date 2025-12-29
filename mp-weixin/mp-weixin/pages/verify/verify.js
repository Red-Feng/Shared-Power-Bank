"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const __default__ = {
  data() {
    return {};
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "verify",
  setup(__props) {
    // 是否展示弹窗（黑色蒙层 + 按钮）
    const showPopup = common_vendor.ref(true);
    // 是否在页面中正常展示押金/优惠券/计次卡三个条目
    const showDeposit = common_vendor.ref(false);
    const verify = async () => {
      console.log(111);
      // 先立即切换 UI，避免等待接口耗时
      showPopup.value = false;
      showDeposit.value = true;
      try {
        const result = await utils_request.request("/user/userInfo/isFreeDeposit");
        if (result.code === 200) {
          const userResult = await utils_request.request("/user/userInfo/getLoginUserInfo");
          if (userResult.code === 200) {
            common_vendor.index.setStorageSync("userInfo", userResult.data);
          } else {
            common_vendor.index.showToast({
              title: "获取用户信息失败" + userResult.msg
            });
          }
        } else {
          common_vendor.index.showToast({
            title: "验证失败" + result.msg
          });
        }
      } catch (e) {
        console.log("verify error:", e);
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(verify),
          b: showDeposit.value,
          c: showPopup.value
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/verify/verify.vue"]]);
wx.createPage(MiniProgramPage);
