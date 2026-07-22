# 🏭 Safentra — Compound Risk Detection Platform for Industrial Safety

> **🚧 UNDER CONSTRUCTION — Actively building for ET AI Hackathon 2.0 Round 2** 🚧

[![Hackathon](https://img.shields.io/badge/ET%20AI%20Hackathon-2.0-%23FF6B35?style=for-the-badge&logo=unstop&logoColor=white)](https://unstop.com/hackathons/et-ai-hackathon-2-0)
[![Round](https://img.shields.io/badge/Round-2%20(Prototype%20Build%20Sprint)-%2300D4AA?style=for-the-badge)](https://unstop.com/hackathons/et-ai-hackathon-2-0)
[![Status](https://img.shields.io/badge/Status-Building%20for%20Round%202-%23FFD700?style=for-the-badge)](https://github.com/Vishallakshmikanthan/Safentra)
[![Team](https://img.shields.io/badge/Team-Safentra%20Builders-%238B5CF6?style=for-the-badge)](https://github.com/Vishallakshmikanthan/Safentra)
[![License](https://img.shields.io/badge/License-MIT-%2300D4AA?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-%233178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-%2361DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-%23339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-%23010101?style=for-the-badge&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![D3.js](https://img.shields.io/badge/D3.js-7.9-%23F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)](https://d3js.org/)
[![Recharts](https://img.shields.io/badge/Recharts-3.9-%23FF6B35?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-%23000000?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Vite](https://img.shields.io/badge/Vite-8.1-%23646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-%2306B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude%203.5-%23D4AA00?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-%230B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-%23000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🏆 Hackathon Details

| Detail | Information |
|--------|-------------|
| **Hackathon** | **ET AI Hackathon 2.0** — Nation-scale innovation challenge by Economic Times & Unstop |
| **Phase** | **Round 2 — Prototype Build Sprint** (Phase 1 results announced 22nd June before 3:00 PM) |
| **Focus** | Business Innovation, Social Impact & Open Innovation domains |
| **Journey** | Online AI Assessment → Prototype Build Sprint → Grand Finale |
| **Goal** | Transform ideas into impactful AI products; discover India's brightest AI talent |

> **Note:** We cleared **Phase 1 (Online AI Assessment)** and are now building the **Round 2 prototype** for the intensive build sprint.

---

## 👥 Team VibeSync

| Member | Role | GitHub | LinkedIn |
|--------|------|--------|----------|
| **Vishal Lakshmikanthan** | Full-Stack Engineer, Architecture & Backend Lead | [@Vishallakshmikanthan](https://github.com/Vishallakshmikanthan) | [LinkedIn](https://linkedin.com/in/vishallakshmikanthan) |
| **Sneha C** | Frontend Engineer, UI/UX & Mobile Lead | [@CSNEHA20](https://github.com/CSNEHA20) | [LinkedIn](https://linkedin.com/in/csneha20) |

---

## 📖 Project Description

**Safentra** is a **real-time compound risk detection platform** designed for high-hazard industrial environments — starting with **coke oven batteries** in integrated steel plants. It fuses **live sensor telemetry, worker positioning, permit-to-work status, and shift-changeover dynamics** into a unified knowledge graph, then applies **13 compound risk patterns** (codified from DGMS/OISD regulations and historical incidents like the **Vizag gas leak**) to surface *emergent* risks that single-sensor alarms miss.

### The Core Insight
> **Single-sensor thresholds fail to catch compound hazards.** The Vizag tragedy wasn't triggered by one sensor breaching its limit — it was the *confluence* of: gas pressure creeping up + three workers entering a confined space + shift changeover + a hot-work permit being prepared next door. **Safentra detects the *pattern*, not just the threshold.**

---

## ⚠️ Problem Statement

### Industrial Safety Gap in High-Hazard Plants
| Problem | Impact |
|---------|--------|
| **Siloed monitoring** — Gas detectors, permit systems, worker tracking, and shift rosters operate in isolation | No unified situational awareness |
| **Threshold-only alarms** — Binary high/low alerts miss *compound* precursors | Late detection; false confidence when all sensors read "normal" |
| **Paper-based permits** — Hot work, confined entry, isolation permits lack real-time risk context | Permits approved despite adjacent zone hazards |
| **Shift changeover blind spots** — Incoming/outgoing crew handover creates 15–30 min visibility gaps | Peak risk window with zero monitoring |
| **No institutional memory** — Near-misses go unreported or unanalyzed | Recurring patterns never codified into prevention |
| **Audit trails are fragile** — Paper logs, spreadsheets, disconnected systems | Tampering possible; forensic reconstruction impossible |

### The Vizag Reference Incident (LG Polymers, 2020)
- **Root cause:** Styrene monomer tank polymerization due to temperature rise + inhibitor depletion + no circulation
- **Compound factors missed:** Sensor drift + maintenance backlog + shift handover gap + no remote monitoring
- **Regulatory response:** DGMS Circular 2022/11, OISD-GDN-169, OISD-STD-105 — mandating *compound risk assessment*

---

## 💡 Solution: Safentra Platform

### Six AI Agents Working in Concert

| Agent | Codename | Role | Key Capability |
|-------|----------|------|----------------|
| **ARGUS** | 🧠 **Knowledge Graph & Pattern Engine** | In-memory plant graph + 13 compound risk patterns | Evaluates *all* patterns every 500ms; temporal smoothing (EMA + confirmation window) |
| **ATLAS** | 🗺️ **Live Plant Visualization** | D3.js plant map with risk heatmap, worker dots, permit zones | Real-time WebSocket-driven; pulsing critical zones; zone polygons from config |
| **SHIELD** | 🛡️ **Permit-to-Work Intelligence** | Context-aware permit validation & blocking | Blocks hot work if adjacent gas elevated; cites DGMS/OISD regulation |
| **ORACLE** | 🔮 **Regulatory Intelligence Agent** | RAG over DGMS/OISD corpus + Anthropic Claude | Answers "Is this permit safe?" with citations; auto-queries on risk events |
| **BLAZE** | 🚨 **Emergency Orchestrator** | DGFASLI-compliant incident report + evacuation sequencing | One-click trigger; generates report, alerts, routes, assembly counts |
| **FORGE** | 🔨 **Pattern Discovery from Near-Misses** | Mines free-text near-miss reports → candidate patterns | NLP extraction → pattern validation → promote to ARGUS Pattern 13+ |

### Platform Capabilities

| Capability | Description |
|------------|-------------|
| **🕸️ Knowledge Graph** | In-memory graph: Zones ↔ Sensors ↔ Workers ↔ Permits ↔ Adjacencies |
| **📊 13 Compound Patterns** | Codified from DGMS/OISD + Vizag; each with regulatory citation & risk score |
| **📈 Temporal Risk Smoothing** | EMA (α=0.3) + 3-tick confirmation window prevents flicker |
| **💰 Safety Debt Tracking** | Time-integrated risk accumulation per zone (area under risk curve) |
| **⛓️ Hash-Chained Audit Ledger** | Tamper-evident log (SHA-256 chain) of every event, permit action, sensor reading |
| **🌐 Real-time WebSocket** | 500ms state broadcast; auto-reconnect; subscription model |
| **🎭 Chaos/War-Room Mode** | Live scenario injection by judges/presenters — *not scripted* |
| **🏭 Multi-Plant Configurator** | JSON Schema-driven plant onboarding (coke oven, blast furnace, chemical, etc.) |
| **📱 Mobile QR Checkpoint (PWA)** | Field worker scans QR → SHIELD validates permit + zone risk → clear/block/escort |
| **🗣️ Voice Alerts** | Web Speech API announces critical alerts hands-free |
| **🎬 Vizag Replay Scenario** | 12-event timeline reproducing compound risk ramp to 94% at T+41.5s |

---

## 🏗️ Project Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[🌐 Web Dashboard<br/>React + Vite + D3 + Recharts]
        Mobile[📱 Mobile Checkpoint PWA<br/>QR Scanner + SHIELD Check]
    end

    subgraph "API Gateway"
        WS[🔌 WebSocket Server<br/>ws://localhost:3002<br/>500ms Broadcast Loop]
        REST[🌐 REST API<br/>http://localhost:3001<br/>Express + CORS]
    end

    subgraph "Core Engine (Node.js/TypeScript)"
        Graph[🧠 PlantGraph<br/>In-Memory Knowledge Graph]
        Patterns[🔍 PatternMatcher<br/>13 Compound Risk Patterns]
        Risk[📈 RiskScorer<br/>EMA + Confirmation Window]
        Debt[💰 SafetyDebtTracker<br/>Time-Integrated Accumulation]
        Ledger[⛓️ HashChain Ledger<br/>SHA-256 Tamper-Evident Log]
    end

    subgraph "AI Agents"
        ARGUS[ARGUS<br/>Graph + Patterns]
        ATLAS[ATLAS<br/>Visualization Data]
        SHIELD[SHIELD<br/>Permit Intelligence]
        ORACLE[ORACLE<br/>RAG + Claude 3.5]
        BLAZE[BLAZE<br/>Emergency Orchestration]
        FORGE[FORGE<br/>Near-Miss Mining]
    end

    subgraph "Simulation & Chaos"
        Sim[🎬 SimulationEngine<br/>Vizag Scenario + Custom]
        Chaos[🎭 ChaosEngine<br/>Live Injection API]
    end

    subgraph "Data Layer"
        Types[📦 @safentra/types<br/>Shared TypeScript Definitions]
        Config[📋 Plant Configs<br/>JSON Schema Validated]
        Corpus[📚 Regulatory Corpus<br/>8 Markdown Files]
    end

    Web <---> WS
    Mobile <---> REST
    WS --> Graph
    REST --> Graph
    Graph --> Patterns
    Graph --> Risk
    Graph --> Debt
    Graph --> Ledger
    Patterns --> ARGUS
    Risk --> ARGUS
    Debt --> ARGUS
    Ledger --> ARGUS
    ARGUS --> ATLAS
    SHIELD --> Graph
    ORACLE --> Corpus
    ORACLE --> Graph
    BLAZE --> Graph
    BLAZE --> Ledger
    FORGE --> Graph
    Sim --> Graph
    Chaos --> Graph
    Graph --> Types
    Config --> Graph
```

### Monorepo Structure

```
safentra/
├── 📦 apps/
│   ├── 🖥️ server/                 # Backend: Express + WebSocket + Agents
│   │   ├── src/
│   │   │   ├── index.ts           # Entry: REST + WS + Simulation + Chaos
│   │   │   ├── graph/
│   │   │   │   ├── PlantGraph.ts       # Core knowledge graph
│   │   │   │   ├── PatternMatcher.ts   # 13 pattern implementations
│   │   │   │   ├── RiskScorer.ts       # EMA + confirmation ticks
│   │   │   │   └── SafetyDebt.ts       # Debt accumulation + decay
│   │   │   ├── websocket/
│   │   │   │   └── PlantWebSocketServer.ts  # 500ms broadcast loop
│   │   │   ├── simulation/
│   │   │   │   ├── SimulationEngine.ts   # Timeline event player
│   │   │   │   └── ChaosEngine.ts        # Live scenario injection
│   │   │   ├── agents/
│   │   │   │   ├── oracle.ts      # RAG + Anthropic Claude
│   │   │   │   ├── blaze.ts       # Emergency orchestration
│   │   │   │   └── forge.ts       # Near-miss pattern mining
│   │   │   ├── ledger/
│   │   │   │   └── HashChain.ts   # SHA-256 chained audit log
│   │   │   └── routes/            # REST endpoints per domain
│   │   └── package.json
│   │
│   ├── 🌐 web/                    # Frontend: React 19 + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Atlas/              # PlantMap (D3), ZonePolygon, WorkerDot
│   │   │   │   ├── CommandCentre/      # Dashboard, SafetyDebtPanel, AlertFeed
│   │   │   │   ├── Shield/             # PermitForm, PermitValidator
│   │   │   │   ├── Oracle/             # OraclePanel, chat interface
│   │   │   │   ├── Blaze/              # BlazePanel, IncidentReport
│   │   │   │   ├── Forge/              # NearMissSubmit, CandidatePatternReview
│   │   │   │   ├── Chaos/              # ChaosBuilder (live injection UI)
│   │   │   │   ├── Shared/             # Reusable UI components
│   │   │   │   └── Modules/            # Feature modules
│   │   │   ├── store/
│   │   │   │   └── plantStore.ts       # Zustand + WebSocket sync
│   │   │   ├── hooks/
│   │   │   │   ├── useWebSocket.ts     # Auto-reconnect WS client
│   │   │   │   └── useVoiceAlerts.ts   # Web Speech API
│   │   │   └── types/                  # Frontend-specific types
│   │   └── package.json
│   │
│   └── 📱 mobile-checkpoint/      # PWA: QR Scanner + SHIELD Check
│       └── src/
│           ├── App.tsx
│           └── useCamera.ts
│
├── 📦 packages/
│   └── types/                     # @safentra/types — Shared TS definitions
│       └── src/index.ts           # All domain types (Zone, Sensor, Worker, Permit, etc.)
│
├── 📁 data/
│   ├── corpus/                    # 8 regulatory/incident markdown files
│   ├── plant-configs/
│   │   ├── coke-oven-plant.json   # 6-zone default plant
│   │   └── schema.json            # JSON Schema Draft 7 for validation
│   └── scenarios/
│       ├── vizag.json             # 12-event replay timeline
│       └── chaos-templates.json   # Chaos mode presets
│
├── 🖼️ images/                     # Screenshots for README
├── 📋 implementation_plan.md      # 16-phase build plan
├── 📋 Safentra-Build-Guide.md     # Detailed architecture guide
└── 📦 package.json                # Root workspace config
```

---

## 🔄 Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Input Sources"
        Sensors[📡 Sensor Telemetry<br/>Gas, Temp, Pressure, O2, Flow, Proximity]
        Workers[👷 Worker Positioning<br/>BLE/QR Checkpoint + Manual]
        Permits[📋 Permit System<br/>Hot Work, Confined, Isolation, Height, Excavation]
        Shift[🔄 Shift Roster<br/>Changeover Events]
        NearMiss[📝 Near-Miss Reports<br/>Free-text + Tags]
        Chaos[🎭 Chaos Injection<br/>Live Scenario Override]
    end

    subgraph "Ingestion Layer"
        WS[🔌 WebSocket Ingestion<br/>500ms Tick Loop]
        REST[🌐 REST API<br/>Permits, Checkpoints, Queries]
        Sim[🎬 Simulation Engine<br/>Scenario Playback]
    end

    subgraph "Core Graph Engine"
        Graph[🧠 PlantGraph<br/>Mutable In-Memory Graph]
        Graph -->|Mutate| Zones[Zones: Risk, Debt, Workers, Permits]
        Graph -->|Mutate| SensorsG[Sensors: Value, Status, Trend]
        Graph -->|Mutate| WorkersG[Workers: Zone, Status, Position]
        Graph -->|Mutate| PermitsG[Permits: Status, Block Reason]
    end

    subgraph "Intelligence Layer"
        Patterns[🔍 PatternMatcher<br/>13 Compound Patterns]
        Risk[📈 RiskScorer<br/>EMA α=0.3 + 3-Tick Confirm]
        Debt[💰 SafetyDebtTracker<br/>∫ Risk dt per Zone]
        Ledger[⛓️ HashChain<br/>Append-Only Audit Trail]
    end

    subgraph "Agent Layer"
        ARGUS[ARGUS: Pattern Eval + Risk Events]
        SHIELD[SHIELD: Permit Block/Approve]
        ORACLE[ORACLE: RAG Query + Citations]
        BLAZE[BLAZE: Emergency Report + Evac]
        FORGE[FORGE: Near-Miss → Candidate Pattern]
    end

    subgraph "Output Channels"
        WSBroadcast[📡 WS Broadcast<br/>State + Risk Events + Alerts]
        RESTResponse[🌐 REST Responses]
        Voice[🗣️ Voice Alerts<br/>Web Speech API]
        Mobile[📱 Mobile Checkpoint<br/>QR Scan Result]
        Report[📄 BLAZE Report<br/>DGFASLI Format]
    end

    Sensors --> WS
    Workers --> WS
    Permits --> REST
    Shift --> WS
    NearMiss --> REST
    Chaos --> WS
    Sim --> WS

    WS --> Graph
    REST --> Graph
    Sim --> Graph

    Graph --> Patterns
    Graph --> Risk
    Graph --> Debt
    Graph --> Ledger

    Patterns --> ARGUS
    Risk --> ARGUS
    Debt --> ARGUS
    Ledger --> ARGUS

    ARGUS --> WSBroadcast
    SHIELD --> RESTResponse
    SHIELD --> WSBroadcast
    ORACLE --> RESTResponse
    BLAZE --> WSBroadcast
    BLAZE --> Report
    FORGE --> WSBroadcast
    FORGE --> RESTResponse

    WSBroadcast --> Web[🌐 Web Dashboard]
    WSBroadcast --> Voice
    RESTResponse --> Web
    RESTResponse --> Mobile
```

---

## 🌊 Flow Diagrams

### 1. Real-Time Risk Detection Flow

```mermaid
sequenceDiagram
    participant Sensor as 📡 Sensor
    participant WS as 🔌 WebSocket
    participant Graph as 🧠 PlantGraph
    participant Pattern as 🔍 PatternMatcher
    participant Risk as 📈 RiskScorer
    participant Debt as 💰 SafetyDebt
    participant Ledger as ⛓️ HashChain
    participant ARGUS as 🤖 ARGUS Agent
    participant Broadcast as 📡 WS Broadcast
    participant UI as 🌐 Dashboard

    Sensor->>WS: Sensor reading (2s tick)
    WS->>Graph: updateSensor(id, value)
    Graph->>Graph: Recalc zone riskScore
    Graph->>Pattern: evaluateAll()
    Pattern->>Pattern: Check 13 patterns
    Pattern-->>Graph: RiskEvent[] (matched patterns)
    Graph->>Risk: update(zoneId, rawScore, patternId)
    Risk->>Risk: EMA smoothing + confirmation ticks
    Risk-->>Graph: smoothedRiskScore
    Graph->>Debt: accumulate(zoneId, riskScore, dt)
    Debt-->>Graph: debtMetrics
    Graph->>Ledger: append(sensor_reading + risk_event)
    Ledger-->>Graph: hashChainEntry
    ARGUS->>Broadcast: risk_event + state_update
    Broadcast->>UI: Real-time update (500ms)
    UI->>UI: Re-render map, panels, alerts
```

### 2. SHIELD Permit Validation Flow

```mermaid
sequenceDiagram
    participant User as 👤 Safety Officer
    participant UI as 🌐 PermitForm
    participant REST as 🌐 POST /api/permits
    participant Graph as 🧠 PlantGraph
    participant SHIELD as 🛡️ SHIELD Agent
    participant Pattern as 🔍 PatternMatcher
    participant Ledger as ⛓️ HashChain
    participant WS as 📡 Broadcast

    User->>UI: Fill permit form (type, zone, worker)
    UI->>REST: POST /api/permits
    REST->>Graph: addPermit(permit)
    Graph->>SHIELD: evaluate(permit)
    SHIELD->>Pattern: evaluateZone(zoneId)
    Pattern-->>SHIELD: matchedPatterns[]
    alt Compound Risk Detected
        SHIELD->>Graph: blockPermit(id, reason, regulation)
        Graph->>Ledger: append(permit_blocked)
        Graph->>WS: broadcast(permit_blocked)
        WS->>UI: Show blocked status + regulation cite
    else No Compound Risk
        SHIELD->>Graph: approvePermit(id)
        Graph->>Ledger: append(permit_approved)
        Graph->>WS: broadcast(permit_approved)
        WS->>UI: Show active permit
    end
```

### 3. BLAZE Emergency Orchestration Flow

```mermaid
sequenceDiagram
    participant Trigger as 🚨 RiskEvent > 0.85
    participant BLAZE as 🚨 BLAZE Agent
    participant Graph as 🧠 PlantGraph
    participant Ledger as ⛓️ HashChain
    participant WS as 📡 Broadcast
    participant Oracle as 🔮 ORACLE
    participant Mobile as 📱 Mobile Alerts
    participant Report as 📄 DGFASLI Report

    Trigger->>BLAZE: trigger(riskEvent)
    BLAZE->>Graph: snapshot() → full plant state
    BLAZE->>Oracle: query("Emergency guidance for " + zone)
    Oracle-->>BLAZE: Regulatory citations + actions
    BLAZE->>Graph: computeEvacuationSequence()
    BLAZE->>Ledger: append(blaze_triggered + evidence_snapshot)
    BLAZE->>WS: broadcast(blaze_triggered + evacuation_orders)
    WS->>Mobile: Push evacuation alert
    WS->>UI: Show BlazePanel + countdown
    BLAZE->>Report: generateDGFASLIReport()
    Report-->>BLAZE: PDF/JSON report
    BLAZE->>WS: broadcast(incident_report_ready)
```

### 4. FORGE Near-Miss Pattern Discovery Flow

```mermaid
sequenceDiagram
    participant Worker as 👷 Worker
    participant Mobile as 📱 NearMissSubmit
    participant REST as 🌐 POST /api/forge/submit
    participant FORGE as 🔨 FORGE Agent
    participant Graph as 🧠 PlantGraph
    participant Patterns as 🔍 PatternMatcher
    participant Ledger as ⛓️ HashChain
    participant Review as 👀 CandidatePatternReview

    Worker->>Mobile: Submit near-miss (text + tags + zone)
    Mobile->>REST: POST /api/forge/submit
    REST->>FORGE: analyzeNearMiss(report)
    FORGE->>Graph: getZoneContext(zoneId)
    FORGE->>Patterns: getAllPatterns()
    FORGE->>FORGE: NLP keyword extraction (gas, confined, hot work, shift, oxygen)
    FORGE->>FORGE: Compare against existing patterns
    FORGE-->>REST: CandidatePattern {confidence, suggestedConditions}
    REST->>Ledger: append(forge_candidate)
    REST->>Review: Notify safety committee
    Review->>Review: Approve / Reject / Request More Data
    alt Approved
        Review->>Patterns: promoteToPattern(candidate)
        Patterns->>Patterns: Add as Pattern 13+
        Patterns->>Ledger: append(forge_promoted)
    end
```

---

## 🎯 The 13 Compound Risk Patterns

| # | Pattern Name | Trigger Conditions | Risk Score | Regulatory Reference |
|---|--------------|-------------------|------------|---------------------|
| **01** | **Hot Work Near Gas Elevation** | Hot work permit + adjacent zone gas pressure > normal | 0.72 | OISD-STD-105 §6.2 |
| **02** | **Confined Entry + Abnormal Process** | Workers in confined space + sensor abnormal in same zone | 0.81 | OISD-GDN-169 §4.3 |
| **03** | **Maintenance + Gas Holder Pressure** | Electrical isolation permit + adjacent gas holder pressure elevated | 0.68 | OISD-GDN-169 §7 |
| **04** | **Shift Changeover + Active Permits** | Shift changeover active + high-risk permits active | 0.75 | DGMS Circular 2023/04 |
| **05** | **Multi-Worker Confined Space** | ≥3 workers in confined space + no standby observer | 0.78 | OISD-GDN-169 §5.1 |
| **06** | **Gas Pressure Creep + Permit** | Gas pressure rising trend (3+ ticks) + any permit in zone | 0.65 | OISD-STD-105 §4.4 |
| **07** | **Oxygen Depletion + Hot Work** | O₂ < 19.5% + hot work permit in same/adjacent zone | 0.85 | DGMS Circular 2022/11 |
| **08** | **H₂S Elevation + Confined Entry** | H₂S > 10 ppm + confined space entry permit active | 0.88 | OISD-GDN-169 §4.2 |
| **09** | **CO Accumulation + Maintenance** | CO > 25 ppm + electrical isolation permit | 0.70 | IE Rules 1956 |
| **10** | **Temperature Spike + Gas Pressure** | Temp > 70°C + gas pressure > 1.2× normal | 0.73 | OISD-STD-105 §6.3 |
| **11** | **Flow Rate Anomaly + Permit** | Flow rate > 150% normal + excavation permit | 0.62 | DGMS Circular 2021/08 |
| **12** | **Vizag Compound Pattern** | Gas pressure rise + 3 workers confined + shift change + adjacent hot work prep | **0.94** | **Vizag Incident Report** |
| **13** | **FORGE-Discovered Pattern** | Dynamically promoted from near-miss reports | Variable | Derived from field data |

> **Pattern 12 (Vizag)** is the *signature demo pattern* — it reproduces the exact compound precursor sequence of the 2020 Vizag gas leak, reaching **94% risk score at T+41.5s** with the 3-tick confirmation window.

---

## 📸 Screenshots

### Command Centre Dashboard
![Command Centre Dashboard](images/Screenshot%202026-07-20%20033316.png)
*Main dashboard with plant overview, risk metrics, and real-time alerts*

### ATLAS Plant Map Visualization
![ATLAS Plant Map](images/Screenshot%202026-07-20%20033339.png)
*D3.js-rendered plant map with zone polygons, risk heatmap, worker positions, and permit zones*

### SHIELD Permit Management
![SHIELD Permit Form](images/Screenshot%202026-07-20%20033419.png)
*Context-aware permit form showing real-time zone risk and SHIELD validation*

### ORACLE Regulatory Intelligence
![ORACLE Panel](images/Screenshot%202026-07-20%20033502.png)
*AI-powered regulatory query with DGMS/OISD citations and confidence scoring*

### BLAZE Emergency Orchestration
![BLAZE Panel](images/Screenshot%202026-07-20%20033607.png)
*One-click emergency trigger with evacuation sequencing and DGFASLI report generation*

### FORGE Near-Miss Submission
![FORGE Near-Miss](images/Screenshot%202026-07-20%20033636.png)
*Field worker near-miss submission with automatic pattern candidate generation*

### Chaos / War-Room Mode
![Chaos Builder](images/Screenshot%202026-07-20%20033703.png)
*Live scenario injection interface for judges/presenters to test real-time detection*

### Safety Debt Panel
![Safety Debt](images/Screenshot%202026-07-20%20033714.png)
*Recharts visualization of time-integrated risk accumulation per zone*

### Mobile Checkpoint PWA
![Mobile Checkpoint](images/Screenshot%202026-07-20%20033737.png)
*QR code scanner for field permit validation with SHIELD risk check*

### Audit Ledger Verification
![Ledger Verification](images/Screenshot%202026-07-20%20033803.png)
*Tamper-evident hash chain with cryptographic verification*

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm 10+** (comes with Node)
- **Anthropic API Key** (for ORACLE agent) — get one at [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/Vishallakshmikanthan/Safentra.git
cd Safentra

# Install all workspace dependencies
npm install

# Configure environment variables
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env and add your ANTHROPIC_API_KEY

# Build shared types package
npm run build:types

# Start development servers (backend + frontend)
npm run dev
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Web Dashboard** | http://localhost:5173 | Main command centre |
| **REST API** | http://localhost:3001/api | OpenAPI endpoints |
| **WebSocket** | ws://localhost:3002 | Real-time state stream |
| **Health Check** | http://localhost:3001/health | Server status |

### Run Vizag Demo Scenario

```bash
# In the web dashboard:
# 1. Click "▶ Start Simulation" in the simulation controls
# 2. At ~T+32s, submit a Hot Work permit for Zone C3 via SHIELD panel
# 3. Watch Pattern 12 (Vizag) confirm over 3 ticks → 94% risk
# 4. Observe BLAZE auto-trigger at >0.85 threshold
```

### Run Chaos Mode (Live Judge Demo)

```bash
# In the web dashboard:
# 1. Open "Chaos Builder" panel (⚡ icon)
# 2. Toggle: "Gas Pressure Spike" + "Workers in Confined Space" + "Shift Changeover"
# 3. Click "Inject Chaos"
# 4. Watch ARGUS detect compound pattern in real-time — NOT scripted!
```

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start both server + web (concurrently)
npm run dev:server       # Backend only (tsx watch)
npm run dev:web          # Frontend only (Vite)

# Building
npm run build            # Build all workspaces
npm run build:server     # Backend only (tsc)
npm run build:web        # Frontend only (vite build)
npm run build:types      # Shared types only

# Testing & Linting
npm run test             # Run all workspace tests
npm run lint             # Lint all workspaces (oxlint)

# Mobile Checkpoint PWA
cd apps/mobile-checkpoint && npm run dev
```

---

## 📦 Deployment

### Frontend → Vercel
```bash
cd apps/web && npm run build
# Connect GitHub repo to Vercel
# Set root directory: apps/web
# Add env vars: VITE_API_URL, VITE_WS_URL
```

### Mobile Checkpoint → Vercel (separate project)
```bash
cd apps/mobile-checkpoint && npm run build
# Deploy as separate Vercel project for clean QR-code URL
```

### Backend → Railway
```bash
# Add railway.toml to apps/server/
# railway login && railway link && railway up
# Set ANTHROPIC_API_KEY in Railway dashboard
```

### Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `ANTHROPIC_API_KEY` | Required for ORACLE | Required |
| `PORT` | 3001 | Railway assigns |
| `WS_PORT` | 3002 | Same as PORT (Railway WS support) |
| `CORS_ORIGINS` | http://localhost:5173 | https://your-vercel-app.vercel.app |
| `VITE_API_URL` | http://localhost:3001 | https://your-railway-app.railway.app |
| `VITE_WS_URL` | ws://localhost:3002 | wss://your-railway-app.railway.app |

---

## 🧪 Testing Checklist (Round 2 Demo Ready)

- [ ] **Vizag Replay** — Starts at 6:47am, reaches 94% risk at T+41.5s, BLAZE triggers
- [ ] **SHIELD Block** — Hot work permit for C3 blocked when C4 gas elevated (Pattern 1)
- [ ] **FORGE Flow** — Submit near-miss → candidate appears → approve → Pattern 13 active
- [ ] **Chaos Mode** — Judge injects custom scenario → real-time pattern match
- [ ] **Ledger Verify** — `GET /api/ledger/verify` returns `valid: true`
- [ ] **Voice Alerts** — Critical risk event announces via Web Speech API
- [ ] **Mobile Checkpoint** — QR scan → POST /checkpoint/scan → blocked/cleared UI
- [ ] **Multi-Plant Switch** — Load second plant config live (if implemented)

---

## 📚 Key Documentation

| Document | Description |
|----------|-------------|
| [`Safentra-Build-Guide.md`](Safentra-Build-Guide.md) | Complete 16-phase architecture & implementation guide |
| [`implementation_plan.md`](implementation_plan.md) | Detailed task breakdown with file/function/class specs |
| [`apps/server/.env.example`](apps/server/.env.example) | Environment variable template |
| [`data/plant-configs/schema.json`](data/plant-configs/schema.json) | JSON Schema for plant onboarding |

---

## 🤝 Contributing

This is a **hackathon prototype** built under extreme time pressure. Contributions welcome post-hackathon!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **ET AI Hackathon 2.0 & Unstop** — For the platform to build this
- **DGMS / OISD** — Regulatory frameworks that codify industrial safety wisdom
- **Vizag Tragedy Victims** — This platform exists so their loss drives prevention
- **Anthropic** — Claude 3.5 Sonnet for ORACLE's regulatory intelligence
- **Open Source** — React, D3, Recharts, Zustand, Vite, TypeScript, ws, Express, and countless others

---

## 📞 Contact

| Team | Contact |
|------|---------|
| **Vishal Lakshmikanthan** | [GitHub](https://github.com/Vishallakshmikanthan) • [LinkedIn](https://linkedin.com/in/vishallakshmikanthan) |
| **Sneha C** | [GitHub](https://github.com/CSNEHA20) • [LinkedIn](https://linkedin.com/in/csneha20) |
| **Project Repository** | [github.com/Vishallakshmikanthan/Safentra](https://github.com/Vishallakshmikanthan/Safentra) |

---

<div align="center">

**Built with ❤️ by VibeSync for ET AI Hackathon 2.0 — Round 2**

*From compound risk detection to compound impact prevention.*

![Footer](https://img.shields.io/badge/Made%20for-ET%20AI%20Hackathon%202.0-%23FF6B35?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-Safentra%20Builders-%238B5CF6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Building%20for%20Round%202-%23FFD700?style=for-the-badge)

</div>
