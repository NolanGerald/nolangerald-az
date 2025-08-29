'use client';

import React from 'react';

interface DebugPanelProps {
  orientation: { alpha: number; beta: number; gamma: number };
  permissionGranted: boolean;
  isMounted: boolean;
  debugLog: string[];
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  orientation, 
  permissionGranted, 
  isMounted, 
  debugLog,
  position = { top: "10px", left: "10px" }
}) => {
  return (
    <div
      style={{
        position: "absolute",
        ...position,
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
        HTTPS: {isMounted && typeof window !== 'undefined' && window.location.protocol === 'https:' ? "✓" : "✗"}<br/>
        Mobile: {isMounted && typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "✓" : "✗"}
      </div>
      <div style={{ marginTop: "8px", fontSize: "9px", opacity: 0.7, background: "rgba(0,0,0,0.1)", padding: "4px", borderRadius: "2px" }}>
        Debug Log:<br/>
        {debugLog.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default DebugPanel;