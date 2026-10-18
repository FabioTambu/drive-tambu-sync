const {test}=require('node:test'),assert=require('node:assert/strict')
const {renderComponent,text,flat}=require('./helpers/ui.cjs')
const {randomUUID}=require('node:crypto');global.crypto??={randomUUID}
function view(phase){let answers=[];const ui=renderComponent('OperationDialog',{operation:{id:'op-123',kind:'quit',phase,message:phase==='blocked'?'File da inviare':'Non risultano trasferimenti in corso.'},onReply:reply=>{answers.push(reply)}});return {ui,answers}}
test('favorable observation still shows residual risk and asks for confirmation',async()=>{const {ui,answers}=view('confirm');const body=text(ui.render());assert.match(body,/salva e chiudi/i);assert.doesNotMatch(body,/tutto al sicuro/i);await ui.button('Esci da Drive Tambu').props.onClick();assert.deepEqual(answers,['confirm'])})
test('blocked observation has no force-exit and keeps background and retry available',async()=>{const {ui,answers}=view('blocked');const labels=flat(ui.render()).filter(n=>n.type==='button').map(n=>text(n.children));assert.ok(!labels.includes('Esci da Drive Tambu'));assert.doesNotMatch(labels.join(' '),/comunque/i);await ui.button('Continua in background').props.onClick();assert.deepEqual(answers,['background']);assert.ok(ui.button('Riprova'))})
test('a path-change warning shows old and new locations',()=>{const ui=renderComponent('OperationDialog',{operation:{id:'op-123',kind:'move',phase:'confirm',message:'',from:'OLD',to:'NEW',name:'Docs'},onReply:()=>{}});assert.match(text(ui.render()),/OLD/);assert.match(text(ui.render()),/NEW/)})
test('connected existing folder can edit only local position, not server address',()=>{
 const m={id:'folder-123',name:'Docs',remote:'casa',remotePath:'/docs',localPath:'/tmp/docs',status:'connected',autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}
 const ui=renderComponent('MountModal',{original:m,remotes:['casa'],onClose:()=>{},onSave:async()=>{},onDelete:async()=>true,onSettings:()=>{}})
 assert.equal(ui.byLabel('Cartella sul computer').props.disabled,false);assert.equal(ui.byLabel('Cartella sul server').props.disabled,true)
})
test('an errored but live component still offers disconnection instead of another connect',()=>{
 const m={id:'folder-123',name:'Docs',remote:'casa',remotePath:'/docs',localPath:'/tmp/docs',status:'error',statusDetail:'Temporary failure',hasRuntime:true,autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}
 const ui=renderComponent('MountCard',{m,busy:false,onEdit:()=>{},onOpen:()=>{},onToggle:()=>{},onBackup:()=>{},onOpenBackup:()=>{}})
 assert.ok(ui.button('Scollega'))
})
test('blocked dialog does not claim all folders remain mounted after a partial failure',()=>{
 const {ui}=view('blocked');assert.doesNotMatch(text(ui.render()),/Il collegamento resta attivo\./)
})
