import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole, getRolePermissions, hasAnyPermission } from './constants/roles';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // 如果没有指定所需权限，则允许访问
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('用户信息不存在');
    }

    // 获取用户角色
    let userRole: AdminRole;

    if (typeof user.role === 'string') {
      userRole = user.role as AdminRole;
    } else if (typeof user.role === 'object' && user.role) {
      userRole = (user.role.code || user.role.name) as AdminRole;
    } else {
      throw new ForbiddenException('用户角色信息不存在');
    }

    // 根据角色获取该角色拥有的所有权限
    const userPermissions = getRolePermissions(userRole);

    // 检查用户是否拥有至少一个所需的权限
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `此操作需要以下权限之一: ${requiredPermissions.join(', ')}，但你没有相应权限`,
      );
    }

    return true;
  }
}
