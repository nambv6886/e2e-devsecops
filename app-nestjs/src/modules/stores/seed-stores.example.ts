/**
 * Sample seed script for creating test stores
 * Run this script to populate the database with sample data for testing
 *
 * Usage:
 * 1. Ensure your database is running
 * 2. Update database connection in this file if needed
 * 3. Run: npx ts-node src/modules/stores/seed-stores.example.ts
 */

import { createConnection } from 'typeorm';
import { StoreEntity } from './entities/store.entity';

const sampleStores = [
  // Supermarkets in Hanoi
  {
    name: 'Winmart Plaza Thanh Xuan',
    type: 'supermarket',
    address: '268 To Huu, Thanh Xuan, Hanoi',
    latitude: 21.0017,
    longitude: 105.8068,
    rating: 4.5,
  },
  {
    name: 'Winmart+ Nguyen Trai',
    type: 'supermarket',
    address: '123 Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 21.0054,
    longitude: 105.8225,
    rating: 4.3,
  },
  {
    name: 'Big C Thang Long',
    type: 'supermarket',
    address: '222 Tran Duy Hung, Cau Giay, Hanoi',
    latitude: 21.028511,
    longitude: 105.804817,
    rating: 4.6,
  },
  {
    name: 'Aeon Mall Long Bien',
    type: 'supermarket',
    address: '27 Co Linh, Long Bien, Hanoi',
    latitude: 21.0422,
    longitude: 105.8825,
    rating: 4.7,
  },
  {
    name: 'Vinmart Hoan Kiem',
    type: 'supermarket',
    address: '45 Hang Bong, Hoan Kiem, Hanoi',
    latitude: 21.0332,
    longitude: 105.853,
    rating: 4.4,
  },

  // Gas Stations
  {
    name: 'Petrolimex Giai Phong',
    type: 'gas_station',
    address: '123 Giai Phong, Hai Ba Trung, Hanoi',
    latitude: 21.0105,
    longitude: 105.8542,
    rating: 4.2,
  },
  {
    name: 'Petrolimex Lang Ha',
    type: 'gas_station',
    address: '56 Lang Ha, Dong Da, Hanoi',
    latitude: 21.0158,
    longitude: 105.8112,
    rating: 4.1,
  },
  {
    name: 'Pvoil Nguyen Khanh Toan',
    type: 'gas_station',
    address: '89 Nguyen Khanh Toan, Cau Giay, Hanoi',
    latitude: 21.0335,
    longitude: 105.7942,
    rating: 4.0,
  },

  // Eateries
  {
    name: 'Phở Bò Lý Quốc Sư',
    type: 'eatery',
    address: '10 Ly Quoc Su, Hoan Kiem, Hanoi',
    latitude: 21.0298,
    longitude: 105.8505,
    rating: 4.8,
  },
  {
    name: 'Bún Chả Hương Liên',
    type: 'eatery',
    address: '24 Le Van Huu, Hai Ba Trung, Hanoi',
    latitude: 21.0214,
    longitude: 105.8492,
    rating: 4.9,
  },
  {
    name: 'Highlands Coffee Trang Tien',
    type: 'eatery',
    address: '39 Trang Tien, Hoan Kiem, Hanoi',
    latitude: 21.0245,
    longitude: 105.8538,
    rating: 4.5,
  },
  {
    name: 'The Coffee House Xuan Thuy',
    type: 'eatery',
    address: '123 Xuan Thuy, Cau Giay, Hanoi',
    latitude: 21.0378,
    longitude: 105.7935,
    rating: 4.4,
  },
  {
    name: 'Lotteria Royal City',
    type: 'eatery',
    address: '72A Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 21.0042,
    longitude: 105.8205,
    rating: 4.2,
  },

  // Pharmacies
  {
    name: 'Pharmacity Nguyen Trai',
    type: 'pharmacy',
    address: '234 Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 21.0068,
    longitude: 105.8212,
    rating: 4.6,
  },
  {
    name: 'Long Châu Cau Giay',
    type: 'pharmacy',
    address: '456 Cau Giay, Cau Giay, Hanoi',
    latitude: 21.0332,
    longitude: 105.7958,
    rating: 4.7,
  },
  {
    name: 'Pharmacity Hoan Kiem',
    type: 'pharmacy',
    address: '78 Hang Bai, Hoan Kiem, Hanoi',
    latitude: 21.0275,
    longitude: 105.8522,
    rating: 4.5,
  },
  {
    name: 'An Khang Pharmacy',
    type: 'pharmacy',
    address: '90 Tran Duy Hung, Cau Giay, Hanoi',
    latitude: 21.0298,
    longitude: 105.8035,
    rating: 4.4,
  },

  // Other
  {
    name: 'FPT Shop Thanh Xuan',
    type: 'other',
    address: '100 Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 21.0052,
    longitude: 105.8218,
    rating: 4.3,
  },
  {
    name: 'Guardian Trang Tien',
    type: 'other',
    address: '45 Trang Tien, Hoan Kiem, Hanoi',
    latitude: 21.0248,
    longitude: 105.8535,
    rating: 4.5,
  },
];

async function seedStores() {
  console.log('Starting to seed stores...');

  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'location_service',
    entities: [StoreEntity],
  });

  const storeRepository = connection.getRepository(StoreEntity);

  for (const storeData of sampleStores) {
    try {
      const { latitude, longitude, ...rest } = storeData;

      // Create store using query builder to properly set the location POINT
      await storeRepository
        .createQueryBuilder()
        .insert()
        .into(StoreEntity)
        .values({
          ...rest,
          latitude,
          longitude,
          location: () =>
            `ST_GeomFromText('POINT(${latitude} ${longitude})', 4326)`,
          isActive: true,
        } as any)
        .execute();

      console.log(`✓ Created store: ${storeData.name}`);
    } catch (error) {
      console.error(
        `✗ Failed to create store ${storeData.name}:`,
        error.message,
      );
    }
  }

  await connection.close();
  console.log('\nSeeding completed!');
  console.log(`Total stores created: ${sampleStores.length}`);
  console.log('\nYou can now test the search API with these sample locations:');
  console.log('- Center of Hanoi (Hoan Kiem): 21.028511, 105.852400');
  console.log('- Thanh Xuan District: 21.005000, 105.820000');
  console.log('- Cau Giay District: 21.033000, 105.795000');
}

// Run the seeder
seedStores().catch((error) => {
  console.error('Error seeding stores:', error);
  process.exit(1);
});
