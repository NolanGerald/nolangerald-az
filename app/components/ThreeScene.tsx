"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGyro } from './GyroProvider';
import * as THREE from 'three';

function Scene() {
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
    <mesh ref={meshRef}>
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color="#6be092" />
    </mesh>
  );
}

interface ThreeSceneProps {
  className?: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
  const { isMobile } = useGyro();

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{
        width: '120px',
        height: '120px'
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
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeScene;