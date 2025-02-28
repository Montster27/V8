// src/infrastructure/state/store.ts
import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';
import timeReducer from './slices/timeSlice';

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    time: timeReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
