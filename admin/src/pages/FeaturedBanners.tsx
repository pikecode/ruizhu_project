import Layout from '@/components/Layout'
import BannerManager from '@/components/BannerManager'

/**
 * Featured Banners Page
 * 精选系列 Banner 管理
 */
export default function FeaturedBanners() {
  return (
    <Layout>
      <BannerManager
        title="精选系列Banner管理"
        pageType="featured"
        linkTypeOptions={[
          { label: '商品', value: 'product' },
          { label: '分类', value: 'category' },
          { label: '合集', value: 'collection' },
          { label: '无链接', value: 'none' },
        ]}
      />
    </Layout>
  )
}
