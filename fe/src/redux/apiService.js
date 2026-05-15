import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';

import { API_URL } from '../constants/Config';

const BASE_URL = API_URL;

export const apiService = createApi({
  reducerPath: 'api',
  tagTypes: ['Favorites', 'ShoppingList', 'Follows', 'Feed', 'Comments', 'RecipeReviews'],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Tự động lấy token từ redux store
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
