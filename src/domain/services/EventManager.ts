// /Users/montysharma/Documents/v8/MMV08/src/domain/services/EventManager.ts

import Event from '../models/Event';
import EventChoice from '../models/EventChoice';
import { 
  EventData, 
  EventTriggerType, 
  EventCondition, 
  ActiveEvent,
  ResolvedEvent,
  EventChoiceEffect
} from '../types/EventTypes';
import TimeValue from '../valueObjects/TimeValue';
import SkillManager from './SkillManager';
import { ResourceType } from '../types/ResourceTypes';

/**
 * Interface for game state access needed by the EventManager
 */
interface GameState {
  getSkillLevel: (skillId: string) => number;
  getResourceValue: (type: ResourceType | string) => number;
  hasResolvedEvent: (eventId: string) => boolean;
  getCurrentTime: () => TimeValue;
  getResolvedEvents: () => ResolvedEvent[];
  getActiveActivities: () => { id: string; }[];
}

/**
 * Event manager service for handling game events
 */
class EventManager {
  private events: Map<string, Event> = new Map();
  private activeEvents: Map<string, ActiveEvent> = new Map();
  private resolvedEvents: ResolvedEvent[] = [];
  private gameState: GameState;
  private skillManager: SkillManager;
  
  constructor(gameState: GameState, skillManager: SkillManager) {
    this.gameState = gameState;
    this.skillManager = skillManager;
  }

  /**
   * Register an event that can be triggered in the game
   * @param eventData The event data to register
   */
  registerEvent(eventData: EventData): void {
    const event = new Event(eventData);
    this.events.set(event.id, event);
  }

  /**
   * Register multiple events at once
   * @param eventDataList List of event data to register
   */
  registerEvents(eventDataList: EventData[]): void {
    eventDataList.forEach(eventData => this.registerEvent(eventData));
  }

  /**
   * Get an event by its ID
   * @param eventId The ID of the event to get
   * @returns The event, or undefined if not found
   */
  getEvent(eventId: string): Event | undefined {
    return this.events.get(eventId);
  }

  /**
   * Get all registered events
   * @returns All registered events
   */
  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  /**
   * Get all active events
   * @returns All active events
   */
  getActiveEvents(): ActiveEvent[] {
    return Array.from(this.activeEvents.values());
  }

  /**
   * Get a specific active event by ID
   * @param eventId The ID of the active event to get
   * @returns The active event, or undefined if not found
   */
  getActiveEvent(eventId: string): ActiveEvent | undefined {
    return this.activeEvents.get(eventId);
  }

  /**
   * Get all resolved events
   * @returns All resolved events
   */
  getResolvedEvents(): ResolvedEvent[] {
    return this.resolvedEvents;
  }

  /**
   * Check if an event can be triggered based on its conditions
   * @param event The event to check
   * @returns Whether the event can be triggered
   */
  canTriggerEvent(event: Event): boolean {
    return event.canTrigger(this.evaluateCondition.bind(this));
  }

  /**
   * Evaluate a condition against the current game state
   * @param condition The condition to evaluate
   * @returns Whether the condition is met
   */
  private evaluateCondition(condition: EventCondition): boolean {
    const { type, target, operator, value } = condition;

    // Use custom check function if provided
    if (condition.customCheck) {
      return condition.customCheck();
    }

    // Handle different condition types
    switch (type) {
      case 'skill':
        if (!target) return false;
        return this.compareValues(this.gameState.getSkillLevel(target), operator, value as number);

      case 'resource':
        if (!target) return false;
        return this.compareValues(this.gameState.getResourceValue(target), operator, value as number);

      case 'time':
        const currentTime = this.gameState.getCurrentTime();
        if (operator === '==') {
          // Handle exact time match (e.g., specific date/time)
          return currentTime.toString() === value;
        } else {
          // Handle relative time comparisons
          const compareTime = TimeValue.fromString(value as string);
          return this.compareValues(currentTime.getTime(), operator, compareTime.getTime());
        }

      case 'event':
        if (!target) return false;
        // Check if the event has been resolved
        const resolved = this.gameState.hasResolvedEvent(target);
        return operator === '==' ? resolved === (value as boolean) : resolved !== (value as boolean);

      case 'activity':
        if (!target) return false;
        // Check if the activity is active
        const isActive = this.gameState.getActiveActivities().some(a => a.id === target);
        return operator === '==' ? isActive === (value as boolean) : isActive !== (value as boolean);

      default:
        return false;
    }
  }

  /**
   * Compare two values using the specified operator
   * @param a The first value
   * @param operator The operator to use
   * @param b The second value
   * @returns The result of the comparison
   */
  private compareValues(a: number | string | boolean, operator: string, b: number | string | boolean): boolean {
    switch (operator) {
      case '>': return a > b;
      case '<': return a < b;
      case '>=': return a >= b;
      case '<=': return a <= b;
      case '==': return a === b;
      case '!=': return a !== b;
      default: return false;
    }
  }

  /**
   * Check for potential events that can be triggered
   * @returns Array of events that can be triggered
   */
  checkForEvents(): Event[] {
    const triggerable: Event[] = [];
    
    // Check each registered event
    this.events.forEach(event => {
      // Skip events that are already active
      if (this.activeEvents.has(event.id)) {
        return;
      }

      // Skip events that are not repeatable and have already been resolved
      if (!event.isRepeatable && this.gameState.hasResolvedEvent(event.id)) {
        return;
      }

      // Check if the event can be triggered based on its trigger type and conditions
      const trigger = event.trigger;
      let canTrigger = false;

      switch (trigger.type) {
        case EventTriggerType.TIME:
          // Time-based triggers are checked against the current game time
          canTrigger = this.canTriggerEvent(event);
          break;

        case EventTriggerType.CONDITION:
          // Condition-based triggers are checked against the game state
          canTrigger = this.canTriggerEvent(event);
          break;

        case EventTriggerType.ACTIVITY:
          // Activity-based triggers are checked against active activities
          canTrigger = this.canTriggerEvent(event);
          break;

        case EventTriggerType.RANDOM:
          // Random triggers have a probability of occurring
          const probability = event.trigger.conditions?.[0]?.value as number ?? 0;
          canTrigger = Math.random() < probability;
          break;

        case EventTriggerType.SCHEDULED:
          // Scheduled events are explicitly triggered
          canTrigger = false; // These are triggered manually
          break;

        default:
          canTrigger = false;
      }

      if (canTrigger) {
        triggerable.push(event);
      }
    });

    // Sort by priority
    return triggerable.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Trigger a specific event by ID
   * @param eventId The ID of the event to trigger
   * @returns The active event, or null if the event cannot be triggered
   */
  triggerEvent(eventId: string): ActiveEvent | null {
    const event = this.events.get(eventId);
    if (!event) {
      return null;
    }

    // Check if the event is already active
    if (this.activeEvents.has(eventId)) {
      return this.activeEvents.get(eventId) || null;
    }

    // Check if the event is repeatable or hasn't been resolved
    if (!event.isRepeatable && this.gameState.hasResolvedEvent(eventId)) {
      return null;
    }

    // Create an active event
    const currentTime = this.gameState.getCurrentTime();
    let endTime: string | undefined;

    // Calculate end time if there's a time limit
    if (event.timeLimit) {
      const timeLimit = event.timeLimit;
      const limitMs = this.parseTimeLimit(timeLimit);
      const endTimeValue = new TimeValue(currentTime.getTime() + limitMs);
      endTime = endTimeValue.toString();
    }

    const activeEvent: ActiveEvent = {
      data: event.serialize().data,
      startTime: currentTime.toString(),
      endTime,
      resolved: false
    };

    // Add to active events
    this.activeEvents.set(eventId, activeEvent);
    return activeEvent;
  }

  /**
   * Trigger the highest priority event from checkForEvents()
   * @returns The active event, or null if no events can be triggered
   */
  triggerNextEvent(): ActiveEvent | null {
    const events = this.checkForEvents();
    if (events.length === 0) {
      return null;
    }

    return this.triggerEvent(events[0].id);
  }

  /**
   * Resolve an active event with a player choice
   * @param eventId The ID of the event to resolve
   * @param choiceId The ID of the choice selected
   * @returns The resolved event, or null if the event cannot be resolved
   */
  resolveEvent(eventId: string, choiceId: string): ResolvedEvent | null {
    // Check if the event is active
    const activeEvent = this.activeEvents.get(eventId);
    if (!activeEvent || activeEvent.resolved) {
      return null;
    }

    // Get the event and choice
    const event = this.events.get(eventId);
    if (!event) {
      return null;
    }

    const choice = event.getChoiceById(choiceId);
    if (!choice) {
      return null;
    }

    // Check if the player meets all requirements for this choice
    const eventChoice = new EventChoice(choice);
    const meetsRequirements = eventChoice.meetsAllRequirements(
      (skillId) => this.gameState.getSkillLevel(skillId),
      (type) => this.gameState.getResourceValue(type as ResourceType),
      (eventId) => this.gameState.hasResolvedEvent(eventId)
    );

    if (!meetsRequirements) {
      return null;
    }

    // Determine if the choice is successful based on probability
    const isSuccessful = eventChoice.attemptChoice();

    // Resolve the event
    const currentTime = this.gameState.getCurrentTime();
    const effects = event.resolve(choiceId, currentTime, isSuccessful);
    const resolvedEvent = event.toResolvedEvent();

    if (!resolvedEvent) {
      return null;
    }

    // Apply effects
    this.applyEventEffects(effects, isSuccessful);

    // Mark the active event as resolved
    activeEvent.resolved = true;
    activeEvent.resolution = resolvedEvent;

    // Add to resolved events
    this.resolvedEvents.push(resolvedEvent);

    // Remove from active events
    this.activeEvents.delete(eventId);

    return resolvedEvent;
  }

  /**
   * Apply the effects of an event choice
   * @param effects The effects to apply
   * @param successful Whether the choice was successful
   */
  private applyEventEffects(effects: EventChoiceEffect, successful: boolean): void {
    // This would be implemented to apply resource/skill effects,
    // trigger follow-up events, etc.
    // The implementation would depend on how effects are managed in the game
    
    // In a full implementation, this would:
    // 1. Apply resource changes
    // 2. Apply skill XP changes
    // 3. Trigger any follow-up events
    // 4. Unlock/lock activities
    // 5. Unlock skills
    // 6. Apply time skips
  }

  /**
   * Parse a time limit string into milliseconds
   * @param timeLimit The time limit string (e.g., "PT1H" for 1 hour)
   * @returns The time limit in milliseconds
   */
  private parseTimeLimit(timeLimit: string): number {
    // Simple implementation - in a real project, use a proper duration parser
    // This assumes the format is "PT<number><unit>" where unit is H (hours), M (minutes), or S (seconds)
    const match = timeLimit.match(/PT(\d+)([HMS])/);
    if (!match) {
      return 0;
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 'H': return numValue * 60 * 60 * 1000; // hours to ms
      case 'M': return numValue * 60 * 1000; // minutes to ms
      case 'S': return numValue * 1000; // seconds to ms
      default: return 0;
    }
  }

  /**
   * Check and auto-resolve any events with expired time limits
   * @param currentTime The current game time
   * @returns Array of auto-resolved events
   */
  checkTimeouts(currentTime: TimeValue): ResolvedEvent[] {
    const autoResolved: ResolvedEvent[] = [];
    
    this.activeEvents.forEach((activeEvent, eventId) => {
      // Skip already resolved events
      if (activeEvent.resolved) {
        return;
      }

      // Check if the event has a time limit and it has expired
      if (activeEvent.endTime) {
        const endTime = TimeValue.fromString(activeEvent.endTime);
        if (currentTime.getTime() >= endTime.getTime()) {
          const event = this.events.get(eventId);
          if (event && event.autoResolveChoice) {
            // Auto-resolve with the default choice
            const resolvedEvent = this.resolveEvent(eventId, event.autoResolveChoice);
            if (resolvedEvent) {
              autoResolved.push(resolvedEvent);
            }
          }
        }
      }
    });

    return autoResolved;
  }

  /**
   * Update the event manager for a new game tick
   * @param currentTime The current game time
   * @returns Newly triggered events
   */
  update(currentTime: TimeValue): {
    triggered: ActiveEvent[];
    autoResolved: ResolvedEvent[];
  } {
    // Check for timed-out events first
    const autoResolved = this.checkTimeouts(currentTime);

    // Check for new events to trigger
    const triggerable = this.checkForEvents();
    const triggered: ActiveEvent[] = [];

    // Trigger the highest priority events (limit to a reasonable number per update)
    const maxEventsPerUpdate = 3;
    for (let i = 0; i < Math.min(triggerable.length, maxEventsPerUpdate); i++) {
      const activeEvent = this.triggerEvent(triggerable[i].id);
      if (activeEvent) {
        triggered.push(activeEvent);
      }
    }

    return { triggered, autoResolved };
  }

  /**
   * Creates a serializable state for persistence
   */
  serialize() {
    return {
      activeEvents: Array.from(this.activeEvents.entries()).map(([id, event]) => ({
        id,
        ...event
      })),
      resolvedEvents: this.resolvedEvents
    };
  }

  /**
   * Restore state from serialized data
   * @param serialized The serialized state
   */
  deserialize(serialized: {
    activeEvents: Array<{ id: string } & ActiveEvent>;
    resolvedEvents: ResolvedEvent[];
  }) {
    // Clear current state
    this.activeEvents.clear();
    this.resolvedEvents = [];

    // Restore active events
    serialized.activeEvents.forEach(event => {
      const { id, ...activeEvent } = event;
      this.activeEvents.set(id, activeEvent);
    });

    // Restore resolved events
    this.resolvedEvents = serialized.resolvedEvents;
  }
}

export default EventManager;