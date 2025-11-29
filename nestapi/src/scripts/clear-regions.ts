import { DataSource } from 'typeorm';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';
import { District } from '../entities/district.entity';

const clearRegions = async () => {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'gz-cdb-qtjza6az.sql.tencentcdb.com',
    port: 27226,
    username: 'root',
    password: 'Pp123456',
    database: 'mydb',
    entities: [Province, City, District],
  });

  await dataSource.initialize();

  const districtRepository = dataSource.getRepository(District);
  const cityRepository = dataSource.getRepository(City);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('🗑️  清除地区数据...');
  await districtRepository.createQueryBuilder().delete().from('districts').execute();
  await cityRepository.createQueryBuilder().delete().from('cities').execute();
  await provinceRepository.createQueryBuilder().delete().from('provinces').execute();
  console.log('✅ 地区数据已清除');

  await dataSource.destroy();
};

clearRegions().catch(console.error);
