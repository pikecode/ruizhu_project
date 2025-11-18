import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '../../entities/province.entity';
import { City } from '../../entities/city.entity';
import { District } from '../../entities/district.entity';
import {
  CreateProvinceDto,
  UpdateProvinceDto,
  ProvinceListResponseDto,
  CreateCityDto,
  UpdateCityDto,
  CityListResponseDto,
  CreateDistrictDto,
  UpdateDistrictDto,
  DistrictListResponseDto,
} from './dto/region.dto';

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

  // ==================== Admin CRUD Methods ====================

  // Province CRUD
  async getProvincesAdmin(
    page: number,
    limit: number,
  ): Promise<ProvinceListResponseDto> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.provinceRepository
      .createQueryBuilder('province')
      .orderBy('province.sortOrder', 'ASC')
      .addOrderBy('province.id', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getProvinceById(id: number): Promise<Province> {
    const province = await this.provinceRepository.findOne({ where: { id } });
    if (!province) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }
    return province;
  }

  async createProvince(dto: CreateProvinceDto): Promise<Province> {
    const province = this.provinceRepository.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
    });
    return await this.provinceRepository.save(province);
  }

  async updateProvince(id: number, dto: UpdateProvinceDto): Promise<Province> {
    const province = await this.getProvinceById(id);
    Object.assign(province, dto);
    return await this.provinceRepository.save(province);
  }

  async deleteProvince(id: number): Promise<void> {
    const province = await this.getProvinceById(id);
    await this.provinceRepository.remove(province);
  }

  // City CRUD
  async getCitiesAdmin(
    page: number,
    limit: number,
    provinceId?: number,
  ): Promise<CityListResponseDto> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.cityRepository
      .createQueryBuilder('city')
      .orderBy('city.sortOrder', 'ASC')
      .addOrderBy('city.id', 'ASC');

    if (provinceId) {
      queryBuilder.where('city.provinceId = :provinceId', { provinceId });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getCityById(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
    return city;
  }

  async createCity(dto: CreateCityDto): Promise<City> {
    // Verify province exists
    await this.getProvinceById(dto.provinceId);
    const city = this.cityRepository.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
    });
    return await this.cityRepository.save(city);
  }

  async updateCity(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.getCityById(id);
    if (dto.provinceId) {
      await this.getProvinceById(dto.provinceId);
    }
    Object.assign(city, dto);
    return await this.cityRepository.save(city);
  }

  async deleteCity(id: number): Promise<void> {
    const city = await this.getCityById(id);
    await this.cityRepository.remove(city);
  }

  // District CRUD
  async getDistrictsAdmin(
    page: number,
    limit: number,
    cityId?: number,
  ): Promise<DistrictListResponseDto> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.districtRepository
      .createQueryBuilder('district')
      .orderBy('district.sortOrder', 'ASC')
      .addOrderBy('district.id', 'ASC');

    if (cityId) {
      queryBuilder.where('district.cityId = :cityId', { cityId });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getDistrictById(id: number): Promise<District> {
    const district = await this.districtRepository.findOne({ where: { id } });
    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }
    return district;
  }

  async createDistrict(dto: CreateDistrictDto): Promise<District> {
    // Verify city exists
    await this.getCityById(dto.cityId);
    const district = this.districtRepository.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
    });
    return await this.districtRepository.save(district);
  }

  async updateDistrict(id: number, dto: UpdateDistrictDto): Promise<District> {
    const district = await this.getDistrictById(id);
    if (dto.cityId) {
      await this.getCityById(dto.cityId);
    }
    Object.assign(district, dto);
    return await this.districtRepository.save(district);
  }

  async deleteDistrict(id: number): Promise<void> {
    const district = await this.getDistrictById(id);
    await this.districtRepository.remove(district);
  }
}
