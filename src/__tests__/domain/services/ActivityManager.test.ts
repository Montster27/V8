// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/services/ActivityManager.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActivityManager } from '../../../domain/services/ActivityManager';
import { Activity } from '../../../domain/models/Activity';
import { ActivityRepeatability } from '../../../domain/types/ActivityTypes';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';

describe('ActivityManager', () => {
  // Mock Date.now for predictable test results
  const mockNow = new Date('2023-01-01T12:00:00').getTime();
  let originalDateNow: () => number;
  
  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = vi.fn(() => mockNow);
  });
  
  afterEach(() => {
    Date.now = originalDateNow;
    vi.clearAllMocks();
  });
  
  it('should initialize with empty collections', () => {
    const manager = new ActivityManager();
    
    expect(manager.getAllActivities()).toEqual([]);
    expect(manager.getScheduledActivities()).toEqual([]);
    expect(manager.getCompletedActivities()).toEqual([]);
    expect(manager.getActivityHistory()).toEqual([]);
  });
  
  it('should register activities', () => {
    const manager = new ActivityManager();
    
    const activity = {
      id: 'test_activity',
      name: 'Test Activity',
      description: 'Activity for testing',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    };
    
    manager.registerActivity(activity);
    
    expect(manager.getAllActivities()).toHaveLength(1);
    expect(manager.getActivity('test_activity')).toBeDefined();
    expect(manager.getActivity('test_activity')?.name).toBe('Test Activity');
  });
  
  it('should schedule activities', () => {
    const manager = new ActivityManager();
    
    // Register an activity
    manager.registerActivity({
      id: 'test_activity',
      name: 'Test Activity',
      description: 'Activity for testing',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    // Schedule the activity
    const startTime = mockNow;
    const scheduledActivity = manager.scheduleActivity('test_activity', startTime);
    
    expect(scheduledActivity).not.toBeNull();
    expect(manager.getScheduledActivities()).toHaveLength(1);
    expect(manager.getScheduledActivities()[0].activityId).toBe('test_activity');
    expect(manager.getScheduledActivities()[0].startTime).toBe(startTime);
    expect(manager.getScheduledActivities()[0].endTime).toBe(startTime + 60 * 60 * 1000); // 60 minutes
  });
  
  it('should enforce one-time activity restriction', () => {
    const manager = new ActivityManager();
    
    // Register a one-time activity
    manager.registerActivity({
      id: 'once_activity',
      name: 'One-Time Activity',
      description: 'Can only be done once',
      category: 'special',
      duration: 30,
      effects: [],
      repeatability: 'once' as ActivityRepeatability,
      location: { type: 'special', name: 'Special', id: 'special' }
    });
    
    // Schedule it once
    manager.scheduleActivity('once_activity', mockNow);
    
    // Try to schedule it again
    const secondAttempt = manager.scheduleActivity('once_activity', mockNow + 3600000);
    
    expect(secondAttempt).toBeNull();
    expect(manager.getScheduledActivities()).toHaveLength(1);
  });
  
  it('should enforce once-per-day activity restriction', () => {
    const manager = new ActivityManager();
    
    // Register a once-per-day activity
    manager.registerActivity({
      id: 'daily_activity',
      name: 'Daily Activity',
      description: 'Can be done once per day',
      category: 'health',
      duration: 30,
      effects: [],
      repeatability: 'once_per_day' as ActivityRepeatability,
      location: { type: 'dorm', name: 'Dorm', id: 'dorm' }
    });
    
    // Schedule it
    manager.scheduleActivity('daily_activity', mockNow);
    
    // Try to schedule it again the same day
    const sameDay = new Date(mockNow);
    sameDay.setHours(sameDay.getHours() + 6); // 6 hours later
    const secondAttempt = manager.scheduleActivity('daily_activity', sameDay.getTime());
    
    expect(secondAttempt).toBeNull();
    
    // Try to schedule it the next day
    const nextDay = new Date(mockNow);
    nextDay.setDate(nextDay.getDate() + 1); // Next day
    const thirdAttempt = manager.scheduleActivity('daily_activity', nextDay.getTime());
    
    expect(thirdAttempt).not.toBeNull();
    expect(manager.getScheduledActivities()).toHaveLength(2);
  });
  
  it('should enforce cooldown activity restriction', () => {
    const manager = new ActivityManager();
    
    // Register an activity with cooldown
    manager.registerActivity({
      id: 'cooldown_activity',
      name: 'Cooldown Activity',
      description: 'Has a cooldown period',
      category: 'leisure',
      duration: 60,
      effects: [],
      repeatability: 'cooldown' as ActivityRepeatability,
      cooldownMinutes: 120,
      location: { type: 'town', name: 'Town', id: 'town' }
    });
    
    // Schedule it
    const scheduled = manager.scheduleActivity('cooldown_activity', mockNow);
    
    // Complete the activity to record it in history
    manager.completeActivity('cooldown_activity', mockNow);
    
    // Try to schedule it before cooldown is over
    const beforeCooldown = new Date(mockNow);
    beforeCooldown.setMinutes(beforeCooldown.getMinutes() + 60); // 60 minutes later (cooldown is 120)
    const secondAttempt = manager.scheduleActivity('cooldown_activity', beforeCooldown.getTime());
    
    expect(secondAttempt).toBeNull();
    
    // Try to schedule it after cooldown
    const afterCooldown = new Date(mockNow);
    afterCooldown.setMinutes(afterCooldown.getMinutes() + 180); // 180 minutes later
    const thirdAttempt = manager.scheduleActivity('cooldown_activity', afterCooldown.getTime());
    
    expect(thirdAttempt).not.toBeNull();
  });
  
  it('should detect scheduling conflicts', () => {
    const manager = new ActivityManager();
    
    // Register two activities
    manager.registerActivity({
      id: 'activity1',
      name: 'Activity 1',
      description: 'First activity',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    manager.registerActivity({
      id: 'activity2',
      name: 'Activity 2',
      description: 'Second activity',
      category: 'academic',
      duration: 30,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    // Schedule the first activity
    manager.scheduleActivity('activity1', mockNow);
    
    // Check for conflict in the middle of the first activity
    const conflictTime = mockNow + 30 * 60 * 1000; // 30 minutes into the first activity
    const hasConflict = manager.hasSchedulingConflict('activity2', conflictTime);
    
    expect(hasConflict).toBe(true);
    
    // Check for no conflict after the first activity
    const noConflictTime = mockNow + (60 + 10) * 60 * 1000; // 10 minutes after the first activity ends
    const noConflict = manager.hasSchedulingConflict('activity2', noConflictTime);
    
    expect(noConflict).toBe(false);
  });
  
  it('should cancel scheduled activities', () => {
    const manager = new ActivityManager();
    
    // Register and schedule an activity
    manager.registerActivity({
      id: 'test_activity',
      name: 'Test Activity',
      description: 'Activity for testing',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    const startTime = mockNow;
    manager.scheduleActivity('test_activity', startTime);
    
    // Cancel the activity
    const success = manager.cancelScheduledActivity('test_activity', startTime);
    
    expect(success).toBe(true);
    expect(manager.getScheduledActivities()).toHaveLength(0);
  });
  
  it('should complete activities and add them to history', () => {
    const manager = new ActivityManager();
    
    // Register and schedule an activity
    manager.registerActivity({
      id: 'test_activity',
      name: 'Test Activity',
      description: 'Activity for testing',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    const startTime = mockNow;
    manager.scheduleActivity('test_activity', startTime);
    
    // Complete the activity
    const completed = manager.completeActivity('test_activity', startTime);
    
    expect(completed).not.toBeNull();
    expect(manager.getScheduledActivities()).toHaveLength(0);
    expect(manager.getCompletedActivities()).toHaveLength(1);
    expect(manager.getCompletedActivities()[0].activityId).toBe('test_activity');
    expect(manager.getCompletedActivities()[0].isCompleted).toBe(true);
    
    // Check the history
    expect(manager.getActivityHistory()).toHaveLength(1);
    expect(manager.getActivityHistory()[0].activityId).toBe('test_activity');
    expect(manager.getActivityHistory()[0].timestamp).toBe(startTime);
  });
  
  it('should auto-complete activities based on current time', () => {
    const manager = new ActivityManager();
    
    // Register and schedule an activity
    manager.registerActivity({
      id: 'test_activity',
      name: 'Test Activity',
      description: 'Activity for testing',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    // Schedule in the past
    const pastTime = mockNow - 2 * 60 * 60 * 1000; // 2 hours ago
    manager.scheduleActivity('test_activity', pastTime);
    
    // Update with current time
    const currentTime = new TimeValue(mockNow, 1);
    const completedActivities = manager.update(currentTime);
    
    expect(completedActivities).toHaveLength(1);
    expect(manager.getScheduledActivities()).toHaveLength(0);
    expect(manager.getCompletedActivities()).toHaveLength(1);
  });
  
  it('should get activities active at a specific time', () => {
    const manager = new ActivityManager();
    
    // Register and schedule two activities
    manager.registerActivity({
      id: 'morning_activity',
      name: 'Morning Activity',
      description: 'Activity in the morning',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    manager.registerActivity({
      id: 'afternoon_activity',
      name: 'Afternoon Activity',
      description: 'Activity in the afternoon',
      category: 'leisure',
      duration: 120,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'town', name: 'Park', id: 'park' }
    });
    
    // Morning time: 9 AM
    const morningTime = new Date(mockNow);
    morningTime.setHours(9, 0, 0, 0);
    
    // Afternoon time: 2 PM
    const afternoonTime = new Date(mockNow);
    afternoonTime.setHours(14, 0, 0, 0);
    
    // Schedule activities
    manager.scheduleActivity('morning_activity', morningTime.getTime());
    manager.scheduleActivity('afternoon_activity', afternoonTime.getTime());
    
    // Check activities at 9:30 AM
    const checkMorningTime = new Date(mockNow);
    checkMorningTime.setHours(9, 30, 0, 0);
    const morningActivities = manager.getActivitiesAt(checkMorningTime.getTime());
    
    expect(morningActivities).toHaveLength(1);
    expect(morningActivities[0].activityId).toBe('morning_activity');
    
    // Check activities at 2:30 PM
    const checkAfternoonTime = new Date(mockNow);
    checkAfternoonTime.setHours(14, 30, 0, 0);
    const afternoonActivities = manager.getActivitiesAt(checkAfternoonTime.getTime());
    
    expect(afternoonActivities).toHaveLength(1);
    expect(afternoonActivities[0].activityId).toBe('afternoon_activity');
    
    // Check activities at noon when nothing is scheduled
    const checkNoonTime = new Date(mockNow);
    checkNoonTime.setHours(12, 0, 0, 0);
    const noonActivities = manager.getActivitiesAt(checkNoonTime.getTime());
    
    expect(noonActivities).toHaveLength(0);
  });
  
  it('should save and restore state', () => {
    const manager = new ActivityManager();
    
    // Set up with activities and schedule some
    manager.registerActivity({
      id: 'test_activity',
      name: 'Test Activity',
      description: 'Activity for testing',
      category: 'academic',
      duration: 60,
      effects: [],
      repeatability: 'unlimited' as ActivityRepeatability,
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    manager.scheduleActivity('test_activity', mockNow);
    
    // Complete one activity to have history and completed
    manager.completeActivity('test_activity', mockNow);
    
    // Schedule another one
    manager.scheduleActivity('test_activity', mockNow + 3600000);
    
    // Get the state
    const state = manager.getState();
    
    // Create a new manager
    const newManager = new ActivityManager();
    
    // Restore the state
    newManager.restoreState(state);
    
    // Check if state was properly restored
    expect(newManager.getAllActivities()).toHaveLength(1);
    expect(newManager.getScheduledActivities()).toHaveLength(1);
    expect(newManager.getCompletedActivities()).toHaveLength(1);
    expect(newManager.getActivityHistory()).toHaveLength(1);
  });
  
  it('should handle case when activity is not found', () => {
    const manager = new ActivityManager();
    
    // Try to schedule a non-existent activity
    const result = manager.scheduleActivity('nonexistent', mockNow);
    
    expect(result).toBeNull();
  });
  
  it('should create default activity manager with predefined activities', () => {
    const manager = ActivityManager.createDefault();
    
    expect(manager.getAllActivities().length).toBeGreaterThan(0);
  });
});
