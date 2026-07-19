import { PlantGraph } from './PlantGraph';
import { PatternResult } from '@safentra/types';
export declare class PatternMatcher {
    private graph;
    constructor(graph: PlantGraph);
    evaluateAll(): PatternResult[];
    evaluateZone(zoneId: string): PatternResult[];
    private pattern1_GasElevationHotWork;
    private pattern2_ConfinedSpaceGasElevation;
    private pattern3_ShiftChangeoverActivePermits;
    private pattern4_MultiZoneGasMigration;
    private pattern5_WorkerIsolationGasAlarm;
    private pattern6_TemperatureRiseGasPressure;
    private pattern7_PermitConflict;
    private pattern8_SensorDriftNoCalibration;
    private pattern9_ConveyorProximityWorker;
    private pattern10_OxygenDepletionConfinedSpace;
    private pattern11_CumulativeSafetyDebt;
    private pattern12_VizagFourCondition;
    private pattern13_CompoundRiskEscalation;
    private createEmptyResult;
    getCompoundRiskScore(zoneId: string): number;
    getAllMatchedPatterns(): PatternResult[];
}
//# sourceMappingURL=PatternMatcher.d.ts.map