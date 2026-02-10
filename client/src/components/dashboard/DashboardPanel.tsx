import { useTimerStore, type Breakpoint } from "@/lib/store";
import { FONT_OPTIONS, THEME_PRESETS, type ThemePreset } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, RotateCcw, Palette, Type, Clock, Zap, Layout, Settings2, Monitor, Tablet, Smartphone, Copy, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function DashboardPanel() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);
  const applyTheme = useTimerStore((s) => s.applyTheme);
  const resetConfig = useTimerStore((s) => s.resetConfig);
  const activeBreakpoint = useTimerStore((s) => s.activeBreakpoint);
  const setActiveBreakpoint = useTimerStore((s) => s.setActiveBreakpoint);
  const copyBreakpointConfig = useTimerStore((s) => s.copyBreakpointConfig);

  const handleSave = () => {
    window.parent.postMessage({ type: "SAVE_CONFIG", payload: config }, "*");
  };

  const breakpoints: Array<{ id: Breakpoint; label: string; icon: typeof Monitor }> = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff", color: "#333333" }}>
      <div className="flex items-center justify-between gap-2 p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" style={{ color: "#4f46e5" }} />
          <h2 className="text-base font-semibold" style={{ color: "#111827" }}>
            Timer Settings
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={resetConfig}
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            data-testid="button-save"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {config.responsiveMode === "per-breakpoint" && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
          <div className="flex items-center gap-1 mb-2">
            {breakpoints.map((bp) => {
              const Icon = bp.icon;
              const isActive = activeBreakpoint === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => setActiveBreakpoint(bp.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: isActive ? "#4f46e5" : "transparent",
                    color: isActive ? "#ffffff" : "#6b7280",
                  }}
                  data-testid={`breakpoint-${bp.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {bp.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] leading-tight" style={{ color: "#9ca3af" }}>
            Editing settings for <strong style={{ color: "#4f46e5" }}>{activeBreakpoint}</strong>.
            Changes apply only to this screen size. Use "Copy to" to apply these settings to other sizes.
          </p>
          <div className="flex items-center gap-1 mt-2">
            {breakpoints.filter(bp => bp.id !== activeBreakpoint).map(bp => (
              <button
                key={bp.id}
                onClick={() => copyBreakpointConfig(activeBreakpoint, bp.id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
                style={{ background: "#eef2ff", color: "#4f46e5" }}
                data-testid={`copy-to-${bp.id}`}
              >
                <Copy className="w-3 h-3" />
                Copy to {bp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="timer" className="w-full">
            <TabsList
              className="w-full grid grid-cols-5 mb-4"
            >
              <TabsTrigger value="timer" className="text-xs gap-1" data-testid="tab-timer">
                <Clock className="w-3 h-3" />
                Timer
              </TabsTrigger>
              <TabsTrigger value="theme" className="text-xs gap-1" data-testid="tab-theme">
                <Palette className="w-3 h-3" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="typography" className="text-xs gap-1" data-testid="tab-typography">
                <Type className="w-3 h-3" />
                Text
              </TabsTrigger>
              <TabsTrigger value="display" className="text-xs gap-1" data-testid="tab-display">
                <Layout className="w-3 h-3" />
                Display
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs gap-1" data-testid="tab-actions">
                <Zap className="w-3 h-3" />
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="space-y-4">
              <TimerSettingsTab />
            </TabsContent>

            <TabsContent value="theme" className="space-y-4">
              <ThemeSettingsTab />
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <TypographySettingsTab />
            </TabsContent>

            <TabsContent value="display" className="space-y-4">
              <DisplaySettingsTab />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <ActionsSettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-3 space-y-3" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4f46e5" }}>
        {title}
      </h3>
      {children}
    </Card>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs shrink-0" style={{ color: "#6b7280" }}>
        {label}
      </Label>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

function TimerSettingsTab() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);
  const [showCalendar, setShowCalendar] = useState(false);

  const parseDateParts = () => {
    if (!config.targetDate) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hour: 12,
        minute: 0,
      };
    }
    const d = new Date(config.targetDate);
    if (isNaN(d.getTime())) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        hour: 12,
        minute: 0,
      };
    }
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
    };
  };

  const parts = parseDateParts();

  const updateDate = (updates: Partial<typeof parts>) => {
    const merged = { ...parts, ...updates };
    const d = new Date(merged.year, merged.month, merged.day, merged.hour, merged.minute);
    setConfig({ targetDate: d.toISOString() });
  };

  const daysInMonth = new Date(parts.year, parts.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(parts.year, parts.month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const formatDisplayDate = () => {
    if (!config.targetDate) return "Select date & time";
    const d = new Date(config.targetDate);
    if (isNaN(d.getTime())) return "Select date & time";
    return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <>
      <SectionCard title="Mode">
        <SettingRow label="Timer Type">
          <Select
            value={config.mode}
            onValueChange={(v) => setConfig({ mode: v as "fixed" | "evergreen" })}
          >
            <SelectTrigger className="w-[160px]" data-testid="select-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Date</SelectItem>
              <SelectItem value="evergreen">Evergreen</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {config.mode === "fixed" && (
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: "#6b7280" }}>Target Date & Time</Label>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full text-left px-3 py-2 rounded-md text-sm border"
              style={{
                background: "#ffffff",
                border: "1px solid #d1d5db",
                color: "#111827",
              }}
              data-testid="button-open-calendar"
            >
              {formatDisplayDate()}
            </button>

            {showCalendar && (
              <div
                className="rounded-md p-3 space-y-3"
                style={{ background: "#ffffff", border: "1px solid #d1d5db" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const newMonth = parts.month - 1;
                      if (newMonth < 0) updateDate({ month: 11, year: parts.year - 1 });
                      else updateDate({ month: newMonth });
                    }}
                    className="p-1 rounded hover-elevate"
                    style={{ color: "#6b7280" }}
                    data-testid="button-prev-month"
                  >
                    &larr;
                  </button>
                  <span className="text-sm font-medium" style={{ color: "#111827" }}>
                    {monthNames[parts.month]} {parts.year}
                  </span>
                  <button
                    onClick={() => {
                      const newMonth = parts.month + 1;
                      if (newMonth > 11) updateDate({ month: 0, year: parts.year + 1 });
                      else updateDate({ month: newMonth });
                    }}
                    className="p-1 rounded hover-elevate"
                    style={{ color: "#6b7280" }}
                    data-testid="button-next-month"
                  >
                    &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {dayNames.map((dn) => (
                    <div key={dn} className="text-[10px] font-medium py-1" style={{ color: "#9ca3af" }}>
                      {dn}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = day === parts.day;
                    return (
                      <button
                        key={day}
                        onClick={() => updateDate({ day })}
                        className="text-xs py-1.5 rounded-md transition-colors"
                        style={{
                          background: isSelected ? "#4f46e5" : "transparent",
                          color: isSelected ? "#ffffff" : "#374151",
                          fontWeight: isSelected ? 600 : 400,
                        }}
                        data-testid={`calendar-day-${day}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <Label className="text-xs shrink-0" style={{ color: "#6b7280" }}>Time:</Label>
                  <Select
                    value={String(parts.hour)}
                    onValueChange={(v) => updateDate({ hour: parseInt(v) })}
                  >
                    <SelectTrigger className="w-[70px]" data-testid="select-hour">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {String(i).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-medium" style={{ color: "#374151" }}>:</span>
                  <Select
                    value={String(parts.minute)}
                    onValueChange={(v) => updateDate({ minute: parseInt(v) })}
                  >
                    <SelectTrigger className="w-[70px]" data-testid="select-minute">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {String(i).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        {config.mode === "evergreen" && (
          <>
            <SettingRow label="Duration (min)">
              <Input
                type="number"
                min={1}
                value={Math.floor(config.evergreenDuration / 60000)}
                onChange={(e) =>
                  setConfig({ evergreenDuration: parseInt(e.target.value || "15") * 60000 })
                }
                className="w-[100px]"
                data-testid="input-duration"
              />
            </SettingRow>
            <SettingRow label="Reset After (hrs)">
              <Input
                type="number"
                min={0}
                value={Math.floor(config.evergreenResetAfter / 3600000)}
                onChange={(e) =>
                  setConfig({ evergreenResetAfter: parseInt(e.target.value || "24") * 3600000 })
                }
                className="w-[100px]"
                data-testid="input-reset-after"
              />
            </SettingRow>
          </>
        )}
      </SectionCard>

      <SectionCard title="Visible Units">
        <SettingRow label="Days">
          <Switch
            checked={config.units.showDays}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showDays: v } })}
            data-testid="switch-days"
          />
        </SettingRow>
        <SettingRow label="Hours">
          <Switch
            checked={config.units.showHours}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showHours: v } })}
            data-testid="switch-hours"
          />
        </SettingRow>
        <SettingRow label="Minutes">
          <Switch
            checked={config.units.showMinutes}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showMinutes: v } })}
            data-testid="switch-minutes"
          />
        </SettingRow>
        <SettingRow label="Seconds">
          <Switch
            checked={config.units.showSeconds}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showSeconds: v } })}
            data-testid="switch-seconds"
          />
        </SettingRow>
        <SettingRow label="Milliseconds">
          <Switch
            checked={config.units.showMilliseconds}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showMilliseconds: v } })}
            data-testid="switch-milliseconds"
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Unit Labels">
        {(["days", "hours", "minutes", "seconds", "milliseconds"] as const).map((unit) => (
          <SettingRow key={unit} label={unit.charAt(0).toUpperCase() + unit.slice(1)}>
            <Input
              value={config.labels[unit]}
              onChange={(e) =>
                setConfig({ labels: { ...config.labels, [unit]: e.target.value } })
              }
              className="w-[120px]"
              data-testid={`input-label-${unit}`}
            />
          </SettingRow>
        ))}
      </SectionCard>
    </>
  );
}

function ThemeSettingsTab() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);
  const applyTheme = useTimerStore((s) => s.applyTheme);

  const themes: Array<{ id: ThemePreset; name: string; preview: string }> = [
    { id: "minimal-white", name: "Minimal White", preview: "#ffffff" },
    { id: "dark-cyberpunk", name: "Dark Cyberpunk", preview: "#0a0a1a" },
    { id: "urgent-red", name: "Urgent Red", preview: "#1a0000" },
    { id: "soft-pastel", name: "Soft Pastel", preview: "#fef7ff" },
    { id: "corporate-blue", name: "Corporate Blue", preview: "#f0f4f8" },
  ];

  return (
    <>
      <SectionCard title="Presets">
        <div className="grid grid-cols-1 gap-2">
          {themes.map((theme) => {
            const preset = THEME_PRESETS[theme.id];
            const isActive = config.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                className="flex items-center gap-3 p-2 rounded-md text-left transition-colors"
                style={{
                  background: isActive ? "#eef2ff" : "#ffffff",
                  border: isActive ? "1px solid #4f46e5" : "1px solid #e5e7eb",
                }}
                data-testid={`theme-${theme.id}`}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: theme.preview,
                    color: preset.numberTypography?.color,
                    border: "1px solid #d1d5db",
                  }}
                >
                  12
                </div>
                <span className="text-xs font-medium" style={{ color: isActive ? "#111827" : "#6b7280" }}>
                  {theme.name}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Custom Colors">
        <SettingRow label="Background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.backgroundColor === "transparent" ? "#ffffff" : config.backgroundColor}
              onChange={(e) => setConfig({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-background"
            />
            <Input
              value={config.backgroundColor}
              onChange={(e) => setConfig({ backgroundColor: e.target.value })}
              className="w-[100px] text-xs"
            />
          </div>
        </SettingRow>
        <SettingRow label="Digit BG">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.digitBackground}
              onChange={(e) => setConfig({ digitBackground: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-digit-bg"
            />
            <Input
              value={config.digitBackground}
              onChange={(e) => setConfig({ digitBackground: e.target.value })}
              className="w-[100px] text-xs"
            />
          </div>
        </SettingRow>
        <SettingRow label="Separator">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.separatorColor}
              onChange={(e) => setConfig({ separatorColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-separator"
            />
            <Input
              value={config.separatorColor}
              onChange={(e) => setConfig({ separatorColor: e.target.value })}
              className="w-[100px] text-xs"
            />
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Background Style">
        <SettingRow label="Type">
          <Select
            value={config.backgroundStyle || "solid"}
            onValueChange={(v) => setConfig({ backgroundStyle: v as any })}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-bg-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="transparent">Transparent</SelectItem>
              <SelectItem value="glassy">Glassy / Blur</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {config.backgroundStyle === "glassy" && (
          <>
            <SettingRow label="Blur Amount">
              <div className="flex items-center gap-2 w-[160px]">
                <Slider
                  value={[config.glassBlur || 10]}
                  onValueChange={([v]) => setConfig({ glassBlur: v })}
                  min={2}
                  max={30}
                  step={1}
                  data-testid="slider-glass-blur"
                />
                <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>{config.glassBlur || 10}px</span>
              </div>
            </SettingRow>
            <SettingRow label="Opacity">
              <div className="flex items-center gap-2 w-[160px]">
                <Slider
                  value={[config.glassOpacity !== undefined ? config.glassOpacity : 0.3]}
                  onValueChange={([v]) => setConfig({ glassOpacity: v })}
                  min={0}
                  max={1}
                  step={0.05}
                  data-testid="slider-glass-opacity"
                />
                <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>{Math.round((config.glassOpacity !== undefined ? config.glassOpacity : 0.3) * 100)}%</span>
              </div>
            </SettingRow>
            <SettingRow label="Preview Image">
              <Switch
                checked={config.showGlassPreviewImage || false}
                onCheckedChange={(v) => setConfig({ showGlassPreviewImage: v })}
                data-testid="switch-glass-preview"
              />
            </SettingRow>
            <p className="text-[10px]" style={{ color: "#9ca3af" }}>
              Enable preview image to see how glassy the background looks over content.
            </p>
          </>
        )}
      </SectionCard>

      <SectionCard title="Layout">
        <SettingRow label="Direction">
          <Select
            value={config.direction}
            onValueChange={(v) => setConfig({ direction: v as "ltr" | "rtl" })}
          >
            <SelectTrigger className="w-[120px]" data-testid="select-direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ltr">LTR (English)</SelectItem>
              <SelectItem value="rtl">RTL (Hebrew)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Border Radius">
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[config.borderRadius]}
              onValueChange={([v]) => setConfig({ borderRadius: v })}
              min={0}
              max={24}
              step={1}
              data-testid="slider-border-radius"
            />
            <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>{config.borderRadius}</span>
          </div>
        </SettingRow>
        <SettingRow label="Padding">
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[config.padding]}
              onValueChange={([v]) => setConfig({ padding: v })}
              min={0}
              max={64}
              step={2}
              data-testid="slider-padding"
            />
            <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>{config.padding}</span>
          </div>
        </SettingRow>
        <SettingRow label="Gap">
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[config.gap]}
              onValueChange={([v]) => setConfig({ gap: v })}
              min={4}
              max={48}
              step={2}
              data-testid="slider-gap"
            />
            <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>{config.gap}</span>
          </div>
        </SettingRow>
      </SectionCard>
    </>
  );
}

function TypographySettingsTab() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);

  return (
    <>
      <SectionCard title="Number Typography">
        <SettingRow label="Font">
          <Select
            value={config.numberTypography.fontFamily}
            onValueChange={(v) =>
              setConfig({ numberTypography: { ...config.numberTypography, fontFamily: v } })
            }
          >
            <SelectTrigger className="w-[160px]" data-testid="select-number-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Size">
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[config.numberTypography.fontSize]}
              onValueChange={([v]) =>
                setConfig({ numberTypography: { ...config.numberTypography, fontSize: v } })
              }
              min={20}
              max={96}
              step={2}
              data-testid="slider-number-size"
            />
            <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>
              {config.numberTypography.fontSize}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Weight">
          <Select
            value={String(config.numberTypography.fontWeight)}
            onValueChange={(v) =>
              setConfig({ numberTypography: { ...config.numberTypography, fontWeight: parseInt(v) } })
            }
          >
            <SelectTrigger className="w-[120px]" data-testid="select-number-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                <SelectItem key={w} value={String(w)}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.numberTypography.color}
              onChange={(e) =>
                setConfig({ numberTypography: { ...config.numberTypography, color: e.target.value } })
              }
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-number"
            />
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Label Typography">
        <SettingRow label="Font">
          <Select
            value={config.labelTypography.fontFamily}
            onValueChange={(v) =>
              setConfig({ labelTypography: { ...config.labelTypography, fontFamily: v } })
            }
          >
            <SelectTrigger className="w-[160px]" data-testid="select-label-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Size">
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[config.labelTypography.fontSize]}
              onValueChange={([v]) =>
                setConfig({ labelTypography: { ...config.labelTypography, fontSize: v } })
              }
              min={8}
              max={24}
              step={1}
              data-testid="slider-label-size"
            />
            <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>
              {config.labelTypography.fontSize}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.labelTypography.color}
              onChange={(e) =>
                setConfig({ labelTypography: { ...config.labelTypography, color: e.target.value } })
              }
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-label"
            />
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Header Typography">
        <SettingRow label="Font">
          <Select
            value={config.headerTypography.fontFamily}
            onValueChange={(v) =>
              setConfig({ headerTypography: { ...config.headerTypography, fontFamily: v } })
            }
          >
            <SelectTrigger className="w-[160px]" data-testid="select-header-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Size">
          <div className="flex items-center gap-2 w-[160px]">
            <Slider
              value={[config.headerTypography.fontSize]}
              onValueChange={([v]) =>
                setConfig({ headerTypography: { ...config.headerTypography, fontSize: v } })
              }
              min={14}
              max={48}
              step={1}
              data-testid="slider-header-size"
            />
            <span className="text-xs w-8 text-right" style={{ color: "#6b7280" }}>
              {config.headerTypography.fontSize}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.headerTypography.color}
              onChange={(e) =>
                setConfig({ headerTypography: { ...config.headerTypography, color: e.target.value } })
              }
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-header"
            />
          </div>
        </SettingRow>
      </SectionCard>
    </>
  );
}

function DisplaySettingsTab() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);

  return (
    <>
      <SectionCard title="Responsive Mode">
        <SettingRow label="Settings Mode">
          <Select
            value={config.responsiveMode}
            onValueChange={(v) => setConfig({ responsiveMode: v as any })}
          >
            <SelectTrigger className="w-[160px]" data-testid="select-responsive-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Same for all sizes</SelectItem>
              <SelectItem value="per-breakpoint">Per screen size</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <p className="text-[10px] leading-tight" style={{ color: "#9ca3af" }}>
          {config.responsiveMode === "all"
            ? "The same settings are used for all screen sizes (desktop, tablet, and mobile)."
            : "Configure different settings for each screen size. Use the breakpoint selector above to switch between Desktop, Tablet, and Mobile. You can copy settings from one size to another."}
        </p>
      </SectionCard>

      <SectionCard title="Animation">
        <SettingRow label="Style">
          <Select
            value={config.animationStyle}
            onValueChange={(v) => setConfig({ animationStyle: v as any })}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-animation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flip">Flip Clock</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Progress Indicator">
        <SettingRow label="Style">
          <Select
            value={config.progressStyle}
            onValueChange={(v) => setConfig({ progressStyle: v as any })}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-progress">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="linear">Linear Bar</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Header & Sub-header">
        <div className="space-y-2">
          <Label className="text-xs" style={{ color: "#6b7280" }}>Header Text</Label>
          <Input
            value={config.headerText}
            onChange={(e) => setConfig({ headerText: e.target.value })}
            placeholder="e.g. Sale Ends In"
            data-testid="input-header-text"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs" style={{ color: "#6b7280" }}>Sub-header Text</Label>
          <Input
            value={config.subHeaderText}
            onChange={(e) => setConfig({ subHeaderText: e.target.value })}
            placeholder="e.g. Don't miss out!"
            data-testid="input-subheader-text"
          />
        </div>
      </SectionCard>
    </>
  );
}

function ActionsSettingsTab() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);

  return (
    <>
      <SectionCard title="On Timer Complete">
        <SettingRow label="Action">
          <Select
            value={config.completionAction}
            onValueChange={(v) => setConfig({ completionAction: v as any })}
          >
            <SelectTrigger className="w-[160px]" data-testid="select-completion-action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="message">Show Message</SelectItem>
              <SelectItem value="redirect">Redirect to URL</SelectItem>
              <SelectItem value="emit">Emit Event</SelectItem>
              <SelectItem value="hide">Hide Widget</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {config.completionAction === "message" && (
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: "#6b7280" }}>
              End Message
            </Label>
            <Textarea
              value={config.completionMessage}
              onChange={(e) => setConfig({ completionMessage: e.target.value })}
              placeholder="Time's Up!"
              className="resize-none"
              data-testid="textarea-completion-message"
            />
          </div>
        )}

        {config.completionAction === "redirect" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#6b7280" }}>
                Redirect URL
              </Label>
              <Input
                value={config.redirectUrl}
                onChange={(e) => setConfig({ redirectUrl: e.target.value })}
                placeholder="https://example.com"
                data-testid="input-redirect-url"
              />
            </div>
            <SettingRow label="Open In">
              <Select
                value={config.redirectTarget}
                onValueChange={(v) => setConfig({ redirectTarget: v as "same" | "new" })}
              >
                <SelectTrigger className="w-[140px]" data-testid="select-redirect-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Same Tab</SelectItem>
                  <SelectItem value="new">New Tab</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </>
        )}
      </SectionCard>
    </>
  );
}
