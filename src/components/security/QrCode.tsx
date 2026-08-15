import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function QrCode({
  value,
  size = 160,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 3,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#1c1917", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border border-dashed text-xs text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        QR unavailable
      </div>
    );
  }

  if (!src) {
    return (
      <Skeleton
        className={cn("rounded-md", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="Verification QR code"
      className={cn("rounded-md", className)}
    />
  );
}
