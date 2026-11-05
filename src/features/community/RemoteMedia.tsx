import { useEffect, useState } from 'react';
import { mediaUrl } from './service';
export function RemoteMedia({owner,id,token,alt,avatar=false}:{owner:string;id:string|null;token?:string;alt:string;avatar?:boolean}){
 const [image,setImage]=useState<{key:string;url:string}|null>(null);const key=`${owner}/${id}/${token??''}`;
 useEffect(()=>{let active=true;if(id)void mediaUrl(owner,id,token).then(url=>{if(active&&url)setImage({key,url});}).catch(()=>{if(active)setImage(null);});return()=>{active=false;};},[owner,id,token,key]);
 return image?.key===key?<img src={image.url} alt={alt} onError={()=>setImage(null)} style={{display:'block',width:avatar?64:'100%',height:avatar?64:220,objectFit:'contain',borderRadius:avatar?'50%':0,maxWidth:600}}/>:<span>{avatar?'◦':'Image unavailable'}</span>;
}
