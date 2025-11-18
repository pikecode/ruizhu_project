import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message, Popconfirm, Modal, Form, Input } from 'antd'
import { DeleteOutlined, ReloadOutlined, LockOutlined, EditOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store'
import { consumerUsersService, ConsumerUser } from '@/services/consumer-users'

export default function ConsumerUsersPage() {
  const [users, setUsers] = useState<ConsumerUser[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [editingUser, setEditingUser] = useState<ConsumerUser | null>(null)
  const [discountModalOpen, setDiscountModalOpen] = useState(false)
  const [discountForm] = Form.useForm()
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

  const handleEditDiscount = (user: ConsumerUser) => {
    setEditingUser(user)
    discountForm.setFieldsValue({
      discount: user.discount,
    })
    setDiscountModalOpen(true)
  }

  const handleSaveDiscount = async () => {
    try {
      const values = await discountForm.validateFields()
      if (!editingUser) return

      setLoading(true)
      await consumerUsersService.updateDiscount(editingUser.id, values.discount)
      message.success('折扣更新成功')
      setDiscountModalOpen(false)
      loadUsers()
    } catch (error) {
      message.error('更新折扣失败')
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
      title: '姓名',
      key: 'name',
      width: 150,
      render: (_: any, record: ConsumerUser) => {
        // 优先使用会员信息中的姓名
        if (record.membership) {
          const { salutation, lastName, firstName } = record.membership
          return (
            <div>
              <div style={{ fontWeight: 500 }}>{lastName}{firstName}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{salutation}</div>
            </div>
          )
        }
        // 回退到 nickname
        return record.nickname || '-'
      },
    },
    {
      title: '手机号',
      key: 'phone',
      width: 150,
      render: (_: any, record: ConsumerUser) => {
        // 优先使用会员信息中的手机号
        const phone = record.membership?.mobile || record.phone
        return phone || '-'
      },
    },
    {
      title: '邮箱',
      key: 'email',
      width: 180,
      render: (_: any, record: ConsumerUser) => {
        // 优先使用会员信息中的邮箱
        const email = record.membership?.email || record.email
        return email || '-'
      },
    },
    {
      title: '出生日期',
      key: 'birthDate',
      width: 120,
      render: (_: any, record: ConsumerUser) => {
        if (record.membership?.birthDate) {
          return new Date(record.membership.birthDate).toLocaleDateString()
        }
        return '-'
      },
    },
    {
      title: '地区',
      key: 'region',
      width: 180,
      render: (_: any, record: ConsumerUser) => {
        if (record.membership) {
          const { province, city, district } = record.membership
          const parts = [province, city, district].filter(Boolean)
          return parts.length > 0 ? parts.join(' ') : '-'
        }
        // 回退到用户表的地区信息
        const parts = [record.province, record.city].filter(Boolean)
        return parts.length > 0 ? parts.join(' ') : '-'
      },
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
      width: 100,
    },
    {
      title: '折扣倍数',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (discount: number | string) => {
        if (!discount) return '-'
        const discountNum = typeof discount === 'string' ? parseFloat(discount) : discount
        const percentage = (discountNum * 100).toFixed(0)
        return <Tag color="blue">{percentage}折</Tag>
      },
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
      render: (_: any, record: ConsumerUser) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDiscount(record)}
            title="编辑折扣"
          />
          <Popconfirm
            title="禁用用户"
            description="确定要禁用这个用户吗？"
            onConfirm={() => handleBanUser(record.id)}
            okText="禁用"
            cancelText="取消"
          >
            <Button type="primary" danger size="small" icon={<LockOutlined />} title="禁用用户" />
          </Popconfirm>
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
            scroll={{ x: 1600 }}
          />
        </Card>
      </div>

      {/* 编辑折扣 Modal */}
      <Modal
        title={`编辑用户折扣 - ${editingUser?.nickname || editingUser?.phone || `用户${editingUser?.id}`}`}
        open={discountModalOpen}
        onOk={handleSaveDiscount}
        onCancel={() => setDiscountModalOpen(false)}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={discountForm}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="折扣倍数"
            name="discount"
            rules={[
              { required: true, message: '请输入折扣倍数' },
              {
                pattern: /^(0\.\d{2}|[0-9]\d*\.?\d{0,2}|1\.00|1\.0|1)$/,
                message: '请输入0.01-1.0之间的数值，最多两位小数',
              },
              {
                validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve()
                  const num = parseFloat(value)
                  if (num < 0.01 || num > 1.0) {
                    return Promise.reject(new Error('折扣倍数必须在0.01和1.0之间'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input
              type="number"
              placeholder="例如：0.8（表示8折）、0.5（表示5折）"
              min={0.01}
              max={1.0}
              step={0.01}
            />
          </Form.Item>
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              📝 说明：折扣倍数范围从 0.01 到 1.0
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
              • 1.0 = 无折扣（原价）
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
              • 0.9 = 9折（优惠10%）
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
              • 0.5 = 5折（优惠50%）
            </p>
          </div>
        </Form>
      </Modal>
    </Layout>
  )
}
