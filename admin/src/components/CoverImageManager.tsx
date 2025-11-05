import { Button, Image, Empty, Upload, message, Spin, Tooltip } from 'antd'
import { DeleteOutlined, CameraOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { RcFile } from 'antd/es/upload'
import { mediaService } from '@/services/media'

interface CoverImageManagerProps {
  coverUrl?: string
  onChange: (url: string) => void
  onDelete: () => void
  loading?: boolean
}

export default function CoverImageManager({
  coverUrl,
  onChange,
  onDelete,
  loading = false,
}: CoverImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [imageHovered, setImageHovered] = useState(false)

  const handleUpload = async (file: RcFile) => {
    try {
      setUploading(true)
      const response = await mediaService.uploadMedia(file)
      onChange(response.url)
      message.success('封面图上传成功')
    } catch (error) {
      message.error('封面图上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    try {
      onDelete()
      message.success('封面图已删除')
    } catch (error) {
      message.error('删除失败')
    }
  }

  return (
    <Spin spinning={loading || uploading}>
      <div style={{ padding: '12px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500, color: '#262626' }}>
            产品主图 (封面)
          </h4>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '12px' }}>
            选择一张图片作为产品的主要展示图
          </div>
        </div>

        {coverUrl ? (
          <div
            onMouseEnter={() => setImageHovered(true)}
            onMouseLeave={() => setImageHovered(false)}
            style={{
              position: 'relative',
              width: '180px',
              height: '320px',
              border: '2px solid #1890ff',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fafafa',
              display: 'inline-block',
              boxShadow: imageHovered ? '0 4px 16px rgba(24, 144, 255, 0.2)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <Image
              src={coverUrl}
              preview={true}
              width={180}
              height={320}
              style={{
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* 主图标记 - 左上角 */}
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                backgroundColor: '#1890ff',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '0 0 8px 0',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CameraOutlined style={{ fontSize: '13px' }} />
              主图
            </div>

            {/* 覆盖层 - 操作按钮（悬停显示） */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.65))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                opacity: imageHovered ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              <Upload
                beforeUpload={handleUpload}
                maxCount={1}
                showUploadList={false}
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<CameraOutlined />}
                  style={{
                    marginBottom: '4px',
                  }}
                >
                  更改封面
                </Button>
              </Upload>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                删除
              </Button>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '32px 16px',
              border: '2px dashed #d9d9d9',
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <CameraOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', color: '#262626', fontSize: '14px', fontWeight: 500 }}>
                暂无封面
              </p>
              <p style={{ margin: 0, color: '#8c8c8c', fontSize: '12px' }}>
                上传产品主图以展示给用户
              </p>
            </div>
            <Upload
              beforeUpload={handleUpload}
              maxCount={1}
              showUploadList={false}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={uploading}
                style={{
                  height: '36px',
                  fontSize: '14px',
                }}
              >
                上传封面
              </Button>
            </Upload>
          </div>
        )}
      </div>
    </Spin>
  )
}
