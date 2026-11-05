import type { SupabaseClient } from '@supabase/supabase-js';
import type { ArchiveCommand, ArchiveRepository, ArchiveView, CommandResult } from '../personal/types';
import { compactWork, emptyArchive, parseArchive } from '../personal/schema';
import { messageOf } from '../../services/supabase';

export class CloudRepository implements ArchiveRepository {
  readonly mode='cloud' as const;
  private view:ArchiveView={data:emptyArchive(),error:null,blocked:true,loading:true};
  private listeners=new Set<()=>void>();
  private queue:Promise<unknown>=Promise.resolve();
  constructor(private client:SupabaseClient,readonly userId:string){}
  getSnapshot=()=>this.view;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  private emit(){this.listeners.forEach(listener=>listener());}
  reportIssue=(error:string)=>{this.view={...this.view,error};this.emit();};
  rawExport=()=>JSON.stringify(this.view.data);
  findWork=(category:string,id:string)=>Object.values(this.view.data.entries).find(entry=>entry.work.category===category&&(entry.work.id===id||entry.work.legacyId===id))?.work;
  private load=async()=>{
    try {
    const {data,error}=await this.client.rpc('archive_snapshot');
    if(error){this.view={...this.view,error:messageOf(error),loading:false,blocked:true};this.emit();return;}
    if(data?.accountId!==this.userId)throw new Error('Account identity changed or the database schema is out of date. Reload the intended account.');
    try{this.view={data:parseArchive(JSON.stringify(data)),error:null,blocked:false,loading:false};}catch(error){this.view={...this.view,error:messageOf(error),blocked:true,loading:false};}
    this.emit();
    }catch(error){this.view={...this.view,error:messageOf(error),loading:false,blocked:true};this.emit();}
  };
  reload=()=>{const next=this.queue.then(this.load,this.load);this.queue=next;return next;};
  dispatch=(command:ArchiveCommand):Promise<CommandResult>=>{
    const run=async():Promise<CommandResult>=>{
      if(this.view.loading||this.view.blocked)return {ok:false,error:'Cloud archive is not ready. Retry loading it in Account.'};
      try{
        const payload='work' in command && command.work ? {...command,work:compactWork(command.work)} : command;
        const {data,error}=await this.client.rpc('archive_mutate',{command:{...payload,expectedUserId:this.userId}});
        if(error)throw error;
        if(data?.data?.accountId!==this.userId)throw new Error('Account identity changed. Reload before retrying.');
        this.view={data:parseArchive(JSON.stringify(data.data)),error:null,blocked:false,loading:false};this.emit();return {ok:true,id:data.id??undefined};
      }catch(error){const message=messageOf(error);this.reportIssue(`Cloud change was not confirmed: ${message}`);return {ok:false,error:message};}
    };
    const next=this.queue.then(run,run);this.queue=next;return next;
  };
}
