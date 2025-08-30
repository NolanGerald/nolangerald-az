"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMobileDetection } from './useMobileDetection';

interface GyroContextType {
  gyroEnabled: boolean;
  orientation: { alpha: number; beta: number; gamma: number };
  toggleGyro: (enabled: boolean) => void;
  permissionGranted: boolean;
  isMobile: boolean;
}

const GyroContext = createContext<GyroContextType | undefined>(undefined);

export const useGyro = () => {
  const context = useContext(GyroContext);
  if (context === undefined) {
    throw new Error('useGyro must be used within a GyroProvider');
  }
  return context;
};

interface GyroProviderProps {
  children: React.ReactNode;
}

export const GyroProvider: React.FC<GyroProviderProps> = ({ children }) => {
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const gyroEnabledRef = useRef(false);
  
  const { isMobile } = useMobileDetection();

  // Request device orientation permission for iOS 13+
  const requestOrientationPermission = async (): Promise<boolean> => {
    console.log('Requesting orientation permission...');
    
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      console.log('iOS 13+ detected, requesting permission...');
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        console.log('Permission result:', permission);
        const granted = permission === 'granted';
        setPermissionGranted(granted);
        return granted;
      } catch (error) {
        console.error('Permission request failed:', error);
        setPermissionGranted(false);
        return false;
      }
    } else {
      console.log('No permission required (not iOS 13+)');
      setPermissionGranted(true);
      return true;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!gyroEnabledRef.current) return;
    
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    setOrientation({ alpha, beta, gamma });
  };

  useEffect(() => {
    gyroEnabledRef.current = gyroEnabled;
    
    if (gyroEnabled) {
      console.log('Adding device orientation listener...');
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    } else {
      console.log('Removing device orientation listener...');
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [gyroEnabled]);

  const toggleGyro = async (enabled: boolean) => {
    console.log('toggleGyro called with:', enabled);
    
    if (enabled && !permissionGranted) {
      console.log('Permission not granted, requesting...');
      const granted = await requestOrientationPermission();
      if (!granted) {
        console.log('Permission denied, cannot enable gyro');
        return;
      }
    }
    
    console.log('Setting gyro enabled to:', enabled);
    setGyroEnabled(enabled);
  };

  const value = {
    gyroEnabled,
    orientation,
    toggleGyro,
    permissionGranted,
    isMobile
  };

  return (
    <GyroContext.Provider value={value}>
      {children}
    </GyroContext.Provider>
  );
};