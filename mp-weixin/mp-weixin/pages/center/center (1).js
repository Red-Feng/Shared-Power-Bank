"use strict";
const common_vendor = require("../../common/vendor.js");
const __default__ = {
  data() {
    return {};
  }
};
// 在外部作用域存储ref，供onShow访问
let phoneNumberRef = null;
let userIdRef = null;
let depositAmountRef = null;
let couponCountRef = null;

const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "center",
  setup(__props) {
    // 检查是否已登录，未登录则跳转登录页
    const ensureLogin = () => {
      const loginUser = common_vendor.index.getStorageSync("loginUser");
      if (!loginUser || !loginUser.phone) {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        return false;
      }
      return true;
    };
    // 跳转到「我的订单」列表页
    const toOrderList = () => {
      if (!ensureLogin())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/order/order"
      });
    };
    // 跳转到「押金验证 / 免押金使用」页面
    const toDepositVerify = () => {
      if (!ensureLogin())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/verify/verify"
      });
    };
    // 跳转到「我的卡券」页面
    const toCoupon = () => {
      if (!ensureLogin())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/coupon/coupon"
      });
    };
    // 跳转到「设置」页面
    const toSetting = () => {
      common_vendor.index.navigateTo({
        url: "/pages/setting/setting"
      });
    };
    // 跳转到「客服中心」页面
    const toService = () => {
      common_vendor.index.navigateTo({
        url: "/pages/service/service"
      });
    };
    // 跳转到「招募合作」页面
    const toCooperate = () => {
      common_vendor.index.navigateTo({
        url: "/pages/cooperate/cooperate"
      });
    };
    const userInfo = common_vendor.ref({});
    const phoneNumber = common_vendor.ref("点击登入");
    const userId = common_vendor.ref("11654981");
    const depositAmount = common_vendor.ref("0");
    const couponCount = common_vendor.ref("0");
    // 将ref存储到外部作用域，供onShow访问
    phoneNumberRef = phoneNumber;
    userIdRef = userId;
    depositAmountRef = depositAmount;
    couponCountRef = couponCount;
    // 跳转到登录页
    const toLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    };
    // 刷新用户信息的函数（封装，供onMounted和onShow调用）
    const refreshUserInfo = () => {
      // 从自定义登录信息中读取手机号和ID
      const loginUser = common_vendor.index.getStorageSync("loginUser");
      if (loginUser && loginUser.phone) {
        const phone = loginUser.phone.toString();
        if (phone.length >= 11) {
          phoneNumber.value = phone.substring(0, 3) + "****" + phone.substring(7);
        } else {
          phoneNumber.value = loginUser.phone;
        }
        if (loginUser.id) {
          userId.value = loginUser.id.toString();
        }
        // 测试阶段：登录后设置押金为99元，优惠券为88张
        depositAmount.value = "99";
        couponCount.value = "88";
      }
      // 从原有userInfo中读取押金、优惠券等信息（如果有）
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedUserInfo) {
        userInfo.value = storedUserInfo;
        // 测试阶段：如果已登录，优先使用测试数据（99元押金，88张优惠券）
        if (loginUser && loginUser.phone) {
          depositAmount.value = "99";
          couponCount.value = "88";
        } else {
          // 未登录时才从存储的userInfo中读取
          if (storedUserInfo.depositAmount !== void 0) {
            depositAmount.value = storedUserInfo.depositAmount.toString();
          }
          if (storedUserInfo.couponCount !== void 0) {
            couponCount.value = storedUserInfo.couponCount.toString();
          }
        }
      }
    };
    // 首次进入页面时刷新
    common_vendor.onMounted(() => {
      refreshUserInfo();
    });
    
    return (_ctx, _cache) => {
      return {
        phoneNumber: phoneNumber.value,
        userId: userId.value,
        depositAmount: depositAmount.value,
        couponCount: couponCount.value,
        // 点击"点击登入"跳转登录页
        i: common_vendor.o(toLogin),
        // 押金入口点击
        c: common_vendor.o(toDepositVerify),
        // 我的订单入口点击
        d: common_vendor.o(toOrderList),
        // 我的卡券入口点击
        e: common_vendor.o(toCoupon),
        // 设置入口点击
        f: common_vendor.o(toSetting),
        // 客服中心入口点击
        g: common_vendor.o(toService),
        // 招募合作入口点击（关于我们）
        h: common_vendor.o(toCooperate)
      };
    };
  },
  onShow() {
    // 每次页面显示时刷新（包括从登录页返回时）
    if (!phoneNumberRef || !userIdRef || !depositAmountRef || !couponCountRef) return;
    
    // 从自定义登录信息中读取手机号和ID
    const loginUser = common_vendor.index.getStorageSync("loginUser");
    if (loginUser && loginUser.phone) {
      const phone = loginUser.phone.toString();
      if (phone.length >= 11) {
        phoneNumberRef.value = phone.substring(0, 3) + "****" + phone.substring(7);
      } else {
        phoneNumberRef.value = loginUser.phone;
      }
      if (loginUser.id) {
        userIdRef.value = loginUser.id.toString();
      }
      // 测试阶段：登录后设置押金为99元，优惠券为88张
      depositAmountRef.value = "99";
      couponCountRef.value = "88";
    }
    // 从原有userInfo中读取押金、优惠券等信息（如果有）
    const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
    if (storedUserInfo) {
      // 测试阶段：如果已登录，优先使用测试数据（99元押金，88张优惠券）
      if (loginUser && loginUser.phone) {
        depositAmountRef.value = "99";
        couponCountRef.value = "88";
      } else {
        // 未登录时才从存储的userInfo中读取
        if (storedUserInfo.depositAmount !== void 0) {
          depositAmountRef.value = storedUserInfo.depositAmount.toString();
        }
        if (storedUserInfo.couponCount !== void 0) {
          couponCountRef.value = storedUserInfo.couponCount.toString();
        }
      }
    }
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3f122818"], ["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/center/center.vue"]]);
wx.createPage(MiniProgramPage);
