'use client';
import { useState } from 'react';
import PhysicsCanvas from './components/PhysicsCanvas';
import HeroType from './components/HeroType';

export default function Home() {
  const [ballsDropped, setBallsDropped] = useState(false);

  const handleBallsDropped = () => {
    // Add 0.5 second delay before starting typing
    setTimeout(() => {
      setBallsDropped(true);
    }, 500);
  };

  return (
    <>
      <PhysicsCanvas onBallsDropped={handleBallsDropped} />
      <main className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <HeroType startTyping={ballsDropped} />
        </div>
      </main>
    </>
  );
}
