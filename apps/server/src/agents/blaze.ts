import { randomUUID } from 'node:crypto';
import type { BlazeResponse, PlantState, RiskEvent, WebSocketMessage } from '@safentra/types';
import { PlantGraph } from '../graph/PlantGraph';
import { HashChain } from '../ledger/HashChain';
import { completeWithNemotron, isNemotronConfigured } from './nemotronClient';

export class BlazeAgent {
  private triggeredThisSession = false;

  constructor(private readonly graph: PlantGraph, private readonly ledger: HashChain) {}

  resetSession(): void {
    this.triggeredThisSession = false;
  }

  async trigger(riskEvent: RiskEvent, broadcast: (message: WebSocketMessage) => void): Promise<BlazeResponse | null> {
    if (this.triggeredThisSession) return null;
    this.triggeredThisSession = true;

    const plantState = this.graph.getState();
    const response = await this.buildResponse(riskEvent, plantState);
    const entry = this.ledger.append('blaze_triggered', response);

    broadcast({ type: 'blaze_triggered', payload: response, timestamp: new Date().toISOString() });
    broadcast({ type: 'blaze_update', payload: this.toPanelState(response), timestamp: new Date().toISOString() });
    broadcast({ type: 'ledger_entry', payload: entry, timestamp: new Date().toISOString() });

    return response;
  }

  private async buildResponse(riskEvent: RiskEvent, plantState: PlantState): Promise<BlazeResponse> {
    const capturedAt = new Date().toISOString();
    const zoneIds = [riskEvent.zoneId, ...((plantState.zones[riskEvent.zoneId]?.adjacentZones) ?? [])].slice(0, 3);
    const workers = Object.values(plantState.workers);
    const sensors = Object.values(plantState.sensors);
    const permits = Object.values(plantState.permits).filter(permit => permit.status === 'active');

    const evidenceSnapshot = {
      capturedAt,
      sensorReadings: sensors.map(sensor => ({
        sensorId: sensor.id,
        type: sensor.type,
        value: Number(sensor.currentValue.toFixed(3)),
        unit: sensor.unit,
        status: sensor.status,
        zone: sensor.zoneId
      })),
      activePermits: permits.map(permit => ({
        id: permit.id,
        type: permit.type,
        zone: permit.zoneId,
        requestedBy: permit.requestedBy
      })),
      workersPresent: workers.map(worker => ({
        id: worker.id,
        name: worker.name,
        zone: worker.currentZoneId,
        status: worker.status,
        role: worker.role
      })),
      shiftChangeover: plantState.shiftChangeover
    };

    const primarySensors = evidenceSnapshot.sensorReadings
      .filter(sensor => sensor.zone === riskEvent.zoneId)
      .map(sensor => `${sensor.sensorId} ${sensor.value}${sensor.unit} (${sensor.status})`)
      .join(', ') || 'no sensors in trigger zone';
    const exposedWorkers = evidenceSnapshot.workersPresent.filter(worker => zoneIds.includes(worker.zone));

    const incidentReport = await this.generateIncidentReport(riskEvent, capturedAt, primarySensors, exposedWorkers.length);

    return {
      incidentId: randomUUID(),
      triggeredAt: capturedAt,
      triggerZone: riskEvent.zoneId,
      riskScore: riskEvent.riskScore,
      patternTriggered: riskEvent.patternMatched,
      evacuationSequence: zoneIds.map((zoneId, index) => ({
        zone: zoneId,
        priority: index + 1,
        headcount: workers.filter(worker => worker.currentZoneId === zoneId).length,
        instruction: index === 0 ? 'Evacuate exposed personnel immediately via controlled exit' : 'Stop work and withdraw to assembly point',
        exitRoute: index === 0 ? 'North gate via corridor B, assembly point AP-1' : 'South gate via corridor D, assembly point AP-2'
      })),
      alertMessages: [
        {
          role: 'Safety Officer',
          priority: 1,
          message: `CRITICAL: Compound risk in ${riskEvent.zoneId}. Initiate evacuation and block re-entry.`,
          contactMethod: 'Radio Channel 3'
        },
        {
          role: 'Plant Manager',
          priority: 2,
          message: `BLAZE active for ${riskEvent.zoneId}. Halt production and preserve logs.`,
          contactMethod: 'Direct call'
        },
        {
          role: 'Medical Team',
          priority: 2,
          message: `Stand by at AP-1 for possible exposure. Track ${exposedWorkers.length} worker(s).`,
          contactMethod: 'PA System'
        },
        {
          role: 'Fire Brigade',
          priority: 3,
          message: 'Gas hazard escalation possible. Stage response team and foam line.',
          contactMethod: 'Emergency line'
        }
      ],
      incidentReport,
      immediateActions: [
        `1. Announce emergency evacuation for Zone ${riskEvent.zoneId}`,
        '2. Suspend hot work and confined-space permits in affected zones',
        '3. Dispatch rescue and gas-testing team to controlled entry point',
        '4. Isolate gas and ignition sources from the affected battery',
        '5. Account for workers at assembly points within 10 minutes',
        '6. Preserve sensor, permit, and worker movement records',
        '7. Permit re-entry only after atmospheric testing is normal'
      ],
      evidenceSnapshot
    };
  }

  /** Real Nemotron-generated DGFASLI-style report when configured; deterministic
   * template fallback otherwise. Never throws. */
  private async generateIncidentReport(
    riskEvent: RiskEvent,
    capturedAt: string,
    primarySensors: string,
    exposedWorkerCount: number
  ): Promise<string> {
    if (isNemotronConfigured()) {
      const llmReport = await completeWithNemotron({
        system: `You are BLAZE, the emergency-orchestration agent for Safentra, an industrial safety platform. Generate a preliminary DGFASLI-format incident report for a confirmed compound-risk event. Be factual, terse, and operational — this is read by a plant manager during an active emergency. Use the exact structure: Date/Time, Location, Nature, Personnel at Risk, Sensor Evidence, Contributing Factors, Regulatory References, Status. Do not add commentary outside this structure.`,
        user: `Event: ${riskEvent.patternMatched}
Time: ${new Date(capturedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Zone: ${riskEvent.zoneId}
Risk score: ${(riskEvent.riskScore * 100).toFixed(0)}%
Sensor evidence: ${primarySensors}
Contributing factors: ${riskEvent.contributingFactors.join('; ')}
Workers at risk: ${exposedWorkerCount}`,
        maxTokens: 400,
        temperature: 0.2
      });
      if (llmReport) return llmReport;
    }

    return [
      'PRELIMINARY INCIDENT REPORT',
      `Date/Time: ${new Date(capturedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      `Location: Coke Oven Battery Complex, Zone ${riskEvent.zoneId}, Visakhapatnam`,
      `Nature: Compound hazard detected by ARGUS (${riskEvent.patternDescription})`,
      `Personnel at Risk: ${exposedWorkerCount} worker(s) in trigger or adjacent zones`,
      `Sensor Evidence: ${primarySensors}`,
      `Contributing Factors: ${riskEvent.contributingFactors.join('; ')}`,
      'Regulatory References: OISD-GDN-169 Clause 4.3; OISD-STD-105 Clause 6.2; Factories Act 1948 Section 41G',
      'Status: Emergency response active. DGFASLI notification package prepared.'
    ].join('\n');
  }

  private toPanelState(response: BlazeResponse) {
    return {
      isActive: true,
      incidentTimeline: [
        { time: response.triggeredAt, description: `ARGUS confirmed ${response.patternTriggered}`, status: 'completed' as const },
        { time: response.triggeredAt, description: 'BLAZE generated evacuation sequence', status: 'completed' as const },
        { time: response.triggeredAt, description: 'Emergency command package active', status: 'in_progress' as const }
      ],
      evacuationStatus: 'ordered' as const,
      emergencyContactsNotified: response.alertMessages.map(alert => alert.role),
      affectedWorkers: response.evidenceSnapshot.workersPresent
        .filter(worker => worker.zone === response.triggerZone)
        .map(worker => worker.id),
      assemblyPoints: [{ id: 'AP-1', name: 'North Gate', capacity: 50, currentCount: 0 }],
      incidentReport: response.incidentReport,
      actionChecklist: response.immediateActions.map((description, index) => ({
        id: `blaze-action-${index + 1}`,
        description,
        completed: index < 2
      })),
      resourceAllocation: [
        { resource: 'Rescue Team Alpha', status: 'dispatched' as const },
        { resource: 'Ambulance 1', status: 'en_route' as const },
        { resource: 'Gas Testing Kit', status: 'arrived' as const }
      ],
      responseStatus: 'BLAZE ACTIVE',
      countdownTimer: 600,
      response
    };
  }
}
