import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { downloadTextReport } from "@/lib/report";
import { useMutation, useQuery } from "convex/react";
import { Download, Eye, FlaskConical, History as HistoryIcon, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function History() {
  const analyses = useQuery(api.analysis.listAnalyses);
  const deleteAnalysis = useMutation(api.analysis.deleteAnalysis);
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const rows = analyses ?? [];

  const handleDelete = async (id: Id<"fabricAnalyses">) => {
    setBusy(String(id));
    try {
      await deleteAnalysis({ id: id as never });
      toast.success("Analysis deleted.");
    } catch {
      toast.error("Could not delete this analysis.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          EcoPrint AI · Analysis History
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your fabric analyses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every analysis is stored in the platform database — view the full
          report, download it, or delete it.
        </p>
      </div>

      {analyses === undefined ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading history…
        </div>
      ) : rows.length === 0 ? (
        <Empty className="border border-dashed border-border/70 bg-card">
          <EmptyMedia variant="icon">
            <HistoryIcon className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No analyses yet</EmptyTitle>
            <EmptyDescription>
              Upload a fabric photo in the Analysis page and EcoPrint AI will
              predict retention, ΔE and dyeing conditions — saved here instantly.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/analyze")}>
              <FlaskConical className="mr-2 size-4" /> Analyze a fabric
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Saved analyses ({rows.length})</CardTitle>
            <CardDescription>
              Newest first · records include simulated predictions, labelled as such.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {rows.map((r) => (
              <div
                key={r._id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-background p-3.5 transition-colors hover:border-primary/30"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ring-1 ring-border"
                  style={{ background: r.initialHex, color: "#fff" }}
                >
                  {r.retention}%
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {r.dye} on {r.fabric} · {r.pattern}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.washes} wash(es) · ΔE {r.colorDifference} · {r.retentionCategory} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => navigate(`/reports?id=${r._id}`)}
                  >
                    <Eye className="size-3.5" /> View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => downloadTextReport(r)}
                  >
                    <Download className="size-3.5" /> Report
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    disabled={busy === String(r._id)}
                    onClick={() => void handleDelete(r._id)}
                    aria-label="Delete analysis"
                  >
                    {busy === r._id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
