/**
 * /Users/montysharma/Documents/v8/MMV08/src/domain/SkillTypes.ts
 * 
 * This file defines the fundamental types and enums for the Adaptive Growth Web skill system.
 */

/**
 * The five main Life Path Threads in the Adaptive Growth Web
 */
export enum SkillThreadType {
  BODY = 'BODY',       // Physical stamina, health, fitness
  MIND = 'MIND',       // Critical thinking, problem-solving, memory
  HEART = 'HEART',     // Social awareness, persuasion, leadership  
  WORLD = 'WORLD',     // Resource management, finance, sustainability
  MASTERY = 'MASTERY', // Specialized expertise, entrepreneurship
}

/**
 * Skill proficiency tiers representing levels of expertise
 */
export enum SkillTier {
  NOVICE = 'NOVICE',           // Basic understanding
  APPRENTICE = 'APPRENTICE',   // Developing competence
  PRACTITIONER = 'PRACTITIONER', // Practical application
  EXPERT = 'EXPERT',           // Advanced knowledge
  MASTER = 'MASTER',           // Complete mastery
}

/**
 * Requirements for unlocking a skill
 */
export interface SkillRequirement {
  skillId: string;       // ID of the required skill
  minimumLevel: number;  // Minimum level needed
}

/**
 * Effects gained from having a skill
 */
export interface SkillEffect {
  type: 'RESOURCE_MODIFIER' | 'ACTIVITY_MODIFIER' | 'EVENT_MODIFIER'; 
  target: string;        // What this effect modifies
  modifier: number;      // The numerical modifier
  description: string;   // Human-readable description
}

/**
 * XP thresholds for different skill levels
 */
export const SKILL_LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500    // Level 10
];

/**
 * Maximum level a skill can reach
 */
export const MAX_SKILL_LEVEL = 10;

/**
 * XP decay rate per day of inactivity
 */
export const SKILL_XP_DECAY_RATE = 0.01; // 1% per day
