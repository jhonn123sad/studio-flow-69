import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: ClickTest,
});

function ClickTest() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('[CLICK TEST] componente montou');
  }, []);

  return (
    <div 
      id="click-test-container"
      style={{ 
        minHeight: '100vh', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 999999,
        pointerEvents: 'auto',
        backgroundColor: '#ffffff'
      }}
    >
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#1e293b' }}>
        Teste de Clique
      </h1>
      
      <p style={{ fontSize: '20px', marginBottom: '30px', color: '#64748b' }}>
        Cliques: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{count}</span>
      </p>

      <button
        type="button"
        id="test-button"
        onClick={() => {
          console.log('[CLICK TEST] botão clicado');
          setCount((v) => v + 1);
        }}
        style={{
          padding: '20px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 999999,
          pointerEvents: 'auto',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}
      >
        Clique aqui
      </button>

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#94a3b8' }}>
        Se o contador não aumentar, existe algo bloqueando o clique.
      </div>
    </div>
  );
}
