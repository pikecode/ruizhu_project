import { useState, useCallback, useMemo } from 'react'
import { Layout as AntLayout, Menu, Button, Dropdown, Space } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './Layout.module.scss'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuthStore()

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  // 使用useCallback缓存导航函数，避免Menu不必要的重新渲染
  const handleNavigate = useCallback((path: string) => {
    // 如果已经在该路径，不要导航
    if (location.pathname === path) return
    navigate(path)
  }, [location.pathname, navigate])

  // 使用useMemo来缓存menuItems，避免每次都重新创建
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        key: '/products',
        label: '产品',
        onClick: () => handleNavigate('/products'),
      },
      {
        key: '/collections',
        label: '集合',
        onClick: () => handleNavigate('/collections'),
      },
      {
        key: '/array-collections',
        label: '数组集合',
        onClick: () => handleNavigate('/array-collections'),
      },
      {
        key: '/banners',
        label: '首页Banner',
        onClick: () => handleNavigate('/banners'),
      },
      {
        key: '/custom-banners',
        label: '私人定制Banner',
        onClick: () => handleNavigate('/custom-banners'),
      },
      {
        key: '/profile-banners',
        label: '我的页面Banner',
        onClick: () => handleNavigate('/profile-banners'),
      },
      {
        key: '/about-banners',
        label: '关于页面Banner',
        onClick: () => handleNavigate('/about-banners'),
      },
      {
        key: '/featured-banners',
        label: '精选系列Banner',
        onClick: () => handleNavigate('/featured-banners'),
      },
      {
        key: '/news',
        label: '资讯',
        onClick: () => handleNavigate('/news'),
      },
      {
        key: '/orders',
        label: '订单',
        onClick: () => handleNavigate('/orders'),
      },
      {
        key: '/consultations',
        label: '💬 产品咨询',
        onClick: () => handleNavigate('/consultations'),
      },
      {
        key: '/member-benefits',
        label: '🎁 会员礼遇',
        onClick: () => handleNavigate('/member-benefits'),
      },
      {
        key: '/consumer-users',
        label: '👥 消费者用户',
        onClick: () => handleNavigate('/consumer-users'),
      },
    ]

    // 只有admin角色才能看到Admin用户菜单
    const userRole = typeof user?.role === 'string' ? user?.role : user?.role?.name
    if (userRole === 'admin') {
      baseItems.push({
        key: '/users',
        label: '🔐 Admin用户',
        onClick: () => handleNavigate('/users'),
      })
    }

    return baseItems
  }, [handleNavigate, user?.role])

  const userMenu = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <AntLayout className={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed} className={styles.sider}>
        <div className={styles.logo}>
          {collapsed ? 'RZ' : '睿珠管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      <AntLayout>
        <Header className={styles.header}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={styles.trigger}
          />

          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Button type="text">
                <Space>
                  <UserOutlined />
                  {user?.username || '用户'}
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content className={styles.content}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
