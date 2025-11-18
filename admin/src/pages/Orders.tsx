import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message, Input, Modal, Tabs } from 'antd'
import { ReloadOutlined, EditOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store'
import { ordersService } from '@/services/orders'
import { Order } from '@/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [trackingModalVisible, setTrackingModalVisible] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const { isHydrated } = useAuthStore()

  useEffect(() => {
    if (isHydrated) {
      loadOrders()
    }
  }, [pagination.current, pagination.pageSize, activeStatus, isHydrated])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersService.getOrders({
        page: pagination.current,
        limit: pagination.pageSize,
      })

      // 根据选中的状态过滤订单
      let filteredOrders = response.items
      if (activeStatus !== 'all') {
        filteredOrders = response.items.filter(order => order.status === activeStatus)
      }

      setOrders(filteredOrders)
      setPagination({ ...pagination, total: response.total })
    } catch (error) {
      message.error('加载订单列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }


  const handleEditTracking = (order: Order) => {
    // 只有"已支付"状态的订单才能编辑快递号
    if (order.status !== 'paid') {
      message.warning('只有已支付状态的订单才能填写快递单号')
      return
    }

    setEditingOrder(order)
    setTrackingNumber(order.trackingNumber || '')
    setTrackingModalVisible(true)
  }

  const handleSaveTracking = async () => {
    if (!editingOrder) return

    try {
      setLoading(true)
      await ordersService.updateOrder(editingOrder.id, {
        trackingNumber,
        status: 'shipped'  // 自动更新订单状态为已发货
      })
      message.success('快递单号已更新，订单状态已变为已发货')
      setTrackingModalVisible(false)
      setEditingOrder(null)
      setTrackingNumber('')
      loadOrders()
    } catch (error) {
      message.error('更新快递单号失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTracking = () => {
    setTrackingModalVisible(false)
    setEditingOrder(null)
    setTrackingNumber('')
  }

  const statusColor: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'cyan',
    delivered: 'green',
    cancelled: 'red',
    paid: 'blue',
    refunded: 'magenta',
  }

  const statusTextMap: Record<string, string> = {
    all: '全部',
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
    refunded: '已退款',
  }

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '用户信息',
      key: 'userInfo',
      width: 220,
      render: (_: any, record: Order) => {
        const user = record.user
        return (
          <div>
            {user?.nickname && <div><strong>{user.nickname}</strong></div>}
            {user?.phone && <div style={{ fontSize: 12, color: '#666' }}>{user.phone}</div>}
            {user?.email && <div style={{ fontSize: 12, color: '#666' }}>{user.email}</div>}
            {!user && <span style={{ color: '#999' }}>用户ID: {record.userId}</span>}
          </div>
        )
      },
    },
    {
      title: '总额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (total: number) => `¥${(total / 100).toFixed(2)}`,
    },
    {
      title: '商品数量',
      key: 'itemCount',
      width: 100,
      render: (_: any, record: Order) => {
        return record.items?.length || 0
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <Tag color={statusColor[status]}>{statusTextMap[status] || status}</Tag>,
    },
    {
      title: '快递单号',
      key: 'trackingNumber',
      width: 200,
      render: (_: any, record: Order) => {
        const isPaid = record.status === 'paid'
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ flex: 1, color: record.trackingNumber ? '#000' : '#999' }}>
              {record.trackingNumber || (isPaid ? '未填写' : '-')}
            </span>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditTracking(record)}
              disabled={!isPaid}
              title={isPaid ? '点击编辑快递单号' : '只有已支付订单可编辑'}
            />
          </div>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ]

  const tabItems = [
    { label: '全部', key: 'all' },
    { label: '待支付', key: 'pending' },
    { label: '已支付', key: 'paid' },
    { label: '已发货', key: 'shipped' },
    { label: '已取消', key: 'cancelled' },
  ]

  return (
    <Layout>
      <div className="p-3">
        <Card style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>订单管理</h2>
            <Button icon={<ReloadOutlined />} onClick={() => loadOrders()} loading={loading}>
              刷新
            </Button>
          </div>

          {/* 状态 Tab */}
          <div style={{ marginBottom: 16 }}>
            <Tabs
              activeKey={activeStatus}
              onChange={(key) => {
                setActiveStatus(key)
                setPagination({ ...pagination, current: 1 })
              }}
              items={tabItems}
            />
          </div>

          {/* 提示信息 */}
          <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              💡 快递单号只能在订单状态为"已支付"时填写，填写后订单状态自动更新为"已发货"
            </p>
          </div>

          <Table
            columns={columns}
            dataSource={orders}
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
            scroll={{ x: 1400 }}
          />
        </Card>

        <Modal
          title="编辑快递单号"
          open={trackingModalVisible}
          onOk={handleSaveTracking}
          onCancel={handleCancelTracking}
          confirmLoading={loading}
          okText="保存"
          cancelText="取消"
        >
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>订单ID:</strong> {editingOrder?.id}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>订单状态:</strong> <Tag color="cyan">{statusTextMap[editingOrder?.status || 'shipped']}</Tag>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>快递单号</label>
              <Input
                placeholder="请输入快递单号，如：SF123456789"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                maxLength={100}
              />
              <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                请输入有效的快递单号，用户将在订单详情中看到此信息
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
