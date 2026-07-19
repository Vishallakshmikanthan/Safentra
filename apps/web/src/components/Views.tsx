import React from 'react';
import { usePlantStore } from '../store/plantStore';

export const PlaceholderView: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8">
    <span className="material-symbols-outlined text-[64px] mb-4 text-primary opacity-50">{icon}</span>
    <h2 className="font-headline-md text-headline-md tracking-widest uppercase text-primary">{title}</h2>
    <p className="mt-4 font-body-md text-body-md text-center max-w-md">
      This module is currently operating in headless mode or awaiting deployment.
    </p>
  </div>
);

export const PermitsView: React.FC = () => {
  const permits = usePlantStore(state => state.permits);
  
  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2">Active Work Permits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(permits).map(permit => (
          <div key={permit.id} className="bg-surface border border-primary p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label-caps text-primary uppercase">{permit.id}</span>
              <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-xs uppercase">{permit.status}</span>
            </div>
            <p className="font-body-md mb-2"><span className="text-on-surface-variant uppercase text-xs">Type:</span> {permit.type.replace('_', ' ')}</p>
            <p className="font-body-md mb-2"><span className="text-on-surface-variant uppercase text-xs">Zone:</span> {permit.zoneId}</p>
            <p className="font-body-md mb-2"><span className="text-on-surface-variant uppercase text-xs">Requested By:</span> {permit.requestedBy}</p>
          </div>
        ))}
        {Object.values(permits).length === 0 && <p className="text-on-surface-variant italic">No active permits.</p>}
      </div>
    </div>
  );
};

export const SensorsView: React.FC = () => {
  const sensors = usePlantStore(state => state.sensors);
  
  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2">Sensor Telemetry Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(sensors).map(sensor => {
          const isElevated = sensor.status === 'elevated' || sensor.status === 'alarm';
          return (
            <div key={sensor.id} className={`bg-surface border p-4 ${isElevated ? 'border-error' : 'border-primary'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-label-caps uppercase ${isElevated ? 'text-error' : 'text-primary'}`}>{sensor.id}</span>
                {isElevated && <span className="material-symbols-outlined text-error text-[16px]">warning</span>}
              </div>
              <p className="font-data-lg text-[24px] mb-2">{sensor.currentValue} <span className="text-sm text-on-surface-variant">{sensor.unit}</span></p>
              <p className="font-body-sm text-on-surface-variant uppercase text-xs mb-1">Type: {sensor.type.replace('_', ' ')}</p>
              <p className="font-body-sm text-on-surface-variant uppercase text-xs">Zone: {sensor.zoneId}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LiveFeedView: React.FC = () => {
  const alerts = usePlantStore(state => state.alerts);
  
  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2">Full Alert History</h2>
      <div className="space-y-4">
        {alerts.map(alert => {
          let badgeColor = 'bg-surface-variant text-on-surface-variant border-primary';
          if (alert.severity === 'critical') badgeColor = 'bg-error text-on-error border-error';
          if (alert.severity === 'warning') badgeColor = 'bg-secondary-container text-on-secondary-container border-secondary-container';
          
          return (
            <div key={alert.id} className={`flex items-start gap-4 p-4 border bg-surface ${badgeColor.replace('bg-', 'border-').split(' ')[0]}`}>
              <div className={`shrink-0 px-2 py-1 text-xs uppercase font-label-caps border ${badgeColor}`}>
                {alert.severity}
              </div>
              <div className="flex-1">
                <p className="font-body-md">{alert.message}</p>
                <div className="flex gap-4 mt-2 font-label-caps text-[10px] text-on-surface-variant uppercase">
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  <span>Zone: {alert.zoneId}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
