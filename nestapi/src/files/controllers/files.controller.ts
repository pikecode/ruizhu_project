import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../services/files.service';
import { File } from '../entities/file.entity';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  /**
   * 上传文件
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any): Promise<File> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.filesService.uploadFile(file, 'admin');
  }

  /**
   * 获取所有文件（分页）
   */
  @Get()
  async getAllFiles(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ): Promise<{ data: File[]; total: number }> {
    return this.filesService.getAllFiles(
      Math.min(parseInt(limit as any), 100),
      parseInt(offset as any),
    );
  }

  /**
   * 获取单个文件信息
   */
  @Get(':id')
  async getFileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<File> {
    return this.filesService.getFileById(id);
  }

  /**
   * 删除文件
   */
  @Delete(':id')
  async deleteFile(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.filesService.deleteFile(id);
  }

  /**
   * 获取文件下载链接
   */
  @Get(':id/download-url')
  async getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @Query('expiresIn') expiresIn = 3600,
  ): Promise<{ url: string }> {
    return this.filesService.getDownloadUrl(
      id,
      parseInt(expiresIn as any),
    );
  }

  /**
   * 获取文件统计信息
   */
  @Get('stats/overview')
  async getFileStats(): Promise<{
    total: number;
    byType: { type: string; count: number }[];
    totalSize: number;
  }> {
    return this.filesService.getFileStats();
  }
}
