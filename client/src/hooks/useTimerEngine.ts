import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/lib/store";
import type { TimeRemaining } from "@shared/schema";

const STORAGE_KEY = "countdown_evergreen_start";

function getEvergreenStartTime(duration: number, resetAfter: number, persist: boolean): number {
  if (persist) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const elapsed = Date.now() - data.startTime;
        if (elapsed < duration + resetAfter) {
          return data.startTime;
        }
      }
    } catch {}
    const startTime = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime }));
    return startTime;
  }
  return Date.now();
}

function computeTimeRemaining(
  targetMs: number,
  totalDurationMs: number
): TimeRemaining {
  const now = Date.now();
  const diff = Math.max(0, targetMs - now);
  const progress = totalDurationMs > 0 ? diff / totalDurationMs : 0;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const milliseconds = diff % 1000;

  return { days, hours, minutes, seconds, milliseconds, totalMs: diff, progress };
}

export function useTimerEngine() {
  const config = useTimerStore((s) => s.config);
  const setTimeRemaining = useTimerStore((s) => s.setTimeRemaining);
  const setIsRunning = useTimerStore((s) => s.setIsRunning);
  const setIsComplete = useTimerStore((s) => s.setIsComplete);
  const isComplete = useTimerStore((s) => s.isComplete);
  const isDemo = useTimerStore((s) => s.isDemo);

  const rafRef = useRef<number>();
  const completeFiredRef = useRef(false);

  const getTarget = useCallback((): { targetMs: number; totalDurationMs: number } => {
    if (isDemo) {
      const demoTarget = Date.now() + 86400000 + 3723000;
      return { targetMs: demoTarget, totalDurationMs: 86400000 + 3723000 };
    }

    if (config.mode === "fixed" || config.mode === "dynamic") {
      if (!config.targetDate) {
        const defaultTarget = Date.now() + 86400000;
        return { targetMs: defaultTarget, totalDurationMs: 86400000 };
      }
      const targetMs = new Date(config.targetDate).getTime();
      const totalDurationMs = Math.max(targetMs - Date.now(), 0) || 86400000;
      return { targetMs, totalDurationMs };
    }

    const startTime = getEvergreenStartTime(
      config.evergreenDuration,
      config.evergreenResetAfter,
      config.evergreenPersist !== false
    );
    const targetMs = startTime + config.evergreenDuration;
    return { targetMs, totalDurationMs: config.evergreenDuration };
  }, [config.mode, config.targetDate, config.evergreenDuration, config.evergreenResetAfter, config.evergreenPersist, isDemo]);

  useEffect(() => {
    completeFiredRef.current = false;
    setIsComplete(false);
    setIsRunning(true);

    const { targetMs, totalDurationMs } = getTarget();

    const tick = () => {
      const time = computeTimeRemaining(targetMs, totalDurationMs);
      setTimeRemaining(time);

      if (time.totalMs <= 0 && !completeFiredRef.current) {
        completeFiredRef.current = true;
        setIsRunning(false);
        setIsComplete(true);

        window.parent.postMessage({ type: "TIMER_COMPLETE" }, "*");

        if (config.completionAction === "redirect" && config.redirectUrl) {
          if (config.redirectTarget === "new") {
            window.open(config.redirectUrl, "_blank");
          } else {
            window.parent.location.href = config.redirectUrl;
          }
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getTarget, config.completionAction, config.redirectUrl, config.redirectTarget, setTimeRemaining, setIsRunning, setIsComplete]);
}
