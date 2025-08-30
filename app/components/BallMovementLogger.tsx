"use client";
import React, { useEffect, useRef, useState } from "react";

interface BallMovementLoggerProps {
  engine: any;
  gyroEnabled: boolean;
  orientation: { alpha: number; beta: number; gamma: number };
}

export function BallMovementLogger({ engine, gyroEnabled, orientation }: BallMovementLoggerProps) {
  const [logBuffer, setLogBuffer] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState<boolean>(true); // Start logging automatically
  const lastLogTime = useRef<number>(0);
  const gyroStateRef = useRef<boolean>(gyroEnabled);
  const trackedBalls = useRef<Set<any>>(new Set());

  const clearLog = () => {
    setLogBuffer([]);
  };

  const copyToClipboard = () => {
    const logContent = logBuffer.join('\n');
    navigator.clipboard.writeText(logContent).then(() => {
      alert('Ball movement log copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const addLog = (message: string) => {
    if (!isLogging) return;
    
    // Stop logging when we reach 10000 entries
    if (logBuffer.length >= 10000) {
      setIsLogging(false);
      return;
    }
    
    const now = new Date();
    const timestamp = now.toISOString();
    const systemSeconds = Math.floor(now.getTime() / 1000); // Unix timestamp in seconds
    const logEntry = `${timestamp} [${systemSeconds}s]: ${message}`;
    
    setLogBuffer(prev => {
      const newBuffer = [...prev, logEntry];
      return newBuffer;
    });
  };

  useEffect(() => {
    // Log gyro state changes
    if (gyroStateRef.current !== gyroEnabled) {
      addLog(`GYRO_STATE_CHANGE: ${gyroStateRef.current ? 'ENABLED' : 'DISABLED'} -> ${gyroEnabled ? 'ENABLED' : 'DISABLED'}`);
      gyroStateRef.current = gyroEnabled;
    }
  }, [gyroEnabled]);

  useEffect(() => {
    if (!engine || !isLogging) return;

    // Select a few balls to track (first 5 balls we encounter)
    const updateTrackedBalls = () => {
      const bodies = engine.world.bodies;
      
      // More flexible ball detection
      const ballBodies = bodies.filter((body: any) => {
        const isCircle = body.circleRadius !== undefined;
        const isMovable = !body.isStatic;
        const hasStroke = body.render && body.render.strokeStyle;
        
        return isCircle && isMovable && hasStroke;
      });
      
      // Track first 5 balls
      trackedBalls.current.clear();
      ballBodies.slice(0, 5).forEach((ball: any) => {
        trackedBalls.current.add(ball);
      });
    };

    updateTrackedBalls();

    // Adaptive logging interval: slower when gyro is enabled for interaction time
    const logIntervalTime = gyroEnabled ? 1000 : 200; // 1 second when gyro enabled, 200ms otherwise
    
    const logInterval = setInterval(() => {
      if (!isLogging) return;

      const now = Date.now();
      if (now - lastLogTime.current >= logIntervalTime) {
        if (trackedBalls.current.size === 0) {
          updateTrackedBalls();
        }
        
        trackedBalls.current.forEach((ball: any, index: number) => {
          if (ball && ball.position) {
            const logData = {
              ballId: index + 1,
              gyroEnabled,
              position: {
                x: ball.position.x.toFixed(2),
                y: ball.position.y.toFixed(2)
              },
              velocity: {
                x: ball.velocity.x.toFixed(3),
                y: ball.velocity.y.toFixed(3)
              },
              speed: Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2).toFixed(3),
              gravity: {
                x: engine.world.gravity.x.toFixed(3),
                y: engine.world.gravity.y.toFixed(3)
              },
              phone_orientation: gyroEnabled ? {
                alpha: orientation.alpha.toFixed(1),
                beta: orientation.beta.toFixed(1),
                gamma: orientation.gamma.toFixed(1)
              } : null
            };
            
            addLog(`BALL_DATA: ${JSON.stringify(logData)}`);
          }
        });
        
        lastLogTime.current = now;
      }
    }, logIntervalTime);

    return () => {
      clearInterval(logInterval);
    };
  }, [engine, isLogging, gyroEnabled, orientation]);

  return (
    <div className="mt-2">
      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => setIsLogging(!isLogging)}
          className={`px-3 py-1 text-xs rounded ${
            isLogging ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isLogging ? 'Stop Ball Logging' : 'Start Ball Logging'}
        </button>
        <button 
          onClick={clearLog}
          className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
        >
          Clear Ball Data
        </button>
        <button 
          onClick={copyToClipboard}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          disabled={logBuffer.length === 0}
        >
          Copy Ball Data
        </button>
      </div>
      <div className="text-xs text-gray-300 mb-2">
        Ball Status: {isLogging ? 'Auto-Logging...' : 'Stopped'} | Entries: {logBuffer.length}/10000 | Tracking: {trackedBalls.current.size} balls
      </div>
      <textarea
        value={logBuffer.join('\n')}
        readOnly
        className="w-full h-40 text-xs font-mono bg-gray-800 text-gray-200 border border-gray-600 rounded p-2 resize-none"
        placeholder="Click 'Start Ball Logging' then interact with balls to see movement data..."
      />
    </div>
  );
}