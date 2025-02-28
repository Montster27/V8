// /Users/montysharma/Documents/v8/MMV08/src/domain/models/EventChoice.ts

import { EventChoice as IEventChoice, EventChoiceEffect } from '../types/EventTypes';

/**
 * Class representing a choice in an event
 */
class EventChoice {
  private readonly data: IEventChoice;
  
  constructor(choiceData: IEventChoice) {
    this.data = choiceData;
  }

  /**
   * Get the unique ID of this choice
   */
  get id(): string {
    return this.data.id;
  }

  /**
   * Get the text of this choice shown to the player
   */
  get text(): string {
    return this.data.text;
  }

  /**
   * Get the effects applied when this choice is selected
   */
  get effects(): EventChoiceEffect {
    return this.data.effects;
  }

  /**
   * Get the text shown on failure, if applicable
   */
  get failText(): string | undefined {
    return this.data.failText;
  }

  /**
   * Get the effects applied on failure, if applicable
   */
  get failEffects(): EventChoiceEffect | undefined {
    return this.data.failEffects;
  }

  /**
   * Get the probability of success for this choice (0-1)
   */
  get successProbability(): number {
    return this.data.probability ?? 1.0; // Default to 100% if not specified
  }

  /**
   * Check if this choice requires specific skills
   */
  get hasSkillRequirements(): boolean {
    return !!this.data.requiredSkills && this.data.requiredSkills.length > 0;
  }

  /**
   * Get the required skills for this choice
   */
  get requiredSkills(): { id: string; level: number }[] {
    return this.data.requiredSkills || [];
  }

  /**
   * Check if this choice requires specific resources
   */
  get hasResourceRequirements(): boolean {
    return !!this.data.requiredResources && this.data.requiredResources.length > 0;
  }

  /**
   * Get the required resources for this choice
   */
  get requiredResources(): { type: string; value: number }[] {
    return this.data.requiredResources || [];
  }

  /**
   * Check if this choice requires specific previous events
   */
  get hasEventRequirements(): boolean {
    return !!this.data.requiredEvents && this.data.requiredEvents.length > 0;
  }

  /**
   * Get the required previous events for this choice
   */
  get requiredEvents(): string[] {
    return this.data.requiredEvents || [];
  }

  /**
   * Check if the player meets the skill requirements for this choice
   * @param getSkillLevel Function to get the player's level in a skill
   * @returns Whether all skill requirements are met
   */
  meetsSkillRequirements(getSkillLevel: (skillId: string) => number): boolean {
    if (!this.hasSkillRequirements) {
      return true;
    }

    return this.requiredSkills.every(req => getSkillLevel(req.id) >= req.level);
  }

  /**
   * Check if the player meets the resource requirements for this choice
   * @param getResourceValue Function to get the player's value of a resource
   * @returns Whether all resource requirements are met
   */
  meetsResourceRequirements(getResourceValue: (type: string) => number): boolean {
    if (!this.hasResourceRequirements) {
      return true;
    }

    return this.requiredResources.every(req => getResourceValue(req.type) >= req.value);
  }

  /**
   * Check if the player meets the event requirements for this choice
   * @param hasResolvedEvent Function to check if the player has resolved an event
   * @returns Whether all event requirements are met
   */
  meetsEventRequirements(hasResolvedEvent: (eventId: string) => boolean): boolean {
    if (!this.hasEventRequirements) {
      return true;
    }

    return this.requiredEvents.every(eventId => hasResolvedEvent(eventId));
  }

  /**
   * Check if the player meets all requirements for this choice
   * @param getSkillLevel Function to get the player's level in a skill
   * @param getResourceValue Function to get the player's value of a resource
   * @param hasResolvedEvent Function to check if the player has resolved an event
   * @returns Whether all requirements are met
   */
  meetsAllRequirements(
    getSkillLevel: (skillId: string) => number,
    getResourceValue: (type: string) => number,
    hasResolvedEvent: (eventId: string) => boolean
  ): boolean {
    return (
      this.meetsSkillRequirements(getSkillLevel) &&
      this.meetsResourceRequirements(getResourceValue) &&
      this.meetsEventRequirements(hasResolvedEvent)
    );
  }

  /**
   * Determine if a choice attempt is successful based on its probability
   * @returns Whether the attempt is successful
   */
  attemptChoice(): boolean {
    if (this.successProbability >= 1.0) {
      return true;
    }
    
    return Math.random() < this.successProbability;
  }

  /**
   * Creates a serializable version of the choice for state persistence
   */
  serialize() {
    return this.data;
  }

  /**
   * Creates an EventChoice instance from serialized data
   * @param serialized The serialized choice data
   * @returns A new EventChoice instance
   */
  static deserialize(serialized: IEventChoice): EventChoice {
    return new EventChoice(serialized);
  }
}

export default EventChoice;