import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message, Modal, Form, Input, Select, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { usersService } from '@/services/users'
import { useAuthStore } from '@/store'
import { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
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

  const handleOpenCreateModal = () => {
    setEditingUser(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setModalOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (editingUser) {
        // 编辑用户
        await usersService.updateUser(editingUser.id, values)
        message.success('用户更新成功')
      } else {
        // 新增用户
        await usersService.createUser(values)
        message.success('用户创建成功')
      }

      setModalOpen(false)
      form.resetFields()
      loadUsers()
    } catch (error) {
      message.error(editingUser ? '更新用户失败' : '创建用户失败')
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
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
            title="编辑用户"
          />
          <Popconfirm
            title="删除用户"
            description="确定要删除这个用户吗？此操作不可恢复。"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />} title="删除用户" />
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
            <h2 style={{ margin: 0 }}>🔐 Admin 管理员用户</h2>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                新增用户
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => loadUsers()} loading={loading}>
                刷新
              </Button>
            </Space>
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

      {/* 新增/编辑用户 Modal */}
      <Modal
        title={editingUser ? `编辑用户 - ${editingUser.username}` : '新增管理员用户'}
        open={modalOpen}
        onOk={handleSaveUser}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
          setEditingUser(null)
        }}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input placeholder="用户名" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="昵称" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Select.Option value="admin">超级管理员</Select.Option>
              <Select.Option value="manager">经理</Select.Option>
              <Select.Option value="operator">操作员</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
              <Select.Option value="banned">封禁</Select.Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少8个字符' },
              ]}
            >
              <Input.Password placeholder="密码（至少8个字符）" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Layout>
  )
}
