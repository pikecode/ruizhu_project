import { Form, Input, InputNumber, Select, Button, Modal, Spin, message, Divider, Row, Col, Radio, Checkbox } from 'antd'
import { useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import MediaUploader from './MediaUploader'
import { mediaService } from '@/services/media'

interface ProductFormProps {
  visible: boolean
  loading?: boolean
  product?: Product
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  categories: Category[]
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

export default function ProductForm({
  visible,
  loading = false,
  product,
  onClose,
  onSubmit,
  categories,
}: ProductFormProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

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
        stockStatus: stockStatus,
        productTags: tags,
        price: product.price?.currentPrice ? product.price.currentPrice / 100 : 0,
        stockQuantity: product.stockQuantity || 1,
      })

      // 初始化媒体文件列表
      // 优先使用 images 数组，如果没有则尝试使用 coverImageUrl
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const files: MediaFile[] = product.images.map((img: any) => ({
          id: img.id,
          url: img.imageUrl,
          type: img.imageType || 'image',
          size: 0,
          name: img.imageUrl.split('/').pop() || 'image',
          altText: img.altText,
          sortOrder: img.sortOrder,
        }))
        setMediaFiles(files)
      } else if ((product as any).coverImageUrl) {
        // 如果没有 images 数组但有 coverImageUrl，使用它
        const coverUrl = (product as any).coverImageUrl as string
        const files: MediaFile[] = [
          {
            url: coverUrl,
            type: 'image',
            size: 0,
            name: coverUrl.split('/').pop() || 'image',
            altText: '',
            sortOrder: 0,
          },
        ]
        setMediaFiles(files)
      } else {
        setMediaFiles([])
      }
    } else if (visible && !product) {
      form.resetFields()
      setMediaFiles([])
      form.setFieldsValue({ stockQuantity: 1, stockStatus: 'normal', productTags: [] })
    }
  }, [product, visible, form])

  // Wrapper function to upload media and return just the URL
  const handleUploadToCloud = async (file: File): Promise<string> => {
    const response = await mediaService.uploadMedia(file)
    return response.url
  }

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      const { price, stockStatus, productTags, ...otherValues } = values

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
        // 当前阶段只支持单张图片维护，使用 coverImageUrl
        // 如果有上传图片，使用第一张（mediaFiles maxCount=1）
        ...(mediaFiles.length > 0 && { coverImageUrl: mediaFiles[0].url }),
      }

      await onSubmit(payload)
      message.success(product ? '产品更新成功' : '产品创建成功')
      form.resetFields()
      setMediaFiles([])
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
      width={800}
      bodyStyle={{ padding: '16px' }}
    >
      <Spin spinning={loading || submitting}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginBottom: 0 }}
        >
          {/* 产品配图 - 放在最上面 */}
          <Divider style={{ marginBottom: '12px', marginTop: 0 }}>产品配图</Divider>

          <MediaUploader
            value={mediaFiles}
            onChange={setMediaFiles}
            maxCount={1}
            onUploadToCloud={handleUploadToCloud}
            compact={true}
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
                ]}>
                <Input placeholder="例如：iPhone 15 Pro" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="分类"
                name="categoryId"
                style={{ marginBottom: '8px' }}
                rules={[{ required: true, message: '请选择一个分类' }]}>
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
                label="副标题"
                name="subtitle"
                style={{ marginBottom: '8px' }}>
                <Input placeholder="可选的副标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="价格 (¥)"
                name="price"
                style={{ marginBottom: '8px' }}
                rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="产品描述"
            name="description"
            style={{ marginBottom: '8px' }}>
            <Input.TextArea rows={2} placeholder="产品描述" />
          </Form.Item>

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }}>库存管理</Divider>

          <Form.Item
            label="库存数量"
            name="stockQuantity"
            style={{ marginBottom: '8px' }}
            rules={[{ required: true, message: '请输入库存数量' }]}>
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
            rules={[{ required: true, message: '请选择库存状态' }]}>
            <Radio.Group options={stockStatusOptions} />
          </Form.Item>

          <Divider style={{ marginTop: '12px', marginBottom: '12px' }}>商品标签</Divider>

          <Form.Item
            label="商品标签"
            name="productTags"
            style={{ marginBottom: '8px' }}>
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
