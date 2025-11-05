import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Radio,
  Upload,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Image,
  Tag,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { bannerService } from '../services/banner'

interface Banner {
  id: number
  mainTitle: string
  subtitle?: string
  description?: string
  type: 'image' | 'video'
  imageUrl?: string
  videoUrl?: string
  videoThumbnailUrl?: string
  isActive: boolean
  sortOrder: number
  linkType: 'none' | 'product' | 'category' | 'collection' | 'url'
  linkValue?: string
  createdAt: string
  updatedAt: string
}

interface CreateBannerPayload {
  mainTitle: string
  subtitle?: string
  description?: string
  type?: 'image' | 'video'
  sortOrder?: number
  isActive?: boolean
  linkType?: 'none' | 'product' | 'category' | 'collection' | 'url'
  linkValue?: string
}

export default function CustomBannerManager() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [sortChanged, setSortChanged] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [pagination.current, pagination.pageSize])

  const loadBanners = async () => {
    setLoading(true)
    try {
      const response = await bannerService.getList(pagination.current, pagination.pageSize, 'custom')
      if (response.code === 200) {
        setBanners(response.data.items)
        setPagination({ ...pagination, total: response.data.total })
      } else {
        message.error(response.message || '加载Banner失败')
      }
    } catch (error) {
      message.error('加载Banner失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner)
      form.setFieldsValue({
        mainTitle: banner.mainTitle,
        subtitle: banner.subtitle,
        description: banner.description,
      })
    } else {
      setEditingBanner(null)
      form.resetFields()
    }
    setFormVisible(true)
  }

  const handleCloseModal = () => {
    setFormVisible(false)
    form.resetFields()
    setMediaFile(null)
    setUploadProgress(0)
  }

  const handleSaveBanner = async (values: CreateBannerPayload) => {
    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadStatus('')
      let response
      const bannerId = editingBanner?.id

      // 编辑时：先上传媒体，再保存基本信息
      // 创建时：先保存基本信息获得ID，再上传媒体
      if (bannerId && mediaFile) {
        // 编辑现有Banner：先上传媒体文件
        if (values.type === 'image') {
          setUploadStatus('上传图片中...')
          setUploadProgress(0)
          await bannerService.uploadImage(bannerId, mediaFile, (percent) => {
            setUploadProgress(percent)
          })
        } else if (values.type === 'video') {
          setUploadStatus('上传视频中...')
          setUploadProgress(0)
          await bannerService.uploadVideo(bannerId, mediaFile, (percent) => {
            setUploadProgress(percent)
          })
        }

        // 再更新基本信息 - 编辑时保留原始的 sortOrder、isActive、linkType
        setUploadStatus('保存基本信息中...')
        response = await bannerService.update(bannerId, {
          ...values,
          pageType: 'custom',
          sortOrder: editingBanner.sortOrder,
          isActive: editingBanner.isActive,
          linkType: editingBanner.linkType,
          linkValue: editingBanner.linkValue,
        })
      } else {
        // 创建新Banner或只更新信息：先保存基本信息
        setUploadStatus('保存基本信息中...')
        if (bannerId) {
          response = await bannerService.update(bannerId, {
            ...values,
            pageType: 'custom',
            sortOrder: editingBanner.sortOrder,
            isActive: editingBanner.isActive,
            linkType: editingBanner.linkType,
            linkValue: editingBanner.linkValue,
          })
        } else {
          response = await bannerService.create({ ...values, pageType: 'custom' })
        }

        if (response.code !== 200 && response.code !== 201) {
          message.error(response.message || '保存失败')
          setUploading(false)
          setUploadStatus('')
          return
        }

        const currentBannerId = bannerId || response.data.id

        // 如果有媒体文件，上传
        if (mediaFile) {
          if (values.type === 'image') {
            setUploadStatus('上传图片中...')
            setUploadProgress(0)
            await bannerService.uploadImage(currentBannerId, mediaFile, (percent) => {
              setUploadProgress(percent)
            })
          } else if (values.type === 'video') {
            setUploadStatus('上传视频中...')
            setUploadProgress(0)
            await bannerService.uploadVideo(currentBannerId, mediaFile, (percent) => {
              setUploadProgress(percent)
            })
          }
        }
      }

      if (response && (response.code !== 200 && response.code !== 201)) {
        message.error(response.message || '保存失败')
        setUploading(false)
        setUploadStatus('')
        return
      }

      message.success(editingBanner ? 'Banner更新成功' : 'Banner创建成功')
      handleCloseModal()
      loadBanners()
    } catch (error) {
      message.error('保存Banner失败')
      console.error(error)
    } finally {
      setUploading(false)
      setUploadStatus('')
      setUploadProgress(0)
    }
  }

  const handleDeleteBanner = async (id: number) => {
    try {
      const response = await bannerService.delete(id)

      if (response.code === 200) {
        message.success('Banner删除成功')
        loadBanners()
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      message.error('删除Banner失败')
      console.error(error)
    }
  }

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

    const newBanners = [...banners]
    const draggedItem = newBanners[draggedIndex]
    newBanners.splice(draggedIndex, 1)
    newBanners.splice(targetIndex, 0, draggedItem)
    setBanners(newBanners)
    setSortChanged(true)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSaveSort = async () => {
    try {
      setLoading(true)
      // 逐个更新排序
      for (let i = 0; i < banners.length; i++) {
        await bannerService.update(banners[i].id, { sortOrder: i, pageType: 'custom' })
      }

      message.success('排序保存成功')
      setSortChanged(false)
      await loadBanners()
    } catch (error) {
      message.error('保存排序失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const columns: any = [
    {
      title: '标题',
      dataIndex: 'mainTitle',
      key: 'mainTitle',
      width: 150,
      ellipsis: true,
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
      width: 120,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: 'image' | 'video') =>
        type === 'image' ? (
          <Tag icon={<PictureOutlined />} color="blue">
            图片
          </Tag>
        ) : (
          <Tag icon={<VideoCameraOutlined />} color="orange">
            视频
          </Tag>
        ),
    },
    {
      title: '预览',
      key: 'preview',
      width: 120,
      render: (_: any, record: Banner) => (
        <Space>
          {record.type === 'image' && record.imageUrl && (
            <Image
              src={record.imageUrl}
              width={60}
              height={40}
              style={{ objectFit: 'cover' }}
              preview={{ mask: '预览' }}
            />
          )}
          {record.type === 'video' && record.videoThumbnailUrl && (
            <Image
              src={record.videoThumbnailUrl}
              width={60}
              height={40}
              style={{ objectFit: 'cover' }}
              preview={{
                mask: '预览',
                imageRender: () => (
                  <video
                    src={record.videoUrl}
                    controls
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                ),
              }}
            />
          )}
          {!record.imageUrl && !record.videoThumbnailUrl && <span>暂无</span>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: Banner) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="删除Banner"
            description="确定要删除这个Banner吗?"
            onConfirm={() => handleDeleteBanner(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>私人定制页面Banner管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => loadBanners()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            创建Banner
          </Button>
        </Space>
      </Row>

      <Table
        columns={columns}
        dataSource={banners}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize })
          },
        }}
        scroll={{ x: 1400 }}
        onRow={(record, index) => ({
          draggable: true,
          onDragStart: (e) => handleDragStart(e, index || 0),
          onDragOver: handleDragOver,
          onDrop: (e) => handleDrop(e, index || 0),
          onDragEnd: handleDragEnd,
          style: {
            cursor: 'move',
            background: draggedIndex === index ? '#e6f7ff' : 'transparent',
            transition: 'background 0.2s',
          },
        })}
      />
      {sortChanged && (
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleSaveSort} loading={loading}>
            保存排序
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              setSortChanged(false)
              loadBanners()
            }}
          >
            取消
          </Button>
        </div>
      )}

      <Modal
        title={editingBanner ? '编辑Banner' : '创建Banner'}
        open={formVisible}
        onOk={() => form.submit()}
        onCancel={uploading ? undefined : handleCloseModal}
        width={600}
        okText={editingBanner ? '更新' : '创建'}
        cancelText="取消"
        confirmLoading={uploading}
        okButtonProps={{ loading: uploading, disabled: uploading }}
        cancelButtonProps={{ disabled: uploading }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBanner}
          initialValues={{
            type: 'image',
          }}
        >
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Radio.Group>
              <Radio value="image">
                <PictureOutlined /> 图片
              </Radio>
              <Radio value="video">
                <VideoCameraOutlined /> 视频
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {({ getFieldValue }) => {
              const bannerType = getFieldValue('type')
              return (
                <Form.Item
                  label={bannerType === 'image' ? '图片' : '视频'}
                  extra={bannerType === 'image' ? '支持：JPEG、PNG、WebP' : '支持：MP4、MOV、AVI、MPEG'}
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={(file) => {
                      if (bannerType === 'image') {
                        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                          message.error('仅支持JPEG、PNG、WebP格式')
                          return false
                        }
                      } else {
                        if (
                          ![
                            'video/mp4',
                            'video/quicktime',
                            'video/x-msvideo',
                            'video/mpeg',
                          ].includes(file.type)
                        ) {
                          message.error('仅支持MP4、MOV、AVI、MPEG格式')
                          return false
                        }
                      }
                      setMediaFile(file)
                      return false
                    }}
                    fileList={mediaFile ? [{ uid: '-1', name: mediaFile.name, status: 'done' }] : []}
                  >
                    <Button icon={bannerType === 'image' ? <PictureOutlined /> : <VideoCameraOutlined />}>
                      {mediaFile
                        ? `已选择：${mediaFile.name}`
                        : `选择${bannerType === 'image' ? '图片' : '视频'}`}
                    </Button>
                  </Upload>
                  {uploading && (uploadProgress > 0 || uploadStatus) && (
                    <div style={{ marginTop: 12 }}>
                      {uploadStatus && (
                        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                          {uploadStatus}
                          {uploadProgress > 0 && ` (${uploadProgress}%)`}
                        </div>
                      )}
                      <Progress
                        percent={uploadProgress}
                        size="small"
                        status="active"
                      />
                    </div>
                  )}
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item
            label="大标题"
            name="mainTitle"
            rules={[{ required: true, message: '请输入大标题' }]}
          >
            <Input placeholder="例：夏季促销" />
          </Form.Item>

          <Form.Item label="小标题" name="subtitle">
            <Input placeholder="例：限时优惠" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="例：限时优惠详情" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
