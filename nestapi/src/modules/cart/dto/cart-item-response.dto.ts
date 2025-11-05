/**
 * Cart Item Response DTO
 * Formatted response for frontend with product details
 */
export class CartItemResponseDto {
  /**
   * 购物车项ID
   */
  id: number;

  /**
   * 商品ID
   */
  productId: number;

  /**
   * 商品名称
   */
  name: string;

  /**
   * 商品图片URL
   */
  image: string;

  /**
   * 商品价格（分为单位）
   * 优先使用快照价格（添加到购物车时的价格）
   */
  price: number;

  /**
   * 购买数量
   */
  quantity: number;

  /**
   * 选择的颜色
   */
  color?: string;

  /**
   * 选择的尺码
   */
  size?: string;

  /**
   * 选中状态（前端使用）
   */
  selected?: boolean;
}
