// /Users/montysharma/Documents/v8/MMV08/src/application/hooks/useActivities.ts

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../infrastructure/state/store';
import { Activity, IActivity, ScheduledActivity } from '../../domain/models/Activity';
import { ActivityManager } from '../../domain/services/ActivityManager';
import { 
  setActivities,
  addScheduledActivity,
  removeScheduledActivity,
  completeActivity,
  setSelectedActivity
} from '../../infrastructure/state/slices/activitiesSlice';

/**
 * Custom hook to interact with the activities system
 * This hook provides access to activities state and operations
 */
export function useActivities() {
  const dispatch = useDispatch<AppDispatch>();
  const activitiesState = useSelector((state: RootState) => state.activities);
  const timeState = useSelector((state: RootState) => state.time);
  
  // Local activity manager instance for domain operations
  const [activityManager, setActivityManager] = useState<ActivityManager | null>(null);
  
  // Initialize the activity manager
  useEffect(() => {
    // Create a default activity manager
    const manager = ActivityManager.createDefault();
    
    // Sync available activities to Redux
    const availableActivities = manager.getAllActivities().map(a => a.toJSON());
    dispatch(setActivities(availableActivities));
    
    setActivityManager(manager);
  }, [dispatch]);
  
  // Schedule an activity
  const scheduleActivity = useCallback((activityId: string, startTime: number) => {
    if (!activityManager) return null;
    
    // First check for conflicts
    if (activityManager.hasSchedulingConflict(activityId, startTime)) {
      console.error('Scheduling conflict detected');
      return null;
    }
    
    // Schedule the activity
    const scheduledActivity = activityManager.scheduleActivity(activityId, startTime);
    
    if (scheduledActivity) {
      // Update Redux state
      dispatch(addScheduledActivity(scheduledActivity));
    }
    
    return scheduledActivity;
  }, [activityManager, dispatch]);
  
  // Cancel a scheduled activity
  const cancelActivity = useCallback((activityId: string, startTime: number) => {
    if (!activityManager) return false;
    
    const success = activityManager.cancelScheduledActivity(activityId, startTime);
    
    if (success) {
      // Update Redux state
      dispatch(removeScheduledActivity({ activityId, startTime }));
    }
    
    return success;
  }, [activityManager, dispatch]);
  
  // Complete an activity manually
  const completeActivityManually = useCallback((activityId: string, startTime: number) => {
    if (!activityManager) return null;
    
    const result = activityManager.completeActivity(activityId, startTime);
    
    if (result) {
      // Update Redux state
      dispatch(completeActivity({ activityId, startTime }));
    }
    
    return result;
  }, [activityManager, dispatch]);
  
  // Select an activity for UI
  const selectActivity = useCallback((activityId: string | null) => {
    dispatch(setSelectedActivity(activityId));
  }, [dispatch]);
  
  // Get activities scheduled at the current time
  const currentActivities = useCallback(() => {
    if (!activityManager) return [];
    
    return activityManager.getActivitiesAt(timeState.timestamp);
  }, [activityManager, timeState.timestamp]);
  
  // Get activity details by ID
  const getActivity = useCallback((id: string): IActivity | undefined => {
    return activitiesState.available[id];
  }, [activitiesState.available]);
  
  // Check if a specific time slot is available
  const isTimeSlotAvailable = useCallback((startTime: number, durationMinutes: number): boolean => {
    if (!activityManager) return false;
    
    // Create a temporary activity to check for conflicts
    const tempActivity: IActivity = {
      id: 'temp_check_activity',
      name: 'Temporary',
      description: 'Used for checking time slot availability',
      category: 'special',
      duration: durationMinutes,
      effects: [],
      repeatability: 'once',
      location: { type: 'special', name: 'None', id: 'none' }
    };
    
    // Register the temporary activity
    const activity = activityManager.registerActivity(tempActivity);
    
    // Check for conflicts
    const hasConflict = activityManager.hasSchedulingConflict(activity.id, startTime);
    
    // Remove the temporary activity from the manager's state
    // This is a bit of a hack, but the current API doesn't have a clean way to remove activities
    
    return !hasConflict;
  }, [activityManager]);
  
  return {
    // State
    activities: Object.values(activitiesState.available),
    scheduledActivities: activitiesState.scheduled,
    completedActivities: activitiesState.completed,
    selectedActivityId: activitiesState.selectedActivityId,
    activityHistory: activitiesState.history,
    
    // Operations
    scheduleActivity,
    cancelActivity,
    completeActivityManually,
    selectActivity,
    currentActivities,
    getActivity,
    isTimeSlotAvailable
  };
}
