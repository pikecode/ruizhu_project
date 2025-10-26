"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
let RolesService = class RolesService {
    roles = [
        {
            id: 1,
            name: 'admin',
            description: 'Administrator role with full access',
            createdAt: new Date(),
        },
        {
            id: 2,
            name: 'user',
            description: 'Regular user role',
            createdAt: new Date(),
        },
    ];
    idCounter = 3;
    create(createRoleDto) {
        const role = {
            id: this.idCounter++,
            ...createRoleDto,
            createdAt: new Date(),
        };
        this.roles.push(role);
        return role;
    }
    findAll() {
        return this.roles;
    }
    findOne(id) {
        return this.roles.find(r => r.id === id) || null;
    }
    remove(id) {
        const index = this.roles.findIndex(r => r.id === id);
        if (index > -1) {
            this.roles.splice(index, 1);
            return true;
        }
        return false;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)()
], RolesService);
//# sourceMappingURL=roles.service.js.map