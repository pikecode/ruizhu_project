import { CreateUserDto } from './dto/create-user.dto';
export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
}
export declare class UsersService {
    private users;
    private idCounter;
    create(createUserDto: CreateUserDto): Omit<User, 'password'>;
    findAll(): Omit<User, 'password'>[];
    findOne(id: number): Omit<User, 'password'> | null;
    findByUsername(username: string): User | undefined;
    remove(id: number): boolean;
}
