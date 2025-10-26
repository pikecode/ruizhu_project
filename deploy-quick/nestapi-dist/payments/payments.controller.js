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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const wechat_pay_service_1 = require("./wechat-pay.service");
const payment_dto_1 = require("./dto/payment.dto");
const wechat_pay_dto_1 = require("./dto/wechat-pay.dto");
const jwt_guard_1 = require("../auth/jwt.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    wechatPayService;
    constructor(paymentsService, wechatPayService) {
        this.paymentsService = paymentsService;
        this.wechatPayService = wechatPayService;
    }
    async createPayment(user, createPaymentDto) {
        try {
            const payment = await this.paymentsService.createPayment(user.id, createPaymentDto);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: '支付订单创建成功',
                data: payment,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: error.message || '创建支付订单失败',
                data: null,
            };
        }
    }
    async handleWechatCallback(req) {
        try {
            let callbackData;
            if (typeof req.body === 'string') {
                callbackData = JSON.parse(req.body);
            }
            else {
                callbackData = req.body;
            }
            const result = await this.paymentsService.handleWechatCallback(callbackData);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: '回调处理成功',
                data: result,
            };
        }
        catch (error) {
            console.error('微信支付回调处理失败:', error);
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: '回调处理失败: ' + error.message,
                data: null,
            };
        }
    }
    async queryPaymentStatus(transactionNo) {
        try {
            const payment = await this.paymentsService.queryPaymentStatus(transactionNo);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: '查询成功',
                data: payment,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: error.message || '查询失败',
                data: null,
            };
        }
    }
    async getPaymentDetail(id) {
        try {
            const payment = await this.paymentsService.getPayment(+id);
            if (!payment) {
                return {
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    message: '支付记录不存在',
                    data: null,
                };
            }
            return {
                statusCode: common_1.HttpStatus.OK,
                message: '获取成功',
                data: payment,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: '获取失败',
                data: null,
            };
        }
    }
    async getPaymentByOrderId(orderId) {
        try {
            const payment = await this.paymentsService.getPaymentByOrderId(+orderId);
            if (!payment) {
                return {
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    message: '该订单尚无支付记录',
                    data: null,
                };
            }
            return {
                statusCode: common_1.HttpStatus.OK,
                message: '获取成功',
                data: payment,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: '获取失败',
                data: null,
            };
        }
    }
    async createWechatJSAPIPayment(user, createWechatPayDto) {
        try {
            const paymentParams = await this.wechatPayService.createPayment(user.id, createWechatPayDto);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: '微信支付订单创建成功',
                data: paymentParams,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: error.message || '创建微信支付订单失败',
                data: null,
            };
        }
    }
    async handleWechatV3Callback(req) {
        try {
            const callbackData = req.body;
            await this.wechatPayService.handleCallback(callbackData);
            return {
                code: 'SUCCESS',
                message: '成功',
            };
        }
        catch (error) {
            console.error('微信支付V3回调处理失败:', error);
            return {
                code: 'FAIL',
                message: error.message,
            };
        }
    }
    async getWechatPaymentStatus(outTradeNo) {
        try {
            const paymentStatus = await this.wechatPayService.queryPaymentStatus(outTradeNo);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: '查询成功',
                data: paymentStatus,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: error.message || '查询失败',
                data: null,
            };
        }
    }
    async refundWechatPayment(refundData) {
        try {
            const refundResult = await this.wechatPayService.refund(refundData.outTradeNo, refundData.outRefundNo, refundData.refundAmount, refundData.totalAmount);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: '退款申请已提交',
                data: refundResult,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: error.message || '退款申请失败',
                data: null,
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)('wechat/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWechatCallback", null);
__decorate([
    (0, common_1.Get)(':transactionNo'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('transactionNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "queryPaymentStatus", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentDetail", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentByOrderId", null);
__decorate([
    (0, common_1.Post)('wechat/jsapi'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wechat_pay_dto_1.CreateWechatPayDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createWechatJSAPIPayment", null);
__decorate([
    (0, common_1.Post)('wechat/v3-callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWechatV3Callback", null);
__decorate([
    (0, common_1.Get)('wechat/:outTradeNo/status'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('outTradeNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getWechatPaymentStatus", null);
__decorate([
    (0, common_1.Post)('wechat/refund'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundWechatPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        wechat_pay_service_1.WechatPayService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map