import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto, BannerListResponseDto } from './dto/banner.dto';
import { ConfigService } from '@nestjs/config';
import { MediaService } from '../media/media.service';
import { UrlHelper } from '../../common/utils/url.helper';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    private configService: ConfigService,
    private mediaService: MediaService,
    private urlHelper: UrlHelper,
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
    if (banner.imageUrl) {
      await this.mediaService.deleteMedia(banner.imageUrl);
    }
    if (banner.videoUrl) {
      await this.mediaService.deleteMedia(banner.videoUrl);
    }
    if (banner.videoThumbnailUrl) {
      await this.mediaService.deleteMedia(banner.videoThumbnailUrl);
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

    // 删除旧的图片文件（使用文件键删除）
    if (banner.imageKey) {
      await this.mediaService.deleteMedia(banner.imageKey);
    }

    // 上传新图片到COS
    const result = await this.mediaService.uploadMedia(file, 'image');

    // 只存储文件键，不存储完整URL
    // 前端或其他调用者可以通过 UrlHelper 动态拼接完整URL
    banner.imageKey = result.key;
    banner.imageUrl = null; // 清除URL字段，改为存储key
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
    if (banner.videoUrl) {
      await this.mediaService.deleteMedia(banner.videoUrl);
    }
    if (banner.videoThumbnailUrl) {
      await this.mediaService.deleteMedia(banner.videoThumbnailUrl);
    }

    // 转换视频为WebP格式
    const tempDir = path.join('/tmp', `banner-${bannerId}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // 保存上传的原始文件
      const originalPath = path.join(tempDir, `original${path.extname(file.originalname)}`);
      fs.writeFileSync(originalPath, file.buffer);

      // 转换为WebM格式（VP9编码，高质量）
      const webmPath = path.join(tempDir, 'video.webm');
      await this.convertVideoToWebp(originalPath, webmPath);

      // 生成视频封面
      const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');
      await this.extractVideoThumbnail(originalPath, thumbnailPath);

      // 读取转换后的文件
      const webmBuffer = fs.readFileSync(webmPath);
      const thumbnailBuffer = fs.readFileSync(thumbnailPath);

      // 上传WebM视频到COS
      const webmFile: Express.Multer.File = {
        fieldname: 'video',
        originalname: 'video.webm',
        encoding: '7bit',
        mimetype: 'video/webm',
        size: webmBuffer.length,
        destination: tempDir,
        filename: 'video.webm',
        path: webmPath,
        buffer: webmBuffer,
      } as any;

      const videoResult = await this.mediaService.uploadMedia(webmFile, 'video');

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

      const thumbnailResult = await this.mediaService.uploadMedia(thumbnailFile, 'image');

      // 更新Banner - 只存储文件键
      banner.videoKey = videoResult.key;
      banner.videoUrl = null; // 清除URL字段
      banner.videoThumbnailKey = thumbnailResult.key;
      banner.videoThumbnailUrl = null; // 清除URL字段
      banner.type = 'video';

      const updatedBanner = await this.bannerRepository.save(banner);

      return this.mapToResponseDto(updatedBanner);
    } finally {
      // 清理临时文件
      this.cleanupTempDir(tempDir);
    }
  }

  /**
   * 将视频转换为WebM格式（VP9编码，高质量压缩）
   * 使用ffmpeg进行转换
   */
  private async convertVideoToWebp(inputPath: string, outputPath: string): Promise<void> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      // FFmpeg VP9编码参数说明：
      // -c:v libvpx-vp9: 使用VP9视频编码器（高效压缩）
      // -crf 28: 质量等级（0-63，28为平衡质量与文件大小）
      // -b:v 0: 让crf控制比特率
      // -c:a libopus: 音频编码器
      // -b:a 128k: 音频比特率
      // 使用WebM容器格式（.webm）而不是.webp，因为.webp只支持WebP视频编码
      const webmPath = outputPath.replace(/\.webp$/, '.webm');

      await execAsync(
        `ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -crf 28 -b:v 0 -c:a libopus -b:a 128k "${webmPath}"`,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to convert video to WebM format. Make sure FFmpeg is installed. Error: ${error.message}`,
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
   * 动态生成URL：从存储的文件键 + 配置的域名拼接完整URL
   * 这样可以随时更改域名而无需更新数据库
   */
  private mapToResponseDto(banner: Banner): BannerResponseDto {
    return {
      id: banner.id,
      mainTitle: banner.mainTitle,
      subtitle: banner.subtitle,
      description: banner.description,
      type: banner.type,
      // 动态生成URL：优先使用文件键生成（支持域名替换）
      imageUrl: banner.imageKey ? this.urlHelper.generateUrl(banner.imageKey) : banner.imageUrl,
      videoUrl: banner.videoKey ? this.urlHelper.generateUrl(banner.videoKey) : banner.videoUrl,
      videoThumbnailUrl: banner.videoThumbnailKey
        ? this.urlHelper.generateUrl(banner.videoThumbnailKey)
        : banner.videoThumbnailUrl,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      linkType: banner.linkType,
      linkValue: banner.linkValue,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}
