import { useTimerStore } from "@/lib/store";
import { motion } from "framer-motion";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

export function CompletionMessage() {
  const config = useTimerStore((s) => s.config);
  const [scaleRef, rawScale] = useResponsiveScale();
  const scale = config.autoResponsiveText !== false ? rawScale : 1;

  return (
    <motion.div
      ref={scaleRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: `${config.padding}px` }}
      data-testid="completion-message"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2
          style={{
            fontFamily: config.headerTypography.fontFamily,
            fontSize: `${config.headerTypography.fontSize * 1.5 * scale}px`,
            fontWeight: config.headerTypography.fontWeight,
            color: config.headerTypography.color,
            lineHeight: 1.2,
          }}
        >
          {config.completionMessage || "Time's Up!"}
        </h2>
      </motion.div>
    </motion.div>
  );
}
