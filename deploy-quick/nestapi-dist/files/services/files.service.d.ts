import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CosService } from './cos.service';
import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private fileRepository;
    private cosService;
    private configService;
    private readonly logger;
    private readonly maxFileSize;
    constructor(fileRepository: Repository<File>, cosService: CosService, configService: ConfigService);
    uploadFile(file: any, uploadedBy?: string): Promise<File>;
    getAllFiles(limit?: number, offset?: number): Promise<{
        data: File[];
        total: number;
    }>;
    getFileById(id: number): Promise<File>;
    deleteFile(id: number): Promise<void>;
    getDownloadUrl(id: number, expiresIn?: number): Promise<{
        url: string;
    }>;
    getFileStats(): Promise<{
        total: number;
        byType: {
            type: string;
            count: number;
        }[];
        totalSize: number;
    }>;
}
