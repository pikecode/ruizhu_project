import { ConfigService } from '@nestjs/config';
export declare class CosService {
    private configService;
    private cos;
    private readonly logger;
    private readonly bucket;
    private readonly region;
    constructor(configService: ConfigService);
    uploadFile(key: string, fileBuffer: Buffer, contentType?: string): Promise<string>;
    deleteFile(key: string): Promise<void>;
    getSignedUrl(key: string, expiresIn?: number): string;
    getAuthenticatedUrl(key: string, expiresIn?: number): string;
}
