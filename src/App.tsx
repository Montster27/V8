import React from 'react';
import { Provider } from 'react-redux';
import { store } from './infrastructure/state/store';
import { ResourcesPanel } from './interface/components/resources/ResourcesPanel';
import SkillsPanel from './interface/components/skills/SkillsPanel';
import EventsPanel from './interface/components/events/EventsPanel';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header>
          <h1>The Middle Age Multiverse</h1>
          <p>Life Path Simulation</p>
        </header>
        
        <main>
          <SkillsPanel />
          <div className="panels-container">
            <ResourcesPanel />
            <EventsPanel />
          </div>
        </main>
        
        <footer>
          <p>©2025 Middle Age Multiverse Project</p>
        </footer>
      </div>
    </Provider>
  );
}

export default App;
