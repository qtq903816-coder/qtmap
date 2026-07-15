export const worldMapName = 'qt-world';

export const worldGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '中国', iso2: 'CN', continent: '亚洲' },
      geometry: { type: 'Polygon', coordinates: [[[73, 18], [135, 18], [135, 54], [73, 54], [73, 18]]] },
    },
    {
      type: 'Feature',
      properties: { name: '韩国', iso2: 'KR', continent: '亚洲' },
      geometry: { type: 'Polygon', coordinates: [[[126, 34], [130, 34], [130, 39], [126, 39], [126, 34]]] },
    },
    {
      type: 'Feature',
      properties: { name: '日本', iso2: 'JP', continent: '亚洲' },
      geometry: { type: 'Polygon', coordinates: [[[130, 31], [146, 31], [146, 45], [130, 45], [130, 31]]] },
    },
    {
      type: 'Feature',
      properties: { name: '越南', iso2: 'VN', continent: '亚洲' },
      geometry: { type: 'Polygon', coordinates: [[[102, 8], [110, 8], [110, 23], [102, 23], [102, 8]]] },
    },
    {
      type: 'Feature',
      properties: { name: '美国', iso2: 'US', continent: '北美洲' },
      geometry: { type: 'Polygon', coordinates: [[[-125, 25], [-66, 25], [-66, 49], [-125, 49], [-125, 25]]] },
    },
    {
      type: 'Feature',
      properties: { name: '法国', iso2: 'FR', continent: '欧洲' },
      geometry: { type: 'Polygon', coordinates: [[[-5, 42], [8, 42], [8, 51], [-5, 51], [-5, 42]]] },
    },
    {
      type: 'Feature',
      properties: { name: '澳大利亚', iso2: 'AU', continent: '大洋洲' },
      geometry: { type: 'Polygon', coordinates: [[[113, -44], [154, -44], [154, -10], [113, -10], [113, -44]]] },
    },
  ],
};

export const countryCoordinates: Record<string, [number, number]> = {
  CN: [104, 35],
  KR: [127.8, 36.5],
  JP: [138, 37],
  VN: [106, 16],
  US: [-98, 38],
  FR: [2, 47],
  AU: [134, -25],
};

export const continents = ['全部', '亚洲', '欧洲', '北美洲', '大洋洲'];
