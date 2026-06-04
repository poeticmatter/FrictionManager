import { createClient, SupabaseClient } from '@supabase/supabase-js';

let activeClient: SupabaseClient | null = null;

export function getSupabaseCredentials() {
  if (typeof window === 'undefined') return { url: '', key: '' };
  const url = localStorage.getItem('fm_supabase_url') || '';
  const key = localStorage.getItem('fm_supabase_key') || '';
  return { url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return !!(
    url &&
    key &&
    key !== 'your_publishable_key_here' &&
    url.startsWith('http')
  );
}

export function setSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fm_supabase_url', url.trim());
    localStorage.setItem('fm_supabase_key', key.trim());
  }
  
  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();
  
  if (trimmedUrl && trimmedKey && trimmedKey !== 'your_publishable_key_here' && trimmedUrl.startsWith('http')) {
    activeClient = createClient(trimmedUrl, trimmedKey);
  } else {
    activeClient = null;
  }
}

// Initial initialization on load
const { url: initUrl, key: initKey } = getSupabaseCredentials();
if (initUrl && initKey && initKey !== 'your_publishable_key_here' && initUrl.startsWith('http')) {
  activeClient = createClient(initUrl.trim(), initKey.trim());
}

export const isConfigured = isSupabaseConfigured();

// Proxy to allow exporting supabase client as a constant
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!activeClient) {
      throw new Error("Supabase client is not configured.");
    }
    const val = Reflect.get(activeClient, prop);
    if (typeof val === 'function') {
      return val.bind(activeClient);
    }
    return val;
  }
});
