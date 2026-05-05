import { createRootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createRootRoute({
  component: () => <RootTest />,
});

function RootTest() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('[CLICK TEST] ROOT FINAL MONTADO');
  }, []);

  return (
    <div 
      style={{ 
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
      }}
    >
      <h1 style={{ fontSize: '4rem' }}>BYPASS FINAL</h1>
      <p style={{ fontSize: '2rem' }}>Cliques: {count}</p>
      <button
        onClick={() => {
          console.log('[CLICK TEST] CLIQUE FINAL OK');
          setCount(c => c + 1);
        }}
        style={{
          padding: '2rem 4rem',
          fontSize: '2rem',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '1rem',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        CLIQUE AQUI
      </button>
    </div>
  );
}
