// /Users/montysharma/Documents/v8/MMV08/Mock_project/domain/ResourceTypes.ts

/**
 * Enum of resource types available in the game
 */
export enum ResourceType {
  ENERGY = 'energy',
  STRESS = 'stress',
  BELONGING = 'belonging',
  HEALTH = 'health'
}

/**
 * Type for resource configuration
 */
export interface ResourceConfig {
  initialValue: number;
  min: number;
  max: number;
  description: string;
  color: string;
}

/**
 * Default configurations for each resource type
 */
export const DEFAULT_RESOURCE_CONFIGS: Record<ResourceType, ResourceConfig> = {
  [ResourceType.ENERGY]: {
    initialValue: 100,
    min: 0,
    max: 100,
    description: 'Physical and mental vitality',
    color: '#2563eb' // blue
  },
  [ResourceType.STRESS]: {
    initialValue: 20,
    min: 0,
    max: 100,
    description: 'Academic, social, and financial pressure',
    color: '#dc2626' // red
  },
  [ResourceType.BELONGING]: {
    initialValue: 50,
    min: 0,
    max: 100,
    description: 'Connection and community metrics',
    color: '#7c3aed' // purple
  },
  [ResourceType.HEALTH]: {
    initialValue: 80,
    min: 0,
    max: 100,
    description: 'Physical wellbeing tracking',
    color: '#059669' // green
  }
};
