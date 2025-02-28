// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/services/EventManager.test.ts

import EventManager from '../../../domain/services/EventManager';
import SkillManager from '../../../domain/services/SkillManager';
import TimeValue from '../../../domain/valueObjects/TimeValue';
import { EventCategory, EventTriggerType } from '../../../domain/types/EventTypes';
import { ResourceType } from '../../../domain/types/ResourceTypes';

import { vi } from 'vitest';

// Mock SkillManager
vi.mock('../../../domain/services/SkillManager', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      // Add any methods you need to mock
    }))
  };
});

describe('EventManager', () => {
  // Mock game state
  const mockGameState = {
    getSkillLevel: vi.fn().mockReturnValue(1),
    getResourceValue: vi.fn().mockReturnValue(50),
    hasResolvedEvent: vi.fn().mockReturnValue(false),
    getCurrentTime: vi.fn().mockReturnValue(new TimeValue()),
    getResolvedEvents: vi.fn().mockReturnValue([]),
    getActiveActivities: vi.fn().mockReturnValue([]),
  };

  // Mock event data
  const mockEventData = {
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

  // Time-based event
  const mockTimeEvent = {
    id: 'time-event',
    title: 'Time Event',
    description: 'This event is triggered at a specific time',
    category: EventCategory.DAILY,
    trigger: {
      type: EventTriggerType.TIME,
      timeValue: '2023-01-01T12:00:00.000Z',
    },
    choices: [
      {
        id: 'choice-1',
        text: 'OK',
        effects: {
          narrative: 'You acknowledged the time event.',
        },
      },
    ],
    repeatable: false,
    priority: 1,
  };

  // Condition-based event
  const mockConditionEvent = {
    id: 'condition-event',
    title: 'Condition Event',
    description: 'This event is triggered when conditions are met',
    category: EventCategory.PIVOTAL,
    trigger: {
      type: EventTriggerType.CONDITION,
      conditions: [
        {
          type: 'resource',
          target: 'ENERGY',
          operator: '<',
          value: 30,
        },
      ],
    },
    choices: [
      {
        id: 'choice-1',
        text: 'Take a nap',
        effects: {
          narrative: 'You took a nap and regained some energy.',
          resourceEffects: [
            { type: ResourceType.ENERGY, value: 20 },
          ],
        },
      },
    ],
    repeatable: true,
    priority: 2,
  };

  // Setup and teardown
  let eventManager: EventManager;
  let skillManager: SkillManager;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create a fresh skill manager and event manager for each test
    skillManager = new SkillManager();
    eventManager = new EventManager(mockGameState, skillManager);
  });

  test('should register events correctly', () => {
    eventManager.registerEvent(mockEventData);
    
    // Verify the event was registered
    const events = eventManager.getAllEvents();
    expect(events.length).toBe(1);
    expect(events[0].id).toBe('test-event-1');
  });

  test('should register multiple events', () => {
    eventManager.registerEvents([mockEventData, mockTimeEvent, mockConditionEvent]);
    
    // Verify all events were registered
    const events = eventManager.getAllEvents();
    expect(events.length).toBe(3);
    expect(events.some(e => e.id === 'test-event-1')).toBe(true);
    expect(events.some(e => e.id === 'time-event')).toBe(true);
    expect(events.some(e => e.id === 'condition-event')).toBe(true);
  });

  test('should get event by ID', () => {
    eventManager.registerEvents([mockEventData, mockTimeEvent]);
    
    const event = eventManager.getEvent('time-event');
    expect(event).toBeDefined();
    expect(event?.id).toBe('time-event');
    
    const nonExistentEvent = eventManager.getEvent('non-existent');
    expect(nonExistentEvent).toBeUndefined();
  });

  test('should trigger event by ID', () => {
    eventManager.registerEvent(mockEventData);
    
    const activeEvent = eventManager.triggerEvent('test-event-1');
    expect(activeEvent).toBeDefined();
    expect(activeEvent?.data.id).toBe('test-event-1');
    expect(activeEvent?.resolved).toBe(false);
    
    // Verify the event is in active events
    const activeEvents = eventManager.getActiveEvents();
    expect(activeEvents.length).toBe(1);
    expect(activeEvents[0].data.id).toBe('test-event-1');
  });

  test('should not trigger non-existent event', () => {
    const activeEvent = eventManager.triggerEvent('non-existent');
    expect(activeEvent).toBeNull();
  });

  test('should resolve an active event', () => {
    // Register and trigger an event
    eventManager.registerEvent(mockEventData);
    eventManager.triggerEvent('test-event-1');
    
    // Resolve the event
    const resolvedEvent = eventManager.resolveEvent('test-event-1', 'choice-1');
    expect(resolvedEvent).toBeDefined();
    expect(resolvedEvent?.eventId).toBe('test-event-1');
    expect(resolvedEvent?.choiceId).toBe('choice-1');
    
    // Verify the event is no longer active
    const activeEvents = eventManager.getActiveEvents();
    expect(activeEvents.length).toBe(0);
    
    // Verify the event is in resolved events
    const resolvedEvents = eventManager.getResolvedEvents();
    expect(resolvedEvents.length).toBe(1);
    expect(resolvedEvents[0].eventId).toBe('test-event-1');
  });

  test('should not resolve non-existent event', () => {
    const resolvedEvent = eventManager.resolveEvent('non-existent', 'choice-1');
    expect(resolvedEvent).toBeNull();
  });

  test('should not resolve event with non-existent choice', () => {
    // Register and trigger an event
    eventManager.registerEvent(mockEventData);
    eventManager.triggerEvent('test-event-1');
    
    // Try to resolve with invalid choice
    const resolvedEvent = eventManager.resolveEvent('test-event-1', 'non-existent');
    expect(resolvedEvent).toBeNull();
  });

  test('should check for triggerable events based on conditions', () => {
    // Register events
    eventManager.registerEvents([mockEventData, mockConditionEvent]);
    
    // Make the condition true
    vi.mocked(mockGameState.getResourceValue).mockReturnValue(20); // ENERGY < 30
    
    // Check for events
    const events = eventManager.checkForEvents();
    expect(events.length).toBe(2);
    
    // The condition event should be first due to higher priority
    expect(events[0].id).toBe('condition-event');
  });

  test('should update and trigger new events', () => {
    // Register events
    eventManager.registerEvents([mockEventData, mockConditionEvent]);
    
    // Make the condition true
    vi.mocked(mockGameState.getResourceValue).mockReturnValue(20); // ENERGY < 30
    
    // Update
    const currentTime = new TimeValue();
    const result = eventManager.update(currentTime);
    
    // Should have triggered up to maxEventsPerUpdate events
    expect(result.triggered.length).toBeGreaterThan(0);
    expect(result.triggered[0].data.id).toBe('condition-event'); // Highest priority
  });

  test('should serialize and deserialize state', () => {
    // Register and trigger events
    eventManager.registerEvents([mockEventData, mockConditionEvent]);
    eventManager.triggerEvent('test-event-1');
    eventManager.resolveEvent('test-event-1', 'choice-1');
    eventManager.triggerEvent('condition-event');
    
    // Serialize
    const serialized = eventManager.serialize();
    
    // Create a new manager and deserialize
    const newManager = new EventManager(mockGameState, skillManager);
    newManager.registerEvents([mockEventData, mockConditionEvent]);
    newManager.deserialize(serialized);
    
    // Verify state was restored
    expect(newManager.getActiveEvents().length).toBe(1);
    expect(newManager.getActiveEvents()[0].data.id).toBe('condition-event');
    expect(newManager.getResolvedEvents().length).toBe(1);
    expect(newManager.getResolvedEvents()[0].eventId).toBe('test-event-1');
  });
});
