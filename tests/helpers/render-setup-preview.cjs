// Local visual QA only: serializes component output with native IPC mocked.
// This is not a packaged Electron or real React-effects test.
const fs=require('node:fs'),path=require('node:path')
const {renderComponent}=require('./ui.cjs')
const state={platform:'linux',canInstall:true,installationNote:'Il sistema chiedera la tua autorizzazione; Drive Tambu non raccoglie password amministrative.',components:[
 {id:'rclone',name:'rclone',state:'ready',detail:'rclone v1.74.4',installable:false},
 {id:'ssh',name:'OpenSSH',state:'ready',detail:'OpenSSH disponibile',installable:false},
 {id:'cloudflared',name:'Cloudflare Tunnel',state:'ready',detail:'cloudflared 2026.10.1',installable:false,optional:true},
 {id:'filesystem',name:'FUSE 3',state:'missing',detail:'Componente di montaggio non trovato.',installable:true}]}
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
function html(nodes){return nodes.map(n=>{
 if(typeof n!=='object')return escape(n)
 if(n.type==='fragment')return html(n.children||[])
 if(n.type==='svg')n.props={...n.props,width:n.props.size||24,height:n.props.size||24}
 const attrs=Object.entries(n.props||{}).flatMap(([key,value])=>{
  if(key==='children'||key==='ref'||key==='key'||key.startsWith('on')||value===undefined||value===null||value===false)return []
  const name=key==='className'?'class':key==='readOnly'?'readonly':key==='autoCapitalize'?'autocapitalize':key
  if(typeof value==='boolean')return name
  if(typeof value==='object')return []
  return `${name}="${escape(value)}"`
 }).join(' ')
 const start=`<${n.type} ${attrs}>`;if(['input','br','hr','img'].includes(n.type))return start
 return start+html(n.children||[])+`</${n.type}>`
}).join('')}
async function main(){
 global.window={drive:{setupReport:async()=>state,prepareConnection:async d=>({token:'qa',name:d.name,host:d.host,expiresAt:Date.now()+600000,fingerprints:['ssh-ed25519 SHA256:wHGPrlgBYem40bylhAC1RGvqGQhPN/uNjtwROICFWKM']}),cancelConnection:async()=>{}}}
 const r=renderComponent('SetupWizard',{onClose(){},onSaved(){}});await r.button('Controlla componenti').props.onClick()
 const css=fs.readFileSync(path.join(__dirname,'../../src/renderer/src/styles.css'),'utf8'),base=process.argv[2]
 function save(name){fs.writeFileSync(path.join(base,name+'.html'),'<!doctype html><html lang="it" data-theme="light"><meta charset="utf-8"><title>Setup visual QA</title><style>'+css+'</style><body>'+html(r.render())+'</body></html>')}
 save('setup-form');r.byLabel('Nome connessione').props.onChange({target:{value:'Casa'}});r.byLabel('Indirizzo del server').props.onChange({target:{value:'server.example.com'}})
 await r.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});save('setup-trust')
}
main().catch(e=>{console.error(e);process.exitCode=1})
