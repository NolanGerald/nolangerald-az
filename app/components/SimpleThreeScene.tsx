"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useGyro } from './GyroProvider';

interface SimpleThreeSceneProps {
  className?: string;
}

const SimpleThreeScene: React.FC<SimpleThreeSceneProps> = ({ className }) => {
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
        const [fiberModule, threeModule] = await Promise.all([
          import('@react-three/fiber'),
          import('three')
        ]);
        
        const { Canvas, useFrame } = fiberModule;
        const THREE = threeModule;

        if (!isMounted) return;

        const SceneComponent = () => {
          const meshRef = useRef<THREE.Mesh>(null);

          useFrame((state, delta) => {
            if (!meshRef.current) return;

            if (gyroEnabled) {
              const alphaRad = (orientation.alpha * Math.PI) / 180;
              const betaRad = (orientation.beta * Math.PI) / 180;
              const gammaRad = (orientation.gamma * Math.PI) / 180;

              meshRef.current.rotation.x = betaRad * 0.01;
              meshRef.current.rotation.y = alphaRad * 0.01;
              meshRef.current.rotation.z = gammaRad * 0.01;
            } else {
              meshRef.current.rotation.x += delta * 0.2;
              meshRef.current.rotation.y += delta * 0.1;
            }
          });

          return React.createElement('mesh', { ref: meshRef }, [
            React.createElement('boxGeometry', { key: 'geo', args: [1, 1, 1] }),
            React.createElement('meshStandardMaterial', { key: 'mat', color: '#6be092' })
          ]);
        };

        const CanvasWrapper = () => {
          return React.createElement(Canvas, {
            style: { background: 'transparent', width: '100%', height: '100%' },
            camera: { position: [0, 0, 3], fov: 50 }
          }, [
            React.createElement('ambientLight', { key: 'ambient', intensity: 0.5 }),
            React.createElement('pointLight', { key: 'point', position: [10, 10, 10], intensity: 1 }),
            React.createElement(SceneComponent, { key: 'scene' })
          ]);
        };

        setThreeComponents({ CanvasWrapper });
      } catch (error) {
        console.error('Failed to load Three.js:', error);
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
          background: 'rgba(107, 224, 146, 0.1)',
          border: '2px solid #6be092',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6be092',
          fontSize: '12px'
        }}
      >
        Loading 3D...
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

export default SimpleThreeScene;