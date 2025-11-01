import {
  Modal,
  Drawer,
  Table,
  Button,
  Popconfirm,
  message,
  Transfer,
  Spin,
  Card,
  Tabs,
  Empty,
  Space,
  Divider,
  Badge,
  Tooltip,
  Row,
  Col,
  List,
  Tag,
  Checkbox,
  Input,
  Pagination,
} from 'antd'
import { DeleteOutlined, SaveOutlined, ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { arrayCollectionsService } from '@/services/array-collections'
import { productsService } from '@/services/products'
import { ProductListItem, Category } from '@/types'

interface ArrayItemProductsModalProps {
  visible: boolean
  itemId: number
  onClose: () => void
}

export default function ArrayItemProductsModal({
  visible,
  itemId,
  onClose,
}: ArrayItemProductsModalProps) {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [allProducts, setAllProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<(string | number)[]>([])
  const [sortChanged, setSortChanged] = useState(false)
  const [tempProducts, setTempProducts] = useState<ProductListItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchText, setSearchText] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    if (visible) {
      loadItemProducts()
      loadCategories()
    }
  }, [visible, itemId])

  useEffect(() => {
    if (visible) {
      loadAllProducts()
    }
  }, [visible, pagination.current, pagination.pageSize])

  const loadItemProducts = async () => {
    try {
      setLoading(true)
      const itemDetail = await arrayCollectionsService.getItemDetail(itemId)
      const products = itemDetail.products as ProductListItem[]
      setProducts(products)
      setTempProducts(products)
      setSelectedProductIds(products.map((p) => p.id))
    } catch (error) {
      message.error('加载卡片商品失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllProducts = async () => {
    try {
      const data = await productsService.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
      })
      setAllProducts(data.items)
      setPagination((prev) => ({ ...prev, total: data.total }))
    } catch (error) {
      console.error(error)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await productsService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)

      const currentIds = products.map((p) => p.id)
      const newIds = selectedProductIds.map((id) => Number(id))

      const toAdd = newIds.filter((id) => !currentIds.includes(id))
      const toRemove = currentIds.filter((id) => !newIds.includes(id))

      if (toAdd.length > 0) {
        await arrayCollectionsService.addProductsToItem(itemId, toAdd)
      }

      if (toRemove.length > 0) {
        await arrayCollectionsService.removeProductsFromItem(itemId, toRemove)
      }

      const sortData = tempProducts.map((p, index) => ({
        productId: p.id,
        sortOrder: index,
      }))
      await arrayCollectionsService.updateItemProductsSort(itemId, sortData)

      message.success('商品已更新')
      setSortChanged(false)
      await loadItemProducts()
    } catch (error) {
      message.error('更新商品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setTempProducts(products)
    setSelectedProductIds(products.map((p) => p.id))
    setSortChanged(false)
    setSelectedCategory(null)
    setSearchText('')
    setPagination({ current: 1, pageSize: 10, total: 0 })
    onClose()
  }

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize, total: pagination.total })
  }

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setPagination({ current: 1, pageSize: pagination.pageSize, total: pagination.total })
  }

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    setPagination({ current: 1, pageSize: pagination.pageSize, total: pagination.total })
  }

  const getProductsByCategory = (categoryId: number) => {
    return allProducts.filter((p) => p.categoryId === categoryId)
  }

  const getFilteredProducts = () => {
    let filtered = selectedCategory
      ? getProductsByCategory(selectedCategory)
      : allProducts

    if (searchText) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    return filtered
  }

  const toggleProduct = (productId: number) => {
    const newSelectedIds = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId]

    setSelectedProductIds(newSelectedIds)
    const newProducts = newSelectedIds
      .map((id) => allProducts.find((p) => p.id === Number(id)))
      .filter(Boolean) as ProductListItem[]
    setTempProducts(newProducts)
    setSortChanged(true)
  }

  const handleRemoveFromSort = (index: number) => {
    const newProducts = tempProducts.filter((_, i) => i !== index)
    setTempProducts(newProducts)
    setSelectedProductIds(newProducts.map((p) => p.id))
    setSortChanged(true)
  }

  const handleSortMove = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...tempProducts]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newProducts.length) return

    ;[newProducts[index], newProducts[targetIndex]] = [
      newProducts[targetIndex],
      newProducts[index],
    ]
    setTempProducts(newProducts)
    setSortChanged(true)
  }

  // 拖动排序处理
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnProduct = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      return
    }

    const newProducts = [...tempProducts]
    const draggedProduct = newProducts[draggedIndex]

    // 移除被拖动的元素
    newProducts.splice(draggedIndex, 1)
    // 在目标位置插入
    newProducts.splice(targetIndex, 0, draggedProduct)

    setTempProducts(newProducts)
    setSortChanged(true)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const productColumns = [
    {
      title: '排序',
      key: 'sort',
      width: 80,
      render: (_: any, _record: ProductListItem, index: number) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            size="small"
            disabled={index === 0}
            onClick={() => handleSortMove(index, 'up')}
          >
            ↑
          </Button>
          <Button
            size="small"
            disabled={index === tempProducts.length - 1}
            onClick={() => handleSortMove(index, 'down')}
          >
            ↓
          </Button>
        </div>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ProductListItem) => (
        <div>
          <div>{name}</div>
          <small style={{ color: '#999' }}>{record.sku}</small>
        </div>
      ),
    },
    {
      title: '价格',
      key: 'price',
      width: 100,
      render: (_: any, record: ProductListItem) => (
        <div>
          <div>¥{(record.currentPrice / 100).toFixed(2)}</div>
          <small style={{ color: '#999' }}>¥{(record.originalPrice / 100).toFixed(2)}</small>
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, _record: ProductListItem, index: number) => (
        <Popconfirm
          title="移除商品"
          description="确定要从此卡片中移除此商品吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => handleRemoveFromSort(index)}
        >
          <Button type="default" danger size="small" icon={<DeleteOutlined />}>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const filteredProducts = getFilteredProducts()

  return (
    <Drawer
      title="卡片商品管理"
      placement="right"
      onClose={handleCancel}
      open={visible}
      width="90vw"
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveChanges}
            loading={loading}
            disabled={!sortChanged}
          >
            保存更改
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ minHeight: '70vh' }}>
          {/* 左侧：商品选择 */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>商品选择</span>
                  <Badge count={filteredProducts.length} style={{ backgroundColor: '#1890ff' }} />
                </div>
              }
              size="small"
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, overflowY: 'auto' }}
            >
              {/* 搜索和分类筛选 */}
              <div style={{ marginBottom: 12 }}>
                <Input.Search
                  placeholder="搜索商品名称或SKU"
                  allowClear
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ marginBottom: 8 }}
                  prefix={<SearchOutlined />}
                />
                <Space wrap style={{ width: '100%' }}>
                  <Button
                    size="small"
                    type={selectedCategory === null ? 'primary' : 'default'}
                    onClick={() => handleCategoryChange(null)}
                  >
                    全部
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      size="small"
                      type={selectedCategory === cat.id ? 'primary' : 'default'}
                      onClick={() => handleCategoryChange(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </Space>
              </div>

              {filteredProducts.length > 0 ? (
                <>
                  <List
                    dataSource={filteredProducts}
                    renderItem={(product) => (
                      <List.Item
                        key={product.id}
                        style={{
                          padding: '8px 0',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Checkbox
                              checked={selectedProductIds.includes(product.id)}
                              onChange={() => toggleProduct(product.id)}
                            />
                            {/* 商品图片 */}
                            <div
                              style={{
                                width: 60,
                                height: 60,
                                flexShrink: 0,
                                background: '#f0f0f0',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {product.coverImageUrl ? (
                                <img
                                  src={product.coverImageUrl}
                                  alt={product.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '12px', color: '#999' }}>无图</span>
                              )}
                            </div>
                            {/* 商品信息 */}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 500,
                                  fontSize: '13px',
                                  marginBottom: '4px',
                                }}
                              >
                                {product.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                SKU: {product.sku}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ff6b35' }}>
                                ¥{(product.currentPrice / 100).toFixed(2)}
                                {product.originalPrice > product.currentPrice && (
                                  <span style={{ marginLeft: 4, textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                                    ¥{(product.originalPrice / 100).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onChange={handlePaginationChange}
                      showSizeChanger
                      pageSizeOptions={[10, 20, 50]}
                      size="small"
                    />
                  </div>
                </>
              ) : (
                <Empty description="暂无商品" />
              )}
            </Card>
          </Col>

          {/* 右侧：已选商品和排序 */}
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>已选商品</span>
                  <Badge
                    count={tempProducts.length}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  {sortChanged && (
                    <Tag color="red" style={{ marginLeft: 'auto' }}>
                      未保存
                    </Tag>
                  )}
                </div>
              }
              size="small"
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 12px',
              }}
            >
              {tempProducts.length > 0 ? (
                <div style={{ userSelect: 'none' }}>
                  {tempProducts.map((product, index) => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnProduct(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{
                        padding: '8px',
                        marginBottom: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        background: draggedIndex === index ? '#e6f7ff' : 'transparent',
                        opacity: draggedIndex === index ? 0.6 : 1,
                        cursor: draggedIndex !== null && draggedIndex !== index ? 'grabbing' : 'grab',
                        border: draggedIndex === index ? '2px dashed #1890ff' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {/* 排序编号 */}
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#fff',
                            background: '#1890ff',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* 商品图片 */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            background: '#f0f0f0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {product.coverImageUrl ? (
                            <img
                              src={product.coverImageUrl}
                              alt={product.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '10px', color: '#999' }}>无图</span>
                          )}
                        </div>

                        {/* 商品信息 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: '13px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.name}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#999',
                              marginBottom: '2px',
                            }}
                          >
                            {product.sku}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#ff6b35' }}>
                            ¥{(product.currentPrice / 100).toFixed(2)}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <Popconfirm
                          title="移除商品"
                          description="确定要移除此商品吗？"
                          okText="确定"
                          cancelText="取消"
                          onConfirm={() => handleRemoveFromSort(index)}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  description="暂未选择商品"
                  style={{ marginTop: '50%', transform: 'translateY(-50%)' }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </Drawer>
  )
}
