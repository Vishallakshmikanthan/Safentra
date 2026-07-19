# Safentra — Compound Risk Detection for Modern Industry
### A Complete Build, Implementation & Winning Strategy Guide

> *"No single alarm fires. That's the point. Safentra listens for the silence between alarms."*

---

## 0. What This Guide Adds Beyond the Original Concept

This guide is built on top of an industrial compound-risk platform concept (originally scoped as "SENTINEL"), rebranded here as **Safentra**, with a set of substantive additions designed specifically to push it from "good hackathon demo" to "hard to beat." If you're short on time, read this section first — it's the differentiator layer judges will remember.

| # | Addition | Why it matters for judging |
|---|---|---|
| 1 | **FORGE — Pattern Discovery Agent** (6th agent) | Every other team hardcodes rules. Safentra uses Claude to *read* free-text near-miss reports and *propose new compound-risk patterns*, closing the loop between human observation and machine detection. This is your "wow" moment — it demonstrates the platform *learns*, not just *matches*. |
| 2 | **Temporal Risk Smoothing (Confidence Ramp)** | Real pattern matchers that snap from 0% to 94% in one tick look like a demo trick. Safentra ramps risk scores using exponential smoothing with a confirmation window, which is both more realistic and prevents false-positive flapping — a detail judges with engineering backgrounds will notice. |
| 3 | **Safety Debt Score** | A zone-level, time-integrated metric (not just instantaneous risk) that answers "how much accumulated risk has this zone carried this shift?" — gives you a second, non-obvious KPI to show on the dashboard. |
| 4 | **QR Field Checkpoint (SHIELD Mobile)** | Extends permit intelligence from the office desk to the factory floor — a worker scans a zone QR code before physically entering, and SHIELD answers in real time. This turns SHIELD from "paperwork gate" into "life-saving gate," which is a much stronger pitch. |
| 5 | **Hash-Chained Audit Ledger** | Every risk event, permit decision, and BLAZE trigger is appended to a tamper-evident hash chain (like a lightweight blockchain, no external infra needed) — this directly answers regulator and enterprise-buyer questions about evidentiary integrity, which most hackathon teams never think to address. |
| 6 | **Chaos / War-Room Mode** | A scenario builder so judges (or you) can construct a *novel* compound pattern live, on stage, that isn't the pre-scripted Vizag replay — this proves the system isn't just a scripted demo. |
| 7 | **Voice-Announced Critical Alerts** | Uses the browser's built-in Web Speech API (zero dependencies, works offline) so that when a Pattern-12-class event fires, the control room dashboard *speaks* the alert out loud — strong sensory impact during a live demo. |
| 8 | **Judging-Criteria Alignment Table** | A section mapping every feature to standard hackathon judging axes (Innovation, Technical Depth, Impact, Feasibility, Presentation) so your pitch deck writes itself. |
| 9 | **Compliance & Multi-Plant Configurability** | A JSON-schema-driven plant configurator so Safentra isn't hardcoded to one coke-oven layout — you can demo "onboard a new plant in 90 seconds," which signals product thinking, not just prototype thinking. |
| 10 | **Roadmap Section** | A believable path from hackathon prototype to real deployment (OPC-UA/MQTT ingestion, RBAC, SaaS multi-tenancy) — judges reward teams who show they understand the gap between demo and production. |

Everything below is organized as a sequential, step-by-step build plan. Sections marked **★ NEW** are original additions not present in the base concept; everything else is the renamed and refined core platform.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why Safentra Wins — Problem Framing](#2-why-safentra-wins--problem-framing)
3. [Repository Structure](#3-repository-structure)
4. [Tech Stack — Exact Versions](#4-tech-stack--exact-versions)
5. [Phase 0 — Environment Setup](#phase-0--environment-setup)
6. [Phase 1 — Knowledge Graph Engine (ARGUS Core)](#phase-1--knowledge-graph-engine-argus-core)
7. [Phase 2 — Temporal Risk Smoothing ★ NEW](#phase-2--temporal-risk-smoothing-★-new)
8. [Phase 3 — WebSocket State Server](#phase-3--websocket-state-server)
9. [Phase 4 — Simulation Engine](#phase-4--simulation-engine)
10. [Phase 5 — ATLAS Plant Heatmap UI](#phase-5--atlas-plant-heatmap-ui)
11. [Phase 6 — ORACLE RAG Agent](#phase-6--oracle-rag-agent)
12. [Phase 7 — SHIELD Permit Intelligence + Mobile QR Checkpoint ★ NEW](#phase-7--shield-permit-intelligence--mobile-qr-checkpoint-★-new)
13. [Phase 8 — BLAZE Emergency Orchestrator](#phase-8--blaze-emergency-orchestrator)
14. [Phase 9 — FORGE: Pattern Discovery Agent ★ NEW](#phase-9--forge-pattern-discovery-agent-★-new)
15. [Phase 10 — Safety Debt Score ★ NEW](#phase-10--safety-debt-score-★-new)
16. [Phase 11 — Hash-Chained Audit Ledger ★ NEW](#phase-11--hash-chained-audit-ledger-★-new)
17. [Phase 12 — Command Centre Dashboard](#phase-12--command-centre-dashboard)
18. [Phase 13 — Chaos / War-Room Mode ★ NEW](#phase-13--chaos--war-room-mode-★-new)
19. [Phase 14 — Multi-Plant Configurator ★ NEW](#phase-14--multi-plant-configurator-★-new)
20. [Phase 15 — Demo Scenario Engineering](#phase-15--demo-scenario-engineering)
21. [Phase 16 — Deployment](#phase-16--deployment)
22. [The 13 Compound Risk Patterns](#the-13-compound-risk-patterns)
23. [RAG Corpus — What to Include](#rag-corpus--what-to-include)
24. [AI Agent Prompting Guide](#ai-agent-prompting-guide)
25. [Judging-Criteria Alignment](#judging-criteria-alignment)
26. [Demo Script — 5 Minutes That Win](#demo-script--5-minutes-that-win)
27. [Hackathon Day Checklist](#hackathon-day-checklist)
28. [Roadmap Beyond the Hackathon](#roadmap-beyond-the-hackathon)

---

## 1. Project Overview

### What Safentra is

Safentra is an AI-powered industrial safety intelligence platform that detects **compound risk** — dangerous combinations of conditions across multiple sensors, permits, workers, and equipment states that no single alarm would ever catch alone.

The core novelty: instead of threshold-based single-sensor monitoring, Safentra models the plant as a **live knowledge graph** and continuously runs **causal subgraph matching** to find dangerous patterns encoded from real incident investigations — including the Vizag Steel Plant explosion (January 2025, 8 fatalities, all four precursor signals present, none connected by any existing system).

Safentra goes one step further than a static rule engine: it **learns**. When a safety officer files a near-miss report, the FORGE agent reads it, compares it against the existing pattern library, and proposes a *new* candidate compound-risk pattern for human approval — meaning the system's detection library grows every time the plant almost has an accident, not just after it has one.

### What you are building

```
safentra/
├── apps/
│   ├── server/          Node.js WebSocket + REST API
│   ├── web/              React frontend (command centre dashboard)
│   └── mobile-checkpoint/  Lightweight PWA for SHIELD QR field checks
├── packages/
│   ├── graph-engine/     TypeScript knowledge graph + pattern matcher (ARGUS)
│   ├── simulation/       JSON-driven plant state simulator
│   ├── ledger/           Hash-chained audit trail (★ NEW)
│   └── types/            Shared TypeScript types across packages
└── data/
    ├── corpus/           RAG documents (OISD, Factory Act, incident reports)
    ├── plant-configs/    JSON plant layouts (multi-plant support) (★ NEW)
    └── scenarios/        Vizag replay timeline + chaos scenario templates
```

### The six agents

| Agent | What it does | Tech |
|---|---|---|
| **ARGUS** | Compound risk engine — graph pattern matching + temporal smoothing | TypeScript, in-memory graph |
| **ATLAS** | Live plant heatmap with workers and risk zones | React, D3.js, SVG |
| **ORACLE** | RAG incident intelligence — cites regulations | Anthropic API + keyword retrieval |
| **SHIELD** | Permit-to-work intercept + mobile QR field checkpoint | React form + PWA + ARGUS query |
| **BLAZE** | Emergency response orchestrator — evacuation + DGFASLI reporting | Anthropic API, auto-report |
| **FORGE** ★ NEW | Pattern discovery — turns near-miss text reports into candidate detection rules | Anthropic API, structured extraction |

---

## 2. Why Safentra Wins — Problem Framing

Most industrial safety software is **reactive and single-variable**: a gas sensor crosses a threshold, an alarm sounds. This is how nearly every real plant operates today, and it is precisely why compound incidents like Vizag (2025), Bhilai (2019), and the HPCL Mumbai fire (2009) happened — in every case, *every individual reading was within its own "acceptable" range*. The danger only existed in the **combination**.

Judges respond to problems that are:
1. **Real and documented** — cite actual incident investigations, not hypotheticals.
2. **Structurally distinct from existing tooling** — Safentra's pitch isn't "better dashboards," it's "a fundamentally different detection primitive" (graph pattern matching over a live knowledge graph vs. threshold alarms).
3. **Provably learning, not just rule-following** — the FORGE agent is the single feature most likely to separate you from every other "AI dashboard" submission.
4. **Deployable, not just demoable** — the multi-plant configurator and audit ledger show you thought about what happens after the hackathon ends.

Use this framing directly in your pitch: *"Every plant already has sensors. What's missing isn't more data — it's a system that understands when normal readings, in combination, mean something abnormal is about to happen."*

---

## 3. Repository Structure

Create this exact folder structure. Every AI coding agent you use should receive this structure upfront as context.

```
safentra/
│
├── apps/
│   │
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.ts                  Entry point, Express + WS server
│   │   │   ├── graph/
│   │   │   │   ├── PlantGraph.ts         Knowledge graph class
│   │   │   │   ├── PatternMatcher.ts     13 compound risk patterns
│   │   │   │   ├── RiskScorer.ts         0-1 zone risk score, temporal smoothing
│   │   │   │   └── SafetyDebt.ts         Time-integrated risk accumulation (★ NEW)
│   │   │   ├── agents/
│   │   │   │   ├── oracle.ts             RAG agent (Anthropic API)
│   │   │   │   ├── blaze.ts              Emergency orchestrator (Anthropic API)
│   │   │   │   └── forge.ts              Pattern discovery agent (★ NEW, Anthropic API)
│   │   │   ├── ledger/
│   │   │   │   └── HashChain.ts          Tamper-evident audit trail (★ NEW)
│   │   │   ├── simulation/
│   │   │   │   ├── SimulationEngine.ts   Timeline event player
│   │   │   │   ├── ChaosEngine.ts        Custom scenario builder (★ NEW)
│   │   │   │   └── scenarios/
│   │   │   │       └── vizag.json        The demo scenario
│   │   │   ├── routes/
│   │   │   │   ├── permits.ts            POST /permits (SHIELD)
│   │   │   │   ├── checkpoint.ts         POST /checkpoint/scan (SHIELD mobile) (★ NEW)
│   │   │   │   ├── simulation.ts         POST /simulation/start|pause|reset
│   │   │   │   ├── chaos.ts              POST /chaos/inject (★ NEW)
│   │   │   │   ├── oracle.ts             POST /oracle/query
│   │   │   │   ├── forge.ts              POST /forge/submit-near-miss (★ NEW)
│   │   │   │   └── ledger.ts             GET /ledger/verify (★ NEW)
│   │   │   └── websocket/
│   │   │       └── StateEmitter.ts       Pushes graph state to frontend
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── CommandCentre/
│   │   │   │   │   ├── CommandCentre.tsx
│   │   │   │   │   ├── RiskTimeline.tsx
│   │   │   │   │   ├── SafetyDebtPanel.tsx    (★ NEW)
│   │   │   │   │   └── AlertFeed.tsx
│   │   │   │   ├── Atlas/
│   │   │   │   │   ├── PlantMap.tsx
│   │   │   │   │   ├── ZonePolygon.tsx
│   │   │   │   │   └── WorkerDot.tsx
│   │   │   │   ├── Shield/
│   │   │   │   │   ├── PermitForm.tsx
│   │   │   │   │   └── PermitValidator.tsx
│   │   │   │   ├── Oracle/
│   │   │   │   │   ├── OraclePanel.tsx
│   │   │   │   │   └── OracleResponse.tsx
│   │   │   │   ├── Blaze/
│   │   │   │   │   ├── BlazePanel.tsx
│   │   │   │   │   └── IncidentReport.tsx
│   │   │   │   ├── Forge/                     (★ NEW)
│   │   │   │   │   ├── NearMissSubmit.tsx
│   │   │   │   │   └── CandidatePatternReview.tsx
│   │   │   │   └── Chaos/                     (★ NEW)
│   │   │   │       └── ChaosBuilder.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   ├── usePlantState.ts
│   │   │   │   └── useVoiceAlerts.ts           (★ NEW)
│   │   │   ├── store/
│   │   │   │   └── plantStore.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile-checkpoint/                       (★ NEW)
│       ├── src/
│       │   ├── App.tsx                          QR scan → SHIELD check UI
│       │   └── useCamera.ts
│       ├── index.html
│       └── package.json
│
├── data/
│   ├── corpus/
│   │   ├── oisd-169-summary.md
│   │   ├── oisd-105-summary.md
│   │   ├── factory-act-sections.md
│   │   ├── dgfasli-guidelines.md
│   │   ├── incident-vizag-2025.md
│   │   ├── incident-bhilai-2019.md
│   │   ├── incident-hpcl-2009.md
│   │   └── [15 more synthetic incident reports]
│   │
│   ├── plant-configs/                            (★ NEW)
│   │   ├── coke-oven-plant.json
│   │   └── schema.json                           JSON Schema for onboarding new plants
│   │
│   └── scenarios/
│       ├── vizag.json
│       └── chaos-templates.json                  (★ NEW)
│
├── package.json           (workspace root)
└── README.md
```

---

## 4. Tech Stack — Exact Versions

### Frontend (apps/web)
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.4.0",
  "vite": "^5.2.0",
  "tailwindcss": "^3.4.0",
  "d3": "^7.9.0",
  "@types/d3": "^7.4.3",
  "recharts": "^2.12.0",
  "zustand": "^4.5.0",
  "clsx": "^2.1.0",
  "date-fns": "^3.6.0"
}
```

### Mobile checkpoint (apps/mobile-checkpoint) ★ NEW
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "vite": "^5.2.0",
  "html5-qrcode": "^2.3.8",
  "tailwindcss": "^3.4.0"
}
```
`html5-qrcode` runs entirely client-side using the device camera — no external QR-scanning service required, which keeps the "zero external dependency" story intact.

### Backend (apps/server)
```json
{
  "express": "^4.19.0",
  "@types/express": "^4.17.21",
  "ws": "^8.17.0",
  "@types/ws": "^8.5.10",
  "@anthropic-ai/sdk": "^0.24.0",
  "cors": "^2.8.5",
  "dotenv": "^16.4.0",
  "uuid": "^9.0.1",
  "typescript": "^5.4.0",
  "tsx": "^4.7.0",
  "nodemon": "^3.1.0"
}
```

### No database. No Pinecone. No external vector store.
All graph state is in-memory TypeScript objects. Vector search for RAG is keyword-frequency retrieval over pre-loaded documents. The hash-chained ledger (Phase 11) uses Node's built-in `crypto` module — no blockchain infrastructure needed. The entire system runs with **zero external service dependencies beyond the Anthropic API**, which is a strong "we built the hard part, not the plumbing" story for judges.

---

## Phase 0 — Environment Setup

### Step 0.1 — Initialize monorepo

```bash
mkdir safentra && cd safentra
npm init -y
```

Edit root `package.json`:
```json
{
  "name": "safentra",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=apps/server\" \"npm run dev --workspace=apps/web\"",
    "dev:mobile": "npm run dev --workspace=apps/mobile-checkpoint",
    "build": "npm run build --workspace=apps/server && npm run build --workspace=apps/web"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### Step 0.2 — Create server app

```bash
mkdir -p apps/server/src/{graph,agents,ledger,simulation/scenarios,routes,websocket}
cd apps/server
npm init -y
npm install express ws @anthropic-ai/sdk cors dotenv uuid
npm install -D typescript tsx nodemon @types/express @types/ws @types/node
```

Create `apps/server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

Create `apps/server/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc"
  }
}
```

### Step 0.3 — Create web app

```bash
cd ../..
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm install d3 @types/d3 recharts zustand clsx date-fns tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 0.4 — Create mobile checkpoint app ★ NEW

```bash
cd ../..
npm create vite@latest apps/mobile-checkpoint -- --template react-ts
cd apps/mobile-checkpoint
npm install html5-qrcode tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 0.5 — Environment file

Create `apps/server/.env`:
```
ANTHROPIC_API_KEY=your_key_here
PORT=3001
WS_PORT=3002
NODE_ENV=development
```

### Step 0.6 — Create data directories

```bash
mkdir -p data/corpus data/plant-configs data/scenarios
```

---

## Phase 1 — Knowledge Graph Engine (ARGUS Core)

This is the heart of Safentra. Build this first. Everything else reads from it.

### Step 1.1 — Define all shared types

Create `apps/server/src/types/index.ts`:

```typescript
export type ZoneType = 'coke_oven' | 'gas_holder' | 'maintenance_bay' | 'control_room' | 'entry_point' | 'conveyor';
export type SensorType = 'gas_pressure' | 'h2s_concentration' | 'co_concentration' | 'temperature' | 'oxygen_level';
export type PermitType = 'hot_work' | 'confined_space_entry' | 'electrical_isolation' | 'height_work' | 'excavation';
export type WorkerStatus = 'active' | 'in_confined_space' | 'evacuating' | 'safe';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  adjacentZones: string[];
  hazardClass: 'A' | 'B' | 'C';
  polygon: [number, number][];
  riskScore: number;              // smoothed, 0-1 (see Phase 2)
  rawRiskScore: number;           // ★ NEW — unsmoothed instantaneous score
  safetyDebt: number;             // ★ NEW — time-integrated accumulated risk
  activeWorkers: string[];
  activePermits: string[];
  sensors: string[];
}

export interface Sensor {
  id: string;
  zoneId: string;
  type: SensorType;
  currentValue: number;
  unit: string;
  normalRange: [number, number];
  alarmThreshold: number;
  status: 'normal' | 'elevated' | 'alarm' | 'offline';
  lastUpdated: Date;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  currentZoneId: string;
  status: WorkerStatus;
  position: { x: number; y: number };
  shift: 'incoming' | 'outgoing' | 'on_shift';
}

export interface Permit {
  id: string;
  type: PermitType;
  zoneId: string;
  requestedBy: string;
  validFrom: Date;
  validUntil: Date;
  status: 'pending' | 'active' | 'blocked' | 'completed' | 'revoked';
  blockedReason?: string;
  regulatoryRef?: string;
}

export interface Equipment {
  id: string;
  name: string;
  zoneId: string;
  status: 'operational' | 'maintenance' | 'shutdown' | 'fault';
  lastMaintenance: Date;
  maintenanceWindowActive: boolean;
}

export interface PlantState {
  zones: Map<string, Zone>;
  sensors: Map<string, Sensor>;
  workers: Map<string, Worker>;
  permits: Map<string, Permit>;
  equipment: Map<string, Equipment>;
  shiftChangeover: boolean;
  timestamp: Date;
}

export interface RiskEvent {
  id: string;
  timestamp: Date;
  zoneId: string;
  riskScore: number;
  patternMatched: string;
  patternDescription: string;
  contributingFactors: string[];
  recommendedAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confirmationTicks?: number;     // ★ NEW — how many consecutive ticks this pattern has held
}

export interface WebSocketMessage {
  type: 'state_update' | 'risk_event' | 'permit_blocked' | 'blaze_triggered'
      | 'oracle_response' | 'simulation_status' | 'forge_candidate' | 'ledger_entry';
  payload: unknown;
  timestamp: string;
}
```

### Step 1.2 — Build the PlantGraph class

Create `apps/server/src/graph/PlantGraph.ts` (unchanged in structure from the base concept — a plain in-memory graph of `Map`s for zones, sensors, workers, permits, and equipment, with mutation methods `updateSensor`, `addWorker`, `moveWorker`, `addPermit`, `blockPermit`, `setShiftChangeover`, and read methods `getZone`, `getSensorsByZone`, `getWorkersByZone`, `getActivePermitsByZone`, `getAdjacentZones`, and `toSerializable()` for WebSocket broadcast). Load zone/sensor seed data from `data/plant-configs/coke-oven-plant.json` (see Phase 14) rather than hardcoding it in the class, so the same code works for any plant layout you load.

Key implementation detail: every `Zone` now also tracks `rawRiskScore` and `safetyDebt` in addition to the smoothed `riskScore` — populate these fields when you port the class over from the type definitions above.

### Step 1.3 — Build the Pattern Matcher

Create `apps/server/src/graph/PatternMatcher.ts`. This class holds the 13 compound risk patterns (see the [full reference table](#the-13-compound-risk-patterns)). Each pattern is a private method that reads the graph and returns a `PatternResult`:

```typescript
export interface PatternResult {
  matched: boolean;
  score: number;
  description: string;
  factors: string[];
  action: string;
  regulatoryRef: string;
}
```

`evaluateAll()` walks every zone and calls `evaluateZone(zoneId)`, which runs all 13 pattern methods, aggregates matched results with **compound scoring** (`baseScore = max(matched scores)`, `boost = min(0.3, (matchedCount - 1) * 0.08)`), and returns a `RiskEvent` for the highest-scoring pattern. Patterns 1–11 encode individual documented failure modes (hot work near gas elevation, confined entry during abnormal readings, oxygen depletion, gas propagation, etc.). **Pattern 12 is the Vizag pattern** — the four-condition convergence that caused the January 2025 fatalities. **Pattern 13 is reserved for FORGE-discovered patterns** (see Phase 9) — it starts empty and is populated live during your demo.

Port the eleven documented patterns and the Vizag pattern directly from the original specification (gas-elevation-below-alarm-threshold + shift-changeover + hot-work-nearby + confined-space-entry, scoring 0.94) — these do not need modification. Your job in this phase is to get `evaluateAll()` returning correct `RiskEvent[]` output against seeded test data before moving on.

---

## Phase 2 — Temporal Risk Smoothing ★ NEW

**Problem this solves:** in the base design, `riskScore` jumps instantly from near-zero to 0.94 the moment all four Vizag conditions become simultaneously true in a single tick. That's fine for a scripted demo, but it's also exactly the kind of thing a skeptical judge will call out as "just an if-statement with a big number." Real safety systems need **confirmation** — a pattern that flickers for one tick and disappears shouldn't trigger a full evacuation order.

### Step 2.1 — Exponential smoothing with confirmation window

Create `apps/server/src/graph/RiskScorer.ts`:

```typescript
interface SmoothingState {
  smoothedScore: number;
  consecutiveTicks: number;
  lastPatternId: string | null;
}

const ALPHA = 0.35;              // smoothing factor — higher = faster response
const CONFIRMATION_TICKS = 3;    // pattern must hold for 3 ticks before full severity applies

export class RiskScorer {
  private zoneState = new Map<string, SmoothingState>();

  update(zoneId: string, rawScore: number, patternId: string | null): { smoothed: number; confirmed: boolean; ticks: number } {
    const prev = this.zoneState.get(zoneId) ?? { smoothedScore: 0, consecutiveTicks: 0, lastPatternId: null };

    // Exponential moving average toward the new raw score
    const smoothed = prev.smoothedScore + ALPHA * (rawScore - prev.smoothedScore);

    // Track how many consecutive ticks the SAME pattern has been active
    const ticks = patternId && patternId === prev.lastPatternId ? prev.consecutiveTicks + 1 : (patternId ? 1 : 0);

    const next: SmoothingState = { smoothedScore: smoothed, consecutiveTicks: ticks, lastPatternId: patternId };
    this.zoneState.set(zoneId, next);

    return { smoothed, confirmed: ticks >= CONFIRMATION_TICKS, ticks };
  }

  reset(zoneId: string) {
    this.zoneState.delete(zoneId);
  }
}
```

### Step 2.2 — Wire it into PatternMatcher

In `PatternMatcher.evaluateZone()`, after computing `finalScore` and the top pattern, pass both through the scorer before constructing the `RiskEvent`:

```typescript
const { smoothed, confirmed, ticks } = this.riskScorer.update(zoneId, finalScore, topPattern.description);
this.graph.updateZoneRiskScore(zoneId, smoothed);          // this is what ATLAS renders
// severity uses `smoothed`, not the raw finalScore, and only reaches "critical"
// once `confirmed` is true — this is what makes the red pulse feel earned, not instant
const severity = !confirmed ? 'medium' : smoothed >= 0.85 ? 'critical' : smoothed >= 0.6 ? 'high' : 'low';
```

Practically, this means during your demo the Vizag pattern will visibly **ramp** over ~3 ticks (1.5 seconds at your 500ms tick rate) rather than snapping instantly — which reads as more credible on stage and is also, genuinely, better engineering.

---

## Phase 3 — WebSocket State Server

Create `apps/server/src/index.ts`. This is the composition root: it instantiates `PlantGraph`, `PatternMatcher`, `RiskScorer`, `OracleAgent`, `BlazeAgent`, `ForgeAgent` (Phase 9), `HashChain` (Phase 11), and `SimulationEngine`, opens a `WebSocketServer` on `WS_PORT`, and runs a broadcast loop on a **500ms tick** (not 1000ms — the faster tick is what makes the temporal smoothing from Phase 2 feel responsive rather than sluggish):

```typescript
setInterval(() => {
  const events = patternMatcher.evaluateAll();
  safetyDebtTracker.accumulate(plantGraph.getState());   // ★ NEW, see Phase 10

  broadcastToAll({
    type: 'state_update',
    payload: { ...plantGraph.toSerializable(), riskEvents: events },
    timestamp: new Date().toISOString()
  });

  const criticalEvent = events.find(e => e.severity === 'critical');
  if (criticalEvent) {
    ledger.append({ type: 'risk_event', data: criticalEvent });   // ★ NEW, see Phase 11
    broadcastToAll({ type: 'risk_event', payload: criticalEvent, timestamp: new Date().toISOString() });
    blaze.trigger(criticalEvent);   // fire-and-forget; result broadcasts separately when ready
  }
}, 500);
```

Mount routers: `/permits`, `/checkpoint` (★ NEW), `/simulation`, `/chaos` (★ NEW), `/oracle`, `/forge` (★ NEW), `/ledger` (★ NEW).

The permits route (SHIELD's backend) adds a pending permit, immediately evaluates the zone, and blocks the permit with a cited reason if a high/critical pattern is active — this logic is unchanged from the base design and should be ported as-is.

---

## Phase 4 — Simulation Engine

Create `apps/server/src/simulation/SimulationEngine.ts`. It loads a JSON timeline of `SimulationEvent`s (`sensor_update`, `worker_enter`, `worker_move`, `permit_request`, `shift_changeover`, `worker_confined`), and on `start()` runs a 500ms tick loop that applies every event whose `timeOffsetSeconds` has elapsed, broadcasting a `simulation_status` message for each. `pause()`, `reset()`, and `getStatus()` round out the control surface exposed via `/simulation/*`.

Build the exact Vizag timeline (12 events, T+0 to T+40s) as specified in [Phase 15](#phase-15--demo-scenario-engineering) — this is your scripted demo path. Keep a **built-in fallback scenario** in code (not just the JSON file) so a missing-file error never breaks your live demo.

---

## Phase 5 — ATLAS Plant Heatmap UI

Build `apps/web/src/store/plantStore.ts` (Zustand store holding `zones`, `sensors`, `workers`, `permits`, `riskEvents`, `alerts`, `shiftChangeover`, `simulationStatus`, `connected`), `apps/web/src/hooks/useWebSocket.ts` (connects to `WS_URL`, auto-reconnects every 3s on close, dispatches incoming messages into the store), and `apps/web/src/components/Atlas/PlantMap.tsx` (D3.js SVG rendering zone polygons colored by `riskColor(zone.riskScore)`, worker dots colored by status, sensor-alarm indicator badges, and a pulsing ring animation on any zone with `riskScore >= 0.85`).

Color scale (kept from the base design, it reads well under stage lighting):

```typescript
function riskColor(score: number): string {
  if (score < 0.2) return '#1D9E75';   // teal — safe
  if (score < 0.4) return '#639922';   // green — low
  if (score < 0.6) return '#EF9F27';   // amber — medium
  if (score < 0.8) return '#D85A30';   // coral — high
  return '#E24B4A';                      // red — critical
}
```

### ★ NEW — Step 5.1: Voice-announced critical alerts

Create `apps/web/src/hooks/useVoiceAlerts.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { usePlantStore } from '../store/plantStore';

export function useVoiceAlerts() {
  const lastAnnounced = useRef<string | null>(null);
  const alerts = usePlantStore(s => s.alerts);

  useEffect(() => {
    const latest = alerts[0];
    if (!latest || latest.severity !== 'critical' || latest.id === lastAnnounced.current) return;
    lastAnnounced.current = latest.id;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Critical alert. ${latest.message.replace(/\[.*?\]/g, '')}`
      );
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [alerts]);
}
```

Call `useVoiceAlerts()` once at the top of `App.tsx`. This uses the browser's native `SpeechSynthesis` API — zero dependencies, works fully offline, and gives your live demo an audible "the room goes quiet" moment when Pattern 12/13 fires.

---

## Phase 6 — ORACLE RAG Agent

Create `apps/server/src/agents/oracle.ts`. On startup, `initCorpus()` reads every `.md` file from `data/corpus/` into an in-memory `Document[]` array (with a built-in fallback corpus hardcoded in the class if the directory is missing — never let a missing file break your ORACLE demo).

`query(question, plantContext)` retrieves the top 3 relevant documents using simple keyword-frequency scoring (no embeddings, no vector database needed — this is a deliberate simplicity choice that removes an entire class of "why is my vector DB timing out" demo-day failure), then calls the Anthropic API:

```typescript
const response = await this.client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1000,
  messages: [{
    role: 'user',
    content: `You are ORACLE, the incident intelligence agent for Safentra Industrial Safety Platform.

You have access to the following regulatory documents and incident reports:
<corpus>${context}</corpus>

Current plant state:
<plant_state>${plantContext}</plant_state>

Question from safety officer: ${question}

Respond with: 1) Direct answer referencing the most relevant incident or regulation,
2) Specific regulatory clause, 3) Recommended immediate action,
4) Any similar historical incidents matching current conditions.
Keep under 200 words. Be specific and cite sources.`
  }]
});
```

Wire this to `POST /oracle/query` and a simple `OraclePanel.tsx` chat-style panel in the frontend.

---

## Phase 7 — SHIELD Permit Intelligence + Mobile QR Checkpoint ★ NEW

### Step 7.1 — Desktop permit form (base design, unchanged)

Build `apps/web/src/components/Shield/PermitForm.tsx`: a form for permit type, zone, requester, and validity window that `POST`s to `/permits`. The server adds the permit as pending, immediately evaluates the zone's risk, and if a high/critical pattern is active for a `hot_work` or `confined_space_entry` request, blocks it and returns the matched pattern, contributing factors, recommended action, and regulatory citation — which the UI renders as a red "SHIELD — PERMIT BLOCKED" card.

### Step 7.2 — Why a desktop form alone isn't enough

The desktop permit form protects the *paperwork* — but the actual moment of highest risk is when a worker physically steps into a zone, which can happen minutes or hours after a permit was issued, by which point plant conditions may have changed. A permit approved at 6:00am doesn't know that gas pressure started rising at 6:40am.

### Step 7.3 — Build the mobile checkpoint PWA

Create `apps/mobile-checkpoint/src/App.tsx` — a single-screen app that:
1. Opens the device camera via `html5-qrcode` and scans a zone-identifying QR code posted at the physical entry point of each zone (e.g. `safentra://checkpoint/C4`).
2. On scan, calls `POST /checkpoint/scan` with `{ zoneId, workerId }`.
3. Displays a large, unmistakable **green "CLEAR TO ENTER"** or **red "ENTRY BLOCKED"** screen with the specific reason, styled for readability in bright industrial lighting (large text, high contrast, no scrolling required).

```tsx
async function handleScan(decodedText: string) {
  const zoneId = decodedText.split('/').pop();
  const res = await fetch(`${API_URL}/checkpoint/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId, workerId: currentWorkerId })
  });
  const data = await res.json();
  setResult(data); // { cleared: boolean, riskScore: number, reason?: string, action?: string }
}
```

### Step 7.4 — Server route

Create `apps/server/src/routes/checkpoint.ts`:

```typescript
import { Router } from 'express';
import { plantGraph, ledger } from '../index.js';

export const checkpointRouter = Router();

checkpointRouter.post('/scan', (req, res) => {
  const { zoneId, workerId } = req.body;
  const zone = plantGraph.getZone(zoneId);
  if (!zone) return res.status(404).json({ cleared: false, reason: 'Unknown zone' });

  const cleared = zone.riskScore < 0.6;
  ledger.append({ type: 'checkpoint_scan', data: { zoneId, workerId, cleared, riskScore: zone.riskScore } });

  res.json({
    cleared,
    riskScore: zone.riskScore,
    reason: cleared ? undefined : `Zone risk score ${Math.round(zone.riskScore * 100)}% — entry restricted`,
    action: cleared ? undefined : 'Report to shift supervisor before entry. Do not proceed.'
  });
});
```

This is the feature to lead with when a judge asks "how does this actually prevent an accident, not just detect one after the fact" — the answer is literally: *the worker's phone tells them not to walk through the door.*

---

## Phase 8 — BLAZE Emergency Orchestrator

Create `apps/server/src/agents/blaze.ts`. `trigger(riskEvent)` snapshots all sensor readings, active permits, and worker positions from `PlantGraph` at T=0, then calls the Anthropic API requesting a JSON-structured DGFASLI-format preliminary incident response package: `evacuationSequence`, `alertMessages`, and `incidentReport`. Parse defensively (strip markdown fences, fall back to a hardcoded minimal response if JSON parsing fails — **never let an LLM formatting hiccup break your emergency response demo**).

```typescript
const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
const cleaned = text.replace(/```json|```/g, '').trim();
let parsed: Partial<BlazeResponse>;
try { parsed = JSON.parse(cleaned); }
catch {
  parsed = {
    evacuationSequence: [{ zone: riskEvent.zoneId, priority: 1, instruction: 'Evacuate immediately via nearest safe exit' }],
    alertMessages: [{ role: 'Safety Officer', message: `CRITICAL risk in Zone ${riskEvent.zoneId}. Initiate emergency protocol.` }],
    incidentReport: `PRELIMINARY INCIDENT REPORT\nZone: ${riskEvent.zoneId}\nHazard: ${riskEvent.patternMatched}`
  };
}
```

Append the returned `BlazeResponse` (plus `evidenceSnapshot` and `timestamp`) to the hash-chained ledger (Phase 11) — this is what makes BLAZE's output legally credible rather than just a nice-looking card in your UI.

---

## Phase 9 — FORGE: Pattern Discovery Agent ★ NEW

This is the single feature most likely to differentiate Safentra from every other "AI safety dashboard" at the hackathon. The other five agents all **apply** knowledge that was manually encoded by you before the hackathon. FORGE **generates new knowledge** from unstructured human input, live.

### The idea

Safety officers routinely file **near-miss reports** — free-text descriptions of situations that almost went wrong but didn't. Today, these reports sit in a filing cabinet or a spreadsheet and are rarely converted into systematic detection rules. FORGE reads a near-miss report, compares it against the existing 12/13 patterns, and if it identifies a *distinct* compound condition not already covered, proposes a **candidate Pattern 13** — complete with a structured condition definition, a plain-English description, and a proposed regulatory citation — for a human safety officer to review and approve before it goes live in ARGUS.

This demonstrates something no static rule engine can: **the detection library gets smarter every time someone reports a close call.**

### Step 9.1 — Server-side agent

Create `apps/server/src/agents/forge.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

export interface CandidatePattern {
  proposedName: string;
  conditions: string[];             // plain-English list of conditions that must co-occur
  suggestedScore: number;           // 0-1
  rationale: string;
  matchesExistingPattern: string | null;  // null if genuinely novel
  suggestedRegulatoryRef: string;
  confidence: 'low' | 'medium' | 'high';
}

export class ForgeAgent {
  private client: Anthropic;
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyzeNearMiss(reportText: string, existingPatternSummaries: string[]): Promise<CandidatePattern> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are FORGE, the pattern discovery agent for Safentra Industrial Safety Platform.

A safety officer has filed this near-miss report:
"""
${reportText}
"""

Safentra's ARGUS engine already detects these compound risk patterns:
${existingPatternSummaries.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Analyze the near-miss report and determine:
1. What combination of conditions (sensor states, permit types, worker states, shift status,
   equipment status) were present that, together, created risk.
2. Whether this combination is already covered by an existing pattern above, or is genuinely novel.
3. If novel, propose a new detection pattern.

Respond with ONLY valid JSON matching this shape, no other text:
{
  "proposedName": "short pattern name",
  "conditions": ["condition 1 in plain English", "condition 2", "..."],
  "suggestedScore": 0.0 to 1.0,
  "rationale": "why this combination is dangerous, 1-2 sentences",
  "matchesExistingPattern": "pattern name if it duplicates an existing one, otherwise null",
  "suggestedRegulatoryRef": "best-guess applicable OISD/Factory Act clause, or general safety principle if unsure",
  "confidence": "low, medium, or high"
}`
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return {
        proposedName: 'Unparsed candidate — manual review required',
        conditions: [reportText.slice(0, 200)],
        suggestedScore: 0.5,
        rationale: 'Automatic parsing failed; safety officer review required.',
        matchesExistingPattern: null,
        suggestedRegulatoryRef: 'Unknown',
        confidence: 'low'
      };
    }
  }
}
```

### Step 9.2 — Route

Create `apps/server/src/routes/forge.ts` exposing `POST /forge/submit-near-miss`, which calls `forge.analyzeNearMiss()`, broadcasts the result as a `forge_candidate` WebSocket message, and appends it to the ledger.

### Step 9.3 — Frontend review panel

Build `apps/web/src/components/Forge/NearMissSubmit.tsx` (a textarea + submit button — keep it dead simple, this is a demo not a full CMS) and `CandidatePatternReview.tsx`, which renders the returned `CandidatePattern` as a card with **Approve** / **Reject** buttons. Approving a candidate (for the hackathon, this can simply toggle a flag in memory — you don't need to actually hot-reload `PatternMatcher.ts`) visually "activates" Pattern 13 on the dashboard and in the pattern reference table.

### Step 9.4 — The demo moment this creates

During your pitch: submit a short, realistic near-miss report live (e.g. *"A contractor propped open the fire door between the maintenance bay and Battery 5 during a scheduled electrical isolation, while a forklift with a low battery indicator was operating nearby"*) and let FORGE propose a brand-new Pattern 13 on stage, in front of judges, from text they've never seen before. This is not scripted — it genuinely demonstrates generative reasoning over your domain model, which is a much stronger "AI" claim than "we called an LLM API in a RAG panel."

---

## Phase 10 — Safety Debt Score ★ NEW

**Problem this solves:** an instantaneous risk score answers "how dangerous is this zone *right now*," but not "has this zone been living dangerously all shift." A zone that spikes to 90% for two seconds and a zone that idles at 40% for six hours are very different management problems — the second is arguably worse, because it reflects a systemic condition rather than a moment.

### Step 10.1 — Time-integrated accumulator

Create `apps/server/src/graph/SafetyDebt.ts`:

```typescript
export class SafetyDebtTracker {
  private debt = new Map<string, number>();
  private readonly DECAY_PER_TICK = 0.998;  // slow decay so debt reflects sustained risk, not just spikes

  accumulate(state: { zones: Map<string, { id: string; riskScore: number }> }) {
    for (const [id, zone] of state.zones) {
      const prior = this.debt.get(id) ?? 0;
      // Debt grows proportional to how far above a "safe" baseline (0.2) the zone sits,
      // decays slowly when the zone is calm, so a single quiet moment doesn't erase a bad shift.
      const contribution = Math.max(0, zone.riskScore - 0.2) * 0.05;
      const next = Math.min(100, prior * this.DECAY_PER_TICK + contribution * 100);
      this.debt.set(id, next);
    }
  }

  get(zoneId: string): number {
    return this.debt.get(zoneId) ?? 0;
  }

  getAll(): Record<string, number> {
    return Object.fromEntries(this.debt);
  }

  resetShift() {
    this.debt.clear();
  }
}
```

Call `safetyDebtTracker.accumulate(plantGraph.getState())` inside the 500ms broadcast loop (Phase 3) and include `getAll()` in every `state_update` payload.

### Step 10.2 — Frontend panel

Build `apps/web/src/components/CommandCentre/SafetyDebtPanel.tsx`: a simple horizontal bar chart (Recharts) ranking zones by accumulated safety debt for the shift, refreshed live. Frame it in your pitch as: *"Risk score tells you what's happening now. Safety Debt tells you which zones need a root-cause review before next shift — even if nothing is red at this exact second."* This is a genuinely useful, non-obvious product idea that most teams won't think of, and it's cheap to build.

---

## Phase 11 — Hash-Chained Audit Ledger ★ NEW

**Problem this solves:** every serious industrial safety regulator (OISD, DGFASLI, DGMS) cares about **evidentiary integrity** after an incident — was the alert log tampered with after the fact? A plain database table of events answers "what happened" but not "can we prove this record wasn't altered." A lightweight hash chain answers both, with zero external infrastructure.

### Step 11.1 — The chain

Create `apps/server/src/ledger/HashChain.ts`:

```typescript
import { createHash } from 'crypto';

export interface LedgerEntry {
  index: number;
  timestamp: string;
  type: string;
  data: unknown;
  previousHash: string;
  hash: string;
}

export class HashChain {
  private chain: LedgerEntry[] = [];

  constructor() {
    // Genesis block
    this.chain.push({
      index: 0, timestamp: new Date().toISOString(), type: 'genesis',
      data: { message: 'Safentra audit ledger initialized' },
      previousHash: '0'.repeat(64),
      hash: this.computeHash(0, new Date().toISOString(), 'genesis', {}, '0'.repeat(64))
    });
  }

  private computeHash(index: number, timestamp: string, type: string, data: unknown, previousHash: string): string {
    const payload = JSON.stringify({ index, timestamp, type, data, previousHash });
    return createHash('sha256').update(payload).digest('hex');
  }

  append(entry: { type: string; data: unknown }): LedgerEntry {
    const previous = this.chain[this.chain.length - 1];
    const timestamp = new Date().toISOString();
    const index = this.chain.length;
    const hash = this.computeHash(index, timestamp, entry.type, entry.data, previous.hash);
    const block: LedgerEntry = { index, timestamp, type: entry.type, data: entry.data, previousHash: previous.hash, hash };
    this.chain.push(block);
    return block;
  }

  // Verify the entire chain has not been tampered with
  verify(): { valid: boolean; brokenAtIndex: number | null } {
    for (let i = 1; i < this.chain.length; i++) {
      const block = this.chain[i];
      const expectedHash = this.computeHash(block.index, block.timestamp, block.type, block.data, block.previousHash);
      if (expectedHash !== block.hash || block.previousHash !== this.chain[i - 1].hash) {
        return { valid: false, brokenAtIndex: i };
      }
    }
    return { valid: true, brokenAtIndex: null };
  }

  getAll(): LedgerEntry[] { return this.chain; }
  getRecent(n: number): LedgerEntry[] { return this.chain.slice(-n); }
}
```

### Step 11.2 — Route

Create `apps/server/src/routes/ledger.ts` exposing `GET /ledger/verify` (returns the tamper-check result) and `GET /ledger/recent?n=50`.

Append an entry every time: a critical `RiskEvent` fires, a permit is blocked, a checkpoint scan occurs, a FORGE candidate is generated, or BLAZE triggers. Every one of these is exactly the kind of event a post-incident investigation would need to reconstruct with confidence.

### Step 11.3 — The pitch line

*"Every alert, every blocked permit, every field checkpoint scan is written into a hash-chained ledger — the same tamper-evidence principle blockchains use, with none of the infrastructure overhead. If a regulator asks 'prove this log wasn't edited after the incident,' we can answer that question in one API call."* This single sentence answers a question judges with enterprise/compliance backgrounds are very likely to ask, and almost no other team will have an answer ready.

---

## Phase 12 — Command Centre Dashboard

Build `apps/web/src/App.tsx` as the root layout: header with connection status and shift-changeover indicator, a critical-risk banner that appears when any zone crosses 0.85, a four-metric row (zones monitored, workers on site, workers in confined space, sensors elevated), simulation controls, and a three-column body: `PlantMap` + active risk events (2 columns), and a right rail stacking the live `AlertFeed`, `SafetyDebtPanel` (★ NEW), `PermitForm`, `NearMissSubmit` (★ NEW), and sensor status list.

Call `useVoiceAlerts()` once near the top of the component (Phase 5, Step 5.1) so critical alerts are announced regardless of which panel is currently focused.

Keep the visual language from the base design — dark header, white cards, generous whitespace, muted borders (`border-gray-100`) — it reads as calm and professional even while displaying red alert states, which is the right tone for a *safety* product (panic-red UI everywhere would undercut the "we help you stay in control" positioning).

---

## Phase 13 — Chaos / War-Room Mode ★ NEW

**Problem this solves:** a pre-scripted Vizag replay is a great demo, but a sharp judge's obvious follow-up question is *"is this hardcoded to only detect that one scenario?"* Chaos Mode answers that live, on stage, with a scenario judges construct themselves.

### Step 13.1 — Chaos injection engine

Create `apps/server/src/simulation/ChaosEngine.ts`:

```typescript
import { PlantGraph } from '../graph/PlantGraph.js';

export interface ChaosInjection {
  sensorOverrides?: { sensorId: string; value: number }[];
  workerMoves?: { workerId: string; zoneId: string; status: string }[];
  shiftChangeover?: boolean;
  addPermit?: { type: string; zoneId: string; requestedBy: string };
}

export class ChaosEngine {
  constructor(private graph: PlantGraph) {}

  inject(scenario: ChaosInjection) {
    scenario.sensorOverrides?.forEach(s => this.graph.updateSensor(s.sensorId, s.value));
    scenario.workerMoves?.forEach(w =>
      this.graph.moveWorker(w.workerId, w.zoneId, { x: 100, y: 100 }, w.status as any)
    );
    if (scenario.shiftChangeover !== undefined) this.graph.setShiftChangeover(scenario.shiftChangeover);
    if (scenario.addPermit) {
      this.graph.addPermit({
        id: crypto.randomUUID(), type: scenario.addPermit.type as any, zoneId: scenario.addPermit.zoneId,
        requestedBy: scenario.addPermit.requestedBy, validFrom: new Date(),
        validUntil: new Date(Date.now() + 3600_000), status: 'active'
      });
    }
  }
}
```

### Step 13.2 — Route + minimal UI

Expose `POST /chaos/inject` accepting a `ChaosInjection` body. Build `apps/web/src/components/Chaos/ChaosBuilder.tsx`: a small form letting a presenter (or a judge, if you're feeling bold) toggle sensor values, move a worker into confined space, flip shift changeover, and add a permit — then hit "Inject" and watch ARGUS respond in real time, using the *same* pattern-matching pipeline as the scripted demo.

### Step 13.3 — The pitch line

*"This isn't a scripted animation — it's a live rules engine. Pick any combination of conditions right now, and watch ARGUS evaluate it in real time."* Offer to let a judge drive this for 30 seconds if your demo slot allows — very few teams will have something safe to hand over to a judge live.

---

## Phase 14 — Multi-Plant Configurator ★ NEW

**Problem this solves:** a hardcoded six-zone coke oven layout signals "prototype." A JSON-schema-driven configurator signals "product."

### Step 14.1 — JSON Schema for plant onboarding

Create `data/plant-configs/schema.json` describing the shape every plant config must satisfy (zones with id/name/type/hazardClass/adjacentZones/polygon/sensors, sensors with type/normalRange/alarmThreshold, etc.) — use standard JSON Schema Draft 7 so the shape is self-documenting and can validate uploads.

### Step 14.2 — Loader

Modify `PlantGraph`'s constructor to accept a plant config file path (defaulting to `coke-oven-plant.json`), validate it against `schema.json` using a lightweight validator (e.g. `ajv`), and populate zones/sensors from the file instead of hardcoded literals.

### Step 14.3 — The pitch line

*"Everything you've seen runs off a JSON config file — this isn't specific to one coke oven battery. Onboarding a new plant is uploading a layout file, not rewriting code."* Optionally, prepare a **second, smaller plant config** (e.g. a 3-zone chemical storage yard) and switch to it live to prove the claim — even a rough second layout with 3 zones is worth the build time for the credibility it buys.

---

## Phase 15 — Demo Scenario Engineering

### The exact Vizag scenario JSON

Create `apps/server/src/simulation/scenarios/vizag.json`:

```json
[
  { "timeOffsetSeconds": 0, "type": "sensor_update", "description": "All systems nominal — 6:47am", "payload": { "sensorId": "S-C4-GAS", "value": 1.01 } },
  { "timeOffsetSeconds": 2, "type": "sensor_update", "description": "C3 gas — nominal", "payload": { "sensorId": "S-C3-GAS", "value": 0.98 } },
  { "timeOffsetSeconds": 3, "type": "worker_enter", "description": "Rajan Kumar enters Zone C4", "payload": { "workerId": "W1", "name": "Rajan Kumar", "role": "Process Operator", "zoneId": "C4", "position": { "x": 145, "y": 120 } } },
  { "timeOffsetSeconds": 5, "type": "worker_enter", "description": "Suresh Patel enters Zone C4", "payload": { "workerId": "W2", "name": "Suresh Patel", "role": "Maintenance Technician", "zoneId": "C4", "position": { "x": 165, "y": 130 } } },
  { "timeOffsetSeconds": 7, "type": "worker_enter", "description": "Arvind Singh enters Zone C4", "payload": { "workerId": "W3", "name": "Arvind Singh", "role": "Safety Observer", "zoneId": "C4", "position": { "x": 155, "y": 145 } } },
  { "timeOffsetSeconds": 12, "type": "sensor_update", "description": "Gas pressure rises slightly — still below alarm threshold", "payload": { "sensorId": "S-C4-GAS", "value": 1.08 } },
  { "timeOffsetSeconds": 18, "type": "shift_changeover", "description": "Shift changeover begins", "payload": { "active": true } },
  { "timeOffsetSeconds": 24, "type": "sensor_update", "description": "C3 — hot work permit being prepared", "payload": { "sensorId": "S-C3-GAS", "value": 1.0 } },
  { "timeOffsetSeconds": 32, "type": "worker_confined", "description": "Rajan enters confined space", "payload": { "workerId": "W1", "zoneId": "C4", "position": { "x": 155, "y": 140 } } },
  { "timeOffsetSeconds": 34, "type": "worker_confined", "description": "Suresh enters confined space", "payload": { "workerId": "W2", "zoneId": "C4", "position": { "x": 160, "y": 145 } } },
  { "timeOffsetSeconds": 36, "type": "worker_confined", "description": "Arvind enters confined space", "payload": { "workerId": "W3", "zoneId": "C4", "position": { "x": 158, "y": 150 } } },
  { "timeOffsetSeconds": 40, "type": "sensor_update", "description": "Gas pressure: 1.11 kPa — still below single-sensor alarm (1.15)", "payload": { "sensorId": "S-C4-GAS", "value": 1.11 } }
]
```

At `timeOffsetSeconds: 40`, submit a Hot Work permit for Zone C3 live via the SHIELD form during the demo — Pattern 12 (Vizag) confirms over the following ~1.5 seconds (thanks to the Phase 2 smoothing) and reaches ~94%. This is the moment. See the [full demo script](#demo-script--5-minutes-that-win) below.

---

## Phase 16 — Deployment

### Frontend → Vercel

```bash
cd apps/web && npm run build
# Connect GitHub repo, set root directory to apps/web
# Add VITE_API_URL and VITE_WS_URL in Vercel dashboard
```

### Mobile checkpoint → Vercel (separate project or subdomain) ★ NEW

```bash
cd apps/mobile-checkpoint && npm run build
# Deploy as its own small Vercel project so its URL is short enough to QR-encode cleanly
```

### Backend → Railway

`apps/server/railway.toml`:
```toml
[build]
command = "npm run build"

[deploy]
startCommand = "node dist/index.js"
```

Add `ANTHROPIC_API_KEY` to Railway environment variables. Use Railway's WebSocket support directly (no separate WS proxy needed for `ws`).

### Environment variables — full reference

```
# apps/server/.env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
WS_PORT=3002
NODE_ENV=development

# apps/web/.env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002

# apps/web/.env.production
VITE_API_URL=https://safentra-api.railway.app
VITE_WS_URL=wss://safentra-ws.railway.app

# apps/mobile-checkpoint/.env.production
VITE_API_URL=https://safentra-api.railway.app
```

---

## The 13 Compound Risk Patterns

| # | Name | Conditions | Score | Regulatory ref |
|---|---|---|---|---|
| 01 | Hot work near gas elevation | Hot work permit + adjacent gas elevated | 0.72 | OISD-STD-105 §6.2 |
| 02 | Confined entry + abnormal process | Workers in confined space + sensor abnormal in same zone | 0.81 | OISD-GDN-169 §4.3 |
| 03 | Maintenance + gas holder pressure | Electrical isolation permit + adjacent gas holder above normal | 0.68 | OISD-GDN-169 §7 |
| 04 | Shift changeover + multiple permits | Changeover active + 2+ high-risk permits | 0.61 | Factory Act §41G |
| 05 | Multiple simultaneous confined entries | 3+ confined space permits in zone cluster | 0.55 | OISD-GDN-169 §4.7 |
| 06 | Oxygen depletion with workers | O2 < 19.5% + workers present | 0.88 | OISD-GDN-169 §4.2 |
| 07 | Gas propagation across zones | This zone elevated + 2+ adjacent zones elevated | 0.74 | OISD-GDN-169 §6.1 |
| 08 | Maintenance + hot work adjacent | Hot work permit + electrical isolation in adjacent zone | 0.63 | OISD-STD-105 §7.4 |
| 09 | Triple hazard convergence | Gas hazard + workers + active permit in same zone | 0.79 | OISD-GDN-169 §5.2 |
| 10 | Shift changeover + confined entry | Changeover active + workers in confined space | 0.65 | Factory Act §41G |
| 11 | H2S above STEL with workers | H2S > 5ppm + workers present (below alarm) | 0.71 | OISD-GDN-169 §3.4 |
| 12 | **Full Vizag pattern** | Gas elevated (below alarm) + changeover + hot work nearby + confined entry | **0.94** | OISD-GDN-169 §4.3 + OISD-STD-105 §6.2 |
| 13 ★ | **FORGE-discovered (live)** | Populated during the demo from a real-time near-miss report | *variable* | Proposed live by FORGE |

---

## RAG Corpus — What to Include

Create these files in `data/corpus/`. Each is a markdown file (300–500 words), written manually with realistic regulatory language, since ORACLE will cite these verbatim in front of judges.

| File | Content | Why it matters |
|---|---|---|
| `incident-vizag-2025.md` | January 2025 explosion, 8 fatalities, 4 conditions, investigation findings | The centrepiece incident |
| `incident-bhilai-2019.md` | SAIL Bhilai 2019, 4 fatalities, maintenance + gas — matches Pattern 08 | Cross-references demo pattern |
| `incident-hpcl-2009.md` | HPCL Mumbai 2009, 6 fatalities, confined + hot work — matches Pattern 02 | Adds historical weight |
| `oisd-169-confined-space.md` | OISD-GDN-169 clauses 4.2, 4.3, 4.7, 5.2, 6.1, 7.3 | Regulatory authority for ORACLE |
| `oisd-105-hot-work.md` | OISD-STD-105 clauses 6.2, 7.4, 8.1 | Hot work permit rules |
| `factory-act-41b-41g.md` | Factory Act Sections 41B and 41G | Worker safety duty citations |
| `dgfasli-guidelines.md` | DGFASLI investigation procedures, report format, incident classification | BLAZE report format |
| `dgms-mining-2023.md` | DGMS 2023 safety regulations | Shows platform extensibility beyond steel plants |

---

## AI Agent Prompting Guide

Use this master context prompt at the start of every coding-agent session (Claude Code, Cursor, Cline, Kiro, or similar):

```
I am building Safentra — Compound Risk Detection for Modern Industry, an AI-powered
industrial safety intelligence platform.

PROJECT: Multi-agent system that detects compound risk in industrial plants by matching
dangerous subgraph patterns over a live knowledge graph of sensors, workers, permits, and
equipment — and learns new patterns from free-text near-miss reports.

TECH STACK:
- Frontend: React 18 + TypeScript + Tailwind + D3.js + Recharts + Zustand
- Mobile checkpoint: React + html5-qrcode (PWA)
- Backend: Node.js + Express + WebSocket (ws) + Anthropic API (claude-sonnet-4-6)
- No database, no external vector store — in-memory TypeScript + a hash-chained ledger

SIX AGENTS:
- ARGUS: compound risk engine (graph pattern matching + temporal smoothing)
- ATLAS: D3.js SVG plant heatmap with voice-announced critical alerts
- ORACLE: RAG agent over incident/regulatory corpus
- SHIELD: permit form + mobile QR field checkpoint
- BLAZE: emergency orchestrator, DGFASLI-format incident report generation
- FORGE: reads near-miss reports and proposes new compound-risk patterns

The Vizag pattern (Pattern 12) fires when ALL FOUR conditions are simultaneously true:
gas pressure elevated but below alarm threshold, shift changeover in progress,
hot work permit active within 50m, workers in confined space. Score ramps to 0.94
over ~3 confirmation ticks via exponential smoothing (not an instant jump).

What do you need me to build next?
```

Task-specific prompts for ARGUS pattern matching, ATLAS D3 rendering, ORACLE retrieval, and BLAZE JSON generation should mirror the code specifications given in Phases 1, 5, 6, and 8 above — paste the relevant phase's code block directly into your coding agent as ground truth.

---

## Judging-Criteria Alignment

Use this table directly when writing your pitch deck — it pre-maps every feature to the axis a judge is likely scoring against.

| Judging axis | What Safentra shows |
|---|---|
| **Innovation** | Compound graph pattern matching (not threshold alarms) as the core primitive; FORGE turning unstructured near-miss text into new detection rules live, on stage. |
| **Technical depth** | In-memory knowledge graph with 13 pattern matchers, exponential-smoothing risk scoring with confirmation windows, hash-chained tamper-evident audit ledger, real-time WebSocket architecture, six coordinated agents. |
| **Real-world impact** | Grounded in three documented fatal industrial incidents (Vizag 2025, Bhilai 2019, HPCL 2009) with explicit OISD/Factory Act/DGFASLI citations; mobile checkpoint intervenes at the actual moment of physical risk, not just paperwork. |
| **Feasibility / demoability** | Zero external infrastructure (no DB, no vector store, no blockchain node) — runs entirely on Node.js + the Anthropic API, deployable to Vercel + Railway in minutes. |
| **Product thinking** | JSON-schema-driven multi-plant configurator, safety debt tracking as a second non-obvious KPI, compliance-ready audit trail, believable roadmap to production (see below). |
| **Presentation** | A scripted, rehearsed 5-minute demo (Vizag replay) *plus* a live, unscripted Chaos Mode segment that proves the system isn't just an animation. |

---

## Demo Script — 5 Minutes That Win

```
T+0:00  Click "Start scenario". Narrate: "6:47am. Coke Oven Battery 6, Vizag Steel Plant.
         January 10, 2025. Watch what our existing safety systems saw — and didn't."

T+0:12  Gas sensor ticks to 1.08. Say: "Gas pressure rises. Below alarm threshold.
         Every existing plant system: silent."

T+0:18  Shift changeover banner appears. Say: "Shift changeover begins. Safety handoff
         is incomplete."

T+0:24  Use SHIELD to submit a Hot Work permit for Zone C3 — approved, risk not yet critical.

T+0:32  Workers enter confined space. Dots turn red. Say: "Three workers enter the
         battery drum."

T+0:40  Risk score ramps over ~1.5 seconds to 94%. Zone C4 pulses red. The dashboard
         SPEAKS the alert aloud. SHIELD blocks any new permit submissions.
         Say: "ARGUS sees what no single sensor saw. All four conditions. Simultaneously.
         Confirmed, not guessed — smoothed over three consecutive readings, exactly the
         way a real safety system should behave."
         Pause. Let the red heatmap and the silence sit for three seconds.
         Say: "At Vizag, no system connected these signals. Eight people never came home."

T+1:10  Pull up the mobile checkpoint on a phone. Scan Zone C4's QR code live.
         Say: "And it's not just a dashboard for the control room. Any worker,
         at the door, right now, gets told: don't enter."

T+1:40  Submit a real near-miss report into FORGE, live, unscripted.
         Say: "Every plant already has near-miss reports sitting in a filing cabinet.
         Watch what happens when we let the system read one."
         Let FORGE propose a new Pattern 13 on screen.

T+2:30  Open Chaos Mode. Say: "This isn't scripted. Pick any combination right now" —
         optionally hand the controls to a judge for 20 seconds.

T+3:15  Show the ledger verification endpoint returning `valid: true`.
         Say: "Every alert, every blocked permit, every field scan — tamper-evident,
         hash-chained, ready for a regulator's audit."

T+4:00  Close: "SENTINEL — sorry, Safentra — didn't need a data scientist to build
         a smarter alarm. It needed a graph, a knowledge base, and six agents that
         talk to each other the way a good safety team would. Eight people.
         38 seconds. That's the difference we're building for."
```

---

## Hackathon Day Checklist

### Night before
- [ ] All npm packages installed in every workspace (server, web, mobile-checkpoint)
- [ ] Anthropic API key in `.env`, confirmed working with a live test call to each of the four LLM-backed agents (ORACLE, BLAZE, FORGE, and any others)
- [ ] `npm run dev` starts server + web without errors; `npm run dev:mobile` starts the checkpoint PWA
- [ ] WebSocket connection shows "Live" in the dashboard header
- [ ] Plant map renders with zone polygons colored correctly at rest (all teal)
- [ ] Vizag scenario replay runs start to finish without manual intervention
- [ ] Zone C4 reaches ~94% risk score by T+41.5s (accounting for the 3-tick confirmation ramp)
- [ ] SHIELD blocks a hot work permit when Vizag conditions are active
- [ ] Mobile checkpoint correctly scans a printed QR code and returns a blocked result during the active scenario
- [ ] FORGE returns a well-formed candidate pattern from at least three different sample near-miss reports (test variety, not just your rehearsed one)
- [ ] Chaos Mode injection correctly triggers a pattern match distinct from the Vizag scenario
- [ ] `/ledger/verify` returns `valid: true`; manually corrupt one entry in a test run to confirm it correctly returns `valid: false`
- [ ] Voice alert audibly announces the critical event (test on the actual demo laptop's speakers, not headphones)
- [ ] Deployment live URLs accessible (Vercel frontend + mobile checkpoint, Railway backend confirmed reachable from a phone on a different network)
- [ ] Full demo run-through completed at least three times, timed, under 5 minutes
- [ ] Printed QR code for Zone C4 physically ready (don't rely on projecting it from a slide — bring an actual printout)
- [ ] Architecture diagram exported as PNG for the deck
- [ ] Presentation deck's final slide has the closing line written out verbatim

### During the demo
1. Open the live URL in browser (localhost fallback ready and tested on the same network)
2. Confirm "Live" status indicator is green before starting
3. Click "Reset" first to guarantee clean state
4. Follow the [demo script](#demo-script--5-minutes-that-win) above
5. If anything visibly breaks, don't debug live — narrate what *should* happen and move to the next beat; a confident narrated recovery reads better than a silent scramble

---

## Roadmap Beyond the Hackathon

Judges consistently reward teams who can articulate the gap between a prototype and a real product. Have these answers ready if asked "what's next":

1. **Real sensor ingestion** — replace the simulated `SimulationEngine` with an OPC-UA and MQTT bridge so ARGUS reads live PLC/SCADA data instead of a scripted timeline; the `PlantGraph.updateSensor()` interface is already decoupled from the simulator, so this is a swap-in, not a rewrite.
2. **Role-based access control** — safety officers, permit issuers, and plant managers need different views and different write permissions; SHIELD's block/approve decisions should require sign-off from a credentialed role, not an anonymous form submission.
3. **Multi-tenant SaaS deployment** — the Phase 14 plant configurator is the seed of a proper onboarding flow; the next step is per-tenant data isolation and a billing/usage layer.
4. **Persistent storage** — the hash-chained ledger currently lives in memory; production would append the same structure to durable storage (e.g. an append-only log or object storage) while keeping the hash-chain verification logic identical.
5. **FORGE pattern promotion pipeline** — candidate patterns currently require a human click to "approve" in memory; production would version-control approved patterns, require dual sign-off for anything above a risk threshold, and maintain a changelog auditable against DGFASLI reporting requirements.
6. **Wearables integration** — worker position and confined-space status currently comes from simulated events; a real deployment would ingest RFID/BLE beacon or wearable-sensor data for automatic zone tracking, removing reliance on manual QR scans for status updates (though the QR checkpoint remains valuable as an explicit, auditable "I acknowledge this risk" action).

---

*Safentra — Compound Risk Detection for Modern Industry*
*Guide compiled and extended for hackathon competition use.*
