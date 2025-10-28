import { Form, Input, InputNumber, Select, Switch, Button, Modal, Spin, message, Divider, Row, Col } from 'antd'
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

const productStatusOptions = [
  { label: '新品', value: 'isNew' },
  { label: '促销中', value: 'isSaleOn' },
  { label: '缺货', value: 'isOutOfStock' },
  { label: '已售罄', value: 'isSoldOut' },
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
    if (product) {
      form.setFieldsValue({
        name: product.name,
        subtitle: product.subtitle,
        description: product.description,
        categoryId: product.categoryId,
        isNew: product.isNew,
        isSaleOn: product.isSaleOn,
        isOutOfStock: product.isOutOfStock,
        isSoldOut: product.isSoldOut,
        isVipOnly: product.isVipOnly,
        price: product.price?.currentPrice ? product.price.currentPrice / 100 : 0,
        stockQuantity: product.stockQuantity || 1,
      })

      // 初始化媒体文件列表
      if (product.images && Array.isArray(product.images)) {
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
      }
    } else {
      form.resetFields()
      setMediaFiles([])
      form.setFieldsValue({ stockQuantity: 1 })
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
      // 将价格从元转换为分（乘以 100）
      const payload = {
        ...values,
        price: {
          originalPrice: Math.round((values.price || 0) * 100),
          currentPrice: Math.round((values.price || 0) * 100),
          discountRate: 100,
          currency: 'CNY',
        },
        // 添加媒体文件信息
        images: mediaFiles.map((file, index) => ({
          imageUrl: file.url,
          imageType: file.type,
          altText: file.altText || '',
          sortOrder: index,
        })),
      }
      delete payload.price // 上面已经处理了price字段

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
    >
      <Spin spinning={loading || submitting}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* 产品基本信息 */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="产品名称"
                name="name"
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

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="副标题"
                name="subtitle">
                <Input placeholder="可选的副标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="价格 (¥)"
                name="price"
                rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="产品描述"
            name="description">
            <Input.TextArea rows={3} placeholder="产品描述" />
          </Form.Item>

          <Divider>库存管理</Divider>

          <Form.Item
            label="库存数量"
            name="stockQuantity"
            rules={[{ required: true, message: '请输入库存数量' }]}>
            <InputNumber
              min={0}
              placeholder="1"
            />
          </Form.Item>

          <Divider>产品状态</Divider>

          <Row gutter={[16, 8]}>
            {productStatusOptions.map((status) => (
              <Col xs={24} sm={12} key={status.value}>
                <Form.Item
                  label={status.label}
                  name={status.value}
                  valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Divider>产品配图或视频</Divider>

          <MediaUploader
            value={mediaFiles}
            onChange={setMediaFiles}
            maxCount={1}
            onUploadToCloud={handleUploadToCloud}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
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
