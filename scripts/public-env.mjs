export function assertPublicEnvironment(values){
 for(const [name,raw] of Object.entries(values)){
  if(!name.startsWith('VITE_')||!raw)continue;
  const value=String(raw).trim();let role;
  try{role=JSON.parse(Buffer.from(value.split('.')[1]??'','base64url').toString()).role;}catch{/* Não é um JWT. */}
  if(value.startsWith('sb_secret_')||role==='service_role')throw new Error(`${name} contains a privileged key. It must never be exposed to the browser.`);
  if(name==='VITE_SUPABASE_PUBLISHABLE_KEY'&&!value.startsWith('sb_publishable_')&&role!=='anon')throw new Error('Use a Supabase publishable key or legacy anon key in VITE_SUPABASE_PUBLISHABLE_KEY.');
 }
}
export function checkViteEnvironment(mode,loadEnv){
 assertPublicEnvironment({...loadEnv(mode,process.cwd(),'VITE_'),...Object.fromEntries(Object.entries(process.env).filter(([key])=>key.startsWith('VITE_')))});
}
