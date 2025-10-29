import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosService } from '../../common/services/cos.service';

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
  constructor(
    private configService: ConfigService,
    private cosService: CosService,
  ) {}

  /**
   * 获取腾讯云COS临时凭证 (仅用于文件上传)
   * 返回长期密钥凭证给前端使用
   *
   * 注意：这里返回长期凭证供演示使用，生产环境应使用STS临时凭证
   * 参考: https://cloud.tencent.com/document/product/436/14048
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
   * 生成文件访问URL
   * 由于产品/banner图片都是公开的，直接通过CosService生成URL即可
   * 如果需要签名URL（私有对象），可通过CosService扩展
   */
  generateSignedUrl(key: string, expiresIn: number = 3600): string {
    // 对于公开文件，直接生成URL（优先使用自定义域名）
    return this.cosService.generateUrl(key);
  }

  /**
   * 处理媒体上传到腾讯云COS
   * 统一通过CosService进行上传
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
      // 调用CosService统一上传
      const uploadResult = await this.cosService.uploadFile(
        file.buffer,
        file.originalname,
        'products',
      );

      // 解析图片尺寸（可选，实际可使用sharp库）
      let width: number | undefined;
      let height: number | undefined;
      if (type === 'image') {
        // 实际应该解析图片获取宽高
        width = 1920;
        height = 1080;
      }

      return {
        url: uploadResult.url,
        type,
        size: uploadResult.size,
        width,
        height,
      };
    } catch (error) {
      console.error('Media upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * 删除媒体文件
   * 统一通过CosService进行删除
   */
  async deleteMedia(mediaUrl: string): Promise<void> {
    try {
      // 调用CosService统一删除
      await this.cosService.deleteFile(mediaUrl);
    } catch (error) {
      console.error('Delete media error:', error);
      // 不抛出错误，避免影响主流程
    }
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
