import React, { useRef, useState } from 'react'
import { Upload, Button, Progress, message, Space, Typography } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { uploadFile, FileInfo } from '@/services/files'
import styles from './UploadFile.module.scss'

const { Text } = Typography

interface UploadFileProps {
  onSuccess?: (file: FileInfo) => void
  maxSize?: number // 最大文件大小，默认 50MB
  accept?: string
  multiple?: boolean
}

export const UploadFileComponent: React.FC<UploadFileProps> = ({
  onSuccess,
  maxSize = 52428800, // 50MB
  accept = '*',
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const file = files[0]

    // 文件大小检查
    if (file.size > maxSize) {
      message.error(
        `文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      )
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      message.warning('请先选择文件')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 30
        })
      }, 300)

      const file = await uploadFile(selectedFile)

      clearInterval(progressInterval)
      setProgress(100)

      message.success('文件上传成功')
      setSelectedFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 延迟重置进度条
      setTimeout(() => {
        setProgress(0)
        setUploading(false)
      }, 500)

      onSuccess?.(file)
    } catch (error: any) {
      message.error(`上传失败: ${error.message || '未知错误'}`)
      setProgress(0)
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={styles.uploadContainer}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
      />

      <div className={styles.uploadArea}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          选择文件
        </Button>

        {selectedFile && (
          <div className={styles.fileInfo}>
            <Text>已选择: {selectedFile.name}</Text>
            <Text type="secondary" style={{ marginLeft: '16px' }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </div>
        )}

        {uploading && <Progress percent={Math.round(progress)} />}

        {selectedFile && !uploading && (
          <Space style={{ marginTop: '16px' }}>
            <Button type="primary" loading={uploading} onClick={handleUpload}>
              上传
            </Button>
            <Button onClick={handleCancel}>取消</Button>
          </Space>
        )}
      </div>
    </div>
  )
}

export default UploadFileComponent
