import { IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 集合内产品排序项 DTO
 */
export class CollectionProductSortItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  sortOrder: number;
}

/**
 * 批量调整集合内产品顺序 DTO
 */
export class UpdateCollectionProductsSortDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionProductSortItemDto)
  products: CollectionProductSortItemDto[];
}

/**
 * 添加产品到集合 DTO
 */
export class AddProductsToCollectionDto {
  @IsArray({ message: '产品ID列表必须是数组' })
  @IsNumber({}, { each: true, message: '每个产品ID必须是数字' })
  productIds: number[];

  @IsOptional()
  @IsNumber()
  startSortOrder?: number = 0; // 添加产品时的起始排序号
}

/**
 * 从集合删除产品 DTO
 */
export class RemoveProductsFromCollectionDto {
  @IsArray({ message: '产品ID列表必须是数组' })
  @IsNumber({}, { each: true, message: '每个产品ID必须是数字' })
  productIds: number[];
}
