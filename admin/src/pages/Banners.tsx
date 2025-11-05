import Layout from '@/components/Layout'
import BannerManager from '@/components/BannerManager'

/**
 * Banners Page
 * 首页 Banner 管理
 */
export default function BannersPage() {
  return (
    <Layout>
      <BannerManager
        title="首页Banner管理"
        pageType="default"
        linkTypeOptions={[
          { label: '商品', value: 'product' },
          { label: '资讯', value: 'news' },
        ]}
      />
    </Layout>
  )
}
