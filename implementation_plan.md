# Implementation Plan

[Overview]
Transform the basic Safentra frontend into a complete production-ready compound risk detection platform with six AI agents, real-time WebSocket architecture, temporal risk smoothing, hash-chained audit ledger, mobile QR checkpoint, and FORGE pattern discovery agent.

Multiple paragraphs outlining the scope, context, and high-level approach. The current state has only a basic React frontend with mock data. The backend server, WebSocket infrastructure, knowledge graph engine (ARGUS), all six agents (ARGUS, ATLAS, ORACLE, SHIELD, BLAZE, FORGE), simulation engine, hash-chained ledger, mobile checkpoint PWA, and multi-plant configurator need to be built from scratch. The implementation follows the exact architecture specified in the Safentra-Build-Guide.md with 16 phases, preserving the existing UI design while adding all backend logic and real-time capabilities.

[Types]
Single sentence describing the type system changes.

Detailed type definitions are already defined in apps/web/src/types/index.ts and need to be mirrored in the backend packages/types. Key types include: Zone, Sensor, Worker, Permit, Equipment, PlantState, RiskEvent, Alert, PatternResult, WebSocketMessage, CandidatePattern (FORGE), LedgerEntry (HashChain), SafetyDebt metrics, ChaosInjection, and PlantConfig (multi-plant JSON schema). All types use strict TypeScript with discriminated unions for status fields and branded types for IDs.

[Files]
Single sentence describing file modifications.

Detailed breakdown:
- New files to be created:
  - apps/server/ (entire backend workspace)
    - src/index.ts - Express + WebSocket entry point
    - src/types/index.ts - Shared types (mirrored from web)
    - src/graph/PlantGraph.ts - In-memory knowledge graph
    - src/graph/PatternMatcher.ts - 13 compound risk patterns
    - src/graph/RiskScorer.ts - Temporal smoothing with confirmation window
    - src/graph/SafetyDebt.ts - Time-integrated risk accumulation
    - src/agents/oracle.ts - RAG agent with keyword retrieval
    - src/agents/blaze.ts - Emergency orchestrator with DGFASLI report
    - src/agents/forge.ts - Pattern discovery from near-miss reports
    - src/ledger/HashChain.ts - Tamper-evident audit trail
    - src/simulation/SimulationEngine.ts - Timeline event player
    - src/simulation/ChaosEngine.ts - Live scenario injection
    - src/routes/permits.ts - SHIELD permit API
    - src/routes/checkpoint.ts - Mobile QR checkpoint API
    - src/routes/simulation.ts - Simulation control API
    - src/routes/chaos.ts - Chaos injection API
    - src/routes/oracle.ts - ORACLE query API
    - src/routes/forge.ts - FORGE near-miss submission API
    - src/routes/ledger.ts - Ledger verification API
    - src/websocket/StateEmitter.ts - 500ms broadcast loop
  - apps/mobile-checkpoint/ (PWA for QR field checks)
    - src/App.tsx - Camera QR scanner + SHIELD check UI
    - src/useCamera.ts - html5-qrcode hook
  - data/corpus/ - 8 regulatory/incident markdown files
  - data/plant-configs/coke-oven-plant.json - Zone/sensor layout
  - data/plant-configs/schema.json - JSON Schema for plant onboarding
  - data/scenarios/vizag.json - 12-event Vizag replay timeline
  - data/scenarios/chaos-templates.json - Chaos mode templates
  - packages/types/ - Shared types package
- Existing files to be modified:
  - apps/web/src/App.tsx - Replace with CommandCentre layout
  - apps/web/src/main.tsx - Add providers
  - apps/web/src/store/plantStore.ts - Connect to WebSocket, add safetyDebt, voice alerts
  - apps/web/src/hooks/useWebSocket.ts - Auto-reconnect WebSocket client
  - apps/web/src/hooks/useVoiceAlerts.ts - Web Speech API for critical alerts
  - apps/web/src/components/CommandCentre/ - Add SafetyDebtPanel, AlertFeed
  - apps/web/src/components/Atlas/ - PlantMap with D3, ZonePolygon, WorkerDot
  - apps/web/src/components/Shield/ - PermitForm with real API, PermitValidator
  - apps/web/src/components/Oracle/ - OraclePanel chat interface
  - apps/web/src/components/Blaze/ - BlazePanel, IncidentReport
  - apps/web/src/components/Forge/ - NearMissSubmit, CandidatePatternReview
  - apps/web/src/components/Chaos/ - ChaosBuilder
  - apps/web/vite.config.ts - Proxy for API/WebSocket
  - package.json (root) - Add workspaces for server, mobile-checkpoint, packages
- Configuration file updates:
  - apps/server/tsconfig.json, package.json
  - apps/mobile-checkpoint/tsconfig.json, package.json, vite.config.ts
  - apps/web/tailwind.config.ts, vite.config.ts

[Functions]
Single sentence describing function modifications.

Detailed breakdown:
- New functions (name, signature, file path, purpose):
  - PlantGraph.updateSensor(id, value) - Mutate sensor reading, recalc zone risk
  - PlantGraph.moveWorker(id, zoneId, pos, status) - Track worker location/state
  - PlantGraph.addPermit(permit) - Insert permit, trigger SHIELD evaluation
  - PlantGraph.blockPermit(id, reason) - SHIELD block with regulatory citation
  - PlantGraph.setShiftChangeover(active) - Toggle shift changeover flag
  - PatternMatcher.evaluateAll() - Run all 13 patterns, return RiskEvent[]
  - PatternMatcher.evaluateZone(zoneId) - Compound scoring with boost
  - RiskScorer.update(zoneId, rawScore, patternId) - EMA + confirmation ticks
  - SafetyDebtTracker.accumulate(state) - Time-integrated debt per zone
  - SimulationEngine.start()/pause()/reset() - Timeline control
  - ChaosEngine.inject(scenario) - Live condition injection
  - OracleAgent.query(question, context) - RAG + Anthropic call
  - BlazeAgent.trigger(riskEvent) - Emergency orchestration + report
  - ForgeAgent.analyzeNearMiss(report, patterns) - Candidate pattern generation
  - HashChain.append(entry) - Add tamper-evident block
  - HashChain.verify() - Validate chain integrity
  - StateEmitter.broadcast() - 500ms WebSocket push
- Modified functions:
  - usePlantStore.updateSensor - Now calls backend via WebSocket
  - usePlantStore.addAlert - Receives from server broadcast
  - CommandCentre - Adds SafetyDebtPanel, real-time risk events
  - PlantMap - D3 rendering with risk color scale, pulsing critical zones
  - PermitForm - POST to /permits, show blocked reason from SHIELD
  - NearMissSubmit - POST to /forge/submit-near-miss
  - CandidatePatternReview - Approve/Reject FORGE candidates
  - ChaosBuilder - POST to /chaos/inject with live controls

[Classes]
Single sentence describing class modifications.

Detailed breakdown:
- New classes (name, file path, key methods, inheritance):
  - PlantGraph (src/graph/PlantGraph.ts) - Map-based graph, mutation + query methods
  - PatternMatcher (src/graph/PatternMatcher.ts) - 13 private pattern methods, evaluateAll()
  - RiskScorer (src/graph/RiskScorer.ts) - EMA smoothing, confirmation window tracking
  - SafetyDebtTracker (src/graph/SafetyDebt.ts) - Accumulator with decay
  - OracleAgent (src/agents/oracle.ts) - initCorpus(), query(), keyword retrieval
  - BlazeAgent (src/agents/blaze.ts) - trigger(), buildReport(), defensive JSON parse
  - ForgeAgent (src/agents/forge.ts) - analyzeNearMiss(), pattern comparison
  - HashChain (src/ledger/HashChain.ts) - append(), verify(), getRecent()
  - SimulationEngine (src/simulation/SimulationEngine.ts) - loadScenario(), tick()
  - ChaosEngine (src/simulation/ChaosEngine.ts) - inject(), sensor/worker/permit overrides
  - StateEmitter (src/websocket/StateEmitter.ts) - broadcast(), handleClient()
- Modified classes:
  - usePlantStore (Zustand store) - Add WebSocket connection, safetyDebt, voice alerts hook
  - PlantMap (React component) - Full D3 integration with zone polygons, worker dots

[Dependencies]
Single sentence describing dependency modifications.

Details of new packages, version changes, and integration requirements:
- Root: concurrently@8.2.0 for parallel dev servers
- apps/server: express@4.19, ws@8.17, @anthropic-ai/sdk@0.24, cors@2.8, dotenv@16.4, uuid@9.0, typescript@5.4, tsx@4.7, nodemon@3.1, ajv@8.12 (schema validation)
- apps/web: d3@7.9, @types/d3@7.4, recharts@2.12, zustand@4.5, clsx@2.1, date-fns@3.6 (already in package.json)
- apps/mobile-checkpoint: html5-qrcode@2.3.8, tailwindcss@3.4
- packages/types: typescript@5.4 (shared types only)
- No database, no vector store, no external blockchain - all in-memory + crypto module

[Testing]
Single sentence describing testing approach.

Test file requirements, existing test modifications, and validation strategies:
- Unit tests for PatternMatcher: each of 13 patterns with fixture states
- Unit tests for RiskScorer: EMA convergence, confirmation tick behavior
- Unit tests for HashChain: append/verify, tamper detection
- Integration test: SimulationEngine runs Vizag scenario, produces expected risk events
- E2E test: WebSocket connects, receives state_update, risk_event, permit_blocked
- Manual verification: Vizag replay reaches 94% risk at T+41.5s with 3-tick ramp
- Mobile checkpoint: QR scan → POST /checkpoint/scan → blocked/cleared UI
- FORGE: Submit near-miss → receive candidate → approve → Pattern 13 active
- Chaos Mode: Inject custom scenario → observe real-time pattern match
- Ledger: Verify endpoint returns valid=true, manual corruption returns false

[Implementation Order]
Single sentence describing the implementation sequence.

Numbered steps showing the logical order of changes to minimize conflicts and ensure successful integration:
1. Initialize monorepo structure: root package.json with workspaces, create apps/server, apps/mobile-checkpoint, packages/types, data directories
2. Create shared types package (packages/types) with all TypeScript interfaces
3. Build backend core: PlantGraph, PatternMatcher (13 patterns), RiskScorer, SafetyDebtTracker
4. Build WebSocket server (index.ts) with 500ms broadcast loop, StateEmitter
5. Build SimulationEngine with Vizag scenario JSON, ChaosEngine
6. Build agents: OracleAgent (RAG corpus), BlazeAgent, ForgeAgent
7. Build HashChain ledger with crypto module
8. Create all REST routes: permits, checkpoint, simulation, chaos, oracle, forge, ledger
9. Create data files: corpus (8 .md), plant-configs (coke-oven-plant.json, schema.json), scenarios (vizag.json, chaos-templates.json)
10. Update frontend: App.tsx → CommandCentre layout, connect usePlantStore to WebSocket
11. Build Atlas components: PlantMap (D3), ZonePolygon, WorkerDot with risk colors
12. Build CommandCentre components: SafetyDebtPanel (Recharts), AlertFeed, RiskTimeline
13. Build Shield components: PermitForm (real API), PermitValidator
14. Build Oracle components: OraclePanel, OracleResponse
15. Build Blaze components: BlazePanel, IncidentReport
16. Build Forge components: NearMissSubmit, CandidatePatternReview
17. Build Chaos components: ChaosBuilder
18. Add useVoiceAlerts hook with Web Speech API
19. Build mobile-checkpoint PWA: QR scanner, checkpoint UI
20. Configure Vite proxies, Tailwind, build scripts
21. End-to-end integration test: run dev, verify Vizag replay, SHIELD block, FORGE, Chaos, Ledger, Voice alerts
22. Deploy: Vercel (web + mobile), Railway (server)