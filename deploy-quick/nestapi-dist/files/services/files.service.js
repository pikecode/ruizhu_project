"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("../entities/file.entity");
const cos_service_1 = require("./cos.service");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let FilesService = FilesService_1 = class FilesService {
    fileRepository;
    cosService;
    configService;
    logger = new common_1.Logger(FilesService_1.name);
    maxFileSize;
    constructor(fileRepository, cosService, configService) {
        this.fileRepository = fileRepository;
        this.cosService = cosService;
        this.configService = configService;
        this.maxFileSize =
            this.configService.get('COS_UPLOAD_MAX_SIZE') || 52428800;
    }
    async uploadFile(file, uploadedBy) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
        }
        try {
            const timestamp = Date.now();
            const random = crypto.randomBytes(4).toString('hex');
            const ext = file.originalname.split('.').pop();
            const cosKey = `uploads/${timestamp}-${random}.${ext}`;
            const url = await this.cosService.uploadFile(cosKey, file.buffer, file.mimetype);
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
        }
        catch (error) {
            this.logger.error(`File upload failed: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async getAllFiles(limit = 20, offset = 0) {
        const [data, total] = await this.fileRepository.findAndCount({
            where: { isDeleted: false },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { data, total };
    }
    async getFileById(id) {
        const file = await this.fileRepository.findOne({
            where: { id, isDeleted: false },
        });
        if (!file) {
            throw new common_1.NotFoundException(`File with ID ${id} not found`);
        }
        return file;
    }
    async deleteFile(id) {
        const file = await this.getFileById(id);
        try {
            await this.cosService.deleteFile(file.cosKey);
            await this.fileRepository.update(id, { isDeleted: true });
            this.logger.log(`File deleted: ${file.originalName}`);
        }
        catch (error) {
            this.logger.error(`File deletion failed: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete file: ${error.message}`);
        }
    }
    async getDownloadUrl(id, expiresIn = 3600) {
        const file = await this.getFileById(id);
        const signedUrl = this.cosService.getSignedUrl(file.cosKey, expiresIn);
        return { url: signedUrl || file.url };
    }
    async getFileStats() {
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
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cos_service_1.CosService,
        config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map