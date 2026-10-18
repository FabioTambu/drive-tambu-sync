const {test,after}=require('node:test')
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os')
function api(){const f=path.join(__dirname,'../src/main/shortcuts.ts');assert.ok(fs.existsSync(f),'Shortcut implementation exists');return require(f)}
const root=fs.mkdtempSync(path.join(os.tmpdir(),'dt-shortcut-'));after(()=>fs.rmSync(root,{recursive:true,force:true}))
test('shortcut argument only accepts a saved identifier, never an arbitrary path or command',()=>{
 const {requestedFolder}=api()
 assert.equal(requestedFolder(['app','--open-folder','folder-123']),'folder-123')
 assert.equal(requestedFolder(['app']),null)
 for(const args of [['app','--open-folder'],['app','--open-folder','../../test'],['app','--open-folder','file;rm -rf'],['app','--open-folder','folder-123','--open-folder','folder-456']])assert.throws(()=>requestedFolder(args),/collegamento|identificativo/i)
})
test('shortcut filename cannot escape the selected parent directory',()=>{
 const {shortcutName}=api()
 assert.equal(shortcutName('../Files: personal'), '..-Files- personal')
 assert.ok(!shortcutName('CON').match(/^CON$/i))
 assert.equal(shortcutName('  '),'Cartella')
})
test('desktop launcher quotes the executable safely and includes only a saved ID',()=>{
 const {desktopEntry}=api()
 const text=desktopEntry('/home/user/My app 100%/Drive.AppImage','folder-123','A\nB')
 assert.ok(text.includes('Exec="/home/user/My app 100%%/Drive.AppImage" -- --open-folder folder-123'))
 assert.ok(!text.includes('Name=A\nB'))
 assert.ok(text.includes('Terminal=false'))
 assert.throws(()=>desktopEntry('/app\nbad','folder-123','name'),/eseguibile/)
})
test('Linux shortcut is a regular executable launcher, not a symlink to the mounted folder',()=>{
 const {writeLinuxShortcut}=api(), dest=path.join(root,'Files.desktop')
 writeLinuxShortcut(dest,'/usr/bin/drive-tambu','folder-123','Files')
 assert.ok(fs.statSync(dest).isFile());if(process.platform !== 'win32')assert.ok(fs.statSync(dest).mode&0o100)
 assert.ok(fs.readFileSync(dest,'utf8').includes('--open-folder folder-123'))
})
test('Linux launcher never follows a symlink and overwrites its target',t=>{
 if(process.platform === 'win32'){t.skip('POSIX symlink permissions; exercised on the Linux job');return}
 const {writeLinuxShortcut}=api(),target=path.join(root,'do-not-touch'),dest=path.join(root,'symlink.desktop')
 fs.writeFileSync(target,'safe');fs.symlinkSync(target,dest)
 assert.throws(()=>writeLinuxShortcut(dest,'/usr/bin/app','folder-123','Files'),/simbolico|collegamento|destinazione/i)
 assert.equal(fs.readFileSync(target,'utf8'),'safe')
})
test('opening a saved shortcut connects once, waits for readiness and uses the latest path',async()=>{
 const {SavedFolderOpener}=api();let calls=0,opened=[],state='disconnected'
 const opener=new SavedFolderOpener({find:()=>({localPath:'/new-location'}),state:()=>({status:state,detail:''}),connect:async()=>{calls++;state='connecting';setImmediate(()=>{state='connected'})},open:async p=>{opened.push(p);return ''},stopping:()=>false},200,2)
 await Promise.all([opener.open('folder-123'),opener.open('folder-123')])
 assert.equal(calls,1);assert.deepEqual(opened,['/new-location'])
})
test('shortcut waiting fails with a finite timeout and does not open an empty folder',async()=>{
 const {SavedFolderOpener}=api();let opened=false
 const opener=new SavedFolderOpener({find:()=>({localPath:'/mount'}),state:()=>({status:'connecting',detail:''}),connect:async()=>{},open:async()=>{opened=true;return ''},stopping:()=>false},10,2)
 await assert.rejects(opener.open('folder-123'),/disponibile|attesa/i);assert.equal(opened,false)
})
test('shortcut propagates missing saved folder and connection error without creating a path',async()=>{
 const {SavedFolderOpener}=api()
 const missing=new SavedFolderOpener({find:()=>{throw new Error('Cartella rimossa')},state:()=>({status:'disconnected'}),connect:async()=>{throw new Error('should not connect')},open:async()=>'',stopping:()=>false})
 await assert.rejects(missing.open('folder-123'),/rimossa/)
 const bad=new SavedFolderOpener({find:()=>({localPath:'/mount'}),state:()=>({status:'error',detail:'Accesso non autorizzato'}),connect:async()=>{},open:async()=>'',stopping:()=>false})
 await assert.rejects(bad.open('folder-123'),/Accesso non autorizzato/)
})

test('a silent Linux launcher does not ask the desktop to wait for an app window',()=>{
 const {desktopEntry}=api()
 assert.match(desktopEntry('/usr/bin/drive-tambu','folder-123','Files'),/^StartupNotify=false$/m)
})
