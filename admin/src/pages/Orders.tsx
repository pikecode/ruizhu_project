import { Table, Button, Space, Card, Tag, Input, Row, Col, message, Popconfirm, Modal, Select } from 'antd'
import { EyeOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { TABLE_COLUMNS, ORDER_STATUS_MAP, COMMON_ACTIONS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/i18n'
import api from '@/services/api'

interface Order {
  id: number
  userId: number
  user: string
  totalPrice: number
  status: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // 获取订单列表
  const fetchOrders = async (page = 1, limit = 10) => {
    setLoading(true)
    try {
      const params: any = {
        page,
        limit,
      }
      if (searchText) {
        params.search = searchText
      }
      if (statusFilter) {
        params.status = statusFilter
      }

      const response = await api.get('/orders', { params })
      const data = response.data
      setOrders(data.data || [])
      setPagination({ ...pagination, total: data.total || 0, current: page })
    } catch (error) {
      console.error('获取订单列表失败:', error)
      message.error(ERROR_MESSAGES.loadFailed)
    } finally {
      setLoading(false)
    }
  }

  // 删除订单
  const handleDelete = async (orderId: number) => {
    try {
      await api.delete(`/orders/${orderId}`)
      message.success(SUCCESS_MESSAGES.deleteSuccess)
      fetchOrders(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('删除订单失败:', error)
      message.error(ERROR_MESSAGES.deleteFailed)
    }
  }

  // 查看订单详情
  const handleViewDetail = (orderId: number) => {
    Modal.info({
      title: '订单详情',
      content: `查看详情功能开发中... (订单ID: ${orderId})`,
    })
  }

  // 刷新列表
  const handleRefresh = () => {
    fetchOrders(1, pagination.pageSize)
  }

  // 搜索
  const handleSearch = () => {
    fetchOrders(1, pagination.pageSize)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('')
    fetchOrders(1, pagination.pageSize)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120,
    },
    {
      title: TABLE_COLUMNS.total,
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (total: number) => `¥${total.toFixed(2)}`,
    },
    {
      title: TABLE_COLUMNS.status,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusInfo = ORDER_STATUS_MAP[status as keyof typeof ORDER_STATUS_MAP]
        return statusInfo ? (
          <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
        ) : (
          <Tag>{status}</Tag>
        )
      },
    },
    {
      title: TABLE_COLUMNS.created,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: TABLE_COLUMNS.actions,
      key: 'actions',
      width: 150,
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            {COMMON_ACTIONS.view}
          </Button>
          <Popconfirm
            title="删除订单"
            description="确定要删除这个订单吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              {COMMON_ACTIONS.delete}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        {/* 页面标题和操作按钮 */}
        <div className="flex-between mb-4">
          <h1>订单列表</h1>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            {COMMON_ACTIONS.refresh}
          </Button>
        </div>

        {/* 搜索和筛选栏 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input.Search
                placeholder="搜索订单ID或用户..."
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col span={8}>
              <Select
                placeholder="选择订单状态"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                allowClear
                options={[
                  { label: ORDER_STATUS_MAP.pending.label, value: 'pending' },
                  { label: ORDER_STATUS_MAP.confirmed.label, value: 'confirmed' },
                  { label: ORDER_STATUS_MAP.shipped.label, value: 'shipped' },
                  { label: ORDER_STATUS_MAP.delivered.label, value: 'delivered' },
                  { label: ORDER_STATUS_MAP.cancelled.label, value: 'cancelled' },
                  { label: ORDER_STATUS_MAP.refunded.label, value: 'refunded' },
                ]}
              />
            </Col>
            <Col span={8}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={handleSearch}>
                  {COMMON_ACTIONS.search}
                </Button>
                <Button onClick={handleReset}>
                  {COMMON_ACTIONS.reset}
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 表格 */}
        <Card>
          <Table
            columns={columns}
            dataSource={orders.map((item) => ({ ...item, key: item.id }))}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => fetchOrders(page, pageSize),
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
