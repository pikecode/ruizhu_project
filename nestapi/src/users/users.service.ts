import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(createUserDto: CreateUserDto): Omit<User, 'password'> {
    const user: User = {
      id: this.idCounter++,
      ...createUserDto,
      createdAt: new Date(),
    };
    this.users.push(user);
    const { password, ...result } = user;
    return result;
  }

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  findOne(id: number): Omit<User, 'password'> | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  findByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  remove(id: number): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
