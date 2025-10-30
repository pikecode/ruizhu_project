import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const COS = require('cos-nodejs-sdk-v5');

export interface CosUploadResult {
  key: string; // 文件键，用于数据库存储（如：products/1234-abc.jpg）
  size: number;
  domain?: string; // 可选：返回配置的域名（如果配置了自定义域名）
}

/**
 * COS（腾讯云对象存储）统一服务
 * 所有文件上传和删除操作都通过此服务进行
 * 支持自定义域名访问（如 https://yunjie.online）
 */
@Injectable()
export class CosService {
  private cos: any;
  private bucket: string;
  private region: string;
  private cosHost: string;
  private customDomain: string | null;

  constructor(private configService: ConfigService) {
    this.initializeCOS();
  }

  /**
   * 初始化 COS 客户端和配置
   */
  private initializeCOS() {
    const secretId = this.configService.get<string>('COS_SECRET_ID');
    const secretKey = this.configService.get<string>('COS_SECRET_KEY');
    this.bucket = this.configService.get<string>('COS_BUCKET', 'ruizhu-1256655507');
    this.region = this.configService.get<string>('COS_REGION', 'ap-guangzhou');
    this.customDomain = this.configService.get<string>('COS_CUSTOM_DOMAIN') || null; // e.g., https://yunjie.online

    // 构建COS标准URL (必须在凭证检查之前初始化)
    this.cosHost = `https://${this.bucket}.cos.${this.region}.myqcloud.com`;

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
   * 上传文件到COS
   * @param buffer 文件内容buffer
   * @param originalname 原始文件名（用于提取扩展名）
   * @param folder 文件夹路径（可选，默认为'products'）
   * @returns 上传结果 { url, key, size }
   */
  async uploadFile(
    buffer: Buffer,
    originalname: string,
    folder: string = 'products',
  ): Promise<CosUploadResult> {
    if (!buffer) {
      throw new BadRequestException('No file buffer provided');
    }

    try {
      // 生成唯一的文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = this.getFileExtension(originalname);
      const fileName = `${timestamp}-${randomStr}${ext}`;
      const fileKey = `${folder}/${fileName}`;

      // 上传文件到COS
      if (this.cos) {
        await this.uploadFileToCOS(fileKey, buffer, this.getMimeType(originalname));
      }

      // 返回分离的文件键和域名信息
      // 数据库只需要存储 key，前端或API调用时动态拼接域名
      return {
        key: fileKey,
        size: buffer.length,
        domain: this.customDomain || this.cosHost, // 返回配置的域名供后续使用
      };
    } catch (error) {
      console.error('COS upload error:', error);
      throw new BadRequestException(`Failed to upload file to COS: ${error.message}`);
    }
  }

  /**
   * 从COS删除文件
   * @param urlOrKey 文件URL或文件Key
   */
  async deleteFile(urlOrKey: string): Promise<void> {
    if (!urlOrKey) {
      console.warn('No file URL or key provided for deletion');
      return;
    }

    try {
      // 从URL中提取文件Key
      const fileKey = this.extractKeyFromUrl(urlOrKey);

      if (this.cos) {
        await this.deleteFileFromCOS(fileKey);
      }

      console.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      console.error('Delete file error:', error);
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 生成文件访问URL
   * 优先使用自定义域名，否则使用COS标准URL
   * @param fileKey 文件Key（如 'products/timestamp-random.jpg'）
   */
  generateUrl(fileKey: string): string {
    // 如果配置了自定义域名，优先使用
    if (this.customDomain) {
      return `${this.customDomain}/${fileKey}`;
    }
    // 默认使用COS标准URL
    return `${this.cosHost}/${fileKey}`;
  }

  /**
   * 获取当前配置的访问域名
   * 返回自定义域名（如果配置了）或COS默认域名
   */
  getAccessDomain(): string {
    return this.customDomain || this.cosHost;
  }

  /**
   * 从URL中提取文件Key
   */
  private extractKeyFromUrl(urlOrKey: string): string {
    if (urlOrKey.startsWith('http')) {
      // 从URL中提取Key
      if (urlOrKey.includes(this.cosHost)) {
        // 标准COS URL
        return urlOrKey.substring(this.cosHost.length + 1);
      } else if (this.customDomain && urlOrKey.includes(this.customDomain)) {
        // 自定义域名URL
        return urlOrKey.substring(this.customDomain.length + 1);
      }
    }
    // 直接使用Key
    return urlOrKey;
  }

  /**
   * 上传文件到COS（私有方法）
   */
  private uploadFileToCOS(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: body,
          ContentType: contentType,
          onProgress: (progressData: any) => {
            console.log(
              `[COS Upload] ${key}: ${Math.round(progressData.percent * 100)}%`,
            );
          },
        },
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            console.log(`[COS Upload Success] ${key} - Location: ${data.Location}`);
            resolve();
          }
        },
      );
    });
  }

  /**
   * 从COS删除文件（私有方法）
   */
  private deleteFileFromCOS(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            console.log(`[COS Delete Success] ${key}`);
            resolve();
          }
        },
      );
    });
  }

  /**
   * 根据文件名获取MIME类型
   */
  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    const mimeTypes: { [key: string]: string } = {
      // 图片
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      // 视频
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mpeg: 'video/mpeg',
      // 其他
      pdf: 'application/pdf',
      zip: 'application/zip',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * 从文件名中提取扩展名
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) {
      return '';
    }
    return filename.substring(lastDot);
  }
}
