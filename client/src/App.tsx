import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useTimerStore } from "@/lib/store";
import WidgetPage from "@/pages/WidgetPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WidgetPage} />
      <Route path="/dashboard" component={DashboardRoute} />
      <Route component={WidgetPage} />
    </Switch>
  );
}

function DashboardRoute() {
  const setAppMode = useTimerStore((s) => s.setAppMode);
  useEffect(() => {
    setAppMode("dashboard");
  }, [setAppMode]);
  return <WidgetPage />;
}

function App() {
  const setIsDemo = useTimerStore((s) => s.setIsDemo);
  const setAppMode = useTimerStore((s) => s.setAppMode);
  const applyTheme = useTimerStore((s) => s.applyTheme);
  const setConfig = useTimerStore((s) => s.setConfig);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("mode") === "dashboard") {
      setAppMode("dashboard");
    }

    if (params.get("demo") === "true") {
      setIsDemo(true);
      applyTheme("minimal-white");
      setConfig({
        headerText: "Flash Sale Ends In",
        subHeaderText: "Don't miss this exclusive offer!",
        targetDate: new Date(Date.now() + 86400000 + 7200000 + 1800000 + 45000).toISOString(),
        progressStyle: "linear",
      });
    }

    const noConfig = !params.get("mode") && !params.get("demo");
    if (noConfig) {
      setIsDemo(true);
      applyTheme("minimal-white");
      setConfig({
        headerText: "Flash Sale Ends In",
        subHeaderText: "Don't miss this exclusive offer!",
        targetDate: new Date(Date.now() + 86400000 + 7200000 + 1800000 + 45000).toISOString(),
        progressStyle: "linear",
      });
    }
  }, [setIsDemo, setAppMode, applyTheme, setConfig]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
