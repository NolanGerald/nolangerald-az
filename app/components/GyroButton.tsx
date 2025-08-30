"use client";
import React, { useState, useEffect } from 'react';
import { useGyro } from './GyroProvider';
import { usePathname } from 'next/navigation';
import GyroIcon from './GyroIcon';

const GyroButton: React.FC = () => {
  const { gyroEnabled, toggleGyro, isMobile } = useGyro();
  const pathname = usePathname();
  const [isFirstSection, setIsFirstSection] = useState(true);
  
  // Track scroll position on about page to hide button when not on first section
  useEffect(() => {
    if (pathname === '/about') {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        // Consider first section if we're in the top 50% of the first viewport
        const isInFirstSection = scrollY < windowHeight * 0.5;
        setIsFirstSection(isInFirstSection);
      };
      
      // Initial check
      handleScroll();
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsFirstSection(true); // Always show on other pages
    }
  }, [pathname]);
  
  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }
  
  // Hide button on about page when not on first section
  if (pathname === '/about' && !isFirstSection) {
    return null;
  }

  return (
    <button
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        width: "39px",
        height: "39px",
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
        opacity: (pathname === '/about' && !isFirstSection) ? 0 : 1,
        visibility: (pathname === '/about' && !isFirstSection) ? 'hidden' : 'visible',
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
      onClick={() => toggleGyro(!gyroEnabled)}
      onTouchStart={() => {}}
    >
      <GyroIcon isActive={gyroEnabled} size={36} />
    </button>
  );
};

export default GyroButton;