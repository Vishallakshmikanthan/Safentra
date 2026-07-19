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
    <div className="flex-1 relative bg-background flex items-center justify-center h-full overflow-hidden">
      <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 20, -10]} angle={0.3} penumbra={1} intensity={1} color="#14b8a6" />
        
        {/* Floor Grid */}
        <gridHelper args={[12, 12, '#14b8a6', '#0f766e']} position={[0, 0.01, 0]} />
        
        {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((id) => (
          <ZoneBox 
            key={id} 
            zoneId={id} 
            data={zones[id]} 
            isHighestRisk={highestRiskZoneId === id} 
          />
        ))}

        <OrbitControls 
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};
