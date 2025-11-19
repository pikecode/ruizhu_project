import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * 验证用户名密码
   */
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * 用户名密码登录
   */
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  /**
   * 用户注册
   */
  async register(registerDto: { username: string; password: string; email: string }) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  /**
   * 解密微信手机号数据
   * 微信小程序通过 Button 组件 getPhoneNumber 获取加密的手机号数据
   * 需要使用 sessionKey 解密
   *
   * @param encryptedData 加密的手机号数据（base64编码）
   * @param iv 初始化向量（base64编码）
   * @param sessionKey 微信会话密钥（base64编码）
   * @returns 解密后的手机号数据对象
   */
  decryptWechatData(
    encryptedData: string,
    iv: string,
    sessionKey: string,
  ): any {
    try {
      // 验证输入参数
      if (!encryptedData || !iv || !sessionKey) {
        throw new Error('缺少必需的解密参数');
      }

      // 转换为 Buffer
      let encryptedDataBuf: Buffer;
      let ivBuf: Buffer;
      let sessionKeyBuf: Buffer;

      try {
        encryptedDataBuf = Buffer.from(encryptedData, 'base64');
        ivBuf = Buffer.from(iv, 'base64');
        sessionKeyBuf = Buffer.from(sessionKey, 'base64');
      } catch (e) {
        throw new Error('Base64 解码失败：请确保数据格式正确');
      }

      // 验证 Buffer 长度
      if (sessionKeyBuf.length !== 16) {
        throw new Error(`sessionKey 长度错误: 期望 16 字节，实际 ${sessionKeyBuf.length} 字节`);
      }

      if (ivBuf.length !== 16) {
        throw new Error(`iv 长度错误: 期望 16 字节，实际 ${ivBuf.length} 字节`);
      }

      // 使用 AES-128-CBC 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuf, ivBuf);

      // 关键：禁用自动填充，以便手动处理
      decipher.setAutoPadding(false);

      // 使用 Buffer 进行解密，避免字符编码问题
      let decrypted = decipher.update(encryptedDataBuf);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      // 移除 PKCS#7 填充（使用 Buffer 方式）
      const padLength = decrypted[decrypted.length - 1];

      // 验证填充是否有效
      if (padLength < 1 || padLength > 16) {
        throw new Error(`无效的 PKCS#7 填充: ${padLength}`);
      }

      // 验证所有填充字节是否相同
      for (let i = 0; i < padLength; i++) {
        if (decrypted[decrypted.length - 1 - i] !== padLength) {
          throw new Error('填充验证失败：填充字节不一致');
        }
      }

      // 移除填充
      const unpadded = decrypted.slice(0, decrypted.length - padLength);

      // 转换为 UTF-8 字符串并解析 JSON
      const decoded = unpadded.toString('utf8');
      return JSON.parse(decoded);
    } catch (error) {
      console.error('[decryptWechatData] Decryption error:', {
        message: error.message,
        stack: error.stack,
      });
      throw new BadRequestException(`手机号解密失败: ${error.message}`);
    }
  }

  /**
   * 微信手机号授权登录
   * 小程序用户通过手机号授权进行登录
   *
   * @param openId 微信openId
   * @param encryptedPhone 加密的手机号数据
   * @param iv 初始化向量
   * @param sessionKey 会话密钥（可选：如果数据库中不存在，可从请求中接收）
   * @returns JWT token 和用户信息
   */
  async wechatPhoneLogin(
    openId: string,
    encryptedPhone: string,
    iv: string,
    sessionKey?: string, // 可选参数：作为数据库sessionKey的备用方案
  ) {
    try {
      console.log('[phone-login] Starting phone login process', {
        openId: openId.substring(0, 10) + '...',
        encryptedPhoneLength: encryptedPhone?.length,
        ivLength: iv?.length,
        hasRequestSessionKey: !!sessionKey,
      });

      // 尝试从数据库获取存储的 sessionKey
      const user = (await this.usersService.findByOpenId(openId)) as any;

      let dbSessionKey: string | null = user?.sessionKey || null;
      console.log('[phone-login] Database sessionKey status:', {
        found: !!dbSessionKey,
        userId: user?.id
      });

      // 如果数据库中没有 sessionKey，尝试使用请求中提供的 sessionKey（后备方案）
      let finalSessionKey: string;
      if (dbSessionKey) {
        // 优先使用数据库中的 sessionKey
        finalSessionKey = dbSessionKey;
        console.log('[phone-login] Using sessionKey from database');
      } else if (sessionKey) {
        // 后备方案：使用请求中提供的 sessionKey
        finalSessionKey = sessionKey;
        console.log('[phone-login] Using sessionKey from request body (fallback)');
      } else {
        // 两种方式都没有 sessionKey
        console.error('[phone-login] No sessionKey available', {
          openId: openId.substring(0, 10) + '...',
          userExists: !!user,
          hasRequestSessionKey: !!sessionKey,
        });
        throw new BadRequestException('会话已过期，请先调用微信登录接口获取授权');
      }

      console.log('[phone-login] Using sessionKey for decryption');

      // 解密手机号数据
      let phoneData;
      try {
        phoneData = this.decryptWechatData(encryptedPhone, iv, finalSessionKey);
        console.log('[phone-login] Decryption successful', { phoneNumber: phoneData?.phoneNumber });
      } catch (decryptError) {
        console.error('[phone-login] Decryption failed', {
          error: decryptError.message,
          stack: decryptError.stack,
        });
        throw decryptError;
      }

      if (!phoneData.phoneNumber) {
        throw new BadRequestException('无法获取手机号');
      }

      const phone = phoneData.phoneNumber;
      console.log('[phone-login] Phone number extracted:', phone);

      // 查找或创建用户
      let phoneUser = await this.usersService.findByPhone(phone);
      console.log('[phone-login] User lookup result:', { userId: phoneUser?.id, exists: !!phoneUser });

      if (phoneUser) {
        // 更新现有用户的openId和授权状态
        if (phoneUser.openId !== openId) {
          phoneUser = await this.usersService.bindPhoneToOpenId(openId, phone);
          console.log('[phone-login] Bound phone to OpenId:', { userId: phoneUser.id });
        }
      } else {
        // 创建新用户
        phoneUser = await this.usersService.createOrUpdateByPhone(phone, openId, {
          nickname: phoneData.name || `用户_${phone.slice(-4)}`,
        });
        console.log('[phone-login] New user created:', { userId: phoneUser.id });
      }

      // 更新最后登录信息
      // 注意：这里需要客户端提供IP，或者在中间件中获取
      const ip = '0.0.0.0'; // 实际应该从请求中获取
      await this.usersService.updateLastLogin(phoneUser.id, ip);
      console.log('[phone-login] Last login updated');

      // 生成 JWT token
      const payload = { phone: phoneUser.phone, sub: phoneUser.id, openId: phoneUser.openId };
      const { password, ...userWithoutPassword } = phoneUser;

      const token = this.jwtService.sign(payload);
      console.log('[phone-login] JWT token generated successfully');

      return {
        access_token: token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('[phone-login] Unexpected error in phone login:', {
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
      });
      throw error;
    }
  }

  /**
   * 微信openId登录
   * 用户第一次使用微信小程序登录（无手机号）
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
    },
  ) {
    // 查找或创建用户
    let user = await this.usersService.findByOpenId(openId);

    if (!user) {
      // 创建新用户
      user = await this.usersService.createOrUpdateByPhone(
        null,
        openId,
        {
          nickname: userData?.nickName,
          avatarUrl: userData?.avatarUrl,
          gender: userData?.gender ? (userData.gender === 1 ? 'male' : userData.gender === 2 ? 'female' : 'unknown') : 'unknown',
          province: userData?.province,
          city: userData?.city,
          country: userData?.country,
          isProfileAuthorized: true,
        },
      );
    } else {
      // 更新现有用户信息
      if (userData && user.phone) {
        user = await this.usersService.bindPhoneToOpenId(openId, user.phone);
      }
    }

    // 更新最后登录信息
    const ip = '0.0.0.0';
    await this.usersService.updateLastLogin(user.id, ip);

    // 生成 JWT token
    const payload = { sub: user.id, openId: user.openId };
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  /**
   * 微信登录 - 使用授权码获取 openId 和 sessionKey
   * 小程序调用 uni.login() 后获取 code，前端通过此接口获取 openId 和 sessionKey
   *
   * 完整流程：
   * 1. 调用微信 jscode2session 接口获取 openId 和 sessionKey
   * 2. 在数据库中创建或更新用户，存储 sessionKey
   * 3. 返回 openId 和 sessionKey 给前端
   * 4. 前端后续使用这些信息调用手机号登录接口
   *
   * @param code 微信授权码（来自 uni.login()）
   * @returns { openId, sessionKey }
   */
  async wechatLoginWithCode(code: string) {
    if (!code) {
      throw new BadRequestException('授权码不能为空');
    }

    try {
      // 调用微信 API 接口
      const appId = process.env.WECHAT_APP_ID || '';
      const appSecret = process.env.WECHAT_APP_SECRET || '';

      if (!appId || !appSecret) {
        throw new BadRequestException('微信配置不完整');
      }

      const wechatUrl = 'https://api.weixin.qq.com/sns/jscode2session';
      const params = new URLSearchParams();
      params.append('appid', appId);
      params.append('secret', appSecret);
      params.append('js_code', code);
      params.append('grant_type', 'authorization_code');

      const response = await fetch(`${wechatUrl}?${params.toString()}`);
      const data = await response.json();

      // 检查响应
      if (data.errcode) {
        throw new BadRequestException(
          `微信登录失败: ${data.errmsg || '未知错误'}`,
        );
      }

      if (!data.openid || !data.session_key) {
        throw new BadRequestException('微信返回数据不完整');
      }

      const openId = data.openid;
      const sessionKey = data.session_key;

      // 关键步骤：将 sessionKey 存储到数据库
      // 这确保后续手机号登录时可以从数据库获取 sessionKey 进行解密
      console.log('[wechatLoginWithCode] Storing sessionKey for openId:', openId);

      try {
        // 先查找是否存在该 openId 的用户
        const existingUser = await this.usersService.findByOpenId(openId);

        if (existingUser) {
          // 用户已存在，更新 sessionKey
          console.log('[wechatLoginWithCode] User exists, updating sessionKey');
          await this.usersService.updateSessionKey(existingUser.id, sessionKey);
        } else {
          // 用户不存在，创建新用户并存储 sessionKey
          console.log('[wechatLoginWithCode] Creating new user with sessionKey');
          await this.usersService.createOrUpdateByPhone(
            null, // 暂无手机号
            openId,
            {
              sessionKey, // 存储 sessionKey 到数据库
            }
          );
        }
        console.log('[wechatLoginWithCode] SessionKey stored successfully');
      } catch (dbError) {
        console.error('[wechatLoginWithCode] Failed to store sessionKey:', dbError);
        // 即使存储失败也继续返回，不阻止前端流程
        console.warn('[wechatLoginWithCode] Continuing despite database storage error');
      }

      return {
        openId,
        sessionKey,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `微信登录失败: ${error?.message || '网络错误'}`,
      );
    }
  }
}
