// Separate process so blocked filesystem operations cannot block the test driver.
const fs=require('node:fs/promises')
const path=require('node:path')
const root=process.env.PROBE_WRITER_ROOT
if(!path.isAbsolute(root||''))process.exit(2)
let handle=null,queue=Promise.resolve()
function bytes(hex) {
  if(typeof hex!=='string'||hex.length>4*1024*1024||hex.length%2||!/^[0-9a-f]*$/i.test(hex)) throw new Error('Invalid payload')
  return Buffer.from(hex,'hex')
}
async function writeAll(buffer) {
  let offset=0
  while(offset<buffer.length){const {bytesWritten}=await handle.write(buffer,offset,buffer.length-offset,null);if(bytesWritten<=0)throw new Error('Short write');offset+=bytesWritten}
  await handle.sync() // Acknowledges local fsync only, NOT server delivery.
  return {acknowledgedBytes:offset}
}
async function dispatch(m) {
  if(m.op==='open') {
    if(handle)throw new Error('Writer already open')
    if(typeof m.name!=='string'||!/^[a-zA-Z0-9_-]+\.bin$/.test(m.name))throw new Error('Invalid test file name')
    const data=bytes(m.hex)
    handle=await fs.open(path.join(root,m.name),'wx+')
    return writeAll(data)
  }
  if(m.op==='append'){if(!handle)throw new Error('No open writer');return writeAll(bytes(m.hex))}
  if(m.op==='close'){if(handle){const h=handle;handle=null;await h.close()}return {closed:true}}
  throw new Error('Unknown writer command')
}
process.on('message',m=>{
  queue=queue.then(async()=>{
    try {const value=await dispatch(m);if(process.connected)process.send({id:m.id,ok:true,value})}
    catch(e){if(process.connected)process.send({id:m.id,ok:false,error:String(e.code||'error')+': '+e.message})}
  })
})
process.on('disconnect',()=>{void queue.finally(async()=>{try{if(handle)await handle.close()}finally{process.exit(0)}})})
