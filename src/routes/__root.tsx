import { createRootRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from 'react'

export const Route = createRootRoute({
  component: ClickDebugApp,
});

function ClickDebugApp() {
  const [count, setCount] = useState(0)
  const [lastEvent, setLastEvent] = useState('Nenhum evento ainda')

  useEffect(() => {
    console.log('[CLICK DEBUG] App montou via __root.tsx')
    
    // Forçar scroll para o topo e garantir que não há nada cobrindo
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    const handleDocumentClick = (event: MouseEvent) => {
      console.log('[CLICK DEBUG] document click', event.target)
      setLastEvent('Clique detectado no document')
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  return (
    <div
      id="click-debug-root"
      onClick={() => {
        console.log('[CLICK DEBUG] clique na div raiz')
        setLastEvent('Clique detectado na div raiz')
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: 'auto',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 2147483647,
        }}
        onClick={(event) => {
          event.stopPropagation()
          console.log('[CLICK DEBUG] clique no card')
          setLastEvent('Clique detectado no card')
        }}
      >
        <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>
          Teste real de clique
        </h1>

        <p style={{ fontSize: 16, color: '#475569', marginBottom: 20 }}>
          Se este botão não clicar, o problema está fora das páginas do app.
        </p>

        <p style={{ marginBottom: 12 }}>
          Cliques no botão: <strong>{count}</strong>
        </p>

        <p style={{ marginBottom: 20 }}>
          Último evento: <strong>{lastEvent}</strong>
        </p>

        <button
          id="debug-button"
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            console.log('[CLICK DEBUG] BOTÃO CLICADO')
            setCount((value) => value + 1)
            setLastEvent('Botão clicado com sucesso')
          }}
          style={{
            display: 'inline-block',
            appearance: 'auto',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            padding: '14px 22px',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 2147483647,
            userSelect: 'none',
          }}
        >
          Clique aqui
        </button>
      </div>
    </div>
  )
}
