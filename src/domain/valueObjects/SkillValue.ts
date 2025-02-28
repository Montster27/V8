/**
 * /Users/montysharma/Documents/v8/MMV08/src/domain/valueObjects/SkillValue.ts
 * 
 * This value object represents an individual skill's experience points and level.
 */

import { MAX_SKILL_LEVEL, SKILL_LEVEL_THRESHOLDS, SKILL_XP_DECAY_RATE } from '../SkillTypes';

/**
 * Immutable value object that manages a skill's XP and level
 */
export class SkillValue {
  private readonly _xp: number;
  private readonly _lastUsed: Date;

  /**
   * Create a new SkillValue instance
   * @param xp The experience points for this skill
   * @param lastUsed When this skill was last used (defaults to now)
   */
  constructor(xp: number = 0, lastUsed: Date = new Date()) {
    this._xp = Math.max(0, xp); // XP cannot be negative
    this._lastUsed = lastUsed;
  }

  /**
   * Get the current XP value
   */
  get xp(): number {
    return this._xp;
  }

  /**
   * Get when this skill was last used
   */
  get lastUsed(): Date {
    return new Date(this._lastUsed);
  }

  /**
   * Get the current level based on XP
   */
  get level(): number {
    // Find the highest level threshold that's less than or equal to current XP
    let level = 1;
    for (let i = 0; i < SKILL_LEVEL_THRESHOLDS.length; i++) {
      if (this._xp >= SKILL_LEVEL_THRESHOLDS[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return Math.min(level, MAX_SKILL_LEVEL);
  }

  /**
   * Get XP needed for the next level
   */
  get xpToNextLevel(): number {
    if (this.level >= MAX_SKILL_LEVEL) {
      return 0; // Already at max level
    }
    
    // For a skill with 0 XP, the next level (2) requires 100 XP
    if (this._xp === 0) {
      return 100;
    }
    
    // For other XP values, calculate the difference to next threshold
    return SKILL_LEVEL_THRESHOLDS[this.level] - this._xp;
  }

  /**
   * Get progress percentage to next level (0-100)
   */
  get levelProgress(): number {
    if (this.level >= MAX_SKILL_LEVEL) {
      return 100; // Already at max level
    }
    
    // For level 1, progress is relative to next threshold
    if (this.level === 1) {
      return Math.floor((this._xp / SKILL_LEVEL_THRESHOLDS[1]) * 100);
    }
    
    // For other levels, calculate progress between current and next threshold
    const currentThreshold = SKILL_LEVEL_THRESHOLDS[this.level - 1];
    const nextThreshold = SKILL_LEVEL_THRESHOLDS[this.level];
    const xpInCurrentLevel = this._xp - currentThreshold;
    const xpRangeForLevel = nextThreshold - currentThreshold;
    
    return Math.floor((xpInCurrentLevel / xpRangeForLevel) * 100);
  }

  /**
   * Add XP to this skill and update the lastUsed date
   * @param amount Amount of XP to add
   * @returns A new SkillValue instance with updated XP
   */
  addXp(amount: number): SkillValue {
    return new SkillValue(this._xp + Math.max(0, amount), new Date());
  }

  /**
   * Apply skill decay based on days of inactivity
   * @param currentDate Current date to calculate inactivity period
   * @returns A new SkillValue with adjusted XP after decay
   */
  applyDecay(currentDate: Date = new Date()): SkillValue {
    // Calculate days since last use
    const daysSinceLastUse = Math.floor(
      (currentDate.getTime() - this._lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // No decay if used recently
    if (daysSinceLastUse <= 0) {
      return this;
    }
    
    // Calculate decay factor
    const decayFactor = Math.pow(1 - SKILL_XP_DECAY_RATE, daysSinceLastUse);
    const newXp = Math.floor(this._xp * decayFactor);
    
    // Return new value with decayed XP (don't update lastUsed)
    return new SkillValue(newXp, this._lastUsed);
  }

  /**
   * Check if this skill meets a minimum level requirement
   * @param minimumLevel The minimum level required
   */
  meetsLevelRequirement(minimumLevel: number): boolean {
    return this.level >= minimumLevel;
  }

  /**
   * Create a copy of this skill value
   */
  clone(): SkillValue {
    return new SkillValue(this._xp, this._lastUsed);
  }
}
