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

  // Referências State
  const [references, setReferences] = useState<ReferenceCategory[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [referenceStatus, setReferenceStatus] = useState('');
  const [refName, setRefName] = useState('');
  const [refDescription, setRefDescription] = useState('');
  const [refColor, setRefColor] = useState('');
  const [editingRefId, setEditingRefId] = useState<string | null>(null);
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);

  // Projetos State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectStatus, setProjectStatus] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectProjStatus, setProjectProjStatus] = useState('planning');
  const [projectPriority, setProjectPriority] = useState('medium');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isSubmittingProj, setIsSubmittingProj] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'format' | 'reference' | 'project';
    id: string;
    title: string;
    description: string;
  } | null>(null);

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

  const loadReferences = async () => {
    setLoadingReferences(true);
    setReferenceStatus('Carregando referências...');
    try {
      const { data, error } = await supabase
        .from('reference_categories')
        .select('id, name, description, icon, color, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setReferenceStatus(formatSupabaseError(error));
      } else {
        setReferences(data || []);
        setReferenceStatus('');
      }
    } catch (err) {
      setReferenceStatus('Erro ao carregar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingReferences(false);
    }
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    setProjectStatus('Carregando projetos...');
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, status, priority, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setProjectStatus(formatSupabaseError(error));
      } else {
        setProjects(data || []);
        setProjectStatus('');
      }
    } catch (err) {
      setProjectStatus('Erro ao carregar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Formatos') loadFormats();
    if (activeTab === 'Referências') loadReferences();
    if (activeTab === 'Projetos') loadProjects();
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
        const { error } = await supabase.from('content_formats').update({ title, description }).eq('id', editingFormatId);
        if (error) setFormatStatus(formatSupabaseError(error));
        else { setFormatStatus('Formato atualizado com sucesso.'); resetForm(); loadFormats(); }
      } else {
        const { error } = await supabase.from('content_formats').insert({ title, description, status: 'active' });
        if (error) setFormatStatus(formatSupabaseError(error));
        else { setFormatStatus('Formato salvo com sucesso.'); resetForm(); loadFormats(); }
      }
    } catch (err) { setFormatStatus('Erro ao salvar: ' + (err as any).message); }
    finally { setIsSubmitting(false); }
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
      const { error } = await supabase.from('content_formats').delete().eq('id', id);
      if (error) setFormatStatus(formatSupabaseError(error));
      else { setFormatStatus('Formato excluído com sucesso.'); loadFormats(); }
    } catch (err) { setFormatStatus('Erro ao excluir: ' + (err as any).message); }
  };

  const resetForm = () => { setEditingFormatId(null); setTitle(''); setDescription(''); };

  const handleSaveReference = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refName.trim()) { setReferenceStatus('Informe um nome.'); return; }
    setIsSubmittingRef(true);
    setReferenceStatus('Salvando...');
    try {
      const payload = { name: refName, description: refDescription, color: refColor || '#2563eb' };
      if (editingRefId) {
        const { error } = await supabase.from('reference_categories').update(payload).eq('id', editingRefId);
        if (error) setReferenceStatus(formatSupabaseError(error));
        else { setReferenceStatus('Referência atualizada com sucesso.'); resetRefForm(); loadReferences(); }
      } else {
        const { error } = await supabase.from('reference_categories').insert(payload);
        if (error) setReferenceStatus(formatSupabaseError(error));
        else { setReferenceStatus('Referência salva com sucesso.'); resetRefForm(); loadReferences(); }
      }
    } catch (err) { setReferenceStatus('Erro ao salvar: ' + (err as any).message); }
    finally { setIsSubmittingRef(false); }
  };

  const handleEditRef = (ref: ReferenceCategory) => {
    setEditingRefId(ref.id);
    setRefName(ref.name);
    setRefDescription(ref.description || '');
    setRefColor(ref.color || '');
    setReferenceStatus('');
  };

  const handleDeleteRef = async (id: string) => {
    if (!window.confirm('Excluir esta referência?')) return;
    setReferenceStatus('Excluindo...');
    try {
      const { error } = await supabase.from('reference_categories').delete().eq('id', id);
      if (error) setReferenceStatus(formatSupabaseError(error));
      else { setReferenceStatus('Referência excluída com sucesso.'); loadReferences(); }
    } catch (err) { setReferenceStatus('Erro ao excluir: ' + (err as any).message); }
  };

  const resetRefForm = () => { setEditingRefId(null); setRefName(''); setRefDescription(''); setRefColor(''); };

  const handleSaveProject = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectTitle.trim()) { setProjectStatus('Informe um título.'); return; }
    setIsSubmittingProj(true);
    setProjectStatus('Salvando...');
    try {
      const payload = { title: projectTitle, description: projectDescription, status: projectProjStatus, priority: projectPriority };
      if (editingProjectId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProjectId);
        if (error) setProjectStatus(formatSupabaseError(error));
        else { setProjectStatus('Projeto atualizado com sucesso.'); resetProjectForm(); loadProjects(); }
      } else {
        const { error } = await supabase.from('projects').insert(payload);
        if (error) setProjectStatus(formatSupabaseError(error));
        else { setProjectStatus('Projeto salva com sucesso.'); resetProjectForm(); loadProjects(); }
      }
    } catch (err) { setProjectStatus('Erro ao salvar: ' + (err as any).message); }
    finally { setIsSubmittingProj(false); }
  };

  const handleEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectDescription(proj.description || '');
    setProjectProjStatus(proj.status);
    setProjectPriority(proj.priority);
    setProjectStatus('');
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Excluir este projeto?')) return;
    setProjectStatus('Excluindo...');
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) setProjectStatus(formatSupabaseError(error));
      else { setProjectStatus('Projeto excluído com sucesso.'); loadProjects(); }
    } catch (err) { setProjectStatus('Erro ao excluir: ' + (err as any).message); }
  };

  const resetProjectForm = () => { setEditingProjectId(null); setProjectTitle(''); setProjectDescription(''); setProjectProjStatus('planning'); setProjectPriority('medium'); };

  return (
    <div className="container">
      <header>
        <h1>Painel Pessoal</h1>
        <p>Organização de produção de conteúdo</p>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab}</button>
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
              <button type="button" onClick={handleTestSupabase} className="btn-primary" style={{ backgroundColor: '#10b981', marginTop: '10px' }}>Testar Supabase</button>
              <p className="status" style={{ marginTop: '10px', fontWeight: 'bold' }}>Status: {supabaseStatus}</p>
            </div>
          </>
        )}

        {activeTab === 'Formatos' && (
          <div className="card">
            <h2>Formatos</h2>
            <p>Organize formatos de conteúdo para usar nos seus projetos.</p>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>{editingFormatId ? 'Editar Formato' : 'Novo Formato'}</h3>
              <form onSubmit={handleSaveFormat}>
                <div style={{ marginBottom: '10px' }}><label>Título:</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ marginBottom: '10px' }}><label>Descrição:</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '60px' }} /></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={(e) => handleSaveFormat(e as any)} disabled={isSubmitting} className="btn-primary">{editingFormatId ? 'Atualizar formato' : 'Salvar formato'}</button>
                  {editingFormatId && <button type="button" onClick={resetForm} className="btn-primary" style={{ backgroundColor: '#6b7280' }}>Cancelar edição</button>}
                </div>
              </form>
            </div>
            {formatStatus && <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontWeight: 'bold' }}>{formatStatus}</div>}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>Lista de Formatos</h3><button type="button" onClick={loadFormats} disabled={loadingFormats} style={{ padding: '5px 10px' }}>Carregar formatos</button></div>
              {loadingFormats ? <p>Carregando formatos...</p> : formats.length === 0 ? <p>Nenhum formato criado ainda.</p> : (
                <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                  {formats.map(format => (
                    <div key={format.id} className="card" style={{ margin: 0, padding: '15px' }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{format.title}</h4>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>{format.description}</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setSelectedEntity({ type: 'format', id: format.id, title: format.title, description: format.description || '' })} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Abrir</button>
                        <button type="button" onClick={() => handleEdit(format)} style={{ padding: '5px 10px', fontSize: '12px' }}>Editar</button>
                        <button type="button" onClick={() => handleDelete(format.id)} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Referências' && (
          <div className="card">
            <h2>Referências</h2>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>{editingRefId ? 'Editar Referência' : 'Nova Referência'}</h3>
              <form onSubmit={handleSaveReference}>
                <div style={{ marginBottom: '10px' }}><label>Nome:</label><input type="text" value={refName} onChange={(e) => setRefName(e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ marginBottom: '10px' }}><label>Descrição:</label><textarea value={refDescription} onChange={(e) => setRefDescription(e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '60px' }} /></div>
                <div style={{ marginBottom: '10px' }}><label>Cor:</label><input type="text" value={refColor} placeholder="#2563eb" onChange={(e) => setRefColor(e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={(e) => handleSaveReference(e as any)} disabled={isSubmittingRef} className="btn-primary">{editingRefId ? 'Atualizar referência' : 'Salvar referência'}</button>
                  {editingRefId && <button type="button" onClick={resetRefForm} className="btn-primary" style={{ backgroundColor: '#6b7280' }}>Cancelar edição</button>}
                </div>
              </form>
            </div>
            {referenceStatus && <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontWeight: 'bold' }}>{referenceStatus}</div>}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>Lista de Categorias</h3><button type="button" onClick={loadReferences} disabled={loadingReferences} style={{ padding: '5px 10px' }}>Carregar referências</button></div>
              {loadingReferences ? <p>Carregando referências...</p> : references.length === 0 ? <p>Nenhuma referência criada ainda.</p> : (
                <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                  {references.map(ref => (
                    <div key={ref.id} className="card" style={{ margin: 0, padding: '15px', borderLeft: `5px solid ${ref.color || '#2563eb'}` }}>
                      <h4 style={{ margin: 0 }}>{ref.name}</h4>
                      <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>{ref.description}</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setSelectedEntity({ type: 'reference', id: ref.id, title: ref.name, description: ref.description || '' })} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Abrir</button>
                        <button type="button" onClick={() => handleEditRef(ref)} style={{ padding: '5px 10px', fontSize: '12px' }}>Editar</button>
                        <button type="button" onClick={() => handleDeleteRef(ref.id)} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Projetos' && (
          <div className="card">
            <h2>Projetos</h2>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>{editingProjectId ? 'Editar Projeto' : 'Novo Projeto'}</h3>
              <form onSubmit={handleSaveProject}>
                <div style={{ marginBottom: '10px' }}><label>Título:</label><input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ marginBottom: '10px' }}><label>Descrição:</label><textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '60px' }} /></div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}><label>Status:</label><select value={projectProjStatus} onChange={(e) => setProjectProjStatus(e.target.value)} style={{ width: '100%', padding: '8px' }}><option value="planning">Planejamento</option><option value="active">Ativo</option><option value="paused">Pausado</option><option value="completed">Concluído</option><option value="archived">Arquivado</option></select></div>
                  <div style={{ flex: 1 }}><label>Prioridade:</label><select value={projectPriority} onChange={(e) => setProjectPriority(e.target.value)} style={{ width: '100%', padding: '8px' }}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={(e) => handleSaveProject(e as any)} disabled={isSubmittingProj} className="btn-primary">{editingProjectId ? 'Atualizar projeto' : 'Salvar projeto'}</button>
                  {editingProjectId && <button type="button" onClick={resetProjectForm} className="btn-primary" style={{ backgroundColor: '#6b7280' }}>Cancelar edição</button>}
                </div>
              </form>
            </div>
            {projectStatus && <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontWeight: 'bold' }}>{projectStatus}</div>}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3>Lista de Projetos</h3><button type="button" onClick={loadProjects} disabled={loadingProjects} style={{ padding: '5px 10px' }}>Carregar projetos</button></div>
              {loadingProjects ? <p>Carregando projetos...</p> : projects.length === 0 ? <p>Nenhum projeto criado ainda.</p> : (
                <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                  {projects.map(proj => (
                    <div key={proj.id} className="card" style={{ margin: 0, padding: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><h4 style={{ margin: 0 }}>{proj.title}</h4><div style={{ display: 'flex', gap: '5px' }}><span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: '#e5e7eb' }}>{proj.status}</span><span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: proj.priority === 'urgent' ? '#fee2e2' : '#fef3c7' }}>{proj.priority}</span></div></div>
                      <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>{proj.description}</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setSelectedEntity({ type: 'project', id: proj.id, title: proj.title, description: proj.description || '' })} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Abrir</button>
                        <button type="button" onClick={() => handleEditProject(proj)} style={{ padding: '5px 10px', fontSize: '12px' }}>Editar</button>
                        <button type="button" onClick={() => handleDeleteProject(proj.id)} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEntity && (
          <EntityDetail 
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            entityTitle={selectedEntity.title}
            entityDescription={selectedEntity.description}
            onClose={() => setSelectedEntity(null)}
          />
        )}

        <div className="card test-section">
          <h3>Teste de Interatividade</h3>
          <button type="button" onClick={handleTestClick} className="btn-primary">Testar clique</button>
          <p className="status">Cliques: {clicks}</p>
        </div>
      </main>
    </div>
  );
};

export default App;
