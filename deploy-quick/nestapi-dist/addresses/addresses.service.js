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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const address_entity_1 = require("./entities/address.entity");
let AddressesService = class AddressesService {
    addressRepository;
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async create(userId, createAddressDto) {
        if (createAddressDto.isDefault) {
            await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
        }
        const address = this.addressRepository.create({
            userId,
            ...createAddressDto,
        });
        return this.addressRepository.save(address);
    }
    async findByUserId(userId) {
        return this.addressRepository.find({
            where: { userId },
            order: { isDefault: 'DESC', updatedAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.addressRepository.findOne({ where: { id } });
    }
    async getDefaultAddress(userId) {
        return this.addressRepository.findOne({
            where: { userId, isDefault: true },
        });
    }
    async update(id, updateAddressDto) {
        if (updateAddressDto.isDefault) {
            const address = await this.addressRepository.findOne({ where: { id } });
            if (address) {
                await this.addressRepository.update({ userId: address.userId, isDefault: true }, { isDefault: false });
            }
        }
        await this.addressRepository.update(id, updateAddressDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.addressRepository.delete(id);
    }
    async setDefault(userId, addressId) {
        await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
        await this.addressRepository.update({ id: addressId }, { isDefault: true });
        return this.findOne(addressId);
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(address_entity_1.Address)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map