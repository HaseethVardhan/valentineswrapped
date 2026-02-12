import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase Setup Missing: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local')
}

// Fallback to placeholder to prevent app crash on load. API calls will fail, but the app will render.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
