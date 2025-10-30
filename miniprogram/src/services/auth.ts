/**
 * 微信小程序授权服务
 * 处理手机号授权、登录、会话管理等
 */

// API 基础配置
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

/**
 * 授权状态接口
 */
interface AuthState {
  openId: string | null;
  sessionKey: string | null;
  token: string | null;
  userInfo: UserInfo | null;
  isPhoneAuthorized: boolean;
}

/**
 * 用户信息接口
 */
interface UserInfo {
  id: number;
  phone: string | null;
  openId: string;
  nickname: string | null;
  avatarUrl: string | null;
  gender: 'male' | 'female' | 'unknown';
  isPhoneAuthorized: boolean;
  lastLoginAt: string;
}

class AuthService {
  /**
   * 存储键名
   */
  private readonly STORAGE_KEYS = {
    OPEN_ID: 'ruizhu_open_id',
    SESSION_KEY: 'ruizhu_session_key',
    TOKEN: 'ruizhu_token',
    USER_INFO: 'ruizhu_user_info',
  };

  /**
   * 获取当前授权状态
   */
  getAuthState(): AuthState {
    return {
      openId: uni.getStorageSync(this.STORAGE_KEYS.OPEN_ID) || null,
      sessionKey: uni.getStorageSync(this.STORAGE_KEYS.SESSION_KEY) || null,
      token: uni.getStorageSync(this.STORAGE_KEYS.TOKEN) || null,
      userInfo: uni.getStorageSync(this.STORAGE_KEYS.USER_INFO) || null,
      isPhoneAuthorized: uni.getStorageSync(this.STORAGE_KEYS.USER_INFO)?.isPhoneAuthorized || false,
    };
  }

  /**
   * 检查用户是否已授权手机号
   */
  isPhoneAuthorized(): boolean {
    const userInfo = uni.getStorageSync(this.STORAGE_KEYS.USER_INFO) as UserInfo | null;
    return userInfo?.isPhoneAuthorized || false;
  }

  /**
   * 检查用户是否已登录
   */
  isLoggedIn(): boolean {
    return !!uni.getStorageSync(this.STORAGE_KEYS.TOKEN);
  }

  /**
   * 获取JWT Token
   */
  getToken(): string | null {
    return uni.getStorageSync(this.STORAGE_KEYS.TOKEN) || null;
  }

  /**
   * 获取用户信息
   */
  getUserInfo(): UserInfo | null {
    return uni.getStorageSync(this.STORAGE_KEYS.USER_INFO) || null;
  }

  /**
   * 初始化授权 - 登录小程序时获取openId和sessionKey
   * 注意：sessionKey用于解密手机号，需要保存在本地
   */
  async initAuth(): Promise<boolean> {
    try {
      // 检查是否已有openId
      const existingOpenId = uni.getStorageSync(this.STORAGE_KEYS.OPEN_ID);
      if (existingOpenId) {
        return true;
      }

      // 调用微信登录
      const loginRes = await new Promise<UniApp.LoginSuccessRes>((resolve, reject) => {
        uni.login({
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        });
      });

      if (!loginRes.code) {
        throw new Error('获取登录code失败');
      }

      // 注意：sessionKey 会在登录响应中获得，但这个示例中我们从客户端直接获取
      // 实际项目中应该在后端获取 sessionKey
      const openId = loginRes.code; // 这里简化处理，实际应该从后端获取真实的openId

      // 保存到本地存储
      uni.setStorageSync(this.STORAGE_KEYS.OPEN_ID, openId);

      // 首次登录时尝试使用openId登录后端
      await this.wechatOpenIdLogin(openId);

      return true;
    } catch (error) {
      console.error('初始化授权失败:', error);
      return false;
    }
  }

  /**
   * 微信openId登录
   * 首次登录或未授权手机号时使用
   */
  async wechatOpenIdLogin(
    openId: string,
    userData?: {
      nickName?: string;
      avatarUrl?: string;
      gender?: number;
      province?: string;
      city?: string;
      country?: string;
    }
  ): Promise<UserInfo> {
    try {
      const response = await uni.request<any>({
        url: `${API_BASE_URL}/auth/wechat/open-id-login`,
        method: 'POST',
        data: {
          openId,
          ...userData,
        },
      });

      if (response[0]) {
        throw new Error(response[0].errMsg || '网络请求失败');
      }

      const result = response[1].data;

      if (!result.access_token || !result.user) {
        throw new Error('登录失败：缺少必要字段');
      }

      // 保存token和用户信息
      uni.setStorageSync(this.STORAGE_KEYS.TOKEN, result.access_token);
      uni.setStorageSync(this.STORAGE_KEYS.USER_INFO, result.user);

      return result.user as UserInfo;
    } catch (error) {
      console.error('openId登录失败:', error);
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
  async wechatPhoneLogin(
    openId: string,
    encryptedData: string,
    iv: string,
    sessionKey: string
  ): Promise<UserInfo> {
    try {
      const response = await uni.request<any>({
        url: `${API_BASE_URL}/auth/wechat/phone-login`,
        method: 'POST',
        data: {
          openId,
          encryptedPhone: encryptedData, // 传递加密的手机号数据
          iv,
          sessionKey,
        },
      });

      if (response[0]) {
        throw new Error(response[0].errMsg || '网络请求失败');
      }

      const result = response[1].data;

      if (!result.access_token || !result.user) {
        throw new Error('登录失败：缺少必要字段');
      }

      // 保存token和用户信息
      uni.setStorageSync(this.STORAGE_KEYS.TOKEN, result.access_token);
      uni.setStorageSync(this.STORAGE_KEYS.USER_INFO, result.user);

      return result.user as UserInfo;
    } catch (error) {
      console.error('手机号登录失败:', error);
      throw error;
    }
  }

  /**
   * 从wx.login获取sessionKey
   * 需要在后端处理code获取真实的sessionKey
   */
  async getSessionKey(): Promise<string> {
    try {
      // 这里假设已经有openId
      const openId = uni.getStorageSync(this.STORAGE_KEYS.OPEN_ID);

      if (!openId) {
        // 如果没有openId，先进行登录
        const loginRes = await new Promise<UniApp.LoginSuccessRes>((resolve, reject) => {
          uni.login({
            success: (res) => resolve(res),
            fail: (err) => reject(err),
          });
        });

        if (!loginRes.code) {
          throw new Error('获取登录code失败');
        }

        // 保存code用于后端查询sessionKey
        uni.setStorageSync('login_code', loginRes.code);
      }

      // 从本地获取已保存的sessionKey
      let sessionKey = uni.getStorageSync(this.STORAGE_KEYS.SESSION_KEY);

      if (!sessionKey) {
        // 如果没有保存的sessionKey，需要从后端获取
        // 这里需要后端提供一个接口来获取sessionKey
        // 临时方案：使用login code从微信服务器获取
        sessionKey = await this.fetchSessionKeyFromBackend();
      }

      return sessionKey;
    } catch (error) {
      console.error('获取sessionKey失败:', error);
      throw error;
    }
  }

  /**
   * 从后端获取sessionKey
   * 后端需要实现此接口，用登录code换取sessionKey
   */
  private async fetchSessionKeyFromBackend(): Promise<string> {
    try {
      const loginCode = uni.getStorageSync('login_code');

      if (!loginCode) {
        throw new Error('缺少登录code');
      }

      // 这是一个示例实现，实际应该根据后端API调整
      const response = await uni.request<any>({
        url: `${API_BASE_URL}/auth/get-session-key`,
        method: 'POST',
        data: { code: loginCode },
      });

      if (response[0]) {
        throw new Error('获取sessionKey失败');
      }

      const sessionKey = response[1].data.sessionKey;

      if (!sessionKey) {
        throw new Error('服务器未返回sessionKey');
      }

      // 保存sessionKey
      uni.setStorageSync(this.STORAGE_KEYS.SESSION_KEY, sessionKey);

      return sessionKey;
    } catch (error) {
      console.error('从后端获取sessionKey失败:', error);
      throw error;
    }
  }

  /**
   * 处理getPhoneNumber事件
   * 在用户点击授权按钮并同意时调用
   */
  async handlePhoneNumberEvent(event: any): Promise<UserInfo> {
    try {
      const { code, encryptedData, iv, errMsg } = event.detail;

      if (code !== 0 || !encryptedData || !iv) {
        // 用户拒绝或获取失败
        if (errMsg?.includes('user deny')) {
          throw new Error('用户拒绝授权');
        }
        throw new Error(`获取手机号失败: ${errMsg}`);
      }

      // 获取openId和sessionKey
      const openId = uni.getStorageSync(this.STORAGE_KEYS.OPEN_ID);
      const sessionKey = await this.getSessionKey();

      if (!openId || !sessionKey) {
        throw new Error('缺少必要的认证信息');
      }

      // 调用登录API
      const userInfo = await this.wechatPhoneLogin(openId, encryptedData, iv, sessionKey);

      return userInfo;
    } catch (error) {
      console.error('处理手机号事件失败:', error);
      throw error;
    }
  }

  /**
   * 退出登录
   */
  logout(): void {
    uni.removeStorageSync(this.STORAGE_KEYS.TOKEN);
    uni.removeStorageSync(this.STORAGE_KEYS.USER_INFO);
    // 保留openId和sessionKey供后续使用
  }

  /**
   * 清除所有授权数据
   */
  clearAuth(): void {
    uni.removeStorageSync(this.STORAGE_KEYS.OPEN_ID);
    uni.removeStorageSync(this.STORAGE_KEYS.SESSION_KEY);
    uni.removeStorageSync(this.STORAGE_KEYS.TOKEN);
    uni.removeStorageSync(this.STORAGE_KEYS.USER_INFO);
    uni.removeStorageSync('login_code');
  }
}

// 导出单例
export const authService = new AuthService();

export type { AuthState, UserInfo };
