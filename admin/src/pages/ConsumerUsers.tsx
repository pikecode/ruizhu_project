import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message, Popconfirm } from 'antd'
import { DeleteOutlined, ReloadOutlined, LockOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { consumerUsersService, ConsumerUser } from '@/services/consumer-users'

export default function ConsumerUsersPage() {
  const [users, setUsers] = useState<ConsumerUser[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadUsers()
  }, [pagination.current, pagination.pageSize])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await consumerUsersService.getUsers(pagination.current, pagination.pageSize)
      setUsers(response.items)
      setPagination({ ...pagination, total: response.total })
    } catch (error) {
      message.error('加载消费者用户列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      setLoading(true)
      await consumerUsersService.deleteUser(id)
      message.success('用户删除成功')
      loadUsers()
    } catch (error) {
      message.error('删除用户失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (id: number) => {
    try {
      setLoading(true)
      await consumerUsersService.banUser(id)
      message.success('用户已禁用')
      loadUsers()
    } catch (error) {
      message.error('禁用用户失败')
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
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '微信',
      dataIndex: 'openId',
      key: 'openId',
      width: 180,
      render: (text: string) => (text ? text.substring(0, 20) + '...' : '-'),
    },
    {
      title: '注册来源',
      dataIndex: 'registrationSource',
      key: 'registrationSource',
      width: 120,
      render: (source: string) => {
        const sourceMap: Record<string, { label: string; color: string }> = {
          wechat_mini_program: { label: '微信小程序', color: 'green' },
          web: { label: 'Web', color: 'blue' },
          admin: { label: '管理员创建', color: 'orange' },
        }
        const config = sourceMap[source] || { label: source, color: 'default' }
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
          active: { label: '活跃', color: 'green' },
          banned: { label: '禁用', color: 'red' },
          deleted: { label: '已删除', color: 'default' },
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
      width: 150,
      fixed: 'right',
      render: (_: any, record: ConsumerUser) => (
        <Space size="small">
          <Popconfirm
            title="禁用用户"
            description="确定要禁用这个用户吗？"
            onConfirm={() => handleBanUser(record.id)}
            okText="禁用"
            cancelText="取消"
          >
            <Button type="primary" size="small" icon={<LockOutlined />} />
          </Popconfirm>
          <Popconfirm
            title="删除用户"
            description="确定要删除这个用户吗？此操作不可恢复。"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <Card style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>小程序消费者用户</h2>
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
            scroll={{ x: 1800 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
