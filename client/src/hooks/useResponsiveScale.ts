import { useState, useRef, useEffect } from "react";

export function useResponsiveScale(baseline = 600, min = 0.5, max = 1.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = (width: number) => {
      setScale(Math.min(max, Math.max(min, width / baseline)));
    };

    if (typeof ResizeObserver !== "undefined") {
      const obs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          compute(entry.contentRect.width);
        }
      });
      obs.observe(el);
      compute(el.clientWidth);
      return () => obs.disconnect();
    } else {
      const handler = () => compute(el.clientWidth);
      window.addEventListener("resize", handler);
      compute(el.clientWidth);
      return () => window.removeEventListener("resize", handler);
    }
  }, [baseline, min, max]);

  return [ref, scale] as const;
}
