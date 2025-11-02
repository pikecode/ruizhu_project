import Layout from '@/components/Layout'
import BannerManager from '@/components/BannerManager'

/**
 * Profile Banners Page
 * 个人页面 Banner 管理
 */
export default function ProfileBanners() {
  return (
    <Layout>
      <BannerManager
        title="个人页面Banner管理"
        pageType="profile"
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