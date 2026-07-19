import React from 'react';
import { usePlantStore } from '../../store/plantStore';

export const Sidebar: React.FC = () => {
  const currentView = usePlantStore(state => state.currentView);
  const setCurrentView = usePlantStore(state => state.setCurrentView);

  return (
    <nav className="hidden md:flex flex-col h-full border-r border-primary bg-surface-container w-64 z-20 shrink-0">
      {/* Header */}
      <div className="p-gutter border-b border-primary">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-2xl">shield</span>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary uppercase tracking-tighter">SAFENTRA</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Active Monitoring</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('permits')}
          className="w-full bg-secondary-container border border-primary text-primary font-label-caps text-label-caps uppercase py-2 hover:bg-secondary-fixed-dim transition-colors">
          New Permit
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center px-gutter py-3 transition-all duration-200 border-l-4 ${currentView === 'dashboard' ? 'bg-secondary-container text-on-secondary-container border-primary' : 'text-on-surface-variant hover:bg-secondary-fixed-dim border-transparent'}`}>
          <span className="material-symbols-outlined mr-4">dashboard</span>
          <span className="font-label-caps text-label-caps uppercase">Overview</span>
        </button>
        <button
          onClick={() => setCurrentView('live_feed')}
          className={`w-full flex items-center px-gutter py-3 transition-all duration-200 border-l-4 ${currentView === 'live_feed' ? 'bg-secondary-container text-on-secondary-container border-primary' : 'text-on-surface-variant hover:bg-secondary-fixed-dim border-transparent'}`}>
          <span className="material-symbols-outlined mr-4">podcasts</span>
          <span className="font-label-caps text-label-caps uppercase">Live Feed</span>
        </button>
        <button
          onClick={() => setCurrentView('sensors')}
          className={`w-full flex items-center px-gutter py-3 transition-all duration-200 border-l-4 ${currentView === 'sensors' ? 'bg-secondary-container text-on-secondary-container border-primary' : 'text-on-surface-variant hover:bg-secondary-fixed-dim border-transparent'}`}>
          <span className="material-symbols-outlined mr-4">sensors</span>
          <span className="font-label-caps text-label-caps uppercase">Sensors</span>
        </button>
        <button
          onClick={() => setCurrentView('reports')}
          className={`w-full flex items-center px-gutter py-3 transition-all duration-200 border-l-4 ${currentView === 'reports' ? 'bg-secondary-container text-on-secondary-container border-primary' : 'text-on-surface-variant hover:bg-secondary-fixed-dim border-transparent'}`}>
          <span className="material-symbols-outlined mr-4">analytics</span>
          <span className="font-label-caps text-label-caps uppercase">Reports</span>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center px-gutter py-3 transition-all duration-200 border-l-4 ${currentView === 'settings' ? 'bg-secondary-container text-on-secondary-container border-primary' : 'text-on-surface-variant hover:bg-secondary-fixed-dim border-transparent'}`}>
          <span className="material-symbols-outlined mr-4">settings</span>
          <span className="font-label-caps text-label-caps uppercase">Settings</span>
        </button>
      </div>

      {/* Footer Links */}
      <div className="border-t border-primary p-2">
        <button
          onClick={() => setCurrentView('support')}
          className={`w-full flex items-center px-gutter py-2 transition-all duration-200 border-l-4 ${currentView === 'support' ? 'bg-secondary-container text-on-secondary-container border-primary' : 'text-on-surface-variant hover:bg-secondary-fixed-dim border-transparent'}`}>
          <span className="material-symbols-outlined mr-4">help</span>
          <span className="font-label-caps text-label-caps uppercase">Support</span>
        </button>
        <button className="w-full flex items-center px-gutter py-2 text-on-surface-variant hover:bg-secondary-fixed-dim transition-all duration-200">
          <span className="material-symbols-outlined mr-4">logout</span>
          <span className="font-label-caps text-label-caps uppercase">Log Out</span>
        </button>
      </div>
    </nav>
  );
};
