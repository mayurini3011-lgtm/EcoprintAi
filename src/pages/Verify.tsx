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
import { SupplyChainTimeline } from "@/components/garment/SupplyChainTimeline";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { QrCode } from "@/components/security/QrCode";
import { useEnsureDemoData } from "@/hooks/use-demo-data";
import { useQuery } from "convex/react";
import {
  CheckCircle2,
  Fingerprint,
  Loader2,
  Lock,
  QrCode as QrIcon,
  SearchX,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export default function Verify() {
  const { garmentId = "" } = useParams();
  const demoStatus = useEnsureDemoData();

  const [showChain, setShowChain] = useState(false);

  const garment = useQuery(api.security.getGarmentPublic, { garmentId });
  const verification = useQuery(api.security.verifyGarmentChain, { garmentId });

  // Wait for the demo dataset to be seeded before judging existence.
  if (
    garment === undefined ||
    (demoStatus && !demoStatus.seeded) ||
    (garment === null && !demoStatus)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!garment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-7" />
        </span>
        <h1 className="text-lg font-semibold">Record not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          No garment exists with ID{" "}
          <code className="font-mono text-xs">{garmentId}</code>. Check the QR
          code or try another garment.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to EcoPrint AI</Link>
        </Button>
      </div>
    );
  }

  const valid = verification?.valid;

  return (
    <div className="min-h-screen bg-muted/30 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <Badge variant="outline" className="gap-1.5">
            <Lock className="size-3" />
            Public traceability record
          </Badge>
        </div>

        <Card className="shadow-sm border-border/70">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <LogoMark className="size-10" />
            </div>
            <CardTitle className="text-xl">Authenticity Verification</CardTitle>
            <CardDescription>
              Non-sensitive provenance for garment{" "}
              <code className="font-mono text-xs">{garment.garmentId}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status banner */}
            <div
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-5 text-center",
                valid === false
                  ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                  : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
              )}
            >
              <p className="flex items-center gap-2 text-base font-bold">
                {valid === false ? (
                  <>
                    🔴 TAMPERING DETECTED
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-5" /> 🟢 AUTHENTIC / VERIFIED
                  </>
                )}
              </p>
              {valid === false ? (
                <p className="text-xs text-rose-700/90">
                  The integrity chain is broken — a supply-chain record was
                  modified after it was sealed. Do not trust this garment's
                  provenance.
                </p>
              ) : (
                <p className="text-xs text-emerald-700/90">
                  This garment's provenance is cryptographically verified and
                  tamper-evident.
                </p>
              )}
            </div>

            {/* Garment summary */}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
              <VerifyRow label="Design" value={garment.designTitle} />
              <VerifyRow label="Fabric" value={garment.fabricName} />
              <VerifyRow label="Dye" value={garment.dyeName} />
              <VerifyRow label="Farmer" value={garment.farmerName} />
              <VerifyRow label="Manufacturer" value={garment.manufacturerName} />
              <VerifyRow label="Tailor" value={garment.tailorName} />
              <VerifyRow label="Botanical" value={garment.plantName ?? "—"} />
              <VerifyRow label="Created" value={formatDate(garment.createdAt)} />
              <VerifyRow
                label="Chain hash"
                value={<code className="font-mono text-[9px]">{garment.chainHash.slice(0, 12)}…</code>}
              />
            </dl>

            <div className="mt-5 flex items-center justify-center">
              <Button onClick={() => setShowChain((v) => !v)}>
                <Fingerprint className="mr-2 size-4" />
                {showChain ? "Hide supply chain" : "Verify Supply Chain Integrity"}
              </Button>
            </div>

            {showChain && (
              <div className="mt-5 space-y-4">
                {verification === undefined ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Running SHA-256
                    verification…
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "rounded-lg border p-3 text-xs font-semibold",
                        valid
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-400/30 bg-rose-500/10 text-rose-300",
                      )}
                    >
                      {valid
                        ? "🟢 All records match their stored hashes — chain intact."
                        : `🔴 ${verification.failures.length} record(s) failed verification.`}
                    </div>
                    <HashChainTable checks={verification.checks} />
                  </>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-border/60 pt-4">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Supply-chain journey
              </p>
              <SupplyChainTimeline
                events={garment.events}
                showHashes
                checks={verification?.checks ?? null}
              />
            </div>

            <p className="mt-5 flex items-start gap-1.5 rounded-lg bg-muted/50 p-3 text-[11px] leading-4 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
              Privacy: this public record contains supply-chain provenance only.
              Customer identity, measurements and pricing are never exposed on
              verification pages.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-none border-border/70">
          <CardContent className="flex items-center justify-center gap-4 p-5">
            <QrCode
              value={`${window.location.origin}/verify/${garment.garmentId}`}
              size={92}
            />
            <div className="text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <QrIcon className="size-3.5" /> Scan to re-verify
              </p>
              <p className="mt-1 max-w-56">
                Point any phone camera at this QR to open this exact
                verification record from anywhere.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VerifyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-1.5">
      <dt className="text-[9px] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
