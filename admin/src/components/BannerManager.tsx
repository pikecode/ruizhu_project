import React, { useState, useEffect } from 'react'
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
  Col,
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
import type { UploadFile } from 'antd'
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
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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
  }

  const handleSaveBanner = async (values: CreateBannerPayload) => {
    try {
      let response
      if (editingBanner) {
        response = await bannerService.update(editingBanner.id, values)
      } else {
        response = await bannerService.create(values)
      }

      if (response.code === 200 || response.code === 201) {
        message.success(editingBanner ? 'Banner更新成功' : 'Banner创建成功')
        handleCloseModal()
        loadBanners()
      } else {
        message.error(response.message || '操作失败')
      }
    } catch (error) {
      message.error('保存Banner失败')
      console.error(error)
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

  const handleUploadImage = async (bannerId: number, file: File) => {
    setUploadingId(bannerId)
    setUploadProgress(0)

    try {
      await bannerService.uploadImage(bannerId, file, (percent) => {
        setUploadProgress(percent)
      })
      message.success('图片上传成功')
      loadBanners()
    } catch (error: any) {
      message.error(error.message || '上传图片失败')
      console.error(error)
    } finally {
      setUploadingId(null)
      setUploadProgress(0)
    }

    return false
  }

  const handleUploadVideo = async (bannerId: number, file: File) => {
    setUploadingId(bannerId)
    setUploadProgress(0)

    try {
      await bannerService.uploadVideo(bannerId, file, (percent) => {
        setUploadProgress(percent)
      })
      message.success('视频上传并转换成功')
      loadBanners()
    } catch (error: any) {
      message.error(error.message || '上传视频失败')
      console.error(error)
    } finally {
      setUploadingId(null)
      setUploadProgress(0)
    }

    return false
  }

  const columns = [
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
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
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

          <Space size="small">
            {record.type === 'image' && (
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    message.error('仅支持JPEG、PNG、WebP格式')
                    return false
                  }
                  handleUploadImage(record.id, file)
                  return false
                }}
                fileList={
                  uploadingId === record.id
                    ? [{ uid: '-1', name: '上传中...', status: 'uploading' }]
                    : []
                }
              >
                <Button
                  type="dashed"
                  size="small"
                  icon={<PictureOutlined />}
                  disabled={uploadingId === record.id}
                >
                  上传图片
                </Button>
              </Upload>
            )}

            {record.type === 'video' && (
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
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
                  handleUploadVideo(record.id, file)
                  return false
                }}
                fileList={
                  uploadingId === record.id
                    ? [{ uid: '-1', name: '上传中...', status: 'uploading' }]
                    : []
                }
              >
                <Button
                  type="dashed"
                  size="small"
                  icon={<VideoCameraOutlined />}
                  disabled={uploadingId === record.id}
                >
                  上传视频
                </Button>
              </Upload>
            )}
          </Space>

          {uploadingId === record.id && (
            <Progress percent={uploadProgress} size="small" status="active" />
          )}
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
        onCancel={handleCloseModal}
        width={600}
        okText={editingBanner ? '更新' : '创建'}
        cancelText="取消"
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
