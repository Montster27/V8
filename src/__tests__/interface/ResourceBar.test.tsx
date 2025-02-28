// /Users/montysharma/Documents/v8/MMV08/Mock_project/interface/__tests__/ResourceBar.test.tsx

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResourceBar } from '../../interface/components/resources/ResourceBar';

describe('ResourceBar Component', () => {
  it('renders correctly with all props', () => {
    const props = {
      label: 'Energy',
      value: 75,
      max: 100,
      color: '#2563eb',
      description: 'Physical and mental vitality'
    };
    
    render(<ResourceBar {...props} />);
    
    // Check that the label and value are rendered
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getByText('75 / 100')).toBeInTheDocument();
    
    // Check that the description is rendered
    expect(screen.getByText('Physical and mental vitality')).toBeInTheDocument();
    
    // Check that the progress bar exists
    const barContainer = screen.getByTestId('resource-bar-energy');
    expect(barContainer).toBeInTheDocument();
  });
  
  it('renders without description when not provided', () => {
    const props = {
      label: 'Stress',
      value: 30,
      max: 100,
      color: '#dc2626'
    };
    
    render(<ResourceBar {...props} />);
    
    // Check that the label and value are rendered
    expect(screen.getByText('Stress')).toBeInTheDocument();
    expect(screen.getByText('30 / 100')).toBeInTheDocument();
    
    // Description should not be present
    expect(screen.queryByText(/stress/i)).not.toHaveTextContent(/description/i);
  });
  
  it('handles values correctly when they exceed maximum', () => {
    const props = {
      label: 'Health',
      value: 120, // Exceeds max
      max: 100,
      color: '#059669'
    };
    
    render(<ResourceBar {...props} />);
    
    // It should display the actual value even if it exceeds max
    expect(screen.getByText('120 / 100')).toBeInTheDocument();
    
    // The bar itself should be capped at 100%
    const barContainer = screen.getByTestId('resource-bar-health');
    const barFill = barContainer.querySelector('.resource-bar-fill');
    expect(barFill).toHaveStyle('width: 100%');
  });
});
