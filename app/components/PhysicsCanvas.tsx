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

  const handleResize = () => {
    if (boxRef.current) {
      setConstraints(boxRef.current.getBoundingClientRect());
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

    let engine = Engine.create({});

    let render = Render.create({
      element: boxRef.current,
      engine: engine,
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

    World.add(engine.world, [floor, leftWall, rightWall]);

    Engine.run(engine);
    Render.run(render);

    setConstraints(boxRef.current.getBoundingClientRect());
    setScene(render);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    </div>
  );
};

export default PhysicsCanvas;