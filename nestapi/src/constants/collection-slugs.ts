/**
 * 集合 Slug 常量定义
 *
 * 这些 slug 值在系统中是固定的，用于小程序首页的各个位置
 * 一旦定义就不能改，确保小程序端的 URL 永远有效
 *
 * 小程序首页映射：
 * - premium-clothing    → 精品服饰区域
 * - premium-jewelry     → 精品珠宝区域
 * - recommended-products → 推荐商品区域
 * - guess-you-like      → 猜你喜欢区域
 */

export const COLLECTION_SLUGS = {
  // 首页位置 1：精品服饰
  PREMIUM_CLOTHING: 'premium-clothing',

  // 首页位置 2：精品珠宝
  PREMIUM_JEWELRY: 'premium-jewelry',

  // 首页位置 3：推荐商品
  RECOMMENDED_PRODUCTS: 'recommended-products',

  // 首页位置 4：猜你喜欢
  GUESS_YOU_LIKE: 'guess-you-like',
} as const;

/**
 * 所有允许的 slug 值数组
 * 用于验证和下拉框选项
 */
export const VALID_COLLECTION_SLUGS = Object.values(COLLECTION_SLUGS);

/**
 * Slug 的显示名称和描述
 * 用于后台管理页面显示
 */
export const COLLECTION_SLUG_METADATA = {
  [COLLECTION_SLUGS.PREMIUM_CLOTHING]: {
    label: '精品服饰',
    description: '显示在首页精品服饰区域',
  },
  [COLLECTION_SLUGS.PREMIUM_JEWELRY]: {
    label: '精品珠宝',
    description: '显示在首页精品珠宝区域',
  },
  [COLLECTION_SLUGS.RECOMMENDED_PRODUCTS]: {
    label: '推荐商品',
    description: '显示在首页推荐商品区域',
  },
  [COLLECTION_SLUGS.GUESS_YOU_LIKE]: {
    label: '猜你喜欢',
    description: '显示在首页猜你喜欢区域',
  },
} as const;
