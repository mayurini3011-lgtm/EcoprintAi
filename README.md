# EcoPrint AI

**AI-Powered Natural Dye Optimization & Fabric Color Retention Analysis**

> Analyze fabrics, predict color retention, optimize natural dyeing conditions, and create sustainable textile designs with AI. — *From plant to personalized fashion — designed by AI, protected by cybersecurity.*

EcoPrint AI is a professional, demo-first AI SaaS for sustainable textiles. It is built on **Vite + React 19 + TypeScript + Tailwind CSS v4 (shadcn/ui) + Convex** (database, auth, backend functions). Everything runs in **Demo Mode with zero paid APIs** — every simulated result is clearly labelled as such.

---

## Features

| Area | What it does |
|---|---|
| **Fabric Analysis** (`/analyze`) | Upload a fabric photo → EcoPrint measures the dominant colour (real RGB extraction), runs the retention model, and reports fabric detected, dominant colour + RGB/LAB, CIEDE2000 colour difference (ΔE), retention % + category, dyeing temperature/duration, mordant, dye/fabric/washing recommendations, sustainability score and AI confidence. |
| **Washing-cycle analysis** | 1 / 5 / 10 / 20 / 30 wash cycles with a retention fade chart (initial colour → after wash → ΔE → retention %). |
| **EcoPrint AI Assistant** (`/assistant` + floating button) | Context-aware chatbot (rule engine in Demo Mode; pluggable LLM). Knows dyes, fabrics, mordants, wash cycles, retention — and can explain your latest analysis. |
| **AI Fabric Design Studio** (`/design-studio`) | Prompt + fabric (Cotton/Silk/Linen/Wool/Jute) + dye + pattern (8) + palette (6) → design preview. Demo mode renders deterministic procedural SVG artwork; Download / Regenerate / Save / Variation all work offline. |
| **Natural Dye Library** (`/dye-library`) | 12 dyes (Indigo, Turmeric, Hibiscus, Madder, Pomegranate, Marigold, Walnut, Neem, Henna, Onion, Beetroot, Tea) with source, colour, suitable fabrics, mordants, dyeing conditions, sustainability. |
| **Analysis History** (`/history`) | Every analysis is stored (Convex DB — swap for SQLite/Postgres later if you host your own). View / Delete / Download Report. |
| **Reports** (`/reports`) | Full printable report (logo, fabric, dye, pattern, before/after colour, retention, ΔE, recommendations, dyeing conditions, washing, sustainability) + required disclaimer. "Download PDF" → browser print-to-PDF. |
| **Dashboard** (`/dashboard`) | Stats (total analyses, avg retention, best dye, designs generated, sustainability score), retention charts, recent analyses, quick actions. |
| **Pricing + Checkout** (`/pricing`, `/checkout`) | FREE ₹0 / PRO ₹199/mo / BUSINESS ₹499/mo with GST breakdown and UPI/Card/Debit/Net-banking UI. **Demo Payment Mode** — simulated, clearly labelled, Razorpay-ready. |
| **Account** (`/account`) | Profile, demo plan, honest AI-status indicator. |
| **Supply chain (kept)** | EcoPrint Studio (botanical → garment), Dye Catalogue, Tailor Network, Orders, Farmer Portal, Manufacturer, Security Center (SHA-256 tamper demo), Admin Console, public `/verify/:id` pages. |

---

## Architecture

```
src/
├── main.tsx                 # Router + providers (lazy routes)
├── index.css                # Light green/natural-earth SaaS theme (dark tokens kept)
├── convex/                  # Backend (Convex = DB + functions + HTTP API)
│   ├── schema.ts            # All tables (auth, catalog, fabricAnalyses, savedDesigns, …)
│   ├── analysis.ts          # Retention model (predictAnalysis) + history CRUD
│   ├── chat.ts              # Assistant action — live LLM or demo engine
│   ├── designStudio.ts      # Design-generation action — image API or demo spec
│   ├── designsData.ts       # Saved-design persistence
│   ├── payments.ts          # createOrder / verifyPayment — demo or Razorpay
│   ├── color.ts             # sRGB↔CIELAB, CIEDE2000, fade prediction (real math)
│   ├── constants.ts         # Dye knowledge base, patterns, palettes, plans
│   ├── http.ts              # REST endpoints (see below)
│   ├── seed.ts              # Demo data (auto-seeds, additive for existing DBs)
│   └── …                    # existing supply-chain modules (unchanged)
├── pages/                   # One file per route
├── components/chat|design|analysis|garment|security|layout
└── lib/ (ai, report, format, …)
```

### REST endpoints (Convex HTTP API)

Served at the deployment URL, e.g. `https://<project>.convex.site/api/health`:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Backend status (`{ status: "ok", demoMode: true }`) |
| `GET /api/dyes` | Dye catalogue snapshot |
| `GET /api/history` · `POST /api/history` · `DELETE /api/history/:id` | Analysis history |
| `POST /api/chat` | `{ message, analysis_context }` → assistant reply |
| `POST /api/generate-design` | `{ prompt, fabric, dye, pattern, palette }` → design |
| `POST /api/create-order` · `POST /api/verify-payment` | Checkout |

CORS is handled by the Convex platform; no config needed. The web app calls Convex functions directly.

---

## How to run

```bash
bun install        # install dependencies
bun convex dev --once   # codegen + validate backend functions (non-interactive)
bun tsc -b --noEmit     # typecheck
bun lint                # eslint
bun run dev             # start the Vite dev server (platform-managed in Freebuff)
```

The demo data seeds automatically on first load (5 farmers, 3 manufacturers, 12 dyes, 10 fabrics, 5 tailors, garments with hash chains, 4 sample fabric analyses, 3 sample designs).

**Quick demo flow:** sign in as guest → Fabric Analysis (upload photo or use dye reference colour) → watch the result + wash chart → open the AI Assistant and ask *"explain my analysis result"* → AI Design Studio → Generate/Save a design → History → Reports (Download PDF) → Pricing → PRO → Checkout → **Demo Payment** success screen.

---

## Demo Mode vs live APIs

Demo Mode is the default — no keys required, nothing fake about the labels:

| Feature | Demo Mode | Live mode (opt-in) |
|---|---|---|
| Assistant | Rule-based engine (`mode: "demo"` returned per reply) | Set `AI_API_KEY` (+ `AI_API_BASE_URL`, `AI_MODEL`) — OpenAI-compatible |
| Design Studio | Deterministic procedural SVG previews | Set `AI_API_KEY` + `AI_IMAGE_ENDPOINT` — returns a real image URL |
| Payments | Simulated, clearly labelled "Demo transaction — no real money was charged" | Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — real order + HMAC verification |
| Analysis | Simulated rule model (`mode: "simulated"`) | Plug a real ML model into `predictAnalysis` (same interface) |

**Important:** no secrets live in frontend code. Convex actions read them from `process.env`; in Freebuff, add keys in the **Keys / API keys** tab with these exact names: `AI_API_KEY`, `AI_API_BASE_URL`, `AI_MODEL`, `AI_IMAGE_ENDPOINT`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. For self-hosted deployments use a `.env` file (a `.env.example` template is described below — never commit a real `.env`).

```bash
# .env.example (self-hosted deployments)
DEMO_MODE=true
AI_API_KEY=
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_IMAGE_ENDPOINT=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
VITE_CONVEX_URL=
CONVEX_SITE_URL=
```

---

## Adding real AI / payments later

1. **Assistant LLM** — add `AI_API_KEY` (and optionally `AI_API_BASE_URL` / `AI_MODEL`) to the environment. `src/convex/chat.ts` already POSTs to an OpenAI-compatible endpoint with your analysis context in the system prompt. Replies switch to `mode: "live"`.
2. **Design images** — add `AI_API_KEY` + `AI_IMAGE_ENDPOINT`. `src/convex/designStudio.ts` already POSTs the prompt and returns `{ imageUrl, mode: "model" }`; the studio then renders the returned image instead of the SVG.
3. **Razorpay** — add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`. `src/convex/payments.ts` creates a real order via the Razorpay REST API and verifies the signature with HMAC-SHA256. The checkout UI keeps the same flow; a "Demo Payment Mode" banner disappears automatically.
4. **Real retention model** — replace the internals of `predictAnalysis()` in `src/convex/analysis.ts` (same input/output shape) with a trained model or a lab API.

---

## Testing checklist

- [ ] `bun convex dev --once` passes (backend + codegen)
- [ ] `bun tsc -b --noEmit` passes
- [ ] `bun lint` passes
- [ ] Guest sign-in → every page renders, no console errors
- [ ] Fabric Analysis: upload a JPG/PNG, pick fabric/dye/pattern/washes, results + wash chart appear; bad file shows "Unable to process image…"
- [ ] Assistant (floating + `/assistant`): ask "Which natural dye is best for cotton?", then after an analysis "Explain my analysis result"
- [ ] Design Studio: generate → download → regenerate → variation → save → appears in Saved Designs
- [ ] History: view / delete / download report; Reports: printable + disclaimer
- [ ] Pricing → Checkout (PRO) → Demo Payment success screen with disclaimer
- [ ] Mobile viewport: no horizontal scroll
- [ ] Supply-chain pages still work (Orders, Security Center tamper demo, Verify)
