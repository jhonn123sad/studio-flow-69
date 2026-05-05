import { createRootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('[CLICK TEST] Root montado v2');
    
    const clearBodyAttributes = () => {
      document.body.removeAttribute('data-radix-scroll-block');
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
    };

    clearBodyAttributes();
    const interval = setInterval(clearBodyAttributes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      id="click-test-bypass-root"
      style={{ 
        position: 'fixed',
        inset: 0,
        zIndex: 999999999,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <h1 style={{ fontSize: '3rem', margin: '1rem' }}>BYPASS AGRESSIVO</h1>
      <p style={{ fontSize: '1.5rem', margin: '1rem' }}>
        Cliques detectados: <strong style={{ color: 'red' }}>{count}</strong>
      </p>
      <button
        id="click-test-button"
        type="button"
        onClick={() => {
          console.log('[CLICK TEST] CLIQUE REAL');
          setCount(c => c + 1);
        }}
        style={{
          padding: '2rem 4rem',
          fontSize: '2rem',
          cursor: 'pointer',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '1rem',
          pointerEvents: 'auto',
          zIndex: 1000000000
        }}
      >
        TESTAR CLIQUE
      </button>
      
      <div style={{ marginTop: '2rem', textAlign: 'center', maxWidth: '80%' }}>
        <p>Se este botão não mudar o número vermelho, o problema está fora do React (Iframe/Preview Layer).</p>
      </div>
    </div>
  );
}
