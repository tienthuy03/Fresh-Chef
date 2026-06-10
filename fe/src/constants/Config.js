import { Platform } from 'react-native';

const PRODUCTION_API_URL = 'https://be-repice.onrender.com';

const HOST = Platform.select({
  ios: 'localhost',
  android: '10.0.2.2',
});

const DEV_BASE_URL = `http://${HOST}:3000`;

// Đổi thành true nếu chạy backend local (npm start trong /be)
const USE_LOCAL_API = false;

export const BASE_URL = __DEV__ && USE_LOCAL_API ? DEV_BASE_URL : PRODUCTION_API_URL;
export const API_URL = `${BASE_URL}/api`;
