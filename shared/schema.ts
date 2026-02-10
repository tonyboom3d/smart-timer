import { z } from "zod";

export const TimerModeSchema = z.enum(["fixed", "evergreen"]);
export type TimerMode = z.infer<typeof TimerModeSchema>;

export const CompletionActionSchema = z.enum(["message", "redirect", "emit", "hide"]);
export type CompletionAction = z.infer<typeof CompletionActionSchema>;

export const RedirectTargetSchema = z.enum(["same", "new"]);
export type RedirectTarget = z.infer<typeof RedirectTargetSchema>;

export const ProgressStyleSchema = z.enum(["none", "circular", "linear"]);
export type ProgressStyle = z.infer<typeof ProgressStyleSchema>;

export const AnimationStyleSchema = z.enum(["flip", "slide", "fade", "none"]);
export type AnimationStyle = z.infer<typeof AnimationStyleSchema>;

export const ThemePresetSchema = z.enum([
  "minimal-white",
  "dark-cyberpunk",
  "urgent-red",
  "soft-pastel",
  "corporate-blue",
]);
export type ThemePreset = z.infer<typeof ThemePresetSchema>;

export const DirectionSchema = z.enum(["ltr", "rtl"]);
export type Direction = z.infer<typeof DirectionSchema>;

export const TypographyConfigSchema = z.object({
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().default(48),
  fontWeight: z.number().default(700),
  color: z.string().default("#ffffff"),
});
export type TypographyConfig = z.infer<typeof TypographyConfigSchema>;

export const LabelConfigSchema = z.object({
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().default(12),
  fontWeight: z.number().default(400),
  color: z.string().default("#999999"),
});
export type LabelConfig = z.infer<typeof LabelConfigSchema>;

export const UnitsConfigSchema = z.object({
  showDays: z.boolean().default(true),
  showHours: z.boolean().default(true),
  showMinutes: z.boolean().default(true),
  showSeconds: z.boolean().default(true),
  showMilliseconds: z.boolean().default(false),
});
export type UnitsConfig = z.infer<typeof UnitsConfigSchema>;

export const LabelsConfigSchema = z.object({
  days: z.string().default("Days"),
  hours: z.string().default("Hours"),
  minutes: z.string().default("Minutes"),
  seconds: z.string().default("Seconds"),
  milliseconds: z.string().default("MS"),
});
export type LabelsConfig = z.infer<typeof LabelsConfigSchema>;

export const TimerConfigSchema = z.object({
  mode: TimerModeSchema.default("fixed"),
  targetDate: z.string().default(""),
  evergreenDuration: z.number().default(900000),
  evergreenResetAfter: z.number().default(86400000),
  timezone: z.string().default("local"),

  units: UnitsConfigSchema.default({}),
  labels: LabelsConfigSchema.default({}),
  numberTypography: TypographyConfigSchema.default({}),
  labelTypography: LabelConfigSchema.default({}),

  headerText: z.string().default(""),
  subHeaderText: z.string().default(""),
  headerTypography: z.object({
    fontFamily: z.string().default("Inter"),
    fontSize: z.number().default(24),
    fontWeight: z.number().default(600),
    color: z.string().default("#ffffff"),
  }).default({}),

  completionAction: CompletionActionSchema.default("message"),
  completionMessage: z.string().default("Time's Up!"),
  redirectUrl: z.string().default(""),
  redirectTarget: RedirectTargetSchema.default("same"),

  theme: ThemePresetSchema.default("minimal-white"),
  animationStyle: AnimationStyleSchema.default("flip"),
  progressStyle: ProgressStyleSchema.default("none"),
  direction: DirectionSchema.default("ltr"),

  backgroundColor: z.string().default("transparent"),
  separatorColor: z.string().default("#333333"),
  digitBackground: z.string().default("#1a1a2e"),
  borderRadius: z.number().default(8),
  padding: z.number().default(24),
  gap: z.number().default(16),

  backgroundStyle: z.enum(["solid", "transparent", "glassy"]).default("solid"),
  glassBlur: z.number().default(10),
  glassOpacity: z.number().default(0.3),
  showGlassPreviewImage: z.boolean().default(false),

  responsiveMode: z.enum(["all", "per-breakpoint"]).default("all"),
});
export type TimerConfig = z.infer<typeof TimerConfigSchema>;

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalMs: number;
  progress: number;
}

export interface PostMessageInit {
  type: "INIT_WIDGET";
  payload: {
    config: Partial<TimerConfig>;
    theme?: ThemePreset;
    mode?: "widget" | "dashboard";
    timezone?: string;
  };
}

export interface PostMessageUpdate {
  type: "UPDATE_PREVIEW";
  payload: {
    config: Partial<TimerConfig>;
  };
}

export type IncomingMessage = PostMessageInit | PostMessageUpdate;

export interface OutgoingReady {
  type: "WIDGET_READY";
}

export interface OutgoingComplete {
  type: "TIMER_COMPLETE";
}

export interface OutgoingSaveConfig {
  type: "SAVE_CONFIG";
  payload: TimerConfig;
}

export interface OutgoingHeightChange {
  type: "HEIGHT_CHANGE";
  payload: { height: number };
}

export type OutgoingMessage =
  | OutgoingReady
  | OutgoingComplete
  | OutgoingSaveConfig
  | OutgoingHeightChange;

export const THEME_PRESETS: Record<ThemePreset, Partial<TimerConfig>> = {
  "minimal-white": {
    backgroundColor: "#ffffff",
    digitBackground: "#f5f5f5",
    separatorColor: "#e0e0e0",
    numberTypography: { fontFamily: "Inter", fontSize: 48, fontWeight: 700, color: "#1a1a1a" },
    labelTypography: { fontFamily: "Inter", fontSize: 12, fontWeight: 400, color: "#888888" },
    headerTypography: { fontFamily: "Inter", fontSize: 24, fontWeight: 600, color: "#1a1a1a" },
    borderRadius: 8,
  },
  "dark-cyberpunk": {
    backgroundColor: "#0a0a1a",
    digitBackground: "#1a1a2e",
    separatorColor: "#00f0ff",
    numberTypography: { fontFamily: "Oxanium", fontSize: 52, fontWeight: 700, color: "#00f0ff" },
    labelTypography: { fontFamily: "Oxanium", fontSize: 11, fontWeight: 400, color: "#7b68ee" },
    headerTypography: { fontFamily: "Oxanium", fontSize: 24, fontWeight: 600, color: "#00f0ff" },
    borderRadius: 4,
  },
  "urgent-red": {
    backgroundColor: "#1a0000",
    digitBackground: "#2d0a0a",
    separatorColor: "#ff3333",
    numberTypography: { fontFamily: "Space Grotesk", fontSize: 52, fontWeight: 700, color: "#ff4444" },
    labelTypography: { fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 500, color: "#ff8888" },
    headerTypography: { fontFamily: "Space Grotesk", fontSize: 24, fontWeight: 700, color: "#ff4444" },
    borderRadius: 6,
  },
  "soft-pastel": {
    backgroundColor: "#fef7ff",
    digitBackground: "#f3e8ff",
    separatorColor: "#d8b4fe",
    numberTypography: { fontFamily: "Poppins", fontSize: 48, fontWeight: 600, color: "#7c3aed" },
    labelTypography: { fontFamily: "Poppins", fontSize: 12, fontWeight: 400, color: "#a78bfa" },
    headerTypography: { fontFamily: "Poppins", fontSize: 24, fontWeight: 600, color: "#7c3aed" },
    borderRadius: 16,
  },
  "corporate-blue": {
    backgroundColor: "#f0f4f8",
    digitBackground: "#e2e8f0",
    separatorColor: "#3b82f6",
    numberTypography: { fontFamily: "IBM Plex Sans", fontSize: 48, fontWeight: 700, color: "#1e3a5f" },
    labelTypography: { fontFamily: "IBM Plex Sans", fontSize: 12, fontWeight: 500, color: "#64748b" },
    headerTypography: { fontFamily: "IBM Plex Sans", fontSize: 22, fontWeight: 600, color: "#1e3a5f" },
    borderRadius: 8,
  },
};

export const DEFAULT_CONFIG: TimerConfig = TimerConfigSchema.parse({});

export const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Space Grotesk",
  "Oxanium",
  "IBM Plex Sans",
  "Outfit",
  "Plus Jakarta Sans",
  "Fira Code",
  "JetBrains Mono",
  "Roboto Mono",
  "Source Code Pro",
  "DM Sans",
  "Geist",
];

export const users = undefined as any;
export type InsertUser = any;
export type User = any;
