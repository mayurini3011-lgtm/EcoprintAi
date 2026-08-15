import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lazy remote image with a themed fallback tile. If the Unsplash CDN image
 * fails to load (offline demo, blocked network, removed photo), the tile
 * keeps the layout intact instead of showing a broken image.
 */
export function BotanicalImage({
  src,
  alt,
  className,
  emoji = "🌿",
}: {
  src: string;
  alt: string;
  className?: string;
  emoji?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-amber-300/30",
          className,
        )}
      >
        <span className="text-4xl opacity-70 drop-shadow-sm">{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
