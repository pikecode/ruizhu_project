export class CreateOrderDto {
  productId: number;
  productName?: string;
  quantity: number;
  phone?: string;
  totalPrice: number;
  unitPrice?: number;
  addressId?: number;
  remark?: string;
}
