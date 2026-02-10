import { FlipDigit } from "./FlipDigit";
import type { AnimationStyle } from "@shared/schema";

interface TimerUnitProps {
  value: number;
  label: string;
  maxDigits?: number;
  numberTypography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
  };
  labelTypography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
  };
  digitBackground: string;
  borderRadius: number;
  animationStyle: AnimationStyle;
  isMilliseconds?: boolean;
}

export function TimerUnit({
  value,
  label,
  maxDigits = 2,
  numberTypography,
  labelTypography,
  digitBackground,
  borderRadius,
  animationStyle,
  isMilliseconds = false,
}: TimerUnitProps) {
  const digits = isMilliseconds
    ? String(Math.floor(value / 10))
        .padStart(2, "0")
        .split("")
    : String(value).padStart(maxDigits, "0").split("");

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: `${Math.max(4, labelTypography.fontSize * 0.5)}px` }}
      data-testid={`timer-unit-${label.toLowerCase()}`}
    >
      <div className="flex" style={{ gap: "3px" }}>
        {digits.map((digit, i) => (
          <FlipDigit
            key={`${label}-${i}`}
            value={digit}
            fontSize={numberTypography.fontSize}
            fontFamily={numberTypography.fontFamily}
            fontWeight={numberTypography.fontWeight}
            color={numberTypography.color}
            background={digitBackground}
            borderRadius={borderRadius}
            animationStyle={animationStyle}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: labelTypography.fontFamily,
          fontSize: `${labelTypography.fontSize}px`,
          fontWeight: labelTypography.fontWeight,
          color: labelTypography.color,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
