---
title: Export Timer as Standalone HTML
---
# Export Timer as Standalone HTML

## What & Why
Add an "Export" option in the dashboard that generates a complete, self-contained HTML document with the user's current timer settings baked in. The user copies that HTML (or downloads a `.html` file) and drops it into any iframe on any site — no server, no build step, no external dependencies beyond Google Fonts.

This is fully feasible client-side. The only mode that depends on a parent (Dynamic CMS via Wix Velo) is handled with a graceful fallback and an in-dialog warning.

## Done looks like
- A new **Export** button appears in the dashboard header next to Save.
- Clicking it opens a modal containing:
  - A live preview of the exported widget rendered inside a sandboxed iframe (so the user sees exactly what they'll get).
  - The full HTML source in a read-only code area with horizontal scroll.
  - A **Copy HTML** button (writes to clipboard with a success toast) and a **Download .html** button.
  - A short notice listing the two real limitations (Dynamic CMS fallback and sandboxed same-tab redirect) when they apply, hidden otherwise.
- The exported HTML is a single file, opens directly in any browser, and works inside any plain `<iframe>` on any site.
- The exported widget visually matches the dashboard preview for the chosen breakpoint(s), animation, theme, RTL/LTR, glassy background, header text, and completion behavior.
- Per-breakpoint settings are honored: when `responsiveMode === "per-breakpoint"`, the exported HTML includes `@media` queries so the timer adapts at desktop / tablet / mobile widths.
- Evergreen mode persists across reloads via the iframe's `localStorage`, identical to current behavior.
- Fixed Date and Evergreen completion behaviors (Show Message, Redirect new tab, Redirect same tab with fallback, Hide Widget) all work in the exported file.

## Out of scope
- Template management inside the exported widget (templates are dashboard-only).
- Server-rendered exports, build pipelines, or React-bundled exports.
- Live two-way communication between the exported widget and the host page (the widget is one-way after export).
- Dynamic CMS mode driven by Wix Velo at runtime — the export uses a snapshot of the current target date instead, with an explicit warning.

## Steps
1. **Build the HTML generator.** Create a pure function that takes the timer config (and the per-breakpoint configs when responsive mode is on) and returns a complete HTML string. The string contains: a `<head>` with charset, viewport, the Google Fonts `<link>` for only the fonts actually used, and an inline `<style>` block with all theme/typography/layout rules and the flip keyframes; a `<body>` with the timer DOM skeleton; and an inline `<script>` that holds the config as a JSON literal, runs a `requestAnimationFrame` countdown loop, updates digits, drives flip/slide/fade animations with the same timing as the dashboard preview, applies completion actions, and supports media-query-based responsive breakpoints. No external JS, no React, no build step.
2. **Handle the Dynamic CMS fallback.** When the user's mode is `dynamic`, the generator emits a Fixed-Date countdown using the current `targetDate` snapshot (or a sensible default if empty) and the modal surfaces a clear warning explaining that runtime CMS-driven targets need the dashboard environment.
3. **Handle redirect safely.** In the exported script, the same-tab redirect attempts `window.top.location.href` inside a `try/catch`; if blocked by sandboxing, it falls back to `window.open(url, "_blank")`. The new-tab redirect uses `window.open` directly. The `TIMER_COMPLETE` notice is still posted to `window.parent` so any host that wants to listen can.
4. **Add the Export modal UI.** Build a new dialog component that pre-renders the HTML on open, shows the live preview iframe (using a blob URL or `srcdoc`), displays the source in a read-only textarea, and provides Copy / Download buttons plus the limitation notices.
5. **Wire the Export button into the dashboard header.** Place it next to Save with an icon; clicking it opens the modal. Generation should be instant (synchronous) so the modal opens immediately with the source ready.
6. **Verify visual parity.** Manually compare the exported widget against the dashboard preview for at least: each animation style, each theme preset, RTL direction, glassy background, evergreen mode, fixed date with completion message, and per-breakpoint responsive mode.

## Relevant files
- `client/src/components/dashboard/DashboardPanel.tsx`
- `client/src/components/timer/TimerDisplay.tsx`
- `client/src/components/timer/TimerUnit.tsx`
- `client/src/components/timer/FlipDigit.tsx`
- `client/src/components/timer/Separator.tsx`
- `client/src/components/timer/CompletionMessage.tsx`
- `client/src/components/timer/CircularProgress.tsx`
- `client/src/components/timer/LinearProgress.tsx`
- `client/src/hooks/useTimerEngine.ts`
- `client/src/lib/store.ts`
- `client/src/index.css:290-306`
- `shared/schema.ts`
- `replit.md`