import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DesignCanvas } from "@/components/design/DesignCanvas";
import { SectionHeading, Reveal } from "./shared";
import {
  DYE_KNOWLEDGE,
  GARMENT_TYPES,
  DESIGN_FABRICS,
  PATTERNS,
  SLEEVE_STYLES,
  NECK_STYLES,
} from "@/convex/constants";
import { useMemo, useState } from "react";
import { Shirt, Sparkles } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function PatternSection() {
  const [garment, setGarment] = useState<string>(GARMENT_TYPES[0]);
  const [patternNumber, setPatternNumber] = useState(1);
  const [fabric, setFabric] = useState("Cotton");
  const [size, setSize] = useState("M");
  const [style, setStyle] = useState<string>(SLEEVE_STYLES[0]);
  const [neck, setNeck] = useState<string>(NECK_STYLES[0]);
  const [seedOffset, setSeedOffset] = useState(0);

  const spec = useMemo(() => {
    const pattern = PATTERNS[(patternNumber - 1) % PATTERNS.length];
    const dyeHex = DYE_KNOWLEDGE.Indigo.hex;
    return {
      seed: 4000 + patternNumber * 97 + seedOffset,
      pattern,
      palette: [
        { name: "Deep Indigo", hex: "#2b4a9b" },
        { name: "Cream", hex: "#f6f1e7" },
        { name: "Stone", hex: "#c8c2b4" },
        { name: "Sand", hex: "#e5dcc8" },
      ],
      dyeHex,
    };
  }, [patternNumber, seedOffset]);

  return (
    <section id="pattern" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Smart Pattern Design"
          title="Your Pattern. Your Style. AI Powered."
          description="Select a garment, pattern number, fabric, size and style — then watch EcoPrint AI compose the pattern preview."
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Controls */}
        <Reveal delay={0.05}>
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Garment type</Label>
                <Select value={garment} onValueChange={setGarment}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GARMENT_TYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Pattern number</Label>
                <div className="mt-1 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPatternNumber(n)}
                      className={`flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                        patternNumber === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[11px]">Fabric</Label>
                <Select value={fabric} onValueChange={setFabric}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DESIGN_FABRICS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SLEEVE_STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Neck</Label>
                <Select value={neck} onValueChange={setNeck}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NECK_STYLES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="mt-5 w-full gap-2 rounded-full"
              onClick={() => setSeedOffset((o) => o + 7)}
            >
              <Sparkles className="size-4" /> Generate Pattern
            </Button>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Pattern #{(patternNumber - 1) % PATTERNS.length + 1} · {PATTERNS[(patternNumber - 1) % PATTERNS.length]} · procedural preview
            </p>
          </div>
        </Reveal>

        {/* Preview */}
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="relative">
              <DesignCanvas spec={spec} className="w-full" />
              <Badge className="absolute left-4 top-4 bg-background/90 text-foreground backdrop-blur">
                <Shirt className="mr-1.5 size-3 text-primary" /> Pattern #{patternNumber}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                <span><span className="text-muted-foreground">Garment:</span> <strong>{garment}</strong></span>
                <span><span className="text-muted-foreground">Fabric:</span> <strong>{fabric}</strong></span>
                <span><span className="text-muted-foreground">Size:</span> <strong>{size}</strong></span>
                <span><span className="text-muted-foreground">Style:</span> <strong>{style} · {neck}</strong></span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">seed {spec.seed}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
