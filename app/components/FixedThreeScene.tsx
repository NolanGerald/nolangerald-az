"use client";
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useGyro } from './GyroProvider';

// Lazy load React Three Fiber components
let Canvas: any = null;
let useFrame: any = null;
let THREE: any = null;

const Scene = () => {
  const meshRef = useRef<any>(null);
  const { orientation, gyroEnabled } = useGyro();

  // Use the dynamically loaded useFrame
  if (useFrame) {
    useFrame((state: any, delta: number) => {
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
  }

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6be092" />
    </mesh>
  );
};

interface FixedThreeSceneProps {
  className?: string;
}

const FixedThreeScene: React.FC<FixedThreeSceneProps> = ({ className }) => {
  const { isMobile } = useGyro();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load Three.js on client side
    const loadThree = async () => {
      try {
        const [fiberModule, threeModule] = await Promise.all([
          import('@react-three/fiber'),
          import('three')
        ]);
        
        Canvas = fiberModule.Canvas;
        useFrame = fiberModule.useFrame;
        THREE = threeModule;
        
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Three.js:', err);
        setError('Failed to load 3D scene');
      }
    };

    if (isMobile) {
      loadThree();
    }
  }, [isMobile]);

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  // Show loading state
  if (!isLoaded) {
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
        {error || 'Loading 3D...'}
      </div>
    );
  }

  // Render the actual Three.js scene
  return (
    <div 
      className={className}
      style={{
        width: '120px',
        height: '120px'
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </div>
  );
};

export default FixedThreeScene;