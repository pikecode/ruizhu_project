import { User } from '../../users/entities/user.entity';
export declare class Address {
    id: number;
    userId: number;
    user: User;
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    district: string;
    detailAddress: string;
    postalCode: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
