export const formatSupabaseError = (error: any) => {
  if (!error) return "Erro desconhecido."

  const message = error.message || String(error)
  const code = error.code

  if (code === "42P01" || message.includes("relation does not exist")) {
    return "Tabela não encontrada no Supabase. Verifique se o schema foi executado corretamente."
  }

  if (
    message.includes("permission denied") ||
    message.includes("RLS") ||
    message.includes("not authorized") ||
    message.includes("violates row-level security") ||
    message.includes("new row violates row-level security policy") ||
    [401, 403].includes(error.status)
  ) {
    return "Permissão bloqueada pelo Supabase RLS. Para este MVP sem login, desative RLS nesta tabela."
  }

  if (message.includes("bucket not found") || message.includes("bucket_not_found")) {
    return "Bucket de imagens não encontrado. Crie o bucket 'content-images' no Supabase."
  }

  return message
}
