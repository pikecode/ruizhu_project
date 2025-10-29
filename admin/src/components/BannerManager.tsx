import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
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

export default function BannerManager() {
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

  useEffect(() => {
    loadBanners()
  }, [pagination.current, pagination.pageSize])

  const loadBanners = async () => {
    setLoading(true)
    try {
      const response = await bannerService.getList(pagination.current, pagination.pageSize)
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
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
        linkType: banner.linkType,
        linkValue: banner.linkValue,
      })
    } else {
      setEditingBanner(null)
      form.resetFields()
      form.setFieldsValue({
        sortOrder: 0,
        isActive: true,
        linkType: 'none',
      })
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

        // 再更新基本信息
        setUploadStatus('保存基本信息中...')
        response = await bannerService.update(bannerId, values)
      } else {
        // 创建新Banner或只更新信息：先保存基本信息
        setUploadStatus('保存基本信息中...')
        if (bannerId) {
          response = await bannerService.update(bannerId, values)
        } else {
          response = await bannerService.create(values)
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
              preview={{ mask: '预览' }}
            />
          )}
          {!record.imageUrl && !record.videoThumbnailUrl && <span>暂无</span>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">启用</Tag>
        ) : (
          <Tag color="red">禁用</Tag>
        ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      sorter: (a: Banner, b: Banner) => a.sortOrder - b.sortOrder,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_: any, record: Banner) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除Banner"
            description="确定要删除这个Banner吗?"
            onConfirm={() => handleDeleteBanner(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>首页Banner管理</h2>
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
      />

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
            sortOrder: 0,
            isActive: true,
            linkType: 'none',
          }}
        >
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Select.Option value="image">
                <PictureOutlined /> 图片
              </Select.Option>
              <Select.Option value="video">
                <VideoCameraOutlined /> 视频
              </Select.Option>
            </Select>
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

          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} placeholder="排序号越小越靠前" />
          </Form.Item>

          <Form.Item label="状态" name="isActive" valuePropName="checked">
            <Checkbox>启用</Checkbox>
          </Form.Item>

          <Form.Item label="链接类型" name="linkType">
            <Select>
              <Select.Option value="none">无</Select.Option>
              <Select.Option value="product">产品</Select.Option>
              <Select.Option value="category">分类</Select.Option>
              <Select.Option value="collection">专题</Select.Option>
              <Select.Option value="url">自定义URL</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.linkType !== currentValues.linkType}>
            {({ getFieldValue }) =>
              getFieldValue('linkType') !== 'none' ? (
                <Form.Item label="链接值" name="linkValue">
                  <Input
                    placeholder={
                      getFieldValue('linkType') === 'url'
                        ? '例：https://example.com'
                        : '例：123 (ID或标识)'
                    }
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
