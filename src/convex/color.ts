/**
 * Color science utilities for the fabric analysis pipeline.
 *
 * All formulas are standard, reference implementations:
 *  - sRGB -> XYZ -> CIELAB (D65 white point)
 *  - CIEDE2000 colour difference (Sharma, Wu & Dalal 2005)
 *  - LAB -> sRGB for rendering simulated "after wash" colours
 *
 * The inputs are simulated/measured colours; the math itself is real.
 */

export interface Rgb {
  r: number; // 0-255
  g: number;
  b: number;
}

export interface Lab {
  L: number; // 0-100
  a: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 128, g: 128, b: 128 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** sRGB -> CIELAB (D65). */
export function rgbToLab({ r, g, b }: Rgb): Lab {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  // D65 reference white
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;

  // sRGB -> XYZ (D65)
  let x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  let y = 0.2126729 * rl + 0.7151522 * gl + 0.072175 * bl;
  let z = 0.0193339 * rl + 0.119192 * gl + 0.9503041 * bl;

  x /= xn;
  y /= yn;
  z /= zn;

  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

/** CIEDE2000 colour difference between two LAB colours. */
export function deltaE2000(a: Lab, b: Lab): number {
  const kL = 1;
  const kC = 1;
  const kH = 1;

  const C1 = Math.sqrt(a.a * a.a + a.b * a.b);
  const C2 = Math.sqrt(b.a * b.a + b.b * b.b);
  const Cbar = (C1 + C2) / 2;
  const G =
    0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a.a;
  const a2p = (1 + G) * b.a;
  const C1p = Math.sqrt(a1p * a1p + a.b * a.b);
  const C2p = Math.sqrt(a2p * a2p + b.b * b.b);

  const h1p =
    a.b === 0 && a1p === 0 ? 0 : rad2deg(Math.atan2(a.b, a1p)) + (Math.atan2(a.b, a1p) < 0 ? 360 : 0);
  const h2p =
    b.b === 0 && a2p === 0 ? 0 : rad2deg(Math.atan2(b.b, a2p)) + (Math.atan2(b.b, a2p) < 0 ? 360 : 0);

  const dLp = b.L - a.L;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp) / 2);

  const Lbarp = (a.L + b.L) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
    else hbarp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(deg2rad(hbarp - 30)) +
    0.24 * Math.cos(deg2rad(2 * hbarp)) +
    0.32 * Math.cos(deg2rad(3 * hbarp + 6)) -
    0.2 * Math.cos(deg2rad(4 * hbarp - 63));

  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));
  const Rc =
    2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin(deg2rad(2 * dTheta)) * Rc;

  return Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
      Math.pow(dCp / (kC * Sc), 2) +
      Math.pow(dHp / (kH * Sh), 2) +
      Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)),
  );
}

/** CIELAB -> sRGB (D65), clamped. */
export function labToRgb(lab: Lab): Rgb {
  const fy = (lab.L + 16) / 116;
  const fx = fy + lab.a / 500;
  const fz = fy - lab.b / 200;

  const fInv = (t: number) => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };

  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;

  const x = xn * fInv(fx);
  const y = yn * fInv(fy);
  const z = zn * fInv(fz);

  // XYZ -> linear sRGB
  let rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  let gl = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  let bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  rl = clamp01(rl);
  gl = clamp01(gl);
  bl = clamp01(bl);

  return {
    r: Math.round(linearToSrgb(rl) * 255),
    g: Math.round(linearToSrgb(gl) * 255),
    b: Math.round(linearToSrgb(bl) * 255),
  };
}

export function labToHex(lab: Lab): string {
  return rgbToHex(labToRgb(lab));
}

export function rgbToHexString(rgb: Rgb): string {
  return rgbToHex(rgb);
}

/**
 * Predict the "after washing" colour: fade the original LAB colour toward
 * the fabric/paper reference (L=100, a=0, b=0) proportionally to the
 * simulated retention loss. Real math on simulated data.
 */
export function fadeTowardPaper(original: Lab, retention: number): Lab {
  const fade = (100 - retention) / 100;
  return {
    L: original.L + (100 - original.L) * fade,
    a: original.a * (1 - fade),
    b: original.b * (1 - fade),
  };
}
