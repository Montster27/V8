// /Users/montysharma/Documents/v8/MMV08/src/application/hooks/useGameLoop.ts

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../infrastructure/state/store';
import { TimeManager } from '../../domain/services/TimeManager';
import EventManager from '../../domain/services/EventManager';
import { SkillManager } from '../../domain/services/SkillManager';
import { ActivityManager } from '../../domain/services/ActivityManager';
import { GameLoopService, GameLoopConfig } from '../services/GameLoopService';
import { TimeValue } from '../../domain/valueObjects/TimeValue';

/**
 * Custom hook to access and control the game loop
 */
export function useGameLoop(config?: Partial<GameLoopConfig>) {
  const dispatch = useDispatch<AppDispatch>();
  const timeState = useSelector((state: RootState) => state.time);
  const resourcesState = useSelector((state: RootState) => state.resources);
  const skillsState = useSelector((state: RootState) => state.skills);
  const eventsState = useSelector((state: RootState) => state.events);
  const activitiesState = useSelector((state: RootState) => state.activities);
  
  const [isRunning, setIsRunning] = useState(false);
  const gameLoopRef = useRef<GameLoopService | null>(null);
  
  // Create a TimeManager instance from Redux state
  const createTimeManager = (): TimeManager => {
    const timeManager = new TimeManager({
      initialTimestamp: timeState.timestamp,
      timeScale: timeState.timeScale,
      autoStart: timeState.running
    });
    
    // Restore events
    const managerState = {
      currentTime: timeState.timestamp,
      timeScale: timeState.timeScale,
      running: timeState.running,
      events: timeState.events
    };
    
    timeManager.restoreState(managerState);
    return timeManager;
  };
  
  // Create an EventManager instance with game state access
  const createEventManager = (timeManager: TimeManager): EventManager => {
    // Create an adapter to the game state that EventManager can use
    const gameState = {
      getSkillLevel: (skillId: string) => {
        // This would need proper implementation based on how skills are stored
        return 1; // Placeholder
      },
      getResourceValue: (type: string) => {
        return resourcesState[type]?.value || 0;
      },
      hasResolvedEvent: (eventId: string) => {
        // Check if the event is in resolved events
        return eventsState.resolved.some(event => event.id === eventId);
      },
      getCurrentTime: () => {
        return new TimeValue(timeState.timestamp, timeState.timeScale);
      },
      getResolvedEvents: () => {
        return eventsState.resolved;
      },
      getActiveActivities: () => {
        // Get activities from the activities state
        return activitiesState.scheduled.filter(
          activity => !activity.isCompleted && 
          activity.startTime <= timeState.timestamp && 
          activity.endTime >= timeState.timestamp
        );
      }
    };
    
    // For now, return a basic EventManager
    // In a real implementation, we would restore state from Redux
    return new EventManager(gameState, new SkillManager());
  };
  
  // Create a SkillManager instance from Redux state
  const createSkillManager = (): SkillManager => {
    // For now, return a basic SkillManager
    // In a real implementation, we would restore state from Redux
    return SkillManager.createDefault();
  };
  
  // Create an ActivityManager instance from Redux state
  const createActivityManager = (): ActivityManager => {
    const manager = new ActivityManager();
    
    // Register all available activities
    Object.values(activitiesState.available).forEach(activity => {
      manager.registerActivity(activity);
    });
    
    // Restore state from Redux
    const state = {
      activities: activitiesState.available,
      scheduledActivities: activitiesState.scheduled,
      completedActivities: activitiesState.completed,
      activityHistory: activitiesState.history
    };
    
    manager.restoreState(state);
    return manager;
  };
  
  // Initialize or update the game loop service
  useEffect(() => {
    // Create services
    const timeManager = createTimeManager();
    const skillManager = createSkillManager();
    const eventManager = createEventManager(timeManager);
    const activityManager = createActivityManager();
    
    // Create the game loop service
    const defaultConfig: GameLoopConfig = {
      tickIntervalMs: 1000,
      resourceUpdateInterval: 5,
    };
    
    const gameLoop = new GameLoopService(
      timeManager,
      eventManager,
      skillManager,
      activityManager,
      dispatch,
      {
        ...defaultConfig,
        ...config
      }
    );
    
    gameLoopRef.current = gameLoop;
    
    // Set initial running state
    setIsRunning(timeState.running);
    
    // Start the game loop if it should be running
    if (timeState.running) {
      gameLoop.start();
    }
    
    // Clean up on unmount
    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.dispose();
      }
    };
  }, []);
  
  // Update the running state when it changes in Redux
  useEffect(() => {
    const gameLoop = gameLoopRef.current;
    if (!gameLoop) return;
    
    if (timeState.running && !gameLoop.isRunning()) {
      gameLoop.start();
      setIsRunning(true);
    } else if (!timeState.running && gameLoop.isRunning()) {
      gameLoop.stop();
      setIsRunning(false);
    }
  }, [timeState.running]);
  
  // Functions to control the game loop
  const startGameLoop = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.start();
      setIsRunning(true);
    }
  };
  
  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
      setIsRunning(false);
    }
  };
  
  const toggleGameLoop = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.toggle();
      setIsRunning(gameLoopRef.current.isRunning());
    }
  };
  
  // Return the controls and state
  return {
    isRunning,
    startGameLoop,
    stopGameLoop,
    toggleGameLoop,
    gameLoop: gameLoopRef.current
  };
}
