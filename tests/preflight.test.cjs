const {test}=require('node:test'); const assert=require('node:assert/strict')
let assessTransfers
try { ({assessTransfers}=require('../src/main/preflight.ts')) } catch(e) { if(e.code!=='MODULE_NOT_FOUND')throw e }
const vfs=()=>({diskCache:{uploadsQueued:0,uploadsInProgress:0,erroredFiles:0,outOfSpace:false}})
const core=()=>({bytes:0,errors:0,transfers:0,checks:0})
const queue=()=>({queue:[]})
// Regressions: treating missing fields as zero or checking only the queue would fail these tests.
test('empty observed queues permit a warning, never declare safe',()=>{
 assert.equal(typeof assessTransfers,'function');const r=assessTransfers(vfs(),core(),queue())
 assert.equal(r.kind,'confirm');assert.equal(r.safe,undefined)
})
for(const field of ['uploadsQueued','uploadsInProgress','erroredFiles']) test(`blocks current ${field}`,()=>{
 const x=vfs();x.diskCache[field]=1;assert.equal(assessTransfers(x,core(),queue()).kind,'blocked')
})
test('out of space is blocked',()=>{const x=vfs();x.diskCache.outOfSpace=true;assert.equal(assessTransfers(x,core(),queue()).kind,'blocked')})
test('active downloads and checks are blocked even with an empty upload queue',()=>{
 for(const field of ['transferring','checking']) assert.equal(assessTransfers(vfs(),{...core(),[field]:[{}]},queue()).kind,'blocked')
})
test('queue items block even when a previous statistics snapshot said zero',()=>assert.equal(assessTransfers(vfs(),core(),{queue:[{id:1}]}).kind,'blocked'))
test('historical transfer errors do not prevent closing forever',()=>assert.equal(assessTransfers(vfs(),{...core(),errors:6,fatalError:true,lastError:'old'},queue()).kind,'confirm'))
test('unknown or malformed status must not count as idle',()=>{
 for(const x of [null,{}, {diskCache:{}}, {diskCache:{...vfs().diskCache,uploadsQueued:-1}}, {diskCache:{...vfs().diskCache,outOfSpace:'false'}}])assert.equal(assessTransfers(x,core(),queue()).kind,'unknown')
 for(const x of [null,{}, {bytes:'0'}, {...core(),transferring:3}])assert.equal(assessTransfers(vfs(),x,queue()).kind,'unknown')
 for(const x of [null,{}, {queue:1}])assert.equal(assessTransfers(vfs(),core(),x).kind,'unknown')
})
test('explicit null optional activity arrays from Go are empty, not missing telemetry',()=>assert.equal(assessTransfers(vfs(),{...core(),transferring:null,checking:null},{queue:null}).kind,'confirm'))
