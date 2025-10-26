export interface Role {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
}
export declare class RolesService {
    private roles;
    private idCounter;
    create(createRoleDto: {
        name: string;
        description: string;
    }): Role;
    findAll(): Role[];
    findOne(id: number): Role | null;
    remove(id: number): boolean;
}
