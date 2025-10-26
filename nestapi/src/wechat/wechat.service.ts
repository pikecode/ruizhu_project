import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class WechatService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * 根据微信openid登录或创建用户
   * 实际项目中需要调用微信API: https://api.weixin.qq.com/sns/jscode2session
   * 这里仅为演示使用mock方式
   */
  async authenticateOrCreateUser(
    openid: string,
    sessionKey: string,
    userInfo?: { nickname?: string; avatarUrl?: string },
  ) {
    // 尝试查找已存在的用户
    let user = await this.userRepository.findOne({
      where: { openid },
    });

    if (!user) {
      // 创建新用户
      user = new User();
      user.openid = openid;
      user.sessionKey = sessionKey;
      user.wechatNickname = userInfo?.nickname || `User_${openid.substring(0, 8)}`;
      user.avatar = userInfo?.avatarUrl || '';
      user.username = openid; // 使用openid作为username
      user.email = `${openid}@weixin.local`; // 临时邮箱
      user.password = ''; // 不使用密码
      user.isActive = true;

      user = await this.userRepository.save(user);
    } else {
      // 更新已存在用户的sessionKey
      user.sessionKey = sessionKey;
      user.wechatNickname = userInfo?.nickname || user.wechatNickname;
      user.avatar = userInfo?.avatarUrl || user.avatar;
      user = await this.userRepository.save(user);
    }

    // 生成JWT token
    const access_token = this.jwtService.sign({
      sub: user.id,
      openid: user.openid,
      username: user.username,
    });

    return {
      access_token,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.wechatNickname,
        avatar: user.avatar,
        phone: user.phone,
      },
      sessionKey,
    };
  }

  /**
   * 解密微信用户手机号
   * 需要sessionKey和用户授权时返回的encryptedData和iv
   */
  async decryptPhoneNumber(
    sessionKey: string,
    encryptedData: string,
    iv: string,
  ) {
    try {
      const sessionKey_buffer = Buffer.from(sessionKey, 'base64');
      const encryptedData_buffer = Buffer.from(encryptedData, 'base64');
      const iv_buffer = Buffer.from(iv, 'base64');

      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        sessionKey_buffer,
        iv_buffer,
      );
      decipher.setAutoPadding(true);

      let decoded = decipher.update(encryptedData_buffer, undefined, 'utf8');
      decoded += decipher.final('utf8');

      const decrypted = JSON.parse(decoded);
      return decrypted; // { phoneNumber, purePhoneNumber, countryCode, watermark }
    } catch (error) {
      throw new Error('Failed to decrypt phone number');
    }
  }

  /**
   * 绑定或更新用户手机号
   */
  async bindPhoneNumber(userId: number, phoneNumber: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.phone = phoneNumber;
    const updated = await this.userRepository.save(user);

    return {
      success: true,
      user: {
        id: updated.id,
        openid: updated.openid,
        phone: updated.phone,
        nickname: updated.wechatNickname,
      },
    };
  }

  /**
   * 验证会话是否有效
   */
  async verifySession(openid: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { openid },
    });
    return !!user && !!user.sessionKey;
  }
}
