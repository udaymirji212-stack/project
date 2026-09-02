import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface MascotProps {
  isPasswordFocused: boolean;
  isSubmitting: boolean;
  hasError: boolean;
  charCount: number;
}

function CyberMascotModel({
  isPasswordFocused,
  isSubmitting,
  hasError,
  charCount,
}: MascotProps) {
  const headRef = useRef<THREE.Group>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const leftHandRef = useRef<THREE.Group>(null!);
  const rightHandRef = useRef<THREE.Group>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    // 1. Head rotation & tracking
    if (headRef.current) {
      if (isPasswordFocused) {
        // Look down shyly/hidden
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.45, 0.1);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.1);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.1);
      } else {
        // Track pointer or look down at input field proportional to charCount
        const targetX = Math.sin(charCount * 0.2) * 0.15 + (state.pointer.x * 0.3);
        const targetY = -0.2 + (state.pointer.y * 0.2);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.08);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.08);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, -targetX * 0.2, 0.08);
      }
    }

    // 2. Halo continuous spin
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * (isSubmitting ? 4.0 : 1.2);
      haloRef.current.rotation.x += delta * 0.4;
    }

    // 3. Hands covering eyes animation
    if (leftHandRef.current && rightHandRef.current) {
      if (isPasswordFocused) {
        // Hands up over visor
        leftHandRef.current.position.x = THREE.MathUtils.lerp(leftHandRef.current.position.x, -0.42, 0.12);
        leftHandRef.current.position.y = THREE.MathUtils.lerp(leftHandRef.current.position.y, 0.2, 0.12);
        leftHandRef.current.position.z = THREE.MathUtils.lerp(leftHandRef.current.position.z, 0.85, 0.12);
        leftHandRef.current.rotation.z = THREE.MathUtils.lerp(leftHandRef.current.rotation.z, 0.6, 0.12);

        rightHandRef.current.position.x = THREE.MathUtils.lerp(rightHandRef.current.position.x, 0.42, 0.12);
        rightHandRef.current.position.y = THREE.MathUtils.lerp(rightHandRef.current.position.y, 0.2, 0.12);
        rightHandRef.current.position.z = THREE.MathUtils.lerp(rightHandRef.current.position.z, 0.85, 0.12);
        rightHandRef.current.rotation.z = THREE.MathUtils.lerp(rightHandRef.current.rotation.z, -0.6, 0.12);
      } else {
        // Hands resting by side with subtle bobbing
        const restY = -0.55 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
        leftHandRef.current.position.x = THREE.MathUtils.lerp(leftHandRef.current.position.x, -1.05, 0.08);
        leftHandRef.current.position.y = THREE.MathUtils.lerp(leftHandRef.current.position.y, restY, 0.08);
        leftHandRef.current.position.z = THREE.MathUtils.lerp(leftHandRef.current.position.z, 0.1, 0.08);
        leftHandRef.current.rotation.z = THREE.MathUtils.lerp(leftHandRef.current.rotation.z, 0.1, 0.08);

        rightHandRef.current.position.x = THREE.MathUtils.lerp(rightHandRef.current.position.x, 1.05, 0.08);
        rightHandRef.current.position.y = THREE.MathUtils.lerp(rightHandRef.current.position.y, restY, 0.08);
        rightHandRef.current.position.z = THREE.MathUtils.lerp(rightHandRef.current.position.z, 0.1, 0.08);
        rightHandRef.current.rotation.z = THREE.MathUtils.lerp(rightHandRef.current.rotation.z, -0.1, 0.08);
      }
    }

    // 4. Eyes scale/blink
    if (leftEyeRef.current && rightEyeRef.current) {
      const isBlinking = !isPasswordFocused && Math.sin(state.clock.elapsedTime * 3) > 0.98;
      const eyeScaleY = isPasswordFocused ? 0.1 : isBlinking ? 0.1 : 1.0;
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }
  });

  const eyeColor = hasError ? '#F43F5E' : isSubmitting ? '#38BDF8' : '#84CC16';

  return (
    <group position={[0, -0.1, 0]}>
      {/* Head Group */}
      <group ref={headRef}>
        {/* Helmet Outer Shell */}
        <mesh>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial
            color="#0D2818"
            roughness={0.2}
            metalness={0.85}
          />
        </mesh>

        {/* Visor Screen Glass */}
        <mesh position={[0, 0.05, 0.42]} rotation={[-0.05, 0, 0]}>
          <boxGeometry args={[1.1, 0.55, 0.4]} />
          <meshStandardMaterial
            color="#05130B"
            roughness={0.1}
            metalness={0.95}
          />
        </mesh>

        {/* Left Glowing Digital Eye */}
        <mesh ref={leftEyeRef} position={[-0.28, 0.08, 0.65]}>
          <capsuleGeometry args={[0.07, 0.14, 8, 16]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>

        {/* Right Glowing Digital Eye */}
        <mesh ref={rightEyeRef} position={[0.28, 0.08, 0.65]}>
          <capsuleGeometry args={[0.07, 0.14, 8, 16]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>

        {/* Cyber Ear Pods */}
        <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} />
          <meshStandardMaterial color="#84CC16" emissive="#84CC16" emissiveIntensity={0.6} metalness={0.8} />
        </mesh>
        <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} />
          <meshStandardMaterial color="#84CC16" emissive="#84CC16" emissiveIntensity={0.6} metalness={0.8} />
        </mesh>

        {/* Holographic Rotating Neural Halo */}
        <mesh ref={haloRef} position={[0, 1.15, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.7, 0.02, 16, 60]} />
          <meshStandardMaterial
            color="#84CC16"
            emissive="#84CC16"
            emissiveIntensity={1.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* Floating Left Cyber Hand */}
      <group ref={leftHandRef} position={[-1.05, -0.55, 0.1]}>
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color="#0D2818"
            emissive="#84CC16"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.05, 0.1]}>
          <boxGeometry args={[0.28, 0.12, 0.08]} />
          <meshStandardMaterial color="#84CC16" emissive="#84CC16" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Floating Right Cyber Hand */}
      <group ref={rightHandRef} position={[1.05, -0.55, 0.1]}>
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color="#0D2818"
            emissive="#84CC16"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.05, 0.1]}>
          <boxGeometry args={[0.28, 0.12, 0.08]} />
          <meshStandardMaterial color="#84CC16" emissive="#84CC16" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Floating Base Body Glow */}
      <mesh position={[0, -1.05, 0]}>
        <coneGeometry args={[0.45, 0.6, 24]} />
        <meshStandardMaterial
          color="#0D2818"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

export const InteractiveAuthMascot: React.FC<MascotProps> = (props) => {
  return (
    <ErrorBoundary>
      <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center">
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[4, 6, 4]} intensity={2.2} color="#FFFFFF" />
          <pointLight position={[0, 0, 2]} intensity={2.0} color="#84CC16" />
          <pointLight position={[-3, -2, -2]} intensity={1.2} color="#38BDF8" />

          <Float speed={2.0} rotationIntensity={0.1} floatIntensity={0.4}>
            <CyberMascotModel {...props} />
          </Float>
        </Canvas>

        {/* Interactive Mascot Status Badge */}
        <div className="absolute bottom-1 text-center pointer-events-none select-none">
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#0D2818]/90 text-emerald-300 border border-[#84CC16]/30 shadow-md backdrop-blur-md">
            {props.isPasswordFocused
              ? '🙈 Privacy Mode • Eyes Shielded'
              : props.isSubmitting
              ? '⚡ Authenticating Architect...'
              : props.hasError
              ? '⚠️ Access Error'
              : '👀 AI Assistant Tracking Input'}
          </span>
        </div>
      </div>
    </ErrorBoundary>
  );
};
