import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message, Badge, Tooltip } from 'antd'
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store'
import { ordersService } from '@/services/orders'
import { Order } from '@/types'
import api from '@/services/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [productCache, setProductCache] = useState<Record<number, { name: string; productType: string }>>({})
  const { isHydrated } = useAuthStore()

  // 获取产品信息
  const getProductInfo = async (productId: number) => {
    if (productCache[productId]) {
      return productCache[productId]
    }
    try {
      const response = await api.get(`/products/${productId}`)
      const productInfo = { name: response.data.name || '未知产品', productType: response.data.productType || 'standard' }
      setProductCache(prev => ({ ...prev, [productId]: productInfo }))
      return productInfo
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error)
      return { name: `产品 #${productId}`, productType: 'standard' }
    }
  }

  // 获取订单的产品列表
  const getOrderProducts = async (productIds: string | undefined) => {
    if (!productIds) return []
    try {
      const ids = productIds.split(';').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
      const products = await Promise.all(ids.map(id => getProductInfo(id)))
      return products
    } catch (error) {
      console.error('Failed to fetch order products:', error)
      return []
    }
  }

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
      dataIndex: ['items', 'length'],
      key: 'itemCount',
      width: 100,
    },
    {
      title: '商品信息',
      key: 'products',
      width: 280,
      render: (_: any, record: Order) => {
        const [products, setProducts] = useState<Array<{ name: string; productType: string }>>([])

        useEffect(() => {
          const loadProducts = async () => {
            const prods = await getOrderProducts(record.productIds)
            setProducts(prods)
          }
          loadProducts()
        }, [record.productIds])

        if (!record.productIds) {
          return <span style={{ color: '#999' }}>无产品信息</span>
        }

        if (products.length === 0) {
          return <span>加载中...</span>
        }

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {products.map((product, index) => (
              <Tooltip key={index} title={product.name}>
                <Tag
                  color={product.productType === 'vip_recharge' ? 'gold' : 'blue'}
                  style={{ cursor: 'pointer', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {product.productType === 'vip_recharge' && <Badge status="success" />}
                  {product.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        )
      },
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
            scroll={{ x: 1600 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
