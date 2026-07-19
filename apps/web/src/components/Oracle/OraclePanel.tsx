import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const OraclePanel: React.FC = () => {
  const oracleState = usePlantStore(state => state.oracleState);

  if (!oracleState.isActive) {
    return (
      <div className="h-full flex items-center justify-center text-on-surface-variant font-body-lg">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-surface-variant-dim">smart_toy</span>
          <h2>ORACLE is in standby mode.</h2>
          <p className="opacity-70 mt-2">Will automatically activate upon risk pattern detection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-gutter gap-4 bg-background text-on-background animate-in fade-in zoom-in duration-300">
      <header className="flex justify-between items-center bg-surface p-4 border border-outline/30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl animate-pulse">model_training</span>
          <div>
            <h2 className="text-headline-sm font-headline-sm uppercase text-primary m-0">ORACLE</h2>
            <p className="text-label-sm font-label-sm text-on-surface-variant m-0 uppercase tracking-wider">Live Industrial Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary px-3 py-1 font-label-md border border-primary/20">
            CONFIDENCE: {(oracleState.confidence * 100).toFixed(0)}%
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-label-caps uppercase">Live Sync</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Recommendations & Regulations */}
        <div className="col-span-8 flex flex-col gap-4 overflow-y-auto">
          {/* Explanation */}
          <div className="bg-surface p-6 border-l-4 border-error shadow-sm">
            <h3 className="text-title-md font-title-md text-error mb-2 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span> Situation Analysis
            </h3>
            <p className="text-body-lg text-on-surface font-body-lg leading-relaxed">{oracleState.explanation}</p>
          </div>

          {/* Recommendations */}
          <div className="bg-surface p-6 border border-outline/30 shadow-sm flex-1">
            <h3 className="text-title-md font-title-md text-primary mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">assignment_turned_in</span> Recommended Actions
            </h3>
            <ul className="space-y-3">
              {oracleState.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-secondary-container/30 border border-outline/20">
                  <span className="material-symbols-outlined text-primary mt-1 text-xl">check_circle</span>
                  <span className="text-body-md text-on-surface">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Historical Incidents */}
          <div className="bg-surface p-6 border border-outline/30 shadow-sm">
             <h3 className="text-title-md font-title-md text-on-surface mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">history</span> Similar Historical Incidents
            </h3>
            <ul className="space-y-2">
              {oracleState.historicalIncidents.map((inc, i) => (
                <li key={i} className="flex items-center gap-2 text-body-md text-on-surface-variant">
                  <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
                  {inc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Affected Entities & Regulations */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto">
          {/* Regulations */}
          <div className="bg-surface p-5 border border-outline/30 shadow-sm">
            <h3 className="text-title-sm font-title-sm text-secondary mb-3 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">gavel</span> Relevant Regulations
            </h3>
            <div className="space-y-2">
              {oracleState.regulations.map((reg, i) => (
                <div key={i} className="p-2 bg-secondary-container/30 border border-secondary/30 text-body-sm text-on-surface">
                  {reg}
                </div>
              ))}
            </div>
          </div>

          {/* Affected Sensors */}
          <div className="bg-surface p-5 border border-outline/30 shadow-sm">
            <h3 className="text-title-sm font-title-sm text-on-surface mb-3 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">sensors</span> Affected Sensors
            </h3>
            <div className="flex flex-wrap gap-2">
              {oracleState.affectedSensors.map((sensor, i) => (
                <span key={i} className="px-2 py-1 bg-surface-variant border border-outline/50 text-label-md font-label-md">
                  {sensor}
                </span>
              ))}
            </div>
          </div>

           {/* Affected Workers */}
           <div className="bg-surface p-5 border border-outline/30 shadow-sm">
            <h3 className="text-title-sm font-title-sm text-on-surface mb-3 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">engineering</span> Workers at Risk
            </h3>
            <div className="flex flex-wrap gap-2">
              {oracleState.workersAtRisk.map((worker, i) => (
                <span key={i} className="px-2 py-1 bg-error/10 text-error border border-error/30 text-label-md font-label-md">
                  {worker}
                </span>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="bg-surface p-5 border border-outline/30 shadow-sm mt-auto">
            <h3 className="text-title-sm font-title-sm text-on-surface-variant mb-2 uppercase text-xs tracking-widest">
               Data Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {oracleState.sources.map((src, i) => (
                <span key={i} className="text-body-xs text-on-surface-variant">
                  • {src}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
