import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import { apiService } from './apiService';

import Reactotron from '../config/ReactotronConfig';

export const store = configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiService.middleware),
  enhancers: (getDefaultEnhancers) => {
    if (__DEV__) {
      return getDefaultEnhancers().concat(Reactotron.createEnhancer());
    }
    return getDefaultEnhancers();
  },
});
