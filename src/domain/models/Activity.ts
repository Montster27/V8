// /Users/montysharma/Documents/v8/MMV08/src/domain/models/Activity.ts

import { 
  ActivityCategory, 
  ActivityDuration, 
  ActivityRequirement, 
  ActivityRepeatability, 
  ActivityLocation,
  ResourceEffect,
  ActivityUnlock,
  ACTIVITY_DURATION_MINUTES
} from '../types/ActivityTypes';

/**
 * Activity interface representing an action that a player can take in the game
 */
export interface IActivity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  duration: ActivityDuration | number; // Either predefined duration or minutes
  effects: ResourceEffect[]; // Effects on player resources
  requirements?: ActivityRequirement[]; // Requirements to perform the activity
  unlocks?: ActivityUnlock[]; // What might be unlocked by performing this activity
  repeatability: ActivityRepeatability;
  cooldownMinutes?: number; // For COOLDOWN repeatability
  location: ActivityLocation;
  isStoryActivity?: boolean; // Whether this activity is part of the main story
  image?: string; // Optional path to an image representing the activity
  tags?: string[]; // Optional tags for filtering and organization
}

/**
 * Scheduled activity instance with start/end times
 */
export interface ScheduledActivity {
  activityId: string;
  startTime: number; // Unix timestamp in milliseconds
  endTime: number; // Unix timestamp in milliseconds
  isCompleted: boolean;
  effects?: ResourceEffect[]; // Actual effects (may have randomization applied)
  unlockedItems?: ActivityUnlock[]; // What was unlocked by this instance
}

/**
 * ActivityManager class for scheduling and executing activities
 */
export class Activity {
  private _data: IActivity;
  
  /**
   * Create a new Activity
   */
  constructor(data: IActivity) {
    this._data = {
      ...data,
      // Ensure we have all required fields
      effects: data.effects || [],
      requirements: data.requirements || [],
      unlocks: data.unlocks || [],
      isStoryActivity: data.isStoryActivity || false,
      tags: data.tags || []
    };
  }
  
  /**
   * Get the activity ID
   */
  get id(): string {
    return this._data.id;
  }
  
  /**
   * Get the activity name
   */
  get name(): string {
    return this._data.name;
  }
  
  /**
   * Get the activity description
   */
  get description(): string {
    return this._data.description;
  }
  
  /**
   * Get the activity category
   */
  get category(): ActivityCategory {
    return this._data.category;
  }
  
  /**
   * Get the activity duration in minutes
   */
  get durationMinutes(): number {
    // Handle both enum and direct minute specification
    if (typeof this._data.duration === 'number') {
      return this._data.duration;
    }
    
    // Look up duration from enum mapping
    return ACTIVITY_DURATION_MINUTES[this._data.duration];
  }
  
  /**
   * Get the activity requirements
   */
  get requirements(): ActivityRequirement[] {
    return [...this._data.requirements || []];
  }
  
  /**
   * Get the activity effects
   */
  get effects(): ResourceEffect[] {
    return [...this._data.effects];
  }
  
  /**
   * Get the activity unlocks
   */
  get unlocks(): ActivityUnlock[] {
    return [...this._data.unlocks || []];
  }
  
  /**
   * Get the activity repeatability
   */
  get repeatability(): ActivityRepeatability {
    return this._data.repeatability;
  }
  
  /**
   * Get the activity cooldown in minutes
   */
  get cooldownMinutes(): number {
    return this._data.cooldownMinutes || 0;
  }
  
  /**
   * Get the activity location
   */
  get location(): ActivityLocation {
    return { ...this._data.location };
  }
  
  /**
   * Check if this is a story activity
   */
  get isStoryActivity(): boolean {
    return this._data.isStoryActivity || false;
  }
  
  /**
   * Get the activity tags
   */
  get tags(): string[] {
    return [...(this._data.tags || [])];
  }
  
  /**
   * Get the raw activity data
   */
  get data(): IActivity {
    return { ...this._data };
  }
  
  /**
   * Calculate end time based on start time and duration
   */
  calculateEndTime(startTime: number): number {
    return startTime + (this.durationMinutes * 60 * 1000);
  }
  
  /**
   * Check if the activity can be performed based on its requirements
   * @param gameState Current game state to check against requirements
   */
  canPerform(gameState: any): { canPerform: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    // This is a placeholder - full implementation would check against game state
    // For each requirement, check if it's met
    for (const req of this.requirements) {
      // In a full implementation, we would check each requirement type
      // against the appropriate part of the game state
      reasons.push(`Placeholder: Not checking ${req.type} requirement: ${req.description}`);
    }
    
    return {
      canPerform: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Serialize to JSON
   */
  toJSON(): IActivity {
    return { ...this._data };
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(json: IActivity): Activity {
    return new Activity(json);
  }
  
  /**
   * Create a scheduled instance of this activity
   */
  schedule(startTime: number): ScheduledActivity {
    return {
      activityId: this.id,
      startTime,
      endTime: this.calculateEndTime(startTime),
      isCompleted: false,
      // Apply any randomization to effects here if needed
      effects: this.effects.map(effect => ({ ...effect }))
    };
  }
}
