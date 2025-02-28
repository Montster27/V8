import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ResourceBar } from './ResourceBar';
import { 
  addResource, 
  subtractResource,
  resetResources,
  ResourcesState
} from '../../../infrastructure/state/resourcesSlice';
import { ResourceType } from '../../../domain/ResourceTypes';
import './ResourceBar.css';
import './ResourcesPanel.css';

interface ResourcesPanelProps {
  showControls?: boolean;
}

interface RootState {
  resources: ResourcesState;
}

/**
 * ResourcesPanel component displays all player resources with optional controls
 * for incrementing and decrementing their values
 */
export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
  showControls = true // Changed to true by default to match tests
}) => {
  const resources = useSelector((state: RootState) => state.resources);
  const dispatch = useDispatch();
  
  const handleIncrement = (resourceType: ResourceType) => {
    dispatch(addResource({ resourceType, amount: 10 }));
  };
  
  const handleDecrement = (resourceType: ResourceType) => {
    dispatch(subtractResource({ resourceType, amount: 10 }));
  };
  
  const handleReset = () => {
    dispatch(resetResources());
  };
  
  return (
    <div className="resources-panel">
      <h2 className="panel-title">Resources</h2>
      
      <div className="resources-grid">
        {Object.entries(resources).map(([key, resource]) => (
          <div key={key} className="resource-container">
            <ResourceBar
              value={resource.value}
              max={resource.max}
              min={resource.min}
              label={resource.label}
              color={resource.color}
              icon={resource.icon}
              description={resource.description}
              showValue={true}
              resourceType={key}
            />
            
            {showControls && (
              <div className="resource-controls">
                <button 
                  className="control-button decrement"
                  onClick={() => handleDecrement(key as ResourceType)}
                  disabled={resource.value <= resource.min}
                  data-testid={`${key}-subtract`}
                >
                  -
                </button>
                <button 
                  className="control-button increment"
                  onClick={() => handleIncrement(key as ResourceType)}
                  disabled={resource.value >= resource.max}
                  data-testid={`${key}-add`}
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {showControls && (
        <div className="reset-controls">
          <button 
            className="reset-button"
            onClick={handleReset}
            data-testid="reset-resources"
          >
            Reset Resources
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourcesPanel;
