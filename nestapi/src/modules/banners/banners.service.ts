import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto, BannerListResponseDto } from './dto/banner.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    private configService: ConfigService,
  ) {}

  /**
   * 获取Banner列表
   */
  async getBannerList(page: number = 1, limit: number = 10, onlyActive: boolean = false): Promise<BannerListResponseDto> {
    const skip = (page - 1) * limit;

    let query = this.bannerRepository.createQueryBuilder('banner');

    if (onlyActive) {
      query = query.where('banner.isActive = :isActive', { isActive: true });
    }

    const [items, total] = await query
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const pages = Math.ceil(total / limit);

    return {
      items: items.map(item => this.mapToResponseDto(item)),
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * 获取单个Banner
   */
  async getBannerById(id: number): Promise<BannerResponseDto> {
    const banner = await this.bannerRepository.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return this.mapToResponseDto(banner);
  }

  /**
   * 获取首页展示的Banner列表（仅包括启用的）
   */
  async getHomeBanners(): Promise<BannerResponseDto[]> {
    const banners = await this.bannerRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });

    return banners.map(item => this.mapToResponseDto(item));
  }

  /**
   * 创建Banner
   */
  async createBanner(createBannerDto: CreateBannerDto): Promise<BannerResponseDto> {
    const banner = this.bannerRepository.create(createBannerDto);
    const savedBanner = await this.bannerRepository.save(banner);

    return this.mapToResponseDto(savedBanner);
  }

  /**
   * 更新Banner
   */
  async updateBanner(id: number, updateBannerDto: UpdateBannerDto): Promise<BannerResponseDto> {
    const banner = await this.bannerRepository.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    Object.assign(banner, updateBannerDto);
    const updatedBanner = await this.bannerRepository.save(banner);

    return this.mapToResponseDto(updatedBanner);
  }

  /**
   * 删除Banner
   */
  async deleteBanner(id: number): Promise<void> {
    const banner = await this.bannerRepository.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    // 如果有关联的媒体文件，则删除COS中的文件
    if (banner.imageKey) {
      await this.deleteMediaFromCos(banner.imageKey);
    }
    if (banner.videoKey) {
      await this.deleteMediaFromCos(banner.videoKey);
    }
    if (banner.videoThumbnailKey) {
      await this.deleteMediaFromCos(banner.videoThumbnailKey);
    }

    await this.bannerRepository.remove(banner);
  }

  /**
   * 上传图片
   */
  async uploadImage(bannerId: number, file: Express.Multer.File): Promise<BannerResponseDto> {
    const banner = await this.bannerRepository.findOne({ where: { id: bannerId } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${bannerId} not found`);
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // 删除旧的图片文件
    if (banner.imageKey) {
      await this.deleteMediaFromCos(banner.imageKey);
    }

    // 上传新图片到COS
    const result = await this.uploadFileToCos(file, 'banners');

    banner.imageUrl = result.url;
    banner.imageKey = result.key;
    banner.type = 'image';

    const updatedBanner = await this.bannerRepository.save(banner);

    return this.mapToResponseDto(updatedBanner);
  }

  /**
   * 上传视频（自动转换为WebP格式）
   *
   * 注意：此功能需要ffmpeg支持
   * 1. 上传视频文件
   * 2. 使用ffmpeg转换为WebP格式（高质量压缩）
   * 3. 同时生成视频封面
   * 4. 上传转换后的文件到COS
   * 5. 删除本地临时文件
   */
  async uploadVideo(bannerId: number, file: Express.Multer.File): Promise<BannerResponseDto> {
    const banner = await this.bannerRepository.findOne({ where: { id: bannerId } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${bannerId} not found`);
    }

    // 验证文件类型
    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only MP4, MOV, AVI, and MPEG videos are allowed');
    }

    // 删除旧的视频文件
    if (banner.videoKey) {
      await this.deleteMediaFromCos(banner.videoKey);
    }
    if (banner.videoThumbnailKey) {
      await this.deleteMediaFromCos(banner.videoThumbnailKey);
    }

    // 转换视频为WebP格式
    const tempDir = path.join('/tmp', `banner-${bannerId}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // 保存上传的原始文件
      const originalPath = path.join(tempDir, `original${path.extname(file.originalname)}`);
      fs.writeFileSync(originalPath, file.buffer);

      // 转换为WebP格式（高质量）
      const webpPath = path.join(tempDir, 'video.webp');
      await this.convertVideoToWebp(originalPath, webpPath);

      // 生成视频封面
      const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');
      await this.extractVideoThumbnail(originalPath, thumbnailPath);

      // 读取转换后的文件
      const webpBuffer = fs.readFileSync(webpPath);
      const thumbnailBuffer = fs.readFileSync(thumbnailPath);

      // 上传WebP视频到COS
      const webpFile: Express.Multer.File = {
        fieldname: 'video',
        originalname: 'video.webp',
        encoding: '7bit',
        mimetype: 'video/webp',
        size: webpBuffer.length,
        destination: tempDir,
        filename: 'video.webp',
        path: webpPath,
        buffer: webpBuffer,
      } as any;

      const videoResult = await this.uploadFileToCos(webpFile, 'banners/videos');

      // 上传视频封面到COS
      const thumbnailFile: Express.Multer.File = {
        fieldname: 'thumbnail',
        originalname: 'thumbnail.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: thumbnailBuffer.length,
        destination: tempDir,
        filename: 'thumbnail.jpg',
        path: thumbnailPath,
        buffer: thumbnailBuffer,
      } as any;

      const thumbnailResult = await this.uploadFileToCos(thumbnailFile, 'banners/thumbnails');

      // 更新Banner
      banner.videoUrl = videoResult.url;
      banner.videoKey = videoResult.key;
      banner.videoThumbnailUrl = thumbnailResult.url;
      banner.videoThumbnailKey = thumbnailResult.key;
      banner.type = 'video';

      const updatedBanner = await this.bannerRepository.save(banner);

      return this.mapToResponseDto(updatedBanner);
    } finally {
      // 清理临时文件
      this.cleanupTempDir(tempDir);
    }
  }

  /**
   * 将视频转换为WebP格式（高质量）
   * 使用ffmpeg进行转换
   */
  private async convertVideoToWebp(inputPath: string, outputPath: string): Promise<void> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      // FFmpeg WebP编码参数说明：
      // -c:v libwebp_aom: 使用WebP视频编码器（高质量）
      // -q:v 80: 质量等级（1-100，80为高质量）
      // -pix_fmt yuva420p: 像素格式支持透明度
      // -c:a libopus: 音频编码器
      // -b:a 128k: 音频比特率

      await execAsync(
        `ffmpeg -i "${inputPath}" -c:v libwebp_aom -q:v 80 -pix_fmt yuva420p -c:a libopus -b:a 128k "${outputPath}"`,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to convert video to WebP format. Make sure FFmpeg is installed. Error: ${error.message}`,
      );
    }
  }

  /**
   * 从视频提取封面图片
   */
  private async extractVideoThumbnail(videoPath: string, outputPath: string): Promise<void> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      // 从视频的第2秒截取一帧作为封面
      // -ss 2: 跳转到2秒
      // -vframes 1: 只提取1帧
      // -q:v 2: 图片质量（1-31，2为高质量）

      await execAsync(
        `ffmpeg -i "${videoPath}" -ss 2 -vframes 1 -q:v 2 "${outputPath}"`,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to extract video thumbnail. Error: ${error.message}`,
      );
    }
  }

  /**
   * 上传文件到COS
   */
  private async uploadFileToCos(
    file: Express.Multer.File,
    folder: string = 'banners',
  ): Promise<{ url: string; key: string }> {
    try {
      // 构建COS上传URL
      const secretId = this.configService.get<string>('COS_SECRET_ID');
      const secretKey = this.configService.get<string>('COS_SECRET_KEY');
      const bucket = this.configService.get<string>('COS_BUCKET');
      const region = this.configService.get<string>('COS_REGION');
      const cosHost = `https://${bucket}.cos.${region}.myqcloud.com`;

      // 生成文件Key（带时间戳和随机值）
      const timestamp = Date.now();
      const random = crypto.randomBytes(6).toString('hex');
      const ext = path.extname(file.originalname);
      const fileKey = `${folder}/${timestamp}-${random}${ext}`;

      // 调用Media Service的COS上传接口
      // 这里使用已有的media service上传能力
      const mediaService = require('../media/media.service').MediaService;
      // 或者直接调用cos sdk

      // 简化实现：直接构建COS URL（实际应该通过SDK上传）
      // 这里应该使用cos-nodejs-sdk-v5来上传文件

      // 示例实现（需要安装cos-nodejs-sdk-v5）：
      /*
      const COS = require('cos-nodejs-sdk-v5');
      const cos = new COS({
        SecretId: secretId,
        SecretKey: secretKey,
      });

      return new Promise((resolve, reject) => {
        cos.putObject(
          {
            Bucket: bucket,
            Region: region,
            Key: fileKey,
            Body: file.buffer,
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                url: `${cosHost}/${fileKey}`,
                key: fileKey,
              });
            }
          },
        );
      });
      */

      // 临时实现：返回模拟的URL
      // TODO: 集成实际的COS上传逻辑
      return {
        url: `${cosHost}/${fileKey}`,
        key: fileKey,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file to COS: ${error.message}`);
    }
  }

  /**
   * 从COS删除媒体文件
   */
  private async deleteMediaFromCos(fileKey: string): Promise<void> {
    try {
      // TODO: 集成实际的COS删除逻辑
      // 使用cos-nodejs-sdk-v5的deleteObject方法
    } catch (error) {
      // 日志记录，但不抛出错误，避免影响主流程
      console.error(`Failed to delete file from COS: ${fileKey}`, error);
    }
  }

  /**
   * 清理临时目录
   */
  private cleanupTempDir(tempDir: string): void {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Failed to cleanup temp directory: ${tempDir}`, error);
    }
  }

  /**
   * 将Banner Entity映射为Response DTO
   */
  private mapToResponseDto(banner: Banner): BannerResponseDto {
    return {
      id: banner.id,
      mainTitle: banner.mainTitle,
      subtitle: banner.subtitle,
      description: banner.description,
      type: banner.type,
      imageUrl: banner.imageUrl,
      videoUrl: banner.videoUrl,
      videoThumbnailUrl: banner.videoThumbnailUrl,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      linkType: banner.linkType,
      linkValue: banner.linkValue,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}
