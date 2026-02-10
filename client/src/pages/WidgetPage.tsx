import { useTimerEngine } from "@/hooks/useTimerEngine";
import { usePostMessage } from "@/hooks/usePostMessage";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { useTimerStore } from "@/lib/store";
import { THEME_PRESETS, type ThemePreset } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, GripVertical } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

export default function WidgetPage() {
  const appMode = useTimerStore((s) => s.appMode);
  const isDemo = useTimerStore((s) => s.isDemo);

  useTimerEngine();
  usePostMessage();

  if (appMode === "dashboard") {
    return <DashboardView />;
  }

  if (isDemo) {
    return <DemoView />;
  }

  return <TimerDisplay />;
}

function DashboardView() {
  const config = useTimerStore((s) => s.config);
  const activeBreakpoint = useTimerStore((s) => s.activeBreakpoint);
  const setActiveBreakpoint = useTimerStore((s) => s.setActiveBreakpoint);
  const [viewportPreset, setViewportPreset] = useState<"desktop" | "tablet" | "mobile">("tablet");
  const [customWidth, setCustomWidth] = useState<number | null>(540);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragSide = useRef<"left" | "right">("right");

  const presetWidths = { desktop: 1280, tablet: 768, mobile: 375 };
  const currentWidth = customWidth || presetWidths[viewportPreset];

  const handlePreset = (preset: "desktop" | "tablet" | "mobile") => {
    setViewportPreset(preset);
    setCustomWidth(null);
    if (config.responsiveMode === "per-breakpoint") {
      setActiveBreakpoint(preset);
    }
  };

  const handleMouseDown = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragSide.current = side;
    const startX = e.clientX;
    const startWidth = currentWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const diff = ev.clientX - startX;
      const multiplier = side === "right" ? 2 : -2;
      const newWidth = Math.max(280, Math.min(1400, startWidth + diff * multiplier));
      setCustomWidth(Math.round(newWidth));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const getPreviewBg = () => {
    if (config.backgroundStyle === "glassy" && config.showGlassPreviewImage) {
      return {
        backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { background: "#f3f4f6" };
  };

  return (
    <div className="flex h-screen" style={{ background: "#f9fafb" }}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex items-center justify-between gap-2 px-4 py-2 border-b shrink-0"
          style={{ borderColor: "#e5e7eb", background: "#ffffff" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold mr-2 uppercase tracking-tight" style={{ color: "#4f46e5" }}>Viewport Size:</span>
            <button
              onClick={() => handlePreset("desktop")}
              className="p-2 rounded-md transition-all hover:bg-indigo-50"
              style={{
                background: viewportPreset === "desktop" && !customWidth ? "#4f46e5" : "transparent",
                color: viewportPreset === "desktop" && !customWidth ? "#ffffff" : "#4f46e5",
                border: "1px solid #4f46e5"
              }}
              data-testid="button-viewport-desktop"
              title="Desktop"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePreset("tablet")}
              className="p-2 rounded-md transition-all hover:bg-indigo-50"
              style={{
                background: viewportPreset === "tablet" && !customWidth ? "#4f46e5" : "transparent",
                color: viewportPreset === "tablet" && !customWidth ? "#ffffff" : "#4f46e5",
                border: "1px solid #4f46e5"
              }}
              data-testid="button-viewport-tablet"
              title="Tablet"
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePreset("mobile")}
              className="p-2 rounded-md transition-all hover:bg-indigo-50"
              style={{
                background: viewportPreset === "mobile" && !customWidth ? "#4f46e5" : "transparent",
                color: viewportPreset === "mobile" && !customWidth ? "#ffffff" : "#4f46e5",
                border: "1px solid #4f46e5"
              }}
              data-testid="button-viewport-mobile"
              title="Smartphone"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-white" style={{ borderColor: "#4f46e5" }}>
            <span className="text-sm font-bold tabular-nums" style={{ color: "#4f46e5" }}>
              {currentWidth}px
            </span>
          </div>
        </div>

        <div
          className="flex-1 flex items-center justify-center p-6 overflow-auto"
          style={getPreviewBg()}
          ref={containerRef}
        >
          <div className="flex items-center" style={{ position: "relative" }}>
            <div
              className="flex items-center justify-center cursor-col-resize select-none shrink-0"
              onMouseDown={handleMouseDown("left")}
              style={{
                width: "16px",
                color: "#d1d5db",
              }}
              data-testid="resize-handle-left"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <div
              className="transition-[width] duration-200 ease-out"
              style={{
                width: `${Math.min(currentWidth, (containerRef.current?.clientWidth || 1400) - 60)}px`,
                minWidth: "280px",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                border: "1px solid #e5e7eb",
              }}
              data-testid="preview-container"
            >
              <TimerDisplay />
            </div>

            <div
              className="flex items-center justify-center cursor-col-resize select-none shrink-0"
              onMouseDown={handleMouseDown("right")}
              style={{
                width: "16px",
                color: "#d1d5db",
              }}
              data-testid="resize-handle-right"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center px-4 py-2 border-t shrink-0"
          style={{ borderColor: "#e5e7eb", background: "#ffffff" }}
        >
          <p className="text-[11px]" style={{ color: "#9ca3af" }}>
            Drag the handles on either side to manually resize the preview. Settings can be configured per screen size.
          </p>
        </div>
      </div>

      <div className="w-[360px] border-l shrink-0 h-screen overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
        <DashboardPanel />
      </div>
    </div>
  );
}

function DemoView() {
  const applyTheme = useTimerStore((s) => s.applyTheme);
  const config = useTimerStore((s) => s.config);
  const setAppMode = useTimerStore((s) => s.setAppMode);
  const setConfig = useTimerStore((s) => s.setConfig);
  const [viewportPreset, setViewportPreset] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const presetWidths = { desktop: 1280, tablet: 768, mobile: 375 };
  const currentWidth = customWidth || presetWidths[viewportPreset];

  const handlePreset = (preset: "desktop" | "tablet" | "mobile") => {
    setViewportPreset(preset);
    setCustomWidth(null);
  };

  const handleMouseDown = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = currentWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const diff = ev.clientX - startX;
      const multiplier = side === "right" ? 2 : -2;
      const newWidth = Math.max(280, Math.min(1400, startWidth + diff * multiplier));
      setCustomWidth(Math.round(newWidth));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const themes: Array<{ id: ThemePreset; name: string }> = [
    { id: "minimal-white", name: "Minimal" },
    { id: "dark-cyberpunk", name: "Cyberpunk" },
    { id: "urgent-red", name: "Urgent" },
    { id: "soft-pastel", name: "Pastel" },
    { id: "corporate-blue", name: "Corporate" },
  ];

  const handleThemeChange = (id: ThemePreset) => {
    applyTheme(id);
    setConfig({
      headerText: "Flash Sale Ends In",
      subHeaderText: "Don't miss this exclusive offer!",
      progressStyle: "linear",
    });
  };

  const getPreviewBg = () => {
    if (config.backgroundStyle === "glassy" && config.showGlassPreviewImage) {
      return {
        backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)",
        backgroundSize: "cover" as const,
        backgroundPosition: "center" as const,
      };
    }
    return { background: "#f3f4f6" };
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f9fafb" }}
    >
      <header
        className="flex items-center justify-between gap-4 px-6 py-3 border-b shrink-0"
        style={{ borderColor: "#e5e7eb", background: "#ffffff" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "#4f46e5", color: "#fff" }}
          >
            CT
          </div>
          <span className="text-sm font-semibold" style={{ color: "#111827" }}>
            Countdown Timer Widget
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: "#eef2ff", color: "#4f46e5" }}
          >
            Demo Mode
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center rounded-md p-0.5"
            style={{ background: "#f3f4f6" }}
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: config.theme === t.id ? "#ffffff" : "transparent",
                  color: config.theme === t.id ? "#111827" : "#6b7280",
                  boxShadow: config.theme === t.id ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
                data-testid={`demo-theme-${t.id}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div
            className="flex items-center rounded-md p-0.5 ml-2"
            style={{ background: "#f3f4f6" }}
          >
            <button
              onClick={() => handlePreset("desktop")}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewportPreset === "desktop" && !customWidth ? "#ffffff" : "transparent",
                color: viewportPreset === "desktop" && !customWidth ? "#4f46e5" : "#9ca3af",
                boxShadow: viewportPreset === "desktop" && !customWidth ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
              data-testid="button-viewport-desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePreset("tablet")}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewportPreset === "tablet" && !customWidth ? "#ffffff" : "transparent",
                color: viewportPreset === "tablet" && !customWidth ? "#4f46e5" : "#9ca3af",
                boxShadow: viewportPreset === "tablet" && !customWidth ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
              data-testid="button-viewport-tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePreset("mobile")}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewportPreset === "mobile" && !customWidth ? "#ffffff" : "transparent",
                color: viewportPreset === "mobile" && !customWidth ? "#4f46e5" : "#9ca3af",
                boxShadow: viewportPreset === "mobile" && !customWidth ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
              data-testid="button-viewport-mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <span className="text-[10px] tabular-nums px-2" style={{ color: "#9ca3af" }}>
              {currentWidth}px
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setAppMode("dashboard")}
            className="ml-2"
            data-testid="button-open-dashboard"
          >
            Open Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 overflow-auto" style={getPreviewBg()} ref={containerRef}>
        <div className="flex items-center">
          <div
            className="flex items-center justify-center cursor-col-resize select-none shrink-0"
            onMouseDown={handleMouseDown("left")}
            style={{ width: "20px", color: "#d1d5db" }}
            data-testid="resize-handle-left"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div
            className="transition-[width] duration-200 ease-out"
            style={{
              width: `${Math.min(currentWidth, (containerRef.current?.clientWidth || 1400) - 80)}px`,
              minWidth: "280px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
            data-testid="preview-container"
          >
            <TimerDisplay />
          </div>

          <div
            className="flex items-center justify-center cursor-col-resize select-none shrink-0"
            onMouseDown={handleMouseDown("right")}
            style={{ width: "20px", color: "#d1d5db" }}
            data-testid="resize-handle-right"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </main>

      <footer
        className="flex items-center justify-center gap-4 px-6 py-3 border-t shrink-0"
        style={{ borderColor: "#e5e7eb", color: "#9ca3af", background: "#ffffff" }}
      >
        <span className="text-xs">
          Drag handles to resize preview
        </span>
        <span style={{ color: "#d1d5db" }}>|</span>
        <span className="text-xs">
          Navigate to <code className="px-1 py-0.5 rounded text-xs" style={{ background: "#f3f4f6", color: "#4f46e5" }}>/dashboard</code> for full settings panel
        </span>
      </footer>
    </div>
  );
}
