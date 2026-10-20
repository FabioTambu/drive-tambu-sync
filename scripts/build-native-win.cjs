// Called only in dist:win on the Windows GitHub Actions runner with Visual Studio Build Tools.
const {execFileSync,spawnSync}=require('node:child_process')
const fs=require('node:fs'),path=require('node:path')
function findVsDevCmd() {
 const where=process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
 const vswhere=path.join(where,'Microsoft Visual Studio','Installer','vswhere.exe')
 const installation=execFileSync(vswhere,['-latest','-products','*','-requires','Microsoft.VisualStudio.Component.VC.Tools.x86.x64','-property','installationPath'],{encoding:'utf8'}).trim()
 if(!installation)throw new Error('Visual Studio C++ Build Tools non trovato sul runner Windows.')
 const cmd=path.join(installation,'Common7','Tools','VsDevCmd.bat')
 if(!fs.existsSync(cmd))throw new Error('VsDevCmd.bat non trovato nel toolchain MSVC.')
 return cmd
}
function run() {
 if(process.platform!=='win32')throw new Error('La compilazione nativa Windows deve essere eseguita sul runner Windows.')
 const root=path.resolve(__dirname,'..'), src=path.join(root,'native','windows','DriveTambuShortcut.cpp')
 const dir=path.join(root,'resources','native','win32-x64');fs.mkdirSync(dir,{recursive:true})
 const output=path.join(dir,'DriveTambuShortcut.exe')
 const dev=findVsDevCmd()
 const cmd=`call "${dev}" -no_logo -arch=amd64 >nul && cl /nologo /std:c++17 /EHsc /O2 /MT /W4 /DUNICODE /D_UNICODE "${src}" /Fe:"${output}" /link /SUBSYSTEM:WINDOWS advapi32.lib shell32.lib`
 const r=spawnSync('cmd.exe',['/d','/s','/c',cmd],{cwd:root,stdio:'inherit',windowsHide:true})
 if(r.status!==0)throw new Error(`Compilazione DriveTambuShortcut.exe fallita (${r.status||r.error||'?'}).`)
 if(!fs.existsSync(output))throw new Error('Lancio compilatore riuscito ma EXE mancante.')
 const smoke=spawnSync(output,['--self-test'],{windowsHide:true,timeout:10000})
 if(smoke.status!==0)throw new Error('Smoke test nativo del launcher Windows fallito.')
 console.log('Windows launcher built and smoke-tested:',output)
}
if(require.main===module)run()
module.exports={findVsDevCmd}
