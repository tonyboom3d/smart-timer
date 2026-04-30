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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Save, RotateCcw, Palette, Type, Clock, Zap, Layout, Settings2, Monitor, Tablet, Smartphone, Copy, CopyCheck, Info, Plus, Pencil, Trash2, FolderOpen, ChevronDown, ChevronRight, Check, X, Code2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { ExportModal } from "./ExportModal";

export function DashboardPanel() {
  const config = useTimerStore((s) => s.config);
  const setConfig = useTimerStore((s) => s.setConfig);
  const applyTheme = useTimerStore((s) => s.applyTheme);
  const resetConfig = useTimerStore((s) => s.resetConfig);
  const activeBreakpoint = useTimerStore((s) => s.activeBreakpoint);
  const setActiveBreakpoint = useTimerStore((s) => s.setActiveBreakpoint);
  const copyBreakpointConfig = useTimerStore((s) => s.copyBreakpointConfig);
  const copyToAllBreakpoints = useTimerStore((s) => s.copyToAllBreakpoints);
  const templates = useTimerStore((s) => s.templates);
  const activeTemplateId = useTimerStore((s) => s.activeTemplateId);
  const loadTemplate = useTimerStore((s) => s.loadTemplate);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (!showCopyMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setShowCopyMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCopyMenu]);

  const handleSave = () => {
    if (activeTemplateId) {
      const activeTemplate = templates.find((t) => t.id === activeTemplateId);
      window.parent.postMessage({
        type: "SAVE_TEMPLATE",
        payload: { id: activeTemplateId, name: activeTemplate?.name || "Untitled", config },
      }, "*");
    }
    window.parent.postMessage({ type: "SAVE_CONFIG", payload: config }, "*");
  };

  const handleSaveAsNew = () => {
    const name = newTemplateName.trim();
    if (!name) return;
    window.parent.postMessage({
      type: "SAVE_TEMPLATE",
      payload: { name, config },
    }, "*");
    setNewTemplateName("");
    setShowNewInput(false);
  };

  const handleRename = (id: string) => {
    const name = renameValue.trim();
    if (!name) return;
    const template = templates.find((t) => t.id === id);
    if (template) {
      window.parent.postMessage({
        type: "SAVE_TEMPLATE",
        payload: { id, name, config: template.config },
      }, "*");
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleDelete = (id: string) => {
    window.parent.postMessage({
      type: "DELETE_TEMPLATE",
      payload: { id },
    }, "*");
    setDeletingId(null);
  };

  const handleLoadTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template && template.config) {
      loadTemplate(template);
    } else {
      window.parent.postMessage({
        type: "LOAD_TEMPLATE",
        payload: { id },
      }, "*");
    }
  };

  const breakpoints: Array<{ id: Breakpoint; label: string; icon: typeof Monitor }> = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  const isPerBreakpoint = config.responsiveMode === "per-breakpoint";

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff", color: "#333333" }}>
      <div className="p-4 border-b" style={{ borderColor: "#e5e7eb" }}>
        <div className="flex items-center justify-between gap-2">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                  data-testid="button-export"
                >
                  <Code2 className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                Generate a standalone HTML file with these settings baked in.
              </TooltipContent>
            </Tooltip>
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
        {activeTemplateId && (() => {
          const activeT = templates.find((t) => t.id === activeTemplateId);
          return activeT ? (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px]" style={{ color: "#9ca3af" }}>Editing:</span>
              <span
                className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
              >
                {activeT.name}
              </span>
            </div>
          ) : null;
        })()}
      </div>

      <div className="border-b" style={{ borderColor: "#e5e7eb" }}>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium transition-colors hover-elevate"
          style={{ color: "#374151" }}
          data-testid="button-toggle-templates"
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" style={{ color: "#4f46e5" }} />
            <span>My Templates</span>
            {templates.length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ background: "#eef2ff", color: "#4f46e5" }}
              >
                {templates.length}
              </span>
            )}
          </div>
          {showTemplates ? (
            <ChevronDown className="w-4 h-4" style={{ color: "#9ca3af" }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: "#9ca3af" }} />
          )}
        </button>

        {showTemplates && (
          <div className="px-4 pb-3 space-y-2">
            {templates.length > 0 && (
              <div className="space-y-1">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors"
                    style={{
                      background: activeTemplateId === t.id ? "#eef2ff" : "transparent",
                      border: `1px solid ${activeTemplateId === t.id ? "#c7d2fe" : "transparent"}`,
                    }}
                    data-testid={`template-item-${t.id}`}
                  >
                    {renamingId === t.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRename(t.id); if (e.key === "Escape") setRenamingId(null); }}
                          className="h-6 text-xs flex-1"
                          autoFocus
                          data-testid="input-rename-template"
                        />
                        <button onClick={() => handleRename(t.id)} className="p-0.5 rounded hover-elevate" style={{ color: "#22c55e" }} data-testid="button-confirm-rename">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setRenamingId(null)} className="p-0.5 rounded hover-elevate" style={{ color: "#ef4444" }} data-testid="button-cancel-rename">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : deletingId === t.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-[11px] flex-1" style={{ color: "#ef4444" }}>Delete?</span>
                        <button onClick={() => handleDelete(t.id)} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }} data-testid="button-confirm-delete">
                          Yes
                        </button>
                        <button onClick={() => setDeletingId(null)} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" }} data-testid="button-cancel-delete">
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleLoadTemplate(t.id)}
                          className="flex-1 text-left text-xs truncate transition-colors"
                          style={{ color: activeTemplateId === t.id ? "#4f46e5" : "#374151", fontWeight: activeTemplateId === t.id ? 600 : 400 }}
                          data-testid={`button-load-template-${t.id}`}
                        >
                          {t.name}
                        </button>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setRenamingId(t.id); setRenameValue(t.name); }}
                            className="p-0.5 rounded hover-elevate"
                            style={{ color: "#6b7280" }}
                            data-testid={`button-rename-template-${t.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeletingId(t.id)}
                            className="p-0.5 rounded hover-elevate"
                            style={{ color: "#ef4444" }}
                            data-testid={`button-delete-template-${t.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showNewInput ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveAsNew(); if (e.key === "Escape") { setShowNewInput(false); setNewTemplateName(""); } }}
                  placeholder="Template name..."
                  className="h-7 text-xs flex-1"
                  autoFocus
                  data-testid="input-new-template-name"
                />
                <button
                  onClick={handleSaveAsNew}
                  disabled={!newTemplateName.trim()}
                  className="p-1 rounded hover-elevate"
                  style={{ color: newTemplateName.trim() ? "#22c55e" : "#d1d5db" }}
                  data-testid="button-confirm-new-template"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setShowNewInput(false); setNewTemplateName(""); }}
                  className="p-1 rounded hover-elevate"
                  style={{ color: "#ef4444" }}
                  data-testid="button-cancel-new-template"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewInput(true)}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs font-medium transition-colors hover-elevate"
                style={{ color: "#4f46e5", border: "1px dashed #c7d2fe" }}
                data-testid="button-save-as-new-template"
              >
                <Plus className="w-3.5 h-3.5" />
                Save current as new template
              </button>
            )}

            {templates.length === 0 && !showNewInput && (
              <p className="text-[11px] text-center py-1" style={{ color: "#9ca3af" }}>
                No saved templates yet. Save your first template to reuse it later.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1">
            {breakpoints.map((bp) => {
              const Icon = bp.icon;
              const isActive = activeBreakpoint === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => {
                    if (!isPerBreakpoint) {
                      const { responsiveMode, ...visualConfig } = config;
                      useTimerStore.setState({
                        breakpointConfigs: {
                          desktop: { ...visualConfig },
                          tablet: { ...visualConfig },
                          mobile: { ...visualConfig },
                        },
                      });
                      setConfig({ responsiveMode: "per-breakpoint" });
                    }
                    setActiveBreakpoint(bp.id);
                  }}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors"
                  style={{
                    background: isActive ? "#4f46e5" : "transparent",
                    color: isActive ? "#ffffff" : "#6b7280",
                    minWidth: "56px",
                  }}
                  data-testid={`breakpoint-${bp.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {bp.label}
                </button>
              );
            })}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 cursor-help shrink-0" style={{ color: "#9ca3af" }} />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[220px] text-xs">
              You can set different settings for each screen size.
              Select a screen size to customize it individually.
            </TooltipContent>
          </Tooltip>
        </div>

        {isPerBreakpoint ? (
          <div className="space-y-2">
            <p className="text-[10px] leading-tight" style={{ color: "#6b7280" }}>
              Editing <strong style={{ color: "#4f46e5" }}>{activeBreakpoint}</strong> settings.
              Each screen size has its own settings.
            </p>
            <div className="flex items-center gap-1 flex-wrap relative">
              <div className="relative" ref={copyMenuRef}>
                <button
                  onClick={() => setShowCopyMenu(!showCopyMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
                  style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
                  data-testid="button-copy-menu"
                >
                  <Copy className="w-3 h-3" />
                  Copy to...
                </button>
                {showCopyMenu && (
                  <div
                    className="absolute top-full left-0 mt-1 rounded-md shadow-lg py-1 z-50"
                    style={{ background: "#ffffff", border: "1px solid #e5e7eb", minWidth: "150px" }}
                  >
                    {breakpoints.filter(bp => bp.id !== activeBreakpoint).map(bp => {
                      const Icon = bp.icon;
                      return (
                        <button
                          key={bp.id}
                          onClick={() => { copyBreakpointConfig(activeBreakpoint, bp.id); setShowCopyMenu(false); }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-left transition-colors hover-elevate"
                          style={{ color: "#374151" }}
                          data-testid={`copy-to-${bp.id}`}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                          Copy to {bp.label}
                        </button>
                      );
                    })}
                    <div style={{ borderTop: "1px solid #e5e7eb", margin: "2px 0" }} />
                    <button
                      onClick={() => { copyToAllBreakpoints(); setShowCopyMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-left font-medium transition-colors hover-elevate"
                      style={{ color: "#4f46e5" }}
                      data-testid="button-copy-to-all"
                    >
                      <CopyCheck className="w-3.5 h-3.5" />
                      Apply to all sizes
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setConfig({ responsiveMode: "all" })}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
                style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" }}
                data-testid="button-same-for-all"
              >
                Use same for all sizes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[10px] leading-tight" style={{ color: "#9ca3af" }}>
            Same settings for all screen sizes. Click a screen size above to customize each one individually.
          </p>
        )}
      </div>

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

      <ExportModal open={showExportModal} onOpenChange={setShowExportModal} />
    </div>
  );
}

function SectionCard({ title, tooltip, children }: { title: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <Card className="p-3 space-y-3" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
      <div className="flex items-center gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4f46e5" }}>
          {title}
        </h3>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 cursor-help shrink-0" style={{ color: "#9ca3af" }} />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[220px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </Card>
  );
}

function SettingRow({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1 shrink-0">
        <Label className="text-xs shrink-0" style={{ color: "#6b7280" }}>
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 cursor-help shrink-0" style={{ color: "#b0b0b0" }} />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[220px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
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
      <SectionCard title="Mode" tooltip="Choose how the timer counts down: to a specific date, or for a set duration per visitor.">
        <SettingRow label="Timer Type" tooltip="Fixed Date counts to a specific date. Recurring starts a fresh countdown for each visitor. Dynamic (CMS) lets you set different times per page.">
          <Select
            value={config.mode}
            onValueChange={(v) => setConfig({ mode: v as "fixed" | "evergreen" | "dynamic" })}
          >
            <SelectTrigger className="w-[160px]" data-testid="select-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Date</SelectItem>
              <SelectItem value="evergreen">Recurring</SelectItem>
              {/* Hidden intentionally — re-enable by uncommenting:
              <SelectItem value="dynamic">Dynamic (CMS)</SelectItem>
              */}
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
            <SettingRow label="Duration (min)" tooltip="How long the countdown runs for each visitor.">
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
            <SettingRow label="Reset After (hrs)" tooltip="After this time, the timer resets and starts fresh for the same visitor.">
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
            <SettingRow label="Remember Visitor" tooltip="When enabled, uses the visitor's device memory to continue showing the same countdown instead of restarting on every visit.">
              <Switch
                checked={config.evergreenPersist !== false}
                onCheckedChange={(v) => setConfig({ evergreenPersist: v })}
                data-testid="switch-evergreen-persist"
              />
            </SettingRow>
          </>
        )}

        {config.mode === "dynamic" && (
          <div
            className="rounded-md p-3 space-y-3"
            style={{ background: "#f0f4ff", border: "1px solid #c7d2fe" }}
          >
            <div className="flex items-start gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div className="space-y-2">
                <p className="text-xs font-semibold" style={{ color: "#312e81" }}>
                  Dynamic Timer via CMS
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#4338ca" }}>
                  In this mode, the countdown time is set per page through the CMS.
                  Go to the CMS manager in Wix, and for each page where this widget is added,
                  define the target date and time. The widget will automatically display
                  the matching countdown based on the page link.
                </p>
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-medium" style={{ color: "#312e81" }}>
                    How it works:
                  </p>
                  <ol className="text-[11px] leading-relaxed space-y-1 list-decimal list-inside" style={{ color: "#4338ca" }}>
                    <li>Add this widget to a CMS-connected dynamic page</li>
                    <li>In the CMS collection, add a Date/Time field for the countdown</li>
                    <li>Connect the field to the widget via Wix Blocks properties</li>
                    <li>Each page will show a unique countdown matching its CMS data</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Visible Units" tooltip="Choose which time units to display in the countdown.">
        <SettingRow label="Days" tooltip="Show or hide the days counter.">
          <Switch
            checked={config.units.showDays}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showDays: v } })}
            data-testid="switch-days"
          />
        </SettingRow>
        <SettingRow label="Hours" tooltip="Show or hide the hours counter.">
          <Switch
            checked={config.units.showHours}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showHours: v } })}
            data-testid="switch-hours"
          />
        </SettingRow>
        <SettingRow label="Minutes" tooltip="Show or hide the minutes counter.">
          <Switch
            checked={config.units.showMinutes}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showMinutes: v } })}
            data-testid="switch-minutes"
          />
        </SettingRow>
        <SettingRow label="Seconds" tooltip="Show or hide the seconds counter.">
          <Switch
            checked={config.units.showSeconds}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showSeconds: v } })}
            data-testid="switch-seconds"
          />
        </SettingRow>
        <SettingRow label="Milliseconds" tooltip="Show or hide milliseconds for extra precision.">
          <Switch
            checked={config.units.showMilliseconds}
            onCheckedChange={(v) => setConfig({ units: { ...config.units, showMilliseconds: v } })}
            data-testid="switch-milliseconds"
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Unit Labels" tooltip="Custom text labels shown below each time unit.">
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
      <SectionCard title="Presets" tooltip="Quick-start themes that set all colors, fonts, and styles at once.">
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

      <SectionCard title="Custom Colors" tooltip="Set custom colors for the timer background, digit boxes, and separators.">
        <SettingRow label="Background" tooltip="The main background color of the timer widget.">
          <div className="flex items-center gap-2">
            {config.backgroundColor !== "transparent" && (
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => setConfig({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                data-testid="color-background"
              />
            )}
            {config.backgroundColor === "transparent" ? (
              <button
                onClick={() => setConfig({ backgroundColor: "#ffffff" })}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
                data-testid="button-bg-set-color"
              >
                Set Color
              </button>
            ) : (
              <button
                onClick={() => setConfig({ backgroundColor: "transparent" })}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" }}
                data-testid="button-bg-none"
              >
                None
              </button>
            )}
          </div>
        </SettingRow>
        <SettingRow label="Digit BG" tooltip="Background color of each digit box.">
          <div className="flex items-center gap-2">
            {config.digitBackground !== "transparent" && (
              <input
                type="color"
                value={config.digitBackground}
                onChange={(e) => setConfig({ digitBackground: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                data-testid="color-digit-bg"
              />
            )}
            {config.digitBackground === "transparent" ? (
              <button
                onClick={() => setConfig({ digitBackground: "#1a1a2e" })}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
                data-testid="button-digit-set-color"
              >
                Set Color
              </button>
            ) : (
              <button
                onClick={() => setConfig({ digitBackground: "transparent" })}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" }}
                data-testid="button-digit-none"
              >
                None
              </button>
            )}
          </div>
        </SettingRow>
        <SettingRow label="Separator" tooltip="Color of the separator dots between time units.">
          <div className="flex items-center gap-2">
            {config.separatorColor !== "transparent" && (
              <input
                type="color"
                value={config.separatorColor}
                onChange={(e) => setConfig({ separatorColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                data-testid="color-separator"
              />
            )}
            {config.separatorColor === "transparent" ? (
              <button
                onClick={() => setConfig({ separatorColor: "#333333" })}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
                data-testid="button-sep-set-color"
              >
                Set Color
              </button>
            ) : (
              <button
                onClick={() => setConfig({ separatorColor: "transparent" })}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" }}
                data-testid="button-sep-none"
              >
                None
              </button>
            )}
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Background Style" tooltip="Control how the background appears. Glassy adds a frosted glass effect.">
        <SettingRow label="Type" tooltip="Solid shows a flat color, Transparent removes the background, Glassy adds a frosted blur effect.">
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
            <SettingRow label="Blur Amount" tooltip="How strong the frosted glass blur effect is.">
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
            <SettingRow label="Opacity" tooltip="How see-through the background is. 0% is fully transparent, 100% is fully opaque.">
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
          </>
        )}

        {(config.backgroundStyle === "glassy" || config.backgroundStyle === "transparent") && (
          <>
            <SettingRow label="Preview Image" tooltip="Show a background image behind the timer to preview how it looks on real content.">
              <Switch
                checked={config.showGlassPreviewImage || false}
                onCheckedChange={(v) => setConfig({ showGlassPreviewImage: v })}
                data-testid="switch-glass-preview"
              />
            </SettingRow>
            <p className="text-[10px]" style={{ color: "#9ca3af" }}>
              Enable preview image to see how the timer looks over content.
            </p>
          </>
        )}
      </SectionCard>

      <SectionCard title="Layout" tooltip="Control text direction, spacing, and border roundness.">
        <SettingRow label="Direction" tooltip="LTR for left-to-right languages, RTL for right-to-left languages.">
          <Select
            value={config.direction}
            onValueChange={(v) => setConfig({ direction: v as "ltr" | "rtl" })}
          >
            <SelectTrigger className="w-[120px]" data-testid="select-direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ltr">LTR</SelectItem>
              <SelectItem value="rtl">RTL</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Border Radius" tooltip="Roundness of the digit box corners.">
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
      <SectionCard title="Number Typography" tooltip="Font, size, weight and color of the countdown numbers.">
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

      <SectionCard title="Label Typography" tooltip="Font and styling for the labels below each number (Days, Hours, etc).">
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

      <SectionCard title="Header Typography" tooltip="Font and styling for the header text above the timer.">
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
      <SectionCard title="Animation" tooltip="Visual effect when digits change value.">
        <SettingRow label="Style" tooltip="Flip creates a clock-like flip, Slide moves digits up/down, Fade transitions smoothly.">
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

      <SectionCard title="Header & Sub-header" tooltip="Text displayed above the countdown timer.">
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
      <SectionCard title="On Timer Complete" tooltip="What happens when the countdown reaches zero.">
        <SettingRow label="Action" tooltip="Show a message, redirect to a URL, trigger an event for your site, or hide the timer.">
          <Select
            value={config.completionAction}
            onValueChange={(v) => setConfig({ completionAction: v as any })}
          >
            <SelectTrigger className="w-[160px]" data-testid="select-completion-action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="message">Show Message</SelectItem>
              {/* Hidden intentionally — re-enable by uncommenting:
              <SelectItem value="redirect">Redirect to URL</SelectItem>
              */}
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
