import { create } from "zustand";
import {
  type TimerConfig,
  type TimeRemaining,
  type ThemePreset,
  type TimerTemplate,
  TimerConfigSchema,
  THEME_PRESETS,
} from "@shared/schema";

export type Breakpoint = "desktop" | "tablet" | "mobile";

interface TimerState {
  config: TimerConfig;
  timeRemaining: TimeRemaining;
  isRunning: boolean;
  isComplete: boolean;
  isDemo: boolean;
  appMode: "widget" | "dashboard";
  activeBreakpoint: Breakpoint;
  breakpointConfigs: Record<Breakpoint, Partial<TimerConfig>>;

  templates: TimerTemplate[];
  activeTemplateId: string | null;

  setConfig: (config: Partial<TimerConfig>) => void;
  setTimeRemaining: (time: TimeRemaining) => void;
  setIsRunning: (running: boolean) => void;
  setIsComplete: (complete: boolean) => void;
  setIsDemo: (demo: boolean) => void;
  setAppMode: (mode: "widget" | "dashboard") => void;
  applyTheme: (theme: ThemePreset) => void;
  resetConfig: () => void;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  getConfigForBreakpoint: (bp: Breakpoint) => TimerConfig;
  copyBreakpointConfig: (from: Breakpoint, to: Breakpoint) => void;
  copyToAllBreakpoints: () => void;

  setTemplates: (templates: TimerTemplate[]) => void;
  setActiveTemplateId: (id: string | null) => void;
  loadTemplate: (template: TimerTemplate) => void;
  updateTemplateInList: (template: TimerTemplate) => void;
  removeTemplateFromList: (id: string) => void;
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
  activeBreakpoint: "desktop",
  breakpointConfigs: {
    desktop: {},
    tablet: {},
    mobile: {},
  },
  templates: [],
  activeTemplateId: null,

  setConfig: (partial) =>
    set((state) => {
      const newConfig = { ...state.config, ...partial };
      if (state.config.responsiveMode === "per-breakpoint") {
        return {
          config: newConfig,
          breakpointConfigs: {
            ...state.breakpointConfigs,
            [state.activeBreakpoint]: {
              ...state.breakpointConfigs[state.activeBreakpoint],
              ...partial,
            },
          },
        };
      }
      return { config: newConfig };
    }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setIsRunning: (running) => set({ isRunning: running }),
  setIsComplete: (complete) => set({ isComplete: complete }),
  setIsDemo: (demo) => set({ isDemo: demo }),
  setAppMode: (mode) => set({ appMode: mode }),

  setActiveBreakpoint: (bp) =>
    set((state) => {
      if (state.config.responsiveMode === "per-breakpoint") {
        const bpConfig = state.breakpointConfigs[bp];
        return {
          activeBreakpoint: bp,
          config: { ...state.config, ...bpConfig },
        };
      }
      return { activeBreakpoint: bp };
    }),

  getConfigForBreakpoint: (bp) => {
    const state = get();
    if (state.config.responsiveMode === "per-breakpoint") {
      return { ...state.config, ...state.breakpointConfigs[bp] };
    }
    return state.config;
  },

  copyBreakpointConfig: (from, to) =>
    set((state) => ({
      breakpointConfigs: {
        ...state.breakpointConfigs,
        [to]: { ...state.breakpointConfigs[from] },
      },
    })),

  copyToAllBreakpoints: () =>
    set((state) => {
      const currentConfig = { ...state.config };
      const { responsiveMode, ...visualConfig } = currentConfig;
      return {
        config: { ...state.config, responsiveMode: "all" as const },
        breakpointConfigs: {
          desktop: { ...visualConfig },
          tablet: { ...visualConfig },
          mobile: { ...visualConfig },
        },
      };
    }),

  applyTheme: (theme) => {
    const preset = THEME_PRESETS[theme];
    set((state) => ({
      config: { ...state.config, ...preset, theme },
    }));
  },

  resetConfig: () =>
    set({
      config: TimerConfigSchema.parse({}),
      isComplete: false,
      breakpointConfigs: { desktop: {}, tablet: {}, mobile: {} },
      activeTemplateId: null,
    }),

  setTemplates: (templates) => set({ templates }),

  setActiveTemplateId: (id) => set({ activeTemplateId: id }),

  loadTemplate: (template) =>
    set({
      config: { ...template.config },
      activeTemplateId: template.id,
      isComplete: false,
      breakpointConfigs: { desktop: {}, tablet: {}, mobile: {} },
    }),

  updateTemplateInList: (template) =>
    set((state) => ({
      templates: state.templates.some((t) => t.id === template.id)
        ? state.templates.map((t) => (t.id === template.id ? template : t))
        : [...state.templates, template],
      activeTemplateId: template.id,
    })),

  removeTemplateFromList: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      activeTemplateId: state.activeTemplateId === id ? null : state.activeTemplateId,
    })),
}));
