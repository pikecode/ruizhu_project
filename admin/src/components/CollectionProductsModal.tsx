import {
  Modal,
  Table,
  Button,
  Popconfirm,
  message,
  Spin,
  Card,
  Input,
  Select,
  Empty,
  Space,
  Badge,
  Tag,
} from 'antd'
import { DeleteOutlined, SaveOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { ProductListItem, Category } from '@/types'
import { collectionsService } from '@/services/collections'
import { productsService } from '@/services/products'

interface CollectionProductsModalProps {
  visible: boolean
  collectionId: number
  onClose: () => void
}

export default function CollectionProductsModal({
  visible,
  collectionId,
  onClose,
}: CollectionProductsModalProps) {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [allProducts, setAllProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<(string | number)[]>([])
  const [collectionName, setCollectionName] = useState('')
  const [sortChanged, setSortChanged] = useState(false)
  const [tempProducts, setTempProducts] = useState<ProductListItem[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  useEffect(() => {
    if (visible) {
      loadCollectionProducts()
      loadAllProducts()
      loadCategories()
    }
  }, [visible, collectionId])

  const loadCollectionProducts = async () => {
    try {
      setLoading(true)
      const data = await collectionsService.getCollectionDetail(collectionId)
      setCollectionName(data.name)
      const productList = data.products || []
      setProducts(productList)
      setTempProducts(productList)
      setSelectedProductIds(productList.map((p: ProductListItem) => p.id))
    } catch (error) {
      message.error('加载集合产品失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllProducts = async () => {
    try {
      const data = await productsService.getProducts({
        page: 1,
        limit: 100,
      })
      setAllProducts(data.items)
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

      // 获取新增和移除的产品
      const currentIds = products.map((p) => p.id)
      const newIds = selectedProductIds.map((id) => Number(id))

      const toAdd = newIds.filter((id) => !currentIds.includes(id))
      const toRemove = currentIds.filter((id) => !newIds.includes(id))

      // 执行新增
      if (toAdd.length > 0) {
        await collectionsService.addProductsToCollection(collectionId, toAdd)
      }

      // 执行移除
      if (toRemove.length > 0) {
        await collectionsService.removeProductsFromCollection(collectionId, toRemove)
      }

      // 保存排序
      const sortData = tempProducts.map((p, index) => ({
        productId: p.id,
        sortOrder: index,
      }))
      await collectionsService.updateProductsSort(collectionId, sortData)

      message.success('产品已更新')
      setSortChanged(false)
      await loadCollectionProducts()
    } catch (error) {
      message.error('更新产品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setTempProducts(products)
    setSelectedProductIds(products.map((p) => p.id))
    setSortChanged(false)
    setSearchText('')
    setSelectedCategory(null)
    onClose()
  }

  const handleToggleProduct = (productId: number) => {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    const newSelectedIds = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId]

    setSelectedProductIds(newSelectedIds)

    // 更新 tempProducts
    const newProducts = newSelectedIds
      .map((id) => allProducts.find((p) => p.id === Number(id)))
      .filter(Boolean) as ProductListItem[]

    setTempProducts(newProducts)
    setSortChanged(true)
  }

  const handleRemoveProduct = (productId: number) => {
    const newSelectedIds = selectedProductIds.filter((id) => id !== productId)
    const newProducts = tempProducts.filter((p) => p.id !== productId)

    setSelectedProductIds(newSelectedIds)
    setTempProducts(newProducts)
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

  // 筛选可用产品
  const getAvailableProducts = () => {
    return allProducts.filter((p) => {
      const matchesSearch = !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchText.toLowerCase())

      const matchesCategory = !selectedCategory || p.categoryId === selectedCategory

      return matchesSearch && matchesCategory
    })
  }

  const availableProducts = getAvailableProducts()

  const availableColumns = [
    {
      title: '图片',
      dataIndex: 'coverImageUrl',
      key: 'coverImageUrl',
      width: 70,
      render: (url: string | null | undefined) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {url ? (
            <img
              src={url}
              alt="产品"
              style={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#f0f0f0',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 12,
              }}
            >
              无图
            </div>
          )}
        </div>
      ),
    },
    {
      title: '产品',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name: string, record: ProductListItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <small style={{ color: '#999' }}>SKU: {record.sku}</small>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 90,
      render: (categoryId: number) => {
        const category = categories.find(c => c.id === categoryId)
        return category ? <Tag>{category.name}</Tag> : '-'
      },
    },
    {
      title: '价格',
      key: 'price',
      width: 100,
      render: (_: any, record: ProductListItem) => (
        <div>
          <div>¥{(record.currentPrice / 100).toFixed(2)}</div>
          <small style={{ color: '#999' }}>原价 ¥{(record.originalPrice / 100).toFixed(2)}</small>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 85,
      render: (_: any, record: ProductListItem) => {
        const isSelected = selectedProductIds.includes(record.id)
        return (
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="small"
            onClick={() => handleToggleProduct(record.id)}
          >
            {isSelected ? '移除' : '添加'}
          </Button>
        )
      },
    },
  ]

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropRow = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newProducts = [...tempProducts]
    const [draggedProduct] = newProducts.splice(draggedIndex, 1)
    newProducts.splice(targetIndex, 0, draggedProduct)

    setTempProducts(newProducts)
    setSortChanged(true)
    setDraggedIndex(null)
  }

  const selectedColumns = [
    {
      title: '拖拽',
      key: 'drag',
      width: 50,
      render: () => (
        <MenuOutlined style={{ cursor: 'grab', color: '#999', fontSize: 16 }} />
      ),
    },
    {
      title: '序号',
      key: 'index',
      width: 50,
      render: (_: any, _record: ProductListItem, index: number) => (
        <strong style={{ fontSize: 14 }}>{index + 1}</strong>
      ),
    },
    {
      title: '图片',
      dataIndex: 'coverImageUrl',
      key: 'coverImageUrl',
      width: 70,
      render: (url: string | null | undefined) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {url ? (
            <img
              src={url}
              alt="产品"
              style={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#f0f0f0',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 12,
              }}
            >
              无图
            </div>
          )}
        </div>
      ),
    },
    {
      title: '产品',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (name: string, record: ProductListItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <small style={{ color: '#999' }}>SKU: {record.sku}</small>
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
      title: '操作',
      key: 'action',
      width: 70,
      render: (_: any, record: ProductListItem) => (
        <Popconfirm
          title="移除产品"
          description="确定要从集合中移除此产品吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => handleRemoveProduct(record.id)}
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />}>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Modal
      title={`${collectionName} - 产品管理`}
      open={visible}
      onCancel={handleCancel}
      width="90vw"
      style={{ maxWidth: '90vw' }}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveChanges}
          loading={loading}
          disabled={!sortChanged}
        >
          保存更改
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* 左侧：可用产品 */}
          <div style={{ flex: 1 }}>
            <Card
              title="可用产品"
              size="small"
              style={{ marginBottom: 0 }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input
                  placeholder="搜索产品名称或SKU..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />

                <Select
                  placeholder="按分类筛选"
                  allowClear
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={[
                    { label: '所有分类', value: null },
                    ...categories.map(c => ({ label: c.name, value: c.id }))
                  ]}
                  style={{ width: '100%' }}
                />

                <div style={{ color: '#999', fontSize: 12 }}>
                  找到 {availableProducts.length} 个产品
                </div>

                <Table
                  columns={availableColumns}
                  dataSource={availableProducts}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                  size="small"
                  scroll={{ y: 400 }}
                />
              </Space>
            </Card>
          </div>

          {/* 右侧：已选产品 */}
          <div style={{ flex: 1 }}>
            <Card
              title={`已选产品 (${tempProducts.length})`}
              extra={sortChanged && <Tag color="red">有未保存的更改</Tag>}
              size="small"
              style={{ marginBottom: 0 }}
            >
              {tempProducts.length === 0 ? (
                <Empty
                  description="未选择任何产品"
                  style={{ marginTop: 40, marginBottom: 40 }}
                />
              ) : (
                <Table
                  columns={selectedColumns}
                  dataSource={tempProducts}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 400 }}
                  onRow={(_record, index) => ({
                    draggable: true,
                    onDragStart: () => handleDragStart(index ?? 0),
                    onDragOver: handleDragOver,
                    onDrop: () => handleDropRow(index ?? 0),
                    style: {
                      cursor: draggedIndex === index ? 'grabbing' : 'grab',
                      opacity: draggedIndex === index ? 0.5 : 1,
                    },
                  })}
                />
              )}
            </Card>
          </div>
        </div>
      </Spin>
    </Modal>
  )
}
