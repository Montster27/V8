// /Users/montysharma/Documents/v8/MMV08/src/interface/components/activities/ActivityDetail.tsx

import React, { useState } from 'react';
import { useActivities } from '../../../application/hooks/useActivities';
import { useSelector } from 'react-redux';
import { RootState } from '../../../infrastructure/state/store';
import { ResourceType } from '../../../domain/ResourceTypes';
import { formatDate } from '../../../domain/utils/dateUtils';
import './ActivityDetail.css';

interface ActivityDetailProps {
  activityId: string | null;
  onSchedule?: (activityId: string, startTime: number) => void;
  onCancel?: () => void;
}

/**
 * Component that displays details for a selected activity
 * and allows scheduling it
 */
export const ActivityDetail: React.FC<ActivityDetailProps> = ({
  activityId,
  onSchedule,
  onCancel
}) => {
  const { getActivity, scheduleActivity } = useActivities();
  const currentTime = useSelector((state: RootState) => state.time.timestamp);
  
  const [startTime, setStartTime] = useState<number>(currentTime);
  const [schedulingMessage, setSchedulingMessage] = useState<string | null>(null);
  
  // Get activity details
  const activity = activityId ? getActivity(activityId) : null;
  
  if (!activity) {
    return (
      <div className="activity-detail">
        <div className="no-activity-selected">
          <p>Select an activity to view details</p>
        </div>
      </div>
    );
  }
  
  // Format resource effects for display
  const formatResourceEffect = (resourceType: string, amount: number) => {
    const formattedType = resourceType.charAt(0).toUpperCase() + resourceType.slice(1).toLowerCase();
    return `${amount >= 0 ? '+' : ''}${amount} ${formattedType}`;
  };
  
  // Handle scheduling the activity
  const handleSchedule = () => {
    if (!activityId) return;
    
    const result = scheduleActivity(activityId, startTime);
    
    if (result) {
      setSchedulingMessage('Activity scheduled successfully!');
      setTimeout(() => setSchedulingMessage(null), 3000);
      
      if (onSchedule) {
        onSchedule(activityId, startTime);
      }
    } else {
      setSchedulingMessage('Failed to schedule activity. Check for conflicts.');
      setTimeout(() => setSchedulingMessage(null), 3000);
    }
  };
  
  // Handle time selection change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = new Date(e.target.value).getTime();
    setStartTime(timestamp);
  };
  
  // Calculate end time
  const endTime = activity.duration && typeof activity.duration === 'number'
    ? new Date(startTime + activity.duration * 60 * 1000)
    : null;
  
  return (
    <div className="activity-detail">
      <div className="activity-detail-header">
        <h3>{activity.name}</h3>
        <span className="activity-category">{activity.category}</span>
      </div>
      
      <div className="activity-description">
        <p>{activity.description}</p>
      </div>
      
      <div className="activity-metadata">
        <div className="activity-duration">
          <strong>Duration:</strong> {typeof activity.duration === 'number' 
            ? `${activity.duration} minutes` 
            : activity.duration}
        </div>
        
        <div className="activity-location">
          <strong>Location:</strong> {activity.location.name}
        </div>
        
        <div className="activity-repeatability">
          <strong>Can be repeated:</strong> {activity.repeatability.replace('_', ' ')}
        </div>
      </div>
      
      <div className="activity-effects">
        <h4>Effects:</h4>
        <ul>
          {activity.effects.map((effect, index) => (
            <li key={index} className={effect.amount >= 0 ? 'positive' : 'negative'}>
              {formatResourceEffect(effect.resourceType, effect.amount)}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="activity-scheduling">
        <h4>Schedule Activity</h4>
        <div className="time-selector">
          <label htmlFor="start-time">Start Time:</label>
          <input
            id="start-time"
            type="datetime-local"
            value={formatDate(new Date(startTime), "yyyy-MM-dd'T'HH:mm")}
            onChange={handleTimeChange}
          />
        </div>
        
        {endTime && (
          <div className="end-time">
            <strong>End Time:</strong> {formatDate(endTime, "h:mm a, MMMM d, yyyy")}
          </div>
        )}
        
        <div className="scheduling-actions">
          <button className="schedule-button" onClick={handleSchedule}>
            Schedule
          </button>
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
        
        {schedulingMessage && (
          <div className={`scheduling-message ${schedulingMessage.includes('Failed') ? 'error' : 'success'}`}>
            {schedulingMessage}
          </div>
        )}
      </div>
    </div>
  );
};
