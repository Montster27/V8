// /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/models/Event.test.ts

import Event from '../../../domain/models/Event';
import { EventCategory, EventTriggerType } from '../../../domain/types/EventTypes';
import TimeValue from '../../../domain/valueObjects/TimeValue';

describe('Event', () => {
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
      {
        id: 'choice-2',
        text: 'Choice 2',
        effects: {
          narrative: 'You chose option 2.',
        },
        probability: 0.5,
        failText: 'Option 2 failed.',
      },
    ],
    repeatable: false,
    priority: 1,
  };

  test('should create an event with the correct properties', () => {
    const event = new Event(mockEventData);
    
    expect(event.id).toBe('test-event-1');
    expect(event.title).toBe('Test Event');
    expect(event.description).toBe('This is a test event');
    expect(event.category).toBe(EventCategory.DAILY);
    expect(event.isRepeatable).toBe(false);
    expect(event.priority).toBe(1);
    expect(event.isResolved).toBe(false);
  });

  test('should get a choice by ID', () => {
    const event = new Event(mockEventData);
    
    const choice = event.getChoiceById('choice-1');
    expect(choice).toBeDefined();
    expect(choice?.id).toBe('choice-1');
    expect(choice?.text).toBe('Choice 1');
    
    const nonExistentChoice = event.getChoiceById('non-existent');
    expect(nonExistentChoice).toBeUndefined();
  });

  test('should resolve an event with a choice', () => {
    const event = new Event(mockEventData);
    const timestamp = new TimeValue();
    
    // Resolve with the first choice
    const effects = event.resolve('choice-1', timestamp);
    
    expect(event.isResolved).toBe(true);
    expect(event.resolutionTime).toBe(timestamp);
    expect(event.resolvedChoiceId).toBe('choice-1');
    expect(effects.narrative).toBe('You chose option 1.');
    
    // Check the resolved event data
    const resolvedEvent = event.toResolvedEvent();
    expect(resolvedEvent).toBeDefined();
    expect(resolvedEvent?.eventId).toBe('test-event-1');
    expect(resolvedEvent?.choiceId).toBe('choice-1');
    expect(resolvedEvent?.timestamp).toBe(timestamp.toString());
    expect(resolvedEvent?.effects.narrative).toBe('You chose option 1.');
    expect(resolvedEvent?.successful).toBe(true);
  });

  test('should handle resolving with non-existent choice', () => {
    const event = new Event(mockEventData);
    const timestamp = new TimeValue();
    
    expect(() => {
      event.resolve('non-existent', timestamp);
    }).toThrow('Choice non-existent not found in event test-event-1');
  });

  test('should handle resolving an already resolved event', () => {
    const event = new Event(mockEventData);
    const timestamp = new TimeValue();
    
    // Resolve once
    event.resolve('choice-1', timestamp);
    
    // Try to resolve again
    expect(() => {
      event.resolve('choice-2', timestamp);
    }).toThrow('Event test-event-1 has already been resolved');
  });

  test('should handle success/failure for probability-based choices', () => {
    const event = new Event(mockEventData);
    const timestamp = new TimeValue();
    
    // Test successful resolution
    const successEffects = event.resolve('choice-2', timestamp, true);
    expect(successEffects.narrative).toBe('You chose option 2.');
    
    // Create a new event for failure test
    const event2 = new Event(mockEventData);
    
    // Test failed resolution
    const failEffects = event2.resolve('choice-2', timestamp, false);
    expect(failEffects.narrative).toBe('Option 2 failed.');
  });

  test('should serialize and deserialize correctly', () => {
    const event = new Event(mockEventData);
    const timestamp = new TimeValue();
    
    // Resolve the event to have some state
    event.resolve('choice-1', timestamp);
    
    // Serialize
    const serialized = event.serialize();
    
    // Deserialize
    const deserialized = Event.deserialize(serialized);
    
    // Check that the deserialized event matches the original
    expect(deserialized.id).toBe(event.id);
    expect(deserialized.title).toBe(event.title);
    expect(deserialized.isResolved).toBe(true);
    expect(deserialized.resolvedChoiceId).toBe('choice-1');
    expect(deserialized.resolutionTime?.toString()).toBe(timestamp.toString());
  });
});
