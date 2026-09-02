import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Spatial3DNode } from '../../types/workflow';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Box } from 'lucide-react';

interface Architecture3DSceneProps {
  nodes?: Spatial3DNode[];
}

const DEFAULT_3D_NODES: Spatial3DNode[] = [
  { id: '3d-front', label: 'React Client SPA', category: 'Presentation Layer', position: [-3.2, 0.4, 0], color: '#10B981' },
  { id: '3d-api', label: 'FastAPI Gateway', category: 'Application Layer', position: [0, 0, 0], color: '#84CC16' },
  { id: '3d-ai', label: 'AI Intelligence Core', category: 'Domain Service', position: [0, 2.2, -0.5], color: '#38BDF8' },
  { id: '3d-db', label: 'PostgreSQL 16 DB', category: 'Persistence Layer', position: [3.2, -0.4, 0], color: '#EC4899' },
  { id: '3d-docker', label: 'Docker Container Hub', category: 'Infrastructure', position: [0, -2.2, 0.5], color: '#F59E0B' },
];

function ArchitectureLaserBeam({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const lineGeometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  return (
    <primitive
      object={
        new THREE.Line(
          lineGeometry,
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.45,
            linewidth: 1.5,
          })
        )
      }
    />
  );
}

function ArchNodeItem({
  node,
  isSelected,
  onSelect,
}: {
  node: Spatial3DNode;
  isSelected: boolean;
  onSelect: (node: Spatial3DNode) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const isHighlighted = isSelected || hovered;

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isHighlighted ? 1.4 : 0.6);
      meshRef.current.rotation.x += delta * 0.4;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * 0.8;
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        scale={isHighlighted ? 1.35 : 1.0}
      >
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={isHighlighted ? '#84CC16' : node.color}
          emissive={node.color}
          emissiveIntensity={isHighlighted ? 1.2 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Halo Ring */}
      <mesh ref={haloRef} scale={isHighlighted ? 1.35 : 1.0}>
        <torusGeometry args={[0.85, 0.015, 16, 40]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isHighlighted ? 0.9 : 0.3}
        />
      </mesh>

      {/* Holographic HUD */}
      {isHighlighted ? (
        <Html center distanceFactor={9} position={[0, 0.9, 0]} className="pointer-events-none select-none z-20">
          <div className="bg-[#0D2818]/95 text-white backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[#84CC16]/50 shadow-xl whitespace-nowrap space-y-0.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#84CC16] block">
              {node.category}
            </span>
            <div className="font-serif font-bold text-xs">{node.label}</div>
          </div>
        </Html>
      ) : (
        <Html center distanceFactor={12} position={[0, 0.7, 0]} className="pointer-events-none select-none">
          <div className="bg-[#0D2818]/80 text-white/90 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/15 whitespace-nowrap shadow-sm">
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}

export const Architecture3DScene: React.FC<Architecture3DSceneProps> = ({ nodes }) => {
  const activeNodes = nodes && nodes.length > 0 ? nodes : DEFAULT_3D_NODES;
  const [selectedNode, setSelectedNode] = useState<Spatial3DNode | null>(activeNodes[1] || activeNodes[0]);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-[480px] rounded-3xl bg-gradient-to-b from-[#0A2315] via-[#0D2818] to-[#05130B] overflow-hidden border border-[#84CC16]/20 shadow-2xl">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-mono border border-white/20 shadow-sm">
            <Box className="w-3.5 h-3.5 text-[#84CC16]" />
            <span className="font-bold text-[#84CC16]">MODULATED 3D TOPOLOGY</span>
          </div>

          <div className="pointer-events-auto text-xs font-mono text-white/60">
            Drag to rotate • Click nodes to inspect layer details
          </div>
        </div>

        {/* Selected Layer HUD Card */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 bg-[#0D2818]/95 backdrop-blur-xl p-4 rounded-2xl border border-[#84CC16]/40 shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#84CC16] bg-white/10 px-2.5 py-0.5 rounded-full font-bold">
                {selectedNode.category}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h4 className="font-serif font-bold text-lg text-white mt-1">{selectedNode.label}</h4>
            <p className="text-xs text-white/70 font-sans mt-0.5">
              Decoupled micro-module positioned at [{selectedNode.position.join(', ')}]
            </p>
          </div>
        )}

        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
          <pointLight position={[0, 0, 0]} intensity={3.5} color="#84CC16" distance={8} />

          {/* Inter-node Laser Beams */}
          {activeNodes.slice(1).map((n, i) => (
            <ArchitectureLaserBeam
              key={i}
              start={activeNodes[0].position}
              end={n.position}
              color="#84CC16"
            />
          ))}

          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
            {activeNodes.map((node) => (
              <ArchNodeItem
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onSelect={setSelectedNode}
              />
            ))}
          </Float>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
};
