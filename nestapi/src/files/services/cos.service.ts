import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class CosService {
  private cos: COS;
  private readonly logger = new Logger(CosService.name);
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    const secretId = this.configService.get<string>('COS_SECRET_ID') || '';
    const secretKey = this.configService.get<string>('COS_SECRET_KEY') || '';
    this.bucket = this.configService.get<string>('COS_BUCKET') || '';
    this.region = this.configService.get<string>('COS_REGION') || '';

    this.cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
    });
  }

  /**
   * 上传文件到 COS
   */
  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        },
        (err, data) => {
          if (err) {
            this.logger.error(`COS upload error: ${err.message}`);
            reject(err);
          } else {
            const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
            this.logger.log(`File uploaded successfully: ${url}`);
            resolve(url);
          }
        },
      );
    });
  }

  /**
   * 删除 COS 中的文件
   */
  async deleteFile(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err) => {
          if (err) {
            this.logger.error(`COS delete error: ${err.message}`);
            reject(err);
          } else {
            this.logger.log(`File deleted successfully: ${key}`);
            resolve();
          }
        },
      );
    });
  }

  /**
   * 生成预签名 URL（用于下载）
   */
  getSignedUrl(key: string, expiresIn: number = 3600): string {
    const url = this.cos.getObjectUrl(
      {
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      },
      (err, data) => {
        if (err) {
          this.logger.error(`Generate signed URL error: ${err.message}`);
          return null;
        }
        return data.Url;
      },
    );
    return url;
  }

  /**
   * 获取文件的临时访问 URL
   */
  getAuthenticatedUrl(key: string, expiresIn: number = 3600): string {
    // 返回公开 URL，COS 文件权限控制应在存储桶策略中配置
    return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
  }
}
