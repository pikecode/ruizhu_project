/**
 * 分享服务模块
 * 处理小程序的分享到朋友圈和分享给朋友功能
 */

/**
 * 商品分享信息
 */
export interface ShareInfo {
  title: string  // 分享标题
  desc?: string  // 分享描述
  imageUrl?: string  // 分享图片 URL
  path?: string  // 分享链接路径
  query?: Record<string, any>  // 分享链接查询参数
}

/**
 * 生成分享链接
 */
export function generateSharePath(path: string, query?: Record<string, any>): string {
  if (!query || Object.keys(query).length === 0) {
    return path
  }

  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return `${path}?${queryString}`
}

/**
 * 商品分享信息
 */
export function createProductShareInfo(productId: number, productName: string, productImage?: string): ShareInfo {
  return {
    title: '韵界品牌官方旗舰店',
    desc: productName,
    imageUrl: productImage,
    path: `/pages/product/detail`,
    query: { id: productId }
  }
}

/**
 * 集合分享信息
 */
export function createCollectionShareInfo(collectionId: number, collectionName: string, collectionImage?: string): ShareInfo {
  return {
    title: '韵界品牌官方旗舰店',
    desc: collectionName,
    imageUrl: collectionImage,
    path: `/pages/collection/detail`,
    query: { id: collectionId }
  }
}

/**
 * 资讯分享信息
 */
export function createNewsShareInfo(newsId: number, newsTitle: string, newsImage?: string): ShareInfo {
  return {
    title: '韵界品牌官方旗舰店',
    desc: newsTitle,
    imageUrl: newsImage,
    path: `/pages/news/detail`,
    query: { id: newsId }
  }
}

/**
 * 首页分享信息
 */
export function createHomeShareInfo(): ShareInfo {
  return {
    title: '韵界品牌官方旗舰店',
    desc: '大女主时尚生活',
    path: '/pages/index/index'
  }
}
