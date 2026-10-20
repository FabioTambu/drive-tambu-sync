const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const root=path.resolve(__dirname,'..')
const msvc='C:\\Program Files\\Microsoft Visual Studio\\18\\Enterprise\\Common7\\Tools\\VsDevCmd.bat'
const source='D:\\a\\drive tambu\\native\\windows\\DriveTambuShortcut.cpp'
const output='D:\\a\\drive tambu\\resources\\native\\win32-x64\\DriveTambuShortcut.exe'

test('Windows launcher build invokes a temporary command file instead of an inline cmd /s /c string',()=>{
 const {compileWithMsvc}=require('../scripts/build-native-win.cjs')
 let called=false, tempScript
 compileWithMsvc(msvc,source,output,root,(exe,args,options)=>{
   called=true
   assert.equal(exe,'cmd.exe')
   assert.deepEqual(args.slice(0,2),['/d','/c'])
   assert.equal(args.length,3,'the Windows shell receives only a script path, never a nested quoted command')
   assert.ok(args[2].endsWith('.cmd'))
   assert.ok(fs.existsSync(args[2]))
   tempScript=args[2]
   const batch=fs.readFileSync(tempScript,'utf8')
   assert.match(batch,/^@echo off\r?\n/)
   assert.ok(batch.includes(`call "${msvc}" -no_logo -arch=amd64 >nul`))
   assert.ok(batch.includes(`"${source}"`))
   assert.ok(batch.includes(`/Fe:"${output}"`))
   assert.match(batch,/if errorlevel 1 exit \/b 1/)
   assert.equal(options.cwd,root)
   return {status:0}
 })
 assert.equal(called,true)
 assert.equal(fs.existsSync(tempScript),false,'temporary build script must be removed')
})

test('Windows launcher build propagates MSVC failure without using a partially built executable',()=>{
 const {compileWithMsvc}=require('../scripts/build-native-win.cjs')
 let script
 assert.throws(()=>compileWithMsvc(msvc,source,output,root,(_exe,args)=>{
   script=args[2]
   return {status:1}
 }),/Compilazione DriveTambuShortcut\.exe fallita/)
 assert.equal(fs.existsSync(script),false,'cleanup also runs after compilation fails')
})
