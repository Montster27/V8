// /Users/montysharma/Documents/v8/MMV08/src/interface/components/activities/TimeSelector.tsx

import React, { useState, useEffect } from 'react';
import { useActivities } from '../../../application/hooks/useActivities';
import { format, addHours, addMinutes, startOfDay, setHours, setMinutes } from 'date-fns';
import './TimeSelector.css';

interface TimeSelectorProps {
  initialTime: number; // Unix timestamp in milliseconds
  durationMinutes: number;
  onChange: (timestamp: number) => void;
  onValidityChange?: (isValid: boolean) => void;
}

/**
 * An enhanced time selection component that provides a more intuitive
 * interface for selecting activity start times
 */
export const TimeSelector: React.FC<TimeSelectorProps> = ({
  initialTime,
  durationMinutes,
  onChange,
  onValidityChange
}) => {
  const { isTimeSlotAvailable } = useActivities();
  
  // Component state
  const [selectedTime, setSelectedTime] = useState<Date>(new Date(initialTime));
  const [isValid, setIsValid] = useState<boolean>(true);
  
  // Time increment options
  const hourIncrements = [1, 2, 4, 8];
  const minuteIncrements = [15, 30, 45];
  
  // Check validity when time changes
  useEffect(() => {
    const timestamp = selectedTime.getTime();
    const valid = isTimeSlotAvailable(timestamp, durationMinutes);
    
    setIsValid(valid);
    
    if (onValidityChange) {
      onValidityChange(valid);
    }
    
    onChange(timestamp);
  }, [selectedTime, durationMinutes, isTimeSlotAvailable, onChange, onValidityChange]);
  
  // Handlers for time adjustments
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    // Preserve the time portion of the current selection
    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setSelectedTime(newDate);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newTime = new Date(selectedTime);
    newTime.setHours(hours, minutes, 0, 0);
    setSelectedTime(newTime);
  };
  
  const handleIncrementHour = (hours: number) => {
    setSelectedTime(prev => addHours(prev, hours));
  };
  
  const handleIncrementMinute = (minutes: number) => {
    setSelectedTime(prev => addMinutes(prev, minutes));
  };
  
  const handleSetTime = (hours: number, minutes: number) => {
    const newTime = new Date(selectedTime);
    newTime.setHours(hours, minutes, 0, 0);
    setSelectedTime(newTime);
  };
  
  // Common time presets
  const timePresets = [
    { label: 'Morning', hours: 8, minutes: 0 },
    { label: 'Noon', hours: 12, minutes: 0 },
    { label: 'Afternoon', hours: 15, minutes: 0 },
    { label: 'Evening', hours: 19, minutes: 0 },
    { label: 'Night', hours: 22, minutes: 0 }
  ];
  
  // Format time for display
  const formattedDate = format(selectedTime, 'yyyy-MM-dd');
  const formattedTime = format(selectedTime, 'HH:mm');
  const displayDateTime = format(selectedTime, 'EEEE, MMMM d, yyyy h:mm a');
  
  return (
    <div className={`time-selector ${!isValid ? 'invalid' : ''}`}>
      <div className="time-selector-display">
        <span className="selected-time">{displayDateTime}</span>
        {!isValid && (
          <span className="time-conflict-warning">
            This time conflicts with another scheduled activity
          </span>
        )}
      </div>
      
      <div className="time-selector-inputs">
        <div className="date-input">
          <label htmlFor="date-select">Date:</label>
          <input
            id="date-select"
            type="date"
            value={formattedDate}
            onChange={handleDateChange}
          />
        </div>
        
        <div className="time-input">
          <label htmlFor="time-select">Time:</label>
          <input
            id="time-select"
            type="time"
            value={formattedTime}
            onChange={handleTimeChange}
          />
        </div>
      </div>
      
      <div className="time-selector-quick-actions">
        <div className="time-presets">
          <span>Quick select:</span>
          {timePresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleSetTime(preset.hours, preset.minutes)}
              className="time-preset-button"
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        <div className="time-adjustments">
          <div className="hours-adjustment">
            <span>Add hours:</span>
            {hourIncrements.map(hours => (
              <React.Fragment key={hours}>
                <button
                  onClick={() => handleIncrementHour(-hours)}
                  className="time-adjust-button"
                >
                  -{hours}h
                </button>
                <button
                  onClick={() => handleIncrementHour(hours)}
                  className="time-adjust-button"
                >
                  +{hours}h
                </button>
              </React.Fragment>
            ))}
          </div>
          
          <div className="minutes-adjustment">
            <span>Add minutes:</span>
            {minuteIncrements.map(minutes => (
              <React.Fragment key={minutes}>
                <button
                  onClick={() => handleIncrementMinute(-minutes)}
                  className="time-adjust-button"
                >
                  -{minutes}m
                </button>
                <button
                  onClick={() => handleIncrementMinute(minutes)}
                  className="time-adjust-button"
                >
                  +{minutes}m
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
