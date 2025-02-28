// /Users/montysharma/Documents/v8/MMV08/src/domain/services/TimeManager.ts

import { TimeValue } from '../valueObjects/TimeValue';

/**
 * Represents a time-based event that can be scheduled by the TimeManager
 */
export interface TimeEvent {
  id: string;
  triggerTime: number; // Unix timestamp in milliseconds
  callback: () => void;
  description?: string;
  repeating?: boolean;
  interval?: number; // In milliseconds
}

/**
 * Represents the serializable state of the TimeManager
 */
export interface TimeManagerState {
  currentTime: number; // Unix timestamp in milliseconds
  timeScale: number;
  running: boolean;
  events: TimeEvent[];
}

/**
 * Options for creating a new TimeManager
 */
export interface TimeManagerOptions {
  initialTimestamp?: number;
  timeScale?: number;
  autoStart?: boolean;
}

/**
 * TimeManager service responsible for managing game time progression
 * and handling time-based events.
 */
export class TimeManager {
  private _currentTime: TimeValue;
  private _running: boolean;
  private _events: TimeEvent[] = [];
  private _lastRealTimestamp: number;

  /**
   * Create a new TimeManager instance
   */
  constructor(options: TimeManagerOptions = {}) {
    const { 
      initialTimestamp = TimeValue.createGameStart().timestamp,
      timeScale = 1,
      autoStart = false
    } = options;

    this._currentTime = new TimeValue(initialTimestamp, timeScale);
    this._running = autoStart;
    this._lastRealTimestamp = Date.now();
  }

  /**
   * Get the current game time as a TimeValue
   */
  get currentTime(): TimeValue {
    return this._currentTime;
  }

  /**
   * Check if the time is currently progressing
   */
  get isRunning(): boolean {
    return this._running;
  }

  /**
   * Get the current time scale (game time / real time)
   */
  get timeScale(): number {
    return this._currentTime.timeScale;
  }

  /**
   * Get all scheduled events
   */
  get events(): TimeEvent[] {
    return [...this._events];
  }

  /**
   * Start time progression
   */
  start(): void {
    if (!this._running) {
      this._running = true;
      this._lastRealTimestamp = Date.now();
    }
  }

  /**
   * Pause time progression
   */
  pause(): void {
    this._running = false;
  }

  /**
   * Set time scale (game time / real time)
   * @param scale New time scale value
   */
  setTimeScale(scale: number): void {
    if (scale <= 0) {
      throw new Error('Time scale must be positive');
    }
    this._currentTime = this._currentTime.setTimeScale(scale);
  }

  /**
   * Set the current time to a specific value
   * @param timestamp Unix timestamp in milliseconds
   */
  setTime(timestamp: number): void {
    this._currentTime = this._currentTime.setTimestamp(timestamp);
    this.processTriggeredEvents();
  }

  /**
   * Advance time by a specified amount of milliseconds
   * @param milliseconds Milliseconds to advance
   */
  advanceTime(milliseconds: number): void {
    if (milliseconds <= 0) {
      return;
    }

    const oldTime = this._currentTime;
    this._currentTime = oldTime.advance(milliseconds);
    
    this.processTriggeredEvents();
  }

  /**
   * Process any events that should be triggered based on the current time
   */
  private processTriggeredEvents(): void {
    const currentTimestamp = this._currentTime.timestamp;
    const triggeredEvents: TimeEvent[] = [];
    const remainingEvents: TimeEvent[] = [];

    for (const event of this._events) {
      if (event.triggerTime <= currentTimestamp) {
        triggeredEvents.push(event);
        
        // If it's a repeating event, keep it with updated trigger time
        if (event.repeating && event.interval) {
          // Calculate next trigger time (may need multiple intervals if we've jumped far ahead)
          let nextTriggerTime = event.triggerTime;
          while (nextTriggerTime <= currentTimestamp) {
            nextTriggerTime += event.interval;
          }
          
          remainingEvents.push({
            ...event,
            triggerTime: nextTriggerTime
          });
        }
      } else {
        remainingEvents.push(event);
      }
    }

    // Update events list
    this._events = remainingEvents;
    
    // Execute triggered events (after updating the events list to prevent issues if callbacks schedule new events)
    for (const event of triggeredEvents) {
      try {
        event.callback();
      } catch (error) {
        console.error(`Error executing time event "${event.description}":`, error);
      }
    }
  }

  /**
   * Process a game tick, advancing time based on real elapsed time and time scale
   * @param currentRealTime Current real timestamp (optional)
   */
  tick(currentRealTime = Date.now()): void {
    if (!this._running) return;
    
    const realElapsedMs = currentRealTime - this._lastRealTimestamp;
    
    if (realElapsedMs > 0) {
      this.advanceTime(realElapsedMs);
      this._lastRealTimestamp = currentRealTime;
    }
  }

  /**
   * Schedule a new time event
   * @param triggerTime When to trigger the event (timestamp or TimeValue)
   * @param callback Function to call when the event triggers
   * @param options Additional event options
   * @returns Event ID for cancellation
   */
  scheduleEvent(
    triggerTime: number | TimeValue,
    callback: () => void,
    options: {
      description?: string;
      repeating?: boolean;
      interval?: number;
    } = {}
  ): string {
    const { description, repeating, interval } = options;
    
    // Convert TimeValue to timestamp if needed
    const triggerTimestamp = 
      typeof triggerTime === 'number' ? triggerTime : triggerTime.timestamp;
    
    // Generate a unique ID
    const id = crypto.randomUUID();
    
    this._events.push({
      id,
      triggerTime: triggerTimestamp,
      callback,
      description,
      repeating,
      interval
    });
    
    return id;
  }

  /**
   * Cancel a scheduled event by ID
   * @param id Event ID to cancel
   * @returns True if event was found and canceled
   */
  cancelEvent(id: string): boolean {
    const initialLength = this._events.length;
    this._events = this._events.filter(event => event.id !== id);
    return initialLength > this._events.length;
  }

  /**
   * Get the current state of the TimeManager
   * (for saving game state)
   */
  getState(): TimeManagerState {
    return {
      currentTime: this._currentTime.timestamp,
      timeScale: this._currentTime.timeScale,
      running: this._running,
      events: [...this._events]
    };
  }

  /**
   * Restore TimeManager state from saved state
   * @param state State to restore
   */
  restoreState(state: TimeManagerState): void {
    this._currentTime = new TimeValue(state.currentTime, state.timeScale);
    this._running = state.running;
    this._events = [...state.events];
    this._lastRealTimestamp = Date.now();
  }
}
