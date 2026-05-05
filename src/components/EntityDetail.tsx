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

  // Links state
  const [links, setLinks] = useState<any[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');

  // Images state
  const [images, setImages] = useState<any[]>([]);
  const [imageTitle, setImageTitle] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');

  // Relations state
  const [relations, setRelations] = useState<any[]>([]);
  const [targetType, setTargetType] = useState<'format' | 'reference' | 'project'>('format');
  const [targetId, setTargetId] = useState('');
  const [relationLabel, setRelationLabel] = useState('');
  const [availableTargets, setAvailableTargets] = useState<any[]>([]);

  // Tasks state (for projects)
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');

  const subTabs = ['Geral', 'Links', 'Imagens', 'Notas', 'Relações'];
  if (entityType === 'project') subTabs.push('Tasks');

  useEffect(() => {
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
      const { data, error } = await supabase
        .from('app_links')
        .select('*')
        .eq('parent_type', entityType)
        .eq('parent_id', entityId)
        .order('created_at', { ascending: false });
      if (error) setStatus(formatSupabaseError(error));
      else setLinks(data || []);
    } catch (e) {
      setStatus('Erro links');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLink = async () => {
    if (!linkUrl) return setStatus('URL obrigatória');
    try {
      const { error } = await supabase.from('app_links').insert({
        parent_type: entityType,
        parent_id: entityId,
        title: linkTitle || linkUrl,
        url: linkUrl,
        description: linkDesc
      });
      if (error) setStatus(formatSupabaseError(error));
      else {
        setStatus('Link salvo');
        setLinkTitle(''); setLinkUrl(''); setLinkDesc('');
        loadLinks();
      }
    } catch (e) { setStatus('Erro salvar link'); }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Excluir link?')) return;
    await supabase.from('app_links').delete().eq('id', id);
    loadLinks();
  };

  // --- Images Functions ---
  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_images')
        .select('*')
        .eq('parent_type', entityType)
        .eq('parent_id', entityId);
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
      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(storagePath);

      const { error: dbError } = await supabase.from('app_images').insert({
        parent_type: entityType,
        parent_id: entityId,
        title: imageTitle || file.name,
        image_url: publicUrl,
        storage_path: storagePath
      });

      if (dbError) throw dbError;

      setStatus('Imagem enviada');
      setImageTitle('');
      loadImages();
    } catch (err) {
      setStatus('Erro upload: ' + (err as any).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (img: any) => {
    if (!confirm('Excluir imagem?')) return;
    if (img.storage_path) {
      await supabase.storage.from('content-images').remove([img.storage_path]);
    }
    await supabase.from('app_images').delete().eq('id', img.id);
    loadImages();
  };

  // --- Notes Functions ---
  const loadNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_notes')
        .select('*')
        .eq('parent_type', entityType)
        .eq('parent_id', entityId)
        .order('created_at', { ascending: false });
      if (error) setStatus(formatSupabaseError(error));
      else setNotes(data || []);
    } finally { setLoading(false); }
  };

  const handleSaveNote = async () => {
    if (!noteContent) return setStatus('Conteúdo obrigatório');
    try {
      const { error } = await supabase.from('app_notes').insert({
        parent_type: entityType,
        parent_id: entityId,
        title: noteTitle,
        content: noteContent,
        note_type: noteType
      });
      if (error) setStatus(formatSupabaseError(error));
      else {
        setStatus('Nota salva');
        setNoteTitle(''); setNoteContent('');
        loadNotes();
      }
    } catch (e) { setStatus('Erro nota'); }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Excluir nota?')) return;
    await supabase.from('app_notes').delete().eq('id', id);
    loadNotes();
  };

  // --- Relations Functions ---
  const loadRelations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_relations')
        .select('*')
        .eq('source_type', entityType)
        .eq('source_id', entityId);
      if (error) setStatus(formatSupabaseError(error));
      else setRelations(data || []);
    } finally { setLoading(false); }
  };

  const loadAvailableTargets = async () => {
    let table = '';
    if (targetType === 'format') table = 'content_formats';
    else if (targetType === 'reference') table = 'reference_categories';
    else if (targetType === 'project') table = 'projects';

    const { data } = await supabase.from(table).select('id, title, name');
    setAvailableTargets(data || []);
  };

  const handleSaveRelation = async () => {
    if (!targetId) return setStatus('Selecione o alvo');
    const { error } = await supabase.from('app_relations').insert({
      source_type: entityType,
      source_id: entityId,
      target_type: targetType,
      target_id: targetId,
      relation_label: relationLabel
    });
    if (error) setStatus(formatSupabaseError(error));
    else {
      setStatus('Relação salva');
      setRelationLabel('');
      loadRelations();
    }
  };

  // --- Tasks Functions ---
  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', entityId)
        .order('created_at', { ascending: false });
      if (error) setStatus(formatSupabaseError(error));
      else setTasks(data || []);
    } finally { setLoading(false); }
  };

  const handleSaveTask = async () => {
    if (!taskTitle) return setStatus('Título obrigatório');
    const { error } = await supabase.from('project_tasks').insert({
      project_id: entityId,
      title: taskTitle,
      status: taskStatus
    });
    if (error) setStatus(formatSupabaseError(error));
    else {
      setStatus('Task salva');
      setTaskTitle('');
      loadTasks();
    }
  };

  const toggleTask = async (task: any) => {
    await supabase.from('project_tasks').update({ completed: !task.completed }).eq('id', task.id);
    loadTasks();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', margin: 0, backgroundColor: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0 }}>{entityTitle}</h2>
            <small style={{ color: '#666' }}>{entityType} | {entityId}</small>
          </div>
          <button onClick={onClose} style={{ padding: '5px 15px', cursor: 'pointer' }}>Fechar</button>
        </div>

        <nav style={{ display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {subTabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveSubTab(tab)}
              style={{ 
                padding: '8px 12px', 
                backgroundColor: activeSubTab === tab ? '#2563eb' : '#f3f4f6',
                color: activeSubTab === tab ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {status && <div style={{ padding: '10px', backgroundColor: '#eff6ff', marginBottom: '15px', borderRadius: '4px' }}>{status}</div>}

        {activeSubTab === 'Geral' && (
          <div>
            <p><strong>Descrição:</strong> {entityDescription || 'Sem descrição.'}</p>
            <p style={{ color: '#666', marginTop: '20px', fontSize: '14px' }}>
              Use este espaço para centralizar links, imagens, prompts, notas e relações deste item.
            </p>
          </div>
        )}

        {activeSubTab === 'Links' && (
          <div>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <input placeholder="Título (opcional)" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <input placeholder="URL (obrigatória)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <textarea placeholder="Descrição" value={linkDesc} onChange={e => setLinkDesc(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <button onClick={handleSaveLink} disabled={loading} className="btn-primary">Adicionar Link</button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {links.map(l => (
                <div key={l.id} className="card" style={{ padding: '10px', margin: 0 }}>
                  <strong>{l.title}</strong><br/>
                  <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px' }}>{l.url}</a>
                  <p style={{ fontSize: '13px', margin: '5px 0' }}>{l.description}</p>
                  <button onClick={() => handleDeleteLink(l.id)} style={{ fontSize: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Imagens' && (
          <div>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <input placeholder="Título da imagem" value={imageTitle} onChange={e => setImageTitle(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploadingImage} />
              {uploadingImage && <p>Fazendo upload...</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {images.map(img => (
                <div key={img.id} style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={img.image_url} alt={img.alt_text} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '5px' }}>
                    <small style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</small>
                    <button onClick={() => handleDeleteImage(img)} style={{ fontSize: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Notas' && (
          <div>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <input placeholder="Título" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <select value={noteType} onChange={e => setNoteType(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
                <option value="note">Nota</option>
                <option value="prompt">Prompt</option>
                <option value="briefing">Briefing</option>
                <option value="idea">Idéia</option>
                <option value="access">Acesso</option>
                <option value="other">Outro</option>
              </select>
              <textarea placeholder="Conteúdo..." value={noteContent} onChange={e => setNoteContent(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '100px' }} />
              {noteType === 'access' && <p style={{ color: '#9a3412', fontSize: '12px' }}>Evite salvar senhas reais. Use para links e dicas.</p>}
              <button onClick={handleSaveNote} disabled={loading} className="btn-primary">Salvar Nota</button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {notes.map(n => (
                <div key={n.id} className="card" style={{ padding: '10px', margin: 0, borderLeft: '4px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{n.title || 'Sem título'}</strong>
                    <small style={{ backgroundColor: '#eee', padding: '2px 5px', borderRadius: '4px' }}>{n.note_type}</small>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', backgroundColor: '#f3f4f6', padding: '10px', marginTop: '10px' }}>{n.content}</pre>
                  <button onClick={() => handleDeleteNote(n.id)} style={{ fontSize: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Relações' && (
          <div>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <select value={targetType} onChange={e => setTargetType(e.target.value as any)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
                <option value="format">Formato</option>
                <option value="reference">Referência</option>
                <option value="project">Projeto</option>
              </select>
              <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
                <option value="">Selecione o item...</option>
                {availableTargets.map(t => (
                  <option key={t.id} value={t.id}>{t.title || t.name}</option>
                ))}
              </select>
              <input placeholder="Rótulo (ex: 'Usa este formato')" value={relationLabel} onChange={e => setRelationLabel(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <button onClick={handleSaveRelation} disabled={loading} className="btn-primary">Criar Relação</button>
            </div>
            <div>
              {relations.map(r => (
                <div key={r.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 'bold' }}>{r.relation_label || 'Relacionado a'}</span>: {r.target_type} ({r.target_id})
                  <button onClick={async () => { await supabase.from('app_relations').delete().eq('id', r.id); loadRelations(); }} style={{ float: 'right', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Tasks' && (
          <div>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <input placeholder="Nova tarefa..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
              <button onClick={handleSaveTask} disabled={loading} className="btn-primary">Adicionar Task</button>
            </div>
            <div>
              {tasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid #eee' }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t)} />
                  <span style={{ textDecoration: t.completed ? 'line-through' : 'none', flex: 1 }}>{t.title}</span>
                  <button onClick={async () => { await supabase.from('project_tasks').delete().eq('id', t.id); loadTasks(); }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityDetail;
