import { useState } from 'react'
import { Layout as AntLayout, Menu, Button, Dropdown, Space } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import styles from './Layout.module.scss'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/dashboard',
      label: '仪表板',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/products',
      label: '产品',
      onClick: () => navigate('/products'),
    },
    {
      key: '/collections',
      label: '集合',
      onClick: () => navigate('/collections'),
    },
    {
      key: '/array-collections',
      label: '数组集合',
      onClick: () => navigate('/array-collections'),
    },
    {
      key: '/orders',
      label: '订单',
      onClick: () => navigate('/orders'),
    },
    {
      key: '/users',
      label: '用户',
      onClick: () => navigate('/users'),
    },
    {
      key: '/settings',
      label: '设置',
      onClick: () => navigate('/settings'),
    },
  ]

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
          {collapsed ? 'RZ' : '瑞竹管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
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
