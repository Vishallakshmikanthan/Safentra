import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const BlazePanel: React.FC = () => {
  const blazeState = usePlantStore(state => state.blazeState);

  if (!blazeState.isActive) {
    return (
      <div className="h-full flex items-center justify-center text-on-surface-variant font-body-lg">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-surface-variant-dim">local_fire_department</span>
          <h2>BLAZE is on standby.</h2>
          <p className="opacity-70 mt-2">Emergency command protocols inactive.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-gutter gap-4 bg-background text-on-background animate-in fade-in zoom-in duration-300">
      <header className="flex justify-between items-center bg-error/10 p-4 border border-error/50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-4xl animate-pulse">local_fire_department</span>
          <div>
            <h2 className="text-headline-sm font-headline-sm uppercase text-error m-0">BLAZE</h2>
            <p className="text-label-sm font-label-sm text-error/80 m-0 uppercase tracking-wider">Emergency Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
             <div className="font-label-caps text-error/80 uppercase">Response Status</div>
             <div className="font-headline-sm text-error uppercase animate-pulse">{blazeState.responseStatus}</div>
           </div>
           {blazeState.countdownTimer !== null && (
             <div className="bg-error text-on-error px-4 py-2 text-headline-md font-mono">
                T-{Math.floor(blazeState.countdownTimer / 60)}:{(blazeState.countdownTimer % 60).toString().padStart(2, '0')}
             </div>
           )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Timeline & Evacuation */}
        <div className="col-span-7 flex flex-col gap-4 overflow-y-auto">
          {/* Evacuation Status */}
          <div className="bg-surface p-6 border border-error/30 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
            <h3 className="text-title-md font-title-md text-error mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">directions_run</span> Evacuation Status: {blazeState.evacuationStatus}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 border border-outline/20">
                 <div className="text-label-md text-on-surface-variant uppercase mb-1">Affected Workers</div>
                 <div className="flex flex-wrap gap-2">
                   {blazeState.affectedWorkers.map(w => (
                     <span key={w} className="px-2 py-1 bg-error/10 text-error font-label-md border border-error/20">{w}</span>
                   ))}
                 </div>
              </div>
              <div className="bg-background p-4 border border-outline/20">
                 <div className="text-label-md text-on-surface-variant uppercase mb-2">Assembly Points</div>
                 <div className="space-y-2">
                   {blazeState.assemblyPoints.map(ap => (
                     <div key={ap.id} className="flex justify-between items-center text-body-sm">
                       <span className="text-on-surface uppercase">{ap.name}</span>
                       <span className="font-mono text-primary">{ap.currentCount} / {ap.capacity}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="bg-surface p-6 border border-outline/30 shadow-sm flex-1">
            <h3 className="text-title-md font-title-md text-on-surface mb-6 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">timeline</span> Incident Timeline
            </h3>
            <div className="relative border-l-2 border-outline/20 ml-3 space-y-6">
              {blazeState.incidentTimeline.map((item, i) => (
                <div key={i} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background ${item.status === 'completed' ? 'bg-primary' : item.status === 'in_progress' ? 'bg-error animate-pulse' : 'bg-surface-variant'}`}></span>
                  <div className="text-label-sm text-on-surface-variant font-mono mb-1">{new Date(item.time).toLocaleTimeString()}</div>
                  <div className={`text-body-lg ${item.status === 'in_progress' ? 'text-error font-bold' : 'text-on-surface'}`}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Resources */}
        <div className="col-span-5 flex flex-col gap-4 overflow-y-auto">
          {/* Action Checklist */}
          <div className="bg-surface p-6 border border-outline/30 shadow-sm">
            <h3 className="text-title-md font-title-md text-on-surface mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">checklist</span> Emergency Checklist
            </h3>
            <ul className="space-y-3">
              {blazeState.actionChecklist.map((item) => (
                <li key={item.id} className="flex items-start gap-3 p-3 bg-background border border-outline/10">
                  <span className={`material-symbols-outlined mt-0.5 ${item.completed ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                    {item.completed ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span className={`text-body-md ${item.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                    {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource Allocation */}
          <div className="bg-surface p-6 border border-outline/30 shadow-sm flex-1">
            <h3 className="text-title-md font-title-md text-on-surface mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">airport_shuttle</span> Resource Allocation
            </h3>
            <div className="space-y-3">
              {blazeState.resourceAllocation.map((res, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-secondary-container/20 border border-secondary/20">
                  <span className="text-body-md text-on-surface uppercase font-medium">{res.resource}</span>
                  <span className={`text-label-caps px-2 py-1 border uppercase ${res.status === 'en_route' ? 'border-secondary text-secondary animate-pulse' : res.status === 'dispatched' ? 'border-tertiary text-tertiary' : 'border-primary text-primary'}`}>
                    {res.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notified Contacts */}
          <div className="bg-surface p-6 border border-outline/30 shadow-sm">
            <h3 className="text-title-sm font-title-sm text-on-surface-variant mb-3 uppercase tracking-widest text-xs">
              Contacts Notified
            </h3>
            <div className="flex flex-wrap gap-2">
               {blazeState.emergencyContactsNotified.map((c, i) => (
                 <span key={i} className="px-2 py-1 bg-surface-variant text-on-surface-variant text-label-sm flex items-center gap-1">
                   <span className="material-symbols-outlined text-[14px]">cell_tower</span> {c}
                 </span>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
