import { randomUUID } from 'node:crypto'
import type { OperationView, OperationReply } from '../shared/types'
import type { PreflightResult } from './preflight'

interface OperationRequest {
  kind: OperationView['kind']; name?: string; from?: string; to?: string
  requiresConfirmation: boolean
}
interface Pending {
  request:OperationRequest; view:OperationView
  check:()=>Promise<PreflightResult>; execute:()=>Promise<void>; finish:(success:boolean)=>void
}
/** Serializes app actions only. External applications can still begin writes. */
export class OperationCoordinator {
  private pending:Pending|null=null
  constructor(private hooks:{changed:()=>void;pause:()=>void;resume:()=>void;hide:()=>void}){}
  get busy():boolean{return this.pending!==null}
  get view():OperationView|null{return this.pending?structuredClone(this.pending.view):null}
  async run(request:OperationRequest,check:()=>Promise<PreflightResult>,execute:()=>Promise<void>):Promise<boolean>{
    if(this.pending)throw new Error('Completa o annulla l\'operazione gia aperta.')
    const promise=new Promise<boolean>(finish=>{
      this.pending={request,check,execute,finish,view:{id:randomUUID(),kind:request.kind,name:request.name,from:request.from,to:request.to,phase:'checking',message:'Controllo dei trasferimenti...'}}
    })
    this.hooks.pause();this.hooks.changed()
    void this.evaluate(this.pending!,false)
    return promise
  }
  private async evaluate(p:Pending,confirmed:boolean):Promise<void>{
    p.view.phase='checking';p.view.message='Controllo dei trasferimenti...';this.hooks.changed()
    try{
      const result=await p.check()
      if(this.pending!==p)return
      if(result.kind!=='confirm'){
        p.view.phase='blocked';p.view.message=result.message;this.hooks.changed();return
      }
      if(!confirmed && p.request.requiresConfirmation){
        p.view.phase='confirm';p.view.message=result.message;this.hooks.changed();return
      }
      p.view.phase='working';p.view.message='Completo l\'operazione...';this.hooks.changed()
      await p.execute()
      if(this.pending===p)this.complete(p,true)
    }catch(error){
      if(this.pending!==p)return
      p.view.phase='blocked';p.view.message=error instanceof Error?error.message:'Operazione non completata. Riprova.';this.hooks.changed()
    }
  }
  private complete(p:Pending,success:boolean):void{
    this.pending=null;this.hooks.resume();this.hooks.changed();p.finish(success)
  }
  async respond(id:string,reply:OperationReply):Promise<void>{
    const p=this.pending
    if(!p || p.view.id!==id)return
    if(p.view.phase==='working')return
    if(reply==='cancel' || reply==='background'){
      this.complete(p,false);if(reply==='background')this.hooks.hide();return
    }
    if(reply==='confirm' && p.view.phase==='confirm')await this.evaluate(p,true)
    else if(reply==='retry' && p.view.phase==='blocked')await this.evaluate(p,false)
  }
}
