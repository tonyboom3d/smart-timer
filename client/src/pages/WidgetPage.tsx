import { useTimerEngine } from "@/hooks/useTimerEngine";
import { usePostMessage } from "@/hooks/usePostMessage";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { useTimerStore } from "@/lib/store";
import { THEME_PRESETS, type ThemePreset } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

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
  return (
    <div className="flex h-screen" style={{ background: "#0a0a12" }}>
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: "#111118" }}>
        <div className="w-full max-w-2xl">
          <TimerDisplay />
        </div>
      </div>
      <div className="w-[360px] border-l shrink-0 h-screen overflow-hidden" style={{ borderColor: "#1e1e2a" }}>
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
  const [viewportSize, setViewportSize] = useState<"desktop" | "mobile">("desktop");

  const themes: Array<{ id: ThemePreset; name: string }> = [
    { id: "dark-cyberpunk", name: "Cyberpunk" },
    { id: "minimal-white", name: "Minimal" },
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#08080e" }}
    >
      <header
        className="flex items-center justify-between gap-4 px-6 py-3 border-b shrink-0"
        style={{ borderColor: "#1a1a28", background: "#0c0c16" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "#5b5bff", color: "#fff" }}
          >
            CT
          </div>
          <span className="text-sm font-semibold" style={{ color: "#e0e0f0" }}>
            Countdown Timer Widget
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: "#1a1a2e", color: "#7c7cff" }}
          >
            Demo Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-md p-0.5"
            style={{ background: "#1a1a24" }}
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: config.theme === t.id ? "#2a2a4a" : "transparent",
                  color: config.theme === t.id ? "#ffffff" : "#888899",
                }}
                data-testid={`demo-theme-${t.id}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div
            className="flex items-center rounded-md p-0.5 ml-2"
            style={{ background: "#1a1a24" }}
          >
            <button
              onClick={() => setViewportSize("desktop")}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewportSize === "desktop" ? "#2a2a4a" : "transparent",
                color: viewportSize === "desktop" ? "#ffffff" : "#888899",
              }}
              data-testid="button-viewport-desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize("mobile")}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewportSize === "mobile" ? "#2a2a4a" : "transparent",
                color: viewportSize === "mobile" ? "#ffffff" : "#888899",
              }}
              data-testid="button-viewport-mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setAppMode("dashboard")}
            style={{ background: "#5b5bff", color: "#fff" }}
            className="ml-2"
            data-testid="button-open-dashboard"
          >
            Open Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div
          className="transition-all duration-500 ease-out"
          style={{
            width: viewportSize === "mobile" ? "375px" : "100%",
            maxWidth: viewportSize === "mobile" ? "375px" : "800px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(91, 91, 255, 0.06), 0 0 120px rgba(0, 0, 0, 0.3)",
            border: "1px solid #1a1a28",
          }}
        >
          <TimerDisplay />
        </div>
      </main>

      <footer
        className="flex items-center justify-center gap-4 px-6 py-3 border-t shrink-0"
        style={{ borderColor: "#1a1a28", color: "#555566" }}
      >
        <span className="text-xs">
          Navigate to <code className="px-1 py-0.5 rounded text-xs" style={{ background: "#1a1a24", color: "#7c7cff" }}>/dashboard</code> for full settings panel
        </span>
        <span style={{ color: "#2a2a3a" }}>|</span>
        <span className="text-xs">
          Add <code className="px-1 py-0.5 rounded text-xs" style={{ background: "#1a1a24", color: "#7c7cff" }}>?demo=true</code> for demo mode
        </span>
      </footer>
    </div>
  );
}
