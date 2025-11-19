import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import {
  CreateProvinceDto,
  UpdateProvinceDto,
  ProvinceResponseDto,
  ProvinceListResponseDto,
  CreateCityDto,
  UpdateCityDto,
  CityResponseDto,
  CityListResponseDto,
  CreateDistrictDto,
  UpdateDistrictDto,
  DistrictResponseDto,
  DistrictListResponseDto,
} from './dto/region.dto';

@ApiTags('Admin Regions')
@Controller('admin')
export class AdminRegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  // ==================== Province Endpoints ====================

  @Get('provinces')
  @ApiOperation({ summary: '获取省份列表（分页）' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProvinces(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ code: number; message: string; data: ProvinceListResponseDto }> {
    const data = await this.regionsService.getProvincesAdmin(
      Number(page),
      Number(limit),
    );
    return { code: 200, message: 'Success', data };
  }

  @Get('provinces/:id')
  @ApiOperation({ summary: '获取单个省份详情' })
  @ApiParam({ name: 'id', type: Number, description: '省份ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProvinceById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: ProvinceResponseDto }> {
    const data = await this.regionsService.getProvinceById(id);
    return { code: 200, message: 'Success', data };
  }

  @Post('provinces')
  @HttpCode(201)
  @ApiOperation({ summary: '创建省份' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createProvince(
    @Body() dto: CreateProvinceDto,
  ): Promise<{ code: number; message: string; data: ProvinceResponseDto }> {
    const data = await this.regionsService.createProvince(dto);
    return { code: 201, message: '省份创建成功', data };
  }

  @Put('provinces/:id')
  @ApiOperation({ summary: '更新省份' })
  @ApiParam({ name: 'id', type: Number, description: '省份ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProvince(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProvinceDto,
  ): Promise<{ code: number; message: string; data: ProvinceResponseDto }> {
    const data = await this.regionsService.updateProvince(id, dto);
    return { code: 200, message: '省份更新成功', data };
  }

  @Delete('provinces/:id')
  @ApiOperation({ summary: '删除省份' })
  @ApiParam({ name: 'id', type: Number, description: '省份ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteProvince(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.regionsService.deleteProvince(id);
    return { code: 200, message: '省份删除成功' };
  }

  // ==================== City Endpoints ====================

  @Get('cities')
  @ApiOperation({ summary: '获取城市列表（分页）' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'provinceId', required: false, type: Number, description: '省份ID筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCities(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('provinceId') provinceId?: number,
  ): Promise<{ code: number; message: string; data: CityListResponseDto }> {
    const data = await this.regionsService.getCitiesAdmin(
      Number(page),
      Number(limit),
      provinceId ? Number(provinceId) : undefined,
    );
    return { code: 200, message: 'Success', data };
  }

  @Get('cities/:id')
  @ApiOperation({ summary: '获取单个城市详情' })
  @ApiParam({ name: 'id', type: Number, description: '城市ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCityById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: CityResponseDto }> {
    const data = await this.regionsService.getCityById(id);
    return { code: 200, message: 'Success', data };
  }

  @Post('cities')
  @HttpCode(201)
  @ApiOperation({ summary: '创建城市' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createCity(
    @Body() dto: CreateCityDto,
  ): Promise<{ code: number; message: string; data: CityResponseDto }> {
    const data = await this.regionsService.createCity(dto);
    return { code: 201, message: '城市创建成功', data };
  }

  @Put('cities/:id')
  @ApiOperation({ summary: '更新城市' })
  @ApiParam({ name: 'id', type: Number, description: '城市ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCityDto,
  ): Promise<{ code: number; message: string; data: CityResponseDto }> {
    const data = await this.regionsService.updateCity(id, dto);
    return { code: 200, message: '城市更新成功', data };
  }

  @Delete('cities/:id')
  @ApiOperation({ summary: '删除城市' })
  @ApiParam({ name: 'id', type: Number, description: '城市ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteCity(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.regionsService.deleteCity(id);
    return { code: 200, message: '城市删除成功' };
  }

  // ==================== District Endpoints ====================

  @Get('districts')
  @ApiOperation({ summary: '获取地区列表（分页）' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'cityId', required: false, type: Number, description: '城市ID筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistricts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('cityId') cityId?: number,
  ): Promise<{ code: number; message: string; data: DistrictListResponseDto }> {
    const data = await this.regionsService.getDistrictsAdmin(
      Number(page),
      Number(limit),
      cityId ? Number(cityId) : undefined,
    );
    return { code: 200, message: 'Success', data };
  }

  @Get('districts/:id')
  @ApiOperation({ summary: '获取单个地区详情' })
  @ApiParam({ name: 'id', type: Number, description: '地区ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistrictById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: DistrictResponseDto }> {
    const data = await this.regionsService.getDistrictById(id);
    return { code: 200, message: 'Success', data };
  }

  @Post('districts')
  @HttpCode(201)
  @ApiOperation({ summary: '创建地区' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createDistrict(
    @Body() dto: CreateDistrictDto,
  ): Promise<{ code: number; message: string; data: DistrictResponseDto }> {
    const data = await this.regionsService.createDistrict(dto);
    return { code: 201, message: '地区创建成功', data };
  }

  @Put('districts/:id')
  @ApiOperation({ summary: '更新地区' })
  @ApiParam({ name: 'id', type: Number, description: '地区ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateDistrict(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDistrictDto,
  ): Promise<{ code: number; message: string; data: DistrictResponseDto }> {
    const data = await this.regionsService.updateDistrict(id, dto);
    return { code: 200, message: '地区更新成功', data };
  }

  @Delete('districts/:id')
  @ApiOperation({ summary: '删除地区' })
  @ApiParam({ name: 'id', type: Number, description: '地区ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteDistrict(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.regionsService.deleteDistrict(id);
    return { code: 200, message: '地区删除成功' };
  }
}
