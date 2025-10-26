import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class WechatService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    authenticateOrCreateUser(openid: string, sessionKey: string, userInfo?: {
        nickname?: string;
        avatarUrl?: string;
    }): unknown;
    decryptPhoneNumber(sessionKey: string, encryptedData: string, iv: string): unknown;
    bindPhoneNumber(userId: number, phoneNumber: string): unknown;
    verifySession(openid: string): Promise<boolean>;
}
