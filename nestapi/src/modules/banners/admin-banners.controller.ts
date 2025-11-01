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
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto, BannerListResponseDto } from './dto/banner.dto';

/**
 * Admin Banners Controller
 * 路由前缀: /api/admin/banners
 * 注：管理系统使用独立的 /admin/* 路由与消费端区分，不需要额外的权限守卫
 */
@ApiTags('Admin Banners')
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private bannersService: BannersService) {}

  /**
   * 获取Banner列表（分页）
   * GET /api/admin/banners?page=1&limit=10&pageType=home
   * pageType: 'home' | 'custom' (default: 'home')
   */
  @Get()
  @ApiOperation({ summary: 'Get banners list with pagination (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'pageType', required: false, enum: ['home', 'custom'], description: 'Banner page type' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved banner list' })
  async getBannerList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('pageType') pageType: 'home' | 'custom' = 'home',
  ): Promise<{ code: number; message: string; data: BannerListResponseDto }> {
    const data = await this.bannersService.getBannerList(page, limit, false, pageType);
    return {
      code: 200,
      message: 'Successfully retrieved banner list',
      data,
    };
  }

  /**
   * 获取单个Banner详情
   * GET /api/admin/banners/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved banner' })
  async getBannerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: BannerResponseDto }> {
    const data = await this.bannersService.getBannerById(id);
    return {
      code: 200,
      message: 'Successfully retrieved banner',
      data,
    };
  }

  /**
   * 创建Banner
   * POST /api/admin/banners
   * Body: { mainTitle, subtitle?, description?, sortOrder?, isActive?, linkType?, linkValue? }
   */
  @Post()
  @ApiOperation({ summary: 'Create a new banner (admin)' })
  @ApiResponse({ status: 201, description: 'Banner created successfully' })
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
  ): Promise<{ code: number; message: string; data: BannerResponseDto }> {
    const data = await this.bannersService.createBanner(createBannerDto);
    return {
      code: 201,
      message: 'Banner created successfully',
      data,
    };
  }

  /**
   * 更新Banner
   * PUT /api/admin/banners/:id
   * Body: { mainTitle?, subtitle?, description?, sortOrder?, isActive?, linkType?, linkValue? }
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update banner (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner updated successfully' })
  async updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<{ code: number; message: string; data: BannerResponseDto }> {
    const data = await this.bannersService.updateBanner(id, updateBannerDto);
    return {
      code: 200,
      message: 'Banner updated successfully',
      data,
    };
  }

  /**
   * 删除Banner
   * DELETE /api/admin/banners/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete banner (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully' })
  async deleteBanner(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.bannersService.deleteBanner(id);
    return {
      code: 200,
      message: 'Banner deleted successfully',
    };
  }

  /**
   * 上传Banner图片
   * POST /api/admin/banners/:id/upload-image
   * Content-Type: multipart/form-data
   * File field: file (image/jpeg, image/png, image/webp)
   */
  @Post(':id/upload-image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload banner image (admin)' })
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ code: number; message: string; data: BannerResponseDto }> {
    const data = await this.bannersService.uploadImage(id, file);
    return {
      code: 200,
      message: 'Image uploaded successfully',
      data,
    };
  }

  /**
   * 上传Banner视频（自动转换为WebP格式）
   * POST /api/admin/banners/:id/upload-video
   * Content-Type: multipart/form-data
   * File field: file (video/mp4, video/quicktime, video/x-msvideo, video/mpeg)
   *
   * 注意：此接口会进行以下处理：
   * 1. 验证视频格式
   * 2. 使用FFmpeg转换为WebP格式（高质量压缩）
   * 3. 提取视频第2秒作为封面图片
   * 4. 同时上传转换后的视频和封面到COS
   * 5. 删除本地临时文件
   */
  @Post(':id/upload-video')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload banner video (admin)' })
  async uploadVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ code: number; message: string; data: BannerResponseDto }> {
    const data = await this.bannersService.uploadVideo(id, file);
    return {
      code: 200,
      message: 'Video uploaded and converted to WebP successfully',
      data,
    };
  }
}
