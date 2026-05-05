import { createRootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('[CLICK TEST] Root montado v3');
    
    // Bypass agressivo de pointer-events
    const forcePointerEvents = () => {
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
      const root = document.getElementById('root');
      if (root) root.style.pointerEvents = 'auto';
    };

    forcePointerEvents();
    const interval = setInterval(forcePointerEvents, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{ 
        position: 'fixed',
        inset: 0,
        zIndex: 999999999,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
      }}
    >
      <h1 style={{ fontSize: '2rem' }}>BYPASS AGRESSIVO V3</h1>
      <p style={{ fontSize: '1.5rem' }}>
        Cliques: <strong style={{ color: 'red' }}>{count}</strong>
      </p>
      <button
        type="button"
        onClick={() => {
          console.log('[CLICK TEST] CLIQUE OK');
          setCount(c => c + 1);
        }}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          cursor: 'pointer',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          pointerEvents: 'auto'
        }}
      >
        TESTAR CLIQUE
      </button>
    </div>
  );
}
