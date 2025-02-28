// /Users/montysharma/Documents/v8/MMV08/src/domain/models/ActivityManager.ts

import { Activity, IActivity, ScheduledActivity } from './Activity';
import { ActivityRepeatability } from '../types/ActivityTypes';

/**
 * Interface for ActivityManager state
 */
export interface ActivityManagerState {
  activities: Record<string, IActivity>;
  scheduledActivities: ScheduledActivity[];
  completedActivities: ScheduledActivity[];
  activityHistory: {
    activityId: string;
    timestamp: number;
  }[];
}

/**
 * Manages activities and activity scheduling
 */
export class ActivityManager {
  private _activities: Map<string, Activity>;
  private _scheduledActivities: ScheduledActivity[];
  private _completedActivities: ScheduledActivity[];
  private _activityHistory: {
    activityId: string;
    timestamp: number;
  }[];
  
  // Keep track of one-time activities and once-per-day activities separately
  // for scheduling restrictions, but don't include in serialized state
  private _oneTimeActivities: Set<string> = new Set();
  private _onceDailyActivities: Map<string, number> = new Map(); // activityId -> dayStart timestamp
  
  /**
   * Create a new ActivityManager
   */
  constructor() {
    this._activities = new Map();
    this._scheduledActivities = [];
    this._completedActivities = [];
    this._activityHistory = [];
    this._oneTimeActivities = new Set();
    this._onceDailyActivities = new Map();
  }
  
  /**
   * Register an activity
   */
  registerActivity(activity: Activity | IActivity): Activity {
    const activityInstance = activity instanceof Activity 
      ? activity 
      : new Activity(activity);
      
    this._activities.set(activityInstance.id, activityInstance);
    return activityInstance;
  }
  
  /**
   * Get an activity by ID
   */
  getActivity(id: string): Activity | undefined {
    return this._activities.get(id);
  }
  
  /**
   * Get all registered activities
   */
  getAllActivities(): Activity[] {
    return Array.from(this._activities.values());
  }
  
  /**
   * Schedule an activity
   */
  scheduleActivity(activityId: string, startTime: number): ScheduledActivity | null {
    const activity = this._activities.get(activityId);
    
    if (!activity) {
      console.error(`Activity with ID ${activityId} not found`);
      return null;
    }
    
    // Check if the activity can be scheduled based on repeatability
    if (!this.canScheduleActivity(activity, startTime)) {
      console.error(`Activity ${activityId} cannot be scheduled again`);
      return null;
    }
    
    // Before scheduling, register appropriate tracking information
    if (activity.repeatability === ActivityRepeatability.ONCE) {
      this._oneTimeActivities.add(activityId);
    } else if (activity.repeatability === ActivityRepeatability.ONCE_PER_DAY) {
      // Extract day boundaries for the start time
      const startDate = new Date(startTime);
      const dayStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      ).getTime();
      
      this._onceDailyActivities.set(activityId, dayStart);
    }
    
    const scheduledActivity = activity.schedule(startTime);
    this._scheduledActivities.push(scheduledActivity);
    
    return scheduledActivity;
  }
  
  /**
   * Check if an activity can be scheduled based on repeatability
   */
  private canScheduleActivity(activity: Activity, startTime: number): boolean {
    const activityId = activity.id;
    
    switch (activity.repeatability) {
      case ActivityRepeatability.ONCE:
        // Check if the activity has already been scheduled
        return !this._oneTimeActivities.has(activityId);
        
      case ActivityRepeatability.ONCE_PER_DAY: {
        // Extract day boundaries for the start time
        const startDate = new Date(startTime);
        const dayStart = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        ).getTime();
        
        const dayEnd = dayStart + (24 * 60 * 60 * 1000);
        
        // Check if there's already a scheduled instance for this day
        const storedDayStart = this._onceDailyActivities.get(activityId);
        if (storedDayStart !== undefined && storedDayStart >= dayStart && storedDayStart < dayEnd) {
          return false;
        }
        
        return true;
      }
      
      case ActivityRepeatability.COOLDOWN: {
        // Find the most recent instance of this activity
        const history = this._activityHistory
          .filter(h => h.activityId === activityId)
          .sort((a, b) => b.timestamp - a.timestamp);
          
        if (history.length === 0) {
          return true; // No previous instances
        }
        
        const lastTime = history[0].timestamp;
        const cooldownMs = activity.cooldownMinutes * 60 * 1000;
        
        return startTime >= (lastTime + cooldownMs);
      }
      
      case ActivityRepeatability.UNLIMITED:
        return true;
        
      default:
        return true;
    }
  }
  
  /**
   * Get all currently scheduled activities
   */
  getScheduledActivities(): ScheduledActivity[] {
    return [...this._scheduledActivities];
  }
  
  /**
   * Cancel a scheduled activity
   */
  cancelScheduledActivity(activityId: string, startTime: number): boolean {
    const index = this._scheduledActivities.findIndex(
      sa => sa.activityId === activityId && sa.startTime === startTime
    );
    
    if (index >= 0) {
      const activity = this._scheduledActivities[index];
      this._scheduledActivities.splice(index, 1);
      
      // If it's a one-time activity, we'll allow it to be scheduled again
      const activityObj = this._activities.get(activityId);
      if (activityObj?.repeatability === ActivityRepeatability.ONCE) {
        this._oneTimeActivities.delete(activityId);
      } else if (activityObj?.repeatability === ActivityRepeatability.ONCE_PER_DAY) {
        // Remove from once-daily tracking
        this._onceDailyActivities.delete(activityId);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Mark a scheduled activity as completed
   */
  completeActivity(activityId: string, startTime: number): ScheduledActivity | null {
    const index = this._scheduledActivities.findIndex(
      sa => sa.activityId === activityId && sa.startTime === startTime
    );
    
    if (index >= 0) {
      const activity = this._scheduledActivities[index];
      activity.isCompleted = true;
      
      // Move from scheduled to completed
      this._scheduledActivities.splice(index, 1);
      this._completedActivities.push(activity);
      
      // Add to history
      this._activityHistory.push({
        activityId,
        timestamp: startTime
      });
      
      // For once-per-day activities, we keep the daily limitation in place
      // One-time activities are already tracked by _oneTimeActivities 
      
      return activity;
    }
    
    return null;
  }
  
  /**
   * Get activities scheduled for a specific time
   */
  getActivitiesAt(timestamp: number): ScheduledActivity[] {
    return this._scheduledActivities.filter(
      sa => sa.startTime <= timestamp && sa.endTime >= timestamp
    );
  }
  
  /**
   * Process activities that should be completed based on current time
   * @param currentTime Current game time
   */
  processActivities(currentTime: number): ScheduledActivity[] {
    const completedActivities: ScheduledActivity[] = [];
    
    // Find activities that should be completed
    const activitiesToComplete = this._scheduledActivities.filter(
      sa => sa.endTime <= currentTime && !sa.isCompleted
    );
    
    // Process each activity
    for (const activity of activitiesToComplete) {
      const { activityId, startTime } = activity;
      const completedActivity = this.completeActivity(activityId, startTime);
      
      if (completedActivity) {
        completedActivities.push(completedActivity);
      }
    }
    
    return completedActivities;
  }
  
  /**
   * Check for scheduling conflicts
   * @param activityId Activity to check
   * @param startTime Proposed start time
   * @returns True if there's a conflict, false otherwise
   */
  hasSchedulingConflict(activityId: string, startTime: number): boolean {
    const activity = this._activities.get(activityId);
    
    if (!activity) {
      return false; // No activity found, so no conflict
    }
    
    const endTime = activity.calculateEndTime(startTime);
    
    // Check for overlaps with other scheduled activities
    return this._scheduledActivities.some(sa => {
      // Skip the activity itself (for rescheduling)
      if (sa.activityId === activityId && sa.startTime === startTime) {
        return false;
      }
      
      // Check for overlap
      return (
        (startTime >= sa.startTime && startTime < sa.endTime) || // Start time falls within another activity
        (endTime > sa.startTime && endTime <= sa.endTime) || // End time falls within another activity
        (startTime <= sa.startTime && endTime >= sa.endTime) // Activity completely encompasses another
      );
    });
  }
  
  /**
   * Get completed activities
   */
  getCompletedActivities(): ScheduledActivity[] {
    return [...this._completedActivities];
  }
  
  /**
   * Get activity history
   */
  getActivityHistory(): { activityId: string; timestamp: number }[] {
    return [...this._activityHistory];
  }
  
  /**
   * Get the current state
   */
  getState(): ActivityManagerState {
    return {
      activities: Object.fromEntries(
        Array.from(this._activities.entries()).map(([id, activity]) => [id, activity.toJSON()])
      ),
      scheduledActivities: [...this._scheduledActivities],
      completedActivities: [...this._completedActivities],
      activityHistory: [...this._activityHistory]
    };
  }
  
  /**
   * Restore from state
   */
  restoreState(state: ActivityManagerState): void {
    // Clear existing state
    this._activities = new Map();
    this._scheduledActivities = [];
    this._completedActivities = [];
    this._activityHistory = [];
    this._oneTimeActivities = new Set();
    this._onceDailyActivities = new Map();
    
    // Restore activities
    for (const [id, activityData] of Object.entries(state.activities)) {
      this._activities.set(id, new Activity(activityData));
    }
    
    // Restore scheduled and completed activities
    this._scheduledActivities = [...state.scheduledActivities];
    this._completedActivities = [...state.completedActivities];
    this._activityHistory = [...state.activityHistory];
    
    // Rebuild tracking state for one-time and once-per-day activities
    for (const scheduledActivity of this._scheduledActivities) {
      const activityId = scheduledActivity.activityId;
      const activity = this._activities.get(activityId);
      
      if (activity) {
        if (activity.repeatability === ActivityRepeatability.ONCE) {
          this._oneTimeActivities.add(activityId);
        } else if (activity.repeatability === ActivityRepeatability.ONCE_PER_DAY) {
          // Extract day for the activity
          const startDate = new Date(scheduledActivity.startTime);
          const dayStart = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          ).getTime();
          
          this._onceDailyActivities.set(activityId, dayStart);
        }
      }
    }
    
    // Also add completed activities to the tracking
    for (const historyEntry of this._activityHistory) {
      const activityId = historyEntry.activityId;
      const activity = this._activities.get(activityId);
      
      if (activity && activity.repeatability === ActivityRepeatability.ONCE) {
        this._oneTimeActivities.add(activityId);
      }
    }
  }
}
