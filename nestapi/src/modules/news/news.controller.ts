import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto, NewsListResponseDto } from './dto/news-response.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  /**
   * 获取资讯列表（分页）
   * GET /api/news?page=1&limit=10
   */
  @Get()
  @ApiOperation({ summary: 'Get news list with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved news list' })
  async getNewsList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ code: number; message: string; data: NewsListResponseDto }> {
    const data = await this.newsService.getNewsList(page, limit);
    return {
      code: 200,
      message: 'Successfully retrieved news list',
      data,
    };
  }

  /**
   * 获取单个资讯详情
   * GET /api/news/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get news by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'News ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved news' })
  async getNewsById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: NewsResponseDto }> {
    const data = await this.newsService.getNewsDetail(id);
    return {
      code: 200,
      message: 'Successfully retrieved news',
      data,
    };
  }

  /**
   * 创建资讯
   * POST /api/news
   * Body: { title, subtitle?, description?, sortOrder?, isActive? }
   */
  @Post()
  @ApiOperation({ summary: 'Create a new news' })
  @ApiResponse({ status: 201, description: 'News created successfully' })
  async createNews(
    @Body() createNewsDto: CreateNewsDto,
  ): Promise<{ code: number; message: string; data: NewsResponseDto }> {
    const data = await this.newsService.createNews(createNewsDto);
    return {
      code: 201,
      message: 'News created successfully',
      data,
    };
  }

  /**
   * 更新资讯
   * PUT /api/news/:id
   * Body: { title?, subtitle?, description?, sortOrder?, isActive? }
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update news' })
  @ApiParam({ name: 'id', type: Number, description: 'News ID' })
  @ApiResponse({ status: 200, description: 'News updated successfully' })
  async updateNews(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<{ code: number; message: string; data: NewsResponseDto }> {
    const data = await this.newsService.updateNews(id, updateNewsDto);
    return {
      code: 200,
      message: 'News updated successfully',
      data,
    };
  }

  /**
   * 删除资讯
   * DELETE /api/news/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete news' })
  @ApiParam({ name: 'id', type: Number, description: 'News ID' })
  @ApiResponse({ status: 200, description: 'News deleted successfully' })
  async deleteNews(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.newsService.deleteNews(id);
    return {
      code: 200,
      message: 'News deleted successfully',
    };
  }

  /**
   * 上传资讯封面图
   * POST /api/news/:id/upload-cover-image
   * Content-Type: multipart/form-data
   * File field: file (image/jpeg, image/png, image/webp)
   */
  @Post(':id/upload-cover-image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ code: number; message: string; data: NewsResponseDto }> {
    const data = await this.newsService.uploadCoverImage(id, file);
    return {
      code: 200,
      message: '封面图上传成功',
      data,
    };
  }

  /**
   * 上传资讯详情图
   * POST /api/news/:id/upload-detail-image
   * Content-Type: multipart/form-data
   * File field: file (image/jpeg, image/png, image/webp)
   */
  @Post(':id/upload-detail-image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDetailImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ code: number; message: string; data: NewsResponseDto }> {
    const data = await this.newsService.uploadDetailImage(id, file);
    return {
      code: 200,
      message: '详情图上传成功',
      data,
    };
  }
}
