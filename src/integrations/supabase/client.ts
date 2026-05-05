import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gxkavqgjiunwqbhqhsuy.supabase.co";
const supabaseKey = "sb_publishable_I7vku5wUpmeHhoHC0IFyZA_sU9LoWHh";

export const isSupabaseConfigured = true;

// Criando o cliente de forma segura para evitar crashes no servidor
const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== 'undefined', // Apenas persiste no browser
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
      }
    });
  } catch (error) {
    console.error("Erro ao inicializar Supabase Client:", error);
    // Retorna um mock minimalista se falhar para não quebrar o import
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: { message: "Supabase não inicializado" } }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: "Supabase não inicializado" } }),
      }
    } as any;
  }
};

export const supabase = createSupabaseClient();
