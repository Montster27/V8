// /Users/montysharma/Documents/v8/MMV08/src/__tests__/application/hooks/useActivities.test.fixed.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useActivities } from '../../../application/hooks/useActivities';
import activitiesReducer from '../../../infrastructure/state/slices/activitiesSlice';

// Mock the ActivityManager module
vi.mock('../../../domain/services/ActivityManager', () => {
  // Define a mock ActivityManager class
  class MockActivityManager {
    private _activities = new Map();
    private _scheduledActivities = [];
    
    registerActivity(activity) {
      this._activities.set(activity.id, activity);
      return activity;
    }
    
    getAllActivities() {
      return Array.from(this._activities.values()).map(a => ({
        ...a,
        toJSON: () => a
      }));
    }
    
    scheduleActivity(activityId, startTime) {
      const activity = this._activities.get(activityId);
      if (!activity) return null;
      
      const scheduled = {
        activityId,
        startTime,
        endTime: startTime + (activity.duration * 60 * 1000),
        isCompleted: false
      };
      
      this._scheduledActivities.push(scheduled);
      return scheduled;
    }
    
    getActivitiesAt() {
      return [];
    }
    
    cancelScheduledActivity(activityId, startTime) {
      const index = this._scheduledActivities.findIndex(
        a => a.activityId === activityId && a.startTime === startTime
      );
      
      if (index >= 0) {
        this._scheduledActivities.splice(index, 1);
        return true;
      }
      
      return false;
    }
    
    hasSchedulingConflict() {
      return false;
    }
    
    completeActivity(activityId, startTime) {
      const index = this._scheduledActivities.findIndex(
        a => a.activityId === activityId && a.startTime === startTime
      );
      
      if (index >= 0) {
        const activity = this._scheduledActivities[index];
        activity.isCompleted = true;
        return activity;
      }
      
      return null;
    }
  }
  
  // Create the static method
  MockActivityManager.createDefault = vi.fn(() => {
    const manager = new MockActivityManager();
    
    // Add test activities
    manager.registerActivity({
      id: 'test_activity_1',
      name: 'Test Activity 1',
      description: 'First test activity',
      category: 'academic',
      duration: 60,
      effects: [{ resourceType: 'energy', amount: -10 }],
      repeatability: 'unlimited',
      location: { type: 'campus', name: 'Library', id: 'library' }
    });
    
    manager.registerActivity({
      id: 'test_activity_2',
      name: 'Test Activity 2',
      description: 'Second test activity',
      category: 'leisure',
      duration: 30,
      effects: [{ resourceType: 'energy', amount: 5 }],
      repeatability: 'unlimited',
      location: { type: 'campus', name: 'Park', id: 'park' }
    });
    
    return manager;
  });
  
  return {
    ActivityManager: MockActivityManager
  };
});

describe('useActivities', () => {
  // Mock Date.now for predictable test results
  const mockNow = new Date('2023-01-01T12:00:00').getTime();
  let originalDateNow;
  
  // Set up a test store
  const createTestStore = () => {
    return configureStore({
      reducer: {
        activities: activitiesReducer,
        time: () => ({ timestamp: mockNow, timeScale: 1, running: false }),
      },
    });
  };
  
  // Wrapper component for the hook
  const wrapper = ({ children }) => (
    <Provider store={createTestStore()}>{children}</Provider>
  );
  
  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = vi.fn(() => mockNow);
    
    // Reset mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    Date.now = originalDateNow;
  });
  
  it('should initialize with activities from ActivityManager', async () => {
    const { result, rerender } = renderHook(() => useActivities(), { wrapper });
    
    // Wait for initialization
    rerender();
    
    // Should have registered activities
    expect(result.current.activities.length).toBeGreaterThanOrEqual(0);
    
    // Set a small timeout to allow for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Now check if activities have been registered
    expect(result.current.activities.length).toBe(2);
  });
  
  it('should schedule an activity', async () => {
    const { result, rerender } = renderHook(() => useActivities(), { wrapper });
    
    // Allow initialization
    rerender();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Schedule an activity
    act(() => {
      result.current.scheduleActivity('test_activity_1', mockNow);
    });
    
    // Should have a scheduled activity
    expect(result.current.scheduledActivities.length).toBe(1);
    expect(result.current.scheduledActivities[0].activityId).toBe('test_activity_1');
    expect(result.current.scheduledActivities[0].startTime).toBe(mockNow);
  });
  
  it('should select an activity', async () => {
    const { result, rerender } = renderHook(() => useActivities(), { wrapper });
    
    // Allow initialization
    rerender();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Select an activity
    act(() => {
      result.current.selectActivity('test_activity_1');
    });
    
    // Should have the selected activity
    expect(result.current.selectedActivityId).toBe('test_activity_1');
    
    // Deselect the activity
    act(() => {
      result.current.selectActivity(null);
    });
    
    // Should have no selected activity
    expect(result.current.selectedActivityId).toBeNull();
  });
  
  it('should cancel a scheduled activity', async () => {
    const { result, rerender } = renderHook(() => useActivities(), { wrapper });
    
    // Allow initialization
    rerender();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Schedule an activity
    act(() => {
      result.current.scheduleActivity('test_activity_1', mockNow);
    });
    
    // Should have a scheduled activity
    expect(result.current.scheduledActivities.length).toBe(1);
    
    // Cancel the activity
    act(() => {
      result.current.cancelActivity('test_activity_1', mockNow);
    });
    
    // Should have no scheduled activities
    expect(result.current.scheduledActivities.length).toBe(0);
  });
  
  it('should get activity details by ID', async () => {
    const { result, rerender } = renderHook(() => useActivities(), { wrapper });
    
    // Allow initialization
    rerender();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get activity details
    const activity = result.current.getActivity('test_activity_1');
    
    // Should have the correct activity
    expect(activity).toBeDefined();
    expect(activity.name).toBe('Test Activity 1');
    expect(activity.category).toBe('academic');
  });
});
