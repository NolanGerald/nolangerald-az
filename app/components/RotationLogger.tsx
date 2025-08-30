"use client";
import React, { useEffect, useRef, useState } from "react";

interface RotationLoggerProps {
  angles: { x: number; y: number; z: number };
  orientation: { alpha: number; beta: number; gamma: number };
  gyroEnabled: boolean;
  isButtonClick?: boolean;
}

export function RotationLogger({ angles, orientation, gyroEnabled, isButtonClick }: RotationLoggerProps) {
  const [logBuffer, setLogBuffer] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const lastLogTime = useRef<number>(0);
  const gyroStateRef = useRef<boolean>(gyroEnabled);

  const clearLog = () => {
    setLogBuffer([]);
  };

  const copyToClipboard = () => {
    const logContent = logBuffer.join('\n');
    navigator.clipboard.writeText(logContent).then(() => {
      alert('Log copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const addLog = (message: string) => {
    if (!isLogging) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${message}`;
    
    setLogBuffer(prev => {
      const newBuffer = [...prev, logEntry];
      // Keep only last 500 entries to prevent memory issues
      if (newBuffer.length > 500) {
        return newBuffer.slice(-500);
      }
      return newBuffer;
    });
  };

  useEffect(() => {
    // Log gyro state changes
    if (gyroStateRef.current !== gyroEnabled) {
      addLog(`GYRO_STATE_CHANGE: ${gyroStateRef.current ? 'ENABLED' : 'DISABLED'} -> ${gyroEnabled ? 'ENABLED' : 'DISABLED'}`);
      gyroStateRef.current = gyroEnabled;
    }

    // Log button clicks
    if (isButtonClick) {
      addLog(`BUTTON_CLICK: Gyro toggled to ${gyroEnabled ? 'ENABLED' : 'DISABLED'}`);
    }
  }, [gyroEnabled, isButtonClick]);

  useEffect(() => {
    // Log rotation data every 16ms (~60fps) for high precision
    const now = Date.now();
    if (now - lastLogTime.current >= 16) {
      const logData = {
        gyroEnabled,
        n64_rotation: {
          x: angles.x.toFixed(3),
          y: angles.y.toFixed(3),
          z: angles.z.toFixed(3)
        },
        phone_gyro: {
          alpha: orientation.alpha.toFixed(3),
          beta: orientation.beta.toFixed(3),
          gamma: orientation.gamma.toFixed(3)
        }
      };
      
      addLog(`ROTATION_DATA: ${JSON.stringify(logData)}`);
      lastLogTime.current = now;
    }
  }, [angles, orientation, gyroEnabled]);

  return (
    <div className="mt-2">
      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => setIsLogging(!isLogging)}
          className={`px-3 py-1 text-xs rounded ${
            isLogging ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isLogging ? 'Stop Logging' : 'Start Logging'}
        </button>
        <button 
          onClick={clearLog}
          className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
        >
          Clear Data
        </button>
        <button 
          onClick={copyToClipboard}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          disabled={logBuffer.length === 0}
        >
          Copy Data
        </button>
      </div>
      <div className="text-xs text-gray-300 mb-2">
        Status: {isLogging ? 'Logging...' : 'Stopped'} | Entries: {logBuffer.length}
      </div>
      <textarea
        value={logBuffer.join('\n')}
        readOnly
        className="w-full h-40 text-xs font-mono bg-gray-800 text-gray-200 border border-gray-600 rounded p-2 resize-none"
        placeholder="Click 'Start Logging' then interact with the N64 to see data..."
      />
    </div>
  );
}