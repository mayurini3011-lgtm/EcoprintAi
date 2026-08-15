# AI Eco Threads — EcoPrint AI

> **From plant to personalized fashion — designed by AI, protected by cybersecurity.**

AI Eco Threads runs **EcoPrint AI**, a hackathon MVP that connects **Farmers → Natural Dye Manufacturers → Fabric → Customers → AI Design → Tailors**, where every finished garment carries a cryptographically sealed digital identity that anyone can verify by scanning a QR code.

---

## The Problem

Counterfeit sustainability claims and opaque supply chains make it impossible for customers to know whether "natural dye" products are authentic. Batch records can be edited after the fact, certifications duplicated, and provenance silently rewritten.

## The Solution

An AI-powered fashion platform with a **cryptographically verifiable supply chain**:

- Upload a flower or leaf → **EcoPrint AI** identifies the botanical, extracts its pigments, and generates bespoke garment designs
- Browse and search the **dye catalogue** and **tailor network**, open full detail pages for any batch or profile
- Book a **delivery slot**, choose a payment method, and leave a note for your tailor at checkout
- The finished garment receives a **tamper-evident identity** (`NF-2026-000125`) built from a **SHA-256 hash chain** — change any historical record and the verification breaks, provably
- An **AI risk scanner** flags suspicious farmer/manufacturer documentation (duplicate certs, mismatched quantities, impossible dates, manipulated metadata)
- **Role-based dashboards** for customers, farmers, manufacturers and admins

> **Blockchain is NOT the core technology.** The innovation is *cryptographically verifiable supply-chain integrity + AI-powered risk detection*. Blockchain is mentioned only as a possible future extension.

---

## 🚀 Quick start

```bash
bun install
bun convex dev --once      # codegen + validate Convex functions
bun run dev                # start the app
```

The app auto-seeds a complete demo dataset on first load (5 farmers, 3 manufacturers, 10 dye batches, 10 fabrics, 5 tailors, 10 designs, 10 garments with full hash-chained supply chains, orders, alerts and audit logs). No API keys required — the AI runs in deterministic mock mode.

### Environment

No `.env` variables are required for the MVP. The template's Convex URL (`VITE_CONVEX_URL`) and auth wiring are already configured. If you later integrate a real AI provider, keys go in the project's Keys/API keys UI — never in code.

---

## 🎬 The 3-minute demo (the main flow)

1. **EcoPrint Studio** → upload a flower (or pick from the botanical gallery).
   EcoPrint AI shows an identification card — species, confidence, palette, symbolism.
2. **AI Concepts** → four generated design cards appear.
3. Pick one → **Customize** (garment type, colourway, pattern density, sleeve, neck, border, motif) with a live preview.
4. Choose a **natural dye** batch and a **fabric**.
5. Enter **measurements** → pick a **tailor** and **book your delivery slot**.
6. **Checkout** → choose a payment method, leave a note for the tailor, and **Pay & place order** → the system mints garment ID **`NF-2026-000125`**.
7. Watch the **secure supply-chain timeline** build (7 hash-chained events) and scan the **QR code**.
8. Open **`/verify/NF-2026-000124`** (or the new garment) → 🟢 AUTHENTIC / VERIFIED → "Verify Supply Chain Integrity".
9. Open the **Security Center** → **Simulate Tampering**.
10. 🔴 **TAMPERING DETECTED** — the dye record's hash no longer matches the stored integrity chain.
11. **Restore Record** → 🟢 VERIFIED AGAIN. *This is the demo's climax.*

## 🔑 Demo access

Use **"Continue as guest — instant demo access"** on the auth page (or any email + OTP code). Then use the **demo role switcher** in the sidebar to tour every portal:

| Role | What you see |
| --- | --- |
| Customer | EcoPrint Studio, Dye Catalogue, Tailor Network, My Orders |
| Farmer | Batch submission + AI risk scan (Green Valley Farm) |
| Manufacturer | Raw batch → dye batch processing (Aravalli Naturals) |
| Admin | Security Center tamper demo + Admin analytics |
| Tailor | Marketplace profiles (demo view) |

---

## 🗺️ Routes

| Route | Page |
| --- | --- |
| `/` | Landing |
| `/auth` | Sign in / guest access |
| `/dashboard` | **EcoPrint Studio** — the customer flow |
| `/dyes` | Dye catalogue (searchable) |
| `/dyes/:code` | Dye batch detail + provenance lineage |
| `/tailors` | Tailor network (searchable) |
| `/tailors/:code` | Tailor profile detail |
| `/orders` | Orders + checkout details + garment traceability |
| `/farmer` | Farmer portal |
| `/manufacturer` | Manufacturer portal |
| `/security` | **Security Center** (tamper demo) |
| `/admin` | Admin console + charts |
| `/verify/:garmentId` | Public QR verification (no auth) |

---

## 🧠 AI layer

`src/lib/ai/` defines an **`AIService` abstraction** with four capabilities:

- `identifyPlant(input)` — botanical identification
- `generateColourPalette(plant)` — natural colour recommendation
- `generateDesigns(plant, options)` — garment design generation
- `analyzeRisk(data)` — fraud/risk detection over documentation

The shipped **`MockAIService`** is deterministic (same image → same result, perfect for demos) and actually "sees" the uploaded photo: it computes a **SHA-256 of the image bytes** and extracts **dominant colours** from a downscaled canvas, then matches hue clusters against a 12-species botanical catalog. Design cards are rendered as SVG garment silhouettes coloured from the plant's palette.

**Going live with a real AI later:** implement the same interface in a class that calls a hosted vision/LLM API (e.g., a Convex action using the VLY integration gateway described in `integrations.md`) and return it from `getAIService()` in `src/lib/ai/index.ts`. No UI changes needed.

---

## 🔐 Cybersecurity layer

Everything lives in `src/convex/security.ts` with inline comments explaining *why*:

- **Canonical JSON** — records are serialized with sorted keys so identical logical records always produce identical bytes.
- **SHA-256 hashing** — every supply-chain event stores `hash = SHA-256(canonical(payload))` (Web Crypto API, no external service).
- **Hash chaining** — each event stores `prevHash`, linking it to the previous event. Re-ordering or splicing events breaks the chain.
- **Tamper detection** — verification recomputes every hash and compares against the stored digests, reporting exactly which record failed.
- **RBAC** — `requireRole()` guards mutations; roles are Customer / Farmer / Manufacturer / Tailor / Admin. The demo role switcher genuinely changes the Convex user's role.
- **Audit logs** — every security-relevant action is append-only with actor, entity and timestamp.
- **Server-side validation** — quantities, dates, material names and batch codes are validated in Convex mutations (see `farmer.ts`, `manufacturer.ts`, `orders.ts`).
- **Privacy by design** — the public QR record (`getGarmentPublic`) exposes *only* provenance; customer identity, measurements and pricing never leave the private order.
- **No secrets in code** — API keys live in the Keys UI / environment, never hard-coded.
- **AI fraud detection** — a rule engine (`MockAIService.analyzeRisk`) scores missing info, inconsistent batch IDs, impossible dates, mismatched quantities, duplicate certification numbers and manipulated image metadata.

---

## 🗄️ Data model (Convex)

`users`, `farmers`, `manufacturers`, `rawMaterialBatches`, `dyes`, `fabrics`, `tailors`, `designs`, `orders` (incl. delivery slot, payment method and tailor notes), `garments`, `supplyChainEvents` (hash chain), `securityAlerts`, `auditLogs`, `aiAnalyses`.

The schema is in `src/convex/schema.ts`; the seeder is `src/convex/seed.ts` (idempotent, with a reset mutation exposed in the Security Center).

---

## 🧱 Architecture notes

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Framer Motion + recharts.
- **Theme:** dark by default — near-black green-tinted canvas, eco-emerald primary, cyan accent, Space Grotesk display type, monospace batch/hash styling.
- **Backend/DB:** Convex (the template's managed backend + database) — replaces Express/PostgreSQL while keeping the same mental model: typed functions, validated args, reactive queries.
- **QR:** `qrcode` (renders verification URLs as data-URL images).
- **Seed data:** fictional but realistic (Green Valley Farm, Aravalli Naturals, Ananya Tailors, …).
- **Demo-friendly resets:** Security Center has *Simulate Tampering*, *Restore Record* and *Reset demo data*.

---

## 🔮 Future scope

- Real IoT/logistics tracking (batch temperature, moisture, GPS)
- Real farmer onboarding with KYC and field verification
- Blockchain anchoring of chain hashes (optional, as a notarization layer)
- Laboratory dye verification + computer vision for dye/plant analysis
- Real payments and production logistics
- Real hosted AI vision model for botanical identification

---

## 📦 Project structure (key files)

```
src/
├── convex/                 # Backend (Convex)
│   ├── schema.ts           # Data model + roles
│   ├── security.ts         # SHA-256 hash chain, verification, tamper demo
│   ├── orders.ts           # Order placement → garment minting
│   ├── farmer.ts           # Farmer batch submission
│   ├── manufacturer.ts     # Dye batch processing
│   ├── admin.ts            # Platform stats
│   ├── seed.ts             # Demo data (idempotent)
│   └── chain_specs.ts      # Canonical chain event builder
├── lib/ai/                 # AIService abstraction + mock + vision
│   ├── types.ts            # Service interfaces
│   ├── plants.ts           # Botanical catalog
│   ├── mock.ts             # Deterministic mock AI + risk engine
│   ├── vision.ts           # Image hash + dominant colour extraction
│   └── index.ts            # Service factory
├── components/
│   ├── garment/            # SVG previews, palette, timeline, hash table
│   ├── security/           # QR code, stat cards
│   └── layout/             # AppShell, demo role switcher
└── pages/                  # Landing, Studio, Dyes (+detail), Tailors (+detail),
                            # Orders, Farmer, Manufacturer, Security, Admin, Verify
```
