import type { PaletteColor } from "@/lib/ai";

interface GarmentPreviewProps {
  palette: PaletteColor[];
  garmentType: string;
  motif?: string;
  className?: string;
}

/**
 * Stylized SVG garment previews. These stand in for AI-generated imagery in
 * the mock; each silhouette is colored from the botanical palette with a
 * scattered motif, so every design card looks bespoke.
 */
export function GarmentPreview({
  palette,
  garmentType,
  motif,
  className,
}: GarmentPreviewProps) {
  const primary = palette[0]?.hex ?? "#a6263b";
  const accent1 = palette[1]?.hex ?? "#e8c8c5";
  const accent2 = palette[2]?.hex ?? "#5c7a4a";
  const ground = palette[3]?.hex ?? "#f6f1e7";

  // Deterministic scatter from the motif name.
  const seed = (motif ?? garmentType).length * 7919 + garmentType.length * 131;
  const rand = mulberry32(seed);
  const dots = Array.from({ length: 9 }, (_, i) => ({
    x: 40 + rand() * 120,
    y: 70 + rand() * 120,
    r: 2.5 + rand() * 3,
    fill: i % 3 === 0 ? accent1 : accent2,
  }));

  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      role="img"
      aria-label={`${garmentType} preview`}
    >
      <rect x="0" y="0" width="200" height="260" rx="14" fill={ground} />

      {garmentType === "Kurta" && (
        <g>
          <path
            d="M66 62 Q100 52 134 62 L148 96 L146 190 Q100 206 54 190 L52 96 Z"
            fill={primary}
          />
          <path d="M66 62 L52 96 L30 92 Q22 74 38 66 Z" fill={shade(primary, -12)} />
          <path d="M134 62 L148 96 L170 92 Q178 74 162 66 Z" fill={shade(primary, -12)} />
          <path d="M92 58 L108 58 L108 70 L92 70 Z" fill={accent1} />
          <rect x="52" y="196" width="96" height="10" rx="3" fill={accent2} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={0.75} />
          ))}
        </g>
      )}

      {garmentType === "Dress" && (
        <g>
          <path
            d="M76 64 Q100 56 124 64 L126 96 Q160 130 164 180 L160 206 L40 206 L36 180 Q40 130 74 96 Z"
            fill={primary}
          />
          <path d="M76 64 Q88 96 86 128 Q72 150 62 170 L40 206 L36 180 Q40 130 74 96 Z" fill={shade(primary, -10)} />
          <path d="M76 64 Q100 56 124 64 L120 82 Q100 76 80 82 Z" fill={accent1} />
          <rect x="36" y="186" width="128" height="12" rx="4" fill={accent2} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={0.7} />
          ))}
        </g>
      )}

      {garmentType === "Shirt" && (
        <g>
          <path
            d="M70 62 Q100 54 130 62 L146 90 L144 196 Q100 208 56 196 L54 90 Z"
            fill={primary}
          />
          <path d="M70 62 L54 90 L32 84 Q26 68 40 60 Z" fill={shade(primary, -14)} />
          <path d="M130 62 L146 90 L168 84 Q174 68 160 60 Z" fill={shade(primary, -14)} />
          <path d="M88 60 L112 60 L108 78 L92 78 Z" fill={accent1} />
          <rect x="54" y="72" width="92" height="6" rx="2" fill={accent2} opacity={0.85} />
          <rect x="122" y="96" width="18" height="22" rx="3" fill={accent1} opacity={0.9} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={0.6} />
          ))}
        </g>
      )}

      {garmentType === "Saree Border" && (
        <g>
          <path
            d="M36 60 Q110 50 168 68 L172 208 Q110 194 36 204 Z"
            fill={primary}
            opacity={0.92}
          />
          <path d="M36 60 Q110 50 168 68 L164 84 Q110 68 44 78 Z" fill={accent1} />
          <path d="M40 188 Q110 176 170 194 L170 208 Q110 194 36 204 Z" fill={accent2} />
          <path d="M40 196 Q110 184 170 202 L170 208 Q110 194 36 204 Z" fill="#c9a45c" opacity={0.9} />
          <path d="M168 68 L172 208 L164 210 L160 70 Z" fill="#c9a45c" opacity={0.9} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x + 10} cy={d.y + 20} r={d.r} fill={d.fill} opacity={0.7} />
          ))}
        </g>
      )}

      {garmentType === "Scarf" && (
        <g>
          <rect x="46" y="58" width="108" height="140" rx="10" fill={primary} />
          <rect x="46" y="58" width="108" height="26" rx="10" fill={shade(primary, -10)} />
          <rect x="46" y="166" width="108" height="32" rx="6" fill={accent2} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={54 + i * 21} y={198} width="5" height="16" rx="2" fill={accent2} opacity={0.85} />
          ))}
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y + 18} r={d.r} fill={d.fill} opacity={0.7} />
          ))}
        </g>
      )}

      {garmentType === "Lehenga" && (
        <g>
          <path d="M88 58 Q100 54 112 58 L116 92 L102 100 L98 92 Z" fill={primary} />
          <path d="M58 96 Q100 84 142 96 L158 150 Q100 170 42 150 Z" fill={shade(primary, -8)} />
          <path
            d="M42 150 Q100 172 158 150 L166 214 Q100 240 34 214 Z"
            fill={primary}
          />
          <path d="M42 150 Q100 172 158 150 L158 160 Q100 182 42 160 Z" fill={accent1} />
          <path d="M34 214 Q100 240 166 214 L164 226 Q100 250 36 226 Z" fill={accent2} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y + 40} r={d.r} fill={d.fill} opacity={0.7} />
          ))}
        </g>
      )}

      {!["Kurta", "Dress", "Shirt", "Saree Border", "Scarf", "Lehenga"].includes(
        garmentType,
      ) && (
        <g>
          <rect x="46" y="60" width="108" height="150" rx="12" fill={primary} />
          <rect x="46" y="60" width="108" height="150" rx="12" fill="none" stroke={accent2} strokeWidth="6" />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={0.8} />
          ))}
        </g>
      )}
    </svg>
  );
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

/** Lighten/darken a hex colour by `percent` (-100..100). */
function shade(hex: string, percent: number): string {
  const m = hex.replace("#", "");
  const num = parseInt(m, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
