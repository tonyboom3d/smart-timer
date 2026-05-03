import { Router, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useTimerStore } from "@/lib/store";
import WidgetPage from "@/pages/WidgetPage";

function App() {
  const setAppMode = useTimerStore((s) => s.setAppMode);

  useEffect(() => {
    setAppMode("dashboard");
  }, [setAppMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Router hook={useHashLocation}>
          <Route path="*" component={WidgetPage} />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
