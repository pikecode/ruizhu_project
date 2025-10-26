import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): unknown;
    findOne(id: number): unknown;
    create(createCategoryDto: CreateCategoryDto): unknown;
    update(id: number, updateCategoryDto: Partial<CreateCategoryDto>): unknown;
    remove(id: number): any;
}
