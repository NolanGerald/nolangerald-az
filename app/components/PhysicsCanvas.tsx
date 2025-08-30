'use client';

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
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
  
  // Mobile detection and gyro context
  const { isMobile } = useMobileDetection();
  const { gyroEnabled, orientation } = useGyro();

  const handleResize = () => {
    if (boxRef.current) {
      setConstraints(boxRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update physics engine gravity based on gyro state
  useEffect(() => {
    if (!engine) return;
    
    if (gyroEnabled) {
      // Map device orientation to physics gravity with proper inversion handling
      const gravityX = orientation.gamma / 90;  // Left/right tilt
      const gravityY = orientation.beta / 90;   // Forward/backward tilt
      const gravityScale = 1.5;
      
      // Calculate gravity with proper range handling (-1 to 1 for full inversion)
      const calculatedGravityX = gravityX * gravityScale;
      const calculatedGravityY = gravityY * gravityScale;
      
      engine.world.gravity.x = calculatedGravityX;
      // Allow full range including negative gravity for upside down
      engine.world.gravity.y = calculatedGravityY === 0 ? 1.0 : Math.max(-2.0, Math.min(2.0, calculatedGravityY + 1.0));
    } else {
      engine.world.gravity.x = 0;
      engine.world.gravity.y = 1; // Increased gravity strength for faster ball drops
    }
  }, [gyroEnabled, orientation, engine]);

  useEffect(() => {
    if (!boxRef.current || !canvasRef.current) {
      console.error("Missing refs");
      return;
    }

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
        wireframes: false,
        width: boxRef.current.clientWidth,
        height: boxRef.current.clientHeight,
      },
    });

    // Create boundaries
    const floor = Matter.Bodies.rectangle(
      boxRef.current.clientWidth / 2,
      boxRef.current.clientHeight + STATIC_DENSITY / 2,
      boxRef.current.clientWidth,
      STATIC_DENSITY,
      {
        isStatic: true,
        label: "floor",
        render: {
          fillStyle: "transparent"
        }
      }
    );

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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      Render.stop(render);
      World.clear(matterEngine.world, false);
      Engine.clear(matterEngine);
    };
  }, [isMobile]);

  // Drop balls when component becomes visible
  useEffect(() => {
    if (scene && constraints && isVisible && !hasDropped) {
      let { width, height } = constraints;
      
      // Drop balls with 3 different sizes, spaced over 1 second
      const ballCount = isMobile ? BALL_COUNT_MOBILE : BALL_COUNT_DESKTOP;
      for (let i = 0; i < ballCount; i++) {
        setTimeout(() => {
          const randomX = Math.floor(Math.random() * width);
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
  }, [isVisible, scene, constraints, hasDropped, isMobile, onBallsDropped]);

  // Handle intersection observer to trigger balls drop
  useEffect(() => {
    if (!boxRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(boxRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
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
    </div>
  );
};

export default PhysicsCanvas;