import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 微信手机号登录 DTO
 * 用于小程序用户通过手机号授权进行登录
 */
export class WechatPhoneLoginDto {
  /**
   * 微信openId - 小程序用户唯一标识
   */
  @IsString()
  @IsNotEmpty()
  openId: string;

  /**
   * 加密的手机号数据
   * 由微信小程序通过 Button 组件 getPhoneNumber 获取
   * 格式: {"encryptedData": "...", "iv": "..."}
   */
  @IsString()
  @IsNotEmpty()
  encryptedPhone: string;

  /**
   * 加密初始化向量 (IV)
   * 由微信小程序 getPhoneNumber 返回
   */
  @IsString()
  @IsNotEmpty()
  iv: string;

  /**
   * 会话密钥 (sessionKey)
   * 在用户登录小程序后从微信服务器获取
   * 需要在小程序端保存并传给后端
   */
  @IsString()
  @IsNotEmpty()
  sessionKey: string;
}

/**
 * 微信授权信息 DTO
 * 用于保存从微信获取的用户信息
 */
export class WechatAuthDataDto {
  /**
   * 微信openId
   */
  openId: string;

  /**
   * 昵称
   */
  nickName?: string;

  /**
   * 性别：0 未知，1 男，2 女
   */
  gender?: number;

  /**
   * 省份
   */
  province?: string;

  /**
   * 城市
   */
  city?: string;

  /**
   * 国家
   */
  country?: string;

  /**
   * 用户头像URL
   */
  avatarUrl?: string;

  /**
   * 手机号
   */
  phoneNumber?: string;

  /**
   * 国家代码
   */
  countryCode?: string;
}
