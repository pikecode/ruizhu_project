export declare class AddToCartDto {
    productId: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
}
export declare class UpdateCartItemDto {
    quantity?: number;
    isSelected?: boolean;
}
