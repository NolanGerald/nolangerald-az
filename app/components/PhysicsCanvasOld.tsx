'use client';

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import DebugPanel from "./DebugPanel";
import { useMobileDetection } from "./useMobileDetection";
import { useGyro } from "./GyroProvider";

const STATIC_DENSITY = 15;
const PARTICLE_SIZES = [12, 18, 24];
const PARTICLE_BOUNCYNESS = 0.9;
const BALL_COUNT_MOBILE = 100;
const BALL_COUNT_DESKTOP = 350;

// Ball color hex values
const BALL_COLORS = {
  BLUE: "#4A90E2",
  PURPLE: "#640D5F", 
  PINK: "#EA2264",
  ORANGE: "#F78D60"
};

interface PhysicsCanvasProps {
  onBallsDropped?: () => void;
}

const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({ onBallsDropped }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [constraints, setConstraints] = useState<DOMRect | null>(null);
  const [scene, setScene] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);
  const [engine, setEngine] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const engineRef = useRef<any>(null);
  const gyroEnabledRef = useRef(false);
  
  // Mobile detection and gyro context
  const { isMobile, hasTouch, hasOrientation } = useMobileDetection();
  const { gyroEnabled, orientation } = useGyro();

  const addDebugLog = (message: string) => {
    setDebugLog(prev => [...prev.slice(-4), `${new Date().getSeconds()}s: ${message}`]);
  };

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
    addDebugLog(`Toggle: ${enabled}`);
    
    setGyroEnabled(enabled);
    gyroEnabledRef.current = enabled;
    
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

  // Orientation handler function (based on Matter.js gyro example)
  const handleOrientation = (event: DeviceOrientationEvent) => {
    addDebugLog('Event fired!');
    
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    const currentEngine = engineRef.current;
    const currentGyroEnabled = gyroEnabledRef.current;
    
    addDebugLog(`β:${beta.toFixed(1)} γ:${gamma.toFixed(1)} E:${!!currentEngine} G:${currentGyroEnabled}`);
    
    // Update orientation state for debugging
    setOrientation({ alpha, beta, gamma });
    
    if (!currentEngine || !currentGyroEnabled) {
      addDebugLog('Early return - engine or gyro not ready');
      return;
    }
    
    // Use both beta and gamma to control gravity in all directions (like the Matter.js examples)
    // This allows proper physics when phone is rotated to any orientation, including upside down
    // Scale values: gamma/beta typically range from -90 to +90, so 0.01 gives gravity range of -0.9 to +0.9
    const gravityX = gamma * 0.01; // Scale gamma for X-axis gravity  
    const gravityY = beta * 0.01;  // Scale beta for Y-axis gravity
    
    addDebugLog(`gX:${gravityX.toFixed(2)} gY:${gravityY.toFixed(2)}`);
    
    // Update engine gravity
    currentEngine.world.gravity.x = gravityX;
    currentEngine.world.gravity.y = gravityY;
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

  // Set mounted state to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!boxRef.current || !canvasRef.current) return;

    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let World = Matter.World;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;

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



    // Different interaction for desktop vs mobile
    if (isMobile) {
      // Mobile: Traditional drag interaction
      let mouse = Mouse.create(render.canvas);
      let mouseConstraint = MouseConstraint.create(matterEngine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.8,
          damping: 0.1,
          render: {
            visible: false
          }
        }
      });
      
      // Force release constraint on touch events
      const releaseConstraint = () => {
        if (mouseConstraint.constraint.bodyB) {
          // Restore the body's physics properties
          const body = mouseConstraint.constraint.bodyB;
          body.isStatic = false;
          body.isSleeping = false;
          Matter.Sleeping.set(body, false);
          mouseConstraint.constraint.bodyB = null;
        }
        if (mouseConstraint.constraint.bodyA) {
          mouseConstraint.constraint.bodyA = null;
        }
        mouseConstraint.constraint.pointA = { x: 0, y: 0 };
        mouseConstraint.constraint.pointB = { x: 0, y: 0 };
      };
      
      render.canvas.addEventListener('touchend', releaseConstraint);
      render.canvas.addEventListener('touchcancel', releaseConstraint);
      render.canvas.addEventListener('touchleave', releaseConstraint);
      
      // Also listen for mouse events as fallback
      render.canvas.addEventListener('mouseup', releaseConstraint);
      render.canvas.addEventListener('mouseleave', releaseConstraint);
      
      World.add(matterEngine.world, mouseConstraint);
      render.mouse = mouse;
    } else {
      // Desktop: Mouse cursor as physical body
      let mouse = Mouse.create(render.canvas);
      render.mouse = mouse;
      
      // Create dynamic mouse body that follows cursor and creates collisions
      let mouseBody = Matter.Bodies.circle(0, 0, 12, {
        density: 0.01,
        frictionAir: 0.1,
        restitution: 0.8,
        render: {
          visible: false
        }
      });
      
      World.add(matterEngine.world, mouseBody);
      
      let lastMousePosition = { x: 0, y: 0 };
      
      // Update mouse body with velocity for dynamic collisions
      const updateMouseBody = () => {
        if (mouse.position.x && mouse.position.y) {
          const currentPos = mouse.position;
          
          // Calculate velocity based on mouse movement
          const velocityX = (currentPos.x - lastMousePosition.x) * 0.5;
          const velocityY = (currentPos.y - lastMousePosition.y) * 0.5;
          
          // Set position and velocity for dynamic collisions
          Matter.Body.setPosition(mouseBody, currentPos);
          Matter.Body.setVelocity(mouseBody, { x: velocityX, y: velocityY });
          
          lastMousePosition = { x: currentPos.x, y: currentPos.y };
        }
        requestAnimationFrame(updateMouseBody);
      };
      updateMouseBody();
    }

    Engine.run(matterEngine);
    Render.run(render);


    setConstraints(boxRef.current.getBoundingClientRect());
    setScene(render);
    setEngine(matterEngine);
    engineRef.current = matterEngine;


    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Don't auto-enable on iOS - wait for user interaction

  useEffect(() => {
    if (scene && constraints && isVisible && !hasDropped) {
      let { width, height } = constraints;
      
      // Drop balls with 3 different sizes, spaced over 1 second
      // More balls on desktop vs mobile
      const ballCount = isMobile ? BALL_COUNT_MOBILE : BALL_COUNT_DESKTOP;
      for (let i = 0; i < ballCount; i++) {
        setTimeout(() => {
          const randomX = Math.floor(Math.random() * width);
          // Weighted random selection favoring smaller circles
          // 60% chance of size 12, 30% chance of size 18, 10% chance of size 24
          const rand = Math.random();
          let randomSize;
          if (rand < 0.6) {
            randomSize = PARTICLE_SIZES[0]; // 12 (smallest)
          } else if (rand < 0.9) {
            randomSize = PARTICLE_SIZES[1]; // 18 (medium)  
          } else {
            randomSize = PARTICLE_SIZES[2]; // 24 (largest)
          }
          const randomY = -randomSize; // Start from top
          
          Matter.World.add(
            scene.engine.world,
            Matter.Bodies.circle(randomX, randomY, randomSize, {
              restitution: PARTICLE_BOUNCYNESS,
              render: {
                fillStyle: "transparent",
                strokeStyle: [BALL_COLORS.BLUE, BALL_COLORS.PURPLE, BALL_COLORS.PINK, BALL_COLORS.ORANGE][Math.floor(Math.random() * 4)],
                lineWidth: 2
              }
            })
          );
          
          // Call onBallsDropped when the last ball is dropped
          if (i === ballCount - 1 && onBallsDropped) {
            onBallsDropped();
          }
        }, (i / ballCount) * 1000); // Spread over 1000ms (1 second)
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
        zIndex: 5,
        touchAction: "none" // Prevent scrolling on touch devices
      }}
    >
      <canvas ref={canvasRef} />
      
      {/* Large background gamma value - only show on mobile */}
      {isMobile && (
        <div
          suppressHydrationWarning
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "300px",
            color: "rgba(255, 255, 255, 0.02)",
            fontFamily: "monospace",
            fontWeight: "bold",
            zIndex: 100,
            pointerEvents: "none",
            userSelect: "none"
          }}
        >
          {isMounted ? Math.abs(orientation.gamma).toFixed(0) : "0"}
        </div>
      )}
      
      
      {/* Faint angle display in top left corner - only show when gyro is enabled */}
      {isMobile && gyroEnabled && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "24px",
            fontFamily: "monospace",
            fontWeight: "bold",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 100,
            width: "48px", // Fixed width to accommodate 2 digits + degree symbol
            display: "flex"
          }}
        >
          <span style={{ width: "13px", textAlign: "right" }}>
            {Math.abs(orientation.gamma).toFixed(0).length > 1 ? Math.abs(orientation.gamma).toFixed(0).charAt(0) : ''}
          </span>
          <span style={{ width: "13px", textAlign: "center" }}>
            {Math.abs(orientation.gamma).toFixed(0).length > 1 ? Math.abs(orientation.gamma).toFixed(0).charAt(1) : Math.abs(orientation.gamma).toFixed(0)}
          </span>
          <span style={{ width: "13px", textAlign: "left" }}>°</span>
        </div>
      )}

      {/* Only show gyro button on mobile devices */}
      {isMobile && isMounted && (
        <button
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            width: "56px",
            height: "56px",
            padding: "0",
            background: "rgba(0, 0, 0, 0.1)",
            color: gyroEnabled ? "#10b981" : "#6b7280",
            border: `2px solid ${gyroEnabled ? "#10b981" : "#6b7280"}`,
            borderRadius: "50%",
            cursor: "pointer",
            touchAction: "manipulation",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: gyroEnabled 
              ? "0 8px 25px -8px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1)" 
              : "0 4px 12px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: gyroEnabled ? "scale(1.05)" : "scale(1)"
          }}
          onClick={(e) => {
            console.log('Button clicked, current state:', gyroEnabled);
            onGyroToggle(!gyroEnabled);
          }}
          onTouchStart={(e) => {
            console.log('Button touched, current state:', gyroEnabled);
          }}
        >
          <GyroIcon isActive={gyroEnabled} size={52} />
        </button>
      )}
    </div>
  );
};

export default PhysicsCanvas;