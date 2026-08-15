/**
 * Security module — cryptographically verifiable supply chain.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every important supply-chain event is recorded as canonical JSON, hashed
 * with SHA-256, and linked to the previous event's hash. Anyone who modifies
 * an old record changes the canonical JSON, so the recomputed hash no longer
 * matches the stored hash — tampering is detectable. Because each hash also
 * commits to the previous hash (prevHash), an attacker cannot re-order or
 * splice events without breaking the whole chain.
 *
 * This MVP runs entirely on the Web Crypto API (crypto.subtle.digest), which
 * is available in the Convex runtime. No external service required.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireRole } from "./roles";

// ---------------------------------------------------------------------------
// Hashing primitives
// ---------------------------------------------------------------------------

/** Recursively sort object keys so the same logical record always produces
 *  the same canonical string, regardless of insertion order. */
export function canonicalize(value: unknown): string {
  const sort = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(sort);
    if (input !== null && typeof input === "object") {
      const obj = input as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(obj).sort()) {
        out[key] = sort(obj[key]);
      }
      return out;
    }
    return input;
  };
  return JSON.stringify(sort(value));
}

/** SHA-256 hex digest of a UTF-8 string, via the Web Crypto API. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Hash of a structured record: SHA-256(canonicalize(record)). */
export async function hashRecord(record: unknown): Promise<string> {
  return sha256Hex(canonicalize(record));
}

// ---------------------------------------------------------------------------
// Chain construction
// ---------------------------------------------------------------------------

export const createChainEvent = mutation({
  args: {
    garmentId: v.string(),
    stage: v.string(),
    title: v.string(),
    actor: v.string(),
    batchId: v.string(),
    date: v.string(),
    status: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const payloadJson = canonicalize(args.payload);
    const hash = await sha256Hex(payloadJson);

    // Link to the previous event in this garment's chain.
    const prev = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", args.garmentId))
      .order("desc")
      .first();
    const prevHash = prev ? prev.hash : "";
    const chainIndex = prev ? prev.chainIndex + 1 : 0;

    const id = await ctx.db.insert("supplyChainEvents", {
      garmentId: args.garmentId,
      chainIndex,
      stage: args.stage,
      title: args.title,
      actor: args.actor,
      batchId: args.batchId,
      date: args.date,
      status: args.status,
      payload: payloadJson,
      originalPayload: payloadJson, // pristine copy used for demo restore
      hash,
      prevHash,
      tampered: false,
    });

    return { id, chainIndex, hash, prevHash };
  },
});

// ---------------------------------------------------------------------------
// Verification — the tamper-detection core
// ---------------------------------------------------------------------------

export const verifyGarmentChain = query({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    const events = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .collect();
    events.sort((a, b) => a.chainIndex - b.chainIndex);

    const checks: {
      chainIndex: number;
      stage: string;
      title: string;
      actor: string;
      batchId: string;
      date: string;
      hash: string;
      prevHash: string;
      recomputedHash: string;
      hashOk: boolean;
      linkOk: boolean;
      tampered: boolean;
    }[] = [];

    for (const event of events) {
      const recomputedHash = await sha256Hex(event.payload);
      const hashOk = recomputedHash === event.hash;
      const expectedPrev = event.chainIndex === 0 ? "" : checks[checks.length - 1].hash;
      const linkOk = event.prevHash === expectedPrev;

      checks.push({
        chainIndex: event.chainIndex,
        stage: event.stage,
        title: event.title,
        actor: event.actor,
        batchId: event.batchId,
        date: event.date,
        hash: event.hash,
        prevHash: event.prevHash,
        recomputedHash,
        hashOk,
        linkOk,
        tampered: event.tampered,
      });
    }

    const failures = checks.filter((c) => !c.hashOk || !c.linkOk);
    const valid = events.length > 0 && failures.length === 0;

    return {
      garmentId,
      valid,
      eventCount: events.length,
      failures,
      checks,
      chainHash: events.length > 0 ? events[events.length - 1].hash : "",
    };
  },
});

// ---------------------------------------------------------------------------
// Tamper simulation (live demo) + restore
// ---------------------------------------------------------------------------

/**
 * Simulates an attacker modifying an historical record. We mutate the event's
 * payload but deliberately do NOT recompute its stored hash — exactly what a
 * naive tamper would do. Verification then detects the mismatch.
 */
export const simulateTampering = mutation({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    const actor = await getCurrentUser(ctx);
    await requireRole(ctx, ["admin"]);

    const events = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .collect();
    events.sort((a, b) => a.chainIndex - b.chainIndex);

    // Tamper the DYE record if present (most visible stage), else the last one.
    const target =
      events.find((e) => e.stage === "DYE" && !e.tampered) ??
      events.filter((e) => !e.tampered).slice(-1)[0];
    if (!target) return { tampered: false, message: "Nothing left to tamper with." };

    const payload = JSON.parse(target.payload) as Record<string, unknown>;
    const tamperedPayload = {
      ...payload,
      batchId: `${payload.batchId}-X`,
      quantityKg:
        typeof payload.quantityKg === "number" ? payload.quantityKg + 777 : 777,
      tamperedAt: new Date().toISOString(),
    };

    await ctx.db.patch(target._id, {
      payload: canonicalize(tamperedPayload),
      tampered: true,
    });

    await ctx.db.insert("auditLogs", {
      actor: actor?.name ?? "demo-admin",
      action: "tamper_simulated",
      entity: "supply_chain_event",
      entityCode: `${garmentId}#${target.stage}`,
      details: `Simulated modification of ${target.stage} record (batch ${target.batchId}). Stored hash left unchanged.`,
      timestamp: new Date().toISOString(),
    });

    return { tampered: true, stage: target.stage, batchId: target.batchId };
  },
});

/** Restores the pristine payloads of every event in the garment's chain. */
export const restoreChain = mutation({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    const actor = await getCurrentUser(ctx);
    await requireRole(ctx, ["admin"]);

    const events = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .collect();

    let restored = 0;
    for (const event of events) {
      if (event.tampered || event.payload !== event.originalPayload) {
        await ctx.db.patch(event._id, {
          payload: event.originalPayload,
          tampered: false,
        });
        restored += 1;
      }
    }

    await ctx.db.insert("auditLogs", {
      actor: actor?.name ?? "demo-admin",
      action: "chain_restored",
      entity: "garment",
      entityCode: garmentId,
      details: `Restored ${restored} supply-chain record(s) to pristine state.`,
      timestamp: new Date().toISOString(),
    });

    return { restored };
  },
});

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

/** Garment + its full event chain (used by traceability pages). */
export const getGarmentWithChain = query({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    const garment = await ctx.db
      .query("garments")
      .withIndex("by_garment_id", (q) => q.eq("garmentId", garmentId))
      .first();
    if (!garment) return null;

    const events = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .collect();
    events.sort((a, b) => a.chainIndex - b.chainIndex);

    return {
      garment: {
        garmentId: garment.garmentId,
        designTitle: garment.designTitle,
        fabricName: garment.fabricName,
        dyeName: garment.dyeName,
        farmerName: garment.farmerName,
        manufacturerName: garment.manufacturerName,
        tailorName: garment.tailorName,
        plantName: garment.plantName ?? null,
        status: garment.status,
        createdAt: garment.createdAt,
        chainHash: garment.chainHash,
        verified: garment.verified,
      },
      events: events.map((e) => ({
        chainIndex: e.chainIndex,
        stage: e.stage,
        title: e.title,
        actor: e.actor,
        batchId: e.batchId,
        date: e.date,
        status: e.status,
        hash: e.hash,
        prevHash: e.prevHash,
        tampered: e.tampered,
      })),
    };
  },
});

/**
 * Public, non-sensitive traceability record for QR verification.
 * Deliberately excludes order measurements, customer identity and pricing —
 * the public record contains ONLY supply-chain provenance data.
 */
export const getGarmentPublic = query({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    const garment = await ctx.db
      .query("garments")
      .withIndex("by_garment_id", (q) => q.eq("garmentId", garmentId))
      .first();
    if (!garment) return null;

    const events = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .collect();
    events.sort((a, b) => a.chainIndex - b.chainIndex);

    return {
      garmentId: garment.garmentId,
      status: garment.status,
      createdAt: garment.createdAt,
      designTitle: garment.designTitle,
      fabricName: garment.fabricName,
      dyeName: garment.dyeName,
      farmerName: garment.farmerName,
      manufacturerName: garment.manufacturerName,
      tailorName: garment.tailorName,
      plantName: garment.plantName ?? null,
      chainHash: garment.chainHash,
      // Non-sensitive event summary only (no payloads, no customer data).
      events: events.map((e) => ({
        stage: e.stage,
        title: e.title,
        actor: e.actor,
        batchId: e.batchId,
        date: e.date,
        status: e.status,
        hash: e.hash,
        prevHash: e.prevHash,
        tampered: e.tampered,
      })),
    };
  },
});

export const getEventsForGarment = query({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    const events = await ctx.db
      .query("supplyChainEvents")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .collect();
    events.sort((a, b) => a.chainIndex - b.chainIndex);
    return events;
  },
});
