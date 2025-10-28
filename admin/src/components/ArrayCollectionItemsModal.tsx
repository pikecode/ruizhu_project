import {
  Modal,
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Form,
  Input,
  Upload,
  Spin,
  Image as AntImage,
  Progress,
} from 'antd'
import { DeleteOutlined, PlusOutlined, EditOutlined, UnorderedListOutlined, UploadOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { arrayCollectionsService } from '@/services/array-collections'
import { mediaService } from '@/services/media'
import ArrayItemProductsModal from '@/components/ArrayItemProductsModal'
import type { RcFile } from 'antd/es/upload'

interface ArrayCollectionItemsModalProps {
  visible: boolean
  collectionId: number
  onClose: () => void
}

interface ArrayCollectionItem {
  id: number
  title: string
  description: string
  coverImageUrl: string
  sortOrder: number
}

export default function ArrayCollectionItemsModal({
  visible,
  collectionId,
  onClose,
}: ArrayCollectionItemsModalProps) {
  const [items, setItems] = useState<ArrayCollectionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<ArrayCollectionItem | undefined>()
  const [form] = Form.useForm()
  const [productsModalVisible, setProductsModalVisible] = useState(false)
  const [currentItemId, setCurrentItemId] = useState<number | undefined>()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (visible) {
      loadItems()
    }
  }, [visible, collectionId])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await arrayCollectionsService.getArrayCollectionDetail(collectionId)
      setItems(data.items || [])
    } catch (error) {
      message.error('加载卡片项目失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (item?: ArrayCollectionItem) => {
    if (item) {
      setEditingItem(item)
      form.setFieldsValue(item)
    } else {
      setEditingItem(undefined)
      form.resetFields()
    }
    setFormVisible(true)
  }

  const handleCloseForm = () => {
    setFormVisible(false)
    setEditingItem(undefined)
    form.resetFields()
  }

  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields()

      if (editingItem) {
        await arrayCollectionsService.updateItem(editingItem.id, values)
        message.success('卡片项目更新成功')
      } else {
        await arrayCollectionsService.createItem(collectionId, values)
        message.success('卡片项目创建成功')
      }

      handleCloseForm()
      await loadItems()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await arrayCollectionsService.deleteItem(id)
      message.success('卡片项目删除成功')
      await loadItems()
    } catch (error) {
      message.error('删除卡片项目失败')
    }
  }

  const handleOpenProductsModal = (itemId: number) => {
    setCurrentItemId(itemId)
    setProductsModalVisible(true)
  }

  const handleImageUpload = async (file: RcFile) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Upload image using mediaService
      const response = await mediaService.uploadMedia(file)

      setUploadProgress(100)

      // Set the coverImageUrl field in the form
      form.setFieldValue('coverImageUrl', response.url)
      message.success('图片上传成功')

      // Clear progress after a short delay
      setTimeout(() => setUploadProgress(0), 500)
    } catch (error) {
      message.error('图片上传失败，请重试')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const columns = [
    {
      title: '卡片标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: '封面图片',
      dataIndex: 'coverImageUrl',
      key: 'coverImageUrl',
      width: 100,
      render: (url: string) =>
        url ? (
          <img src={url} alt="cover" style={{ maxWidth: '80px', maxHeight: '80px' }} />
        ) : (
          <span style={{ color: '#999' }}>无图片</span>
        ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: ArrayCollectionItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => handleOpenProductsModal(record.id)}
          >
            管理商品
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenForm(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除卡片"
            description="确定要删除这个卡片项目吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="default" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Modal
        title="管理卡片项目"
        open={visible}
        onCancel={onClose}
        width={1200}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenForm()}
            >
              新增卡片
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={items}
            loading={loading}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Spin>
      </Modal>

      {/* 创建/编辑卡片表单 */}
      <Modal
        title={editingItem ? '编辑卡片' : '新增卡片'}
        open={formVisible}
        onOk={handleSubmitForm}
        onCancel={handleCloseForm}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="卡片标题"
            name="title"
            rules={[
              { required: true, message: '请输入卡片标题' },
              { max: 100, message: '卡片标题不超过100个字符' },
            ]}
          >
            <Input placeholder="如：新品上市" />
          </Form.Item>

          <Form.Item
            label="卡片描述"
            name="description"
            rules={[{ max: 500, message: '描述不超过500个字符' }]}
          >
            <Input.TextArea rows={3} placeholder="卡片描述" />
          </Form.Item>

          <Form.Item
            label="封面图片URL"
            name="coverImageUrl"
            rules={[
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="或上传图片">
            <div style={{ marginBottom: 16 }}>
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  handleImageUpload(file)
                  return false
                }}
                disabled={uploading}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  disabled={uploading}
                >
                  上传封面图片
                </Button>
              </Upload>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress percent={uploadProgress} />
            )}

            {form.getFieldValue('coverImageUrl') && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: '12px', marginBottom: 8 }}>图片预览:</p>
                <AntImage
                  src={form.getFieldValue('coverImageUrl')}
                  alt="cover"
                  style={{ maxWidth: '200px', maxHeight: '150px' }}
                  preview={{
                    mask: '预览',
                  }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* 商品管理modal */}
      {currentItemId && (
        <ArrayItemProductsModal
          visible={productsModalVisible}
          itemId={currentItemId}
          onClose={() => {
            setProductsModalVisible(false)
            loadItems()
          }}
        />
      )}
    </>
  )
}
