import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { usePlantStore } from '../../store/plantStore';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentView = usePlantStore(state => state.currentView);
  const setCurrentView = usePlantStore(state => state.setCurrentView);
  const dangerMode = usePlantStore(state => state.dangerMode);
  const simulationMode = usePlantStore(state => state.simulationMode);
  const elapsed = usePlantStore(state => state.dangerElapsedSeconds);

  const bannerVisible = dangerMode || simulationMode === 'returning_to_normal';

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        <TopNav />

        {/* Danger Mode Banner — appears/disappears with smooth transition */}
        <div
          style={{
            maxHeight: bannerVisible ? '48px' : '0px',
            opacity: bannerVisible ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease, opacity 0.35s ease',
          }}
        >
          <div className="flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-red-950 to-orange-950 border-b border-red-900">
            {simulationMode === 'returning_to_normal' ? (
              <>
                <span className="text-amber-400 text-[10px] font-mono uppercase tracking-widest shrink-0">RECOVERY</span>
                <span className="text-amber-200 text-xs">Sensors returning to baseline — anomalous conditions clearing</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
                <span className="text-red-400 text-[10px] font-mono uppercase tracking-widest shrink-0">SIMULATION</span>
                <span className="text-red-200 text-xs">
                  Anomalous sensor conditions active
                  {elapsed >= 38 ? ' — ⚡ ARGUS detected Vizag compound pattern' : ' — ARGUS compound risk detection running live'}
                </span>
                <span className="ml-auto text-[10px] text-red-500 font-mono shrink-0">
                  All readings are simulated — no real plant is at risk
                </span>
              </>
            )}
          </div>
        </div>

        {children}
      </main>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface pb-safe border-t border-primary">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center p-2 w-1/4 ${currentView === 'dashboard' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          <span className="material-symbols-outlined mb-1">home</span>
          <span className="font-label-caps text-[10px] uppercase">Home</span>
        </button>
        <button 
          onClick={() => setCurrentView('permits')}
          className={`flex flex-col items-center justify-center p-2 w-1/4 ${currentView === 'permits' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          <span className="material-symbols-outlined mb-1">assignment</span>
          <span className="font-label-caps text-[10px] uppercase">Permits</span>
        </button>
        <button 
          onClick={() => setCurrentView('forge')}
          className={`flex flex-col items-center justify-center p-2 w-1/4 ${currentView === 'forge' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          <span className="material-symbols-outlined mb-1">query_stats</span>
          <span className="font-label-caps text-[10px] uppercase">Forge</span>
        </button>
        <button 
          onClick={() => setCurrentView('field')}
          className={`flex flex-col items-center justify-center p-2 w-1/4 ${currentView === 'field' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          <span className="material-symbols-outlined mb-1">qr_code_scanner</span>
          <span className="font-label-caps text-[10px] uppercase">Field</span>
        </button>
      </nav>
    </div>
  );
};
