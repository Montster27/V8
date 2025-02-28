// /Users/montysharma/Documents/v8/MMV08/src/__tests__/infrastructure/state/slices/timeSlice.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import reducer, {
  startTime,
  pauseTime,
  toggleTime,
  setTimeScale,
  advanceTime,
  tick,
  setTime,
  scheduleEvent,
  cancelEvent,
  resetTime
} from '../../../../infrastructure/state/slices/timeSlice';
import { TimeValue } from '../../../../domain/valueObjects/TimeValue';

describe('time reducer', () => {
  // Mock Date.now for predictable test results
  const mockNow = new Date('2023-01-01T12:00:00').getTime();
  let originalDateNow: () => number;
  
  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = vi.fn(() => mockNow);
    
    // Mock crypto.randomUUID for deterministic IDs in tests
    Object.defineProperty(crypto, 'randomUUID', {
      value: vi.fn(() => '12345-test-uuid'),
      configurable: true
    });
  });
  
  afterEach(() => {
    Date.now = originalDateNow;
    vi.clearAllMocks();
  });

  it('should handle initial state', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    
    // Should initialize with game start time (September 1, 1983)
    const gameStart = TimeValue.createGameStart();
    
    expect(initialState.timestamp).toBe(gameStart.timestamp);
    expect(initialState.timeScale).toBe(1);
    expect(initialState.running).toBe(false);
    expect(initialState.events).toEqual([]);
  });
  
  it('should handle startTime', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 1,
      running: false,
      events: []
    };
    
    const actual = reducer(initialState, startTime());
    
    expect(actual.running).toBe(true);
    expect(actual.timestamp).toBe(mockNow); // Should not change timestamp
  });
  
  it('should handle pauseTime', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 1,
      running: true,
      events: []
    };
    
    const actual = reducer(initialState, pauseTime());
    
    expect(actual.running).toBe(false);
    expect(actual.timestamp).toBe(mockNow); // Should not change timestamp
  });
  
  it('should handle toggleTime', () => {
    const initialStatePaused = {
      timestamp: mockNow,
      timeScale: 1,
      running: false,
      events: []
    };
    
    const actualStarted = reducer(initialStatePaused, toggleTime());
    expect(actualStarted.running).toBe(true);
    
    const initialStateRunning = {
      timestamp: mockNow,
      timeScale: 1,
      running: true,
      events: []
    };
    
    const actualPaused = reducer(initialStateRunning, toggleTime());
    expect(actualPaused.running).toBe(false);
  });
  
  it('should handle setTimeScale', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 1,
      running: false,
      events: []
    };
    
    const actual = reducer(initialState, setTimeScale(2.5));
    
    expect(actual.timeScale).toBe(2.5);
    expect(actual.timestamp).toBe(mockNow); // Should not change timestamp
    
    // Should throw error for invalid time scale
    expect(() => {
      reducer(initialState, setTimeScale(0));
    }).toThrow('Time scale must be positive');
    
    expect(() => {
      reducer(initialState, setTimeScale(-1));
    }).toThrow('Time scale must be positive');
  });
  
  it('should handle advanceTime', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 2,
      running: false,
      events: []
    };
    
    // Advance by 30 minutes (1,800,000 milliseconds)
    const actual = reducer(initialState, advanceTime(1_800_000));
    
    // With timeScale 2, should advance by 1 hour (3,600,000 milliseconds)
    expect(actual.timestamp).toBe(mockNow + 3_600_000);
  });
  
  it('should handle tick when running', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 2,
      running: true,
      events: []
    };
    
    // Simulate 5 minutes of real time passed
    const fiveMinutesLater = mockNow + 5 * 60 * 1000;
    Date.now = vi.fn(() => fiveMinutesLater);
    
    const actual = reducer(initialState, tick());
    
    // With timeScale 2, should advance by 10 minutes (600,000 milliseconds)
    expect(actual.timestamp).toBe(mockNow + 600_000);
  });
  
  it('should not advance time on tick when paused', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 2,
      running: false,
      events: []
    };
    
    // Simulate 5 minutes of real time passed
    const fiveMinutesLater = mockNow + 5 * 60 * 1000;
    Date.now = vi.fn(() => fiveMinutesLater);
    
    const actual = reducer(initialState, tick());
    
    // Should not advance time when paused
    expect(actual.timestamp).toBe(mockNow);
  });
  
  it('should handle setTime', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 1,
      running: false,
      events: []
    };
    
    const newTimestamp = mockNow + 3600000; // 1 hour later
    const actual = reducer(initialState, setTime(newTimestamp));
    
    expect(actual.timestamp).toBe(newTimestamp);
  });
  
  it('should handle scheduleEvent and trigger events when time advances', () => {
    const initialState = {
      timestamp: mockNow,
      timeScale: 1,
      running: false,
      events: []
    };
    
    // Mock callback function for event
    const eventCallback = vi.fn();
    
    // Schedule an event 30 minutes in the future
    const triggerTime = mockNow + 1_800_000; // 30 minutes later
    
    // First action: schedule the event
    const stateWithEvent = reducer(
      initialState,
      scheduleEvent({
        triggerTime,
        callback: eventCallback,
        description: 'Test event'
      })
    );
    
    // Event should be in the state
    expect(stateWithEvent.events).toHaveLength(1);
    expect(stateWithEvent.events[0].triggerTime).toBe(triggerTime);
    expect(stateWithEvent.events[0].description).toBe('Test event');
    
    // Second action: advance time past the event
    const finalState = reducer(
      stateWithEvent,
      advanceTime(3_600_000) // 1 hour
    );
    
    // Event should be removed after triggering
    expect(finalState.events).toHaveLength(0);
  });
  
  it('should handle cancelEvent', () => {
    // Create a state with an event
    const initialState = {
      timestamp: mockNow,
      timeScale: 1,
      running: false,
      events: [
        {
          id: '12345-test-uuid',
          triggerTime: mockNow + 1_800_000,
          callback: vi.fn(),
          description: 'Test event'
        }
      ]
    };
    
    // Cancel the event
    const actual = reducer(initialState, cancelEvent('12345-test-uuid'));
    
    // Event should be removed
    expect(actual.events).toHaveLength(0);
  });
  
  it('should handle resetTime', () => {
    // Create a state with modified values
    const initialState = {
      timestamp: mockNow,
      timeScale: 2.5,
      running: true,
      events: [
        {
          id: '12345-test-uuid',
          triggerTime: mockNow + 1_800_000,
          callback: vi.fn(),
          description: 'Test event'
        }
      ]
    };
    
    // Reset the time
    const actual = reducer(initialState, resetTime());
    
    // Should reset to game start
    const gameStart = TimeValue.createGameStart();
    expect(actual.timestamp).toBe(gameStart.timestamp);
    expect(actual.timeScale).toBe(1);
    expect(actual.running).toBe(false);
    expect(actual.events).toHaveLength(0);
  });
});
