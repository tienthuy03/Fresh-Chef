import { Platform } from 'react-native';

// Sau khi deploy Render, thay URL bên dưới bằng URL thật (vd: https://recipe-api-xxxx.onrender.com)
const PRODUCTION_API_URL = 'https://YOUR-APP-NAME.onrender.com';

const HOST = Platform.select({
  ios: 'localhost',
  android: '10.0.2.2',
});

const DEV_BASE_URL = `http://${HOST}:3000`;

export const BASE_URL = __DEV__ ? DEV_BASE_URL : PRODUCTION_API_URL;
export const API_URL = `${BASE_URL}/api`;
