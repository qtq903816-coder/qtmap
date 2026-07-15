export type TravelScope = 'china' | 'world';

export type TravelRecord = {
  id: string;
  scope: TravelScope;
  countryCode: string;
  countryName: string;
  province?: string;
  city?: string;
  locationCode?: string;
  arrivalDate: string;
  departureDate?: string;
  notes?: string;
  rating?: number;
  photoUrls?: string[];
  isPlanned?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserSettings = {
  theme: 'light' | 'dark';
  nextDestination?: string;
};

export type TravelBackup = {
  format: 'qtmap-backup';
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  recordCount: number;
  settings: UserSettings;
  records: TravelRecord[];
};

export type TravelData = {
  schemaVersion: number;
  settings: UserSettings;
  records: TravelRecord[];
};

export type ImportValidationResult = {
  backup?: TravelBackup;
  validRecords: TravelRecord[];
  invalidRecords: Array<{ index: number; reason: string }>;
  errors: string[];
};

export type ImportPreview = {
  exportedAt?: string;
  appVersion?: string;
  recordCount: number;
  newCount: number;
  duplicateCount: number;
  conflictCount: number;
  invalidCount: number;
  conflicts: Array<{ current: TravelRecord; incoming: TravelRecord }>;
  validRecords: TravelRecord[];
  invalidRecords: Array<{ index: number; reason: string }>;
};

export type TravelStats = {
  visitedCountryCount: number;
  visitedChinaCityCount: number;
  totalTrips: number;
  totalDays: number;
  latestTrip?: TravelRecord;
  recentRecords: TravelRecord[];
};
