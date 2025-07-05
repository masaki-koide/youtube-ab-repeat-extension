# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension for YouTube that adds AB repeat functionality, allowing users to loop specific sections of videos. Built using the WXT (WebExtension Toolkit) framework with TypeScript. The extension integrates seamlessly with YouTube's player interface and preserves settings via URL parameters.

## Key Commands

### Development

- `npm install` - Install dependencies
- `npm run dev` - Start development server for Chrome with hot reload
- `npm run dev:firefox` - Start development server for Firefox with hot reload

### Building

- `npm run build` - Build production extension for Chrome
- `npm run build:firefox` - Build production extension for Firefox
- `npm run zip` - Create distribution ZIP for Chrome
- `npm run zip:firefox` - Create distribution ZIP for Firefox

### Testing

- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

### Code Quality

- `npm run check` - Run Biome checks (linting and formatting)
- `npm run check:fix` - Run Biome checks and fix issues
- `npm run compile` - Run TypeScript type checking without emitting files

### Storybook

- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build static Storybook site

## Architecture Overview

### WXT Framework

- WXT automatically generates manifest.json from entrypoints and configuration
- Provides hot module replacement (HMR) for rapid development
- Handles cross-browser compatibility

### Extension Structure

The project follows a modular architecture:

- **entrypoints/content/** - Content script entry point and modules
  - **index.ts** - Main entry point that initializes the extension
  - **managers/** - Core functionality managers
    - **urlManager.ts** - Handles URL parameter persistence
    - **videoLoopManager.ts** - Manages video loop logic
  - **state/** - State management
    - **abRepeatState.ts** - Centralized state for AB repeat functionality
  - **ui/** - UI components
    - **components/** - Reusable UI components
      - **abRepeatButton.ts** - AB repeat toggle button
      - **abRepeatForm.ts** - Time input form
      - **timeInput.ts** - Individual time input component
      - **abRepeatButton.stories.ts** - Storybook stories for button
      - **abRepeatForm.stories.ts** - Storybook stories for form
      - **timeInput.stories.ts** - Storybook stories for time input
    - **domManager.ts** - DOM management utilities
    - **styles.ts** - CSS styles for UI components
  - **types/** - TypeScript type definitions
    - **youtube.ts** - YouTube-specific DOM types
- **entrypoints/background.ts** - Background service worker (minimal implementation)
- **utils/** - Shared utilities
  - **time.ts** - Time conversion utilities
  - **youtube.ts** - YouTube-specific helper functions

### Key Configuration Files

- **wxt.config.ts** - WXT configuration with manifest settings
- **tsconfig.json** - TypeScript configuration extending WXT defaults
- **biome.json** - Code formatting and linting configuration
- **vitest.config.ts** - Test runner configuration
- **.storybook/** - Storybook configuration
  - **main.ts** - Main Storybook configuration
  - **preview.ts** - Preview configuration and global decorators
- **knip.json** - Dead code detection configuration
- **package.json** - Project dependencies and scripts

## Current State

The extension is fully functional with comprehensive test coverage:

### Core Features

1. **AB Repeat Button** - Integrated into YouTube's player controls next to the time display
2. **Time Input Form** - Appears below the video when AB repeat is enabled
   - A point (start time) input with placeholder "00:00:00"
   - B point (end time) input with placeholder "00:00:00"
   - Clear buttons for each input
   - Double-click inputs to set current video time
3. **URL Parameter Persistence** - Settings are saved in URL parameters:
   - `ab_repeat=1` - Indicates AB repeat is enabled
   - `ab_start=<seconds>` - Start time in seconds
   - `ab_end=<seconds>` - End time in seconds
4. **Video Navigation Handling** - Maintains state across YouTube's single-page navigation
5. **Auto-loop Logic** - Automatically jumps back to start time when reaching end time

### Implementation Details

#### State Management

- Centralized state module (`abRepeatState.ts`) with getter/setter functions
- State object tracks enabled status, start time, and end time
- URL synchronization handled by dedicated URL manager

#### UI Components

- Modular UI components with dedicated files
- Custom styled button with laps icon SVG
- Form with monospace time inputs and clear buttons
- Dark theme styling matching YouTube's interface
- Responsive insertion points for different YouTube layouts

#### Managers

- **URL Manager** - Handles reading from and writing to URL parameters
- **Video Loop Manager** - Manages video timeupdate events and loop logic

#### Event Handling

- Video timeupdate events for loop logic
- Input change handlers with time parsing/formatting
- Navigation monitoring via multiple methods:
  - MutationObserver for DOM changes
  - YouTube's `yt-navigate-finish` event
  - Browser `popstate` event
  - Periodic fallback checks

## Testing Strategy

The project includes comprehensive testing:

### Unit Tests

- **State tests** - Test state management functionality
- **Manager tests** - Test URL and video loop managers
- **Utility tests** - Test time conversion and YouTube utilities
- **Component tests** - Test individual UI components
- **Coverage reporting** - HTML coverage reports in `coverage/` directory

### Component Development with Storybook

- **Visual testing** - Interactive component development and testing
- **Stories** - Document component variations and states
- **Play functions** - Automated interaction testing
- **Theme support** - Test components in light/dark themes

## Development Notes

- WXT handles manifest generation - do not create a manual manifest.json
- All implementation is in TypeScript with strict type checking
- **NEVER use `any` type. Always provide proper types. If type is truly unknown, use `unknown` instead**
- No popup UI currently implemented (all controls are injected into YouTube page)
- Extension icons are in `public/icon/` at standard sizes (16, 32, 48, 96, 128px)
- Uses Biome for code formatting and linting (replaces ESLint/Prettier)
- Modular architecture allows for easy testing and maintenance
- Storybook provides isolated component development environment
- Components are designed to be reusable and testable
