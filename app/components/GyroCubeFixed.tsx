"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useGyro } from './GyroProvider';
import dynamic from 'next/dynamic';

// Dynamically import the entire Three.js scene to avoid SSR issues
const ThreeScene = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => <div style={{ width: '100px', height: '100px' }} />
});

interface GyroCubeProps {
  className?: string;
}

const GyroCube: React.FC<GyroCubeProps> = ({ className }) => {
  const { isMobile } = useGyro();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render on mobile devices and after mounting
  if (!isMobile || !mounted) {
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
      <ThreeScene />
    </div>
  );
};

export default GyroCube;