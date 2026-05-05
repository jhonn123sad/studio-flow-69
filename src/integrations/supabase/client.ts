import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://gxkavqgjiunwqbhqhsuy.supabase.co'

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_I7vku5wUpmeHhoHC0IFyZA_sU9LoWHh'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey)
