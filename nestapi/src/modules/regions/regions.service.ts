import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '../../entities/province.entity';
import { City } from '../../entities/city.entity';
import { District } from '../../entities/district.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  /**
   * 获取所有省份列表
   */
  async getProvinces(): Promise<Province[]> {
    return await this.provinceRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 根据省份获取城市列表
   */
  async getCitiesByProvince(provinceId: number): Promise<City[]> {
    return await this.cityRepository.find({
      where: { provinceId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 获取城市名称列表（用于前端picker）
   */
  async getCityNamesByProvince(provinceId: number): Promise<string[]> {
    const cities = await this.getCitiesByProvince(provinceId);
    return cities.map((city) => city.name);
  }

  /**
   * 根据城市获取地区列表
   */
  async getDistrictsByCity(cityId: number): Promise<District[]> {
    return await this.districtRepository.find({
      where: { cityId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 获取地区名称列表（用于前端picker）
   */
  async getDistrictNamesByCity(cityId: number): Promise<string[]> {
    const districts = await this.getDistrictsByCity(cityId);
    return districts.map((district) => district.name);
  }

  /**
   * 根据城市名称获取城市ID
   */
  async getCityIdByName(cityName: string): Promise<number | null> {
    const city = await this.cityRepository.findOne({
      where: { name: cityName },
    });
    return city ? city.id : null;
  }

  /**
   * 根据地区名称获取地区ID
   */
  async getDistrictIdByName(districtName: string): Promise<number | null> {
    const district = await this.districtRepository.findOne({
      where: { name: districtName },
    });
    return district ? district.id : null;
  }

  /**
   * 获取省份ID通过省份名称
   */
  async getProvinceIdByName(provinceName: string): Promise<number | null> {
    const province = await this.provinceRepository.findOne({
      where: { name: provinceName },
    });
    return province ? province.id : null;
  }
}
