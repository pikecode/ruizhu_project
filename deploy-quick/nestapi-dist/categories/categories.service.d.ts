import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private categoriesRepository;
    constructor(categoriesRepository: Repository<Category>);
    findAll(): unknown;
    findOne(id: number): unknown;
    create(createCategoryDto: CreateCategoryDto): unknown;
    update(id: number, updateCategoryDto: Partial<CreateCategoryDto>): unknown;
    remove(id: number): any;
}
