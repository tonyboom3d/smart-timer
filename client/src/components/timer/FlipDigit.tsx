import { useRef, useEffect, useState } from "react";

interface FlipDigitProps {
  value: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  background: string;
  borderRadius: number;
  animationStyle: "flip" | "slide" | "fade" | "none";
}

export function FlipDigit({
  value,
  fontSize,
  fontFamily,
  fontWeight,
  color,
  background,
  borderRadius,
  animationStyle,
}: FlipDigitProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Fade-specific state: separate tracking so fade can switch digit at midpoint
  const [fadeShownValue, setFadeShownValue] = useState(value);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Flip/slide animation — timeout must cover full flip animation (top 400ms + bottom 200ms delay + 400ms = 600ms)
  useEffect(() => {
    if (value !== displayValue) {
      setPrevValue(displayValue);
      setIsAnimating(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 620);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, displayValue]);

  // Fade animation: phase 1 = fade out (120ms), phase 2 = swap digit + fade in (120ms)
  useEffect(() => {
    if (value !== fadeShownValue) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      setFadeOpacity(0);
      fadeTimeoutRef.current = setTimeout(() => {
        setFadeShownValue(value);
        setFadeOpacity(1);
      }, 120);
    }
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [value, fadeShownValue]);

  const digitStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    color,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  };

  const cardHeight = fontSize * 1.3 + 12;
  const halfHeight = cardHeight / 2;
  const bgIsTransparent = background === "transparent";

  const cardStyle: React.CSSProperties = {
    background: bgIsTransparent ? "transparent" : background,
    borderRadius: `${borderRadius}px`,
    minWidth: `${fontSize * 0.75}px`,
  };

  if (animationStyle === "none") {
    return (
      <div
        className="relative flex items-center justify-center px-1"
        style={{ ...cardStyle, height: `${cardHeight}px` }}
        data-testid={`digit-${value}`}
      >
        <span style={digitStyle} className="block px-1">
          {value}
        </span>
      </div>
    );
  }

  if (animationStyle === "fade") {
    return (
      <div
        className="relative flex items-center justify-center px-1"
        style={{ ...cardStyle, height: `${cardHeight}px` }}
        data-testid={`digit-${value}`}
      >
        <span
          style={{
            ...digitStyle,
            transition: "opacity 0.12s ease",
            opacity: fadeOpacity,
          }}
          className="block px-1"
        >
          {fadeShownValue}
        </span>
      </div>
    );
  }

  if (animationStyle === "slide") {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ ...cardStyle, overflow: "hidden", height: `${cardHeight}px` }}
        data-testid={`digit-${value}`}
      >
        <div
          className="relative"
          style={{
            height: `${cardHeight}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              ...digitStyle,
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
              transform: isAnimating ? "translateY(-40%)" : "translateY(0)",
              opacity: isAnimating ? 0 : 1,
              display: "block",
            }}
            className="px-2"
          >
            {isAnimating ? prevValue : value}
          </span>
          {isAnimating && (
            <span
              style={{
                ...digitStyle,
                position: "absolute",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                transform: isAnimating ? "translateY(0)" : "translateY(40%)",
                opacity: isAnimating ? 1 : 0,
                display: "block",
              }}
              className="px-2"
            >
              {value}
            </span>
          )}
        </div>
      </div>
    );
  }

  const topBorderRadius = `${borderRadius}px ${borderRadius}px 0 0`;
  const bottomBorderRadius = `0 0 ${borderRadius}px ${borderRadius}px`;
  const darkerBg = bgIsTransparent ? "transparent" : darkenColor(background, 0.05);

  return (
    <div
      className="relative"
      style={{
        ...cardStyle,
        perspective: "600px",
        perspectiveOrigin: "50% 50%",
        height: `${cardHeight}px`,
        background: "transparent",
      }}
      data-testid={`digit-${value}`}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: `${halfHeight}px`,
          overflow: "hidden",
          background: bgIsTransparent ? "transparent" : background,
          borderRadius: topBorderRadius,
        }}
      >
        <div className="flex items-center justify-center" style={{ height: `${cardHeight}px` }}>
          <span style={digitStyle}>{isAnimating ? prevValue : value}</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${halfHeight}px`,
          height: `${halfHeight}px`,
          overflow: "hidden",
          background: bgIsTransparent ? "transparent" : darkerBg,
          borderRadius: bottomBorderRadius,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ height: `${cardHeight}px`, marginTop: `-${halfHeight}px` }}
        >
          <span style={digitStyle}>{isAnimating ? prevValue : value}</span>
        </div>
      </div>

      {!bgIsTransparent && (
        <div
          style={{
            position: "absolute",
            left: "2px",
            right: "2px",
            top: `${halfHeight - 0.5}px`,
            height: "1px",
            background: `rgba(0,0,0,0.15)`,
            zIndex: 15,
          }}
        />
      )}

      {isAnimating && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: `${halfHeight}px`,
              overflow: "hidden",
              transformOrigin: "bottom center",
              animation: "flipTopHalf 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards",
              background: bgIsTransparent ? "transparent" : background,
              borderRadius: topBorderRadius,
              zIndex: 20,
              backfaceVisibility: "hidden",
            }}
          >
            <div className="flex items-center justify-center" style={{ height: `${cardHeight}px` }}>
              <span style={digitStyle}>{prevValue}</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${halfHeight}px`,
              height: `${halfHeight}px`,
              overflow: "hidden",
              transformOrigin: "top center",
              animation: "flipBottomHalf 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.2s forwards",
              background: bgIsTransparent ? "transparent" : darkerBg,
              borderRadius: bottomBorderRadius,
              zIndex: 20,
              transform: "rotateX(90deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{ height: `${cardHeight}px`, marginTop: `-${halfHeight}px` }}
            >
              <span style={digitStyle}>{value}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function darkenColor(hex: string, amount: number): string {
  try {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return hex;
  }
}
