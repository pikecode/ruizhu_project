import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * URL 生成工具
 * 用于在返回给前端的响应中动态生成文件访问URL
 * 支持自定义域名配置，如果配置了 COS_CUSTOM_DOMAIN，优先使用自定义域名
 */
@Injectable()
export class UrlHelper {
  private customDomain: string | null;
  private cosHost: string;

  constructor(private configService: ConfigService) {
    this.initializeConfig();
  }

  private initializeConfig() {
    const bucket = this.configService.get<string>('COS_BUCKET', 'ruizhu-1256655507');
    const region = this.configService.get<string>('COS_REGION', 'ap-guangzhou');
    this.customDomain = this.configService.get<string>('COS_CUSTOM_DOMAIN') || null;
    this.cosHost = `https://${bucket}.cos.${region}.myqcloud.com`;
  }

  /**
   * 根据文件键生成完整的访问URL
   * @param fileKey 文件键（如 'products/1234-abc.jpg'）
   * @returns 完整的访问URL（如 'https://yunjie.online/products/1234-abc.jpg'）
   */
  generateUrl(fileKey: string): string {
    if (!fileKey) {
      return '';
    }

    // 确保文件键不以斜杠开头
    const normalizedKey = fileKey.startsWith('/') ? fileKey.substring(1) : fileKey;

    // 如果配置了自定义域名，优先使用
    if (this.customDomain) {
      return `${this.customDomain}/${normalizedKey}`;
    }

    // 默认使用COS标准URL
    return `${this.cosHost}/${normalizedKey}`;
  }

  /**
   * 批量生成URL
   * @param fileKeys 文件键数组
   * @returns 完整URL数组
   */
  generateUrls(fileKeys: string[]): string[] {
    return fileKeys.map(key => this.generateUrl(key));
  }

  /**
   * 从完整URL中提取文件键
   * @param url 完整URL
   * @returns 文件键
   */
  extractKeyFromUrl(url: string): string {
    if (!url) {
      return '';
    }

    if (this.customDomain && url.includes(this.customDomain)) {
      // 自定义域名URL: https://yunjie.online/products/abc.jpg -> products/abc.jpg
      const domain = this.customDomain.replace(/https?:\/\//, '');
      return url.split(domain)[1]?.substring(1) || '';
    } else if (url.includes(this.cosHost)) {
      // COS标准URL: https://bucket.cos.region.myqcloud.com/products/abc.jpg -> products/abc.jpg
      return url.substring(this.cosHost.length + 1);
    }

    // 如果不是URL格式，直接返回（可能已经是键）
    return url;
  }

  /**
   * 获取当前配置的访问域名
   * @returns 域名（如 'https://yunjie.online' 或 'https://bucket.cos.region.myqcloud.com'）
   */
  getAccessDomain(): string {
    return this.customDomain || this.cosHost;
  }
}
