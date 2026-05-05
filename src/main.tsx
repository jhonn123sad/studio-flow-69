import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
        textAlign: 'center',
        maxWidth: '480px',
        width: 'calc(100% - 48px)'
      }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '42px' }}>apaguei</h1>
        <p style={{ margin: '0 0 24px', fontSize: '18px', color: '#475569' }}>HTML puro (via React para bypass) funcionando.</p>
        <button 
          onClick={() => {
            const next = count + 1;
            console.log('[HTML PURO] botão clicado', next);
            setCount(next);
          }}
          style={{
            appearance: 'auto',
            border: '0',
            borderRadius: '10px',
            background: '#2563eb',
            color: 'white',
            padding: '14px 22px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Clique aqui
        </button>
        <div style={{ marginTop: '20px', fontSize: '16px', color: '#16a34a', fontWeight: '700' }}>
          Cliques: {count}
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
