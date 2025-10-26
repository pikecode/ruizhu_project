import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CosService } from './cos.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly maxFileSize: number;

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private cosService: CosService,
    private configService: ConfigService,
  ) {
    this.maxFileSize =
      this.configService.get<number>('COS_UPLOAD_MAX_SIZE') || 52428800; // 50MB
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: any,
    uploadedBy?: string,
  ): Promise<File> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    try {
      // 生成唯一的 COS key
      const timestamp = Date.now();
      const random = crypto.randomBytes(4).toString('hex');
      const ext = file.originalname.split('.').pop();
      const cosKey = `uploads/${timestamp}-${random}.${ext}`;

      // 上传到 COS
      const url = await this.cosService.uploadFile(
        cosKey,
        file.buffer,
        file.mimetype,
      );

      // 保存文件元数据到数据库
      const fileRecord = this.fileRepository.create({
        fileName: `${timestamp}-${random}.${ext}`,
        originalName: file.originalname,
        cosKey,
        url,
        mimeType: file.mimetype,
        size: file.size,
        fileType: ext.toLowerCase(),
        uploadedBy: uploadedBy || 'unknown',
      });

      const savedFile = await this.fileRepository.save(fileRecord);
      this.logger.log(`File uploaded: ${file.originalname} -> ${url}`);

      return savedFile;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new BadRequestException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  /**
   * 获取所有文件
   */
  async getAllFiles(limit = 20, offset = 0): Promise<{ data: File[]; total: number }> {
    const [data, total] = await this.fileRepository.findAndCount({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  /**
   * 获取单个文件信息
   */
  async getFileById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  /**
   * 删除文件（软删除）
   */
  async deleteFile(id: number): Promise<void> {
    const file = await this.getFileById(id);

    try {
      // 从 COS 删除文件
      await this.cosService.deleteFile(file.cosKey);

      // 在数据库中标记为删除
      await this.fileRepository.update(id, { isDeleted: true });

      this.logger.log(`File deleted: ${file.originalName}`);
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw new BadRequestException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  /**
   * 获取文件下载 URL
   */
  async getDownloadUrl(id: number, expiresIn = 3600): Promise<{ url: string }> {
    const file = await this.getFileById(id);
    const signedUrl = this.cosService.getSignedUrl(file.cosKey, expiresIn);

    return { url: signedUrl || file.url };
  }

  /**
   * 按文件类型统计
   */
  async getFileStats(): Promise<{
    total: number;
    byType: { type: string; count: number }[];
    totalSize: number;
  }> {
    const total = await this.fileRepository.count({
      where: { isDeleted: false },
    });

    const byType = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.fileType', 'type')
      .addSelect('COUNT(file.id)', 'count')
      .where('file.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('file.fileType')
      .getRawMany();

    const totalSizeResult = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'totalSize')
      .where('file.isDeleted = :isDeleted', { isDeleted: false })
      .getRawOne();

    return {
      total,
      byType: byType.map((item) => ({
        type: item.type || 'unknown',
        count: parseInt(item.count),
      })),
      totalSize: parseInt(totalSizeResult?.totalSize || 0),
    };
  }
}
