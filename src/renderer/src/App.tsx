import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowLeft, ArrowUpRight, Check, ChevronRight, CircleAlert, CircleCheck,
  Cloud, DatabaseBackup, Folder, FolderOpen, HardDrive, Home, Laptop, LayoutGrid,
  LoaderCircle, LogOut, Maximize2, Minimize2, Minus, Monitor, Moon, MoreHorizontal,
  Plus, RefreshCw, Search, Server, Settings2, ShieldCheck, Sun, Trash2, Unplug, X
} from 'lucide-react'
import type { AppSettings, Dependencies, MountConfig, MountView, RemoteListing, Snapshot, Theme } from '../../shared/types'
import { normalizeRemotePath, selectedRemote } from '../../shared/paths'
import { displayRemotePath, parseDisplayedRemotePath } from './remote-path-display'

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

function MountModal({original, remotes, onClose, onSave, onDelete, onSettings}: {
  original: MountConfig; remotes: string[]; platform?: string; onClose: () => void;
  onSave: (m: MountConfig) => Promise<void>; onDelete: (id: string) => Promise<boolean>; onSettings: () => void;
  notify?: (text: string, type?: 'success' | 'error') => void; apiBusy?: boolean
}): ReactNode {
  const [m, setM] = useState(() => structuredClone(original))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [browser, setBrowser] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isNew = !original.name
  const status = (original as Partial<MountView>).status
  const pathLocked = status === 'connected' || status === 'connecting' || status === 'disconnecting'
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
      {confirmDelete ? <div className="modal-body"><div className="confirmation"><Trash2 size={28}/><h3>Rimuovere {m.name}?</h3><p>Rimuovi soltanto il collegamento dall'app. I file sul server e i backup locali non saranno cancellati.</p></div><ErrorBox message={error}/><div className="modal-foot"><Button onClick={() => setConfirmDelete(false)} disabled={saving}>Annulla</Button><Button kind="danger" disabled={saving} onClick={async () => {
        setSaving(true); try { await onDelete(m.id) } catch (failure) {setError(messageOf(failure))} finally {setSaving(false)}
      }}>Rimuovi collegamento</Button></div></div> : <form onSubmit={event => void save(event)}>
        <div className="modal-body">
          <ErrorBox message={error}/>
          {remotes.length === 0 && <div className="info-box"><Server size={19}/><div><strong>Nessun server disponibile</strong><p>Apri le Impostazioni per rilevare le connessioni salvate.</p><Button onClick={onSettings}>Apri Impostazioni</Button></div></div>}
          <Field label="Nome cartella"><input required aria-label="Nome cartella" maxLength={80} placeholder="Per esempio, Documenti" value={m.name} disabled={saving} onChange={event => patch('name', event.target.value)}/></Field>
          {remotes.length > 1 ? <Field label="Server"><select required aria-label="Server" value={m.remote} disabled={saving || pathLocked} onChange={event => {patch('remote', event.target.value); patch('remotePath', '')}}><option value="" disabled>Scegli il server</option>{remotes.map(remote => <option key={remote} value={remote}>{serverName(remote)}</option>)}</select></Field>
            : m.remote && <div className="server-chip"><Server size={15}/><span>Server: <strong>{serverName(m.remote)}</strong></span></div>}
          {pathLocked && <p className="field-hint">Per cambiare le posizioni, scollega prima la cartella. Puoi comunque cambiarne il nome.</p>}
          <Field label="Cartella sul server" detail="Usa Sfoglia oppure incolla il percorso completo. Il nome del server viene riconosciuto automaticamente.">
            <div className="input-with-button"><input aria-label="Cartella sul server" disabled={saving || pathLocked} spellCheck={false} value={m.remotePath} placeholder="Home del server" onChange={event => patch('remotePath', event.target.value)} onBlur={() => {
              if (!m.remote) return
              try { patch('remotePath', normalizeRemotePath(m.remote, m.remotePath)) } catch (failure) {setError(messageOf(failure))}
            }}/><button type="button" aria-label="Sfoglia cartelle sul server" disabled={!m.remote || saving || pathLocked} onClick={() => setBrowser(true)}><Folder size={16}/> Sfoglia</button></div>
          </Field>
          <Field label="Cartella sul computer" detail="Scegli dove farla apparire. Drive Tambu prepara un nome disponibile, senza toccare le cartelle esistenti.">
            <div className="input-with-button"><input required aria-label="Cartella sul computer" disabled={saving || pathLocked} value={m.localPath} placeholder="Scegli una posizione" onChange={event => patch('localPath', event.target.value)}/><button type="button" aria-label="Sfoglia cartelle sul computer" disabled={saving || pathLocked} onClick={() => void chooseLocal()}><Folder size={16}/> Sfoglia</button></div>
          </Field>
          <div className="setting-switch"><div><strong>Collega automaticamente</strong><p>La cartella torna disponibile quando apri Drive Tambu.</p></div><Toggle label="Collega automaticamente" checked={m.autoConnect} disabled={saving} onChange={value => patch('autoConnect', value)}/></div>
          <div className="setting-switch"><div><strong>Backup su questo computer</strong><p>Una copia separata, con le versioni precedenti. Occupa spazio sul disco.</p></div><Toggle label="Backup su questo computer" checked={m.backup.enabled} disabled={saving} onChange={value => backup('enabled', value)}/></div>
          {m.backup.enabled && <fieldset disabled={saving} className="backup-form"><legend>Preferenze del backup</legend>
            <Field label="Quando eseguire il backup"><select aria-label="Frequenza backup" value={m.backup.intervalMinutes} onChange={event => backup('intervalMinutes', Number(event.target.value))}><option value={0}>Solo quando lo chiedo</option><option value={30}>Ogni 30 minuti</option><option value={60}>Ogni ora</option><option value={360}>Ogni 6 ore</option><option value={1440}>Ogni giorno</option>{![0, 30, 60, 360, 1440].includes(m.backup.intervalMinutes) && <option value={m.backup.intervalMinutes}>Ogni {m.backup.intervalMinutes} minuti</option>}</select></Field>
            <Field label="Dove salvare la copia" detail="Scegli una cartella dedicata e vuota, separata dalle cartelle collegate."><div className="input-with-button"><input required aria-label="Destinazione backup" value={m.backup.destination} onChange={event => backup('destination', event.target.value)} placeholder="Scegli una cartella per il backup"/><button type="button" onClick={() => void chooseBackup()}><Folder size={16}/> Sfoglia</button></div></Field>
            <Field label="Conserva le versioni precedenti per" detail="Numero di giorni. Con 0 le versioni non vengono eliminate automaticamente."><input aria-label="Giorni conservazione backup" type="number" required min={0} max={36500} value={m.backup.retentionDays} onChange={event => backup('retentionDays', Number(event.target.value))}/></Field>
            <p className="field-hint">Il backup copia dal server al computer, mai al contrario. Funziona mentre Drive Tambu e aperto.</p>
          </fieldset>}
        </div>
        <footer className="modal-foot"><div className="foot-spacer">{!isNew && <Button kind="ghost" disabled={saving} onClick={() => setConfirmDelete(true)}><Trash2 size={16}/><span className="hide-narrow">Rimuovi</span></Button>}</div><Button onClick={onClose} disabled={saving}>Annulla</Button><button type="submit" className="button button-primary" disabled={saving || !m.remote || remotes.length === 0}>{saving ? <LoaderCircle className="spin" size={16}/> : <Check size={16}/>} {saving ? 'Verifico e salvo...' : 'Salva cartella'}</button></footer>
      </form>}
    </Dialog>
    {browser && <RemoteBrowser remote={m.remote} initialPath={m.remotePath} onClose={() => setBrowser(false)} onChoose={value => {patch('remotePath', value); setBrowser(false)}}/>}
  </>
}

function MountCard({m, busy, onEdit, onOpen, onToggle, onBackup, onOpenBackup}: {m: MountView; busy: boolean; onEdit: () => void; onOpen: () => void; onToggle: () => void; onBackup: () => void; onOpenBackup: () => void}): ReactNode {
  const connected = m.status === 'connected', connecting = m.status === 'connecting', stopping = m.status === 'disconnecting'
  const label = {connected: 'Collegata', connecting: 'Collegamento...', disconnected: 'Scollegata', disconnecting: 'Disconnessione...', error: 'Da verificare'}[m.status]
  return <article className="mount-card">
    <div className="mount-top"><span className="folder-icon"><Folder size={25}/></span><div className="mount-heading"><h3>{m.name}</h3><span className={`status status-${m.status}`}><i/>{label}</span></div><Button title={`Impostazioni ${m.name}`} kind="ghost" onClick={onEdit}><MoreHorizontal size={20}/></Button></div>
    <div className="location-row"><Laptop size={14}/><span title={m.localPath}>{m.localPath}</span></div>
    {connecting && <p className="mount-detail" role="status">{m.statusDetail}</p>}
    {m.status === 'error' && <ErrorBox message={m.statusDetail}/>}
    {m.backupStatus === 'error' && <ErrorBox message="Il backup non e stato completato. Apri Attivita per i dettagli."/>}
    <div className="mount-bottom"><div className="backup-caption"><DatabaseBackup size={14}/><span>{m.backupStatus === 'running' ? 'Backup in corso' : m.backup.enabled ? `Ultima copia: ${dateLabel(m.lastBackupAt)}` : 'Backup non attivo'}</span></div><div className="mount-actions">
      {connected && <Button onClick={onOpen}><FolderOpen size={15}/> Apri</Button>}
      <Button kind={connected || connecting ? 'secondary' : 'primary'} disabled={stopping || (busy && !connecting)} onClick={onToggle}>{connecting ? <X size={15}/> : connected ? <Unplug size={15}/> : <ArrowUpRight size={15}/>} {connecting ? 'Annulla' : stopping ? 'Attendi...' : connected ? 'Scollega' : m.status === 'error' ? 'Riprova' : 'Collega'}</Button>
    </div></div>
    {m.backup.enabled && <div className="backup-actions"><Button kind="ghost" disabled={busy || m.backupStatus === 'running'} onClick={onBackup}><DatabaseBackup size={14}/> Esegui backup</Button><Button kind="ghost" onClick={onOpenBackup}><FolderOpen size={14}/> Apri backup</Button></div>}
  </article>
}

function SettingsPage({snapshot, deps, onSave, onCheck, busy}: {snapshot: Snapshot; deps: Dependencies | null; onSave: (s: AppSettings) => Promise<void>; onCheck: () => void; busy: boolean}): ReactNode {
  const [executable, setExecutable] = useState(snapshot.settings.rcloneExecutable)
  const [cache, setCache] = useState(snapshot.settings.cacheMaxSize)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {setExecutable(snapshot.settings.rcloneExecutable); setCache(snapshot.settings.cacheMaxSize)}, [snapshot.settings.rcloneExecutable, snapshot.settings.cacheMaxSize])
  useEffect(() => {setResult(''); setError('')}, [snapshot.settings.defaultRemote, snapshot.settings.rcloneExecutable])
  const remote = selectedRemote(deps?.remotes ?? [], snapshot.settings.defaultRemote)
  const update = (values: Partial<AppSettings>): Promise<void> => onSave({...snapshot.settings, ...values})
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
        {deps.remotes.length > 1 && <Field label="Server predefinito"><select aria-label="Server predefinito" disabled={busy} value={snapshot.settings.defaultRemote} onChange={event => void update({defaultRemote: event.target.value})}><option value="">Scegli ogni volta</option>{deps.remotes.map(r => <option key={r} value={r}>{serverName(r)}</option>)}</select></Field>}
        <p className="field-hint">Le impostazioni di accesso gia presenti vengono riutilizzate. Nessuna chiave viene caricata su GitHub.</p>
        <div className="button-row"><Button kind="primary" disabled={!remote || checking || busy} onClick={check}>{checking ? <LoaderCircle className="spin" size={16}/> : <ShieldCheck size={16}/>} {checking ? 'Verifico...' : 'Verifica connessione'}</Button><Button disabled={checking} onClick={() => {setResult(''); setError(''); onCheck()}}><RefreshCw size={15}/> Rileva di nuovo</Button></div>
      </> : <><p className="muted">{deps?.connectionError || (deps && !deps.rclone.ok ? deps.rclone.detail : 'Non ho trovato connessioni salvate. Riprova il rilevamento oppure controlla le opzioni avanzate.')}</p><Button disabled={busy} onClick={onCheck}><RefreshCw size={15}/> Rileva di nuovo</Button></>}
      {result && <div className="success-box" role="status"><CircleCheck size={17}/>{result}</div>}<ErrorBox message={error}/>
    </section>
    <section className="settings-panel"><div className="section-title"><Sun size={21}/><div><h2>Aspetto</h2><p>Il tema si applica subito e viene ricordato.</p></div></div><div className="theme-options" aria-label="Tema dell'app">{themes.map(theme => <button key={theme.value} type="button" aria-label={theme.aria} aria-pressed={snapshot.settings.theme === theme.value} className={snapshot.settings.theme === theme.value ? 'selected' : ''} disabled={busy} onClick={() => update({theme: theme.value})}>{theme.icon}<span>{theme.label}</span>{snapshot.settings.theme === theme.value && <Check size={14}/>}</button>)}</div></section>
    <section className="settings-panel"><div className="section-title"><Laptop size={21}/><div><h2>Sul tuo computer</h2><p>Pannello compatto all'avvio. Espandi quando ti serve piu spazio.</p></div></div><div className="setting-switch"><div><strong>Avvia con il computer</strong><p>Disponibile dopo l'accesso al tuo account.</p></div><Toggle label="Avvia con il computer" disabled={busy} checked={snapshot.settings.startAtLogin} onChange={value => void update({startAtLogin: value})}/></div><div className="setting-switch"><div><strong>Continua quando chiudo la finestra</strong><p>I collegamenti e i backup restano attivi. Per fermarli usa Esci.</p></div><Toggle label="Continua quando chiudo la finestra" disabled={busy} checked={snapshot.settings.closeToTray} onChange={value => void update({closeToTray: value})}/></div></section>
    <details className="settings-panel advanced"><summary><Settings2 size={17}/> Opzioni avanzate</summary><p className="field-hint">Normalmente non serve modificarle. Utili per assistenza o installazioni personalizzate.</p><p className="field-hint">{deps?.note}</p><Field label="Componente di collegamento (rclone)"><div className="input-with-button"><input aria-label="Eseguibile rclone" value={executable} onChange={event => setExecutable(event.target.value)}/><button type="button" onClick={async () => {try {const value = await window.drive.chooseExecutable(); if (value) setExecutable(value)} catch (failure) {setError(messageOf(failure))}}}>Sfoglia</button></div></Field><Field label="Limite indicativo dello spazio temporaneo" detail="I file aperti possono usare spazio locale. Durante scritture e trasferimenti il limite puo essere superato."><input aria-label="Spazio temporaneo" value={cache} onChange={event => setCache(event.target.value)} placeholder="5G"/></Field><Button disabled={busy} onClick={() => update({rcloneExecutable: executable, cacheMaxSize: cache})}>Salva opzioni avanzate</Button></details>
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
  const saveMount = async (m: MountConfig): Promise<void> => {await window.drive.saveMount(m); await refresh(); setEditing(null); notify('Cartella salvata.')}
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
          {snapshot.mounts.length === 0 ? <div className="empty-state"><span className="empty-folder"><FolderOpen size={46}/></span><h2>Il tuo spazio inizia qui.</h2><p>Scegli una cartella sul server e ritrovala sul computer, senza scaricare tutto l'archivio.</p><Button kind="primary" disabled={loadingDeps} onClick={addFolder}>{loadingDeps ? <LoaderCircle size={17} className="spin"/> : <Plus size={17}/>} {loadingDeps ? 'Rilevo il server...' : 'Aggiungi la prima cartella'}</Button></div> : <div className="mount-list">{visible.map(m => <MountCard key={m.id} m={m} busy={busy.has(m.id)} onEdit={() => setEditing(m)} onOpen={() => void task('open', () => window.drive.openMount(m.id))} onToggle={() => void task(m.id, () => m.status === 'connected' || m.status === 'connecting' ? window.drive.disconnect(m.id) : window.drive.connect(m.id))} onBackup={() => void task(m.id, () => window.drive.backupNow(m.id), 'Backup completato.')} onOpenBackup={() => void task('open-backup', () => window.drive.openBackup(m.id))}/>)}{visible.length === 0 && <div className="empty-list">Nessuna cartella corrisponde alla ricerca.</div>}</div>}
          <div className="privacy-note"><HardDrive size={15}/><span>I file restano sul server. Quelli aperti possono occupare spazio temporaneo sul computer.</span></div>
        </div>}
        {page === 'settings' && <SettingsPage snapshot={snapshot} deps={deps} busy={busy.has('settings')} onCheck={() => void refreshDependencies()} onSave={async values => {await task('settings', () => window.drive.saveSettings(values)); void refreshDependencies()}}/>}
        {page === 'activity' && <ActivityPage log={snapshot.log}/>}
      </main>
      <nav className="compact-nav" aria-label="Navigazione pannello"><button className={page === 'folders' ? 'selected' : ''} onClick={() => setPage('folders')}><Folder size={18}/><span>Cartelle</span></button><button className={page === 'activity' ? 'selected' : ''} onClick={() => setPage('activity')}><Activity size={18}/><span>Attivit&agrave;</span></button><button className={page === 'settings' ? 'selected' : ''} onClick={() => setPage('settings')}><Settings2 size={18}/><span>Impostazioni</span></button></nav>
    </div>
    {editing && <MountModal original={editing} remotes={deps?.remotes ?? []} platform={snapshot.platform} onClose={() => setEditing(null)} onSave={saveMount} onDelete={deleteMount} onSettings={() => {setEditing(null); setPage('settings')}}/>}
    {notice && <div className={`toast toast-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.type === 'error' ? <CircleAlert size={18}/> : <CircleCheck size={18}/>}<span>{notice.text}</span><button aria-label="Chiudi notifica" onClick={() => setNotice(null)}><X size={16}/></button></div>}
  </div>
}
