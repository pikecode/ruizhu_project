import * as fs from 'fs';
import * as path from 'path';

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

function generateRegionsSQL() {
  console.log('🚀 开始生成省市区数据SQL文件...\n');

  // 读取JSON数据
  const dataPath = path.join(__dirname, '../../data/china-regions.json');
  console.log('📖 读取数据文件:', dataPath);

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const regionsData: RegionsData = JSON.parse(rawData);

  console.log(`✅ 数据文件读取成功，共 ${regionsData.provinces.length} 个省级行政区\n`);

  // 生成SQL
  const sqlLines: string[] = [];

  // 添加头部注释和设置
  sqlLines.push('-- 中国省市区数据导入SQL');
  sqlLines.push('-- 生成时间: ' + new Date().toLocaleString('zh-CN'));
  sqlLines.push('');
  sqlLines.push('SET FOREIGN_KEY_CHECKS = 0;');
  sqlLines.push('');
  sqlLines.push('-- 清空现有数据');
  sqlLines.push('TRUNCATE TABLE districts;');
  sqlLines.push('TRUNCATE TABLE cities;');
  sqlLines.push('TRUNCATE TABLE provinces;');
  sqlLines.push('');
  sqlLines.push('SET FOREIGN_KEY_CHECKS = 1;');
  sqlLines.push('');

  let provinceId = 1;
  let cityId = 1;
  let districtId = 1;

  console.log('📝 生成SQL语句...\n');

  // 生成省份INSERT语句
  sqlLines.push('-- 插入省份数据');
  sqlLines.push('INSERT INTO provinces (id, code, name, sort_order) VALUES');
  const provinceValues: string[] = [];
  regionsData.provinces.forEach((province, index) => {
    const escapedName = province.name.replace(/'/g, "''");
    provinceValues.push(`(${provinceId + index}, '${province.code}', '${escapedName}', ${index})`);
  });
  sqlLines.push(provinceValues.join(',\n'));
  sqlLines.push(';\n');

  // 生成城市和区县INSERT语句
  regionsData.provinces.forEach((province, provinceIndex) => {
    const currentProvinceId = provinceId + provinceIndex;

    console.log(`[${provinceIndex + 1}/${regionsData.provinces.length}] ${province.name}`);

    if (province.cities.length > 0) {
      sqlLines.push(`-- ${province.name} - 城市数据`);
      sqlLines.push('INSERT INTO cities (id, province_id, code, name, sort_order) VALUES');

      const cityValues: string[] = [];
      province.cities.forEach((city, cityIndex) => {
        const escapedCityName = city.name.replace(/'/g, "''");
        const currentCityId = cityId + cityIndex;
        cityValues.push(`(${currentCityId}, ${currentProvinceId}, '${city.code}', '${escapedCityName}', ${cityIndex})`);
      });
      sqlLines.push(cityValues.join(',\n'));
      sqlLines.push(';\n');

      // 生成区县INSERT语句
      province.cities.forEach((city, cityIndex) => {
        const currentCityId = cityId + cityIndex;

        if (city.districts.length > 0) {
          sqlLines.push(`-- ${province.name} - ${city.name} - 区县数据`);
          sqlLines.push('INSERT INTO districts (id, city_id, code, name, sort_order) VALUES');

          const districtValues: string[] = [];
          city.districts.forEach((district, districtIndex) => {
            const escapedDistrictName = district.name.replace(/'/g, "''");
            districtValues.push(`(${districtId + districtIndex}, ${currentCityId}, '${district.code}', '${escapedDistrictName}', ${districtIndex})`);
          });
          sqlLines.push(districtValues.join(',\n'));
          sqlLines.push(';\n');

          districtId += city.districts.length;
        }
      });

      cityId += province.cities.length;
    }
  });

  // 写入SQL文件
  const outputPath = path.join(__dirname, '../../data/china-regions.sql');
  fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ SQL文件生成完成！');
  console.log('='.repeat(60));
  console.log(`📁 文件位置: ${outputPath}`);
  console.log(`📊 统计信息:`);
  console.log(`   - 省级行政区: ${regionsData.provinces.length} 个`);
  console.log(`   - 地级行政区: ${cityId - 1} 个`);
  console.log(`   - 县级行政区: ${districtId - 1} 个`);
  console.log(`   - 总计: ${(provinceId - 1) + (cityId - 1) + (districtId - 1)} 条记录`);
  console.log('='.repeat(60) + '\n');
}

// 执行生成
generateRegionsSQL();
console.log('✅ 脚本执行完成');
