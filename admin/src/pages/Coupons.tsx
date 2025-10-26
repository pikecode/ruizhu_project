import { Table, Button, Space, Card, Tag, Input, Row, Col, message, Popconfirm, Modal, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { TABLE_COLUMNS, COUPON_TYPE_MAP, COUPON_STATUS_MAP, COMMON_ACTIONS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/i18n'
import api from '@/services/api'

interface Coupon {
  id: number
  code: string
  type: string
  discount: number
  status: string
  validFrom: string
  validTo: string
  usageCount: number
  maxUsage: number
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // 获取优惠券列表
  const fetchCoupons = async (page = 1, limit = 10) => {
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
      if (typeFilter) {
        params.type = typeFilter
      }

      const response = await api.get('/coupons', { params })
      const data = response.data
      setCoupons(data.data || [])
      setPagination({ ...pagination, total: data.total || 0, current: page })
    } catch (error) {
      console.error('获取优惠券列表失败:', error)
      message.error(ERROR_MESSAGES.loadFailed)
    } finally {
      setLoading(false)
    }
  }

  // 删除优惠券
  const handleDelete = async (couponId: number) => {
    try {
      await api.delete(`/coupons/${couponId}`)
      message.success(SUCCESS_MESSAGES.deleteSuccess)
      fetchCoupons(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('删除优惠券失败:', error)
      message.error(ERROR_MESSAGES.deleteFailed)
    }
  }

  // 刷新列表
  const handleRefresh = () => {
    fetchCoupons(1, pagination.pageSize)
  }

  // 搜索
  const handleSearch = () => {
    fetchCoupons(1, pagination.pageSize)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchText('')
    setStatusFilter('')
    setTypeFilter('')
    fetchCoupons(1, pagination.pageSize)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const columns = [
    {
      title: '优惠券代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{code}</span>,
    },
    {
      title: TABLE_COLUMNS.type,
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeInfo = COUPON_TYPE_MAP[type as keyof typeof COUPON_TYPE_MAP]
        return typeInfo ? <Tag>{typeInfo.label}</Tag> : <Tag>{type}</Tag>
      },
    },
    {
      title: TABLE_COLUMNS.discount,
      dataIndex: 'discount',
      key: 'discount',
      width: 80,
      render: (discount: number, record: Coupon) => {
        if (record.type === 'percentage') {
          return `${discount}%`
        } else if (record.type === 'fixed') {
          return `¥${discount.toFixed(2)}`
        }
        return '免运费'
      },
    },
    {
      title: TABLE_COLUMNS.status,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = COUPON_STATUS_MAP[status as keyof typeof COUPON_STATUS_MAP]
        return statusInfo ? (
          <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
        ) : (
          <Tag>{status}</Tag>
        )
      },
    },
    {
      title: '有效期',
      dataIndex: 'validFrom',
      key: 'validPeriod',
      width: 160,
      render: (_: any, record: Coupon) => {
        const from = new Date(record.validFrom).toLocaleDateString('zh-CN')
        const to = new Date(record.validTo).toLocaleDateString('zh-CN')
        return `${from} ~ ${to}`
      },
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      render: (_: any, record: Coupon) => `${record.usageCount}/${record.maxUsage}`,
    },
    {
      title: TABLE_COLUMNS.actions,
      key: 'actions',
      width: 150,
      render: (_: any, record: Coupon) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              Modal.info({
                title: '编辑优惠券',
                content: `编辑功能开发中... (优惠券ID: ${record.id})`,
              })
            }}
          >
            {COMMON_ACTIONS.edit}
          </Button>
          <Popconfirm
            title="删除优惠券"
            description="确定要删除这个优惠券吗？"
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
          <h1>优惠券列表</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                Modal.info({
                  title: '新增优惠券',
                  content: '新增优惠券功能开发中...',
                })
              }}
            >
              {COMMON_ACTIONS.add}优惠券
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              {COMMON_ACTIONS.refresh}
            </Button>
          </Space>
        </div>

        {/* 搜索和筛选栏 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input.Search
                placeholder="搜索优惠券代码..."
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择优惠券类型"
                style={{ width: '100%' }}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                allowClear
                options={[
                  { label: COUPON_TYPE_MAP.fixed.label, value: 'fixed' },
                  { label: COUPON_TYPE_MAP.percentage.label, value: 'percentage' },
                  { label: COUPON_TYPE_MAP.free_shipping.label, value: 'free_shipping' },
                ]}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择优惠券状态"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                allowClear
                options={[
                  { label: COUPON_STATUS_MAP.active.label, value: 'active' },
                  { label: COUPON_STATUS_MAP.expired.label, value: 'expired' },
                  { label: COUPON_STATUS_MAP.disabled.label, value: 'disabled' },
                ]}
              />
            </Col>
            <Col span={6}>
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
            dataSource={coupons.map((item) => ({ ...item, key: item.id }))}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => fetchCoupons(page, pageSize),
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
