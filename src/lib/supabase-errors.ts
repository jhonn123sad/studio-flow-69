export const handleSupabaseError = (error: any) => {
  if (!error) return null;
  
  const message = error.message || '';
  const code = error.code || '';

  if (message.includes('relation does not exist') || code === '42P01') {
    return 'Tabela não criada no Supabase. Execute o SQL do schema.';
  }

  if (message.includes('permission denied') || message.includes('RLS') || ['401', '403'].includes(code)) {
    return 'Permissão negada. Verifique se RLS está desativado para este MVP.';
  }

  return message;
};
