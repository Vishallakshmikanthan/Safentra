import { SimulationState, SimulationEvent, SimulationScenario } from '@safentra/types';
import { PlantGraph } from '../graph/PlantGraph';
export declare class SimulationEngine {
    private state;
    private graph;
    private tickCallback;
    private eventCallback;
    constructor(graph: PlantGraph);
    setTickCallback(callback: (state: SimulationState) => void): void;
    setEventCallback(callback: (event: SimulationEvent) => void): void;
    loadScenario(scenario: SimulationScenario): void;
    start(): void;
    pause(): void;
    reset(): void;
    setSpeed(speed: number): void;
    tick(tickIntervalMs: number): void;
    private processEvent;
    getState(): SimulationState;
    getCurrentEvent(): SimulationEvent | null;
    getProgress(): number;
}
export declare const VIZAG_SCENARIO: SimulationScenario;
export declare const DEFAULT_SCENARIOS: SimulationScenario[];
//# sourceMappingURL=SimulationEngine.d.ts.map