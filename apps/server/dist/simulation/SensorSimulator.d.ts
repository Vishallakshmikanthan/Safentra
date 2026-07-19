import { EventEmitter } from 'events';
import { PlantGraph } from '../graph/PlantGraph.js';
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
export declare class SensorSimulator extends EventEmitter {
    private graph;
    private profiles;
    private currentValues;
    private baselines;
    private driftOffsets;
    private dangerMode;
    private dangerActivatedAt;
    private recoveryStartedAt;
    private recoveryStartValues;
    private dangerEventsEmitted;
    private tickInterval;
    private driftInterval;
    readonly TICK_MS = 2000;
    constructor(graph: PlantGraph);
    private initProfiles;
    /**
     * Box-Muller transform — produces normally distributed random numbers.
     * Never use Math.random() directly for sensor simulation: it produces
     * flat (uniform) noise which doesn't match real sensor behaviour.
     */
    private gaussianNoise;
    /**
     * Compute sensor value in normal (safe) mode.
     * Baseline drifts slowly; Gaussian noise applied on top.
     */
    private computeNormalValue;
    /**
     * Exponential approach toward danger target.
     * tau = 15s → ramp feels like a real, slow gas build-up.
     */
    private computeDangerValue;
    /**
     * Exponential return to baseline after danger mode is deactivated.
     * tau = 10s — faster recovery than ramp.
     */
    private computeRecoveryValue;
    private updateDrift;
    private checkDangerEvents;
    private tick;
    start(): void;
    stop(): void;
    setDangerMode(active: boolean): void;
    isDangerMode(): boolean;
    getDangerElapsedSeconds(): number;
    getCurrentReadings(): Record<string, number>;
}
//# sourceMappingURL=SensorSimulator.d.ts.map