// /Users/montysharma/Documents/v8/MMV08/Mock_project/domain/__tests__/ResourceValue.test.ts

import { describe, it, expect } from 'vitest';
import { ResourceValue } from '../../domain/ResourceValue';

describe('ResourceValue', () => {
  it('should constrain values to min and max', () => {
    const resource = new ResourceValue(50, 0, 100);
    
    // Try to exceed max
    const exceedMax = resource.add(60);
    expect(exceedMax.value).toBe(100);
    
    // Try to go below min
    const belowMin = resource.subtract(60);
    expect(belowMin.value).toBe(0);
  });
  
  it('should calculate percentage correctly', () => {
    const resource = new ResourceValue(50, 0, 100);
    expect(resource.percentage).toBe(50);
    
    const resource2 = new ResourceValue(25, 0, 50);
    expect(resource2.percentage).toBe(50);
    
    const resource3 = new ResourceValue(75, 50, 100);
    expect(resource3.percentage).toBe(50);
  });
  
  it('should handle serialization and deserialization', () => {
    const original = new ResourceValue(42, 10, 90);
    const json = original.toJSON();
    const restored = ResourceValue.fromJSON(json);
    
    expect(restored.value).toBe(42);
    expect(restored.min).toBe(10);
    expect(restored.max).toBe(90);
  });
  
  it('should create new instances on modification', () => {
    const original = new ResourceValue(50);
    const added = original.add(10);
    
    expect(original.value).toBe(50); // Original should be unchanged
    expect(added.value).toBe(60);    // New instance has new value
  });
});
