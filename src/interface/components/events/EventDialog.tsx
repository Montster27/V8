// /Users/montysharma/Documents/v8/MMV08/src/interface/components/events/EventDialog.tsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActiveEvent } from '../../../domain/types/EventTypes';
import EventChoice from './EventChoice';
import { resolveEvent, selectEvent } from '../../../infrastructure/state/slices/eventsSlice';
import './EventDialog.css';

interface EventDialogProps {
  event: ActiveEvent;
  onClose?: () => void; // Optional callback when dialog is closed
}

/**
 * Component for displaying an event and its choices
 */
const EventDialog: React.FC<EventDialogProps> = ({ event, onClose }) => {
  const dispatch = useDispatch();
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcome, setOutcome] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  // Calculate time remaining if the event has a time limit
  useEffect(() => {
    if (event.endTime) {
      const endTime = new Date(event.endTime).getTime();
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      
      setTimeRemaining(remaining);
      
      // Update every second
      const interval = setInterval(() => {
        const now = Date.now();
        const newRemaining = Math.max(0, endTime - now);
        setTimeRemaining(newRemaining);
        
        // Auto-resolve if time runs out (this would be handled by EventManager in practice)
        if (newRemaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
    return undefined;
  }, [event.endTime]);

  // Handle choice selection
  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
    
    // In a real implementation, we would also check if the choice is valid
    // and calculate success/failure here
    
    // Simulate outcome
    const choice = event.data.choices.find(c => c.id === choiceId);
    if (choice) {
      const isSuccessful = choice.probability === undefined || Math.random() < choice.probability;
      
      setOutcome({
        text: isSuccessful 
          ? (choice.effects.narrative || 'You succeeded.')
          : (choice.failText || 'Your attempt failed.'),
        success: isSuccessful
      });
      
      setShowOutcome(true);
      
      // Dispatch resolve action after showing outcome
      setTimeout(() => {
        dispatch(resolveEvent({
          eventId: event.data.id,
          resolution: {
            eventId: event.data.id,
            timestamp: new Date().toISOString(),
            choiceId,
            effects: isSuccessful ? choice.effects : (choice.failEffects || { narrative: choice.failText || 'Your attempt failed.' }),
            successful: isSuccessful
          }
        }));
        
        // Deselect event
        dispatch(selectEvent(null));
        
        // Call onClose callback if provided
        if (onClose) {
          onClose();
        }
      }, 2000);
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="event-dialog">
      <div className="event-dialog-header">
        <h2>{event.data.title}</h2>
        {timeRemaining !== null && (
          <div className={`event-timer ${timeRemaining < 10000 ? 'event-timer-warning' : ''}`}>
            Time remaining: {formatTimeRemaining(timeRemaining)}
          </div>
        )}
      </div>
      
      <div className="event-dialog-content">
        <p>{event.data.description}</p>
        
        {event.data.image && (
          <div className="event-image">
            <img src={event.data.image} alt={event.data.title} />
          </div>
        )}
        
        {showOutcome ? (
          <div className={`event-outcome ${outcome?.success ? 'event-outcome-success' : 'event-outcome-failure'}`}>
            {outcome?.text}
          </div>
        ) : (
          <div className="event-choices">
            {event.data.choices.map(choice => (
              <EventChoice
                key={choice.id}
                choice={choice}
                disabled={!!selectedChoiceId}
                onSelect={handleChoiceSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDialog;