import React from 'react';
import { Provider } from 'react-redux';
import { store } from './infrastructure/state/store';
import { ResourcesPanel } from './interface/components/resources/ResourcesPanel';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header>
          <h1>The Middle Age Multiverse</h1>
          <p>Resource Management Test</p>
        </header>
        
        <main>
          <ResourcesPanel />
        </main>
        
        <footer>
          <p>Mock project for end-to-end testing of the setup</p>
        </footer>
      </div>
    </Provider>
  );
}

export default App;
