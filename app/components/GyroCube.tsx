"use client";
import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGyro } from './GyroProvider';
import * as THREE from 'three';

const RotatingCube: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { orientation, gyroEnabled } = useGyro();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (gyroEnabled) {
      // Convert device orientation to cube rotation
      const alphaRad = (orientation.alpha * Math.PI) / 180;
      const betaRad = (orientation.beta * Math.PI) / 180;
      const gammaRad = (orientation.gamma * Math.PI) / 180;

      meshRef.current.rotation.x = betaRad * 0.01;
      meshRef.current.rotation.y = alphaRad * 0.01;
      meshRef.current.rotation.z = gammaRad * 0.01;
    } else {
      // Gentle auto-rotation when gyro is disabled
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#4A90E2" 
        wireframe={true}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  );
};

interface GyroCubeProps {
  className?: string;
}

const GyroCube: React.FC<GyroCubeProps> = ({ className }) => {
  const { isMobile } = useGyro();

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '100px',
        height: '100px',
        zIndex: 999,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%'
        }}
        camera={{ position: [0, 0, 3], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RotatingCube />
      </Canvas>
    </div>
  );
};

export default GyroCube;