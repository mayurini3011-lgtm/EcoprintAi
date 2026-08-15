import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { STAGE_ICONS, type ChainCheck } from "./SupplyChainTimeline";
import { cn } from "@/lib/utils";
import { shortHash } from "@/lib/format";

/**
 * Cryptography walk-through: for each event we show the STORED hash and the
 * RECOMPUTED hash (SHA-256 of the current canonical JSON). A mismatch at any
 * row means the record was modified after it was sealed.
 */
export function HashChainTable({
  checks,
}: {
  checks: ChainCheck[];
}) {
  if (checks.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Run verification to see the per-record hashes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Record</TableHead>
            <TableHead>Stored hash</TableHead>
            <TableHead>Recomputed</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((c) => {
            const ok = c.hashOk && c.linkOk;
            return (
              <TableRow
                key={c.chainIndex}
                className={cn(!ok && "bg-rose-500/10")}
              >
                <TableCell className="text-muted-foreground">
                  {c.chainIndex}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span>{STAGE_ICONS[c.stage] ?? "•"}</span>
                    {c.stage}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-medium">{c.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {c.batchId}
                  </p>
                </TableCell>
                <TableCell>
                  <code className="font-mono text-[10px] text-muted-foreground">
                    {shortHash(c.hash, 14)}
                  </code>
                </TableCell>
                <TableCell>
                  <code
                    className={cn(
                      "font-mono text-[10px]",
                      c.hashOk ? "text-muted-foreground" : "font-semibold text-rose-600",
                    )}
                  >
                    {shortHash(c.recomputedHash, 14)}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  {ok ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                      <XCircle className="size-3.5" /> FAILED
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
