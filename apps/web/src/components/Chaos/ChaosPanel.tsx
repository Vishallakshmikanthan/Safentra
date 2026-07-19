import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const ChaosPanel: React.FC = () => {
  const chaosState = usePlantStore(state => state.chaosState);
  
  const injectScenario = async (type: string, zoneId: string, parameters: any = {}) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
      await fetch(`${apiUrl}/api/chaos/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, zoneId, parameters, duration: 60, severity: 'high' })
      });
    } catch (e) {
      console.error('Failed to inject chaos:', e);
    }
  };

  const getChaosPayload = (scenario: string) => {
    switch (scenario) {
      case 'Sensor Spike': return { type: 'sensor_spike', zoneId: 'C1', parameters: { sensorType: 'h2s_concentration', value: 30 } };
      case 'Gas Leak': return { type: 'gas_leak', zoneId: 'C2', parameters: { gasType: 'co_concentration', value: 100 } };
      case 'Worker Incapacitated': return { type: 'worker_incapacitated', zoneId: 'C3', parameters: { workerId: 'worker-7' } };
      case 'Equipment Failure': return { type: 'equipment_failure', zoneId: 'C4', parameters: { sensorType: 'temperature' } };
      case 'Permit Conflict': return { type: 'permit_conflict', zoneId: 'C1', parameters: {} };
      case 'Communication Drop': return { type: 'sensor_failure', zoneId: 'C6', parameters: { sensorType: 'proximity' } };
      default: return { type: 'sensor_spike', zoneId: 'C1', parameters: { sensorType: 'gas_pressure', value: 2.5 } };
    }
  };


  return (
    <div className="h-full flex flex-col p-gutter gap-4 bg-background text-on-background animate-in fade-in zoom-in duration-300">
      <header className="flex justify-between items-center bg-surface p-4 border border-outline/30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-3xl">storm</span>
          <div>
            <h2 className="text-headline-sm font-headline-sm uppercase text-tertiary m-0">CHAOS</h2>
            <p className="text-label-sm font-label-sm text-on-surface-variant m-0 uppercase tracking-wider">Scenario Laboratory</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {chaosState.activeInjections.length > 0 && (
             <div className="flex items-center gap-2 px-3 py-1 bg-tertiary/20 text-tertiary border border-tertiary/40">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-caps uppercase">{chaosState.activeInjections.length} Active Injections</span>
             </div>
           )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Injection Controls */}
        <div className="col-span-8 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-surface p-6 border border-outline/30 shadow-sm flex-1">
             <h3 className="text-title-md font-title-md text-on-surface mb-6 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">science</span> Inject Scenario
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {['Sensor Spike', 'Gas Leak', 'Worker Incapacitated', 'Equipment Failure', 'Permit Conflict', 'Communication Drop'].map((scenario, i) => (
                <button key={i} 
                  onClick={() => {
                    const payload = getChaosPayload(scenario);
                    injectScenario(payload.type, payload.zoneId, payload.parameters);
                  }}
                  className="flex flex-col items-start p-4 bg-background border border-outline/20 hover:border-tertiary hover:bg-tertiary/5 transition-all group text-left">
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-body-lg font-medium text-on-surface uppercase group-hover:text-tertiary">{scenario}</span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary">play_arrow</span>
                  </div>
                  <span className="text-label-sm text-on-surface-variant">Inject {scenario.toLowerCase()} scenario into live simulation.</span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-outline/20 flex gap-4">
               <button className="bg-primary text-on-primary px-6 py-3 uppercase font-label-caps shadow-md hover:bg-primary/90 flex items-center gap-2">
                  <span className="material-symbols-outlined">auto_fix_high</span> Generate Random Chaos
               </button>
               <button className="bg-surface-variant text-on-surface-variant px-6 py-3 uppercase font-label-caps hover:bg-surface-variant/80 flex items-center gap-2">
                  <span className="material-symbols-outlined">restart_alt</span> Reset Scenarios
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active & History */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-surface p-5 border border-outline/30 shadow-sm flex-1">
            <h3 className="text-title-sm font-title-sm text-tertiary mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">bolt</span> Active Injections
            </h3>
            {chaosState.activeInjections.length === 0 ? (
              <div className="text-center p-6 text-on-surface-variant font-label-md uppercase border border-dashed border-outline/30 bg-background">
                 No active injections
              </div>
            ) : (
              <div className="space-y-3">
                {chaosState.activeInjections.map(inj => (
                  <div key={inj.id} className="bg-tertiary/10 border border-tertiary/30 p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-tertiary w-full animate-[shrink_60s_linear_forwards]"></div>
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-title-sm font-title-sm uppercase text-on-surface">{inj.type.replace('_', ' ')}</div>
                       <div className="text-label-caps px-2 bg-tertiary text-on-tertiary">{inj.severity}</div>
                    </div>
                    <div className="text-label-md text-on-surface-variant font-mono">
                      Target: {inj.zoneId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
