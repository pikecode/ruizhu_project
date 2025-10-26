"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cos_nodejs_sdk_v5_1 = __importDefault(require("cos-nodejs-sdk-v5"));
let CosService = CosService_1 = class CosService {
    configService;
    cos;
    logger = new common_1.Logger(CosService_1.name);
    bucket;
    region;
    constructor(configService) {
        this.configService = configService;
        const secretId = this.configService.get('COS_SECRET_ID') || '';
        const secretKey = this.configService.get('COS_SECRET_KEY') || '';
        this.bucket = this.configService.get('COS_BUCKET') || '';
        this.region = this.configService.get('COS_REGION') || '';
        this.cos = new cos_nodejs_sdk_v5_1.default({
            SecretId: secretId,
            SecretKey: secretKey,
        });
    }
    async uploadFile(key, fileBuffer, contentType = 'application/octet-stream') {
        return new Promise((resolve, reject) => {
            this.cos.putObject({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
            }, (err, data) => {
                if (err) {
                    this.logger.error(`COS upload error: ${err.message}`);
                    reject(err);
                }
                else {
                    const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
                    this.logger.log(`File uploaded successfully: ${url}`);
                    resolve(url);
                }
            });
        });
    }
    async deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.cos.deleteObject({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
            }, (err) => {
                if (err) {
                    this.logger.error(`COS delete error: ${err.message}`);
                    reject(err);
                }
                else {
                    this.logger.log(`File deleted successfully: ${key}`);
                    resolve();
                }
            });
        });
    }
    getSignedUrl(key, expiresIn = 3600) {
        const url = this.cos.getObjectUrl({
            Bucket: this.bucket,
            Region: this.region,
            Key: key,
        }, (err, data) => {
            if (err) {
                this.logger.error(`Generate signed URL error: ${err.message}`);
                return null;
            }
            return data.Url;
        });
        return url;
    }
    getAuthenticatedUrl(key, expiresIn = 3600) {
        return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
    }
};
exports.CosService = CosService;
exports.CosService = CosService = CosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CosService);
//# sourceMappingURL=cos.service.js.map