// /Users/montysharma/Documents/v8/MMV08/Mock_project/infrastructure/__tests__/resourcesSlice.test.ts

import { describe, it, expect } from 'vitest';
import reducer, {
  addResource,
  subtractResource,
  setResource,
  resetResources
} from '../../infrastructure/state/resourcesSlice';
import { ResourceType, DEFAULT_RESOURCE_CONFIGS } from '../../domain/ResourceTypes';

describe('resources reducer', () => {
  it('should handle initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    
    // Check each resource type has the correct structure
    Object.values(ResourceType).forEach(type => {
      expect(state[type]).toHaveProperty('value', DEFAULT_RESOURCE_CONFIGS[type].initialValue);
      expect(state[type]).toHaveProperty('min', DEFAULT_RESOURCE_CONFIGS[type].min);
      expect(state[type]).toHaveProperty('max', DEFAULT_RESOURCE_CONFIGS[type].max);
      expect(state[type]).toHaveProperty('label');
      expect(state[type]).toHaveProperty('description');
      expect(state[type]).toHaveProperty('icon');
      expect(state[type]).toHaveProperty('color');
    });
  });

  it('should handle addResource', () => {
    const initialState = {
      [ResourceType.ENERGY]: { value: 50, min: 0, max: 100, label: 'Energy', description: '', icon: '', color: '' },
      [ResourceType.STRESS]: { value: 30, min: 0, max: 100, label: 'Stress', description: '', icon: '', color: '' },
      [ResourceType.BELONGING]: { value: 40, min: 0, max: 100, label: 'Belonging', description: '', icon: '', color: '' },
      [ResourceType.HEALTH]: { value: 70, min: 0, max: 100, label: 'Health', description: '', icon: '', color: '' },
    };

    // Add energy
    const actual = reducer(
      initialState,
      addResource({ resourceType: ResourceType.ENERGY, amount: 20 })
    );

    expect(actual[ResourceType.ENERGY].value).toEqual(70);
    
    // Should respect max limits
    const maxedOut = reducer(
      initialState,
      addResource({ resourceType: ResourceType.ENERGY, amount: 60 })
    );
    
    expect(maxedOut[ResourceType.ENERGY].value).toEqual(100);
  });

  it('should handle subtractResource', () => {
    const initialState = {
      [ResourceType.ENERGY]: { value: 50, min: 0, max: 100, label: 'Energy', description: '', icon: '', color: '' },
      [ResourceType.STRESS]: { value: 30, min: 0, max: 100, label: 'Stress', description: '', icon: '', color: '' },
      [ResourceType.BELONGING]: { value: 40, min: 0, max: 100, label: 'Belonging', description: '', icon: '', color: '' },
      [ResourceType.HEALTH]: { value: 70, min: 0, max: 100, label: 'Health', description: '', icon: '', color: '' },
    };

    // Subtract stress
    const actual = reducer(
      initialState,
      subtractResource({ resourceType: ResourceType.STRESS, amount: 20 })
    );

    expect(actual[ResourceType.STRESS].value).toEqual(10);
    
    // Should respect min limits
    const minedOut = reducer(
      initialState,
      subtractResource({ resourceType: ResourceType.STRESS, amount: 40 })
    );
    
    expect(minedOut[ResourceType.STRESS].value).toEqual(0);
  });

  it('should handle setResource', () => {
    const initialState = {
      [ResourceType.ENERGY]: { value: 50, min: 0, max: 100, label: 'Energy', description: '', icon: '', color: '' },
      [ResourceType.STRESS]: { value: 30, min: 0, max: 100, label: 'Stress', description: '', icon: '', color: '' },
      [ResourceType.BELONGING]: { value: 40, min: 0, max: 100, label: 'Belonging', description: '', icon: '', color: '' },
      [ResourceType.HEALTH]: { value: 70, min: 0, max: 100, label: 'Health', description: '', icon: '', color: '' },
    };

    // Set health to a specific value
    const actual = reducer(
      initialState,
      setResource({ resourceType: ResourceType.HEALTH, value: 85 })
    );

    expect(actual[ResourceType.HEALTH].value).toEqual(85);
    
    // Should respect min/max limits
    const overMax = reducer(
      initialState,
      setResource({ resourceType: ResourceType.HEALTH, value: 120 })
    );
    
    expect(overMax[ResourceType.HEALTH].value).toEqual(100);
    
    const underMin = reducer(
      initialState,
      setResource({ resourceType: ResourceType.HEALTH, value: -10 })
    );
    
    expect(underMin[ResourceType.HEALTH].value).toEqual(0);
  });

  it('should handle resetResources', () => {
    const initialState = {
      [ResourceType.ENERGY]: { value: 20, min: 0, max: 100, label: 'Energy', description: '', icon: '', color: '' },
      [ResourceType.STRESS]: { value: 80, min: 0, max: 100, label: 'Stress', description: '', icon: '', color: '' },
      [ResourceType.BELONGING]: { value: 10, min: 0, max: 100, label: 'Belonging', description: '', icon: '', color: '' },
      [ResourceType.HEALTH]: { value: 30, min: 0, max: 100, label: 'Health', description: '', icon: '', color: '' },
    };

    // Reset all resources
    const actual = reducer(initialState, resetResources());

    // Should reset to default initial values
    expect(actual[ResourceType.ENERGY].value).toEqual(DEFAULT_RESOURCE_CONFIGS[ResourceType.ENERGY].initialValue);
    expect(actual[ResourceType.STRESS].value).toEqual(DEFAULT_RESOURCE_CONFIGS[ResourceType.STRESS].initialValue);
    expect(actual[ResourceType.BELONGING].value).toEqual(DEFAULT_RESOURCE_CONFIGS[ResourceType.BELONGING].initialValue);
    expect(actual[ResourceType.HEALTH].value).toEqual(DEFAULT_RESOURCE_CONFIGS[ResourceType.HEALTH].initialValue);
  });
});
