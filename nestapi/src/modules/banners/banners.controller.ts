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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto, BannerListResponseDto } from './dto/banner.dto';

@Controller('api/v1/banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  /**
   * 获取Banner列表（分页）
   * GET /api/v1/banners?page=1&limit=10
   */
  @Get()
  async getBannerList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ code: number; message: string; data: BannerListResponseDto }> {
    const data = await this.bannersService.getBannerList(page, limit);
    return {
      code: 200,
      message: 'Successfully retrieved banner list',
      data,
    };
  }

  /**
   * 获取首页展示的Banner列表（仅启用的）
   * GET /api/v1/banners/home
   */
  @Get('home')
  async getHomeBanners(): Promise<{ code: number; message: string; data: BannerResponseDto[] }> {
    const data = await this.bannersService.getHomeBanners();
    return {
      code: 200,
      message: 'Successfully retrieved home banners',
      data,
    };
  }

  /**
   * 获取单个Banner详情
   * GET /api/v1/banners/:id
   */
  @Get(':id')
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
   * POST /api/v1/banners
   * Body: { mainTitle, subtitle?, description?, sortOrder?, isActive?, linkType?, linkValue? }
   */
  @Post()
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
   * PUT /api/v1/banners/:id
   * Body: { mainTitle?, subtitle?, description?, sortOrder?, isActive?, linkType?, linkValue? }
   */
  @Put(':id')
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
   * DELETE /api/v1/banners/:id
   */
  @Delete(':id')
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
   * POST /api/v1/banners/:id/upload-image
   * Content-Type: multipart/form-data
   * File field: file (image/jpeg, image/png, image/webp)
   */
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
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
   * POST /api/v1/banners/:id/upload-video
   * Content-Type: multipart/form-data
   * File field: file (video/mp4, video/quicktime, video/x-msvideo, video/mpeg)
   *
   * 注意：此接口会进行以下处理：
   * 1. 验证视频格式
   * 2. 使用FFmpeg转换为WebP格式（高质量压缩）
   * 3. 提取视频第2秒作为封面图片
   * 4. 同时上传转换后的视频和封面到COS
   * 5. 删除本地临时文件
   *
   * 所需依赖：ffmpeg （需要在服务器安装）
   * 安装命令：brew install ffmpeg (macOS) 或 apt-get install ffmpeg (Linux)
   */
  @Post(':id/upload-video')
  @UseInterceptors(FileInterceptor('file'))
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
