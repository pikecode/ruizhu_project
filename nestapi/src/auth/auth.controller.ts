import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WechatPhoneLoginDto } from '../users/dto/wechat-phone-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 用户名密码登录
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  /**
   * 用户注册
   */
  @Post('register')
  async register(@Body() registerDto: { username: string; password: string; email: string }) {
    return this.authService.register(registerDto);
  }

  /**
   * 微信手机号授权登录
   * 小程序用户通过手机号授权进行登录或注册
   *
   * 请求体:
   * {
   *   "openId": "用户的微信openId",
   *   "encryptedPhone": "加密的手机号数据 (base64)",
   *   "iv": "初始化向量 (base64)",
   *   "sessionKey": "微信会话密钥 (base64)"
   * }
   *
   * 响应:
   * {
   *   "access_token": "JWT token",
   *   "user": { 用户信息 }
   * }
   */
  @Post('wechat/phone-login')
  @HttpCode(HttpStatus.OK)
  async wechatPhoneLogin(@Body() dto: WechatPhoneLoginDto) {
    return this.authService.wechatPhoneLogin(dto.openId, dto.encryptedPhone, dto.iv, dto.sessionKey);
  }

  /**
   * 微信openId登录
   * 用户第一次使用微信小程序登录（没有授权手机号）
   *
   * 请求体:
   * {
   *   "openId": "用户的微信openId",
   *   "nickName": "昵称 (可选)",
   *   "avatarUrl": "头像URL (可选)",
   *   "gender": "性别 1=男 2=女 (可选)",
   *   "province": "省份 (可选)",
   *   "city": "城市 (可选)",
   *   "country": "国家 (可选)"
   * }
   */
  @Post('wechat/open-id-login')
  @HttpCode(HttpStatus.OK)
  async wechatOpenIdLogin(
    @Body()
    dto: {
      openId: string;
      nickName?: string;
      avatarUrl?: string;
      gender?: number;
      province?: string;
      city?: string;
      country?: string;
    },
  ) {
    return this.authService.wechatOpenIdLogin(dto.openId, {
      nickName: dto.nickName,
      avatarUrl: dto.avatarUrl,
      gender: dto.gender,
      province: dto.province,
      city: dto.city,
      country: dto.country,
    });
  }

  /**
   * 微信登录 - 使用授权码获取 openId 和 sessionKey
   * 小程序调用 uni.login() 后，通过此接口获取 openId 和 sessionKey
   *
   * 请求体:
   * {
   *   "code": "微信授权码 (来自 uni.login())"
   * }
   *
   * 响应:
   * {
   *   "openId": "微信openId",
   *   "sessionKey": "微信会话密钥"
   * }
   */
  @Post('wechat/login-code')
  @HttpCode(HttpStatus.OK)
  async wechatLoginWithCode(@Body() dto: { code: string }) {
    return this.authService.wechatLoginWithCode(dto.code);
  }
}
