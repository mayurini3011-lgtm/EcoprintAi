import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { StatusPill } from "./PaletteSwatches";
import { cn } from "@/lib/utils";
import { formatDate, shortHash } from "@/lib/format";

export interface ChainEventSummary {
  stage: string;
  title: string;
  actor: string;
  batchId: string;
  date: string;
  status: string;
  hash?: string;
  prevHash?: string;
  tampered?: boolean;
}

export interface ChainCheck {
  chainIndex: number;
  stage: string;
  title: string;
  actor: string;
  batchId: string;
  date: string;
  hash: string;
  prevHash: string;
  recomputedHash: string;
  hashOk: boolean;
  linkOk: boolean;
  tampered: boolean;
}

export const STAGE_ICONS: Record<string, string> = {
  FARMER: "🌱",
  RAW_MATERIAL: "🌿",
  DYE: "🧪",
  FABRIC: "🧵",
  DESIGN: "🤖",
  TAILOR: "✂️",
  FINISHED: "👗",
};

export function SupplyChainTimeline({
  events,
  showHashes = true,
  checks,
  className,
}: {
  events: ChainEventSummary[];
  showHashes?: boolean;
  checks?: ChainCheck[] | null;
  className?: string;
}) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No supply-chain events recorded yet.
      </p>
    );
  }

  const checkByIndex = new Map(
    (checks ?? []).map((c) => [c.chainIndex, c]),
  );

  return (
    <ol className={cn("relative space-y-0", className)}>
      {events.map((event, i) => {
        const check = checkByIndex.get(i);
        const ok = check ? check.hashOk && check.linkOk : !event.tampered;
        const isLast = i === events.length - 1;
        return (
          <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
            {/* rail */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-full w-px bg-border"
              />
            )}
            {/* node */}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm",
                ok
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-rose-400/30 bg-rose-500/10",
              )}
            >
              {STAGE_ICONS[event.stage] ?? "•"}
              {ok ? (
                <CheckCircle2 className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-background text-emerald-500" />
              ) : (
                <XCircle className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-background text-rose-500" />
              )}
            </span>
            {/* content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-medium text-foreground">
                  {event.title}
                </p>
                <StatusPill status={event.status} />
                {check && !ok && (
                  <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wide">
                    Hash mismatch
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.actor}
                {event.batchId ? (
                  <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {event.batchId}
                  </span>
                ) : null}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                <span>{formatDate(event.date)}</span>
                {showHashes && event.hash && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                    <Lock className="size-2.5" />
                    {shortHash(event.hash)}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
