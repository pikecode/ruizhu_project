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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_entity_1 = require("./entities/payment.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const crypto = __importStar(require("crypto"));
let PaymentsService = class PaymentsService {
    paymentRepository;
    orderRepository;
    configService;
    appId;
    mchId;
    apiKey;
    constructor(paymentRepository, orderRepository, configService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.configService = configService;
        this.appId = this.configService.get('WECHAT_APP_ID') || 'test_app_id';
        this.mchId = this.configService.get('WECHAT_MCH_ID') || 'test_mch_id';
        this.apiKey = this.configService.get('WECHAT_API_KEY') || 'test_api_key';
    }
    async createPayment(userId, createPaymentDto) {
        const { orderId, amount, paymentMethod = payment_entity_1.PaymentMethod.WECHAT } = createPaymentDto;
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new Error('订单不存在');
        }
        const transactionNo = this.generateTransactionNo();
        const payment = this.paymentRepository.create({
            userId,
            orderId,
            amount,
            paymentMethod,
            transactionNo,
            status: payment_entity_1.PaymentStatus.PENDING,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        if (paymentMethod === payment_entity_1.PaymentMethod.WECHAT) {
            const prepayData = await this.createWechatPrepay(savedPayment, userId);
            savedPayment.prepayId = prepayData.prepayId;
            savedPayment.wechatResponse = JSON.stringify(prepayData);
            await this.paymentRepository.save(savedPayment);
            return {
                paymentId: savedPayment.id,
                transactionNo: savedPayment.transactionNo,
                prepayId: prepayData.prepayId,
                ...prepayData.clientData,
            };
        }
        return savedPayment;
    }
    async createWechatPrepay(payment, userId) {
        const prepayId = `wx${this.generateRandomString(32)}`;
        const clientData = this.generateWechatSignature(prepayId);
        return {
            prepayId,
            clientData,
        };
    }
    generateWechatSignature(prepayId) {
        const timeStamp = Math.floor(Date.now() / 1000).toString();
        const nonceStr = this.generateRandomString(32);
        const packageStr = `prepay_id=${prepayId}`;
        const signStr = `appId=${this.appId}&nonceStr=${nonceStr}&package=${packageStr}&signType=MD5&timeStamp=${timeStamp}&key=${this.apiKey}`;
        const paySign = crypto
            .createHash('md5')
            .update(signStr)
            .digest('hex')
            .toUpperCase();
        return {
            appId: this.appId,
            timeStamp,
            nonceStr,
            package: packageStr,
            signType: 'MD5',
            paySign,
        };
    }
    async handleWechatCallback(callbackData) {
        const { out_trade_no, transaction_id, trade_state, total_amount } = callbackData;
        const payment = await this.paymentRepository.findOne({
            where: { transactionNo: out_trade_no },
            relations: ['order'],
        });
        if (!payment) {
            throw new Error('支付记录不存在');
        }
        if (parseInt(total_amount) !== parseInt(payment.amount.toString())) {
            throw new Error('支付金额不匹配');
        }
        if (trade_state === 'SUCCESS') {
            payment.status = payment_entity_1.PaymentStatus.SUCCESS;
            payment.wechatTransactionId = transaction_id;
            payment.paidAt = new Date();
            payment.callbackData = JSON.stringify(callbackData);
            if (payment.order) {
                payment.order.status = order_entity_1.OrderStatus.CONFIRMED;
                await this.orderRepository.save(payment.order);
            }
        }
        else if (trade_state === 'FAILED') {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            payment.failureReason = callbackData.trade_state_desc || '支付失败';
        }
        await this.paymentRepository.save(payment);
        return payment;
    }
    async queryPaymentStatus(transactionNo) {
        const payment = await this.paymentRepository.findOne({
            where: { transactionNo },
            relations: ['order'],
        });
        if (!payment) {
            throw new Error('支付记录不存在');
        }
        if (payment.status === payment_entity_1.PaymentStatus.PENDING || payment.status === payment_entity_1.PaymentStatus.PROCESSING) {
            await this.queryWechatPaymentStatus(payment);
        }
        return payment;
    }
    async queryWechatPaymentStatus(payment) {
        const elapsedSeconds = (Date.now() - payment.createdAt.getTime()) / 1000;
        if (elapsedSeconds > 30 && payment.status === payment_entity_1.PaymentStatus.PENDING) {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            payment.failureReason = '支付超时';
            await this.paymentRepository.save(payment);
        }
    }
    async getPayment(id) {
        return this.paymentRepository.findOne({
            where: { id },
            relations: ['order', 'user'],
        });
    }
    async getPaymentByOrderId(orderId) {
        return this.paymentRepository.findOne({
            where: { orderId },
            relations: ['order', 'user'],
        });
    }
    generateTransactionNo() {
        const timestamp = Date.now().toString();
        const random = this.generateRandomString(8);
        return `PAY${timestamp}${random}`;
    }
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map