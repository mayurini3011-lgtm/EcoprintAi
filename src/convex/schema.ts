import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Platform roles. Every signed-in user gets exactly one role, which drives
// role-based access control (RBAC) in the backend functions.
export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  FARMER: "farmer",
  MANUFACTURER: "manufacturer",
  TAILOR: "tailor",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.CUSTOMER),
  v.literal(ROLES.FARMER),
  v.literal(ROLES.MANUFACTURER),
  v.literal(ROLES.TAILOR),
);
export type Role = Infer<typeof roleValidator>;

export const statusValidator = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("flagged"),
  v.literal("rejected"),
);
export type BatchStatus = Infer<typeof statusValidator>;

export const availabilityValidator = v.union(
  v.literal("available"),
  v.literal("limited"),
  v.literal("out"),
);

export const riskLevelValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);
export type RiskLevel = Infer<typeof riskLevelValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table brought in by authTables
    users: defineTable({
      name: v.optional(v.string()), // display name. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // do not remove
      isAnonymous: v.optional(v.boolean()), // do not remove

      role: v.optional(roleValidator), // platform role (RBAC)
    }).index("email", ["email"]),

    // ------------------------------------------------------------------
    // Supply-chain actors
    // ------------------------------------------------------------------

    farmers: defineTable({
      code: v.string(), // FARM-001
      name: v.string(), // contact person
      farmName: v.string(),
      location: v.string(),
      crops: v.array(v.string()),
      verified: v.boolean(),
      sustainabilityNotes: v.string(),
      joinedAt: v.string(), // ISO date
    }).index("by_code", ["code"]),

    manufacturers: defineTable({
      code: v.string(), // MFG-001
      name: v.string(),
      location: v.string(),
      specialties: v.array(v.string()),
      certifications: v.array(v.string()),
      verified: v.boolean(),
    }).index("by_code", ["code"]),

    // ------------------------------------------------------------------
    // Batches, dyes, fabrics, tailors
    // ------------------------------------------------------------------

    rawMaterialBatches: defineTable({
      code: v.string(), // FARM-IND-2026-001
      farmerCode: v.string(),
      farmerName: v.string(),
      material: v.string(),
      quantityKg: v.number(),
      harvestDate: v.string(),
      status: statusValidator,
      submittedAt: v.string(),
      verifiedAt: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("by_code", ["code"])
      .index("by_farmer", ["farmerCode"]),

    dyes: defineTable({
      code: v.string(), // DYE-IND-2026-001
      name: v.string(),
      botanicalSource: v.string(), // Indigofera tinctoria
      colorHex: v.string(),
      colorName: v.string(),
      farmerCode: v.string(),
      farmerName: v.string(),
      manufacturerCode: v.string(),
      manufacturerName: v.string(),
      rawBatchCode: v.string(), // lineage: raw batch -> dye batch
      availability: availabilityValidator,
      sustainabilityInfo: v.string(),
      status: statusValidator,
      mordant: v.string(),
      pricePerKg: v.number(),
      verifiedAt: v.optional(v.string()),
    }).index("by_code", ["code"]),

    fabrics: defineTable({
      code: v.string(), // FAB-ORG-001
      name: v.string(),
      material: v.string(),
      weave: v.string(),
      origin: v.string(),
      sustainabilityScore: v.number(), // 0-100
      pricePerMeter: v.number(), // INR
      available: v.boolean(),
      colors: v.array(v.string()), // available colorways
    }).index("by_code", ["code"]),

    tailors: defineTable({
      code: v.string(), // TAI-001
      name: v.string(),
      shopName: v.string(),
      location: v.string(),
      rating: v.number(),
      reviews: v.number(),
      specialization: v.string(),
      priceMin: v.number(), // INR
      priceMax: v.number(),
      deliveryDays: v.number(),
      previousWork: v.array(v.string()),
      available: v.boolean(),
    }).index("by_code", ["code"]),

    // ------------------------------------------------------------------
    // AI-generated designs, orders, garments
    // ------------------------------------------------------------------

    designs: defineTable({
      code: v.string(), // DSG-2026-001
      plantName: v.string(),
      botanicalName: v.string(),
      garmentType: v.string(),
      title: v.string(),
      description: v.string(),
      palette: v.array(v.object({ name: v.string(), hex: v.string() })),
      motif: v.string(),
      patternDensity: v.string(),
      sleeveStyle: v.string(),
      neckStyle: v.string(),
      borderPattern: v.string(),
      fabricType: v.string(),
      createdAt: v.string(),
      createdBy: v.optional(v.string()),
    }).index("by_code", ["code"]),

    orders: defineTable({
      orderCode: v.string(), // ORD-2026-0001
      userId: v.optional(v.id("users")),
      customerName: v.string(),
      designCode: v.string(),
      designTitle: v.string(),
      plantName: v.string(),
      palette: v.array(v.object({ name: v.string(), hex: v.string() })),
      fabricCode: v.string(),
      fabricName: v.string(),
      dyeCode: v.string(),
      dyeName: v.string(),
      tailorCode: v.string(),
      tailorName: v.string(),
      measurements: v.object({
        heightCm: v.number(),
        bustCm: v.number(),
        waistCm: v.number(),
        hipsCm: v.number(),
        shoulderCm: v.number(),
        sleeveCm: v.number(),
        lengthPreference: v.string(),
      }),
      totalPrice: v.number(), // INR
      status: v.string(), // order status step id
      createdAt: v.string(),
      garmentId: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_code", ["orderCode"]),

    garments: defineTable({
      garmentId: v.string(), // NF-2026-000125
      orderId: v.optional(v.string()),
      plantName: v.optional(v.string()),
      designCode: v.string(),
      designTitle: v.string(),
      fabricCode: v.string(),
      fabricName: v.string(),
      dyeCode: v.string(),
      dyeName: v.string(),
      farmerName: v.string(),
      manufacturerName: v.string(),
      tailorName: v.string(),
      status: v.string(),
      createdAt: v.string(),
      chainHash: v.string(), // SHA-256 of the final chain event
      verified: v.boolean(),
    })
      .index("by_garment_id", ["garmentId"])
      .index("by_order", ["orderId"]),

    // ------------------------------------------------------------------
    // Cybersecurity layer
    // ------------------------------------------------------------------

    // One row per supply-chain event. `payload` is the canonical JSON of the
    // record; `hash` is SHA-256(canonical(payload)); `prevHash` links to the
    // previous event, forming a tamper-evident hash chain. `originalPayload`
    // is the pristine copy used by the demo "Restore Record" action.
    supplyChainEvents: defineTable({
      garmentId: v.string(),
      chainIndex: v.number(),
      stage: v.string(), // FARMER | RAW_MATERIAL | DYE | FABRIC | DESIGN | TAILOR | FINISHED
      title: v.string(),
      actor: v.string(),
      batchId: v.string(),
      date: v.string(),
      status: v.string(), // verified | flagged
      payload: v.string(), // canonical JSON (current)
      originalPayload: v.string(), // canonical JSON (pristine)
      hash: v.string(),
      prevHash: v.string(),
      tampered: v.boolean(),
    })
      .index("by_garment", ["garmentId", "chainIndex"])
      .index("by_stage", ["stage"]),

    securityAlerts: defineTable({
      type: v.string(), // duplicate_cert | suspicious_doc | tamper_attempt | risk_scan ...
      severity: riskLevelValidator,
      title: v.string(),
      message: v.string(),
      entityType: v.string(),
      entityCode: v.string(),
      timestamp: v.string(),
      resolved: v.boolean(),
    }).index("by_timestamp", ["timestamp"]),

    auditLogs: defineTable({
      actor: v.string(),
      action: v.string(),
      entity: v.string(),
      entityCode: v.string(),
      details: v.string(),
      timestamp: v.string(),
    }).index("by_timestamp", ["timestamp"]),

    aiAnalyses: defineTable({
      targetType: v.string(), // garment | dye_batch | raw_batch | document
      targetCode: v.string(),
      riskScore: v.number(), // 0-100
      status: riskLevelValidator,
      reasons: v.array(v.string()),
      checkedAt: v.string(),
      scanner: v.string(),
    }).index("by_target", ["targetType", "targetCode"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
