import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gxkavqgjiunwqbhqhsuy.supabase.co";
const supabaseKey = "sb_publishable_I7vku5wUpmeHhoHC0IFyZA_sU9LoWHh";

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseKey);
