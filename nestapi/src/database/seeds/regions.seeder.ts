import { DataSource } from 'typeorm';
import { Province } from '../../entities/province.entity';
import { City } from '../../entities/city.entity';
import { District } from '../../entities/district.entity';
import { chinaRegionsData } from '../china-regions-data';

/**
 * 地区数据 Seeder
 * 用于初始化中国省市区数据
 */
export const seedRegions = async (dataSource: DataSource) => {
  const provinceRepository = dataSource.getRepository(Province);
  const cityRepository = dataSource.getRepository(City);
  const districtRepository = dataSource.getRepository(District);

  console.log('🌍 开始初始化地区数据...');

  try {
    // 只在数据为空时初始化,避免重复删除数据
    const existingProvinces = await provinceRepository.count();
    if (existingProvinces > 0) {
      console.log('✓ 地区数据已存在,跳过初始化');
      return;
    }

    let provinceIndex = 0;
    let cityIndex = 0;
    let districtIndex = 0;

    // 遍历每个省份
    for (const [provinceName, cities] of Object.entries(chinaRegionsData)) {
      // 创建省份
      const province = provinceRepository.create({
        code: `PROV_${provinceIndex}`,
        name: provinceName,
        sortOrder: provinceIndex,
      });
      const savedProvince = await provinceRepository.save(province);
      console.log(`  📍 创建省份: ${provinceName}`);

      // 遍历该省份的城市
      for (const [cityName, districts] of Object.entries(cities)) {
        // 创建城市
        const city = cityRepository.create({
          code: `CITY_${cityIndex}`,
          name: cityName,
          province: savedProvince,
          sortOrder: cityIndex,
        });
        const savedCity = await cityRepository.save(city);
        console.log(`    🏙️  创建城市: ${cityName}`);

        // 遍历该城市的地区
        for (const districtName of districts) {
          // 创建地区
          const district = districtRepository.create({
            code: `DIST_${districtIndex}`,
            name: districtName,
            city: savedCity,
            sortOrder: districtIndex,
          });
          await districtRepository.save(district);
          districtIndex++;
        }

        cityIndex++;
      }

      provinceIndex++;
    }

    console.log(`✅ 地区数据初始化完成！`);
    console.log(`   - 省份: ${provinceIndex}`);
    console.log(`   - 城市: ${cityIndex}`);
    console.log(`   - 地区: ${districtIndex}`);
  } catch (error) {
    console.error('❌ 地区数据初始化失败:', error.message);
    throw error;
  }
};
