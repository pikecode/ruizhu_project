import { Form, Input, InputNumber, Select, Switch, Button, Modal, Spin, message, Divider, Row, Col } from 'antd'
import { useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import { productsService } from '@/services/products'

interface ProductFormProps {
  visible: boolean
  loading?: boolean
  product?: Product
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  categories: Category[]
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

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        subtitle: product.subtitle,
        sku: product.sku,
        description: product.description,
        categoryId: product.categoryId,
        isNew: product.isNew,
        isSaleOn: product.isSaleOn,
        isOutOfStock: product.isOutOfStock,
        isSoldOut: product.isSoldOut,
        isVipOnly: product.isVipOnly,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        weight: product.weight,
        originalPrice: product.price?.originalPrice ? product.price.originalPrice / 100 : 0,
        currentPrice: product.price?.currentPrice ? product.price.currentPrice / 100 : 0,
        discountRate: product.price?.discountRate || 100,
      })
    } else {
      form.resetFields()
    }
  }, [product, visible, form])

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      // 将价格从元转换为分（乘以 100）
      const payload = {
        ...values,
        price: {
          originalPrice: Math.round((values.originalPrice || 0) * 100),
          currentPrice: Math.round((values.currentPrice || 0) * 100),
          discountRate: values.discountRate || 100,
          currency: 'CNY',
        },
      }
      delete payload.originalPrice
      delete payload.currentPrice
      delete payload.discountRate

      await onSubmit(payload)
      message.success(product ? '产品更新成功' : '产品创建成功')
      form.resetFields()
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
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="产品名称"
                name="name"
                rules={[
                  { required: true, message: '请输入产品名称' },
                  { min: 1, max: 200, message: '产品名称应在 1-200 个字符之间' },
                ]}
              >
                <Input placeholder="例如：高级手表" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="SKU编码"
                name="sku"
                rules={[
                  { required: true, message: '请输入 SKU 编码' },
                  { pattern: /^[A-Z0-9\-]+$/, message: 'SKU 应只包含大写字母、数字和连字符' },
                ]}
              >
                <Input placeholder="例如：PROD-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="副标题"
                name="subtitle"
              >
                <Input placeholder="可选副标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="分类"
                name="categoryId"
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

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="产品描述" />
          </Form.Item>

          <Divider>价格</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="原价 (¥)"
                name="originalPrice"
                rules={[{ required: true, message: '请输入原价' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="现价 (¥)"
                name="currentPrice"
                rules={[{ required: true, message: '请输入现价' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="折扣率 (%)"
                name="discountRate"
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>库存管理</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="库存数量"
                name="stockQuantity"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="低库存警告阈值"
                name="lowStockThreshold"
              >
                <InputNumber
                  min={0}
                  placeholder="10"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="重量 (g)"
            name="weight"
          >
            <InputNumber
              min={0}
              placeholder="0"
            />
          </Form.Item>

          <Divider>产品状态</Divider>

          <Row gutter={[16, 8]}>
            {productStatusOptions.map((status) => (
              <Col xs={24} sm={12} key={status.value}>
                <Form.Item
                  label={status.label}
                  name={status.value}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            ))}
          </Row>

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
