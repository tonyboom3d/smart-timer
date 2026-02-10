interface LinearProgressProps {
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
  borderRadius?: number;
}

export function LinearProgress({
  progress,
  color,
  trackColor,
  height = 4,
  borderRadius = 2,
}: LinearProgressProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <div
      className="w-full"
      style={{
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        background: trackColor,
        overflow: "hidden",
        opacity: 0.6,
      }}
      data-testid="linear-progress"
      role="progressbar"
      aria-valuenow={Math.round(clampedProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          height: "100%",
          width: `${clampedProgress * 100}%`,
          background: color,
          borderRadius: `${borderRadius}px`,
          transition: "width 0.5s ease-out",
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}
