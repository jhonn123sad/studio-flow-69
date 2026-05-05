export const formatSupabaseError = (error: any) => {
  if (!error) return "Erro desconhecido."

  const message = error.message || String(error)
  const code = error.code

  if (code === "42P01" || message.includes("relation does not exist")) {
    return "Tabela não criada no Supabase. Execute o SQL do schema."
  }

  if (
    message.includes("permission denied") ||
    message.includes("RLS") ||
    message.includes("not authorized") ||
    [401, 403].includes(error.status)
  ) {
    return "Permissão negada. Verifique se RLS está desativado para este MVP."
  }

  return message
}
