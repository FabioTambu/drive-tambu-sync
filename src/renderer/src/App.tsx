import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, Bell, Check, CheckCheck, ChevronRight,
  CircleAlert, CircleCheck, Clock3, Cloud, CloudCog, Copy, DatabaseBackup,
  ExternalLink, Folder, FolderClosed, FolderOpen, HardDrive, Info, Laptop,
  LayoutGrid, LoaderCircle, MoreHorizontal, Plus, RefreshCw, Search, Server,
  Settings2, ShieldCheck, Sparkles, Trash2, Unplug, X
} from 'lucide-react'
import type { AppSettings, Dependencies, MountConfig, MountView, Snapshot } from '../../shared/types'

type Page = 'folders' | 'activity' | 'settings'
type Notice = { text: string; type: 'success' | 'error' } | null

const emptyBackup = (): MountConfig['backup'] => ({
  enabled: false, intervalMinutes: 60, destination: '', retentionDays: 30
})
const newMount = (remote: string): MountConfig => ({
  id: crypto.randomUUID(), name: '', remote, remotePath: '/', localPath: '',
  autoConnect: true, backup: emptyBackup()
})
const nowTitle = (date?: string): string => {
  if (!date) return 'Mai eseguito'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? 'Mai eseguito' : parsed.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
}

function Brand({ small = false }: { small?: boolean }): ReactNode {
  return <div className={`brand ${small ? 'brand-small' : ''}`}>
    <div className="brand-icon"><Cloud size={21} strokeWidth={2.25} /></div>
    {!small && <div className="brand-type"><strong>Drive Tambu</strong><span>PERSONAL CLOUD</span></div>}
  </div>
}

function Status({ m }: { m: MountView }): ReactNode {
  const label = {
    connected: 'Collegata', connecting: 'Connessione...',
    disconnected: 'Scollegata', error: 'Errore'
  }[m.status]
  return <span className={`status status-${m.status}`}>
    <span className="status-dot" />{label}
  </span>
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }): ReactNode {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled}
    className={`toggle ${checked ? 'toggle-on' : ''}`} onClick={() => onChange(!checked)}><span /></button>
}

function ShellButton({ children, onClick, kind = 'secondary', disabled = false, className = '', title }: {
  children: ReactNode; onClick: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean; className?: string; title?: string
}): ReactNode {
  return <button title={title} type="button" className={`button button-${kind} ${className}`} disabled={disabled} onClick={onClick}>{children}</button>
}

function MountCard({ mount, onOpen, onEdit, onConnect, onBackup, busy }: {
  mount: MountView; onOpen: () => void; onEdit: () => void; onConnect: () => void; onBackup: () => void; busy: boolean
}): ReactNode {
  const active = mount.status === 'connected'
  const connecting = mount.status === 'connecting'
  return <article className="mount-card">
    <div className="mount-top">
      <div className="mount-ident">
        <div className="folder-icon"><FolderClosed size={26} strokeWidth={1.75} /></div>
        <div className="mount-text">
          <div className="mount-name-line"><h3>{mount.name}</h3><Status m={mount} /></div>
          <p>{mount.remote}:{mount.remotePath}</p>
        </div>
      </div>
      <ShellButton onClick={onEdit} kind="ghost" className="icon-button" title="Modifica cartella"><MoreHorizontal size={20} /></ShellButton>
    </div>
    <div className="location-row"><Laptop size={15} /><span title={mount.localPath}>{mount.localPath}</span></div>
    <div className="mount-bottom">
      <div className="mount-meta">
        {mount.backup.enabled ? <span className="meta-piece"><DatabaseBackup size={14} /> Backup {mount.backupStatus === 'running' ? 'in corso' : 'attivo'}</span>
          : <span className="meta-piece muted"><DatabaseBackup size={14} /> Backup disattivato</span>}
        {mount.lastBackupAt && <span className="meta-piece hide-small"><Clock3 size={13} /> {nowTitle(mount.lastBackupAt)}</span>}
      </div>
      <div className="mount-actions">
        {mount.backup.enabled && <ShellButton kind="ghost" onClick={onBackup} disabled={busy || mount.backupStatus === 'running'} title="Esegui backup"><DatabaseBackup size={17} /></ShellButton>}
        {active && <ShellButton kind="secondary" onClick={onOpen}><FolderOpen size={16} /> Apri</ShellButton>}
        <ShellButton kind={active ? 'secondary' : 'primary'} disabled={busy || connecting} onClick={onConnect}>
          {connecting ? <LoaderCircle size={15} className="spin" /> : active ? <Unplug size={15} /> : <ArrowUpRight size={15} />}
          {connecting ? 'Collego...' : active ? 'Scollega' : 'Collega'}
        </ShellButton>
      </div>
    </div>
    {mount.status === 'error' && <div className="card-error"><CircleAlert size={15} /> {mount.statusDetail}</div>}
    {mount.backupStatus === 'error' && <div className="card-error"><CircleAlert size={15} /> Backup: {mount.backupDetail}</div>}
  </article>
}

function EmptyState({ onAdd }: { onAdd: () => void }): ReactNode {
  return <div className="empty-state">
    <div className="empty-art"><div className="empty-art-back" /><div className="empty-art-folder"><FolderOpen size={49} strokeWidth={1.3} /></div><span className="empty-star"><Sparkles size={18} /></span></div>
    <h2>Il tuo spazio inizia qui.</h2>
    <p>Collega la prima cartella del tuo server. I file rimangono nel cloud, ma li ritrovi direttamente sul computer.</p>
    <ShellButton kind="primary" onClick={onAdd}><Plus size={17} /> Aggiungi cartella</ShellButton>
    <span className="empty-foot">Connessione tramite rclone e SSH, senza porte aperte.</span>
  </div>
}

function Field({ label, detail, children }: { label: string; detail?: string; children: ReactNode }): ReactNode {
  return <label className="field"><span className="field-label">{label}</span>{children}{detail && <span className="field-hint">{detail}</span>}</label>
}

function MountModal({ original, remotes, platform, onClose, onSave, onDelete, notify, apiBusy }: {
  original: MountConfig; remotes: string[]; platform: string; onClose: () => void;
  onSave: (m: MountConfig) => Promise<void>; onDelete: (id: string) => Promise<void>;
  notify: (text: string, type?: 'success' | 'error') => void; apiBusy: boolean
}): ReactNode {
  const [m, setM] = useState<MountConfig>(() => structuredClone(original))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isNew] = useState(!original.name)
  const patch = (key: keyof MountConfig, value: unknown): void => setM(prev => ({ ...prev, [key]: value }))
  const backupPatch = (key: keyof MountConfig['backup'], value: unknown): void => setM(prev => ({ ...prev, backup: { ...prev.backup, [key]: value } }))

  const browseMount = async (): Promise<void> => {
    const parent = await window.drive.chooseDirectory()
    if (!parent) return
    const slug = (m.name || 'Drive Tambu').trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-')
    const sep = platform === 'win32' ? '\\' : '/'
    patch('localPath', parent.replace(/[\\/]+$/, '') + sep + slug)
  }
  const browseBackup = async (): Promise<void> => {
    const folder = await window.drive.chooseDirectory()
    if (folder) backupPatch('destination', folder)
  }
  const save = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setSaving(true)
    try { await onSave(m) } finally { setSaving(false) }
  }
  return <div className="modal-scrim" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label="Configurazione cartella">
      <div className="modal-head">
        <div><span className="eyebrow">LA TUA LIBRERIA</span><h2>{isNew ? 'Nuova cartella' : 'Impostazioni cartella'}</h2><p>Personalizza il collegamento al tuo server.</p></div>
        <button type="button" className="modal-close" aria-label="Chiudi" onClick={onClose}><X size={18}/></button>
      </div>
      {confirmDelete ? <div className="confirm-delete">
        <div className="confirm-icon"><Trash2 size={24}/></div>
        <h3>Rimuovere {m.name}?</h3>
        <p>Elimineremo il collegamento dall'app. I file sul server e gli eventuali backup locali non verranno cancellati.</p>
        <div className="modal-foot"><ShellButton onClick={() => setConfirmDelete(false)}>Annulla</ShellButton><ShellButton kind="danger" onClick={() => void onDelete(m.id)} disabled={apiBusy}>Rimuovi cartella</ShellButton></div>
      </div> : <form onSubmit={event => void save(event)}>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Nome cartella"><input required maxLength={80} placeholder="Es. Documenti" value={m.name} onChange={e => patch('name', e.target.value)} /></Field>
            <Field label="Remote rclone" detail="Deve esistere gia in rclone config.">
              <input required list="remote-options" value={m.remote} placeholder="server" onChange={e => patch('remote', e.target.value)} />
              <datalist id="remote-options">{remotes.map(r => <option key={r} value={r}/>)}</datalist>
            </Field>
          </div>
          <Field label="Percorso sul server" detail="Percorso SFTP, ad esempio /home/server/services/filebrowser/data."><input required spellCheck={false} placeholder="/percorso/della/cartella" value={m.remotePath} onChange={e => patch('remotePath', e.target.value)} /></Field>
          <Field label="Cartella sul computer" detail={platform === 'win32' ? 'Seleziona la cartella superiore: Drive Tambu crea automaticamente il punto di montaggio, che non deve esistere gia.' : 'La cartella sara creata se manca e deve essere vuota.'}>
            <div className="input-with-button"><input required spellCheck={false} placeholder={platform === 'win32' ? 'C:\\Users\\...\\Documenti' : '/home/utente/Documenti/...'} value={m.localPath} onChange={e => patch('localPath', e.target.value)} /><button type="button" onClick={() => void browseMount()}><Folder size={16}/> Sfoglia</button></div>
          </Field>
          <div className="setting-switch compact"><div><strong>Collega all'avvio</strong><p>Riconnetti questa cartella quando apri Drive Tambu.</p></div><Toggle checked={m.autoConnect} onChange={v => patch('autoConnect', v)} /></div>
          <div className="form-divider" />
          <div className="section-title-row"><div className="heading-with-icon"><span className="small-icon violet"><DatabaseBackup size={17}/></span><div><h3>Backup locale</h3><p>Conserva una copia e le versioni precedenti sul PC.</p></div></div><Toggle checked={m.backup.enabled} onChange={v => backupPatch('enabled', v)}/></div>
          {m.backup.enabled && <div className="backup-form">
            <Field label="Frequenza"><select value={m.backup.intervalMinutes} onChange={e => backupPatch('intervalMinutes', Number(e.target.value))}>
              <option value={0}>Solo manualmente</option><option value={30}>Ogni 30 minuti</option><option value={60}>Ogni ora</option><option value={360}>Ogni 6 ore</option><option value={1440}>Ogni giorno</option>
            </select></Field>
            <Field label="Destinazione backup" detail="Non deve trovarsi dentro nessuna cartella montata."><div className="input-with-button"><input required value={m.backup.destination} placeholder="Dove conservare corrente e archivio" onChange={e => backupPatch('destination', e.target.value)} /><button type="button" onClick={() => void browseBackup()}><Folder size={16}/> Sfoglia</button></div></Field>
            <Field label="Conserva versioni per (giorni)" detail="0 significa nessuna pulizia automatica."><input type="number" min={0} max={36500} value={m.backup.retentionDays} onChange={e => backupPatch('retentionDays', Number(e.target.value))}/></Field>
            <div className="info-inline"><ShieldCheck size={15}/> Il backup va dal server al PC. Le versioni sostituite o eliminate vengono archiviate.</div>
          </div>}
        </div>
        <div className="modal-foot">
          <div className="modal-left-actions">{!isNew && <ShellButton kind="ghost" onClick={() => setConfirmDelete(true)}><Trash2 size={16}/> Rimuovi</ShellButton>}</div>
          <ShellButton onClick={onClose}>Annulla</ShellButton>
          <button type="submit" disabled={saving || apiBusy} className="button button-primary">{saving ? <LoaderCircle size={16} className="spin"/> : <Check size={16}/>} Salva cartella</button>
        </div>
      </form>}
    </div>
  </div>
}

function SettingsPage({ snapshot, deps, onSave, onCheck, busy }: {
  snapshot: Snapshot; deps: Dependencies | null; onSave: (s: AppSettings) => Promise<void>; onCheck: () => void; busy: boolean
}): ReactNode {
  const [settings, setSettings] = useState(snapshot.settings)
  useEffect(() => setSettings(snapshot.settings), [snapshot.settings.rcloneExecutable, snapshot.settings.cacheMaxSize, snapshot.settings.startAtLogin, snapshot.settings.closeToTray])
  const patch = (key: keyof AppSettings, value: string | boolean): void => setSettings(prev => ({ ...prev, [key]: value }))
  return <div className="page-block settings-page">
    <div className="section-heading"><span className="eyebrow">PERSONALIZZA</span><h1>Impostazioni</h1><p>Un posto solo per tutto quello che conta.</p></div>
    <div className="settings-panel">
      <div className="settings-label"><span className="small-icon sky"><Laptop size={19}/></span><div><h3>App desktop</h3><p>Comportamento e avvio</p></div></div>
      <div className="setting-switch"><div><strong>Avvia con il computer</strong><p>Rendi Drive Tambu disponibile dopo l'accesso.</p></div><Toggle checked={settings.startAtLogin} onChange={v => patch('startAtLogin', v)} /></div>
      <div className="setting-switch"><div><strong>Rimani nell'area di notifica</strong><p>Chiudendo la finestra, i collegamenti continuano a funzionare.</p></div><Toggle checked={settings.closeToTray} onChange={v => patch('closeToTray', v)} /></div>
      <div className="form-divider"/>
      <div className="settings-label"><span className="small-icon violet"><CloudCog size={19}/></span><div><h3>Motore rclone</h3><p>Collegamenti e cache intelligente</p></div></div>
      <Field label="Percorso dell'eseguibile"><input spellCheck={false} value={settings.rcloneExecutable} onChange={e => patch('rcloneExecutable', e.target.value)} placeholder="rclone" /></Field>
      <Field label="Limite cache locale" detail="I file vengono scaricati solo quando servono; la cache puo usare spazio sul PC."><input value={settings.cacheMaxSize} onChange={e => patch('cacheMaxSize', e.target.value)} placeholder="5G" /></Field>
      <div className="diagnostic-row"><div className={`diag-icon ${deps?.rclone.ok ? 'is-ok' : 'is-bad'}`}>{deps?.rclone.ok ? <Check size={17}/> : <CircleAlert size={17}/>}</div><div><strong>{deps ? deps.rclone.ok ? 'rclone disponibile' : 'rclone non trovato' : 'Verifica in corso...'}</strong><p>{deps?.rclone.detail || 'Controllo dipendenze'}</p></div><ShellButton kind="ghost" onClick={onCheck}><RefreshCw size={16}/> Verifica</ShellButton></div>
      <div className="info-inline"><Info size={16}/>{deps?.note || 'Le dipendenze per montare il filesystem sono diverse tra Windows e Linux.'}</div>
      <div className="settings-submit"><ShellButton kind="primary" disabled={busy} onClick={() => void onSave(settings)}><Check size={16}/> Salva impostazioni</ShellButton></div>
    </div>
  </div>
}

function ActivityPage({ log }: { log: string[] }): ReactNode {
  return <div className="page-block activity-page">
    <div className="section-heading"><span className="eyebrow">TUTTO SOTTO CONTROLLO</span><h1>Attivita recente</h1><p>Collegamenti, backup e informazioni diagnostiche di questa sessione.</p></div>
    <div className="activity-list">
      {log.length ? log.map((item, index) => {
        const firstSpace = item.indexOf('  ')
        return <div className="activity-item" key={`${index}-${item}`}>
          <div className={`activity-icon ${/errore|non riuscito|fallito|terminato|ERROR/i.test(item) ? 'red' : 'blue'}`}>{/errore|non riuscito|fallito|terminato|ERROR/i.test(item) ? <CircleAlert size={17}/> : <CheckCheck size={17}/>}</div>
          <div className="activity-content"><strong>{item.slice(firstSpace + 2)}</strong><span>{item.slice(0, firstSpace)}</span></div>
        </div>
      }) : <div className="activity-blank">Nessuna attivita in questa sessione.</div>}
    </div>
  </div>
}

export default function App(): ReactNode {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [deps, setDeps] = useState<Dependencies | null>(null)
  const [page, setPage] = useState<Page>('folders')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<MountConfig | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const notify = useCallback((text: string, type: 'success' | 'error' = 'success') => setNotice({ text, type }), [])
  const refresh = useCallback(async () => {
    try { setSnapshot(await window.drive.snapshot()) } catch (error) { notify(String(error), 'error') }
  }, [notify])
  const refreshDependencies = useCallback(async () => {
    try { setDeps(await window.drive.diagnostics()) } catch (error) { notify(String(error), 'error') }
  }, [notify])
  useEffect(() => {
    void refresh(); void refreshDependencies()
    return window.drive.onChanged(() => void refresh())
  }, [refresh, refreshDependencies])
  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(null), notice.type === 'error' ? 9500 : 3800)
    return () => clearTimeout(timeout)
  }, [notice])
  const task = async (key: string, fn: () => Promise<unknown>, success?: string): Promise<boolean> => {
    setBusy(key)
    try { await fn(); if (success) notify(success); await refresh(); return true }
    catch (error) { notify(error instanceof Error ? error.message : String(error), 'error'); return false }
    finally { setBusy(null) }
  }
  const visible = useMemo(() => snapshot?.mounts.filter(m => `${m.name} ${m.remote} ${m.localPath}`.toLowerCase().includes(search.toLowerCase())) ?? [], [snapshot, search])
  const connected = snapshot?.mounts.filter(m => m.status === 'connected').length ?? 0
  const total = snapshot?.mounts.length ?? 0
  const workingBackups = snapshot?.mounts.filter(m => m.backup.enabled).length ?? 0
  const configured = deps?.rclone.ok ?? false
  const openNew = (): void => setEditing(newMount(deps?.remotes[0] ?? 'server'))
  const closeModal = (): void => setEditing(null)
  const saveMount = async (item: MountConfig): Promise<void> => {
    const ok = await task('save', () => window.drive.saveMount(item), 'Cartella salvata.')
    if (ok) closeModal()
  }
  const deleteMount = async (id: string): Promise<void> => {
    const ok = await task('delete', () => window.drive.deleteMount(id), 'Collegamento rimosso.')
    if (ok) closeModal()
  }
  const connect = async (m: MountView): Promise<void> => {
    await task(m.id, () => m.status === 'connected' ? window.drive.disconnect(m.id) : window.drive.connect(m.id))
  }
  if (!snapshot) return <div className="loading-screen"><Brand/><LoaderCircle className="spin" size={30}/><span>Preparazione del tuo spazio...</span></div>

  return <div className="app-shell">
    <aside className="sidebar">
      <Brand/>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Navigazione principale">
        <button className={`nav-item ${page === 'folders' ? 'selected' : ''}`} onClick={() => setPage('folders')}><LayoutGrid size={18}/><span>Le mie cartelle</span><span className="nav-counter">{total}</span></button>
        <button className={`nav-item ${page === 'activity' ? 'selected' : ''}`} onClick={() => setPage('activity')}><Activity size={18}/><span>Attivita</span></button>
      </nav>
      <div className="sidebar-section-label second-label">PREFERENZE</div>
      <nav className="sidebar-nav"><button className={`nav-item ${page === 'settings' ? 'selected' : ''}`} onClick={() => setPage('settings')}><Settings2 size={18}/><span>Impostazioni</span></button></nav>
      <div className="sidebar-bottom">
        <div className="system-state"><span className={`system-indicator ${configured ? 'system-good' : 'system-warning'}`} /><div><strong>{configured ? 'Sistema pronto' : 'Da configurare'}</strong><span>{configured ? 'rclone rilevato' : 'Controlla rclone'}</span></div><ChevronRight size={15} onClick={() => setPage('settings')}/></div>
        <div className="sidebar-footer"><span>Drive Tambu</span><span>v{snapshot.appVersion}</span></div>
      </div>
    </aside>

    <main className="main-view">
      <header className="topbar">
        <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={15}/><strong>{page === 'folders' ? 'Le mie cartelle' : page === 'activity' ? 'Attivita' : 'Impostazioni'}</strong></div>
        <div className="topbar-actions"><div className="topbar-status"><span className="topbar-status-dot" /> Il tuo cloud personale</div><div className="avatar">DT</div></div>
      </header>
      <div className="view-scroll">
        {page === 'folders' && <div className="page-block">
          <section className="hero">
            <div className="hero-copy"><div className="eyebrow"><span className="spark-dot"/> SEMPLICE. TUO. OVUNQUE.</div><h1>Le tue cartelle<span className="hero-period">.</span></h1><p>Il tuo server, a portata di click. Tutto organizzato, sempre accessibile.</p></div>
            <ShellButton kind="primary" onClick={openNew} className="add-button"><Plus size={18}/> Nuova cartella</ShellButton>
          </section>
          <section className="stat-strip" aria-label="Panoramica">
            <div className="stat"><span className="stat-icon blue"><Folder size={19}/></span><div><strong>{total.toString().padStart(2,'0')}</strong><span>Cartelle</span></div></div>
            <div className="stat"><span className="stat-icon mint"><CheckCheck size={20}/></span><div><strong>{connected.toString().padStart(2,'0')}</strong><span>Collegate</span></div></div>
            <div className="stat"><span className="stat-icon violet"><DatabaseBackup size={20}/></span><div><strong>{workingBackups.toString().padStart(2,'0')}</strong><span>Backup attivi</span></div></div>
          </section>
          <div className="content-columns">
            <section className="files-column">
              <div className="section-toolbar"><div><h2>La tua libreria</h2><p>Gestisci cartelle, collegamenti e backup.</p></div><div className="search-field"><Search size={17}/><input aria-label="Cerca cartelle" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca cartelle"/></div></div>
              {total === 0 ? <EmptyState onAdd={openNew} /> : visible.length ? <div className="mount-list">{visible.map(m => <MountCard key={m.id} mount={m} busy={busy === m.id} onOpen={() => void task('open', () => window.drive.openMount(m.id))} onEdit={() => setEditing(m)} onConnect={() => void connect(m)} onBackup={() => void task(`backup-${m.id}`, () => window.drive.backupNow(m.id), 'Backup completato.')}/>)}</div> : <div className="no-results">Nessuna cartella corrisponde alla ricerca.</div>}
            </section>
            <aside className="insights-column">
              <div className="insight-card cloud-insight"><div className="insight-label"><span className="icon-badge"><Cloud size={18}/></span><span>IL TUO SPAZIO</span></div><div className="cloud-illustration"><div className="cloud-shape c1"/><div className="cloud-shape c2"/><div className="illustration-folder"><FolderClosed size={49} strokeWidth={1.3}/></div></div><h3>I tuoi file. Sempre dove servono.</h3><p>Lavora direttamente sui file del server, senza sincronizzare l'intero archivio sul computer.</p><div className="insight-bottom"><ShieldCheck size={15}/> Connessione protetta via SSH</div></div>
              <div className="insight-card backup-insight"><div className="insight-label"><span className="icon-badge purple"><DatabaseBackup size={18}/></span><span>BACKUP LOCALI</span></div><h3>Un pensiero in meno.</h3><p>Conserva copie e versioni precedenti in una cartella separata.</p><div className="side-stat"><span>Cartelle protette</span><strong>{workingBackups} <span>/ {total}</span></strong></div><div className="progress-track"><div style={{width: total ? `${100 * workingBackups / total}%` : '0%'}} /></div></div>
              <button className="help-card" onClick={() => setPage('settings')}><Info size={17}/><span>Configura rclone e verifica le dipendenze</span><ArrowRight size={16}/></button>
            </aside>
          </div>
        </div>}
        {page === 'activity' && <ActivityPage log={snapshot.log} />}
        {page === 'settings' && <SettingsPage snapshot={snapshot} deps={deps} onCheck={() => void refreshDependencies()} onSave={async s => { await task('settings', () => window.drive.saveSettings(s), 'Impostazioni salvate.'); void refreshDependencies() }} busy={busy === 'settings'} />}
        <footer className="main-footer"><ShieldCheck size={14}/> Progettato per il tuo cloud, non per raccogliere i tuoi dati.<span>Windows + Linux</span></footer>
      </div>
    </main>
    {editing && <MountModal original={editing} remotes={deps?.remotes ?? []} platform={snapshot.platform} onClose={closeModal} onSave={saveMount} onDelete={deleteMount} notify={notify} apiBusy={busy !== null}/>}
    {notice && <div className={`toast toast-${notice.type}`} role="status">{notice.type === 'success' ? <CircleCheck size={18}/> : <CircleAlert size={18}/>} <span>{notice.text}</span><button aria-label="Chiudi notifica" onClick={() => setNotice(null)}><X size={15}/></button></div>}
  </div>
}
