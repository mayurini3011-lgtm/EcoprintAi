import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Logo } from "@/components/brand/Logo";
import { REPORT_DISCLAIMER } from "@/lib/report";
import { useQuery } from "convex/react";
import { Download, FileText, FlaskConical, Printer } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

export default function Reports() {
  const [params] = useSearchParams();
  const requestedId = params.get("id");
  const all = useQuery(api.analysis.listAnalyses);

  const selected = requestedId
    ? all?.find((a) => String(a._id) === requestedId)
    : all?.[0];

  const report = selected;

  if (all === undefined) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <FlaskConical className="size-4 animate-pulse" /> Loading reports…
      </div>
    );
  }

  if (!report) {
    return (
      <Empty className="border border-dashed border-border/70 bg-card">
        <EmptyMedia variant="icon">
          <FileText className="size-6" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No report to show</EmptyTitle>
          <EmptyDescription>
            Run a fabric analysis first — every analysis gets a full printable report.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/analyze">Analyze a fabric</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            EcoPrint AI · Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Fabric analysis report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A printable summary of the analysis — use “Download PDF” and choose
            Save as PDF from the browser dialog.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="size-4" /> Download PDF
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/history">All analyses</Link>
          </Button>
        </div>
      </div>

      {/* Printable report */}
      <Card className="print-area shadow-none border-border/70">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <Logo />
              <p className="mt-1.5 text-xs text-muted-foreground">
                AI-Powered Natural Dye Optimization & Fabric Color Retention Analysis
              </p>
            </div>
            <div className="text-right text-[11px] text-muted-foreground">
              <p>Report generated</p>
              <p className="font-medium text-foreground">
                {new Date(report.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Overview */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ReportBox label="Fabric" value={report.fabric} />
            <ReportBox label="Natural dye" value={report.dye} />
            <ReportBox label="Pattern" value={report.pattern} />
            <ReportBox label="Wash cycles" value={`${report.washes}`} />
          </div>

          {/* Colour comparison */}
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-muted/60 p-4">
            <div className="text-center">
              <span className="mx-auto block size-12 rounded-xl shadow-inner ring-1 ring-border" style={{ background: report.initialHex }} />
              <p className="mt-1 text-[10px] text-muted-foreground">Before wash</p>
              <p className="font-mono text-[9px] text-muted-foreground">{report.initialHex}</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="text-center">
              <span className="mx-auto block size-12 rounded-xl shadow-inner ring-1 ring-border" style={{ background: report.afterHex }} />
              <p className="mt-1 text-[10px] text-muted-foreground">After {report.washes} washes</p>
              <p className="font-mono text-[9px] text-muted-foreground">{report.afterHex}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-display text-3xl font-semibold text-primary">{report.retention}%</p>
              <p className="text-[10px] text-muted-foreground">{report.retentionCategory} retention</p>
              <p className="text-[10px] text-muted-foreground">ΔE {report.colorDifference}</p>
            </div>
          </div>

          {/* Details */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ReportBox label="Dominant colour" value={`${report.dominantColor} · ${report.initialHex}`} />
            <ReportBox label="Color difference (ΔE)" value={`${report.colorDifference}`} />
            <ReportBox label="Dyeing temperature" value={`${report.tempMin}–${report.tempMax}°C`} />
            <ReportBox label="Dyeing duration" value={`${report.durationMin}–${report.durationMax} min`} />
            <ReportBox label="Mordant" value={report.mordant} />
            <ReportBox label="AI confidence" value={`${report.confidence}%`} />
            <ReportBox label="Sustainability score" value={`${report.sustainabilityScore}/100`} />
            <ReportBox label="Mode" value={report.mode === "simulated" ? "Simulated prediction" : "Model"} />
          </div>

          {/* Recommendations */}
          <div className="mt-5 space-y-2.5">
            <h3 className="text-sm font-semibold">AI recommendations</h3>
            <ReportNote title="Dye" text={report.recommendation} />
            <ReportNote title="Fabric" text={report.fabricRecommendation} />
            <ReportNote title="Washing" text={report.washingRecommendation} />
          </div>

          {/* Footer */}
          <div className="mt-6 border-t border-border/60 pt-4">
            <p className="text-[10px] leading-4 text-muted-foreground">
              {REPORT_DISCLAIMER}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              EcoPrint AI · Secure natural fashion · This report contains no
              sensitive customer data.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="no-print flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Download className="size-3.5" /> For a plain-text copy, use the
        Download Report button on the Analysis History page.
      </p>
    </div>
  );
}

function ReportBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function ReportNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
      <p className="text-[9px] font-semibold tracking-wide text-primary uppercase">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

// Keep the Id import referenced for type clarity in future param-based routes.
export type ReportId = Id<"fabricAnalyses">;
