export declare class CreateAddressDto {
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    district: string;
    detailAddress: string;
    postalCode?: string;
    isDefault?: boolean;
}
export declare class UpdateAddressDto {
    receiverName?: string;
    receiverPhone?: string;
    province?: string;
    city?: string;
    district?: string;
    detailAddress?: string;
    postalCode?: string;
    isDefault?: boolean;
}
