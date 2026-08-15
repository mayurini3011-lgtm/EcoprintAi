import { cn } from "@/lib/utils";

/**
 * Brand mark — a stylized thread tracing a leaf in eco-emerald with a cyan
 * "pixel" accent, set in a dark technical badge. Used across the landing
 * page, app shell and verification pages.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7.5"
        className="fill-card"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      <path
        d="M9.5 22.5C9.5 14.5 13.5 10.5 21.5 10.5C21.5 15 19.5 17.5 16 17.5C13.2 17.5 11.8 16.1 11.8 14.2C11.8 12.3 13 11 15 11C17.7 11 19.7 13 19.7 15.7C19.7 18.8 17.2 21 13.5 21C10.6 21 8.6 19 8 16.2"
        stroke="#34d399"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="16.2" r="1.35" fill="#22d3ee" />
      <circle cx="19.7" cy="15.7" r="1" fill="#34d399" />
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
          "font-display text-[15px] font-semibold tracking-tight",
          wordmarkClassName,
        )}
      >
        EcoPrint AI
        <span className="text-primary/70">.</span>
      </span>
    </span>
  );
}
