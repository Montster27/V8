// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/models/ActivityManager.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivityManager } from '../../../domain/models/ActivityManager';
import { Activity, IActivity } from '../../../domain/models/Activity';
import { 
  ActivityCategory, 
  ActivityDuration, 
  ActivityRepeatability,
  ActivityLocationType,
} from '../../../domain/types/ActivityTypes';
import { ResourceType } from '../../../domain/types/ResourceTypes';

describe('ActivityManager', () => {
  // Sample activity data for testing
  const studyActivity: IActivity = {
    id: 'study-101',
    name: 'Study Computer Science',
    description: 'Hit the books and improve your computer science knowledge',
    category: ActivityCategory.ACADEMIC,
    duration: ActivityDuration.MEDIUM, // 60 minutes
    effects: [
      {
        resourceType: ResourceType.ENERGY,
        amount: -10,
        description: 'Studying makes you tired'
      }
    ],
    repeatability: ActivityRepeatability.UNLIMITED,
    location: {
      type: ActivityLocationType.CAMPUS,
      name: 'Library',
      id: 'campus-library',
      description: 'The main campus library'
    }
  };
  
  const exerciseActivity: IActivity = {
    id: 'exercise-101',
    name: 'Go for a run',
    description: 'Improve your physical fitness with a quick run',
    category: ActivityCategory.HEALTH,
    duration: ActivityDuration.SHORT, // 30 minutes
    effects: [
      {
        resourceType: ResourceType.ENERGY,
        amount: -5,
        description: 'Running takes energy'
      },
      {
        resourceType: ResourceType.HEALTH,
        amount: 10,
        description: 'Exercise improves health'
      }
    ],
    repeatability: ActivityRepeatability.ONCE_PER_DAY,
    location: {
      type: ActivityLocationType.CAMPUS,
      name: 'Track Field',
      id: 'campus-track',
      description: 'The campus track and field'
    }
  };
  
  const oneTimeActivity: IActivity = {
    id: 'orientation',
    name: 'Freshman Orientation',
    description: 'Attend the mandatory freshman orientation',
    category: ActivityCategory.SPECIAL,
    duration: ActivityDuration.LONG, // 120 minutes
    effects: [
      {
        resourceType: ResourceType.BELONGING,
        amount: 15,
        description: 'Meeting fellow students increases belonging'
      }
    ],
    repeatability: ActivityRepeatability.ONCE,
    location: {
      type: ActivityLocationType.CAMPUS,
      name: 'Main Auditorium',
      id: 'campus-auditorium'
    }
  };
  
  const cooldownActivity: IActivity = {
    id: 'party',
    name: 'Attend Party',
    description: 'Have fun at a campus party',
    category: ActivityCategory.SOCIAL,
    duration: ActivityDuration.VERY_LONG, // 240 minutes
    effects: [
      {
        resourceType: ResourceType.ENERGY,
        amount: -20,
        description: 'Partying is exhausting'
      },
      {
        resourceType: ResourceType.BELONGING,
        amount: 20,
        description: 'Socializing increases belonging'
      }
    ],
    repeatability: ActivityRepeatability.COOLDOWN,
    cooldownMinutes: 2880, // 48 hours (2 days)
    location: {
      type: ActivityLocationType.CAMPUS,
      name: 'Fraternity House',
      id: 'campus-frat-house'
    }
  };
  
  let activityManager: ActivityManager;
  
  // Mock Date.now for predictable test results
  const mockNow = new Date('2023-01-01T12:00:00').getTime();
  
  beforeEach(() => {
    activityManager = new ActivityManager();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Silence console errors
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);
    
    // Register sample activities
    activityManager.registerActivity(studyActivity);
    activityManager.registerActivity(exerciseActivity);
    activityManager.registerActivity(oneTimeActivity);
    activityManager.registerActivity(cooldownActivity);
  });
  
  it('should register and retrieve activities', () => {
    const activity = activityManager.getActivity('study-101');
    expect(activity).toBeInstanceOf(Activity);
    expect(activity?.id).toBe('study-101');
    expect(activity?.name).toBe('Study Computer Science');
    
    const allActivities = activityManager.getAllActivities();
    expect(allActivities.length).toBe(4);
  });
  
  it('should schedule activities', () => {
    const startTime = mockNow;
    const scheduled = activityManager.scheduleActivity('study-101', startTime);
    
    expect(scheduled).not.toBeNull();
    expect(scheduled?.activityId).toBe('study-101');
    expect(scheduled?.startTime).toBe(startTime);
    expect(scheduled?.endTime).toBe(startTime + (60 * 60 * 1000)); // 60 minutes later
    
    const scheduledActivities = activityManager.getScheduledActivities();
    expect(scheduledActivities.length).toBe(1);
  });
  
  it('should handle one-time activities correctly', () => {
    // Schedule the one-time activity
    const startTime = mockNow;
    const scheduled = activityManager.scheduleActivity('orientation', startTime);
    expect(scheduled).not.toBeNull();
    
    // Try to schedule it again
    const scheduledAgain = activityManager.scheduleActivity('orientation', startTime + 1000);
    expect(scheduledAgain).toBeNull(); // Should fail
  });
  
  it('should handle once-per-day activities correctly', () => {
    // Schedule the once-per-day activity
    const todayNoon = new Date('2023-01-01T12:00:00').getTime();
    const scheduled = activityManager.scheduleActivity('exercise-101', todayNoon);
    expect(scheduled).not.toBeNull();
    
    // Try to schedule it again today
    const todayEvening = new Date('2023-01-01T18:00:00').getTime();
    const scheduledAgainToday = activityManager.scheduleActivity('exercise-101', todayEvening);
    expect(scheduledAgainToday).toBeNull(); // Should fail
    
    // Mark the activity as completed
    activityManager.completeActivity('exercise-101', todayNoon);
    
    // Try to schedule it for tomorrow
    const tomorrowNoon = new Date('2023-01-02T12:00:00').getTime();
    const scheduledTomorrow = activityManager.scheduleActivity('exercise-101', tomorrowNoon);
    expect(scheduledTomorrow).not.toBeNull(); // Should succeed
  });
  
  it('should handle cooldown activities correctly', () => {
    // Schedule the cooldown activity
    const startTime = mockNow;
    const scheduled = activityManager.scheduleActivity('party', startTime);
    expect(scheduled).not.toBeNull();
    
    // Complete the activity
    activityManager.completeActivity('party', startTime);
    
    // Try to schedule it before cooldown period
    const beforeCooldown = startTime + (60 * 60 * 1000); // 1 hour later
    const scheduledTooSoon = activityManager.scheduleActivity('party', beforeCooldown);
    expect(scheduledTooSoon).toBeNull(); // Should fail
    
    // Try to schedule it after cooldown period
    const afterCooldown = startTime + (3000 * 60 * 1000); // 50 hours later (> 48 hour cooldown)
    const scheduledAfterCooldown = activityManager.scheduleActivity('party', afterCooldown);
    expect(scheduledAfterCooldown).not.toBeNull(); // Should succeed
  });
  
  it('should cancel scheduled activities', () => {
    const startTime = mockNow;
    activityManager.scheduleActivity('study-101', startTime);
    
    const result = activityManager.cancelScheduledActivity('study-101', startTime);
    expect(result).toBe(true);
    
    const scheduledActivities = activityManager.getScheduledActivities();
    expect(scheduledActivities.length).toBe(0);
    
    // Try to cancel non-existent activity
    const resultNonExistent = activityManager.cancelScheduledActivity('fake-id', startTime);
    expect(resultNonExistent).toBe(false);
  });
  
  it('should complete activities and track history', () => {
    const startTime = mockNow;
    activityManager.scheduleActivity('study-101', startTime);
    
    // Complete the activity
    const completedActivity = activityManager.completeActivity('study-101', startTime);
    expect(completedActivity).not.toBeNull();
    expect(completedActivity?.isCompleted).toBe(true);
    
    // Check completed activities
    const completedActivities = activityManager.getCompletedActivities();
    expect(completedActivities.length).toBe(1);
    
    // Check activity history
    const history = activityManager.getActivityHistory();
    expect(history.length).toBe(1);
    expect(history[0].activityId).toBe('study-101');
    expect(history[0].timestamp).toBe(startTime);
  });
  
  it('should detect scheduling conflicts', () => {
    // Schedule first activity (60 minutes duration)
    const startTime = mockNow;
    activityManager.scheduleActivity('study-101', startTime);
    
    // Try to schedule another activity during the same time
    const conflictResult = activityManager.hasSchedulingConflict('exercise-101', startTime + 10 * 60 * 1000);
    expect(conflictResult).toBe(true);
    
    // Try to schedule after the first activity ends
    const noConflictResult = activityManager.hasSchedulingConflict('exercise-101', startTime + 61 * 60 * 1000);
    expect(noConflictResult).toBe(false);
  });
  
  it('should get activities at a specific time', () => {
    const startTime = mockNow;
    activityManager.scheduleActivity('study-101', startTime); // 60 min duration
    
    // During the activity
    const during = activityManager.getActivitiesAt(startTime + 30 * 60 * 1000);
    expect(during.length).toBe(1);
    expect(during[0].activityId).toBe('study-101');
    
    // After the activity
    const after = activityManager.getActivitiesAt(startTime + 90 * 60 * 1000);
    expect(after.length).toBe(0);
  });
  
  it('should process activities based on time', () => {
    const startTime = mockNow;
    
    // Schedule activity that will be completed
    activityManager.scheduleActivity('study-101', startTime); // 60 min duration
    
    // Schedule activity that won't be completed yet
    activityManager.scheduleActivity('exercise-101', startTime + 90 * 60 * 1000);
    
    // Process activities at a time after the first one should be completed
    const completedActivities = activityManager.processActivities(startTime + 70 * 60 * 1000);
    
    expect(completedActivities.length).toBe(1);
    expect(completedActivities[0].activityId).toBe('study-101');
    
    // First activity should be moved to completed
    expect(activityManager.getCompletedActivities().length).toBe(1);
    expect(activityManager.getScheduledActivities().length).toBe(1); // Second activity still scheduled
  });
  
  it('should serialize and restore state', () => {
    // Setup some state
    const startTime = mockNow;
    activityManager.scheduleActivity('study-101', startTime);
    activityManager.scheduleActivity('exercise-101', startTime + 90 * 60 * 1000);
    activityManager.completeActivity('study-101', startTime);
    
    // Get the state
    const state = activityManager.getState();
    
    // Create a new manager and restore the state
    const newManager = new ActivityManager();
    newManager.restoreState(state);
    
    // Verify the state was restored correctly
    expect(newManager.getAllActivities().length).toBe(4);
    expect(newManager.getScheduledActivities().length).toBe(1);
    expect(newManager.getCompletedActivities().length).toBe(1);
    expect(newManager.getActivityHistory().length).toBe(1);
  });
});
