/**
 * 权限定义
 * 按模块分类管理所有权限
 */

// 产品管理权限
export const PRODUCT_PERMISSIONS = {
  VIEW: 'product.view', // 查看产品
  CREATE: 'product.create', // 创建产品
  UPDATE: 'product.update', // 更新产品
  DELETE: 'product.delete', // 删除产品
  MANAGE_IMAGES: 'product.manage_images', // 管理产品图片
  MANAGE_ATTRIBUTES: 'product.manage_attributes', // 管理产品属性
};

// 订单管理权限
export const ORDER_PERMISSIONS = {
  VIEW: 'order.view', // 查看订单
  UPDATE_STATUS: 'order.update_status', // 更新订单状态
  REFUND: 'order.refund', // 订单退款
  EXPORT: 'order.export', // 导出订单
};

// 用户管理权限
export const USER_PERMISSIONS = {
  VIEW: 'user.view', // 查看用户
  CREATE: 'user.create', // 创建用户
  UPDATE: 'user.update', // 更新用户
  DELETE: 'user.delete', // 删除用户
  MANAGE_ROLES: 'user.manage_roles', // 管理角色
};

// Banner 管理权限
export const BANNER_PERMISSIONS = {
  VIEW: 'banner.view', // 查看 Banner
  CREATE: 'banner.create', // 创建 Banner
  UPDATE: 'banner.update', // 更新 Banner
  DELETE: 'banner.delete', // 删除 Banner
};

// 集合管理权限
export const COLLECTION_PERMISSIONS = {
  VIEW: 'collection.view', // 查看集合
  CREATE: 'collection.create', // 创建集合
  UPDATE: 'collection.update', // 更新集合
  DELETE: 'collection.delete', // 删除集合
};

// 咨询管理权限
export const CONSULTATION_PERMISSIONS = {
  VIEW: 'consultation.view', // 查看咨询
  RESPOND: 'consultation.respond', // 回复咨询
  DELETE: 'consultation.delete', // 删除咨询
};

// 会员权益管理权限
export const MEMBER_BENEFIT_PERMISSIONS = {
  VIEW: 'member_benefit.view', // 查看会员权益
  CREATE: 'member_benefit.create', // 创建会员权益
  UPDATE: 'member_benefit.update', // 更新会员权益
  DELETE: 'member_benefit.delete', // 删除会员权益
};

// 内容管理权限
export const CONTENT_PERMISSIONS = {
  VIEW: 'content.view', // 查看内容
  CREATE: 'content.create', // 创建内容
  UPDATE: 'content.update', // 更新内容
  DELETE: 'content.delete', // 删除内容
};

// 系统管理权限
export const SYSTEM_PERMISSIONS = {
  MANAGE_ADMINS: 'system.manage_admins', // 管理管理员
  MANAGE_ROLES: 'system.manage_roles', // 管理角色
  VIEW_LOGS: 'system.view_logs', // 查看日志
  SYSTEM_SETTINGS: 'system.system_settings', // 系统设置
};

// 所有权限集合
export const ALL_PERMISSIONS = {
  ...PRODUCT_PERMISSIONS,
  ...ORDER_PERMISSIONS,
  ...USER_PERMISSIONS,
  ...BANNER_PERMISSIONS,
  ...COLLECTION_PERMISSIONS,
  ...CONSULTATION_PERMISSIONS,
  ...MEMBER_BENEFIT_PERMISSIONS,
  ...CONTENT_PERMISSIONS,
  ...SYSTEM_PERMISSIONS,
};

export type Permission = typeof ALL_PERMISSIONS[keyof typeof ALL_PERMISSIONS];
