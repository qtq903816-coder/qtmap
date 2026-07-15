import { create } from 'zustand';
import { sampleTravelData } from '../data/sampleRecords';
import { readTravelData, replaceTravelData, writeTravelData } from '../services/travelStorage';
import type { TravelData, TravelRecord, UserSettings } from '../types';
import { SUPPORTED_SCHEMA_VERSION } from '../utils/backup';

type TravelStore = TravelData & {
  isHydrated: boolean;
  hydrate: () => void;
  addRecord: (record: TravelRecord) => void;
  updateRecord: (record: TravelRecord) => void;
  deleteRecord: (id: string) => void;
  replaceAll: (records: TravelRecord[], settings?: UserSettings) => void;
  clearAll: () => void;
  resetSampleData: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
};

function persist(data: TravelData) {
  writeTravelData(data);
  return data;
}

export const useTravelStore = create<TravelStore>((set, get) => ({
  ...sampleTravelData,
  isHydrated: false,
  hydrate: () => {
    const data = readTravelData();
    set({ ...data, isHydrated: true });
  },
  addRecord: (record) => set((state) => persist({
    schemaVersion: state.schemaVersion,
    settings: state.settings,
    records: [record, ...state.records],
  })),
  updateRecord: (record) => set((state) => persist({
    schemaVersion: state.schemaVersion,
    settings: state.settings,
    records: state.records.map((item) => (item.id === record.id ? record : item)),
  })),
  deleteRecord: (id) => set((state) => persist({
    schemaVersion: state.schemaVersion,
    settings: state.settings,
    records: state.records.filter((record) => record.id !== id),
  })),
  replaceAll: (records, settings) => {
    const data = {
      schemaVersion: SUPPORTED_SCHEMA_VERSION,
      settings: settings ?? get().settings,
      records,
    };
    replaceTravelData(data);
    set(data);
  },
  clearAll: () => set((state) => persist({
    schemaVersion: state.schemaVersion,
    settings: state.settings,
    records: [],
  })),
  resetSampleData: () => {
    replaceTravelData(sampleTravelData);
    set(sampleTravelData);
  },
  updateSettings: (settings) => set((state) => persist({
    schemaVersion: state.schemaVersion,
    settings: { ...state.settings, ...settings },
    records: state.records,
  })),
}));
