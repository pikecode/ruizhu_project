import { useState, useCallback, useMemo } from 'react'
import { Layout as AntLayout, Menu, Button, Dropdown, Space, Spin } from 'antd'
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
  const [loading, setLoading] = useState(false)
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

    // 添加加载状态
    setLoading(true)
    // 使用setTimeout来触发路由导航，让加载状态能够显示
    const timer = setTimeout(() => {
      navigate(path)
      // 导航完成后关闭加载状态
      setTimeout(() => setLoading(false), 100)
    }, 50)

    return () => clearTimeout(timer)
  }, [location.pathname, navigate])

  // 使用useMemo来缓存menuItems，避免每次都重新创建
  const menuItems = useMemo(() => [
    {
      key: '/dashboard',
      label: '仪表板',
      onClick: () => handleNavigate('/dashboard'),
    },
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
      key: '/orders',
      label: '订单',
      onClick: () => handleNavigate('/orders'),
    },
    {
      key: '/users',
      label: '用户',
      onClick: () => handleNavigate('/users'),
    },
    {
      key: '/settings',
      label: '设置',
      onClick: () => handleNavigate('/settings'),
    },
  ], [handleNavigate])

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
          <Spin spinning={loading} delay={50}>
            <div className={loading ? styles.contentFading : ''}>
              {children}
            </div>
          </Spin>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
