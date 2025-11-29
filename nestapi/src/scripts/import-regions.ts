import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';
import { District } from '../entities/district.entity';

interface DistrictData {
  code: string;
  name: string;
}

interface CityData {
  code: string;
  name: string;
  districts: DistrictData[];
}

interface ProvinceData {
  code: string;
  name: string;
  cities: CityData[];
}

interface RegionsData {
  provinces: ProvinceData[];
}

async function importRegions() {
  console.log('🚀 开始导入中国省市区数据...\n');

  // 初始化NestJS应用
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 读取JSON数据
    const dataPath = path.join(__dirname, '../../data/china-regions.json');
    console.log('📖 读取数据文件:', dataPath);

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const regionsData: RegionsData = JSON.parse(rawData);

    console.log(`✅ 数据文件读取成功，共 ${regionsData.provinces.length} 个省级行政区\n`);

    // 清空现有数据（逆序删除，避免外键约束问题）
    console.log('🗑️  清空现有数据...');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE districts');
    await dataSource.query('TRUNCATE TABLE cities');
    await dataSource.query('TRUNCATE TABLE provinces');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ 现有数据已清空\n');

    // 统计数据
    let provinceCount = 0;
    let cityCount = 0;
    let districtCount = 0;

    // 开始导入
    console.log('📥 开始导入数据...\n');

    for (const [provinceIndex, provinceData] of regionsData.provinces.entries()) {
      // 创建省份
      const province = new Province();
      province.code = provinceData.code;
      province.name = provinceData.name;
      province.sortOrder = provinceIndex;

      const savedProvince = await dataSource.manager.save(province);
      provinceCount++;

      console.log(`[${provinceIndex + 1}/${regionsData.provinces.length}] ${provinceData.name}`);

      // 导入该省的城市
      for (const [cityIndex, cityData] of provinceData.cities.entries()) {
        const city = new City();
        city.provinceId = savedProvince.id;
        city.code = cityData.code;
        city.name = cityData.name;
        city.sortOrder = cityIndex;

        const savedCity = await dataSource.manager.save(city);
        cityCount++;

        console.log(`  ├─ ${cityData.name} (${cityData.districts.length}个区县)`);

        // 批量导入该城市的区县（使用数组批量保存）
        if (cityData.districts.length > 0) {
          const districts = cityData.districts.map((districtData, districtIndex) => {
            const district = new District();
            district.cityId = savedCity.id;
            district.code = districtData.code;
            district.name = districtData.name;
            district.sortOrder = districtIndex;
            return district;
          });

          await dataSource.manager.save(districts);
          districtCount += districts.length;
        }
      }

      console.log('');
    }

    // 输出统计信息
    console.log('\n' + '='.repeat(60));
    console.log('✅ 数据导入完成！');
    console.log('='.repeat(60));
    console.log(`📊 统计信息:`);
    console.log(`   - 省级行政区: ${provinceCount} 个`);
    console.log(`   - 地级行政区: ${cityCount} 个`);
    console.log(`   - 县级行政区: ${districtCount} 个`);
    console.log(`   - 总计: ${provinceCount + cityCount + districtCount} 条记录`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// 执行导入
importRegions()
  .then(() => {
    console.log('✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
