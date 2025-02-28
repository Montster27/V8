// /Users/montysharma/Documents/v8/MMV08/src/interface/components/activities/ActivityManager.tsx

import React, { useState } from 'react';
import { ActivityList } from './ActivityList';
import { ActivityDetail } from './ActivityDetail';
import { ScheduledActivities } from './ScheduledActivities';
import { ActivityCategory } from '../../../domain/types/ActivityTypes';
import './ActivityManager.css';

/**
 * Main component that combines activity browsing, detail view, and scheduled activities
 */
export const ActivityManager: React.FC = () => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'browse' | 'scheduled'>('browse');
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  
  // Handle activity selection
  const handleSelectActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
  };
  
  // Handle canceling activity selection
  const handleCancelSelection = () => {
    setSelectedActivityId(null);
  };
  
  // Handle successful scheduling
  const handleActivityScheduled = () => {
    setSelectedActivityId(null);
    // Switch to scheduled view after scheduling
    setActiveView('scheduled');
  };
  
  // Handle category selection
  const handleCategorySelect = (category: ActivityCategory | null) => {
    setActiveCategory(category);
    // Clear selected activity when changing category
    setSelectedActivityId(null);
  };
  
  return (
    <div className="activity-manager">
      <div className="activity-manager-header">
        <div className="activity-manager-tabs">
          <button 
            className={`tab ${activeView === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveView('browse')}
          >
            Browse Activities
          </button>
          <button 
            className={`tab ${activeView === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveView('scheduled')}
          >
            Scheduled Activities
          </button>
        </div>
        
        {activeView === 'browse' && (
          <div className="quick-category-filters">
            <button 
              className={`category-filter ${activeCategory === null ? 'active' : ''}`}
              onClick={() => handleCategorySelect(null)}
            >
              All
            </button>
            <button 
              className={`category-filter academic ${activeCategory === 'academic' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('academic')}
            >
              Academic
            </button>
            <button 
              className={`category-filter social ${activeCategory === 'social' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('social')}
            >
              Social
            </button>
            <button 
              className={`category-filter leisure ${activeCategory === 'leisure' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('leisure')}
            >
              Leisure
            </button>
            <button 
              className={`category-filter health ${activeCategory === 'health' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('health')}
            >
              Health
            </button>
            <button 
              className={`category-filter rest ${activeCategory === 'rest' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('rest')}
            >
              Rest
            </button>
          </div>
        )}
      </div>
      
      <div className="activity-manager-content">
        {activeView === 'browse' ? (
          <div className="browse-view">
            <div className="activity-list-container">
              <ActivityList 
                onSelectActivity={handleSelectActivity} 
                filter={activeCategory ? [activeCategory] : undefined}
                showFilters={true}
              />
            </div>
            <div className="activity-detail-container">
              <ActivityDetail 
                activityId={selectedActivityId} 
                onSchedule={handleActivityScheduled}
                onCancel={handleCancelSelection}
              />
            </div>
          </div>
        ) : (
          <div className="scheduled-view">
            <ScheduledActivities />
          </div>
        )}
      </div>
    </div>
  );
};
