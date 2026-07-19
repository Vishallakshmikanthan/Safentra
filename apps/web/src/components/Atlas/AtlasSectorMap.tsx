import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const AtlasSectorMap: React.FC = () => {
  const zones = usePlantStore((state) => state.zones);
  
  // Extract specific zones for the hardcoded layout as in Stitch design
  // The visual layout intentionally stays fixed; bind its hotspot to whichever
  // backend zone currently carries the highest live compound-risk score.
  const c4 = zones['C4'] ?? Object.values(zones).reduce<typeof zones[string] | undefined>(
    (highest, zone) => !highest || zone.riskScore > highest.riskScore ? zone : highest,
    undefined
  );

  return (
    <div className="flex-1 grid-bg p-8 relative overflow-hidden flex items-center justify-center">
      {/* Central Plant SVG Structure */}
      <div className="relative w-[600px] h-[500px] border-2 border-primary bg-surface/50">
        
        {/* Zone C1 */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 border-r border-b border-outline p-4 hover:bg-primary/5 transition-colors">
          <span className="font-data-lg text-data-lg font-bold text-on-surface-variant">C1</span>
        </div>
        
        {/* Zone C2 */}
        <div className="absolute top-0 right-0 w-1/2 h-1/3 border-b border-outline p-4 hover:bg-primary/5 transition-colors">
          <span className="font-data-lg text-data-lg font-bold text-on-surface-variant">C2</span>
        </div>
        
        {/* Zone C3 */}
        <div className="absolute top-[33.33%] right-0 w-1/4 h-[33.33%] border-b border-l border-outline p-4 hover:bg-primary/5 transition-colors">
          <span className="font-data-lg text-data-lg font-bold text-on-surface-variant">C3</span>
        </div>
        
        {/* Zone C4 (High Risk Hotspot) */}
        <div className={`absolute bottom-0 left-0 w-[40%] h-1/2 border-r border-outline p-4 relative overflow-hidden ${
          c4?.riskScore > 0.8 ? 'bg-error/20' : 'hover:bg-primary/5'
        }`}>
          <span className={`font-data-lg text-data-lg font-bold relative z-10 ${c4?.riskScore > 0.8 ? 'text-error' : 'text-on-surface-variant'}`}>C4</span>
          
          {/* Blinking indicator */}
          {c4?.riskScore > 0.8 && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-error anim-ring"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-error bg-error/30"></div>
            </>
          )}
        </div>
        
        {/* Zone C5 */}
        <div className="absolute bottom-0 left-[40%] w-[35%] h-[40%] border-r border-t border-outline p-4 hover:bg-primary/5 transition-colors">
          <span className="font-data-lg text-data-lg font-bold text-on-surface-variant">C5</span>
        </div>
        
        {/* Zone C6 */}
        <div className="absolute bottom-0 right-0 w-[25%] h-[66.66%] border-l border-outline bg-secondary-fixed/40 p-4">
          <span className="font-data-lg text-data-lg font-bold text-secondary">C6</span>
        </div>
        
        {/* Connecting Pipelines (Decorative) */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-0 border-t-2 border-dashed border-primary"></div>
        <div className="absolute top-1/2 left-[40%] w-0 h-1/4 border-l-2 border-primary"></div>
      </div>
    </div>
  );
};
