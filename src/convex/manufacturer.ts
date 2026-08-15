/**
 * Manufacturer portal — receives raw material batches and converts them into
 * verified natural dye batches. The lineage raw batch -> dye batch is always
 * preserved (rawBatchCode foreign key), so the supply chain stays auditable.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./roles";

const AVAILABILITY = v.union(
  v.literal("available"),
  v.literal("limited"),
  v.literal("out"),
);

export const createDyeBatch = mutation({
  args: {
    manufacturerCode: v.string(),
    name: v.string(),
    botanicalSource: v.string(),
    colorName: v.string(),
    colorHex: v.string(),
    rawBatchCode: v.string(),
    mordant: v.string(),
    sustainabilityInfo: v.string(),
    availability: AVAILABILITY,
    pricePerKg: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["manufacturer", "admin"]);

    const manufacturer = await ctx.db
      .query("manufacturers")
      .withIndex("by_code", (q) => q.eq("code", args.manufacturerCode))
      .first();
    if (!manufacturer) throw new Error("Manufacturer profile not found.");

    const rawBatch = await ctx.db
      .query("rawMaterialBatches")
      .withIndex("by_code", (q) => q.eq("code", args.rawBatchCode))
      .first();
    if (!rawBatch) throw new Error("Raw material batch not found.");
    if (rawBatch.status === "flagged") {
      throw new Error("Cannot process a flagged raw material batch.");
    }

    const year = new Date().getFullYear();
    const prefix = args.name.slice(0, 3).toUpperCase();
    const code = `DYE-${prefix}-${year}-${String(
      (await ctx.db.query("dyes").collect()).length + 1,
    ).padStart(3, "0")}`;

    const now = new Date().toISOString();
    const id = await ctx.db.insert("dyes", {
      code,
      name: args.name,
      botanicalSource: args.botanicalSource,
      colorHex: args.colorHex,
      colorName: args.colorName,
      farmerCode: rawBatch.farmerCode,
      farmerName: rawBatch.farmerName,
      manufacturerCode: manufacturer.code,
      manufacturerName: manufacturer.name,
      rawBatchCode: rawBatch.code,
      availability: args.availability,
      sustainabilityInfo: args.sustainabilityInfo,
      status: "verified",
      mordant: args.mordant,
      pricePerKg: args.pricePerKg,
      verifiedAt: now,
    });

    // Mark the source raw batch as consumed/verified.
    if (rawBatch.status === "pending") {
      await ctx.db.patch(rawBatch._id, { status: "verified", verifiedAt: now });
    }

    await ctx.db.insert("auditLogs", {
      actor: manufacturer.name,
      action: "dye_batch_created",
      entity: "dye",
      entityCode: code,
      details: `${args.name} produced from ${rawBatch.code} (${rawBatch.material}).`,
      timestamp: now,
    });

    return { code, id };
  },
});

export const markBatchReady = mutation({
  args: { dyeCode: v.string() },
  handler: async (ctx, { dyeCode }) => {
    await requireRole(ctx, ["manufacturer", "admin"]);

    const dye = await ctx.db
      .query("dyes")
      .withIndex("by_code", (q) => q.eq("code", dyeCode))
      .first();
    if (!dye) throw new Error("Dye batch not found.");

    await ctx.db.patch(dye._id, { status: "verified", verifiedAt: new Date().toISOString() });

    await ctx.db.insert("auditLogs", {
      actor: dye.manufacturerName,
      action: "dye_batch_marked_ready",
      entity: "dye",
      entityCode: dyeCode,
      details: `Batch ${dyeCode} marked ready for production.`,
      timestamp: new Date().toISOString(),
    });

    return { code: dyeCode };
  },
});

export const listDyesForManufacturer = query({
  args: { manufacturerCode: v.string() },
  handler: async (ctx, { manufacturerCode }) => {
    return (await ctx.db.query("dyes").collect()).filter(
      (d) => d.manufacturerCode === manufacturerCode,
    );
  },
});

/** Receivable raw batches (verified, not yet consumed by a dye batch). */
export const receivableRawBatches = query({
  args: {},
  handler: async (ctx) => {
    const rawBatches = await ctx.db.query("rawMaterialBatches").collect();
    const dyes = await ctx.db.query("dyes").collect();
    const consumed = new Set(dyes.map((d) => d.rawBatchCode));
    return rawBatches.filter(
      (b) => b.status !== "flagged" && !consumed.has(b.code),
    );
  },
});
