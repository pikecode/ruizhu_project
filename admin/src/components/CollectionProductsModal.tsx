import {
  Modal,
  Table,
  Button,
  Popconfirm,
  message,
  Select,
  InputNumber,
  Row,
  Col,
  Spin,
  Card,
} from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
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
  const [newProductIds, setNewProductIds] = useState<number[]>([])
  const [collectionName, setCollectionName] = useState('')
  const [sortChanged, setSortChanged] = useState(false)

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
      setProducts(data.products || [])
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

  const handleAddProducts = async () => {
    if (newProductIds.length === 0) {
      message.warning('请选择要添加的产品')
      return
    }
    try {
      setLoading(true)
      await collectionsService.addProductsToCollection(collectionId, newProductIds)
      message.success(`成功添加 ${newProductIds.length} 个产品`)
      setNewProductIds([])
      await loadCollectionProducts()
    } catch (error) {
      message.error('添加产品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = async (productId: number) => {
    try {
      setLoading(true)
      await collectionsService.removeProductsFromCollection(collectionId, [productId])
      message.success('产品已移除')
      await loadCollectionProducts()
    } catch (error) {
      message.error('移除产品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSort = async () => {
    try {
      setLoading(true)
      const sortData = products.map((p, index) => ({
        productId: p.id,
        sortOrder: index,
      }))
      await collectionsService.updateProductsSort(collectionId, sortData)
      message.success('排序已保存')
      setSortChanged(false)
      await loadCollectionProducts()
    } catch (error) {
      message.error('保存排序失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (index: number, newValue: number) => {
    const newProducts = [...products]
    const item = newProducts[index]
    newProducts.splice(index, 1)
    newProducts.splice(newValue, 0, item)
    setProducts(newProducts)
    setSortChanged(true)
  }

  const availableProducts = allProducts.filter(
    (p) => !products.find((cp) => cp.id === p.id)
  )

  const productColumns = [
    {
      title: '排序',
      key: 'sort',
      width: 80,
      render: (_: any, _record: ProductListItem, index: number) => (
        <InputNumber
          min={0}
          value={index}
          onChange={(val) => handleSortChange(index, val || 0)}
          style={{ width: '60px' }}
        />
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
      render: (_: any, record: ProductListItem) => (
        <Popconfirm
          title="删除产品"
          description="确定要从集合中移除此产品吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => handleRemoveProduct(record.id)}
        >
          <Button type="default" danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Modal
      title={`${collectionName} - 产品管理`}
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        sortChanged && (
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveSort}
            loading={loading}
          >
            保存排序
          </Button>
        ),
      ]}
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 24 }}>
          <Card title="添加产品" size="small">
            <Row gutter={16}>
              <Col flex="auto">
                <Select
                  mode="multiple"
                  placeholder="选择要添加的产品"
                  value={newProductIds}
                  onChange={setNewProductIds}
                  style={{ width: '100%' }}
                  optionLabelProp="label"
                  maxTagCount="responsive"
                >
                  {availableProducts.map((p) => (
                    <Select.Option key={p.id} value={p.id} label={p.name}>
                      <div>{p.name}</div>
                      <small style={{ color: '#999' }}>{p.sku}</small>
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddProducts}
                  disabled={newProductIds.length === 0}
                >
                  添加选中产品
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        <div>
          <Card
            title={`集合产品 (共 ${products.length} 个)`}
            extra={sortChanged && <span style={{ color: '#ff4d4f' }}>有未保存的排序</span>}
            size="small"
          >
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                该集合还没有产品，请添加产品
              </div>
            ) : (
              <Table
                columns={productColumns}
                dataSource={products}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </div>
      </Spin>
    </Modal>
  )
}
