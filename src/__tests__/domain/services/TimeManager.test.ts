// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/services/TimeManager.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimeManager } from '../../../domain/services/TimeManager';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';

describe('TimeManager', () => {
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
  
  it('should initialize with default values', () => {
    const manager = new TimeManager();
    
    expect(manager.currentTime.timestamp).toBe(TimeValue.createGameStart().timestamp);
    expect(manager.isRunning).toBe(false);
    expect(manager.timeScale).toBe(1);
    expect(manager.events).toEqual([]);
  });
  
  it('should initialize with custom values', () => {
    const initialTimestamp = new Date('1983-10-15T14:30:00').getTime();
    const manager = new TimeManager({
      initialTimestamp,
      timeScale: 2.5,
      autoStart: true
    });
    
    expect(manager.currentTime.timestamp).toBe(initialTimestamp);
    expect(manager.isRunning).toBe(true);
    expect(manager.timeScale).toBe(2.5);
  });
  
  it('should start and pause time progression', () => {
    const manager = new TimeManager();
    
    expect(manager.isRunning).toBe(false);
    
    manager.start();
    expect(manager.isRunning).toBe(true);
    
    manager.pause();
    expect(manager.isRunning).toBe(false);
  });
  
  it('should set time scale', () => {
    const manager = new TimeManager();
    
    manager.setTimeScale(5);
    expect(manager.timeScale).toBe(5);
    
    manager.setTimeScale(0.5);
    expect(manager.timeScale).toBe(0.5);
    
    expect(() => manager.setTimeScale(0)).toThrow('Time scale must be positive');
    expect(() => manager.setTimeScale(-1)).toThrow('Time scale must be positive');
  });
  
  it('should advance time correctly', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ initialTimestamp });
    
    // Advance by 1 hour (3,600,000 milliseconds)
    manager.advanceTime(3_600_000);
    
    const expected = new Date('1983-09-01T13:00:00').getTime();
    expect(manager.currentTime.timestamp).toBe(expected);
  });
  
  it('should process game tick when running', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ 
      initialTimestamp,
      timeScale: 2,
      autoStart: true
    });
    
    // Simulate 5 minutes of real time passed
    const fiveMinutesLater = mockNow + 5 * 60 * 1000;
    Date.now = vi.fn(() => fiveMinutesLater);
    
    manager.tick();
    
    // Should advance game time by 10 minutes (5 real minutes * 2x scale)
    const expected = new Date('1983-09-01T12:10:00').getTime();
    expect(manager.currentTime.timestamp).toBe(expected);
  });
  
  it('should not process game tick when paused', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ initialTimestamp });
    
    // Ensure time is paused
    manager.pause();
    
    // Simulate 5 minutes of real time passed
    const fiveMinutesLater = mockNow + 5 * 60 * 1000;
    Date.now = vi.fn(() => fiveMinutesLater);
    
    manager.tick();
    
    // Time should not advance when paused
    expect(manager.currentTime.timestamp).toBe(initialTimestamp);
  });
  
  it('should schedule and trigger time events', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ initialTimestamp });
    
    const eventCallback = vi.fn();
    const triggerTime = new Date('1983-09-01T12:30:00').getTime();
    
    manager.scheduleEvent(triggerTime, eventCallback, {
      description: 'Test event'
    });
    
    // Advance to 12:15 - event should not trigger
    manager.setTime(new Date('1983-09-01T12:15:00').getTime());
    expect(eventCallback).not.toHaveBeenCalled();
    
    // Advance to 12:45 - event should trigger
    manager.setTime(new Date('1983-09-01T12:45:00').getTime());
    expect(eventCallback).toHaveBeenCalledTimes(1);
    
    // Event should be removed after triggering
    expect(manager.events).toHaveLength(0);
  });
  
  it('should handle repeating events', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ initialTimestamp });
    
    const eventCallback = vi.fn();
    const triggerTime = new Date('1983-09-01T13:00:00').getTime();
    const hourInMs = 60 * 60 * 1000;
    
    manager.scheduleEvent(triggerTime, eventCallback, {
      description: 'Hourly event',
      repeating: true,
      interval: hourInMs // Repeat every hour
    });
    
    // Advance to 13:30 - event should trigger once
    manager.setTime(new Date('1983-09-01T13:30:00').getTime());
    expect(eventCallback).toHaveBeenCalledTimes(1);
    
    // Event should remain in list with updated trigger time
    expect(manager.events).toHaveLength(1);
    expect(manager.events[0].triggerTime).toBe(
      new Date('1983-09-01T14:00:00').getTime()
    );
    
    // Advance to 14:30 - event should trigger again
    manager.setTime(new Date('1983-09-01T14:30:00').getTime());
    expect(eventCallback).toHaveBeenCalledTimes(2);
    
    // Event should again remain in list with updated trigger time
    expect(manager.events).toHaveLength(1);
    expect(manager.events[0].triggerTime).toBe(
      new Date('1983-09-01T15:00:00').getTime()
    );
  });
  
  it('should handle multiple intervals for repeating events when time jumps ahead', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ initialTimestamp });
    
    const eventCallback = vi.fn();
    const triggerTime = new Date('1983-09-01T13:00:00').getTime();
    const hourInMs = 60 * 60 * 1000;
    
    manager.scheduleEvent(triggerTime, eventCallback, {
      description: 'Hourly event',
      repeating: true,
      interval: hourInMs
    });
    
    // Jump ahead several hours - event should only trigger once but be rescheduled correctly
    manager.setTime(new Date('1983-09-01T16:30:00').getTime());
    
    // Event callback should only be called once regardless of how many intervals we jumped
    expect(eventCallback).toHaveBeenCalledTimes(1);
    
    // The next event should be scheduled for 17:00
    expect(manager.events).toHaveLength(1);
    expect(manager.events[0].triggerTime).toBe(
      new Date('1983-09-01T17:00:00').getTime()
    );
  });
  
  it('should cancel scheduled events', () => {
    const manager = new TimeManager();
    
    const eventCallback = vi.fn();
    const triggerTime = new Date('1983-09-01T13:00:00').getTime();
    
    const eventId = manager.scheduleEvent(triggerTime, eventCallback, {
      description: 'Test event'
    });
    
    expect(manager.events).toHaveLength(1);
    
    const result = manager.cancelEvent(eventId);
    expect(result).toBe(true);
    expect(manager.events).toHaveLength(0);
    
    // Canceling non-existent event should return false
    expect(manager.cancelEvent('non-existent-id')).toBe(false);
  });
  
  it('should save and restore state', () => {
    const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
    const manager = new TimeManager({ initialTimestamp, timeScale: 2.5 });
    
    manager.start();
    
    const eventCallback = vi.fn();
    const triggerTime = new Date('1983-09-01T13:00:00').getTime();
    
    manager.scheduleEvent(triggerTime, eventCallback, {
      description: 'Test event'
    });
    
    // Save state
    const state = manager.getState();
    
    // Create new manager with different initial values
    const newManager = new TimeManager({
      initialTimestamp: new Date('1984-01-01').getTime(),
      timeScale: 1.0
    });
    
    // Restore state
    newManager.restoreState(state);
    
    // Check if state was correctly restored
    expect(newManager.currentTime.timestamp).toBe(initialTimestamp);
    expect(newManager.isRunning).toBe(true);
    expect(newManager.timeScale).toBe(2.5);
    expect(newManager.events).toHaveLength(1);
    expect(newManager.events[0].description).toBe('Test event');
  });
  
  it('should handle error in event callback without breaking', () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    try {
      const initialTimestamp = new Date('1983-09-01T12:00:00').getTime();
      const manager = new TimeManager({ initialTimestamp });
      
      // Schedule an event with a callback that will throw
      const errorCallback = () => {
        throw new Error('Test error in callback');
      };
      
      const triggerTime = new Date('1983-09-01T13:00:00').getTime();
      manager.scheduleEvent(triggerTime, errorCallback, {
        description: 'Error event'
      });
      
      // This should not throw, even though the callback will
      expect(() => {
        manager.setTime(new Date('1983-09-01T14:00:00').getTime());
      }).not.toThrow();
      
      // Console.error should have been called
      expect(console.error).toHaveBeenCalled();
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
  });
});
