import { PlantGraph } from './PlantGraph';
import { PatternResult, Zone, Sensor, Worker, Permit, RiskEvent } from '@safentra/types';

export class PatternMatcher {
  private graph: PlantGraph;

  constructor(graph: PlantGraph) {
    this.graph = graph;
  }

  evaluateAll(): PatternResult[] {
    const results: PatternResult[] = [];
    const zones = this.graph.getAllZones();

    for (const zone of zones) {
      const zoneResults = this.evaluateZone(zone.id);
      results.push(...zoneResults);
    }

    return results;
  }

  evaluateZone(zoneId: string): PatternResult[] {
    const results: PatternResult[] = [];
    const zone = this.graph.getZone(zoneId);
    if (!zone) return results;

    // Pattern 1: Gas Elevation + Hot Work
    results.push(this.pattern1_GasElevationHotWork(zone));
    
    // Pattern 2: Confined Space + Gas Elevation
    results.push(this.pattern2_ConfinedSpaceGasElevation(zone));
    
    // Pattern 3: Shift Changeover + Active Permits
    results.push(this.pattern3_ShiftChangeoverActivePermits(zone));
    
    // Pattern 4: Multi-Zone Gas Migration
    results.push(this.pattern4_MultiZoneGasMigration(zone));
    
    // Pattern 5: Worker Isolation + Gas Alarm
    results.push(this.pattern5_WorkerIsolationGasAlarm(zone));
    
    // Pattern 6: Temperature Rise + Gas Pressure
    results.push(this.pattern6_TemperatureRiseGasPressure(zone));
    
    // Pattern 7: Permit Conflict (Hot Work + Confined Space)
    results.push(this.pattern7_PermitConflict(zone));
    
    // Pattern 8: Sensor Drift + No Calibration
    results.push(this.pattern8_SensorDriftNoCalibration(zone));
    
    // Pattern 9: Conveyor Proximity + Worker Presence
    results.push(this.pattern9_ConveyorProximityWorker(zone));
    
    // Pattern 10: Oxygen Depletion + Confined Space
    results.push(this.pattern10_OxygenDepletionConfinedSpace(zone));
    
    // Pattern 11: Cumulative Safety Debt Threshold
    results.push(this.pattern11_CumulativeSafetyDebt(zone));
    
    // Pattern 12: Vizag 4-Condition Pattern (Gas + Shift + Hot Work + Confined)
    results.push(this.pattern12_VizagFourCondition(zone));
    
    // Pattern 13: Compound Risk Escalation (Risk Score Acceleration)
    results.push(this.pattern13_CompoundRiskEscalation(zone));

    return results;
  }

  // Pattern 1: Gas Elevation + Hot Work
  private pattern1_GasElevationHotWork(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    const gasSensors = sensors.filter(s => 
      s.type === 'h2s_concentration' || s.type === 'gas_pressure' || s.type === 'co_concentration'
    );
    const hasGasElevation = gasSensors.some(s => s.status === 'elevated' || s.status === 'alarm');
    const hasHotWork = this.graph.hasActiveHotWork(zone.id);

    const matched = hasGasElevation && hasHotWork;
    const confidence = matched ? 0.85 : 0;
    const factors: string[] = [];
    if (hasGasElevation) factors.push('Gas sensor elevated/alarm');
    if (hasHotWork) factors.push('Active hot work permit');

    return {
      patternId: 'P1',
      patternName: 'Gas Elevation + Hot Work',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.35 : 0
    };
  }

  // Pattern 2: Confined Space + Gas Elevation
  private pattern2_ConfinedSpaceGasElevation(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    const gasSensors = sensors.filter(s => 
      s.type === 'h2s_concentration' || s.type === 'co_concentration' || s.type === 'oxygen_level'
    );
    const hasGasElevation = gasSensors.some(s => s.status === 'elevated' || s.status === 'alarm');
    const hasConfinedSpace = this.graph.hasConfinedSpaceEntry(zone.id);

    const matched = hasGasElevation && hasConfinedSpace;
    const confidence = matched ? 0.9 : 0;
    const factors: string[] = [];
    if (hasGasElevation) factors.push('Toxic gas elevated in confined space');
    if (hasConfinedSpace) factors.push('Active confined space entry permit');

    return {
      patternId: 'P2',
      patternName: 'Confined Space + Gas Elevation',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.4 : 0
    };
  }

  // Pattern 3: Shift Changeover + Active Permits
  private pattern3_ShiftChangeoverActivePermits(zone: Zone): PatternResult {
    const isShiftChangeover = this.graph.isShiftChangeover();
    const activePermits = this.graph.getPermitsByZone(zone.id).filter(p => p.status === 'active');
    const hasActivePermits = activePermits.length > 0;

    const matched = isShiftChangeover && hasActivePermits;
    const confidence = matched ? 0.75 : 0;
    const factors: string[] = [];
    if (isShiftChangeover) factors.push('Shift changeover active');
    if (hasActivePermits) factors.push(`${activePermits.length} active permit(s) during handover`);

    return {
      patternId: 'P3',
      patternName: 'Shift Changeover + Active Permits',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.25 : 0
    };
  }

  // Pattern 4: Multi-Zone Gas Migration
  private pattern4_MultiZoneGasMigration(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    const gasSensors = sensors.filter(s => 
      s.type === 'h2s_concentration' || s.type === 'gas_pressure'
    );
    const localElevated = gasSensors.some(s => s.status === 'elevated' || s.status === 'alarm');
    
    if (!localElevated) {
      return this.createEmptyResult('P4', 'Multi-Zone Gas Migration', zone.id);
    }

    // Check adjacent zones for rising gas
    const adjacentZones = this.graph.getAdjacentZones(zone.id);
    let adjacentElevated = 0;
    for (const adjZone of adjacentZones) {
      const adjSensors = this.graph.getSensorsByZone(adjZone.id);
      const adjGas = adjSensors.filter(s => 
        s.type === 'h2s_concentration' || s.type === 'gas_pressure'
      );
      if (adjGas.some(s => s.status === 'elevated' || s.status === 'alarm')) {
        adjacentElevated++;
      }
    }

    const matched = adjacentElevated >= 1;
    const confidence = matched ? 0.7 : 0;
    const factors: string[] = [];
    if (localElevated) factors.push('Local gas elevation detected');
    if (adjacentElevated > 0) factors.push(`${adjacentElevated} adjacent zone(s) with gas elevation`);

    return {
      patternId: 'P4',
      patternName: 'Multi-Zone Gas Migration',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.3 : 0
    };
  }

  // Pattern 5: Worker Isolation + Gas Alarm
  private pattern5_WorkerIsolationGasAlarm(zone: Zone): PatternResult {
    const workers = this.graph.getWorkersByZone(zone.id);
    const activeWorkers = workers.filter(w => w.status === 'active' || w.status === 'in_confined_space');
    const isolatedWorkers = activeWorkers.filter(w => 
      w.status === 'in_confined_space' || 
      (zone.hazardClass === 'A' && activeWorkers.length <= 2)
    );
    
    const sensors = this.graph.getSensorsByZone(zone.id);
    const hasGasAlarm = sensors.some(s => 
      (s.type === 'h2s_concentration' || s.type === 'co_concentration' || s.type === 'oxygen_level') 
      && s.status === 'alarm'
    );

    const matched = isolatedWorkers.length > 0 && hasGasAlarm;
    const confidence = matched ? 0.95 : 0;
    const factors: string[] = [];
    if (isolatedWorkers.length > 0) factors.push(`${isolatedWorkers.length} isolated worker(s) in zone`);
    if (hasGasAlarm) factors.push('Gas alarm active');

    return {
      patternId: 'P5',
      patternName: 'Worker Isolation + Gas Alarm',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.5 : 0
    };
  }

    // Pattern 6: Temperature Rise + Gas Pressure
  private pattern6_TemperatureRiseGasPressure(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    const tempSensor = sensors.find(s => s.type === 'temperature');
    const pressureSensor = sensors.find(s => s.type === 'gas_pressure');
    
    const tempRising = tempSensor && tempSensor.status === 'elevated';
    const pressureHigh = pressureSensor && (pressureSensor.status === 'elevated' || pressureSensor.status === 'alarm');

    const matched = tempRising && pressureHigh;
    const confidence = matched ? 0.8 : 0;
    const factors: string[] = [];
    if (tempRising) factors.push('Temperature rising above normal');
    if (pressureHigh) factors.push('Gas pressure elevated');

    return {
      patternId: 'P6',
      patternName: 'Temperature Rise + Gas Pressure',
      zoneId: zone.id,
      matched: matched ?? false,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.3 : 0
    };
  }

  // Pattern 7: Permit Conflict (Hot Work + Confined Space)
  private pattern7_PermitConflict(zone: Zone): PatternResult {
    const permits = this.graph.getPermitsByZone(zone.id);
    const activePermits = permits.filter(p => p.status === 'active');
    const hasHotWork = activePermits.some(p => p.type === 'hot_work');
    const hasConfinedSpace = activePermits.some(p => p.type === 'confined_space_entry');

    const matched = hasHotWork && hasConfinedSpace;
    const confidence = matched ? 0.9 : 0;
    const factors: string[] = [];
    if (hasHotWork) factors.push('Active hot work permit');
    if (hasConfinedSpace) factors.push('Active confined space entry permit');

    return {
      patternId: 'P7',
      patternName: 'Permit Conflict: Hot Work + Confined Space',
      zoneId: zone.id,
      matched: matched ?? false,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.45 : 0
    };
  }

  // Pattern 8: Sensor Drift + No Calibration
  private pattern8_SensorDriftNoCalibration(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    // Simplified: check for sensors that have been elevated for extended period
    const staleElevated = sensors.filter(s => 
      s.status === 'elevated' && 
      (Date.now() - new Date(s.lastUpdated).getTime()) > 3600000 // 1 hour
    );

    const matched = staleElevated.length > 0;
    const confidence = matched ? 0.6 : 0;
    const factors: string[] = [];
    if (matched) factors.push(`${staleElevated.length} sensor(s) elevated for >1hr without resolution`);

    return {
      patternId: 'P8',
      patternName: 'Sensor Drift / Stale Elevated Reading',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.15 : 0
    };
  }

  // Pattern 9: Conveyor Proximity + Worker Presence
  private pattern9_ConveyorProximityWorker(zone: Zone): PatternResult {
    if (zone.type !== 'conveyor') {
      return this.createEmptyResult('P9', 'Conveyor Proximity + Worker', zone.id);
    }

    const sensors = this.graph.getSensorsByZone(zone.id);
    const proximitySensor = sensors.find(s => s.type === 'proximity');
    const workers = this.graph.getWorkersByZone(zone.id);
    const activeWorkers = workers.filter(w => w.status === 'active');

    const proximityTriggered = proximitySensor && proximitySensor.currentValue > 0;
    const workersPresent = activeWorkers.length > 0;

    const matched = proximityTriggered && workersPresent;
    const confidence = matched ? 0.85 : 0;
    const factors: string[] = [];
    if (proximityTriggered) factors.push('Proximity sensor triggered');
    if (workersPresent) factors.push(`${activeWorkers.length} worker(s) near conveyor`);

    return {
      patternId: 'P9',
      patternName: 'Conveyor Proximity + Worker Presence',
      zoneId: zone.id,
      matched: matched ?? false,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.3 : 0
    };
  }

  // Pattern 10: Oxygen Depletion + Confined Space
  private pattern10_OxygenDepletionConfinedSpace(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    const oxygenSensor = sensors.find(s => s.type === 'oxygen_level');
    const hasConfinedSpace = this.graph.hasConfinedSpaceEntry(zone.id);

    const oxygenLow = oxygenSensor !== undefined && oxygenSensor.currentValue < 19.5; // Below 19.5%
    const matched = oxygenLow && hasConfinedSpace;
    const confidence = matched ? 0.95 : 0;
    const factors: string[] = [];
    if (oxygenLow) factors.push(`Oxygen level at ${oxygenSensor?.currentValue.toFixed(1)}%`);
    if (hasConfinedSpace) factors.push('Confined space entry active');

    return {
      patternId: 'P10',
      patternName: 'Oxygen Depletion + Confined Space',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.5 : 0
    };
  }

  // Pattern 11: Cumulative Safety Debt Threshold
  private pattern11_CumulativeSafetyDebt(zone: Zone): PatternResult {
    const debtThreshold = 70;
    const matched = zone.safetyDebt >= debtThreshold;
    const confidence = matched ? 0.8 : 0;
    const factors: string[] = [];
    if (matched) factors.push(`Safety debt at ${zone.safetyDebt} (threshold: ${debtThreshold})`);

    return {
      patternId: 'P11',
      patternName: 'Cumulative Safety Debt Threshold',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.25 : 0
    };
  }

  // Pattern 12: Vizag 4-Condition Pattern (Gas + Shift + Hot Work + Confined Space)
  private pattern12_VizagFourCondition(zone: Zone): PatternResult {
    const sensors = this.graph.getSensorsByZone(zone.id);
    const gasSensors = sensors.filter(s => 
      s.type === 'h2s_concentration' || s.type === 'gas_pressure' || s.type === 'co_concentration'
    );
    const hasGasElevation = gasSensors.some(s => s.status === 'elevated' || s.status === 'alarm');
    const isShiftChangeover = this.graph.isShiftChangeover();
    const hasHotWork = this.graph.hasActiveHotWork(zone.id);
    const hasConfinedSpace = this.graph.hasConfinedSpaceEntry(zone.id);

    const conditions = [
      { name: 'Gas Elevation', met: hasGasElevation },
      { name: 'Shift Changeover', met: isShiftChangeover },
      { name: 'Hot Work', met: hasHotWork },
      { name: 'Confined Space Entry', met: hasConfinedSpace }
    ];

    const metCount = conditions.filter(c => c.met).length;
    const matched = metCount >= 3; // 3 out of 4 conditions
    const confidence = matched ? 0.95 : 0;
    const factors = conditions.filter(c => c.met).map(c => c.name);

    return {
      patternId: 'P12',
      patternName: 'Vizag 4-Condition Compound Pattern',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.6 : 0
    };
  }

  // Pattern 13: Compound Risk Escalation (Risk Score Acceleration)
  private pattern13_CompoundRiskEscalation(zone: Zone): PatternResult {
    // Check if risk score has accelerated (raw > smoothed significantly)
    const acceleration = zone.rawRiskScore - zone.riskScore;
    const matched = acceleration > 0.15 && zone.rawRiskScore > 0.5;
    const confidence = matched ? 0.75 : 0;
    const factors: string[] = [];
    if (matched) {
      factors.push(`Risk acceleration: ${acceleration.toFixed(2)} (raw: ${zone.rawRiskScore.toFixed(2)}, smoothed: ${zone.riskScore.toFixed(2)})`);
    }

    return {
      patternId: 'P13',
      patternName: 'Compound Risk Escalation',
      zoneId: zone.id,
      matched,
      confidence,
      contributingFactors: factors,
      riskContribution: matched ? 0.2 : 0
    };
  }

  private createEmptyResult(patternId: string, patternName: string, zoneId: string): PatternResult {
    return {
      patternId,
      patternName,
      zoneId,
      matched: false,
      confidence: 0,
      contributingFactors: [],
      riskContribution: 0
    };
  }

  // Get compound risk score for a zone (sum of matched pattern contributions)
  getCompoundRiskScore(zoneId: string): number {
    const results = this.evaluateZone(zoneId);
    const matchedResults = results.filter(r => r.matched);
    return matchedResults.reduce((sum, r) => sum + r.riskContribution, 0);
  }

  // Get all matched patterns across plant
  getAllMatchedPatterns(): PatternResult[] {
    return this.evaluateAll().filter(r => r.matched);
  }
}