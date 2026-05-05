import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: ClickTest,
});

function ClickTest() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('[CLICK TEST] componente montou index');
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
        backgroundColor: 'yellow', // Cor gritante para confirmar render
        pointerEvents: 'auto'
      }}
    >
      <h1>CONTADOR: {count}</h1>
      <button
        onClick={() => {
          console.log('[CLICK TEST] CLIQUE NO BOTAO');
          setCount(c => c + 1);
        }}
        style={{ padding: '20px', fontSize: '20px', cursor: 'pointer' }}
      >
        CLIQUE AQUI
      </button>
    </div>
  );
}
