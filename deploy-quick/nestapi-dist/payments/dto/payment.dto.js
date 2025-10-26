"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentQueryDto = exports.PaymentCallbackDto = exports.CreatePaymentDto = void 0;
class CreatePaymentDto {
    orderId;
    amount;
    paymentMethod;
}
exports.CreatePaymentDto = CreatePaymentDto;
class PaymentCallbackDto {
    transactionId;
    outTradeNo;
    totalAmount;
    tradeState;
    tradeType;
    bankType;
    attach;
    timeEnd;
}
exports.PaymentCallbackDto = PaymentCallbackDto;
class PaymentQueryDto {
    outTradeNo;
}
exports.PaymentQueryDto = PaymentQueryDto;
//# sourceMappingURL=payment.dto.js.map