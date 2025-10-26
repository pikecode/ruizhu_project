/**
 * 国际化常量 - 中文
 */

// 订单状态映射
export const ORDER_STATUS_MAP = {
  pending: { label: '待确认', color: 'warning' },
  confirmed: { label: '已确认', color: 'info' },
  shipped: { label: '已发货', color: 'primary' },
  delivered: { label: '已收货', color: 'success' },
  cancelled: { label: '已取消', color: 'danger' },
  refunded: { label: '已退款', color: 'danger' },
}

// 优惠券类型映射
export const COUPON_TYPE_MAP = {
  fixed: { label: '固定金额', icon: 'fixed' },
  percentage: { label: '百分比', icon: 'percentage' },
  free_shipping: { label: '免运费', icon: 'shipping' },
}

// 优惠券状态映射
export const COUPON_STATUS_MAP = {
  active: { label: '有效', color: 'success' },
  expired: { label: '已过期', color: 'error' },
  disabled: { label: '已禁用', color: 'default' },
}

// 产品状态映射
export const PRODUCT_STATUS_MAP = {
  active: { label: '上架', color: 'success' },
  inactive: { label: '下架', color: 'error' },
  draft: { label: '草稿', color: 'default' },
}

// 常用操作文本
export const COMMON_ACTIONS = {
  add: '新增',
  edit: '编辑',
  delete: '删除',
  view: '查看',
  search: '搜索',
  reset: '重置',
  export: '导出',
  import: '导入',
  refresh: '刷新',
  confirm: '确认',
  cancel: '取消',
  save: '保存',
  close: '关闭',
}

// 常用错误信息
export const ERROR_MESSAGES = {
  loadFailed: '加载失败，请重试',
  saveFailed: '保存失败，请重试',
  deleteFailed: '删除失败，请重试',
  networkError: '网络错误，请检查连接',
  unauthorized: '请先登录',
  forbidden: '没有权限执行此操作',
}

// 常用成功信息
export const SUCCESS_MESSAGES = {
  saveSuccess: '保存成功',
  deleteSuccess: '删除成功',
  updateSuccess: '更新成功',
  operationSuccess: '操作成功',
}

// 列表页面文本
export const LIST_PAGE_LABELS = {
  productList: '产品列表',
  orderList: '订单列表',
  couponList: '优惠券列表',
  userList: '用户列表',
  totalRecords: '共 {count} 条记录',
  page: '页',
  pageSize: '每页显示',
  items: '项',
}

// 表格列标题
export const TABLE_COLUMNS = {
  id: 'ID',
  name: '名称',
  title: '标题',
  category: '分类',
  price: '价格',
  stock: '库存',
  status: '状态',
  user: '用户',
  total: '总额',
  created: '创建时间',
  updated: '更新时间',
  actions: '操作',
  discount: '折扣',
  type: '类型',
  validFrom: '有效期开始',
  validTo: '有效期结束',
  usageCount: '已使用次数',
}
