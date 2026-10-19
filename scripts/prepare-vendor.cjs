// Run only while building the app, never as an administrator on an end-user PC.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib')
const manifest=require('../resources/vendor-manifest.json')
const ROOT=path.resolve(__dirname,'..','resources','vendor')
function verifyBytes(bytes,expected){const actual=crypto.createHash('sha256').update(bytes).digest('hex');if(actual!==expected)throw new Error('Checksum non corrispondente: build interrotta.');return actual}
function validateArtifact(a){const u=new URL(a.url);if(u.protocol!=='https:')throw new Error('HTTPS required');if(!['downloads.rclone.org','github.com'].includes(u.hostname))throw new Error('Untrusted artifact origin');if(!/^[a-f0-9]{64}$/.test(a.sha256))throw new Error('Missing SHA256')}
async function download(url,limit=160*1024*1024){
 const r=await fetch(url,{signal:AbortSignal.timeout(180000),redirect:'follow'});if(!r.ok)throw new Error(`Download fallito: ${r.status} ${url}`)
 if(new URL(r.url).protocol!=='https:')throw new Error('Redirect non HTTPS')
 const chunks=[];let size=0;for await(const b of r.body){size+=b.length;if(size>limit)throw new Error('Download troppo grande');chunks.push(Buffer.from(b))}return Buffer.concat(chunks)
}
// Extract one exact, pinned ZIP entry; never write archive paths to the filesystem.
function zipMember(zip,wanted){
 let end=-1;for(let i=zip.length-22;i>=Math.max(0,zip.length-65557);i--)if(zip.readUInt32LE(i)===0x06054b50){end=i;break}
 if(end<0)throw new Error('ZIP directory missing');let cursor=zip.readUInt32LE(end+16)
 for(let i=0;i<zip.readUInt16LE(end+10);i++){
  if(zip.readUInt32LE(cursor)!==0x02014b50)throw new Error('Invalid ZIP directory')
  const method=zip.readUInt16LE(cursor+10),size=zip.readUInt32LE(cursor+20),original=zip.readUInt32LE(cursor+24),n=zip.readUInt16LE(cursor+28),e=zip.readUInt16LE(cursor+30),c=zip.readUInt16LE(cursor+32),offset=zip.readUInt32LE(cursor+42)
  const name=zip.subarray(cursor+46,cursor+46+n).toString('utf8');cursor+=46+n+e+c
  if(name!==wanted)continue
  if(zip.readUInt32LE(offset)!==0x04034b50||original>160*1024*1024)throw new Error('Invalid ZIP member')
  const start=offset+30+zip.readUInt16LE(offset+26)+zip.readUInt16LE(offset+28),data=zip.subarray(start,start+size)
  const result=method===0?data:method===8?zlib.inflateRawSync(data,{maxOutputLength:160*1024*1024}):null
  if(!result||result.length!==original)throw new Error('Unsupported or invalid ZIP compression');return result
 }
 throw new Error(`ZIP member missing: ${wanted}`)
}
async function main(){
 const args=process.argv.slice(2),index=args.indexOf('--platform'),platform=index>=0?args[index+1]:process.platform
 if(!['linux','win32'].includes(platform))throw new Error('Supported bundle targets: linux/win32 x64')
 const dir=path.join(ROOT,`${platform}-x64`);await fs.mkdir(ROOT,{recursive:true});const temp=await fs.mkdtemp(path.join(ROOT,'.prepare-'))
 try{
  const records=[]
  for(const a of manifest.platforms[platform]){
   validateArtifact(a);console.log(`Preparing ${a.name} for ${platform} (pinned SHA256)`)
   const archive=await download(a.url);verifyBytes(archive,a.sha256);const bytes=a.member?zipMember(archive,a.member):archive
   if(!/^[a-zA-Z0-9.-]+$/.test(a.output))throw new Error('Invalid output filename')
   await fs.writeFile(path.join(temp,a.output),bytes,{mode:0o755});records.push({name:a.name,file:a.output,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),source:a.url})
  }
  await fs.mkdir(path.join(temp,'licenses'))
  const licenses=[['rclone.txt','https://raw.githubusercontent.com/rclone/rclone/v1.74.4/COPYING'],['cloudflared.txt','https://raw.githubusercontent.com/cloudflare/cloudflared/2026.10.1/LICENSE']]
  if(platform==='win32')licenses.push(['winfsp.txt','https://raw.githubusercontent.com/winfsp/winfsp/v2.1/License.txt'])
  for(const [name,url] of licenses)await fs.writeFile(path.join(temp,'licenses',name),await download(url,1024*1024))
  await fs.copyFile(path.join(__dirname,'..','resources','THIRD-PARTY-NOTICES.txt'),path.join(temp,'THIRD-PARTY-NOTICES.txt'))
  await fs.writeFile(path.join(temp,'runtime-manifest.json'),JSON.stringify({platform,arch:'x64',files:records},null,2)+'\n')
  // Only build output under this exact directory is replaced; no system executable is touched.
  await fs.rm(dir,{recursive:true,force:true});await fs.rename(temp,dir)
  console.log(`Verified native bundle ready: ${dir}`)
 }finally{await fs.rm(temp,{recursive:true,force:true})}
}
module.exports={verifyBytes,validateArtifact,zipMember}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1})
