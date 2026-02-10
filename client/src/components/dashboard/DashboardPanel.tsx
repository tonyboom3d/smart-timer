import { useTimerStore } from "@/lib/store";
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
import { Save, RotateCcw, Palette, Type, Clock, Zap, Layout, Settings2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardPanel() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);
  const applyTheme = useTimerStore((s) => s.applyTheme);
  const resetConfig = useTimerStore((s) => s.resetConfig);

  const handleSave = () => {
    window.parent.postMessage({ type: "SAVE_CONFIG", payload: config }, "*");
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#0f0f13", color: "#e0e0e0" }}>
      <div className="flex items-center justify-between gap-2 p-4 border-b" style={{ borderColor: "#1e1e2a" }}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" style={{ color: "#7c7cff" }} />
          <h2 className="text-base font-semibold" style={{ color: "#ffffff" }}>
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
            style={{ background: "#5b5bff", color: "#fff" }}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="timer" className="w-full">
            <TabsList
              className="w-full grid grid-cols-5 mb-4"
              style={{ background: "#1a1a24" }}
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
    <Card className="p-3 space-y-3" style={{ background: "#15151f", border: "1px solid #1e1e2a" }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#7c7cff" }}>
        {title}
      </h3>
      {children}
    </Card>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs shrink-0" style={{ color: "#a0a0b0" }}>
        {label}
      </Label>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

function TimerSettingsTab() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);

  return (
    <>
      <SectionCard title="Mode">
        <SettingRow label="Timer Type">
          <Select
            value={config.mode}
            onValueChange={(v) => setConfig({ mode: v as "fixed" | "evergreen" })}
          >
            <SelectTrigger className="w-[160px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
              <SelectItem value="fixed">Fixed Date</SelectItem>
              <SelectItem value="evergreen">Evergreen</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {config.mode === "fixed" && (
          <SettingRow label="Target Date">
            <Input
              type="datetime-local"
              value={config.targetDate}
              onChange={(e) => setConfig({ targetDate: e.target.value })}
              style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
              className="w-[200px]"
              data-testid="input-target-date"
            />
          </SettingRow>
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
                style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
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
                style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
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
              style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
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
                  background: isActive ? "#2a2a4a" : "#1a1a24",
                  border: isActive ? "1px solid #5b5bff" : "1px solid #2a2a3a",
                }}
                data-testid={`theme-${theme.id}`}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: theme.preview,
                    color: preset.numberTypography?.color,
                    border: "1px solid #2a2a3a",
                  }}
                >
                  12
                </div>
                <span className="text-xs font-medium" style={{ color: isActive ? "#ffffff" : "#a0a0b0" }}>
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
              value={config.backgroundColor === "transparent" ? "#000000" : config.backgroundColor}
              onChange={(e) => setConfig({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
              data-testid="color-background"
            />
            <Input
              value={config.backgroundColor}
              onChange={(e) => setConfig({ backgroundColor: e.target.value })}
              className="w-[100px] text-xs"
              style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
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
              style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
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
              style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
            />
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Layout">
        <SettingRow label="Direction">
          <Select
            value={config.direction}
            onValueChange={(v) => setConfig({ direction: v as "ltr" | "rtl" })}
          >
            <SelectTrigger className="w-[120px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
            <span className="text-xs w-8 text-right" style={{ color: "#a0a0b0" }}>{config.borderRadius}</span>
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
            <span className="text-xs w-8 text-right" style={{ color: "#a0a0b0" }}>{config.padding}</span>
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
            <span className="text-xs w-8 text-right" style={{ color: "#a0a0b0" }}>{config.gap}</span>
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
            <SelectTrigger className="w-[160px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-number-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
            <span className="text-xs w-8 text-right" style={{ color: "#a0a0b0" }}>
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
            <SelectTrigger className="w-[120px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-number-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
            <SelectTrigger className="w-[160px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-label-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
            <span className="text-xs w-8 text-right" style={{ color: "#a0a0b0" }}>
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
            <SelectTrigger className="w-[160px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-header-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
            <span className="text-xs w-8 text-right" style={{ color: "#a0a0b0" }}>
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
      <SectionCard title="Animation">
        <SettingRow label="Style">
          <Select
            value={config.animationStyle}
            onValueChange={(v) => setConfig({ animationStyle: v as any })}
          >
            <SelectTrigger className="w-[140px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-animation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
            <SelectTrigger className="w-[140px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-progress">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="linear">Linear Bar</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Header & Sub-header">
        <div className="space-y-2">
          <Label className="text-xs" style={{ color: "#a0a0b0" }}>Header Text</Label>
          <Input
            value={config.headerText}
            onChange={(e) => setConfig({ headerText: e.target.value })}
            placeholder="e.g. Sale Ends In"
            style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
            data-testid="input-header-text"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs" style={{ color: "#a0a0b0" }}>Sub-header Text</Label>
          <Input
            value={config.subHeaderText}
            onChange={(e) => setConfig({ subHeaderText: e.target.value })}
            placeholder="e.g. Don't miss out!"
            style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
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
            <SelectTrigger className="w-[160px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-completion-action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
              <SelectItem value="message">Show Message</SelectItem>
              <SelectItem value="redirect">Redirect to URL</SelectItem>
              <SelectItem value="emit">Emit Event</SelectItem>
              <SelectItem value="hide">Hide Widget</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {config.completionAction === "message" && (
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: "#a0a0b0" }}>
              End Message
            </Label>
            <Textarea
              value={config.completionMessage}
              onChange={(e) => setConfig({ completionMessage: e.target.value })}
              placeholder="Time's Up!"
              style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
              className="resize-none"
              data-testid="textarea-completion-message"
            />
          </div>
        )}

        {config.completionAction === "redirect" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#a0a0b0" }}>
                Redirect URL
              </Label>
              <Input
                value={config.redirectUrl}
                onChange={(e) => setConfig({ redirectUrl: e.target.value })}
                placeholder="https://example.com"
                style={{ background: "#1a1a24", border: "1px solid #2a2a3a", color: "#e0e0e0" }}
                data-testid="input-redirect-url"
              />
            </div>
            <SettingRow label="Open In">
              <Select
                value={config.redirectTarget}
                onValueChange={(v) => setConfig({ redirectTarget: v as "same" | "new" })}
              >
                <SelectTrigger className="w-[140px]" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }} data-testid="select-redirect-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
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
