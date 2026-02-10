import { useTimerStore } from "@/lib/store";
import { TimerUnit } from "./TimerUnit";
import { TimerSeparator } from "./Separator";
import { CircularProgress } from "./CircularProgress";
import { LinearProgress } from "./LinearProgress";
import { CompletionMessage } from "./CompletionMessage";

export function TimerDisplay() {
  const config = useTimerStore((s) => s.config);
  const time = useTimerStore((s) => s.timeRemaining);
  const isComplete = useTimerStore((s) => s.isComplete);

  if (isComplete && config.completionAction === "hide") {
    return null;
  }

  if (isComplete && config.completionAction === "message") {
    return <CompletionMessage />;
  }

  if (isComplete) {
    return <CompletionMessage />;
  }

  const units: Array<{
    key: string;
    value: number;
    label: string;
    show: boolean;
    maxDigits: number;
    isMs?: boolean;
  }> = [
    { key: "days", value: time.days, label: config.labels.days, show: config.units.showDays, maxDigits: time.days > 99 ? 3 : 2 },
    { key: "hours", value: time.hours, label: config.labels.hours, show: config.units.showHours, maxDigits: 2 },
    { key: "minutes", value: time.minutes, label: config.labels.minutes, show: config.units.showMinutes, maxDigits: 2 },
    { key: "seconds", value: time.seconds, label: config.labels.seconds, show: config.units.showSeconds, maxDigits: 2 },
    { key: "ms", value: time.milliseconds, label: config.labels.milliseconds, show: config.units.showMilliseconds, maxDigits: 2, isMs: true },
  ];

  const visibleUnits = units.filter((u) => u.show);

  const timerContent = (
    <div
      className="flex items-start justify-center flex-wrap"
      style={{
        gap: `${config.gap}px`,
        direction: config.direction,
      }}
    >
      {visibleUnits.map((unit, index) => (
        <div key={unit.key} className="flex items-start" style={{ gap: `${config.gap}px` }}>
          <TimerUnit
            value={unit.value}
            label={unit.label}
            maxDigits={unit.maxDigits}
            numberTypography={config.numberTypography}
            labelTypography={config.labelTypography}
            digitBackground={config.digitBackground}
            borderRadius={config.borderRadius}
            animationStyle={config.animationStyle}
            isMilliseconds={unit.isMs}
          />
          {index < visibleUnits.length - 1 && (
            <TimerSeparator
              color={config.separatorColor}
              fontSize={config.numberTypography.fontSize}
            />
          )}
        </div>
      ))}
    </div>
  );

  const ariaLabel = buildAriaLabel(time, config);

  return (
    <div
      className="flex flex-col items-center w-full"
      style={{
        backgroundColor: config.backgroundColor,
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
            fontSize: `${config.headerTypography.fontSize}px`,
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
            fontFamily: config.labelTypography.fontFamily,
            fontSize: `${config.labelTypography.fontSize + 2}px`,
            fontWeight: config.labelTypography.fontWeight,
            color: config.labelTypography.color,
            textAlign: "center",
            margin: 0,
            opacity: 0.8,
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
          size={Math.min(320, config.numberTypography.fontSize * 6)}
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
