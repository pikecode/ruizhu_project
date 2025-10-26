"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const file_entity_1 = require("./entities/file.entity");
const files_service_1 = require("./services/files.service");
const cos_service_1 = require("./services/cos.service");
const files_controller_1 = require("./controllers/files.controller");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_entity_1.File]), config_1.ConfigModule],
        providers: [files_service_1.FilesService, cos_service_1.CosService],
        controllers: [files_controller_1.FilesController],
        exports: [files_service_1.FilesService, cos_service_1.CosService],
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map