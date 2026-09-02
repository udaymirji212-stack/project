import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '../common/ErrorBoundary';

// 1. Procedural High-Res Earth Surface Map
function createEarthDayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep Blue Ocean Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0a1e3f');
  oceanGrad.addColorStop(0.5, '#052b52');
  oceanGrad.addColorStop(1, '#0a1e3f');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Procedural Landmasses (Continents & Islands)
  ctx.fillStyle = '#1c4a27'; // Lush Forest Green
  const drawContinent = (cx: number, cy: number, rx: number, ry: number, points = 24) => {
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const noise = Math.sin(angle * 5) * 0.2 + Math.cos(angle * 3) * 0.15 + 1;
      const x = cx + Math.cos(angle) * rx * noise;
      const y = cy + Math.sin(angle) * ry * noise;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  // North America
  ctx.fillStyle = '#235930';
  drawContinent(520, 320, 220, 140);
  ctx.fillStyle = '#1d4827';
  drawContinent(460, 420, 120, 80);

  // South America
  ctx.fillStyle = '#1f532a';
  drawContinent(680, 680, 130, 200);

  // Eurasia
  ctx.fillStyle = '#265d33';
  drawContinent(1280, 280, 380, 160);
  ctx.fillStyle = '#1e4b28';
  drawContinent(1520, 380, 220, 140);

  // Africa
  ctx.fillStyle = '#2f5a28';
  drawContinent(1100, 560, 170, 210);

  // Australia
  ctx.fillStyle = '#3a5829';
  drawContinent(1680, 720, 120, 90);

  // Mountain Highlights & Arid Belts
  ctx.fillStyle = 'rgba(180, 150, 90, 0.4)';
  drawContinent(1180, 480, 120, 60); // Sahara
  drawContinent(1360, 300, 140, 50); // Himalayas

  // Polar Ice Caps
  ctx.fillStyle = '#E2F1FF';
  ctx.fillRect(0, 0, canvas.width, 45); // North Pole
  ctx.fillRect(0, canvas.height - 55, canvas.width, 55); // South Pole

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 2. Procedural Night Lights (City Glows on Dark Side)
function createEarthNightTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // City clusters (Glowing Golden-Cyan)
  const drawCityCluster = (cx: number, cy: number, radius: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const size = Math.random() * 2 + 0.5;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      grad.addColorStop(0, '#FFE885');
      grad.addColorStop(0.4, '#FFB300');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // US East/West, Europe, East Asia, India clusters
  drawCityCluster(260, 160, 45, 60); // US East
  drawCityCluster(190, 170, 30, 40); // US West
  drawCityCluster(540, 140, 50, 90); // Europe
  drawCityCluster(720, 210, 45, 80); // India
  drawCityCluster(820, 170, 55, 100); // East Asia
  drawCityCluster(340, 340, 35, 30); // Brazil
  drawCityCluster(840, 360, 30, 25); // Sydney

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 3. Procedural Cloud Layer Texture
function createCloudsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Organic Swirling Clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * canvas.width;
    const y = 80 + Math.random() * (canvas.height - 160);
    const rw = 40 + Math.random() * 120;
    const rh = 15 + Math.random() * 40;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, rw);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.ellipse(x, y, rw, rh, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// Realistic Earth Globe with Atmosphere & Clouds
function RealisticEarthGlobe() {
  const earthRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const satelliteOrbitRef = useRef<THREE.Group>(null!);

  const dayTexture = useMemo(() => createEarthDayTexture(), []);
  const nightTexture = useMemo(() => createEarthNightTexture(), []);
  const cloudsTexture = useMemo(() => createCloudsTexture(), []);

  useFrame((_state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.11;
      cloudsRef.current.rotation.x += delta * 0.01;
    }
    if (satelliteOrbitRef.current) {
      satelliteOrbitRef.current.rotation.y -= delta * 0.25;
      satelliteOrbitRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Terrestrial Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          map={dayTexture}
          emissiveMap={nightTexture}
          emissive={new THREE.Color('#FFE082')}
          emissiveIntensity={0.55}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Rotating Translucent Cloud Sphere */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.23, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Glowing Atmospheric Rayleigh Scattering Rim Layer */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.35, 48, 48]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Cyan Glow Aura */}
      <mesh>
        <sphereGeometry args={[2.42, 32, 32]} />
        <meshBasicMaterial
          color="#84CC16"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Orbital Ring & Telemetry Satellite Marker */}
      <mesh rotation={[Math.PI / 3, 0.2, 0]}>
        <ringGeometry args={[3.2, 3.22, 90]} />
        <meshBasicMaterial color="#84CC16" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      <group ref={satelliteOrbitRef} rotation={[Math.PI / 3, 0.2, 0]}>
        <group position={[3.21, 0, 0]}>
          {/* Satellite Beacon */}
          <mesh>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#84CC16" emissive="#84CC16" emissiveIntensity={2.0} />
          </mesh>
          <Html center distanceFactor={8} position={[0, 0.35, 0]} className="pointer-events-none select-none">
            <div className="bg-[#0D2818]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded-full border border-[#84CC16]/50 backdrop-blur-md shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-ping" />
              <span>BUILDMIND SAT-1 • 420 KM</span>
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

// Deep Cosmic Starfield
function CosmicStarfield({ count = 350 }: { count?: number }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 40;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 30;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#FFFFFF" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export const RealisticEarthScene: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="relative w-full h-full min-h-[420px] sm:min-h-[580px] flex items-center justify-center overflow-hidden">
        <Canvas
          camera={{ position: [0, 0.8, 6.2], fov: 45 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <ambientLight intensity={0.4} />
          {/* Main Sun Key Light */}
          <directionalLight position={[12, 6, 8]} intensity={3.5} color="#FFFBF0" />
          {/* Subtle Ambient Galactic Fill */}
          <pointLight position={[-10, -5, -8]} intensity={1.2} color="#1E3A8A" />

          <CosmicStarfield count={300} />

          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.25}>
            <RealisticEarthGlobe />
          </Float>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 2.5}
            rotateSpeed={0.5}
          />
        </Canvas>

        {/* Spaceedu Real-Time Telemetry HUD Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="inline-flex items-center gap-2 bg-[#05130B]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white font-mono text-[11px] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
            <span className="text-[#84CC16] font-bold">ORBITAL VIEW</span>
            <span className="text-white/40">•</span>
            <span>EARTH TELEMETRY</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-3 bg-[#05130B]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-emerald-300">
            <span>LAT: 37.77° N</span>
            <span className="text-white/30">•</span>
            <span>LNG: 122.41° W</span>
            <span className="text-white/30">•</span>
            <span>ALT: 420.8 KM</span>
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
          <span className="text-[11px] font-mono text-white/60 bg-[#05130B]/70 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
            Drag to rotate planetary globe • Real-time day/night shader
          </span>
        </div>
      </div>
    </ErrorBoundary>
  );
};
