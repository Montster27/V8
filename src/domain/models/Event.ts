// /Users/montysharma/Documents/v8/MMV08/src/domain/models/Event.ts

import { 
  EventData, 
  EventChoice, 
  EventChoiceEffect,
  ResolvedEvent,
  EventTriggerType,
  EventCondition
} from '../types/EventTypes';
import TimeValue from '../valueObjects/TimeValue';

/**
 * Event class representing game events with choices and effects
 */
class Event {
  private readonly data: EventData;
  private resolvedTimestamp: TimeValue | null = null;
  private selectedChoiceId: string | null = null;
  private successful: boolean = true;
  
  constructor(eventData: EventData) {
    this.data = eventData;
  }

  /**
   * Get the unique ID of this event
   */
  get id(): string {
    return this.data.id;
  }

  /**
   * Get the title of this event
   */
  get title(): string {
    return this.data.title;
  }

  /**
   * Get the description of this event
   */
  get description(): string {
    return this.data.description;
  }

  /**
   * Get the category of this event
   */
  get category(): string {
    return this.data.category;
  }

  /**
   * Get the available choices for this event
   */
  get choices(): EventChoice[] {
    return this.data.choices;
  }

  /**
   * Get the priority of this event
   */
  get priority(): number {
    return this.data.priority;
  }

  /**
   * Check if this event is repeatable
   */
  get isRepeatable(): boolean {
    return this.data.repeatable;
  }

  /**
   * Get the trigger for this event
   */
  get trigger(): { type: EventTriggerType; conditions?: EventCondition[] } {
    return {
      type: this.data.trigger.type,
      conditions: this.data.trigger.conditions
    };
  }

  /**
   * Get the time limit for this event, if any
   */
  get timeLimit(): string | undefined {
    return this.data.timeLimit;
  }

  /**
   * Check if this event has been resolved
   */
  get isResolved(): boolean {
    return this.resolvedTimestamp !== null;
  }

  /**
   * Get the timestamp when this event was resolved
   */
  get resolutionTime(): TimeValue | null {
    return this.resolvedTimestamp;
  }

  /**
   * Get the ID of the choice that was selected to resolve this event
   */
  get resolvedChoiceId(): string | null {
    return this.selectedChoiceId;
  }

  /**
   * Get the auto-resolve choice ID if time limit expires
   */
  get autoResolveChoice(): string | undefined {
    return this.data.autoResolveChoice;
  }

  /**
   * Get the choice object by ID
   */
  getChoiceById(choiceId: string): EventChoice | undefined {
    return this.data.choices.find(choice => choice.id === choiceId);
  }

  /**
   * Resolves the event with the selected choice
   * @param choiceId The ID of the selected choice
   * @param timestamp The time when the choice was made
   * @param success Whether the choice was successful (for probability-based choices)
   * @returns The effects of the choice
   */
  resolve(choiceId: string, timestamp: TimeValue, success: boolean = true): EventChoiceEffect {
    if (this.isResolved) {
      throw new Error(`Event ${this.id} has already been resolved`);
    }

    const choice = this.getChoiceById(choiceId);
    if (!choice) {
      throw new Error(`Choice ${choiceId} not found in event ${this.id}`);
    }

    this.resolvedTimestamp = timestamp;
    this.selectedChoiceId = choiceId;
    this.successful = success;

    // Return appropriate effects based on success/failure
    return success ? choice.effects : (choice.failEffects || { narrative: choice.failText || 'Your attempt failed.' });
  }

  /**
   * Creates a resolved event record for persistence
   * @returns The resolved event data
   */
  toResolvedEvent(): ResolvedEvent | null {
    if (!this.isResolved || !this.selectedChoiceId || !this.resolvedTimestamp) {
      return null;
    }

    const choice = this.getChoiceById(this.selectedChoiceId);
    if (!choice) {
      return null;
    }

    return {
      eventId: this.id,
      timestamp: this.resolvedTimestamp.toString(),
      choiceId: this.selectedChoiceId,
      effects: this.successful ? choice.effects : (choice.failEffects || { narrative: choice.failText || 'Your attempt failed.' }),
      successful: this.successful
    };
  }

  /**
   * Check if the event can be triggered based on its conditions
   * This is a simplified check - the actual implementation would need to
   * evaluate complex conditions against the game state
   * @param checkCondition Function to evaluate a condition against game state
   * @returns Whether the event can be triggered
   */
  canTrigger(checkCondition: (condition: EventCondition) => boolean): boolean {
    // If there are no conditions, the event can be triggered
    if (!this.data.trigger.conditions || this.data.trigger.conditions.length === 0) {
      return true;
    }

    // All conditions must be met (AND logic)
    return this.data.trigger.conditions.every(condition => checkCondition(condition));
  }

  /**
   * Creates a serializable version of the event for state persistence
   */
  serialize() {
    return {
      data: this.data,
      resolvedTimestamp: this.resolvedTimestamp?.toString(),
      selectedChoiceId: this.selectedChoiceId,
      successful: this.successful
    };
  }

  /**
   * Creates an Event instance from serialized data
   * @param serialized The serialized event data
   * @returns A new Event instance
   */
  static deserialize(serialized: {
    data: EventData;
    resolvedTimestamp?: string | null;
    selectedChoiceId?: string | null;
    successful?: boolean;
  }): Event {
    const event = new Event(serialized.data);
    
    if (serialized.resolvedTimestamp) {
      event.resolvedTimestamp = TimeValue.fromString(serialized.resolvedTimestamp);
    }
    
    event.selectedChoiceId = serialized.selectedChoiceId || null;
    event.successful = serialized.successful ?? true;
    
    return event;
  }
}

export default Event;