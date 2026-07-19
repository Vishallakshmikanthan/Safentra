import { PlantGraph } from '../graph/PlantGraph';
import { PatternMatcher } from '../graph/PatternMatcher';
import { RiskScorer } from '../graph/RiskScorer';
import { SafetyDebt } from '../graph/SafetyDebt';
import { HashChain } from '../ledger/HashChain';
import { Worker, ChaosInjection, SimulationState, ChaosState, AgentStatus } from '@safentra/types';
export declare class PlantWebSocketServer {
    private wss;
    private clients;
    private graph;
    private patternMatcher;
    private riskScorer;
    private safetyDebt;
    private tickInterval;
    private tickRate;
    private simulationState;
    private chaosState;
    private agentStatuses;
    private readonly ledger;
    private readonly activeRiskSignatures;
    constructor(server: any, graph: PlantGraph);
    private initializeAgentStatuses;
    private setupWebSocketServer;
    private handleMessage;
    private handlePermitAction;
    private handleWorkerMove;
    private handleChaosInjection;
    private applyChaosInjection;
    private applySensorSpike;
    private applyWorkerIncapacitated;
    private applyPermitConflict;
    private applySensorFailure;
    private applyZoneIsolation;
    private applyGasLeak;
    private applyFireOutbreak;
    private applyEquipmentFailure;
    private removeChaosInjection;
    private handleSimulationControl;
    private handleOracleQuery;
    private simulateOracleResponse;
    private handleForgeSubmission;
    private handleCheckpointScan;
    private handleAgentTrigger;
    private updateAgentStatus;
    startTickLoop(): void;
    stopTickLoop(): void;
    private tick;
    private runSimulationStep;
    private processSimulationEvent;
    private broadcastState;
    private broadcast;
    private sendToClient;
    getConnectedClients(): number;
    getSimulationState(): SimulationState;
    getChaosState(): ChaosState;
    getAgentStatuses(): AgentStatus[];
    getGraph(): PlantGraph;
    getPatternMatcher(): PatternMatcher;
    getRiskScorer(): RiskScorer;
    getSafetyDebt(): SafetyDebt;
    getLedger(): HashChain;
    /** REST-safe command entry points; the WebSocket protocol uses the same logic. */
    permitAction(payload: {
        permitId: string;
        action: 'approve' | 'block' | 'revoke';
        reason?: string;
    }): void;
    moveWorker(payload: {
        workerId: string;
        zoneId: string;
        position: {
            x: number;
            y: number;
        };
        status: Worker['status'];
    }): void;
    injectChaos(payload: ChaosInjection): void;
    controlSimulation(payload: {
        action: 'start' | 'stop' | 'pause' | 'speed';
        scenarioId?: string;
        speed?: number;
    }): void;
    updateSensor(sensorId: string, value: number): boolean;
    setShiftChangeover(active: boolean): void;
}
//# sourceMappingURL=PlantWebSocketServer.d.ts.map