// /Users/montysharma/Documents/v8/MMV08/src/__tests__/infrastructure/state/eventsSlice.test.ts

import eventsReducer, {
  EventsState,
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
} from '../../../infrastructure/state/slices/eventsSlice';
import { EventCategory, EventTriggerType } from '../../../domain/types/EventTypes';

describe('eventsSlice', () => {
  // Initial state
  const initialState: EventsState = {
    registeredEvents: [],
    activeEvents: [],
    resolvedEvents: [],
    selectedEventId: null
  };

  // Sample event data
  const sampleEvent = {
    id: 'test-event-1',
    title: 'Test Event',
    description: 'This is a test event',
    category: EventCategory.DAILY,
    trigger: {
      type: EventTriggerType.TIME,
    },
    choices: [
      {
        id: 'choice-1',
        text: 'Choice 1',
        effects: {
          narrative: 'You chose option 1.',
        },
      },
    ],
    repeatable: false,
    priority: 1,
  };

  const sampleActiveEvent = {
    data: sampleEvent,
    startTime: '2023-01-01T12:00:00.000Z',
    resolved: false
  };

  const sampleResolvedEvent = {
    eventId: 'test-event-1',
    timestamp: '2023-01-01T12:30:00.000Z',
    choiceId: 'choice-1',
    effects: {
      narrative: 'You chose option 1.',
    },
    successful: true
  };

  test('should return the initial state', () => {
    expect(eventsReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle registerEvent', () => {
    const nextState = eventsReducer(initialState, registerEvent(sampleEvent));
    expect(nextState.registeredEvents.length).toBe(1);
    expect(nextState.registeredEvents[0].id).toBe('test-event-1');
  });

  test('should handle registerEvents', () => {
    const secondEvent = { ...sampleEvent, id: 'test-event-2' };
    const nextState = eventsReducer(initialState, registerEvents([sampleEvent, secondEvent]));
    expect(nextState.registeredEvents.length).toBe(2);
    expect(nextState.registeredEvents[0].id).toBe('test-event-1');
    expect(nextState.registeredEvents[1].id).toBe('test-event-2');
  });

  test('should handle triggerEvent', () => {
    const nextState = eventsReducer(initialState, triggerEvent(sampleActiveEvent));
    expect(nextState.activeEvents.length).toBe(1);
    expect(nextState.activeEvents[0].data.id).toBe('test-event-1');
  });

  test('should handle triggerEvents', () => {
    const secondActiveEvent = { ...sampleActiveEvent, data: { ...sampleEvent, id: 'test-event-2' } };
    const nextState = eventsReducer(initialState, triggerEvents([sampleActiveEvent, secondActiveEvent]));
    expect(nextState.activeEvents.length).toBe(2);
    expect(nextState.activeEvents[0].data.id).toBe('test-event-1');
    expect(nextState.activeEvents[1].data.id).toBe('test-event-2');
  });

  test('should handle resolveEvent', () => {
    // Set up state with an active event
    const stateWithActiveEvent = {
      ...initialState,
      activeEvents: [sampleActiveEvent]
    };

    const nextState = eventsReducer(
      stateWithActiveEvent, 
      resolveEvent({
        eventId: 'test-event-1',
        resolution: sampleResolvedEvent
      })
    );

    // Event should be removed from active events
    expect(nextState.activeEvents.length).toBe(0);
    
    // Event should be added to resolved events
    expect(nextState.resolvedEvents.length).toBe(1);
    expect(nextState.resolvedEvents[0].eventId).toBe('test-event-1');
    expect(nextState.resolvedEvents[0].choiceId).toBe('choice-1');
  });

  test('should handle selectEvent', () => {
    const nextState = eventsReducer(initialState, selectEvent('test-event-1'));
    expect(nextState.selectedEventId).toBe('test-event-1');
    
    // Test deselecting
    const finalState = eventsReducer(nextState, selectEvent(null));
    expect(finalState.selectedEventId).toBeNull();
  });

  test('should handle autoResolveEvents', () => {
    // Set up state with active events
    const stateWithActiveEvents = {
      ...initialState,
      activeEvents: [
        sampleActiveEvent,
        { ...sampleActiveEvent, data: { ...sampleEvent, id: 'test-event-2' } }
      ]
    };

    const nextState = eventsReducer(
      stateWithActiveEvents,
      autoResolveEvents([
        sampleResolvedEvent,
        { ...sampleResolvedEvent, eventId: 'test-event-2' }
      ])
    );

    // All events should be removed from active events
    expect(nextState.activeEvents.length).toBe(0);
    
    // All events should be added to resolved events
    expect(nextState.resolvedEvents.length).toBe(2);
    expect(nextState.resolvedEvents[0].eventId).toBe('test-event-1');
    expect(nextState.resolvedEvents[1].eventId).toBe('test-event-2');
  });

  test('should handle updateEvents', () => {
    // Completely separate test objects
    const testActiveEvent = {
      data: {
        id: 'unique-test-event-id',
        title: 'Unique Test Event',
        description: 'This is a unique test event',
        category: EventCategory.DAILY,
        trigger: {
          type: EventTriggerType.TIME,
        },
        choices: [
          {
            id: 'choice-1',
            text: 'Choice 1',
            effects: {
              narrative: 'You chose option 1.',
            },
          },
        ],
        repeatable: false,
        priority: 1,
      },
      startTime: '2023-02-01T12:00:00.000Z',
      resolved: false
    };

    const testResolvedEvent = {
      eventId: 'unique-test-event-id',
      timestamp: '2023-02-01T12:30:00.000Z',
      choiceId: 'choice-1',
      effects: {
        narrative: 'You chose option 1.',
      },
      successful: true
    };

    // Create a completely fresh state for this test
    const testState = {
      registeredEvents: [],
      activeEvents: [],
      resolvedEvents: [],
      selectedEventId: null
    };

    // Apply the action
    const nextState = eventsReducer(
      testState,
      updateEvents({
        newActiveEvents: [testActiveEvent],
        newResolvedEvents: []
      })
    );

    // Check the active events were added
    expect(nextState.activeEvents.length).toBe(1);
    expect(nextState.activeEvents[0].data.id).toBe('unique-test-event-id');
    
    // Now add a resolved event
    const finalState = eventsReducer(
      nextState,
      updateEvents({
        newActiveEvents: [],
        newResolvedEvents: [testResolvedEvent]
      })
    );
    
    // Check resolved events were added
    expect(finalState.resolvedEvents.length).toBe(1);
    expect(finalState.resolvedEvents[0].eventId).toBe('unique-test-event-id');
  });

  test('should handle clearEvents', () => {
    // Set up state with data
    const stateWithData = {
      ...initialState,
      registeredEvents: [sampleEvent],
      activeEvents: [sampleActiveEvent],
      resolvedEvents: [sampleResolvedEvent],
      selectedEventId: 'test-event-1'
    };

    const nextState = eventsReducer(stateWithData, clearEvents());
    
    // Registered events should remain
    expect(nextState.registeredEvents.length).toBe(1);
    
    // Active and resolved events should be cleared
    expect(nextState.activeEvents.length).toBe(0);
    expect(nextState.resolvedEvents.length).toBe(0);
    expect(nextState.selectedEventId).toBeNull();
  });

  test('should handle restoreEventState', () => {
    const restoredState = {
      registeredEvents: [sampleEvent],
      activeEvents: [sampleActiveEvent],
      resolvedEvents: [sampleResolvedEvent]
    };

    const nextState = eventsReducer(initialState, restoreEventState(restoredState));
    
    expect(nextState.registeredEvents.length).toBe(1);
    expect(nextState.registeredEvents[0].id).toBe('test-event-1');
    expect(nextState.activeEvents.length).toBe(1);
    expect(nextState.activeEvents[0].data.id).toBe('test-event-1');
    expect(nextState.resolvedEvents.length).toBe(1);
    expect(nextState.resolvedEvents[0].eventId).toBe('test-event-1');
    expect(nextState.selectedEventId).toBeNull();
  });
});
