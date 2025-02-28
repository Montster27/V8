// /Users/montysharma/Documents/v8/MMV08/src/__tests__/application/services/GameLoopService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoopService } from '../../../application/services/GameLoopService';
import { TimeManager } from '../../../domain/services/TimeManager';
import EventManager from '../../../domain/services/EventManager';
import { SkillManager } from '../../../domain/services/SkillManager';
import { ActivityManager } from '../../../domain/services/ActivityManager';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';

// Mock dependencies
vi.mock('../../../domain/services/TimeManager');
vi.mock('../../../domain/services/EventManager');
vi.mock('../../../domain/services/SkillManager');
vi.mock('../../../domain/services/ActivityManager');

// Mock the Redux slice to avoid initialization errors
vi.mock('../../../infrastructure/state/slices/timeSlice', () => {
  return {
    tick: vi.fn((time) => ({ type: 'time/tick', payload: time }))
  };
});

// Mock the ResourceTypes
vi.mock('../../../domain/ResourceTypes', () => {
  return {
    ResourceType: {
      ENERGY: 'energy',
      STRESS: 'stress',
      BELONGING: 'belonging',
      HEALTH: 'health'
    }
  };
});

// Mock the resource slice actions
vi.mock('../../../infrastructure/state/resourcesSlice', () => {
  return {
    addResource: vi.fn((payload) => ({ type: 'resources/add', payload })),
    subtractResource: vi.fn((payload) => ({ type: 'resources/subtract', payload }))
  };
});

// Mock the activities slice actions
vi.mock('../../../infrastructure/state/slices/activitiesSlice', () => {
  return {
    addCompletedActivities: vi.fn((activities) => ({ 
      type: 'activities/addCompletedActivities', 
      payload: activities 
    }))
  };
});

describe('GameLoopService', () => {
  let timeManager: TimeManager;
  let eventManager: EventManager;
  let skillManager: SkillManager;
  let activityManager: ActivityManager;
  let dispatch: any;
  let gameLoop: GameLoopService;
  
  beforeEach(() => {
    // Create mocks
    timeManager = {
      start: vi.fn(),
      pause: vi.fn(),
      tick: vi.fn(),
      currentTime: new TimeValue(1000, 1),
      isRunning: false
    } as unknown as TimeManager;
    
    eventManager = {
      update: vi.fn().mockReturnValue({ triggered: [], autoResolved: [] })
    } as unknown as EventManager;
    
    skillManager = {
      applySkillDecay: vi.fn().mockReturnThis(),
      updateNodeStates: vi.fn().mockReturnThis()
    } as unknown as SkillManager;
    
    activityManager = {
      update: vi.fn().mockReturnValue([]),
      getActivitiesAt: vi.fn().mockReturnValue([])
    } as unknown as ActivityManager;
    
    dispatch = vi.fn();
    
    // Create the service
    gameLoop = new GameLoopService(
      timeManager,
      eventManager,
      skillManager,
      activityManager,
      dispatch,
      {
        tickIntervalMs: 100,
        resourceUpdateInterval: 2
      }
    );
    
    // Mock setInterval and clearInterval
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  
  it('should start the game loop', () => {
    gameLoop.start();
    
    expect(timeManager.start).toHaveBeenCalled();
    expect(gameLoop.isRunning()).toBe(true);
  });
  
  it('should stop the game loop', () => {
    gameLoop.start();
    gameLoop.stop();
    
    expect(timeManager.pause).toHaveBeenCalled();
    expect(gameLoop.isRunning()).toBe(false);
  });
  
  it('should toggle the game loop', () => {
    // Start -> Stop
    gameLoop.start();
    gameLoop.toggle();
    expect(gameLoop.isRunning()).toBe(false);
    
    // Stop -> Start
    gameLoop.toggle();
    expect(gameLoop.isRunning()).toBe(true);
  });
  
  it('should process ticks on interval', () => {
    // Spy on processTick
    const processSpy = vi.spyOn(gameLoop, 'processTick');
    
    gameLoop.start();
    
    // Advance timers
    vi.advanceTimersByTime(300);
    
    // Should have called processTick 3 times (at 100, 200, 300ms)
    expect(processSpy).toHaveBeenCalledTimes(3);
  });
  
  it('should update time on tick', () => {
    gameLoop.processTick();
    
    expect(timeManager.tick).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
  });
  
  it('should process activities on tick', () => {
    gameLoop.processTick();
    
    expect(activityManager.update).toHaveBeenCalled();
  });
  
  it('should update resources every N ticks', () => {
    // First tick
    gameLoop.processTick();
    
    // Resources should not be updated yet (only every 2 ticks)
    expect(dispatch).toHaveBeenCalledTimes(1);
    
    // Second tick
    gameLoop.processTick();
    
    // Now resources should be updated
    // 1 time tick for first tick + 1 time tick for second tick + 2 resource updates
    expect(dispatch).toHaveBeenCalledTimes(4);
  });
  
  it('should check for events on tick', () => {
    gameLoop.processTick();
    
    expect(eventManager.update).toHaveBeenCalled();
  });
  
  it('should update skills on tick', () => {
    gameLoop.processTick();
    
    expect(skillManager.applySkillDecay).toHaveBeenCalled();
    expect(skillManager.updateNodeStates).toHaveBeenCalled();
  });
  
  it('should dispatch completed activities', () => {
    // Setup mock to return completed activities
    const mockCompletedActivities = [
      { 
        activityId: 'activity1', 
        startTime: 1000, 
        endTime: 2000, 
        isCompleted: true,
        effects: [{ resourceType: 'energy', amount: -10 }]
      }
    ];
    
    (activityManager.update as any).mockReturnValue(mockCompletedActivities);
    
    // Process a tick
    gameLoop.processTick();
    
    // Should dispatch completed activities
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'activities/addCompletedActivities',
      payload: mockCompletedActivities
    }));
  });
  
  it('should apply activity effects to resources', () => {
    // Setup mock to return completed activities with effects
    const mockCompletedActivities = [
      { 
        activityId: 'activity1', 
        startTime: 1000, 
        endTime: 2000, 
        isCompleted: true,
        effects: [
          { resourceType: 'energy', amount: -10 },
          { resourceType: 'stress', amount: 5 }
        ]
      }
    ];
    
    (activityManager.update as any).mockReturnValue(mockCompletedActivities);
    
    // Process a tick
    gameLoop.processTick();
    
    // Should dispatch resource actions for each effect
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'resources/subtract',
      payload: { resourceType: 'energy', amount: 10 }
    }));
    
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'resources/add',
      payload: { resourceType: 'stress', amount: 5 }
    }));
  });
  
  it('should apply ongoing effects from active activities', () => {
    // Setup mock to return active activities
    const mockActiveActivities = [
      { 
        activityId: 'activity1', 
        startTime: 1000, 
        endTime: 3000, 
        isCompleted: false,
        effects: [
          { resourceType: 'energy', amount: -20 },
          { resourceType: 'stress', amount: 10 }
        ]
      }
    ];
    
    (activityManager.getActivitiesAt as any).mockReturnValue(mockActiveActivities);
    
    // Process multiple ticks to get resource updates
    gameLoop.processTick();
    gameLoop.processTick();
    
    // Should apply a fraction of the effects
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'resources/subtract',
      payload: expect.objectContaining({
        resourceType: 'energy'
      })
    }));
    
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'resources/add',
      payload: expect.objectContaining({
        resourceType: 'stress'
      })
    }));
  });
  
  it('should configure with new settings', () => {
    gameLoop.configure({ tickIntervalMs: 200 });
    
    expect(gameLoop['config'].tickIntervalMs).toBe(200);
    expect(gameLoop['config'].resourceUpdateInterval).toBe(2); // Unchanged
  });
  
  it('should clean up on dispose', () => {
    gameLoop.start();
    gameLoop.dispose();
    
    expect(gameLoop.isRunning()).toBe(false);
  });
  
  it('should handle triggered events', () => {
    // Setup mock to return triggered events
    const mockEvents = [{ id: 'event1', startTime: '2023-01-01' }];
    (eventManager.update as any).mockReturnValue({ 
      triggered: mockEvents, 
      autoResolved: [] 
    });
    
    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log');
    
    gameLoop.processTick();
    
    // Verify that events were logged
    expect(consoleSpy).toHaveBeenCalledWith('Triggered events:', mockEvents);
  });
  
  it('should handle auto-resolved events', () => {
    // Setup mock to return auto-resolved events
    const mockResolvedEvents = [{ id: 'event1', resolution: { choice: 'choice1' } }];
    (eventManager.update as any).mockReturnValue({ 
      triggered: [], 
      autoResolved: mockResolvedEvents 
    });
    
    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log');
    
    gameLoop.processTick();
    
    // Verify that events were logged
    expect(consoleSpy).toHaveBeenCalledWith('Auto-resolved events:', mockResolvedEvents);
  });
  
  it('should modify stress increase based on active activities', () => {
    // Setup mock to return stressful activities
    const mockStressfulActivities = [
      { 
        activityId: 'exam_activity', 
        startTime: 1000, 
        endTime: 3000, 
        isCompleted: false
      }
    ];
    
    (activityManager.getActivitiesAt as any).mockReturnValue(mockStressfulActivities);
    
    // Process multiple ticks to get resource updates
    gameLoop.processTick();
    gameLoop.processTick();
    
    // Should increase stress more for stressful activities
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'resources/add',
      payload: expect.objectContaining({
        resourceType: 'stress',
        amount: 0.8
      })
    }));
  });
});
