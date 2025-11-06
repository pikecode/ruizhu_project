import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Admin Authentication Guard
 * 用于保护只有管理员才能访问的端点
 * 检查 JWT token 且验证 type 字段为 'admin'
 */
@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext) {
    // 先调用父类的 canActivate 来验证 JWT
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 这将在 JWT 验证后被调用
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }

    // 检查 token 中的 type 是否为 'admin'
    if (user.type !== 'admin') {
      throw new ForbiddenException('只有管理员可以访问此资源');
    }

    return user;
  }
}
