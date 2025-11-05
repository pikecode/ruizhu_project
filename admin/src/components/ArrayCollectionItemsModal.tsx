import {
  Modal,
  Drawer,
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
  Card,
  Row,
  Col,
  Divider,
  Badge,
  Empty,
  Tooltip,
  Dropdown,
} from 'antd'
import { DeleteOutlined, PlusOutlined, EditOutlined, UnorderedListOutlined, UploadOutlined, MoreOutlined, EyeOutlined } from '@ant-design/icons'
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [sortChanged, setSortChanged] = useState(false)
  const [uploadedFileList, setUploadedFileList] = useState([])

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
      setSortChanged(false)
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
    // 清除上传文件列表
    setUploadedFileList([])
    setFormVisible(true)
  }

  const handleCloseForm = () => {
    setFormVisible(false)
    setEditingItem(undefined)
    form.resetFields()
    // 清除上传文件列表
    setUploadedFileList([])
  }

  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields()

      // 手动添加 coverImageUrl 字段，因为表单项被隐藏了
      const coverImageUrl = form.getFieldValue('coverImageUrl')
      if (coverImageUrl) {
        values.coverImageUrl = coverImageUrl
      }

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
      // 上传完成后清除文件列表，防止重复显示
      setUploadedFileList([])
    }
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

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      return
    }

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    setItems(newItems)
    setSortChanged(true)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSaveSort = async () => {
    try {
      setLoading(true)
      const sortData = items.map((item, index) => ({
        itemId: item.id,
        sortOrder: index,
      }))
      await arrayCollectionsService.updateItemsSort(collectionId, sortData)
      message.success('排序已保存')
      setSortChanged(false)
    } catch (error) {
      message.error('保存排序失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        title="管理卡片项目"
        open={visible}
        onCancel={onClose}
        width={1000}
        height={800}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
          sortChanged && (
            <Button
              key="save"
              type="primary"
              loading={loading}
              onClick={handleSaveSort}
            >
              保存排序
            </Button>
          ),
        ]}
      >
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Badge count={items.length} style={{ backgroundColor: '#52c41a' }} offset={[-5, 5]}>
              <span style={{ fontSize: '16px', fontWeight: 500 }}>卡片列表</span>
            </Badge>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenForm()}
            >
              新增卡片
            </Button>
          </div>

          {items.length === 0 ? (
            <Empty description="暂无卡片" style={{ marginTop: 50 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: 12,
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: draggedIndex === index ? '#e6f7ff' : 'white',
                    opacity: draggedIndex === index ? 0.6 : 1,
                    cursor: draggedIndex !== null && draggedIndex !== index ? 'grabbing' : 'grab',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* 序号和拖拽指示 */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#666',
                      minWidth: 30,
                      textAlign: 'center',
                      paddingTop: 4,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* 封面图片 */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#999' }}>无图</span>
                    )}
                  </div>

                  {/* 卡片信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Tooltip title={item.title}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                    </Tooltip>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.description || '无描述'}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <Space.Compact style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<UnorderedListOutlined />}
                      onClick={() => handleOpenProductsModal(item.id)}
                    >
                      商品
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenForm(item)}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="删除卡片"
                      description="确定要删除这个卡片项目吗？"
                      okText="确定"
                      cancelText="取消"
                      onConfirm={() => handleDelete(item.id)}
                    >
                      <Button danger size="small" icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space.Compact>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </Modal>

      {/* 创建/编辑卡片表单 Drawer */}
      <Drawer
        title={editingItem ? '编辑卡片' : '新增卡片'}
        onClose={handleCloseForm}
        open={formVisible}
        width={500}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={handleCloseForm}>取消</Button>
            <Button type="primary" onClick={handleSubmitForm}>
              {editingItem ? '更新' : '创建'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="卡片标题"
            name="title"
            rules={[
              { required: true, message: '请输入卡片标题' },
              { max: 100, message: '卡片标题不超过100个字符' },
            ]}
          >
            <Input placeholder="如：新品上市" size="large" />
          </Form.Item>

          <Form.Item
            label="卡片描述"
            name="description"
            rules={[{ max: 500, message: '描述不超过500个字符' }]}
          >
            <Input.TextArea rows={4} placeholder="卡片的详细描述" />
          </Form.Item>

          <Divider>图片设置</Divider>

          <Form.Item label="上传图片">
            <Upload
              maxCount={1}
              fileList={uploadedFileList}
              beforeUpload={(file) => {
                handleImageUpload(file)
                return false
              }}
              onRemove={() => {
                setUploadedFileList([])
              }}
              disabled={uploading}
              accept="image/*"
              listType="picture"
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
                disabled={uploading}
                block
              >
                点击选择图片或拖拽上传
              </Button>
            </Upload>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress percent={uploadProgress} style={{ marginTop: 12 }} />
            )}
          </Form.Item>

          {form.getFieldValue('coverImageUrl') && (
            <Form.Item label="图片预览">
              <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '12px',
                background: '#fafafa',
                textAlign: 'center',
              }}>
                <AntImage
                  src={form.getFieldValue('coverImageUrl')}
                  alt="cover"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                  preview={{
                    mask: '预览',
                  }}
                />
              </div>
            </Form.Item>
          )}
        </Form>
      </Drawer>

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
