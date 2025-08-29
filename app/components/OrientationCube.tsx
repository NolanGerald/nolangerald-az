'use client';

import React from 'react';

interface OrientationCubeProps {
  orientation: { alpha: number; beta: number; gamma: number };
  position?: {
    top?: string;
    right?: string;
    left?: string;
    bottom?: string;
  };
  size?: number;
}

const OrientationCube: React.FC<OrientationCubeProps> = ({ 
  orientation, 
  position = { top: "80px", right: "10px" },
  size = 50 
}) => {
  const halfSize = size / 2;
  const fontSize = Math.max(6, size / 8);

  return (
    <div
      style={{
        position: "absolute",
        ...position,
        width: `${size}px`,
        height: `${size}px`,
        transformOrigin: "center center",
        transform: `rotateX(${orientation.beta}deg) rotateY(${orientation.gamma}deg) rotateZ(${orientation.alpha}deg)`,
        transformStyle: "preserve-3d",
        zIndex: 500
      }}
    >
      {/* Front face */}
      <div style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(255, 0, 0, 0.7)",
        transform: `translateZ(${halfSize}px)`,
        border: "1px solid #FF0000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        color: "white"
      }}>FRONT</div>
      
      {/* Back face */}
      <div style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(0, 255, 0, 0.7)",
        transform: `rotateY(180deg) translateZ(${halfSize}px)`,
        border: "1px solid #00FF00",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        color: "white"
      }}>BACK</div>
      
      {/* Right face */}
      <div style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(0, 0, 255, 0.7)",
        transform: `rotateY(90deg) translateZ(${halfSize}px)`,
        border: "1px solid #0000FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        color: "white"
      }}>RIGHT</div>
      
      {/* Left face */}
      <div style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(255, 255, 0, 0.7)",
        transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
        border: "1px solid #FFFF00",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        color: "black"
      }}>LEFT</div>
      
      {/* Top face */}
      <div style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(255, 0, 255, 0.7)",
        transform: `rotateX(90deg) translateZ(${halfSize}px)`,
        border: "1px solid #FF00FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        color: "white"
      }}>TOP</div>
      
      {/* Bottom face */}
      <div style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(0, 255, 255, 0.7)",
        transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
        border: "1px solid #00FFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        color: "black"
      }}>BOTTOM</div>
    </div>
  );
};

export default OrientationCube;