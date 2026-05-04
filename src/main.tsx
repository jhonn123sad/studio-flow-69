import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

function EmergencyApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a',
      padding: 24
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>
          App recuperado
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: '#475569' }}>
          O React está renderizando. O próximo passo é reativar router, auth e Supabase um por um.
        </p>
      </div>
    </div>
  )
}

// Em TanStack Start, o entry point é geralmente controlado pelo framework.
// Mas para este teste de "recuperação brutal", vamos forçar a renderização se o root existir.
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <EmergencyApp />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
