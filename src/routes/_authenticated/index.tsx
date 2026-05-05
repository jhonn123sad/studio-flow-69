import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/")({
  component: PainelPessoal,
});

function PainelPessoal() {
  const [status, setStatus] = useState("Aguardando ação...");
  const [formats, setFormats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testSupabase = async () => {
    setStatus("Testando Supabase...");
    try {
      const { data, error } = await supabase
        .from('formats')
        .select('id')
        .limit(1);

      if (error) {
        setStatus("Erro Supabase: " + error.message);
      } else {
        setStatus("Supabase conectado com sucesso.");
      }
    } catch (err: any) {
      setStatus("Erro inesperado: " + (err.message || String(err)));
    }
  };

  const loadFormats = async () => {
    setLoading(true);
    setStatus("Carregando formatos...");
    try {
      const { data, error } = await supabase
        .from('formats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setStatus("Erro ao carregar: " + error.message);
      } else {
        setFormats(data || []);
        setStatus("Formatos carregados.");
      }
    } catch (err: any) {
      setStatus("Erro inesperado: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const createTestFormat = async () => {
    setStatus("Criando formato teste...");
    try {
      const { data, error } = await supabase
        .from('formats')
        .insert({
          title: 'Formato teste ' + new Date().toLocaleTimeString(),
          description: 'Criado pelo painel pessoal'
        })
        .select();

      if (error) {
        setStatus("Erro ao criar: " + error.message);
      } else {
        setStatus("Formato criado com sucesso.");
        loadFormats();
      }
    } catch (err: any) {
      setStatus("Erro inesperado: " + (err.message || String(err)));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1e293b' }}>Painel Pessoal</h1>
        <p style={{ color: '#64748b', marginBottom: '25px' }}>Organização de produção de conteúdo</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={testSupabase}
            style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            Testar Supabase
          </button>
          <button 
            type="button" 
            onClick={loadFormats}
            style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            Carregar formatos
          </button>
          <button 
            type="button" 
            onClick={createTestFormat}
            style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            Criar formato teste
          </button>
        </div>

        <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '25px', fontSize: '14px', border: '1px solid #e2e8f0' }}>
          <strong>Status:</strong> <span style={{ color: status.includes('Erro') ? '#ef4444' : '#0f172a' }}>{status}</span>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#334155' }}>Lista de Formatos</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : formats.length === 0 ? (
            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum formato encontrado. Clique em carregar.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {formats.map((f) => (
                <li key={f.id} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: '#1e293b' }}>{f.title}</strong>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{f.description}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
