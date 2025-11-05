import { Button, Image, Empty, Upload, message, Spin, Tooltip } from 'antd'
import { DeleteOutlined, PlusOutlined, DragOutlined, PictureOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { RcFile } from 'antd/es/upload'
import { mediaService } from '@/services/media'

interface MediaFile {
  id?: number
  url: string
  type: 'image' | 'video'
  size: number
  name: string
  uploadProgress?: number
  altText?: string
  sortOrder?: number
  isNew?: boolean
}

interface ProductImagesManagerProps {
  images: MediaFile[]
  onAdd: (newImages: MediaFile[]) => void
  onDelete: (index: number) => void
  onSort: (images: MediaFile[]) => void
  loading?: boolean
}

export default function ProductImagesManager({
  images,
  onAdd,
  onDelete,
  onSort,
  loading = false,
}: ProductImagesManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleUpload = async (file: RcFile) => {
    try {
      setUploading(true)
      const response = await mediaService.uploadMedia(file)
      const newImage: MediaFile = {
        url: response.url,
        type: 'image',
        size: file.size,
        name: file.name,
        sortOrder: images.length,
        isNew: true,
      }
      onAdd([newImage])
      message.success('详情图上传成功')
    } catch (error) {
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (index: number) => {
    onDelete(index)
    message.success('图片已删除')
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    // 更新 sortOrder
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      sortOrder: idx,
    }))

    onSort(reorderedImages)
    setDraggedIndex(null)
  }

  return (
    <Spin spinning={loading || uploading}>
      <div style={{ padding: '12px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500, color: '#262626' }}>
            产品详情图
          </h4>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '12px' }}>
            上传多张详情图，支持拖拽排序。已上传 <span style={{ color: '#1890ff', fontWeight: 600 }}>{images.length}</span> 张
          </div>
        </div>

        {images.length > 0 && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              {images.map((file, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    position: 'relative',
                    border: draggedIndex === index ? '2px dashed #1890ff' : '1px solid #d9d9d9',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                    cursor: draggedIndex === index ? 'grabbing' : 'grab',
                    transition: 'all 0.3s ease',
                    opacity: draggedIndex === index ? 0.6 : 1,
                    boxShadow:
                      draggedIndex === index
                        ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                        : hoveredIndex === index
                          ? '0 2px 8px rgba(0, 0, 0, 0.08)'
                          : 'none',
                    aspectRatio: '9 / 16',
                  }}
                >
                  <Image
                    src={file.url}
                    preview={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* 排序号 - 左上角 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      padding: '3px 6px',
                      borderRadius: '0 0 4px 0',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '28px',
                      height: '24px',
                    }}
                  >
                    #{index + 1}
                  </div>

                  {/* 操作按钮 - 底部覆盖层 */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '48px',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7))',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px',
                      paddingBottom: '6px',
                      opacity: hoveredIndex === index ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Tooltip title="拖拽排序" placement="top">
                      <Button
                        type="text"
                        size="small"
                        style={{
                          color: 'white',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px 4px',
                          height: '26px',
                          minWidth: '26px',
                        }}
                        icon={<DragOutlined />}
                      />
                    </Tooltip>
                    <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    <Tooltip title="删除" placement="top">
                      <Button
                        type="text"
                        size="small"
                        style={{
                          color: 'white',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px 4px',
                          height: '26px',
                          minWidth: '26px',
                        }}
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(index)}
                      />
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            {/* 上传按钮 */}
            <Upload beforeUpload={handleUpload} maxCount={1} showUploadList={false}>
              <Button
                type="default"
                icon={<PlusOutlined />}
                block
                loading={uploading}
                style={{
                  height: '38px',
                  fontSize: '13px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff'
                  e.currentTarget.style.color = '#1890ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d9d9d9'
                  e.currentTarget.style.color = 'rgba(0,0,0,0.65)'
                }}
              >
                继续添加详情图
              </Button>
            </Upload>
          </div>
        )}

        {/* 空状态 */}
        {images.length === 0 && (
          <div
            style={{
              padding: '32px 16px',
              border: '2px dashed #d9d9d9',
              borderRadius: '6px',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <PictureOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', color: '#262626', fontSize: '14px', fontWeight: 500 }}>
                暂无详情图
              </p>
              <p style={{ margin: 0, color: '#8c8c8c', fontSize: '12px' }}>
                上传产品详情图以展示更多信息
              </p>
            </div>
            <Upload beforeUpload={handleUpload} maxCount={1} showUploadList={false}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={uploading}
                style={{
                  height: '36px',
                  fontSize: '13px',
                }}
              >
                添加详情图
              </Button>
            </Upload>
          </div>
        )}
      </div>
    </Spin>
  )
}
