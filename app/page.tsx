'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [gyroData, setGyroData] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          setPermissionStatus(permission);
          
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.error('Permission request failed:', error);
          setPermissionStatus('denied');
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        setPermissionStatus('granted');
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setGyroData({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermissionHandler = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        setPermissionStatus(permission);
        
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', (event: DeviceOrientationEvent) => {
            setGyroData({
              alpha: event.alpha || 0,
              beta: event.beta || 0,
              gamma: event.gamma || 0
            });
          });
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        setPermissionStatus('denied');
      }
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        {permissionStatus === 'unknown' && (
          <button
            onClick={requestPermissionHandler}
            className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable Gyroscope
          </button>
        )}
        
        {permissionStatus === 'denied' && (
          <p className="mb-8 text-red-400">
            Gyroscope permission denied. Please enable in browser settings.
          </p>
        )}

        <div
          className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg shadow-lg transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${gyroData.beta * 0.5}deg) rotateY(${gyroData.gamma * 0.5}deg) rotateZ(${gyroData.alpha * 0.1}deg)`
          }}
        />
        
        <div className="mt-8 text-white font-mono text-sm space-y-2">
          <p>Alpha (Z): {gyroData.alpha.toFixed(1)}°</p>
          <p>Beta (X): {gyroData.beta.toFixed(1)}°</p>
          <p>Gamma (Y): {gyroData.gamma.toFixed(1)}°</p>
        </div>
        
        <p className="mt-4 text-gray-400 text-sm">
          Tilt your device to see the box move
        </p>
      </div>
    </main>
  );
}
