import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { format } from 'date-fns';

export const LiveAlertFeed: React.FC = () => {
  const alerts = usePlantStore((state) => state.alerts);

  return (
    <div className="w-80 flex flex-col border-r border-primary bg-surface shrink-0 h-full">
      <div className="bg-primary text-on-primary p-2 border-b border-primary flex justify-between items-center shrink-0">
        <span className="font-label-caps text-label-caps uppercase tracking-widest">Live Alert Feed</span>
        <span className="material-symbols-outlined text-[16px]">sync</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`border-b border-outline p-3 hover:bg-surface-variant transition-colors cursor-pointer ${
              alert.severity === 'critical' ? 'bg-error-container/20 border-l-4 border-l-error' :
              alert.severity === 'warning' ? 'bg-secondary-fixed/30 border-l-4 border-l-secondary-container' : ''
            }`}
          >
            <div className={`font-data-md text-data-md mb-1 ${
              alert.severity === 'critical' ? 'text-error' :
              alert.severity === 'warning' ? 'text-secondary' : 'text-on-surface-variant'
            }`}>
              {format(new Date(alert.timestamp), 'HH:mm:ss.SS')}Z
            </div>
            <div className="font-label-caps text-[10px] text-on-surface-variant mb-1 uppercase">Zone {alert.zoneId}</div>
            <div className="font-body-sm text-body-sm text-on-surface leading-tight">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
