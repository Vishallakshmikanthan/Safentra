import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { usePlantStore } from '../../store/plantStore';
import type { Zone } from '../../types';
import * as THREE from 'three';

const MAP_SIZE = 11;
const getBoxProps = (xPct: number, yPct: number, wPct: number, hPct: number) => {
  const width = wPct * MAP_SIZE;
  const depth = hPct * MAP_SIZE;
  const posX = (xPct * MAP_SIZE) - (MAP_SIZE / 2) + (width / 2);
  const posZ = (yPct * MAP_SIZE) - (MAP_SIZE / 2) + (depth / 2);
  return { position: [posX, 0.5, posZ] as [number, number, number], args: [width - 0.2, 1, depth - 0.2] as [number, number, number] };
};

// Adjusted coordinates with gaps to prevent overlap and make it look clean
const ZONES_LAYOUT: Record<string, any> = {
  'C1': getBoxProps(0.02, 0.02, 0.46, 0.42),
  'C2': getBoxProps(0.50, 0.02, 0.48, 0.30),
  'C3': getBoxProps(0.70, 0.34, 0.28, 0.30),
  'C4': getBoxProps(0.02, 0.46, 0.38, 0.52),
  'C5': getBoxProps(0.42, 0.46, 0.26, 0.52),
  'C6': getBoxProps(0.70, 0.66, 0.28, 0.32)
};

const getZoneStatus = (risk: number) => {
  if (risk > 0.8) return { color: '#ef4444', dotBg: 'bg-error', shadow: 'shadow-error', titleColor: 'text-white' };
  if (risk > 0.2) return { color: '#f59e0b', dotBg: 'bg-secondary', shadow: 'shadow-secondary', titleColor: 'text-white' };
  return { color: '#14b8a6', dotBg: 'bg-primary', shadow: 'shadow-primary', titleColor: 'text-white' };
};

const ZoneBox: React.FC<{ zoneId: string; data?: Zone; isHighestRisk: boolean }> = ({ zoneId, data, isHighestRisk }) => {
  const layout = ZONES_LAYOUT[zoneId] || { position: [0,0,0], args: [1,1,1] };
  const meshRef = useRef<THREE.Mesh>(null);
  
  const risk = data?.riskScore || 0;
  const { color, dotBg, shadow, titleColor } = getZoneStatus(risk);

  useFrame((state) => {
    if (isHighestRisk && meshRef.current) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    } else if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.5, 0.1);
    }
  });

  return (
    <mesh position={layout.position} ref={meshRef}>
      <boxGeometry args={layout.args} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.12} 
        emissive={color}
        emissiveIntensity={0.5}
        side={THREE.DoubleSide}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...layout.args)]} />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
      
      <Html position={[0, 0.6, 0]} center zIndexRange={[100, 0]}>
        <div className={`flex flex-col items-center justify-center py-4 px-6 backdrop-blur-xl bg-[#0F161E]/95 border border-slate-700/60 rounded pointer-events-none min-w-[110px] shadow-2xl transition-all`}>
          <div className={`font-bold text-2xl ${titleColor} mb-1`}>{zoneId}</div>
          <div className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">{Math.round(risk * 100)}% RISK</div>
          <div className={`w-2 h-2 rounded-sm mt-3 ${dotBg} shadow-[0_0_10px_currentColor] ${shadow}`}></div>
          
          {isHighestRisk && risk > 0.8 && (
            <div className="mt-4 bg-error/10 border border-error/50 text-error text-[9px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 uppercase whitespace-nowrap shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="material-symbols-outlined text-[14px]">warning</span> Critical Hotspot
            </div>
          )}
        </div>
      </Html>
    </mesh>
  );
};

export const AtlasSectorMap: React.FC = () => {
  const zones = usePlantStore((state) => state.zones);
  const alerts = usePlantStore((state) => state.alerts);
  const [is3D, setIs3D] = useState(false);
  
  const highestRiskZoneId = useMemo(() => {
    let highestId = 'C4';
    let maxRisk = 0;
    Object.values(zones).forEach(z => {
      if (z.riskScore > maxRisk) {
        maxRisk = z.riskScore;
        highestId = z.id;
      }
    });
    return highestId;
  }, [zones]);

  const stats = useMemo(() => {
    let critical = 0, warning = 0, nominal = 0;
    Object.values(zones).forEach(z => {
      if (z.riskScore > 0.8) critical++;
      else if (z.riskScore > 0.2) warning++;
      else nominal++;
    });
    const maxRisk = Math.max(...Object.values(zones).map(z => z.riskScore));
    return { critical, warning, nominal, maxRisk };
  }, [zones]);

  const gaugeRadius = 40;
  const gaugeCircumference = Math.PI * gaugeRadius;
  const gaugeDashoffset = gaugeCircumference - (stats.maxRisk * gaugeCircumference);

  return (
    <div className="flex-1 relative flex flex-col h-full bg-[#05080A]">
      {/* Header */}
      <div className="flex justify-between items-start p-5 border-b border-white/5 shrink-0 bg-[#0B1219]/90 backdrop-blur-md z-20 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
            <h2 className="font-extrabold text-2xl tracking-widest text-white m-0 uppercase">Atlas Sector Map</h2>
            <div className="flex items-center gap-2 bg-[#061f1c] border border-primary/30 px-3 py-1 rounded-sm">
              <div className="w-2 h-2 rounded-sm bg-primary animate-pulse"></div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
          <span className="text-sm text-slate-400 font-medium tracking-wide">Live Plant Overview</span>
        </div>

        <div className="flex items-center gap-8 pt-1">
          <div className="flex gap-6">
            <span className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
              <div className="w-3.5 h-3.5 rounded-sm bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> Critical
            </span>
            <span className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
              <div className="w-3.5 h-3.5 rounded-sm bg-secondary shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div> Warning
            </span>
            <span className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
              <div className="w-3.5 h-3.5 rounded-sm bg-primary shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div> Nominal
            </span>
          </div>
          <button 
            onClick={() => setIs3D(!is3D)}
            className="w-11 h-11 flex items-center justify-center rounded-sm border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all bg-[#0F161E]"
            title={is3D ? "Switch to 2D Top-Down View" : "Switch to 3D Orbit View"}
          >
            <span className="material-symbols-outlined text-[20px]">{is3D ? 'layers' : 'view_in_ar'}</span>
          </button>
        </div>
      </div>
      
      {/* Left Overlay Card */}
      <div className="absolute left-6 top-[104px] z-20 w-[280px] bg-[#0F161E]/95 backdrop-blur-xl border border-slate-700/50 rounded p-6 shadow-2xl">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">Overall Plant Risk</h3>
        
        {/* Real SVG Gauge */}
        <div className="relative w-48 h-28 mx-auto mb-8">
          <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible drop-shadow-xl">
            {/* Background Arc */}
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            {/* Foreground Arc */}
            <path 
              d="M 10 50 A 40 40 0 0 1 90 50" 
              fill="none" 
              stroke={stats.maxRisk > 0.8 ? '#ef4444' : '#f59e0b'} 
              strokeWidth="6" 
              strokeLinecap="round"
              strokeDasharray={gaugeCircumference} 
              strokeDashoffset={gaugeDashoffset} 
              className="transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
             <span className="text-[40px] font-bold text-white leading-none tracking-tighter">{Math.round(stats.maxRisk * 100)}%</span>
             <span className="text-[10px] text-secondary font-bold tracking-widest uppercase mt-2">Moderate</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">Critical Zones</span>
            <span className="text-error font-bold text-base">{stats.critical}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">Warning Zones</span>
            <span className="text-secondary font-bold text-base">{stats.warning}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">Nominal Zones</span>
            <span className="text-slate-500 font-bold text-base">{stats.nominal}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-5 border-t border-slate-700/50 mt-1">
            <span className="text-slate-300 font-medium">Active Alerts</span>
            <span className="text-white font-bold text-base">{alerts.length}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111A22] to-[#05080A]">
        <Canvas key={is3D ? '3d' : '2d'} camera={{ position: is3D ? [0, 8, 12] : [0, 16, 0], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 20, 0]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />
          
          <gridHelper args={[24, 24, '#1e293b', '#0f172a']} position={[0, -0.01, 0]} />
          
          {/* Shift entire scene right by 1.5 units so it doesn't get covered by the left panel */}
          <group position={[1.5, 0, 0]}>
            {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((id) => (
              <ZoneBox 
                key={id} 
                zoneId={id} 
                data={zones[id]} 
                isHighestRisk={highestRiskZoneId === id} 
              />
            ))}
          </group>

          {is3D && (
            <OrbitControls 
              enablePan={false}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.5}
              minDistance={8}
              maxDistance={25}
              autoRotate
              autoRotateSpeed={0.3}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
};
