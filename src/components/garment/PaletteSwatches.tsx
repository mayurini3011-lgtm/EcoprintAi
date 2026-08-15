import type { PaletteColor } from "@/lib/ai";
import { cn } from "@/lib/utils";

export function PaletteSwatches({
  palette,
  size = "md",
  selectedHex,
  onSelect,
  className,
}: {
  palette: PaletteColor[];
  size?: "sm" | "md" | "lg";
  selectedHex?: string;
  onSelect?: (color: PaletteColor) => void;
  className?: string;
}) {
  const dims =
    size === "sm" ? "size-6" : size === "lg" ? "size-12" : "size-8";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {palette.map((color) => {
        const active = selectedHex === color.hex;
        return (
          <button
            key={color.hex + color.name}
            type="button"
            title={color.name}
            onClick={() => onSelect?.(color)}
            className={cn(
              dims,
              "shrink-0 rounded-full border border-black/10 shadow-sm transition-transform",
              onSelect && "cursor-pointer hover:scale-110",
              active && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
            )}
            style={{ backgroundColor: color.hex }}
          />
        );
      })}
    </div>
  );
}

const TONES: Record<string, string> = {
  verified: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  finished: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  limited: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  available: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  flagged: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  rejected: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  out: "bg-zinc-500/15 text-zinc-300 ring-zinc-400/30",
  low: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  medium: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  high: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
};

const DOTS: Record<string, string> = {
  verified: "bg-emerald-500",
  delivered: "bg-emerald-500",
  finished: "bg-emerald-500",
  pending: "bg-amber-500",
  limited: "bg-amber-500",
  available: "bg-emerald-500",
  flagged: "bg-rose-500",
  rejected: "bg-rose-500",
  out: "bg-zinc-400",
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize",
        TONES[key] ?? "bg-zinc-500/15 text-zinc-300 ring-zinc-400/30",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOTS[key] ?? "bg-zinc-400")} />
      {status}
    </span>
  );
}
