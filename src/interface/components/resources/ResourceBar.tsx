import React from 'react';
import './ResourceBar.css';

interface ResourceBarProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  color: string;
  icon?: string;
  showValue?: boolean;
  resourceType?: string;
  description?: string;
}

/**
 * ResourceBar component displays a progress bar for a game resource
 * with customizable appearance and optional value display
 */
export const ResourceBar: React.FC<ResourceBarProps> = ({
  value,
  max,
  min = 0,
  label,
  color,
  icon,
  showValue = true,
  resourceType,
  description
}) => {
  // Calculate percentage for the progress bar
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;
  
  // Ensure percentage is within 0-100 range
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // The resource type ID defaults to lowercase label if not provided
  const resourceId = resourceType || label.toLowerCase();
  
  return (
    <div className="resource-bar-container" data-testid={`resource-bar-${resourceId}`}>
      <div className="resource-label">
        {icon && <span className={`resource-icon fa fa-${icon}`}></span>}
        <span>{label}</span>
        {showValue && (
          <span className="resource-value">
            {`${value} / ${max}`}
          </span>
        )}
      </div>
      
      {description && (
        <div className="resource-description">
          {description}
        </div>
      )}
      
      <div className="resource-bar-background">
        <div 
          className="resource-bar-fill" 
          style={{ 
            width: `${clampedPercentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

export default ResourceBar;
