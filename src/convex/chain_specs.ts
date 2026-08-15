/**
 * Builds the canonical supply-chain event specs for a garment.
 * Used identically by order placement (live) and demo seeding, so the
 * production flow and the seeded showcase data are structurally identical.
 */

export interface ChainSpec {
  stage: string;
  title: string;
  actor: string;
  batchId: string;
  date: string;
  status: string;
  payload: Record<string, unknown>;
}

export interface ChainSpecInput {
  garmentId: string;
  plantName: string;
  plantBotanicalName: string;
  design: {
    code: string;
    garmentType: string;
    palette: { name: string; hex: string }[];
  };
  fabric: {
    code: string;
    name: string;
    material: string;
    weave: string;
    sustainabilityScore: number;
  };
  dye: {
    code: string;
    name: string;
    botanicalSource: string;
    mordant: string;
    rawBatchCode: string;
    manufacturerName: string;
  };
  farmer: { farmName: string; location: string; verified: boolean };
  rawBatch: { code: string; material: string; quantityKg: number };
  tailor: {
    code: string;
    name: string;
    specialization: string;
    deliveryDays: number;
  };
  /** Exactly 7 ISO dates, one per stage (farmer ... finished). */
  dates: string[];
}

export function buildChainSpecs(input: ChainSpecInput): ChainSpec[] {
  const [farmerDate, rawDate, dyeDate, fabricDate, designDate, tailorDate, finishedDate] =
    input.dates;

  return [
    {
      stage: "FARMER",
      title: "Botanical source registered",
      actor: input.farmer.farmName,
      batchId: input.rawBatch.code,
      date: farmerDate,
      status: "verified",
      payload: {
        event: "farmer-source-registered",
        stage: "FARMER",
        actor: input.farmer.farmName,
        batchId: input.rawBatch.code,
        material: input.rawBatch.material,
        quantityKg: input.rawBatch.quantityKg,
        location: input.farmer.location,
        certified: input.farmer.verified,
      },
    },
    {
      stage: "RAW_MATERIAL",
      title: "Raw material batch verified",
      actor: "Quality Assurance Lab",
      batchId: input.rawBatch.code,
      date: rawDate,
      status: "verified",
      payload: {
        event: "raw-material-batch-verified",
        stage: "RAW_MATERIAL",
        actor: "Quality Assurance Lab",
        batchId: input.rawBatch.code,
        material: input.rawBatch.material,
        quantityKg: input.rawBatch.quantityKg,
        moisturePct: 8.2,
        purityPct: 96,
      },
    },
    {
      stage: "DYE",
      title: "Natural dye batch created",
      actor: input.dye.manufacturerName,
      batchId: input.dye.code,
      date: dyeDate,
      status: "verified",
      payload: {
        event: "dye-batch-created",
        stage: "DYE",
        actor: input.dye.manufacturerName,
        batchId: input.dye.code,
        dyeName: input.dye.name,
        botanicalSource: input.dye.botanicalSource,
        sourceBatch: input.dye.rawBatchCode,
        quantityKg: 80,
        mordant: input.dye.mordant,
      },
    },
    {
      stage: "FABRIC",
      title: "Fabric allocated",
      actor: input.fabric.name,
      batchId: input.fabric.code,
      date: fabricDate,
      status: "verified",
      payload: {
        event: "fabric-allocated",
        stage: "FABRIC",
        actor: input.fabric.name,
        batchId: input.fabric.code,
        material: input.fabric.material,
        weave: input.fabric.weave,
        meters: 3.2,
        sustainabilityScore: input.fabric.sustainabilityScore,
      },
    },
    {
      stage: "DESIGN",
      title: "AI design generated",
      actor: "EcoPrint AI",
      batchId: input.design.code,
      date: designDate,
      status: "verified",
      payload: {
        event: "ai-design-generated",
        stage: "DESIGN",
        actor: "EcoPrint AI",
        batchId: input.design.code,
        model: "botanical-vision-v1 (mock)",
        plant: input.plantBotanicalName,
        palette: input.design.palette.map((c) => c.hex),
        garmentType: input.design.garmentType,
      },
    },
    {
      stage: "TAILOR",
      title: "Tailor assigned",
      actor: input.tailor.name,
      batchId: input.tailor.code,
      date: tailorDate,
      status: "verified",
      payload: {
        event: "tailor-assigned",
        stage: "TAILOR",
        actor: input.tailor.name,
        batchId: input.tailor.code,
        specialization: input.tailor.specialization,
        timelineDays: input.tailor.deliveryDays,
      },
    },
    {
      stage: "FINISHED",
      title: "Garment finished & QR-bound",
      actor: "Quality Check",
      batchId: input.garmentId,
      date: finishedDate,
      status: "verified",
      payload: {
        event: "garment-finished",
        stage: "FINISHED",
        actor: "Quality Check",
        batchId: input.garmentId,
        checksPassed: 12,
        qrBound: true,
      },
    },
  ];
}
