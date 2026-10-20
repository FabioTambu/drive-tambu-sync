// Compile is checked by electron-builder in Windows CI; these assert the deletion/exit policy.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const root=path.resolve(__dirname,'..');const script=()=>fs.existsSync(path.join(root,'build/installer.nsh'))?fs.readFileSync(path.join(root,'build/installer.nsh'),'utf8'):''
test('NSIS customization is wired to the existing assisted installer',()=>{const p=require('../package.json');assert.equal(p.build.nsis.include,'build/installer.nsh');assert.equal(p.build.nsis.oneClick,false);assert.notEqual(p.build.nsis.deleteAppDataOnUninstall,true)})
test('uninstaller offers an unchecked reset option only outside silent updates',()=>{const s=script();assert.match(s,/NSD_CreateCheckbox/);assert.match(s,/NSD_Uncheck/);assert.match(s,/\$\{Silent\}/);assert.match(s,/\$\{isUpdated\}/);assert.match(s,/Elimina impostazioni/);assert.match(s,/HKCU.*INSTALL_REGISTRY_KEY/s)})
test('installer asks app to quit and never invokes built-in force-stop fallback',()=>{const s=script();assert.match(s,/!macro customCheckAppRunning/);assert.match(s,/--request-exit/);assert.doesNotMatch(s,/taskkill|KillProcess|_CHECK_APP_RUNNING/);assert.match(s,/SetErrorLevel 2/);assert.match(s,/FindProcess/)})
test('reset deletes only configuration file allowlist, never directories or cache',()=>{const s=script();assert.match(s,/config\.json\.before-0\.3\.bak/);assert.doesNotMatch(s,/RMDir|Delete\s+[^\n]*\*/i);assert.match(s,/--delete-app-data/);assert.match(s,/REPARSE_POINT/);assert.doesNotMatch(s,/Delete\s+[^\n]*(rclone|known_hosts|cache)/i)})
test('current-user eligibility matches the stock NSIS CurrentUser installMode',()=>{
 assert.match(script(),/\$installMode == "CurrentUser"/)
})
test('custom page functions expand after the stock MUI interface is declared',()=>{
 const s=script();const header=s.indexOf('!macro customHeader');assert.ok(header>=0)
 assert.ok(s.indexOf('Function un.DriveSettingsPage')>header)
 assert.ok(s.indexOf('!insertmacro MUI_HEADER_TEXT')>header)
})
