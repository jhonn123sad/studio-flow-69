import { createClient } from "@supabase/supabase-js";

// O Lovable injeta automaticamente estas variáveis quando a integração está ativa.
// Se não estiverem presentes, usamos strings vazias para evitar que o createClient quebre o app.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn("Supabase credentials missing. App will only work after connecting Supabase via 'Integrations' tab.");
  }
}

// O createClient do @supabase/supabase-js lida com URLs vazias retornando um cliente que falha nas chamadas,
// o que é preferível a quebrar a inicialização do app.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);
