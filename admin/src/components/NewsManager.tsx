import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Image,
  Upload,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { newsService } from '../services/news'

interface News {
  id: number
  title: string
  subtitle?: string | null
  description?: string | null
  coverImageUrl?: string | null
  detailImageUrl?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface CreateNewsPayload {
  title: string
  subtitle?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export default function NewsManager() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [detailImageFile, setDetailImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  useEffect(() => {
    loadNews()
  }, [pagination.current, pagination.pageSize])

  const loadNews = async () => {
    setLoading(true)
    try {
      const response = await newsService.getList(pagination.current, pagination.pageSize)
      if (response.code === 200) {
        setNewsList(response.data.items)
        setPagination({ ...pagination, total: response.data.total })
      } else {
        message.error(response.message || '加载资讯失败')
      }
    } catch (error) {
      message.error('加载资讯失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (news?: News) => {
    if (news) {
      setEditingNews(news)
      form.setFieldsValue({
        title: news.title,
        subtitle: news.subtitle,
        description: news.description,
      })
    } else {
      setEditingNews(null)
      form.resetFields()
    }
    setFormVisible(true)
  }

  const handleCloseModal = () => {
    setFormVisible(false)
    form.resetFields()
    setCoverImageFile(null)
    setDetailImageFile(null)
    setUploadProgress(0)
  }

  const handleSaveNews = async (values: CreateNewsPayload) => {
    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadStatus('')
      let response
      const newsId = editingNews?.id

      // 新增时添加默认值
      if (!newsId) {
        values.sortOrder = 0
        values.isActive = true
      }

      // 编辑时：先上传媒体，再保存基本信息
      // 创建时：先保存基本信息获得ID，再上传媒体
      if (newsId && (coverImageFile || detailImageFile)) {
        // 编辑现有资讯：先上传媒体文件
        if (coverImageFile) {
          setUploadStatus('上传封面图中...')
          setUploadProgress(0)
          await newsService.uploadCoverImage(newsId, coverImageFile, (percent) => {
            setUploadProgress(percent)
          })
        }

        if (detailImageFile) {
          setUploadStatus('上传详情图中...')
          setUploadProgress(0)
          await newsService.uploadDetailImage(newsId, detailImageFile, (percent) => {
            setUploadProgress(percent)
          })
        }

        // 再更新基本信息
        setUploadStatus('保存基本信息中...')
        response = await newsService.update(newsId, values)
      } else {
        // 创建新资讯或只更新信息：先保存基本信息
        setUploadStatus('保存基本信息中...')
        if (newsId) {
          response = await newsService.update(newsId, values)
        } else {
          response = await newsService.create(values)
        }

        if (response.code !== 200 && response.code !== 201) {
          message.error(response.message || '保存失败')
          setUploading(false)
          setUploadStatus('')
          return
        }

        const currentNewsId = newsId || response.data.id

        // 如果有媒体文件，上传
        if (coverImageFile) {
          setUploadStatus('上传封面图中...')
          setUploadProgress(0)
          await newsService.uploadCoverImage(currentNewsId, coverImageFile, (percent) => {
            setUploadProgress(percent)
          })
        }

        if (detailImageFile) {
          setUploadStatus('上传详情图中...')
          setUploadProgress(0)
          await newsService.uploadDetailImage(currentNewsId, detailImageFile, (percent) => {
            setUploadProgress(percent)
          })
        }
      }

      if (response && (response.code !== 200 && response.code !== 201)) {
        message.error(response.message || '保存失败')
        setUploading(false)
        setUploadStatus('')
        return
      }

      message.success(editingNews ? '资讯更新成功' : '资讯创建成功')
      handleCloseModal()
      loadNews()
    } catch (error) {
      message.error('保存资讯失败')
      console.error(error)
    } finally {
      setUploading(false)
      setUploadStatus('')
      setUploadProgress(0)
    }
  }

  const handleDeleteNews = async (id: number) => {
    try {
      const response = await newsService.delete(id)

      if (response.code === 200) {
        message.success('资讯删除成功')
        loadNews()
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      message.error('删除资讯失败')
      console.error(error)
    }
  }

  const columns: any = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '封面图',
      key: 'coverImage',
      width: 120,
      render: (_: any, record: News) => (
        <Space>
          {record.coverImageUrl ? (
            <Image
              src={record.coverImageUrl}
              width={60}
              height={40}
              style={{ objectFit: 'cover' }}
              preview={{ mask: '预览' }}
            />
          ) : (
            <span>暂无</span>
          )}
        </Space>
      ),
    },
    {
      title: '详情图',
      key: 'detailImage',
      width: 120,
      render: (_: any, record: News) => (
        <Space>
          {record.detailImageUrl ? (
            <Image
              src={record.detailImageUrl}
              width={60}
              height={40}
              style={{ objectFit: 'cover' }}
              preview={{ mask: '预览' }}
            />
          ) : (
            <span>暂无</span>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: News) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="删除资讯"
            description="确定要删除这个资讯吗?"
            onConfirm={() => handleDeleteNews(record.id)}
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
        <h2 style={{ margin: 0 }}>资讯管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => loadNews()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            创建资讯
          </Button>
        </Space>
      </Row>

      <Table
        columns={columns}
        dataSource={newsList}
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
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingNews ? '编辑资讯' : '创建资讯'}
        open={formVisible}
        onOk={() => form.submit()}
        onCancel={uploading ? undefined : handleCloseModal}
        width={600}
        okText={editingNews ? '更新' : '创建'}
        cancelText="取消"
        confirmLoading={uploading}
        okButtonProps={{ loading: uploading, disabled: uploading }}
        cancelButtonProps={{ disabled: uploading }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveNews}
          initialValues={{}}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="例：春季新品上市" />
          </Form.Item>

          <Form.Item label="副标题" name="subtitle">
            <Input placeholder="例：优质精选推荐" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="例：资讯描述" rows={3} />
          </Form.Item>

          <Form.Item
            label="封面图"
            extra="支持：JPEG、PNG、WebP"
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                  message.error('仅支持JPEG、PNG、WebP格式')
                  return false
                }
                setCoverImageFile(file)
                return false
              }}
              fileList={coverImageFile ? [{ uid: '-1', name: coverImageFile.name, status: 'done' }] : []}
            >
              <Button icon={<PictureOutlined />}>
                {coverImageFile ? `已选择：${coverImageFile.name}` : '选择封面图'}
              </Button>
            </Upload>
            {uploading && uploadStatus === '上传封面图中...' && uploadProgress > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                  {uploadStatus} ({uploadProgress}%)
                </div>
                <Progress percent={uploadProgress} size="small" status="active" />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="详情图"
            extra="支持：JPEG、PNG、WebP"
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                  message.error('仅支持JPEG、PNG、WebP格式')
                  return false
                }
                setDetailImageFile(file)
                return false
              }}
              fileList={detailImageFile ? [{ uid: '-1', name: detailImageFile.name, status: 'done' }] : []}
            >
              <Button icon={<PictureOutlined />}>
                {detailImageFile ? `已选择：${detailImageFile.name}` : '选择详情图'}
              </Button>
            </Upload>
            {uploading && uploadStatus === '上传详情图中...' && uploadProgress > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                  {uploadStatus} ({uploadProgress}%)
                </div>
                <Progress percent={uploadProgress} size="small" status="active" />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
