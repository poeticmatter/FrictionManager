import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

export const isConfigured = !!(
  supabaseUrl && 
  supabasePublishableKey && 
  supabasePublishableKey !== 'your_publishable_key_here' && 
  supabaseUrl.startsWith('http')
)

export const supabase = isConfigured ? createClient(supabaseUrl, supabasePublishableKey) : null as any
