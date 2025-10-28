import { Table, Button, Space, Card, Input, Select, Popconfirm, message, Spin, Row, Col, Statistic } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import ProductForm from '@/components/ProductForm'
import { Product, Category, ProductListItem } from '@/types'
import { productsService } from '@/services/products'

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Load products when filters change
  useEffect(() => {
    loadProducts()
  }, [selectedCategory, pagination.current, pagination.pageSize])

  const loadCategories = async () => {
    try {
      const data = await productsService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productsService.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        keyword: searchKeyword || undefined,
        categoryId: selectedCategory,
      })
      setProducts(data.items)
      setPagination({ ...pagination, total: data.total })
    } catch (error) {
      message.error('Failed to load products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setPagination({ ...pagination, current: 1 })
  }

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
    } else {
      setEditingProduct(undefined)
    }
    setFormVisible(true)
  }

  const handleCloseForm = () => {
    setFormVisible(false)
    setEditingProduct(undefined)
  }

  const handleSubmitForm = async (data: any) => {
    try {
      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, data)
      } else {
        await productsService.createProduct(data)
      }
      await loadProducts()
    } catch (error: any) {
      throw new Error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await productsService.deleteProduct(id)
      message.success('Product deleted successfully')
      await loadProducts()
    } catch (error) {
      message.error('Failed to delete product')
    }
  }

  const handleEditProduct = async (id: number) => {
    try {
      setLoading(true)
      const product = await productsService.getProductById(id)
      handleOpenForm(product)
    } catch (error) {
      message.error('Failed to load product details')
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
      sorter: (a: ProductListItem, b: ProductListItem) => a.id - b.id,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: ProductListItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.subtitle && <div style={{ fontSize: '12px', color: '#999' }}>{record.subtitle}</div>}
        </div>
      ),
    },
    {
      title: 'SKU编码',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120,
      render: (categoryId: number) => {
        const cat = categories.find((c) => c.id === categoryId)
        return cat?.name || '-'
      },
    },
    {
      title: '价格',
      key: 'price',
      width: 100,
      render: (_, record: ProductListItem) => {
        const originalPrice = (record.originalPrice / 100).toFixed(2)
        const currentPrice = (record.currentPrice / 100).toFixed(2)
        return (
          <div>
            <div style={{ color: '#f5222d', fontWeight: 500 }}>¥{currentPrice}</div>
            <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
              ¥{originalPrice}
            </div>
          </div>
        )
      },
    },
    {
      title: '库存',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 80,
      sorter: (a: ProductListItem, b: ProductListItem) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: '销售',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: 80,
      sorter: (a: ProductListItem, b: ProductListItem) => a.salesCount - b.salesCount,
    },
    {
      title: '评分',
      dataIndex: 'averageRating',
      key: 'averageRating',
      width: 80,
      render: (rating: number | string, record: ProductListItem) => {
        const ratingValue = typeof rating === 'string' ? parseFloat(rating) : rating
        return (
          <div>
            <div>{isNaN(ratingValue) ? '-' : ratingValue.toFixed(2)} ⭐</div>
            <div style={{ fontSize: '12px', color: '#999' }}>({record.reviewsCount || 0})</div>
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_, record: ProductListItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record.id)}
            loading={loading}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除产品"
            description="确定要删除此产品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h1 style={{ margin: 0 }}>产品管理</h1>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => handleOpenForm()}>
            添加产品
          </Button>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="按名称或SKU搜索"
                icon={<SearchOutlined />}
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="按分类筛选"
                allowClear
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchKeyword('')
                  setSelectedCategory(undefined)
                  setPagination({ ...pagination, current: 1 })
                  loadProducts()
                }}
                block
              >
                重置
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card loading={loading}>
          <Table
            columns={columns}
            dataSource={products.map((p) => ({ ...p, key: p.id }))}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个产品`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize })
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Form Modal */}
        <ProductForm
          visible={formVisible}
          loading={loading}
          product={editingProduct}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          categories={categories}
        />
      </div>
    </Layout>
  )
}
