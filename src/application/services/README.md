# Game Loop Service

## Overview
The GameLoopService is the central coordinator for the Middle Age Multiverse game systems. It's responsible for:

1. Driving the game's time progression
2. Coordinating resource updates
3. Triggering events based on conditions and time
4. Updating skill progression and decay
5. Managing activity effects and progression

## How It Works

The game loop runs on a configurable interval (default: every 1 second of real time) and performs the following operations with each tick:

1. **Time Management**: Updates the game time based on real time and the current time scale
2. **Resource Updates**: Periodically updates resources like energy, stress, health, and belonging
3. **Event Processing**: Checks for new events to trigger and resolves expired events
4. **Skill Management**: Applies skill decay and updates unlockable skills

## Key Components

- `GameLoopService`: Coordinates all systems
- `useGameLoop` hook: React hook for integrating the game loop with the UI
- `TimeControl` component: UI interface for controlling the game's time

## Example Usage

### In React Components

```typescript
import { useGameLoop } from '../application/hooks/useGameLoop';

function GameScreen() {
  const { isRunning, startGameLoop, stopGameLoop, toggleGameLoop } = useGameLoop();
  
  return (
    <div>
      <button onClick={toggleGameLoop}>
        {isRunning ? 'Pause' : 'Start'} Game
      </button>
    </div>
  );
}
```

### Testing

The game loop is designed to be fully testable with mock services. See the test file for examples of how to test game loop behaviors with mocked time, event, and skill services.

## Configuration

The game loop can be configured with:

- `tickIntervalMs`: How often (in milliseconds) the game loop updates
- `resourceUpdateInterval`: How many ticks between resource updates (for performance optimization)

## Next Steps

1. **Activity System Integration**: Connect the GameLoopService to a future ActivityManager
2. **Save/Load Integration**: Add hooks for saving game state on important events
3. **UI Event Notifications**: Connect triggered events to UI notifications
