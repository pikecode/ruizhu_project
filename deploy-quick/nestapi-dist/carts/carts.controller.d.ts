import { CartsService } from './carts.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    getCart(): unknown;
    addItem(addToCartDto: AddToCartDto): unknown;
    updateItem(itemId: number, updateCartItemDto: UpdateCartItemDto): unknown;
    removeItem(itemId: number): unknown;
    clearCart(): unknown;
}
