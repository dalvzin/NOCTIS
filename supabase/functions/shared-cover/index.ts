// Somente Supabase Edge Runtime: nunca importar no frontend.
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';
import { sharedCoverHandler } from './handler.ts';
const url=Deno.env.get('SUPABASE_URL');
const key=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')??'{}').default??Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!url||!key)throw new Error('Server-only Supabase media credentials are not configured.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(sharedCoverHandler(async token=>{
 const {data,error}=await client.rpc('album_read',{p_token:token,p_id:null});if(error)throw error;return data;
},async path=>{
 const {data,error}=await client.storage.from('noctis-media').createSignedUrl(path,60);if(error)throw error;return data.signedUrl;
}));
