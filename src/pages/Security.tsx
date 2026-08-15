import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HashChainTable } from "@/components/garment/HashChainTable";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { StatCard } from "@/components/security/StatCard";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  Fingerprint,
  Loader2,
  Lock,
  QrCode as QrIcon,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

/** The seeded hero garment used for the tamper demonstration. */
const DEMO_GARMENT = "NF-2026-000124";

export default function Security() {
  const { user } = useAuth();
  const stats = useQuery(api.admin.adminStats);
  const verification = useQuery(api.security.verifyGarmentChain, {
    garmentId: DEMO_GARMENT,
  });
  const analyses = useQuery(api.catalog.listAiAnalyses);
  const audits = useQuery(api.catalog.listAuditLogs);
  const simulateTampering = useMutation(api.security.simulateTampering);
  const restoreChain = useMutation(api.security.restoreChain);
  const resetDemo = useMutation(api.seed.resetDemoData);
  const setDemoRole = useMutation(api.roles.setDemoRole);

  const isAdmin = user?.role === "admin";
  const valid = verification?.valid ?? false;
  const failure = verification?.failures[0];

  const handleSimulate = async () => {
    if (!isAdmin) {
      await setDemoRole({ role: "admin" });
      toast.success("Demo role switched to Admin");
    }
    try {
      const result = await simulateTampering({ garmentId: DEMO_GARMENT });
      if (result.tampered) {
        toast.error(`Tampering simulated on ${result.stage} record`, {
          description: "Run verification to detect it.",
        });
      } else {
        toast(result.message ?? "Nothing to tamper.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Simulation failed.");
    }
  };

  const handleRestore = async () => {
    if (!isAdmin) await setDemoRole({ role: "admin" });
    try {
      const result = await restoreChain({ garmentId: DEMO_GARMENT });
      toast.success(`${result.restored} record(s) restored to pristine state`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed.");
    }
  };

  const totals = stats?.totals;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Security Center
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Cryptographically verifiable supply chain
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            SHA-256 hash-chained events · AI risk detection · QR authenticity.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 py-1">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
          </span>
          LIVE DEMO
        </Badge>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
        <StatCard
          icon={ShieldCheck}
          label="Supply Chain Integrity"
          value={verification ? (valid ? "100%" : "BREACHED") : "…"}
          tone={verification ? (valid ? "success" : "danger") : "default"}
        />
        <StatCard
          icon={Fingerprint}
          label="Tamper Detection"
          value={verification ? (valid ? "Clean" : "Alert") : "…"}
          tone={verification ? (valid ? "success" : "danger") : "default"}
        />
        <StatCard icon={Lock} label="Verified Batches" value={totals?.verifiedRecords ?? "…"} tone="success" />
        <StatCard icon={Siren} label="Suspicious Records" value={totals?.suspiciousRecords ?? "…"} tone="danger" />
        <StatCard icon={Activity} label="AI Risk Detection" value="Active" tone="info" />
        <StatCard icon={Fingerprint} label="Crypto" value="SHA-256" tone="default" />
        <StatCard icon={QrIcon} label="QR Authenticity" value="Enabled" tone="success" />
      </div>

      {/* Tamper demonstration */}
      <Card className={cn("shadow-none border-border/70", !valid && "border-rose-400/40")}>
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4 text-primary" />
              Hash-chain demonstration
            </CardTitle>
            <CardDescription>
              Garment {DEMO_GARMENT} · every supply-chain record is sealed with
              SHA-256 and linked to the previous hash. Tamper with any record
              and the chain breaks.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" onClick={handleSimulate}>
              <Unlock className="mr-2 size-4" />
              Simulate Tampering
            </Button>
            <Button variant="outline" onClick={handleRestore}>
              <RotateCcw className="mr-2 size-4" />
              Restore Record
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await resetDemo();
                toast.success("Demo data reset and re-seeded");
              }}
            >
              <RefreshCcw className="mr-2 size-4" />
              Reset demo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!verification ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Verifying chain…
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "mb-4 rounded-xl border p-4",
                  valid
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/30 bg-rose-500/10 text-rose-200",
                )}
              >
                <p className="flex items-center gap-2 text-sm font-bold">
                  {valid ? "🟢 VERIFIED — No Tampering Detected" : "🔴 TAMPERING DETECTED"}
                </p>
                {valid ? (
                  <p className="mt-1 text-xs text-emerald-300/90">
                    All {verification.eventCount} records match their stored
                    SHA-256 hashes and the chain links are intact.
                  </p>
                ) : (
                  <div className="mt-1 text-xs text-rose-300/90">
                    <p>
                      The hash of this record no longer matches the stored
                      integrity chain.
                    </p>
                    {failure && (
                      <p className="mt-1 font-medium">
                        Failed record: #{failure.chainIndex} · {failure.stage} ·{" "}
                        {failure.title} (batch {failure.batchId})
                      </p>
                    )}
                    <p className="mt-1">
                      Recomputing SHA-256 from the current record produces a
                      different digest than the one sealed at creation time —
                      the modification is provable.
                    </p>
                  </div>
                )}
              </div>
              <HashChainTable checks={verification.checks} />
              {!isAdmin && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">RBAC note:</span> tampering
                  actions require the <code className="font-mono">admin</code>{" "}
                  role — clicking Simulate Tampering will switch your demo role
                  automatically.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* AI risk panel */}
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              AI Risk Detection
            </CardTitle>
            <CardDescription>
              Rule-engine scanner results over farmer & manufacturer
              documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analyses ?? []).map((a) => (
              <div
                key={a.targetCode + a.checkedAt}
                className="rounded-xl border border-border/70 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-medium">
                      {a.targetCode}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.targetType.replace("_", " ")} · {formatDateTime(a.checkedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={a.status} />
                    <span
                      className={cn(
                        "text-sm font-bold",
                        a.status === "high"
                          ? "text-rose-400"
                          : a.status === "medium"
                            ? "text-amber-400"
                            : "text-emerald-400",
                      )}
                    >
                      {a.riskScore}/100
                    </span>
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {a.reasons.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                    >
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audit log */}
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Siren className="size-4 text-primary" />
              Audit log
            </CardTitle>
            <CardDescription>
              Every security-relevant action is append-only and timestamped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {(audits ?? []).slice(0, 10).map((log, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2">
                  <span
                    className={cn(
                      "mt-1 size-1.5 shrink-0 rounded-full",
                      log.action.includes("tamper")
                        ? "bg-rose-500"
                        : log.action.includes("restore")
                          ? "bg-emerald-500"
                          : "bg-primary/50",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{log.action.replace(/_/g, " ")}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {log.details}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[9px] text-muted-foreground/70">
                      {log.actor} · {log.entityCode} · {formatDateTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security alerts */}
      <Card className="mt-6 shadow-none border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-primary" />
            Security alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { t: "Suspicious documentation", code: "FARM-NEM-2026-001", sev: "high" },
              { t: "AI risk scan flagged garment", code: "NF-2026-000119", sev: "high" },
              { t: "Duplicate certification number", code: "DYE-NEM-2026-001", sev: "medium" },
            ].map((a) => (
              <div
                key={a.code}
                className="rounded-xl border border-border/70 p-3"
              >
                <StatusPill status={a.sev} />
                <p className="mt-2 text-xs font-medium">{a.t}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {a.code}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="size-3" />
            SHA-256 (Web Crypto API) · canonical JSON serialization · hash
            chaining · role-based access control · server-side validation ·
            audit logging. No sensitive customer data in public records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
