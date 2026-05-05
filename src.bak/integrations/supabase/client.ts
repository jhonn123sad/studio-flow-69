import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxkavqgjiunwqbhqhsuy.supabase.co';
const supabaseAnonKey = 'sb_publishable_I7vku5wUpmeHhoHC0IFyZA_sU9LoWHh';

console.log('[SUPABASE] Inicializando cliente...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
