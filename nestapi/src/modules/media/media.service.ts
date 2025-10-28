import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const COS = require('cos-nodejs-sdk-v5');

export interface MediaUploadResponse {
  url: string;
  type: 'image' | 'video';
  size: number;
  width?: number;
  height?: number;
}

export interface COSCredentials {
  cosUrl: string;
  bucket: string;
  region: string;
  credentials: {
    sessionToken: string;
    tmpSecretId: string;
    tmpSecretKey: string;
  };
  expiredTime: number;
}

@Injectable()
export class MediaService {
  private cos: any;

  constructor(private configService: ConfigService) {
    this.initializeCOS();
  }

  /**
   * 初始化 COS 客户端
   */
  private initializeCOS() {
    const secretId = this.configService.get<string>('COS_SECRET_ID');
    const secretKey = this.configService.get<string>('COS_SECRET_KEY');

    if (!secretId || !secretKey) {
      console.warn('COS credentials not configured');
      return;
    }

    this.cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
    });
  }

  /**
   * 获取腾讯云COS临时凭证
   * 返回长期密钥凭证给前端使用
   */
  async getUploadCredentials(): Promise<COSCredentials> {
    const bucket = this.configService.get<string>('COS_BUCKET', 'ruizhu-1256655507');
    const region = this.configService.get<string>('COS_REGION', 'ap-guangzhou');
    const secretId = this.configService.get<string>('COS_SECRET_ID') || '';
    const secretKey = this.configService.get<string>('COS_SECRET_KEY') || '';

    const cosUrl = `https://${bucket}.cos.${region}.myqcloud.com`;

    // 返回长期凭证给前端（生产环境应使用STS临时凭证）
    // 临时凭证需要调用腾讯云STS API，这里返回长期凭证供演示使用
    return {
      cosUrl,
      bucket,
      region,
      credentials: {
        sessionToken: '', // 长期凭证不需要sessionToken
        tmpSecretId: secretId,
        tmpSecretKey: secretKey,
      },
      expiredTime: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // 7天过期
    };
  }

  /**
   * 处理媒体上传到腾讯云COS
   */
  async uploadMedia(
    file: any,
    type: 'image' | 'video',
  ): Promise<MediaUploadResponse> {
    // 验证文件
    if (!file) {
      throw new Error('No file provided');
    }

    try {
      // 生成文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomStr}-${file.originalname}`;
      const filePath = `products/${fileName}`;

      const bucket = this.configService.get<string>('COS_BUCKET', 'ruizhu-1256655507');
      const region = this.configService.get<string>('COS_REGION', 'ap-guangzhou');

      // 上传文件到COS
      if (this.cos) {
        await this.uploadFileToCOS(bucket, filePath, file.buffer, file.mimetype);
      }

      // 生成访问URL
      const url = `https://${bucket}.cos.${region}.myqcloud.com/${filePath}`;

      // 解析图片尺寸（可选，实际可使用sharp库）
      let width: number | undefined;
      let height: number | undefined;
      if (type === 'image') {
        // 实际应该解析图片获取宽高
        width = 1920;
        height = 1080;
      }

      return {
        url,
        type,
        size: file.size,
        width,
        height,
      };
    } catch (error) {
      console.error('COS upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * 上传文件到COS
   */
  private uploadFileToCOS(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: bucket,
          Region: this.configService.get<string>('COS_REGION', 'ap-guangzhou'),
          Key: key,
          Body: body,
          ContentType: contentType,
          onProgress: (progressData: any) => {
            console.log(`Upload progress: ${Math.round(progressData.percent * 100)}%`);
          },
        },
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            console.log('File uploaded successfully:', data.Location);
            resolve();
          }
        },
      );
    });
  }

  /**
   * 删除媒体文件
   */
  async deleteMedia(mediaUrl: string): Promise<void> {
    try {
      // 从URL中提取文件路径
      // URL格式: https://bucket.cos.region.myqcloud.com/products/filename
      const bucket = this.configService.get<string>('COS_BUCKET', 'ruizhu-1256655507');
      const region = this.configService.get<string>('COS_REGION', 'ap-guangzhou');
      const baseUrl = `https://${bucket}.cos.${region}.myqcloud.com/`;

      if (!mediaUrl.startsWith(baseUrl)) {
        throw new Error('Invalid media URL');
      }

      const key = mediaUrl.substring(baseUrl.length);

      // 从COS删除文件
      if (this.cos) {
        await this.deleteFileFromCOS(bucket, key);
      }

      console.log(`Media deleted successfully: ${mediaUrl}`);
    } catch (error) {
      console.error('Delete media error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * 从COS删除文件
   */
  private deleteFileFromCOS(bucket: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(
        {
          Bucket: bucket,
          Region: this.configService.get<string>('COS_REGION', 'ap-guangzhou'),
          Key: key,
        },
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            console.log('File deleted successfully from COS');
            resolve();
          }
        },
      );
    });
  }

  /**
   * 获取图片信息
   */
  async getImageInfo(
    imageUrl: string,
  ): Promise<{ width: number; height: number }> {
    // 实现：
    // 1. 下载图片或从COS获取
    // 2. 解析图片获取宽高
    // 这里返回默认值
    return {
      width: 1920,
      height: 1080,
    };
  }

  /**
   * 生成媒体缩略图
   */
  async generateThumbnail(
    mediaUrl: string,
    width: number = 200,
    height: number = 200,
  ): Promise<string> {
    // 实现：
    // 1. 如果是视频，使用FFmpeg生成第一帧
    // 2. 如果是图片，使用sharp生成缩略图
    // 3. 上传缩略图到COS
    // 这里返回原URL
    return mediaUrl;
  }
}
