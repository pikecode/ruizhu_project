import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  message,
  Tabs,
  Statistic,
  Row,
  Col,
  Empty,
  Tooltip,
  Tag,
} from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  getFilesList,
  deleteFile,
  getDownloadUrl,
  getFileStats,
  FileInfo,
  FileStatsResponse,
} from '@/services/files'
import UploadFileComponent from '@/components/UploadFile'
import styles from './FileManager.module.scss'

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [stats, setStats] = useState<FileStatsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 })
  const [total, setTotal] = useState(0)

  // 加载文件列表
  const loadFiles = async (page = 1, pageSize = 20) => {
    setLoading(true)
    try {
      const offset = (page - 1) * pageSize
      const result = await getFilesList(pageSize, offset)
      setFiles(result.data)
      setTotal(result.total)
      setPagination({ current: page, pageSize })
    } catch (error: any) {
      message.error(`加载文件失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    try {
      const result = await getFileStats()
      setStats(result)
    } catch (error: any) {
      message.error(`加载统计信息失败: ${error.message}`)
    }
  }

  useEffect(() => {
    loadFiles()
    loadStats()
  }, [])

  // 删除文件
  const handleDelete = (id: number, fileName: string) => {
    Modal.confirm({
      title: '删除文件',
      content: `确认删除文件 "${fileName}" 吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteFile(id)
          message.success('文件删除成功')
          loadFiles(pagination.current, pagination.pageSize)
          loadStats()
        } catch (error: any) {
          message.error(`删除失败: ${error.message}`)
        }
      },
    })
  }

  // 下载文件
  const handleDownload = async (id: number, fileName: string) => {
    try {
      const result = await getDownloadUrl(id)
      const a = document.createElement('a')
      a.href = result.url
      a.download = fileName
      a.click()
      message.success('下载开始')
    } catch (error: any) {
      message.error(`获取下载链接失败: ${error.message}`)
    }
  }

  // 预览文件
  const handlePreview = (url: string) => {
    window.open(url, '_blank')
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.length > 30 ? text.substring(0, 30) + '...' : text}</span>
        </Tooltip>
      ),
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 100,
      render: (type: string) => <Tag color="blue">{type || 'unknown'}</Tag>,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: FileInfo) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.url)}
            title="预览"
          />
          <Button
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id, record.originalName)}
            title="下载"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.originalName)}
            title="删除"
          />
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.fileManager}>
      <Card title="文件管理" className={styles.card}>
        <Tabs
          items={[
            {
              key: 'files',
              label: '文件列表',
              children: (
                <>
                  <Card title="上传文件" style={{ marginBottom: '24px' }}>
                    <UploadFileComponent
                      onSuccess={() => {
                        loadFiles(1)
                        loadStats()
                      }}
                    />
                  </Card>

                  <Card title="所有文件">
                    {files.length === 0 ? (
                      <Empty description="暂无文件" />
                    ) : (
                      <Table
                        columns={columns}
                        dataSource={files.map((file) => ({
                          ...file,
                          key: file.id,
                        }))}
                        loading={loading}
                        pagination={{
                          ...pagination,
                          total,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                        onChange={(pag) => {
                          loadFiles(pag.current || 1, pag.pageSize || 20)
                        }}
                      />
                    )}
                  </Card>
                </>
              ),
            },
            {
              key: 'stats',
              label: '统计信息',
              children: stats ? (
                <div>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="总文件数"
                          value={stats.total}
                          prefix="📄"
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="总存储大小"
                          value={formatFileSize(stats.totalSize)}
                          prefix="💾"
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="文件类型数"
                          value={stats.byType.length}
                          prefix="🏷️"
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Card title="按类型统计" style={{ marginTop: '24px' }}>
                    {stats.byType.length === 0 ? (
                      <Empty description="暂无数据" />
                    ) : (
                      <Table
                        columns={[
                          {
                            title: '文件类型',
                            dataIndex: 'type',
                            key: 'type',
                          },
                          {
                            title: '数量',
                            dataIndex: 'count',
                            key: 'count',
                          },
                        ]}
                        dataSource={stats.byType.map((item, index) => ({
                          ...item,
                          key: index,
                        }))}
                        pagination={false}
                      />
                    )}
                  </Card>
                </div>
              ) : (
                <Empty description="暂无数据" />
              ),
            },
          ]}
          tabBarExtraContent={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadFiles(pagination.current, pagination.pageSize)
                loadStats()
              }}
            >
              刷新
            </Button>
          }
        />
      </Card>
    </div>
  )
}

export default FileManager
