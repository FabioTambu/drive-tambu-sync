const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto')
module.exports=function(t){
 const profiles=require('../../src/main/connection-profiles.ts'),root=fs.mkdtempSync(path.join(os.tmpdir(),'dt-profile-')),remote='dt_'+crypto.randomBytes(16).toString('hex'),base=path.join(root,remote)
 fs.mkdirSync(base);fs.writeFileSync(path.join(base,'profile.json'),JSON.stringify({version:1,remote,name:'Test server',host:'example.test',mode:'existing'}));fs.writeFileSync(path.join(base,'rclone.conf'),'# test fixture\n')
 profiles.configureConnectionProfiles(root);t.after(()=>{profiles.configureConnectionProfiles(undefined);fs.rmSync(root,{recursive:true,force:true})})
 return {remote,config:path.join(base,'rclone.conf')}
}
