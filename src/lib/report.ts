/** Shared report helpers for EcoPrint AI analysis reports. */

export const REPORT_DISCLAIMER =
  "AI-generated recommendations are intended for educational and experimental purposes and should be validated through physical testing.";

export interface ReportAnalysis {
  fabric: string;
  dye: string;
  pattern: string;
  washes: number;
  initialHex: string;
  dominantColor: string;
  afterHex: string;
  retention: number;
  retentionCategory: string;
  colorDifference: number;
  tempMin: number;
  tempMax: number;
  durationMin: number;
  durationMax: number;
  mordant: string;
  recommendation: string;
  fabricRecommendation: string;
  washingRecommendation: string;
  sustainabilityScore: number;
  confidence: number;
  mode: string;
  createdAt: string;
}

/** Plain-text report used for the "Download Report" button in history. */
export function buildTextReport(a: ReportAnalysis): string {
  return [
    "EcoPrint AI — Fabric Analysis Report",
    "====================================",
    `Generated: ${new Date(a.createdAt).toLocaleString("en-IN")}`,
    "",
    `Fabric: ${a.fabric}`,
    `Natural dye: ${a.dye}`,
    `Pattern: ${a.pattern}`,
    `Wash cycles simulated: ${a.washes}`,
    "",
    `Dominant colour: ${a.dominantColor} (${a.initialHex})`,
    `Predicted colour after washing: ${a.afterHex}`,
    `Color retention: ${a.retention}% (${a.retentionCategory})`,
    `Color difference (ΔE): ${a.colorDifference}`,
    `AI confidence: ${a.confidence}%`,
    "",
    "Dyeing conditions",
    "-----------------",
    `Temperature: ${a.tempMin}–${a.tempMax}°C`,
    `Duration: ${a.durationMin}–${a.durationMax} minutes`,
    `Mordant: ${a.mordant}`,
    "",
    "Recommendations",
    "---------------",
    `Dye: ${a.recommendation}`,
    `Fabric: ${a.fabricRecommendation}`,
    `Washing: ${a.washingRecommendation}`,
    `Sustainability score: ${a.sustainabilityScore}/100`,
    "",
    `Mode: ${a.mode === "simulated" ? "Simulated demo prediction (not lab-certified)" : "Model"}`,
    "",
    REPORT_DISCLAIMER,
    "",
    "EcoPrint AI · AI-Powered Natural Dye Optimization & Fabric Color Retention Analysis",
  ].join("\n");
}

/** Download a plain-text report as a file. */
export function downloadTextReport(a: ReportAnalysis) {
  const blob = new Blob([buildTextReport(a)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url;
  el.download = `ecoprint-report-${a.dye.toLowerCase().replace(/\s+/g, "-")}-${a.fabric.toLowerCase()}.txt`;
  document.body.appendChild(el);
  el.click();
  el.remove();
  URL.revokeObjectURL(url);
}
