import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './infrastructure/state/store';
import { ResourcesPanel } from './interface/components/resources/ResourcesPanel';
import SkillsPanel from './interface/components/skills/SkillsPanel';
import EventsPanel from './interface/components/events/EventsPanel';
import { TimeControl } from './interface/components/time/TimeControl';
import { ActivityManager } from './interface/components/activities/ActivityManager';
import './App.css';

function App() {
  const [showActivities, setShowActivities] = useState(false);
  
  return (
    <Provider store={store}>
      <div className="App">
        <header>
          <h1>The Middle Age Multiverse</h1>
          <p>Life Path Simulation</p>
          
          <div className="view-toggle">
            <button 
              className={`toggle-button ${!showActivities ? 'active' : ''}`}
              onClick={() => setShowActivities(false)}
            >
              Main Dashboard
            </button>
            <button 
              className={`toggle-button ${showActivities ? 'active' : ''}`}
              onClick={() => setShowActivities(true)}
            >
              Activities
            </button>
          </div>
        </header>
        
        <main>
          <TimeControl />
          
          {showActivities ? (
            <div className="activities-container">
              <ActivityManager />
            </div>
          ) : (
            <>
              <SkillsPanel />
              <div className="panels-container">
                <ResourcesPanel />
                <EventsPanel />
              </div>
            </>
          )}
        </main>
        
        <footer>
          <p>©2025 Middle Age Multiverse Project</p>
        </footer>
      </div>
    </Provider>
  );
}

export default App;
