import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { LiveAlertFeed } from './LiveAlertFeed';
import { SensorTelemetryTable } from './SensorTelemetryTable';
import { AtlasSectorMap } from '../Atlas/AtlasSectorMap';
import { RiskConvergenceRing } from '../Shared/RiskConvergenceRing';

export const CommandCentre: React.FC = () => {
  const zones = usePlantStore(state => state.zones);
  const workers = usePlantStore(state => state.workers);
  const permits = usePlantStore(state => state.permits);
  const sensors = usePlantStore(state => state.sensors);
  const shiftChangeover = usePlantStore(state => state.shiftChangeover);
  const triggerCriticalEvent = usePlantStore(state => state.triggerCriticalEvent);

  const activeWorkersCount = Object.values(workers).filter(w => w.status === 'active').length;
  const activePermitsCount = Object.values(permits).filter(p => p.status === 'active').length;
  const sensorElevationsCount = Object.values(sensors).filter(s => s.status === 'elevated' || s.status === 'alarm').length;
  
  // Highest risk score
  const maxRisk = Math.max(...Object.values(zones).map(z => z.riskScore));
  const maxRiskPercent = Math.round(maxRisk * 100);

  const riskFactors = [
    { name: 'Live Compound Risk', impact: Math.round(maxRisk * 100), color: '#ba1a1a' },
    { name: 'Shift Changeover', impact: shiftChangeover ? 30 : 0, color: '#fdb244' },
    { name: 'Active Permits', impact: Math.min(25, activePermitsCount * 8), color: '#ffffff' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* System Health Metrics Bar */}
      <div className="grid grid-cols-4 border-b border-primary bg-surface shrink-0">
        <div className="border-r border-primary p-4 flex flex-col justify-between h-24 bg-surface-variant">
          <span className="font-label-caps text-label-caps text-on-surface uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span> Total Risk Score
          </span>
          <div className="flex items-end gap-2" onClick={triggerCriticalEvent}>
            <span className={`font-data-lg text-[32px] leading-none font-bold ${maxRiskPercent > 80 ? 'text-error' : 'text-primary'}`}>{maxRiskPercent}</span>
            <span className="font-data-md text-data-md text-on-surface-variant mb-1">/100</span>
          </div>
        </div>
        <div className="border-r border-primary p-4 flex flex-col justify-between h-24">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">group</span> Active Workers
          </span>
          <span className="font-data-lg text-[32px] leading-none text-primary">{activeWorkersCount}</span>
        </div>
        <div className="border-r border-primary p-4 flex flex-col justify-between h-24">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">sensors</span> Sensor Elevations
          </span>
          <span className={`font-data-lg text-[32px] leading-none ${sensorElevationsCount > 0 ? 'text-secondary-container' : 'text-primary'}`}>{sensorElevationsCount}</span>
        </div>
        <div className="p-4 flex flex-col justify-between h-24">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">assignment</span> Active Permits
          </span>
          <span className="font-data-lg text-[32px] leading-none text-primary">{activePermitsCount}</span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Live Alert Feed */}
        <LiveAlertFeed />

        {/* Center: ATLAS Heatmap */}
        <div className="flex-1 flex flex-col border-r border-primary bg-background relative overflow-hidden">
          <AtlasSectorMap />
        </div>

        {/* Right: Sensors & Risk Card */}
        <div className="w-96 flex flex-col bg-surface shrink-0">
          <SensorTelemetryTable />
          <RiskConvergenceRing score={maxRiskPercent} factors={riskFactors} />
        </div>
      </div>
    </div>
  );
};
