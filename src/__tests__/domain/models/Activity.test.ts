// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/models/Activity.test.ts

import { describe, it, expect } from 'vitest';
import { Activity, IActivity } from '../../../domain/models/Activity';
import { 
  ActivityCategory, 
  ActivityDuration, 
  ActivityRepeatability,
  ActivityLocationType,
  ACTIVITY_DURATION_MINUTES
} from '../../../domain/types/ActivityTypes';
import { ResourceType } from '../../../domain/types/ResourceTypes';

describe('Activity', () => {
  // Create a sample activity for testing
  const createSampleActivity = (): IActivity => ({
    id: 'study-101',
    name: 'Study Computer Science',
    description: 'Hit the books and improve your computer science knowledge',
    category: ActivityCategory.ACADEMIC,
    duration: ActivityDuration.MEDIUM,
    effects: [
      {
        resourceType: ResourceType.ENERGY,
        amount: -10,
        description: 'Studying makes you tired'
      },
      {
        resourceType: ResourceType.STRESS,
        amount: 5,
        description: 'Studying increases stress'
      },
      {
        resourceType: ResourceType.BELONGING,
        amount: -2,
        description: 'Solo studying slightly decreases social connection'
      }
    ],
    requirements: [
      {
        type: 'resource',
        resourceType: ResourceType.ENERGY,
        minValue: 20,
        description: 'Need at least 20 energy to study effectively'
      }
    ],
    unlocks: [
      {
        type: 'skill',
        id: 'programming-basic',
        description: 'Might unlock basic programming skills',
        chance: 0.7
      }
    ],
    repeatability: ActivityRepeatability.UNLIMITED,
    location: {
      type: ActivityLocationType.CAMPUS,
      name: 'Library',
      id: 'campus-library',
      description: 'The main campus library'
    },
    tags: ['academic', 'skill-building', 'computer-science']
  });
  
  it('should create an Activity instance', () => {
    const activityData = createSampleActivity();
    const activity = new Activity(activityData);
    
    expect(activity).toBeInstanceOf(Activity);
    expect(activity.id).toBe('study-101');
    expect(activity.name).toBe('Study Computer Science');
    expect(activity.category).toBe(ActivityCategory.ACADEMIC);
  });
  
  it('should correctly convert duration enum to minutes', () => {
    const activityData = createSampleActivity();
    const activity = new Activity(activityData);
    
    // The sample activity has MEDIUM duration, which should be 60 minutes
    expect(activity.durationMinutes).toBe(ACTIVITY_DURATION_MINUTES[ActivityDuration.MEDIUM]);
    expect(activity.durationMinutes).toBe(60);
  });
  
  it('should handle direct minute specification for duration', () => {
    const activityData = createSampleActivity();
    // Set a specific minute duration instead of using the enum
    activityData.duration = 75;
    
    const activity = new Activity(activityData);
    expect(activity.durationMinutes).toBe(75);
  });
  
  it('should correctly calculate end time', () => {
    const activityData = createSampleActivity();
    const activity = new Activity(activityData);
    
    const startTime = 1672531200000; // 2023-01-01T00:00:00.000Z
    const expectedEndTime = startTime + (60 * 60 * 1000); // 60 minutes later
    
    expect(activity.calculateEndTime(startTime)).toBe(expectedEndTime);
  });
  
  it('should create a scheduled activity instance', () => {
    const activityData = createSampleActivity();
    const activity = new Activity(activityData);
    
    const startTime = 1672531200000; // 2023-01-01T00:00:00.000Z
    const scheduled = activity.schedule(startTime);
    
    expect(scheduled.activityId).toBe('study-101');
    expect(scheduled.startTime).toBe(startTime);
    expect(scheduled.endTime).toBe(startTime + (60 * 60 * 1000));
    expect(scheduled.isCompleted).toBe(false);
    
    // Should copy effects
    expect(scheduled.effects).toHaveLength(3);
    expect(scheduled.effects?.[0].resourceType).toBe(ResourceType.ENERGY);
    expect(scheduled.effects?.[0].amount).toBe(-10);
  });
  
  it('should serialize and deserialize correctly', () => {
    const activityData = createSampleActivity();
    const activity = new Activity(activityData);
    
    const json = activity.toJSON();
    const restored = Activity.fromJSON(json);
    
    expect(restored).toBeInstanceOf(Activity);
    expect(restored.id).toBe(activity.id);
    expect(restored.name).toBe(activity.name);
    expect(restored.effects).toEqual(activity.effects);
    expect(restored.requirements).toEqual(activity.requirements);
  });
  
  it('should handle default values for optional fields', () => {
    const minimalActivity: IActivity = {
      id: 'minimal',
      name: 'Minimal Activity',
      description: 'A minimal activity with only required fields',
      category: ActivityCategory.LEISURE,
      duration: ActivityDuration.SHORT,
      effects: [],
      repeatability: ActivityRepeatability.ONCE,
      location: {
        type: ActivityLocationType.DORM,
        name: 'Your Dorm',
        id: 'player-dorm'
      }
    };
    
    const activity = new Activity(minimalActivity);
    
    expect(activity.requirements).toEqual([]);
    expect(activity.unlocks).toEqual([]);
    expect(activity.isStoryActivity).toBe(false);
    expect(activity.tags).toEqual([]);
  });
});
