/**
 * EcoPrint AI Assistant backend.
 *
 * POST /api/chat equivalent (Convex action, also exposed over HTTP in
 * http.ts). Receives the user's message plus optional analysis context and
 * returns a reply.
 *
 * Modes, in priority order:
 *  1. LIVE (user provider) — when AI_API_KEY (and optionally
 *     AI_API_BASE_URL / AI_MODEL) are configured, calls an OpenAI-compatible
 *     chat-completions endpoint.
 *  2. LIVE (platform gateway) — when VLY_INTEGRATION_KEY is present
 *     (auto-injected on Freebuff), routes through the platform AI gateway
 *     with zero extra configuration.
 *  3. DEMO  — otherwise a deterministic, rule-based responder that can
 *     explain the user's latest EcoPrint analysis (context-aware).
 *
 * All keys are read from process.env only — never shipped to the browser.
 * The reply always carries `mode` so the UI can show "Demo Mode" honestly.
 */
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { vly } from "../lib/vly-integrations";
import { DYE_KNOWLEDGE } from "./constants";

const SYSTEM_PROMPT =
  "You are EcoPrint AI Assistant, a friendly expert on natural dyes, fabric care, colour retention and sustainable textiles. Be concise, practical and honest about uncertainty. If the user shares analysis context, explain it simply.";

export const chat = action({
  args: {
    message: v.string(),
    analysisContext: v.optional(
      v.object({
        fabric: v.optional(v.string()),
        dye: v.optional(v.string()),
        pattern: v.optional(v.string()),
        washes: v.optional(v.number()),
        retention: v.optional(v.number()),
        retentionCategory: v.optional(v.string()),
        colorDifference: v.optional(v.number()),
        mordant: v.optional(v.string()),
        sustainabilityScore: v.optional(v.number()),
      }),
    ),
  },
  handler: async (_ctx, { message, analysisContext }): Promise<{ reply: string; mode: "live" | "demo" }> => {
    const userPrompt = analysisContext
      ? `[My latest fabric analysis: ${JSON.stringify(analysisContext)}]\n\n${message}`
      : message;

    // 1) Live: user's own OpenAI-compatible provider (AI_API_KEY).
    const apiKey = process.env.AI_API_KEY;
    if (apiKey) {
      try {
        const base = process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1";
        const model = process.env.AI_MODEL ?? "gpt-4o-mini";
        const res = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.5,
            max_tokens: 400,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) return { reply, mode: "live" };
        }
        // fall through to the platform gateway / demo on failure or empty reply
      } catch {
        // fall through
      }
    }

    // 2) Live: platform AI gateway (VLY_INTEGRATION_KEY is auto-injected).
    const vlyReply = await liveVlyReply(userPrompt);
    if (vlyReply) return { reply: vlyReply, mode: "live" };

    // 3) Demo: deterministic, context-aware responder.
    return { reply: demoReply(message, analysisContext), mode: "demo" };
  },
});

/** Route a prompt through the platform AI gateway, or return null to fall back. */
async function liveVlyReply(prompt: string): Promise<string | null> {
  if (!process.env.VLY_INTEGRATION_KEY) return null;
  try {
    const res = await vly.ai.completion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 400,
    });
    const reply = res.success
      ? res.data?.choices?.[0]?.message?.content?.trim()
      : undefined;
    return reply || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Demo responder (rule-based, context-aware)
// ---------------------------------------------------------------------------

function demoReply(
  raw: string,
  ctx?: {
    fabric?: string;
    dye?: string;
    pattern?: string;
    washes?: number;
    retention?: number;
    retentionCategory?: string;
    colorDifference?: number;
    mordant?: string;
    sustainabilityScore?: number;
  },
): string {
  const msg = raw.toLowerCase().trim();

  // --- Context-aware: explain the user's own result -----------------------
  if (ctx && /\b(explain|why|result|retention)\b/.test(msg) && /(my|this|result|retention|analysis)/.test(msg)) {
    const retention = ctx.retention ?? 0;
    const parts: string[] = [];
    parts.push(
      `Your predicted retention is ${retention}% (${ctx.retentionCategory ?? "—"}), measured over ${ctx.washes ?? 1} wash cycle(s) with a colour difference of ${ctx.colorDifference ?? "—"} ΔE.`,
    );
    if (retention < 60) {
      parts.push(
        "That's on the lower side — the usual culprits are a water-soluble dye, a fibre that takes the dye up less readily, or a high number of wash cycles.",
      );
    } else if (retention < 80) {
      parts.push("That's a solid result, though there's room to improve fastness.");
    } else {
      parts.push("That's an excellent result — the dye-fabric pairing is working well.");
    }
    if (ctx.dye && ctx.mordant) {
      parts.push(
        `For ${ctx.dye}, the recommended mordant is ${ctx.mordant} — it helps the colour bind to the fibre.`,
      );
    }
    if (ctx.sustainabilityScore !== undefined) {
      parts.push(`The sustainability score for this combination is ${ctx.sustainabilityScore}/100.`);
    }
    return parts.join(" ");
  }

  // --- Specific dye questions ---------------------------------------------
  const dyeHit = Object.keys(DYE_KNOWLEDGE).find((d) =>
    msg.includes(d.toLowerCase()),
  );
  if (dyeHit) {
    const k = DYE_KNOWLEDGE[dyeHit];
    // "which dye is best for cotton" style
    const fabricHit = ["cotton", "silk", "linen", "wool", "jute", "denim", "khadi"].find(
      (f) => msg.includes(f),
    );
    if (fabricHit && /\b(best|good|work|suitable|use)\b/.test(msg)) {
      const display = fabricHit === "cotton" ? "Cotton" : fabricHit.charAt(0).toUpperCase() + fabricHit.slice(1);
      return `${dyeHit} works well on ${display} — dye at ${k.tempMin}–${k.tempMax}°C for ${k.durationMin}–${k.durationMax} minutes with ${k.mordant}. Baseline retention is ~${k.retentionBase}%. ${k.note}`;
    }
    return `${dyeHit} (${k.source}) gives a ${k.hex}-toned colour. Dye at ${k.tempMin}–${k.tempMax}°C for ${k.durationMin}–${k.durationMax} minutes with ${k.mordant}. It works best on ${k.suitableFabrics.join(" / ")}. ${k.sustainability}`;
  }

  // --- Which dye suits a fabric -------------------------------------------
  const fabricHit = ["cotton", "silk", "linen", "wool", "jute", "denim", "khadi"].find(
    (f) => msg.includes(f),
  );
  if (fabricHit && /\b(dye|best|good|recommend|use)\b/.test(msg)) {
    const display = fabricHit === "cotton" ? "Cotton" : fabricHit.charAt(0).toUpperCase() + fabricHit.slice(1);
    const best = Object.values(DYE_KNOWLEDGE)
      .filter((k) => k.suitableFabrics.some((f) => f.toLowerCase().includes(fabricHit)))
      .sort((a, b) => b.retentionBase - a.retentionBase);
    if (best.length > 0) {
      const top = best.slice(0, 3);
      return `Best natural dyes for ${display}: ${top
        .map((k) => `${Object.keys(DYE_KNOWLEDGE).find((n) => DYE_KNOWLEDGE[n] === k)} (~${k.retentionBase}% baseline retention, ${k.mordant})`)
        .join("; ")}. Wash cold, dry in shade, and expect the best fastness from the highest-retention option.`;
    }
    return `For ${display}, look for dyes with strong tannin or vat chemistry — Indigo, Walnut, Tea and Pomegranate are good starting points.`;
  }

  // --- Retention improvement ----------------------------------------------
  if (/\b(improve|increase|better|boost).*(retention|fastness|colour|color)/.test(msg) || /retention/.test(msg) && /\b(improve|how|increase)\b/.test(msg)) {
    return [
      "To improve colour retention:",
      "1. Use the right mordant — alum for most plant dyes, iron for deepening and fixing browns/black.",
      "2. Dye at the recommended temperature and give the bath the full time.",
      "3. Rinse until water runs clear, then set with a vinegar or salt fixer where appropriate.",
      "4. Wash cold, inside-out, with a pH-neutral detergent and dry in shade.",
      "5. Avoid bleach, optical brighteners and long sun exposure.",
      ctx?.dye ? `For your ${ctx.dye} analysis (${ctx.retention}% retention), starting with the mordant (${ctx.mordant}) will give the biggest gain.` : "",
    ].filter(Boolean).join("\n");
  }

  // --- Mordant -------------------------------------------------------------
  if (/\bmordant/.test(msg)) {
    return "A mordant binds natural dye molecules to the fibre so the colour survives washing. Common options: alum (all-rounder, bright colours), iron (darkens, saddens tones), copper sulphate (greens, improves lightfastness), tannin (for cellulose fibres like cotton). Most of our dye cards list the recommended mordant for each dye.";
  }

  // --- Fading --------------------------------------------------------------
  if (/\b(fade|faded|fading|why).*(colour|color|dye)/.test(msg) || /\bwhy.*fade/.test(msg)) {
    return "Colour fades for a few reasons: water-soluble pigments (like beetroot and hibiscus) wash out over cycles; high wash temperatures open up fibres and release dye; harsh detergents and bleach strip colour; and UV light breaks down many natural pigments. Mitigation: cold washes, mild detergent, shade drying, a fixer or mordant, and fewer, fuller washes.";
  }

  // --- Washing -------------------------------------------------------------
  if (/\b(wash|washing|care)\b/.test(msg) && /\b(cycle|recommend|how|best)\b/.test(msg)) {
    return "General natural-dye care: wash cold (30°C or below) with a pH-neutral detergent, turn garments inside-out, wash similar colours together, and dry in the shade. Beetroot and hibiscus dyes need hand washing; indigo needs minimal agitation to avoid crocking (surface dye loss).";
  }

  // --- Sustainability ------------------------------------------------------
  if (/\b(sustainab|eco|environment|green)\b/.test(msg)) {
    return "EcoPrint AI favours plant-based dyes, upcycled sources (onion skins, tea waste), low-water extraction and verified supply chains. Natural dyeing uses less energy and produces biodegradable waste compared to synthetic dyes — but it needs more water per kg and careful mordanting, so we score each dye-fabric pairing for sustainability.";
  }

  // --- Plans / pricing -----------------------------------------------------
  if (/\b(price|pricing|plan|cost|free|pay|subscription)\b/.test(msg)) {
    return "EcoPrint AI has a free tier (limited analyses, basic recommendations and demo design generation), PRO at ₹199/month (unlimited analysis, full assistant, design studio and reports) and BUSINESS at ₹499/month for teams. Payments are in demo mode right now — no real money is charged. You can upgrade from the Pricing page.";
  }

  // --- Design studio -------------------------------------------------------
  if (/\b(design|studio|generate|pattern)\b/.test(msg) && /\b(how|what|make|create)\b/.test(msg)) {
    return "The AI Fabric Design Studio turns a prompt, fabric, natural dye, pattern and palette into a preview design. In demo mode it renders a procedural preview (no paid image API needed); once an AI image API key is configured it generates real images. You can download, regenerate, save and create variations of each design.";
  }

  // --- What is EcoPrint AI -------------------------------------------------
  if (/\b(what is|what can|who are|about)\b/.test(msg) || /\becoprint\b/.test(msg) && /\b(what|who|how)\b/.test(msg)) {
    return "EcoPrint AI is a sustainable-textile platform: upload a fabric photo and we predict colour retention and dyeing conditions (temperature, duration, mordant), recommend dye-fabric pairings, generate natural-dye textile designs, and let you chat about everything from mordants to wash cycles. The full pipeline runs in demo mode without any API keys.";
  }

  // --- Greeting ------------------------------------------------------------
  if (/^(hi|hello|hey|namaste|hola)\b/.test(msg)) {
    return "Hello! I'm the EcoPrint AI Assistant 🌿 I can help with natural dyes, fabric care, colour retention, mordants, washing cycles and sustainable textile practices — and I can explain your latest analysis. Try asking me about indigo on cotton, or why your retention might be lower than expected.";
  }

  // --- Thanks --------------------------------------------------------------
  if (/\b(thanks|thank you|thx)\b/.test(msg)) {
    return "You're welcome! 🌿 Come back anytime — and if you've just run a fabric analysis, ask me to explain the result.";
  }

  // --- Fallback ------------------------------------------------------------
  return "I can help with natural dyes (indigo, turmeric, hibiscus, pomegranate, tea and more), fabric types, dyeing methods, mordants, washing cycles, colour retention and sustainable textile practices. If you've just run a fabric analysis, ask me to explain that result — or try one of the suggestions below.";
}
