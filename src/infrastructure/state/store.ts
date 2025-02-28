/**
 * /Users/montysharma/Documents/v8/MMV08/src/infrastructure/state/store.ts
 * 
 * Redux store configuration.
 */

import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';
import timeReducer from './slices/timeSlice';
import skillsReducer from './slices/skillsSlice';
import eventsReducer from './slices/eventsSlice';

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    time: timeReducer,
    skills: skillsReducer,
    events: eventsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
