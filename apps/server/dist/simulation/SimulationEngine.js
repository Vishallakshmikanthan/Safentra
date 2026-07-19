"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SCENARIOS = exports.VIZAG_SCENARIO = exports.SimulationEngine = void 0;
class SimulationEngine {
    state = {
        running: false,
        currentTime: 0,
        speed: 1,
        scenarioId: null,
        events: [],
        eventIndex: 0
    };
    graph;
    tickCallback = null;
    eventCallback = null;
    constructor(graph) {
        this.graph = graph;
    }
    setTickCallback(callback) {
        this.tickCallback = callback;
    }
    setEventCallback(callback) {
        this.eventCallback = callback;
    }
    loadScenario(scenario) {
        this.state.scenarioId = scenario.id;
        this.state.events = [...scenario.events].sort((a, b) => a.timestamp - b.timestamp);
        this.state.eventIndex = 0;
        this.state.currentTime = 0;
        this.state.running = false;
    }
    start() {
        if (this.state.events.length === 0) {
            console.warn('No scenario loaded');
            return;
        }
        this.state.running = true;
    }
    pause() {
        this.state.running = false;
    }
    reset() {
        this.state.running = false;
        this.state.currentTime = 0;
        this.state.eventIndex = 0;
    }
    setSpeed(speed) {
        this.state.speed = Math.max(0.1, Math.min(10, speed));
    }
    tick(tickIntervalMs) {
        if (!this.state.running)
            return;
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
            }
            else {
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
    processEvent(event) {
        const payload = event.payload;
        switch (event.type) {
            case 'sensor_change': {
                const sensorPayload = payload;
                this.graph.updateSensor(sensorPayload.sensorId, sensorPayload.value);
                break;
            }
            case 'worker_move': {
                const workerPayload = payload;
                this.graph.moveWorker(workerPayload.workerId, workerPayload.zoneId, workerPayload.position, workerPayload.status);
                break;
            }
            case 'permit_request':
                // Permit requests are handled via SHIELD agent
                break;
            case 'chaos_inject':
                // Chaos injections handled by ChaosEngine
                break;
            case 'shift_change': {
                const shiftPayload = payload;
                this.graph.setShiftChangeover(shiftPayload.active);
                break;
            }
        }
    }
    getState() {
        return { ...this.state };
    }
    getCurrentEvent() {
        if (this.state.eventIndex < this.state.events.length) {
            return this.state.events[this.state.eventIndex];
        }
        return null;
    }
    getProgress() {
        if (this.state.events.length === 0)
            return 0;
        return (this.state.eventIndex / this.state.events.length) * 100;
    }
}
exports.SimulationEngine = SimulationEngine;
// Vizag Gas Leak Scenario - 12 events over 41.5 seconds
exports.VIZAG_SCENARIO = {
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
exports.DEFAULT_SCENARIOS = [exports.VIZAG_SCENARIO];
//# sourceMappingURL=SimulationEngine.js.map