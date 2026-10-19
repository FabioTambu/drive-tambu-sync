const {test,afterEach}=require('node:test'),assert=require('node:assert/strict')
const {renderComponent,text,flat}=require('./helpers/ui.cjs')
const oldWindow=global.window;afterEach(()=>{if(oldWindow===undefined)delete global.window;else global.window=oldWindow})
function scheduleUI(schedule){const props={schedule,onChange:v=>{props.schedule=v}};return renderComponent('ScheduleFields',props)}
test('weekly schedule exposes chosen days and an editable exact time',()=>{
 const ui=scheduleUI({mode:'weekly',weekdays:[0],time:'02:00'})
 assert.equal(ui.byLabel('Ora del backup').props.value,'02:00')
 assert.equal(ui.button('Domenica').props['aria-pressed'],true)
 ui.button('Lunedi').props.onClick();assert.deepEqual([...ui.props.schedule.weekdays].sort(),[0,1])
 ui.byLabel('Ora del backup').props.onChange({target:{value:'03:17'}});assert.equal(ui.props.schedule.time,'03:17')
})
test('backup intervals accept arbitrary numbers instead of preset values',()=>{
 const ui=scheduleUI({mode:'interval',minutes:17})
 const input=ui.byLabel('Intervallo backup');assert.equal(input.type,'input');assert.equal(input.props.type,'number')
 input.props.onChange({target:{value:'23'}});assert.equal(ui.props.schedule.minutes,23)
 ui.byLabel('Unita intervallo backup').props.onChange({target:{value:'60'}});assert.equal(ui.props.schedule.minutes,23*60)
})
test('calendar and manual modes are selectable without overwriting folder paths',()=>{
 const ui=scheduleUI({mode:'manual'})
 ui.byLabel('Programmazione backup').props.onChange({target:{value:'weekly'}})
 assert.equal(ui.props.schedule.mode,'weekly');assert.equal(ui.props.schedule.time,'02:00');assert.deepEqual(ui.props.schedule.weekdays,[0])
 ui.byLabel('Programmazione backup').props.onChange({target:{value:'manual'}});assert.equal(ui.props.schedule.mode,'manual')
})
const m={id:'folder-123',name:'Files',remote:'casa',remotePath:'/files',localPath:'/home/me/Files',autoConnect:false,backup:{enabled:true,intervalMinutes:0,schedule:{mode:'weekly',weekdays:[0],time:'02:00'},destination:'/backup',retentionDays:30}}
const noop=()=>{}
test('saved folder provides the Create shortcut action with its stable identifier',async()=>{
 let chosen;global.window={drive:{createShortcut:async id=>{chosen=id;return '/Desktop/Files.lnk'}}}
 const ui=renderComponent('MountModal',{original:m,remotes:['casa'],onClose:noop,onSave:noop,onDelete:noop,onSettings:noop,defaultRefreshSeconds:120})
 await ui.button('Crea collegamento...').props.onClick();assert.equal(chosen,m.id);assert.ok(text(ui.render()).includes('Collegamento creato'))
})
test('per-folder refresh can opt out of the general interval and be saved',async()=>{
 let saved;const ui=renderComponent('MountModal',{original:m,remotes:['casa'],onClose:noop,onSave:async v=>{saved=v},onDelete:noop,onSettings:noop,defaultRefreshSeconds:120})
 ui.byLabel('Usa l\'intervallo generale').props.onClick()
 ui.byLabel('Intervallo aggiornamento cartella').props.onChange({target:{value:'3'}})
 ui.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await new Promise(r=>setImmediate(r))
 assert.equal(saved.directoryRefreshSeconds,180)
 assert.equal(saved.backup.schedule.mode,'weekly')
})
test('global refresh has an editable value and saves without altering other settings',async()=>{
 const settings={rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'dark',defaultRemote:'casa',directoryRefreshSeconds:120,startAtLogin:false,closeToTray:true};let saved
 const ui=renderComponent('SettingsPage',{snapshot:{settings,mounts:[],platform:'linux'},deps:{remotes:['casa'],rclone:{ok:true}},onSave:async s=>{saved=s},onCheck:noop,busy:false})
 ui.byLabel('Intervallo aggiornamento generale').props.onChange({target:{value:'3'}})
 await ui.button('Salva intervallo').props.onClick()
 assert.equal(saved.directoryRefreshSeconds,180);assert.equal(saved.theme,'dark')
})
test('backup card displays an actual percentage with an accessible progress bar',()=>{
 const ui=renderComponent('MountCard',{m:{...m,status:'connected',backupStatus:'running',backupProgress:{phase:'copying',percent:42,bytes:420,totalBytes:1000,speed:20,checks:12,transfers:1}},busy:false,onEdit:noop,onOpen:noop,onToggle:noop,onBackup:noop,onOpenBackup:noop})
 assert.ok(text(ui.render()).includes('42%'))
 assert.equal(ui.find(n=>n.props?.role==='progressbar').props['aria-valuenow'],42)
})
test('backup checking has activity counters but no made-up percentage',()=>{
 const ui=renderComponent('MountCard',{m:{...m,status:'connected',backupStatus:'running',backupProgress:{phase:'checking',percent:null,bytes:0,totalBytes:0,speed:0,checks:123,transfers:0}},busy:false,onEdit:noop,onOpen:noop,onToggle:noop,onBackup:noop,onOpenBackup:noop})
 assert.ok(text(ui.render()).includes('123'));assert.ok(!text(ui.render()).includes('%'))
})
test('a failed settings save does not report a successful interval update',async()=>{
 const settings={rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'dark',defaultRemote:'casa',directoryRefreshSeconds:120,startAtLogin:false,closeToTray:true}
 const ui=renderComponent('SettingsPage',{snapshot:{settings,mounts:[],platform:'linux'},deps:{remotes:['casa'],rclone:{ok:true}},onSave:async()=>{throw new Error('Impossibile salvare')},onCheck:noop,busy:false})
 await ui.button('Salva intervallo').props.onClick()
 assert.ok(text(ui.render()).includes('Impossibile salvare'));assert.ok(!text(ui.render()).includes('Intervallo salvato.'))
})

test('editing an unchanged schedule displays its saved appointment, not a new interval from now',()=>{
 const next=new Date(2031,0,12,2,17).toISOString()
 const original={...m,nextBackupAt:next,backup:{...m.backup,intervalMinutes:17,schedule:{mode:'interval',minutes:17}}}
 const ui=renderComponent('MountModal',{original,remotes:['casa'],onClose:noop,onSave:noop,onDelete:noop,onSettings:noop,defaultRefreshSeconds:120})
 const expected=new Date(next).toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'})
 assert.ok(text(ui.render()).includes(expected))
})
test('managed connection names are shown in folder setup instead of opaque identifiers',()=>{
 const id='dt_'+'c'.repeat(32),r=renderComponent('MountModal',{original:{...m,remote:id},remotes:[id],remoteLabels:{[id]:'My home'},onClose(){},onSave:async()=>{},onDelete:async()=>true,onSettings(){}})
 assert.match(text(r.render()),/My home/)
})
