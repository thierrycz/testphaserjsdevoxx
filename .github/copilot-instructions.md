# Copilot Instructions for Phaser 4 + React + TypeScript Template

## Project Overview

This is a Phaser 4 game development template with React 19 integration and TypeScript. The key architectural pattern is a React-Phaser bridge that enables seamless communication between React components and the game engine.

**Core Stack:**
- **Phaser 4** - Game engine
- **React 19** - UI framework
- **Vite 6** - Build tool (with separate dev and prod configs)
- **TypeScript 5.7** - Type safety

## Build & Development Commands

### Running the Project
```bash
npm install                 # Install dependencies
npm run dev                 # Start dev server (http://localhost:8080) with anonymous metrics logging
npm run dev-nolog          # Start dev server without metrics logging
npm run build              # Production build → dist/ folder
npm run build-nolog        # Production build without metrics logging
```

## High-Level Architecture

### React-Phaser Bridge Pattern

The core architectural pattern is a React ↔ Phaser event-driven bridge:

1. **`PhaserGame.tsx`** - Main React component that:
   - Initializes the Phaser game instance via `StartGame()`
   - Exposes game and scene references through React ref (`IRefPhaserGame`)
   - Listens for `"current-scene-ready"` events via EventBus
   - Manages game lifecycle (creation on mount, destruction on unmount)

2. **`EventBus.ts`** - Central communication hub:
   - Wraps Phaser's `Events.EventEmitter`
   - Enables bidirectional messaging between React and game scenes
   - Scenes emit `"current-scene-ready"` to expose themselves to React

3. **Game initialization flow**:
   - React renders `<PhaserGame ref={phaserRef} currentActiveScene={handler} />`
   - Component calls `StartGame()` to initialize Phaser
   - Scenes emit `"current-scene-ready"` event when ready
   - React receives scene instance and can dispatch events back via `EventBus.emit()`

### File Structure

```
src/
├── main.tsx              # React app bootstrap
├── App.tsx               # Main React component (renders PhaserGame)
├── PhaserGame.tsx        # React ↔ Phaser bridge component
├── game/
│   ├── main.ts           # Phaser config and game instantiation
│   ├── EventBus.ts       # Phaser event emitter wrapper
│   └── scenes/           # All Phaser Scene classes
public/
├── assets/               # Static game assets (images, audio, etc.)
└── style.css             # Global styles
vite/
├── config.dev.mjs        # Dev server config (port: 8080)
└── config.prod.mjs       # Production build config
```

## Key Conventions

### Scene Exposure to React

**IMPORTANT:** Every Phaser Scene must emit `"current-scene-ready"` when it's ready for React to access it:

```typescript
// In any Phaser Scene class
create() {
    // ... game initialization ...
    EventBus.emit('current-scene-ready', this);
}
```

**Why:** React cannot access the scene unless this event fires. Timing is flexible—emit it only when needed (e.g., after async data loads).

### Asset Loading

Assets are handled two ways:

1. **Bundled assets** (imported as ES modules, use with Phaser):
   ```typescript
   import logoImg from '../assets/logo.png';
   // In preload():
   this.load.image('logo', logoImg);
   ```

2. **Static assets** (in `public/assets/`, loaded by file path):
   ```typescript
   // In preload():
   this.load.image('background', 'assets/bg.png');
   ```

Static assets are auto-copied to `dist/assets/` on build. Bundled assets are tree-shakeable and inline into the bundle.

### Build Configuration

- **Dev mode** (`config.dev.mjs`): Fast rebuild, HMR enabled, runs on port 8080
- **Prod mode** (`config.prod.mjs`): Minified output, optimized, terser configured
- Separate configs allow targeted optimizations for each environment
- Both use React Fast Refresh for hot-reload development

### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- Unused locals/parameters flagged as errors
- DOM and ES2020 libs included for Phaser and React APIs
- JSX set to `react-jsx` (React 17+ auto-import)

### Linting

ESLint configured with:
- TypeScript support via `@typescript-eslint`
- React Hooks rules
- React Refresh rules (component export warnings)
- Recommended rules from ESLint and TypeScript

## Accessing Game Instance from React

```typescript
import { useRef } from 'react';
import { IRefPhaserGame } from './game/PhaserGame';

const MyComponent = () => {
    const phaserRef = useRef<IRefPhaserGame>();

    const onSceneActive = (scene: Phaser.Scene) => {
        // React now has access to the current scene
        // Can dispatch events back to game:
        EventBus.emit('my-game-event', data);
    };

    return (
        <PhaserGame 
            ref={phaserRef} 
            currentActiveScene={onSceneActive}
        />
    );
};

// Later: phaserRef.current.game and phaserRef.current.scene
```

## Deployment

1. Run `npm run build` or `npm run build-nolog`
2. Upload entire `dist/` folder contents to web server
3. Static assets are in `dist/assets/` automatically

## Common Tasks

- **Add a new scene**: Create class in `src/game/scenes/`, register in game config, emit `"current-scene-ready"`
- **Add game assets**: Place in `public/assets/` (static) or import at top of scene file (bundled)
- **React ↔ Game communication**: Use `EventBus.emit()` and `EventBus.on()`
- **Debug build**: Use `npm run dev-nolog` to avoid log.js telemetry
