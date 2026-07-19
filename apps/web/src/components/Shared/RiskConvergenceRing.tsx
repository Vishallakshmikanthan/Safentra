import React from 'react';

interface RiskConvergenceRingProps {
  score: number;
  factors: { name: string; impact: number; color: string }[];
}

export const RiskConvergenceRing: React.FC<RiskConvergenceRingProps> = ({ score, factors }) => {
  const isCritical = score > 80;
  
  return (
    <div className={`shrink-0 bg-primary text-on-primary p-4 border-t-4 relative overflow-hidden min-h-[300px] flex flex-col justify-between ${
      isCritical ? 'border-error' : 'border-secondary-container'
    }`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)' }}></div>
      
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <h3 className={`font-headline-md text-headline-md font-bold tracking-tight uppercase ${isCritical ? 'text-error' : 'text-secondary-container'}`}>
            Zone Risk
          </h3>
          <p className="font-data-md text-[12px] text-on-surface-variant mt-1">
            {isCritical ? 'COMPOUND CRITICALITY DETECTED' : 'ELEVATED RISK LEVEL'}
          </p>
        </div>
        <span className={`material-symbols-outlined text-[32px] ${isCritical ? 'text-error' : 'text-secondary-container'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {isCritical ? 'crisis_alert' : 'warning'}
        </span>
      </div>
      
      {/* Convergence Indicator Graphic */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-4">
        <svg className="transform -rotate-90" height="160" viewBox="0 0 160 160" width="160">
          {/* Base rings */}
          <circle cx="80" cy="80" fill="none" r="70" stroke="#313030" strokeWidth="1"></circle>
          <circle cx="80" cy="80" fill="none" r="50" stroke="#313030" strokeWidth="1"></circle>
          <circle cx="80" cy="80" fill="none" r="30" stroke="#313030" strokeWidth="1"></circle>
          
          {/* Factor Arcs */}
          {factors.map((factor, idx) => {
            const r = 70 - (idx * 20); // 70, 50, 30
            const circumference = 2 * Math.PI * r;
            const dashoffset = circumference - (factor.impact / 100) * circumference;
            return (
              <circle 
                key={idx}
                cx="80" 
                cy="80" 
                fill="none" 
                r={r} 
                stroke={factor.color} 
                strokeDasharray={circumference} 
                strokeDashoffset={dashoffset} 
                strokeWidth={idx === 2 ? 2 : 4}
              ></circle>
            );
          })}
          
          {/* Convergence Hotspot (Intersection lines) */}
          {isCritical && (
            <>
              <line opacity="0.5" stroke="#ba1a1a" strokeWidth="1" x1="80" x2="140" y1="80" y2="120"></line>
              <line opacity="0.5" stroke="#fdb244" strokeWidth="1" x1="80" x2="120" y1="80" y2="40"></line>
            </>
          )}
        </svg>
        <div className="absolute font-data-lg text-[24px] font-bold text-white">{score}%</div>
      </div>
      
      {/* Factor List */}
      <div className="relative z-10 space-y-2 border-t border-outline pt-4">
        {factors.map((factor, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-none border border-black" style={{ backgroundColor: factor.color }}></div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase flex-1">{factor.name}</span>
            <span className="font-data-md text-[12px]" style={{ color: factor.color }}>+{factor.impact}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
