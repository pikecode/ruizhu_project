import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: {
        username: string;
        password: string;
    }): unknown;
    register(registerDto: {
        username: string;
        password: string;
        email: string;
    }): unknown;
}
