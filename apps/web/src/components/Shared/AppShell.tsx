import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { usePlantStore } from '../../store/plantStore';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentView = usePlantStore(state => state.currentView);
  const setCurrentView = usePlantStore(state => state.setCurrentView);
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        <TopNav />
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
