import { FilesService } from '../services/files.service';
import { File } from '../entities/file.entity';
export declare class FilesController {
    private filesService;
    constructor(filesService: FilesService);
    uploadFile(file: any): Promise<File>;
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
