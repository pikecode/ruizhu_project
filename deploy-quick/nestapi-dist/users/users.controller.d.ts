import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Omit<import("./users.service").User, "password">;
    findAll(): Omit<import("./users.service").User, "password">[];
    findOne(id: string): any;
    remove(id: string): boolean;
}
