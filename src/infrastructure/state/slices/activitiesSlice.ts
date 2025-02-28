// /Users/montysharma/Documents/v8/MMV08/src/infrastructure/state/slices/activitiesSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IActivity, ScheduledActivity } from '../../../domain/models/Activity';

export interface ActivitiesState {
  // All available activities
  available: {
    [id: string]: IActivity;
  };
  // Currently scheduled activities
  scheduled: ScheduledActivity[];
  // Completed activities
  completed: ScheduledActivity[];
  // History record for analytics
  history: {
    activityId: string;
    timestamp: number;
  }[];
  // Currently selected activity (for UI purposes)
  selectedActivityId: string | null;
}

const initialState: ActivitiesState = {
  available: {},
  scheduled: [],
  completed: [],
  history: [],
  selectedActivityId: null
};

/**
 * Redux slice for managing activities
 */
const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    // Add or update an available activity
    setActivity: (state, action: PayloadAction<IActivity>) => {
      const activity = action.payload;
      state.available[activity.id] = activity;
    },
    
    // Set multiple activities at once
    setActivities: (state, action: PayloadAction<IActivity[]>) => {
      action.payload.forEach(activity => {
        state.available[activity.id] = activity;
      });
    },
    
    // Add a scheduled activity
    addScheduledActivity: (state, action: PayloadAction<ScheduledActivity>) => {
      state.scheduled.push(action.payload);
    },
    
    // Remove a scheduled activity
    removeScheduledActivity: (
      state, 
      action: PayloadAction<{ activityId: string; startTime: number }>
    ) => {
      const { activityId, startTime } = action.payload;
      state.scheduled = state.scheduled.filter(
        activity => !(activity.activityId === activityId && activity.startTime === startTime)
      );
    },
    
    // Complete a scheduled activity and move it to completed
    completeActivity: (
      state, 
      action: PayloadAction<{ activityId: string; startTime: number }>
    ) => {
      const { activityId, startTime } = action.payload;
      const index = state.scheduled.findIndex(
        activity => activity.activityId === activityId && activity.startTime === startTime
      );
      
      if (index >= 0) {
        const activity = state.scheduled[index];
        activity.isCompleted = true;
        
        // Remove from scheduled
        state.scheduled.splice(index, 1);
        
        // Add to completed
        state.completed.push(activity);
        
        // Add to history
        state.history.push({
          activityId,
          timestamp: startTime
        });
      }
    },
    
    // Add multiple completed activities at once (useful for time jumps)
    addCompletedActivities: (state, action: PayloadAction<ScheduledActivity[]>) => {
      action.payload.forEach(activity => {
        // Add to completed
        state.completed.push(activity);
        
        // Add to history
        state.history.push({
          activityId: activity.activityId,
          timestamp: activity.startTime
        });
        
        // Remove from scheduled if present
        state.scheduled = state.scheduled.filter(
          sa => !(sa.activityId === activity.activityId && sa.startTime === activity.startTime)
        );
      });
    },
    
    // Set selected activity for UI
    setSelectedActivity: (state, action: PayloadAction<string | null>) => {
      state.selectedActivityId = action.payload;
    },
    
    // Replace the entire state (for loading saved games)
    setActivityState: (state, action: PayloadAction<ActivitiesState>) => {
      return action.payload;
    },
    
    // Reset to initial state
    resetActivities: () => initialState
  }
});

export const { 
  setActivity, 
  setActivities, 
  addScheduledActivity, 
  removeScheduledActivity,
  completeActivity, 
  addCompletedActivities,
  setSelectedActivity,
  setActivityState,
  resetActivities
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
