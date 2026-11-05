import type { SupabaseClient } from '@supabase/supabase-js';

export function validPublicConfig(url: string, key: string) {
  try {
    const parsed=new URL(url);
    if (!(parsed.protocol==='https:' || (parsed.protocol==='http:' && ['localhost','127.0.0.1'].includes(parsed.hostname)))) return false;
    if (key.startsWith('sb_secret_')) return false;
    if (key.startsWith('sb_publishable_')) return true;
    const payload=JSON.parse(atob((key.split('.')[1]??'').replace(/-/g,'+').replace(/_/g,'/')));
    return payload.role==='anon';
  } catch { return false; }
}
const url=import.meta.env.VITE_SUPABASE_URL??'', key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY??'';
export const supabase: SupabaseClient|null = validPublicConfig(url,key) ? (await import('@supabase/supabase-js')).createClient(url,key,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
export function authRedirect(path='/auth/callback') { return new URL(path,window.location.origin).href; }
export function safeNext(value: string|null) { try { return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.startsWith('/auth') && new URL(value,'https://noctis.invalid').origin==='https://noctis.invalid' ? value : '/account'; }catch{return '/account';} }
export function messageOf(error: unknown) {
 const message=error && typeof error==='object' && 'message' in error ? String(error.message) : 'The request could not be completed. Please try again.';
 return message.includes('profiles_username_key')?'This username is unavailable. Choose another.':message;
}
