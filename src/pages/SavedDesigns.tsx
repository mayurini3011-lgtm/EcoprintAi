import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DesignCanvas, downloadSvgElement } from "@/components/design/DesignCanvas";
import { useMutation, useQuery } from "convex/react";
import { Download, Loader2, Palette, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function SavedDesigns() {
  const designs = useQuery(api.designsData.listSavedDesigns);
  const deleteDesign = useMutation(api.designsData.deleteSavedDesign);
  const navigate = useNavigate();
  const wraps = useRef(new Map<string, HTMLDivElement>());

  const rows = designs ?? [];

  const handleDownload = (id: string, title: string) => {
    const el = wraps.current.get(id)?.querySelector("svg") as SVGSVGElement | null;
    if (el) {
      downloadSvgElement(el, title || "design");
    } else {
      toast.error("Could not serialize this design.");
    }
  };

  const handleDelete = async (id: Id<"savedDesigns">) => {
    try {
      await deleteDesign({ id });
      toast.success("Design deleted.");
    } catch {
      toast.error("Could not delete the design.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            EcoPrint AI · Saved Designs
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your design library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Designs saved from the AI Fabric Design Studio — re-rendered
            deterministically from their palette and seed.
          </p>
        </div>
        <Button onClick={() => navigate("/design-studio")} className="gap-2">
          <Wand2 className="size-4" /> New design
        </Button>
      </div>

      {designs === undefined ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading designs…
        </div>
      ) : rows.length === 0 ? (
        <Empty className="border border-dashed border-border/70 bg-card">
          <EmptyMedia variant="icon">
            <Palette className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No saved designs</EmptyTitle>
            <EmptyDescription>
              Generate a design in the AI Fabric Design Studio and save it here
              to build your library.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/design-studio")}>
              <Sparkles className="mr-2 size-4" /> Open Design Studio
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => (
            <Card key={d._id} className="overflow-hidden shadow-none border-border/70">
              <div ref={(el) => {
                if (el) wraps.current.set(String(d._id), el);
                else wraps.current.delete(String(d._id));
              }}>
                <DesignCanvas
                  spec={{ seed: d.seed, pattern: d.pattern, palette: d.palette }}
                  className="w-full"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{d.title}</CardTitle>
                <CardDescription className="text-[11px]">
                  {d.dye} on {d.fabric} · {d.pattern} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5">
                  {d.palette.map((c) => (
                    <span key={c.hex} title={c.name} className="size-4 rounded-full ring-1 ring-border" style={{ background: c.hex }} />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => handleDownload(String(d._id), d.title)}
                  >
                    <Download className="size-3.5" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => {
                      navigate(`/design-studio?dye=${encodeURIComponent(d.dye)}&fabric=${encodeURIComponent(d.fabric)}&pattern=${encodeURIComponent(d.pattern)}`);
                      toast("Opened the studio with this design's inputs.");
                    }}
                  >
                    <Wand2 className="size-3.5" /> Use This Design
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto size-8 text-destructive hover:text-destructive"
                    onClick={() => void handleDelete(d._id)}
                    aria-label="Delete design"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
