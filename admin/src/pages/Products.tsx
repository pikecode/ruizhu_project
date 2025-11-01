import { Table, Button, Space, Card, Input, Select, Popconfirm, message, Row, Col, Image, Modal } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons'
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      console.error('加载分类失败:', error)
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
      message.error('加载产品失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    setSearchKeyword(value)
    setPagination({ ...pagination, current: 1 })
    // 立即重新加载产品
    try {
      setLoading(true)
      const data = await productsService.getProducts({
        page: 1,
        limit: pagination.pageSize,
        keyword: value || undefined,
        categoryId: selectedCategory,
      })
      setProducts(data.items)
      setPagination({ ...pagination, current: 1, total: data.total })
    } catch (error) {
      message.error('搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (categoryId: number | undefined) => {
    setSelectedCategory(categoryId)
    setPagination({ ...pagination, current: 1 })
    // 立即重新加载产品
    try {
      setLoading(true)
      const data = await productsService.getProducts({
        page: 1,
        limit: pagination.pageSize,
        keyword: searchKeyword || undefined,
        categoryId: categoryId,
      })
      setProducts(data.items)
      setPagination({ ...pagination, current: 1, total: data.total })
    } catch (error) {
      message.error('筛选失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setSearchKeyword('')
    setSelectedCategory(undefined)
    setPagination({ ...pagination, current: 1 })
    try {
      setLoading(true)
      const data = await productsService.getProducts({
        page: 1,
        limit: pagination.pageSize,
      })
      setProducts(data.items)
      setPagination({ ...pagination, current: 1, total: data.total })
    } catch (error) {
      message.error('重置失败')
    } finally {
      setLoading(false)
    }
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
      throw new Error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await productsService.deleteProduct(id)
      message.success('产品删除成功')
      await loadProducts()
    } catch (error) {
      message.error('删除产品失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的产品')
      return
    }

    Modal.confirm({
      title: '批量删除产品',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个产品吗？此操作无法撤销。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setDeleteLoading(true)
          const ids = selectedRowKeys as number[]

          // Delete products in parallel
          await Promise.all(
            ids.map((id) => productsService.deleteProduct(id))
          )

          message.success(`成功删除 ${selectedRowKeys.length} 个产品`)
          setSelectedRowKeys([])
          await loadProducts()
        } catch (error) {
          message.error('删除部分产品失败')
        } finally {
          setDeleteLoading(false)
        }
      },
    })
  }

  const handleEditProduct = async (id: number) => {
    try {
      setLoading(true)
      const product = await productsService.getProductById(id)
      handleOpenForm(product)
    } catch (error) {
      message.error('加载产品详情失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '图片',
      dataIndex: 'coverImageUrl',
      key: 'media',
      width: 100,
      render: (coverImageUrl: string | undefined, record: ProductListItem) => {
        if (!coverImageUrl) {
          return (
            <div style={{ color: '#999', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
              <PictureOutlined style={{ fontSize: '16px' }} />
              <div>未添加</div>
            </div>
          )
        }
        const isVideo = coverImageUrl.toLowerCase().endsWith('.mp4') ||
                       coverImageUrl.toLowerCase().endsWith('.webm') ||
                       coverImageUrl.toLowerCase().endsWith('.mov')
        return (
          <div style={{ textAlign: 'center', position: 'relative' }}>
            {isVideo ? (
              <div style={{ fontSize: '20px' }}>
                <VideoCameraOutlined />
              </div>
            ) : (
              <Image
                src={coverImageUrl}
                alt={record.name}
                width={60}
                height={60}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                preview={{
                  mask: '查看',
                }}
              />
            )}
          </div>
        )
      },
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
      width: 80,
      render: (_: any, record: ProductListItem) => {
        const price = (record.currentPrice / 100).toFixed(2)
        return <div style={{ color: '#f5222d', fontWeight: 500 }}>¥{price}</div>
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
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: ProductListItem) => (
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
        {/* Header - 仅显示标题 */}
        <h1 style={{ margin: '0 0 24px 0' }}>产品管理</h1>

        {/* Filters Card - 整合搜索、筛选、添加产品 */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Input.Search
                placeholder="按产品名称搜索"
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="按分类筛选"
                allowClear
                value={selectedCategory}
                onChange={handleCategoryChange}
                style={{ width: '100%' }}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                block
              >
                重置
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenForm()}
                block
              >
                添加产品
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card loading={loading}>
          {/* Table Header - 已选择数量和批量删除 */}
          {selectedRowKeys.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f5f7fa',
                borderRadius: '4px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#666' }}>
                已选择 <strong style={{ color: '#1890ff' }}>{selectedRowKeys.length}</strong> 个产品
              </span>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                loading={deleteLoading}
              >
                批量删除
              </Button>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={products.map((p) => ({ ...p, key: p.id }))}
            rowSelection={{
              selectedRowKeys,
              onChange: (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys),
            }}
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
