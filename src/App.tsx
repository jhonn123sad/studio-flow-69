import React, { useState, useEffect } from 'react';
import { supabase } from './integrations/supabase/client';
import { formatSupabaseError } from './lib/supabase-errors';

interface ContentFormat {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [clicks, setClicks] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState('Pronto para testar.');

  // Formatos State
  const [formats, setFormats] = useState<ContentFormat[]>([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [formatStatus, setFormatStatus] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingFormatId, setEditingFormatId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs = ['Dashboard', 'Formatos', 'Referências', 'Projetos'];

  const handleTestClick = () => {
    setClicks(prev => prev + 1);
    console.log('[APP] clique funcionando');
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus('Testando Supabase...');
    try {
      const { data, error } = await supabase
        .from('content_formats')
        .select('id')
        .limit(1);

      if (error) {
        setSupabaseStatus(formatSupabaseError(error));
      } else {
        setSupabaseStatus('Supabase conectado com sucesso.');
      }
    } catch (err) {
      setSupabaseStatus('Erro inesperado: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // CRUD Formatos
  const loadFormats = async () => {
    setLoadingFormats(true);
    setFormatStatus('Carregando formatos...');
    try {
      const { data, error } = await supabase
        .from('content_formats')
        .select('id, title, description, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setFormatStatus(formatSupabaseError(error));
      } else {
        setFormats(data || []);
        setFormatStatus('');
      }
    } catch (err) {
      setFormatStatus('Erro ao carregar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingFormats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Formatos') {
      loadFormats();
    }
  }, [activeTab]);

  const handleSaveFormat = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setFormatStatus('Informe um título.');
      return;
    }

    setIsSubmitting(true);
    setFormatStatus('Salvando...');

    try {
      if (editingFormatId) {
        const { error } = await supabase
          .from('content_formats')
          .update({ title, description })
          .eq('id', editingFormatId);

        if (error) {
          setFormatStatus(formatSupabaseError(error));
        } else {
          setFormatStatus('Formato atualizado com sucesso.');
          resetForm();
          loadFormats();
        }
      } else {
        const { error } = await supabase
          .from('content_formats')
          .insert({ title, description, status: 'active' });

        if (error) {
          setFormatStatus(formatSupabaseError(error));
        } else {
          setFormatStatus('Formato salvo com sucesso.');
          resetForm();
          loadFormats();
        }
      }
    } catch (err) {
      setFormatStatus('Erro ao salvar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (format: ContentFormat) => {
    setEditingFormatId(format.id);
    setTitle(format.title);
    setDescription(format.description || '');
    setFormatStatus('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este formato?')) return;

    setFormatStatus('Excluindo...');
    try {
      const { error } = await supabase
        .from('content_formats')
        .delete()
        .eq('id', id);

      if (error) {
        setFormatStatus(formatSupabaseError(error));
      } else {
        setFormatStatus('Formato excluído com sucesso.');
        loadFormats();
      }
    } catch (err) {
      setFormatStatus('Erro ao excluir: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const resetForm = () => {
    setEditingFormatId(null);
    setTitle('');
    setDescription('');
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
        {activeTab === 'Dashboard' && (
          <>
            <div className="card">
              <h2>Dashboard</h2>
              <p>Dashboard funcionando</p>
            </div>
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
          </>
        )}

        {activeTab === 'Formatos' && (
          <>
            <div className="card">
              <h2>Formatos</h2>
              <p>Organize formatos de conteúdo para usar nos seus projetos.</p>
              
              <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h3>{editingFormatId ? 'Editar Formato' : 'Novo Formato'}</h3>
                <form onSubmit={handleSaveFormat}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Descrição:</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={(e) => handleSaveFormat(e as any)}
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {editingFormatId ? 'Atualizar formato' : 'Salvar formato'}
                    </button>
                    {editingFormatId && (
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="btn-primary"
                        style={{ backgroundColor: '#6b7280' }}
                      >
                        Cancelar edição
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {formatStatus && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontWeight: 'bold' }}>
                  {formatStatus}
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Lista de Formatos</h3>
                  <button type="button" onClick={loadFormats} disabled={loadingFormats} style={{ padding: '5px 10px' }}>
                    Carregar formatos
                  </button>
                </div>

                {loadingFormats ? (
                  <p>Carregando formatos...</p>
                ) : formats.length === 0 ? (
                  <p>Nenhum formato criado ainda.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                    {formats.map(format => (
                      <div key={format.id} className="card" style={{ margin: 0, padding: '15px' }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{format.title}</h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>{format.description}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleEdit(format)}
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                          >
                            Editar
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(format.id)}
                            style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {(activeTab === 'Referências' || activeTab === 'Projetos') && (
          <div className="card">
            <h2>{activeTab}</h2>
            <p>{activeTab} funcionando</p>
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
