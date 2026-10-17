const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path')
const filename = path.join(__dirname, '../src/shared/schedule.ts')
function api() { assert.ok(fs.existsSync(filename), 'Backup scheduling implementation exists'); return require(filename) }
const weekly = {mode: 'weekly', weekdays: [0], time: '02:00'}
const backup = schedule => ({enabled: true, intervalMinutes: 60, schedule, destination: '', retentionDays: 30})
const local = (y, mo, d, h=0, m=0) => new Date(y, mo-1, d, h, m)

test('Sunday 02:00 is the next occurrence, not an interval from application startup', () => {
  const {nextScheduledAt} = api()
  assert.equal(nextScheduledAt(weekly, local(2026,10,17,21)), local(2026,10,18,2).toISOString())
})
test('a weekly run after Sunday 02:00 advances to the next Sunday', () => {
  assert.equal(api().nextScheduledAt(weekly, local(2026,10,18,2)), local(2026,10,25,2).toISOString())
})
test('multiple weekdays select the next matching local day', () => {
  assert.equal(api().nextScheduledAt({...weekly, weekdays: [1,3,5]}, local(2026,10,19,3)), local(2026,10,21,2).toISOString())
})
test('daily time remains fixed independently of when a backup finished', () => {
  assert.equal(api().nextScheduledAt({mode:'daily',time:'04:35'},local(2026,12,31,5)),local(2027,1,1,4,35).toISOString())
})
test('intervals support arbitrary positive minutes, including one minute', () => {
  const now=local(2026,10,17,21)
  assert.equal(api().nextScheduledAt({mode:'interval',minutes:17}, now),new Date(+now+17*60000).toISOString())
  assert.equal(api().nextScheduledAt({mode:'interval',minutes:1}, now),new Date(+now+60000).toISOString())
})
test('manual schedule has no automatic next occurrence', () => {
  assert.equal(api().nextScheduledAt({mode:'manual'},new Date()),undefined)
})
test('legacy interval and manual configurations are preserved', () => {
  assert.deepEqual(api().scheduleOf({intervalMinutes:17}), {mode:'interval',minutes:17})
  assert.deepEqual(api().scheduleOf({intervalMinutes:0}), {mode:'manual'})
})
test('invalid schedules and empty weekdays are rejected', () => {
  const {validateSchedule}=api()
  for (const value of [null,{}, {mode:'weekly',weekdays:[],time:'02:00'}, {...weekly,time:'24:00'}, {...weekly,weekdays:[7]}, {mode:'interval',minutes:0}, {mode:'interval',minutes:NaN}, {mode:'interval',minutes:1.2}, {mode:'other'}]) assert.throws(()=>validateSchedule(value),/backup|giorn|ora|intervallo|programma/i)
})
test('duplicated weekdays are canonicalized for stable persistence', () => {
  assert.deepEqual(api().validateSchedule({...weekly,weekdays:[3,0,3]}),{mode:'weekly',weekdays:[0,3],time:'02:00'})
})
test('overdue weekly schedule is eligible once, without replaying missed weeks', () => {
  const now=local(2026,11,15,9)
  const m={backup:backup(weekly),nextBackupAt:local(2026,10,18,2).toISOString()}
  assert.equal(api().isBackupDue(m,now),true)
  m.nextBackupAt=api().nextScheduledAt(weekly,now)
  assert.equal(api().isBackupDue(m,now),false)
  assert.equal(m.nextBackupAt,local(2026,11,22,2).toISOString())
})
test('failed jobs have a retry delay, but successful one-minute jobs do not wait ten minutes',()=>{
  const now=local(2026,10,18,2,5), m={backup:backup(weekly),nextBackupAt:local(2026,10,18,2).toISOString(),lastBackupAttemptAt:local(2026,10,18,2,4).toISOString()}
  assert.equal(api().isBackupDue(m,now),false)
  assert.equal(api().isBackupDue(m,local(2026,10,18,2,14)),true)
  m.lastBackupAt=m.lastBackupAttemptAt
  assert.equal(api().isBackupDue(m,now),true)
})
test('disabled/manual backups never run just because an old due date exists',()=>{
  const m={backup:backup({mode:'manual'}),nextBackupAt:'2000-01-01T00:00:00Z'}
  assert.equal(api().isBackupDue(m,new Date()),false)
  m.backup={...backup(weekly),enabled:false}
  assert.equal(api().isBackupDue(m,new Date()),false)
})
test('Europe/Rome skipped 02:00 executes once at 03:00; repeated 02:00 executes only once',()=>{
  const before=process.env.TZ; process.env.TZ='Europe/Rome'
  try {
    const {nextScheduledAt}=api()
    const spring=nextScheduledAt(weekly,local(2027,3,27,20))
    assert.equal(spring,local(2027,3,28,3).toISOString())
    const fall=nextScheduledAt(weekly,local(2026,10,24,20))
    assert.equal(new Date(fall).getHours(),2)
    // Finishing the first 02:00 must not schedule another run in the repeated hour.
    const next=nextScheduledAt(weekly,new Date(Date.parse(fall)+5*60000))
    assert.equal(new Date(next).getDate(),1)
    assert.equal(new Date(next).getMonth(),10)
  } finally { if(before===undefined) delete process.env.TZ; else process.env.TZ=before }
})
