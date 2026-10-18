const {test}=require('node:test'),assert=require('node:assert/strict')
let OperationCoordinator
try{({OperationCoordinator}=require('../src/main/operations.ts'))}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}
const clear=()=>({kind:'confirm',message:'No observed work'})
const tick=()=>new Promise(r=>setImmediate(r))
function setup(){assert.equal(typeof OperationCoordinator,'function');let paused=false,checks=0,executed=0,hidden=0;let result=clear()
 const c=new OperationCoordinator({changed:()=>{},pause:()=>{paused=true},resume:()=>{paused=false},hide:()=>{hidden++}})
 const start=(confirm=true)=>c.run({kind:'disconnect',name:'Docs',requiresConfirmation:confirm},async()=>{checks++;return result},async()=>{executed++})
 return {c,start,set:r=>result=r,stats:()=>({paused,checks,executed,hidden})}
}
test('idle observation still requires explicit confirmation and rechecks immediately',async()=>{const x=setup(),p=x.start();await tick();assert.equal(x.c.view.phase,'confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'confirm');assert.equal(await p,true);assert.equal(x.stats().checks,2);assert.equal(x.stats().executed,1);assert.equal(x.stats().paused,false)})
test('known pending writes block even if a forged confirmation is sent',async()=>{const x=setup();x.set({kind:'blocked',message:'Pending'});const p=x.start();await tick();assert.equal(x.c.view.phase,'blocked');await x.c.respond(x.c.view.id,'confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');assert.equal(await p,false)})
test('unknown status blocks, but background remains possible and resumes scheduling',async()=>{const x=setup();x.set({kind:'unknown',message:'Unknown'});const p=x.start();await tick();await x.c.respond(x.c.view.id,'background');assert.equal(await p,false);assert.equal(x.stats().hidden,1);assert.equal(x.stats().paused,false)})
test('activity starting during the warning blocks at the second check',async()=>{const x=setup(),p=x.start();await tick();x.set({kind:'blocked',message:'New upload'});await x.c.respond(x.c.view.id,'confirm');assert.equal(x.c.view.phase,'blocked');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');await p})
test('retry reevaluates status but never silently executes a destructive action',async()=>{const x=setup();x.set({kind:'unknown',message:'Unavailable'});const p=x.start();await tick();x.set(clear());await x.c.respond(x.c.view.id,'retry');assert.equal(x.c.view.phase,'confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');await p})
test('duplicate and stale requests cannot bypass or confirm another warning',async()=>{const x=setup(),p=x.start();await tick();await assert.rejects(x.start(),/operazione/i);await x.c.respond('old-id','confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');await p})
test('cancellation while telemetry is awaited invalidates its late reply',async()=>{const x=setup();let resolve;const p=x.c.run({kind:'quit',requiresConfirmation:true},()=>new Promise(r=>{resolve=r}),async()=>{throw new Error('must not run')});const id=x.c.view.id;await x.c.respond(id,'cancel');resolve(clear());await tick();assert.equal(await p,false);assert.equal(x.c.view,null)})
test('exit without mounts or background work needs no warning',async()=>{const x=setup();assert.equal(await x.start(false),true);assert.equal(x.stats().executed,1)})
