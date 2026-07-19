import { useEffect } from 'react';
import { AppShell } from './components/Shared/AppShell';
import { CommandCentre } from './components/CommandCentre/CommandCentre';
import { PermitsView, SensorsView, LiveFeedView } from './components/Views';
import { OraclePanel } from './components/Oracle/OraclePanel';
import { ForgePanel } from './components/Forge/ForgePanel';
import { BlazePanel } from './components/Blaze/BlazePanel';
import { ChaosPanel } from './components/Chaos/ChaosPanel';
import { connectPlantFeed, usePlantStore } from './store/plantStore';
import { FieldCheckView } from './components/Modules/FieldCheck';
import { ReportsView, SettingsView, SupportView } from './components/Modules/Extras';

export default function App() {
  useEffect(() => connectPlantFeed(), []);
  
  const currentView = usePlantStore(state => state.currentView);
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <CommandCentre />;
      case 'permits': return <PermitsView />;
      case 'oracle': return <OraclePanel />;
      case 'forge': return <ForgePanel />;
      case 'blaze': return <BlazePanel />;
      case 'chaos': return <ChaosPanel />;
      case 'field': return <FieldCheckView />;
      case 'live_feed': return <LiveFeedView />;
      case 'sensors': return <SensorsView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      case 'support': return <SupportView />;
      default: return <CommandCentre />;
    }
  };

  return <AppShell>{renderView()}</AppShell>;
}
