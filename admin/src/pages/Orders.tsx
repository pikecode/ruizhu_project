import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message } from 'antd'
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store'
import { ordersService } from '@/services/orders'
import { Order } from '@/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const { isHydrated } = useAuthStore()

  useEffect(() => {
    // 等待认证状态完全恢复后再加载数据
    if (isHydrated) {
      loadOrders()
    }
  }, [pagination.current, pagination.pageSize, isHydrated])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersService.getOrders({
        page: pagination.current,
        limit: pagination.pageSize,
      })
      setOrders(response.items)
      setPagination({ ...pagination, total: response.total })
    } catch (error) {
      message.error('加载订单列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    try {
      setLoading(true)
      await ordersService.deleteOrder(id)
      message.success('订单删除成功')
      loadOrders()
    } catch (error) {
      message.error('删除订单失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const statusColor: Record<string, string> = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'cyan',
    delivered: 'green',
    cancelled: 'red',
  }

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 150,
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
      dataIndex: ['items', 'length'],
      key: 'itemCount',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<EyeOutlined />} disabled />
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteOrder(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <Card style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>订单</h2>
            <Button icon={<ReloadOutlined />} onClick={() => loadOrders()} loading={loading}>
              刷新
            </Button>
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
            scroll={{ x: 1300 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
