import { createClient } from "@supabase/supabase-js";

// Dados reais do Supabase do usuário como fallback explícito
const fallbackSupabaseUrl = "https://gxkavqgjiunwqbhqhsuy.supabase.co";
const fallbackSupabaseKey = "sb_publishable_I7vku5wUpmeHhoHC0IFyZA_sU9LoWHh";

// Tenta carregar das variáveis do Vite, senão usa o fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
                    import.meta.env.VITE_SUPABASE_ANON_KEY || 
                    fallbackSupabaseKey;

// Flag para verificar se as configurações básicas existem (sempre true agora devido ao fallback)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Cria o cliente único oficial do projeto
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
