// /Users/montysharma/Documents/v8/MMV08/src/infrastructure/state/slices/eventsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActiveEvent, ResolvedEvent, EventData } from '../../../domain/types/EventTypes';
import { RootState } from '../store';

/**
 * Interface for the events state in Redux
 */
export interface EventsState {
  // All registered events that can potentially be triggered
  registeredEvents: EventData[];
  
  // Currently active events that the player needs to respond to
  activeEvents: ActiveEvent[];
  
  // Events that have been resolved by the player
  resolvedEvents: ResolvedEvent[];
  
  // Currently selected event (for UI purposes)
  selectedEventId: string | null;
}

/**
 * Initial state for the events slice
 */
const initialState: EventsState = {
  registeredEvents: [],
  activeEvents: [],
  resolvedEvents: [],
  selectedEventId: null
};

/**
 * Redux slice for managing game events
 */
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    /**
     * Register a new event that can be triggered
     */
    registerEvent: (state, action: PayloadAction<EventData>) => {
      // Prevent duplicates
      if (!state.registeredEvents.find(event => event.id === action.payload.id)) {
        state.registeredEvents.push(JSON.parse(JSON.stringify(action.payload)));
      }
    },
    
    /**
     * Register multiple events at once
     */
    registerEvents: (state, action: PayloadAction<EventData[]>) => {
      action.payload.forEach(eventData => {
        if (!state.registeredEvents.find(event => event.id === eventData.id)) {
          state.registeredEvents.push(JSON.parse(JSON.stringify(eventData)));
        }
      });
    },
    
    /**
     * Add a newly triggered event to active events
     */
    triggerEvent: (state, action: PayloadAction<ActiveEvent>) => {
      // Prevent duplicates
      if (!state.activeEvents.find(event => event.data.id === action.payload.data.id)) {
        state.activeEvents.push(JSON.parse(JSON.stringify(action.payload)));
      }
    },
    
    /**
     * Add multiple triggered events at once
     */
    triggerEvents: (state, action: PayloadAction<ActiveEvent[]>) => {
      action.payload.forEach(activeEvent => {
        if (!state.activeEvents.find(event => event.data.id === activeEvent.data.id)) {
          state.activeEvents.push(JSON.parse(JSON.stringify(activeEvent)));
        }
      });
    },
    
    /**
     * Resolve an active event with a player choice
     */
    resolveEvent: (state, action: PayloadAction<{
      eventId: string;
      resolution: ResolvedEvent;
    }>) => {
      const { eventId, resolution } = action.payload;
      
      // Find the active event
      const activeEventIndex = state.activeEvents.findIndex(
        event => event.data.id === eventId
      );
      
      if (activeEventIndex !== -1) {
        // Mark as resolved
        state.activeEvents[activeEventIndex].resolved = true;
        state.activeEvents[activeEventIndex].resolution = resolution;
        
        // Add to resolved events
        state.resolvedEvents.push(JSON.parse(JSON.stringify(resolution)));
        
        // Remove from active events
        state.activeEvents.splice(activeEventIndex, 1);
      }
    },
    
    /**
     * Set the currently selected event for UI purposes
     */
    selectEvent: (state, action: PayloadAction<string | null>) => {
      state.selectedEventId = action.payload;
    },
    
    /**
     * Auto-resolve events that have timed out
     */
    autoResolveEvents: (state, action: PayloadAction<ResolvedEvent[]>) => {
      action.payload.forEach(resolution => {
        // Find the active event
        const activeEventIndex = state.activeEvents.findIndex(
          event => event.data.id === resolution.eventId
        );
        
        if (activeEventIndex !== -1) {
          // Mark as resolved
          state.activeEvents[activeEventIndex].resolved = true;
          state.activeEvents[activeEventIndex].resolution = resolution;
          
          // Add to resolved events
          state.resolvedEvents.push(JSON.parse(JSON.stringify(resolution)));
          
          // Remove from active events
          state.activeEvents.splice(activeEventIndex, 1);
        }
      });
    },
    
    /**
     * Update event state with new game time (used for checking triggers/timeouts)
     */
    updateEvents: (state, action: PayloadAction<{
      newActiveEvents: ActiveEvent[];
      newResolvedEvents: ResolvedEvent[];
    }>) => {
      const { newActiveEvents, newResolvedEvents } = action.payload;
      
      // Add new active events
      for (const activeEvent of newActiveEvents) {
        const existingEvent = state.activeEvents.find(event => 
          event.data.id === activeEvent.data.id
        );
        
        if (!existingEvent) {
          state.activeEvents.push(JSON.parse(JSON.stringify(activeEvent)));
        }
      }
      
      // Add new resolved events and remove corresponding active events
      for (const resolution of newResolvedEvents) {
        // Add to resolved events
        state.resolvedEvents.push(JSON.parse(JSON.stringify(resolution)));
        
        // Find and remove from active events
        const activeEventIndex = state.activeEvents.findIndex(
          event => event.data.id === resolution.eventId
        );
        
        if (activeEventIndex !== -1) {
          state.activeEvents.splice(activeEventIndex, 1);
        }
      }
    },
    
    /**
     * Clear all events (e.g., when starting a new game)
     */
    clearEvents: (state) => {
      state.activeEvents = [];
      state.resolvedEvents = [];
      state.selectedEventId = null;
    },
    
    /**
     * Restore complete event state (e.g., when loading a saved game)
     */
    restoreEventState: (state, action: PayloadAction<{
      registeredEvents?: EventData[];
      activeEvents?: ActiveEvent[];
      resolvedEvents?: ResolvedEvent[];
    }>) => {
      const { registeredEvents, activeEvents, resolvedEvents } = action.payload;
      
      if (registeredEvents) {
        state.registeredEvents = JSON.parse(JSON.stringify(registeredEvents));
      }
      
      if (activeEvents) {
        state.activeEvents = JSON.parse(JSON.stringify(activeEvents));
      }
      
      if (resolvedEvents) {
        state.resolvedEvents = JSON.parse(JSON.stringify(resolvedEvents));
      }
      
      state.selectedEventId = null;
    }
  }
});

// Export actions
export const {
  registerEvent,
  registerEvents,
  triggerEvent,
  triggerEvents,
  resolveEvent,
  selectEvent,
  autoResolveEvents,
  updateEvents,
  clearEvents,
  restoreEventState
} = eventsSlice.actions;

// Export selectors
export const selectRegisteredEvents = (state: RootState) => state.events.registeredEvents;
export const selectActiveEvents = (state: RootState) => state.events.activeEvents;
export const selectResolvedEvents = (state: RootState) => state.events.resolvedEvents;
export const selectSelectedEventId = (state: RootState) => state.selectedEventId;
export const selectSelectedEvent = (state: RootState) => {
  const { selectedEventId, activeEvents } = state.events;
  if (!selectedEventId) return null;
  return activeEvents.find(event => event.data.id === selectedEventId) || null;
};
export const selectHasResolvedEvent = (eventId: string) => (state: RootState) => 
  state.events.resolvedEvents.some(event => event.eventId === eventId);

// Export reducer
export default eventsSlice.reducer;