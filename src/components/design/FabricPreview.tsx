import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { cn } from "@/lib/utils";

const FABRIC_TEXTURE =
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=70";

/**
 * Live "dyed fabric" preview. A real textile photo is tinted with the
 * selected colour using multiply blending, so the weave and folds stay
 * visible — it reads as real dyed fabric, not a flat swatch.
 */
export function FabricPreview({
  hex,
  label,
  className,
  aspect = "aspect-[4/3]",
}: {
  hex: string;
  label?: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", aspect, className)}>
      <BotanicalImage
        src={FABRIC_TEXTURE}
        alt={label ? `${label} dyed fabric texture` : "Dyed fabric texture"}
        emoji="🧵"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Colour wash — multiply keeps the fabric texture visible underneath. */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: hex, opacity: 0.72 }}
      />
      {/* Soft sheen so it never reads as a flat solid colour. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.28), transparent 55%), radial-gradient(120% 120% at 80% 100%, rgba(0,0,0,0.22), transparent 60%)",
        }}
      />
      {label && (
        <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
          <span className="size-3.5 rounded-full ring-1 ring-border" style={{ background: hex }} />
          {label}
        </span>
      )}
    </div>
  );
}
