import React from 'react';
import { usePlantStore } from '../../store/plantStore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const ReportsView: React.FC = () => {
  const alerts = usePlantStore(state => state.alerts);
  const zones = usePlantStore(state => state.zones);
  const workers = usePlantStore(state => state.workers);
  const permits = usePlantStore(state => state.permits);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const totalWorkers = Object.values(workers).filter(w => w.status === 'active').length;
  const totalPermits = Object.values(permits).filter(p => p.status === 'active').length;
  const allZones = Object.values(zones);
  const avgRiskScore = allZones.length > 0 ? (allZones.reduce((sum, z) => sum + z.riskScore, 0) / allZones.length).toFixed(2) : '0.00';

  // Zone-wise Alerts
  const alertsByZone = alerts.reduce((acc, alert) => {
    acc[alert.zoneId] = (acc[alert.zoneId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const alertData = Object.entries(alertsByZone).map(([name, value]) => ({ name: name === 'SYS' ? 'System' : `Zone ${name}`, value }));

  // Zone Risk & Safety Debt
  const riskData = allZones.map(z => ({
    name: z.id,
    riskScore: Number((z.riskScore * 100).toFixed(0)), // scaled 0-100 for vis
    safetyDebt: z.safetyDebt
  }));

  // Resource Allocation
  const resourceData = allZones.map(z => ({
    name: z.id,
    workers: z.activeWorkers.length,
    permits: z.activePermits.length
  }));

  const COLORS = ['#ff8a00', '#00bfa5', '#3f51b5', '#e91e63', '#9c27b0', '#f44336', '#607d8b'];
  const THEME_PRIMARY = '#ffb347';
  const THEME_SECONDARY = '#4db6ac';
  const THEME_ERROR = '#ff5252';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-primary p-2 shadow-lg">
          <p className="font-label-md text-primary mb-1 uppercase">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-body-sm text-on-surface">
              {entry.name}: <span className="font-data-md">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">analytics</span> Reports & Analytics
      </h2>
      
      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-outline/30 p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="font-label-sm uppercase text-on-surface-variant tracking-wider mb-2">Total Alerts</span>
          <span className="font-data-lg text-primary text-4xl">{alerts.length}</span>
          <div className="flex gap-2 mt-2 font-label-caps text-xs">
            <span className="text-error">{criticalCount} Critical</span>
            <span className="text-secondary-container">{warningCount} Warn</span>
          </div>
        </div>
        <div className="bg-surface border border-outline/30 p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="font-label-sm uppercase text-on-surface-variant tracking-wider mb-2">Active Workers</span>
          <span className="font-data-lg text-on-surface text-4xl">{totalWorkers}</span>
        </div>
        <div className="bg-surface border border-outline/30 p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="font-label-sm uppercase text-on-surface-variant tracking-wider mb-2">Active Permits</span>
          <span className="font-data-lg text-secondary-container text-4xl">{totalPermits}</span>
        </div>
        <div className="bg-surface border border-outline/30 p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="font-label-sm uppercase text-on-surface-variant tracking-wider mb-2">Avg Risk Score</span>
          <span className={`font-data-lg text-4xl ${Number(avgRiskScore) > 0.5 ? 'text-error' : 'text-primary'}`}>{avgRiskScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Alerts Donut Chart */}
        <div className="bg-surface border border-outline/30 p-6 shadow-sm">
          <h3 className="font-headline-sm uppercase text-primary mb-4 text-center">Alerts By Zone</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {alertData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-label)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Risk & Safety Debt Bar Chart */}
        <div className="bg-surface border border-outline/30 p-6 shadow-sm lg:col-span-2">
          <h3 className="font-headline-sm uppercase text-primary mb-4 text-center">Risk Index & Safety Debt by Zone</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} axisLine={{ stroke: 'var(--color-outline)' }} />
                <YAxis yAxisId="left" orientation="left" stroke={THEME_PRIMARY} tick={{ fill: 'var(--color-on-surface-variant)' }} />
                <YAxis yAxisId="right" orientation="right" stroke={THEME_ERROR} tick={{ fill: 'var(--color-on-surface-variant)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-label)', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="riskScore" name="Risk Score (0-100)" fill={THEME_PRIMARY} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="safetyDebt" name="Safety Debt" fill={THEME_ERROR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Resource Allocation Stacked Bar Chart */}
        <div className="bg-surface border border-outline/30 p-6 shadow-sm">
          <h3 className="font-headline-sm uppercase text-primary mb-4 text-center">Resource Allocation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} axisLine={{ stroke: 'var(--color-outline)' }} />
                <YAxis tick={{ fill: 'var(--color-on-surface-variant)' }} axisLine={{ stroke: 'var(--color-outline)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-label)', paddingTop: '10px' }} />
                <Bar dataKey="workers" name="Active Workers" stackId="a" fill={THEME_SECONDARY} />
                <Bar dataKey="permits" name="Active Permits" stackId="a" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const store = usePlantStore();
  
  const [audioAlerts, setAudioAlerts] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [refreshRate, setRefreshRate] = React.useState('realtime');
  
  const [agentOracle, setAgentOracle] = React.useState(true);
  const [agentForge, setAgentForge] = React.useState(true);
  const [agentBlaze, setAgentBlaze] = React.useState(true);
  const [agentChaos, setAgentChaos] = React.useState(false);

  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">settings</span> System Settings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Simulation Controls (Existing) */}
        <div className="bg-surface border border-outline/30 p-6 shadow-sm flex flex-col">
          <h3 className="font-headline-sm uppercase text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">science</span> Simulation Controls
          </h3>
          <p className="font-body-md text-on-surface-variant mb-6">Toggle various mock events to test the Command Centre response capabilities.</p>
          <div className="flex flex-wrap gap-4 mt-auto">
            <button 
              onClick={() => store.triggerCriticalEvent()}
              className="bg-error/20 text-error border border-error px-4 py-2 uppercase font-label-md hover:bg-error/30 transition-colors"
            >
              Trigger Test Critical Alert
            </button>
            <button 
              onClick={() => store.setDangerMode(!store.dangerMode)}
              className="bg-primary/20 text-primary border border-primary px-4 py-2 uppercase font-label-md hover:bg-primary/30 transition-colors"
            >
              Toggle Danger Mode (UI)
            </button>
          </div>
        </div>

        {/* Display & Notifications */}
        <div className="bg-surface border border-outline/30 p-6 shadow-sm">
          <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">notifications</span> Display & Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="font-body-md group-hover:text-primary transition-colors">Critical Audio Alerts</span>
              <input type="checkbox" checked={audioAlerts} onChange={(e) => setAudioAlerts(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="font-body-md group-hover:text-primary transition-colors">Push Notifications to Mobile</span>
              <input type="checkbox" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
            </label>
            <div className="pt-2 border-t border-outline/20">
              <label className="block font-label-md text-on-surface-variant uppercase mb-2 mt-2">Telemetry Refresh Rate</label>
              <select value={refreshRate} onChange={(e) => setRefreshRate(e.target.value)} className="w-full bg-background border border-primary/50 text-on-surface p-2 font-body-md focus:outline-none focus:border-primary">
                <option value="realtime">Real-time (WebSockets)</option>
                <option value="5s">Polled (Every 5 seconds)</option>
                <option value="30s">Polled (Every 30 seconds)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Agent Configurations */}
        <div className="bg-surface border border-outline/30 p-6 shadow-sm md:col-span-2">
          <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">smart_toy</span> Safentra AI Agents Configuration
          </h3>
          <p className="font-body-md text-on-surface-variant mb-6">Manage the active status of specialized AI operatives monitoring the facility.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className={`border p-4 cursor-pointer transition-colors ${agentOracle ? 'border-primary bg-primary/5' : 'border-outline/30 hover:border-primary/50'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-lg uppercase tracking-widest text-primary">Oracle</span>
                <input type="checkbox" checked={agentOracle} onChange={(e) => setAgentOracle(e.target.checked)} className="accent-primary" />
              </div>
              <p className="font-body-sm text-on-surface-variant">Regulatory compliance & historical context advisory.</p>
            </label>
            
            <label className={`border p-4 cursor-pointer transition-colors ${agentForge ? 'border-primary bg-primary/5' : 'border-outline/30 hover:border-primary/50'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-lg uppercase tracking-widest text-primary">Forge</span>
                <input type="checkbox" checked={agentForge} onChange={(e) => setAgentForge(e.target.checked)} className="accent-primary" />
              </div>
              <p className="font-body-sm text-on-surface-variant">Automated work permit generation & hazard matching.</p>
            </label>

            <label className={`border p-4 cursor-pointer transition-colors ${agentBlaze ? 'border-error bg-error/5' : 'border-outline/30 hover:border-error/50'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-lg uppercase tracking-widest text-error">Blaze</span>
                <input type="checkbox" checked={agentBlaze} onChange={(e) => setAgentBlaze(e.target.checked)} className="accent-error" />
              </div>
              <p className="font-body-sm text-on-surface-variant">Critical incident command, evacuation & lockdown control.</p>
            </label>

            <label className={`border p-4 cursor-pointer transition-colors ${agentChaos ? 'border-secondary-container bg-secondary-container/5' : 'border-outline/30 hover:border-secondary-container/50'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-lg uppercase tracking-widest text-secondary-container">Chaos</span>
                <input type="checkbox" checked={agentChaos} onChange={(e) => setAgentChaos(e.target.checked)} className="accent-secondary-container" />
              </div>
              <p className="font-body-sm text-on-surface-variant">System stress testing & anomaly injection (Sandbox only).</p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SupportView: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">help</span> Support & Diagnostics
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Emergency Contact */}
          <div className="bg-surface border border-outline/30 p-6 shadow-sm">
            <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">emergency</span> Emergency Support
            </h3>
            <p className="font-body-md text-on-surface mb-4 leading-relaxed">
              For critical system failures or immediate emergency support, contact the Safentra Ops Team directly.
            </p>
            <div className="flex flex-col gap-2 bg-error/10 p-4 border-l-4 border-error">
              <p className="font-body-md"><strong className="text-primary uppercase text-sm">Hotline:</strong> 1-800-SAFENTRA-OPS</p>
              <p className="font-body-md"><strong className="text-primary uppercase text-sm">Email:</strong> critical-support@safentra.local</p>
            </div>
          </div>

          {/* System Health Diagnostics */}
          <div className="bg-surface border border-outline/30 p-6 shadow-sm">
            <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">monitor_heart</span> System Diagnostics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-outline/20 pb-2">
                <span className="font-label-md uppercase text-on-surface-variant">Main Database</span>
                <span className="font-label-caps text-secondary-container px-2 py-1 bg-secondary-container/10 border border-secondary-container">NOMINAL</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline/20 pb-2">
                <span className="font-label-md uppercase text-on-surface-variant">WebSocket Relay</span>
                <span className="font-label-caps text-secondary-container px-2 py-1 bg-secondary-container/10 border border-secondary-container">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline/20 pb-2">
                <span className="font-label-md uppercase text-on-surface-variant">AI Agent Engine</span>
                <span className="font-label-caps text-primary px-2 py-1 bg-primary/10 border border-primary">OPTIMAL</span>
              </div>
              <div className="pt-2">
                <button className="w-full bg-surface-variant text-on-surface hover:bg-surface-variant/80 border border-outline py-2 uppercase font-label-sm tracking-wider transition-colors">
                  Download Diagnostic Logs
                </button>
              </div>
            </div>
          </div>
          
          {/* Documentation */}
          <div className="bg-surface border border-outline/30 p-6 shadow-sm">
            <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">library_books</span> Documentation
            </h3>
            <div className="p-4 bg-secondary-container/10 border border-secondary-container/30">
              <ul className="space-y-3 font-body-sm text-on-surface">
                <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span> User Manual (v2.1)
                </li>
                <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[18px]">gavel</span> Emergency Action Protocols (EAP)
                </li>
                <li className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span> Agent Directives (ORACLE, BLAZE)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Submit a Ticket */}
          <div className="bg-surface border border-outline/30 p-6 shadow-sm">
            <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">confirmation_number</span> Submit a Support Ticket
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-4">For non-emergency bugs or feature requests.</p>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block font-label-md text-on-surface-variant uppercase mb-1">Issue Category</label>
                <select className="w-full bg-background border border-primary/50 text-on-surface p-2 font-body-md focus:outline-none focus:border-primary">
                  <option>Bug Report</option>
                  <option>Hardware / Sensor Issue</option>
                  <option>Access Request</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant uppercase mb-1">Description</label>
                <textarea rows={4} placeholder="Describe the issue in detail..." className="w-full bg-background border border-primary/50 text-on-surface p-2 font-body-md focus:outline-none focus:border-primary resize-none"></textarea>
              </div>
              <button type="submit" className="bg-primary text-on-primary py-2 px-4 font-label-lg uppercase tracking-wider hover:bg-primary/90 transition-colors mt-2">
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Quick Troubleshooting */}
          <div className="bg-surface border border-outline/30 p-6 shadow-sm">
            <h3 className="font-headline-sm uppercase text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">build</span> Quick Troubleshooting
            </h3>
            <div className="space-y-4">
              <details className="group border border-outline/20 p-4 bg-background cursor-pointer">
                <summary className="font-label-md uppercase text-primary font-semibold flex justify-between items-center">
                  Sensor Node reads "Offline"
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 font-body-sm text-on-surface-variant leading-relaxed">
                  Verify the physical power connection in the target zone. If power is nominal, the wireless telemetry bridge may need a remote restart. Use the "Download Diagnostic Logs" button and attach them to a hardware ticket.
                </p>
              </details>
              
              <details className="group border border-outline/20 p-4 bg-background cursor-pointer">
                <summary className="font-label-md uppercase text-primary font-semibold flex justify-between items-center">
                  Cannot approve Hot Work Permit
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 font-body-sm text-on-surface-variant leading-relaxed">
                  The FORGE agent will automatically block permit approvals if there are conflicting active permits or elevated gas readings in adjacent zones. Check the Oracle Agent panel for compliance blockage reasons.
                </p>
              </details>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
