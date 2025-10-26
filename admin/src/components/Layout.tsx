import { useState } from 'react'
import { Layout as AntLayout, Menu, Button, Dropdown, Space, Drawer } from 'antd'
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
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/products',
      label: 'Products',
      onClick: () => navigate('/products'),
    },
    {
      key: '/orders',
      label: 'Orders',
      onClick: () => navigate('/orders'),
    },
    {
      key: '/users',
      label: 'Users',
      onClick: () => navigate('/users'),
    },
    {
      key: '/files',
      label: 'Files',
      onClick: () => navigate('/files'),
    },
    {
      key: '/settings',
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ]

  const userMenu = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <AntLayout className={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed} className={styles.sider}>
        <div className={styles.logo}>
          {collapsed ? 'RA' : 'Ruizhu Admin'}
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
                  {user?.username || 'User'}
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
