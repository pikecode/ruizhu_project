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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPayResponseDto = exports.WechatPayCallbackDto = exports.CreateWechatPayDto = void 0;
const class_validator_1 = require("class-validator");
class CreateWechatPayDto {
    orderId;
    description;
}
exports.CreateWechatPayDto = CreateWechatPayDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWechatPayDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWechatPayDto.prototype, "description", void 0);
class WechatPayCallbackDto {
    mchid;
    appid;
    out_trade_no;
    transaction_id;
    trade_type;
    trade_state;
    trade_state_desc;
    bank_type;
    attach;
    success_time;
    payer;
    amount;
}
exports.WechatPayCallbackDto = WechatPayCallbackDto;
class WechatPayResponseDto {
    appid;
    timeStamp;
    nonceStr;
    package;
    signType;
    paySign;
    prepay_id;
}
exports.WechatPayResponseDto = WechatPayResponseDto;
//# sourceMappingURL=wechat-pay.dto.js.map