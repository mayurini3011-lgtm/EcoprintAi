import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { StatCard } from "@/components/security/StatCard";
import { useAuth } from "@/hooks/use-auth";
import { getAIService } from "@/lib/ai";
import type { RiskAnalysis } from "@/lib/ai";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Loader2,
  ShieldAlert,
  Sprout,
  UploadCloud,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEMO_FARMER = "FARM-001";
const MATERIALS = ["Indigo leaves", "Marigold petals", "Turmeric rhizomes", "Hibiscus petals", "Madder roots", "Pomegranate rind", "Walnut husk", "Neem leaves", "Henna leaves"];

export default function Farmer() {
  const { user } = useAuth();
  const myBatches = useQuery(api.farmer.listBatchesForFarmer, {
    farmerCode: DEMO_FARMER,
  });
  const farmers = useQuery(api.catalog.listFarmers);
  const submitBatch = useMutation(api.farmer.submitBatch);

  const [material, setMaterial] = useState("");
  const [quantityKg, setQuantityKg] = useState(120);
  const [harvestDate, setHarvestDate] = useState("2026-07-20");
  const [notes, setNotes] = useState("");
  const [docName, setDocName] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const farmer = (farmers ?? []).find((f) => f.code === DEMO_FARMER);
  const ai = useMemo(() => getAIService(), []);

  const stats = {
    total: myBatches?.length ?? 0,
    verified: myBatches?.filter((b) => b.status === "verified").length ?? 0,
    flagged: myBatches?.filter((b) => b.status === "flagged").length ?? 0,
    pending: myBatches?.filter((b) => b.status === "pending").length ?? 0,
  };

  const runScan = async (file: File) => {
    setDocName(file.name);
    setScanning(true);
    setRisk(null);
    try {
      const result = await ai.analyzeRisk({
        material,
        quantityKg,
        harvestDate,
        farmerCode: DEMO_FARMER,
        documentName: file.name,
        resaveCount: file.name.includes("copy") ? 4 : 1,
        declaredQuantityKg: quantityKg,
        certNumber: file.name.toLowerCase().includes("cert") ? "EC-8841" : "",
      });
      setRisk(result);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!material || quantityKg <= 0 || !harvestDate) {
      toast.error("Please fill in material, quantity and harvest date.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitBatch({
        farmerCode: DEMO_FARMER,
        material,
        quantityKg,
        harvestDate: new Date(harvestDate).toISOString(),
        notes: notes || undefined,
        documentRiskScore: risk?.score,
      });
      toast.success(`Batch ${result.code} submitted (${result.status}).`);
      setMaterial("");
      setNotes("");
      setDocName(null);
      setRisk(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Farmer Portal
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {farmer?.farmName ?? "Your farm"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo session signed in as {farmer?.name} · {farmer?.location}. Register
          harvested plant material and track verification.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Sprout} label="Batches" value={stats.total} tone="default" />
        <StatCard icon={CheckCircle2} label="Verified" value={stats.verified} tone="success" />
        <StatCard icon={AlertTriangle} label="Pending" value={stats.pending} tone="warning" />
        <StatCard icon={ShieldAlert} label="Flagged" value={stats.flagged} tone="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Submit a new batch</CardTitle>
            <CardDescription>
              Record your harvest. EcoPrint AI scans your supporting document
              for fraud signals before submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Quantity (kg)</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  className="mt-1 h-9 text-sm"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs">Harvest date</Label>
                <Input
                  type="date"
                  className="mt-1 h-9 text-sm"
                  value={harvestDate}
                  max="2026-12-31"
                  onChange={(e) => setHarvestDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                className="mt-1 min-h-16 text-xs"
                placeholder="Soil, water source, picking notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Supporting document (optional)</Label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <UploadCloud className="size-4" />
                {docName ?? "Upload harvest certificate or photo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void runScan(file);
                }}
              />
            </div>

            {scanning && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                EcoPrint AI risk scanner analysing document…
              </div>
            )}

            {risk && (
              <div
              className={cn(
                "rounded-lg border p-3 text-xs",
                risk.status === "high"
                  ? "border-rose-400/30 bg-rose-500/10 text-rose-700"
                  : risk.status === "medium"
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-700"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-700",
              )}
              >
                <p className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="size-3.5" />
                  Risk Score: {risk.score}/100 · {risk.status.toUpperCase()} RISK
                </p>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5">
                  {risk.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileUp className="mr-2 size-4" />
              )}
              Submit batch
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-semibold">My submitted batches</h2>
          <div className="space-y-3">
            {(myBatches ?? []).map((batch) => (
              <Card key={batch.code} className="shadow-none border-border/70">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
                        <Sprout className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{batch.material}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {batch.code}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={batch.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{batch.quantityKg} kg</span>
                    <span>Harvested {formatDate(batch.harvestDate)}</span>
                    <span>Submitted {formatDate(batch.submittedAt)}</span>
                    {batch.verifiedAt && (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="size-3" /> Verified{" "}
                        {formatDate(batch.verifiedAt)}
                      </span>
                    )}
                  </div>
                  {batch.notes && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {batch.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(myBatches ?? []).length === 0 && (
              <Card className="shadow-none border-border/70">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {user?.name ?? "Demo"} · No batches yet — submit your first
                  harvest.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
