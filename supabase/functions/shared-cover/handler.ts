interface SharedCover {visibility:string;media_owner:string;cover:{kind:string;imageId?:string}}
export function sharedCoverHandler(read:(token:string)=>Promise<SharedCover|null>,sign:(path:string)=>Promise<string>){
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Content-Type':'application/json','Cache-Control':'no-store'};
 return async(request:Request)=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers});
  if(request.method!=='POST')return new Response('{}',{status:405,headers});
  try{
   const body=await request.json();
   if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))return new Response('{}',{status:404,headers});
   const album=await read(body.token);
   if(!album||album.visibility!=='unlisted'||album.cover?.kind!=='upload'||!album.cover.imageId)return new Response('{}',{status:404,headers});
   const url=await sign(`${album.media_owner}/${album.cover.imageId}`);
   return new Response(JSON.stringify({url}),{headers});
  }catch{return new Response(JSON.stringify({error:'Cover unavailable'}),{status:400,headers});}
 };
}
