const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path')
function api(){const f=path.join(__dirname,'../src/main/backup-progress.ts');assert.ok(fs.existsSync(f),'Statistics parser exists');return require(f)}
const line=stats=>JSON.stringify({level:'notice',msg:'stats',stats})+'\n'
test('real byte counters yield an estimated percentage',()=>{
  const {progressFromStats}=api()
  const p=progressFromStats({bytes:420,totalBytes:1000,checks:8,transfers:2,speed:40})
  assert.equal(p.percent,42); assert.equal(p.bytes,420); assert.equal(p.totalBytes,1000);assert.equal(p.phase,'copying')
})
test('checking without a total reports activity and no invented percentage',()=>{
  const p=api().progressFromStats({bytes:0,totalBytes:0,checks:72,transfers:0})
  assert.equal(p.percent,null);assert.equal(p.checks,72);assert.equal(p.phase,'checking')
})
test('running transfer at full bytes never announces completion before exit status',()=>{
  const p=api().progressFromStats({bytes:1000,totalBytes:1000})
  assert.equal(p.percent,99);assert.equal(p.phase,'finishing')
})
test('malformed/negative numeric stats do not leak NaN or negative UI counters',()=>{
  const p=api().progressFromStats({bytes:-1,totalBytes:'200',speed:Infinity,checks:null})
  assert.equal(p.percent,null);assert.equal(p.bytes,0);assert.equal(p.speed,0)
})
test('growing totals may revise the estimate rather than showing a fabricated monotonic value',()=>{
  const {progressFromStats}=api()
  assert.equal(progressFromStats({bytes:50,totalBytes:100}).percent,50)
  assert.equal(progressFromStats({bytes:60,totalBytes:200}).percent,30)
})
test('JSON log parser handles partial lines, multiple lines and split UTF-8',()=>{
  const received=[]; const {JsonLogReader}=api();const reader=new JsonLogReader(x=>received.push(x))
  const data=Buffer.from(line({bytes:5,totalBytes:10})+JSON.stringify({level:'error',msg:'perch\u00e9'})+'\n')
  for(const byte of data) reader.push(Buffer.from([byte]))
  reader.end()
  assert.equal(received.length,2);assert.equal(received[0].stats.bytes,5);assert.equal(received[1].msg,'perch\u00e9')
})
test('log reader handles a final unterminated line and ignores ordinary text',()=>{
  const got=[];const r=new (api().JsonLogReader)(x=>got.push(x))
  r.push(Buffer.from('a diagnostic\n'+line({checks:2})+JSON.stringify({level:'error',msg:'failed'})));r.end()
  assert.equal(got.length,2);assert.equal(got[1].msg,'failed')
})
test('a huge incomplete line is dropped, not interpreted after truncation',()=>{
  const got=[];const r=new (api().JsonLogReader)(x=>got.push(x))
  r.push(Buffer.from('x'.repeat(600000)));r.push(Buffer.from('\n'+line({checks:3})));r.end()
  assert.equal(got.length,1);assert.equal(got[0].stats.checks,3)
})
