import { API_BASE_URL } from '../config';

export interface NewsData {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  detailImageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  code: number;
  message: string;
  data: {
    items: NewsData[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface NewsResponse {
  code: number;
  message: string;
  data: NewsData;
}

/**
 * News Service
 * 提供资讯相关的API调用方法
 */
export const newsService = {
  /**
   * 获取资讯列表
   * @param page 页码
   * @param limit 每页数量
   */
  async getList(page: number = 1, limit: number = 20): Promise<NewsListResponse> {
    const response = await fetch(`${API_BASE_URL}/news?page=${page}&limit=${limit}`);
    return response.json();
  },

  /**
   * 获取单个资讯详情
   */
  async getById(id: number): Promise<NewsResponse> {
    const response = await fetch(`${API_BASE_URL}/news/${id}`);
    return response.json();
  },

  /**
   * 创建资讯
   * @param data 资讯数据
   */
  async create(data: {
    title: string;
    subtitle?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<NewsResponse> {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * 更新资讯
   * @param id 资讯ID
   * @param data 资讯数据
   */
  async update(
    id: number,
    data: {
      title?: string;
      subtitle?: string | null;
      description?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<NewsResponse> {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * 删除资讯
   */
  async delete(id: number): Promise<{ code: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  /**
   * 上传资讯封面图
   * @param id 资讯ID
   * @param file 图片文件
   * @param onProgress 上传进度回调 (0-100)
   */
  async uploadCoverImage(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<NewsResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // 监听上传进度
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }

      // 监听加载完成
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/news/${id}/upload-cover-image`);
      xhr.send(formData);
    });
  },

  /**
   * 上传资讯详情图
   * @param id 资讯ID
   * @param file 图片文件
   * @param onProgress 上传进度回调 (0-100)
   */
  async uploadDetailImage(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<NewsResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // 监听上传进度
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }

      // 监听加载完成
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      // 监听错误
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/news/${id}/upload-detail-image`);
      xhr.send(formData);
    });
  },
};
