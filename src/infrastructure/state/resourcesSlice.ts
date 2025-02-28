import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResourceType, DEFAULT_RESOURCE_CONFIGS } from '../../domain/ResourceTypes';

export interface ResourceState {
  value: number;
  min: number;
  max: number;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface ResourcesState {
  [key: string]: ResourceState;
}

/**
 * Initialize the resources state using default configurations
 */
const initialState: ResourcesState = Object.values(ResourceType).reduce((acc, type) => {
  const config = DEFAULT_RESOURCE_CONFIGS[type as ResourceType];
  acc[type] = {
    value: config.initialValue,
    min: config.min,
    max: config.max,
    label: config.label,
    description: config.description,
    icon: config.icon,
    color: config.color
  };
  return acc;
}, {} as ResourcesState);

interface ModifyResourcePayload {
  resourceType: ResourceType;
  amount: number;
}

interface SetResourcePayload {
  resourceType: ResourceType;
  value: number;
}

/**
 * Redux slice for managing game resources like energy, stress, belonging, health
 */
const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    addResource: (state, action: PayloadAction<ModifyResourcePayload>) => {
      const { resourceType, amount } = action.payload;
      const resource = state[resourceType];
      
      if (resource) {
        resource.value = Math.min(resource.max, resource.value + amount);
      }
    },
    subtractResource: (state, action: PayloadAction<ModifyResourcePayload>) => {
      const { resourceType, amount } = action.payload;
      const resource = state[resourceType];
      
      if (resource) {
        resource.value = Math.max(resource.min, resource.value - amount);
      }
    },
    setResource: (state, action: PayloadAction<SetResourcePayload>) => {
      const { resourceType, value } = action.payload;
      const resource = state[resourceType];
      
      if (resource) {
        resource.value = Math.max(resource.min, Math.min(resource.max, value));
      }
    },
    resetResources: (state) => {
      // Reset all resources to their default values
      Object.values(ResourceType).forEach(type => {
        const config = DEFAULT_RESOURCE_CONFIGS[type as ResourceType];
        state[type].value = config.initialValue;
      });
    }
  }
});

export const { 
  addResource, 
  subtractResource, 
  setResource, 
  resetResources 
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
