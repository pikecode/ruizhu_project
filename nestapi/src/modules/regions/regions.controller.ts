import { Controller, Get, Query } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { Province } from '../../entities/province.entity';
import { City } from '../../entities/city.entity';
import { District } from '../../entities/district.entity';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  /**
   * 获取所有省份列表
   * GET /regions/provinces
   */
  @Get('provinces')
  async getProvinces(): Promise<Province[]> {
    return await this.regionsService.getProvinces();
  }

  /**
   * 根据省份ID获取城市列表
   * GET /regions/cities?provinceId=1
   */
  @Get('cities')
  async getCitiesByProvince(
    @Query('provinceId') provinceId: string,
  ): Promise<City[]> {
    return await this.regionsService.getCitiesByProvince(parseInt(provinceId));
  }

  /**
   * 根据城市ID获取地区列表
   * GET /regions/districts?cityId=1
   */
  @Get('districts')
  async getDistrictsByCity(
    @Query('cityId') cityId: string,
  ): Promise<District[]> {
    return await this.regionsService.getDistrictsByCity(parseInt(cityId));
  }
}
