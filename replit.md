# Countdown Timer Widget

## Overview
A production-ready, high-performance Countdown Timer Widget built with React + Vite, designed to run inside an IFrame within a Wix Blocks application. Features dual timer modes, flip clock animations, 5 design presets, full customization dashboard, and postMessage API integration.

## Recent Changes
- 2026-02-10: Initial implementation of full widget with all core features

## Architecture

### Frontend Only
This is a pure frontend application. The Express server exists only to serve the Vite-built files. All logic is client-side.

### Key Directories
- `client/src/components/timer/` - Timer display components (FlipDigit, TimerUnit, Separator, CircularProgress, LinearProgress, CompletionMessage, TimerDisplay)
- `client/src/components/dashboard/` - Settings dashboard panel with tabs
- `client/src/hooks/` - Timer engine (useTimerEngine) and postMessage handler (usePostMessage)
- `client/src/lib/store.ts` - Zustand state management
- `shared/schema.ts` - TypeScript config interfaces and theme presets

### Features
- **Dual Timer Modes**: Fixed Date (countdown to specific date) and Evergreen/Scarcity (duration-based with localStorage persistence)
- **Animations**: Flip clock, slide, fade, none
- **5 Theme Presets**: Minimal White, Dark Cyberpunk, Urgent Red, Soft Pastel, Corporate Blue
- **Progress Indicators**: Circular loader, Linear bar, None
- **Dashboard**: Full settings panel with Timer, Theme, Typography, Display, Actions tabs
- **PostMessage API**: INIT_WIDGET, UPDATE_PREVIEW (incoming), WIDGET_READY, TIMER_COMPLETE, SAVE_CONFIG, HEIGHT_CHANGE (outgoing)
- **RTL/LTR Support**: Full Hebrew and English layout support
- **Accessibility**: aria-live regions, natural time announcements for screen readers
- **Demo Mode**: Auto-populated with Cyberpunk theme and sample data

### URL Parameters
- `?mode=dashboard` - Opens the settings dashboard
- `?demo=true` - Enables demo mode with sample data
- `/dashboard` - Route for dashboard mode

### State Management
Uses Zustand for global state. The store manages timer config, time remaining, running/complete states, app mode, and demo mode.

### Performance
Uses `requestAnimationFrame` for the countdown loop ensuring 60FPS performance without blocking the main thread.
