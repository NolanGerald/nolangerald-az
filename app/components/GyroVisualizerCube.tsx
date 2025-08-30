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

  // Map gyroscope data to 3D rotations (matching the trekhleb.dev example)
  const rotateX = gyroEnabled ? orientation.beta : 0;   // X-axis rotation (front/back tilt)
  const rotateY = gyroEnabled ? orientation.gamma : 0;  // Y-axis rotation (left/right tilt) 
  const rotateZ = gyroEnabled ? orientation.alpha : 0;  // Z-axis rotation (compass rotation)

  return (
    <div 
      className={className}
      style={{
        width: '120px',
        height: '120px',
        perspective: '600px',
        perspectiveOrigin: '50% 50%'
      }}
    >
      {/* 3D Cube Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: gyroEnabled 
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
            : `rotateX(15deg) rotateY(15deg)`,
          transition: gyroEnabled ? 'none' : 'transform 4s ease-in-out infinite alternate',
          animation: gyroEnabled ? 'none' : 'gentleRotate 6s ease-in-out infinite'
        }}
      >
        {/* Front Face */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(74, 144, 226, 0.8)',
            border: '2px solid #4A90E2',
            transform: 'translateZ(60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          FRONT
        </div>

        {/* Back Face */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(100, 13, 95, 0.8)',
            border: '2px solid #640D5F',
            transform: 'translateZ(-60px) rotateY(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          BACK
        </div>

        {/* Left Face */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(234, 34, 100, 0.8)',
            border: '2px solid #EA2264',
            transform: 'rotateY(-90deg) translateZ(60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          LEFT
        </div>

        {/* Right Face */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(247, 141, 96, 0.8)',
            border: '2px solid #F78D60',
            transform: 'rotateY(90deg) translateZ(60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          RIGHT
        </div>

        {/* Top Face */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(74, 144, 226, 0.6)',
            border: '2px solid #4A90E2',
            transform: 'rotateX(90deg) translateZ(60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          TOP
        </div>

        {/* Bottom Face */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            background: 'rgba(100, 13, 95, 0.6)',
            border: '2px solid #640D5F',
            transform: 'rotateX(-90deg) translateZ(60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          BOTTOM
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gentleRotate {
          0% { transform: rotateX(15deg) rotateY(15deg) rotateZ(0deg); }
          25% { transform: rotateX(30deg) rotateY(45deg) rotateZ(10deg); }
          50% { transform: rotateX(45deg) rotateY(15deg) rotateZ(-10deg); }
          75% { transform: rotateX(30deg) rotateY(-15deg) rotateZ(5deg); }
          100% { transform: rotateX(15deg) rotateY(15deg) rotateZ(0deg); }
        }
      `}</style>
    </div>
  );
};

export default GyroVisualizer;