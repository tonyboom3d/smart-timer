import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Info, Check } from "lucide-react";
import { useTimerStore } from "@/lib/store";
import { generateExportHtml, type Breakpoint } from "@/lib/exportHtml";
import type { TimerConfig } from "@shared/schema";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const config = useTimerStore((s) => s.config);
  const breakpointConfigsRaw = useTimerStore((s) => s.breakpointConfigs);
  const getConfigForBreakpoint = useTimerStore((s) => s.getConfigForBreakpoint);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { html, warnings } = useMemo(() => {
    if (!open) return { html: "", warnings: [] as string[] };
    const usePerBp = config.responsiveMode === "per-breakpoint";
    let breakpointConfigs: Record<Breakpoint, TimerConfig> | null = null;
    if (usePerBp) {
      breakpointConfigs = {
        desktop: getConfigForBreakpoint("desktop"),
        tablet: getConfigForBreakpoint("tablet"),
        mobile: getConfigForBreakpoint("mobile"),
      };
    }
    return generateExportHtml({ config, breakpointConfigs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, config, breakpointConfigsRaw]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      toast({ title: "HTML copied", description: "Paste it into any iframe on your site." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please select the HTML and copy manually.", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "countdown-timer.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle>Export as Standalone HTML</DialogTitle>
          <DialogDescription>
            A single self-contained HTML file with your timer settings baked in. Drop it into any iframe or open it directly in a browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          <div className="flex flex-col gap-2 min-h-0">
            <div className="text-xs font-medium" style={{ color: "#374151" }}>Live Preview</div>
            <div
              className="flex-1 rounded-md overflow-hidden border"
              style={{ borderColor: "#e5e7eb", background: "#f3f4f6", minHeight: "300px" }}
            >
              {html && (
                <iframe
                  title="Export preview"
                  srcDoc={html}
                  sandbox="allow-scripts allow-same-origin"
                  style={{ width: "100%", height: "100%", border: "none", background: "transparent" }}
                  data-testid="iframe-export-preview"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <div className="text-xs font-medium" style={{ color: "#374151" }}>HTML Source</div>
            <Textarea
              readOnly
              value={html}
              className="flex-1 font-mono text-[11px] resize-none"
              style={{ minHeight: "300px", whiteSpace: "pre", overflow: "auto" }}
              data-testid="textarea-export-html"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleCopy} size="sm" data-testid="button-copy-html" className="flex-1">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy HTML
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline" data-testid="button-download-html" className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                Download .html
              </Button>
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div
            className="rounded-md p-3 text-xs space-y-1"
            style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
            data-testid="export-warnings"
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="w-3.5 h-3.5" />
              Heads up
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
