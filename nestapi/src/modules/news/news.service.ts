import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto, NewsListResponseDto } from './dto/news-response.dto';
import { MediaService } from '../media/media.service';
import { UrlHelper } from '../../common/utils/url.helper';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    private mediaService: MediaService,
    private urlHelper: UrlHelper,
  ) {}

  /**
   * 创建资讯
   */
  async createNews(createDto: CreateNewsDto): Promise<NewsResponseDto> {
    const news = this.newsRepository.create({
      ...createDto,
      sortOrder: createDto.sortOrder ?? 0,
      isActive: createDto.isActive ?? true,
    });
    const saved = await this.newsRepository.save(news);
    return this.formatNewsResponse(saved);
  }

  /**
   * 更新资讯
   */
  async updateNews(id: number, updateDto: UpdateNewsDto): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException(`资讯 ID ${id} 不存在`);
    }

    Object.assign(news, updateDto);
    const updated = await this.newsRepository.save(news);
    return this.formatNewsResponse(updated);
  }

  /**
   * 获取资讯列表
   */
  async getNewsList(page: number = 1, limit: number = 10): Promise<NewsListResponseDto> {
    const [items, total] = await this.newsRepository.findAndCount({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pages = Math.ceil(total / limit);

    return {
      items: items.map((item) => this.formatNewsResponse(item)),
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * 获取资讯详情
   */
  async getNewsDetail(id: number): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException(`资讯 ID ${id} 不存在`);
    }

    return this.formatNewsResponse(news);
  }

  /**
   * 删除资讯
   */
  async deleteNews(id: number): Promise<void> {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException(`资讯 ID ${id} 不存在`);
    }

    // 删除关联的媒体文件
    await this.cleanupNewsMedia(news);

    await this.newsRepository.remove(news);
  }

  /**
   * 上传资讯封面图
   */
  async uploadCoverImage(newsId: number, file: Express.Multer.File): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });

    if (!news) {
      throw new NotFoundException(`资讯 ID ${newsId} 不存在`);
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持 JPEG、PNG、WebP 格式');
    }

    // 删除旧的封面图文件
    if (news.coverImageKey) {
      await this.mediaService.deleteMedia(news.coverImageKey);
    }

    // 上传新图片到COS
    const result = await this.mediaService.uploadMedia(file, 'image');

    // 只存储文件键
    news.coverImageKey = result.key;

    const updated = await this.newsRepository.save(news);
    return this.formatNewsResponse(updated);
  }

  /**
   * 上传资讯详情图
   */
  async uploadDetailImage(newsId: number, file: Express.Multer.File): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });

    if (!news) {
      throw new NotFoundException(`资讯 ID ${newsId} 不存在`);
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持 JPEG、PNG、WebP 格式');
    }

    // 删除旧的详情图文件
    if (news.detailImageKey) {
      await this.mediaService.deleteMedia(news.detailImageKey);
    }

    // 上传新图片到COS
    const result = await this.mediaService.uploadMedia(file, 'image');

    // 只存储文件键
    news.detailImageKey = result.key;

    const updated = await this.newsRepository.save(news);
    return this.formatNewsResponse(updated);
  }

  /**
   * 删除资讯时清理关联的媒体文件
   */
  private async cleanupNewsMedia(news: News): Promise<void> {
    if (news.coverImageKey) {
      await this.mediaService.deleteMedia(news.coverImageKey);
    }
    if (news.detailImageKey) {
      await this.mediaService.deleteMedia(news.detailImageKey);
    }
  }

  /**
   * 格式化资讯响应
   * 动态生成URL：从存储的文件键 + 配置的域名拼接完整URL
   * 这样可以随时更改域名而无需更新数据库
   */
  private formatNewsResponse(news: News): NewsResponseDto {
    return {
      id: news.id,
      title: news.title,
      subtitle: news.subtitle,
      description: news.description,
      // 动态生成URL：优先使用文件键生成（支持域名替换）
      coverImageUrl: news.coverImageKey ? this.urlHelper.generateUrl(news.coverImageKey) : null,
      detailImageUrl: news.detailImageKey ? this.urlHelper.generateUrl(news.detailImageKey) : null,
      isActive: news.isActive,
      sortOrder: news.sortOrder,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    };
  }
}
