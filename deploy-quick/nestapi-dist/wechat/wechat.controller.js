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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatController = void 0;
const common_1 = require("@nestjs/common");
const wechat_service_1 = require("./wechat.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let WechatController = class WechatController {
    wechatService;
    constructor(wechatService) {
        this.wechatService = wechatService;
    }
    async wechatLogin(body) {
        const { code, userInfo } = body;
        const mockOpenid = `${code}_mock_${Date.now()}`.substring(0, 28);
        const mockSessionKey = Buffer.from(`${mockOpenid}_session_${Date.now()}`).toString('base64');
        const result = await this.wechatService.authenticateOrCreateUser(mockOpenid, mockSessionKey, userInfo);
        return {
            statusCode: 200,
            message: '登录成功',
            data: result,
        };
    }
    async getPhoneNumber(user, body) {
        const { encryptedData, iv } = body;
        const dbUser = await this.wechatService['userRepository'].findOne({
            where: { id: user.id },
        });
        if (!dbUser || !dbUser.sessionKey) {
            return {
                statusCode: 401,
                message: '会话已过期，请重新登录',
            };
        }
        try {
            const phoneData = await this.wechatService.decryptPhoneNumber(dbUser.sessionKey, encryptedData, iv);
            const updated = await this.wechatService.bindPhoneNumber(user.id, phoneData.purePhoneNumber);
            return {
                statusCode: 200,
                message: '手机号获取成功',
                data: updated,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                message: '手机号解密失败',
                error: error.message,
            };
        }
    }
    async verifySession(user) {
        const isValid = await this.wechatService.verifySession(user.openid);
        return {
            statusCode: 200,
            data: {
                valid: isValid,
            },
        };
    }
};
exports.WechatController = WechatController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "wechatLogin", null);
__decorate([
    (0, common_1.Post)('get-phone'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "getPhoneNumber", null);
__decorate([
    (0, common_1.Post)('verify-session'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "verifySession", null);
exports.WechatController = WechatController = __decorate([
    (0, common_1.Controller)('wechat'),
    __metadata("design:paramtypes", [wechat_service_1.WechatService])
], WechatController);
//# sourceMappingURL=wechat.controller.js.map