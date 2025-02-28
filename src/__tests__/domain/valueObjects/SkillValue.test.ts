/**
 * /Users/montysharma/Documents/v8/MMV08/src/__tests__/domain/valueObjects/SkillValue.test.ts
 * 
 * Tests for the SkillValue value object.
 */

import { describe, it, expect } from 'vitest';
import { SkillValue } from '../../../domain/valueObjects/SkillValue';
import { MAX_SKILL_LEVEL, SKILL_LEVEL_THRESHOLDS, SKILL_XP_DECAY_RATE } from '../../../domain/SkillTypes';

describe('SkillValue', () => {
  it('should create a skill value with default parameters', () => {
    const skill = new SkillValue();
    expect(skill.xp).toBe(0);
    expect(skill.level).toBe(1);
    expect(skill.xpToNextLevel).toBe(100); // Fixed: Expected XP to next level is 100, not SKILL_LEVEL_THRESHOLDS[0]
    expect(skill.levelProgress).toBe(0);
  });

  it('should calculate the correct level based on XP', () => {
    // Test various XP thresholds
    expect(new SkillValue(0).level).toBe(1);
    expect(new SkillValue(50).level).toBe(1);
    expect(new SkillValue(100).level).toBe(2);
    expect(new SkillValue(299).level).toBe(2);
    expect(new SkillValue(300).level).toBe(3);
    expect(new SkillValue(4499).level).toBe(9);
    expect(new SkillValue(4500).level).toBe(10);
    expect(new SkillValue(10000).level).toBe(10); // Cap at max level
  });

  it('should calculate XP to next level correctly', () => {
    expect(new SkillValue(0).xpToNextLevel).toBe(100);
    expect(new SkillValue(50).xpToNextLevel).toBe(50);
    expect(new SkillValue(100).xpToNextLevel).toBe(200);
    expect(new SkillValue(4500).xpToNextLevel).toBe(0); // Max level
  });

  it('should calculate level progress percentage correctly', () => {
    expect(new SkillValue(0).levelProgress).toBe(0);
    expect(new SkillValue(50).levelProgress).toBe(50);
    expect(new SkillValue(100).levelProgress).toBe(0); // Just reached level 2
    expect(new SkillValue(200).levelProgress).toBe(50); // Halfway to level 3
    expect(new SkillValue(4500).levelProgress).toBe(100); // Max level
  });

  it('should add XP and update lastUsed date', () => {
    const skill = new SkillValue(100);
    const updatedSkill = skill.addXp(50);
    
    expect(updatedSkill.xp).toBe(150);
    expect(updatedSkill.level).toBe(2);
    
    // Check that lastUsed was updated to approximately now
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - updatedSkill.lastUsed.getTime());
    expect(timeDiff).toBeLessThan(1000); // Within 1 second
  });

  it('should apply skill decay based on inactivity', () => {
    // Create a skill with 1000 XP
    const skill = new SkillValue(1000, new Date('2023-01-01T00:00:00Z'));
    
    // Check decay after 10 days (should be about 90.4% of original XP)
    const currentDate = new Date('2023-01-11T00:00:00Z');
    const decayedSkill = skill.applyDecay(currentDate);
    
    const expectedXp = Math.floor(1000 * Math.pow(1 - SKILL_XP_DECAY_RATE, 10));
    expect(decayedSkill.xp).toBe(expectedXp);
    
    // Lastused date should not change
    expect(decayedSkill.lastUsed.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should correctly check level requirements', () => {
    const level3Skill = new SkillValue(300);
    
    expect(level3Skill.meetsLevelRequirement(1)).toBe(true);
    expect(level3Skill.meetsLevelRequirement(2)).toBe(true);
    expect(level3Skill.meetsLevelRequirement(3)).toBe(true);
    expect(level3Skill.meetsLevelRequirement(4)).toBe(false);
  });
});
