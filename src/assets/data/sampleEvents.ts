// /Users/montysharma/Documents/v8/MMV08/src/assets/data/sampleEvents.ts

import { EventData, EventCategory, EventTriggerType } from '../../domain/types/EventTypes';
import { ResourceType } from '../../domain/types/ResourceTypes';

/**
 * Sample events data for testing and development
 */
export const sampleEvents: EventData[] = [
  // Daily Events
  {
    id: 'pop-quiz',
    title: 'Pop Quiz Surprise',
    description: 'Your professor announces a surprise quiz. You haven\'t been studying as much as you should have...',
    category: EventCategory.ACADEMIC,
    trigger: {
      type: EventTriggerType.RANDOM,
      probability: 0.3
    },
    choices: [
      {
        id: 'take-quiz',
        text: 'Do your best with what you know',
        effects: {
          narrative: 'You manage to answer some questions correctly, but struggle with others.',
          resourceEffects: [
            { type: ResourceType.STRESS, value: 10 }
          ],
          skillEffects: [
            { skillId: 'critical-thinking', xp: 5 }
          ]
        }
      },
      {
        id: 'cheat',
        text: 'Try to peek at your neighbor\'s answers',
        effects: {
          narrative: 'You successfully glance at your neighbor\'s paper a few times.',
          resourceEffects: [
            { type: ResourceType.STRESS, value: 20 }
          ]
        },
        probability: 0.6,
        failText: 'The professor catches you looking at another student\'s paper!',
        failEffects: {
          narrative: 'You\'re asked to stay after class. This is embarrassing and could affect your grade.',
          resourceEffects: [
            { type: ResourceType.STRESS, value: 30 },
            { type: ResourceType.BELONGING, value: -10 }
          ]
        }
      },
      {
        id: 'excuse',
        text: 'Make up an excuse to leave class',
        effects: {
          narrative: 'You claim to feel ill and are excused from class. You\'ll need to make up the quiz later.',
          resourceEffects: [
            { type: ResourceType.ENERGY, value: -5 },
            { type: ResourceType.BELONGING, value: -5 }
          ]
        }
      }
    ],
    repeatable: true,
    priority: 2
  },
  
  // Social Event
  {
    id: 'dorm-party',
    title: 'Dorm Party Invitation',
    description: 'Your roommate invites you to a party happening tonight at your dorm. It sounds like it might get wild.',
    category: EventCategory.SOCIAL,
    trigger: {
      type: EventTriggerType.RANDOM,
      probability: 0.4
    },
    choices: [
      {
        id: 'attend-party',
        text: 'Go to the party',
        effects: {
          narrative: 'You spend the night socializing and having fun. You make some new friends!',
          resourceEffects: [
            { type: ResourceType.ENERGY, value: -15 },
            { type: ResourceType.BELONGING, value: 15 },
            { type: ResourceType.STRESS, value: -10 }
          ],
          skillEffects: [
            { skillId: 'social-awareness', xp: 10 }
          ]
        }
      },
      {
        id: 'skip-party',
        text: 'Stay in and study instead',
        effects: {
          narrative: 'You get some good studying done, but can hear the fun you\'re missing.',
          resourceEffects: [
            { type: ResourceType.ENERGY, value: -5 },
            { type: ResourceType.BELONGING, value: -5 }
          ],
          skillEffects: [
            { skillId: 'academic-focus', xp: 15 }
          ]
        }
      },
      {
        id: 'brief-appearance',
        text: 'Make a brief appearance and then leave',
        effects: {
          narrative: 'You stop by for a while, chat with a few people, then excuse yourself to get back to studying.',
          resourceEffects: [
            { type: ResourceType.ENERGY, value: -5 },
            { type: ResourceType.BELONGING, value: 5 },
            { type: ResourceType.STRESS, value: -5 }
          ],
          skillEffects: [
            { skillId: 'time-management', xp: 10 },
            { skillId: 'social-awareness', xp: 5 }
          ]
        }
      }
    ],
    repeatable: true,
    priority: 3
  },
  
  // Health Event
  {
    id: 'getting-sick',
    title: 'Coming Down With Something',
    description: 'You wake up feeling unwell. Your throat hurts and you have a slight fever.',
    category: EventCategory.HEALTH,
    trigger: {
      type: EventTriggerType.CONDITION,
      conditions: [
        {
          type: 'resource',
          target: ResourceType.ENERGY,
          operator: '<',
          value: 30
        }
      ]
    },
    choices: [
      {
        id: 'rest-recover',
        text: 'Take the day off to rest and recover',
        effects: {
          narrative: 'You spend the day in bed, sleeping and drinking fluids. You feel better by the evening.',
          resourceEffects: [
            { type: ResourceType.HEALTH, value: 15 },
            { type: ResourceType.ENERGY, value: 20 }
          ],
          timeSkip: 'PT8H'
        }
      },
      {
        id: 'push-through',
        text: 'Push through and attend your classes anyway',
        effects: {
          narrative: 'You force yourself to attend classes despite feeling terrible. Your focus is compromised.',
          resourceEffects: [
            { type: ResourceType.HEALTH, value: -10 },
            { type: ResourceType.ENERGY, value: -15 },
            { type: ResourceType.STRESS, value: 10 }
          ],
          skillEffects: [
            { skillId: 'resilience', xp: 10 }
          ]
        }
      },
      {
        id: 'visit-health',
        text: 'Visit the campus health center',
        effects: {
          narrative: 'The campus doctor gives you some medicine and a note for your professors.',
          resourceEffects: [
            { type: ResourceType.HEALTH, value: 25 },
            { type: ResourceType.ENERGY, value: 10 },
            { type: ResourceType.STRESS, value: -5 }
          ]
        }
      }
    ],
    repeatable: true,
    priority: 5
  },
  
  // Pivotal Story Event
  {
    id: 'mysterious-professor',
    title: 'The Mysterious Professor',
    description: 'You notice one of your professors acting strangely, studying old documents and making cryptic notes. When they see you watching, they quickly invite you into their office.',
    category: EventCategory.MYSTERY,
    trigger: {
      type: EventTriggerType.CONDITION,
      conditions: [
        {
          type: 'skill',
          target: 'observation',
          operator: '>=',
          value: 2
        }
      ]
    },
    choices: [
      {
        id: 'accept-invitation',
        text: 'Accept the invitation and enter their office',
        effects: {
          narrative: 'The professor reveals they\'ve been researching the long-term effects of certain technologies on wealth distribution. They hint at a larger conspiracy...',
          skillEffects: [
            { skillId: 'intuition', xp: 15 },
            { skillId: 'critical-thinking', xp: 10 }
          ],
          triggerEvents: ['conspiracy-introduction']
        }
      },
      {
        id: 'politely-decline',
        text: 'Politely decline and walk away',
        effects: {
          narrative: 'You make an excuse and leave. As you walk away, you notice the professor watching you with a concerned expression.',
          resourceEffects: [
            { type: ResourceType.STRESS, value: 5 }
          ]
        }
      },
      {
        id: 'observe-secretly',
        text: 'Pretend to leave but secretly observe them',
        effects: {
          narrative: 'You pretend to walk away but then circle back and observe from a distance. You see the professor making a call and mentioning something about "the future timeline" and "preventing the gerontocracy."',
          skillEffects: [
            { skillId: 'stealth', xp: 15 },
            { skillId: 'intuition', xp: 20 }
          ],
          triggerEvents: ['conspiracy-clue']
        },
        requiredSkills: [
          { id: 'stealth', level: 1 }
        ],
        probability: 0.7,
        failText: 'The professor notices you lingering nearby and becomes visibly uncomfortable, quickly packing up their materials.',
        failEffects: {
          narrative: 'The professor avoids you in subsequent classes, and you sense you\'ve missed an opportunity.',
          resourceEffects: [
            { type: ResourceType.STRESS, value: 10 }
          ]
        }
      }
    ],
    repeatable: false,
    priority: 10,
    timeLimit: 'PT2M',
    autoResolveChoice: 'politely-decline'
  }
];

export default sampleEvents;