const test=require('node:test'),assert=require('node:assert/strict')
const {runSetupTool}=require('../src/main/setup-process.ts')
test('actual setup process runner passes arguments without a shell',async()=>{
 const literal='$(echo unsafe); & | < >';const r=await runSetupTool(process.execPath,['-e','process.stdout.write(process.argv[1])',literal]);assert.equal(r.code,0);assert.equal(r.stdout,literal)
})
test('actual login output is discarded, including errors containing tokens',async()=>{
 const r=await runSetupTool(process.execPath,['-e',"console.log('SECRET_TOKEN');console.error('SECRET_TOKEN');process.exitCode=3"],{discardOutput:true});assert.equal(r.code,3);assert.equal(r.stdout,'');assert.equal(r.stderr,'')
})
test('an unresponsive disposable setup probe times out rather than returning success',async()=>{
 await assert.rejects(runSetupTool(process.execPath,['-e','setTimeout(()=>{},20000)'],{timeoutMs:150}),/tempo/)
})
