const PARENT_CLIPBOARD_TIMEOUT_MS = 3000;

export type ParentClipboardResult = "copied" | "failed" | "timeout";

/**
 * When embedded in Wix (or any parent), asks the parent to copy `text` via
 * e.g. wixWindowFrontend.copyToClipboard(text), then respond with CLIPBOARD_COPIED
 * or CLIPBOARD_COPY_FAILED. Falls back to navigator.clipboard when not embedded or on timeout.
 */
export function copyTextViaParentFrame(text: string): Promise<ParentClipboardResult> {
  if (typeof window === "undefined" || window.parent === window) {
    return Promise.resolve("timeout");
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve("timeout");
    }, PARENT_CLIPBOARD_TIMEOUT_MS);

    const handler = (event: MessageEvent) => {
      const data = event.data as { type?: string } | null;
      if (!data || typeof data !== "object" || !data.type) return;

      if (data.type === "CLIPBOARD_COPIED") {
        cleanup();
        resolve("copied");
        return;
      }
      if (data.type === "CLIPBOARD_COPY_FAILED") {
        cleanup();
        resolve("failed");
      }
    };

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", handler);
    };

    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "COPY_TO_CLIPBOARD", payload: { text } }, "*");
  });
}
