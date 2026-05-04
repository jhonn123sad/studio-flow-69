import { createClient } from "@supabase/supabase-js";

// Usamos as variáveis recomendadas para Vite.
// O Lovable injeta estas variáveis quando a integração está ativa.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL_FALLBACK || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Log amigável apenas em desenvolvimento
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn("Supabase credentials missing. App will only work after connecting Supabase via 'Integrations' tab.");
  }
}

// Criamos o cliente de forma segura. Se as credenciais estiverem vazias, 
// o @supabase/supabase-js não quebra imediatamente, mas as chamadas falharão graciosamente.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-gxkavqgjiunwqbhqhsuy.supabase.co", 
  supabaseAnonKey || "sb_publishable_placeholder"
);
