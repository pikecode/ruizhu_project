import api from './api'

/**
 * 媒体服务 - 处理图片和视频的上传
 * 支持腾讯云COS上传
 */

export interface UploadCredentials {
  cosUrl: string // COS API 端点
  bucket: string // 存储桶
  region: string // 地域
  credentials: {
    sessionToken: string
    tmpSecretId: string
    tmpSecretKey: string
  }
  expiredTime: number
}

export interface MediaResponse {
  url: string
  type: 'image' | 'video'
  size: number
  width?: number
  height?: number
}

export const mediaService = {
  /**
   * 获取腾讯云COS上传凭证
   * 返回临时凭证用于直接上传到COS
   */
  getUploadCredentials: async (): Promise<UploadCredentials> => {
    try {
      const response = await api.get('/media/cos-credentials')
      return response.data.data
    } catch (error) {
      throw new Error('获取上传凭证失败')
    }
  },

  /**
   * 上传媒体文件（通过后端代理上传）
   * 适用于小文件或对安全性要求高的场景
   */
  uploadMedia: async (file: File): Promise<MediaResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', file.type.startsWith('video/') ? 'video' : 'image')

    try {
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          console.log('上传进度:', percentCompleted)
        },
      })

      return response.data.data
    } catch (error) {
      throw new Error('媒体上传失败')
    }
  },

  /**
   * 删除媒体文件
   */
  deleteMedia: async (mediaUrl: string): Promise<void> => {
    try {
      await api.delete('/media/delete', {
        data: { url: mediaUrl },
      })
    } catch (error) {
      throw new Error('删除媒体失败')
    }
  },

  /**
   * 获取图片信息（宽高等）
   */
  getImageInfo: async (imageUrl: string): Promise<{ width: number; height: number }> => {
    try {
      const response = await api.post('/media/image-info', { url: imageUrl })
      return response.data.data
    } catch (error) {
      throw new Error('获取图片信息失败')
    }
  },

  /**
   * 生成媒体缩略图（用于预览）
   */
  generateThumbnail: async (
    mediaUrl: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> => {
    try {
      const response = await api.post('/media/thumbnail', {
        url: mediaUrl,
        width,
        height,
      })
      return response.data.data.thumbnailUrl
    } catch (error) {
      return mediaUrl // 失败时返回原URL
    }
  },

  /**
   * 批量上传媒体文件
   */
  uploadMediaBatch: async (
    files: File[],
    onProgress?: (current: number, total: number) => void
  ): Promise<MediaResponse[]> => {
    const results: MediaResponse[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await mediaService.uploadMedia(files[i])
        results.push(result)
        onProgress?.(i + 1, files.length)
      } catch (error) {
        console.error(`文件 ${files[i].name} 上传失败:`, error)
        onProgress?.(i + 1, files.length)
      }
    }

    return results
  },

  /**
   * 直接上传到腾讯云COS（使用预签名URL或临时凭证）
   * 适用于大文件上传
   */
  uploadToCOS: async (
    file: File,
    _onProgress?: (percent: number) => void
  ): Promise<string> => {
    try {
      // 1. 获取COS上传凭证
      const credentials = await mediaService.getUploadCredentials()

      // 2. 构建上传请求（这里只是示例，实际需要根据腾讯云SDK实现）
      // 通常使用腾讯云提供的 cos-js-sdk-v5 库
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `products/${fileName}`

      // 3. 上传到COS
      // 实际实现需要引入腾讯云SDK并配置
      // const url = await uploadFileToCOS(file, filePath, credentials, onProgress)

      // 暂时返回占位符，实际应返回COS上的文件URL
      return `${credentials.cosUrl}/${filePath}`
    } catch (error) {
      throw new Error('上传到腾讯云COS失败')
    }
  },
}
