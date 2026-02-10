interface SeparatorProps {
  color: string;
  fontSize: number;
}

export function TimerSeparator({ color, fontSize }: SeparatorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center self-start"
      style={{
        gap: `${fontSize * 0.2}px`,
        paddingTop: `${fontSize * 0.15}px`,
        height: `${fontSize * 1.1 + 16}px`,
      }}
    >
      <div
        style={{
          width: `${Math.max(4, fontSize * 0.1)}px`,
          height: `${Math.max(4, fontSize * 0.1)}px`,
          borderRadius: "50%",
          background: color,
        }}
      />
      <div
        style={{
          width: `${Math.max(4, fontSize * 0.1)}px`,
          height: `${Math.max(4, fontSize * 0.1)}px`,
          borderRadius: "50%",
          background: color,
        }}
      />
    </div>
  );
}
