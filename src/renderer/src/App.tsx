import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowLeft, ArrowUpRight, Check, ChevronRight, CircleAlert, CircleCheck,
  Cloud, Clock3, Link2, DatabaseBackup, Folder, FolderOpen, HardDrive, Home, Laptop, LayoutGrid,
  LoaderCircle, LogOut, Maximize2, Minimize2, Minus, Monitor, Moon, MoreHorizontal,
  Plus, RefreshCw, Search, Server, Settings2, ShieldCheck, Sun, Trash2, Unplug, X
} from 'lucide-react'
import type { AppSettings, Dependencies, MountConfig, MountView, RemoteListing, Snapshot, Theme, BackupSchedule, BackupProgress, OperationView, OperationReply } from '../../shared/types'
import { normalizeRemotePath, selectedRemote } from '../../shared/paths'
import { displayRemotePath, parseDisplayedRemotePath } from './remote-path-display'
import { nextScheduledAt, scheduleOf } from '../../shared/schedule'
import { DEFAULT_REFRESH_SECONDS } from '../../shared/refresh'

type Page = 'folders' | 'activity' | 'settings'
type Notice = { text: string; type: 'success' | 'error' } | null
const serverName = (name: string): string => name ? name[0].toUpperCase() + name.slice(1) : 'Il tuo server'
const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error)).replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '')
const newMount = (remote: string): MountConfig => ({ id: crypto.randomUUID(), name: '', remote, remotePath: '', localPath: '', autoConnect: true,
  backup: { enabled: false, intervalMinutes: 60, destination: '', retentionDays: 30 } })
const dateLabel = (value?: string): string => {
  if (!value || Number.isNaN(Date.parse(value))) return 'Nessuna copia ancora'
  return new Date(value).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
}

function Brand(): ReactNode {
  return <div className="brand"><span className="brand-icon"><Cloud size={23}/></span><div><strong>Drive Tambu</strong><span>Il tuo spazio personale</span></div></div>
}
function Button({children, onClick, kind = 'secondary', disabled = false, title, className = ''}: {
  children: ReactNode; onClick: () => void | Promise<unknown>; kind?: 'primary' | 'secondary' | 'ghost' | 'danger'; disabled?: boolean; title?: string; className?: string
}): ReactNode {
  return <button type="button" title={title} aria-label={title} disabled={disabled} className={`button button-${kind} ${className}`} onClick={onClick}>{children}</button>
}
function Toggle({checked, onChange, label, disabled}: {checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean}): ReactNode {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span/></button>
}
function Field({label, detail, children}: {label: string; detail?: string; children: ReactNode}): ReactNode {
  return <label className="field"><span className="field-label">{label}</span>{children}{detail && <span className="field-hint">{detail}</span>}</label>
}
const backupUnits = [{factor:1,label:'minuti'}, {factor:60,label:'ore'}, {factor:1440,label:'giorni'}, {factor:10080,label:'settimane'}]
const refreshUnits = [{factor:1,label:'secondi'}, {factor:60,label:'minuti'}, {factor:3600,label:'ore'}]
function DurationInput({value, onChange, label, unitLabel, units, min, max}: {
  value: number; onChange: (value: number) => void; label: string; unitLabel: string;
  units: {factor:number;label:string}[]; min:number; max:number
}): ReactNode {
  const [unit,setUnit] = useState(() => [...units].reverse().find(u => value > 0 && value % u.factor === 0)?.factor ?? 1)
  return <div className="duration-input"><input required aria-label={label} type="number" step="any" min={min / unit} max={max / unit}
    value={Number.isFinite(value) ? value / unit : ''} onChange={event => onChange(event.target.value === '' ? NaN : Number(event.target.value) * unit)}/>
    <select aria-label={unitLabel} value={unit} onChange={event => {const next=Number(event.target.value);setUnit(next);onChange((Number.isFinite(value) ? value / unit : 1) * next)}}>
      {units.map(u => <option key={u.factor} value={u.factor}>{u.label}</option>)}
    </select></div>
}
function ScheduleFields({schedule, onChange, nextRun}: {schedule: BackupSchedule; onChange: (value: BackupSchedule) => void; nextRun?: string}): ReactNode {
  const days = [{value:1,label:'Lunedi',short:'Lun'}, {value:2,label:'Martedi',short:'Mar'}, {value:3,label:'Mercoledi',short:'Mer'}, {value:4,label:'Giovedi',short:'Gio'}, {value:5,label:'Venerdi',short:'Ven'}, {value:6,label:'Sabato',short:'Sab'}, {value:0,label:'Domenica',short:'Dom'}]
  let preview = ''
  try { const next = nextRun ?? nextScheduledAt(schedule, new Date()); if (next) preview = dateLabel(next) } catch { /* The save operation reports invalid input. */ }
  return <div className="schedule-fields">
    <Field label="Quando eseguire il backup"><select aria-label="Programmazione backup" value={schedule.mode} onChange={event => {
      const mode = event.target.value
      onChange(mode === 'interval' ? {mode,minutes:60} : mode === 'daily' ? {mode,time:'02:00'} : mode === 'weekly' ? {mode,weekdays:[0],time:'02:00'} : {mode:'manual'})
    }}><option value="manual">Solo manualmente</option><option value="interval">A intervalli regolari</option><option value="daily">Ogni giorno, a un'ora precisa</option><option value="weekly">Nei giorni della settimana scelti</option></select></Field>
    {schedule.mode === 'interval' && <Field label="Ripeti ogni" detail="Da un minuto a 365 giorni. L'intervallo riparte al termine del backup."><DurationInput label="Intervallo backup" unitLabel="Unita intervallo backup" value={schedule.minutes} onChange={minutes => onChange({mode:'interval',minutes})} units={backupUnits} min={1} max={525600}/></Field>}
    {schedule.mode === 'weekly' && <div className="field"><span className="field-label">Giorni della settimana</span><div className="weekday-options" role="group" aria-label="Giorni del backup">{days.map(day => <button key={day.value} type="button" aria-label={day.label} aria-pressed={schedule.weekdays.includes(day.value)} className={schedule.weekdays.includes(day.value) ? 'selected' : ''} onClick={() => onChange({...schedule,weekdays:schedule.weekdays.includes(day.value) ? schedule.weekdays.filter(d => d !== day.value) : [...schedule.weekdays,day.value]})}>{day.short}</button>)}</div></div>}
    {(schedule.mode === 'weekly' || schedule.mode === 'daily') && <Field label="Alle ore" detail="Ora locale di questo computer."><input required aria-label="Ora del backup" type="time" value={schedule.time} onChange={event => onChange({...schedule,time:event.target.value})}/></Field>}
    {preview && <p className="schedule-preview"><Clock3 size={15}/><span>{nextRun && Date.parse(nextRun) <= Date.now() ? 'Appuntamento da recuperare: ' : 'Prossimo appuntamento: '}<strong>{preview}</strong></span></p>}
    {schedule.mode !== 'manual' && <p className="field-hint">Il computer deve essere acceso e Drive Tambu aperto. Al successivo avvio viene recuperata una sola esecuzione saltata, senza accumulare copie arretrate.</p>}
  </div>
}
function byteLabel(bytes: number): string {
  const units = ['B','KB','MB','GB','TB']
  let n = Math.max(0, bytes), unit = 0
  while (n >= 1000 && unit < units.length - 1) { n /= 1000; unit++ }
  return `${n.toLocaleString('it-IT', {maximumFractionDigits:unit === 0 ? 0 : 1})} ${units[unit]}`
}
function BackupProgressView({progress}: {progress?: BackupProgress}): ReactNode {
  const checking = !progress || progress.phase === 'checking'
  const percent = progress?.percent
  return <div className="backup-progress" aria-live="polite">
    {percent != null ? <><div className="progress-track" role="progressbar" aria-label="Avanzamento backup stimato" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:`${percent}%`}}/></div>
      <p>{progress?.phase === 'finishing' ? 'Finalizzazione...' : `${byteLabel(progress?.bytes ?? 0)} di circa ${byteLabel(progress?.totalBytes ?? 0)}${progress?.speed ? ` - ${byteLabel(progress.speed)}/s` : ''}`}</p></>
      : <p className="progress-checking"><LoaderCircle size={14} className="spin"/>{checking ? 'Controllo dei file...' : 'Backup in corso...'} {progress?.checks ? `${progress.checks} verificati` : ''}</p>}
  </div>
}

function ErrorBox({message}: {message: string}): ReactNode {
  return message ? <div className="error-box" role="alert"><CircleAlert size={17}/><span>{message}</span></div> : null
}

function Dialog({title, subtitle, children, onClose, busy = false}: {title: string; subtitle?: string; children: ReactNode; onClose: () => void; busy?: boolean}): ReactNode {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose); closeRef.current = onClose
  const busyRef = useRef(busy); busyRef.current = busy
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>('input:not(:disabled), button:not(:disabled), select:not(:disabled)')
    first?.focus()
    const keyboard = (event: KeyboardEvent): void => {
      const dialogs = document.querySelectorAll('[role="dialog"]')
      if (dialogs[dialogs.length - 1] !== ref.current) return
      if (event.key === 'Escape' && !busyRef.current) { event.preventDefault(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const focusable = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]') ?? []).filter(el => el.offsetParent !== null)
      if (!focusable.length) { event.preventDefault(); ref.current?.focus(); return }
      const firstElement = focusable[0], lastElement = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) { event.preventDefault(); lastElement.focus() }
      else if (!event.shiftKey && document.activeElement === lastElement) { event.preventDefault(); firstElement.focus() }
    }
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [])
  return <div className="modal-scrim" onMouseDown={event => { if (!busy && event.target === event.currentTarget) onClose() }}>
    <section ref={ref} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><Button kind="ghost" title="Chiudi finestra di dialogo" disabled={busy} onClick={onClose}><X size={18}/></Button></header>
      {children}
    </section>
  </div>
}

function OperationDialog({operation, onReply}: {operation: OperationView; onReply: (reply: OperationReply) => void | Promise<unknown>}): ReactNode {
  const working = operation.phase === 'working', checking = operation.phase === 'checking', blocked = operation.phase === 'blocked'
  const action = {quit:'Esci da Drive Tambu',disconnect:'Scollega cartella',remove:'Rimuovi collegamento',move:'Conferma cambio'}[operation.kind]
  const heading = {quit:'Vuoi uscire da Drive Tambu?',disconnect:`Scollegare ${operation.name ?? 'la cartella'}?`,remove:`Rimuovere ${operation.name ?? 'il collegamento'}?`,move:'Cambiare posizione alla cartella?'}[operation.kind]
  return <Dialog title={working ? 'Un momento...' : checking ? 'Controllo dei trasferimenti' : blocked ? 'Operazione in attesa' : heading}
    subtitle={operation.name} busy={working} onClose={() => {void onReply('cancel')}}>
    <div className="modal-body operation-body">
      <div className={`operation-symbol ${blocked ? 'operation-blocked' : ''}`}>{working || checking ? <LoaderCircle className="spin" size={30}/> : <CircleAlert size={30}/>}</div>
      <p role="status" aria-live="polite">{operation.message}</p>
      {operation.phase === 'confirm' && <>
        {operation.kind === 'move' && <dl className="operation-paths"><dt>Posizione attuale</dt><dd>{operation.from}</dd><dt>Nuova posizione</dt><dd>{operation.to}</dd></dl>}
        {(operation.kind === 'remove' || operation.kind === 'move') && <p>Questa operazione non cancella i file sul server o i backup locali.</p>}
        <div className="operation-caution">Prima di continuare, salva e chiudi i documenti aperti nelle cartelle coinvolte: alcuni salvataggi potrebbero non essere ancora rilevati dall'app.</div>
      </>}
      {blocked && <p className="field-hint">L'operazione non e stata completata. Puoi riprovare, oppure nascondere la finestra e lasciare lavorare Drive Tambu.</p>}
    </div>
    <footer className="modal-foot operation-actions">
      <Button disabled={working} onClick={() => onReply('cancel')}>{blocked ? "Torna all'app" : 'Annulla'}</Button>
      {blocked && <Button onClick={() => onReply('retry')}><RefreshCw size={15}/> Riprova</Button>}
      {blocked && <Button kind="primary" className="background-action" onClick={() => onReply('background')}>Continua in background</Button>}
      {operation.phase === 'confirm' && <Button kind="primary" onClick={() => onReply('confirm')}>{action}</Button>}
    </footer>
  </Dialog>
}

function RemoteBrowser({remote, initialPath, onChoose, onClose}: {remote: string; initialPath: string; onChoose: (path: string) => void; onClose: () => void}): ReactNode {
  const [listing, setListing] = useState<RemoteListing | null>(null)
  const [input, setInput] = useState(() => displayRemotePath(initialPath))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(200)
  const request = useRef<string | null>(null)
  const load = useCallback(async (next: string): Promise<void> => {
    if (request.current) void window.drive.cancelBrowse(request.current).catch(() => {})
    const id = crypto.randomUUID(); request.current = id
    setInput(displayRemotePath(next)); setLoading(true); setError(''); setListing(null); setLimit(200); setFilter('')
    try {
      const result = await window.drive.browseRemote(remote, next, id)
      if (request.current !== id) return
      setListing(result); setInput(displayRemotePath(result.path))
    } catch (failure) { if (request.current === id) setError(messageOf(failure)) }
    finally { if (request.current === id) setLoading(false) }
  }, [remote])
  const loadInput = async (): Promise<void> => {
    try { await load(parseDisplayedRemotePath(remote, input)) }
    catch (failure) { setError(messageOf(failure)); setListing(null) }
  }
  useEffect(() => {
    void load(initialPath)
    return () => {
      const id = request.current; request.current = null
      if (id) void window.drive.cancelBrowse(id).catch(() => {})
    }
  }, [load, initialPath])
  const visible = listing?.entries.filter(item => item.name.toLocaleLowerCase('it').includes(filter.toLocaleLowerCase('it'))) ?? []
  return <Dialog title="Scegli una cartella sul server" subtitle={serverName(remote)} onClose={onClose}>
    <div className="modal-body remote-body">
      <div className="browser-toolbar">
        <Button title="Cartella personale sul server" onClick={() => load('')}><Home size={16}/> Home</Button>
        <Button title="Cartella principale del server" onClick={() => load('/')}><Server size={16}/> Root</Button>
        <Button title="Cartella superiore" disabled={!listing || listing.parent === null || loading} onClick={() => load(listing?.parent ?? '')}><ArrowLeft size={16}/> Su</Button>
      </div>
      <form className="input-with-button" onSubmit={event => { event.preventDefault(); void loadInput() }}>
        <input aria-label="Percorso da esplorare" spellCheck={false} value={input} placeholder="~/" onChange={event => setInput(event.target.value)}/>
        <button type="submit" disabled={loading}>Vai</button>
      </form>
      <ErrorBox message={error}/>
      {error && <Button onClick={loadInput}><RefreshCw size={15}/> Riprova</Button>}
      {loading && <div className="browser-loading" role="status"><LoaderCircle className="spin" size={23}/><p>Apro le cartelle del server...</p><span>Puoi annullare senza modificare alcun file.</span></div>}
      {listing && <>
        <div className="search-field"><Search size={16}/><input aria-label="Filtra cartelle del server" value={filter} onChange={event => {setFilter(event.target.value); setLimit(200)}} placeholder="Cerca in questa cartella"/></div>
        <div className="remote-list" aria-label="Cartelle sul server">
          {visible.slice(0, limit).map(item => <button type="button" key={item.path} className="remote-row" onClick={() => void load(item.path)}><Folder size={20}/><span>{item.name}</span><ChevronRight size={16}/></button>)}
          {visible.length === 0 && <div className="empty-list">{filter ? 'Nessuna cartella corrisponde alla ricerca.' : 'Nessuna sottocartella. Puoi scegliere questa posizione.'}</div>}
          {visible.length > limit && <Button onClick={() => setLimit(value => value + 200)}>Mostra altre cartelle</Button>}
        </div>
        <p className="field-hint">Vengono letti soltanto i nomi delle cartelle. I file non vengono scaricati.</p>
      </>}
    </div>
    <footer className="modal-foot"><Button onClick={onClose}>Annulla</Button><Button kind="primary" disabled={!listing || loading || !!error} onClick={() => { if (listing) onChoose(listing.path) }}><Check size={16}/> Scegli questa cartella</Button></footer>
  </Dialog>
}

function MountModal({original, remotes, onClose, onSave, onDelete, onSettings, defaultRefreshSeconds = DEFAULT_REFRESH_SECONDS}: {
  original: MountConfig; remotes: string[]; defaultRefreshSeconds?: number; platform?: string; onClose: () => void;
  onSave: (m: MountConfig) => Promise<void>; onDelete: (id: string) => Promise<boolean>; onSettings: () => void;
  notify?: (text: string, type?: 'success' | 'error') => void; apiBusy?: boolean
}): ReactNode {
  const [m, setM] = useState(() => structuredClone(original))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [browser, setBrowser] = useState(false)
  const [shortcutResult, setShortcutResult] = useState('')
  const isNew = !original.name
  const schedule = m.backup.schedule ?? (m.backup.intervalMinutes === 0 ? {mode:'manual' as const} : {mode:'interval' as const,minutes:m.backup.intervalMinutes})
  const sameSchedule = !isNew && original.backup.enabled && m.backup.enabled && JSON.stringify(schedule) === JSON.stringify(scheduleOf(original.backup))
  const status = (original as Partial<MountView>).status
  const pathLocked = status === 'connected' || status === 'connecting' || status === 'disconnecting'
  const localLocked = saving || status === 'connecting' || status === 'disconnecting'
  const patch = <K extends keyof MountConfig>(key: K, value: MountConfig[K]): void => {setM(prev => ({...prev, [key]: value})); setError('')}
  const backup = <K extends keyof MountConfig['backup']>(key: K, value: MountConfig['backup'][K]): void => setM(prev => ({...prev, backup: {...prev.backup, [key]: value}}))
  useEffect(() => { if (!m.remote && remotes.length === 1 && isNew) setM(prev => ({...prev, remote: remotes[0]})) }, [remotes, m.remote, isNew])
  const chooseLocal = async (): Promise<void> => {
    try { const value = await window.drive.chooseDirectory(m.name || 'Drive Tambu'); if (value) patch('localPath', value) }
    catch (failure) { setError(messageOf(failure)) }
  }
  const chooseBackup = async (): Promise<void> => {
    try { const value = await window.drive.chooseDirectory(); if (value) backup('destination', value) }
    catch (failure) { setError(messageOf(failure)) }
  }
  const save = async (event: FormEvent): Promise<void> => {
    event.preventDefault(); setSaving(true); setError('')
    try { await onSave({...m, remotePath: normalizeRemotePath(m.remote, m.remotePath)}) }
    catch (failure) { setError(messageOf(failure)) }
    finally { setSaving(false) }
  }
  return <>
    <Dialog title={isNew ? 'Nuova cartella' : 'Impostazioni cartella'} subtitle="Scegli cosa collegare e dove ritrovarlo." onClose={onClose} busy={saving}>
      <form onSubmit={event => void save(event)}>
        <div className="modal-body">
          <ErrorBox message={error}/>
          {remotes.length === 0 && <div className="info-box"><Server size={19}/><div><strong>Nessun server disponibile</strong><p>Apri le Impostazioni per rilevare le connessioni salvate.</p><Button onClick={onSettings}>Apri Impostazioni</Button></div></div>}
          <Field label="Nome cartella"><input required aria-label="Nome cartella" maxLength={80} placeholder="Per esempio, Documenti" value={m.name} disabled={saving} onChange={event => patch('name', event.target.value)}/></Field>
          {remotes.length > 1 ? <Field label="Server"><select required aria-label="Server" value={m.remote} disabled={saving || pathLocked} onChange={event => {patch('remote', event.target.value); patch('remotePath', '')}}><option value="" disabled>Scegli il server</option>{remotes.map(remote => <option key={remote} value={remote}>{serverName(remote)}</option>)}</select></Field>
            : m.remote && <div className="server-chip"><Server size={15}/><span>Server: <strong>{serverName(m.remote)}</strong></span></div>}
          {pathLocked && <p className="field-hint">Puoi cambiare la posizione sul computer: al salvataggio ti verra chiesta conferma. Per cambiare il percorso sul server, scollega prima la cartella.</p>}
          <Field label="Cartella sul server" detail="Usa Sfoglia oppure incolla il percorso completo. Il nome del server viene riconosciuto automaticamente.">
            <div className="input-with-button"><input aria-label="Cartella sul server" disabled={saving || pathLocked} spellCheck={false} value={m.remotePath} placeholder="Home del server" onChange={event => patch('remotePath', event.target.value)} onBlur={() => {
              if (!m.remote) return
              try { patch('remotePath', normalizeRemotePath(m.remote, m.remotePath)) } catch (failure) {setError(messageOf(failure))}
            }}/><button type="button" aria-label="Sfoglia cartelle sul server" disabled={!m.remote || saving || pathLocked} onClick={() => setBrowser(true)}><Folder size={16}/> Sfoglia</button></div>
          </Field>
          <Field label="Cartella sul computer" detail="Scegli dove farla apparire. Drive Tambu prepara un nome disponibile, senza toccare le cartelle esistenti.">
            <div className="input-with-button"><input required aria-label="Cartella sul computer" disabled={localLocked} value={m.localPath} placeholder="Scegli una posizione" onChange={event => patch('localPath', event.target.value)}/><button type="button" aria-label="Sfoglia cartelle sul computer" disabled={localLocked} onClick={() => void chooseLocal()}><Folder size={16}/> {isNew ? 'Sfoglia' : 'Cambia posizione...'}</button></div>
          </Field>
          <div className="setting-switch"><div><strong>Collega automaticamente</strong><p>La cartella torna disponibile quando apri Drive Tambu.</p></div><Toggle label="Collega automaticamente" checked={m.autoConnect} disabled={saving} onChange={value => patch('autoConnect', value)}/></div>
          <div className="refresh-preferences"><h3>Aggiornamento elenco file</h3>
            <div className="setting-switch"><div><strong>Usa l'intervallo generale</strong><p>{defaultRefreshSeconds} secondi, dalle Impostazioni.</p></div><Toggle label="Usa l'intervallo generale" checked={m.directoryRefreshSeconds == null} disabled={saving} onChange={value => patch('directoryRefreshSeconds',value ? null : defaultRefreshSeconds)}/></div>
            {m.directoryRefreshSeconds != null && <Field label="Intervallo personalizzato" detail="Da 5 secondi a 24 ore. Per un collegamento attivo, il valore cambia alla prossima riconnessione."><DurationInput label="Intervallo aggiornamento cartella" unitLabel="Unita aggiornamento cartella" value={m.directoryRefreshSeconds} onChange={v => patch('directoryRefreshSeconds',v)} units={refreshUnits} min={5} max={86400}/></Field>}
          </div>
          {!isNew && <div className="shortcut-preferences"><Button disabled={saving} onClick={async () => {
            setSaving(true);setError('');setShortcutResult('')
            try {const result = await window.drive.createShortcut(m.id);if (result) setShortcutResult(`Collegamento creato: ${result}`)} catch (failure) {setError(messageOf(failure))} finally {setSaving(false)}
          }}><Link2 size={16}/> Crea collegamento...</Button><p className="field-hint">Scegli dove salvarlo. Apre la cartella salvata nell'app e avvia il collegamento quando serve.</p>{shortcutResult && <p className="success-box" role="status">{shortcutResult}</p>}</div>}
          <div className="setting-switch"><div><strong>Backup su questo computer</strong><p>Una copia separata, con le versioni precedenti. Occupa spazio sul disco.</p></div><Toggle label="Backup su questo computer" checked={m.backup.enabled} disabled={saving} onChange={value => backup('enabled', value)}/></div>
          {m.backup.enabled && <fieldset disabled={saving} className="backup-form"><legend>Preferenze del backup</legend>
            <ScheduleFields schedule={schedule} nextRun={sameSchedule ? original.nextBackupAt : undefined} onChange={schedule => {backup('schedule',schedule);backup('intervalMinutes',schedule.mode === 'interval' ? schedule.minutes : 0)}}/>
            <Field label="Dove salvare la copia" detail="Scegli una cartella dedicata e vuota, separata dalle cartelle collegate."><div className="input-with-button"><input required aria-label="Destinazione backup" value={m.backup.destination} onChange={event => backup('destination', event.target.value)} placeholder="Scegli una cartella per il backup"/><button type="button" onClick={() => void chooseBackup()}><Folder size={16}/> Sfoglia</button></div></Field>
            <Field label="Conserva le versioni precedenti per" detail="Numero di giorni. Con 0 le versioni non vengono eliminate automaticamente."><input aria-label="Giorni conservazione backup" type="number" required min={0} max={36500} value={m.backup.retentionDays} onChange={event => backup('retentionDays', Number(event.target.value))}/></Field>
            <p className="field-hint">Il backup copia dal server al computer, mai al contrario. Funziona mentre Drive Tambu e aperto.</p>
          </fieldset>}
        </div>
        <footer className="modal-foot"><div className="foot-spacer">{!isNew && <Button kind="ghost" disabled={saving} onClick={async () => {setSaving(true); setError(''); try {await onDelete(m.id)} catch (failure) {setError(messageOf(failure))} finally {setSaving(false)}}}><Trash2 size={16}/><span className="hide-narrow">Rimuovi</span></Button>}</div><Button onClick={onClose} disabled={saving}>Annulla</Button><button type="submit" className="button button-primary" disabled={saving || !m.remote || remotes.length === 0}>{saving ? <LoaderCircle className="spin" size={16}/> : <Check size={16}/>} {saving ? 'Verifico e salvo...' : 'Salva cartella'}</button></footer>
      </form>
    </Dialog>
    {browser && <RemoteBrowser remote={m.remote} initialPath={m.remotePath} onClose={() => setBrowser(false)} onChoose={value => {patch('remotePath', value); setBrowser(false)}}/>}
  </>
}

function MountCard({m, busy, onEdit, onOpen, onToggle, onBackup, onOpenBackup}: {m: MountView; busy: boolean; onEdit: () => void; onOpen: () => void; onToggle: () => void; onBackup: () => void; onOpenBackup: () => void}): ReactNode {
  const connected = m.status === 'connected', connecting = m.status === 'connecting', stopping = m.status === 'disconnecting'
  const disconnectable = connected || !!m.hasRuntime
  const label = {connected: 'Collegata', connecting: 'Collegamento...', disconnected: 'Scollegata', disconnecting: 'Disconnessione...', error: 'Da verificare'}[m.status]
  return <article className="mount-card">
    <div className="mount-top"><span className="folder-icon"><Folder size={25}/></span><div className="mount-heading"><h3>{m.name}</h3><span className={`status status-${m.status}`}><i/>{label}</span></div><Button title={`Impostazioni ${m.name}`} kind="ghost" onClick={onEdit}><MoreHorizontal size={20}/></Button></div>
    <div className="location-row"><Laptop size={14}/><span title={m.localPath}>{m.localPath}</span></div>
    {connecting && <p className="mount-detail" role="status">{m.statusDetail}</p>}
    {m.status === 'error' && <ErrorBox message={m.statusDetail}/>}
    {m.backupStatus === 'error' && <ErrorBox message="Il backup non e stato completato. Apri Attivita per i dettagli."/>}
    <div className="mount-bottom"><div className="backup-caption"><DatabaseBackup size={14}/><span>{m.backupStatus === 'running' ? `Backup in corso${m.backupProgress?.percent != null ? ` - ${m.backupProgress.percent}% (stima)` : ''}` : m.backup.enabled ? `Ultima copia: ${dateLabel(m.lastBackupAt)}` : 'Backup non attivo'}</span></div><div className="mount-actions">
      {connected && <Button onClick={onOpen}><FolderOpen size={15}/> Apri</Button>}
      <Button kind={disconnectable || connecting ? 'secondary' : 'primary'} disabled={stopping || (busy && !connecting)} onClick={onToggle}>{connecting ? <X size={15}/> : disconnectable ? <Unplug size={15}/> : <ArrowUpRight size={15}/>} {connecting ? 'Annulla' : stopping ? 'Attendi...' : disconnectable ? 'Scollega' : m.status === 'error' ? 'Riprova' : 'Collega'}</Button>
    </div></div>
    {m.backupStatus === 'running' && <BackupProgressView progress={m.backupProgress}/>}
    {m.backup.enabled && m.nextBackupAt && m.backupStatus !== 'running' && <p className="next-backup"><Clock3 size={13}/> Prossimo: {dateLabel(m.nextBackupAt)}</p>}
    {m.refreshNeedsReconnect && <p className="refresh-notice">Nuovo intervallo salvato. Verra applicato quando scolleghi e ricolleghi la cartella, dopo la fine dei trasferimenti.</p>}
    {m.backup.enabled && <div className="backup-actions"><Button kind="ghost" disabled={busy || m.backupStatus === 'running'} onClick={onBackup}><DatabaseBackup size={14}/> Esegui backup</Button><Button kind="ghost" onClick={onOpenBackup}><FolderOpen size={14}/> Apri backup</Button></div>}
  </article>
}

function SettingsPage({snapshot, deps, onSave, onCheck, busy}: {snapshot: Snapshot; deps: Dependencies | null; onSave: (s: AppSettings) => Promise<void>; onCheck: () => void; busy: boolean}): ReactNode {
  const [executable, setExecutable] = useState(snapshot.settings.rcloneExecutable)
  const [cache, setCache] = useState(snapshot.settings.cacheMaxSize)
  const [refresh, setRefresh] = useState(snapshot.settings.directoryRefreshSeconds ?? DEFAULT_REFRESH_SECONDS)
  const [refreshError, setRefreshError] = useState('')
  const [refreshResult, setRefreshResult] = useState('')
  useEffect(() => setRefresh(snapshot.settings.directoryRefreshSeconds ?? DEFAULT_REFRESH_SECONDS), [snapshot.settings.directoryRefreshSeconds])
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {setExecutable(snapshot.settings.rcloneExecutable); setCache(snapshot.settings.cacheMaxSize)}, [snapshot.settings.rcloneExecutable, snapshot.settings.cacheMaxSize])
  useEffect(() => {setResult(''); setError('')}, [snapshot.settings.defaultRemote, snapshot.settings.rcloneExecutable])
  const remote = selectedRemote(deps?.remotes ?? [], snapshot.settings.defaultRemote)
  const update = async (values: Partial<AppSettings>): Promise<void> => {
    setError('')
    try { await onSave({...snapshot.settings, ...values}) }
    catch (failure) {setError(messageOf(failure));throw failure}
  }
  const check = async (): Promise<void> => {
    setChecking(true); setResult(''); setError('')
    try { setResult(await window.drive.checkConnection(remote)) }
    catch (failure) { setError(messageOf(failure)) }
    finally { setChecking(false) }
  }
  const themes: {value: Theme; label: string; aria: string; icon: ReactNode}[] = [
    {value: 'system', label: 'Sistema', aria: 'Tema di sistema', icon: <Monitor size={18}/>},
    {value: 'light', label: 'Chiaro', aria: 'Tema chiaro', icon: <Sun size={18}/>},
    {value: 'dark', label: 'Scuro', aria: 'Tema scuro', icon: <Moon size={18}/>}
  ]
  return <div className="page-block settings-page"><div className="page-heading"><span className="eyebrow">A MODO TUO</span><h1>Impostazioni</h1><p>Connessione, aspetto e preferenze.</p></div>
    <section className="settings-panel"><div className="section-title"><Server size={21}/><div><h2>Il tuo server</h2><p>{remote ? `${serverName(remote)} e gia salvato su questo computer.` : 'Rileva e scegli una connessione salvata.'}</p></div></div>
      {deps?.remotes.length ? <>
        {deps.remotes.length > 1 && <Field label="Server predefinito"><select aria-label="Server predefinito" disabled={busy} value={snapshot.settings.defaultRemote} onChange={event => void update({defaultRemote: event.target.value}).catch(() => {})}><option value="">Scegli ogni volta</option>{deps.remotes.map(r => <option key={r} value={r}>{serverName(r)}</option>)}</select></Field>}
        <p className="field-hint">Le impostazioni di accesso gia presenti vengono riutilizzate. Nessuna chiave viene caricata su GitHub.</p>
        <div className="button-row"><Button kind="primary" disabled={!remote || checking || busy} onClick={check}>{checking ? <LoaderCircle className="spin" size={16}/> : <ShieldCheck size={16}/>} {checking ? 'Verifico...' : 'Verifica connessione'}</Button><Button disabled={checking} onClick={() => {setResult(''); setError(''); onCheck()}}><RefreshCw size={15}/> Rileva di nuovo</Button></div>
      </> : <><p className="muted">{deps?.connectionError || (deps && !deps.rclone.ok ? deps.rclone.detail : 'Non ho trovato connessioni salvate. Riprova il rilevamento oppure controlla le opzioni avanzate.')}</p><Button disabled={busy} onClick={onCheck}><RefreshCw size={15}/> Rileva di nuovo</Button></>}
      {result && <div className="success-box" role="status"><CircleCheck size={17}/>{result}</div>}<ErrorBox message={error}/>
    </section>
    <section className="settings-panel"><div className="section-title"><Sun size={21}/><div><h2>Aspetto</h2><p>Il tema si applica subito e viene ricordato.</p></div></div><div className="theme-options" aria-label="Tema dell'app">{themes.map(theme => <button key={theme.value} type="button" aria-label={theme.aria} aria-pressed={snapshot.settings.theme === theme.value} className={snapshot.settings.theme === theme.value ? 'selected' : ''} disabled={busy} onClick={() => update({theme: theme.value}).catch(() => {})}>{theme.icon}<span>{theme.label}</span>{snapshot.settings.theme === theme.value && <Check size={14}/>}</button>)}</div></section>
    <section className="settings-panel"><div className="section-title"><Laptop size={21}/><div><h2>Sul tuo computer</h2><p>Pannello compatto all'avvio. Espandi quando ti serve piu spazio.</p></div></div><div className="setting-switch"><div><strong>Avvia con il computer</strong><p>Disponibile dopo l'accesso al tuo account.</p></div><Toggle label="Avvia con il computer" disabled={busy} checked={snapshot.settings.startAtLogin} onChange={value => void update({startAtLogin: value}).catch(() => {})}/></div><div className="setting-switch"><div><strong>Continua quando chiudo la finestra</strong><p>I collegamenti e i backup restano attivi. Per fermarli usa Esci.</p></div><Toggle label="Continua quando chiudo la finestra" disabled={busy} checked={snapshot.settings.closeToTray} onChange={value => void update({closeToTray: value}).catch(() => {})}/></div></section>
    <section className="settings-panel"><div className="section-title"><RefreshCw size={21}/><div><h2>Aggiornamento delle cartelle</h2><p>Intervallo predefinito per rileggere l'elenco dei file.</p></div></div>
      <Field label="Intervallo generale" detail="Da 5 secondi a 24 ore. Le cartelle con un intervallo personalizzato non vengono modificate."><DurationInput label="Intervallo aggiornamento generale" unitLabel="Unita aggiornamento generale" value={refresh} onChange={v => {setRefresh(v);setRefreshError('');setRefreshResult('')}} units={refreshUnits} min={5} max={86400}/></Field>
      <p className="field-hint">Gli elenchi vengono riletti quando richiesti dopo la scadenza, senza scaricare tutti i file. Per le cartelle gia collegate, il nuovo valore si applica alla prossima riconnessione.</p>
      <Button disabled={busy} onClick={async () => {
        setRefreshError(''); setRefreshResult('')
        try { await update({directoryRefreshSeconds:refresh}); setRefreshResult('Intervallo salvato.') }
        catch (failure) { setRefreshError(messageOf(failure)) }
      }}><Check size={15}/> Salva intervallo</Button><ErrorBox message={refreshError}/>{refreshResult && <p className="success-box" role="status">{refreshResult}</p>}
    </section>
    <details className="settings-panel advanced"><summary><Settings2 size={17}/> Opzioni avanzate</summary><p className="field-hint">Normalmente non serve modificarle. Utili per assistenza o installazioni personalizzate.</p><p className="field-hint">{deps?.note}</p><Field label="Componente di collegamento (rclone)"><div className="input-with-button"><input aria-label="Eseguibile rclone" value={executable} onChange={event => setExecutable(event.target.value)}/><button type="button" onClick={async () => {try {const value = await window.drive.chooseExecutable(); if (value) setExecutable(value)} catch (failure) {setError(messageOf(failure))}}}>Sfoglia</button></div></Field><Field label="Limite indicativo dello spazio temporaneo" detail="I file aperti possono usare spazio locale. Durante scritture e trasferimenti il limite puo essere superato."><input aria-label="Spazio temporaneo" value={cache} onChange={event => setCache(event.target.value)} placeholder="5G"/></Field><Button disabled={busy} onClick={() => update({rcloneExecutable: executable, cacheMaxSize: cache}).catch(() => {})}>Salva opzioni avanzate</Button></details>
    <div className="settings-footer"><span>Drive Tambu {snapshot.appVersion}</span><Button kind="ghost" onClick={() => window.drive.quit()}><LogOut size={16}/> Esci da Drive Tambu</Button></div>
  </div>
}

function ActivityPage({log}: {log: string[]}): ReactNode {
  return <div className="page-block"><div className="page-heading"><span className="eyebrow">TUTTO SOTTO CONTROLLO</span><h1>Attivit&agrave;</h1><p>Cosa succede in questa sessione.</p></div><div className="activity-list">{log.length ? log.map((line, index) => {
    const separator = line.indexOf('  '), time = separator >= 0 ? line.slice(0, separator) : '', message = separator >= 0 ? line.slice(separator + 2) : line
    const parts = message.split(' Dettagli: ')
    const technical = /ERROR|NOTICE|failed|fatal/i.test(parts[0])
    return <article className="activity-item" key={`${index}-${line}`}><Activity size={17}/><div><p>{technical ? 'Messaggio del componente di collegamento' : parts[0]}</p><time>{time}</time>{(technical || parts.length > 1) && <details><summary>Dettagli tecnici</summary><pre>{technical ? message : parts.slice(1).join(' Dettagli: ')}</pre></details>}</div></article>
  }) : <div className="empty-list">Nessuna attivita in questa sessione.</div>}</div></div>
}

export default function App(): ReactNode {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [deps, setDeps] = useState<Dependencies | null>(null)
  const [page, setPage] = useState<Page>('folders')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<MountConfig | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState<Set<string>>(() => new Set())
  const [loadingDeps, setLoadingDeps] = useState(true)
  const notify = useCallback((text: string, type: 'success' | 'error' = 'success') => setNotice({text, type}), [])
  const refresh = useCallback(async (): Promise<void> => {try {setSnapshot(await window.drive.snapshot())} catch (error) {notify(messageOf(error), 'error')}}, [notify])
  const refreshDependencies = useCallback(async (): Promise<void> => {
    setLoadingDeps(true)
    try {setDeps(await window.drive.diagnostics())} catch (error) {notify(messageOf(error), 'error')}
    finally {setLoadingDeps(false)}
  }, [notify])
  useEffect(() => {void refresh(); void refreshDependencies(); return window.drive.onChanged(() => void refresh())}, [refresh, refreshDependencies])
  useEffect(() => {if (snapshot) document.documentElement.dataset.theme = snapshot.dark ? 'dark' : 'light'}, [snapshot?.dark])
  useEffect(() => {if (!notice) return; const timer = setTimeout(() => setNotice(null), notice.type === 'error' ? 10000 : 4000); return () => clearTimeout(timer)}, [notice])
  const task = async (key: string, operation: () => Promise<unknown>, success?: string): Promise<void> => {
    setBusy(value => new Set(value).add(key))
    try {await operation(); if (success) notify(success); await refresh()}
    catch (error) {notify(messageOf(error), 'error')}
    finally {setBusy(value => {const next = new Set(value); next.delete(key); return next})}
  }
  const saveMount = async (m: MountConfig): Promise<void> => {const saved = await window.drive.saveMount(m); if (saved === false) return; await refresh(); setEditing(null); notify('Cartella salvata.')}
  const deleteMount = async (id: string): Promise<boolean> => {
    await window.drive.deleteMount(id)
    const next = await window.drive.snapshot(); setSnapshot(next)
    if (next.mounts.some(m => m.id === id)) return false
    setEditing(null); notify('Collegamento rimosso. I file sono rimasti al loro posto.'); return true
  }
  const visible = useMemo(() => snapshot?.mounts.filter(m => `${m.name} ${m.localPath}`.toLocaleLowerCase('it').includes(search.toLocaleLowerCase('it'))) ?? [], [snapshot, search])
  if (!snapshot) return <div className="loading-screen"><Brand/><LoaderCircle size={26} className="spin"/><p>Preparo il tuo spazio...</p>{notice && <ErrorBox message={notice.text}/>}</div>
  const compact = snapshot.windowMode === 'compact'
  const connected = snapshot.mounts.filter(m => m.status === 'connected').length
  const title = page === 'folders' ? 'Le mie cartelle' : page === 'settings' ? 'Impostazioni' : 'Attivit\u00e0'
  const addFolder = (): void => setEditing(newMount(selectedRemote(deps?.remotes ?? [], snapshot.settings.defaultRemote)))
  const changeMode = (): Promise<void> => window.drive.setWindowMode(compact ? 'expanded' : 'compact').catch(error => notify(messageOf(error), 'error'))
  return <div className="app-shell" data-mode={snapshot.windowMode}>
    <aside className="sidebar"><Brand/><div className="sidebar-label">IL TUO SPAZIO</div><nav aria-label="Navigazione principale"><button className={`nav-item ${page === 'folders' ? 'selected' : ''}`} onClick={() => setPage('folders')}><LayoutGrid size={18}/><span>Le mie cartelle</span><b>{snapshot.mounts.length}</b></button><button className={`nav-item ${page === 'activity' ? 'selected' : ''}`} onClick={() => setPage('activity')}><Activity size={18}/><span>Attivit&agrave;</span></button></nav><div className="sidebar-bottom"><button className={`settings-link ${page === 'settings' ? 'selected' : ''}`} onClick={() => setPage('settings')}><Settings2 size={19}/><span><strong>Impostazioni</strong><small>Aspetto e connessione</small></span><ChevronRight size={16}/></button><span className="app-version">Drive Tambu {snapshot.appVersion}</span></div></aside>
    <div className="main-view"><header className="titlebar"><div className="titlebar-brand"><Brand/></div><span className="titlebar-title">{title}</span><div className="window-controls"><Button title={snapshot.dark ? 'Passa al tema chiaro' : 'Passa al tema scuro'} kind="ghost" disabled={busy.has('settings')} onClick={() => task('settings', () => window.drive.saveSettings({...snapshot.settings, theme: snapshot.dark ? 'light' : 'dark'}))}>{snapshot.dark ? <Sun size={17}/> : <Moon size={17}/>}</Button>{!compact && <Button title="Riduci a icona" kind="ghost" onClick={() => window.drive.minimizeWindow()}><Minus size={17}/></Button>}<Button title={compact ? 'Apri finestra completa' : 'Torna al pannello compatto'} kind="ghost" onClick={changeMode}>{compact ? <Maximize2 size={17}/> : <Minimize2 size={17}/>}</Button><Button title="Chiudi finestra" kind="ghost" onClick={() => window.drive.hideWindow()}><X size={18}/></Button></div></header>
      <main className="view-scroll">
        {page === 'folders' && <div className="page-block"><div className="page-heading hero"><div><span className="eyebrow">SEMPLICE. VELOCE.</span><h1>Il tuo server, a portata di mano<span>.</span></h1></div><Button kind="primary" disabled={loadingDeps} onClick={addFolder}><Plus size={17}/><span>Nuova cartella</span></Button></div>
          <div className="overview"><div><Folder size={18}/><strong>{snapshot.mounts.length}</strong><span>Cartelle</span></div><div><CircleCheck size={18}/><strong>{connected}</strong><span>Collegate</span></div><div><DatabaseBackup size={18}/><strong>{snapshot.mounts.filter(m => m.backup.enabled).length}</strong><span>Backup attivi</span></div></div>
          <div className="library-toolbar"><p>{snapshot.mounts.length ? `${connected} di ${snapshot.mounts.length} collegate` : 'Un posto per tutto quello che conta.'}</p>{snapshot.mounts.length > 0 && <div className="search-field"><Search size={16}/><input aria-label="Cerca cartelle" placeholder="Cerca" value={search} onChange={event => setSearch(event.target.value)}/></div>}</div>
          {snapshot.mounts.length === 0 ? <div className="empty-state"><span className="empty-folder"><FolderOpen size={46}/></span><h2>Il tuo spazio inizia qui.</h2><p>Scegli una cartella sul server e ritrovala sul computer, senza scaricare tutto l'archivio.</p><Button kind="primary" disabled={loadingDeps} onClick={addFolder}>{loadingDeps ? <LoaderCircle size={17} className="spin"/> : <Plus size={17}/>} {loadingDeps ? 'Rilevo il server...' : 'Aggiungi la prima cartella'}</Button></div> : <div className="mount-list">{visible.map(m => <MountCard key={m.id} m={m} busy={busy.has(m.id)} onEdit={() => setEditing(m)} onOpen={() => void task('open', () => window.drive.openMount(m.id))} onToggle={() => void task(m.id, () => m.hasRuntime || m.status === 'connected' || m.status === 'connecting' ? window.drive.disconnect(m.id) : window.drive.connect(m.id))} onBackup={() => void task(m.id, () => window.drive.backupNow(m.id), 'Backup completato.')} onOpenBackup={() => void task('open-backup', () => window.drive.openBackup(m.id))}/>)}{visible.length === 0 && <div className="empty-list">Nessuna cartella corrisponde alla ricerca.</div>}</div>}
          <div className="privacy-note"><HardDrive size={15}/><span>I file restano sul server. Quelli aperti possono occupare spazio temporaneo sul computer.</span></div>
        </div>}
        {page === 'settings' && <SettingsPage snapshot={snapshot} deps={deps} busy={busy.has('settings')} onCheck={() => void refreshDependencies()} onSave={async values => {
          setBusy(value => new Set(value).add('settings'))
          try {await window.drive.saveSettings(values);await refresh();void refreshDependencies()}
          finally {setBusy(value => {const next = new Set(value);next.delete('settings');return next})}
        }}/>}
        {page === 'activity' && <ActivityPage log={snapshot.log}/>}
      </main>
      <nav className="compact-nav" aria-label="Navigazione pannello"><button className={page === 'folders' ? 'selected' : ''} onClick={() => setPage('folders')}><Folder size={18}/><span>Cartelle</span></button><button className={page === 'activity' ? 'selected' : ''} onClick={() => setPage('activity')}><Activity size={18}/><span>Attivit&agrave;</span></button><button className={page === 'settings' ? 'selected' : ''} onClick={() => setPage('settings')}><Settings2 size={18}/><span>Impostazioni</span></button></nav>
    </div>
    {editing && <MountModal defaultRefreshSeconds={snapshot.settings.directoryRefreshSeconds} original={editing} remotes={deps?.remotes ?? []} platform={snapshot.platform} onClose={() => setEditing(null)} onSave={saveMount} onDelete={deleteMount} onSettings={() => {setEditing(null); setPage('settings')}}/>}
    {snapshot.operation && <OperationDialog operation={snapshot.operation} onReply={reply => window.drive.respondToOperation(snapshot.operation!.id, reply).catch(error => notify(messageOf(error), 'error'))}/>}
    {notice && <div className={`toast toast-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.type === 'error' ? <CircleAlert size={18}/> : <CircleCheck size={18}/>}<span>{notice.text}</span><button aria-label="Chiudi notifica" onClick={() => setNotice(null)}><X size={16}/></button></div>}
  </div>
}
