import { WechatService } from './wechat.service';
import { User } from '../users/entities/user.entity';
export declare class WechatController {
    private wechatService;
    constructor(wechatService: WechatService);
    wechatLogin(body: {
        code: string;
        userInfo?: any;
    }): unknown;
    getPhoneNumber(user: User, body: {
        encryptedData: string;
        iv: string;
    }): unknown;
    verifySession(user: User): unknown;
}
