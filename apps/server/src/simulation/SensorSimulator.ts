import { EventEmitter } from 'events';
import { PlantGraph } from '../graph/PlantGraph.js';

interface SensorProfile {
  sensorId: string;        // matches existing PlantGraph sensor IDs (sensor-1 … sensor-16)
  baseline: number;        // center of normal range
  noiseStdDev: number;     // σ for Gaussian noise
  driftRate: number;       // max units per hour of random walk
  normalMin: number;
  normalMax: number;
  alarmThreshold: number;
  dangerTarget: number;    // target value in danger mode (must stay < alarmThreshold * 0.96)
  isO2: boolean;           // O2 sensors alarm BELOW threshold (depletion), not above
  correlatesWith?: string; // sensor ID to correlate with
  correlationCoeff?: number;
}

/**
 * SensorSimulator — continuous, realistic industrial sensor simulation.
 *
 * Normal mode:  Gaussian noise + slow random-walk drift.  Values stay within safe range.
 * Danger mode:  Exponential ramp toward "elevated-but-not-alarming" targets.
 *               Timed events fire autonomously to build the Vizag compound pattern:
 *                 T+8s  → shift changeover
 *                 T+18s → hot work permit in zone-1
 *                 T+28s → worker-1 enters confined space
 *                 T+33s → worker-2 enters confined space
 *                 T+38s → worker-3 enters confined space  (Pattern 12 fires after this)
 * Recovery:     Faster exponential return to baseline when danger mode is deactivated.
 */
export class SensorSimulator extends EventEmitter {
  private graph: PlantGraph;
  private profiles: SensorProfile[];
  private currentValues: Map<string, number> = new Map();
  private baselines: Map<string, number> = new Map();
  private driftOffsets: Map<string, number> = new Map();

  private dangerMode: boolean = false;
  private dangerActivatedAt: number = 0;
  private recoveryStartedAt: number = 0;
  private recoveryStartValues: Map<string, number> = new Map();
  private dangerEventsEmitted: Set<string> = new Set();

  private tickInterval: NodeJS.Timeout | null = null;
  private driftInterval: NodeJS.Timeout | null = null;
  readonly TICK_MS = 2000;

  constructor(graph: PlantGraph) {
    super();
    this.graph = graph;
    this.profiles = this.initProfiles();

    // Initialise current values to baselines
    for (const p of this.profiles) {
      this.currentValues.set(p.sensorId, p.baseline);
      this.baselines.set(p.sensorId, p.baseline);
      this.driftOffsets.set(p.sensorId, 0);
    }
  }

  // ─── Profile definitions ────────────────────────────────────────────────────
  private initProfiles(): SensorProfile[] {
    return [
      // zone-1 (Coke Oven Battery 1) — primary danger zone for Pattern 12
      {
        sensorId: 'S-C1-VOC',       // gas_pressure
        baseline: 1.25,
        noiseStdDev: 0.015,
        driftRate: 0.05,
        normalMin: 1.0,
        normalMax: 1.5,
        alarmThreshold: 2.0,
        dangerTarget: 1.75,         // elevated, clearly above normal (1.5), well below alarm (2.0)
        isO2: false,
        correlatesWith: 'S-C2-GAS',
        correlationCoeff: 0.55,
      },
      {
        sensorId: 'S-C1-H2S',       // h2s_concentration
        baseline: 5.0,
        noiseStdDev: 0.25,
        driftRate: 0.8,
        normalMin: 0,
        normalMax: 10,
        alarmThreshold: 20,
        dangerTarget: 14.5,         // well elevated, below alarm at 20
        isO2: false,
      },
      {
        sensorId: 'S-C1-CO',       // co_concentration
        baseline: 15.0,
        noiseStdDev: 0.6,
        driftRate: 1.5,
        normalMin: 0,
        normalMax: 25,
        alarmThreshold: 50,
        dangerTarget: 36.0,         // elevated, below alarm at 50
        isO2: false,
      },
      {
        sensorId: 'S-C1-TMP',       // temperature
        baseline: 45.0,
        noiseStdDev: 0.5,
        driftRate: 2.0,
        normalMin: 30,
        normalMax: 60,
        alarmThreshold: 80,
        dangerTarget: 68.0,         // clearly elevated, below alarm at 80
        isO2: false,
      },
      // zone-2 (Coke Oven Battery 2)
      {
        sensorId: 'S-C2-GAS',       // gas_pressure
        baseline: 1.1,
        noiseStdDev: 0.012,
        driftRate: 0.04,
        normalMin: 1.0,
        normalMax: 1.5,
        alarmThreshold: 2.0,
        dangerTarget: 1.42,         // slightly elevated in adjacent zone
        isO2: false,
        correlatesWith: 'S-C1-VOC',
        correlationCoeff: 0.55,
      },
      {
        sensorId: 'S-C2-H2S',       // h2s_concentration
        baseline: 3.0,
        noiseStdDev: 0.18,
        driftRate: 0.5,
        normalMin: 0,
        normalMax: 10,
        alarmThreshold: 20,
        dangerTarget: 8.5,          // moderate elevation
        isO2: false,
      },
      {
        sensorId: 'S-C2-CO',       // co_concentration
        baseline: 10.0,
        noiseStdDev: 0.4,
        driftRate: 1.0,
        normalMin: 0,
        normalMax: 25,
        alarmThreshold: 50,
        dangerTarget: 22.0,         // near top of normal
        isO2: false,
      },
      {
        sensorId: 'S-C2-TMP',       // temperature
        baseline: 42.0,
        noiseStdDev: 0.4,
        driftRate: 1.5,
        normalMin: 30,
        normalMax: 60,
        alarmThreshold: 80,
        dangerTarget: 55.0,         // elevated but not alarming
        isO2: false,
      },
      // zone-3 (Gas Holder)
      {
        sensorId: 'S-C3-GAS',       // gas_pressure
        baseline: 0.8,
        noiseStdDev: 0.02,
        driftRate: 0.03,
        normalMin: 0.5,
        normalMax: 1.2,
        alarmThreshold: 1.5,
        dangerTarget: 1.15,         // elevated
        isO2: false,
      },
      {
        sensorId: 'S-C3-H2S',      // h2s_concentration
        baseline: 2.0,
        noiseStdDev: 0.1,
        driftRate: 0.3,
        normalMin: 0,
        normalMax: 5,
        alarmThreshold: 15,
        dangerTarget: 4.2,          // approaching upper normal, not alarming
        isO2: false,
      },
      {
        sensorId: 'S-C3-O2',      // oxygen_level
        baseline: 20.9,
        noiseStdDev: 0.05,
        driftRate: 0.1,
        normalMin: 19.5,
        normalMax: 23.5,
        alarmThreshold: 19.0,       // alarm is BELOW this (depletion)
        dangerTarget: 20.1,         // slightly reduced — gas displacing oxygen
        isO2: true,
      },
      // zone-4 (Maintenance Bay)
      {
        sensorId: 'S-C4-GAS',      // h2s_concentration
        baseline: 1.0,
        noiseStdDev: 0.06,
        driftRate: 0.2,
        normalMin: 0,
        normalMax: 5,
        alarmThreshold: 10,
        dangerTarget: 3.8,          // minimal change
        isO2: false,
      },
      {
        sensorId: 'S-C4-TMP',      // oxygen_level
        baseline: 20.9,
        noiseStdDev: 0.05,
        driftRate: 0.08,
        normalMin: 19.5,
        normalMax: 23.5,
        alarmThreshold: 19.0,
        dangerTarget: 20.3,
        isO2: true,
      },
      // zone-5 (Control Room)
      {
        sensorId: 'S-C5-O2',      // oxygen_level
        baseline: 20.9,
        noiseStdDev: 0.04,
        driftRate: 0.05,
        normalMin: 19.5,
        normalMax: 23.5,
        alarmThreshold: 19.0,
        dangerTarget: 20.8,         // almost unchanged — control room is isolated
        isO2: true,
      },
      // zone-6 (Entry Point)
      {
        sensorId: 'S-C5-PRX',      // proximity
        baseline: 0,
        noiseStdDev: 0,
        driftRate: 0,
        normalMin: 0,
        normalMax: 2,
        alarmThreshold: 0.5,
        dangerTarget: 0,            // no change
        isO2: false,
      },
      {
        sensorId: 'S-C6-FLW',      // flow_rate
        baseline: 100,
        noiseStdDev: 1.5,
        driftRate: 3.0,
        normalMin: 80,
        normalMax: 120,
        alarmThreshold: 150,
        dangerTarget: 112.0,        // slight increase — pressure pushing more flow
        isO2: false,
      },
    ];
  }

  // ─── Noise & math helpers ────────────────────────────────────────────────────

  /**
   * Box-Muller transform — produces normally distributed random numbers.
   * Never use Math.random() directly for sensor simulation: it produces
   * flat (uniform) noise which doesn't match real sensor behaviour.
   */
  private gaussianNoise(stdDev: number): number {
    if (stdDev === 0) return 0;
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev;
  }

  /**
   * Compute sensor value in normal (safe) mode.
   * Baseline drifts slowly; Gaussian noise applied on top.
   */
  private computeNormalValue(profile: SensorProfile): number {
    const drift = this.driftOffsets.get(profile.sensorId) ?? 0;
    const driftedBaseline = profile.baseline + drift;
    const noised = driftedBaseline + this.gaussianNoise(profile.noiseStdDev);

    // Occasional measurement spike: 0.5% chance per tick
    const value = Math.random() < 0.005
      ? noised + this.gaussianNoise(profile.noiseStdDev * 4)
      : noised;

    if (profile.isO2) {
      // O2: clamp to [alarm+1, normalMax*1.02] — never deplete in normal mode
      return Math.max(profile.alarmThreshold + 1.0, Math.min(profile.normalMax * 1.02, value));
    }
    // Clamp to [normalMin * 0.95, alarmThreshold * 0.90] in normal mode
    return Math.max(profile.normalMin * 0.95, Math.min(profile.alarmThreshold * 0.90, value));
  }

  /**
   * Exponential approach toward danger target.
   * tau = 15s → ramp feels like a real, slow gas build-up.
   */
  private computeDangerValue(profile: SensorProfile, elapsedSeconds: number): number {
    const tau = 15;
    const progress = 1 - Math.exp(-elapsedSeconds / tau);
    const targetDelta = profile.dangerTarget - profile.baseline;
    const rampedValue = profile.baseline + targetDelta * progress;

    const noised = rampedValue + this.gaussianNoise(profile.noiseStdDev);

    if (profile.isO2) {
      // O2 in danger: ramp DOWN toward dangerTarget — clamp so we don't alarm
      const minSafe = profile.alarmThreshold + 0.15; // never cross alarm
      return Math.max(minSafe, Math.min(profile.normalMax, noised));
    }
    // Safety clamp: NEVER exceed 96% of alarm threshold
    const maxSafe = profile.alarmThreshold * 0.96;
    return Math.max(profile.normalMin * 0.8, Math.min(maxSafe, noised));
  }

  /**
   * Exponential return to baseline after danger mode is deactivated.
   * tau = 10s — faster recovery than ramp.
   */
  private computeRecoveryValue(profile: SensorProfile, startValue: number, elapsedSinceRecovery: number): number {
    const tau = 10;
    const progress = 1 - Math.exp(-elapsedSinceRecovery / tau);
    const recovered = startValue + (profile.baseline - startValue) * progress;
    return recovered + this.gaussianNoise(profile.noiseStdDev);
  }

  // ─── Drift update (runs every 30s) ──────────────────────────────────────────
  private updateDrift(): void {
    for (const p of this.profiles) {
      if (p.driftRate === 0) continue;
      const current = this.driftOffsets.get(p.sensorId) ?? 0;
      // Random walk: drift rate is max per hour → per 30s step = rate/120
      const step = this.gaussianNoise(p.driftRate / 120);
      // Keep drift within ±5% of range
      const maxDrift = (p.normalMax - p.normalMin) * 0.05;
      const newDrift = Math.max(-maxDrift, Math.min(maxDrift, current + step));
      this.driftOffsets.set(p.sensorId, newDrift);
    }
  }

  // ─── Timed danger events ─────────────────────────────────────────────────────
  private checkDangerEvents(elapsedSeconds: number): void {
    if (!this.dangerMode) return;

    // T+8s: Shift changeover & Chaos injection
    if (elapsedSeconds >= 8 && !this.dangerEventsEmitted.has('shift')) {
      this.dangerEventsEmitted.add('shift');
      this.graph.setShiftChangeover(true);
      this.emit('agent_activity', {
        type: 'chaos_update',
        payload: {
          activeInjections: [{
            id: 'chaos-1',
            type: 'sensor_failure',
            zoneId: 'C1',
            severity: 'low',
            injectedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 60000).toISOString()
          }],
          history: []
        },
        timestamp: new Date().toISOString()
      });
      console.log('[SensorSimulator] T+8s: Shift changeover & Chaos activated');
    }

    // T+18s: Hot work permit in zone-1 & Forge Candidate
    if (elapsedSeconds >= 18 && !this.dangerEventsEmitted.has('permit')) {
      this.dangerEventsEmitted.add('permit');
      this.graph.addPermit({
        id: 'AUTO-HW-001',
        type: 'hot_work',
        zoneId: 'C1',
        requestedBy: 'Auto-scenario (welding repair)',
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        regulatoryRef: 'OISD-GDN-169 Clause 6.1'
      });
      this.emit('agent_activity', {
        type: 'forge_candidate',
        payload: {
          candidates: [{
            pattern: {
              id: 'pat-cand-01',
              name: 'Elevated Gas + Hot Work',
              description: 'Welding near slightly elevated H2S levels during shift change.',
              conditions: ['H2S > 10ppm', 'Hot Work Active', 'Shift Change'],
              frequency: 3,
              lastSeen: new Date().toISOString(),
              status: 'candidate',
              sourceReports: []
            },
            confidence: 0.82,
            suggestedPatternId: 'vizag-early-warning',
            matchedReports: []
          }],
          approvalHistory: [],
          rejectionHistory: []
        },
        timestamp: new Date().toISOString()
      });
      console.log('[SensorSimulator] T+18s: Hot work permit AUTO-HW-001 issued for zone-1 & Forge candidate created');
    }

    // T+28s: Worker 1 enters confined space & Oracle springs to life
    if (elapsedSeconds >= 28 && !this.dangerEventsEmitted.has('confined-1')) {
      this.dangerEventsEmitted.add('confined-1');
      this.graph.moveWorker('worker-1', 'C1', { x: 155, y: 140 }, 'in_confined_space');
      this.emit('agent_activity', {
        type: 'oracle_update',
        payload: {
          isActive: true,
          recommendations: ['Halt hot work in Zone 1 immediately', 'Evacuate confined space'],
          regulations: ['OISD-STD-105 Clause 4.2: Confined space entry during concurrent hot work'],
          historicalIncidents: ['Bhilai Steel Plant Gas Leak (2014)'],
          explanation: 'Sensors show H2S rising rapidly while a worker is in a confined space and a hot work permit is active. This creates a severe compound risk.',
          affectedSensors: ['S-C1-H2S', 'S-C1-CO'],
          affectedPermits: ['AUTO-HW-001'],
          workersAtRisk: ['worker-1'],
          confidence: 0.94,
          sources: ['Live telemetry', 'Permit ledger'],
          conversationHistory: [{ role: 'assistant', text: 'Warning: I am tracking a rapidly developing compound risk in Coke Oven Battery 1.' }]
        },
        timestamp: new Date().toISOString()
      });
      console.log('[SensorSimulator] T+28s: worker-1 entered confined space in zone-1 & Oracle activated');
    }

    // T+33s: Worker 2 enters confined space
    if (elapsedSeconds >= 33 && !this.dangerEventsEmitted.has('confined-2')) {
      this.dangerEventsEmitted.add('confined-2');
      this.graph.moveWorker('worker-2', 'C2', { x: 160, y: 145 }, 'in_confined_space');
      console.log('[SensorSimulator] T+33s: worker-2 entered confined space in zone-2');
    }

    // T+38s: Worker 3 — Pattern 12 fires after this tick & Blaze triggers
    if (elapsedSeconds >= 38 && !this.dangerEventsEmitted.has('confined-3')) {
      this.dangerEventsEmitted.add('confined-3');
      this.graph.moveWorker('worker-3', 'C3', { x: 158, y: 150 }, 'in_confined_space');
      this.emit('agent_activity', {
        type: 'blaze_update',
        payload: {
          isActive: true,
          incidentTimeline: [
            { time: new Date(Date.now() - 30000).toISOString(), description: 'Anomalous gas readings detected', status: 'completed' },
            { time: new Date(Date.now() - 20000).toISOString(), description: 'Hot work permit activated concurrently', status: 'completed' },
            { time: new Date(Date.now() - 10000).toISOString(), description: 'Workers entered confined space', status: 'completed' },
            { time: new Date().toISOString(), description: 'Pattern 12 triggered - Evacuation initiated', status: 'in_progress' }
          ],
          evacuationStatus: 'ordered',
          emergencyContactsNotified: ['Plant Manager', 'Safety Officer (On Duty)', 'Fire Brigade'],
          affectedWorkers: ['worker-1', 'worker-2', 'worker-3'],
          assemblyPoints: [{ id: 'AP-1', name: 'North Gate', capacity: 50, currentCount: 12 }],
          incidentReport: null,
          actionChecklist: [
            { id: 'a1', description: 'Sound site-wide alarm', completed: true },
            { id: 'a2', description: 'Revoke all active permits in Zone 1', completed: false },
            { id: 'a3', description: 'Dispatch rescue team to confined space', completed: false }
          ],
          resourceAllocation: [{ resource: 'Ambulance 1', status: 'en_route' }, { resource: 'Hazmat Team Alpha', status: 'dispatched' }],
          responseStatus: 'ESCALATED TO LEVEL 3',
          countdownTimer: 300
        },
        timestamp: new Date().toISOString()
      });
      console.log('[SensorSimulator] T+38s: worker-3 entered confined space — VIZAG PATTERN CONDITIONS MET & Blaze activated');
    }
  }

  // ─── Main tick ───────────────────────────────────────────────────────────────
  private tick(): void {
    const now = Date.now();
    const elapsedDanger = this.dangerMode ? (now - this.dangerActivatedAt) / 1000 : 0;
    const elapsedRecovery = (!this.dangerMode && this.recoveryStartedAt > 0)
      ? (now - this.recoveryStartedAt) / 1000
      : 0;

    // Compute correlation offsets first (correlated sensors computed from each other's baseline)
    const correlationOffsets: Map<string, number> = new Map();
    for (const p of this.profiles) {
      if (p.correlatesWith && p.correlationCoeff) {
        const partnerValue = this.currentValues.get(p.correlatesWith) ?? 0;
        const partnerProfile = this.profiles.find(pr => pr.sensorId === p.correlatesWith);
        if (partnerProfile) {
          const partnerDelta = partnerValue - partnerProfile.baseline;
          correlationOffsets.set(p.sensorId, partnerDelta * p.correlationCoeff);
        }
      }
    }

    const snapshot: Record<string, number> = {};

    for (const p of this.profiles) {
      let newValue: number;

      if (this.dangerMode) {
        newValue = this.computeDangerValue(p, elapsedDanger);
      } else if (elapsedRecovery > 0) {
        const startVal = this.recoveryStartValues.get(p.sensorId) ?? p.baseline;
        newValue = this.computeRecoveryValue(p, startVal, elapsedRecovery);
        // Once recovered (within 2% of baseline), clear recovery state for this sensor
        if (Math.abs(newValue - p.baseline) < (p.normalMax - p.normalMin) * 0.02) {
          this.recoveryStartValues.delete(p.sensorId);
        }
      } else {
        newValue = this.computeNormalValue(p);
      }

      // Add correlation offset in normal mode only (danger mode controls directly)
      if (!this.dangerMode && elapsedRecovery === 0) {
        const corrOffset = correlationOffsets.get(p.sensorId) ?? 0;
        newValue += corrOffset;
        // Re-clamp after correlation
        if (p.isO2) {
          newValue = Math.max(p.alarmThreshold + 1.0, Math.min(p.normalMax * 1.02, newValue));
        } else {
          newValue = Math.max(p.normalMin * 0.95, Math.min(p.alarmThreshold * 0.90, newValue));
        }
      }

      // Round to 2 decimal places for display cleanliness
      newValue = Math.round(newValue * 100) / 100;

      this.currentValues.set(p.sensorId, newValue);
      this.graph.updateSensor(p.sensorId, newValue);
      snapshot[p.sensorId] = newValue;
    }

    // Check timed danger events
    if (this.dangerMode) {
      this.checkDangerEvents(elapsedDanger);
    }

    // Emit tick with current readings
    this.emit('tick', snapshot);
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  start(): void {
    if (this.tickInterval) return; // already running

    // Start sensor tick loop
    this.tickInterval = setInterval(() => this.tick(), this.TICK_MS);

    // Start slow drift update (every 30 seconds)
    this.driftInterval = setInterval(() => this.updateDrift(), 30_000);

    // Fire first tick immediately so the UI gets data right away
    this.tick();

    console.log('[SensorSimulator] Started — 2s tick loop running, normal mode');
  }

  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.driftInterval) {
      clearInterval(this.driftInterval);
      this.driftInterval = null;
    }
    console.log('[SensorSimulator] Stopped');
  }

  setDangerMode(active: boolean): void {
    if (active && !this.dangerMode) {
      this.dangerMode = true;
      this.dangerActivatedAt = Date.now();
      this.recoveryStartedAt = 0;
      this.dangerEventsEmitted.clear();
      this.emit('mode_change', 'danger');
      console.log('[SensorSimulator] DANGER MODE activated — sensor anomaly ramp started');

    } else if (!active && this.dangerMode) {
      this.dangerMode = false;
      this.recoveryStartedAt = Date.now();

      // Snapshot current values as recovery start points
      this.recoveryStartValues.clear();
      for (const p of this.profiles) {
        this.recoveryStartValues.set(p.sensorId, this.currentValues.get(p.sensorId) ?? p.baseline);
      }

      this.dangerEventsEmitted.clear();

      // Reset plant state — workers return to active, permits cleared, shift off
      this.graph.setShiftChangeover(false);
      this.graph.moveWorker('worker-1', 'C1', { x: 150, y: 150 }, 'active');
      this.graph.moveWorker('worker-2', 'C2', { x: 400, y: 150 }, 'active');
      this.graph.moveWorker('worker-3', 'C4', { x: 400, y: 350 }, 'active');

      // Remove auto-injected permit
      const permit = this.graph.getPermit('AUTO-HW-001');
      if (permit) {
        this.graph.updatePermitStatus('AUTO-HW-001', 'revoked');
      }

      // Reset AI Agents
      this.emit('agent_activity', { type: 'oracle_update', payload: { isActive: false }, timestamp: new Date().toISOString() });
      this.emit('agent_activity', { type: 'blaze_update', payload: { isActive: false }, timestamp: new Date().toISOString() });
      this.emit('agent_activity', { type: 'forge_candidate', payload: { candidates: [], approvalHistory: [], rejectionHistory: [] }, timestamp: new Date().toISOString() });
      this.emit('agent_activity', { type: 'chaos_update', payload: { activeInjections: [], history: [] }, timestamp: new Date().toISOString() });

      this.emit('mode_change', 'normal');
      console.log('[SensorSimulator] Normal mode — sensors & agents returning to baseline');
    }
  }

  isDangerMode(): boolean {
    return this.dangerMode;
  }

  getDangerElapsedSeconds(): number {
    if (!this.dangerMode || this.dangerActivatedAt === 0) return 0;
    return Math.floor((Date.now() - this.dangerActivatedAt) / 1000);
  }

  getCurrentReadings(): Record<string, number> {
    const out: Record<string, number> = {};
    this.currentValues.forEach((v, k) => { out[k] = v; });
    return out;
  }
}
