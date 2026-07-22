<div align="center">

# 🏭 Safentra
**Compound Risk Detection Platform for Industrial Safety**

[![Hackathon](https://img.shields.io/badge/ET%20AI%20Hackathon-2.0-%23FF6B35?style=for-the-badge&logo=unstop&logoColor=white)](https://unstop.com/hackathons/et-ai-hackathon-2-0)
[![Round](https://img.shields.io/badge/Round-2%20(Prototype%20Build%20Sprint)-%2300D4AA?style=for-the-badge)](https://unstop.com/hackathons/et-ai-hackathon-2-0)
[![Status](https://img.shields.io/badge/Status-Building-%23FFD700?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-%2300D4AA?style=for-the-badge)](LICENSE)
<br/>
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-%233178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-%2361DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-%23339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-%23646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-%2306B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

*No single alarm fires. That's the point. Safentra listens for the silence between alarms.*

</div>

---

## 🏆 Hackathon Details

| Detail | Information |
|--------|-------------|
| **Hackathon** | **ET AI Hackathon 2.0** — Nation-scale innovation challenge by Economic Times & Unstop |
| **Phase** | **Round 2 — Prototype Build Sprint** |
| **Focus** | Business Innovation, Social Impact & Open Innovation domains |
| **Goal** | Transform ideas into impactful AI products; discover India's brightest AI talent |
| **Why this fits** | Safentra uses advanced AI (RAG, Knowledge Graphs, Pattern Matching) for real-world industrial impact, saving lives by predicting compound hazards. |

## 👥 Team VibeSync

| Member | Role | GitHub | LinkedIn |
|--------|------|--------|----------|
| **Vishal Lakshmikanthan** | Full-Stack Engineer, Architecture & Backend Lead | [@Vishallakshmikanthan](https://github.com/Vishallakshmikanthan) | [LinkedIn](https://linkedin.com/in/vishallakshmikanthan) |
| **Sneha C** | Frontend Engineer, UI/UX & Mobile Lead | [@CSNEHA20](https://github.com/CSNEHA20) | [LinkedIn](https://linkedin.com/in/csneha20) |

---

## 📸 Prototype Preview

<div align="center">
  <img src="images/Screenshot 2026-07-20 033316.png" width="48%" alt="Dashboard View 1">
  <img src="images/Screenshot 2026-07-20 033339.png" width="48%" alt="Dashboard View 2">
  <img src="images/Screenshot 2026-07-20 033419.png" width="48%" alt="Dashboard View 3">
  <img src="images/Screenshot 2026-07-20 033502.png" width="48%" alt="Dashboard View 4">
  <img src="images/Screenshot 2026-07-20 033607.png" width="48%" alt="Dashboard View 5">
  <img src="images/Screenshot 2026-07-20 033636.png" width="48%" alt="Dashboard View 6">
  <img src="images/Screenshot 2026-07-20 033703.png" width="48%" alt="Dashboard View 7">
  <img src="images/image.png" width="48%" alt="System Overview">
</div>

---

## 📖 Project Overview

**Safentra** is a **real-time compound risk detection platform** designed for high-hazard industrial environments — starting with **coke oven batteries** in integrated steel plants. It fuses **live sensor telemetry, worker positioning, permit-to-work status, and shift-changeover dynamics** into a unified knowledge graph. It then applies **13 compound risk patterns** (codified from DGMS/OISD regulations and historical incidents like the **Vizag gas leak**) to surface *emergent* risks that single-sensor alarms miss.

---

## ⚠️ Problem Statement

### Industrial Safety Gap in High-Hazard Plants
Most industrial safety software is **reactive and single-variable**: a gas sensor crosses a threshold, an alarm sounds. 

| Problem | Impact |
|---------|--------|
| **Siloed monitoring** | Gas detectors, permit systems, worker tracking, and shift rosters operate in isolation. No unified situational awareness. |
| **Threshold-only alarms** | Binary high/low alerts miss *compound* precursors. Late detection; false confidence when sensors read "normal". |
| **Paper-based permits** | Hot work, confined entry, isolation permits lack real-time risk context. |
| **Shift changeover blind spots**| Incoming/outgoing crew handover creates 15–30 min visibility gaps with zero monitoring. |
| **No institutional memory** | Near-misses go unreported or unanalyzed. Recurring patterns never codified into prevention. |
| **Fragile Audit Trails** | Paper logs, spreadsheets, disconnected systems mean tampering is possible. |

**The Vizag Reference Incident (LG Polymers, 2020)**
The Vizag tragedy wasn't triggered by one sensor breaching its limit — it was the confluence of factors. Gas pressure creeping up + three workers entering a confined space + shift changeover + a hot-work permit being prepared next door. **Safentra detects the *pattern*, not just the threshold.**

---

## 💡 Proposed Solution

Safentra models the plant as a live knowledge graph and continuously runs causal subgraph matching to find dangerous patterns encoded from real incident investigations. 

### Six AI Agents Working in Concert

| Agent | Codename | Role | Key Capability |
|-------|----------|------|----------------|
| **ARGUS** | 🧠 **Knowledge Graph** | In-memory plant graph + 13 compound risk patterns | Evaluates patterns every 500ms; temporal smoothing |
| **ATLAS** | 🗺️ **Live Visualization** | Plant map with risk heatmap, worker dots | Real-time WebSocket-driven UI |
| **SHIELD** | 🛡️ **Permit Intelligence** | Context-aware permit validation | Blocks hot work if adjacent gas elevated |
| **ORACLE** | 🔮 **Regulatory RAG Agent**| RAG over DGMS/OISD corpus (Nemotron AI) | Answers safety queries with regulatory citations |
| **BLAZE** | 🚨 **Emergency Orchestrator**| DGFASLI-compliant incident report & evac | One-click emergency report and alerts |
| **FORGE** | 🔨 **Pattern Discovery** | Mines free-text near-miss reports | NLP extraction to candidate patterns |

---

## ✨ Features

- **🕸️ Knowledge Graph**: In-memory graph (Zones ↔ Sensors ↔ Workers ↔ Permits).
- **📊 13 Compound Patterns**: Codified from DGMS/OISD + Vizag; each with regulatory citation & risk score.
- **📈 Temporal Risk Smoothing**: EMA (α=0.3) + 3-tick confirmation window prevents flicker.
- **💰 Safety Debt Tracking**: Time-integrated risk accumulation per zone.
- **⛓️ Hash-Chained Audit Ledger**: Tamper-evident log (SHA-256 chain) of every event, permit action, and sensor reading.
- **🌐 Real-time WebSocket**: 500ms state broadcast; auto-reconnect.
- **🎭 Chaos/War-Room Mode**: Live scenario injection API.
- **🏭 Multi-Plant Configurator**: JSON Schema-driven plant onboarding.
- **📱 Mobile QR Checkpoint**: PWA where a field worker scans QR → SHIELD validates permit → clear/block.
- **🗣️ Voice Alerts**: Web Speech API announces critical alerts hands-free.

---

## 🏗️ Architecture Overview

### Complete System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[🌐 Web Dashboard<br/>React + Vite + D3]
        Mobile[📱 Mobile Checkpoint PWA]
    end

    subgraph "API Gateway"
        WS[🔌 WebSocket Server<br/>500ms Broadcast Loop]
        REST[🌐 REST API<br/>Express + CORS]
    end

    subgraph "Core Engine (Node.js/TypeScript)"
        Graph[🧠 PlantGraph]
        Patterns[🔍 PatternMatcher]
        Risk[📈 RiskScorer]
        Debt[💰 SafetyDebtTracker]
        Ledger[⛓️ HashChain Ledger]
    end

    subgraph "AI Agents"
        ARGUS[ARGUS]
        ATLAS[ATLAS]
        SHIELD[SHIELD]
        ORACLE[ORACLE]
        BLAZE[BLAZE]
        FORGE[FORGE]
    end

    subgraph "Data Layer"
        Types[📦 @safentra/types]
        Config[📋 Plant Configs]
        Corpus[📚 Regulatory Corpus]
    end

    Web <---> WS
    Mobile <---> REST
    WS --> Graph
    REST --> Graph
    Graph --> Patterns & Risk & Debt & Ledger
    Patterns --> ARGUS
    Risk --> ARGUS
    Debt --> ARGUS
    Ledger --> ARGUS
    ARGUS --> ATLAS
    SHIELD --> Graph
    ORACLE --> Corpus & Graph
    BLAZE --> Graph & Ledger
    FORGE --> Graph
    Graph --> Types
    Config --> Graph
```

### Data Flow

```mermaid
flowchart TD
    Sensors[📡 Sensor Telemetry] --> WS[🔌 WebSocket Ingestion]
    Workers[👷 Worker Positioning] --> WS
    Permits[📋 Permit System] --> REST[🌐 REST API]
    Shift[🔄 Shift Roster] --> WS
    NearMiss[📝 Near-Miss Reports] --> REST
    
    WS --> Graph[🧠 PlantGraph]
    REST --> Graph
    
    Graph --> Patterns[🔍 PatternMatcher]
    Patterns --> Risk[📈 RiskScorer]
    Risk --> Debt[💰 SafetyDebtTracker]
    Debt --> Ledger[⛓️ HashChain Audit Trail]
    
    Ledger --> Agents[🤖 AI Agents: ARGUS, SHIELD, ORACLE, BLAZE, FORGE]
    Agents --> OutWS[📡 WebSocket Broadcast]
    Agents --> OutREST[🌐 REST Response]
    
    OutWS --> Web[🌐 Web Dashboard]
    OutREST --> Web
    OutREST --> Mobile[📱 Mobile Checkpoint]
```

### Application Workflow (Real-Time Risk Detection)

```mermaid
sequenceDiagram
    participant Sensor as 📡 Sensor
    participant WS as 🔌 WebSocket
    participant Graph as 🧠 PlantGraph
    participant Pattern as 🔍 PatternMatcher
    participant Risk as 📈 RiskScorer
    participant ARGUS as 🤖 ARGUS Agent
    participant UI as 🌐 Dashboard

    Sensor->>WS: Sensor reading (2s tick)
    WS->>Graph: updateSensor(id, value)
    Graph->>Pattern: evaluateAll()
    Pattern->>Pattern: Check 13 compound patterns
    Pattern-->>Graph: RiskEvent[]
    Graph->>Risk: update(zoneId, patternScore)
    Risk->>Risk: EMA smoothing + confirmation
    Risk-->>Graph: smoothedRiskScore
    ARGUS->>UI: Broadcast via WebSocket (500ms)
    UI->>UI: Re-render map, panels, voice alerts
```

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, Vite 8.1, TailwindCSS 3.4, D3.js, Recharts, Zustand 5, Three.js, Lucide React |
| **Backend** | Node.js 20, Express, WebSocket (ws), TypeScript 5.4 |
| **AI / ML** | NVIDIA Nemotron AI API (via Anthropic SDK layer), RAG |
| **Database** | In-memory Knowledge Graph, Hash-Chain Ledger (Append-Only Audit Trail) |
| **DevOps & Tooling** | Concurrently, UUID, Ajv (JSON Schema), Dotenv |

---

## 📂 Folder Structure

| Path | Description |
|------|-------------|
| `apps/server/` | Backend (Node.js/Express/WebSocket, AI Agents, Graph Engine, Ledgers) |
| `apps/web/` | Web Dashboard (React, Vite, D3, Recharts, Zustand) |
| `apps/mobile-checkpoint/` | Mobile PWA (QR Scanner, SHIELD validation) |
| `packages/types/` | Shared TypeScript interfaces and definitions |
| `data/corpus/` | RAG regulatory documents (OISD, Factory Act, etc.) |
| `data/plant-configs/` | JSON Plant configurations and layouts |
| `data/scenarios/` | Timeline events for Simulation & Chaos Mode |

---

## ⚙️ Environment Variables

The project uses a monorepo setup with separate `.env` files. 

**Server (`apps/server/.env`)**
```env
PORT=3001
NODE_ENV=production
CORS_ORIGINS=http://localhost:5173
NEMOTRON_API_KEY=nvapi-XXXX-XXXX-XXXX
```

**Web (`apps/web/.env`)**
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v20+)
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vishallakshmikanthan/Safentra.git
   cd Safentra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Update `apps/server/.env` with your API keys.
   - Update `apps/web/.env` to point to the server.

4. **Run the Application (Development Mode):**
   ```bash
   npm run dev
   ```
   *This concurrently starts both the server and the web dashboard.*

### Build for Production
```bash
npm run build
```

---

## 📡 API Documentation

### WebSocket Events (ws://localhost:3001)
- `state_update`: Emitted every 500ms containing complete graph state.
- `risk_event`: Emitted when a compound pattern matches.
- `permit_blocked`: Broadcast when SHIELD intercepts a permit.

### REST Endpoints (http://localhost:3001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/permits` | Submit a new permit for SHIELD validation |
| `POST` | `/api/checkpoint/scan` | Field worker QR scan |
| `POST` | `/api/oracle/query` | RAG query over safety regulations |
| `POST` | `/api/forge/submit-near-miss`| Submit a near-miss report for pattern discovery |
| `POST` | `/api/simulation/start` | Trigger a pre-recorded incident timeline |
| `GET`  | `/api/ledger/verify` | Verify the SHA-256 hash-chain audit trail |

---

## 🔮 Future Improvements

1. **IoT Edge Integration:** Connect real OPC-UA/MQTT ingestion streams directly from industrial PLC systems.
2. **Multi-Tenancy (SaaS):** Expand from a single plant environment to RBAC controlled multi-tenant workspaces.
3. **Advanced AI Vision:** Incorporate edge computer vision to augment worker positioning and PPE detection.

---

<div align="center">
  <i>Built with ❤️ for safety by Team VibeSync</i>
</div>
