// /Users/montysharma/Documents/v8/MMV08/Mock_project/interface/__tests__/ResourcesPanel.test.tsx

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from '../../infrastructure/state/resourcesSlice';
import { ResourcesPanel } from '../../interface/components/resources/ResourcesPanel';
import { ResourceType } from '../../domain/ResourceTypes';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      resources: resourcesReducer,
    },
    preloadedState: initialState
  });
};

describe('ResourcesPanel Component', () => {
  it('renders all resource bars correctly', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <ResourcesPanel />
      </Provider>
    );
    
    // Check that all resources are rendered
    expect(screen.getByTestId('resource-bar-energy')).toBeInTheDocument();
    expect(screen.getByTestId('resource-bar-stress')).toBeInTheDocument();
    expect(screen.getByTestId('resource-bar-belonging')).toBeInTheDocument();
    expect(screen.getByTestId('resource-bar-health')).toBeInTheDocument();
    
    // Check heading
    expect(screen.getByText('Resources')).toBeInTheDocument();
    
    // Check reset button
    expect(screen.getByTestId('reset-resources')).toBeInTheDocument();
  });
  
  it('handles resource interactions correctly', () => {
    // Create a store with custom initial state
    const initialState = {
      resources: {
        [ResourceType.ENERGY]: { value: 50, min: 0, max: 100 },
        [ResourceType.STRESS]: { value: 30, min: 0, max: 100 },
        [ResourceType.BELONGING]: { value: 40, min: 0, max: 100 },
        [ResourceType.HEALTH]: { value: 70, min: 0, max: 100 },
      }
    };
    
    const store = createTestStore(initialState);
    
    render(
      <Provider store={store}>
        <ResourcesPanel />
      </Provider>
    );
    
    // Test increasing energy
    fireEvent.click(screen.getByTestId('energy-add'));
    expect(store.getState().resources[ResourceType.ENERGY].value).toBe(60); // 50 + 10
    
    // Test decreasing stress
    fireEvent.click(screen.getByTestId('stress-subtract'));
    expect(store.getState().resources[ResourceType.STRESS].value).toBe(20); // 30 - 10
    
    // Test limit handling - decrease belonging below min
    // First decrease once
    fireEvent.click(screen.getByTestId('belonging-subtract'));
    expect(store.getState().resources[ResourceType.BELONGING].value).toBe(30); // 40 - 10
    
    // Then try to decrease below minimum
    fireEvent.click(screen.getByTestId('belonging-subtract'));
    fireEvent.click(screen.getByTestId('belonging-subtract'));
    fireEvent.click(screen.getByTestId('belonging-subtract'));
    expect(store.getState().resources[ResourceType.BELONGING].value).toBe(0); // Stops at min (0)
    
    // Test limit handling - increase health above max
    // First increase once
    fireEvent.click(screen.getByTestId('health-add'));
    expect(store.getState().resources[ResourceType.HEALTH].value).toBe(80); // 70 + 10
    
    // Then try to increase above maximum
    fireEvent.click(screen.getByTestId('health-add'));
    fireEvent.click(screen.getByTestId('health-add'));
    expect(store.getState().resources[ResourceType.HEALTH].value).toBe(100); // Stops at max (100)
  });
  
  it('handles reset correctly', () => {
    // Create a store with modified values
    const initialState = {
      resources: {
        [ResourceType.ENERGY]: { value: 10, min: 0, max: 100 },
        [ResourceType.STRESS]: { value: 90, min: 0, max: 100 },
        [ResourceType.BELONGING]: { value: 5, min: 0, max: 100 },
        [ResourceType.HEALTH]: { value: 20, min: 0, max: 100 },
      }
    };
    
    const store = createTestStore(initialState);
    
    render(
      <Provider store={store}>
        <ResourcesPanel />
      </Provider>
    );
    
    // Test reset button
    fireEvent.click(screen.getByTestId('reset-resources'));
    
    // Values should reset to default initial values
    const state = store.getState().resources;
    expect(state[ResourceType.ENERGY].value).toBe(100); // Default for energy
    expect(state[ResourceType.STRESS].value).toBe(20);  // Default for stress
    expect(state[ResourceType.BELONGING].value).toBe(50); // Default for belonging
    expect(state[ResourceType.HEALTH].value).toBe(80);  // Default for health
  });
});
