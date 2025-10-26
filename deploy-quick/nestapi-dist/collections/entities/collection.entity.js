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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
let Collection = class Collection {
    id;
    name;
    description;
    coverImage;
    bannerImage;
    products;
    displayOrder;
    isActive;
    createdAt;
    updatedAt;
};
exports.Collection = Collection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Collection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], Collection.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "bannerImage", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, { eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'collection_products',
        joinColumn: { name: 'collectionId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Collection.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Collection.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Collection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Collection.prototype, "updatedAt", void 0);
exports.Collection = Collection = __decorate([
    (0, typeorm_1.Entity)('collections')
], Collection);
//# sourceMappingURL=collection.entity.js.map