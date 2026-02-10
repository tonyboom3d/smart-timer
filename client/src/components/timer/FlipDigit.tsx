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
  const [prevValue, setPrevValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (value !== prevValue) {
      setIsAnimating(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setPrevValue(value);
        setIsAnimating(false);
      }, 300);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, prevValue]);

  const digitStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    color,
    lineHeight: 1.1,
    fontVariantNumeric: "tabular-nums",
  };

  const cardStyle: React.CSSProperties = {
    background,
    borderRadius: `${borderRadius}px`,
    minWidth: `${fontSize * 0.75}px`,
  };

  if (animationStyle === "none") {
    return (
      <div
        className="relative flex items-center justify-center px-1"
        style={cardStyle}
        data-testid={`digit-${value}`}
      >
        <span style={digitStyle} className="block py-2 px-1">
          {value}
        </span>
      </div>
    );
  }

  if (animationStyle === "fade") {
    return (
      <div
        className="relative flex items-center justify-center px-1"
        style={cardStyle}
        data-testid={`digit-${value}`}
      >
        <span
          style={{
            ...digitStyle,
            transition: "opacity 0.3s ease",
            opacity: isAnimating ? 0.3 : 1,
          }}
          className="block py-2 px-1"
        >
          {isAnimating ? prevValue : value}
        </span>
      </div>
    );
  }

  if (animationStyle === "slide") {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ ...cardStyle, overflow: "hidden" }}
        data-testid={`digit-${value}`}
      >
        <div className="relative" style={{ height: `${fontSize * 1.1 + 16}px` }}>
          <span
            style={{
              ...digitStyle,
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
              display: "block",
            }}
            className="py-2 px-2"
          >
            {isAnimating ? prevValue : value}
          </span>
          {isAnimating && (
            <span
              style={{
                ...digitStyle,
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
                display: "block",
              }}
              className="py-2 px-2"
            >
              {value}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        ...cardStyle,
        perspective: "400px",
        height: `${fontSize * 1.1 + 16}px`,
        overflow: "hidden",
      }}
      data-testid={`digit-${value}`}
    >
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: "50%", overflow: "hidden" }}
      >
        <span
          style={{
            ...digitStyle,
            position: "absolute",
            top: 0,
            paddingTop: "8px",
          }}
        >
          {isAnimating ? prevValue : value}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: "1px",
          background: `${color}10`,
          zIndex: 5,
        }}
      />

      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: "50%", overflow: "hidden" }}
      >
        <span
          style={{
            ...digitStyle,
            position: "absolute",
            bottom: 0,
            paddingBottom: "8px",
          }}
        >
          {value}
        </span>
      </div>

      {isAnimating && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "50%",
              overflow: "hidden",
              transformOrigin: "bottom center",
              animation: "flipTop 0.3s ease-in forwards",
              background,
              borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
              zIndex: 10,
            }}
          >
            <div className="flex items-center justify-center h-full">
              <span style={{ ...digitStyle, transform: "translateY(25%)" }}>
                {prevValue}
              </span>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "50%",
              overflow: "hidden",
              transformOrigin: "top center",
              animation: "flipBottom 0.3s ease-out 0.15s forwards",
              background,
              borderRadius: `0 0 ${borderRadius}px ${borderRadius}px`,
              zIndex: 10,
              transform: "rotateX(90deg)",
            }}
          >
            <div className="flex items-center justify-center h-full">
              <span style={{ ...digitStyle, transform: "translateY(-25%)" }}>
                {value}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
