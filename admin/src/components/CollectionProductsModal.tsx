import {
  Modal,
  Table,
  Button,
  Popconfirm,
  message,
  Transfer,
  Spin,
  Card,
  Select,
} from 'antd'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { ProductListItem } from '@/types'
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
  const [loading, setLoading] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<(string | number)[]>([])
  const [collectionName, setCollectionName] = useState('')
  const [sortChanged, setSortChanged] = useState(false)
  const [tempProducts, setTempProducts] = useState<ProductListItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  useEffect(() => {
    if (visible) {
      loadCollectionProducts()
      loadAllProducts()
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
      setSelectedProductIds(productList.map((p) => p.id))
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
    setSelectedCategory(null)
    onClose()
  }

  // 获取所有分类
  const getCategories = () => {
    const categoryMap = new Map<number, string>()
    allProducts.forEach((p) => {
      if (p.categoryId && p.categoryName) {
        categoryMap.set(p.categoryId, p.categoryName)
      }
    })
    return Array.from(categoryMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  // 根据选中的分类过滤产品
  const getFilteredProducts = () => {
    if (!selectedCategory) {
      return allProducts
    }
    return allProducts.filter((p) => p.categoryId === selectedCategory)
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
      title: '产品名称',
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
          title="移除产品"
          description="确定要从排序列表中移除此产品吗？"
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

  return (
    <Modal
      title={`${collectionName} - 产品管理`}
      open={visible}
      onCancel={handleCancel}
      width={1400}
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
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="按分类过滤产品"
            allowClear
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: '200px' }}
            options={[
              { label: '全部分类', value: null },
              ...getCategories().map((cat) => ({
                label: cat.name,
                value: cat.id,
              })),
            ]}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <Transfer
            dataSource={getFilteredProducts().map((p) => ({
              key: `${p.id}`,
              title: p.name,
              description: `${p.sku} | ¥${(p.currentPrice / 100).toFixed(2)}`,
            }))}
            titles={['可用产品', '已选产品']}
            targetKeys={selectedProductIds.map((id) => `${id}`)}
            onChange={(newKeys) => {
              setSelectedProductIds(newKeys.map((k) => Number(k)))
              const newProducts = newKeys
                .map((key) =>
                  allProducts.find((p) => p.id === Number(key))
                )
                .filter(Boolean) as ProductListItem[]
              setTempProducts(newProducts)
              setSortChanged(true)
            }}
            listStyle={{ height: 400, width: '45%' }}
            render={(item: any) => (
              <div>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <small style={{ color: '#999' }}>{item.description}</small>
              </div>
            )}
            operations={['添加', '移除']}
            locale={{
              itemUnit: '项',
              itemsUnit: '项',
            }}
          />
        </div>

        {tempProducts.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Card
              title={`排序 (共 ${tempProducts.length} 个已选产品)`}
              extra={sortChanged && <span style={{ color: '#ff4d4f' }}>有未保存的更改</span>}
              size="small"
            >
              <Table
                columns={productColumns}
                dataSource={tempProducts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  )
}
