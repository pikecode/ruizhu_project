import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from './constants/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有指定所需角色，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 检查用户是否存在且拥有 role 字段
    if (!user) {
      throw new ForbiddenException('用户信息不存在');
    }

    // 支持两种格式：
    // 1. user.role 是对象，包含 code 或 name 字段（来自数据库）
    // 2. user.role 是字符串（来自 JWT token）
    let userRole: AdminRole;

    if (typeof user.role === 'string') {
      userRole = user.role as AdminRole;
    } else if (typeof user.role === 'object' && user.role) {
      userRole = (user.role.code || user.role.name) as AdminRole;
    } else {
      throw new ForbiddenException('用户角色信息不存在');
    }

    // 检查用户角色是否在允许的角色列表中
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `此操作需要以下角色之一: ${requiredRoles.join(', ')}，但你的角色是: ${userRole}`,
      );
    }

    return true;
  }
}
