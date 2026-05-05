import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: () => <ClickTest />,
});

function ClickTest() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('[CLICK TEST] Renderizado via arrow');
  }, []);

  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'orange',
        pointerEvents: 'auto'
      }}
    >
      <h1 id="count-display">CLIQUES: {count}</h1>
      <button
        id="test-button"
        type="button"
        onClick={() => {
          console.log('[CLICK TEST] BOTAO OK');
          setCount(c => c + 1);
        }}
        style={{ padding: '20px', fontSize: '2rem', cursor: 'pointer' }}
      >
        TESTAR
      </button>
    </div>
  );
}
