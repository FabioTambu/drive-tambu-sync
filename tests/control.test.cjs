const {test}=require('node:test');const assert=require('node:assert/strict');const http=require('node:http')
let ControlClient
try {({ControlClient}=require('../src/main/control.ts'))}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}
async function serve(t,handler){const s=http.createServer(handler);await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>{s.closeAllConnections();s.close()});return s.address().port}
test('control talks only to loopback with session authentication and JSON',async t=>{
 const port=await serve(t,(q,s)=>{assert.equal(q.headers.authorization,'Basic '+Buffer.from('drive-tambu:secret').toString('base64'));assert.equal(q.url,'/core/pid');s.end('{"pid":42}')})
 assert.equal(typeof ControlClient,'function');assert.deepEqual(await new ControlClient(port,'secret').call('core/pid'),{pid:42})
})
test('HTTP errors do not leak response bodies or session credentials',async t=>{
 const port=await serve(t,(_,s)=>{s.statusCode=500;s.end('sensitive-path secret')})
 await assert.rejects(new ControlClient(port,'secret').call('vfs/stats'),e=>{assert.doesNotMatch(e.message,/secret|sensitive/);return true})
})
test('malformed responses and hanging services fail rather than returning empty stats',async t=>{
 const port=await serve(t,(q,s)=>{if(q.url==='/core/pid')s.end('not json')})
 const c=new ControlClient(port,'secret');await assert.rejects(c.call('core/pid'),/risposta/i);await assert.rejects(c.call('vfs/stats',{},40),/tempo/i)
})
test('refuses arbitrary RC commands and invalid ports',async()=>{
 assert.throws(()=>new ControlClient(0,'secret'))
 await assert.rejects(new ControlClient(45678,'secret').call('config/dump'),/consentito/i)
})
