// electron-builder afterPack hook: a successful download is not sufficient;
// the installed resource tree must contain the exact verified payloads too.
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto')
module.exports=async function verifyVendor(context){
 const platform=context.electronPlatformName
 if(!['linux','win32'].includes(platform))throw new Error('Unsupported bundle platform')
 const root=path.join(context.appOutDir,'resources','vendor')
 const manifest=JSON.parse(await fsp.readFile(path.join(root,'runtime-manifest.json'),'utf8'))
 const required=platform==='win32'?['rclone.exe','cloudflared.exe','winfsp.msi']:['rclone','cloudflared']
 if(manifest.platform!==platform||manifest.arch!=='x64'||!Array.isArray(manifest.files)||manifest.files.length!==required.length)throw new Error('Native bundle manifest is incomplete')
 for(const name of required){
  const record=manifest.files.find(r=>r.file===name)
  if(!record||!/^[a-f0-9]{64}$/.test(record.sha256))throw new Error('Missing native payload hash')
  const file=path.join(root,name),stat=await fsp.lstat(file)
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size===0)throw new Error('Invalid native payload')
  const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))hash.update(chunk)
  if(hash.digest('hex')!==record.sha256)throw new Error('Native payload checksum mismatch: '+name)
 }
 console.log('Packaged native payload checksums verified for '+platform)
}
