/**
 * 集合 Slug 常量定义
 *
 * 这些 slug 值在系统中是固定的，用于小程序首页的各个位置
 * 后台管理员在创建集合时需要选择相应的 slug
 */

export interface CollectionSlugOption {
  value: string
  label: string
  description: string
}

export const COLLECTION_SLUG_OPTIONS: CollectionSlugOption[] = [
  {
    value: 'premium-clothing',
    label: '精品服饰',
    description: '显示在小程序首页精品服饰区域',
  },
  {
    value: 'premium-jewelry',
    label: '精品珠宝',
    description: '显示在小程序首页精品珠宝区域',
  },
  {
    value: 'recommended-products',
    label: '推荐商品',
    description: '显示在小程序首页推荐商品区域',
  },
  {
    value: 'guess-you-like',
    label: '猜你喜欢',
    description: '显示在小程序首页猜你喜欢区域',
  },
]

/**
 * 快速获取 slug 的显示名称
 */
export const getSlugLabel = (slug: string): string => {
  const option = COLLECTION_SLUG_OPTIONS.find(o => o.value === slug)
  return option?.label || slug
}

/**
 * 快速获取 slug 的描述
 */
export const getSlugDescription = (slug: string): string => {
  const option = COLLECTION_SLUG_OPTIONS.find(o => o.value === slug)
  return option?.description || '未知位置'
}
