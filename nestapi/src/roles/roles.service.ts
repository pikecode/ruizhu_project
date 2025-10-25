import { Injectable } from '@nestjs/common';

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
}

@Injectable()
export class RolesService {
  private roles: Role[] = [
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
  private idCounter = 3;

  create(createRoleDto: { name: string; description: string }): Role {
    const role: Role = {
      id: this.idCounter++,
      ...createRoleDto,
      createdAt: new Date(),
    };
    this.roles.push(role);
    return role;
  }

  findAll(): Role[] {
    return this.roles;
  }

  findOne(id: number): Role | null {
    return this.roles.find(r => r.id === id) || null;
  }

  remove(id: number): boolean {
    const index = this.roles.findIndex(r => r.id === id);
    if (index > -1) {
      this.roles.splice(index, 1);
      return true;
    }
    return false;
  }
}
