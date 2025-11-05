import { useState, useCallback, useRef } from 'react'
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
  SwapOutlined,
} from '@ant-design/icons'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
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
  compact?: boolean // 紧凑模式（用于编辑弹窗）
}

export default function MediaUploader({
  value = [],
  onChange,
  maxCount = 1,
  multiple = false,
  maxSize = 500, // 默认500MB
  onUploadToCloud,
  compact = false,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const replaceFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

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

  // 替换文件
  const handleReplace = useCallback(
    async (index: number, newFile: RcFile) => {
      if (!validateFile(newFile)) return

      setUploading(true)
      const fileKey = newFile.uid || newFile.name + Date.now()

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
          ? await onUploadToCloud(newFile)
          : URL.createObjectURL(newFile)

        clearInterval(progressInterval)
        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: 100,
        }))

        const updated = [...value]
        updated[index] = {
          url,
          type: 'image',
          size: newFile.size,
          name: newFile.name,
          altText: value[index]?.altText || '',
          sortOrder: index,
        }
        onChange?.(updated)

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
        message.error(`替换失败: ${newFile.name}`)
      } finally {
        setUploading(false)
      }
    },
    [value, onChange, onUploadToCloud]
  )

  // 获取文件大小显示
  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // 处理替换文件
  const handleReplaceFileChange = useCallback(
    async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files
      if (!files || files.length === 0) return

      const file = files[0]
      const rcFile = file as unknown as RcFile

      if (validateFile(rcFile)) {
        await handleReplace(index, rcFile)
      }

      // 重置文件输入
      event.currentTarget.value = ''
    },
    [validateFile, handleReplace]
  )

  return (
    <div className={`${styles.mediaUploader} ${compact ? styles.compact : ''}`}>
      {value.length === 0 ? (
        // 未上传状态 - 显示拖拽上传区域
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
            disabled={uploading}
            accept="image/*"
          >
            <p className={styles.dragIcon}>
              <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className={styles.dragText}>拖拽图片到此处，或点击选择</p>
            <p className={styles.dragHint}>
              支持 JPG、PNG 等图片格式，单个文件不超过 {maxSize}MB
            </p>
          </Upload.Dragger>
        </div>
      ) : (
        // 已上传状态 - 显示图片卡片
        <Spin spinning={uploading}>
          <div className={styles.uploadedContainer}>
            {value.map((file, index) => (
              <div className={styles.mediaCard} key={index}>
                {/* 图片预览容器 */}
                <div className={styles.mediaPreviewWrapper}>
                  {/* 删除按钮 - 右上角 */}
                  <Popconfirm
                    title="删除图片"
                    description="确定要删除此图片吗？"
                    onConfirm={() => handleRemove(index)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <button className={styles.deleteButton}>
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>

                  {/* 替换按钮 - 右上角 */}
                  <label
                    className={styles.replaceButton}
                    style={{ cursor: 'pointer' }}
                  >
                    <SwapOutlined />
                    <input
                      ref={(el) => {
                        replaceFileInputRefs.current[index] = el
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReplaceFileChange(index, e)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* 点击图片预览 */}
                  <div
                    className={styles.mediaPreview}
                    onClick={() => {
                      setLightboxIndex(index)
                      setLightboxOpen(true)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                    />
                  </div>

                  {/* Hover 时显示的查看遮罩 */}
                  <div className={styles.mediaOverlay} />
                </div>

              </div>
            ))}
          </div>

          {/* Lightbox 全屏预览 */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={value.map((file) => ({
              src: file.url,
              alt: file.name,
            }))}
            index={lightboxIndex}
            on={{
              view: ({ index }) => setLightboxIndex(index),
            }}
          />
        </Spin>
      )}
    </div>
  )
}
