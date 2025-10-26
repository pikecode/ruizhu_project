export declare class ProductQueryDto {
    categoryId?: number;
    page?: number;
    limit?: number;
    sort?: 'price' | 'sales' | 'rating' | 'created';
    order?: 'asc' | 'desc';
    search?: string;
    status?: 'active' | 'inactive' | 'draft' | 'out_of_stock';
}
