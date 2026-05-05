import { createRootRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createRootRoute({
  component: () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      console.log('[CLICK TEST] Root montado');
      
      // Limpeza agressiva de qualquer overlay persistente via DOM real
      const clearOverlays = () => {
        const fixedElements = document.querySelectorAll('*');
        fixedElements.forEach((el: any) => {
          const style = window.getComputedStyle(el);
          if (
            (style.position === 'fixed' || style.position === 'absolute') && 
            (style.zIndex && parseInt(style.zIndex) > 100)
          ) {
            // Se não for o nosso container, esconde
            if (!el.id?.includes('click-test')) {
               el.style.display = 'none';
               el.style.pointerEvents = 'none';
            }
          }
        });
      };
      
      clearOverlays();
      const interval = setInterval(clearOverlays, 1000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div 
        id="click-test-bypass-root"
        style={{ 
          margin: 0, 
          padding: 0, 
          minHeight: '100vh', 
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999999,
          pointerEvents: 'auto'
        }}
      >
        <h1 style={{ fontSize: '40px', color: '#111', marginBottom: '20px' }}>
          BYPASS TOTAL: Teste de Clique
        </h1>
        
        <p style={{ fontSize: '24px', color: '#444', marginBottom: '40px' }}>
          Contador: <span style={{ fontWeight: 'bold' }}>{count}</span>
        </p>

        <button
          id="click-test-button"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            console.log('[CLICK TEST] Botão clicado via Root');
            setCount(c => c + 1);
          }}
          style={{
            padding: '24px 48px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: 'black',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10000000
          }}
        >
          CLIQUE AQUI
        </button>

        <div style={{ marginTop: '50px', fontSize: '16px', color: '#999' }}>
          Se não aumentar, o problema é externo ao código do app.
        </div>
      </div>
    );
  },
});
