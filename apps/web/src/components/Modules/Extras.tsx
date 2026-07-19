import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const ReportsView: React.FC = () => {
  const alerts = usePlantStore(state => state.alerts);
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">analytics</span> Reports & Analytics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-outline/30 p-6 shadow-sm">
          <h3 className="font-headline-sm uppercase text-primary mb-4">Incident Summary</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline/20 pb-2">
              <span className="font-label-md uppercase text-on-surface-variant">Critical Incidents</span>
              <span className="font-data-lg text-error">{criticalCount}</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline/20 pb-2">
              <span className="font-label-md uppercase text-on-surface-variant">Warnings</span>
              <span className="font-data-lg text-secondary-container">{warningCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md uppercase text-on-surface-variant">Total Alerts Logged</span>
              <span className="font-data-lg text-primary">{alerts.length}</span>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-outline/30 p-6 shadow-sm flex items-center justify-center">
          <p className="text-on-surface-variant italic text-center">More analytics and visualizations will be available in future modules.</p>
        </div>
      </div>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const store = usePlantStore();
  
  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">settings</span> System Settings
      </h2>
      <div className="max-w-2xl bg-surface border border-outline/30 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-headline-sm uppercase text-primary mb-2">Simulation Controls</h3>
          <p className="font-body-md text-on-surface-variant mb-4">Toggle various mock events to test the Command Centre response capabilities.</p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => store.triggerCriticalEvent()}
              className="bg-error/20 text-error border border-error px-4 py-2 uppercase font-label-md hover:bg-error/30"
            >
              Trigger Test Critical Alert
            </button>
            <button 
              onClick={() => store.setDangerMode(!store.dangerMode)}
              className="bg-primary/20 text-primary border border-primary px-4 py-2 uppercase font-label-md hover:bg-primary/30"
            >
              Toggle Danger Mode (UI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SupportView: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">help</span> Support
      </h2>
      <div className="max-w-2xl bg-surface border border-outline/30 p-6 shadow-sm">
        <h3 className="font-headline-sm uppercase text-primary mb-4">Safentra Operator Support</h3>
        <p className="font-body-md text-on-surface mb-4 leading-relaxed">
          For emergency system support, please contact the Safentra Ops Team.
          <br /><br />
          <strong>Hotline:</strong> 1-800-SAFENTRA-OPS<br />
          <strong>Email:</strong> critical-support@safentra.local
        </p>
        <div className="p-4 bg-secondary-container/20 border border-secondary-container/50">
          <p className="font-label-md text-secondary-container uppercase mb-1">Documentation</p>
          <ul className="list-disc pl-5 font-body-sm text-on-surface">
            <li>User Manual (v2.1)</li>
            <li>Emergency Action Protocols (EAP)</li>
            <li>Agent Directives (ORACLE, BLAZE, FORGE)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
