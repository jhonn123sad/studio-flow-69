import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { formatSupabaseError } from '../lib/supabase-errors';

interface EntityDetailProps {
  entityType: 'format' | 'reference' | 'project';
  entityId: string;
  entityTitle: string;
  entityDescription: string;
  onClose: () => void;
}

const EntityDetail: React.FC<EntityDetailProps> = ({
  entityType,
  entityId,
  entityTitle,
  entityDescription,
  onClose
}) => {
  const [activeSubTab, setActiveSubTab] = useState('Geral');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Stats for the item
  const [itemStats, setItemStats] = useState({ links: 0, images: 0, notes: 0, relations: 0, tasks: 0 });

  // Links state
  const [links, setLinks] = useState<any[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Images state
  const [images, setImages] = useState<any[]>([]);
  const [imageTitle, setImageTitle] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Relations state
  const [relations, setRelations] = useState<any[]>([]);
  const [targetType, setTargetType] = useState<'format' | 'reference' | 'project'>('format');
  const [targetId, setTargetId] = useState('');
  const [relationLabel, setRelationLabel] = useState('');
  const [availableTargets, setAvailableTargets] = useState<any[]>([]);
  const [resolvedRelationNames, setResolvedRelationNames] = useState<Record<string, string>>({});

  // Tasks state (for projects)
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const subTabs = ['Geral', 'Links', 'Imagens', 'Notas', 'Relações'];
  if (entityType === 'project') subTabs.push('Tasks');

  const loadItemStats = async () => {
    const [l, i, n, r, t] = await Promise.all([
      supabase.from('app_links').select('*', { count: 'exact', head: true }).eq('parent_type', entityType).eq('parent_id', entityId),
      supabase.from('app_images').select('*', { count: 'exact', head: true }).eq('parent_type', entityType).eq('parent_id', entityId),
      supabase.from('app_notes').select('*', { count: 'exact', head: true }).eq('parent_type', entityType).eq('parent_id', entityId),
      supabase.from('app_relations').select('*', { count: 'exact', head: true }).eq('source_type', entityType).eq('source_id', entityId),
      entityType === 'project' ? supabase.from('project_tasks').select('*', { count: 'exact', head: true }).eq('project_id', entityId) : Promise.resolve({ count: 0 })
    ]);
    setItemStats({ links: l.count || 0, images: i.count || 0, notes: n.count || 0, relations: r.count || 0, tasks: t.count || 0 });
  };

  useEffect(() => {
    loadItemStats();
    if (activeSubTab === 'Links') loadLinks();
    if (activeSubTab === 'Imagens') loadImages();
    if (activeSubTab === 'Notas') loadNotes();
    if (activeSubTab === 'Relações') loadRelations();
    if (activeSubTab === 'Tasks' && entityType === 'project') loadTasks();
  }, [activeSubTab, entityId]);

  useEffect(() => {
    if (activeSubTab === 'Relações') loadAvailableTargets();
  }, [targetType]);

  // --- Links Functions ---
  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('app_links').select('*').eq('parent_type', entityType).eq('parent_id', entityId).order('created_at', { ascending: false });
      if (error) setStatus(formatSupabaseError(error));
      else setLinks(data || []);
    } finally { setLoading(false); }
  };

  const handleSaveLink = async () => {
    if (!linkUrl) return setStatus('URL obrigatória');
    const payload = { parent_type: entityType, parent_id: entityId, title: linkTitle || linkUrl, url: linkUrl, description: linkDesc };
    const { error } = editingLinkId ? await supabase.from('app_links').update(payload).eq('id', editingLinkId) : await supabase.from('app_links').insert(payload);
    if (error) setStatus(formatSupabaseError(error));
    else { setStatus('Link salvo'); setLinkTitle(''); setLinkUrl(''); setLinkDesc(''); setEditingLinkId(null); loadLinks(); loadItemStats(); }
  };

  // --- Images Functions ---
  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('app_images').select('*').eq('parent_type', entityType).eq('parent_id', entityId);
      if (error) setStatus(formatSupabaseError(error));
      else setImages(data || []);
    } finally { setLoading(false); }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setStatus('Enviando imagem...');
    try {
      const storagePath = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('content-images').upload(storagePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(storagePath);
      const { error: dbError } = await supabase.from('app_images').insert({ parent_type: entityType, parent_id: entityId, title: imageTitle || file.name, image_url: publicUrl, storage_path: storagePath });
      if (dbError) throw dbError;
      setStatus('Imagem enviada'); setImageTitle(''); loadImages(); loadItemStats();
    } catch (err) { setStatus('Erro: ' + (err as any).message); }
    finally { setUploadingImage(false); }
  };

  // --- Notes Functions ---
  const loadNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('app_notes').select('*').eq('parent_type', entityType).eq('parent_id', entityId).order('created_at', { ascending: false });
      if (error) setStatus(formatSupabaseError(error));
      else setNotes(data || []);
    } finally { setLoading(false); }
  };

  const handleSaveNote = async () => {
    if (!noteContent) return setStatus('Conteúdo obrigatório');
    const payload = { parent_type: entityType, parent_id: entityId, title: noteTitle, content: noteContent, note_type: noteType };
    const { error } = editingNoteId ? await supabase.from('app_notes').update(payload).eq('id', editingNoteId) : await supabase.from('app_notes').insert(payload);
    if (error) setStatus(formatSupabaseError(error));
    else { setStatus('Nota salva'); setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); loadNotes(); loadItemStats(); }
  };

  // --- Relations Functions ---
  const loadRelations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('app_relations').select('*').eq('source_type', entityType).eq('source_id', entityId);
      if (error) setStatus(formatSupabaseError(error));
      else {
        setRelations(data || []);
        // Resolve names
        const names: Record<string, string> = {};
        for (const rel of (data || [])) {
          let table = rel.target_type === 'format' ? 'content_formats' : rel.target_type === 'reference' ? 'reference_categories' : 'projects';
          const { data: targetData } = await supabase.from(table).select('title, name').eq('id', rel.target_id).single();
          if (targetData) names[rel.target_id] = targetData.title || targetData.name;
        }
        setResolvedRelationNames(names);
      }
    } finally { setLoading(false); }
  };

  const loadAvailableTargets = async () => {
    let table = targetType === 'format' ? 'content_formats' : targetType === 'reference' ? 'reference_categories' : 'projects';
    const { data } = await supabase.from(table).select('id, title, name');
    setAvailableTargets(data || []);
  };

  const handleSaveRelation = async () => {
    if (!targetId) return setStatus('Selecione o item');
    const { error } = await supabase.from('app_relations').insert({ source_type: entityType, source_id: entityId, target_type: targetType, target_id: targetId, relation_label: relationLabel || 'relacionado a' });
    if (error) setStatus(formatSupabaseError(error));
    else { setStatus('Relação salva'); setRelationLabel(''); loadRelations(); loadItemStats(); }
  };

  // --- Tasks Functions ---
  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('project_tasks').select('*').eq('project_id', entityId).order('created_at', { ascending: false });
      if (error) setStatus(formatSupabaseError(error));
      else setTasks(data || []);
    } finally { setLoading(false); }
  };

  const handleSaveTask = async () => {
    if (!taskTitle) return setStatus('Título obrigatório');
    const payload = { project_id: entityId, title: taskTitle, description: taskDesc, status: taskStatus, priority: taskPriority };
    const { error } = editingTaskId ? await supabase.from('project_tasks').update(payload).eq('id', editingTaskId) : await supabase.from('project_tasks').insert(payload);
    if (error) setStatus(formatSupabaseError(error));
    else { setStatus('Task salva'); setTaskTitle(''); setTaskDesc(''); setEditingTaskId(null); loadTasks(); loadItemStats(); }
  };

  const typeLabels: Record<string, string> = { format: 'Formato', reference: 'Referência', project: 'Projeto' };

  return (
    <div className="detail-overlay">
      <div className="detail-card">
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div>
            <span className="card-label">{typeLabels[entityType]}</span>
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem' }}>{entityTitle}</h2>
            <code style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {entityId}</code>
          </div>
          <button onClick={onClose} className="btn-primary" style={{ backgroundColor: '#64748b' }}>Fechar</button>
        </div>

        <nav className="tabs" style={{ padding: '1rem 2rem', marginBottom: 0, justifyContent: 'flex-start' }}>
          {subTabs.map(tab => (
            <button key={tab} onClick={() => setActiveSubTab(tab)} className={activeSubTab === tab ? 'active' : ''} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>{tab}</button>
          ))}
        </nav>

        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {status && <div className="card" style={{ backgroundColor: '#eff6ff', marginBottom: '1.5rem', padding: '0.75rem' }}>{status}</div>}

          {activeSubTab === 'Geral' && (
            <div className="fade-in">
              <div className="card">
                <h3>Descrição</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{entityDescription || 'Sem descrição.'}</p>
              </div>
              <div className="stats-grid" style={{ marginTop: '2rem' }}>
                <div className="stat-card"><div className="stat-value">{itemStats.links}</div><div className="stat-label">Links</div></div>
                <div className="stat-card"><div className="stat-value">{itemStats.images}</div><div className="stat-label">Imagens</div></div>
                <div className="stat-card"><div className="stat-value">{itemStats.notes}</div><div className="stat-label">Notas</div></div>
                <div className="stat-card"><div className="stat-value">{itemStats.relations}</div><div className="stat-label">Relações</div></div>
                {entityType === 'project' && <div className="stat-card"><div className="stat-value">{itemStats.tasks}</div><div className="stat-label">Tasks</div></div>}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2rem', textAlign: 'center' }}>
                Centralize aqui tudo que pertence a este item: links, imagens, prompts, notas, tarefas e conexões com outros materiais.
              </p>
            </div>
          )}

          {activeSubTab === 'Links' && (
            <div className="fade-in">
              <div className="card">
                <h3>{editingLinkId ? 'Editar Link' : 'Novo Link'}</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <input placeholder="Título (ex: 'Referência no Instagram')" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
                  <input placeholder="URL (obrigatória)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                  <textarea placeholder="Descrição" value={linkDesc} onChange={e => setLinkDesc(e.target.value)} />
                  <button onClick={handleSaveLink} className="btn-primary">Salvar Link</button>
                </div>
              </div>
              <div className="masonry-grid" style={{ columnCount: 2, marginTop: '2rem' }}>
                {links.map(l => (
                  <div key={l.id} className="masonry-card card-content">
                    <h4 className="card-title">{l.title}</h4>
                    <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', display: 'block', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.url}</a>
                    <p className="card-description">{l.description}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                      <button onClick={() => { setEditingLinkId(l.id); setLinkTitle(l.title); setLinkUrl(l.url); setLinkDesc(l.description || ''); }} className="btn-primary" style={{ backgroundColor: '#64748b', fontSize: '0.7rem' }}>Editar</button>
                      <button onClick={async () => { if(confirm('Excluir?')) { await supabase.from('app_links').delete().eq('id', l.id); loadLinks(); loadItemStats(); } }} className="btn-primary" style={{ backgroundColor: '#ef4444', fontSize: '0.7rem' }}>X</button>
                    </div>
                  </div>
                ))}
              </div>
              {links.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhum link salvo neste item.</p>}
            </div>
          )}

          {activeSubTab === 'Imagens' && (
            <div className="fade-in">
              <div className="card">
                <h3>Upload de Imagem</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <input placeholder="Título da imagem" value={imageTitle} onChange={e => setImageTitle(e.target.value)} />
                  <input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploadingImage} style={{ background: 'none', border: 'none' }} />
                  {uploadingImage && <p>Enviando...</p>}
                </div>
              </div>
              <div className="masonry-grid" style={{ columnCount: 3, marginTop: '2rem' }}>
                {images.map(img => (
                  <div key={img.id} className="masonry-card">
                    <img src={img.image_url} alt={img.title} className="card-image" style={{ objectFit: 'contain', maxHeight: '300px' }} />
                    <div className="card-content" style={{ padding: '0.5rem' }}>
                      <p style={{ fontSize: '0.8rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{img.title}</p>
                      <button onClick={async () => { if(confirm('Excluir?')) { if(img.storage_path) await supabase.storage.from('content-images').remove([img.storage_path]); await supabase.from('app_images').delete().eq('id', img.id); loadImages(); loadItemStats(); } }} className="btn-primary" style={{ backgroundColor: '#ef4444', fontSize: '0.6rem', padding: '2px 6px' }}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
              {images.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma imagem salva neste item.</p>}
            </div>
          )}

          {activeSubTab === 'Notas' && (
            <div className="fade-in">
              <div className="card">
                <h3>{editingNoteId ? 'Editar Nota' : 'Nova Nota'}</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <input placeholder="Título" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} />
                    <select value={noteType} onChange={e => setNoteType(e.target.value)}>
                      <option value="note">Nota</option>
                      <option value="prompt">Prompt</option>
                      <option value="briefing">Briefing</option>
                      <option value="idea">Ideia</option>
                      <option value="access">Acesso</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <textarea placeholder="Conteúdo..." value={noteContent} onChange={e => setNoteContent(e.target.value)} style={{ minHeight: '150px' }} />
                  {noteType === 'access' && <p style={{ color: '#9a3412', fontSize: '0.8rem' }}>⚠️ Evite salvar senhas reais. Use para usuário e dicas.</p>}
                  <button onClick={handleSaveNote} className="btn-primary">Salvar Nota</button>
                </div>
              </div>
              <div className="masonry-grid" style={{ columnCount: 1, marginTop: '2rem' }}>
                {notes.map(n => (
                  <div key={n.id} className="card" style={{ borderLeft: '5px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0 }}>{n.title || 'Sem título'}</h4>
                      <span className="card-label">{n.note_type}</span>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '8px' }}>{n.content}</pre>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                      <button onClick={() => { setEditingNoteId(n.id); setNoteTitle(n.title || ''); setNoteContent(n.content); setNoteType(n.note_type); }} className="btn-primary" style={{ backgroundColor: '#64748b', fontSize: '0.7rem' }}>Editar</button>
                      <button onClick={async () => { if(confirm('Excluir?')) { await supabase.from('app_notes').delete().eq('id', n.id); loadNotes(); loadItemStats(); } }} className="btn-primary" style={{ backgroundColor: '#ef4444', fontSize: '0.7rem' }}>X</button>
                    </div>
                  </div>
                ))}
              </div>
              {notes.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma nota ou prompt salvo neste item.</p>}
            </div>
          )}

          {activeSubTab === 'Relações' && (
            <div className="fade-in">
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Relações conectam este item a outros materiais do painel. Exemplo: um projeto pode usar um formato, uma referência pode inspirar um projeto.
              </p>
              <div className="card">
                <h3>Criar Relação</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Tipo do item relacionado</label>
                      <select value={targetType} onChange={e => setTargetType(e.target.value as any)} style={{ width: '100%', marginTop: '5px' }}>
                        <option value="format">Formato</option>
                        <option value="reference">Referência</option>
                        <option value="project">Projeto</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Item relacionado</label>
                      <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ width: '100%', marginTop: '5px' }}>
                        <option value="">Selecione...</option>
                        {availableTargets.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Como eles se relacionam?</label>
                    <input list="rel-suggestions" placeholder="Ex: usa, baseado em, inspirado por..." value={relationLabel} onChange={e => setRelationLabel(e.target.value)} style={{ width: '100%', marginTop: '5px' }} />
                    <datalist id="rel-suggestions">
                      <option value="relacionado a" /><option value="usa" /><option value="inspirado em" /><option value="faz parte de" /><option value="referência para" /><option value="baseado em" /><option value="usado em" />
                    </datalist>
                  </div>
                  <button onClick={handleSaveRelation} className="btn-primary">Adicionar Relação</button>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                {relations.map(r => (
                  <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      Este item <span style={{ fontWeight: '800', color: '#2563eb' }}>[{r.relation_label || 'relacionado a'}]</span> o <span style={{ fontWeight: '600' }}>{typeLabels[r.target_type]}</span>: <strong>{resolvedRelationNames[r.target_id] || r.target_id}</strong>
                    </div>
                    <button onClick={async () => { await supabase.from('app_relations').delete().eq('id', r.id); loadRelations(); loadItemStats(); }} className="btn-primary" style={{ backgroundColor: '#ef4444', fontSize: '0.7rem' }}>X</button>
                  </div>
                ))}
              </div>
              {relations.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma relação criada ainda.</p>}
            </div>
          )}

          {activeSubTab === 'Tasks' && (
            <div className="fade-in">
              <div className="card">
                <h3>{editingTaskId ? 'Editar Task' : 'Nova Task'}</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <input placeholder="Título da tarefa" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                  <textarea placeholder="Instruções/Descrição" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)}>
                      <option value="todo">A fazer</option>
                      <option value="doing">Em andamento</option>
                      <option value="review">Revisão</option>
                      <option value="done">Concluído</option>
                    </select>
                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                      <option value="low">Prioridade Baixa</option>
                      <option value="medium">Prioridade Média</option>
                      <option value="high">Prioridade Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <button onClick={handleSaveTask} className="btn-primary">Salvar Tarefa</button>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                {tasks.map(t => (
                  <div key={t.id} className="card" style={{ borderLeft: `5px solid ${t.completed ? '#10b981' : t.priority === 'urgent' ? '#ef4444' : '#2563eb'}`, opacity: t.completed ? 0.7 : 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={t.completed} onChange={async () => { await supabase.from('project_tasks').update({ completed: !t.completed }).eq('id', t.id); loadTasks(); loadItemStats(); }} style={{ marginTop: '5px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</h4>
                          <span className="card-label" style={{ fontSize: '0.6rem' }}>{t.status}</span>
                          <span className="card-label" style={{ fontSize: '0.6rem', backgroundColor: t.priority === 'urgent' ? '#fee2e2' : '#f1f5f9', color: t.priority === 'urgent' ? '#ef4444' : '#64748b' }}>{t.priority}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>{t.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => { setEditingTaskId(t.id); setTaskTitle(t.title); setTaskDesc(t.description || ''); setTaskStatus(t.status); setTaskPriority(t.priority); }} className="btn-primary" style={{ backgroundColor: '#64748b', fontSize: '0.6rem', padding: '4px 8px' }}>Editar</button>
                        <button onClick={async () => { if(confirm('Excluir?')) { await supabase.from('project_tasks').delete().eq('id', t.id); loadTasks(); loadItemStats(); } }} className="btn-primary" style={{ backgroundColor: '#ef4444', fontSize: '0.6rem', padding: '4px 8px' }}>X</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma task criada para este projeto.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityDetail;
