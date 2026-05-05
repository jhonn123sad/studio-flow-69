import React, { useState } from 'react';
import { supabase } from './integrations/supabase/client';
import { formatSupabaseError } from './lib/supabase-errors';

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [clicks, setClicks] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState('Pronto para testar.');

  const tabs = ['Dashboard', 'Formatos', 'Referências', 'Projetos'];

  const handleTestClick = () => {
    setClicks(prev => prev + 1);
    console.log('[APP] clique funcionando');
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus('Testando Supabase...');
    console.log('[SUPABASE TEST] Iniciando teste...');

    try {
      const { data, error } = await supabase
        .from('content_formats')
        .select('id')
        .limit(1);

      console.log('[SUPABASE TEST] data:', data);
      console.log('[SUPABASE TEST] error:', error);

      if (error) {
        setSupabaseStatus(formatSupabaseError(error));
      } else {
        setSupabaseStatus('Supabase conectado com sucesso.');
      }
    } catch (err) {
      console.error('[SUPABASE TEST] exception:', err);
      setSupabaseStatus('Erro inesperado: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Painel Pessoal</h1>
        <p>Organização de produção de conteúdo</p>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content">
        <div className="card">
          <h2>{activeTab}</h2>
          <p>{activeTab} funcionando</p>
        </div>

        {activeTab === 'Dashboard' && (
          <div className="card">
            <h3>Conexão Supabase</h3>
            <button 
              type="button" 
              onClick={handleTestSupabase} 
              className="btn-primary"
              style={{ backgroundColor: '#10b981', marginTop: '10px' }}
            >
              Testar Supabase
            </button>
            <p className="status" style={{ marginTop: '10px', fontWeight: 'bold' }}>
              Status: {supabaseStatus}
            </p>
          </div>
        )}

        <div className="card test-section">
          <h3>Teste de Interatividade</h3>
          <button type="button" onClick={handleTestClick} className="btn-primary">
            Testar clique
          </button>
          <p className="status">Cliques: {clicks}</p>
        </div>
      </main>
    </div>
  );
};

export default App;
