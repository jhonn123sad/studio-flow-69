import React, { useState, useEffect } from 'react';
import { supabase } from './integrations/supabase/client';
import { handleSupabaseError } from './lib/supabase-errors';

type Tab = 'dashboard' | 'formats' | 'references' | 'projects';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [stats, setStats] = useState({ formats: 0, refs: 0, projects: 0 });

  useEffect(() => {
    console.log('[APP] Componente montado');
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { count: fCount } = await supabase.from('content_formats').select('*', { count: 'exact', head: true });
      const { count: rCount } = await supabase.from('reference_categories').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      
      setStats({
        formats: fCount || 0,
        refs: rCount || 0,
        projects: pCount || 0
      });
    } catch (e) {
      console.error('Erro ao buscar stats', e);
    }
  };

  const testConnection = async () => {
    setTestStatus('Testando...');
    try {
      const { error } = await supabase.from('content_formats').select('id').limit(1);
      if (error) {
        setTestStatus(`Erro: ${handleSupabaseError(error)}`);
      } else {
        setTestStatus('Supabase conectado com sucesso.');
      }
    } catch (e: any) {
      setTestStatus(`Erro inesperado: ${e.message}`);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Painel Pessoal</h1>
        <p>Organização de produção de conteúdo</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${activeTab === 'formats' ? 'active' : ''}`}
          onClick={() => setActiveTab('formats')}
        >
          Formatos
        </button>
        <button 
          className={`nav-button ${activeTab === 'references' ? 'active' : ''}`}
          onClick={() => setActiveTab('references')}
        >
          Referências
        </button>
        <button 
          className={`nav-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projetos
        </button>
      </nav>

      <main>
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid">
              <div className="card">
                <h3>Total de Formatos</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.formats}</p>
              </div>
              <div className="card">
                <h3>Total de Referências</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.refs}</p>
              </div>
              <div className="card">
                <h3>Total de Projetos</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.projects}</p>
              </div>
            </div>

            <div className="card">
              <h3>Status da Conexão</h3>
              <button className="btn-primary" onClick={testConnection}>Testar Supabase</button>
              {testStatus && (
                <p style={{ marginTop: '1rem', fontWeight: '500', color: testStatus.includes('Erro') ? 'red' : 'green' }}>
                  {testStatus}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'formats' && <FormatsPanel />}
        {activeTab === 'references' && <ReferencesPanel />}
        {activeTab === 'projects' && <ProjectsPanel />}
      </main>
    </div>
  );
}

function FormatsPanel() {
  const [formats, setFormats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => { fetchFormats(); }, []);

  const fetchFormats = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('content_formats').select('*').order('created_at', { ascending: false });
    if (error) setError(handleSupabaseError(error));
    else setFormats(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { title, description } = formData;
    
    if (editingId) {
      const { error } = await supabase.from('content_formats').update({ title, description }).eq('id', editingId);
      if (error) setError(handleSupabaseError(error));
      else { setEditingId(null); setFormData({ title: '', description: '' }); fetchFormats(); }
    } else {
      const { error } = await supabase.from('content_formats').insert([{ title, description }]);
      if (error) setError(handleSupabaseError(error));
      else { setFormData({ title: '', description: '' }); fetchFormats(); }
    }
  };

  const deleteFormat = async (id: string) => {
    const { error } = await supabase.from('content_formats').delete().eq('id', id);
    if (error) setError(handleSupabaseError(error));
    else fetchFormats();
  };

  const startEdit = (f: any) => {
    setEditingId(f.id);
    setFormData({ title: f.title, description: f.description || '' });
  };

  return (
    <div className="card">
      <h2>Formatos de Conteúdo</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input 
          placeholder="Título" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          required 
        />
        <textarea 
          placeholder="Descrição" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
        />
        <button type="submit" className="btn-primary">
          {editingId ? 'Salvar Edição' : 'Criar Formato'}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({title:'', description:''}); }}>Cancelar</button>}
      </form>

      {loading ? <p>Carregando...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formats.length === 0 ? <p>Nenhum formato criado ainda.</p> : formats.map(f => (
            <div key={f.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px' }}>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => startEdit(f)}>Editar</button>
                <button className="btn-danger" onClick={() => deleteFormat(f.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReferencesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('reference_categories').select('*').order('created_at', { ascending: false });
    if (error) setError(handleSupabaseError(error));
    else setItems(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('reference_categories').update(formData).eq('id', editingId);
      if (error) setError(handleSupabaseError(error));
      else { setEditingId(null); setFormData({ name: '', description: '' }); fetchItems(); }
    } else {
      const { error } = await supabase.from('reference_categories').insert([formData]);
      if (error) setError(handleSupabaseError(error));
      else { setFormData({ name: '', description: '' }); fetchItems(); }
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('reference_categories').delete().eq('id', id);
    if (error) setError(handleSupabaseError(error));
    else fetchItems();
  };

  return (
    <div className="card">
      <h2>Categorias de Referência</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <textarea placeholder="Descrição" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        <button type="submit" className="btn-primary">{editingId ? 'Salvar Edição' : 'Criar Categoria'}</button>
      </form>

      {loading ? <p>Carregando...</p> : items.length === 0 ? <p>Nenhuma referência criada ainda.</p> : items.map(item => (
        <div key={item.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setEditingId(item.id); setFormData({name: item.name, description: item.description || ''}); }}>Editar</button>
            <button className="btn-danger" onClick={() => deleteItem(item.id)}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'active', priority: 'medium' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) setError(handleSupabaseError(error));
    else setItems(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('projects').insert([formData]);
    if (error) setError(handleSupabaseError(error));
    else { setFormData({ title: '', description: '', status: 'active', priority: 'medium' }); fetchItems(); }
  };

  return (
    <div className="card">
      <h2>Projetos</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <textarea placeholder="Descrição" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
          <option value="active">Ativo</option>
          <option value="completed">Concluído</option>
          <option value="backlog">Backlog</option>
        </select>
        <button type="submit" className="btn-primary">Criar Projeto</button>
      </form>

      {loading ? <p>Carregando...</p> : items.length === 0 ? <p>Nenhum projeto criado ainda.</p> : items.map(item => (
        <div key={item.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="status-badge">{item.status}</div>
          <button className="btn-danger" style={{ display: 'block', marginTop: '0.5rem' }} onClick={async () => {
            await supabase.from('projects').delete().eq('id', item.id);
            fetchItems();
          }}>Excluir</button>
        </div>
      ))}
    </div>
  );
}
