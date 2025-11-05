import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import * as bcryptjs from 'bcryptjs';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    nickname: string;
    role: string;
    isSuperAdmin: boolean;
  };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private adminUsersService: AdminUsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * 验证 Admin 用户名和密码
   */
  async validateAdminUser(username: string, password: string): Promise<any> {
    const user = await this.adminUsersService.findByUsername(username);
    if (
      user &&
      user.password &&
      (await bcryptjs.compare(password, user.password))
    ) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Admin 用户登录
   */
  async adminLogin(loginDto: AdminLoginRequest): Promise<AdminLoginResponse> {
    const user = await this.validateAdminUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录信息
    await this.adminUsersService.updateLastLogin(user.id, '0.0.0.0');

    const payload = { username: user.username, sub: user.id, type: 'admin' };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  /**
   * 刷新 Admin 用户的 JWT Token
   */
  async refreshAdminToken(payload: any): Promise<{ access_token: string }> {
    const newPayload = {
      username: payload.username,
      sub: payload.sub,
      type: 'admin',
    };
    return {
      access_token: this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      }),
    };
  }
}
