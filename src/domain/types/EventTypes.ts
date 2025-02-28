// /Users/montysharma/Documents/v8/MMV08/src/domain/types/EventTypes.ts

import { ResourceEffect } from './ResourceTypes';
import { SkillEffect } from '../SkillTypes';

/**
 * Enum for different event categories in the game
 */
export enum EventCategory {
  DAILY = 'daily',             // Routine events that occur regularly
  PIVOTAL = 'pivotal',         // Major events that significantly alter narrative
  MYSTERY = 'mystery',         // Events related to the core mystery plot
  ACADEMIC = 'academic',       // Events related to studies and classes
  SOCIAL = 'social',           // Events related to relationships and socializing
  FINANCIAL = 'financial',     // Events related to money and resources
  HEALTH = 'health',           // Events related to physical wellbeing
  SPECIAL = 'special',         // One-time or rare special events
}

/**
 * Enum for possible event trigger types
 */
export enum EventTriggerType {
  TIME = 'time',               // Triggered at specific game time
  CONDITION = 'condition',     // Triggered when specific conditions are met
  ACTIVITY = 'activity',       // Triggered by performing an activity
  CHOICE = 'choice',           // Triggered by a choice in another event
  SKILL = 'skill',             // Triggered by reaching skill thresholds
  RESOURCE = 'resource',       // Triggered by resource levels
  RANDOM = 'random',           // Randomly triggered events
  SCHEDULED = 'scheduled',     // Explicitly scheduled events
}

/**
 * Interface for condition-based triggers
 */
export interface EventCondition {
  type: 'skill' | 'resource' | 'time' | 'event' | 'activity' | 'custom';
  target?: string;             // Skill ID, resource type, event ID, etc.
  operator: '>' | '<' | '==' | '>=' | '<=' | '!=';
  value: number | string | boolean;
  customCheck?: () => boolean; // For complex conditions that need custom logic
}

/**
 * Interface for event triggers
 */
export interface EventTrigger {
  type: EventTriggerType;
  conditions?: EventCondition[]; // Multiple conditions can be required (AND logic)
  probability?: number;       // For random events (0-1)
  timeValue?: string;         // For time-based triggers (ISO string)
  activityId?: string;        // For activity-based triggers
  sourceEventId?: string;     // For choice-based triggers
  sourceChoiceId?: string;    // For choice-based triggers
}

/**
 * Interface for event choice effects
 */
export interface EventChoiceEffect {
  resourceEffects?: ResourceEffect[];
  skillEffects?: SkillEffect[];
  triggerEvents?: string[];      // IDs of events to trigger
  narrative?: string;            // Narrative text describing effect
  unlockActivities?: string[];   // IDs of activities to unlock
  lockActivities?: string[];     // IDs of activities to lock
  unlockSkills?: string[];       // IDs of skills to unlock
  timeSkip?: string;             // Amount of time to skip (ISO duration)
}

/**
 * Interface for event choices
 */
export interface EventChoice {
  id: string;                  // Unique identifier
  text: string;                // Choice text shown to player
  effects: EventChoiceEffect;  // Effects of making this choice
  requiredSkills?: {          // Skills required to see this choice
    id: string;
    level: number;
  }[];
  requiredResources?: {       // Resources required to see this choice
    type: string;
    value: number;
  }[];
  requiredEvents?: string[];   // Previous events required to see this choice
  probability?: number;        // Chance of success if choice is attempted (0-1)
  failText?: string;           // Text shown on failure
  failEffects?: EventChoiceEffect; // Effects applied on failure
}

/**
 * Interface for event data
 */
export interface EventData {
  id: string;                  // Unique identifier
  title: string;               // Event title
  description: string;         // Event description text
  category: EventCategory;     // Event category
  trigger: EventTrigger;       // How the event is triggered
  choices: EventChoice[];      // Available choices
  repeatable: boolean;         // Can this event happen multiple times?
  priority: number;            // Events with higher priority take precedence
  image?: string;              // Optional image path
  background?: string;         // Optional background color/image
  timeLimit?: string;          // Optional time limit for decision (ISO duration)
  autoResolveChoice?: string;  // ID of choice to auto-select if time limit expires
}

/**
 * Interface for resolved event records
 */
export interface ResolvedEvent {
  eventId: string;             // Event ID
  timestamp: string;           // When the event occurred (ISO string)
  choiceId: string;            // ID of choice made
  effects: EventChoiceEffect;  // Effects that were applied
  successful: boolean;         // Was the choice successful?
}

/**
 * Interface for active event with state
 */
export interface ActiveEvent {
  data: EventData;             // The event data
  startTime: string;           // When the event became active (ISO string)
  endTime?: string;            // When the event will auto-resolve (if time limited)
  resolved: boolean;           // Has the event been resolved?
  resolution?: ResolvedEvent;  // Resolution data if resolved
}
