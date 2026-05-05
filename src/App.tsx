import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './integrations/supabase/client';
import { formatSupabaseError } from './lib/supabase-errors';
import EntityDetail from './components/EntityDetail';

interface ReferenceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
}

interface ContentFormat {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
}

interface AppImage {
  id: string;
  parent_type: string;
  parent_id: string;
  image_url: string;
  created_at: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [supabaseStatus, setSupabaseStatus] = useState('Pronto para testar.');
  
  // Stats
  const [stats, setStats] = useState({
    formats: 0,
    references: 0,
    projects: 0,
    links: 0,
    images: 0,
    notes: 0,
    tasks: 0
  });

  // Main lists
  const [formats, setFormats] = useState<ContentFormat[]>([]);
  const [references, setReferences] = useState<ReferenceCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [refName, setRefName] = useState('');
  const [refDescription, setRefDescription] = useState('');
  const [refColor, setRefColor] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectProjStatus, setProjectProjStatus] = useState('planning');
  const [projectPriority, setProjectPriority] = useState('medium');
  
  // UI states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'format' | 'reference' | 'project';
    id: string;
    title: string;
    description: string;
  } | null>(null);

  // Images state for cards
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});

  const tabs = ['Dashboard', 'Formatos', 'Referências', 'Projetos'];

  const loadStats = async () => {
    try {
      const [f, r, p, l, i, n, t] = await Promise.all([
        supabase.from('content_formats').select('*', { count: 'exact', head: true }),
        supabase.from('reference_categories').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('app_links').select('*', { count: 'exact', head: true }),
        supabase.from('app_images').select('*', { count: 'exact', head: true }),
        supabase.from('app_notes').select('*', { count: 'exact', head: true }),
        supabase.from('project_tasks').select('*', { count: 'exact', head: true }).eq('completed', false)
      ]);

      setStats({
        formats: f.count || 0,
        references: r.count || 0,
        projects: p.count || 0,
        links: l.count || 0,
        images: i.count || 0,
        notes: n.count || 0,
        tasks: t.count || 0
      });
    } catch (e) { console.error('Error loading stats', e); }
  };

  const loadCoverImages = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const { data } = await supabase
        .from('app_images')
        .select('parent_id, image_url')
        .in('parent_id', ids);
      
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(img => {
          if (!map[img.parent_id]) map[img.parent_id] = img.image_url;
        });
        setCoverImages(prev => ({ ...prev, ...map }));
      }
    } catch (e) { console.error('Error loading covers', e); }
  };

  const loadFormats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('content_formats').select('*').order('created_at', { ascending: false });
      if (error) setStatusMsg(formatSupabaseError(error));
      else {
        setFormats(data || []);
        loadCoverImages((data || []).map(d => d.id));
      }
    } finally { setLoading(false); }
  };

  const loadReferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('reference_categories').select('*').order('created_at', { ascending: false });
      if (error) setStatusMsg(formatSupabaseError(error));
      else {
        setReferences(data || []);
        loadCoverImages((data || []).map(d => d.id));
      }
    } finally { setLoading(false); }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) setStatusMsg(formatSupabaseError(error));
      else {
        setProjects(data || []);
        loadCoverImages((data || []).map(d => d.id));
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'Dashboard') loadStats();
    if (activeTab === 'Formatos') loadFormats();
    if (activeTab === 'Referências') loadReferences();
    if (activeTab === 'Projetos') loadProjects();
  }, [activeTab]);

  const handleSaveFormat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setStatusMsg('Informe um título.');
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('content_formats').update({ title, description }).eq('id', editingId);
        if (error) setStatusMsg(formatSupabaseError(error));
        else { setStatusMsg('Formato atualizado com sucesso.'); setEditingId(null); setTitle(''); setDescription(''); loadFormats(); }
      } else {
        const { error } = await supabase.from('content_formats').insert({ title, description, status: 'active' });
        if (error) setStatusMsg(formatSupabaseError(error));
        else { setStatusMsg('Formato salvo com sucesso.'); setTitle(''); setDescription(''); loadFormats(); }
      }
    } finally { setIsSubmitting(false); }
  };

  const handleSaveReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim()) return setStatusMsg('Informe um nome.');
    setIsSubmitting(true);
    try {
      const payload = { name: refName, description: refDescription, color: refColor || '#2563eb' };
      if (editingId) {
        const { error } = await supabase.from('reference_categories').update(payload).eq('id', editingId);
        if (error) setStatusMsg(formatSupabaseError(error));
        else { setStatusMsg('Referência atualizada com sucesso.'); setEditingId(null); setRefName(''); setRefDescription(''); setRefColor(''); loadReferences(); }
      } else {
        const { error } = await supabase.from('reference_categories').insert(payload);
        if (error) setStatusMsg(formatSupabaseError(error));
        else { setStatusMsg('Referência salva com sucesso.'); setRefName(''); setRefDescription(''); setRefColor(''); loadReferences(); }
      }
    } finally { setIsSubmitting(false); }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return setStatusMsg('Informe um título.');
    setIsSubmitting(true);
    try {
      const payload = { title: projectTitle, description: projectDescription, status: projectProjStatus, priority: projectPriority };
      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) setStatusMsg(formatSupabaseError(error));
        else { setStatusMsg('Projeto atualizado com sucesso.'); setEditingId(null); setProjectTitle(''); setProjectDescription(''); loadProjects(); }
      } else {
        const { error } = await supabase.from('projects').insert(payload);
        if (error) setStatusMsg(formatSupabaseError(error));
        else { setStatusMsg('Projeto salvo com sucesso.'); setProjectTitle(''); setProjectDescription(''); loadProjects(); }
      }
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!window.confirm('Excluir este item?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) setStatusMsg(formatSupabaseError(error));
      else {
        setStatusMsg('Item excluído.');
        if (table === 'content_formats') loadFormats();
        if (table === 'reference_categories') loadReferences();
        if (table === 'projects') loadProjects();
      }
    } catch (e) { setStatusMsg('Erro ao excluir'); }
  };

  const filteredFormats = useMemo(() => formats.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (f.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [formats, searchQuery]);

  const filteredRefs = useMemo(() => references.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [references, searchQuery]);

  const filteredProjects = useMemo(() => projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [projects, searchQuery]);

  return (
    <div className="container">
      <header>
        <h1>Painel Pessoal</h1>
        <p>Organização de produção de conteúdo</p>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button key={tab} type="button" onClick={() => { setActiveTab(tab); setEditingId(null); setSearchQuery(''); }} className={activeTab === tab ? 'active' : ''}>{tab}</button>
        ))}
      </nav>

      {statusMsg && <div className="card" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 'bold' }}>{statusMsg}</div>}

      <main>
        {activeTab === 'Dashboard' && (
          <div className="fade-in">
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-value">{stats.formats}</div><div className="stat-label">Formatos</div></div>
              <div className="stat-card"><div className="stat-value">{stats.references}</div><div className="stat-label">Referências</div></div>
              <div className="stat-card"><div className="stat-value">{stats.projects}</div><div className="stat-label">Projetos</div></div>
              <div className="stat-card"><div className="stat-value">{stats.links}</div><div className="stat-label">Links</div></div>
              <div className="stat-card"><div className="stat-value">{stats.images}</div><div className="stat-label">Imagens</div></div>
              <div className="stat-card"><div className="stat-value">{stats.notes}</div><div className="stat-label">Notas/Prompts</div></div>
              <div className="stat-card" style={{ borderColor: '#f87171' }}><div className="stat-value" style={{ color: '#ef4444' }}>{stats.tasks}</div><div className="stat-label">Tasks Pendentes</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card">
                <h3>Ações Rápidas</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <button onClick={() => setActiveTab('Formatos')} className="btn-primary">Novo Formato</button>
                  <button onClick={() => setActiveTab('Referências')} className="btn-primary">Nova Referência</button>
                  <button onClick={() => setActiveTab('Projetos')} className="btn-primary">Novo Projeto</button>
                </div>
              </div>
              <div className="card">
                <h3>Conexão Supabase</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{supabaseStatus}</p>
                <button onClick={async () => {
                  setSupabaseStatus('Testando...');
                  const { error } = await supabase.from('content_formats').select('id').limit(1);
                  setSupabaseStatus(error ? formatSupabaseError(error) : 'Supabase conectado com sucesso.');
                }} className="btn-primary" style={{ backgroundColor: '#10b981' }}>Testar Conexão</button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Dashboard' && (
          <>
            <div className="card">
              <h3>{editingId ? 'Editar' : 'Novo'} {activeTab.slice(0, -1)}</h3>
              <form onSubmit={activeTab === 'Formatos' ? handleSaveFormat : activeTab === 'Referências' ? handleSaveReference : handleSaveProject}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {activeTab === 'Formatos' && (
                    <>
                      <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
                      <input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
                    </>
                  )}
                  {activeTab === 'Referências' && (
                    <>
                      <input placeholder="Nome" value={refName} onChange={e => setRefName(e.target.value)} />
                      <input placeholder="Descrição" value={refDescription} onChange={e => setRefDescription(e.target.value)} />
                      <input placeholder="Cor (hex)" value={refColor} onChange={e => setRefColor(e.target.value)} />
                    </>
                  )}
                  {activeTab === 'Projetos' && (
                    <>
                      <input placeholder="Título" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
                      <input placeholder="Descrição" value={projectDescription} onChange={e => setProjectDescription(e.target.value)} />
                      <select value={projectProjStatus} onChange={e => setProjectProjStatus(e.target.value)}>
                        <option value="planning">Planejamento</option>
                        <option value="active">Ativo</option>
                        <option value="completed">Concluído</option>
                      </select>
                      <select value={projectPriority} onChange={e => setProjectPriority(e.target.value)}>
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {editingId ? 'Atualizar' : 'Salvar'}
                  </button>
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); setRefName(''); setProjectTitle(''); }} className="btn-primary" style={{ backgroundColor: '#64748b' }}>Cancelar</button>}
                </div>
              </form>
            </div>

            <div className="search-container">
              <input 
                className="search-input" 
                placeholder={`Buscar em ${activeTab.toLowerCase()}...`} 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>

            {loading ? <p>Carregando...</p> : (
              <div className="masonry-grid">
                {activeTab === 'Formatos' && filteredFormats.map(f => (
                  <div key={f.id} className="masonry-card">
                    {coverImages[f.id] && (
                      <div className="card-image-container">
                        <img src={coverImages[f.id]} className="card-image" alt={f.title} />
                      </div>
                    )}
                    <div className="card-content">
                      <span className="card-label">Formato</span>
                      <h4 className="card-title">{f.title}</h4>
                      <p className="card-description">{f.description || 'Sem descrição.'}</p>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => setSelectedEntity({ type: 'format', id: f.id, title: f.title, description: f.description || '' })} className="btn-primary" style={{ flex: 2 }}>Abrir</button>
                      <button onClick={() => { setEditingId(f.id); setTitle(f.title); setDescription(f.description || ''); }} className="btn-primary" style={{ backgroundColor: '#64748b', flex: 1 }}>Editar</button>
                      <button onClick={() => handleDelete('content_formats', f.id)} className="btn-primary" style={{ backgroundColor: '#ef4444', flex: 1 }}>X</button>
                    </div>
                  </div>
                ))}

                {activeTab === 'Referências' && filteredRefs.map(r => (
                  <div key={r.id} className="masonry-card" style={{ borderLeft: `4px solid ${r.color || '#2563eb'}` }}>
                    {coverImages[r.id] && (
                      <div className="card-image-container">
                        <img src={coverImages[r.id]} className="card-image" alt={r.name} />
                      </div>
                    )}
                    <div className="card-content">
                      <span className="card-label">Referência</span>
                      <h4 className="card-title">{r.name}</h4>
                      <p className="card-description">{r.description || 'Sem descrição.'}</p>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => setSelectedEntity({ type: 'reference', id: r.id, title: r.name, description: r.description || '' })} className="btn-primary" style={{ flex: 2 }}>Abrir</button>
                      <button onClick={() => { setEditingId(r.id); setRefName(r.name); setRefDescription(r.description || ''); setRefColor(r.color || ''); }} className="btn-primary" style={{ backgroundColor: '#64748b', flex: 1 }}>Editar</button>
                      <button onClick={() => handleDelete('reference_categories', r.id)} className="btn-primary" style={{ backgroundColor: '#ef4444', flex: 1 }}>X</button>
                    </div>
                  </div>
                ))}

                {activeTab === 'Projetos' && filteredProjects.map(p => (
                  <div key={p.id} className="masonry-card">
                    {coverImages[p.id] && (
                      <div className="card-image-container">
                        <img src={coverImages[p.id]} className="card-image" alt={p.title} />
                      </div>
                    )}
                    <div className="card-content">
                      <span className="card-label">Projeto • {p.status}</span>
                      <h4 className="card-title">{p.title}</h4>
                      <p className="card-description">{p.description || 'Sem descrição.'}</p>
                      <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: p.priority === 'high' ? '#ef4444' : '#64748b' }}>
                        PRIORIDADE: {p.priority.toUpperCase()}
                      </div>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => setSelectedEntity({ type: 'project', id: p.id, title: p.title, description: p.description || '' })} className="btn-primary" style={{ flex: 2 }}>Abrir</button>
                      <button onClick={() => { setEditingId(p.id); setProjectTitle(p.title); setProjectDescription(p.description || ''); setProjectProjStatus(p.status); setProjectPriority(p.priority); }} className="btn-primary" style={{ backgroundColor: '#64748b', flex: 1 }}>Editar</button>
                      <button onClick={() => handleDelete('projects', p.id)} className="btn-primary" style={{ backgroundColor: '#ef4444', flex: 1 }}>X</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && (
              (activeTab === 'Formatos' && filteredFormats.length === 0) ||
              (activeTab === 'Referências' && filteredRefs.length === 0) ||
              (activeTab === 'Projetos' && filteredProjects.length === 0)
            ) && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Nenhum item encontrado.</p>
              </div>
            )}
          </>
        )}
      </main>

      {selectedEntity && (
        <EntityDetail 
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          entityTitle={selectedEntity.title}
          entityDescription={selectedEntity.description}
          onClose={() => {
            setSelectedEntity(null);
            // Refresh cover images in case one was added
            if (activeTab === 'Formatos') loadFormats();
            if (activeTab === 'Referências') loadReferences();
            if (activeTab === 'Projetos') loadProjects();
          }}
        />
      )}
    </div>
  );
};

export default App;
