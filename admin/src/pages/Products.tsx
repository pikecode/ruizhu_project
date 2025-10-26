import { Table, Button, Space, Card, Tag, Input, Row, Col, message, Popconfirm, Modal } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { TABLE_COLUMNS, PRODUCT_STATUS_MAP, COMMON_ACTIONS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/i18n'
import api from '@/services/api'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: string
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // 获取产品列表
  const fetchProducts = async (page = 1, limit = 10) => {
    setLoading(true)
    try {
      const params: any = {
        page,
        limit,
      }
      if (searchText) {
        params.search = searchText
      }

      const response = await api.get('/products', { params })
      const data = response.data
      setProducts(data.data || [])
      setPagination({ ...pagination, total: data.total || 0, current: page })
    } catch (error) {
      console.error('获取产品列表失败:', error)
      message.error(ERROR_MESSAGES.loadFailed)
    } finally {
      setLoading(false)
    }
  }

  // 删除产品
  const handleDelete = async (productId: number) => {
    try {
      await api.delete(`/products/${productId}`)
      message.success(SUCCESS_MESSAGES.deleteSuccess)
      fetchProducts(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('删除产品失败:', error)
      message.error(ERROR_MESSAGES.deleteFailed)
    }
  }

  // 刷新列表
  const handleRefresh = () => {
    fetchProducts(1, pagination.pageSize)
  }

  // 搜索
  const handleSearch = () => {
    fetchProducts(1, pagination.pageSize)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchText('')
    fetchProducts(1, pagination.pageSize)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: TABLE_COLUMNS.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: TABLE_COLUMNS.category,
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: TABLE_COLUMNS.price,
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: TABLE_COLUMNS.stock,
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
    },
    {
      title: TABLE_COLUMNS.status,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = PRODUCT_STATUS_MAP[status as keyof typeof PRODUCT_STATUS_MAP]
        return statusInfo ? (
          <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
        ) : (
          <Tag>{status}</Tag>
        )
      },
    },
    {
      title: TABLE_COLUMNS.actions,
      key: 'actions',
      width: 150,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              Modal.info({
                title: '编辑产品',
                content: `编辑功能开发中... (ID: ${record.id})`,
              })
            }}
          >
            {COMMON_ACTIONS.edit}
          </Button>
          <Popconfirm
            title="删除产品"
            description="确定要删除这个产品吗？"
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
          <h1>产品列表</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                Modal.info({
                  title: '新增产品',
                  content: '新增产品功能开发中...',
                })
              }}
            >
              {COMMON_ACTIONS.add}产品
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              {COMMON_ACTIONS.refresh}
            </Button>
          </Space>
        </div>

        {/* 搜索栏 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Input.Search
                placeholder="搜索产品名称..."
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Space>
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
            dataSource={products.map((item) => ({ ...item, key: item.id }))}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => fetchProducts(page, pageSize),
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </Layout>
  )
}
