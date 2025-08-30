import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  hasTouch: boolean;
  hasOrientation: boolean;
  isCoarsePointer: boolean;
  userAgent: string;
}

export const useMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    hasTouch: false,
    hasOrientation: false,
    isCoarsePointer: false,
    userAgent: ''
  });

  useEffect(() => {
    // Touch capability detection
    const hasTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0
    );

    // Device orientation/motion support
    const hasOrientation = (
      'DeviceOrientationEvent' in window ||
      'DeviceMotionEvent' in window
    );

    // Pointer type detection (coarse = finger, fine = mouse)
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // User agent detection (fallback)
    const userAgent = navigator.userAgent;
    const isMobileUserAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Combined mobile detection
    // A device is considered mobile if it has:
    // - Touch capability AND orientation support, OR
    // - Coarse pointer (primary input is finger), OR  
    // - Mobile user agent AND touch capability
    const isMobile = (
      (hasTouch && hasOrientation) ||
      isCoarsePointer ||
      (isMobileUserAgent && hasTouch)
    );

    setDetection({
      isMobile,
      hasTouch,
      hasOrientation,
      isCoarsePointer,
      userAgent
    });
  }, []);

  return detection;
};