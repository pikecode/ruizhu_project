import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * 获取腾讯云COS上传凭证
   * GET /api/v1/media/cos-credentials
   */
  @Get('cos-credentials')
  async getCOSCredentials() {
    const credentials = await this.mediaService.getUploadCredentials();
    return {
      code: 200,
      message: 'Success',
      data: credentials,
    };
  }

  /**
   * 上传媒体文件
   * POST /api/v1/media/upload
   * Body: multipart/form-data { file, type }
   */
  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: any,
    @Body() body: { type?: 'image' | 'video' },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // 确定文件类型
    let type: 'image' | 'video' = body?.type || 'image';
    if (file.mimetype.startsWith('video/')) {
      type = 'video';
    } else if (file.mimetype.startsWith('image/')) {
      type = 'image';
    }

    const result = await this.mediaService.uploadMedia(file, type);

    return {
      code: 200,
      message: 'Success',
      data: result,
    };
  }

  /**
   * 删除媒体文件
   * DELETE /api/v1/media/delete
   * Body: { url }
   */
  @Delete('delete')
  @HttpCode(200)
  async deleteMedia(@Body() body: { url: string }) {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }

    await this.mediaService.deleteMedia(body.url);

    return {
      code: 200,
      message: 'Success',
    };
  }

  /**
   * 获取图片信息（宽高）
   * POST /api/v1/media/image-info
   * Body: { url }
   */
  @Post('image-info')
  async getImageInfo(@Body() body: { url: string }) {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }

    const info = await this.mediaService.getImageInfo(body.url);

    return {
      code: 200,
      message: 'Success',
      data: info,
    };
  }

  /**
   * 生成缩略图
   * POST /api/v1/media/thumbnail
   * Body: { url, width?, height? }
   */
  @Post('thumbnail')
  async generateThumbnail(
    @Body() body: { url: string; width?: number; height?: number },
  ) {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }

    const thumbnailUrl = await this.mediaService.generateThumbnail(
      body.url,
      body.width,
      body.height,
    );

    return {
      code: 200,
      message: 'Success',
      data: {
        thumbnailUrl,
      },
    };
  }
}
