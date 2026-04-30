# Countdown Timer Widget

## Overview
A production-ready, high-performance Countdown Timer Widget built with React + Vite, designed to run inside an IFrame within a Wix Blocks application. Features dual timer modes, flip clock animations, 5 design presets, full customization dashboard, and postMessage API integration.

## Recent Changes
- 2026-04-30: Added Export feature — header button opens a modal with live iframe preview, source HTML textarea, Copy and Download .html actions. Generates a self-contained HTML file (inline CSS + vanilla-JS countdown engine + Google Fonts link) that bakes in the current settings. In per-breakpoint mode, all three full configs (desktop/tablet/mobile) are embedded; the runtime picks the matching CFG via matchMedia at load and re-renders the body markup on resize when crossing breakpoints, so visible units, labels, header text, animation, progress style, completion behavior, and direction all adapt — not just visual CSS (which still uses mobile-first @media queries). Circular progress track stroke uses `digitBackground` (matching the React preview); bar uses `separatorColor`. Dynamic CMS mode falls back to a Fixed Date snapshot with a warning. CSS injection guards: cssColor/cssFontFamily/cssNumber sanitizers + enum allow-lists for animationStyle/progressStyle/direction. Per-export FNV-1a hash isolates evergreen localStorage keys. Same-tab redirect tries top-level navigation first, then falls back directly to window.open(_blank) if sandboxed. Files: `client/src/lib/exportHtml.ts`, `client/src/components/dashboard/ExportModal.tsx`, dashboard header in `DashboardPanel.tsx`.
- 2026-02-10: Moved breakpoint selector above tab menu with always-visible screen size icons, copy-to/apply-all options, and clear explanatory text. Removed Responsive Mode from Display tab.
- 2026-02-10: Improved flip clock animation with split-card 3D design, transparent/glassy preview image fixes
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
- **Three Timer Modes**: Fixed Date (countdown to specific date), Evergreen/Recurring (duration-based with localStorage persistence), and Dynamic CMS (per-page countdown via Wix CMS data)
- **Animations**: Flip clock, slide, fade, none
- **5 Theme Presets**: Minimal White, Dark Cyberpunk, Urgent Red, Soft Pastel, Corporate Blue
- **Progress Indicators**: Circular loader, Linear bar, None
- **Dashboard**: Full settings panel with Timer, Theme, Typography, Display, Actions tabs. Breakpoint selector (Desktop/Tablet/Mobile) always visible above tabs with copy-to and apply-all functionality
- **Responsive Breakpoints**: Per-breakpoint customization with copy settings between breakpoints and apply-to-all option
- **Template Management**: Save, load, rename, and delete timer configurations as reusable templates. All CRUD operations go through postMessage to Velo
- **PostMessage API**: INIT_WIDGET, UPDATE_PREVIEW, TEMPLATES_LIST, TEMPLATE_DATA, TEMPLATE_SAVED, TEMPLATE_DELETED (incoming), WIDGET_READY, TIMER_COMPLETE, SAVE_CONFIG, HEIGHT_CHANGE, REQUEST_TEMPLATES, SAVE_TEMPLATE, DELETE_TEMPLATE, LOAD_TEMPLATE (outgoing)
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
