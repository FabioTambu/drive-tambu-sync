// Called only in dist:win on the Windows GitHub Actions runner with Visual Studio Build Tools.
const {execFileSync,spawnSync}=require('node:child_process')
const fs=require('node:fs'),path=require('node:path'),os=require('node:os')
function findVsDevCmd() {
 const where=process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
 const vswhere=path.join(where,'Microsoft Visual Studio','Installer','vswhere.exe')
 const installation=execFileSync(vswhere,['-latest','-products','*','-requires','Microsoft.VisualStudio.Component.VC.Tools.x86.x64','-property','installationPath'],{encoding:'utf8'}).trim()
 if(!installation)throw new Error('Visual Studio C++ Build Tools non trovato sul runner Windows.')
 const cmd=path.join(installation,'Common7','Tools','VsDevCmd.bat')
 if(!fs.existsSync(cmd))throw new Error('VsDevCmd.bat non trovato nel toolchain MSVC.')
 return cmd
}
function batchQuoted(file) {
 if(typeof file!=='string' || !file || /["\r\n\0]/.test(file))throw new Error('Percorso della compilazione nativa non valido.')
 return `"${file.replace(/%/g,'%%')}"`
}
/** Run a batch file by filename so cmd.exe cannot reinterpret nested VsDevCmd.bat quotes. */
function compileWithMsvc(dev,src,output,root,spawn=spawnSync) {
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'drive-tambu-msvc-'))
 const batch=path.join(temporary,'compile-shortcut.cmd')
 try {
   const commands=[
     '@echo off',
     `call ${batchQuoted(dev)} -no_logo -arch=amd64 >nul`,
     'if errorlevel 1 exit /b 1',
     `cl /nologo /std:c++17 /EHsc /O2 /MT /W4 /DUNICODE /D_UNICODE ${batchQuoted(src)} /Fe:${batchQuoted(output)} /link /SUBSYSTEM:WINDOWS advapi32.lib shell32.lib`,
     'exit /b %errorlevel%',
     ''
   ].join('\r\n')
   fs.writeFileSync(batch,commands,{encoding:'utf8',flag:'wx',mode:0o600})
   const r=spawn('cmd.exe',['/d','/c',batch],{cwd:root,stdio:'inherit',windowsHide:true})
   if(r.status!==0)throw new Error(`Compilazione DriveTambuShortcut.exe fallita (${r.status??r.error??'?'}).`)
 } finally {fs.rmSync(temporary,{recursive:true,force:true})}
}
function run() {
 if(process.platform!=='win32')throw new Error('La compilazione nativa Windows deve essere eseguita sul runner Windows.')
 const root=path.resolve(__dirname,'..'), src=path.join(root,'native','windows','DriveTambuShortcut.cpp')
 const dir=path.join(root,'resources','native','win32-x64');fs.mkdirSync(dir,{recursive:true})
 const output=path.join(dir,'DriveTambuShortcut.exe')
 compileWithMsvc(findVsDevCmd(),src,output,root)
 if(!fs.existsSync(output))throw new Error('Lancio compilatore riuscito ma EXE mancante.')
 const smoke=spawnSync(output,['--self-test'],{windowsHide:true,timeout:10000})
 if(smoke.status!==0)throw new Error('Smoke test nativo del launcher Windows fallito.')
 console.log('Windows launcher built and smoke-tested:',output)
}
if(require.main===module)run()
module.exports={findVsDevCmd,compileWithMsvc}
