import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const storageGetItem = async (key: string) => {
  return storage.getString(key) ?? null;
};

export const storageSetItem = async (key: string, value: string) => {
  storage.set(key, value);
};
