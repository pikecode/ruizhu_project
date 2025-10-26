import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WechatService } from './wechat.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/v1/wechat')
export class WechatController {
  constructor(private wechatService: WechatService) {}

  /**
   * 微信登录
   * 客户端步骤:
   * 1. 调用 wx.login() 获取临时code
   * 2. 将code发送给后端
   * 3. 后端用code换取sessionKey和openid
   * 4. 后端创建/登录用户，返回JWT token
   */
  @Post('login')
  async wechatLogin(@Body() body: { code: string; userInfo?: any }) {
    const { code, userInfo } = body;

    // 实际项目中需要调用微信API，这里使用mock
    // 真实逻辑: const res = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    //   params: { appid, secret, js_code: code, grant_type: 'authorization_code' }
    // })
    // const { openid, session_key } = res.data

    // Mock: 用code生成mock的openid和sessionKey
    const mockOpenid = `${code}_mock_${Date.now()}`.substring(0, 28);
    const mockSessionKey = Buffer.from(`${mockOpenid}_session_${Date.now()}`).toString(
      'base64',
    );

    const result = await this.wechatService.authenticateOrCreateUser(
      mockOpenid,
      mockSessionKey,
      userInfo,
    );

    return {
      statusCode: 200,
      message: '登录成功',
      data: result,
    };
  }

  /**
   * 获取和解密用户手机号
   * 客户端步骤:
   * 1. 调用 wx.getUserPhoneNumber() 获取加密数据
   * 2. 将加密数据发送给后端
   * 3. 后端用sessionKey解密，获取手机号
   * 4. 后端更新用户信息
   */
  @Post('get-phone')
  @UseGuards(JwtGuard)
  async getPhoneNumber(
    @CurrentUser() user: User,
    @Body() body: { encryptedData: string; iv: string },
  ) {
    const { encryptedData, iv } = body;

    // 获取用户的sessionKey
    // 实际项目中需要从数据库查询
    const dbUser = await this.wechatService['userRepository'].findOne({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.sessionKey) {
      return {
        statusCode: 401,
        message: '会话已过期，请重新登录',
      };
    }

    try {
      const phoneData = await this.wechatService.decryptPhoneNumber(
        dbUser.sessionKey,
        encryptedData,
        iv,
      );

      // 保存手机号
      const updated = await this.wechatService.bindPhoneNumber(
        user.id,
        phoneData.purePhoneNumber,
      );

      return {
        statusCode: 200,
        message: '手机号获取成功',
        data: updated,
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: '手机号解密失败',
        error: error.message,
      };
    }
  }

  /**
   * 验证用户会话
   * 用于检查sessionKey是否有效
   */
  @Post('verify-session')
  @UseGuards(JwtGuard)
  async verifySession(@CurrentUser() user: User) {
    const isValid = await this.wechatService.verifySession(user.openid);

    return {
      statusCode: 200,
      data: {
        valid: isValid,
      },
    };
  }
}
