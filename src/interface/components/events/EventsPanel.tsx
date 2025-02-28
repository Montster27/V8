// /Users/montysharma/Documents/v8/MMV08/src/interface/components/events/EventsPanel.tsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectActiveEvents, 
  selectSelectedEvent,
  selectEvent
} from '../../../infrastructure/state/slices/eventsSlice';
import EventDialog from './EventDialog';
import './EventsPanel.css';

/**
 * Component for displaying a list of active events and providing event notifications
 */
const EventsPanel: React.FC = () => {
  const dispatch = useDispatch();
  const activeEvents = useSelector(selectActiveEvents);
  const selectedEvent = useSelector(selectSelectedEvent);
  const [showDialog, setShowDialog] = useState(false);

  // Handle clicking an event notification
  const handleEventClick = (eventId: string) => {
    dispatch(selectEvent(eventId));
    setShowDialog(true);
  };

  // Handle closing the event dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
    dispatch(selectEvent(null));
  };

  // Check if there are no active events
  if (activeEvents.length === 0) {
    return (
      <div className="events-panel events-panel-empty">
        <p>No active events</p>
      </div>
    );
  }

  return (
    <div className="events-panel">
      <h3 className="events-panel-title">Active Events</h3>
      
      <div className="event-list">
        {activeEvents.map(event => (
          <div 
            key={event.data.id}
            className={`event-notification ${selectedEvent?.data.id === event.data.id ? 'event-notification-selected' : ''}`}
            onClick={() => handleEventClick(event.data.id)}
          >
            <div className="event-notification-category">{event.data.category}</div>
            <div className="event-notification-title">{event.data.title}</div>
            {event.endTime && (
              <div className="event-notification-time">
                <i className="time-icon">⏱</i>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedEvent && showDialog && (
        <div className="event-dialog-overlay">
          <EventDialog 
            event={selectedEvent} 
            onClose={handleCloseDialog}
          />
        </div>
      )}
    </div>
  );
};

export default EventsPanel;