"use client";
import React from "react";

interface GyroDebugPanelProps {
  orientation: { alpha: number; beta: number; gamma: number };
  angles: { x: number; y: number; z: number };
}

export function GyroDebugPanel({ orientation, angles }: GyroDebugPanelProps) {
  return (
    <div className="mt-2 text-xs text-gray-400">
      {/* Debug values in two columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Phone Gyro Data */}
        <div>
          <div className="font-semibold text-gray-300 mb-1 text-center">Phone Gyro Data</div>
          <div>Beta (Roll): {orientation.beta.toFixed(1)}°</div>
          <div>Gamma (Yaw): {orientation.gamma.toFixed(1)}°</div>
          <div>Alpha (Roll): {orientation.alpha.toFixed(1)}°</div>
        </div>
        
        {/* N64 Rotation */}
        <div>
          <div className="font-semibold text-gray-300 mb-1 text-center">N64 Rotation</div>
          <div><span className="text-red-500">Pitch (X)</span>: {angles.x.toFixed(1)}°</div>
          <div><span className="text-green-500">Yaw (Y)</span>: {angles.y.toFixed(1)}°</div>
          <div><span className="text-purple-500">Roll (Z)</span>: {angles.z.toFixed(1)}°</div>
        </div>
      </div>
      
      {/* Color Legend */}
      <div className="mt-2 border-t border-gray-600 pt-1">
        <div className="font-semibold text-gray-300 mb-1 text-center">Cube Face Colors</div>
        <div className="grid grid-cols-2 gap-x-4 text-left">
          <div><span className="text-blue-500">Front (+Z)</span>: Blue</div>
          <div><span className="text-orange-500">Back (-Z)</span>: Orange</div>
          <div><span className="text-green-500">Top (+Y)</span>: Green</div>
          <div><span className="text-yellow-500">Bottom (-Y)</span>: Yellow</div>
          <div><span className="text-red-500">Right (+X)</span>: Red</div>
          <div><span className="text-purple-500">Left (-X)</span>: Purple</div>
        </div>
      </div>
      
      {/* Phone Orientation Guide */}
      <div className="mt-2 border-t border-gray-600 pt-1">
        <div className="font-semibold text-gray-300 mb-1 text-center">Phone Orientation Guide</div>
        <img 
          src="/phone-orientation.jpg" 
          alt="Phone gyroscope orientation guide showing alpha, beta, and gamma axes"
          className="w-full max-w-xs mx-auto rounded border border-gray-600"
        />
      </div>
    </div>
  );
}