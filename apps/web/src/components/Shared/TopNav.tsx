import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { DangerModeButton } from '../DangerModeButton';

export const TopNav: React.FC = () => {
  const connectionStatus = usePlantStore(state => state.connectionStatus);
  const shiftChangeover = usePlantStore(state => state.shiftChangeover);
  const currentView = usePlantStore(state => state.currentView);
  const setCurrentView = usePlantStore(state => state.setCurrentView);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);

  return (
    <header className="flex justify-between items-center px-margin-desktop h-16 w-full bg-surface border-b border-primary z-10 shrink-0 relative">
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
      <div className="flex items-center gap-3 relative">
        {/* Shift changeover badge */}
        {shiftChangeover && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-amber-900/60 text-amber-300 border border-amber-700 animate-pulse">
            <span className="material-symbols-outlined text-[12px]">swap_horiz</span>
            Shift Change
          </span>
        )}
        {/* Danger Mode Button */}
        <DangerModeButton />
        {/* Connection status */}
        <span className={`hidden sm:inline font-label-caps text-[10px] uppercase ${connectionStatus === 'live' ? 'text-primary' : 'text-error'}`}>
          {connectionStatus === 'live' ? '● Live' : connectionStatus}
        </span>
        
        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="text-primary hover:bg-surface-variant p-2 transition-colors duration-150 ease-in-out">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-outline/30 shadow-lg z-50 p-4 animate-in fade-in zoom-in duration-200">
              <h3 className="text-title-sm font-bold uppercase text-primary mb-2 border-b border-outline/20 pb-2">Notifications</h3>
              <p className="text-body-sm text-on-surface-variant">No new notifications.</p>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setCurrentView('settings')}
          className="text-primary hover:bg-surface-variant p-2 transition-colors duration-150 ease-in-out">
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* User Profile Button */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="h-8 w-8 bg-primary rounded-none ml-2 border border-primary flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined">person</span>
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline/30 shadow-lg z-50 p-4 animate-in fade-in zoom-in duration-200">
              <div className="text-center mb-3">
                <div className="font-bold text-primary uppercase text-title-sm">Safety Officer</div>
                <div className="text-label-sm text-on-surface-variant">Admin Access</div>
              </div>
              <div className="border-t border-outline/20 pt-2 flex flex-col gap-2">
                <button className="text-left text-body-sm hover:text-primary transition-colors">My Profile</button>
                <button className="text-left text-body-sm hover:text-primary transition-colors">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
