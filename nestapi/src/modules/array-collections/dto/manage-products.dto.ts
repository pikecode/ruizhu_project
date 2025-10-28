import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddProductsToItemDto {
  @IsArray()
  @IsInt({ each: true })
  productIds: number[];

  @IsOptional()
  @IsInt()
  startSortOrder?: number;
}

export class RemoveProductsFromItemDto {
  @IsArray()
  @IsInt({ each: true })
  productIds: number[];
}

export class UpdateItemProductsSortDto {
  @ValidateNested({ each: true })
  @Type(() => SortOrderItem)
  products: SortOrderItem[];
}

export class SortOrderItem {
  @IsInt()
  productId: number;

  @IsInt()
  sortOrder: number;
}
