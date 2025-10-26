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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const crypto = __importStar(require("crypto"));
let WechatService = class WechatService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async authenticateOrCreateUser(openid, sessionKey, userInfo) {
        let user = await this.userRepository.findOne({
            where: { openid },
        });
        if (!user) {
            user = new user_entity_1.User();
            user.openid = openid;
            user.sessionKey = sessionKey;
            user.wechatNickname = userInfo?.nickname || `User_${openid.substring(0, 8)}`;
            user.avatar = userInfo?.avatarUrl || '';
            user.username = openid;
            user.email = `${openid}@weixin.local`;
            user.password = '';
            user.isActive = true;
            user = await this.userRepository.save(user);
        }
        else {
            user.sessionKey = sessionKey;
            user.wechatNickname = userInfo?.nickname || user.wechatNickname;
            user.avatar = userInfo?.avatarUrl || user.avatar;
            user = await this.userRepository.save(user);
        }
        const access_token = this.jwtService.sign({
            sub: user.id,
            openid: user.openid,
            username: user.username,
        });
        return {
            access_token,
            user: {
                id: user.id,
                openid: user.openid,
                nickname: user.wechatNickname,
                avatar: user.avatar,
                phone: user.phone,
            },
            sessionKey,
        };
    }
    async decryptPhoneNumber(sessionKey, encryptedData, iv) {
        try {
            const sessionKey_buffer = Buffer.from(sessionKey, 'base64');
            const encryptedData_buffer = Buffer.from(encryptedData, 'base64');
            const iv_buffer = Buffer.from(iv, 'base64');
            const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey_buffer, iv_buffer);
            decipher.setAutoPadding(true);
            let decoded = decipher.update(encryptedData_buffer, undefined, 'utf8');
            decoded += decipher.final('utf8');
            const decrypted = JSON.parse(decoded);
            return decrypted;
        }
        catch (error) {
            throw new Error('Failed to decrypt phone number');
        }
    }
    async bindPhoneNumber(userId, phoneNumber) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        user.phone = phoneNumber;
        const updated = await this.userRepository.save(user);
        return {
            success: true,
            user: {
                id: updated.id,
                openid: updated.openid,
                phone: updated.phone,
                nickname: updated.wechatNickname,
            },
        };
    }
    async verifySession(openid) {
        const user = await this.userRepository.findOne({
            where: { openid },
        });
        return !!user && !!user.sessionKey;
    }
};
exports.WechatService = WechatService;
exports.WechatService = WechatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], WechatService);
//# sourceMappingURL=wechat.service.js.map