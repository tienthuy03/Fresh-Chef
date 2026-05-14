import { Platform } from 'react-native';

// For Android Emulator, use 10.0.2.2. For iOS/Web, use localhost.
// IMPORTANT: If testing on a real device, replace this with your computer's local IP address (e.g., 'http://192.168.1.5:3000')
const HOST = Platform.select({
  ios: 'localhost',
  android: '192.168.11.13', // Your computer's local IP
});

export const BASE_URL = `http://${HOST}:3000`;
export const API_URL = `${BASE_URL}/api`;
