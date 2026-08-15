/**
 * Procedural textile-design renderer — powers demo-mode "AI Fabric Design
 * Studio" previews entirely in the browser (no image API required).
 *
 * A seeded PRNG turns { palette, pattern, seed } into a stable SVG artwork,
 * so the same inputs always produce the same design and saved designs
 * re-render deterministically. When a real image API is configured, the
 * studio shows that image instead (see DesignStudio page).
 */
import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DesignSpec {
  seed: number;
  pattern: string;
  palette: { name: string; hex: string }[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (s: string) => s.replace("#", "");
const withAlpha = (c: string, a: number) => `#${hex(c)}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

function PatternShapes({ spec }: { spec: DesignSpec }) {
  const { pattern, palette, seed } = spec;
  const rand = mulberry32(seed);
  const [a, b, c] = [
    palette[0]?.hex ?? "#8a9a78",
    palette[1]?.hex ?? palette[0]?.hex ?? "#5c7a4a",
    palette[2]?.hex ?? "#f6f1e7",
  ];

  const shapes: ReactNode[] = [];
  let key = 0;
  const push = (...s: ReactNode[]) => shapes.push(<g key={key++}>{s}</g>);

  switch (pattern) {
    case "Floral": {
      for (let i = 0; i < 26; i++) {
        const x = 20 + rand() * 360;
        const y = 20 + rand() * 460;
        const r = 8 + rand() * 16;
        const petals = 5 + Math.floor(rand() * 3);
        const petalShapes = Array.from({ length: petals }).map((_, p) => {
          const ang = (p / petals) * Math.PI * 2 + rand() * 0.4;
          const px = x + Math.cos(ang) * r * 0.7;
          const py = y + Math.sin(ang) * r * 0.7;
          return (
            <ellipse
              key={p}
              cx={px}
              cy={py}
              rx={r * 0.52}
              ry={r * 0.34}
              fill={i % 2 === 0 ? withAlpha(b, 0.85) : withAlpha(c, 0.75)}
              transform={`rotate(${(ang * 180) / Math.PI} ${px} ${py})`}
            />
          );
        });
        push(
          <>
            <circle cx={x} cy={y} r={r * 0.32} fill={withAlpha(a, 0.9)} />
            {petalShapes}
          </>,
        );
      }
      break;
    }
    case "Geometric": {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 7; j++) {
          const x = 40 + i * 80;
          const y = 36 + j * 70;
          const size = 26 + rand() * 10;
          push(
            <rect
              x={x - size / 2}
              y={y - size / 2}
              width={size}
              height={size}
              rx={3}
              fill={(i + j) % 2 === 0 ? withAlpha(b, 0.8) : withAlpha(c, 0.7)}
              transform={`rotate(${rand() * 45} ${x} ${y})`}
            />,
          );
        }
      }
      break;
    }
    case "Traditional": {
      push(
        <rect x={14} y={14} width={372} height={472} rx={8} fill="none" stroke={b} strokeWidth={6} />,
        <rect x={28} y={28} width={344} height={444} rx={6} fill="none" stroke={withAlpha(c, 0.8)} strokeWidth={2} />,
      );
      const motifX = 200;
      const motifY = 250;
      push(
        <circle cx={motifX} cy={motifY} r={70} fill={withAlpha(b, 0.7)} />,
        <circle cx={motifX} cy={motifY} r={46} fill={withAlpha(a, 0.85)} />,
        <circle cx={motifX} cy={motifY} r={22} fill={withAlpha(c, 0.9)} />,
      );
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        push(
          <circle
            cx={motifX + Math.cos(ang) * 58}
            cy={motifY + Math.sin(ang) * 58}
            r={10}
            fill={withAlpha(c, 0.7)}
          />,
        );
      }
      break;
    }
    case "Minimal": {
      for (let i = 0; i < 14; i++) {
        const x = 30 + rand() * 340;
        const y = 30 + rand() * 440;
        const r = 3 + rand() * 7;
        push(<circle cx={x} cy={y} r={r} fill={i % 2 === 0 ? withAlpha(b, 0.85) : withAlpha(c, 0.8)} />);
      }
      push(<line x1={60} y1={420} x2={340} y2={420} stroke={withAlpha(b, 0.6)} strokeWidth={2} />);
      break;
    }
    case "Abstract": {
      for (let i = 0; i < 7; i++) {
        const x = 30 + rand() * 340;
        const y = 30 + rand() * 440;
        const r = 30 + rand() * 55;
        push(
          <ellipse
            cx={x}
            cy={y}
            rx={r}
            ry={r * (0.5 + rand() * 0.5)}
            fill={i % 3 === 0 ? withAlpha(a, 0.5) : i % 3 === 1 ? withAlpha(b, 0.45) : withAlpha(c, 0.5)}
            transform={`rotate(${rand() * 180} ${x} ${y})`}
          />,
        );
      }
      break;
    }
    case "Block Print": {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
          const x = 50 + i * 90;
          const y = 50 + j * 90;
          push(
            <rect x={x - 30} y={y - 30} width={60} height={60} rx={6} fill={withAlpha((i + j) % 2 === 0 ? b : c, 0.55)} />,
            <circle cx={x} cy={y} r={12} fill={withAlpha(a, 0.8)} />,
            <circle cx={x - 16} cy={y - 16} r={4} fill={withAlpha(b, 0.9)} />,
            <circle cx={x + 16} cy={y + 16} r={4} fill={withAlpha(b, 0.9)} />,
          );
        }
      }
      break;
    }
    case "Tie Dye": {
      const centers = [
        { x: 90, y: 110, r: 60 },
        { x: 250, y: 200, r: 75 },
        { x: 150, y: 360, r: 55 },
        { x: 320, y: 420, r: 50 },
      ];
      for (const ct of centers) {
        for (let ring = 0; ring < 5; ring++) {
          push(
            <circle
              cx={ct.x}
              cy={ct.y}
              r={ct.r * (1 - ring / 6)}
              fill="none"
              stroke={ring % 2 === 0 ? withAlpha(b, 0.75) : withAlpha(c, 0.8)}
              strokeWidth={6 + rand() * 6}
            />,
          );
        }
      }
      break;
    }
    case "Ikat-inspired": {
      const bandColors = [a, b, c, b, a];
      bandColors.forEach((col, i) => {
        push(<rect x={0} y={i * 84} width={400} height={84} fill={withAlpha(col, 0.55)} />);
      });
      for (let i = 0; i < 26; i++) {
        const x = rand() * 400;
        const y = rand() * 500;
        const w = 14 + rand() * 40;
        push(
          <path
            d={`M ${x} ${y} q ${w / 2} ${-18} ${w} 0 q ${-w / 2} ${18} ${-w} 0 Z`}
            fill={i % 2 === 0 ? withAlpha(b, 0.8) : withAlpha(c, 0.75)}
          />,
        );
      }
      break;
    }
    default: {
      for (let i = 0; i < 20; i++) {
        const x = 30 + rand() * 340;
        const y = 30 + rand() * 440;
        push(<circle cx={x} cy={y} r={10 + rand() * 14} fill={withAlpha(b, 0.6)} />);
      }
    }
  }

  return <>{shapes}</>;
}

export function DesignCanvas({
  spec,
  className,
  imageUrl,
}: {
  spec: DesignSpec;
  className?: string;
  imageUrl?: string | null;
}) {
  const paletteKey = useMemo(() => spec.palette.map((p) => p.hex).join(","), [spec.palette]);
  const baseHex = spec.palette[0]?.hex ?? "#e5dcc8";
  const svg = useMemo(
    () => (
      <svg
        viewBox="0 0 400 500"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("block h-auto w-full", className)}
        role="img"
        aria-label={`${spec.pattern} textile design`}
      >
        <rect width={400} height={500} fill={baseHex} />
        <PatternShapes spec={spec} />
      </svg>
    ),
    // stable across renders for the same spec
    [spec.seed, spec.pattern, paletteKey, baseHex, className],
  );

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="AI generated textile design"
        className={cn("block h-auto w-full object-cover", className)}
      />
    );
  }
  return svg;
}

/** Serialize a rendered <svg> element to a downloadable SVG file. */
export function downloadSvgElement(svgEl: SVGSVGElement, title: string) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const markup = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([markup], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "design"}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
