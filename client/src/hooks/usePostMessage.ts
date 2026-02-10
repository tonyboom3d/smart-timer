import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/lib/store";
import type { IncomingMessage } from "@shared/schema";

export function usePostMessage() {
  const setConfig = useTimerStore((s) => s.setConfig);
  const setAppMode = useTimerStore((s) => s.setAppMode);
  const applyTheme = useTimerStore((s) => s.applyTheme);
  const lastHeightRef = useRef<number>(0);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data as IncomingMessage;
      if (!data || !data.type) return;

      switch (data.type) {
        case "INIT_WIDGET": {
          if (data.payload.config) {
            setConfig(data.payload.config);
          }
          if (data.payload.theme) {
            applyTheme(data.payload.theme);
          }
          if (data.payload.mode) {
            setAppMode(data.payload.mode);
          }
          break;
        }
        case "UPDATE_PREVIEW": {
          if (data.payload.config) {
            setConfig(data.payload.config);
          }
          break;
        }
      }
    },
    [setConfig, setAppMode, applyTheme]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "WIDGET_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.contentRect.height);
        if (height !== lastHeightRef.current) {
          lastHeightRef.current = height;
          window.parent.postMessage(
            { type: "HEIGHT_CHANGE", payload: { height } },
            "*"
          );
        }
      }
    });

    const root = document.getElementById("root");
    if (root) observer.observe(root);

    return () => observer.disconnect();
  }, []);
}
