import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: {
        name: string;
        description: string;
    }): import("./roles.service").Role;
    findAll(): import("./roles.service").Role[];
    findOne(id: string): import("./roles.service").Role | null;
    remove(id: string): boolean;
}
