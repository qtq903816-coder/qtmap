import type { TravelData, TravelRecord } from '../types';

const now = '2026-07-14T00:00:00.000Z';

type ChinaSeed = {
  id: string;
  province: string;
  city: string;
  locationCode: string;
  arrivalDate: string;
  departureDate?: string;
  notes?: string;
};

type WorldSeed = {
  id: string;
  countryCode: string;
  countryName: string;
  city: string;
  arrivalDate: string;
  departureDate?: string;
  notes?: string;
};

function chinaRecord(seed: ChinaSeed): TravelRecord {
  return {
    id: seed.id,
    scope: 'china',
    countryCode: 'CN',
    countryName: '中国',
    province: seed.province,
    city: seed.city,
    locationCode: seed.locationCode,
    arrivalDate: seed.arrivalDate,
    departureDate: seed.departureDate,
    notes: seed.notes,
    isPlanned: false,
    createdAt: now,
    updatedAt: now,
  };
}

function worldRecord(seed: WorldSeed): TravelRecord {
  return {
    id: seed.id,
    scope: 'world',
    countryCode: seed.countryCode,
    countryName: seed.countryName,
    city: seed.city,
    arrivalDate: seed.arrivalDate,
    departureDate: seed.departureDate,
    notes: seed.notes,
    isPlanned: false,
    createdAt: now,
    updatedAt: now,
  };
}

const chinaSeeds: ChinaSeed[] = [
  { id: 'lived-shaoyang', province: '湖南省', city: '邵阳', locationCode: '430500', arrivalDate: '2022-01-01', notes: '住过的城市。' },
  { id: 'lived-changsha', province: '湖南省', city: '长沙', locationCode: '430100', arrivalDate: '2022-01-01', notes: '住过的城市。' },
  { id: 'lived-hengyang', province: '湖南省', city: '衡阳', locationCode: '430400', arrivalDate: '2022-01-01', notes: '住过的城市。' },
  { id: 'trip-2023-fenghuang', province: '湖南省', city: '凤凰古城', locationCode: '433123', arrivalDate: '2023-04-07', departureDate: '2023-04-09' },
  { id: 'trip-2023-wudangshan', province: '湖北省', city: '十堰武当山', locationCode: '420300', arrivalDate: '2023-10-14' },
  { id: 'trip-2023-wuhan', province: '湖北省', city: '武汉', locationCode: '420100', arrivalDate: '2023-11-17', departureDate: '2023-11-19' },
  { id: 'trip-2024-nanchang', province: '江西省', city: '南昌', locationCode: '360100', arrivalDate: '2024-01-22', departureDate: '2024-01-24' },
  { id: 'trip-2024-wugongshan', province: '江西省', city: '萍乡武功山', locationCode: '360300', arrivalDate: '2024-01-25' },
  { id: 'trip-2024-guangzhou', province: '广东省', city: '广州', locationCode: '440100', arrivalDate: '2024-03-15', departureDate: '2024-03-18' },
  { id: 'trip-2024-yueyang', province: '湖南省', city: '岳阳', locationCode: '430600', arrivalDate: '2024-03-28' },
  { id: 'trip-2024-fuzhou', province: '福建省', city: '福州', locationCode: '350100', arrivalDate: '2024-04-22', departureDate: '2024-04-26' },
  { id: 'trip-2024-pingtan', province: '福建省', city: '平潭', locationCode: '350128', arrivalDate: '2024-04-24' },
  { id: 'trip-2024-xiangtan', province: '湖南省', city: '湘潭', locationCode: '430300', arrivalDate: '2024-05-20' },
  { id: 'trip-2024-beijing', province: '北京市', city: '北京', locationCode: '110000', arrivalDate: '2024-06-02', departureDate: '2024-06-05' },
  { id: 'trip-2024-tianjin', province: '天津市', city: '天津', locationCode: '120000', arrivalDate: '2024-06-05' },
  { id: 'trip-2024-zibo', province: '山东省', city: '淄博', locationCode: '370300', arrivalDate: '2024-06-06' },
  { id: 'trip-2024-jinan', province: '山东省', city: '济南', locationCode: '370100', arrivalDate: '2024-06-07' },
  { id: 'trip-2024-shijiazhuang', province: '河北省', city: '石家庄', locationCode: '130100', arrivalDate: '2024-06-08' },
  { id: 'trip-2024-taiyuan', province: '山西省', city: '太原', locationCode: '140100', arrivalDate: '2024-06-09', departureDate: '2024-06-11' },
  { id: 'trip-2024-zhengzhou', province: '河南省', city: '郑州', locationCode: '410100', arrivalDate: '2024-06-11' },
  { id: 'trip-2024-luoyang', province: '河南省', city: '洛阳', locationCode: '410300', arrivalDate: '2024-06-12' },
  { id: 'trip-2024-xian', province: '陕西省', city: '西安', locationCode: '610100', arrivalDate: '2024-06-13', departureDate: '2024-06-14' },
  { id: 'trip-2024-yongzhou', province: '湖南省', city: '永州', locationCode: '431100', arrivalDate: '2024-06-24' },
  { id: 'trip-2024-zhongshan', province: '广东省', city: '中山', locationCode: '442000', arrivalDate: '2024-07-01', departureDate: '2024-07-30' },
  { id: 'trip-2024-zhuhai', province: '广东省', city: '珠海', locationCode: '440400', arrivalDate: '2024-07-13', departureDate: '2024-07-14' },
  { id: 'trip-2024-foshan', province: '广东省', city: '佛山', locationCode: '440600', arrivalDate: '2024-07-26', departureDate: '2024-07-28' },
  { id: 'trip-2024-shenzhen', province: '广东省', city: '深圳', locationCode: '440300', arrivalDate: '2024-08-01' },
  { id: 'trip-2024-hongkong', province: '香港特别行政区', city: '香港', locationCode: '810000', arrivalDate: '2024-10-06' },
  { id: 'trip-2024-yangshuo', province: '广西壮族自治区', city: '桂林阳朔', locationCode: '450300', arrivalDate: '2024-10-25', departureDate: '2024-10-27' },
  { id: 'trip-2024-xiamen', province: '福建省', city: '厦门', locationCode: '350200', arrivalDate: '2024-11-02', departureDate: '2024-11-04' },
  { id: 'trip-2025-chongqing', province: '重庆市', city: '重庆', locationCode: '500000', arrivalDate: '2025-01-20', departureDate: '2025-01-22' },
  { id: 'trip-2025-dongshan', province: '福建省', city: '漳州东山岛', locationCode: '350600', arrivalDate: '2025-05-31', departureDate: '2025-06-02' },
  { id: 'trip-2025-hangzhou', province: '浙江省', city: '杭州', locationCode: '330100', arrivalDate: '2025-10-04' },
  { id: 'trip-2025-wuhu', province: '安徽省', city: '芜湖', locationCode: '340200', arrivalDate: '2025-10-05' },
  { id: 'trip-2025-maanshan', province: '安徽省', city: '马鞍山', locationCode: '340500', arrivalDate: '2025-10-06' },
  { id: 'trip-2025-nanjing', province: '江苏省', city: '南京', locationCode: '320100', arrivalDate: '2025-10-07' },
  { id: 'trip-2025-shanghai', province: '上海市', city: '上海', locationCode: '310000', arrivalDate: '2025-12-27', departureDate: '2025-12-29' },
  { id: 'trip-2025-nanxun', province: '浙江省', city: '湖州南浔古镇', locationCode: '330500', arrivalDate: '2025-12-30' },
  { id: 'trip-2025-nantong', province: '江苏省', city: '南通', locationCode: '320600', arrivalDate: '2025-12-31' },
  { id: 'trip-2026-suzhou', province: '江苏省', city: '苏州', locationCode: '320500', arrivalDate: '2026-01-01', departureDate: '2026-01-02' },
  { id: 'trip-2026-liuzhou', province: '广西壮族自治区', city: '柳州', locationCode: '450200', arrivalDate: '2026-02-09', departureDate: '2026-02-11' },
  { id: 'trip-2026-guilin', province: '广西壮族自治区', city: '桂林', locationCode: '450300', arrivalDate: '2026-02-11', departureDate: '2026-02-12' },
  { id: 'trip-2026-guiyang', province: '贵州省', city: '贵阳', locationCode: '520100', arrivalDate: '2026-06-18' },
];

const worldSeeds: WorldSeed[] = [
  { id: 'trip-2026-busan', countryCode: 'KR', countryName: '韩国', city: '釜山', arrivalDate: '2026-05-02', notes: '韩国四天旅行。' },
  { id: 'trip-2026-seoul', countryCode: 'KR', countryName: '韩国', city: '首尔', arrivalDate: '2026-05-03', departureDate: '2026-05-05', notes: '韩国四天旅行。' },
];

export const sampleRecords: TravelRecord[] = [
  ...chinaSeeds.map(chinaRecord),
  ...worldSeeds.map(worldRecord),
].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));

export const sampleTravelData: TravelData = {
  schemaVersion: 1,
  settings: {
    theme: 'light',
    nextDestination: '待定',
  },
  records: sampleRecords,
};
