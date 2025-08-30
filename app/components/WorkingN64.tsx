'use client'
import React, { useRef, useEffect, useState } from "react";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

type GLTFResult = GLTF & {
  nodes: {
    N64: THREE.Mesh;
  };
};

type WorkingN64Props = {
  onAnglesChange: (angles: { x: number; y: number; z: number }) => void;
  onLoad?: () => void; 
  gyroEnabled: boolean;
  orientation: { alpha: number; beta: number; gamma: number };
};

function WorkingN64({ onAnglesChange, onLoad, gyroEnabled, orientation }: WorkingN64Props) {
  const { nodes } = useGLTF("/n64/N64-centered.glb") as unknown as GLTFResult;
  const ref = useRef<THREE.Group>(null!);
  const { camera, mouse, viewport, gl } = useThree();
  const vector = new THREE.Vector3();
  const [isMouseOutside, setIsMouseOutside] = useState(true);
  const [baseOrientation, setBaseOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
  const [currentAnimationState, setCurrentAnimationState] = useState<{ x: number; y: number; z: number } | null>(null);
  const [isTransitioningToBaseline, setIsTransitioningToBaseline] = useState(false);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const canvasBounds = gl.domElement.getBoundingClientRect();
      if (
        event.clientX < canvasBounds.left ||
        event.clientX > canvasBounds.right ||
        event.clientY < canvasBounds.top ||
        event.clientY > canvasBounds.bottom
      ) {
        setIsMouseOutside(true);
      } else {
        setIsMouseOutside(false);
      }
    };

    const handleMouseLeave = () => {
      setIsMouseOutside(true);
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gl.domElement]);

  useFrame(() => {
    if (ref.current) {
      if (gyroEnabled) {
        // Step 1: Transition to baseline orientation first
        if (!baseOrientation || !currentAnimationState) {
          if (!isTransitioningToBaseline) {
            setIsTransitioningToBaseline(true);
          }
          
          // Define neutral baseline orientation (facing forward)
          const targetBaseline = {
            x: Math.PI, // 180 degrees
            y: Math.PI, // 180 degrees  
            z: Math.PI  // 180 degrees
          };
          
          // Smoothly interpolate to baseline
          const baselineLerp = 0.08; // Slower transition to baseline
          ref.current.rotation.x += (targetBaseline.x - ref.current.rotation.x) * baselineLerp;
          ref.current.rotation.y += (targetBaseline.y - ref.current.rotation.y) * baselineLerp;
          ref.current.rotation.z += (targetBaseline.z - ref.current.rotation.z) * baselineLerp;
          
          // Check if we're close enough to baseline to start gyro
          const threshold = 0.1; // ~5.7 degrees
          const isAtBaseline = 
            Math.abs(ref.current.rotation.x - targetBaseline.x) < threshold &&
            Math.abs(ref.current.rotation.y - targetBaseline.y) < threshold &&
            Math.abs(ref.current.rotation.z - targetBaseline.z) < threshold;
          
          if (isAtBaseline && (orientation.alpha !== 0 || orientation.beta !== 0 || orientation.gamma !== 0)) {
            // Now we can set the gyro baseline
            setCurrentAnimationState({
              x: targetBaseline.x,
              y: targetBaseline.y,
              z: targetBaseline.z
            });
            
            setBaseOrientation({
              alpha: orientation.alpha,
              beta: orientation.beta,
              gamma: orientation.gamma
            });
            
            setIsTransitioningToBaseline(false);
          }
          
          return;
        }

        // Detect gimbal lock situations and handle discontinuities
        const isNearGimbalLock = Math.abs(orientation.beta) > 85; // Near 90 degrees
        
        // Calculate relative rotation from base orientation with improved wrap-around handling
        let relativeAlpha = orientation.alpha - baseOrientation.alpha;
        let relativeBeta = orientation.beta - baseOrientation.beta;
        let relativeGamma = orientation.gamma - baseOrientation.gamma;

        // Enhanced wrap-around handling with gimbal lock protection
        const normalizeAngleDelta = (delta: number, isNearLock: boolean = false) => {
          // For gimbal lock situations, use smaller threshold to prevent jumps
          const threshold = isNearLock ? 90 : 180;
          while (delta > threshold) delta -= 360;
          while (delta < -threshold) delta += 360;
          
          // Additional damping for large sudden changes
          if (Math.abs(delta) > 45 && isNearLock) {
            delta *= 0.3; // Heavily dampen large changes near gimbal lock
          }
          return delta;
        };
        
        relativeAlpha = normalizeAngleDelta(relativeAlpha, isNearGimbalLock);
        relativeBeta = normalizeAngleDelta(relativeBeta, isNearGimbalLock);
        relativeGamma = normalizeAngleDelta(relativeGamma, isNearGimbalLock);

        // Apply additional smoothing for gimbal lock regions
        const smoothingFactor = isNearGimbalLock ? 0.1 : 0.5;
        
        // Convert relative changes to radians and scale them with adaptive sensitivity
        const deltaX = -(relativeBeta * Math.PI / 180) * smoothingFactor;   // Pitch: mapped from beta (inverted)
        const deltaY = (relativeGamma * Math.PI / 180) * smoothingFactor;   // Yaw: mapped from gamma
        const deltaZ = (relativeAlpha * Math.PI / 180) * (smoothingFactor * 0.6);   // Roll: mapped from alpha (reduced)
        
        // Apply deltas to the captured animation state for smooth transition
        const targetX = currentAnimationState.x + deltaX;
        const targetY = currentAnimationState.y + deltaY;
        const targetZ = currentAnimationState.z + deltaZ;
        
        // Adaptive smooth interpolation based on orientation stability
        const lerp = (current: number, target: number, factor: number) => {
          const delta = target - current;
          // Extra damping for large jumps
          if (Math.abs(delta) > Math.PI / 4) { // > 45 degrees
            factor *= 0.3;
          }
          return current + delta * factor;
        };
        
        // Use adaptive lerp factors based on gimbal lock proximity
        const lerpFactor = isNearGimbalLock ? 0.08 : 0.15;
        
        ref.current.rotation.x = lerp(ref.current.rotation.x, targetX, lerpFactor);
        ref.current.rotation.y = lerp(ref.current.rotation.y, targetY, lerpFactor);
        ref.current.rotation.z = lerp(ref.current.rotation.z, targetZ, lerpFactor);
      } else {
        // Reset base orientation and animation state when gyro is disabled
        setBaseOrientation(null);
        setCurrentAnimationState(null);
        setIsTransitioningToBaseline(false);
        
          if (isMouseOutside) {
          // More pronounced and faster rotation when gyro is disabled and mouse is outside
          const time = Date.now() * 0.001; // Faster animation (was 0.0005)
          // Start animation from 180 degrees offset
          const base180 = Math.PI; // 180 degrees in radians
          
          ref.current.rotation.y = base180 + Math.sin(time) * 0.5; // More pronounced left/right sway (was 0.3)
          ref.current.rotation.x = base180 + Math.sin(time * 0.7) * 0.25; // More pronounced up/down looking (was 0.15)
          ref.current.rotation.z = base180 + Math.sin(time * 0.5) * 0.15; // More pronounced roll (was 0.1)
          } else {
          // Rotate N64 to face the mouse (desktop fallback) - shifted right
          vector
            .set((mouse.x - 0.3) * viewport.width * 2, mouse.y * viewport.height * 2, 0)
            .unproject(camera);
          ref.current.lookAt(vector);
        }
      }

      // Normalize the angles to [-360, 360)
      const normalizeAngle = (angle: number) => {
        angle = THREE.MathUtils.radToDeg(angle); // Convert radians to degrees
        while (angle < -360) angle += 360;
        while (angle >= 360) angle -= 360;
        return angle;
      };

      onAnglesChange({
        x: normalizeAngle(ref.current.rotation.x),
        y: normalizeAngle(ref.current.rotation.y),
        z: normalizeAngle(ref.current.rotation.z),
      });
    }
  });

  return (
    <group ref={ref} dispose={null}>
      {/* Orientation cube - tied to the N64's rotation */}
      {/* <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent={true} 
          opacity={0.8}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.401]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 0, -0.401]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      <mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, -0.401, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0.401, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.401, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh> */}
      
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.N64.geometry}
        material={
          new THREE.MeshPhongMaterial({
            color: "#fff",
            wireframe: true,
          })
        }
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2 + 0.3, 0, 0]}
        scale={0.05}
      />
      <Environment preset="city" />
    </group>
  );
}

useGLTF.preload("/n64/N64-centered.glb");

export default WorkingN64;