import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Modal,
  Spin,
  message,
  Divider,
  Row,
  Col,
  Radio,
  Checkbox,
} from 'antd'
import { useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import CoverImageManager from './CoverImageManager'
import ProductImagesManager from './ProductImagesManager'

interface ProductFormProps {
  visible: boolean
  loading?: boolean
  product?: Product
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  categories: Category[]
  defaultProductType?: 'standard' | 'custom' | 'vip_recharge'
}

interface MediaFile {
  id?: number
  url: string
  type: 'image' | 'video'
  size: number
  name: string
  uploadProgress?: number
  altText?: string
  sortOrder?: number
  isNew?: boolean
}

// 库存状态选项（单选）
const stockStatusOptions = [
  { label: '正常供应', value: 'normal' },
  { label: '缺货', value: 'outOfStock' },
  { label: '已售罄', value: 'soldOut' },
]

// 商品标签选项（多选）
const productTagOptions = [
  { label: '新品', value: 'isNew' },
  { label: '促销中', value: 'isSaleOn' },
  { label: 'VIP专享', value: 'isVipOnly' },
]

// 产品类型选项
const productTypeOptions = [
  { label: '标准产品', value: 'standard' },
  { label: '私人定制专属', value: 'custom' },
  { label: '会员充值产品', value: 'vip_recharge' },
]

export default function ProductForm({
  visible,
  loading = false,
  product,
  onClose,
  onSubmit,
  categories,
  defaultProductType = 'standard',
}: ProductFormProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>()
  const [detailImages, setDetailImages] = useState<MediaFile[]>([])

  useEffect(() => {
    if (visible && product) {
      // 根据 isOutOfStock 和 isSoldOut 转换为 stockStatus
      let stockStatus = 'normal'
      if (product.isSoldOut) {
        stockStatus = 'soldOut'
      } else if (product.isOutOfStock) {
        stockStatus = 'outOfStock'
      }

      // 整理商品标签
      const tags: string[] = []
      if (product.isNew) tags.push('isNew')
      if (product.isSaleOn) tags.push('isSaleOn')
      if (product.isVipOnly) tags.push('isVipOnly')

      form.setFieldsValue({
        name: product.name,
        subtitle: product.subtitle,
        description: product.description,
        categoryId: product.categoryId,
        productType: (product as any).productType || 'standard',
        stockStatus: stockStatus,
        productTags: tags,
        price: product.price?.currentPrice ? product.price.currentPrice / 100 : 0,
        stockQuantity: product.stockQuantity || 1,
      })

      // 初始化封面图和详情图
      // 设置 coverImageUrl
      if (product.coverImageUrl) {
        setCoverImageUrl(product.coverImageUrl)
      } else {
        setCoverImageUrl(undefined)
      }

      // 从 images 数组中提取详情图
      const detailImagesList: MediaFile[] = []
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const imageFiles = product.images.map((img: any) => ({
          id: img.id,
          url: img.imageUrl,
          type: 'image' as const,
          size: img.fileSize || 0,
          name: img.imageUrl.split('/').pop() || 'image',
          altText: img.altText,
          sortOrder: img.sortOrder,
          isNew: false,
        }))
        detailImagesList.push(...imageFiles)
      }
      setDetailImages(detailImagesList)
    } else if (visible && !product) {
      form.resetFields()
      setCoverImageUrl(undefined)
      setDetailImages([])
      form.setFieldsValue({ stockQuantity: 1, stockStatus: 'normal', productTags: [], productType: defaultProductType })
    }
  }, [product, visible, form, defaultProductType])

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      const { price, stockStatus, productTags, ...otherValues } = values

      // 验证封面图
      if (!coverImageUrl) {
        message.error('请上传产品封面')
        return
      }

      // 将 stockStatus 转换为 isOutOfStock 和 isSoldOut
      let isOutOfStock = false
      let isSoldOut = false
      if (stockStatus === 'outOfStock') {
        isOutOfStock = true
      } else if (stockStatus === 'soldOut') {
        isSoldOut = true
      }

      // 将 productTags 数组转换为各个标签字段
      const isNew = productTags?.includes('isNew') || false
      const isSaleOn = productTags?.includes('isSaleOn') || false
      const isVipOnly = productTags?.includes('isVipOnly') || false

      const payload = {
        ...otherValues,
        isOutOfStock,
        isSoldOut,
        isNew,
        isSaleOn,
        isVipOnly,
        price: {
          originalPrice: Math.round((price || 0) * 100),
          currentPrice: Math.round((price || 0) * 100),
          discountRate: 100,
          currency: 'CNY',
        },
        // 设置封面图
        coverImageUrl: coverImageUrl,
        // 传递详情图片信息（供后续处理）
        otherImages: detailImages.map((img, index) => ({
          imageUrl: img.url,
          imageType: 'detail',
          altText: img.altText || '',
          sortOrder: index,
          id: img.id, // 如果是已存在的图片，保留 id
        })),
      }

      await onSubmit(payload)
      message.success(product ? '产品更新成功' : '产品创建成功')
      form.resetFields()
      setCoverImageUrl(undefined)
      setDetailImages([])
      onClose()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={product ? '编辑产品' : '添加产品'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      bodyStyle={{ padding: '16px' }}
    >
      <Spin spinning={loading || submitting}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginBottom: 0 }}>
          {/* 产品配图 - 分离为封面图和详情图 */}
          <Divider style={{ marginBottom: '12px', marginTop: 0 }}>产品配图</Divider>

          {/* 产品封面管理 */}
          <CoverImageManager
            coverUrl={coverImageUrl}
            onChange={setCoverImageUrl}
            onDelete={() => setCoverImageUrl(undefined)}
            loading={loading}
          />

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }} />

          {/* 产品详情图管理 */}
          <ProductImagesManager
            images={detailImages}
            onAdd={(newImages) => {
              setDetailImages([...detailImages, ...newImages])
            }}
            onDelete={(index) => {
              setDetailImages(detailImages.filter((_, i) => i !== index))
            }}
            onSort={(sortedImages) => {
              setDetailImages(sortedImages)
            }}
            loading={loading}
          />

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }}>产品基本信息</Divider>

          {/* 产品基本信息 */}
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="产品名称"
                name="name"
                style={{ marginBottom: '8px' }}
                rules={[
                  { required: true, message: '请输入产品名称' },
                  { min: 1, max: 200, message: '产品名称应在 1-200 个字符之间' },
                ]}
              >
                <Input placeholder="例如：iPhone 15 Pro" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="分类"
                name="categoryId"
                style={{ marginBottom: '8px' }}
                rules={[{ required: true, message: '请选择一个分类' }]}
              >
                <Select placeholder="选择分类">
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="产品类型"
                name="productType"
                style={{ marginBottom: '8px' }}
                rules={[{ required: true, message: '请选择产品类型' }]}
              >
                <Select placeholder="选择产品类型">
                  {productTypeOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="副标题" name="subtitle" style={{ marginBottom: '8px' }}>
                <Input placeholder="可选的副标题" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="价格 (¥)"
                name="price"
                style={{ marginBottom: '8px' }}
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="VIP 折扣倍数（仅限充值产品）"
                name="discount"
                style={{ marginBottom: '8px' }}
                tooltip="如：0.8 = 8折，0.9 = 9折。只对产品类型为'VIP充值'的产品生效"
              >
                <InputNumber
                  min={0.01}
                  max={1}
                  step={0.01}
                  precision={2}
                  placeholder="0.80"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="产品描述" name="description" style={{ marginBottom: '8px' }}>
            <Input.TextArea rows={2} placeholder="产品描述" />
          </Form.Item>

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }}>库存管理</Divider>

          <Form.Item
            label="库存数量"
            name="stockQuantity"
            style={{ marginBottom: '8px' }}
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber
              min={0}
              placeholder="1"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }}>库存状态</Divider>

          <Form.Item
            label="库存状态"
            name="stockStatus"
            style={{ marginBottom: '12px' }}
            rules={[{ required: true, message: '请选择库存状态' }]}
          >
            <Radio.Group options={stockStatusOptions} />
          </Form.Item>

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }}>商品标签</Divider>

          <Form.Item label="商品标签" name="productTags" style={{ marginBottom: '8px' }}>
            <Checkbox.Group options={productTagOptions} />
          </Form.Item>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {product ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  )
}
