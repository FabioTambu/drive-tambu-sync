const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const ready={platform:'linux',canInstall:false,installationNote:'Native authorization',components:['rclone','ssh','filesystem','cloudflared'].map(id=>({id,name:id,state:'ready',detail:'Ready',installable:false}))}
function ui(){assert.ok(fs.existsSync(path.join(__dirname,'../src/renderer/src/SetupWizard.tsx')),'setup wizard is implemented');return require('./helpers/ui.cjs')}
test('setup UI accepts structured SSH fields, verifies a fingerprint and only then saves',async()=>{
 const {renderComponent,text}=ui();let draft,saved,closed=false
 global.window={drive:{setupReport:async()=>ready,prepareConnection:async d=>{draft=d;return {token:'opaque',name:d.name,host:d.host,fingerprints:['ssh-ed25519 SHA256:verified'],expiresAt:Date.now()+60000}},saveConnection:async(token,confirmed)=>{assert.equal(token,'opaque');assert.equal(confirmed,true);saved=true;return {remote:'dt_remote'}},cancelConnection:async()=>{}}}
 const r=renderComponent('SetupWizard',{onClose:()=>{closed=true},onSaved:()=>{}})
 await r.button('Controlla componenti').props.onClick()
 r.byLabel('Nome connessione').props.onChange({target:{value:'Casa'}});r.byLabel('Indirizzo del server').props.onChange({target:{value:'ssh.example'}})
 r.byLabel('Tipo di connessione').props.onChange({target:{value:'direct'}});r.byLabel('Utente SSH').props.onChange({target:{value:'fabio'}})
 await r.find(n=>n.type==='form').props.onSubmit({preventDefault(){}})
 assert.equal(draft.host,'ssh.example');assert.equal(draft.user,'fabio');assert.equal(r.button('Salva connessione').props.disabled,true)
 assert.match(text(r.render()),/SHA256:verified/)
 r.byLabel('Confermo l\'identita del server').props.onChange({target:{checked:true}})
 await r.button('Salva connessione').props.onClick();assert.equal(saved,true);assert.equal(closed,false)
})
test('failed dependency installation never reports completion and allows retry',async()=>{
 const {renderComponent,text}=ui();global.window={drive:{setupReport:async()=>({...ready,canInstall:true}),installComponents:async()=>{throw new Error('Autorizzazione negata')}}}
 const r=renderComponent('SetupWizard',{onClose(){},onSaved(){}});await r.button('Controlla componenti').props.onClick();await r.button('Installa componenti mancanti').props.onClick()
 assert.match(text(r.render()),/Autorizzazione negata/);assert.equal(r.button('Installa componenti mancanti').props.disabled,false)
})
test('editing verified connection data discards the old fingerprint token',async()=>{
 const {renderComponent}=ui();let cancelled
 global.window={drive:{setupReport:async()=>ready,prepareConnection:async()=>({token:'old',name:'Casa',host:'host',fingerprints:['fp'],expiresAt:Date.now()+60000}),cancelConnection:async token=>{cancelled=token}}}
 const r=renderComponent('SetupWizard',{onClose(){},onSaved(){}});await r.button('Controlla componenti').props.onClick();await r.find(n=>n.type==='form').props.onSubmit({preventDefault(){}})
 await r.button('Modifica dati').props.onClick();assert.equal(cancelled,'old');assert.throws(()=>r.button('Salva connessione'))
})
