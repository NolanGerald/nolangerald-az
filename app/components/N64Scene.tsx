"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useGyro } from './GyroProvider';

interface N64SceneProps {
  className?: string;
}

const N64Scene: React.FC<N64SceneProps> = ({ className }) => {
  const { isMobile, gyroEnabled, orientation } = useGyro();
  const [isClient, setIsClient] = useState(false);
  const [ThreeComponents, setThreeComponents] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !isMobile) return;

    let isMounted = true;

    const loadThree = async () => {
      try {
        const [fiberModule, dreiModule, threeModule] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('three')
        ]);
        
        const { Canvas, useFrame, useThree } = fiberModule;
        const { useGLTF, Environment } = dreiModule;
        const THREE = threeModule;

        if (!isMounted) return;

        // N64 Component
        const N64Component = () => {
          const gltfRef = useRef<any>(null);
          const groupRef = useRef<THREE.Group>(null);
          
          // Load the GLB model
          const gltf = useGLTF('/n64/N642.glb');

          useFrame(() => {
            if (!groupRef.current) return;

            if (gyroEnabled) {
              // Map gyroscope data to N64 rotation
              const alphaRad = (orientation.alpha * Math.PI) / 180;
              const betaRad = (orientation.beta * Math.PI) / 180;
              const gammaRad = (orientation.gamma * Math.PI) / 180;

              groupRef.current.rotation.x = betaRad * 0.5;
              groupRef.current.rotation.y = alphaRad * 0.5;
              groupRef.current.rotation.z = gammaRad * 0.5;
            } else {
              // Gentle auto-rotation when gyro is disabled
              groupRef.current.rotation.y += 0.005;
              groupRef.current.rotation.x += 0.001;
              groupRef.current.rotation.z -= 0.002;
            }
          });

          return React.createElement('group', { 
            ref: groupRef, 
            dispose: null 
          }, [
            React.createElement('mesh', {
              key: 'n64-mesh',
              castShadow: true,
              receiveShadow: true,
              geometry: gltf.nodes.N64?.geometry,
              material: React.createElement(THREE.MeshPhongMaterial, {
                color: '#fff',
                wireframe: true
              }),
              position: [0, -1.7, 0],
              rotation: [Math.PI / 2, 0, 0],
              scale: 0.07
            }),
            React.createElement(Environment, { 
              key: 'environment',
              preset: 'city' 
            })
          ]);
        };

        const CanvasWrapper = () => {
          return React.createElement(Canvas, {
            style: { background: 'transparent', width: '100%', height: '100%' },
            camera: { position: [0, 0, 3], fov: 50 }
          }, [
            React.createElement('ambientLight', { key: 'ambient', intensity: 0.5 }),
            React.createElement('pointLight', { key: 'point', position: [10, 10, 10], intensity: 1 }),
            React.createElement(N64Component, { key: 'n64' })
          ]);
        };

        setThreeComponents({ CanvasWrapper });
      } catch (error) {
        console.error('Failed to load N64 scene:', error);
      }
    };

    loadThree();

    return () => {
      isMounted = false;
    };
  }, [isClient, isMobile, gyroEnabled, orientation.alpha, orientation.beta, orientation.gamma]);

  if (!isMobile || !isClient) {
    return null;
  }

  if (!ThreeComponents) {
    return (
      <div 
        className={className}
        style={{
          width: '120px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid #ffffff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '10px',
          textAlign: 'center'
        }}
      >
        Loading N64...
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{
        width: '120px',
        height: '120px'
      }}
    >
      <ThreeComponents.CanvasWrapper />
    </div>
  );
};

export default N64Scene;