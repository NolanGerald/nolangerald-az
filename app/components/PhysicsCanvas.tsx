'use client';

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const STATIC_DENSITY = 15;
const PARTICLE_SIZES = [12, 18, 24];
const PARTICLE_BOUNCYNESS = 0.9;

const PhysicsCanvas: React.FC = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [constraints, setConstraints] = useState<DOMRect | null>(null);
  const [scene, setScene] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);
  const [engine, setEngine] = useState<any>(null);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  const handleResize = () => {
    if (boxRef.current) {
      setConstraints(boxRef.current.getBoundingClientRect());
    }
  };

  // Request device orientation permission for iOS 13+
  const requestOrientationPermission = async (): Promise<boolean> => {
    console.log('Requesting orientation permission...');
    console.log('Current URL protocol:', window.location.protocol);
    console.log('User agent:', navigator.userAgent);
    
    // Check if we're on HTTPS (required for iOS 13+)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.error('HTTPS is required for device orientation on iOS 13+');
      alert('Device orientation requires HTTPS. Please use https:// instead of http://');
      return false;
    }
    
    // iOS 13+ requires explicit permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      console.log('iOS 13+ detected, requesting DeviceOrientationEvent permission');
      try {
        // This MUST be called from a user gesture (click/touch)
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        console.log('DeviceOrientationEvent permission result:', permission);
        
        if (permission === 'granted') {
          console.log('✓ Device orientation permission granted');
          setPermissionGranted(true);
          return true;
        } else {
          console.error('❌ Device orientation permission denied:', permission);
          alert('Device orientation permission was denied. To reset, go to Safari Settings → Privacy & Security → Website Settings and clear data for this site.');
          return false;
        }
      } catch (error) {
        console.error('❌ DeviceOrientationEvent permission request failed:', error);
        if (error.name === 'NotAllowedError') {
          alert('Permission request blocked. Make sure you\'re not in private browsing mode and try again.');
        }
        return false;
      }
    } else if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      console.log('iOS 13+ detected, trying DeviceMotionEvent permission as fallback');
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        console.log('DeviceMotionEvent permission result:', permission);
        
        if (permission === 'granted') {
          console.log('✓ Device motion permission granted');
          setPermissionGranted(true);
          return true;
        } else {
          console.error('❌ Device motion permission denied:', permission);
          return false;
        }
      } catch (error) {
        console.error('❌ DeviceMotionEvent permission request failed:', error);
        return false;
      }
    } else {
      // Non-iOS devices or older iOS versions
      console.log('Non-iOS 13+ device, no permission required');
      setPermissionGranted(true);
      return true;
    }
  };

  // Toggle gyroscope on/off
  const onGyroToggle = async (enabled: boolean) => {
    console.log('Toggle function called with:', enabled);
    console.log('Current gyroEnabled state:', gyroEnabled);
    
    setGyroEnabled(enabled);
    
    if (enabled) {
      console.log('Enabling gyroscope...');
      // Always call our permission function which handles both iOS types
      const hasPermission = await requestOrientationPermission();
      console.log('Permission result:', hasPermission);
      if (hasPermission) {
        setupOrientationListener();
      } else {
        console.log('Permission denied, resetting toggle');
        setGyroEnabled(false);
      }
    } else {
      console.log('Disabling gyroscope...');
      // Remove event listener and reset gravity
      window.removeEventListener('deviceorientation', handleOrientation);
      if (engine) {
        engine.world.gravity.x = 0;
        engine.world.gravity.y = 0.001;
      }
    }
  };

  // Orientation handler function (defined at component level)
  const handleOrientation = (event: DeviceOrientationEvent) => {
    console.log('Orientation event received:', event);
    
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    console.log('Values:', { alpha, beta, gamma });
    
    // Update orientation state for debugging
    setOrientation({ alpha, beta, gamma });
    
    if (!engine || !gyroEnabled) return;
    
    // Use gamma for left/right tilt (-90 to 90 degrees)
    // Convert gamma to gravity values
    // gamma: -90 (tilted left) to 90 (tilted right)
    // Normalize to -1 to 1 and scale for gravity strength
    const gravityX = Math.max(-1, Math.min(1, gamma / 45)) * 0.002; // Increased strength
    const gravityY = 0.002; // Increased base gravity
    
    console.log('Setting gravity:', { gravityX, gravityY });
    
    // Update engine gravity
    engine.world.gravity.x = gravityX;
    engine.world.gravity.y = gravityY;
  };

  // Setup device orientation listener
  const setupOrientationListener = () => {
    console.log('Setting up orientation listener...');
    console.log('User agent:', navigator.userAgent);
    console.log('Is HTTPS:', window.location.protocol === 'https:');
    console.log('Is mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Test if device orientation is supported
    if ('DeviceOrientationEvent' in window) {
      console.log('DeviceOrientationEvent is supported');
      
      // Test if we can access the event properties
      console.log('DeviceOrientationEvent.requestPermission exists:', typeof (DeviceOrientationEvent as any).requestPermission === 'function');
      
      // Add listener
      window.addEventListener('deviceorientation', handleOrientation, true); // Added passive flag
      console.log('Event listener added with passive flag');
      
      // Test event immediately
      setTimeout(() => {
        console.log('Testing if events are firing... Current orientation:', orientation);
        
        // Try to manually trigger a test
        if (window.DeviceOrientationEvent) {
          console.log('DeviceOrientationEvent constructor available');
        }
      }, 3000);
    } else {
      console.error('DeviceOrientationEvent not supported on this device/browser');
    }
  };

  // Intersection Observer to detect when component is in view
  useEffect(() => {
    if (!boxRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasDropped) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(boxRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasDropped]);

  useEffect(() => {
    if (!boxRef.current || !canvasRef.current) return;

    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let World = Matter.World;

    let matterEngine = Engine.create({});

    let render = Render.create({
      element: boxRef.current,
      engine: matterEngine,
      canvas: canvasRef.current,
      options: {
        background: "transparent",
        wireframes: false
      }
    });

    const floor = Matter.Bodies.rectangle(0, 0, 0, STATIC_DENSITY, {
      isStatic: true,
      label: "floor",
      render: {
        fillStyle: "transparent"
      }
    });

    // Create left and right walls
    const leftWall = Matter.Bodies.rectangle(-STATIC_DENSITY / 2, 0, STATIC_DENSITY, window.innerHeight * 2, {
      isStatic: true,
      render: {
        fillStyle: "transparent"
      }
    });

    const rightWall = Matter.Bodies.rectangle(window.innerWidth + STATIC_DENSITY / 2, 0, STATIC_DENSITY, window.innerHeight * 2, {
      isStatic: true,
      render: {
        fillStyle: "transparent"
      }
    });

    World.add(matterEngine.world, [floor, leftWall, rightWall]);

    Engine.run(matterEngine);
    Render.run(render);

    setConstraints(boxRef.current.getBoundingClientRect());
    setScene(render);
    setEngine(matterEngine);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Don't auto-enable on iOS - wait for user interaction

  useEffect(() => {
    if (scene && constraints && isVisible && !hasDropped) {
      let { width, height } = constraints;
      
      // Drop 40 balls with 3 different sizes
      for (let i = 0; i < 40; i++) {
        const randomX = Math.floor(Math.random() * width);
        const randomSize = PARTICLE_SIZES[Math.floor(Math.random() * PARTICLE_SIZES.length)];
        const randomY = -randomSize - (i * 10); // Stagger the drop heights
        
        Matter.World.add(
          scene.engine.world,
          Matter.Bodies.circle(randomX, randomY, randomSize, {
            restitution: PARTICLE_BOUNCYNESS,
            render: {
              fillStyle: `hsl(${Math.random() * 360}, 80%, 60%)`
            }
          })
        );
      }
      
      setHasDropped(true);
    }
  }, [isVisible, scene, constraints, hasDropped]);

  useEffect(() => {
    if (constraints && scene) {
      let { width, height } = constraints;

      // Dynamically update canvas and bounds
      scene.bounds.max.x = width;
      scene.bounds.max.y = height;
      scene.options.width = width;
      scene.options.height = height;
      scene.canvas.width = width;
      scene.canvas.height = height;

      // Dynamically update floor
      const floor = scene.engine.world.bodies[0];
      const leftWall = scene.engine.world.bodies[1];
      const rightWall = scene.engine.world.bodies[2];

      Matter.Body.setPosition(floor, {
        x: width / 2,
        y: height + STATIC_DENSITY / 2
      });

      Matter.Body.setVertices(floor, [
        { x: 0, y: height },
        { x: width, y: height },
        { x: width, y: height + STATIC_DENSITY },
        { x: 0, y: height + STATIC_DENSITY }
      ]);

      // Update left wall
      Matter.Body.setPosition(leftWall, {
        x: -STATIC_DENSITY / 2,
        y: height / 2
      });

      // Update right wall
      Matter.Body.setPosition(rightWall, {
        x: width + STATIC_DENSITY / 2,
        y: height / 2
      });
    }
  }, [scene, constraints]);

  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
        overflow: "hidden",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 996
      }}
    >
      <canvas ref={canvasRef} />
      {/* Debug orientation values */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          lineHeight: "1.4"
        }}
      >
        <div>α: {orientation.alpha.toFixed(1)}°</div>
        <div>β: {orientation.beta.toFixed(1)}°</div>
        <div>γ: {orientation.gamma.toFixed(1)}°</div>
        <div style={{ marginTop: "4px", fontSize: "10px", opacity: 0.8 }}>
          Permission: {permissionGranted ? "✓" : "✗"}<br/>
          HTTPS: {window.location.protocol === 'https:' ? "✓" : "✗"}<br/>
          Mobile: {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "✓" : "✗"}
        </div>
      </div>
      <button
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "12px 20px",
          background: gyroEnabled ? "#4CAF50" : "#f44336",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          touchAction: "manipulation",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent"
        }}
        onClick={(e) => {
          console.log('Button clicked, current state:', gyroEnabled);
          onGyroToggle(!gyroEnabled);
        }}
        onTouchStart={(e) => {
          console.log('Button touched, current state:', gyroEnabled);
        }}
      >
        {gyroEnabled ? "GYRO ON" : "GYRO OFF"}
      </button>
    </div>
  );
};

export default PhysicsCanvas;