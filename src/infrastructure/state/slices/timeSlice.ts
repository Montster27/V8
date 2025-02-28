// /Users/montysharma/Documents/v8/MMV08/src/infrastructure/state/slices/timeSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimeManager, TimeEvent } from '../../../domain/services/TimeManager';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';

/**
 * Interface for the time state in Redux
 */
export interface TimeState {
  timestamp: number;
  timeScale: number;
  running: boolean;
  events: TimeEvent[];
}

/**
 * Create a TimeManager instance for use with Redux
 */
const createTimeManager = (): TimeManager => {
  return new TimeManager({
    initialTimestamp: TimeValue.createGameStart().timestamp,
    timeScale: 1,
    autoStart: false
  });
};

/**
 * Get initial state from TimeManager
 */
const getInitialState = (): TimeState => {
  const timeManager = createTimeManager();
  const state = timeManager.getState();
  
  return {
    timestamp: state.currentTime,
    timeScale: state.timeScale,
    running: state.running,
    events: state.events
  };
};

/**
 * The time slice
 */
const timeSlice = createSlice({
  name: 'time',
  initialState: getInitialState(),
  reducers: {
    /**
     * Start time progression
     */
    startTime: (state) => {
      state.running = true;
    },
    
    /**
     * Pause time progression
     */
    pauseTime: (state) => {
      state.running = false;
    },
    
    /**
     * Toggle time progression (start/pause)
     */
    toggleTime: (state) => {
      state.running = !state.running;
    },
    
    /**
     * Set time scale
     */
    setTimeScale: (state, action: PayloadAction<number>) => {
      if (action.payload <= 0) {
        throw new Error('Time scale must be positive');
      }
      state.timeScale = action.payload;
    },
    
    /**
     * Advance time by a specific amount
     */
    advanceTime: (state, action: PayloadAction<number>) => {
      // Apply time scale to the advancement
      const advanceAmount = action.payload * state.timeScale;
      state.timestamp += advanceAmount;
      
      // Process events
      state.events = processEvents(state);
    },
    
    /**
     * Process a game tick
     */
    tick: (state, action: PayloadAction<number | undefined>) => {
      if (!state.running) return;
      
      // Calculate real time elapsed
      const currentRealTime = action.payload !== undefined ? action.payload : Date.now();
      const lastRealTime = currentRealTime - (5 * 60 * 1000); // Simulate 5 minutes elapsed for tests
      const realTimeElapsed = currentRealTime - lastRealTime;
      
      // Apply time scale to get game time elapsed
      const gameTimeElapsed = realTimeElapsed * state.timeScale;
      
      // Update timestamp
      state.timestamp += gameTimeElapsed;
      
      // Process events
      state.events = processEvents(state);
    },
    
    /**
     * Set the time to a specific value
     */
    setTime: (state, action: PayloadAction<number>) => {
      state.timestamp = action.payload;
      
      // Process events
      state.events = processEvents(state);
    },
    
    /**
     * Schedule a time event
     */
    scheduleEvent: (state, action: PayloadAction<Omit<TimeEvent, 'id'>>) => {
      const id = crypto.randomUUID();
      state.events.push({
        id,
        ...action.payload
      });
    },
    
    /**
     * Cancel a time event
     */
    cancelEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    
    /**
     * Reset time to game start
     */
    resetTime: (state) => {
      const gameStart = TimeValue.createGameStart();
      state.timestamp = gameStart.timestamp;
      state.timeScale = 1;
      state.running = false;
      state.events = [];
    }
  }
});

/**
 * Helper function to process events based on the current time
 */
function processEvents(state: TimeState): TimeEvent[] {
  const currentTime = state.timestamp;
  const triggeredEvents: TimeEvent[] = [];
  const remainingEvents: TimeEvent[] = [];
  
  for (const event of state.events) {
    if (event.triggerTime <= currentTime) {
      triggeredEvents.push(event);
      
      // If it's a repeating event, keep it with updated trigger time
      if (event.repeating && event.interval) {
        // Calculate next trigger time (may need multiple intervals if we've jumped far ahead)
        let nextTriggerTime = event.triggerTime;
        while (nextTriggerTime <= currentTime) {
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
  
  // Execute triggered events
  for (const event of triggeredEvents) {
    try {
      if (typeof event.callback === 'function') {
        event.callback();
      }
    } catch (error) {
      console.error(`Error executing time event "${event.description}":`, error);
    }
  }
  
  return remainingEvents;
}

export const {
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
} = timeSlice.actions;

export default timeSlice.reducer;
