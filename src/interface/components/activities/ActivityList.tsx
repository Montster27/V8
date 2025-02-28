// /Users/montysharma/Documents/v8/MMV08/src/interface/components/activities/ActivityList.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useActivities } from '../../../application/hooks/useActivities';
import { ActivityCategory } from '../../../domain/types/ActivityTypes';
import { ActivityFilters, ActivityFilterState } from './ActivityFilters';
import { IActivity } from '../../../domain/models/Activity';
import './ActivityList.css';

interface ActivityListProps {
  filter?: ActivityCategory | ActivityCategory[];
  onSelectActivity?: (activityId: string) => void;
  showFilters?: boolean;
}

/**
 * Component that displays a list of available activities
 */
export const ActivityList: React.FC<ActivityListProps> = ({ 
  filter: initialFilter,
  onSelectActivity,
  showFilters = true
}) => {
  const { 
    activities, 
    selectedActivityId, 
    selectActivity 
  } = useActivities();
  
  // State for filters
  const [filters, setFilters] = useState<ActivityFilterState>({
    categories: initialFilter ? (Array.isArray(initialFilter) ? initialFilter : [initialFilter]) : [],
    search: '',
    sortBy: 'name-asc',
    locations: [],
    hideUnavailable: false
  });
  
  // Get unique locations from all activities
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    activities.forEach(activity => {
      if (activity.location && activity.location.name) {
        locations.add(activity.location.name);
      }
    });
    return Array.from(locations);
  }, [activities]);
  
  // Handle activity click
  const handleActivityClick = useCallback((activityId: string) => {
    selectActivity(activityId);
    if (onSelectActivity) {
      onSelectActivity(activityId);
    }
  }, [selectActivity, onSelectActivity]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: ActivityFilterState) => {
    setFilters(newFilters);
  }, []);
  
  // Apply all filters to activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter(activity => {
        // Filter by category if categories are selected
        if (filters.categories.length > 0 && !filters.categories.includes(activity.category as ActivityCategory)) {
          return false;
        }
        
        // Filter by search term
        if (filters.search && !activity.name.toLowerCase().includes(filters.search.toLowerCase()) && 
            !activity.description.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        
        // Filter by location
        if (filters.locations.length > 0 && 
            (!activity.location || !filters.locations.includes(activity.location.name))) {
          return false;
        }
        
        // Filter by availability (placeholder, actual implementation would check with ActivityManager)
        if (filters.hideUnavailable) {
          // For now, assume all activities are available
          // This would need real logic based on scheduling constraints
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        switch (filters.sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'duration-asc':
            return getActivityDuration(a) - getActivityDuration(b);
          case 'duration-desc':
            return getActivityDuration(b) - getActivityDuration(a);
          default:
            return 0;
        }
      });
  }, [activities, filters]);
  
  // Helper to get activity duration as a number
  const getActivityDuration = (activity: IActivity): number => {
    if (typeof activity.duration === 'number') {
      return activity.duration;
    }
    // Map duration enum to minutes if not a number
    // This is a placeholder - actual implementation would map from the enum
    return 60; // Default to 60 minutes
  };
  
  return (
    <div className="activity-list">
      <h3>Available Activities</h3>
      
      {showFilters && (
        <ActivityFilters 
          onFilterChange={handleFilterChange} 
          locations={uniqueLocations}
        />
      )}
      
      <div className="activity-count">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>
      
      {filteredActivities.length === 0 ? (
        <div className="no-activities">
          {filters.search || filters.categories.length > 0 || filters.locations.length > 0 ?
            "No activities match your filters" :
            "No activities available"}
        </div>
      ) : (
        <div className="activity-items">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id}
              className={`activity-item ${selectedActivityId === activity.id ? 'selected' : ''} category-${activity.category}`}
              onClick={() => handleActivityClick(activity.id)}
            >
              <h4>{activity.name}</h4>
              <div className="activity-details">
                <span className="activity-category">{activity.category}</span>
                <span className="activity-duration">
                  {typeof activity.duration === 'number' 
                    ? `${activity.duration} min` 
                    : activity.duration}
                </span>
              </div>
              <p className="activity-description">{activity.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
