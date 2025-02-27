# The Middle Age Multiverse

A Tauri-based time-travel RPG where players relive their college years with the knowledge and wisdom gained throughout life.

## Project Overview

This game allows players to explore "what if" scenarios, starting at a college campus in 1983. Players manage resources like energy, knowledge, money, social capital, and stress while navigating events and making choices that affect the future.

## Architecture

This project follows Clean Architecture principles:

- **Domain Layer**: Core game logic, entities, and business rules
- **Application Layer**: Use cases that orchestrate domain logic
- **Infrastructure Layer**: State management (Redux), persistence
- **Interface Layer**: UI components and pages

## Development Setup

### Prerequisites
- Node.js 18.x or later
- Rust and Cargo (latest stable)
- Git

### Installation
1. Clone the repository
2. Run `npm install`
3. Start development server: `npm run dev`
4. Start Tauri development: `npm run tauri dev`
5. Run tests: `npm test`

## Key Features

1. **Resource Management**: Track and manage energy, knowledge, money, social, and stress
2. **Time System**: Advance time based on activities
3. **Activity System**: Perform various activities to affect resources
4. **Event System**: Encounter events based on your choices and state
