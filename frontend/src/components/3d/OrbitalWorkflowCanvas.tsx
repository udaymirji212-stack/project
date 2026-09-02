import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sparkles,
  Play,
  Pause,
  Shield,
  Layers,
  Code2,
  Database,
  Terminal,
  FileText,
  Download,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { ErrorBoundary } from '../common/ErrorBoundary';

export interface WorkflowStageNode {
  id: number;
  label: string;
  shortLabel: string;
  code: string;
  color: string;
  glowColor: string;
  angle: number;
  distance: number;
  heightOffset: number;
  metric: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_STAGES: WorkflowStageNode[] = [
  {
    id: 1,
    label: '1. Requirements Analysis',
    shortLabel: 'Requirements',
    code: 'REQ_AST',
    color: '#10B981',
    glowColor: '#34D399',
    angle: 0,
    distance: 3.7,
    heightOffset: 0.2,
    metric: '100% Specification Coverage',
    description: 'Deconstructs business requirements into functional criteria, user stories, and RBAC matrix.',
    icon: FileText,
  },
  {
    id: 2,
    label: '2. IEEE 830 SRS Spec',
    shortLabel: 'IEEE SRS',
    code: 'SRS_SPEC',
    color: '#84CC16',
    glowColor: '#A3E635',
    angle: (Math.PI / 4) * 1,
    distance: 3.9,
    heightOffset: -0.25,
    metric: 'ISO-29148 Standard',
    description: 'Synthesizes formal 11-section Software Requirements Specification with live editing.',
    icon: Sparkles,
  },
  {
    id: 3,
    label: '3. System Architecture',
    shortLabel: 'Architecture',
    code: 'ARCH_3D',
    color: '#06B6D4',
    glowColor: '#22D3EE',
    angle: (Math.PI / 4) * 2,
    distance: 3.6,
    heightOffset: 0.35,
    metric: 'Decoupled Graph Topology',
    description: 'Interactive React Flow 2D graphs and spatial 3D micro-modular topology.',
    icon: Layers,
  },
  {
    id: 4,
    label: '4. Relational DB & REST API',
    shortLabel: 'DB & API',
    code: 'DB_OPENAPI',
    color: '#0284C7',
    glowColor: '#38BDF8',
    angle: (Math.PI / 4) * 3,
    distance: 4.0,
    heightOffset: -0.2,
    metric: 'ANSI SQL DDL & OpenAPI 3.1',
    description: 'ACID entity schemas, foreign keys, indexes, and validated REST API contracts.',
    icon: Database,
  },
  {
    id: 5,
    label: '5. Full-Stack Code Gen',
    shortLabel: 'Code Gen',
    code: 'CODE_GEN',
    color: '#8B5CF6',
    glowColor: '#A78BFA',
    angle: (Math.PI / 4) * 4,
    distance: 3.7,
    heightOffset: 0.3,
    metric: 'Micro-Modular Tree',
    description: 'FastAPI backend, React TypeScript frontend, Docker compose & test suite synthesis.',
    icon: Code2,
  },
  {
    id: 6,
    label: '6. Monaco Workspace IDE',
    shortLabel: 'Workspace',
    code: 'IDE_KERNEL',
    color: '#A855F7',
    glowColor: '#C084FC',
    angle: (Math.PI / 4) * 5,
    distance: 3.9,
    heightOffset: -0.35,
    metric: 'Real-Time Monaco Kernel',
    description: 'Full-featured embedded IDE with multi-tab browsing, syntax tree, and Cmd+S saving.',
    icon: Terminal,
  },
  {
    id: 7,
    label: '7. AI Review & Test Runner',
    shortLabel: 'AI Testing',
    code: 'QA_VERIFY',
    color: '#F43F5E',
    glowColor: '#FB7185',
    angle: (Math.PI / 4) * 6,
    distance: 3.6,
    heightOffset: 0.15,
    metric: '100% Pytest Pass Rate',
    description: 'OWASP security vulnerability auditor, code smell remediations, and live test runner.',
    icon: Shield,
  },
  {
    id: 8,
    label: '8. Production Documentation',
    shortLabel: 'Documentation',
    code: 'PROD_PKG',
    color: '#F59E0B',
    glowColor: '#FBBF24',
    angle: (Math.PI / 4) * 7,
    distance: 4.0,
    heightOffset: -0.3,
    metric: 'Sanitized ZIP Archive',
    description: 'Architecture manuals, API documentation, and zero-leak deployment packages.',
    icon: Download,
  },
];

// Floating Particle Starfield
function ParticleField({ count = 200 }: { count?: number }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 18;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 10;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#84CC16"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Central Quantum Core with Gyroscopic Laser Rings
function QuantumCore({ isHovered }: { isHovered: boolean }) {
  const coreRef = useRef<THREE.Group>(null!);
  const ringX = useRef<THREE.Mesh>(null!);
  const ringY = useRef<THREE.Mesh>(null!);
  const ringZ = useRef<THREE.Mesh>(null!);

  useFrame((_state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.3;
    }
    if (ringX.current) {
      ringX.current.rotation.x += delta * 0.6;
      ringX.current.rotation.y += delta * 0.2;
    }
    if (ringY.current) {
      ringY.current.rotation.y -= delta * 0.5;
      ringY.current.rotation.z += delta * 0.3;
    }
    if (ringZ.current) {
      ringZ.current.rotation.z += delta * 0.4;
      ringZ.current.rotation.x -= delta * 0.25;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Central Glowing Icosahedron */}
      <mesh scale={isHovered ? 1.15 : 1.0}>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial
          color="#0D2818"
          emissive="#84CC16"
          emissiveIntensity={isHovered ? 1.2 : 0.8}
          roughness={0.1}
          metalness={0.9}
          wireframe={true}
        />
      </mesh>

      {/* Inner Dense Crystal Core */}
      <mesh scale={0.5}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#84CC16"
          emissive="#A3E635"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Gyroscopic Gimbal Ring 1 */}
      <mesh ref={ringX} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.35, 0.018, 16, 80]} />
        <meshStandardMaterial
          color="#84CC16"
          emissive="#84CC16"
          emissiveIntensity={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Gyroscopic Gimbal Ring 2 */}
      <mesh ref={ringY} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[1.5, 0.015, 16, 80]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#38BDF8"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Gyroscopic Gimbal Ring 3 */}
      <mesh ref={ringZ} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[1.65, 0.012, 16, 80]} />
        <meshStandardMaterial
          color="#A855F7"
          emissive="#A855F7"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Center Label HUD */}
      <Html center position={[0, 0, 0]} className="pointer-events-none select-none">
        <div className="text-center font-mono text-[9px] font-bold text-[#84CC16] bg-[#0D2818]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#84CC16]/40 shadow-lg whitespace-nowrap">
          BUILDMIND AI CORE
        </div>
      </Html>
    </group>
  );
}

// Laser Energy Beam from Core to Modulated Pod
function EnergyBeam({
  start,
  end,
  color,
  isActive,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  isActive: boolean;
}) {
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
            color: isActive ? color : '#0D2818',
            transparent: true,
            opacity: isActive ? 0.85 : 0.18,
            linewidth: isActive ? 2 : 1,
          })
        )
      }
    />
  );
}

// Modulated Stage Pod (Faceted 3D Mesh + Clean Holographic HUD)
function ModulatedPod({
  stage,
  activeStageId,
  hoveredStageId,
  onSelect,
  onHover,
  orbitProgress,
}: {
  stage: WorkflowStageNode;
  activeStageId: number | null;
  hoveredStageId: number | null;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
  orbitProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);

  const isSelected = activeStageId === stage.id;
  const isHovered = hoveredStageId === stage.id;
  const isHighlighted = isSelected || isHovered;

  // Calculate orbital position
  const currentAngle = stage.angle + orbitProgress;
  const x = Math.cos(currentAngle) * stage.distance;
  const z = Math.sin(currentAngle) * stage.distance;
  const y = stage.heightOffset + Math.sin(orbitProgress * 2 + stage.id) * 0.2;

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isHighlighted ? 1.5 : 0.6);
      meshRef.current.rotation.x += delta * (isHighlighted ? 0.8 : 0.3);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * 1.2;
    }
  });

  return (
    <group>
      {/* Laser connection line to core */}
      <EnergyBeam
        start={[0, 0, 0]}
        end={[x, y, z]}
        color={stage.glowColor}
        isActive={isHighlighted}
      />

      <group ref={groupRef}>
        {/* Modulated Geometric Mesh */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(stage.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(stage.id);
          }}
          onPointerOut={() => onHover(null)}
          scale={isHighlighted ? 1.45 : 1.0}
        >
          {stage.id % 3 === 0 ? (
            <dodecahedronGeometry args={[0.35, 0]} />
          ) : stage.id % 2 === 0 ? (
            <octahedronGeometry args={[0.38, 0]} />
          ) : (
            <icosahedronGeometry args={[0.36, 0]} />
          )}
          <meshStandardMaterial
            color={isHighlighted ? stage.glowColor : '#0D2818'}
            emissive={stage.color}
            emissiveIntensity={isHighlighted ? 1.4 : 0.5}
            roughness={0.15}
            metalness={0.85}
            wireframe={false}
          />
        </mesh>

        {/* Outer Pulsing Halo Ring */}
        <mesh ref={haloRef} scale={isHighlighted ? 1.4 : 1.0}>
          <torusGeometry args={[0.55, 0.015, 16, 40]} />
          <meshBasicMaterial
            color={stage.glowColor}
            transparent
            opacity={isHighlighted ? 0.9 : 0.25}
          />
        </mesh>

        {/* Holographic Reactive HUD */}
        {isHighlighted ? (
          <Html center distanceFactor={9} position={[0, 0.75, 0]} className="pointer-events-none select-none z-20">
            <div className="min-w-[200px] bg-[#0D2818]/95 text-white backdrop-blur-xl p-3 rounded-2xl border border-[#84CC16]/50 shadow-2xl animate-fade-in text-left space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#84CC16] bg-white/10 px-2 py-0.5 rounded-full">
                  STAGE 0{stage.id} • {stage.code}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-ping" />
              </div>
              <h4 className="font-serif font-bold text-xs text-white leading-tight">
                {stage.label}
              </h4>
              <p className="text-[10px] text-emerald-300/90 font-mono">
                {stage.metric}
              </p>
            </div>
          </Html>
        ) : (
          /* Minimal Nano-Beacon Tag for unselected nodes (Eliminates visual overlapping!) */
          <Html center distanceFactor={12} position={[0, 0.45, 0]} className="pointer-events-none select-none">
            <div
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0D2818]/80 text-white/90 border border-white/15 backdrop-blur-xs flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
              <span>{stage.shortLabel}</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// Mouse Parallax & Dynamic Camera Controller
function CameraParallax({ isPaused }: { isPaused: boolean }) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    if (!isPaused) {
      camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.03;
      camera.position.y += (pointer.y * 0.8 + 2.4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

// 2D Static Blueprint Mode
const StaticBlueprint: React.FC<{
  activeStageId: number;
  onSelectStage: (id: number) => void;
  onSwitchTo3D?: () => void;
}> = ({ activeStageId, onSelectStage, onSwitchTo3D }) => {
  const current = WORKFLOW_STAGES.find((s) => s.id === activeStageId) || WORKFLOW_STAGES[0];
  const Icon = current.icon;

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#FAF7F2] to-white border border-[#0D2818]/15 p-6 sm:p-8 flex flex-col justify-between shadow-inner">
      <div className="flex items-center justify-between pb-4 border-b border-[#0D2818]/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#0D2818] text-[#84CC16]">
            2D Architecture Blueprint
          </span>
          <span className="text-xs font-mono text-[#0D2818]/60">8-Stage Continuous Pipeline</span>
        </div>
        {onSwitchTo3D && (
          <button
            onClick={onSwitchTo3D}
            className="text-xs font-mono text-[#0D2818] hover:text-[#84CC16] underline inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <Eye className="w-4 h-4 text-[#84CC16]" /> Switch to Modulated 3D
          </button>
        )}
      </div>

      {/* Grid of Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
        {WORKFLOW_STAGES.map((st) => {
          const isSelected = st.id === activeStageId;
          const StageIcon = st.icon;

          return (
            <button
              key={st.id}
              onClick={() => onSelectStage(st.id)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
                isSelected
                  ? 'bg-[#0D2818] text-white border-[#0D2818] shadow-lg ring-2 ring-[#84CC16]/50 scale-[1.02]'
                  : 'bg-white text-[#0D2818] border-[#0D2818]/10 hover:border-[#84CC16] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected ? 'bg-[#84CC16] text-[#0D2818]' : 'bg-[#FAF7F2] text-[#0D2818]'
                  }`}
                >
                  <StageIcon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#84CC16]' : 'text-[#0D2818]/60'}`}>
                  0{st.id}
                </span>
              </div>
              <h4 className="font-serif font-bold text-xs leading-snug line-clamp-1">{st.label}</h4>
              <p className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-emerald-300' : 'text-[#0D2818]/60'}`}>
                {st.metric}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detail Footer */}
      <div className="bg-[#0D2818] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#84CC16] text-[#0D2818]">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#84CC16] font-bold">
                STAGE 0{current.id} • {current.code}
              </span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs font-mono text-emerald-300">{current.metric}</span>
            </div>
            <h4 className="font-serif font-bold text-base text-white mt-0.5">{current.label}</h4>
            <p className="text-xs text-white/70 font-sans mt-0.5 max-w-xl leading-relaxed">{current.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main 3D Canvas Scene Inner Component
function SceneContent({
  activeStageId,
  hoveredStageId,
  onSelectStage,
  onHoverStage,
  isPlaying,
  speedMultiplier,
}: {
  activeStageId: number | null;
  hoveredStageId: number | null;
  onSelectStage: (id: number) => void;
  onHoverStage: (id: number | null) => void;
  isPlaying: boolean;
  speedMultiplier: number;
}) {
  const [orbitProgress, setOrbitProgress] = useState(0);

  useFrame((_state, delta) => {
    if (isPlaying) {
      setOrbitProgress((prev) => prev + delta * 0.22 * speedMultiplier);
    }
  });

  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[6, 9, 6]} intensity={2.0} color="#FFFFFF" />
      <pointLight position={[0, 0, 0]} intensity={4.0} color="#84CC16" distance={8} />
      <pointLight position={[-5, -3, -4]} intensity={1.5} color="#38BDF8" distance={10} />
      <pointLight position={[5, -3, 4]} intensity={1.5} color="#A855F7" distance={10} />

      <CameraParallax isPaused={!isPlaying} />
      <ParticleField count={180} />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <QuantumCore isHovered={activeStageId !== null || hoveredStageId !== null} />

        {/* Outer Orbit Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.55, 3.58, 64]} />
          <meshBasicMaterial color="#84CC16" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.85, 3.88, 64]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>

        {/* 8 Modulated Stage Pods */}
        {WORKFLOW_STAGES.map((stage) => (
          <ModulatedPod
            key={stage.id}
            stage={stage}
            activeStageId={activeStageId}
            hoveredStageId={hoveredStageId}
            onSelect={onSelectStage}
            onHover={onHoverStage}
            orbitProgress={orbitProgress}
          />
        ))}
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 + 0.15}
        minPolarAngle={Math.PI / 4}
        rotateSpeed={0.6}
      />
    </>
  );
}

// Top-Level Exported Responsive Canvas
export const OrbitalWorkflowCanvas: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [hoveredStageId, setHoveredStageId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const activeStage = WORKFLOW_STAGES.find((s) => s.id === (hoveredStageId || activeStageId)) || WORKFLOW_STAGES[0];
  const ActiveIcon = activeStage.icon;

  if (fallbackMode || !hasWebGL) {
    return (
      <StaticBlueprint
        activeStageId={activeStageId}
        onSelectStage={setActiveStageId}
        onSwitchTo3D={() => setFallbackMode(false)}
      />
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <StaticBlueprint
          activeStageId={activeStageId}
          onSelectStage={setActiveStageId}
          onSwitchTo3D={() => setFallbackMode(false)}
        />
      }
    >
      <div className="space-y-4">
        {/* Main 3D Canvas Viewport */}
        <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl border border-[#0D2818]/15 bg-gradient-to-b from-[#0A2315] via-[#0D2818] to-[#05130B] overflow-hidden shadow-2xl">
          {/* Top HUD Controls Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-mono border border-white/20 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
              <span className="font-bold text-[#84CC16]">MODULATED 3D ENGINE</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80 text-[11px]">Reactive Stage Orbit</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all"
                title={isPlaying ? 'Pause 3D orbit' : 'Resume 3D orbit'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#84CC16]" />}
              </button>

              <button
                onClick={() => setSpeedMultiplier((prev) => (prev === 1.0 ? 1.8 : prev === 1.8 ? 0.5 : 1.0))}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono backdrop-blur-md border border-white/15 transition-all"
                title="Toggle orbit speed"
              >
                {speedMultiplier}x Speed
              </button>

              <button
                onClick={() => setFallbackMode(true)}
                className="text-xs font-mono text-white/80 hover:text-white bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 transition-all inline-flex items-center gap-1.5"
                title="Switch to 2D Blueprint"
              >
                <EyeOff className="w-3.5 h-3.5" /> 2D Blueprint
              </button>
            </div>
          </div>

          {/* WebGL 3D Canvas */}
          <Canvas
            camera={{ position: [0, 2.4, 6.8], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <SceneContent
              activeStageId={activeStageId}
              hoveredStageId={hoveredStageId}
              onSelectStage={setActiveStageId}
              onHoverStage={setHoveredStageId}
              isPlaying={isPlaying}
              speedMultiplier={speedMultiplier}
            />
          </Canvas>

          {/* Bottom Floating Dynamic Stage Pill */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D2818]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-2xl">
            <div className="flex items-center gap-3 pointer-events-auto">
              <div
                className="p-2.5 rounded-xl text-[#0D2818]"
                style={{ backgroundColor: activeStage.glowColor }}
              >
                <ActiveIcon className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#84CC16] font-bold">
                    ACTIVE MODULE: 0{activeStage.id}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-xs font-mono text-emerald-300 font-semibold">{activeStage.metric}</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-white">{activeStage.label}</h4>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-white/60">
              <Activity className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Hover or click stage pods to inspect module specifications</span>
            </div>
          </div>
        </div>

        {/* Modulated Stage Selector Dock */}
        <div className="bg-white p-3 rounded-2xl border border-[#0D2818]/10 shadow-sm overflow-x-auto">
          <div className="flex items-center min-w-max gap-1.5">
            {WORKFLOW_STAGES.map((st) => {
              const isSelected = activeStageId === st.id;
              const StageIcon = st.icon;

              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStageId(st.id)}
                  onMouseEnter={() => setHoveredStageId(st.id)}
                  onMouseLeave={() => setHoveredStageId(null)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0D2818] text-white font-bold shadow-md ring-2 ring-[#84CC16]/50'
                      : 'bg-[#FAF7F2] text-[#0D2818]/80 hover:bg-[#EBE3D5] border border-[#0D2818]/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-[#84CC16] text-[#0D2818]' : 'bg-[#0D2818]/10 text-[#0D2818]'
                    }`}
                  >
                    <StageIcon className="w-3 h-3" />
                  </div>
                  <span>{st.shortLabel}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-[#84CC16]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
