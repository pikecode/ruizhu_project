import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Tag, message, Input, Modal, Tabs, Descriptions, Divider } from 'antd'
import { ReloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store'
import { ordersService } from '@/services/orders'
import { Order } from '@/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [trackingModalVisible, setTrackingModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
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
      await ordersService.updateOrder(String(editingOrder.id), {
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

  const handleViewDetail = async (order: Order) => {
    try {
      setLoading(true)
      // 调用订单详情 API 获取完整数据
      const detailData = await ordersService.getOrderById(String(order.id))
      setDetailOrder(detailData)
      setDetailModalVisible(true)
    } catch (error) {
      message.error('加载订单详情失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseDetail = () => {
    setDetailModalVisible(false)
    setDetailOrder(null)
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
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      render: (_: any, record: Order) => {
        // 使用ID作为订单编号
        return `ORD${String(record.id).padStart(8, '0')}`
      },
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
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Order) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
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
              <strong>订单编号:</strong> {`ORD${String(editingOrder?.id || '').padStart(8, '0')}`}
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

        <Modal
          title="订单详情"
          open={detailModalVisible}
          onCancel={handleCloseDetail}
          width={700}
          footer={[
            <Button key="close" onClick={handleCloseDetail}>
              关闭
            </Button>,
          ]}
        >
          {detailOrder && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* 订单摘要 - 仿小程序风格 */}
              <div style={{ padding: '16px', backgroundColor: '#fff', marginBottom: '12px', borderRadius: '4px' }}>
                {/* 订单编号 */}
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  订单编号: <span style={{ color: '#333', fontWeight: '500' }}>{detailOrder.orderNo || `ORD${String(detailOrder.id).padStart(8, '0')}`}</span>
                </div>
                {/* 订单状态 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
                  <Tag color={statusColor[detailOrder.status]} style={{ fontSize: '12px' }}>
                    {statusTextMap[detailOrder.status] || detailOrder.status}
                  </Tag>
                </div>

                {/* 订单金额 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>订单金额</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f00' }}>
                      ¥{(detailOrder.totalAmount ? detailOrder.totalAmount / 100 : detailOrder.totalPrice || 0).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>下单时间</div>
                    <div style={{ fontSize: '14px' }}>{new Date(detailOrder.createdAt).toLocaleDateString()} {new Date(detailOrder.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>

                {/* 快递单号 */}
                {detailOrder.trackingNumber && (
                  <div style={{ paddingTop: '12px', fontSize: '13px' }}>
                    <span style={{ color: '#999' }}>快递单号：</span>
                    <span style={{ fontWeight: '500' }}>{detailOrder.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* 收货地址 */}
              <div style={{ padding: '16px', backgroundColor: '#fff', marginBottom: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>收货地址</div>
                {detailOrder.shippingAddress && Object.keys(detailOrder.shippingAddress).length > 0 ? (
                  <div>
                    {/* 收货人信息 */}
                    <div style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {detailOrder.receiverName || '-'}
                        <span style={{ marginLeft: '12px', color: '#666', fontWeight: 'normal', fontSize: '12px' }}>
                          {detailOrder.receiverPhone || '-'}
                        </span>
                      </div>
                      {/* 地址信息 */}
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {[
                          detailOrder.shippingAddress.province || detailOrder.shippingAddress.state,
                          detailOrder.shippingAddress.city,
                          detailOrder.shippingAddress.district || detailOrder.shippingAddress.region,
                        ]
                          .filter(Boolean)
                          .join('')}
                        {detailOrder.shippingAddress.addressDetail || detailOrder.shippingAddress.street || detailOrder.shippingAddress.address || ''}
                      </div>
                    </div>

                    {/* 额外信息 */}
                    {(detailOrder.user?.email || detailOrder.shippingAddress.zipCode) && (
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#666' }}>
                        {detailOrder.user?.email && (
                          <div style={{ marginBottom: '6px' }}>
                            <span>邮箱：</span>
                            <span style={{ color: '#333' }}>{detailOrder.user.email}</span>
                          </div>
                        )}
                        {detailOrder.shippingAddress.zipCode && (
                          <div>
                            <span>邮编：</span>
                            <span style={{ color: '#333' }}>{detailOrder.shippingAddress.zipCode || detailOrder.shippingAddress.postalCode || '-'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#999', fontSize: '13px' }}>暂无收货地址信息</div>
                )}
              </div>

              {/* 商品清单 */}
              <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>商品清单</div>

                {detailOrder.items && detailOrder.items.length > 0 ? (
                  <div>
                    {detailOrder.items.map((item, index) => {
                      // 获取图片 URL - 从 product 对象中获取
                      const imageUrl = item.product?.coverImageUrl;

                      return (
                        <div key={`${item.productId}-${index}`} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: index < detailOrder.items!.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {/* 产品图片 */}
                            {imageUrl ? (
                              <div style={{ flex: '0 0 80px', minHeight: '80px' }}>
                                <img
                                  src={imageUrl}
                                  alt={item.productName}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    backgroundColor: '#f5f5f5',
                                  }}
                                  onError={(e) => {
                                    // 图片加载失败时显示占位符
                                    (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{ flex: '0 0 80px', minHeight: '80px', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#999' }}>无图片</span>
                              </div>
                            )}

                            {/* 产品信息 */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              {/* 产品名称和分类 */}
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', lineHeight: '1.4' }}>
                                  {item.productName}
                                </div>
                                {item.selectedAttributes?.categoryName && (
                                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>
                                    分类：{item.selectedAttributes.categoryName}
                                  </div>
                                )}
                                {item.selectedAttributes?.description && (
                                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', lineHeight: '1.3' }}>
                                    {item.selectedAttributes.description.substring(0, 50)}
                                    {item.selectedAttributes.description.length > 50 ? '...' : ''}
                                  </div>
                                )}
                              </div>

                              {/* 数量和价格 */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  数量：<span style={{ color: '#333', fontWeight: '500' }}>{item.quantity}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f00' }}>
                                    ¥{((item.priceSnapshot || item.price) / 100).toFixed(2)}
                                  </div>
                                  {item.selectedAttributes?.productType && (
                                    <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                                      {item.selectedAttributes.productType === 'vip_recharge' ? 'VIP充值' : item.selectedAttributes.productType}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 金额汇总 */}
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span>商品小计</span>
                        <span>¥{(detailOrder.subtotal ? detailOrder.subtotal / 100 : 0).toFixed(2)}</span>
                      </div>

                      {detailOrder.discountAmount && detailOrder.discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#f00' }}>
                          <span>
                            VIP折扣
                            {detailOrder.subtotal && detailOrder.subtotal > 0 && (
                              <span style={{ fontSize: '11px', marginLeft: '4px', color: '#999' }}>
                                ({((detailOrder.discountAmount / detailOrder.subtotal) * 10).toFixed(1)}折)
                              </span>
                            )}
                          </span>
                          <span>-¥{(detailOrder.discountAmount / 100).toFixed(2)}</span>
                        </div>
                      )}

                      {detailOrder.shippingCost && detailOrder.shippingCost > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span>运费</span>
                          <span>¥{(detailOrder.shippingCost / 100).toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f0f0f0', fontSize: '14px', fontWeight: 'bold' }}>
                        <span>应付金额</span>
                        <span style={{ color: '#f00' }}>¥{(detailOrder.totalAmount ? detailOrder.totalAmount / 100 : 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#999', fontSize: '13px' }}>暂无商品信息</div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
