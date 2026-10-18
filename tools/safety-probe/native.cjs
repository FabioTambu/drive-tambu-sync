// Characterization, not a certified safe-close implementation.
const fs=require('node:fs/promises')
const path=require('node:path')
const os=require('node:os')
const crypto=require('node:crypto')
const assert=require('node:assert/strict')
const {assertHostedRunner,reportFor,sha256,summarizeStats,waitFor,isolatedEnv}=require('./support.cjs')
const {StorageFixture,runTool}=require('./fixture.cjs')

async function main(){
  const report=reportFor(process.platform)
  const output=path.join(process.cwd(),'.safety-probe-results',`${process.platform}.json`)
  await fs.mkdir(path.dirname(output),{recursive:true})
  const save=()=>fs.writeFile(output,JSON.stringify(report,null,2)+'\n')
  let active=null
  try{
    assertHostedRunner()
    assert.ok(['win32','linux'].includes(process.platform),'Only Windows and Linux are covered')
    report.status='running';report.osRelease=os.release();report.commit=process.env.GITHUB_SHA||null
    report.runnerImage={os:process.env.ImageOS||null,version:process.env.ImageVersion||null}
    await save()
    const executable=process.env.SAFETY_RCLONE
    assert.ok(executable&&path.isAbsolute(executable),'SAFETY_RCLONE must be the pinned absolute executable installed by CI')
    report.rclone={sha256:sha256(await fs.readFile(executable)),version:await runTool(executable,['version','--config',process.platform==='win32'?'NUL':'/dev/null'],{env:isolatedEnv(process.env,process.env.RUNNER_TEMP)})}
    if(process.platform==='linux'){
      const stat=await fs.stat('/dev/fuse');assert.equal(stat.isCharacterDevice(),true,'/dev/fuse missing')
      report.driver={name:'FUSE',version:await runTool('fusermount3',['--version'])}
    }else{
      report.driver={name:'WinFsp',version:process.env.WINFSP_DLL_VERSION||'unknown',installerExit:process.env.WINFSP_MSI_EXIT||null,installerSha256:process.env.WINFSP_INSTALLER_SHA256||null}
      assert.ok(report.driver.installerSha256,'WinFsp installation was not recorded')
    }
    const record=async(name,fn)=>{
      const item={name,status:'running'};report.scenarios.push(item);await save()
      try{
        active=await StorageFixture.create(executable,process.env.RUNNER_TEMP)
        await active.startDaemon()
        await fn(active,item)
        item.status='completed'
      }catch(e){item.status='failed';item.error=active?active.sanitize(e.message):'Fixture setup failed: '+e.message;throw new Error(item.error)}
      finally{if(active)await active.dispose();active=null;await save()}
    }
    await record('basic-SFTP-mount-write-read',async(f,item)=>{
      await f.mount(1)
      const bytes=crypto.randomBytes(65536),hash=sha256(bytes)
      await f.writer.call('open',{name:'roundtrip.bin',hex:bytes.toString('hex')});await f.writer.call('close')
      await f.waitHash('roundtrip.bin',hash)
      item.bytes=bytes.length;item.expectedSha256=hash;item.remoteSha256=await f.remoteHash('roundtrip.bin')
      assert.equal(item.remoteSha256,hash)
    })
    await record('open-writer-during-stock-unmount',async(f,item)=>{
      await f.mount(3600)
      const bytes=crypto.randomBytes(32768)
      await f.writer.call('open',{name:'held.bin',hex:bytes.toString('hex')})
      item.initialBytesAcknowledged=bytes.length;item.initialSha256=sha256(bytes)
      item.observedBeforeUnmount=summarizeStats(await f.stats())
      item.note='An acknowledged local fsync and an empty upload queue are not a write-barrier receipt.'
      try{await f.unmount();item.unmountWithOpenWriter='accepted'}catch(e){item.unmountWithOpenWriter='refused-or-timeout';item.unmountDetail=f.sanitize(e.message)}
      try{await f.writer.call('append',{hex:Buffer.from('after-unmount-request').toString('hex')});item.existingHandleWriteAfterRequest='acknowledged'}
      catch(e){item.existingHandleWriteAfterRequest='rejected-or-timeout';item.writeDetail=f.sanitize(e.message)}
      item.productionSafetyCertified=false
      // This case OBSERVES the stock backend. Both refusal and acceptance are useful
      // evidence; neither alone satisfies the production safety acceptance test.
    })
    await record('closed-pending-file-recovery-after-daemon-restart',async(f,item)=>{
      await f.mount(3600)
      const bytes=crypto.randomBytes(131072),expected=sha256(bytes)
      await f.writer.call('open',{name:'pending.bin',hex:bytes.toString('hex')});await f.writer.call('close')
      item.before=await waitFor(async()=>{const s=summarizeStats(await f.stats());return s.kind==='known'&&s.queued>0?s:false},15000,'Closed file queued for delayed upload')
      assert.notEqual(await f.remoteHash('pending.bin'),expected,'Fixture failed to create a genuinely pending file')
      await f.stopServer();item.serverStoppedBeforeUnmount=true
      await f.unmount();await f.writer.dispose();f.writer=null;await f.quitDaemon()
      item.remoteSha256WhileOffline=await f.remoteHash('pending.bin')
      assert.notEqual(item.remoteSha256WhileOffline,expected)
      await f.startServer();await f.startDaemon();await f.mount(3600)
      const queue=await f.call('vfs/queue')
      assert.ok(Array.isArray(queue.queue),'Missing recovered queue')
      for(const entry of queue.queue){
        assert.ok(Number.isSafeInteger(entry.id))
        await f.call('vfs/queue-set-expiry',{id:entry.id,expiry:-1})
      }
      await f.waitHash('pending.bin',expected)
      item.bytes=bytes.length;item.expectedSha256=expected;item.remoteSha256=await f.remoteHash('pending.bin')
      assert.equal(item.remoteSha256,expected)
      item.note='One COMPLETE CLOSED synthetic file after a controlled daemon restart; NOT sparse-file, crash, conflict or general recovery certification.'
    })
    report.status='completed';report.finishedAt=new Date().toISOString()
  }catch(e){report.status='blocked-or-failed';report.error=active?active.sanitize(e.message):e.message;process.exitCode=1}
  finally{if(active)await active.dispose();await save();console.log(JSON.stringify({status:report.status,report:output,productionSafetyCertified:false},null,2))}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1})
module.exports={main}
