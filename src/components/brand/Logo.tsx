import { cn } from "@/lib/utils";

/**
 * Brand mark — a stylized leaf/flower hybrid in indigo + sage.
 * Used across the landing page, app shell and verification pages.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" className="fill-primary/10" />
      <path
        d="M16 8c4.5 0 7 2.8 7 7s-2.5 7-7 7c-4.5 0-7-2.8-7-7s2.5-7 7-7Z"
        className="fill-primary"
      />
      <path
        d="M16 8c4.5 0 7 2.8 7 7 0 1.6-.6 3-1.6 4.2-.6-2.6-2.2-4.6-4.4-5.8-1.4 1.6-3.4 2.4-5.6 2.4h-.5c-.5-.4-.9-.9-1.2-1.5.2-3.4 2.7-6.3 6.3-6.3Z"
        fill="white"
        opacity="0.85"
      />
      <circle cx="16" cy="22.5" r="1.4" className="fill-primary" />
    </svg>
  );
}

export function Logo({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-7" />
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          wordmarkClassName,
        )}
      >
        NaturalFlow
        <span className="text-primary/70">.</span>
      </span>
    </span>
  );
}
