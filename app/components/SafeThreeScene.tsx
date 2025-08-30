"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGyro } from './GyroProvider';

// Dynamically import ThreeScene to prevent SSR issues
const ThreeSceneDynamic = dynamic(() => import('./ThreeSceneCore'), {
  ssr: false,
  loading: () => (
    <div 
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
      Loading...
    </div>
  )
});

interface SafeThreeSceneProps {
  className?: string;
}

const SafeThreeScene: React.FC<SafeThreeSceneProps> = ({ className }) => {
  const { isMobile } = useGyro();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render on mobile devices after mounting
  if (!isMobile || !mounted) {
    return null;
  }

  return <ThreeSceneDynamic className={className} />;
};

export default SafeThreeScene;