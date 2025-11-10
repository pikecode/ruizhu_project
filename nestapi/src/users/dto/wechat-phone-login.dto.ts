import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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
   * 会话密钥 (sessionKey) - 已弃用（安全原因）
   * 不再从前端接收 sessionKey
   * 后端将使用存储在数据库中的 sessionKey 进行解密
   *
   * ⚠️ 安全提示：
   * - sessionKey 应该只在后端存储
   * - 不应该在网络上传输
   * - 前端不应该接收或存储 sessionKey
   * - 这样可以防止 sessionKey 泄露
   */
  sessionKey?: string; // 现在是完全可选的 - 不需要验证装饰器，后端将使用数据库中存储的 sessionKey
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
