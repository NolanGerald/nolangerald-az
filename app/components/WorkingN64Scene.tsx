"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Text } from "@react-three/drei";
import WorkingN64 from "./WorkingN64";
import * as THREE from "three";
import { useGyro } from './GyroProvider';
import { GyroDebugPanel } from './GyroDebugPanel';
import { RotationLogger } from './RotationLogger';

interface WorkingN64SceneProps {
  className?: string;
}

export function WorkingN64Scene({ className }: WorkingN64SceneProps) {
  const { isMobile, gyroEnabled, orientation } = useGyro();
  const [angles, setAngles] = useState({ x: 0, y: 0, z: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <div className={`relative flex flex-col justify-center items-center ${className}`}>
      <div className="relative" style={{ height: "240px", width: "240px" }}>
        <Canvas 
          style={{ height: "100%", width: "100%" }}
          camera={{ position: [0, 0, 3], fov: 90 }}
        >
          {/* Lights and environment */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <pointLight position={[5, 5, 5]} intensity={0.8} distance={10} decay={2} />
          
          {/* Axis helper tubes */}
          <group>
            {/* X-axis - Red tube */}
            <mesh position={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1]} />
              <meshBasicMaterial color="red" />
            </mesh>
            {/* Y-axis - Green tube */}
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 1]} />
              <meshBasicMaterial color="green" />
            </mesh>
            {/* Z-axis - Blue tube */}
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1]} />
              <meshBasicMaterial color="blue" />
            </mesh>
          </group>

          {/* N64 model with gyro integration */}
          <WorkingN64 
            onAnglesChange={setAngles}
            onLoad={() => setIsLoaded(true)}
            gyroEnabled={gyroEnabled}
            orientation={orientation}
          />
          
        </Canvas>
        
        {/* XYZ coordinate overlay outside the 3D scene */}
        <div className="absolute top-2 right-2 text-xs font-mono">
          <div className="text-red-500">X: {angles.x.toFixed(1)}°</div>
          <div className="text-green-500">Y: {angles.y.toFixed(1)}°</div>
          <div className="text-blue-500">Z: {angles.z.toFixed(1)}°</div>
        </div>
      </div>
      
      {/* <GyroDebugPanel orientation={orientation} angles={angles} /> */}
      {/* Rotation Logger - Uncomment for debugging gyroscope issues */}
      {/* <RotationLogger 
        angles={angles} 
        orientation={orientation} 
        gyroEnabled={gyroEnabled}
      /> */}
    </div>
  );
}