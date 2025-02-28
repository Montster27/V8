// /Users/montysharma/Documents/v8/MMV08/src/__tests__/infrastructure/state/slices/activitiesSlice.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import reducer, {
  setActivity,
  setActivities,
  addScheduledActivity,
  removeScheduledActivity,
  completeActivity,
  addCompletedActivities,
  setSelectedActivity,
  setActivityState,
  resetActivities
} from '../../../../infrastructure/state/slices/activitiesSlice';

describe('activities reducer', () => {
  // Mock activity for testing
  const mockActivity = {
    id: 'test_activity',
    name: 'Test Activity',
    description: 'Activity for testing',
    category: 'academic',
    duration: 60,
    effects: [],
    repeatability: 'unlimited',
    location: { type: 'campus', name: 'Library', id: 'library' }
  };
  
  // Mock scheduled activity for testing
  const mockScheduledActivity = {
    activityId: 'test_activity',
    startTime: 1672570800000, // 2023-01-01T12:00:00Z
    endTime: 1672574400000,   // 2023-01-01T13:00:00Z
    isCompleted: false
  };
  
  it('should handle initial state', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    
    expect(initialState.available).toEqual({});
    expect(initialState.scheduled).toEqual([]);
    expect(initialState.completed).toEqual([]);
    expect(initialState.history).toEqual([]);
    expect(initialState.selectedActivityId).toBeNull();
  });
  
  it('should handle setActivity', () => {
    const initialState = {
      available: {},
      scheduled: [],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    const actual = reducer(initialState, setActivity(mockActivity));
    
    expect(actual.available[mockActivity.id]).toEqual(mockActivity);
  });
  
  it('should handle setActivities', () => {
    const initialState = {
      available: {},
      scheduled: [],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    const anotherActivity = {
      ...mockActivity,
      id: 'another_activity',
      name: 'Another Activity'
    };
    
    const actual = reducer(initialState, setActivities([mockActivity, anotherActivity]));
    
    expect(Object.keys(actual.available)).toHaveLength(2);
    expect(actual.available[mockActivity.id]).toEqual(mockActivity);
    expect(actual.available[anotherActivity.id]).toEqual(anotherActivity);
  });
  
  it('should handle addScheduledActivity', () => {
    const initialState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    const actual = reducer(initialState, addScheduledActivity(mockScheduledActivity));
    
    expect(actual.scheduled).toHaveLength(1);
    expect(actual.scheduled[0]).toEqual(mockScheduledActivity);
  });
  
  it('should handle removeScheduledActivity', () => {
    const initialState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [mockScheduledActivity],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    const actual = reducer(
      initialState,
      removeScheduledActivity({
        activityId: mockScheduledActivity.activityId,
        startTime: mockScheduledActivity.startTime
      })
    );
    
    expect(actual.scheduled).toHaveLength(0);
  });
  
  it('should handle completeActivity', () => {
    const initialState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [mockScheduledActivity],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    const actual = reducer(
      initialState,
      completeActivity({
        activityId: mockScheduledActivity.activityId,
        startTime: mockScheduledActivity.startTime
      })
    );
    
    // Should move from scheduled to completed
    expect(actual.scheduled).toHaveLength(0);
    expect(actual.completed).toHaveLength(1);
    expect(actual.completed[0].isCompleted).toBe(true);
    
    // Should add to history
    expect(actual.history).toHaveLength(1);
    expect(actual.history[0].activityId).toBe(mockScheduledActivity.activityId);
    expect(actual.history[0].timestamp).toBe(mockScheduledActivity.startTime);
  });
  
  it('should handle addCompletedActivities', () => {
    const initialState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [mockScheduledActivity],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    // Clone and modify the scheduled activity
    const completedActivity = {
      ...mockScheduledActivity,
      isCompleted: true
    };
    
    const anotherCompletedActivity = {
      activityId: 'another_activity',
      startTime: 1672578000000, // 2023-01-01T14:00:00Z
      endTime: 1672581600000,   // 2023-01-01T15:00:00Z
      isCompleted: true
    };
    
    const actual = reducer(
      initialState,
      addCompletedActivities([completedActivity, anotherCompletedActivity])
    );
    
    // Should remove matching activity from scheduled
    expect(actual.scheduled).toHaveLength(0);
    
    // Should add both to completed
    expect(actual.completed).toHaveLength(2);
    
    // Should add both to history
    expect(actual.history).toHaveLength(2);
  });
  
  it('should handle setSelectedActivity', () => {
    const initialState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    // Select an activity
    const withSelection = reducer(
      initialState,
      setSelectedActivity(mockActivity.id)
    );
    expect(withSelection.selectedActivityId).toBe(mockActivity.id);
    
    // Deselect the activity
    const withoutSelection = reducer(
      withSelection,
      setSelectedActivity(null)
    );
    expect(withoutSelection.selectedActivityId).toBeNull();
  });
  
  it('should handle setActivityState', () => {
    const initialState = {
      available: {},
      scheduled: [],
      completed: [],
      history: [],
      selectedActivityId: null
    };
    
    const newState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [mockScheduledActivity],
      completed: [],
      history: [],
      selectedActivityId: mockActivity.id
    };
    
    const actual = reducer(initialState, setActivityState(newState));
    
    expect(actual).toEqual(newState);
  });
  
  it('should handle resetActivities', () => {
    const populatedState = {
      available: { [mockActivity.id]: mockActivity },
      scheduled: [mockScheduledActivity],
      completed: [{...mockScheduledActivity, isCompleted: true}],
      history: [{ activityId: mockActivity.id, timestamp: mockScheduledActivity.startTime }],
      selectedActivityId: mockActivity.id
    };
    
    const actual = reducer(populatedState, resetActivities());
    
    expect(actual.available).toEqual({});
    expect(actual.scheduled).toEqual([]);
    expect(actual.completed).toEqual([]);
    expect(actual.history).toEqual([]);
    expect(actual.selectedActivityId).toBeNull();
  });
});
