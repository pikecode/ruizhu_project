/**
 * 角色定义与权限映射
 * 定义系统中的所有角色和它们拥有的权限
 */

import {
  PRODUCT_PERMISSIONS,
  ORDER_PERMISSIONS,
  USER_PERMISSIONS,
  BANNER_PERMISSIONS,
  COLLECTION_PERMISSIONS,
  CONSULTATION_PERMISSIONS,
  MEMBER_BENEFIT_PERMISSIONS,
  CONTENT_PERMISSIONS,
  SYSTEM_PERMISSIONS,
} from './permissions';

export const ADMIN_ROLES = {
  ADMIN: 'admin', // 超级管理员
  MANAGER: 'manager', // 经理
  OPERATOR: 'operator', // 操作员
};

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

/**
 * 角色权限映射表
 * 定义每个角色拥有的权限
 */
export const ROLE_PERMISSIONS_MAP: Record<AdminRole, string[]> = {
  // 超级管理员 - 拥有所有权限
  [ADMIN_ROLES.ADMIN]: [
    // 产品权限
    PRODUCT_PERMISSIONS.VIEW,
    PRODUCT_PERMISSIONS.CREATE,
    PRODUCT_PERMISSIONS.UPDATE,
    PRODUCT_PERMISSIONS.DELETE,
    PRODUCT_PERMISSIONS.MANAGE_IMAGES,
    PRODUCT_PERMISSIONS.MANAGE_ATTRIBUTES,

    // 订单权限
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.UPDATE_STATUS,
    ORDER_PERMISSIONS.REFUND,
    ORDER_PERMISSIONS.EXPORT,

    // 用户权限
    USER_PERMISSIONS.VIEW,
    USER_PERMISSIONS.CREATE,
    USER_PERMISSIONS.UPDATE,
    USER_PERMISSIONS.DELETE,
    USER_PERMISSIONS.MANAGE_ROLES,

    // Banner 权限
    BANNER_PERMISSIONS.VIEW,
    BANNER_PERMISSIONS.CREATE,
    BANNER_PERMISSIONS.UPDATE,
    BANNER_PERMISSIONS.DELETE,

    // 集合权限
    COLLECTION_PERMISSIONS.VIEW,
    COLLECTION_PERMISSIONS.CREATE,
    COLLECTION_PERMISSIONS.UPDATE,
    COLLECTION_PERMISSIONS.DELETE,

    // 咨询权限
    CONSULTATION_PERMISSIONS.VIEW,
    CONSULTATION_PERMISSIONS.RESPOND,
    CONSULTATION_PERMISSIONS.DELETE,

    // 会员权益权限
    MEMBER_BENEFIT_PERMISSIONS.VIEW,
    MEMBER_BENEFIT_PERMISSIONS.CREATE,
    MEMBER_BENEFIT_PERMISSIONS.UPDATE,
    MEMBER_BENEFIT_PERMISSIONS.DELETE,

    // 内容权限
    CONTENT_PERMISSIONS.VIEW,
    CONTENT_PERMISSIONS.CREATE,
    CONTENT_PERMISSIONS.UPDATE,
    CONTENT_PERMISSIONS.DELETE,

    // 系统权限
    SYSTEM_PERMISSIONS.MANAGE_ADMINS,
    SYSTEM_PERMISSIONS.MANAGE_ROLES,
    SYSTEM_PERMISSIONS.VIEW_LOGS,
    SYSTEM_PERMISSIONS.SYSTEM_SETTINGS,
  ],

  // 经理 - 拥有大部分权限，但不能管理管理员和删除数据
  [ADMIN_ROLES.MANAGER]: [
    // 产品权限 - 不能删除
    PRODUCT_PERMISSIONS.VIEW,
    PRODUCT_PERMISSIONS.CREATE,
    PRODUCT_PERMISSIONS.UPDATE,
    PRODUCT_PERMISSIONS.MANAGE_IMAGES,
    PRODUCT_PERMISSIONS.MANAGE_ATTRIBUTES,

    // 订单权限 - 只能查看和更新状态
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.UPDATE_STATUS,
    ORDER_PERMISSIONS.EXPORT,

    // 用户权限 - 不能管理角色
    USER_PERMISSIONS.VIEW,

    // Banner 权限 - 不能删除
    BANNER_PERMISSIONS.VIEW,
    BANNER_PERMISSIONS.CREATE,
    BANNER_PERMISSIONS.UPDATE,

    // 集合权限 - 不能删除
    COLLECTION_PERMISSIONS.VIEW,
    COLLECTION_PERMISSIONS.CREATE,
    COLLECTION_PERMISSIONS.UPDATE,

    // 咨询权限
    CONSULTATION_PERMISSIONS.VIEW,
    CONSULTATION_PERMISSIONS.RESPOND,

    // 会员权益权限 - 不能删除
    MEMBER_BENEFIT_PERMISSIONS.VIEW,
    MEMBER_BENEFIT_PERMISSIONS.CREATE,
    MEMBER_BENEFIT_PERMISSIONS.UPDATE,

    // 内容权限 - 不能删除
    CONTENT_PERMISSIONS.VIEW,
    CONTENT_PERMISSIONS.CREATE,
    CONTENT_PERMISSIONS.UPDATE,
  ],

  // 操作员 - 只有查看和部分更新权限
  [ADMIN_ROLES.OPERATOR]: [
    // 产品权限 - 只能查看
    PRODUCT_PERMISSIONS.VIEW,

    // 订单权限 - 只能查看和更新状态
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.UPDATE_STATUS,

    // 用户权限 - 只能查看
    USER_PERMISSIONS.VIEW,

    // Banner 权限 - 只能查看
    BANNER_PERMISSIONS.VIEW,

    // 集合权限 - 只能查看
    COLLECTION_PERMISSIONS.VIEW,

    // 咨询权限 - 只能查看和回复
    CONSULTATION_PERMISSIONS.VIEW,
    CONSULTATION_PERMISSIONS.RESPOND,

    // 会员权益权限 - 只能查看
    MEMBER_BENEFIT_PERMISSIONS.VIEW,

    // 内容权限 - 只能查看
    CONTENT_PERMISSIONS.VIEW,
  ],
};

/**
 * 获取角色的所有权限
 */
export function getRolePermissions(role: AdminRole): string[] {
  return ROLE_PERMISSIONS_MAP[role] || [];
}

/**
 * 检查角色是否拥有某个权限
 */
export function hasPermission(role: AdminRole, permission: string): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * 检查角色是否拥有多个权限中的任何一个
 */
export function hasAnyPermission(
  role: AdminRole,
  permissions: string[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * 检查角色是否拥有所有指定权限
 */
export function hasAllPermissions(
  role: AdminRole,
  permissions: string[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
