// /Users/montysharma/Documents/v8/MMV08/src/application/services/GameLoopService.ts

import { TimeManager } from '../../domain/services/TimeManager';
import EventManager from '../../domain/services/EventManager';
import { SkillManager } from '../../domain/services/SkillManager';
import { ActivityManager } from '../../domain/services/ActivityManager';
import { AppDispatch } from '../../infrastructure/state/store';
import { tick as tickTimeAction } from '../../infrastructure/state/slices/timeSlice';
import { ResourceType } from '../../domain/ResourceTypes';
import { 
  addResource, 
  subtractResource 
} from '../../infrastructure/state/resourcesSlice';
import { TimeValue } from '../../domain/valueObjects/TimeValue';
import { addCompletedActivities } from '../../infrastructure/state/slices/activitiesSlice';
import { ScheduledActivity } from '../../domain/models/Activity';

/**
 * Configuration options for the GameLoopService
 */
export interface GameLoopConfig {
  tickIntervalMs: number;
  resourceUpdateInterval: number; // How many ticks between resource updates
}

/**
 * Service responsible for managing the main game loop
 * Coordinates time progression, resource changes, event triggering, and other game systems
 */
export class GameLoopService {
  private timeManager: TimeManager;
  private eventManager: EventManager;
  private skillManager: SkillManager;
  private activityManager: ActivityManager;
  private dispatch: AppDispatch;
  private config: GameLoopConfig;
  private tickInterval: number | null = null;
  private tickCount: number = 0;
  
  /**
   * Create a new GameLoopService
   * @param timeManager The TimeManager instance
   * @param eventManager The EventManager instance
   * @param skillManager The SkillManager instance
   * @param activityManager The ActivityManager instance
   * @param dispatch Redux dispatch function
   * @param config Configuration options
   */
  constructor(
    timeManager: TimeManager,
    eventManager: EventManager,
    skillManager: SkillManager,
    activityManager: ActivityManager,
    dispatch: AppDispatch,
    config: GameLoopConfig = {
      tickIntervalMs: 1000, // Default to 1 second ticks
      resourceUpdateInterval: 5, // Update resources every 5 ticks
    }
  ) {
    this.timeManager = timeManager;
    this.eventManager = eventManager;
    this.skillManager = skillManager;
    this.activityManager = activityManager;
    this.dispatch = dispatch;
    this.config = config;
  }
  
  /**
   * Start the game loop
   */
  start(): void {
    if (this.tickInterval !== null) {
      return; // Already running
    }
    
    this.timeManager.start();
    
    // Start the tick interval
    this.tickInterval = window.setInterval(() => {
      this.processTick();
    }, this.config.tickIntervalMs);
  }
  
  /**
   * Stop the game loop
   */
  stop(): void {
    if (this.tickInterval === null) {
      return; // Not running
    }
    
    this.timeManager.pause();
    
    // Clear the tick interval
    window.clearInterval(this.tickInterval);
    this.tickInterval = null;
  }
  
  /**
   * Check if the game loop is running
   */
  isRunning(): boolean {
    return this.tickInterval !== null;
  }
  
  /**
   * Toggle the game loop between running and stopped
   */
  toggle(): void {
    if (this.isRunning()) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  /**
   * Process a single game tick
   */
  processTick(): void {
    const currentRealTime = Date.now();
    
    // 1. Update game time
    this.timeManager.tick(currentRealTime);
    const currentGameTime = this.timeManager.currentTime;
    
    // 2. Dispatch time tick to Redux
    this.dispatch(tickTimeAction(currentRealTime));
    
    // 3. Process activities and update their state
    this.processActivities(currentGameTime);
    
    // 4. Update resources based on time passage (not every tick)
    this.tickCount++;
    if (this.tickCount % this.config.resourceUpdateInterval === 0) {
      this.updateResources(currentGameTime);
    }
    
    // 5. Check for events to trigger
    this.checkEvents(currentGameTime);
    
    // 6. Update skill states (decay, unlocks)
    this.updateSkills(currentGameTime);
  }
  
  /**
   * Process activities that should be completed based on current time
   * @param currentTime Current game time
   */
  private processActivities(currentTime: TimeValue): void {
    // Check for completed activities
    const completedActivities = this.activityManager.update(currentTime);
    
    // If any activities were completed, dispatch to update the Redux store
    if (completedActivities.length > 0) {
      this.dispatch(addCompletedActivities(completedActivities));
      
      // Apply effects from completed activities
      this.applyActivityEffects(completedActivities);
    }
  }
  
  /**
   * Apply effects from completed activities
   * @param activities Array of completed activities
   */
  private applyActivityEffects(activities: ScheduledActivity[]): void {
    for (const activity of activities) {
      // Check if the activity has effects
      if (activity.effects && activity.effects.length > 0) {
        // Apply each effect
        for (const effect of activity.effects) {
          // Only process resource effects for now
          if ('resourceType' in effect && 'amount' in effect) {
            const { resourceType, amount } = effect;
            
            // Apply positive or negative effect based on amount
            if (amount > 0) {
              this.dispatch(addResource({
                resourceType: resourceType as ResourceType,
                amount
              }));
            } else if (amount < 0) {
              this.dispatch(subtractResource({
                resourceType: resourceType as ResourceType,
                amount: Math.abs(amount)
              }));
            }
          }
        }
      }
    }
  }
  
  /**
   * Update resources based on time passage and current state
   * @param currentTime Current game time
   */
  private updateResources(currentTime: TimeValue): void {
    // Get active activities at this time
    const activeActivities = this.activityManager.getActivitiesAt(currentTime);
    
    // Base resource changes over time
    // Example: Decrease energy over time if no rest activities are active
    if (!activeActivities.some(a => a.activityId.includes('rest'))) {
      this.dispatch(subtractResource({
        resourceType: ResourceType.ENERGY,
        amount: 0.5, // Small decrease every resource update
      }));
    }
    
    // Apply ongoing effects from active activities
    for (const activity of activeActivities) {
      if (activity.effects) {
        // For each active activity, apply a fraction of its effects continuously
        // This simulates ongoing activities affecting resources gradually
        for (const effect of activity.effects) {
          if ('resourceType' in effect && 'amount' in effect) {
            const resourceType = effect.resourceType as ResourceType;
            // Apply a small portion of the effect (scaling by tick rate)
            const scaledAmount = effect.amount * 0.05; // 5% of the total effect per resource update
            
            if (scaledAmount > 0) {
              this.dispatch(addResource({
                resourceType,
                amount: scaledAmount
              }));
            } else if (scaledAmount < 0) {
              this.dispatch(subtractResource({
                resourceType,
                amount: Math.abs(scaledAmount)
              }));
            }
          }
        }
      }
    }
    
    // Example: Increase stress over time if under pressure or if deadline-related activities are active
    const hasStressfulActivities = activeActivities.some(a => 
      a.activityId.includes('exam') || a.activityId.includes('deadline')
    );
    
    if (hasStressfulActivities) {
      this.dispatch(addResource({
        resourceType: ResourceType.STRESS,
        amount: 0.8, // Higher increase for stressful activities
      }));
    } else {
      this.dispatch(addResource({
        resourceType: ResourceType.STRESS,
        amount: 0.2, // Small increase every resource update
      }));
    }
  }
  
  /**
   * Check for events to trigger
   * @param currentTime Current game time
   */
  private checkEvents(currentTime: TimeValue): void {
    // Check for events that should trigger based on time and conditions
    const { triggered, autoResolved } = this.eventManager.update(currentTime);
    
    // Here we would dispatch actions to update the UI with new events
    // For now, just log them
    if (triggered.length > 0) {
      console.log('Triggered events:', triggered);
      // Would dispatch to redux: this.dispatch(addTriggeredEvents(triggered));
    }
    
    if (autoResolved.length > 0) {
      console.log('Auto-resolved events:', autoResolved);
      // Would dispatch to redux: this.dispatch(addResolvedEvents(autoResolved));
    }
  }
  
  /**
   * Update skills (decay, check unlocks)
   * @param currentTime Current game time
   */
  private updateSkills(currentTime: TimeValue): void {
    // Apply skill decay based on time passage
    const updatedSkillManager = this.skillManager.applySkillDecay(
      new Date(currentTime.timestamp)
    );
    
    // Check for skill unlocks based on requirements
    const finalSkillManager = updatedSkillManager.updateNodeStates();
    
    // Here we would update the Redux store with the new skill state
    // For now, just update our local reference
    // this.dispatch(updateSkillState(finalSkillManager));
    
    // In a real implementation, we would need to translate the domain model
    // into the Redux state structure
  }
  
  /**
   * Configure the game loop with new settings
   * @param newConfig New configuration options
   */
  configure(newConfig: Partial<GameLoopConfig>): void {
    // Update config with new values
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    // If running, restart with new interval
    const wasRunning = this.isRunning();
    if (wasRunning) {
      this.stop();
      this.start();
    }
  }
  
  /**
   * Clean up resources when the service is no longer needed
   */
  dispose(): void {
    this.stop();
  }
}
