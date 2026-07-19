import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const TopNav: React.FC = () => {
  const connectionStatus = usePlantStore(state => state.connectionStatus);
  const currentView = usePlantStore(state => state.currentView);
  const setCurrentView = usePlantStore(state => state.setCurrentView);
  return (
    <header className="flex justify-between items-center px-margin-desktop h-16 w-full bg-surface border-b border-primary z-10 shrink-0">
      <div className="font-headline-md text-headline-md font-bold tracking-tighter text-primary uppercase">
        COMMAND CENTRE
      </div>
      <nav className="hidden md:flex h-full">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex items-center px-4 h-full font-label-caps text-label-caps uppercase transition-colors duration-150 ease-in-out ${currentView === 'dashboard' ? 'text-primary border-b-2 border-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentView('permits')}
          className={`flex items-center px-4 h-full font-label-caps text-label-caps uppercase transition-colors duration-150 ease-in-out ${currentView === 'permits' ? 'text-primary border-b-2 border-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          Work Permits
        </button>
        <button 
          onClick={() => setCurrentView('forge')}
          className={`flex items-center px-4 h-full font-label-caps text-label-caps uppercase transition-colors duration-150 ease-in-out ${currentView === 'forge' ? 'text-primary border-b-2 border-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          FORGE
        </button>
        <button 
          onClick={() => setCurrentView('field')}
          className={`flex items-center px-4 h-full font-label-caps text-label-caps uppercase transition-colors duration-150 ease-in-out ${currentView === 'field' ? 'text-primary border-b-2 border-secondary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
          Field Check
        </button>
      </nav>
      <div className="flex items-center gap-4">
        <span className={`hidden sm:inline font-label-caps text-[10px] uppercase ${connectionStatus === 'live' ? 'text-primary' : 'text-error'}`}>
          {connectionStatus === 'live' ? 'Live' : connectionStatus}
        </span>
        <button className="text-primary hover:bg-surface-variant p-2 transition-colors duration-150 ease-in-out">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-primary hover:bg-surface-variant p-2 transition-colors duration-150 ease-in-out">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-8 bg-primary rounded-none ml-2 border border-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  );
};
