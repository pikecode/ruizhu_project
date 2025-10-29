import { API_BASE_URL } from '../config';

export interface BannerData {
  id: number;
  mainTitle: string;
  subtitle?: string;
  description?: string;
  type: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
  linkType: 'none' | 'product' | 'category' | 'collection' | 'url';
  linkValue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerListResponse {
  code: number;
  message: string;
  data: {
    items: BannerData[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface BannerResponse {
  code: number;
  message: string;
  data: BannerData;
}

/**
 * Banner Service
 * 提供Banner相关的API调用方法
 */
export const bannerService = {
  /**
   * 获取Banner列表
   */
  async getList(page: number = 1, limit: number = 20): Promise<BannerListResponse> {
    const response = await fetch(`${API_BASE_URL}/banners?page=${page}&limit=${limit}`);
    return response.json();
  },

  /**
   * 获取首页展示的Banner列表（仅启用的）
   */
  async getHomeBanners(): Promise<{ code: number; message: string; data: BannerData[] }> {
    const response = await fetch(`${API_BASE_URL}/banners/home`);
    return response.json();
  },

  /**
   * 获取单个Banner详情
   */
  async getById(id: number): Promise<BannerResponse> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`);
    return response.json();
  },

  /**
   * 创建Banner
   */
  async create(data: {
    mainTitle: string;
    subtitle?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
    linkType?: string;
    linkValue?: string;
  }): Promise<BannerResponse> {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * 更新Banner
   */
  async update(
    id: number,
    data: {
      mainTitle?: string;
      subtitle?: string | null;
      description?: string | null;
      sortOrder?: number;
      isActive?: boolean;
      linkType?: string;
      linkValue?: string | null;
    },
  ): Promise<BannerResponse> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * 删除Banner
   */
  async delete(id: number): Promise<{ code: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  /**
   * 上传Banner图片
   * @param id Banner ID
   * @param file 图片文件
   * @param onProgress 上传进度回调 (0-100)
   */
  async uploadImage(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<BannerResponse> {
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

      xhr.open('POST', `${API_BASE_URL}/banners/${id}/upload-image`);
      xhr.send(formData);
    });
  },

  /**
   * 上传Banner视频（自动转换为WebP格式）
   * @param id Banner ID
   * @param file 视频文件
   * @param onProgress 上传进度回调 (0-100)
   *
   * 注意：此接口会进行以下处理：
   * 1. 验证视频格式
   * 2. 使用FFmpeg转换为WebP格式（高质量压缩）
   * 3. 提取视频第2秒作为封面图片
   * 4. 同时上传转换后的视频和封面到COS
   * 5. 删除本地临时文件
   */
  async uploadVideo(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<BannerResponse> {
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

      xhr.open('POST', `${API_BASE_URL}/banners/${id}/upload-video`);
      xhr.send(formData);
    });
  },
};
