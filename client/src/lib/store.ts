import { create } from "zustand";
import {
  type TimerConfig,
  type TimeRemaining,
  type ThemePreset,
  TimerConfigSchema,
  THEME_PRESETS,
} from "@shared/schema";

interface TimerState {
  config: TimerConfig;
  timeRemaining: TimeRemaining;
  isRunning: boolean;
  isComplete: boolean;
  isDemo: boolean;
  appMode: "widget" | "dashboard";

  setConfig: (config: Partial<TimerConfig>) => void;
  setTimeRemaining: (time: TimeRemaining) => void;
  setIsRunning: (running: boolean) => void;
  setIsComplete: (complete: boolean) => void;
  setIsDemo: (demo: boolean) => void;
  setAppMode: (mode: "widget" | "dashboard") => void;
  applyTheme: (theme: ThemePreset) => void;
  resetConfig: () => void;
}

const defaultTime: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
  totalMs: 0,
  progress: 1,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  config: TimerConfigSchema.parse({}),
  timeRemaining: defaultTime,
  isRunning: false,
  isComplete: false,
  isDemo: false,
  appMode: "widget",

  setConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setIsRunning: (running) => set({ isRunning: running }),
  setIsComplete: (complete) => set({ isComplete: complete }),
  setIsDemo: (demo) => set({ isDemo: demo }),
  setAppMode: (mode) => set({ appMode: mode }),

  applyTheme: (theme) => {
    const preset = THEME_PRESETS[theme];
    set((state) => ({
      config: { ...state.config, ...preset, theme },
    }));
  },

  resetConfig: () =>
    set({ config: TimerConfigSchema.parse({}), isComplete: false }),
}));
