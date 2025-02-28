// /Users/montysharma/Documents/v8/MMV08/src/interface/components/activities/ScheduledActivities.tsx

import React from 'react';
import { useActivities } from '../../../application/hooks/useActivities';
import { useSelector } from 'react-redux';
import { RootState } from '../../../infrastructure/state/store';
import { formatDate } from '../../../domain/utils/dateUtils';
import './ScheduledActivities.css';

interface ScheduledActivitiesProps {
  onCancelActivity?: (activityId: string, startTime: number) => void;
}

/**
 * Component that displays currently scheduled activities
 */
export const ScheduledActivities: React.FC<ScheduledActivitiesProps> = ({
  onCancelActivity
}) => {
  const { scheduledActivities, getActivity, cancelActivity } = useActivities();
  const currentTime = useSelector((state: RootState) => state.time.timestamp);
  
  // Sort activities by start time
  const sortedActivities = [...scheduledActivities].sort((a, b) => a.startTime - b.startTime);
  
  // Separate active and upcoming activities
  const activeActivities = sortedActivities.filter(
    activity => activity.startTime <= currentTime && activity.endTime >= currentTime
  );
  
  const upcomingActivities = sortedActivities.filter(
    activity => activity.startTime > currentTime
  );
  
  // Format time for display
  const formatTime = (timestamp: number): string => {
    return formatDate(new Date(timestamp), "h:mm a, MMMM d");
  };
  
  // Handle activity cancellation
  const handleCancel = (activityId: string, startTime: number) => {
    const success = cancelActivity(activityId, startTime);
    
    if (success && onCancelActivity) {
      onCancelActivity(activityId, startTime);
    }
  };
  
  // Calculate activity progress for active activities
  const calculateProgress = (startTime: number, endTime: number): number => {
    const total = endTime - startTime;
    const elapsed = currentTime - startTime;
    return Math.min(Math.max(0, (elapsed / total) * 100), 100);
  };
  
  return (
    <div className="scheduled-activities">
      <div className="active-activities">
        <h3>Active Activities</h3>
        {activeActivities.length === 0 ? (
          <div className="no-activities">No activities in progress</div>
        ) : (
          <div className="activity-items">
            {activeActivities.map((scheduledActivity) => {
              const activity = getActivity(scheduledActivity.activityId);
              const progress = calculateProgress(scheduledActivity.startTime, scheduledActivity.endTime);
              
              return (
                <div key={`${scheduledActivity.activityId}-${scheduledActivity.startTime}`} className="activity-item active">
                  <div className="activity-header">
                    <h4>{activity?.name || 'Unknown Activity'}</h4>
                    <span className="activity-category">{activity?.category || 'unknown'}</span>
                  </div>
                  
                  <div className="activity-times">
                    <div>Started: {formatTime(scheduledActivity.startTime)}</div>
                    <div>Ends: {formatTime(scheduledActivity.endTime)}</div>
                  </div>
                  
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    <span className="progress-text">{Math.round(progress)}% complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="upcoming-activities">
        <h3>Upcoming Activities</h3>
        {upcomingActivities.length === 0 ? (
          <div className="no-activities">No upcoming activities scheduled</div>
        ) : (
          <div className="activity-items">
            {upcomingActivities.map((scheduledActivity) => {
              const activity = getActivity(scheduledActivity.activityId);
              
              return (
                <div key={`${scheduledActivity.activityId}-${scheduledActivity.startTime}`} className="activity-item upcoming">
                  <div className="activity-header">
                    <h4>{activity?.name || 'Unknown Activity'}</h4>
                    <span className="activity-category">{activity?.category || 'unknown'}</span>
                  </div>
                  
                  <div className="activity-times">
                    <div>Starts: {formatTime(scheduledActivity.startTime)}</div>
                    <div>Ends: {formatTime(scheduledActivity.endTime)}</div>
                  </div>
                  
                  <div className="activity-actions">
                    <button 
                      className="cancel-activity" 
                      onClick={() => handleCancel(scheduledActivity.activityId, scheduledActivity.startTime)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
