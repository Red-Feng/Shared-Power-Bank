"use strict";
Page({
  data: {
    phone: "",
    code: "",
    phoneError: false,
    canSendCode: false,
    codeBtnText: "获取验证码",
    countdown: 0,
    timer: null,
    canBind: false,
    codeInputFocus: false,
    isChecked: false
  },

  // 手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value.trim();
    const phoneValid = this._isPhoneValid(phone);
    // 如果手机号变化，重置验证码按钮状态和定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    this.setData({
      phone,
      phoneError: false,
      countdown: 0,
      timer: null,
      codeBtnText: "获取验证码",
      canSendCode: phoneValid,
      // 绑定按钮需要：手机号合法、验证码长度为6、处于倒计时中
      canBind: phoneValid && this.data.code.length === 6 && this.data.countdown > 0
    });
  },

  // 手机号失焦校验
  onPhoneBlur() {
    const { phone } = this.data;
    if (!phone) {
      this.setData({ phoneError: false });
      return;
    }
    this.setData({
      phoneError: !this._isPhoneValid(phone)
    });
  },

  // 验证码输入
  onCodeInput(e) {
    const code = e.detail.value.trim();
    this.setData({
      code,
      canBind: this._isPhoneValid(this.data.phone) && code.length === 6 && this.data.countdown > 0
    });
    // 如果输入完成（6位），自动失焦，收起键盘
    if (code.length >= 6) {
      setTimeout(() => {
        this.setData({
          codeInputFocus: false
        });
      }, 100);
    }
  },

  // 验证码输入框失焦
  onCodeBlur() {
    this.setData({
      codeInputFocus: false
    });
  },

  // 发送验证码
  onSendCode() {
    if (!this.data.canSendCode || !this._isPhoneValid(this.data.phone)) return;
    // 显示"验证码已发送"弹窗（使用uni-app的showToast）
    wx.showToast({
      title: "验证码已发送",
      icon: "none",
      duration: 2000
    });
    // 自动聚焦到验证码输入框，触发数字键盘
    setTimeout(() => {
      this.setData({
        codeInputFocus: true
      });
    }, 100);
    // 开始60秒倒计时
    let countdown = 60;
    if (this.data.timer) clearInterval(this.data.timer);
    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          countdown: 0,
          timer: null,
          codeBtnText: "获取验证码",
          canSendCode: this._isPhoneValid(this.data.phone),
          canBind: this._isPhoneValid(this.data.phone) && this.data.code.length === 6 && false
        });
      } else {
        this.setData({
          countdown,
          codeBtnText: `${countdown}s`,
          canSendCode: false,
          canBind: this._isPhoneValid(this.data.phone) && this.data.code.length === 6 && true
        });
      }
    }, 1000);
    this.setData({
      countdown,
      timer,
      codeBtnText: `${countdown}s`,
      canSendCode: false
    });
  },

  // 绑定手机号（完成登录）
  onBindPhone() {
    const { phone, code, countdown, isChecked } = this.data;
    if (!this._isPhoneValid(phone) || code.length !== 6 || countdown <= 0) return;

    // 检查复选框状态，如果未选中则显示提示并返回
    if (!isChecked) {
      wx.showToast({
        title: "请先阅读并勾选用户协议、隐私协议等",
        icon: "none",
        duration: 2000
      });
      return;
    }

    // 分配ID：从11654920开始累加
    const lastId = wx.getStorageSync("loginUserIdCounter") || 11654919;
    const newId = lastId + 1;
    wx.setStorageSync("loginUserIdCounter", newId);

    // 保存当前登录用户信息（仅本次会话使用，app启动时会清除）
    const loginUser = {
      phone,
      id: newId
    };
    wx.setStorageSync("loginUser", loginUser);

    // 返回上一页
    wx.navigateBack();
  },

  // 切换复选框状态
  onToggleCheckbox() {
    this.setData({
      isChecked: !this.data.isChecked
    });
  },

  // 校验手机号：11位纯数字
  _isPhoneValid(phone) {
    return /^\d{11}$/.test(phone.replace(/\s/g, ""));
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
});


