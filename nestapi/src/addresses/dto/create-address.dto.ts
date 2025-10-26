export class CreateAddressDto {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode?: string;
  isDefault?: boolean;
}

export class UpdateAddressDto {
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  postalCode?: string;
  isDefault?: boolean;
}
