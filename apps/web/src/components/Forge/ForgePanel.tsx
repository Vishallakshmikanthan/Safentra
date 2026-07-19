import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const ForgePanel: React.FC = () => {
  const forgeState = usePlantStore(state => state.forgeState);

  if (forgeState.candidates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-on-surface-variant font-body-lg">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-surface-variant-dim">model_training</span>
          <h2>FORGE is monitoring.</h2>
          <p className="opacity-70 mt-2">No new pattern candidates detected from synthetic near-misses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-gutter gap-4 bg-background text-on-background animate-in fade-in zoom-in duration-300">
      <header className="flex justify-between items-center bg-surface p-4 border border-outline/30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
          <div>
            <h2 className="text-headline-sm font-headline-sm uppercase text-secondary m-0">FORGE</h2>
            <p className="text-label-sm font-label-sm text-on-surface-variant m-0 uppercase tracking-wider">Continuous Learning AI</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-secondary">
          <span className="font-label-caps uppercase">{forgeState.candidates.length} Candidate(s) Pending</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          {forgeState.candidates.map((candidate, i) => (
            <div key={i} className="bg-surface border border-outline/30 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-title-lg font-title-lg text-on-surface uppercase mb-1">
                    {candidate.pattern.name}
                  </h3>
                  <div className="flex gap-3 text-label-sm font-label-sm text-on-surface-variant uppercase">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> Discovered {new Date(candidate.pattern.lastSeen).toLocaleTimeString()}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">verified</span> Confidence: {(candidate.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="bg-error/10 text-error hover:bg-error/20 border border-error/30 px-4 py-2 uppercase font-label-caps transition-colors">
                     Reject
                   </button>
                   <button className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 uppercase font-label-caps transition-colors shadow-md">
                     Approve Pattern
                   </button>
                </div>
              </div>

              <p className="text-body-lg text-on-surface mb-6 border-l-2 border-secondary pl-4">
                {candidate.pattern.description}
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-title-sm font-title-sm text-on-surface-variant uppercase mb-3">Conditions Detected</h4>
                  <ul className="space-y-2">
                    {candidate.pattern.conditions.map((cond, j) => (
                       <li key={j} className="bg-secondary-container/20 border border-outline/20 p-2 text-body-md text-on-surface flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                         {cond}
                       </li>
                    ))}
                  </ul>
                </div>
                <div>
                   <h4 className="text-title-sm font-title-sm text-on-surface-variant uppercase mb-3">Suggested Integration</h4>
                   <div className="bg-surface-variant/30 p-4 border border-outline/20">
                     <div className="text-label-md text-on-surface-variant mb-1 uppercase">Target Rule</div>
                     <div className="text-body-md text-primary font-mono">{candidate.suggestedPatternId}</div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
