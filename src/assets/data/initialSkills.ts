/**
 * /Users/montysharma/Documents/v8/MMV08/src/assets/data/initialSkills.ts
 * 
 * Initial skill definitions for the Adaptive Growth Web.
 */

import { SkillThreadType, SkillTier } from '../../domain/SkillTypes';

// Initial skill definitions with basic starter skills in each thread
export const initialSkills = [
  // BODY Thread
  {
    id: 'body-stamina',
    name: 'Stamina',
    description: 'Your physical endurance and ability to sustain prolonged activity.',
    threadType: SkillThreadType.BODY,
    tier: SkillTier.NOVICE,
    requirements: [],
    effects: [
      {
        type: 'RESOURCE_MODIFIER',
        target: 'ENERGY',
        modifier: 0.1,
        description: 'Increases energy recovery by 10%'
      }
    ],
    connections: ['body-strength', 'body-fitness'],
    isVisible: true,
    isUnlocked: true
  },
  {
    id: 'body-strength',
    name: 'Strength',
    description: 'Your physical power and ability to exert force.',
    threadType: SkillThreadType.BODY,
    tier: SkillTier.NOVICE,
    requirements: [
      { skillId: 'body-stamina', minimumLevel: 2 }
    ],
    effects: [
      {
        type: 'ACTIVITY_MODIFIER',
        target: 'PHYSICAL_ACTIVITIES',
        modifier: 0.15,
        description: 'Increases effectiveness of physical activities by 15%'
      }
    ],
    connections: ['body-athletic-training'],
    isVisible: false,
    isUnlocked: false
  },
  {
    id: 'body-fitness',
    name: 'Fitness',
    description: 'Your overall physical condition and health.',
    threadType: SkillThreadType.BODY,
    tier: SkillTier.NOVICE,
    requirements: [
      { skillId: 'body-stamina', minimumLevel: 3 }
    ],
    effects: [
      {
        type: 'RESOURCE_MODIFIER',
        target: 'STRESS',
        modifier: -0.1,
        description: 'Reduces stress accumulation by 10%'
      }
    ],
    connections: ['body-athletic-training'],
    isVisible: false,
    isUnlocked: false
  },
  
  // MIND Thread
  {
    id: 'mind-focus',
    name: 'Focus',
    description: 'Your ability to concentrate and maintain attention.',
    threadType: SkillThreadType.MIND,
    tier: SkillTier.NOVICE,
    requirements: [],
    effects: [
      {
        type: 'ACTIVITY_MODIFIER',
        target: 'STUDY',
        modifier: 0.1,
        description: 'Increases study effectiveness by 10%'
      }
    ],
    connections: ['mind-memory', 'mind-critical-thinking'],
    isVisible: true,
    isUnlocked: true
  },
  {
    id: 'mind-memory',
    name: 'Memory',
    description: 'Your ability to retain and recall information.',
    threadType: SkillThreadType.MIND,
    tier: SkillTier.NOVICE,
    requirements: [
      { skillId: 'mind-focus', minimumLevel: 2 }
    ],
    effects: [
      {
        type: 'ACTIVITY_MODIFIER',
        target: 'LEARNING',
        modifier: 0.15,
        description: 'Increases learning speed by 15%'
      }
    ],
    connections: ['mind-academic-excellence'],
    isVisible: false,
    isUnlocked: false
  },
  
  // HEART Thread
  {
    id: 'heart-empathy',
    name: 'Empathy',
    description: 'Your ability to understand and share the feelings of others.',
    threadType: SkillThreadType.HEART,
    tier: SkillTier.NOVICE,
    requirements: [],
    effects: [
      {
        type: 'RESOURCE_MODIFIER',
        target: 'BELONGING',
        modifier: 0.1,
        description: 'Increases belonging gain by 10%'
      }
    ],
    connections: ['heart-communication', 'heart-social-awareness'],
    isVisible: true,
    isUnlocked: true
  },
  
  // WORLD Thread
  {
    id: 'world-resourcefulness',
    name: 'Resourcefulness',
    description: 'Your ability to find clever ways to overcome difficulties.',
    threadType: SkillThreadType.WORLD,
    tier: SkillTier.NOVICE,
    requirements: [],
    effects: [
      {
        type: 'ACTIVITY_MODIFIER',
        target: 'WORK',
        modifier: 0.1,
        description: 'Increases money earned from work by 10%'
      }
    ],
    connections: ['world-budgeting', 'world-networking'],
    isVisible: true,
    isUnlocked: true
  },
  
  // MASTERY Thread
  {
    id: 'mastery-discipline',
    name: 'Discipline',
    description: 'Your ability to maintain focus and commitment to goals.',
    threadType: SkillThreadType.MASTERY,
    tier: SkillTier.NOVICE,
    requirements: [],
    effects: [
      {
        type: 'RESOURCE_MODIFIER',
        target: 'ALL',
        modifier: 0.05,
        description: 'Increases all resource gains by 5%'
      }
    ],
    connections: ['mastery-goal-setting', 'mastery-time-management'],
    isVisible: true,
    isUnlocked: true
  }
];
