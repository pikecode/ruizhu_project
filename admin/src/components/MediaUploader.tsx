import { useState, useCallback } from 'react'
import {
  Upload,
  Button,
  Space,
  Progress,
  Empty,
  Card,
  Row,
  Col,
  Image,
  Tag,
  Popconfirm,
  message,
  Spin,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import type { RcFile } from 'antd/es/upload'
import styles from './MediaUploader.module.scss'

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

interface MediaUploaderProps {
  value?: MediaFile[]
  onChange?: (files: MediaFile[]) => void
  maxCount?: number
  multiple?: boolean
  maxSize?: number // MB
  onUploadToCloud?: (file: File) => Promise<string> // 上传到腾讯云COS的函数
}

export default function MediaUploader({
  value = [],
  onChange,
  maxCount = 1,
  multiple = false,
  maxSize = 500, // 默认500MB
  onUploadToCloud,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // 验证文件类型和大小
  const validateFile = (file: RcFile): boolean => {
    const isValidType = file.type.startsWith('image/')

    const isValidSize = file.size / 1024 / 1024 < maxSize

    if (!isValidType) {
      message.error(`仅支持图片文件`)
      return false
    }

    if (!isValidSize) {
      message.error(`文件大小不能超过 ${maxSize}MB`)
      return false
    }

    return true
  }

  // 处理文件上传
  const handleUpload = useCallback(
    async (fileList: RcFile[]) => {
      if (value.length + fileList.length > maxCount) {
        message.error(`最多只能上传 ${maxCount} 个文件`)
        return
      }

      setUploading(true)
      const newFiles: MediaFile[] = []

      try {
        for (const file of fileList) {
          if (!validateFile(file)) continue

          const fileKey = file.uid || file.name + Date.now()

          // 模拟上传进度
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileKey]: Math.min((prev[fileKey] || 0) + Math.random() * 30, 95),
            }))
          }, 500)

          try {
            // 上传到云端（如果提供了上传函数）
            const url = onUploadToCloud
              ? await onUploadToCloud(file)
              : URL.createObjectURL(file)

            clearInterval(progressInterval)
            setUploadProgress((prev) => ({
              ...prev,
              [fileKey]: 100,
            }))

            const mediaFile: MediaFile = {
              url,
              type: 'image',
              size: file.size,
              name: file.name,
              altText: '',
              sortOrder: newFiles.length,
            }

            newFiles.push(mediaFile)

            // 延迟后清除进度显示
            setTimeout(() => {
              setUploadProgress((prev) => {
                const newProgress = { ...prev }
                delete newProgress[fileKey]
                return newProgress
              })
            }, 500)
          } catch (error) {
            clearInterval(progressInterval)
            message.error(`上传失败: ${file.name}`)
          }
        }

        // 更新文件列表
        const updatedFiles = [...value, ...newFiles]
        onChange?.(updatedFiles)
      } finally {
        setUploading(false)
      }
    },
    [value, maxCount, onChange, onUploadToCloud]
  )

  // 删除文件
  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index)
    onChange?.(updated)
    message.success('文件已删除')
  }

  // 获取文件大小显示
  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={styles.mediaUploader}>
      <div className={styles.uploadZone}>
        <Upload.Dragger
          name="files"
          multiple={multiple}
          beforeUpload={(file) => {
            if (validateFile(file)) {
              handleUpload([file])
            }
            return false
          }}
          disabled={uploading || value.length >= maxCount}
          accept="image/*"
        >
          <p className={styles.dragIcon}>
            <UploadOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
          </p>
          <p className={styles.dragText}>拖拽文件到此处，或点击选择</p>
          <p className={styles.dragHint}>
            支持图片，单个文件不超过 {maxSize}MB
          </p>
        </Upload.Dragger>
      </div>

      {/* 上传中的文件 */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card
          title="上传中"
          size="small"
          style={{ marginTop: 16 }}
          className={styles.uploadingCard}
        >
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <Progress percent={Math.round(progress)} size="small" />
            </div>
          ))}
        </Card>
      )}

      {/* 已上传文件列表 */}
      {value.length > 0 && (
        <Card
          title={`已上传媒体 (${value.length}/${maxCount})`}
          size="small"
          style={{ marginTop: 16 }}
        >
          <Spin spinning={uploading}>
            {value.length === 0 ? (
              <Empty description="暂无文件" />
            ) : (
              <Row gutter={[16, 16]}>
                {value.map((file, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <div className={styles.mediaCard}>
                      {/* 图片预览 */}
                      <div className={styles.mediaPreview}>
                        <Image
                          src={file.url}
                          preview={{
                            mask: '预览',
                          }}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                          }}
                        />
                      </div>

                      {/* 文件信息 */}
                      <div className={styles.mediaInfo} style={{ padding: '8px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <Tag color="blue">
                            <PictureOutlined />
                            图片
                          </Tag>
                        </div>
                        <Tooltip title={file.name}>
                          <p
                            style={{
                              fontSize: '12px',
                              margin: '4px 0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {file.name}
                          </p>
                        </Tooltip>
                        <p style={{ fontSize: '12px', color: '#999', margin: '4px 0' }}>
                          {getFileSize(file.size)}
                        </p>

                        {/* 操作按钮 */}
                        <Space size="small" style={{ marginTop: '8px' }}>
                          <Tooltip title="复制链接">
                            <Button
                              type="text"
                              size="small"
                              icon={<LinkOutlined />}
                              onClick={() => {
                                navigator.clipboard.writeText(file.url)
                                message.success('链接已复制')
                              }}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="删除文件"
                            description="确定要删除此文件吗？"
                            onConfirm={() => handleRemove(index)}
                            okText="删除"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </Card>
      )}
    </div>
  )
}
