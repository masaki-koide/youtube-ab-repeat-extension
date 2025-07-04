# YouTube AB Repeat Extension

A browser extension that adds AB repeat functionality to YouTube videos. Loop sections of videos with customizable start and end times, perfect for language learning, music practice, or studying specific video segments.

## Features

- **AB Repeat Button**: Integrated directly into YouTube's player controls
- **Time Input Form**: Clean interface for setting loop start and end times
- **URL Parameter Persistence**: Share links with preset loop times
- **Smart Navigation Handling**: Maintains settings across YouTube's single-page navigation
- **Quick Time Setting**: Double-click inputs to capture current playback time
- **Seamless Integration**: Matches YouTube's dark theme and UI style

## Installation

### Development Build

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load the extension in your browser:
   - **Chrome**: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked" and select the `.output/chrome-mv3` directory
   - **Firefox**: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on" and select any file in the `.output/firefox-mv2` directory

## Usage

1. Navigate to any YouTube video
2. Click the repeat button (loops icon) next to the time display
3. The button turns red and time inputs appear below the video
4. Set loop times:
   - **Manual Entry**: Type times in HH:MM:SS format
   - **Quick Set**: Double-click an input to use current playback time
   - **Clear**: Click the X button to clear a time
5. The video automatically loops between your set times
6. Share the URL to preserve loop settings

### URL Parameters

- `ab_repeat=1` - Enables AB repeat
- `ab_start=<seconds>` - Sets start time (A point)
- `ab_end=<seconds>` - Sets end time (B point)

Example: `https://www.youtube.com/watch?v=VIDEO_ID&ab_repeat=1&ab_start=60&ab_end=120`

## Development

```bash
# Install dependencies
npm install

# Run in development mode (Chrome)
npm run dev

# Run in development mode (Firefox)
npm run dev:firefox

# Build for production (Chrome)
npm run build

# Build for production (Firefox)
npm run build:firefox

# Create distribution ZIP
npm run zip

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Check code (linting and formatting)
npm run check

# Fix code issues (linting and formatting)
npm run check:fix

# Type check
npm run compile
```

## Technical Details

### Architecture

The extension follows a modular architecture:

- **Content Script**: Modular components for AB repeat functionality
  - State management with centralized state module
  - URL manager for parameter persistence
  - Video loop manager for playback control
  - Separate UI components for button and form
- **No Popup UI**: All controls are integrated into YouTube's interface
- **Event Handling**: Multiple fallback methods for reliable YouTube navigation detection

### Project Structure

```
entrypoints/
├── content/
│   ├── index.ts          # Main entry point
│   ├── managers/         # Core functionality
│   │   ├── urlManager.ts
│   │   └── videoLoopManager.ts
│   ├── state/           # State management
│   │   └── abRepeatState.ts
│   ├── ui/              # UI components
│   │   ├── abRepeatButton.ts
│   │   ├── abRepeatForm.ts
│   │   └── styles.ts
│   └── types/           # TypeScript types
│       └── youtube.ts
└── background.ts        # Background service worker

utils/                   # Shared utilities
├── time.ts             # Time conversion functions
└── youtube.ts          # YouTube-specific helpers
```

### Built With

- [WXT](https://wxt.dev/) - Next-gen WebExtension Framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Vitest](https://vitest.dev/) - Unit testing framework
- [Biome](https://biomejs.dev/) - Fast formatter and linter
- No external runtime dependencies

### Testing

The project includes comprehensive unit tests:

- State management tests
- URL and video loop manager tests
- Utility function tests
- Full coverage reporting

### Code Quality

- TypeScript with strict type checking
- Biome for consistent code formatting and linting
- Knip for dead code detection
- Pre-configured development environment

### Browser Support

- Chrome/Chromium browsers (Manifest V3)
- Firefox (Manifest V2)

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Run tests before submitting: `npm run test`
2. Ensure code is formatted and linted: `npm run check:fix`
3. Check and fix code issues: `npm run check:fix`
4. Verify TypeScript types: `npm run compile`

## License

This project is open source and available under the MIT License.