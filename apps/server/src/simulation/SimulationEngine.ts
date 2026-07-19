import { SimulationState, SimulationEvent, SimulationScenario, Zone, Sensor, Worker, Permit } from '@safentra/types';
import { PlantGraph } from '../graph/PlantGraph';

// Type-safe event payloads
interface SensorChangePayload {
  sensorId: string;
  value: number;
}

interface WorkerMovePayload {
  workerId: string;
  zoneId: string;
  position: { x: number; y: number };
  status: Worker['status'];
}

interface ShiftChangePayload {
  active: boolean;
}

interface PermitRequestPayload {
  permitId: string;
  action: 'approve' | 'block' | 'revoke';
}

interface ChaosInjectPayload {
  type: string;
  zoneId: string;
  parameters: Record<string, unknown>;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

type SimulationEventPayload = 
  | SensorChangePayload 
  | WorkerMovePayload 
  | ShiftChangePayload 
  | PermitRequestPayload 
  | ChaosInjectPayload 
  | Record<string, unknown>;

export class SimulationEngine {
  private state: SimulationState = {
    running: false,
    currentTime: 0,
    speed: 1,
    scenarioId: null,
    events: [],
    eventIndex: 0
  };

  private graph: PlantGraph;
  private tickCallback: ((state: SimulationState) => void) | null = null;
  private eventCallback: ((event: SimulationEvent) => void) | null = null;

  constructor(graph: PlantGraph) {
    this.graph = graph;
  }

  setTickCallback(callback: (state: SimulationState) => void): void {
    this.tickCallback = callback;
  }

  setEventCallback(callback: (event: SimulationEvent) => void): void {
    this.eventCallback = callback;
  }

  loadScenario(scenario: SimulationScenario): void {
    this.state.scenarioId = scenario.id;
    this.state.events = [...scenario.events].sort((a, b) => a.timestamp - b.timestamp);
    this.state.eventIndex = 0;
    this.state.currentTime = 0;
    this.state.running = false;
  }

  start(): void {
    if (this.state.events.length === 0) {
      console.warn('No scenario loaded');
      return;
    }
    this.state.running = true;
  }

  pause(): void {
    this.state.running = false;
  }

  reset(): void {
    this.state.running = false;
    this.state.currentTime = 0;
    this.state.eventIndex = 0;
  }

  setSpeed(speed: number): void {
    this.state.speed = Math.max(0.1, Math.min(10, speed));
  }

  tick(tickIntervalMs: number): void {
    if (!this.state.running) return;

    this.state.currentTime += tickIntervalMs * this.state.speed;

    // Process events that are due
    while (this.state.eventIndex < this.state.events.length) {
      const event = this.state.events[this.state.eventIndex];
      if (event.timestamp <= this.state.currentTime) {
        this.processEvent(event);
        this.state.eventIndex++;
        if (this.eventCallback) {
          this.eventCallback(event);
        }
      } else {
        break;
      }
    }

    // Check if scenario is complete
    if (this.state.eventIndex >= this.state.events.length) {
      this.state.running = false;
    }

    if (this.tickCallback) {
      this.tickCallback(this.state);
    }
  }

  private processEvent(event: SimulationEvent): void {
    const payload = event.payload as SimulationEventPayload;
    
    switch (event.type) {
      case 'sensor_change': {
        const sensorPayload = payload as SensorChangePayload;
        this.graph.updateSensor(sensorPayload.sensorId, sensorPayload.value);
        break;
      }
      case 'worker_move': {
        const workerPayload = payload as WorkerMovePayload;
        this.graph.moveWorker(
          workerPayload.workerId,
          workerPayload.zoneId,
          workerPayload.position,
          workerPayload.status
        );
        break;
      }
      case 'permit_request':
        // Permit requests are handled via SHIELD agent
        break;
      case 'chaos_inject':
        // Chaos injections handled by ChaosEngine
        break;
      case 'shift_change': {
        const shiftPayload = payload as ShiftChangePayload;
        this.graph.setShiftChangeover(shiftPayload.active);
        break;
      }
    }
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  getCurrentEvent(): SimulationEvent | null {
    if (this.state.eventIndex < this.state.events.length) {
      return this.state.events[this.state.eventIndex];
    }
    return null;
  }

  getProgress(): number {
    if (this.state.events.length === 0) return 0;
    return (this.state.eventIndex / this.state.events.length) * 100;
  }
}

// Vizag Gas Leak Scenario - 12 events over 41.5 seconds
export const VIZAG_SCENARIO: SimulationScenario = {
  id: 'vizag-gas-leak-2020',
  name: 'Vizag Gas Leak 2020 - Styrene Monomer Release',
  description: 'Replay of the LG Polymers styrene monomer gas leak incident, May 7, 2020',
  plantConfigId: 'coke-oven-plant-1',
  duration: 41500, // 41.5 seconds at 1x speed
  expectedOutcomes: [
    'Pattern 12 (Vizag 4-Condition) detected',
    'Pattern 1 (Gas Elevation + Hot Work) detected',
    'Pattern 6 (Temperature Rise + Gas Pressure) detected',
    'BLAZE emergency report generated',
    'SHIELD permit blocks activated',
    'Safety debt accumulation in affected zones'
  ],
  events: [
    // T+0s: Initial conditions - normal operations
    {
      id: 'evt-1',
      type: 'sensor_change',
      timestamp: 0,
      payload: { sensorId: 'sensor-2', value: 5 } // H2S baseline
    },
    {
      id: 'evt-2',
      type: 'sensor_change',
      timestamp: 0,
      payload: { sensorId: 'sensor-3', value: 15 } // CO baseline
    },
    {
      id: 'evt-3',
      type: 'sensor_change',
      timestamp: 0,
      payload: { sensorId: 'sensor-4', value: 45 } // Temperature baseline
    },

    // T+5s: Temperature starts rising (polymerization beginning)
    {
      id: 'evt-4',
      type: 'sensor_change',
      timestamp: 5000,
      payload: { sensorId: 'sensor-4', value: 55 }
    },

    // T+10s: Gas pressure rising
    {
      id: 'evt-5',
      type: 'sensor_change',
      timestamp: 10000,
      payload: { sensorId: 'sensor-1', value: 1.8 }
    },

    // T+15s: H2S spike - first detection
    {
      id: 'evt-6',
      type: 'sensor_change',
      timestamp: 15000,
      payload: { sensorId: 'sensor-2', value: 25 }
    },

    // T+20s: CO rising rapidly
    {
      id: 'evt-7',
      type: 'sensor_change',
      timestamp: 20000,
      payload: { sensorId: 'sensor-3', value: 45 }
    },

    // T+25s: Temperature critical - polymerization runaway
    {
      id: 'evt-8',
      type: 'sensor_change',
      timestamp: 25000,
      payload: { sensorId: 'sensor-4', value: 85 }
    },

    // T+30s: Gas pressure exceeds relief valve
    {
      id: 'evt-9',
      type: 'sensor_change',
      timestamp: 30000,
      payload: { sensorId: 'sensor-1', value: 2.5 }
    },

    // T+35s: H2S at lethal levels
    {
      id: 'evt-10',
      type: 'sensor_change',
      timestamp: 35000,
      payload: { sensorId: 'sensor-2', value: 150 }
    },

    // T+40s: CO at lethal levels
    {
      id: 'evt-11',
      type: 'sensor_change',
      timestamp: 40000,
      payload: { sensorId: 'sensor-3', value: 200 }
    },

    // T+41.5s: Shift changeover - outgoing shift leaves, incoming not briefed
    {
      id: 'evt-12',
      type: 'shift_change',
      timestamp: 41500,
      payload: { active: true }
    }
  ]
};

export const DEFAULT_SCENARIOS: SimulationScenario[] = [VIZAG_SCENARIO];