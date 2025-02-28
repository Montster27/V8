// /Users/montysharma/Documents/v8/MMV08/src/interface/components/time/TimeControl.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  startTime, 
  pauseTime, 
  setTimeScale 
} from '../../../infrastructure/state/slices/timeSlice';
import { RootState } from '../../../infrastructure/state/store';
import { useGameLoop } from '../../../application/hooks/useGameLoop';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';

/**
 * Component for controlling and displaying game time
 */
export const TimeControl: React.FC = () => {
  const dispatch = useDispatch();
  const { timestamp, timeScale, running } = useSelector((state: RootState) => state.time);
  const { isRunning, toggleGameLoop } = useGameLoop();
  
  // Format the current time for display
  const [formattedTime, setFormattedTime] = useState('');
  
  useEffect(() => {
    // Create a TimeValue from the timestamp
    const timeValue = new TimeValue(timestamp);
    
    // Format the time (assuming TimeValue has appropriate formatting methods)
    // If not, we can format it here based on timestamp
    setFormattedTime(timeValue.toString() || 
      new Date(timestamp).toLocaleString());
  }, [timestamp]);
  
  // Speed options for the time scale
  const speedOptions = [
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '5x', value: 5 },
    { label: '10x', value: 10 }
  ];
  
  // Handler for toggling the time
  const handleToggleTime = () => {
    if (running) {
      dispatch(pauseTime());
    } else {
      dispatch(startTime());
    }
    toggleGameLoop();
  };
  
  // Handler for changing the time scale
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScale = parseFloat(e.target.value);
    dispatch(setTimeScale(newScale));
  };
  
  return (
    <div className="time-control">
      <div className="time-display">
        <h3>Current Time</h3>
        <div className="current-time">{formattedTime}</div>
      </div>
      
      <div className="time-controls">
        <button onClick={handleToggleTime}>
          {running ? 'Pause' : 'Start'}
        </button>
        
        <div className="speed-control">
          <label htmlFor="time-scale">Speed:</label>
          <select 
            id="time-scale" 
            value={timeScale} 
            onChange={handleSpeedChange}
            disabled={running}
          >
            {speedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
