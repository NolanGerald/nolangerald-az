"use client";
import React, { useEffect, useState } from 'react';
import { useGyro } from './GyroProvider';

interface GyroVisualizerProps {
  className?: string;
}

const GyroVisualizer: React.FC<GyroVisualizerProps> = ({ className }) => {
  const { isMobile, gyroEnabled, orientation } = useGyro();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render on mobile devices and after mounting
  if (!isMobile || !mounted) {
    return null;
  }

  // Convert orientation to CSS transforms
  const rotateX = gyroEnabled ? orientation.beta * 0.5 : 0;
  const rotateY = gyroEnabled ? orientation.gamma * 0.5 : 0;
  const rotateZ = gyroEnabled ? orientation.alpha * 0.1 : 0;

  return (
    <div 
      className={className}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120px',
        height: '120px',
        zIndex: 999,
        pointerEvents: 'none',
        perspective: '300px'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          border: '2px solid #4A90E2',
          borderRadius: '8px',
          background: 'rgba(74, 144, 226, 0.1)',
          transformStyle: 'preserve-3d',
          transform: gyroEnabled 
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
            : `rotateX(45deg) rotateY(45deg)`,
          transition: gyroEnabled ? 'none' : 'transform 2s ease-in-out infinite alternate',
          animation: gyroEnabled ? 'none' : 'gentleRotate 4s ease-in-out infinite',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
        }}
      >
        {/* Inner cube elements for 3D effect */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '60%',
            height: '60%',
            border: '1px solid rgba(74, 144, 226, 0.5)',
            borderRadius: '4px',
            transform: 'translateZ(20px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '30%',
            width: '40%',
            height: '40%',
            border: '1px solid rgba(74, 144, 226, 0.3)',
            borderRadius: '2px',
            transform: 'translateZ(40px)'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes gentleRotate {
          0% { transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg); }
          50% { transform: rotateX(30deg) rotateY(60deg) rotateZ(15deg); }
          100% { transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg); }
        }
      `}</style>
    </div>
  );
};

export default GyroVisualizer;