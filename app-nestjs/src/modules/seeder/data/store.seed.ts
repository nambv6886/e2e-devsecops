/**
 * Seed data for stores
 * Contains sample stores in Hanoi, Vietnam with various types:
 * - Supermarkets
 * - Gas Stations
 * - Eateries (Restaurants, Cafes)
 * - Pharmacies
 * - Other (Electronics, etc.)
 */

export const seedStores = [
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
  {
    name: 'Lotte Mart Tay Ho',
    type: 'supermarket',
    address: '234 Lac Long Quan, Tay Ho, Hanoi',
    latitude: 21.0552,
    longitude: 105.8182,
    rating: 4.5,
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
  {
    name: 'Petrolimex Xa Dan',
    type: 'gas_station',
    address: '15 Xa Dan, Dong Da, Hanoi',
    latitude: 21.0168,
    longitude: 105.8285,
    rating: 4.3,
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
  {
    name: 'Bánh Mì 25',
    type: 'eatery',
    address: '25 Hang Ca, Hoan Kiem, Hanoi',
    latitude: 21.0342,
    longitude: 105.8512,
    rating: 4.7,
  },
  {
    name: 'Cộng Cà Phê Đinh Tiên Hoàng',
    type: 'eatery',
    address: '67 Dinh Tien Hoang, Hoan Kiem, Hanoi',
    latitude: 21.0275,
    longitude: 105.8552,
    rating: 4.6,
  },
  {
    name: 'KFC Vincom Ba Trieu',
    type: 'eatery',
    address: '191 Ba Trieu, Hai Ba Trung, Hanoi',
    latitude: 21.0195,
    longitude: 105.8435,
    rating: 4.3,
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
  {
    name: 'Pharmacity Trung Hoa',
    type: 'pharmacy',
    address: '56 Trung Hoa, Cau Giay, Hanoi',
    latitude: 21.0315,
    longitude: 105.7998,
    rating: 4.5,
  },

  // Other (Electronics, Cosmetics, etc.)
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
  {
    name: 'The Gioi Di Dong Cau Giay',
    type: 'other',
    address: '200 Cau Giay, Cau Giay, Hanoi',
    latitude: 21.0328,
    longitude: 105.7965,
    rating: 4.4,
  },
  {
    name: 'Bach Hoa Xanh Thanh Xuan',
    type: 'other',
    address: '150 Nguyen Trai, Thanh Xuan, Hanoi',
    latitude: 21.0048,
    longitude: 105.8215,
    rating: 4.2,
  },
];
