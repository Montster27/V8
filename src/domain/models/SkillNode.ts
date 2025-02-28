/**
 * /Users/montysharma/Documents/v8/MMV08/src/domain/models/SkillNode.ts
 * 
 * Represents a node in the Adaptive Growth Web skill system.
 */

import { SkillEffect, SkillRequirement, SkillThreadType, SkillTier } from '../SkillTypes';
import { SkillValue } from '../valueObjects/SkillValue';

/**
 * Represents a specific skill node in the Adaptive Growth Web
 */
export class SkillNode {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly threadType: SkillThreadType;
  readonly tier: SkillTier;
  readonly icon?: string;
  readonly requirements: SkillRequirement[];
  readonly effects: SkillEffect[];
  readonly connections: string[]; // IDs of connected skill nodes
  readonly value: SkillValue;
  readonly isVisible: boolean;
  readonly isUnlocked: boolean;

  /**
   * Create a new skill node
   */
  constructor({
    id,
    name,
    description,
    threadType,
    tier,
    icon,
    requirements = [],
    effects = [],
    connections = [],
    value = new SkillValue(),
    isVisible = false,
    isUnlocked = false
  }: {
    id: string;
    name: string;
    description: string;
    threadType: SkillThreadType;
    tier: SkillTier;
    icon?: string;
    requirements?: SkillRequirement[];
    effects?: SkillEffect[];
    connections?: string[];
    value?: SkillValue;
    isVisible?: boolean;
    isUnlocked?: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.threadType = threadType;
    this.tier = tier;
    this.icon = icon;
    this.requirements = [...requirements];
    this.effects = [...effects];
    this.connections = [...connections];
    this.value = value;
    this.isVisible = isVisible;
    this.isUnlocked = isUnlocked;
  }

  /**
   * Update the skill's XP value
   * @param amount Amount of XP to add
   * @returns A new SkillNode with updated XP
   */
  addXp(amount: number): SkillNode {
    return this.with({ value: this.value.addXp(amount) });
  }

  /**
   * Apply skill decay based on days of inactivity
   * @param currentDate Current date to calculate inactivity period
   * @returns A new SkillNode with adjusted XP after decay
   */
  applyDecay(currentDate: Date = new Date()): SkillNode {
    return this.with({ value: this.value.applyDecay(currentDate) });
  }

  /**
   * Check if this skill can be unlocked based on requirements
   * @param allSkills Map of all skill nodes by ID
   */
  canBeUnlocked(allSkills: Map<string, SkillNode>): boolean {
    // If already unlocked, return true
    if (this.isUnlocked) {
      return true;
    }

    // If no requirements, it can be unlocked
    if (this.requirements.length === 0) {
      return true;
    }

    // Check if all requirements are met
    return this.requirements.every(req => {
      const requiredSkill = allSkills.get(req.skillId);
      // Return false if required skill doesn't exist
      if (!requiredSkill) {
        return false;
      }
      // Return false if required skill isn't unlocked
      if (!requiredSkill.isUnlocked) {
        return false;
      }
      // Check if required skill meets level requirement
      return requiredSkill.value.meetsLevelRequirement(req.minimumLevel);
    });
  }

  /**
   * Set the node's visibility
   * @param isVisible New visibility state
   */
  setVisibility(isVisible: boolean): SkillNode {
    return this.with({ isVisible });
  }

  /**
   * Set the node's unlock state
   * @param isUnlocked New unlock state
   */
  setUnlocked(isUnlocked: boolean): SkillNode {
    return this.with({ isUnlocked });
  }

  /**
   * Create a modified copy of this skill node with updated properties
   * @param changes Properties to change in the new instance
   */
  with(changes: Partial<SkillNode>): SkillNode {
    return new SkillNode({
      id: this.id,
      name: this.name,
      description: this.description,
      threadType: this.threadType,
      tier: this.tier,
      icon: this.icon,
      requirements: this.requirements,
      effects: this.effects,
      connections: this.connections,
      value: this.value,
      isVisible: this.isVisible,
      isUnlocked: this.isUnlocked,
      ...changes
    });
  }
}
