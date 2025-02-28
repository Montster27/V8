// /Users/montysharma/Documents/v8/MMV08/src/domain/types/ActivityTypes.ts

import { ResourceType } from './ResourceTypes';

/**
 * Enum of activity categories available in the game
 */
export enum ActivityCategory {
  ACADEMIC = 'academic',
  SOCIAL = 'social',
  WORK = 'work',
  LEISURE = 'leisure',
  HEALTH = 'health',
  REST = 'rest',
  SPECIAL = 'special' // For story-related or unique activities
}

/**
 * Enum of activity durations
 */
export enum ActivityDuration {
  VERY_SHORT = 'very_short', // ~15 minutes
  SHORT = 'short',          // ~30 minutes
  MEDIUM = 'medium',        // ~1 hour
  LONG = 'long',            // ~2 hours
  VERY_LONG = 'very_long',  // ~4+ hours
  VARIABLE = 'variable'     // Duration depends on player's choice
}

/**
 * Mapping of ActivityDuration to minutes
 */
export const ACTIVITY_DURATION_MINUTES: Record<ActivityDuration, number> = {
  [ActivityDuration.VERY_SHORT]: 15,
  [ActivityDuration.SHORT]: 30,
  [ActivityDuration.MEDIUM]: 60,
  [ActivityDuration.LONG]: 120,
  [ActivityDuration.VERY_LONG]: 240,
  [ActivityDuration.VARIABLE]: 0, // Must be set dynamically
};

/**
 * Resource effect - how an activity affects a resource
 */
export interface ResourceEffect {
  resourceType: ResourceType;
  amount: number; // Positive for increase, negative for decrease
  isDeterministic?: boolean; // If false, the amount will have some randomness
  description?: string; // Optional description of the effect
}

/**
 * Activity requirements - conditions that must be met to perform an activity
 */
export interface ActivityRequirement {
  type: 'resource' | 'skill' | 'item' | 'relationship' | 'time';
  resourceType?: ResourceType; // For resource requirements
  skillType?: string; // For skill requirements
  itemId?: string; // For item requirements
  relationshipId?: string; // For relationship requirements
  timeRange?: { start: number; end: number }; // For time-of-day requirements
  minValue?: number; // Minimum value needed (for resources/skills)
  description: string; // Human-readable description of the requirement
}

/**
 * Activity unlocks - what performing an activity might unlock
 */
export interface ActivityUnlock {
  type: 'activity' | 'item' | 'skill' | 'location' | 'relationship' | 'event';
  id: string; // ID of the unlocked entity
  description: string; // Human-readable description of the unlock
  chance?: number; // Probability (0-1) of the unlock occurring
}

/**
 * Repeatable behavior types for activities
 */
export enum ActivityRepeatability {
  ONCE = 'once', // Can only be done once ever
  ONCE_PER_DAY = 'once_per_day',
  UNLIMITED = 'unlimited',
  COOLDOWN = 'cooldown' // Requires a cooldown period between repeats
}

/**
 * Activity location types
 */
export enum ActivityLocationType {
  DORM = 'dorm',
  CAMPUS = 'campus',
  TOWN = 'town',
  SPECIAL = 'special'
}

/**
 * Type for storing location-specific information
 */
export interface ActivityLocation {
  type: ActivityLocationType;
  name: string;
  id: string;
  description?: string;
}
