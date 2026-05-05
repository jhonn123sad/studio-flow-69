import { createRootRoute, Outlet } from "@tanstack/react-router";
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const Route = createRootRoute({
  component: PainelPessoal,
});

function PainelPessoal() {
  const [count, setCount] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Aguardando teste...');
  const [formats, setFormats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[PAINEL] Componente montou');
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    try {
      const { data, error } = await supabase
        .from('content_formats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFormats(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar formatos:', err);
    }
  };

  const testSupabase = async () => {
    setSupabaseStatus('Testando...');
    try {
      const { data, error } = await supabase.from('content_formats').select('count');
      if (error) throw error;
      setSupabaseStatus('Conexão OK! Tabelas acessíveis.');
    } catch (err: any) {
      setSupabaseStatus(`Erro: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const createTestFormat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_formats')
        .insert([
          { title: `Formato Teste ${new Date().toLocaleTimeString()}`, description: 'Criado via Painel Pessoal' }
        ])
        .select();

      if (error) throw error;
      setSupabaseStatus('Formato criado com sucesso!');
      fetchFormats();
    } catch (err: any) {
      setSupabaseStatus(`Erro ao criar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: 40, 
      fontFamily: 'sans-serif', 
      maxWidth: 800, 
      margin: '0 auto',
      pointerEvents: 'auto' 
    }}>
      <h1 style={{ color: '#1e293b' }}>Painel Pessoal (Beta)</h1>
      <p style={{ color: '#64748b' }}>App funcionando direto sem login e sem router complexo.</p>

      <div style={{ 
        background: '#f1f5f9', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 32,
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: 20, marginTop: 0 }}>Teste de Clique e Estado</h2>
        <p>Contador local: <strong>{count}</strong></p>
        <button 
          onClick={() => {
            console.log('[PAINEL] Botão contador clicado');
            setCount(c => c + 1);
          }}
          style={{ 
            padding: '10px 20px', 
            fontSize: 16, 
            cursor: 'pointer',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            marginRight: 10
          }}
        >
          Incrementar Contador
        </button>

        <button 
          onClick={() => {
            console.log('[PAINEL] Botão limpar clicado');
            setCount(0);
          }}
          style={{ 
            padding: '10px 20px', 
            fontSize: 16, 
            cursor: 'pointer',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 6
          }}
        >
          Zerar
        </button>
      </div>

      <div style={{ 
        background: '#f8fafc', 
        padding: 24, 
        borderRadius: 12, 
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: 20, marginTop: 0 }}>Teste de Supabase (Banco de Dados)</h2>
        <p>Status: <span style={{ fontWeight: 'bold', color: supabaseStatus.includes('Erro') ? 'red' : 'green' }}>{supabaseStatus}</span></p>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={testSupabase}
            style={{ 
              padding: '10px 20px', 
              fontSize: 14, 
              cursor: 'pointer',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6
            }}
          >
            Testar Conexão
          </button>

          <button 
            onClick={createTestFormat}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              fontSize: 14, 
              cursor: 'pointer',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Criando...' : 'Criar Formato Teste'}
          </button>
        </div>

        <h3 style={{ marginTop: 24, fontSize: 18 }}>Formatos Salvos:</h3>
        {formats.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>Nenhum formato encontrado.</p>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {formats.map((f: any) => (
              <li key={f.id} style={{ marginBottom: 8 }}>
                <strong>{f.title}</strong> - {new Date(f.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Outlet oculto para manter o router feliz caso existam outras rotas internas */}
      <div style={{ display: 'none' }}><Outlet /></div>
    </div>
  );
}