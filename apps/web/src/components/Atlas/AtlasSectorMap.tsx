import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { usePlantStore } from '../../store/plantStore';
import type { Zone } from '../../types';
import * as THREE from 'three';

// Helper to convert 2D rect into 3D position & size on a 10x10 plane
// Using a 10x10 coordinate system centered at 0,0
const MAP_SIZE = 10;
const getBoxProps = (xPct: number, yPct: number, wPct: number, hPct: number) => {
  const width = wPct * MAP_SIZE;
  const depth = hPct * MAP_SIZE;
  // Canvas X goes right, Z goes forward (so -Z is "up" on screen, +Z is "down").
  // Center is 0,0
  const posX = (xPct * MAP_SIZE) - (MAP_SIZE / 2) + (width / 2);
  const posZ = (yPct * MAP_SIZE) - (MAP_SIZE / 2) + (depth / 2);
  return { position: [posX, 0.5, posZ] as [number, number, number], args: [width - 0.2, 1, depth - 0.2] as [number, number, number] };
};

const ZONES_LAYOUT: Record<string, any> = {
  'C1': getBoxProps(0, 0, 0.5, 0.5),
  'C2': getBoxProps(0.5, 0, 0.5, 0.333),
  'C3': getBoxProps(0.75, 0.333, 0.25, 0.333),
  'C4': getBoxProps(0, 0.5, 0.4, 0.5),
  'C5': getBoxProps(0.4, 0.5, 0.35, 0.5),
  'C6': getBoxProps(0.75, 0.666, 0.25, 0.334)
};

const ZoneBox: React.FC<{ zoneId: string; data?: Zone; isHighestRisk: boolean }> = ({ zoneId, data, isHighestRisk }) => {
  const layout = ZONES_LAYOUT[zoneId] || { position: [0,0,0], args: [1,1,1] };
  const meshRef = useRef<THREE.Mesh>(null);
  
  const risk = data?.riskScore || 0;
  const isDanger = risk > 0.8;
  const color = isDanger ? '#ef4444' : '#14b8a6';

  useFrame((state) => {
    if (isHighestRisk && meshRef.current) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
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
        opacity={isDanger ? 0.8 : 0.4} 
        emissive={color}
        emissiveIntensity={isDanger ? 0.5 : 0.1}
      />
      
      {/* Label */}
      <Text
        position={[0, 0.6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color={isDanger ? '#ffffff' : '#14b8a6'}
        anchorX="center"
        anchorY="middle"
      >
        {zoneId}
      </Text>
      
      {/* Risk Score */}
      <Text
        position={[0, 0.51, 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color={isDanger ? '#ffffff' : '#14b8a6'}
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(risk * 100)}% RISK
      </Text>

      {/* HTML Overlay for alerts */}
      {isHighestRisk && (
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-error text-on-error px-2 py-1 font-label-caps uppercase whitespace-nowrap animate-pulse border border-error-container">
            Critical Hotspot
          </div>
        </Html>
      )}
    </mesh>
  );
};

export const AtlasSectorMap: React.FC = () => {
  const zones = usePlantStore((state) => state.zones);
  
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

  return (
    <div className="flex-1 relative flex flex-col h-full bg-[#f8f9fa]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#d1d5db] shrink-0 bg-white">
        <h2 className="font-bold text-lg tracking-wider text-black m-0 uppercase">Atlas Sector Map</h2>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 text-sm text-black">
            <div className="w-4 h-4 bg-[#ef4444] border border-black/20"></div> Critical
          </span>
          <span className="flex items-center gap-2 text-sm text-black">
            <div className="w-4 h-4 bg-[#f59e0b] border border-black/20"></div> Warning
          </span>
          <span className="flex items-center gap-2 text-sm text-black">
            <div className="w-4 h-4 bg-white border border-black/50"></div> Nominal
          </span>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas camera={{ position: [0, 15, 0], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 20, 0]} intensity={0.8} />
          
          {/* Floor Grid */}
          <gridHelper args={[10, 10, '#14b8a6', '#14b8a6']} position={[0, -0.01, 0]} />
          
          {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((id) => (
            <ZoneBox 
              key={id} 
              zoneId={id} 
              data={zones[id]} 
              isHighestRisk={highestRiskZoneId === id} 
            />
          ))}
        </Canvas>
      </div>
    </div>
  );
};
