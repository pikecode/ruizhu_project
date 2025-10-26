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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WechatPayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const order_entity_1 = require("../orders/entities/order.entity");
const payment_entity_1 = require("./entities/payment.entity");
let WechatPayService = WechatPayService_1 = class WechatPayService {
    configService;
    ordersRepository;
    paymentsRepository;
    logger = new common_1.Logger(WechatPayService_1.name);
    mchid;
    apiKey;
    appid;
    appSecret;
    baseUrl = 'https://api.mch.weixin.qq.com/v3';
    constructor(configService, ordersRepository, paymentsRepository) {
        this.configService = configService;
        this.ordersRepository = ordersRepository;
        this.paymentsRepository = paymentsRepository;
        this.mchid = '1730538714';
        this.apiKey = 'RUIZHUYISHUYUNjie202510261214111';
        this.appid = 'wx0377b6b22ea7e8fc';
        this.appSecret = '280b67f53e797ea2fce9de440c1bf506';
    }
    async createPayment(userId, createWechatPayDto) {
        const { orderId, description } = createWechatPayDto;
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.BadRequestException('订单不存在');
        }
        if (order.userId !== userId) {
            throw new common_1.BadRequestException('无权限访问此订单');
        }
        const existingPayment = await this.paymentsRepository.findOne({
            where: { orderId },
        });
        if (existingPayment && existingPayment.status === payment_entity_1.PaymentStatus.SUCCESS) {
            throw new common_1.BadRequestException('订单已支付');
        }
        const payment = this.paymentsRepository.create({
            orderId,
            userId,
            amount: Math.round(order.totalPrice * 100),
            status: payment_entity_1.PaymentStatus.PENDING,
            paymentMethod: payment_entity_1.PaymentMethod.WECHAT,
            transactionNo: this.generateOutTradeNo(orderId),
        });
        await this.paymentsRepository.save(payment);
        const prepayData = await this.unifiedOrder(payment.transactionNo, Math.round(order.totalPrice * 100), description || `订单 ${orderId}`);
        const clientPayData = this.generateClientPayData(prepayData.prepay_id);
        return clientPayData;
    }
    async unifiedOrder(outTradeNo, totalAmount, description) {
        const requestBody = {
            mchid: this.mchid,
            appid: this.appid,
            description,
            out_trade_no: outTradeNo,
            notify_url: `${this.configService.get('API_BASE_URL')}/payments/wechat-callback`,
            amount: {
                total: totalAmount,
                currency: 'CNY',
            },
            scene_info: {
                device_id: 'WEB',
            },
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/pay/transactions/jsapi`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.getAuthorizationHeader('POST', '/v3/pay/transactions/jsapi', requestBody),
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('微信统一下单失败', error);
            throw new common_1.BadRequestException('创建支付订单失败');
        }
    }
    generateClientPayData(prepayId) {
        const timeStamp = Math.floor(Date.now() / 1000).toString();
        const nonceStr = this.generateNonceStr();
        const pkg = `prepay_id=${prepayId}`;
        const paySign = this.generatePaySign({
            appid: this.appid,
            timeStamp,
            nonceStr,
            package: pkg,
        });
        return {
            appid: this.appid,
            timeStamp,
            nonceStr,
            package: pkg,
            signType: 'RSA',
            paySign,
            prepay_id: prepayId,
        };
    }
    generatePaySign(params) {
        const message = `${params.appid}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`;
        return crypto
            .createHmac('sha256', this.apiKey)
            .update(message)
            .digest('hex');
    }
    getAuthorizationHeader(method, path, body) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = this.generateNonceStr();
        let message = `${method}\n${path}\n${timestamp}\n${nonce}\n`;
        if (body) {
            message += JSON.stringify(body);
        }
        const signature = crypto
            .createHmac('sha256', this.apiKey)
            .update(message)
            .digest('hex');
        return `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="xxx",signature="${signature}"`;
    }
    async handleCallback(callbackData) {
        try {
            const isValid = this.verifySignature(callbackData, callbackData.signature);
            if (!isValid) {
                throw new common_1.BadRequestException('签名验证失败');
            }
            const { out_trade_no, trade_state } = callbackData.resource;
            const payment = await this.paymentsRepository.findOne({
                where: { transactionNo: out_trade_no },
            });
            if (!payment) {
                this.logger.warn(`支付记录不存在: ${out_trade_no}`);
                return;
            }
            if (trade_state === 'SUCCESS') {
                payment.status = payment_entity_1.PaymentStatus.SUCCESS;
                payment.wechatTransactionId = callbackData.resource.transaction_id;
                payment.paidAt = new Date();
                await this.paymentsRepository.save(payment);
                const order = await this.ordersRepository.findOne({
                    where: { id: payment.orderId },
                });
                if (order) {
                    order.status = order_entity_1.OrderStatus.CONFIRMED;
                    await this.ordersRepository.save(order);
                    this.logger.log(`订单支付成功: ${payment.orderId}`);
                }
            }
            else if (trade_state === 'REFUND' ||
                trade_state === 'NOTPAY' ||
                trade_state === 'CLOSED') {
                payment.status = payment_entity_1.PaymentStatus.FAILED;
                await this.paymentsRepository.save(payment);
            }
        }
        catch (error) {
            this.logger.error('处理支付回调失败', error);
            throw error;
        }
    }
    verifySignature(data, signature) {
        const message = `${data.timestamp}\n${data.nonce}\n${JSON.stringify(data.resource)}\n`;
        const expectedSignature = crypto
            .createHmac('sha256', this.apiKey)
            .update(message)
            .digest('hex');
        return signature === expectedSignature;
    }
    async queryPaymentStatus(outTradeNo) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/pay/transactions/out-trade-no/${outTradeNo}`, {
                params: { mchid: this.mchid },
                headers: {
                    Authorization: this.getAuthorizationHeader('GET', `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${this.mchid}`),
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('查询支付状态失败', error);
            throw new common_1.BadRequestException('查询支付状态失败');
        }
    }
    async refund(outTradeNo, outRefundNo, refundAmount, totalAmount) {
        const requestBody = {
            out_trade_no: outTradeNo,
            out_refund_no: outRefundNo,
            reason: '用户申请退款',
            amount: {
                refund: refundAmount,
                total: totalAmount,
                currency: 'CNY',
            },
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/refund/domestic/refunds`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.getAuthorizationHeader('POST', '/v3/refund/domestic/refunds', requestBody),
                },
            });
            const payment = await this.paymentsRepository.findOne({
                where: { transactionNo: outTradeNo },
            });
            if (payment) {
                payment.status = payment_entity_1.PaymentStatus.REFUNDED;
                await this.paymentsRepository.save(payment);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error('申请退款失败', error);
            throw new common_1.BadRequestException('申请退款失败');
        }
    }
    generateOutTradeNo(orderId) {
        const timestamp = Date.now().toString().slice(-8);
        return `RUIZHU${orderId}${timestamp}`;
    }
    generateNonceStr() {
        return crypto.randomBytes(16).toString('hex');
    }
};
exports.WechatPayService = WechatPayService;
exports.WechatPayService = WechatPayService = WechatPayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WechatPayService);
//# sourceMappingURL=wechat-pay.service.js.map