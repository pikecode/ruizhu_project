import Layout from '@/components/Layout'
import BannerManager from '@/components/BannerManager'

/**
 * About Banners Page
 * 关于我们/我们页面 Banner 管理
 */
export default function AboutBanners() {
  return (
    <Layout>
      <BannerManager
        title="我们页面Banner管理"
        pageType="about"
        linkTypeOptions={[
          { label: '商品', value: 'product' },
          { label: '资讯', value: 'news' },
          { label: '无链接', value: 'none' },
        ]}
      />
    </Layout>
  )
}
