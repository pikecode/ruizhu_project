import api from './api'

export interface FileInfo {
  id: number
  fileName: string
  originalName: string
  cosKey: string
  url: string
  mimeType: string
  size: number
  fileType: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface FilesListResponse {
  data: FileInfo[]
  total: number
}

export interface FileStatsResponse {
  total: number
  byType: Array<{ type: string; count: number }>
  totalSize: number
}

// 上传文件
export const uploadFile = async (file: File): Promise<FileInfo> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

// 获取所有文件（分页）
export const getFilesList = async (
  limit = 20,
  offset = 0,
): Promise<FilesListResponse> => {
  const response = await api.get('/files', {
    params: { limit, offset },
  })

  return response.data
}

// 获取单个文件信息
export const getFileById = async (id: number): Promise<FileInfo> => {
  const response = await api.get(`/files/${id}`)
  return response.data
}

// 删除文件
export const deleteFile = async (id: number): Promise<void> => {
  await api.delete(`/files/${id}`)
}

// 获取文件下载链接
export const getDownloadUrl = async (
  id: number,
  expiresIn = 3600,
): Promise<{ url: string }> => {
  const response = await api.get(`/files/${id}/download-url`, {
    params: { expiresIn },
  })

  return response.data
}

// 获取文件统计信息
export const getFileStats = async (): Promise<FileStatsResponse> => {
  const response = await api.get('/files/stats/overview')
  return response.data
}
