import { useTimerStore } from "@/lib/store";
import { TimerUnit } from "./TimerUnit";
import { TimerSeparator } from "./Separator";
import { CircularProgress } from "./CircularProgress";
import { LinearProgress } from "./LinearProgress";
import { CompletionMessage } from "./CompletionMessage";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

type UnitItem = {
  key: string;
  value: number;
  label: string;
  show: boolean;
  maxDigits: number;
  isMs?: boolean;
};

function chunkRows<T>(arr: T[], parts: number): T[][] {
  const n = arr.length;
  const cap = Math.max(1, Math.min(parts, Math.max(1, n)));
  if (cap <= 1 || n <= 1) return [arr];
  const out: T[][] = [];
  const base = Math.floor(n / cap);
  const extra = n % cap;
  let i = 0;
  for (let k = 0; k < cap; k++) {
    const size = base + (k < extra ? 1 : 0);
    out.push(arr.slice(i, i + size));
    i += size;
  }
  return out;
}

export function TimerDisplay() {
  const config = useTimerStore((s) => s.config);
  const time = useTimerStore((s) => s.timeRemaining);
  const isComplete = useTimerStore((s) => s.isComplete);
  const [scaleRef, rawScale] = useResponsiveScale();
  const scale = config.autoResponsiveText !== false ? rawScale : 1;

  if (isComplete && config.completionAction === "hide") {
    return null;
  }

  if (isComplete) {
    return <CompletionMessage />;
  }

  const units: UnitItem[] = [
    { key: "days", value: time.days, label: config.labels.days, show: config.units.showDays, maxDigits: time.days > 99 ? 3 : 2 },
    { key: "hours", value: time.hours, label: config.labels.hours, show: config.units.showHours, maxDigits: 2 },
    { key: "minutes", value: time.minutes, label: config.labels.minutes, show: config.units.showMinutes, maxDigits: 2 },
    { key: "seconds", value: time.seconds, label: config.labels.seconds, show: config.units.showSeconds, maxDigits: 2 },
    { key: "ms", value: time.milliseconds, label: config.labels.milliseconds, show: config.units.showMilliseconds, maxDigits: 2, isMs: true },
  ];

  const visibleUnits = units.filter((u) => u.show);

  const scaledNumFs = config.numberTypography.fontSize * scale;
  const scaledLabelFs = config.labelTypography.fontSize * scale;
  const scaledHeaderFs = config.headerTypography.fontSize * scale;
  const scaledSubHeaderFs = config.subHeaderTypography.fontSize * scale;

  const scaledNumberTypography = { ...config.numberTypography, fontSize: scaledNumFs };
  const scaledLabelTypography = { ...config.labelTypography, fontSize: scaledLabelFs };

  const rowCount = Math.min(config.unitRows ?? 1, visibleUnits.length);
  const rows = chunkRows(visibleUnits, rowCount);

  const renderRow = (row: UnitItem[], rowKey: number) => (
    <div
      key={rowKey}
      className="flex items-start justify-center"
      style={{ gap: `${config.gap}px`, flexWrap: "nowrap" }}
    >
      {row.map((unit, idx) => (
        <div key={unit.key} className="flex items-start" style={{ gap: `${config.gap}px` }}>
          <TimerUnit
            value={unit.value}
            label={unit.label}
            maxDigits={unit.maxDigits}
            numberTypography={scaledNumberTypography}
            labelTypography={scaledLabelTypography}
            digitBackground={config.digitBackground}
            borderRadius={config.borderRadius}
            animationStyle={config.animationStyle}
            isMilliseconds={!!unit.isMs}
          />
          {idx < row.length - 1 && (
            <TimerSeparator
              color={config.separatorColor}
              fontSize={scaledNumFs}
            />
          )}
        </div>
      ))}
    </div>
  );

  const timerContent =
    rows.length === 1 ? (
      renderRow(rows[0], 0)
    ) : (
      <div className="flex flex-col items-center" style={{ gap: `${config.gap}px` }}>
        {rows.map((row, rowIdx) => renderRow(row, rowIdx))}
      </div>
    );

  const ariaLabel = buildAriaLabel(time, config);

  const getBackgroundStyle = (): React.CSSProperties => {
    if (config.backgroundStyle === "transparent") {
      return { backgroundColor: "transparent" };
    }
    if (config.backgroundStyle === "glassy") {
      const opacity = config.glassOpacity !== undefined ? config.glassOpacity : 0.3;
      const blur = config.glassBlur || 10;
      const hex = config.backgroundColor === "transparent" ? "#ffffff" : config.backgroundColor;
      const r = parseInt(hex.slice(1, 3), 16) || 255;
      const g = parseInt(hex.slice(3, 5), 16) || 255;
      const b = parseInt(hex.slice(5, 7), 16) || 255;
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      };
    }
    return { backgroundColor: config.backgroundColor };
  };

  return (
    <div
      ref={scaleRef}
      className="flex flex-col items-center w-full"
      style={{
        ...getBackgroundStyle(),
        padding: `${config.padding}px`,
        gap: `${config.padding * 0.75}px`,
        direction: config.direction,
      }}
      role="timer"
      aria-live="polite"
      aria-label={ariaLabel}
      data-testid="timer-display"
    >
      {config.headerText && (
        <h1
          style={{
            fontFamily: config.headerTypography.fontFamily,
            fontSize: `${scaledHeaderFs}px`,
            fontWeight: config.headerTypography.fontWeight,
            color: config.headerTypography.color,
            textAlign: "center",
            margin: 0,
            lineHeight: 1.3,
          }}
          data-testid="timer-header"
        >
          {config.headerText}
        </h1>
      )}

      {config.subHeaderText && (
        <p
          style={{
            fontFamily: config.subHeaderTypography.fontFamily,
            fontSize: `${scaledSubHeaderFs}px`,
            fontWeight: config.subHeaderTypography.fontWeight,
            color: config.subHeaderTypography.color,
            textAlign: "center",
            margin: 0,
          }}
          data-testid="timer-subheader"
        >
          {config.subHeaderText}
        </p>
      )}

      {config.progressStyle === "circular" ? (
        <CircularProgress
          progress={time.progress}
          color={config.separatorColor}
          trackColor={config.digitBackground}
          size={Math.min(320, config.numberTypography.fontSize * 6) * scale}
          strokeWidth={3}
        >
          {timerContent}
        </CircularProgress>
      ) : (
        timerContent
      )}

      {config.progressStyle === "linear" && (
        <LinearProgress
          progress={time.progress}
          color={config.separatorColor}
          trackColor={config.digitBackground}
          height={3}
          borderRadius={2}
        />
      )}

      <span className="sr-only" aria-live="assertive" aria-atomic="true">
        {ariaLabel}
      </span>
    </div>
  );
}

function buildAriaLabel(
  time: { days: number; hours: number; minutes: number; seconds: number },
  config: { units: { showDays: boolean; showHours: boolean; showMinutes: boolean; showSeconds: boolean } }
): string {
  const parts: string[] = [];
  if (config.units.showDays && time.days > 0) {
    parts.push(`${time.days} day${time.days !== 1 ? "s" : ""}`);
  }
  if (config.units.showHours && time.hours > 0) {
    parts.push(`${time.hours} hour${time.hours !== 1 ? "s" : ""}`);
  }
  if (config.units.showMinutes) {
    parts.push(`${time.minutes} minute${time.minutes !== 1 ? "s" : ""}`);
  }
  if (config.units.showSeconds) {
    parts.push(`${time.seconds} second${time.seconds !== 1 ? "s" : ""}`);
  }
  if (parts.length === 0) return "Timer";
  const last = parts.pop();
  return parts.length > 0
    ? `${parts.join(", ")} and ${last} remaining`
    : `${last} remaining`;
}
