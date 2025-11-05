import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message } from 'antd'
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { usersService } from '@/services/users'
import { useAuthStore } from '@/store'
import { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const { isHydrated } = useAuthStore()

  useEffect(() => {
    // 等待认证状态完全恢复后再加载数据
    if (isHydrated) {
      loadUsers()
    }
  }, [pagination.current, pagination.pageSize, isHydrated])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await usersService.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
      })
      setUsers(response.items)
      setPagination({ ...pagination, total: response.total })
    } catch (error) {
      message.error('加载用户列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true)
      await usersService.deleteUser(id)
      message.success('用户删除成功')
      loadUsers()
    } catch (error) {
      message.error('删除用户失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (text: string) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const roleMap: Record<string, { label: string; color: string }> = {
          admin: { label: '超级管理员', color: 'red' },
          manager: { label: '经理', color: 'blue' },
          operator: { label: '操作员', color: 'cyan' },
        }
        const config = roleMap[role] || { label: role, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          active: { label: '启用', color: 'green' },
          inactive: { label: '禁用', color: 'red' },
          banned: { label: '封禁', color: 'volcano' },
        }
        const config = statusMap[status] || { label: status, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
      width: 100,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (text: string) => (text ? new Date(text).toLocaleDateString() : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<EditOutlined />} disabled />
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <Card style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>🔐 Admin 管理员用户</h2>
            <Button icon={<ReloadOutlined />} onClick={() => loadUsers()} loading={loading}>
              刷新
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize })
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
