import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Check, CircleAlert, CircleCheck, Download, FolderOpen, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { Dialog } from './Dialog'
import type { ConnectionDraft, ManagedConnection, PreparedConnection, SetupReport } from '../../shared/setup'

const emptyDraft = (): ConnectionDraft => ({name:'', mode:'existing', host:'', user:'', port:22, keyPath:''})
const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error)).replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '')

/** The renderer sends structured fields only. All writes, identity checks and installs belong to main. */
export function SetupWizard({onClose, onSaved}: {onClose: () => void; onSaved: (connection: ManagedConnection) => void | Promise<void>}): ReactNode {
  const [report, setReport] = useState<SetupReport | null>(null)
  const [draft, setDraft] = useState<ConnectionDraft>(emptyDraft)
  const [prepared, setPrepared] = useState<PreparedConnection | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [action, setAction] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const working = useRef(false)
  const pending = useRef<string | null>(null)

  const perform = async (label: string, task: () => Promise<void>): Promise<void> => {
    if (working.current) return
    working.current = true; setBusy(true); setAction(label); setError(''); setNotice('')
    try { await task() }
    catch (failure) { setError(messageOf(failure)) }
    finally { working.current = false; setBusy(false); setAction('') }
  }
  const inspect = (): Promise<void> => perform('Verifica dei componenti', async () => { setReport(await window.drive.setupReport()) })
  useEffect(() => {
    void inspect()
    return () => { if (pending.current) void window.drive.cancelConnection(pending.current).catch(() => {}) }
  }, [])
  const change = <K extends keyof ConnectionDraft>(key: K, value: ConnectionDraft[K]): void => {
    setDraft(current => ({...current, [key]:value})); setError(''); setNotice('')
  }
  const edit = (): Promise<void> => perform('Annullamento verifica', async () => {
    if (pending.current) await window.drive.cancelConnection(pending.current)
    pending.current = null; setPrepared(null); setConfirmed(false)
  })
  const close = (): void => {
    if (working.current) return
    void perform('Chiusura configurazione', async () => {
      if (pending.current) await window.drive.cancelConnection(pending.current)
      pending.current = null; onClose()
    })
  }
  const check = (event: FormEvent): Promise<void> => {
    event.preventDefault()
    return perform('Verifica del server', async () => {
      const result = await window.drive.prepareConnection(draft)
      pending.current = result.token; setPrepared(result); setConfirmed(false)
    })
  }
  const unavailable = report?.components.some(c => (c.id === 'rclone' || c.id === 'ssh' || (draft.mode === 'cloudflare' && c.id === 'cloudflared')) && c.state !== 'ready') ?? true
  const stateLabel = {ready:'Disponibile', missing:'Mancante', incompatible:'Da aggiornare', error:'Da verificare'}

  return <Dialog title="Configura il tuo server" subtitle="Componenti, connessione e verifica. Le configurazioni esistenti restano al loro posto." busy={busy} onClose={close}>
    <div className="modal-body setup-wizard">
      <section className="setup-section" aria-label="Componenti necessari">
        <div className="section-title"><Download size={20}/><div><h3>1. Prepara il computer</h3><p>rclone e cloudflared sono inclusi nel pacchetto completo dell'app.</p></div></div>
        {report && <><div className="setup-components">{report.components.map(component => <div key={component.id} className={`setup-component setup-${component.state}`}>
          {component.state === 'ready' ? <CircleCheck size={19}/> : <CircleAlert size={19}/>}
          <div><strong>{component.name}</strong><span>{stateLabel[component.state]}{component.optional ? ' - necessario per Cloudflare' : ''}</span><p>{component.detail}</p></div>
        </div>)}</div><p className="field-hint">{report.installationNote}</p>
          {report.restartRequired && <p className="info-box" role="status">Il sistema richiede un riavvio per completare l'installazione. Salva il lavoro e riavvia il computer prima di collegare le cartelle.</p>}</>}
        <div className="button-row">
          <button type="button" className="button button-secondary" disabled={busy} onClick={inspect}><RefreshCw size={16}/> Controlla componenti</button>
          {report?.canInstall && <button type="button" className="button button-primary" disabled={busy} onClick={() => perform('Installazione dei componenti: completa la richiesta del sistema', async () => {setReport(await window.drive.installComponents())})}><Download size={16}/> Installa componenti mancanti</button>}
        </div>
      </section>
      {error && <div className="error-box" role="alert"><CircleAlert size={18}/><span>{error}</span></div>}
      {notice && <div className="success-box" role="status"><CircleCheck size={18}/><span>{notice}</span></div>}
      {busy && <div className="setup-status" role="status" aria-live="polite"><LoaderCircle className="spin" size={18}/>{action}</div>}
      {!prepared ? <form onSubmit={check}>
        <section className="setup-section">
          <div className="section-title"><ShieldCheck size={20}/><div><h3>2. Aggiungi una connessione</h3><p>Usa una chiave gia autorizzata sul server oppure una connessione SSH funzionante.</p></div></div>
          <fieldset disabled={busy} className="setup-fields">
            <label className="field"><span className="field-label">Nome connessione</span><input required maxLength={80} aria-label="Nome connessione" placeholder="Per esempio, Casa" value={draft.name} onChange={e => change('name',e.target.value)}/></label>
            <label className="field"><span className="field-label">Tipo di connessione</span><select aria-label="Tipo di connessione" value={draft.mode} onChange={e => change('mode',e.target.value as ConnectionDraft['mode'])}>
              <option value="existing">Usa una connessione SSH esistente</option><option value="direct">SSH diretto</option><option value="cloudflare">Cloudflare Tunnel</option>
            </select></label>
            <label className="field"><span className="field-label">Indirizzo del server</span><input required maxLength={253} autoCapitalize="none" spellCheck={false} aria-label="Indirizzo del server" placeholder={draft.mode === 'existing' ? 'Nome host o alias SSH' : 'server.example.com'} value={draft.host} onChange={e => change('host',e.target.value)}/><span className="field-hint">Solo l'indirizzo, senza scrivere il comando ssh. Nessun server e preimpostato.</span></label>
            <label className="field"><span className="field-label">Utente SSH{draft.mode === 'existing' ? ' (facoltativo)' : ''}</span><input required={draft.mode !== 'existing'} maxLength={64} autoCapitalize="none" spellCheck={false} aria-label="Utente SSH" value={draft.user} onChange={e => change('user',e.target.value)}/></label>
            {draft.mode !== 'cloudflare' && <label className="field"><span className="field-label">Porta SSH</span><input required type="number" min={1} max={65535} step={1} aria-label="Porta SSH" value={Number.isFinite(draft.port) ? draft.port : ''} onChange={e => change('port',e.target.value === '' ? NaN : Number(e.target.value))}/><span className="field-hint">Con un host esistente, 22 mantiene l'eventuale porta della configurazione SSH.</span></label>}
            <label className="field"><span className="field-label">Chiave SSH esistente</span><div className="input-with-button"><input readOnly aria-label="Chiave SSH esistente" value={draft.keyPath} placeholder="Usa le chiavi predefinite o l'agente SSH"/><button type="button" onClick={() => perform('Scelta chiave SSH', async () => {const key=await window.drive.chooseSshKey(); if(key)change('keyPath',key)})}><FolderOpen size={16}/> Sfoglia chiave</button></div><span className="field-hint">La chiave resta sul computer: l'app salva solo il percorso. L'agente deve essere sbloccato; non vengono richieste password SSH.</span></label>
            {draft.keyPath && <button type="button" className="button button-ghost" onClick={() => change('keyPath','')}>Usa agente o chiavi predefinite</button>}
            {draft.mode === 'existing' && <p className="info-box">Viene riutilizzata la configurazione OpenSSH di questo computer, compreso l'eventuale tunnel. La configurazione esistente non viene modificata.</p>}
            {draft.mode === 'cloudflare' && <><p className="info-box">Il tunnel deve essere gia pubblicato sul server. Completa l'accesso nel browser quando richiesto; la sessione Cloudflare puo scadere.</p><button type="button" className="button button-secondary" disabled={!draft.host.trim()} onClick={() => perform('Accesso Cloudflare: completa la finestra del browser', async () => {await window.drive.cloudflareLogin(draft.host); setNotice('Accesso Cloudflare completato. Ora verifica la connessione SFTP.')})}>Accedi a Cloudflare</button></>}
          </fieldset>
        </section>
        <div className="modal-footer"><button type="button" className="button button-secondary" disabled={busy} onClick={close}>Usa connessioni esistenti / Chiudi</button><button type="submit" className="button button-primary" disabled={busy || unavailable}><ShieldCheck size={16}/> Verifica server</button></div>
        {unavailable && <p className="field-hint">Controlla prima i componenti di connessione. Il componente di montaggio puo essere installato prima di collegare le cartelle.</p>}
      </form> : <section className="setup-section" aria-label="Conferma connessione">
        <div className="section-title"><ShieldCheck size={20}/><div><h3>2. Conferma il server</h3><p>{prepared.name} - {prepared.host}</p></div></div>
        {prepared.fingerprints.length ? <><p>Questa e la chiave pubblica presentata dal server. Confronta l'impronta con quella fornita dall'amministratore attraverso un canale affidabile prima di autorizzare l'accesso.</p><pre className="setup-fingerprint">{prepared.fingerprints.join('\n')}</pre>
          <label className="setup-confirm"><input type="checkbox" aria-label="Confermo l'identita del server" disabled={busy} checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/><span>Ho confrontato l'impronta e confermo l'identita del server.</span></label><p className="field-hint">Fino a questa conferma non sono state offerte credenziali SSH al nuovo server. Dopo la conferma verra verificato l'accesso SFTP.</p></> : <p className="success-box"><CircleCheck size={18}/> Accesso SFTP verificato usando la connessione SSH esistente e i suoi controlli di identita.</p>}
        <p className="field-hint">La verifica scade dopo dieci minuti. Un cambiamento della chiave blocca l'accesso; non verra ignorato automaticamente.</p>
        <div className="modal-footer"><button type="button" className="button button-secondary" disabled={busy} onClick={edit}>Modifica dati</button><button type="button" className="button button-primary" disabled={busy || (prepared.fingerprints.length > 0 && !confirmed)} onClick={() => perform('Verifica SFTP e salvataggio', async () => {
          const result = await window.drive.saveConnection(prepared.token, true)
          pending.current = null
          await onSaved(result)
        })}><Check size={16}/> Salva connessione</button></div>
      </section>}
      <p className="field-hint">Nessuna chiave viene creata o autorizzata sul server da questa procedura. Le connessioni rclone gia presenti non vengono sovrascritte.</p>
    </div>
  </Dialog>
}
