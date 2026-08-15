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
import { useMutation, useQuery } from "convex/react";
import {
  ArrowDown,
  Beaker,
  CheckCircle2,
  Factory,
  FlaskConical,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { formatDate, formatINR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEMO_MFG = "MFG-001";

const PRESET_COLORS = [
  { name: "Deep Indigo", hex: "#2b4a9b" },
  { name: "Crimson", hex: "#a6263b" },
  { name: "Saffron Gold", hex: "#e8a33d" },
  { name: "Rose Red", hex: "#8f2f3c" },
  { name: "Olive Green", hex: "#5c7a4a" },
  { name: "Chestnut", hex: "#5a4632" },
  { name: "Warm Ochre", hex: "#b5833c" },
  { name: "Rust", hex: "#9a4a2f" },
];

export default function Manufacturer() {
  const receivable = useQuery(api.manufacturer.receivableRawBatches);
  const myDyes = useQuery(api.manufacturer.listDyesForManufacturer, {
    manufacturerCode: DEMO_MFG,
  });
  const manufacturers = useQuery(api.catalog.listManufacturers);
  const createDyeBatch = useMutation(api.manufacturer.createDyeBatch);
  const markReady = useMutation(api.manufacturer.markBatchReady);

  const [rawBatchCode, setRawBatchCode] = useState("");
  const [name, setName] = useState("");
  const [botanicalSource, setBotanicalSource] = useState("");
  const [colorName, setColorName] = useState("Deep Indigo");
  const [colorHex, setColorHex] = useState("#2b4a9b");
  const [mordant, setMordant] = useState("Alum");
  const [sustainabilityInfo, setSustainabilityInfo] = useState(
    "Low-water extraction; dye waste composted on site.",
  );
  const [availability, setAvailability] = useState<"available" | "limited" | "out">(
    "available",
  );
  const [pricePerKg, setPricePerKg] = useState(1200);
  const [submitting, setSubmitting] = useState(false);

  const mfg = (manufacturers ?? []).find((m) => m.code === DEMO_MFG);
  const selectedRaw = (receivable ?? []).find((b) => b.code === rawBatchCode);

  const stats = {
    produced: myDyes?.length ?? 0,
    verified: myDyes?.filter((d) => d.status === "verified").length ?? 0,
    receivable: receivable?.length ?? 0,
  };

  const handleCreate = async () => {
    if (!rawBatchCode || !name.trim() || !botanicalSource.trim()) {
      toast.error("Select a raw batch and fill in dye name + botanical source.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createDyeBatch({
        manufacturerCode: DEMO_MFG,
        name: name.trim(),
        botanicalSource: botanicalSource.trim(),
        colorName,
        colorHex,
        rawBatchCode,
        mordant,
        sustainabilityInfo,
        availability,
        pricePerKg,
      });
      toast.success(`Dye batch ${result.code} created and linked.`);
      setName("");
      setBotanicalSource("");
      setRawBatchCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Manufacturer Portal
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {mfg?.name ?? "Dye Manufacturer"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo session signed in as {mfg?.name} · {mfg?.location}. Receive raw
          material and create traceable dye batches.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard icon={FlaskConical} label="Dye batches" value={stats.produced} tone="default" />
        <StatCard icon={CheckCircle2} label="Verified" value={stats.verified} tone="success" />
        <StatCard icon={Factory} label="Receivable" value={stats.receivable} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Process raw material</CardTitle>
            <CardDescription>
              Convert a farmer batch into a verified dye batch. The lineage is
              preserved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Raw material batch</Label>
              <Select value={rawBatchCode} onValueChange={setRawBatchCode}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue placeholder="Select raw batch" />
                </SelectTrigger>
                <SelectContent>
                  {(receivable ?? []).map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.code} · {b.material} ({b.quantityKg} kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRaw && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  From {selectedRaw.farmerName} · harvested{" "}
                  {formatDate(selectedRaw.harvestDate)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Dye name</Label>
                <Input
                  className="mt-1 h-9 text-xs"
                  placeholder="e.g. Indigo Vat No.3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Botanical source</Label>
                <Input
                  className="mt-1 h-9 text-xs"
                  placeholder="e.g. Indigofera tinctoria"
                  value={botanicalSource}
                  onChange={(e) => setBotanicalSource(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Colour</Label>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      setColorHex(c.hex);
                      setColorName(c.name);
                    }}
                    className={cn(
                      "size-7 rounded-full border border-black/10 transition-transform hover:scale-110",
                      colorHex === c.hex &&
                        "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <span className="ml-1 text-[11px] text-muted-foreground">
                  {colorName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Mordant</Label>
                <Select value={mordant} onValueChange={setMordant}>
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Alum", "Iron", "Lime + iron", "Copper sulphate", "None", "Iron + vinegar"].map(
                      (m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Availability</Label>
                <Select
                  value={availability}
                  onValueChange={(v) =>
                    setAvailability(v as "available" | "limited" | "out")
                  }
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="out">Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Price (₹/kg)</Label>
                <Input
                  type="number"
                  className="mt-1 h-9 text-sm"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs">Sustainability note</Label>
                <Textarea
                  className="mt-1 min-h-9 text-xs"
                  value={sustainabilityInfo}
                  onChange={(e) => setSustainabilityInfo(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Beaker className="mr-2 size-4" />
              )}
              Create dye batch
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-semibold">My dye batches</h2>
          <div className="space-y-3">
            {(myDyes ?? []).map((dye) => (
              <Card key={dye.code} className="shadow-none border-border/70">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-9 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: dye.colorHex }}
                      />
                      <div>
                        <p className="text-sm font-semibold">{dye.name}</p>
                        <p className="text-[11px] text-muted-foreground italic">
                          {dye.botanicalSource}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={dye.status} />
                      <StatusPill status={dye.availability} />
                    </div>
                  </div>

                  {/* Lineage */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {dye.rawBatchCode}
                    </span>
                    <span className="text-muted-foreground">(raw material)</span>
                    <ArrowDown className="size-3 text-muted-foreground" />
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold">
                      <span className="size-1.5 rounded-full bg-sky-500" />
                      {dye.code}
                    </span>
                    <span className="text-muted-foreground">(dye batch)</span>
                    <span className="ml-auto hidden text-muted-foreground sm:inline">
                      Farmer: {dye.farmerName}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>
                      {formatINR(dye.pricePerKg)}/kg · {dye.mordant} mordant
                    </span>
                    {dye.verifiedAt && (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="size-3" /> Verified{" "}
                        {formatDate(dye.verifiedAt)}
                      </span>
                    )}
                    {dye.status !== "verified" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-7 text-[11px]"
                        onClick={async () => {
                          await markReady({ dyeCode: dye.code });
                          toast.success(`${dye.code} marked ready.`);
                        }}
                      >
                        Mark ready
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {(myDyes ?? []).length === 0 && (
              <Card className="shadow-none border-border/70">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No dye batches yet — process your first raw batch.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
