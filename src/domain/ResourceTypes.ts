/**
 * Enum representing the types of resources in the game
 */
export enum ResourceType {
  ENERGY = 'energy',
  STRESS = 'stress',
  BELONGING = 'belonging',
  HEALTH = 'health'
}

/**
 * Interface for resource configuration
 */
export interface ResourceConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  min: number;
  max: number;
  initialValue: number;
}

/**
 * Default configuration for each resource type
 */
export const DEFAULT_RESOURCE_CONFIGS: Record<ResourceType, ResourceConfig> = {
  [ResourceType.ENERGY]: {
    label: 'Energy',
    description: 'Physical and mental vitality',
    icon: 'bolt',
    color: '#FFD700', // Gold
    min: 0,
    max: 100,
    initialValue: 100
  },
  [ResourceType.STRESS]: {
    label: 'Stress',
    description: 'Sources including academic, social, financial',
    icon: 'brain',
    color: '#FF4500', // OrangeRed
    min: 0,
    max: 100,
    initialValue: 20
  },
  [ResourceType.BELONGING]: {
    label: 'Belonging',
    description: 'Connection and community metrics',
    icon: 'heart',
    color: '#9370DB', // MediumPurple
    min: 0,
    max: 100,
    initialValue: 50
  },
  [ResourceType.HEALTH]: {
    label: 'Health',
    description: 'Physical wellbeing tracking',
    icon: 'heart-pulse',
    color: '#32CD32', // LimeGreen
    min: 0,
    max: 100,
    initialValue: 80
  }
};
