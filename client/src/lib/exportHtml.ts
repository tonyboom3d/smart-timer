import type { TimerConfig } from "@shared/schema";

export type Breakpoint = "desktop" | "tablet" | "mobile";

export interface ExportInput {
  config: TimerConfig;
  breakpointConfigs?: Record<Breakpoint, TimerConfig> | null;
}

export interface ExportResult {
  html: string;
  warnings: string[];
}

const FONT_QUERY_MAP: Record<string, string> = {
  Inter: "Inter:wght@300;400;500;600;700;800",
  Poppins: "Poppins:wght@300;400;500;600;700;800",
  Roboto: "Roboto:wght@300;400;500;700;900",
  "Open Sans": "Open+Sans:wght@300;400;500;600;700;800",
  Montserrat: "Montserrat:wght@300;400;500;600;700;800",
  "Space Grotesk": "Space+Grotesk:wght@300;400;500;600;700",
  Oxanium: "Oxanium:wght@300;400;500;600;700;800",
  "IBM Plex Sans": "IBM+Plex+Sans:wght@300;400;500;600;700",
  Outfit: "Outfit:wght@300;400;500;600;700;800;900",
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@300;400;500;600;700;800",
  "Fira Code": "Fira+Code:wght@300;400;500;600;700",
  "JetBrains Mono": "JetBrains+Mono:wght@300;400;500;600;700;800",
  "Roboto Mono": "Roboto+Mono:wght@300;400;500;600;700",
  "Source Code Pro": "Source+Code+Pro:wght@300;400;500;600;700;800;900",
  "DM Sans": "DM+Sans:wght@300;400;500;600;700;800;900",
  Geist: "Geist:wght@300;400;500;600;700;800;900",
};

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeScriptJson(json: string): string {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function buildFontsLink(fonts: Set<string>): string {
  const families: string[] = [];
  fonts.forEach((f) => {
    if (!f) return;
    const key = FONT_QUERY_MAP[f];
    if (key) families.push(`family=${key}`);
  });
  if (families.length === 0) return "";
  const href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${href}" rel="stylesheet">`;
}

function darkenHex(hex: string, amount: number): string {
  try {
    if (!hex || !hex.startsWith("#") || hex.length < 7) return hex;
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return hex;
  }
}

// CSS sanitizers — defend against malicious config values that could break
// out of the inline <style> block (e.g. </style><script>...).
function cssColor(v: string | undefined, fallback = "transparent"): string {
  if (!v) return fallback;
  const s = String(v).trim();
  if (s === "transparent" || s === "currentColor" || s === "inherit") return s;
  if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return s;
  if (/^rgba?\(\s*[\d.,\s%/]+\)$/.test(s)) return s;
  if (/^hsla?\(\s*[\d.,\s%/]+\)$/.test(s)) return s;
  if (/^[a-zA-Z]{1,30}$/.test(s)) return s; // named keyword
  return fallback;
}
function cssFontFamily(v: string | undefined): string {
  if (!v) return "Inter";
  const s = String(v).replace(/[<>{}\\"';]/g, "").trim().slice(0, 80);
  return s || "Inter";
}
function cssNumber(v: number | undefined, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bgCssForBreakpoint(c: TimerConfig): string {
  const bgColor = cssColor(c.backgroundColor, "transparent");
  if (c.backgroundStyle === "transparent") {
    return `background-color: transparent;`;
  }
  if (c.backgroundStyle === "glassy") {
    const opacity = cssNumber(c.glassOpacity, 0.3);
    const blur = cssNumber(c.glassBlur, 10);
    const hex = bgColor === "transparent" ? "#ffffff" : bgColor;
    const r = parseInt(hex.slice(1, 3), 16) || 255;
    const g = parseInt(hex.slice(3, 5), 16) || 255;
    const b = parseInt(hex.slice(5, 7), 16) || 255;
    return `background-color: rgba(${r}, ${g}, ${b}, ${opacity}); backdrop-filter: blur(${blur}px); -webkit-backdrop-filter: blur(${blur}px);`;
  }
  return `background-color: ${bgColor};`;
}

function visibleUnitsList(c: TimerConfig): Array<{ key: string; label: string; isMs: boolean }> {
  const arr: Array<{ key: string; label: string; isMs: boolean }> = [];
  if (c.units.showDays) arr.push({ key: "days", label: c.labels.days, isMs: false });
  if (c.units.showHours) arr.push({ key: "hours", label: c.labels.hours, isMs: false });
  if (c.units.showMinutes) arr.push({ key: "minutes", label: c.labels.minutes, isMs: false });
  if (c.units.showSeconds) arr.push({ key: "seconds", label: c.labels.seconds, isMs: false });
  if (c.units.showMilliseconds) arr.push({ key: "ms", label: c.labels.milliseconds, isMs: true });
  return arr;
}

function buildBreakpointStyles(
  c: TimerConfig,
  selector: string,
): string {
  const numFs = cssNumber(c.numberTypography.fontSize, 48);
  const labelFs = cssNumber(c.labelTypography.fontSize, 12);
  const headerFs = cssNumber(c.headerTypography.fontSize, 24);
  const numWeight = cssNumber(c.numberTypography.fontWeight, 700);
  const labelWeight = cssNumber(c.labelTypography.fontWeight, 400);
  const headerWeight = cssNumber(c.headerTypography.fontWeight, 600);
  const padding = cssNumber(c.padding, 24);
  const gap = cssNumber(c.gap, 16);
  const borderRadius = cssNumber(c.borderRadius, 8);
  const cardHeight = numFs * 1.3 + 12;
  const halfHeight = cardHeight / 2;
  const sepDot = Math.max(4, numFs * 0.1);
  const sepHeight = numFs * 1.1 + 16;
  const numFontFamily = cssFontFamily(c.numberTypography.fontFamily);
  const labelFontFamily = cssFontFamily(c.labelTypography.fontFamily);
  const headerFontFamily = cssFontFamily(c.headerTypography.fontFamily);
  const numColor = cssColor(c.numberTypography.color, "#1a1a1a");
  const labelColor = cssColor(c.labelTypography.color, "#888888");
  const headerColor = cssColor(c.headerTypography.color, "#1a1a1a");
  const sepColor = cssColor(c.separatorColor, "#e0e0e0");
  const safeDigitBgRaw = cssColor(c.digitBackground, "#f5f5f5");
  const digitBgCss = safeDigitBgRaw === "transparent" ? "transparent" : safeDigitBgRaw;
  const darkerBg =
    digitBgCss !== "transparent" ? darkenHex(digitBgCss, 0.05) : "transparent";
  const direction = c.direction === "rtl" ? "rtl" : "ltr";
  return `
${selector} .ct-root {
  ${bgCssForBreakpoint(c)}
  padding: ${padding}px;
  gap: ${padding * 0.75}px;
  direction: ${direction};
}
${selector} .ct-units {
  gap: ${gap}px;
  direction: ${direction};
}
${selector} .ct-unit-group {
  gap: ${gap}px;
}
${selector} .ct-unit {
  gap: ${Math.max(4, labelFs * 0.5)}px;
}
${selector} .ct-label {
  font-family: '${labelFontFamily}', sans-serif;
  font-size: ${labelFs}px;
  font-weight: ${labelWeight};
  color: ${labelColor};
}
${selector} .ct-digit {
  height: ${cardHeight}px;
  min-width: ${numFs * 0.75}px;
  border-radius: ${borderRadius}px;
  background: ${digitBgCss};
}
${selector} .ct-digit.ct-flip {
  background: transparent;
}
${selector} .ct-digit .ct-num {
  font-family: '${numFontFamily}', sans-serif;
  font-size: ${numFs}px;
  font-weight: ${numWeight};
  color: ${numColor};
}
${selector} .ct-flip-half {
  background: ${digitBgCss};
  height: ${halfHeight}px;
  border-radius: ${borderRadius}px ${borderRadius}px 0 0;
}
${selector} .ct-flip-bottom-static, ${selector} .ct-flip-bottom-anim {
  background: ${darkerBg};
  height: ${halfHeight}px;
  border-radius: 0 0 ${borderRadius}px ${borderRadius}px;
  top: ${halfHeight}px;
}
${selector} .ct-flip-divider {
  top: ${halfHeight - 0.5}px;
}
${selector} .ct-flip-half-inner {
  height: ${cardHeight}px;
}
${selector} .ct-flip-bottom-static .ct-flip-half-inner, ${selector} .ct-flip-bottom-anim .ct-flip-half-inner {
  margin-top: -${halfHeight}px;
}
${selector} .ct-header {
  font-family: '${headerFontFamily}', sans-serif;
  font-size: ${headerFs}px;
  font-weight: ${headerWeight};
  color: ${headerColor};
}
${selector} .ct-subheader {
  font-family: '${labelFontFamily}', sans-serif;
  font-size: ${labelFs + 2}px;
  font-weight: ${labelWeight};
  color: ${labelColor};
}
${selector} .ct-sep {
  gap: ${numFs * 0.2}px;
  padding-top: ${numFs * 0.15}px;
  height: ${sepHeight}px;
}
${selector} .ct-sep-dot {
  width: ${sepDot}px;
  height: ${sepDot}px;
  background: ${sepColor};
}
${selector} .ct-progress-linear {
  background: ${digitBgCss};
}
${selector} .ct-progress-linear-bar {
  background: ${sepColor};
  box-shadow: 0 0 8px ${sepColor};
}
${selector} .ct-progress-circular-track {
  stroke: ${sepColor};
  opacity: 0.3;
}
${selector} .ct-progress-circular-bar {
  stroke: ${sepColor};
  filter: drop-shadow(0 0 6px ${sepColor});
}
${selector} .ct-completion {
  padding: ${padding}px;
}
${selector} .ct-completion h2 {
  font-family: '${headerFontFamily}', sans-serif;
  font-size: ${headerFs * 1.5}px;
  font-weight: ${headerWeight};
  color: ${headerColor};
}
`;
}

function buildBaseCss(animationStyle: string): string {
  return `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; }
.ct-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  justify-content: center;
}
.ct-header { text-align: center; margin: 0; line-height: 1.3; }
.ct-subheader { text-align: center; margin: 0; opacity: 0.8; }
.ct-units {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
}
.ct-unit-group { display: flex; align-items: flex-start; }
.ct-unit { display: flex; flex-direction: column; align-items: center; }
.ct-digits { display: flex; gap: 3px; }
.ct-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.ct-digit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  overflow: ${animationStyle === "slide" ? "hidden" : "visible"};
}
.ct-num { line-height: 1; font-variant-numeric: tabular-nums; display: block; padding: 0 4px; }
.ct-sep {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
}
.ct-sep-dot { border-radius: 50%; }
.ct-progress-linear {
  width: 100%;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
  opacity: 0.6;
}
.ct-progress-linear-bar {
  height: 100%;
  width: 0%;
  border-radius: 2px;
  transition: width 0.5s ease-out;
}
.ct-progress-circular-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 320px;
  max-width: 90vw;
  aspect-ratio: 1 / 1;
}
.ct-progress-circular {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.ct-progress-circular-bar {
  transition: stroke-dashoffset 0.5s ease-out;
}
.ct-progress-circular-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-completion {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: ctFadeIn 0.5s ease-out both;
}
.ct-completion h2 { line-height: 1.2; margin: 0; }
@keyframes ctFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Flip */
.ct-digit.ct-flip { perspective: 600px; perspective-origin: 50% 50%; }
.ct-flip-half, .ct-flip-bottom-static, .ct-flip-bottom-anim, .ct-flip-top-anim {
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
}
.ct-flip-half { top: 0; }
.ct-flip-top-anim {
  top: 0;
  z-index: 20;
  transform-origin: bottom center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.ct-flip-bottom-anim {
  z-index: 20;
  transform-origin: top center;
  transform: rotateX(90deg);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.ct-flip-half-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-flip-divider {
  position: absolute;
  left: 2px;
  right: 2px;
  height: 1px;
  background: rgba(0,0,0,0.15);
  z-index: 15;
}
.ct-flip-anim .ct-flip-top-anim {
  animation: ctFlipTop 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
}
.ct-flip-anim .ct-flip-bottom-anim {
  animation: ctFlipBottom 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.2s forwards;
}
@keyframes ctFlipTop {
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(-90deg); }
}
@keyframes ctFlipBottom {
  0% { transform: rotateX(90deg); }
  100% { transform: rotateX(0deg); }
}

/* Slide */
.ct-slide-wrap { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.ct-slide-current, .ct-slide-incoming {
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
  display: block;
}
.ct-slide-incoming { position: absolute; transform: translateY(40%); opacity: 0; }
.ct-slide-anim .ct-slide-current { transform: translateY(-40%); opacity: 0; }
.ct-slide-anim .ct-slide-incoming { transform: translateY(0); opacity: 1; }

/* Fade */
.ct-fade-num { transition: opacity 0.12s ease; opacity: 1; }
.ct-fade-num.ct-fade-out { opacity: 0; }

.ct-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}
`;
}

function buildBodyMarkup(c: TimerConfig): string {
  const units = visibleUnitsList(c);
  const animKlass =
    c.animationStyle === "flip"
      ? "ct-flip"
      : c.animationStyle === "slide"
        ? "ct-slide"
        : c.animationStyle === "fade"
          ? "ct-fade"
          : "ct-none";

  const unitHtml = units
    .map((u, idx) => {
      const isLast = idx === units.length - 1;
      const sep = !isLast
        ? `<div class="ct-sep" aria-hidden="true"><span class="ct-sep-dot"></span><span class="ct-sep-dot"></span></div>`
        : "";
      // Each unit has a digits container, JS will populate digit cells per current value
      return `
        <div class="ct-unit-group">
          <div class="ct-unit" data-testid="timer-unit-${escapeHtml(u.label.toLowerCase())}">
            <div class="ct-digits" data-unit="${u.key}" data-is-ms="${u.isMs ? "1" : "0"}"></div>
            <span class="ct-label">${escapeHtml(u.label)}</span>
          </div>
          ${sep}
        </div>`;
    })
    .join("");

  const header = c.headerText
    ? `<h1 class="ct-header" data-testid="timer-header">${escapeHtml(c.headerText)}</h1>`
    : "";
  const sub = c.subHeaderText
    ? `<p class="ct-subheader" data-testid="timer-subheader">${escapeHtml(c.subHeaderText)}</p>`
    : "";
  const linear =
    c.progressStyle === "linear"
      ? `<div class="ct-progress-linear" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="ct-progress-linear-bar"></div></div>`
      : "";

  const unitsBlock = `
    <div class="ct-units" id="ct-units">
      ${unitHtml}
    </div>`;

  const wrappedUnits =
    c.progressStyle === "circular"
      ? `<div class="ct-progress-circular-wrap">
           <svg class="ct-progress-circular" viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
             <circle class="ct-progress-circular-track" cx="100" cy="100" r="96" fill="none" stroke-width="4"></circle>
             <circle class="ct-progress-circular-bar" cx="100" cy="100" r="96" fill="none" stroke-width="4" stroke-linecap="round" transform="rotate(-90 100 100)"></circle>
           </svg>
           <div class="ct-progress-circular-inner">${unitsBlock}</div>
         </div>`
      : unitsBlock;

  return `
<div class="ct-root ${animKlass}" role="timer" aria-live="polite" data-testid="timer-display">
  ${header}
  ${sub}
  ${wrappedUnits}
  ${linear}
  <span class="ct-sr" id="ct-aria" aria-live="assertive" aria-atomic="true"></span>
</div>
`;
}

function hashConfig(c: TimerConfig): string {
  // Lightweight deterministic hash so identical exports share localStorage,
  // but two distinct exports on the same domain do not collide.
  const seed = JSON.stringify({
    m: c.mode,
    d: c.targetDate,
    ed: c.evergreenDuration,
    er: c.evergreenResetAfter,
    h: c.headerText,
    s: c.subHeaderText,
    cm: c.completionMessage,
  });
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(36);
}

function buildScript(c: TimerConfig): string {
  // Snapshot the runtime config for the script — only what the engine needs.
  const runtimeCfg = {
    mode: c.mode,
    targetDate: c.targetDate,
    evergreenDuration: c.evergreenDuration,
    evergreenResetAfter: c.evergreenResetAfter,
    evergreenPersist: c.evergreenPersist !== false,
    animationStyle: c.animationStyle,
    progressStyle: c.progressStyle,
    completionAction: c.completionAction,
    completionMessage: c.completionMessage || "Time's Up!",
    redirectUrl: c.redirectUrl || "",
    redirectTarget: c.redirectTarget || "same",
    units: c.units,
    labels: c.labels,
    storageKey: "ct_evergreen_start_v1_" + hashConfig(c),
  };
  const cfgJson = escapeScriptJson(JSON.stringify(runtimeCfg));

  return `
<script>
(function() {
  var CFG = ${cfgJson};
  var STORAGE_KEY = CFG.storageKey || "ct_evergreen_start_v1";

  function getEvergreenStart() {
    if (CFG.evergreenPersist) {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          var data = JSON.parse(stored);
          var elapsed = Date.now() - data.startTime;
          if (elapsed < CFG.evergreenDuration + CFG.evergreenResetAfter) {
            return data.startTime;
          }
        }
      } catch (e) {}
      var st = Date.now();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: st })); } catch (e) {}
      return st;
    }
    return Date.now();
  }

  function getTarget() {
    if (CFG.mode === "fixed" || CFG.mode === "dynamic") {
      if (!CFG.targetDate) {
        var d = Date.now() + 86400000;
        return { targetMs: d, totalMs: 86400000 };
      }
      var t = new Date(CFG.targetDate).getTime();
      var total = Math.max(t - Date.now(), 0) || 86400000;
      return { targetMs: t, totalMs: total };
    }
    var st = getEvergreenStart();
    return { targetMs: st + CFG.evergreenDuration, totalMs: CFG.evergreenDuration };
  }

  function compute(targetMs, totalMs) {
    var now = Date.now();
    var diff = Math.max(0, targetMs - now);
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      ms: diff % 1000,
      total: diff,
      progress: totalMs > 0 ? diff / totalMs : 0,
    };
  }

  function ariaLabel(t) {
    var parts = [];
    if (CFG.units.showDays && t.days > 0) parts.push(t.days + " day" + (t.days !== 1 ? "s" : ""));
    if (CFG.units.showHours && t.hours > 0) parts.push(t.hours + " hour" + (t.hours !== 1 ? "s" : ""));
    if (CFG.units.showMinutes) parts.push(t.minutes + " minute" + (t.minutes !== 1 ? "s" : ""));
    if (CFG.units.showSeconds) parts.push(t.seconds + " second" + (t.seconds !== 1 ? "s" : ""));
    if (parts.length === 0) return "Timer";
    var last = parts.pop();
    return parts.length > 0 ? parts.join(", ") + " and " + last + " remaining" : last + " remaining";
  }

  var animStyle = CFG.animationStyle;

  function buildDigitCell(digitChar) {
    var cell = document.createElement("div");
    cell.className = "ct-digit ct-" + animStyle;
    cell.setAttribute("data-value", digitChar);
    if (animStyle === "flip") {
      cell.innerHTML =
        '<div class="ct-flip-half"><div class="ct-flip-half-inner"><span class="ct-num ct-flip-top-text">' + digitChar + '</span></div></div>' +
        '<div class="ct-flip-bottom-static"><div class="ct-flip-half-inner"><span class="ct-num ct-flip-bottom-text">' + digitChar + '</span></div></div>' +
        '<div class="ct-flip-divider"></div>' +
        '<div class="ct-flip-top-anim" style="display:none"><div class="ct-flip-half-inner"><span class="ct-num ct-flip-top-anim-text">' + digitChar + '</span></div></div>' +
        '<div class="ct-flip-bottom-anim" style="display:none"><div class="ct-flip-half-inner"><span class="ct-num ct-flip-bottom-anim-text">' + digitChar + '</span></div></div>';
    } else if (animStyle === "slide") {
      cell.innerHTML =
        '<div class="ct-slide-wrap">' +
        '<span class="ct-num ct-slide-current">' + digitChar + '</span>' +
        '<span class="ct-num ct-slide-incoming" style="display:none">' + digitChar + '</span>' +
        '</div>';
    } else if (animStyle === "fade") {
      cell.innerHTML = '<span class="ct-num ct-fade-num">' + digitChar + '</span>';
    } else {
      cell.innerHTML = '<span class="ct-num">' + digitChar + '</span>';
    }
    return cell;
  }

  function setDigit(cell, newVal) {
    var prev = cell.getAttribute("data-value");
    if (prev === newVal) return;
    cell.setAttribute("data-value", newVal);

    if (animStyle === "flip") {
      var topText = cell.querySelector(".ct-flip-top-text");
      var bottomStatic = cell.querySelector(".ct-flip-bottom-text");
      var topAnim = cell.querySelector(".ct-flip-top-anim");
      var bottomAnim = cell.querySelector(".ct-flip-bottom-anim");
      var topAnimText = cell.querySelector(".ct-flip-top-anim-text");
      var bottomAnimText = cell.querySelector(".ct-flip-bottom-anim-text");

      // Static top shows new value immediately; static bottom shows previous until end
      if (topText) topText.textContent = newVal;
      if (bottomStatic) bottomStatic.textContent = prev;
      if (topAnimText) topAnimText.textContent = prev;
      if (bottomAnimText) bottomAnimText.textContent = newVal;

      cell.classList.remove("ct-flip-anim");
      if (topAnim) topAnim.style.display = "";
      if (bottomAnim) bottomAnim.style.display = "";
      // Force reflow so animation restarts
      void cell.offsetWidth;
      cell.classList.add("ct-flip-anim");

      setTimeout(function() {
        cell.classList.remove("ct-flip-anim");
        if (topAnim) topAnim.style.display = "none";
        if (bottomAnim) bottomAnim.style.display = "none";
        if (bottomStatic) bottomStatic.textContent = newVal;
      }, 620);
    } else if (animStyle === "slide") {
      var current = cell.querySelector(".ct-slide-current");
      var incoming = cell.querySelector(".ct-slide-incoming");
      if (incoming) {
        incoming.textContent = newVal;
        incoming.style.display = "";
      }
      cell.classList.remove("ct-slide-anim");
      void cell.offsetWidth;
      cell.classList.add("ct-slide-anim");
      setTimeout(function() {
        if (current) current.textContent = newVal;
        cell.classList.remove("ct-slide-anim");
        if (incoming) incoming.style.display = "none";
      }, 320);
    } else if (animStyle === "fade") {
      var num = cell.querySelector(".ct-fade-num");
      if (num) {
        num.classList.add("ct-fade-out");
        setTimeout(function() {
          if (num) {
            num.textContent = newVal;
            num.classList.remove("ct-fade-out");
          }
        }, 130);
      }
    } else {
      var span = cell.querySelector(".ct-num");
      if (span) span.textContent = newVal;
    }
  }

  function setUnitDigits(container, valueStr) {
    var existing = container.children;
    if (existing.length !== valueStr.length) {
      // Rebuild
      container.innerHTML = "";
      for (var i = 0; i < valueStr.length; i++) {
        container.appendChild(buildDigitCell(valueStr[i]));
      }
      return;
    }
    for (var i = 0; i < valueStr.length; i++) {
      setDigit(existing[i], valueStr[i]);
    }
  }

  function getValueStrForUnit(unitKey, t) {
    if (unitKey === "days") {
      var v = t.days;
      var min = v > 99 ? 3 : 2;
      var s = String(v);
      while (s.length < min) s = "0" + s;
      return s;
    }
    if (unitKey === "hours") return String(t.hours).padStart(2, "0");
    if (unitKey === "minutes") return String(t.minutes).padStart(2, "0");
    if (unitKey === "seconds") return String(t.seconds).padStart(2, "0");
    if (unitKey === "ms") return String(Math.floor(t.ms / 10)).padStart(2, "0");
    return "00";
  }

  // Polyfill String.prototype.padStart for very old browsers
  if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
      var s = String(this);
      padString = padString || " ";
      while (s.length < targetLength) s = padString + s;
      return s.slice(-Math.max(targetLength, s.length));
    };
  }

  var unitContainers = document.querySelectorAll("[data-unit]");
  var ariaEl = document.getElementById("ct-aria");
  var rootEl = document.querySelector(".ct-root");
  var unitsEl = document.getElementById("ct-units");
  var progressBar = document.querySelector(".ct-progress-linear-bar");
  var circularBar = document.querySelector(".ct-progress-circular-bar");
  var CIRC_R = 96;
  var CIRC_LEN = 2 * Math.PI * CIRC_R;
  if (circularBar) {
    circularBar.setAttribute("stroke-dasharray", String(CIRC_LEN));
    circularBar.setAttribute("stroke-dashoffset", String(CIRC_LEN));
  }

  var target = getTarget();
  var completed = false;

  function doRedirect() {
    if (CFG.completionAction !== "redirect" || !CFG.redirectUrl) return;
    if (CFG.redirectTarget === "new") {
      window.open(CFG.redirectUrl, "_blank");
      return;
    }
    // Same-tab: try top-level navigation first; if sandboxing blocks it,
    // fall back directly to opening in a new tab so the user still gets there.
    try {
      if (window.top && window.top !== window.self && window.top.location) {
        window.top.location.href = CFG.redirectUrl;
        return;
      }
      if (window.top === window.self) {
        window.location.href = CFG.redirectUrl;
        return;
      }
    } catch (e) {}
    window.open(CFG.redirectUrl, "_blank");
  }

  function showCompletion() {
    try { window.parent.postMessage({ type: "TIMER_COMPLETE" }, "*"); } catch (e) {}
    if (CFG.completionAction === "hide") {
      if (rootEl) rootEl.style.display = "none";
      return;
    }
    if (CFG.completionAction === "redirect") {
      doRedirect();
      return;
    }
    // message
    if (rootEl) {
      var keepHeader = rootEl.querySelector(".ct-header");
      var keepSub = rootEl.querySelector(".ct-subheader");
      rootEl.innerHTML = "";
      if (keepHeader) rootEl.appendChild(keepHeader);
      if (keepSub) rootEl.appendChild(keepSub);
      var div = document.createElement("div");
      div.className = "ct-completion";
      div.setAttribute("data-testid", "completion-message");
      var h = document.createElement("h2");
      h.textContent = CFG.completionMessage;
      div.appendChild(h);
      rootEl.appendChild(div);
    }
  }

  function tick() {
    var t = compute(target.targetMs, target.totalMs);

    for (var i = 0; i < unitContainers.length; i++) {
      var c = unitContainers[i];
      var key = c.getAttribute("data-unit");
      var v = getValueStrForUnit(key, t);
      setUnitDigits(c, v);
    }

    if (progressBar) {
      var p = Math.max(0, Math.min(1, t.progress));
      progressBar.style.width = (p * 100) + "%";
    }

    if (circularBar) {
      var pc = Math.max(0, Math.min(1, t.progress));
      var off = CIRC_LEN * (1 - pc);
      circularBar.setAttribute("stroke-dashoffset", String(off));
    }

    if (ariaEl) ariaEl.textContent = ariaLabel(t);

    if (t.total <= 0 && !completed) {
      completed = true;
      showCompletion();
      return;
    }

    requestAnimationFrame(tick);
  }

  // Notify parent that this widget is alive
  try { window.parent.postMessage({ type: "WIDGET_READY" }, "*"); } catch (e) {}

  requestAnimationFrame(tick);
})();
</script>
`;
}

function collectFonts(c: TimerConfig): Set<string> {
  const fonts = new Set<string>();
  if (c.numberTypography.fontFamily) fonts.add(c.numberTypography.fontFamily);
  if (c.labelTypography.fontFamily) fonts.add(c.labelTypography.fontFamily);
  if (c.headerTypography.fontFamily) fonts.add(c.headerTypography.fontFamily);
  return fonts;
}

export function generateExportHtml({ config, breakpointConfigs }: ExportInput): ExportResult {
  const warnings: string[] = [];

  // Snapshot — handle Dynamic CMS fallback
  const effectiveConfig: TimerConfig = JSON.parse(JSON.stringify(config));
  if (effectiveConfig.mode === "dynamic") {
    if (!effectiveConfig.targetDate) {
      effectiveConfig.targetDate = new Date(Date.now() + 86400000).toISOString();
    }
    effectiveConfig.mode = "fixed";
    warnings.push(
      "Dynamic (CMS) mode needs the dashboard runtime — the export uses the current target date as a Fixed Date snapshot.",
    );
  }

  if (
    effectiveConfig.completionAction === "redirect" &&
    effectiveConfig.redirectTarget === "same"
  ) {
    warnings.push(
      "Same-tab redirect can be blocked by sandboxed iframes. The export tries top-level navigation first, then falls back to opening in a new tab.",
    );
  }

  const usePerBp = !!breakpointConfigs && effectiveConfig.responsiveMode === "per-breakpoint";

  // In per-breakpoint mode, the desktop config is the canonical source for
  // structural and runtime settings (visible units, labels, header text,
  // animation style, completion behavior). The other breakpoints only
  // override visual styles via @media. This is a documented constraint.
  const rawStructural: TimerConfig =
    usePerBp && breakpointConfigs ? { ...breakpointConfigs.desktop, mode: effectiveConfig.mode, targetDate: effectiveConfig.targetDate } : effectiveConfig;

  // Defense in depth: even though TimerConfigSchema constrains these enums,
  // normalize the structural enums against an explicit allow-list before
  // they are interpolated into CSS class names, selectors, and JS string
  // concatenations.
  const ALLOWED_ANIM = ["flip", "slide", "fade", "none"] as const;
  const ALLOWED_PROG = ["circular", "linear", "none"] as const;
  const structuralConfig: TimerConfig = {
    ...rawStructural,
    animationStyle: (ALLOWED_ANIM as readonly string[]).includes(rawStructural.animationStyle)
      ? rawStructural.animationStyle
      : "none",
    progressStyle: (ALLOWED_PROG as readonly string[]).includes(rawStructural.progressStyle)
      ? rawStructural.progressStyle
      : "none",
    direction: rawStructural.direction === "rtl" ? "rtl" : "ltr",
  };

  if (usePerBp && breakpointConfigs) {
    warnings.push(
      "Per-breakpoint export only adapts visual styles (colors, sizes, spacing) at each screen size. Structural settings (visible units, labels, header text, animation style, completion behavior) follow the Desktop breakpoint.",
    );
  }

  // Gather fonts from main + breakpoints
  const fonts = collectFonts(structuralConfig);
  if (usePerBp && breakpointConfigs) {
    (Object.values(breakpointConfigs) as TimerConfig[]).forEach((bp) =>
      collectFonts(bp).forEach((f) => fonts.add(f)),
    );
  }

  const fontsLink = buildFontsLink(fonts);
  const baseCss = buildBaseCss(structuralConfig.animationStyle);

  // Per-breakpoint CSS — mobile-first ordering so every viewport is covered
  // and larger breakpoints simply override the base mobile rules.
  let bpCss = "";
  if (usePerBp && breakpointConfigs) {
    bpCss += `${buildBreakpointStyles(breakpointConfigs.mobile, "")}\n`;
    bpCss += `@media (min-width: 640px) {\n${buildBreakpointStyles(breakpointConfigs.tablet, "")}\n}\n`;
    bpCss += `@media (min-width: 1024px) {\n${buildBreakpointStyles(breakpointConfigs.desktop, "")}\n}\n`;
  } else {
    bpCss = buildBreakpointStyles(structuralConfig, "");
  }

  const body = buildBodyMarkup(structuralConfig);
  const script = buildScript(structuralConfig);

  const html = `<!DOCTYPE html>
<html lang="en" dir="${structuralConfig.direction === "rtl" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Countdown Timer</title>
${fontsLink}
<style>
${baseCss}
${bpCss}
</style>
</head>
<body>
${body}
${script}
</body>
</html>
`;

  return { html, warnings };
}
