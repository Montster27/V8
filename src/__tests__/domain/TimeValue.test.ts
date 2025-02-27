// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/TimeValue.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TimeValue } from '../../domain/valueObjects/TimeValue';

describe('TimeValue', () => {
  // Mock the Date.now() for consistent tests
  const mockNow = 1677629353000; // February 28, 2023 23:42:33 UTC
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a TimeValue with current time when no parameters are provided', () => {
    const timeValue = new TimeValue();
    expect(timeValue.timestamp).toBe(mockNow);
    expect(timeValue.timeScale).toBe(1);
  });
  
  it('should create a TimeValue with provided timestamp and time scale', () => {
    const timestamp = 1614229353000; // February 25, 2021
    const timeScale = 2;
    const timeValue = new TimeValue(timestamp, timeScale);
    
    expect(timeValue.timestamp).toBe(timestamp);
    expect(timeValue.timeScale).toBe(timeScale);
  });
  
  it('should prevent negative time scale', () => {
    const timeValue = new TimeValue(mockNow, -1);
    expect(timeValue.timeScale).toBe(0);
  });
  
  it('should return a correct Date object', () => {
    const timestamp = 1614229353000; // February 25, 2021
    const timeValue = new TimeValue(timestamp);
    
    const date = timeValue.date;
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toBe(timestamp);
  });
  
  it('should format time correctly', () => {
    // Using a fixed timestamp for consistent testing
    // March 15, 2023 14:30:00 UTC
    const timestamp = new Date(2023, 2, 15, 14, 30, 0).getTime();
    const timeValue = new TimeValue(timestamp);
    
    // The expected format may vary depending on locale, so we test for key components
    const formattedTime = timeValue.formattedTime;
    expect(formattedTime).toContain('14');
    expect(formattedTime).toContain('30');
  });
  
  it('should format date correctly', () => {
    // Using a fixed timestamp for consistent testing
    // March 15, 2023 14:30:00 UTC
    const timestamp = new Date(2023, 2, 15, 14, 30, 0).getTime();
    const timeValue = new TimeValue(timestamp);
    
    // The expected format may vary depending on locale, so we test for key components
    const formattedDate = timeValue.formattedDate;
    expect(formattedDate).toContain('2023');
    expect(formattedDate).toContain('March');
    expect(formattedDate).toContain('15');
  });
  
  it('should advance time correctly based on time scale', () => {
    const timeValue = new TimeValue(mockNow, 2);
    
    // Advance by 1 hour (3600000 milliseconds)
    const realTimeElapsed = 3600000;
    const advanced = timeValue.advance(realTimeElapsed);
    
    // With timeScale of 2, the game time should advance by 2 hours
    const expectedGameTimeElapsed = realTimeElapsed * 2;
    expect(advanced.timestamp).toBe(mockNow + expectedGameTimeElapsed);
    expect(advanced.timeScale).toBe(2); // Time scale should remain unchanged
  });
  
  it('should create a new instance when setting time scale', () => {
    const original = new TimeValue(mockNow, 1);
    const updated = original.setTimeScale(3);
    
    // Original should be unchanged
    expect(original.timeScale).toBe(1);
    expect(original.timestamp).toBe(mockNow);
    
    // New instance should have updated time scale
    expect(updated.timeScale).toBe(3);
    expect(updated.timestamp).toBe(mockNow);
  });
  
  it('should create a new instance when setting timestamp', () => {
    const original = new TimeValue(mockNow, 1);
    const newTimestamp = mockNow + 86400000; // Add one day
    const updated = original.setTimestamp(newTimestamp);
    
    // Original should be unchanged
    expect(original.timestamp).toBe(mockNow);
    
    // New instance should have updated timestamp
    expect(updated.timestamp).toBe(newTimestamp);
    expect(updated.timeScale).toBe(1); // Time scale should remain unchanged
  });
  
  it('should correctly determine if one time is after another', () => {
    const earlier = new TimeValue(mockNow);
    const later = new TimeValue(mockNow + 3600000); // 1 hour later
    
    expect(later.isAfter(earlier)).toBe(true);
    expect(earlier.isAfter(later)).toBe(false);
  });
  
  it('should correctly determine if one time is before another', () => {
    const earlier = new TimeValue(mockNow);
    const later = new TimeValue(mockNow + 3600000); // 1 hour later
    
    expect(earlier.isBefore(later)).toBe(true);
    expect(later.isBefore(earlier)).toBe(false);
  });
  
  it('should calculate the difference in milliseconds between two times', () => {
    const time1 = new TimeValue(mockNow);
    const time2 = new TimeValue(mockNow + 3600000); // 1 hour later
    
    expect(time2.differenceInMilliseconds(time1)).toBe(3600000);
    expect(time1.differenceInMilliseconds(time2)).toBe(-3600000);
  });
  
  it('should handle serialization and deserialization', () => {
    const original = new TimeValue(mockNow, 2.5);
    const json = original.toJSON();
    const restored = TimeValue.fromJSON(json);
    
    expect(restored.timestamp).toBe(mockNow);
    expect(restored.timeScale).toBe(2.5);
  });
  
  it('should create game start time correctly', () => {
    const gameStart = TimeValue.createGameStart();
    const expectedDate = new Date(1983, 8, 1, 8, 0, 0); // September 1, 1983, 8:00 AM
    
    expect(gameStart.timestamp).toBe(expectedDate.getTime());
    expect(gameStart.timeScale).toBe(1);
  });
});
