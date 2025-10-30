"use strict";
const common_vendor = require("../common/vendor.js");
const API_BASE_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";
class AuthService {
  constructor() {
    this.STORAGE_KEYS = {
      OPEN_ID: "ruizhu_open_id",
      SESSION_KEY: "ruizhu_session_key",
      TOKEN: "ruizhu_token",
      USER_INFO: "ruizhu_user_info"
    };
  }
  /**
   * 获取当前授权状态
   */
  getAuthState() {
    var _a;
    return {
      openId: common_vendor.index.getStorageSync(this.STORAGE_KEYS.OPEN_ID) || null,
      sessionKey: common_vendor.index.getStorageSync(this.STORAGE_KEYS.SESSION_KEY) || null,
      token: common_vendor.index.getStorageSync(this.STORAGE_KEYS.TOKEN) || null,
      userInfo: common_vendor.index.getStorageSync(this.STORAGE_KEYS.USER_INFO) || null,
      isPhoneAuthorized: ((_a = common_vendor.index.getStorageSync(this.STORAGE_KEYS.USER_INFO)) == null ? void 0 : _a.isPhoneAuthorized) || false
    };
  }
  /**
   * 检查用户是否已授权手机号
   */
  isPhoneAuthorized() {
    const userInfo = common_vendor.index.getStorageSync(this.STORAGE_KEYS.USER_INFO);
    return (userInfo == null ? void 0 : userInfo.isPhoneAuthorized) || false;
  }
  /**
   * 检查用户是否已登录
   */
  isLoggedIn() {
    return !!common_vendor.index.getStorageSync(this.STORAGE_KEYS.TOKEN);
  }
  /**
   * 获取JWT Token
   */
  getToken() {
    return common_vendor.index.getStorageSync(this.STORAGE_KEYS.TOKEN) || null;
  }
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return common_vendor.index.getStorageSync(this.STORAGE_KEYS.USER_INFO) || null;
  }
  /**
   * 初始化授权 - 登录小程序时获取openId和sessionKey
   * 注意：sessionKey用于解密手机号，需要保存在本地
   */
  async initAuth() {
    try {
      const existingOpenId = common_vendor.index.getStorageSync(this.STORAGE_KEYS.OPEN_ID);
      if (existingOpenId) {
        return true;
      }
      const loginRes = await new Promise((resolve, reject) => {
        common_vendor.index.login({
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      });
      if (!loginRes.code) {
        throw new Error("获取登录code失败");
      }
      const openId = loginRes.code;
      common_vendor.index.setStorageSync(this.STORAGE_KEYS.OPEN_ID, openId);
      await this.wechatOpenIdLogin(openId);
      return true;
    } catch (error) {
      console.error("初始化授权失败:", error);
      return false;
    }
  }
  /**
   * 微信openId登录
   * 首次登录或未授权手机号时使用
   */
  async wechatOpenIdLogin(openId, userData) {
    try {
      const response = await common_vendor.index.request({
        url: `${API_BASE_URL}/auth/wechat/open-id-login`,
        method: "POST",
        data: {
          openId,
          ...userData
        }
      });
      if (response[0]) {
        throw new Error(response[0].errMsg || "网络请求失败");
      }
      const result = response[1].data;
      if (!result.access_token || !result.user) {
        throw new Error("登录失败：缺少必要字段");
      }
      common_vendor.index.setStorageSync(this.STORAGE_KEYS.TOKEN, result.access_token);
      common_vendor.index.setStorageSync(this.STORAGE_KEYS.USER_INFO, result.user);
      return result.user;
    } catch (error) {
      console.error("openId登录失败:", error);
      throw error;
    }
  }
  /**
   * 微信手机号授权登录
   * 用户点击授权按钮后调用此方法
   *
   * @param openId - 微信openId
   * @param encryptedData - getPhoneNumber返回的加密数据
   * @param iv - getPhoneNumber返回的初始化向量
   * @param sessionKey - 登录时获取的会话密钥
   */
  async wechatPhoneLogin(openId, encryptedData, iv, sessionKey) {
    try {
      const response = await common_vendor.index.request({
        url: `${API_BASE_URL}/auth/wechat/phone-login`,
        method: "POST",
        data: {
          openId,
          encryptedPhone: encryptedData,
          // 传递加密的手机号数据
          iv,
          sessionKey
        }
      });
      if (response[0]) {
        throw new Error(response[0].errMsg || "网络请求失败");
      }
      const result = response[1].data;
      if (!result.access_token || !result.user) {
        throw new Error("登录失败：缺少必要字段");
      }
      common_vendor.index.setStorageSync(this.STORAGE_KEYS.TOKEN, result.access_token);
      common_vendor.index.setStorageSync(this.STORAGE_KEYS.USER_INFO, result.user);
      return result.user;
    } catch (error) {
      console.error("手机号登录失败:", error);
      throw error;
    }
  }
  /**
   * 从wx.login获取sessionKey
   * 需要在后端处理code获取真实的sessionKey
   */
  async getSessionKey() {
    try {
      const openId = common_vendor.index.getStorageSync(this.STORAGE_KEYS.OPEN_ID);
      if (!openId) {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            success: (res) => resolve(res),
            fail: (err) => reject(err)
          });
        });
        if (!loginRes.code) {
          throw new Error("获取登录code失败");
        }
        common_vendor.index.setStorageSync("login_code", loginRes.code);
      }
      let sessionKey = common_vendor.index.getStorageSync(this.STORAGE_KEYS.SESSION_KEY);
      if (!sessionKey) {
        sessionKey = await this.fetchSessionKeyFromBackend();
      }
      return sessionKey;
    } catch (error) {
      console.error("获取sessionKey失败:", error);
      throw error;
    }
  }
  /**
   * 从后端获取sessionKey
   * 后端需要实现此接口，用登录code换取sessionKey
   */
  async fetchSessionKeyFromBackend() {
    try {
      const loginCode = common_vendor.index.getStorageSync("login_code");
      if (!loginCode) {
        throw new Error("缺少登录code");
      }
      const response = await common_vendor.index.request({
        url: `${API_BASE_URL}/auth/get-session-key`,
        method: "POST",
        data: { code: loginCode }
      });
      if (response[0]) {
        throw new Error("获取sessionKey失败");
      }
      const sessionKey = response[1].data.sessionKey;
      if (!sessionKey) {
        throw new Error("服务器未返回sessionKey");
      }
      common_vendor.index.setStorageSync(this.STORAGE_KEYS.SESSION_KEY, sessionKey);
      return sessionKey;
    } catch (error) {
      console.error("从后端获取sessionKey失败:", error);
      throw error;
    }
  }
  /**
   * 处理getPhoneNumber事件
   * 在用户点击授权按钮并同意时调用
   */
  async handlePhoneNumberEvent(event) {
    try {
      const { code, encryptedData, iv, errMsg } = event.detail;
      if (code !== 0 || !encryptedData || !iv) {
        if (errMsg == null ? void 0 : errMsg.includes("user deny")) {
          throw new Error("用户拒绝授权");
        }
        throw new Error(`获取手机号失败: ${errMsg}`);
      }
      const openId = common_vendor.index.getStorageSync(this.STORAGE_KEYS.OPEN_ID);
      const sessionKey = await this.getSessionKey();
      if (!openId || !sessionKey) {
        throw new Error("缺少必要的认证信息");
      }
      const userInfo = await this.wechatPhoneLogin(openId, encryptedData, iv, sessionKey);
      return userInfo;
    } catch (error) {
      console.error("处理手机号事件失败:", error);
      throw error;
    }
  }
  /**
   * 退出登录
   */
  logout() {
    common_vendor.index.removeStorageSync(this.STORAGE_KEYS.TOKEN);
    common_vendor.index.removeStorageSync(this.STORAGE_KEYS.USER_INFO);
  }
  /**
   * 清除所有授权数据
   */
  clearAuth() {
    common_vendor.index.removeStorageSync(this.STORAGE_KEYS.OPEN_ID);
    common_vendor.index.removeStorageSync(this.STORAGE_KEYS.SESSION_KEY);
    common_vendor.index.removeStorageSync(this.STORAGE_KEYS.TOKEN);
    common_vendor.index.removeStorageSync(this.STORAGE_KEYS.USER_INFO);
    common_vendor.index.removeStorageSync("login_code");
  }
}
const authService = new AuthService();
exports.authService = authService;
