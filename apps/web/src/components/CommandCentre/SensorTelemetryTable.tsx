import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const SensorTelemetryTable: React.FC = () => {
  const sensorMap = usePlantStore((state) => state.sensors);
  const sensors = Object.values(sensorMap);

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-primary">
      <div className="p-2 border-b border-primary bg-surface-variant flex justify-between items-center shrink-0">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Sensor Telemetry</span>
        <span className="font-data-md text-[10px] text-on-surface-variant">LIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Grid Header */}
        <div className="grid grid-cols-2 border-b border-outline bg-surface text-on-surface-variant font-label-caps text-[10px] uppercase sticky top-0 z-10">
          <div className="p-2 border-r border-outline">ID</div>
          <div className="p-2 text-right">Value</div>
        </div>
        {/* Data Rows */}
        {sensors.map(sensor => {
          const isError = sensor.status === 'alarm' || sensor.currentValue >= sensor.alarmThreshold;
          const isWarning = sensor.status === 'elevated' && !isError;
          
          return (
            <div key={sensor.id} className={`grid grid-cols-2 border-b border-outline relative ${
              isError ? 'bg-error-container/20' : isWarning ? 'bg-secondary-fixed/20' : ''
            }`}>
              <div className="p-2 border-r border-outline font-data-md text-data-md text-primary flex items-center gap-2">
                {isError && <div className="w-1.5 h-full bg-error absolute left-0 top-0"></div>}
                {isWarning && <div className="w-1.5 h-full bg-secondary-container absolute left-0 top-0"></div>}
                <span className={isError || isWarning ? "pl-2" : "pl-4"}>{sensor.id}</span>
              </div>
              <div className={`p-2 font-data-md text-data-md text-right ${
                isError ? 'text-error font-bold' : isWarning ? 'text-secondary font-bold' : 'text-on-surface-variant'
              }`}>
                {sensor.currentValue} {sensor.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
