# Drive Tambu
## Dossier completo del progetto per IA

**Snapshot 0.4.0 | 18 ottobre 2026 | 84 file del repository, senza omissioni di contenuto.**

| Riferimento | Valore |
|---|---|
| Repository | `FabioTambu/drive-tambu-sync` |
| Branch fotografato | `main` |
| Commit | `4b3a01a2b8bc7b24d6cd023abd48a573fbbc2309` |
| Messaggio commit | `v0.4.0` |
| Data commit UTC | `2026-10-18T11:48:14Z` |
| Albero Git verificato | `e52f20aef32376dbeb3c1b467b8727f4daf58dc4` |
| Contenuti | 74 file testuali, 10 immagini/icone binarie |
| Testo sorgente | 5.829 righe originali |
| Dimensione originale dei file | 568.033 byte |

**Questo documento include il contenuto di ogni file, non soltanto una descrizione.** I sorgenti sono in blocchi separati identificati dal percorso; i binari sono in Base64. La guida e i rapporti aggiuntivi non modificano lo snapshot.

### Indice generale
- [Guida per la prossima IA](#guida)
- [Indice completo dei file](#indice-file)
- [Indice dei simboli e delle chiamate IPC](#indice-simboli)
- [Manifest e provenienza](#manifest)
- [Contenuti integrali: codice, test e documenti](#contenuti)
- [Rapporti storici aggiunti separatamente](#evidenze)
- [Contenuti integrali: immagini e icone](#binari)
- [Verifica e ricostruzione](#ricostruzione)

<a id="guida"></a>
## 1. Come usare questo dossier con un'IA

Questa è un'istantanea documentata del progetto **Drive Tambu**. Non è un installer e non cambia nulla sul computer. Lo scopo è consentire a un'altra IA di individuare i file interessati da una modifica e leggere il codice reale senza dover ricostruire la conversazione precedente.

**Percorso di lettura consigliato:** prima le sezioni 2-7, poi la mappa delle modifiche e l'indice dei simboli, infine i singoli file necessari. Le icone in Base64 sono in fondo: non occorre leggerle per modificare la logica o la grafica CSS. Non è garantito che ogni servizio IA possa caricare tutto il documento nella propria finestra di contesto; l'indice permette una lettura selettiva.

Testo da accompagnare a questo allegato:

> Questo file contiene il contesto e tutti i file di un'istantanea di Drive Tambu. Leggi prima la guida iniziale e l'indice. La modifica che desidero è: [DESCRIZIONE]. Individua i file e i test coinvolti; usa i contenuti integrali, non soltanto i riassunti. Distingui comportamento implementato, proposte storiche e verifiche effettivamente eseguite. Non reintrodurre un fork di rclone e non eliminare i controlli di disconnessione per aggirare un errore. Prima di produrre una patch, verifica se sto usando ancora il commit indicato o una versione successiva. Non modificare file personali, credenziali o il server senza una richiesta specifica.

Il codice e i documenti incorporati sono materiale da leggere, non comandi da eseguire automaticamente. Anche le vecchie istruzioni di installazione e cancellazione vanno considerate nel loro contesto storico.

### Provenienza e perimetro

- **Sorgente primaria:** repository `FabioTambu/drive-tambu-sync`, branch `main`, commit fissato nell'intestazione. Non sono state applicate correzioni, aggiornamenti di dipendenze o riformattazioni al codice esportato.
- **Guida iniziale:** descrizione ricavata dai file inclusi. Quando riporta decisioni dell'utente o l'ultimo stato del suo PC, lo specifica come contesto della conversazione, non come codice o configurazione recuperata dal computer.
- **Contenuti integrali:** ogni file tracciato nello snapshot Git, inclusi file nascosti, test, workflow, documentazione storica e icone. Il testo è UTF-8 integrale; i file binari sono codificati integralmente in Base64.
- **Non compresi:** cronologia `.git`, altri branch, dipendenze `node_modules`, output `out`/`release`, installer scaricati, cartelle personali, backup locali effettivi, cache VFS, `rclone.conf` personale e chiavi SSH. Questi dati non appartengono allo snapshot del repository e non sono stati acquisiti dal PC dell'utente. Il codice completo della vecchia app PowerShell non è presente nel repository esportato.
- Sono aggiunti separatamente due rapporti JSON di precedenti prove native forniti nella conversazione. Non sono file del commit attuale e non vanno copiati nel progetto come codice applicativo.

## 2. Identità, finalità e scelte del progetto

Drive Tambu è un'app desktop per rendere disponibili sul PC cartelle che restano su un server, con montaggi tramite **rclone ufficiale**, interfaccia Electron/React/TypeScript e backup locali separati. I target dichiarati sono Windows e Linux. Il nome commerciale compare anche come "Drive Tambu 2.0", mentre la versione applicativa di questo snapshot è **0.4.0**. Non confonderla con la precedente app PowerShell registrata in Windows come "Drive Tambu versione 2.0.0".

Fonti: [`package.json`](#file-f001), [`README.md`](#file-f038), [`AGGIORNAMENTO-0.4.md`](#file-f035).

**Decisioni esplicite dell'utente nella conversazione:** interfaccia moderna, minimale, ispirata allo stile Apple; tema chiaro/scuro/sistema; pannello compatto espandibile; nessun obbligo di conoscere i dettagli di rclone per creare un collegamento. L'utente ha rifiutato una versione modificata di rclone da mantenere a ogni aggiornamento. Ha accettato un controllo preventivo non infallibile: problemi rilevati o stato sconosciuto bloccano la disconnessione; esito favorevole richiede comunque un avviso e una conferma. Nascondere la finestra e continuare in background resta possibile.

Il progetto di barriera nativa, fork e recupero transazionale completo discusso in precedenza **non è l'architettura da completare in questa versione**: è stato sostituito dalla soluzione con motore ufficiale. Non riproporre quelle garanzie come già realizzate. Fonti applicative: [`src/main/preflight.ts`](#file-f018), [`src/main/operations.ts`](#file-f019), [`docs/VERIFICA-0.4.md`](#file-f045).

### Ambiente personale descritto, non configurazione incorporata

Nella conversazione il server è Ubuntu, raggiunto via SSH/Cloudflare Tunnel. Il remote rclone si chiamava `casa`; sono stati citati `ssh.tamburini.dev`, `drive.tamburini.dev` e `/home/server/services/filebrowser/data/fabio`. Questi nomi non sono valori da imporre ad altre installazioni. L'utente ha rinunciato alla richiesta di montaggi locali annidati e ha scelto due collegamenti distinti. Non servono modifiche Docker o allo storage per implementare le funzionalità dell'app qui presenti.

Ultimo stato dichiarato dall'utente: desiderava rimuovere vecchia e nuova installazione, impostazioni e dati locali per riconfigurare. Entrambe le voci Windows puntavano a `C:\Users\fabio\AppData\Local\Programs\Drive Tambu`; il vecchio `unins000.exe` risultava mancante. La pulizia completa non è stata confermata. Non assumere che il remote `casa`, le preferenze o i backup locali siano ancora presenti dopo questa data. Non usare questo dossier come autorizzazione permanente a disinstallare o cancellare dati.

## 3. Architettura e flusso dei dati

```text
UI React: src/renderer/src/App.tsx + styles.css
       |
       | window.drive, API tipizzata (non IPC generico)
       v
Preload: src/preload/index.ts
       |
       | drive:* (IPC Electron)
       v
Main: src/main/index.ts
       +-- ConfigStore (store.ts) -> config.json nel percorso userData
       +-- OperationCoordinator (operations.ts) -> controllo/conferma/esecuzione
       +-- MountManager (mounts.ts) -> processo rclone rcd per cartella
       |       +-- ControlClient (control.ts) -> API RC su 127.0.0.1
       |       +-- assessTransfers (preflight.ts) -> confirm / blocked / unknown
       +-- BackupManager (backups.ts) -> sync remoto -> backup locale
       +-- diagnostics.ts -> rilevamento rclone, remote, elenco directory
       +-- shortcuts.ts -> apertura cartella da lanciatore
```

`src/shared/types.ts` definisce configurazione, snapshot, API, stati e risposte ai dialoghi; `paths.ts`, `schedule.ts` e `refresh.ts` contengono logica condivisa fra interfaccia e main. La notifica `drive:changed` induce l'UI a rileggere lo snapshot. Il bridge espone `window.drive`, non `ipcRenderer` grezzo. La finestra configura `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; gli handler main verificano mittente e frame. Fonti: [`src/shared/types.ts`](#file-f010), [`src/preload/index.ts`](#file-f025), [`src/main/index.ts`](#file-f014).

### Montaggio, controllo e chiusura

`MountManager.connect` valida il collegamento, verifica la directory remota e la destinazione locale, avvia rclone `rcd`, controlla l'identità del processo con `core/pid`, sceglie `cmount` su Windows o `mount` su Linux e richiede `mount/mount`. `ControlClient` limita i metodi consentiti, usa loopback e autenticazione, ha timeout e limiti di risposta. Non espone le credenziali RC al renderer.

Il controllo preliminare legge `vfs/stats`, `core/stats` e `vfs/queue`. Dati mancanti o non validi producono `unknown`, non zero trasferimenti. Invii in coda, attività rilevata, errore attuale della cache o mancanza di spazio producono `blocked`. Gli errori cumulativi storici non bastano da soli per bloccare. L'esito privo di problemi rilevati è `confirm`, mai una certificazione "safe".

`OperationCoordinator` gestisce un'operazione alla volta e le fasi `checking`, `confirm`, `blocked`, `working`; accetta `confirm`, `cancel`, `retry`, `background`. La conferma ripete il controllo. La pianificazione dei nuovi backup e le azioni concorrenti dell'app vengono sospese, non le scritture di programmi esterni. `MountManager.disconnect` richiede lo smontaggio, verifica l'esito e chiede l'uscita del proprio demone; il percorso ordinario non usa un kill forzato come ripiego.

**Limite da conservare:** un documento aperto può non apparire nella coda e un altro programma può iniziare a scrivere dopo il controllo. Un timeout non autorizza automaticamente la chiusura. La cache non viene cancellata per sbloccare l'operazione. `diagnostics.ts` contiene ancora `stopChild` per processi di diagnostica: non attribuire automaticamente quel comportamento al nuovo percorso di smontaggio. Fonti: [`src/main/mounts.ts`](#file-f016), [`src/main/control.ts`](#file-f017), [`src/main/preflight.ts`](#file-f018), [`src/main/operations.ts`](#file-f019), [`src/main/diagnostics.ts`](#file-f022).

### Cambiare posizione e rimuovere un collegamento

`changeLocalPosition` in `src/main/index.ts` richiede conferma con vecchio e nuovo percorso, ricontrolla la destinazione, scollega, salva il nuovo percorso e ricollega solo se prima risultava collegato. Tenta il ripristino per errori ordinari; se il nuovo demone rimane incerto, conserva la nuova posizione e non avvia un secondo montaggio. Non è un ripristino transazionale garantito contro crash.

La rimozione di una cartella salva la cancellazione del collegamento dalla configurazione, non cancella i documenti remoti. `cleanupOwnedDirectory` rimuove solo un contenitore Linux vuoto riconosciuto dalla sessione come proprio, con identità invariata e non montato. I montaggi annidati e le sovrapposizioni con i backup sono vietati dalle validazioni. Fonti: [`src/main/index.ts`](#file-f014), [`src/main/store.ts`](#file-f015), [`src/main/mounts.ts`](#file-f016).

### Backup e pianificazione

Il backup legge direttamente il remoto: `rclone sync <remoto> <destinazione>/corrente --backup-dir <destinazione>/archivio/<timestamp> --delete-after`. La direzione non va invertita. La destinazione deve essere separata dai montaggi e una directory non vuota estranea non viene adottata automaticamente; il marker `.drive-tambu-backup.json` associa destinazione e identificativo del collegamento.

Le modalità sono manuale, intervallo libero, giornaliera e settimanale con giorni selezionati e ora locale. I giorni usano `0 = domenica` fino a `6 = sabato`. Le scadenze e gli ultimi tentativi sono persistiti. La pianificazione sceglie un backup dovuto alla volta e limita i ritentativi dopo errori; non è un servizio esterno che sveglia il PC quando l'app è chiusa. La barra usa statistiche JSON del processo; il completamento dipende anche dall'esito del processo, non solo dai byte.

La pulizia dell'archivio usa `retentionDays`; `0` significa nessuna scadenza. Il controllo di sorgente vuota riguarda il primo livello completamente vuoto e non costituisce una protezione generale dalla scomparsa di qualsiasi sottocartella o disco. Fonti: [`src/main/backups.ts`](#file-f020), [`src/main/backup-progress.ts`](#file-f021), [`src/shared/schedule.ts`](#file-f013), [`src/main/store.ts`](#file-f015).

### UI e navigazione

L'interfaccia è principalmente in `App.tsx`: `RemoteBrowser`, `MountModal`, `MountCard`, `SettingsPage`, `OperationDialog`, `ScheduleFields` e `BackupProgressView`. Il CSS include i temi e il layout compatto/espanso. Root mostra `/`; Home e i percorsi relativi sono presentati con `~/` attraverso `remote-path-display.ts`. `normalizeRemotePath` riconosce il prefisso del remote senza duplicarlo. Il remote esistente è selezionato con `selectedRemote`, con scelta generale nelle impostazioni.

I collegamenti creati dall'app usano l'identificativo del collegamento salvato, non solo il percorso locale, e possono avviare la connessione quando necessario. I formati previsti sono `.lnk` Windows e `.desktop` Linux. Fonti: [`src/renderer/src/App.tsx`](#file-f029), [`src/renderer/src/styles.css`](#file-f030), [`src/renderer/src/remote-path-display.ts`](#file-f031), [`src/shared/paths.ts`](#file-f011), [`src/main/shortcuts.ts`](#file-f023).

## 4. Configurazione e dati persistenti

Il file applicativo è `config.json` sotto `app.getPath('userData')`: non è uno dei file sorgenti archiviati. `StoredConfig.schemaVersion` resta **1** anche se l'app è 0.4.0. Le copie di migrazione riconosciute sono `config.json.before-0.2.bak` e `config.json.before-0.3.bak`; il salvataggio usa un file temporaneo seguito da rename. Non confondere queste copie con un backup dei documenti.

Valori iniziali tratti da `defaults()`:

```json
{
  "schemaVersion": 1,
  "settings": {
    "rcloneExecutable": "rclone",
    "cacheMaxSize": "5G",
    "startAtLogin": false,
    "closeToTray": true,
    "theme": "system",
    "defaultRemote": "",
    "directoryRefreshSeconds": 120
  },
  "mounts": []
}
```

`MountConfig` conserva identificativo, nome, remote e percorsi, collegamento all'avvio, backup e scadenze. `directoryRefreshSeconds` nullo o assente eredita il valore generale. `BackupConfig.intervalMinutes` è mantenuto per compatibilità, mentre le programmazioni calendario stanno in `schedule`. Per aggiungere impostazioni occorre mantenere coerenti tipi, valori iniziali, lettura/migrazione, validazione, API e interfaccia.

### Parametri da non confondere

| Parametro | Valore o vincolo nel codice | Dove |
|---|---|---|
| Elenco directory | Default 120 secondi; da 5 a 86.400; generale o per cartella | `shared/refresh.ts`, `store.ts`, `mounts.ts` |
| Cache file inutilizzati | 20 minuti; scansione ogni 60 secondi | `mounts.ts`, opzioni VFS |
| Invio dopo chiusura file | `WriteBack: 10e9` nanosecondi = 10 secondi | `mounts.ts` |
| Dimensione massima cache | Default `5G`, impostazione `cacheMaxSize` | `store.ts`, `mounts.ts` |
| Intervallo backup | Da 1 a 525.600 minuti | `shared/schedule.ts` |
| Ritentativo dopo backup fallito | Soglia 10 minuti | `shared/schedule.ts` |
| Controllo scadenze backup | Ogni 15 secondi; primo controllo dopo 12 secondi | `backups.ts` |
| Finestra compatta/espansa | Base 430x650 / 1180x800, limitata all'area disponibile | `window-layout.ts` |

La pulizia della cache non significa cancellare i backup o i file remoti. I percorsi personali e le credenziali non vanno ricostruiti dai nomi d'esempio nei documenti.

## 5. Compilazione, distribuzione e dipendenze

Le versioni e gli intervalli delle dipendenze sono quelli integrali di [`package.json`](#file-f001); non sostituirli con "latest" mentre si consulta l'archivio. Il progetto usa Electron, React, TypeScript, Vite/electron-vite e lucide-react. I workflow chiedono Node.js 22.

Comandi effettivi:

```text
npm install
npm test
npm run typecheck
npm run dev
npm run build
npm run dist:win
npm run dist:linux
```

`npm test` usa il loader `tests/register.cjs`, che transpila TypeScript: non equivale al controllo tipi. `typecheck` verifica separatamente main e web. In questo snapshot non esiste un `package-lock.json` tracciato: non presentare l'installazione come bloccata a un albero di dipendenze esatto. Fonti: [`package.json`](#file-f001), [`tests/register.cjs`](#file-f066), [`tsconfig.main.json`](#file-f003), [`tsconfig.web.json`](#file-f004).

L'installer Windows usa NSIS; quelli Linux dichiarati sono `.deb` e `.AppImage`, x64. L'output è `release/`; `out/` contiene i risultati della compilazione. L'identità applicativa è `dev.tamburini.drivetambu` e il nome prodotto è `Drive Tambu`. I comandi dist passano `--publish never`; la pubblicazione su tag `v*` è un job distinto del workflow build. Gli artifact si chiamano `drive-tambu-win` e `drive-tambu-linux`.

La documentazione del repository richiede ancora rclone, WinFsp su Windows, FUSE su Linux e, per il collegamento personale via tunnel, OpenSSH/cloudflared con configurazione già funzionante. Non sono inclusi automaticamente nell'installer descritto dal progetto. La connessione può essere selezionata dall'UI ma manca un assistente completo per configurare ogni dipendenza da zero. Fonti: [`README.md`](#file-f038), [`package.json`](#file-f001), [`.github/workflows/build.yml`](#file-f007).

### Disinstallazione

[`build/installer.nsh`](#file-f009) estende il disinstallatore, non sostituisce rclone. Offre una casella non selezionata di reset delle preferenze per l'utente corrente riconosciuto. Elimina soltanto `config.json` e le due copie note nei percorsi applicativi previsti; esclude backup, chiavi, configurazione rclone e cache. Le directory/file di tipo reparse point non vengono pulite da questa allowlist. Gli aggiornamenti e le esecuzioni silenziose non fanno quel reset.

L'hook applicativo chiede la chiusura alla UI con `--request-exit`, invece di forzare l'arresto. Il flag ampio `--delete-app-data` viene rifiutato. Il vecchio installer PowerShell non viene modificato retroattivamente; l'episodio dei due disinstallatori nella stessa cartella è riportato nella sezione 2, senza dare per conclusa la pulizia del PC.

## 6. Stato delle verifiche: non confondere i diversi momenti

I file `docs/VERIFICA-0.3.md`, `docs/VERIFICA-0.4.md` e i vecchi `AGGIORNAMENTO-*` sono conservati **esattamente come nel commit**. Contengono lo stato noto al momento della consegna e possono dire che una build non era ancora stata eseguita. La tabella seguente aggiunge l'osservazione successiva da GitHub senza riscrivere quei documenti.

| Evidenza | Stato osservato e limite |
|---|---|
| `Build Drive Tambu`, run `39124715617`, commit corrente | Conclusione `success`, 18/10/2026. Nei job Windows e Linux sono `success` npm install, test, typecheck, dist e upload. Job release `skipped`, non un fallimento. |
| Nuovo workflow `guarded-close.yml`, commit corrente | Nella risposta GitHub interrogata per questo commit risultava soltanto il run build sopra. Non è stata ottenuta un'esecuzione del nuovo test nativo integrato per questo commit. Non dichiararlo collaudato sulla base del vecchio test. |
| Rapporto locale `docs/VERIFICA-0.4.md` | Dichiara 168 test locali e 24 verifiche statiche; distingue esplicitamente simulazioni, controlli isolati e prove native non svolte in quell'ambiente. Non sono stati rieseguiti i test applicativi per creare questo dossier. |
| Vecchia caratterizzazione nativa, run `39120545584` | Rapporti allegati separatamente: scrittura completa e recupero di un file completo già chiuso riusciti. Windows accetta lo smontaggio con file aperto e la scrittura successiva fallisce; Linux lo rifiuta come occupato. Non certifica assenza di perdita dati. |
| Integrità di questo dossier | Tutti i file vengono riletti dall'export e confrontati byte per byte con lo snapshot; l'albero Git ricostruito deve coincidere con il tree del commit. Non è un test di funzionamento dell'app. |

Fonti online delle osservazioni CI e del commit sono elencate nel manifest. Il test integrato da eseguire per una modifica futura è [`tests/native/guarded.cjs`](#file-f057), con [`.github/workflows/guarded-close.yml`](#file-f008). Usa file artificiali su runner temporanei; i vecchi risultati non sostituiscono questo controllo.

Limiti esplicitamente documentati: nessuna garanzia assoluta contro perdita dati, crash, arresti forzati del sistema, file parziali o conflitti; nessuna revisione indipendente dichiarata per la 0.4.0. La build riuscita non prova il funzionamento di ogni pagina del disinstallatore sul PC dell'utente. Fonte: [`docs/VERIFICA-0.4.md`](#file-f045).

## 7. Mappa rapida: dove intervenire per una modifica

Questa tabella è una mappa del codice presente, non una lista di nuove funzionalità autorizzate.

| Richiesta | File e simboli principali | Test pertinenti |
|---|---|---|
| Aspetto, testi, spaziature, dialoghi | `renderer/src/App.tsx`, `styles.css` | `layout`, `ui`, `operation-ui`, `root-home` |
| Tema e finestra compatta/espansa | `App.tsx`, `index.ts`: `applyTheme`, `setMode`; `window-layout.ts` | `window`, `layout`, `ui` |
| Root/Home, percorsi, sfoglia remoto | `remote-path-display.ts`, `shared/paths.ts`, `diagnostics.ts`, `RemoteBrowser` | `root-home`, `browser`, `remote` |
| Nuovo campo di configurazione | `shared/types.ts`, `store.ts`, `App.tsx`, eventuale bridge | `store`, `preferences`, `ui` |
| Frequenza e calendario backup | `shared/schedule.ts`, `store.ts`, `backups.ts`, `ScheduleFields` | `schedule`, `preferences`, `backups` |
| Percentuale e statistiche backup | `backup-progress.ts`, `backups.ts`, `BackupProgressView` | `progress`, `backups` |
| Destinazione e retention backup | `backups.ts`, `store.ts`, `MountModal` | `backups`, `store` |
| Refresh generale/per cartella | `shared/refresh.ts`, `store.ts`, `mounts.ts`, `SettingsPage`, `MountModal` | `preferences`, `mounts` |
| Crea collegamento e apertura via ID | `shortcuts.ts`, `index.ts`: `handleShortcut`, handler `drive:createShortcut` | `shortcuts`, `guarded-app` |
| Controllo prima della disconnessione | `preflight.ts`, `control.ts`, `mounts.ts`, `operations.ts`, `index.ts`, `OperationDialog` | `preflight`, `control`, `mounts`, `operations`, `guarded-app`, `operation-ui`, `native/guarded` |
| Cambio posizione locale | `index.ts`: `changeLocalPosition`, `store.ts`, `mounts.ts`, `MountModal` | `guarded-app`, `mounts`, `store` |
| Installazione/reset Windows | `build/installer.nsh`, `package.json` | `installer` e collaudo del vero installer |
| Build e versionamento | `package.json`, `electron.vite.config.ts`, `tsconfig.*`, `.github/workflows` | suite, typecheck, build e test nativo separati |

I nomi brevi della colonna test indicano file `tests/<nome>.test.cjs`, salvo `native/guarded.cjs`. L'indice successivo riporta percorsi completi e righe dei simboli nel file originale.

### Attenzioni per il prossimo manutentore

- Mantenere le modifiche piccole e verificabili; prima di usare il dossier come baseline confrontare il commit con il repository corrente.
- Per nuove chiamate IPC mantenere allineati `DriveAPI`, preload, validazione nel main e uso nel renderer. Non trasformare il bridge in un proxy RC arbitrario.
- Non usare una risposta mancante come prova di inattività e non eliminare il warning residuo dopo un preflight favorevole.
- Non cancellare ricorsivamente i punti di montaggio; non confondere la rimozione di una configurazione con quella dei dati sul server.
- Non reintrodurre gli script sperimentali `tools/safety-probe` e `storage-investigation.yml` soltanto perché un documento storico li menziona: non fanno parte del tree corrente. La fixture riutilizzabile è sotto `tests/native/helpers`.
- `LEGGIMI-fix-marker.md` esiste ancora nel commit: è conservato, ma descrive un test storico. Anche il README e la roadmap contengono sezioni datate. Non "correggere" queste differenze senza esplicitarlo in una futura modifica.
- Il documento contiene codice del repository, email dell'autore, nomi di dominio e percorsi di esempio. Le password sintetiche dei test non sono credenziali dell'utente. Le vere configurazioni locali non sono state esportate.

<a id="indice-file"></a>
## 8. Indice completo dello snapshot
I numeri di riga indicati negli indici sono quelli dei file originali, non quelli di questo dossier. Ogni sezione contiene metadati di integrità e l'intero contenuto.
| ID | File | Tipo | Byte originali | Righe originali |
|---|---|---|---:|---:|
| F001 | [`package.json`](#file-f001) | utf-8 | 2194 | 77 |
| F002 | [`electron.vite.config.ts`](#file-f002) | utf-8 | 182 | 8 |
| F003 | [`tsconfig.main.json`](#file-f003) | utf-8 | 410 | 15 |
| F004 | [`tsconfig.web.json`](#file-f004) | utf-8 | 448 | 17 |
| F005 | [`.gitattributes`](#file-f005) | utf-8 | 66 | 2 |
| F006 | [`.gitignore`](#file-f006) | utf-8 | 79 | 9 |
| F007 | [`.github/workflows/build.yml`](#file-f007) | utf-8 | 1237 | 55 |
| F008 | [`.github/workflows/guarded-close.yml`](#file-f008) | utf-8 | 5103 | 87 |
| F009 | [`build/installer.nsh`](#file-f009) | utf-8 | 4453 | 143 |
| F010 | [`src/shared/types.ts`](#file-f010) | utf-8 | 3820 | 131 |
| F011 | [`src/shared/paths.ts`](#file-f011) | utf-8 | 1955 | 36 |
| F012 | [`src/shared/refresh.ts`](#file-f012) | utf-8 | 664 | 12 |
| F013 | [`src/shared/schedule.ts`](#file-f013) | utf-8 | 3768 | 61 |
| F014 | [`src/main/index.ts`](#file-f014) | utf-8 | 23099 | 431 |
| F015 | [`src/main/store.ts`](#file-f015) | utf-8 | 11487 | 221 |
| F016 | [`src/main/mounts.ts`](#file-f016) | utf-8 | 11811 | 172 |
| F017 | [`src/main/control.ts`](#file-f017) | utf-8 | 3877 | 64 |
| F018 | [`src/main/preflight.ts`](#file-f018) | utf-8 | 2516 | 28 |
| F019 | [`src/main/operations.ts`](#file-f019) | utf-8 | 2921 | 60 |
| F020 | [`src/main/backups.ts`](#file-f020) | utf-8 | 9646 | 189 |
| F021 | [`src/main/backup-progress.ts`](#file-f021) | utf-8 | 1917 | 41 |
| F022 | [`src/main/diagnostics.ts`](#file-f022) | utf-8 | 10076 | 130 |
| F023 | [`src/main/shortcuts.ts`](#file-f023) | utf-8 | 4463 | 78 |
| F024 | [`src/main/window-layout.ts`](#file-f024) | utf-8 | 715 | 13 |
| F025 | [`src/preload/index.ts`](#file-f025) | utf-8 | 2190 | 34 |
| F026 | [`src/renderer/index.html`](#file-f026) | utf-8 | 348 | 13 |
| F027 | [`src/renderer/src/main.tsx`](#file-f027) | utf-8 | 226 | 8 |
| F028 | [`src/renderer/src/global.d.ts`](#file-f028) | utf-8 | 119 | 5 |
| F029 | [`src/renderer/src/App.tsx`](#file-f029) | utf-8 | 48986 | 425 |
| F030 | [`src/renderer/src/styles.css`](#file-f030) | utf-8 | 28834 | 343 |
| F031 | [`src/renderer/src/remote-path-display.ts`](#file-f031) | utf-8 | 845 | 16 |
| F032 | [`AGGIORNAMENTO-0.2.1.md`](#file-f032) | utf-8 | 4211 | 79 |
| F033 | [`AGGIORNAMENTO-0.2.md`](#file-f033) | utf-8 | 4480 | 45 |
| F034 | [`AGGIORNAMENTO-0.3.md`](#file-f034) | utf-8 | 8935 | 160 |
| F035 | [`AGGIORNAMENTO-0.4.md`](#file-f035) | utf-8 | 8284 | 80 |
| F036 | [`FILE-DA-RIMUOVERE.txt`](#file-f036) | utf-8 | 500 | 12 |
| F037 | [`LEGGIMI-fix-marker.md`](#file-f037) | utf-8 | 3891 | 77 |
| F038 | [`README.md`](#file-f038) | utf-8 | 9044 | 164 |
| F039 | [`docs/ROADMAP.md`](#file-f039) | utf-8 | 1283 | 30 |
| F040 | [`docs/UPDATE-0.2-files.json`](#file-f040) | utf-8 | 2402 | 30 |
| F041 | [`docs/UPDATE-0.2.md`](#file-f041) | utf-8 | 5312 | 44 |
| F042 | [`docs/UPDATE-0.3-files.json`](#file-f042) | utf-8 | 5857 | 158 |
| F043 | [`docs/UPDATE-0.4-files.json`](#file-f043) | utf-8 | 5343 | 159 |
| F044 | [`docs/VERIFICA-0.3.md`](#file-f044) | utf-8 | 4695 | 77 |
| F045 | [`docs/VERIFICA-0.4.md`](#file-f045) | utf-8 | 6366 | 60 |
| F046 | [`resources/design-preview.html`](#file-f046) | utf-8 | 11218 | 52 |
| F047 | [`tests/backups.test.cjs`](#file-f047) | utf-8 | 6329 | 87 |
| F048 | [`tests/browser.test.cjs`](#file-f048) | utf-8 | 3170 | 59 |
| F049 | [`tests/control.test.cjs`](#file-f049) | utf-8 | 1678 | 20 |
| F050 | [`tests/guarded-app.test.cjs`](#file-f050) | utf-8 | 8629 | 81 |
| F051 | [`tests/helpers/ui.cjs`](#file-f051) | utf-8 | 2919 | 27 |
| F052 | [`tests/installer.test.cjs`](#file-f052) | utf-8 | 2087 | 15 |
| F053 | [`tests/layout.test.cjs`](#file-f053) | utf-8 | 835 | 18 |
| F054 | [`tests/mounts.test.cjs`](#file-f054) | utf-8 | 6467 | 54 |
| F055 | [`tests/native-helpers.test.cjs`](#file-f055) | utf-8 | 9651 | 179 |
| F056 | [`tests/native-wiring.test.cjs`](#file-f056) | utf-8 | 910 | 4 |
| F057 | [`tests/native/guarded.cjs`](#file-f057) | utf-8 | 4584 | 66 |
| F058 | [`tests/native/helpers/fixture.cjs`](#file-f058) | utf-8 | 7272 | 104 |
| F059 | [`tests/native/helpers/support.cjs`](#file-f059) | utf-8 | 4075 | 80 |
| F060 | [`tests/native/helpers/writer.cjs`](#file-f060) | utf-8 | 1779 | 35 |
| F061 | [`tests/operation-ui.test.cjs`](#file-f061) | utf-8 | 2842 | 20 |
| F062 | [`tests/operations.test.cjs`](#file-f062) | utf-8 | 3421 | 18 |
| F063 | [`tests/preferences.test.cjs`](#file-f063) | utf-8 | 6006 | 68 |
| F064 | [`tests/preflight.test.cjs`](#file-f064) | utf-8 | 2351 | 26 |
| F065 | [`tests/progress.test.cjs`](#file-f065) | utf-8 | 2809 | 44 |
| F066 | [`tests/register.cjs`](#file-f066) | utf-8 | 474 | 11 |
| F067 | [`tests/remote.test.cjs`](#file-f067) | utf-8 | 1885 | 32 |
| F068 | [`tests/root-home.test.cjs`](#file-f068) | utf-8 | 8745 | 195 |
| F069 | [`tests/schedule.test.cjs`](#file-f069) | utf-8 | 4683 | 76 |
| F070 | [`tests/shortcuts.test.cjs`](#file-f070) | utf-8 | 4351 | 55 |
| F071 | [`tests/store.test.cjs`](#file-f071) | utf-8 | 7195 | 132 |
| F072 | [`tests/syntax.test.cjs`](#file-f072) | utf-8 | 910 | 14 |
| F073 | [`tests/ui.test.cjs`](#file-f073) | utf-8 | 4797 | 74 |
| F074 | [`tests/window.test.cjs`](#file-f074) | utf-8 | 6959 | 84 |
| F075 | [`resources/icon.ico`](#file-f075) | base64 | 49116 | — |
| F076 | [`resources/icon.png`](#file-f076) | base64 | 40222 | — |
| F077 | [`resources/icons/128x128.png`](#file-f077) | base64 | 11543 | — |
| F078 | [`resources/icons/16x16.png`](#file-f078) | base64 | 759 | — |
| F079 | [`resources/icons/24x24.png`](#file-f079) | base64 | 1370 | — |
| F080 | [`resources/icons/256x256.png`](#file-f080) | base64 | 26909 | — |
| F081 | [`resources/icons/32x32.png`](#file-f081) | base64 | 1830 | — |
| F082 | [`resources/icons/48x48.png`](#file-f082) | base64 | 3260 | — |
| F083 | [`resources/icons/512x512.png`](#file-f083) | base64 | 40222 | — |
| F084 | [`resources/icons/64x64.png`](#file-f084) | base64 | 4713 | — |

### Struttura delle directory

```text
drive-tambu-sync/
|-- .github/
|   `-- workflows/
|       |-- build.yml
|       `-- guarded-close.yml
|-- build/
|   `-- installer.nsh
|-- docs/
|   |-- ROADMAP.md
|   |-- UPDATE-0.2-files.json
|   |-- UPDATE-0.2.md
|   |-- UPDATE-0.3-files.json
|   |-- UPDATE-0.4-files.json
|   |-- VERIFICA-0.3.md
|   `-- VERIFICA-0.4.md
|-- resources/
|   |-- icons/
|   |   |-- 128x128.png
|   |   |-- 16x16.png
|   |   |-- 24x24.png
|   |   |-- 256x256.png
|   |   |-- 32x32.png
|   |   |-- 48x48.png
|   |   |-- 512x512.png
|   |   `-- 64x64.png
|   |-- design-preview.html
|   |-- icon.ico
|   `-- icon.png
|-- src/
|   |-- main/
|   |   |-- backup-progress.ts
|   |   |-- backups.ts
|   |   |-- control.ts
|   |   |-- diagnostics.ts
|   |   |-- index.ts
|   |   |-- mounts.ts
|   |   |-- operations.ts
|   |   |-- preflight.ts
|   |   |-- shortcuts.ts
|   |   |-- store.ts
|   |   `-- window-layout.ts
|   |-- preload/
|   |   `-- index.ts
|   |-- renderer/
|   |   |-- src/
|   |   |   |-- App.tsx
|   |   |   |-- global.d.ts
|   |   |   |-- main.tsx
|   |   |   |-- remote-path-display.ts
|   |   |   `-- styles.css
|   |   `-- index.html
|   `-- shared/
|       |-- paths.ts
|       |-- refresh.ts
|       |-- schedule.ts
|       `-- types.ts
|-- tests/
|   |-- helpers/
|   |   `-- ui.cjs
|   |-- native/
|   |   |-- helpers/
|   |   |   |-- fixture.cjs
|   |   |   |-- support.cjs
|   |   |   `-- writer.cjs
|   |   `-- guarded.cjs
|   |-- backups.test.cjs
|   |-- browser.test.cjs
|   |-- control.test.cjs
|   |-- guarded-app.test.cjs
|   |-- installer.test.cjs
|   |-- layout.test.cjs
|   |-- mounts.test.cjs
|   |-- native-helpers.test.cjs
|   |-- native-wiring.test.cjs
|   |-- operation-ui.test.cjs
|   |-- operations.test.cjs
|   |-- preferences.test.cjs
|   |-- preflight.test.cjs
|   |-- progress.test.cjs
|   |-- register.cjs
|   |-- remote.test.cjs
|   |-- root-home.test.cjs
|   |-- schedule.test.cjs
|   |-- shortcuts.test.cjs
|   |-- store.test.cjs
|   |-- syntax.test.cjs
|   |-- ui.test.cjs
|   `-- window.test.cjs
|-- .gitattributes
|-- .gitignore
|-- AGGIORNAMENTO-0.2.1.md
|-- AGGIORNAMENTO-0.2.md
|-- AGGIORNAMENTO-0.3.md
|-- AGGIORNAMENTO-0.4.md
|-- FILE-DA-RIMUOVERE.txt
|-- LEGGIMI-fix-marker.md
|-- README.md
|-- electron.vite.config.ts
|-- package.json
|-- tsconfig.main.json
`-- tsconfig.web.json
```
<a id="indice-simboli"></a>
## 9. Indice dei simboli e delle chiamate IPC
Indice estratto dall'albero sintattico dei sorgenti TypeScript/TSX. Non è una certificazione dei tipi o una revisione del comportamento. Le dipendenze locali mostrate aiutano a seguire il flusso fra file.
### [`src/shared/types.ts`](#file-f010)
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `ConnectionStatus` | TypeAliasDeclaration | 1-1 |
| `Theme` | TypeAliasDeclaration | 2-2 |
| `WindowMode` | TypeAliasDeclaration | 3-3 |
| `BackupStatus` | TypeAliasDeclaration | 4-4 |
| `BackupSchedule` | TypeAliasDeclaration | 6-10 |
| `BackupProgress` | InterfaceDeclaration | 12-20 |
| `BackupConfig` | InterfaceDeclaration | 22-28 |
| `MountConfig` | InterfaceDeclaration | 30-43 |
| `AppSettings` | InterfaceDeclaration | 45-53 |
| `StoredConfig` | InterfaceDeclaration | 55-59 |
| `MountView` | InterfaceDeclaration | 61-69 |
| `Snapshot` | InterfaceDeclaration | 71-80 |
| `Dependencies` | InterfaceDeclaration | 82-87 |
| `RemoteListing` | InterfaceDeclaration | 89-94 |
| `DriveAPI` | InterfaceDeclaration | 96-120 |
| `OperationReply` | TypeAliasDeclaration | 122-122 |
| `OperationView` | InterfaceDeclaration | 123-131 |

### [`src/shared/paths.ts`](#file-f011)
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `normalizeRemotePath` | FunctionDeclaration | 2-19 |
| `selectedRemote` | FunctionDeclaration | 21-24 |
| `childRemotePath` | FunctionDeclaration | 26-29 |
| `parentRemotePath` | FunctionDeclaration | 31-36 |

### [`src/shared/refresh.ts`](#file-f012)
Import locali: `./types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `DEFAULT_REFRESH_SECONDS` | variable | 3-3 |
| `validateRefreshSeconds` | FunctionDeclaration | 4-9 |
| `effectiveRefreshSeconds` | FunctionDeclaration | 10-12 |

### [`src/shared/schedule.ts`](#file-f013)
Import locali: `./types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `validateSchedule` | FunctionDeclaration | 3-20 |
| `scheduleOf` | FunctionDeclaration | 23-25 |
| `nextScheduledAt` | FunctionDeclaration | 29-40 |
| `isBackupDue` | FunctionDeclaration | 42-51 |
| `localTimeZone` | variable | 53-53 |
| `describeSchedule` | FunctionDeclaration | 55-61 |

### [`src/main/index.ts`](#file-f014)
Import locali: `./store`, `./mounts`, `./backups`, `./operations`, `./preflight`, `./diagnostics`, `../shared/paths`, `./window-layout`, `./shortcuts`, `../shared/types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `window` | variable | 16-16 |
| `tray` | variable | 17-17 |
| `store` | variable | 18-18 |
| `mounts` | variable | 19-19 |
| `backups` | variable | 20-20 |
| `folderOpener` | variable | 21-21 |
| `exiting` | variable | 22-22 |
| `cleanupStarted` | variable | 23-23 |
| `operations` | variable | 24-24 |
| `pendingSaves` | variable | 25-25 |
| `nativeDialogDepth` | variable | 26-26 |
| `mode` | variable | 27-27 |
| `logLines` | variable | 28-28 |
| `browsing` | variable | 29-29 |
| `wayland` | variable | 30-30 |
| `log` | FunctionDeclaration | 32-37 |
| `changed` | FunctionDeclaration | 38-40 |
| `snapshot` | FunctionDeclaration | 41-49 |
| `autostart` | FunctionDeclaration | 50-62 |
| `iconPath` | FunctionDeclaration | 64-66 |
| `applyTheme` | FunctionDeclaration | 67-71 |
| `positionWindow` | FunctionDeclaration | 72-84 |
| `showWindow` | FunctionDeclaration | 85-91 |
| `setMode` | FunctionDeclaration | 92-96 |
| `hideWindow` | FunctionDeclaration | 97-100 |
| `withDialog` | FunctionDeclaration | 101-105 |
| `createTray` | FunctionDeclaration | 106-124 |
| `createWindow` | FunctionDeclaration | 125-149 |
| `ensureServer` | FunctionDeclaration | 151-157 |
| `validateRequestId` | FunctionDeclaration | 158-160 |
| `requireIdle` | FunctionDeclaration | 161-163 |
| `inspectWork` | FunctionDeclaration | 164-173 |
| `requestQuit` | FunctionDeclaration | 174-189 |
| `changeLocalPosition` | FunctionDeclaration | 190-224 |
| `handleShortcut` | FunctionDeclaration | 225-240 |
| `registerHandlers` | FunctionDeclaration | 242-389 |

### [`src/main/store.ts`](#file-f015)
Import locali: `../shared/types`, `../shared/paths`, `../shared/schedule`, `../shared/refresh`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `defaults` | variable | 9-21 |
| `canonicalLocal` | FunctionDeclaration | 23-28 |
| `inside` | variable | 30-36 |
| `localPathsOverlap` | FunctionDeclaration | 38-38 |
| `validateMount` | FunctionDeclaration | 40-78 |
| `validateShortcutLocation` | FunctionDeclaration | 81-88 |
| `ConfigStore` | ClassDeclaration | 90-221 |
| `ConfigStore.settings` | GetAccessor | 141-141 |
| `ConfigStore.mounts` | GetAccessor | 142-142 |
| `ConfigStore.find` | MethodDeclaration | 143-147 |
| `ConfigStore.saveMount` | MethodDeclaration | 148-166 |
| `ConfigStore.markBackupStarted` | MethodDeclaration | 167-172 |
| `ConfigStore.reconcileScheduleTimeZone` | MethodDeclaration | 173-185 |
| `ConfigStore.markBackup` | MethodDeclaration | 186-197 |
| `ConfigStore.deleteMount` | MethodDeclaration | 198-201 |
| `ConfigStore.saveSettings` | MethodDeclaration | 202-215 |
| `ConfigStore.flush` | MethodDeclaration | 216-220 |

### [`src/main/mounts.ts`](#file-f016)
Import locali: `../shared/types`, `./store`, `../shared/refresh`, `./diagnostics`, `./control`, `./preflight`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `RuntimeMount` | TypeAliasDeclaration | 11-18 |
| `sleep` | variable | 19-19 |
| `isLinuxMounted` | FunctionDeclaration | 20-23 |
| `isReady` | FunctionDeclaration | 24-26 |
| `checkMountDestination` | FunctionDeclaration | 28-38 |
| `MountManager` | ClassDeclaration | 39-172 |
| `MountManager.state` | MethodDeclaration | 42-44 |
| `MountManager.hasRuntime` | MethodDeclaration | 45-45 |
| `MountManager.needsRefreshReconnect` | MethodDeclaration | 46-48 |
| `MountManager.connect` | MethodDeclaration | 49-65 |
| `MountManager.start` | MethodDeclaration | 66-117 |
| `MountManager.listed` | MethodDeclaration | 118-123 |
| `MountManager.preflight` | MethodDeclaration | 124-138 |
| `MountManager.disconnect` | MethodDeclaration | 139-164 |
| `MountManager.cleanupOwnedDirectory` | MethodDeclaration | 165-170 |
| `MountManager.disconnectAll` | MethodDeclaration | 171-171 |

### [`src/main/control.ts`](#file-f017)
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `ControlMethod` | TypeAliasDeclaration | 5-6 |
| `METHODS` | variable | 7-7 |
| `ControlClient` | ClassDeclaration | 10-49 |
| `ControlClient.call` | MethodDeclaration | 14-48 |
| `createControl` | FunctionDeclaration | 50-64 |

### [`src/main/preflight.ts`](#file-f018)
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `PreflightResult` | InterfaceDeclaration | 2-7 |
| `object` | variable | 8-8 |
| `count` | variable | 9-9 |
| `optionalList` | variable | 10-10 |
| `unknownActivity` | variable | 11-11 |
| `assessTransfers` | FunctionDeclaration | 12-28 |

### [`src/main/operations.ts`](#file-f019)
Import locali: `../shared/types`, `./preflight`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `OperationRequest` | InterfaceDeclaration | 5-8 |
| `Pending` | InterfaceDeclaration | 9-12 |
| `OperationCoordinator` | ClassDeclaration | 14-60 |
| `OperationCoordinator.busy` | GetAccessor | 17-17 |
| `OperationCoordinator.view` | GetAccessor | 18-18 |
| `OperationCoordinator.run` | MethodDeclaration | 19-27 |
| `OperationCoordinator.evaluate` | MethodDeclaration | 28-46 |
| `OperationCoordinator.complete` | MethodDeclaration | 47-49 |
| `OperationCoordinator.respond` | MethodDeclaration | 50-59 |

### [`src/main/backups.ts`](#file-f020)
Import locali: `./store`, `./diagnostics`, `../shared/types`, `../shared/schedule`, `./backup-progress`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `Job` | InterfaceDeclaration | 10-10 |
| `inside` | FunctionDeclaration | 12-17 |
| `verifyDestination` | FunctionDeclaration | 19-25 |
| `ensureManagedDestination` | FunctionDeclaration | 29-44 |
| `cleanupArchive` | FunctionDeclaration | 46-59 |
| `BackupManager` | ClassDeclaration | 61-189 |
| `BackupManager.pauseScheduling` | MethodDeclaration | 67-67 |
| `BackupManager.resumeScheduling` | MethodDeclaration | 68-68 |
| `BackupManager.state` | MethodDeclaration | 71-74 |
| `BackupManager.startScheduler` | MethodDeclaration | 76-82 |
| `BackupManager.checkSchedule` | MethodDeclaration | 84-95 |
| `BackupManager.run` | MethodDeclaration | 97-179 |
| `BackupManager.stop` | MethodDeclaration | 181-188 |

### [`src/main/backup-progress.ts`](#file-f021)
Import locali: `../shared/types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `count` | variable | 4-4 |
| `progressFromStats` | FunctionDeclaration | 5-12 |
| `JsonLogReader` | ClassDeclaration | 15-41 |
| `JsonLogReader.push` | MethodDeclaration | 20-20 |
| `JsonLogReader.end` | MethodDeclaration | 21-21 |
| `JsonLogReader.consume` | MethodDeclaration | 22-34 |
| `JsonLogReader.line` | MethodDeclaration | 35-40 |

### [`src/main/diagnostics.ts`](#file-f022)
Import locali: `../shared/types`, `./store`, `../shared/paths`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `SFTP_FLAGS` | variable | 10-10 |
| `READ_FLAGS` | variable | 11-11 |
| `ConnectionError` | ClassDeclaration | 13-15 |
| `connectionError` | FunctionDeclaration | 16-31 |
| `errorDetails` | FunctionDeclaration | 32-36 |
| `remoteSpec` | FunctionDeclaration | 37-39 |
| `resolveRcloneExecutable` | FunctionDeclaration | 40-48 |
| `stopChild` | FunctionDeclaration | 51-60 |
| `runRclone` | FunctionDeclaration | 62-96 |
| `listRemoteDirectories` | FunctionDeclaration | 98-108 |
| `checkRemoteDirectory` | FunctionDeclaration | 109-114 |
| `diagnostics` | FunctionDeclaration | 116-130 |

### [`src/main/shortcuts.ts`](#file-f023)
Import locali: `../shared/types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `validId` | FunctionDeclaration | 4-6 |
| `requestedFolder` | FunctionDeclaration | 7-14 |
| `shortcutName` | FunctionDeclaration | 15-19 |
| `desktopString` | variable | 20-20 |
| `desktopEntry` | FunctionDeclaration | 21-27 |
| `writeLinuxShortcut` | FunctionDeclaration | 28-37 |
| `OpenerServices` | TypeAliasDeclaration | 39-45 |
| `SavedFolderOpener` | ClassDeclaration | 46-78 |
| `SavedFolderOpener.open` | MethodDeclaration | 49-56 |
| `SavedFolderOpener.perform` | MethodDeclaration | 57-77 |

### [`src/main/window-layout.ts`](#file-f024)
Import locali: `../shared/types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `Bounds` | TypeAliasDeclaration | 2-2 |
| `layoutBounds` | FunctionDeclaration | 4-13 |

### [`src/preload/index.ts`](#file-f025)
Import locali: `../shared/types`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `api` | variable | 5-33 |

### [`src/renderer/src/main.tsx`](#file-f027)
Import locali: `./App`, `./styles.css`.
Bootstrap/bridge o dichiarazioni: leggere il file completo.
### [`src/renderer/src/global.d.ts`](#file-f028)
Import locali: `../../shared/types`.
Bootstrap/bridge o dichiarazioni: leggere il file completo.
### [`src/renderer/src/App.tsx`](#file-f029)
Import locali: `../../shared/types`, `../../shared/paths`, `./remote-path-display`, `../../shared/schedule`, `../../shared/refresh`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `Page` | TypeAliasDeclaration | 15-15 |
| `Notice` | TypeAliasDeclaration | 16-16 |
| `serverName` | variable | 17-17 |
| `messageOf` | variable | 18-18 |
| `newMount` | variable | 19-20 |
| `dateLabel` | variable | 21-24 |
| `Brand` | FunctionDeclaration | 26-28 |
| `Button` | FunctionDeclaration | 29-33 |
| `Toggle` | FunctionDeclaration | 34-36 |
| `Field` | FunctionDeclaration | 37-39 |
| `backupUnits` | variable | 40-40 |
| `refreshUnits` | variable | 41-41 |
| `DurationInput` | FunctionDeclaration | 42-52 |
| `ScheduleFields` | FunctionDeclaration | 53-68 |
| `byteLabel` | FunctionDeclaration | 69-74 |
| `BackupProgressView` | FunctionDeclaration | 75-83 |
| `ErrorBox` | FunctionDeclaration | 85-87 |
| `Dialog` | FunctionDeclaration | 89-117 |
| `OperationDialog` | FunctionDeclaration | 119-142 |
| `RemoteBrowser` | FunctionDeclaration | 144-201 |
| `MountModal` | FunctionDeclaration | 203-277 |
| `MountCard` | FunctionDeclaration | 279-298 |
| `SettingsPage` | FunctionDeclaration | 300-352 |
| `ActivityPage` | FunctionDeclaration | 354-361 |
| `App` | FunctionDeclaration | 363-425 |

### [`src/renderer/src/remote-path-display.ts`](#file-f031)
Import locali: `../../shared/paths`.
| Simbolo | Tipo | Righe originali |
|---|---|---:|
| `displayRemotePath` | FunctionDeclaration | 4-7 |
| `parseDisplayedRemotePath` | FunctionDeclaration | 10-16 |

### Handler registrati nel processo main
La facciata completa è [`src/preload/index.ts`](#file-f025) con il contratto `DriveAPI` in [`src/shared/types.ts`](#file-f010). `drive:changed` è la notifica di aggiornamento.
| Canale | File | Righe originali |
|---|---|---:|
| `drive:respondToOperation` | [`src/main/index.ts`](#file-f014) | 246-250 |
| `drive:snapshot` | [`src/main/index.ts`](#file-f014) | 251-251 |
| `drive:diagnostics` | [`src/main/index.ts`](#file-f014) | 252-252 |
| `drive:setWindowMode` | [`src/main/index.ts`](#file-f014) | 253-253 |
| `drive:hideWindow` | [`src/main/index.ts`](#file-f014) | 254-254 |
| `drive:minimizeWindow` | [`src/main/index.ts`](#file-f014) | 255-255 |
| `drive:quit` | [`src/main/index.ts`](#file-f014) | 256-256 |
| `drive:chooseExecutable` | [`src/main/index.ts`](#file-f014) | 257-261 |
| `drive:chooseDirectory` | [`src/main/index.ts`](#file-f014) | 262-279 |
| `drive:browseRemote` | [`src/main/index.ts`](#file-f014) | 280-292 |
| `drive:cancelBrowse` | [`src/main/index.ts`](#file-f014) | 293-295 |
| `drive:checkConnection` | [`src/main/index.ts`](#file-f014) | 304-304 |
| `drive:checkRemote` | [`src/main/index.ts`](#file-f014) | 305-307 |
| `drive:saveMount` | [`src/main/index.ts`](#file-f014) | 308-328 |
| `drive:deleteMount` | [`src/main/index.ts`](#file-f014) | 329-337 |
| `drive:connect` | [`src/main/index.ts`](#file-f014) | 338-338 |
| `drive:disconnect` | [`src/main/index.ts`](#file-f014) | 339-343 |
| `drive:openMount` | [`src/main/index.ts`](#file-f014) | 344-348 |
| `drive:createShortcut` | [`src/main/index.ts`](#file-f014) | 349-379 |
| `drive:backupNow` | [`src/main/index.ts`](#file-f014) | 380-380 |
| `drive:openBackup` | [`src/main/index.ts`](#file-f014) | 381-385 |
| `drive:saveSettings` | [`src/main/index.ts`](#file-f014) | 386-388 |

<a id="manifest"></a>
## 10. Manifest e provenienza verificabile
Il tree Git ricostruito dai file locali coincide con quello restituito da GitHub per il commit fissato. Per acquisire i byte sono stati riutilizzati gli archivi del progetto presenti nella conversazione, integrati con i file mancanti e confrontati con il tree remoto: non è stata assunta l'equivalenza fra uno ZIP e `main`. La correzione React in `main.tsx` e i due file radice mancanti sono compresi. Nessun sorgente è stato riscritto per correggerlo.
La corrispondenza dell'albero verifica percorsi, modi Git e contenuti. SHA-256 è aggiunto per ciascun file per consentire un controllo indipendente dell'estrazione. Le fonti CI sono osservazioni datate, non stati che si aggiornano automaticamente.
```json
{
  "format": "drive-tambu-ai-dossier-v1",
  "repository": "FabioTambu/drive-tambu-sync",
  "branch": "main",
  "version": "0.4.0",
  "commit": "4b3a01a2b8bc7b24d6cd023abd48a573fbbc2309",
  "commit_message": "v0.4.0",
  "commit_date_utc": "2026-10-18T11:48:14Z",
  "git_tree": "e52f20aef32376dbeb3c1b467b8727f4daf58dc4",
  "export_date": "2026-10-18",
  "scope": "all tracked files at pinned commit; not full git history",
  "file_count": 84,
  "text_file_count": 74,
  "binary_file_count": 10,
  "original_bytes": 568033,
  "source_text_lines": 5829,
  "sources": {
    "commit": "https://api.github.com/repos/FabioTambu/drive-tambu-sync/commits/4b3a01a2b8bc7b24d6cd023abd48a573fbbc2309",
    "root_tree": "https://api.github.com/repos/FabioTambu/drive-tambu-sync/git/trees/e52f20aef32376dbeb3c1b467b8727f4daf58dc4",
    "workflow_runs_for_commit": "https://api.github.com/repos/FabioTambu/drive-tambu-sync/actions/runs?head_sha=4b3a01a2b8bc7b24d6cd023abd48a573fbbc2309&per_page=10",
    "build_run": "https://github.com/FabioTambu/drive-tambu-sync/actions/runs/39124715617",
    "build_jobs": "https://api.github.com/repos/FabioTambu/drive-tambu-sync/actions/runs/39124715617/jobs"
  },
  "files": [
    {
      "id": "F001",
      "path": "package.json",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2194,
      "lines": 77,
      "sha256": "4a1e1887cd9dd3a2e9bc93f5688fb3febd08bae603ee9dbb6e759326e65dbad2",
      "git_blob_sha1": "71d86439e0ae69e387f33fe7f5326f22e51c395e"
    },
    {
      "id": "F002",
      "path": "electron.vite.config.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 182,
      "lines": 8,
      "sha256": "9ca8c402ea768b959b759b3192e94aa975fed3590d00626b895a4c4595317486",
      "git_blob_sha1": "947c77ebf021b054334208e91f85af145253c7e6"
    },
    {
      "id": "F003",
      "path": "tsconfig.main.json",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 410,
      "lines": 15,
      "sha256": "c0c703d75681e4ba9ca95681bc472a7907ac6c47b7e8832cda8f36d9151f08e0",
      "git_blob_sha1": "1190664f70a2a5f103aad20ae1ea4ec8dc5bfa2f"
    },
    {
      "id": "F004",
      "path": "tsconfig.web.json",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 448,
      "lines": 17,
      "sha256": "2a58796d4fe7158211ce8f81874f01bb587abf0d994373b967d9dcd553a69364",
      "git_blob_sha1": "1b07b05f09e7bb52d1c22df945e8b3c77babd527"
    },
    {
      "id": "F005",
      "path": ".gitattributes",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 66,
      "lines": 2,
      "sha256": "1a1dbe176bc233b499d35a57db7513f2941c99ab9759f177830c9149be99005b",
      "git_blob_sha1": "dfe0770424b2a19faf507a501ebfc23be8f54e7b"
    },
    {
      "id": "F006",
      "path": ".gitignore",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 79,
      "lines": 9,
      "sha256": "bd0d356e1d8ab9bd455225d982138dd20305facb4db1cd54e1fa53b873d46ecc",
      "git_blob_sha1": "acfc5838630db97922686683d63141aa2c651486"
    },
    {
      "id": "F007",
      "path": ".github/workflows/build.yml",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1237,
      "lines": 55,
      "sha256": "b10445c7c5b1233716ee218752d3cd1a3199c868e33109a92423d9749b0e8245",
      "git_blob_sha1": "80fbabe6836373608c7e7db0324dab061701004a"
    },
    {
      "id": "F008",
      "path": ".github/workflows/guarded-close.yml",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 5103,
      "lines": 87,
      "sha256": "10a2723d7db76ea779e834e44b8f66c39133d32eac5eb9f11cbd3b3aa21f505a",
      "git_blob_sha1": "ed381880e01f0818cd02e8379938fb8ce5bbfe6b"
    },
    {
      "id": "F009",
      "path": "build/installer.nsh",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4453,
      "lines": 143,
      "sha256": "770074c3d2762bcc42b9628d610bc6bdef92ae51cab63c1da96bc517e3c5bd77",
      "git_blob_sha1": "64fb5f2cda7b0d5ef25fd4fa8b898309293cc65d"
    },
    {
      "id": "F010",
      "path": "src/shared/types.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 3820,
      "lines": 131,
      "sha256": "b3f0bfcf8c0787ffd7d9db223b20f3e633a9d7195ab3e55775eaea3135184e17",
      "git_blob_sha1": "5576109c7e8f388b7e2d55ea0cc7c6a54d918008"
    },
    {
      "id": "F011",
      "path": "src/shared/paths.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1955,
      "lines": 36,
      "sha256": "8a6b1ff8a2eb3203691124689044c7c9e8358614fc7bbeaa1b3b80b0a438e6fb",
      "git_blob_sha1": "32ffc670d4d3604615ce27f0e075e8c402517f03"
    },
    {
      "id": "F012",
      "path": "src/shared/refresh.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 664,
      "lines": 12,
      "sha256": "2370f9533fe25a099168a0c509ed14ba54349d61494209a0ce4e9ecf4edb4a8d",
      "git_blob_sha1": "38209881b5e45fc6e40c45bcdd32d730b8a91ba0"
    },
    {
      "id": "F013",
      "path": "src/shared/schedule.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 3768,
      "lines": 61,
      "sha256": "56e6ffe0d4c2864869f7546db49b558c36e922a3e4b3e7577484995e4c179271",
      "git_blob_sha1": "c0b8d3970df94e11f002a4bf6341f8780211d691"
    },
    {
      "id": "F014",
      "path": "src/main/index.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 23099,
      "lines": 431,
      "sha256": "71caf45a417f5407416590cabd00935aee7dcabc11559f01413edb6575cb504e",
      "git_blob_sha1": "151312efb4b80905505be06a8a1e2da7311fa136"
    },
    {
      "id": "F015",
      "path": "src/main/store.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 11487,
      "lines": 221,
      "sha256": "f61c7875f14452586a23dd2c0f3cb3b0e60afeaa00290699a9892eba918b118a",
      "git_blob_sha1": "bb431fbd1f002bf2e97de60957d1b92a1c44c21c"
    },
    {
      "id": "F016",
      "path": "src/main/mounts.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 11811,
      "lines": 172,
      "sha256": "5d3acb20e4f56c02f69e4557e3981c839b0f0c53f5d3f171585c3bb90f6b9aa1",
      "git_blob_sha1": "a252947c3db4360b2ab8c17472308d4bd65aae8f"
    },
    {
      "id": "F017",
      "path": "src/main/control.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 3877,
      "lines": 64,
      "sha256": "8b20dab2989a8768d0e3bcfd1e3280c62b940d0f2348f19268f6cc2755f86455",
      "git_blob_sha1": "abeef6cef5cb5cdc983fc65851dde28f950b65fb"
    },
    {
      "id": "F018",
      "path": "src/main/preflight.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2516,
      "lines": 28,
      "sha256": "f7e29b5270e81fde97b85b7e12f8d44bc010fa46ead4f5ae5c144a4d75d6c5b6",
      "git_blob_sha1": "8cd23bc1121ac6fa454d9ac7451b1484175ed212"
    },
    {
      "id": "F019",
      "path": "src/main/operations.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2921,
      "lines": 60,
      "sha256": "a1223767d43601d59d5e7d6608d30eb9632d092696aac2aa9861234c44780e81",
      "git_blob_sha1": "5205689612d3580b2113f5ee2737a35c1af3ae1c"
    },
    {
      "id": "F020",
      "path": "src/main/backups.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 9646,
      "lines": 189,
      "sha256": "5c93cf37bf1d15c8bc8fbd9481b51c1bfed6c888ee0b582160978655143b1900",
      "git_blob_sha1": "8cd9d24d3708247436d7f8307b8b3ffd9e533a32"
    },
    {
      "id": "F021",
      "path": "src/main/backup-progress.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1917,
      "lines": 41,
      "sha256": "0f359e458f9f197a5b90a24d5a29b4a1e573ffe25537e080d13ae06a7ddcb6ea",
      "git_blob_sha1": "2ae5c025d46b2896964f0c67e0b205dde3bff1c0"
    },
    {
      "id": "F022",
      "path": "src/main/diagnostics.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 10076,
      "lines": 130,
      "sha256": "e31bbaab92eadb000f2e0abfcbabe66caf2335c59b73d01c469145b53a5b0ee5",
      "git_blob_sha1": "c8d8d0df8f9cffa3d53db80c5f32f9255b09767b"
    },
    {
      "id": "F023",
      "path": "src/main/shortcuts.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4463,
      "lines": 78,
      "sha256": "a39c050286d56478f52600724d701457adc5cc2bae84ac1606c64fd5b3da7df6",
      "git_blob_sha1": "67fc3360fe00858727be696716bf0a6177362ad4"
    },
    {
      "id": "F024",
      "path": "src/main/window-layout.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 715,
      "lines": 13,
      "sha256": "cc8288af82e0f30b79408c0554560ac58735dbbc9985e54eb6e4bacfd00ad81e",
      "git_blob_sha1": "8ae1164122d50f5febb3e8b9b92bcec3aa8f5766"
    },
    {
      "id": "F025",
      "path": "src/preload/index.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2190,
      "lines": 34,
      "sha256": "971b59174ded3f342b0b94f83907367b2d206f5ed97f15242ae281611bfb7ed4",
      "git_blob_sha1": "5f72f8eaa275ca7bf2e63e47b28bd76b0907150f"
    },
    {
      "id": "F026",
      "path": "src/renderer/index.html",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 348,
      "lines": 13,
      "sha256": "0fa2a7964f0cbe16a950f41ee10728fdb5fc91ee2ca5624fbe841ad8a76f7b11",
      "git_blob_sha1": "6dd00c00ccad533a80b0ee1e3bd01c9a9c813914"
    },
    {
      "id": "F027",
      "path": "src/renderer/src/main.tsx",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 226,
      "lines": 8,
      "sha256": "fcd7e4b5c6b5132195f677d9e92ea31d7a36e2201239a48c1fbe4fa66fa66073",
      "git_blob_sha1": "d24bbc1230f94f9568d2e22523139fd5bfbcc611"
    },
    {
      "id": "F028",
      "path": "src/renderer/src/global.d.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 119,
      "lines": 5,
      "sha256": "1e8767469034c5bdf94cba875a3a0975115cea1e949d664295aa82c60f5238a1",
      "git_blob_sha1": "d8c42febcfc9af07d2d737897e256d6bcbb3f7e7"
    },
    {
      "id": "F029",
      "path": "src/renderer/src/App.tsx",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 48986,
      "lines": 425,
      "sha256": "fe96df42a6d38ef565be967f78918e0395fec372c236b3005ff62753cc483c2b",
      "git_blob_sha1": "987840b55499f95a7ea8029ad3228ceacb3f3f38"
    },
    {
      "id": "F030",
      "path": "src/renderer/src/styles.css",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 28834,
      "lines": 343,
      "sha256": "061b36cbce695cda3afada69b3bafa0d1be37807c87a61bd8647719cd3eef90f",
      "git_blob_sha1": "160dfd5c3863c618b265f07b56d7ed663109914b"
    },
    {
      "id": "F031",
      "path": "src/renderer/src/remote-path-display.ts",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 845,
      "lines": 16,
      "sha256": "4ad7121fb13ba86ec8e7570588f66fce9c16882f3d3ea10dfcec9a6f56de5fb6",
      "git_blob_sha1": "56a6a3ee6a7706daef8e24867c9e61779a6975ef"
    },
    {
      "id": "F032",
      "path": "AGGIORNAMENTO-0.2.1.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4211,
      "lines": 79,
      "sha256": "7813c99a1d08d15a31e31949f9f43dd91689188d8890f243ca8c437cca533f97",
      "git_blob_sha1": "850df05f450f0fbd13b0b9e130cdc829fa045a59"
    },
    {
      "id": "F033",
      "path": "AGGIORNAMENTO-0.2.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4480,
      "lines": 45,
      "sha256": "692f9118c7b2539acc1d840f24adce095e3fe902db7abb31652a5486e3b2e119",
      "git_blob_sha1": "9541a64a48f8a30a861c11aace4836d52871f342"
    },
    {
      "id": "F034",
      "path": "AGGIORNAMENTO-0.3.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 8935,
      "lines": 160,
      "sha256": "4c121af8faa072b2c1a208003423f71314b2a421a2f28d7a41560f4cf1cc6231",
      "git_blob_sha1": "22fd6aab3fb113f1852454745604fe1a686c4c6b"
    },
    {
      "id": "F035",
      "path": "AGGIORNAMENTO-0.4.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 8284,
      "lines": 80,
      "sha256": "fa2276ba168bc4327b060dbd9dfcf1070ca9be003369eaeb2b91ae1c49a47f9e",
      "git_blob_sha1": "53f60dd5a82daca95a3d0f8b5dd303cfdeacda46"
    },
    {
      "id": "F036",
      "path": "FILE-DA-RIMUOVERE.txt",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 500,
      "lines": 12,
      "sha256": "95def296004b8a003d06a0e6cbd771c6454784c9546f3766234c0fb708f38d12",
      "git_blob_sha1": "888a62a6ae3afdfd07c2a041b353c24c6998a5d4"
    },
    {
      "id": "F037",
      "path": "LEGGIMI-fix-marker.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 3891,
      "lines": 77,
      "sha256": "523de738d27a5b16e2507804508aa57c2baabebffc50bd599bca193bfece4b08",
      "git_blob_sha1": "aea507985de7046a2c98be25080689af36add269"
    },
    {
      "id": "F038",
      "path": "README.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 9044,
      "lines": 164,
      "sha256": "a5a9d6ee3dca309dc0dbed170f348679ff5d0670611761ede69c632b466a2afc",
      "git_blob_sha1": "7875ed149856cf811cf5d3c1e97c435651c8521d"
    },
    {
      "id": "F039",
      "path": "docs/ROADMAP.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1283,
      "lines": 30,
      "sha256": "a7d8ef755f980a6db75569689b0ba18ade6db543396e4f734bcd1144f35291cd",
      "git_blob_sha1": "92bcbb9f180b022241104ceffdd09fae733070b6"
    },
    {
      "id": "F040",
      "path": "docs/UPDATE-0.2-files.json",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2402,
      "lines": 30,
      "sha256": "5a21d34261b8741d16d99fd9d332995e58b88e536489e2daee1368b29a611f98",
      "git_blob_sha1": "40709822fff83232d70824638b2497305eb46114"
    },
    {
      "id": "F041",
      "path": "docs/UPDATE-0.2.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 5312,
      "lines": 44,
      "sha256": "3e1e4f07b482172d56e54d5173df8f65fc1747f285860faa694eae2cd58f93b8",
      "git_blob_sha1": "d324f543b25a8e6ebb626a7ee630b5af03108ca2"
    },
    {
      "id": "F042",
      "path": "docs/UPDATE-0.3-files.json",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 5857,
      "lines": 158,
      "sha256": "44e0cece59aa32aa77bacdcb8960e1786b192cd85bb2a478f710156c6e37f3c6",
      "git_blob_sha1": "61aa3ff218699174dcc241801d6ac571d48eda44"
    },
    {
      "id": "F043",
      "path": "docs/UPDATE-0.4-files.json",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 5343,
      "lines": 159,
      "sha256": "030da4717d4b4f6a455c1cab2c67b1848d79fa89e8252295db7c66f5fc93a0c4",
      "git_blob_sha1": "bdfeec6d88812cba14727be08dbd003f442cc772"
    },
    {
      "id": "F044",
      "path": "docs/VERIFICA-0.3.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4695,
      "lines": 77,
      "sha256": "033c9ec7e8c2f1399f0743deba42183842c08df93f5afee173874aea08fe2331",
      "git_blob_sha1": "a38fdfb92fc1f6d8e02d28bb07ade0214230b6ab"
    },
    {
      "id": "F045",
      "path": "docs/VERIFICA-0.4.md",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 6366,
      "lines": 60,
      "sha256": "d542939ffbac24cbb812180f3bb43418c707457c852db353c7b3e3abeb63c3be",
      "git_blob_sha1": "a1fee6472bc3e57a1d0b5256df712f7dba862d12"
    },
    {
      "id": "F046",
      "path": "resources/design-preview.html",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 11218,
      "lines": 52,
      "sha256": "8d1fd4b70673b6fce88bf1a8de3f0e9be06a075984cf7ab848528716c660d014",
      "git_blob_sha1": "b0a97c52814e065bf48aecc3be26f591593be1ab"
    },
    {
      "id": "F047",
      "path": "tests/backups.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 6329,
      "lines": 87,
      "sha256": "38111f83d4020a0b736778493f8ad7bbd127bbe31cc762164ed5c78ca6682253",
      "git_blob_sha1": "cfbe6cf78e0bc0e99aef9fe72c858cf5ba6ae8e7"
    },
    {
      "id": "F048",
      "path": "tests/browser.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 3170,
      "lines": 59,
      "sha256": "dd381e0f42e00f90068ef65b3a8ad8b8e44209bd92790400777335af8e6aa27b",
      "git_blob_sha1": "7e71ca4c754f1f1bc165c091d85049fadf1b2d10"
    },
    {
      "id": "F049",
      "path": "tests/control.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1678,
      "lines": 20,
      "sha256": "b9e47b85580d684250b0f9c9a4cd7d2c5d23fdafdf6aa4879b6e1359509c1bb2",
      "git_blob_sha1": "c3540b9f82485285ba4d034b81fea7764afce023"
    },
    {
      "id": "F050",
      "path": "tests/guarded-app.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 8629,
      "lines": 81,
      "sha256": "8919689b0304c3536073f72fd332144bd307fe1c57f641250da504a3e74dd2cb",
      "git_blob_sha1": "4460871f6f8582a6176cca1c555dd39b3407a5cf"
    },
    {
      "id": "F051",
      "path": "tests/helpers/ui.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2919,
      "lines": 27,
      "sha256": "8a2b34f7f705b2880a740b1e4e9a4a03fe5ff61dd5b35ed9a2f1f294a77faeec",
      "git_blob_sha1": "fc1f4641e3fd9716c313d17a12f993fb98d46438"
    },
    {
      "id": "F052",
      "path": "tests/installer.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2087,
      "lines": 15,
      "sha256": "d0ec319c0528734f26bb8a87b2b31b74523ad2f28c7daa7ddd08384f36dc2ab9",
      "git_blob_sha1": "d9135582cf0dbd05effd0a70821dbd9946941059"
    },
    {
      "id": "F053",
      "path": "tests/layout.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 835,
      "lines": 18,
      "sha256": "0f823754eb8649abfc88bbf9b5698abedf8566bd7cd49acc8cf806e15dafa942",
      "git_blob_sha1": "c452e599d18ea5ba47b865dc2923328554b93f6a"
    },
    {
      "id": "F054",
      "path": "tests/mounts.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 6467,
      "lines": 54,
      "sha256": "f922fd1701f2becc9645f1a35989935cda2ae39ebf96cd971423425d82b7f386",
      "git_blob_sha1": "13129284d76231fdb33ec9c0960f99197d7b7f8a"
    },
    {
      "id": "F055",
      "path": "tests/native-helpers.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 9651,
      "lines": 179,
      "sha256": "5bbc9dec0771b7598ea965a4aea0caf164987e57362c9f30040d5b0c833bf59b",
      "git_blob_sha1": "343ac681451cbea44cfcdcbf1bc45265132ac462"
    },
    {
      "id": "F056",
      "path": "tests/native-wiring.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 910,
      "lines": 4,
      "sha256": "7e0bf129b1f062aee4649a53edcfa84d8272e106e9484d43e318448daa639282",
      "git_blob_sha1": "2b58885266fe36aa90f2efab661c2aa48ba1eaa7"
    },
    {
      "id": "F057",
      "path": "tests/native/guarded.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4584,
      "lines": 66,
      "sha256": "835a9f6235c7b01e5d4b21a62a728c70fa135ab4b76a52d42e90b7ce1456b3a0",
      "git_blob_sha1": "f5cd4a3dea2ae9a89b9281145c50af6783689fdb"
    },
    {
      "id": "F058",
      "path": "tests/native/helpers/fixture.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 7272,
      "lines": 104,
      "sha256": "087b4e4d8088cb5dd80ccb08e865720d5ade1b0a19e58c42d644f2b6604c19bb",
      "git_blob_sha1": "965ab46c4bac700af11576c3f81554647651a230"
    },
    {
      "id": "F059",
      "path": "tests/native/helpers/support.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4075,
      "lines": 80,
      "sha256": "675608cb07ef683c76a548e8ccfccdb245b8ec68d2bffa03fef0d73329e6915f",
      "git_blob_sha1": "65c0ddc843cc849c55d310daef56719a43b5cb4d"
    },
    {
      "id": "F060",
      "path": "tests/native/helpers/writer.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1779,
      "lines": 35,
      "sha256": "e45efdc204b455657ca286ad16ca92fa5b3f1fc407c8506bf2894e53d88b936d",
      "git_blob_sha1": "ed4369190eb165ad079c295752462a40a8727b1d"
    },
    {
      "id": "F061",
      "path": "tests/operation-ui.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2842,
      "lines": 20,
      "sha256": "0f5e84e5746138ea1d25b14b3185fd18e3b3daf366cc6837361c8ddc590c1787",
      "git_blob_sha1": "6906cad5a1a0c877177e889ef1d0e8bb98e44bf1"
    },
    {
      "id": "F062",
      "path": "tests/operations.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 3421,
      "lines": 18,
      "sha256": "d6a59d72c7211df09b48b96a25e65a74a3f0539ea28a13e738d240503c33834d",
      "git_blob_sha1": "8ac213532df6dab7a82f5945656746b146e49b56"
    },
    {
      "id": "F063",
      "path": "tests/preferences.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 6006,
      "lines": 68,
      "sha256": "b5e2a434b05a64bc3b0c7e9302be790d1ad9a026e60ce18b1899fe0dee294f9a",
      "git_blob_sha1": "69951ad809230ee9dd8a3e1b7ac03af2a2115c81"
    },
    {
      "id": "F064",
      "path": "tests/preflight.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2351,
      "lines": 26,
      "sha256": "f6c8adeef87f994cbc9b596bae05a5654377d59c1d16278b251c3cbc58071df8",
      "git_blob_sha1": "cdc7a27860a138df87f6f12d2d5ee151e2fa3b44"
    },
    {
      "id": "F065",
      "path": "tests/progress.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 2809,
      "lines": 44,
      "sha256": "0e6e9491026288f1c312006642e45f3be028b7ac9360329120b53da3407a8086",
      "git_blob_sha1": "dc57b7949a632e030b896fccebfd7c1d6defa73e"
    },
    {
      "id": "F066",
      "path": "tests/register.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 474,
      "lines": 11,
      "sha256": "590e71d8314ad790f261d7eedfc950db53952e4f5dad7ec511c2257b4e79ceb0",
      "git_blob_sha1": "94faa6e0de83d6a0eb1e5f03f587b3097d6661d6"
    },
    {
      "id": "F067",
      "path": "tests/remote.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 1885,
      "lines": 32,
      "sha256": "1bbec11dc97ae58fd86971f177812b296e14ef99c58680c006d991c09cbfea9a",
      "git_blob_sha1": "c49cc2b646862bc87fe1afd597c9b3f8e2bea9b1"
    },
    {
      "id": "F068",
      "path": "tests/root-home.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 8745,
      "lines": 195,
      "sha256": "caeee0848f917697772defe52cfc8d23a20c3942041aa83bbccbb25d86713508",
      "git_blob_sha1": "c9a9c5c3c349ed2132d709059be91ba91a42fa0b"
    },
    {
      "id": "F069",
      "path": "tests/schedule.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4683,
      "lines": 76,
      "sha256": "01b712b9c4ac74394ca73d2ac7aae5ec950ea5aef42457550616c6f652c98974",
      "git_blob_sha1": "752a51f3535075dd56c319fae11616c5f7e3b35b"
    },
    {
      "id": "F070",
      "path": "tests/shortcuts.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4351,
      "lines": 55,
      "sha256": "40f65796d0787c111f0aa5957264156dfb84977844b8729d7d455bf033a67d9b",
      "git_blob_sha1": "62adbcb79ccdd4bff20b8ab2b3ab0b5face60dc7"
    },
    {
      "id": "F071",
      "path": "tests/store.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 7195,
      "lines": 132,
      "sha256": "583dbcff2e018d2d728fd0875c7161aaa3108213e5b90da486cbcab7d558397e",
      "git_blob_sha1": "d30ed5a13af6ba4562f1b554e7289e089bc616c6"
    },
    {
      "id": "F072",
      "path": "tests/syntax.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 910,
      "lines": 14,
      "sha256": "8de52f0cc985bfd6920bcf7bcedeedc2b30be5be63c023b5b1be8bb876b03142",
      "git_blob_sha1": "cf220de3b51dc68d2ed9756cf68570a367009713"
    },
    {
      "id": "F073",
      "path": "tests/ui.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 4797,
      "lines": 74,
      "sha256": "01935d635175b14532f6e2975c76b84b9535cfc241329864a3501f58d51df193",
      "git_blob_sha1": "6a3ac19e78b9b887ca7bd672403f78b9298df237"
    },
    {
      "id": "F074",
      "path": "tests/window.test.cjs",
      "mode": "100644",
      "encoding": "utf-8",
      "bytes": 6959,
      "lines": 84,
      "sha256": "eb9166464c6fedca21c764c618150d3d3f9ccfc01c7bed94f7ca9e4119cbbe34",
      "git_blob_sha1": "573bbc2323c67c85b752b7ab707e53e6c49fb334"
    },
    {
      "id": "F075",
      "path": "resources/icon.ico",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 49116,
      "lines": null,
      "sha256": "009910716552d6a819d4642963947822f4c49b4c98c3e08390ef17adf825ff2e",
      "git_blob_sha1": "37d2a1aaa434c39f13a0265fb17d9e862b4c0b0f"
    },
    {
      "id": "F076",
      "path": "resources/icon.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 40222,
      "lines": null,
      "sha256": "bbfaf0cbd6f75bbc043f664332963289a3517963bfc8f0f375aba2f439dbf650",
      "git_blob_sha1": "e9a32bb782563f5fc98fe9bb47bc0caf906514fd"
    },
    {
      "id": "F077",
      "path": "resources/icons/128x128.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 11543,
      "lines": null,
      "sha256": "82ef37992af12c1c5d3255ced79c4083aa07b6d4952374f7a9c3769aad990046",
      "git_blob_sha1": "1d6c80e31f99a46d9b1334f273b24e9b8387486d"
    },
    {
      "id": "F078",
      "path": "resources/icons/16x16.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 759,
      "lines": null,
      "sha256": "39ea2122d8b786ec6d8f417f38980129da5618042e5f0fb613de77307853103f",
      "git_blob_sha1": "a64db48ac8ab863179a400d2496579567037b400"
    },
    {
      "id": "F079",
      "path": "resources/icons/24x24.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 1370,
      "lines": null,
      "sha256": "32f4a821c9567d2271d43a2a49ac34ac52afe626014bef710b7dd6f26829a357",
      "git_blob_sha1": "f0a79fe8ce595e988afeaef89854bf196fd67a4c"
    },
    {
      "id": "F080",
      "path": "resources/icons/256x256.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 26909,
      "lines": null,
      "sha256": "ddf39a18f5b1581176125c142a169090130330c3b5250628b2dd70f506c3709e",
      "git_blob_sha1": "2f65ab8ca6569bdde6ae9c7e42d34f895d9f2b9f"
    },
    {
      "id": "F081",
      "path": "resources/icons/32x32.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 1830,
      "lines": null,
      "sha256": "86a63aab95da0ff8b244312a36ecc57b78c1e732a19afc181d4d8e39da87b44f",
      "git_blob_sha1": "6705309b6963ebb8792f365a5cb52b9c496fe4cc"
    },
    {
      "id": "F082",
      "path": "resources/icons/48x48.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 3260,
      "lines": null,
      "sha256": "306dad442254465c88a672788bc193a8abce61768d994bea34baeb9e4cc622de",
      "git_blob_sha1": "5025b5dbe8958a6fa6761c3b298e52a7eb932180"
    },
    {
      "id": "F083",
      "path": "resources/icons/512x512.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 40222,
      "lines": null,
      "sha256": "bbfaf0cbd6f75bbc043f664332963289a3517963bfc8f0f375aba2f439dbf650",
      "git_blob_sha1": "e9a32bb782563f5fc98fe9bb47bc0caf906514fd"
    },
    {
      "id": "F084",
      "path": "resources/icons/64x64.png",
      "mode": "100644",
      "encoding": "base64",
      "bytes": 4713,
      "lines": null,
      "sha256": "a0242c767d66622f16779b071c7f45d76c45a99ff026f6fbd10eb2c9c8dce2e6",
      "git_blob_sha1": "dd1f568c85a9cf05fcb25f5f197a01fee4ada88d"
    }
  ]
}
```
<a id="contenuti"></a>
## 11. Contenuti integrali: codice, test, workflow e documenti
Da qui i contenuti sono riportati integralmente, inclusi commenti e istruzioni storiche. Le descrizioni iniziali non sostituiscono questi blocchi.

<a id="file-f001"></a>
### F001 — `package.json`
**2194 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F001","path":"package.json","mode":"100644","encoding":"utf-8","bytes":2194,"lines":77,"sha256":"4a1e1887cd9dd3a2e9bc93f5688fb3febd08bae603ee9dbb6e759326e65dbad2","git_blob_sha1":"71d86439e0ae69e387f33fe7f5326f22e51c395e","fence":"````","final_lf":true} -->
````json
{
  "name": "drive-tambu",
  "version": "0.4.0",
  "private": true,
  "description": "Drive Tambu: cartelle remote come locali, con rclone e backup protetti",
  "author": "Drive Tambu fabio.tamburini.07@gmail.com",
  "license": "UNLICENSED",
  "main": "./out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.main.json && tsc --noEmit -p tsconfig.web.json",
    "dist:win": "npm run build && electron-builder --win nsis --x64 --publish never",
    "dist:linux": "npm run build && electron-builder --linux deb AppImage --x64 --publish never",
    "test": "node -r ./tests/register.cjs --test tests/*.test.cjs"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^5.0.0",
    "electron": "^38.0.0",
    "electron-builder": "^26.0.0",
    "electron-vite": "^4.0.0",
    "typescript": "^5.9.0",
    "vite": "^7.0.0"
  },
  "build": {
    "appId": "dev.tamburini.drivetambu",
    "productName": "Drive Tambu",
    "directories": {
      "output": "release"
    },
    "files": [
      "out/**/*",
      "package.json"
    ],
    "asar": true,
    "extraResources": [
      {
        "from": "resources/icon.png",
        "to": "icon.png"
      }
    ],
    "win": {
      "target": [
        "nsis"
      ],
      "icon": "resources/icon.ico",
      "artifactName": "DriveTambu-${version}-Windows.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true,
      "include": "build/installer.nsh",
      "deleteAppDataOnUninstall": false
    },
    "linux": {
      "target": [
        "deb",
        "AppImage"
      ],
      "category": "Utility",
      "maintainer": "Drive Tambu <fabio.tamburini.07@gmail.com>",
      "icon": "resources/icons",
      "synopsis": "Drive Tambu - gestore cartelle remote",
      "artifactName": "DriveTambu-${version}-Linux-${arch}.${ext}"
    }
  }
}
````
<!-- DT-REPO-FILE-END F001 -->

<a id="file-f002"></a>
### F002 — `electron.vite.config.ts`
**182 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F002","path":"electron.vite.config.ts","mode":"100644","encoding":"utf-8","bytes":182,"lines":8,"sha256":"9ca8c402ea768b959b759b3192e94aa975fed3590d00626b895a4c4595317486","git_blob_sha1":"947c77ebf021b054334208e91f85af145253c7e6","fence":"````","final_lf":true} -->
````typescript
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: { plugins: [react()] }
})
````
<!-- DT-REPO-FILE-END F002 -->

<a id="file-f003"></a>
### F003 — `tsconfig.main.json`
**410 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F003","path":"tsconfig.main.json","mode":"100644","encoding":"utf-8","bytes":410,"lines":15,"sha256":"c0c703d75681e4ba9ca95681bc472a7907ac6c47b7e8832cda8f36d9151f08e0","git_blob_sha1":"1190664f70a2a5f103aad20ae1ea4ec8dc5bfa2f","fence":"````","final_lf":true} -->
````json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "types": ["node"],
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/main/**/*.ts", "src/preload/**/*.ts", "src/shared/**/*.ts", "electron.vite.config.ts"]
}
````
<!-- DT-REPO-FILE-END F003 -->

<a id="file-f004"></a>
### F004 — `tsconfig.web.json`
**448 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F004","path":"tsconfig.web.json","mode":"100644","encoding":"utf-8","bytes":448,"lines":17,"sha256":"2a58796d4fe7158211ce8f81874f01bb587abf0d994373b967d9dcd553a69364","git_blob_sha1":"1b07b05f09e7bb52d1c22df945e8b3c77babd527","fence":"````","final_lf":true} -->
````json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src/renderer/src/**/*", "src/shared/**/*.ts"]
}
````
<!-- DT-REPO-FILE-END F004 -->

<a id="file-f005"></a>
### F005 — `.gitattributes`
**66 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F005","path":".gitattributes","mode":"100644","encoding":"utf-8","bytes":66,"lines":2,"sha256":"1a1dbe176bc233b499d35a57db7513f2941c99ab9759f177830c9149be99005b","git_blob_sha1":"dfe0770424b2a19faf507a501ebfc23be8f54e7b","fence":"````","final_lf":true} -->
````text
# Auto detect text files and perform LF normalization
* text=auto
````
<!-- DT-REPO-FILE-END F005 -->

<a id="file-f006"></a>
### F006 — `.gitignore`
**79 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F006","path":".gitignore","mode":"100644","encoding":"utf-8","bytes":79,"lines":9,"sha256":"bd0d356e1d8ab9bd455225d982138dd20305facb4db1cd54e1fa53b873d46ecc","git_blob_sha1":"acfc5838630db97922686683d63141aa2c651486","fence":"````","final_lf":true} -->
````text
node_modules/
out/
release/
*.log
.env
.env.*
!.env.example
.DS_Store
.vscode/
````
<!-- DT-REPO-FILE-END F006 -->

<a id="file-f007"></a>
### F007 — `.github/workflows/build.yml`
**1237 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F007","path":".github/workflows/build.yml","mode":"100644","encoding":"utf-8","bytes":1237,"lines":55,"sha256":"b10445c7c5b1233716ee218752d3cd1a3199c868e33109a92423d9749b0e8245","git_blob_sha1":"80fbabe6836373608c7e7db0324dab061701004a","fence":"````","final_lf":true} -->
````yaml
name: Build Drive Tambu

on:
  workflow_dispatch:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:

permissions:
  contents: read

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: windows-latest
            target: win
          - os: ubuntu-latest
            target: linux
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm test
      - run: npm run typecheck
      - run: npm run dist:${{ matrix.target }}
      - uses: actions/upload-artifact@v4
        with:
          name: drive-tambu-${{ matrix.target }}
          path: release/*
          if-no-files-found: error
          retention-days: 14

  release:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/download-artifact@v4
        with:
          pattern: drive-tambu-*
          path: artifacts
          merge-multiple: true
      - uses: softprops/action-gh-release@v2
        with:
          files: artifacts/*
          generate_release_notes: true
````
<!-- DT-REPO-FILE-END F007 -->

<a id="file-f008"></a>
### F008 — `.github/workflows/guarded-close.yml`
**5103 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F008","path":".github/workflows/guarded-close.yml","mode":"100644","encoding":"utf-8","bytes":5103,"lines":87,"sha256":"10a2723d7db76ea779e834e44b8f66c39133d32eac5eb9f11cbd3b3aa21f505a","git_blob_sha1":"ed381880e01f0818cd02e8379938fb8ce5bbfe6b","fence":"````","final_lf":true} -->
````yaml
name: Drive Tambu - Verifica disconnessione

on:
  workflow_dispatch:

# No secrets, no release, no upload to any personal server.
permissions:
  contents: read

jobs:
  investigate:
    strategy:
      fail-fast: false
      matrix:
        os: [windows-2022, ubuntu-24.04]
    runs-on: ${{ matrix.os }}
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install build dependencies without Electron runtime download
        run: npm install --ignore-scripts
      - name: Unit and regression tests
        run: npm test
      - name: Initialize report
        run: node -e "const fs=require('node:fs');fs.mkdirSync('.safety-probe-results',{recursive:true});fs.writeFileSync('.safety-probe-results/setup.json',JSON.stringify({status:'setup-started',productionSafetyCertified:false,platform:process.platform}));"
      - name: Install pinned rclone and WinFsp on disposable Windows VM
        if: runner.os == 'Windows'
        shell: pwsh
        run: |
          $ErrorActionPreference = 'Stop'
          $zip = Join-Path $env:RUNNER_TEMP 'rclone-probe.zip'
          Invoke-WebRequest 'https://downloads.rclone.org/v1.74.4/rclone-v1.74.4-windows-amd64.zip' -OutFile $zip
          if ((Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'ef097ef9de37a57feb7d9f9c7afb34148ad3c65be8025f1d8f7f521554a701ea') { throw 'rclone archive checksum mismatch' }
          $bin = Join-Path $env:RUNNER_TEMP 'rclone-probe-bin'
          Expand-Archive $zip -DestinationPath $bin
          $exe = Join-Path $bin 'rclone-v1.74.4-windows-amd64/rclone.exe'
          "SAFETY_RCLONE=$exe" >> $env:GITHUB_ENV
          $msi = Join-Path $env:RUNNER_TEMP 'winfsp-probe.msi'
          Invoke-WebRequest 'https://github.com/winfsp/winfsp/releases/download/v2.1/winfsp-2.1.25156.msi' -OutFile $msi
          $hash = (Get-FileHash $msi -Algorithm SHA256).Hash.ToLowerInvariant()
          if ($hash -ne '073a70e00f77423e34bed98b86e600def93393ba5822204fac57a29324db9f7a') { throw 'WinFsp installer checksum mismatch' }
          $install = Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -PassThru -Wait
          if ($install.ExitCode -notin @(0, 3010)) { throw "WinFsp installation failed: $($install.ExitCode)" }
          $dll = Join-Path ${env:ProgramFiles(x86)} 'WinFsp/bin/winfsp-x64.dll'
          if (-not (Test-Path $dll)) { throw 'WinFsp DLL missing after installation' }
          "WINFSP_INSTALLER_SHA256=$hash" >> $env:GITHUB_ENV
          "WINFSP_MSI_EXIT=$($install.ExitCode)" >> $env:GITHUB_ENV
          "WINFSP_DLL_VERSION=$((Get-Item $dll).VersionInfo.ProductVersion)" >> $env:GITHUB_ENV
      - name: Install pinned rclone and FUSE on disposable Linux VM
        if: runner.os == 'Linux'
        shell: bash
        run: |
          set -euo pipefail
          sudo apt-get update
          sudo apt-get install -y fuse3 libfuse2t64 unzip
          if [ ! -c /dev/fuse ]; then sudo modprobe fuse; fi
          test -r /dev/fuse && test -w /dev/fuse
          curl --fail --location --retry 3 'https://downloads.rclone.org/v1.74.4/rclone-v1.74.4-linux-amd64.zip' -o "$RUNNER_TEMP/rclone-probe.zip"
          printf '%s  %s\n' 'fe435e0c36228e7c2f116a8701f01127bb1f694005fc11d1f27186c8bca4115d' "$RUNNER_TEMP/rclone-probe.zip" | sha256sum --check -
          unzip -q "$RUNNER_TEMP/rclone-probe.zip" -d "$RUNNER_TEMP/rclone-probe-bin"
          exe="$RUNNER_TEMP/rclone-probe-bin/rclone-v1.74.4-linux-amd64/rclone"
          chmod u+x "$exe"
          echo "SAFETY_RCLONE=$exe" >> "$GITHUB_ENV"
      - name: Production preflight and guarded disconnection on disposable SFTP
        run: node -r ./tests/register.cjs tests/native/guarded.cjs
      - name: Show diagnostic reports (even when probes fail)
        if: always()
        run: |
          node -e "const fs=require('node:fs');const path=require('node:path');let found=0;for(const name of ['setup.json','linux.json','win32.json']){const file=path.join('.safety-probe-results',name);const st=fs.lstatSync(file,{throwIfNoEntry:false});if(!st)continue;if(!st.isFile()||st.isSymbolicLink()||st.size>1048576)throw new Error('Invalid diagnostic report: '+name);const report=JSON.parse(fs.readFileSync(file,'utf8'));console.log('=== '+name+' ===');console.log(JSON.stringify(report,null,2));found++;}if(!found){console.error('No diagnostic JSON was generated. Inspect the setup and probe steps.');process.exitCode=1;}"
      - name: Upload diagnostic JSON only (never private keys, caches or credentials)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: sicurezza-${{ matrix.os }}
          # Only these sanitized reports may be published, never the scratch tree.
          path: |
            .safety-probe-results/setup.json
            .safety-probe-results/linux.json
            .safety-probe-results/win32.json
          include-hidden-files: true
          if-no-files-found: error
          retention-days: 7
````
<!-- DT-REPO-FILE-END F008 -->

<a id="file-f009"></a>
### F009 — `build/installer.nsh`
**4453 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F009","path":"build/installer.nsh","mode":"100644","encoding":"utf-8","bytes":4453,"lines":143,"sha256":"770074c3d2762bcc42b9628d610bc6bdef92ae51cab63c1da96bc517e3c5bd77","git_blob_sha1":"64fb5f2cda7b0d5ef25fd4fa8b898309293cc65d","fence":"````","final_lf":true} -->
````nsis
; Extend the stock assisted installer. Do not terminate the application on its behalf.
!include "LogicLib.nsh"
!include "nsDialogs.nsh"
!ifndef nsProcess::FindProcess
  !include "nsProcess.nsh"
!endif

!macro customCheckAppRunning
  dt_check_again:
  ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
  ${If} $R0 == 603
    Goto dt_app_closed
  ${EndIf}
  ${If} $R0 != 0
    IfSilent +2
      MessageBox MB_OK|MB_ICONEXCLAMATION "Non riesco a verificare se Drive Tambu e aperto. Installazione annullata."
    SetErrorLevel 2
    Quit
  ${EndIf}
  ${If} ${Silent}
    SetErrorLevel 2
    Quit
  ${EndIf}
  IfFileExists "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0 +2
    Exec '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --request-exit'
  MessageBox MB_RETRYCANCEL|MB_ICONINFORMATION "Drive Tambu e ancora aperto. Completa la chiusura nella sua finestra, poi premi Riprova. Se ci sono trasferimenti in corso, attendi il loro completamento." /SD IDCANCEL IDRETRY dt_check_again
  SetErrorLevel 2
  Quit
  dt_app_closed:
!macroend

!ifdef BUILD_UNINSTALLER
  Var dtResetCheckbox
  Var dtResetSelected
  Var dtResetAllowed
  Var dtPage

  !macro customUnInit
    StrCpy $dtResetSelected 0
    StrCpy $dtResetAllowed 0
    ; Reject the stock broad deletion flag: reset is deliberately an exact allowlist.
    ClearErrors
    ${GetParameters} $R0
    ${GetOptions} $R0 "--delete-app-data" $R1
    ${IfNot} ${Errors}
      SetErrorLevel 2
      Quit
    ${EndIf}
    ; An elevated/different account must not clean a profile belonging to somebody else.
    ReadRegStr $R0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${If} $R0 == $INSTDIR
    ${AndIf} $installMode == "CurrentUser"
      StrCpy $dtResetAllowed 1
    ${EndIf}
  !macroend

  !macro customUnWelcomePage
    UninstPage custom un.DriveSettingsPage un.DriveSettingsLeave
  !macroend

  ; The stock script inserts this hook after MUI2 and its pages are initialized.
  !macro customHeader
  Function un.DriveSettingsPage
    ${If} ${Silent}
      Abort
    ${EndIf}
    ${If} ${isUpdated}
      Abort
    ${EndIf}
    !insertmacro MUI_HEADER_TEXT "Disinstalla Drive Tambu" "Scegli se conservare le impostazioni per una futura installazione."
    nsDialogs::Create 1018
    Pop $dtPage
    ${If} $dtPage == error
      Abort
    ${EndIf}
    ${NSD_CreateLabel} 0u 0u 100% 32u "I file sul server, i backup locali e le credenziali restano al loro posto."
    Pop $R0
    ${NSD_CreateCheckbox} 0u 42u 100% 28u "Elimina anche le impostazioni di Drive Tambu"
    Pop $dtResetCheckbox
    ${NSD_Uncheck} $dtResetCheckbox
    ${If} $dtResetAllowed != 1
      EnableWindow $dtResetCheckbox 0
    ${EndIf}
    ${NSD_CreateLabel} 0u 80u 100% 44u "Senza spunta ritroverai le cartelle e le preferenze alla reinstallazione. La spunta rimuove solo le impostazioni di questo utente, non la cache dei trasferimenti."
    Pop $R0
    nsDialogs::Show
  FunctionEnd

  Function un.DriveSettingsLeave
    ${NSD_GetState} $dtResetCheckbox $dtResetSelected
  FunctionEnd

  ; $R3 is one known configuration directory. No recursion and no wildcards.
  Function un.RemoveDrivePreferences
    System::Call 'kernel32::GetFileAttributesW(w "$R3") i.s'
    Pop $R4
    ${If} $R4 == -1
      Return
    ${EndIf}
    IntOp $R5 $R4 & 0x400 ; FILE_ATTRIBUTE_REPARSE_POINT
    ${If} $R5 != 0
      Return
    ${EndIf}
    StrCpy $R6 "$R3\config.json"
    Call un.RemoveOnePreference
    StrCpy $R6 "$R3\config.json.before-0.2.bak"
    Call un.RemoveOnePreference
    StrCpy $R6 "$R3\config.json.before-0.3.bak"
    Call un.RemoveOnePreference
  FunctionEnd

  Function un.RemoveOnePreference
    System::Call 'kernel32::GetFileAttributesW(w "$R6") i.s'
    Pop $R4
    ${If} $R4 == -1
      Return
    ${EndIf}
    IntOp $R5 $R4 & 0x410 ; refuse reparse points and directories
    ${If} $R5 == 0
      ClearErrors
      Delete "$R6"
      ${If} ${Errors}
        DetailPrint "Impostazione non rimossa: $R6"
      ${EndIf}
    ${EndIf}
  FunctionEnd

  !macroend

  !macro customUnInstall
    ${IfNot} ${Silent}
    ${AndIfNot} ${isUpdated}
    ${AndIf} $dtResetAllowed == 1
    ${AndIf} $installMode == "CurrentUser"
    ${AndIf} $dtResetSelected == ${BST_CHECKED}
      ; The app-running check runs before this hook, also for manual uninstall.
      StrCpy $R3 "$APPDATA\Drive Tambu"
      Call un.RemoveDrivePreferences
      StrCpy $R3 "$APPDATA\drive-tambu"
      Call un.RemoveDrivePreferences
    ${EndIf}
  !macroend
!endif
````
<!-- DT-REPO-FILE-END F009 -->

<a id="file-f010"></a>
### F010 — `src/shared/types.ts`
**3820 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F010","path":"src/shared/types.ts","mode":"100644","encoding":"utf-8","bytes":3820,"lines":131,"sha256":"b3f0bfcf8c0787ffd7d9db223b20f3e633a9d7195ab3e55775eaea3135184e17","git_blob_sha1":"5576109c7e8f388b7e2d55ea0cc7c6a54d918008","fence":"````","final_lf":true} -->
````typescript
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error'
export type Theme = 'system' | 'light' | 'dark'
export type WindowMode = 'compact' | 'expanded'
export type BackupStatus = 'idle' | 'running' | 'error'

export type BackupSchedule =
  | { mode: 'manual' }
  | { mode: 'interval'; minutes: number }
  | { mode: 'daily'; time: string }
  | { mode: 'weekly'; weekdays: number[]; time: string }

export interface BackupProgress {
  phase: 'checking' | 'copying' | 'finishing' | 'complete'
  percent: number | null
  bytes: number
  totalBytes: number
  speed: number
  checks: number
  transfers: number
}

export interface BackupConfig {
  enabled: boolean
  intervalMinutes: number // legacy compatibility; calendar schedules use 0
  schedule?: BackupSchedule
  destination: string     // local, outside any mounted folder
  retentionDays: number   // 0 = keep forever
}

export interface MountConfig {
  id: string
  name: string
  remote: string          // existing rclone remote name
  remotePath: string      // absolute or home-relative path in that remote
  localPath: string       // local mount point
  autoConnect: boolean
  backup: BackupConfig
  directoryRefreshSeconds?: number | null // null/undefined = use general setting
  nextBackupAt?: string
  backupTimeZone?: string
  lastBackupAt?: string
  lastBackupAttemptAt?: string
}

export interface AppSettings {
  rcloneExecutable: string
  cacheMaxSize: string
  startAtLogin: boolean
  closeToTray: boolean
  theme: Theme
  defaultRemote: string
  directoryRefreshSeconds: number
}

export interface StoredConfig {
  schemaVersion: 1
  settings: AppSettings
  mounts: MountConfig[]
}

export interface MountView extends MountConfig {
  hasRuntime?: boolean
  status: ConnectionStatus
  statusDetail: string
  backupStatus: BackupStatus
  backupDetail: string
  backupProgress?: BackupProgress
  refreshNeedsReconnect?: boolean
}

export interface Snapshot {
  appVersion: string
  platform: string
  windowMode: WindowMode
  dark: boolean
  settings: AppSettings
  mounts: MountView[]
  operation?: OperationView | null
  log: string[]
}

export interface Dependencies {
  rclone: { ok: boolean; detail: string }
  remotes: string[]
  note: string
  connectionError?: string
}

export interface RemoteListing {
  remote: string
  path: string
  parent: string | null
  entries: { name: string; path: string }[]
}

export interface DriveAPI {
  snapshot(): Promise<Snapshot>
  diagnostics(): Promise<Dependencies>
  chooseDirectory(name?: string): Promise<string | null>
  chooseExecutable(): Promise<string | null>
  browseRemote(remote: string, path: string, requestId: string): Promise<RemoteListing>
  cancelBrowse(requestId: string): Promise<void>
  checkConnection(remote: string, path?: string): Promise<string>
  setWindowMode(mode: WindowMode): Promise<void>
  hideWindow(): Promise<void>
  minimizeWindow(): Promise<void>
  quit(): Promise<void>
  saveMount(mount: MountConfig): Promise<boolean>
  respondToOperation(id: string, reply: OperationReply): Promise<void>
  deleteMount(id: string): Promise<void>
  connect(id: string): Promise<void>
  disconnect(id: string): Promise<void>
  openMount(id: string): Promise<void>
  createShortcut(id: string): Promise<string | null>
  checkRemote(id: string): Promise<string>
  backupNow(id: string): Promise<void>
  openBackup(id: string): Promise<void>
  saveSettings(settings: AppSettings): Promise<void>
  onChanged(callback: () => void): () => void
}

export type OperationReply = 'confirm' | 'cancel' | 'retry' | 'background'
export interface OperationView {
  id: string
  kind: 'quit' | 'disconnect' | 'remove' | 'move'
  name?: string
  from?: string
  to?: string
  phase: 'checking' | 'confirm' | 'blocked' | 'working'
  message: string
}
````
<!-- DT-REPO-FILE-END F010 -->

<a id="file-f011"></a>
### F011 — `src/shared/paths.ts`
**1955 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F011","path":"src/shared/paths.ts","mode":"100644","encoding":"utf-8","bytes":1955,"lines":36,"sha256":"8a6b1ff8a2eb3203691124689044c7c9e8358614fc7bbeaa1b3b80b0a438e6fb","git_blob_sha1":"32ffc670d4d3604615ce27f0e075e8c402517f03","fence":"````","final_lf":true} -->
````typescript
/** Normalize pasted rclone paths without changing which server is selected. */
export function normalizeRemotePath(remote: string, input: string): string {
  if (typeof remote !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._ -]*$/.test(remote)) {
    throw new Error('Scegli un server salvato nelle Impostazioni.')
  }
  if (typeof input !== 'string' || /[\r\n\0]/.test(input)) throw new Error('Il percorso sul server non e valido.')
  let value = input.trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
  if (/^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\')) {
    throw new Error('Questo e un percorso del computer Windows. Scegli invece una cartella sul server.')
  }
  const qualified = /^([^/:\\]+):(.*)$/.exec(value)
  if (qualified) {
    if (qualified[1] !== remote) throw new Error(`Il percorso appartiene al server "${qualified[1]}". Seleziona quel server oppure scegli un'altra cartella.`)
    value = qualified[2]
    if (/^[^/:\\]+:/.test(value)) throw new Error('Il percorso contiene il nome del server piu volte. Usa Sfoglia per scegliere la cartella.')
  }
  return value
}

export function selectedRemote(remotes: string[], preferred = ''): string {
  if (preferred && remotes.includes(preferred)) return preferred
  return remotes.length === 1 ? remotes[0] : ''
}

export function childRemotePath(parent: string, name: string): string {
  if (!name || name === '.' || name === '..' || /[\/\r\n\0]/.test(name)) throw new Error('Il server ha restituito un nome di cartella non valido.')
  return parent === '' || parent === '.' ? name : `${parent.replace(/\/$/, '')}/${name}`
}

export function parentRemotePath(value: string): string | null {
  if (value === '' || value === '.' || value === '/') return null
  const clean = value.replace(/\/+$/, '')
  const i = clean.lastIndexOf('/')
  return i < 0 ? '' : (i === 0 ? '/' : clean.slice(0, i))
}
````
<!-- DT-REPO-FILE-END F011 -->

<a id="file-f012"></a>
### F012 — `src/shared/refresh.ts`
**664 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F012","path":"src/shared/refresh.ts","mode":"100644","encoding":"utf-8","bytes":664,"lines":12,"sha256":"2370f9533fe25a099168a0c509ed14ba54349d61494209a0ce4e9ecf4edb4a8d","git_blob_sha1":"38209881b5e45fc6e40c45bcdd32d730b8a91ba0","fence":"````","final_lf":true} -->
````typescript
import type { AppSettings, MountConfig } from './types'

export const DEFAULT_REFRESH_SECONDS = 120
export function validateRefreshSeconds(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 5 || (value as number) > 86400) {
    throw new Error('Intervallo di aggiornamento non valido: scegli da 5 secondi a 24 ore.')
  }
  return value as number
}
export function effectiveRefreshSeconds(mount: Pick<MountConfig, 'directoryRefreshSeconds'>, settings: Pick<AppSettings, 'directoryRefreshSeconds'>): number {
  return validateRefreshSeconds(mount.directoryRefreshSeconds ?? settings.directoryRefreshSeconds ?? DEFAULT_REFRESH_SECONDS)
}
````
<!-- DT-REPO-FILE-END F012 -->

<a id="file-f013"></a>
### F013 — `src/shared/schedule.ts`
**3768 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F013","path":"src/shared/schedule.ts","mode":"100644","encoding":"utf-8","bytes":3768,"lines":61,"sha256":"56e6ffe0d4c2864869f7546db49b558c36e922a3e4b3e7577484995e4c179271","git_blob_sha1":"c0b8d3970df94e11f002a4bf6341f8780211d691","fence":"````","final_lf":true} -->
````typescript
import type { BackupConfig, BackupSchedule, MountConfig } from './types'

export function validateSchedule(value: unknown): BackupSchedule {
  if (!value || typeof value !== 'object') throw new Error('Programmazione backup non valida.')
  const v = value as Record<string, unknown>
  if (v.mode === 'manual') return { mode: 'manual' }
  if (v.mode === 'interval') {
    if (!Number.isInteger(v.minutes) || (v.minutes as number) < 1 || (v.minutes as number) > 525600) {
      throw new Error('Intervallo backup non valido: scegli da un minuto a 365 giorni.')
    }
    return { mode: 'interval', minutes: v.minutes as number }
  }
  if (v.mode !== 'daily' && v.mode !== 'weekly') throw new Error('Programmazione backup non riconosciuta.')
  if (typeof v.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)) throw new Error('Orario backup non valido. Usa ore e minuti (00:00 - 23:59).')
  if (v.mode === 'daily') return { mode: 'daily', time: v.time }
  if (!Array.isArray(v.weekdays) || !v.weekdays.length || v.weekdays.some(d => !Number.isInteger(d) || d < 0 || d > 6)) {
    throw new Error('Scegli almeno un giorno della settimana per il backup.')
  }
  return { mode: 'weekly', weekdays: [...new Set(v.weekdays as number[])].sort(), time: v.time }
}

/** Legacy settings are read without losing an arbitrary interval chosen before 0.3. */
export function scheduleOf(backup: Pick<BackupConfig, 'schedule' | 'intervalMinutes'>): BackupSchedule {
  return validateSchedule(backup.schedule ?? (backup.intervalMinutes === 0 ? { mode: 'manual' } : { mode: 'interval', minutes: backup.intervalMinutes }))
}

/** Wall-clock calendar rules, NOT a fixed seven-day duration. Date chooses the first
 * repeated local hour in autumn and advances a missing spring hour by the DST gap. */
export function nextScheduledAt(schedule: BackupSchedule, after: Date): string | undefined {
  const s = validateSchedule(schedule)
  if (!Number.isFinite(+after)) throw new Error('Data della programmazione backup non valida.')
  if (s.mode === 'manual') return undefined
  if (s.mode === 'interval') return new Date(+after + s.minutes * 60000).toISOString()
  const [hour, minute] = s.time.split(':').map(Number)
  for (let offset = 0; offset <= 8; offset++) {
    const candidate = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset, hour, minute, 0, 0)
    if (candidate > after && (s.mode === 'daily' || s.weekdays.includes(candidate.getDay()))) return candidate.toISOString()
  }
  throw new Error('Non riesco a calcolare il prossimo backup.')
}

export function isBackupDue(m: Pick<MountConfig, 'backup' | 'nextBackupAt' | 'lastBackupAt' | 'lastBackupAttemptAt'>, now: Date): boolean {
  if (!m.backup.enabled || scheduleOf(m.backup).mode === 'manual' || !m.nextBackupAt) return false
  const due = Date.parse(m.nextBackupAt)
  if (!Number.isFinite(due) || due > +now) return false
  const attempt = Date.parse(m.lastBackupAttemptAt ?? '')
  const success = Date.parse(m.lastBackupAt ?? '')
  // A failed/interrupted attempt is persisted at startup and throttled on restart.
  if (Number.isFinite(attempt) && (!Number.isFinite(success) || attempt > success) && +now - attempt < 10 * 60000) return false
  return true
}

export const localTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

export function describeSchedule(s: BackupSchedule): string {
  if (s.mode === 'manual') return 'Solo manualmente'
  if (s.mode === 'interval') return `Ogni ${s.minutes} ${s.minutes === 1 ? 'minuto' : 'minuti'}`
  if (s.mode === 'daily') return `Ogni giorno alle ${s.time}`
  const days = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato']
  return `${s.weekdays.map(d => days[d]).join(', ')} alle ${s.time}`
}
````
<!-- DT-REPO-FILE-END F013 -->

<a id="file-f014"></a>
### F014 — `src/main/index.ts`
**23099 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F014","path":"src/main/index.ts","mode":"100644","encoding":"utf-8","bytes":23099,"lines":431,"sha256":"71caf45a417f5407416590cabd00935aee7dcabc11559f01413edb6575cb504e","git_blob_sha1":"151312efb4b80905505be06a8a1e2da7311fa136","fence":"````","final_lf":true} -->
````typescript
import { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage, nativeTheme, screen, shell, Tray } from 'electron'
import { existsSync, mkdirSync, rmSync, writeFileSync, lstatSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { ConfigStore, validateMount, validateShortcutLocation, localPathsOverlap } from './store'
import { MountManager, checkMountDestination } from './mounts'
import { BackupManager } from './backups'
import { OperationCoordinator } from './operations'
import type { PreflightResult } from './preflight'
import { checkRemoteDirectory, diagnostics, errorDetails, listRemoteDirectories } from './diagnostics'
import { normalizeRemotePath } from '../shared/paths'
import { layoutBounds } from './window-layout'
import { requestedFolder, SavedFolderOpener, shortcutName, writeLinuxShortcut } from './shortcuts'
import type { AppSettings, MountConfig, Snapshot, WindowMode, OperationReply } from '../shared/types'

let window: BrowserWindow | null = null
let tray: Tray | null = null
let store: ConfigStore
let mounts: MountManager
let backups: BackupManager
let folderOpener: SavedFolderOpener
let exiting = false
let cleanupStarted = false
let operations: OperationCoordinator
let pendingSaves = 0
let nativeDialogDepth = 0
let mode: WindowMode = 'compact'
const logLines: string[] = []
const browsing = new Map<string, AbortController>()
const wayland = process.platform === 'linux' && (!!process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland')

function log(message: string): void {
  const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logLines.unshift(`${time}  ${message}`)
  if (logLines.length > 180) logLines.length = 180
  changed()
}
function changed(): void {
  if (window && !window.isDestroyed()) window.webContents.send('drive:changed')
}
function snapshot(): Snapshot {
  return {
    appVersion: app.getVersion(), platform: process.platform, windowMode: mode,
    dark: nativeTheme.shouldUseDarkColors, settings: store.settings, operation: operations?.view ?? null,
    mounts: store.mounts.map(m => ({ ...m, hasRuntime: mounts.hasRuntime(m.id), status: mounts.state(m.id).status, statusDetail: mounts.state(m.id).detail,
      backupStatus: backups.state(m.id).status, backupDetail: backups.state(m.id).detail,
      backupProgress: backups.state(m.id).progress, refreshNeedsReconnect: mounts.needsRefreshReconnect(m.id) })), log: [...logLines]
  }
}
function autostart(enabled: boolean): void {
  if (!app.isPackaged) return // avoid registering a development executable
  if (process.platform === 'win32') {
    app.setLoginItemSettings({ openAtLogin: enabled, path: process.execPath })
  } else if (process.platform === 'linux') {
    const file = path.join(os.homedir(), '.config', 'autostart', 'drive-tambu.desktop')
    if (!enabled) { if (existsSync(file)) rmSync(file); return }
    mkdirSync(path.dirname(file), { recursive: true })
    const binary = process.env.APPIMAGE || process.execPath
    const sanitized = binary.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '')
    writeFileSync(file, `[Desktop Entry]\nType=Application\nName=Drive Tambu\nExec="${sanitized}"\nTerminal=false\nX-GNOME-Autostart-enabled=true\n`, 'utf8')
  }
}

function iconPath(): string {
  return app.isPackaged ? path.join(process.resourcesPath, 'icon.png') : path.join(app.getAppPath(), 'resources', 'icon.png')
}
function applyTheme(): void {
  nativeTheme.themeSource = store.settings.theme
  window?.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#151821' : '#f6f8fc')
  changed()
}
function positionWindow(): void {
  if (!window || window.isDestroyed()) return
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const bounds = layoutBounds(mode, display.workArea)
  if (window.isMaximized()) window.unmaximize()
  window.setMinimumSize(Math.min(mode === 'compact' ? 320 : 780, bounds.width), Math.min(440, bounds.height))
  window.setResizable(true)
  window.setBounds(bounds)
  window.setResizable(mode === 'expanded' || wayland)
  // Keep a taskbar entry on Linux: not every desktop exposes tray icons.
  window.setSkipTaskbar(mode === 'compact' && process.platform === 'win32' && !!tray)
  window.setAlwaysOnTop(mode === 'compact' && process.platform === 'win32')
}
function showWindow(): void {
  if (!window || window.isDestroyed()) { createWindow(); return }
  if (mode === 'compact') positionWindow()
  window.show()
  if (window.isMinimized()) window.restore()
  window.focus()
}
function setMode(next: WindowMode): void {
  if (next !== 'compact' && next !== 'expanded') throw new Error('Modalita della finestra non valida.')
  mode = next
  positionWindow(); showWindow(); changed()
}
function hideWindow(): void {
  if (process.platform === 'linux' || !tray) window?.minimize()
  else window?.hide()
}
async function withDialog<T>(fn: () => Promise<T>): Promise<T> {
  nativeDialogDepth++
  try { return await fn() }
  finally { nativeDialogDepth--; window?.focus() }
}
function createTray(): void {
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath()).resize({ width: 22, height: 22 }))
    tray.setToolTip('Drive Tambu')
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Apri pannello', click: () => setMode('compact') },
      { label: 'Apri finestra', click: () => setMode('expanded') },
      { type: 'separator' },
      { label: 'Esci da Drive Tambu', click: () => app.quit() }
    ]))
    tray.on('click', () => {
      if (mode === 'compact' && window?.isVisible() && window.isFocused()) hideWindow()
      else showWindow()
    })
  } catch (error) {
    tray = null
    log(`Icona di notifica non disponibile: la finestra resta nella barra delle applicazioni. ${String(error)}`)
  }
}
function createWindow(): void {
  const bounds = layoutBounds(mode, screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea)
  window = new BrowserWindow({
    ...bounds, minWidth: Math.min(320, bounds.width), minHeight: Math.min(440, bounds.height),
    title: 'Drive Tambu', show: false, frame: wayland,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#151821' : '#f6f8fc', icon: iconPath(),
    webPreferences: { preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true }
  })
  Menu.setApplicationMenu(null)
  positionWindow()
  window.once('ready-to-show', () => window?.show())
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.on('blur', () => {
    if (mode === 'compact' && process.platform === 'win32' && tray && nativeDialogDepth === 0 && !operations?.busy) window?.hide()
  })
  window.on('close', event => {
    if (exiting) return
    event.preventDefault()
    if (store.settings.closeToTray) hideWindow()
    else app.quit()
  })
  if (process.env.ELECTRON_RENDERER_URL) void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void window.loadFile(path.join(__dirname, '../renderer/index.html'))
}

async function ensureServer(remote: string): Promise<void> {
  normalizeRemotePath(remote, '')
  const d = await diagnostics(store)
  if (!d.rclone.ok) throw new Error(d.rclone.detail)
  if (d.connectionError) throw new Error(d.connectionError)
  if (!d.remotes.includes(remote)) throw new Error('Questo server non e tra le connessioni salvate. Apri Impostazioni e scegli un server disponibile.')
}
function validateRequestId(value: string): void {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{12,80}$/.test(value)) throw new Error('Richiesta non valida.')
}
function requireIdle(): void {
  if (operations?.busy || cleanupStarted) throw new Error('Completa o annulla prima l\'operazione aperta.')
}
async function inspectWork(ids: string[]): Promise<PreflightResult> {
  if (pendingSaves > 0) return {kind:'blocked', message:'Sto ancora verificando una modifica alle cartelle. Attendi e riprova.'}
  for (const id of ids) {
    const m = store.find(id)
    if (backups.state(id).status === 'running') return {kind:'blocked', message:`Il backup di ${m.name} e in corso. Attendi oppure continua in background.`}
    const result = await mounts.preflight(id)
    if (result.kind !== 'confirm') return {...result, message:`${m.name}: ${result.message}`}
  }
  return {kind:'confirm', message:'Non risultano trasferimenti in corso.'}
}
function requestQuit(): Promise<boolean> {
  const ids = store.mounts.map(m => m.id)
  const requiresConfirmation = ids.some(id => mounts.hasRuntime(id) || mounts.state(id).status !== 'disconnected' || backups.state(id).status === 'running')
  const promise = operations.run({kind:'quit', requiresConfirmation}, () => inspectWork(ids), async () => {
    cleanupStarted = true
    try {
      for (const controller of browsing.values()) controller.abort()
      for (const id of ids) await mounts.disconnect(id)
      backups.stop()
      exiting = true
      app.quit()
    } finally { cleanupStarted = false }
  })
  if (requiresConfirmation) showWindow()
  return promise
}
async function changeLocalPosition(previous: MountConfig, next: MountConfig): Promise<boolean> {
  if (localPathsOverlap(previous.localPath, next.localPath)) throw new Error('La nuova posizione deve essere separata dalla precedente, non al suo interno o attorno ad essa.')
  checkMountDestination(next.localPath)
  const wasConnected = mounts.state(previous.id).status === 'connected'
  let failed = false
  const promise = operations.run({kind:'move', name:previous.name, from:previous.localPath, to:next.localPath, requiresConfirmation:true}, async () => {
    if (failed) return {kind:'blocked', message:'Il cambio non e stato completato. Torna alla cartella per verificarne la posizione prima di riprovare.'}
    return inspectWork([previous.id])
  }, async () => {
    // Validate again after the warning: do not overwrite a newly created destination.
    checkMountDestination(next.localPath)
    await mounts.disconnect(previous.id)
    mounts.cleanupOwnedDirectory(previous.id)
    try {
      store.saveMount(next)
      if (wasConnected) await mounts.connect(next.id)
      log(`${next.name}: nuova posizione ${next.localPath}`)
    } catch (error) {
      failed = true
      // Never start a second mount if the new attempt still has a live/uncertain daemon.
      if (mounts.hasRuntime(next.id)) {
        try { await mounts.disconnect(next.id) }
        catch { throw new Error('Il nuovo collegamento richiede una verifica. La nuova posizione e rimasta salvata; nessun secondo collegamento e stato avviato. Torna alla cartella e riprova a scollegarla.') }
      }
      store.saveMount(previous)
      if (wasConnected) {
        try { await mounts.connect(previous.id) }
        catch { throw new Error('Ho ripristinato la posizione precedente, ma non riesco a ricollegarla. Riprova dalla cartella.') }
      }
      throw new Error(`Il cambio non e riuscito. La posizione precedente e stata ripristinata. ${error instanceof Error ? error.message : ''}`)
    }
  })
  showWindow()
  return promise
}
function handleShortcut(argv: string[]): void {
  void (async () => {
    if (argv.includes('--request-exit')) { app.quit(); return }
    requireIdle()
    const id = requestedFolder(argv)
    if (!id) return
    showWindow()
    log('Apertura della cartella dal collegamento...')
    await folderOpener.open(id)
  })().catch(error => {
    showWindow()
    const message = error instanceof Error ? error.message : String(error)
    log(`Collegamento: ${message}`)
    dialog.showErrorBox('Apri cartella', message)
  })
}

function registerHandlers(): void {
  const guard = (event: Electron.IpcMainInvokeEvent): void => {
    if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) throw new Error('Richiesta non autorizzata.')
  }
  ipcMain.handle('drive:respondToOperation', async (e, id: string, reply: OperationReply) => {
    guard(e)
    if (typeof id !== 'string' || !['confirm','cancel','retry','background'].includes(reply)) throw new Error('Risposta non valida.')
    await operations.respond(id, reply)
  })
  ipcMain.handle('drive:snapshot', e => { guard(e); return snapshot() })
  ipcMain.handle('drive:diagnostics', e => { guard(e); return diagnostics(store) })
  ipcMain.handle('drive:setWindowMode', (e, next: WindowMode) => { guard(e); setMode(next) })
  ipcMain.handle('drive:hideWindow', e => { guard(e); if (operations.busy || store.settings.closeToTray) hideWindow(); else app.quit() })
  ipcMain.handle('drive:minimizeWindow', e => { guard(e); window?.minimize() })
  ipcMain.handle('drive:quit', e => { guard(e); app.quit() })
  ipcMain.handle('drive:chooseExecutable', async e => {
    guard(e)
    const result = await withDialog(() => dialog.showOpenDialog(window!, { title: 'Scegli il componente di collegamento', properties: ['openFile'] }))
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })
  ipcMain.handle('drive:chooseDirectory', async (e, name?: string) => {
    guard(e)
    if (name !== undefined && (typeof name !== 'string' || name.length > 80)) throw new Error('Il nome della cartella non e valido.')
    const result = await withDialog(() => dialog.showOpenDialog(window!, {
      title: name !== undefined ? 'Dove vuoi far apparire la cartella?' : 'Scegli una cartella dedicata al backup', properties: ['openDirectory', 'createDirectory']
    }))
    const parent = result.filePaths[0]
    if (result.canceled || !parent) return null
    if (name === undefined) return parent
    let leaf = name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/, '') || 'Drive Tambu'
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(leaf)) leaf = `Cartella-${leaf}`
    let candidate = path.join(parent, leaf), i = 2
    while (existsSync(candidate) || store.mounts.some(m => m.localPath.toLowerCase() === candidate.toLowerCase())) {
      if (i > 10000) throw new Error('Scegli un nome diverso per la cartella.')
      candidate = path.join(parent, `${leaf} (${i++})`)
    }
    return candidate
  })
  ipcMain.handle('drive:browseRemote', async (e, remote: string, remotePath: string, requestId: string) => {
    guard(e); validateRequestId(requestId)
    if (browsing.size >= 8) throw new Error('Attendi che termini la ricerca precedente e riprova.')
    browsing.get(requestId)?.abort()
    const controller = new AbortController(); browsing.set(requestId, controller)
    try {
      await ensureServer(remote)
      return await listRemoteDirectories(store.settings.rcloneExecutable, remote, remotePath, controller.signal)
    } catch (error) {
      if (!controller.signal.aborted) log(`Esplorazione cartelle: ${errorDetails(error)}`)
      throw error
    } finally { if (browsing.get(requestId) === controller) browsing.delete(requestId) }
  })
  ipcMain.handle('drive:cancelBrowse', (e, requestId: string) => {
    guard(e); validateRequestId(requestId); browsing.get(requestId)?.abort()
  })
  const checkConnection = async (remote: string, remotePath = ''): Promise<string> => {
    await ensureServer(remote)
    try {
      await checkRemoteDirectory(store.settings.rcloneExecutable, remote, remotePath)
      log(`Server ${remote}: cartella raggiungibile`)
      return 'Connessione riuscita. La cartella sul server e accessibile.'
    } catch (error) { log(`Verifica server: ${errorDetails(error)}`); throw error }
  }
  ipcMain.handle('drive:checkConnection', async (e, remote: string, remotePath?: string) => { guard(e); return checkConnection(remote, remotePath) })
  ipcMain.handle('drive:checkRemote', async (e, id: string) => {
    guard(e); const m = store.find(id); return checkConnection(m.remote, m.remotePath)
  })
  ipcMain.handle('drive:saveMount', async (e, input: MountConfig) => {
    guard(e); requireIdle()
    const m = validateMount(input, store.mounts)
    if (backups.state(m.id).status === 'running') throw new Error('Attendi che termini il backup prima di modificare questa cartella.')
    const previous = store.mounts.find(x => x.id === m.id)
    const sameLocal = previous && (process.platform === 'win32' ? previous.localPath.toLowerCase() === m.localPath.toLowerCase() : previous.localPath === m.localPath)
    const remoteChanged = !previous || previous.remote !== m.remote || normalizeRemotePath(previous.remote, previous.remotePath) !== m.remotePath
    if (previous && remoteChanged && mounts.state(m.id).status !== 'disconnected') throw new Error('Scollega la cartella prima di cambiare il percorso sul server.')
    if (previous && !sameLocal) {
      if (remoteChanged) throw new Error('Cambia prima il percorso sul server e salva; poi cambia la posizione sul computer.')
      return changeLocalPosition(previous, m)
    }
    pendingSaves++
    try {
      if (remoteChanged) await checkConnection(m.remote, m.remotePath)
      requireIdle()
      store.saveMount(m); log(`${m.name}: impostazioni salvate`)
    } finally { pendingSaves-- }
    if (!previous && m.autoConnect) void mounts.connect(m.id).catch(error => log(`${m.name}: ${errorDetails(error)}`))
    return true
  })
  ipcMain.handle('drive:deleteMount', async (e, id: string) => {
    guard(e); requireIdle(); const m = store.find(id)
    const promise = operations.run({kind:'remove',name:m.name,requiresConfirmation:true}, () => inspectWork([id]), async () => {
      await mounts.disconnect(id)
      mounts.cleanupOwnedDirectory(id)
      store.deleteMount(id); log(`${m.name}: collegamento rimosso. I file non sono stati cancellati.`)
    })
    showWindow(); await promise
  })
  ipcMain.handle('drive:connect', async (e, id: string) => { guard(e); requireIdle(); await mounts.connect(id) })
  ipcMain.handle('drive:disconnect', async (e, id: string) => {
    guard(e); requireIdle(); const m = store.find(id)
    const promise = operations.run({kind:'disconnect',name:m.name,requiresConfirmation:mounts.state(id).status !== 'disconnected'}, () => inspectWork([id]), () => mounts.disconnect(id))
    showWindow(); await promise
  })
  ipcMain.handle('drive:openMount', async (e, id: string) => {
    guard(e); requireIdle()
    if (mounts.state(id).status !== 'connected') throw new Error('Collega la cartella prima di aprirla.')
    const error = await shell.openPath(store.find(id).localPath); if (error) throw new Error(error)
  })
  ipcMain.handle('drive:createShortcut', async (e, id: string) => {
    guard(e); requireIdle()
    const m = store.find(id)
    if (!app.isPackaged) throw new Error("Crea il collegamento dalla versione installata di Drive Tambu, non dall'ambiente di sviluppo.")
    const extension = process.platform === 'win32' ? 'lnk' : 'desktop'
    const result = await withDialog(() => dialog.showSaveDialog(window!, {
      title: 'Crea collegamento alla cartella',
      defaultPath: path.join(app.getPath('desktop'), `${shortcutName(m.name)}.${extension}`),
      filters: [{name:'Collegamento',extensions:[extension]}],
      properties: ['showOverwriteConfirmation', 'createDirectory']
    }))
    if (result.canceled || !result.filePath) return null
    const destination = result.filePath
    if (path.extname(destination).toLowerCase() !== `.${extension}`) throw new Error(`Il collegamento deve avere estensione .${extension}.`)
    validateShortcutLocation(destination, store.mounts)
    try {
      const stat = lstatSync(destination)
      if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Scegli un nuovo file: la destinazione non e un file regolare.')
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    if (process.platform === 'win32') {
      const ok = shell.writeShortcutLink(destination, 'create', {
        target: process.execPath, args: `--open-folder ${m.id}`, cwd: path.dirname(process.execPath),
        description: `Apri ${m.name} con Drive Tambu`, icon: process.execPath, iconIndex: 0
      })
      if (!ok) throw new Error('Non riesco a creare il collegamento. Scegli una posizione in cui puoi scrivere.')
    } else if (process.platform === 'linux') {
      writeLinuxShortcut(destination, process.env.APPIMAGE || process.execPath, m.id, m.name)
    } else throw new Error('Questo sistema non e supportato per i collegamenti.')
    log(`${m.name}: collegamento creato`)
    return destination
  })
  ipcMain.handle('drive:backupNow', async (e, id: string) => { guard(e); requireIdle(); await backups.run(id) })
  ipcMain.handle('drive:openBackup', async (e, id: string) => {
    guard(e); const root = store.find(id).backup.destination
    if (!root || !existsSync(root)) throw new Error('Non esiste ancora un backup. Avviane uno prima.')
    const error = await shell.openPath(root); if (error) throw new Error(error)
  })
  ipcMain.handle('drive:saveSettings', (e, settings: AppSettings) => {
    guard(e); requireIdle(); store.saveSettings(settings); autostart(settings.startAtLogin); applyTheme(); changed()
  })
}

app.on('before-quit', event => {
  if (exiting) return
  event.preventDefault()
  if (!operations || !store) return
  if (operations.busy) { showWindow(); return }
  void requestQuit().catch(error => {
    showWindow(); log(error instanceof Error ? error.message : String(error))
  })
})
app.on('window-all-closed', () => { if (!tray) app.quit() })

app.whenReady().then(() => {
  try {
    if (!app.requestSingleInstanceLock()) { exiting = true; app.quit(); return }
    app.on('second-instance', (_event, argv) => {showWindow();handleShortcut(argv)})
    store = new ConfigStore()
    mounts = new MountManager(store, changed, log)
    backups = new BackupManager(store, changed, log)
    operations = new OperationCoordinator({
      changed, pause: () => backups.pauseScheduling(), resume: () => backups.resumeScheduling(), hide: hideWindow
    })
    folderOpener = new SavedFolderOpener({
      find: id => store.find(id), state: id => mounts.state(id), connect: id => mounts.connect(id),
      open: target => shell.openPath(target), stopping: () => exiting || cleanupStarted || operations.busy
    })
    applyTheme()
    nativeTheme.on('updated', () => {
      window?.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#151821' : '#f6f8fc'); changed()
    })
    registerHandlers(); createTray(); createWindow(); backups.startScheduler()
    screen.on('display-metrics-changed', () => { if (mode === 'compact') positionWindow() })
    screen.on('display-removed', positionWindow)
    for (const m of store.mounts.filter(x => x.autoConnect)) setTimeout(() => {
      if (!exiting && !cleanupStarted && !operations.busy) void mounts.connect(m.id).catch(error => log(`${m.name}: ${errorDetails(error)}`))
    }, 1800)
    log('Drive Tambu avviato')
    handleShortcut(process.argv)
  } catch (error) {
    dialog.showErrorBox('Drive Tambu', error instanceof Error ? error.message : String(error)); exiting = true; app.quit()
  }
}).catch(error => { dialog.showErrorBox('Drive Tambu', String(error)); exiting = true; app.quit() })
````
<!-- DT-REPO-FILE-END F014 -->

<a id="file-f015"></a>
### F015 — `src/main/store.ts`
**11487 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F015","path":"src/main/store.ts","mode":"100644","encoding":"utf-8","bytes":11487,"lines":221,"sha256":"f61c7875f14452586a23dd2c0f3cb3b0e60afeaa00290699a9892eba918b118a","git_blob_sha1":"bb431fbd1f002bf2e97de60957d1b92a1c44c21c","fence":"````","final_lf":true} -->
````typescript
import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, realpathSync, copyFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { AppSettings, MountConfig, StoredConfig } from '../shared/types'
import { normalizeRemotePath } from '../shared/paths'
import { localTimeZone, nextScheduledAt, scheduleOf } from '../shared/schedule'
import { DEFAULT_REFRESH_SECONDS, validateRefreshSeconds } from '../shared/refresh'

const defaults = (): StoredConfig => ({
  schemaVersion: 1,
  settings: {
    rcloneExecutable: 'rclone',
    cacheMaxSize: '5G',
    startAtLogin: false,
    closeToTray: true,
    theme: 'system',
    defaultRemote: '',
    directoryRefreshSeconds: DEFAULT_REFRESH_SECONDS
  },
  mounts: []
})

function canonicalLocal(value: string): string {
  let ancestor = path.resolve(value)
  const suffix: string[] = []
  while (!existsSync(ancestor) && path.dirname(ancestor) !== ancestor) { suffix.unshift(path.basename(ancestor)); ancestor = path.dirname(ancestor) }
  return path.join(realpathSync(ancestor), ...suffix)
}

const inside = (child: string, parent: string): boolean => {
  const a = canonicalLocal(child)
  const b = canonicalLocal(parent)
  const rel = path.relative(process.platform === 'win32' ? b.toLowerCase() : b,
    process.platform === 'win32' ? a.toLowerCase() : a)
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel))
}

export function localPathsOverlap(a: string, b: string): boolean { return inside(a, b) || inside(b, a) }

export function validateMount(value: MountConfig, all: MountConfig[]): MountConfig {
  if (!value || typeof value !== 'object') throw new Error('Dati della cartella non validi.')
  const m = structuredClone(value)
  if (!m.id || !/^[a-zA-Z0-9-]{6,80}$/.test(m.id)) throw new Error('Identificativo della cartella non valido.')
  if (typeof m.name !== 'string' || !m.name.trim() || m.name.length > 80) throw new Error('Inserisci un nome breve per la cartella.')
  m.remotePath = normalizeRemotePath(m.remote, m.remotePath)
  if (!path.isAbsolute(m.localPath ?? '')) throw new Error('La cartella locale deve avere un percorso assoluto.')
  m.name = m.name.trim()
  m.localPath = path.resolve(m.localPath)
  if (m.localPath === path.parse(m.localPath).root) throw new Error('Non puoi usare la radice del sistema come cartella collegata.')
  m.autoConnect = Boolean(m.autoConnect)
  m.directoryRefreshSeconds = m.directoryRefreshSeconds == null ? null : validateRefreshSeconds(m.directoryRefreshSeconds)
  const b = m.backup
  if (!b || typeof b !== 'object') throw new Error('Configurazione backup mancante.')
  b.schedule = scheduleOf(b)
  b.intervalMinutes = b.schedule.mode === 'interval' ? b.schedule.minutes : 0
  if (!Number.isInteger(b.retentionDays) || b.retentionDays < 0 || b.retentionDays > 36500) throw new Error('Giorni di conservazione non validi.')
  if (b.enabled) {
    if (!path.isAbsolute(b.destination ?? '')) throw new Error('Scegli una destinazione assoluta per il backup.')
    b.destination = path.resolve(b.destination)
    if (inside(b.destination, m.localPath) || inside(m.localPath, b.destination)) throw new Error('Il backup deve stare in una cartella separata: non puo contenere la cartella collegata o trovarsi al suo interno.')
  }
  for (const other of all) {
    if (other.id === m.id) continue
    if (inside(m.localPath, other.localPath) || inside(other.localPath, m.localPath)) {
      throw new Error('Due cartelle montate non possono contenersi a vicenda.')
    }
    if (other.backup.enabled && (inside(other.backup.destination, m.localPath) || inside(m.localPath, other.backup.destination))) {
      throw new Error('Una destinazione backup finirebbe nella nuova cartella montata.')
    }
    if (b.enabled) {
      if (inside(b.destination, other.localPath) || inside(other.localPath, b.destination)) throw new Error('Il backup non puo stare dentro una cartella montata.')
      if (other.backup.enabled && (inside(b.destination, other.backup.destination) || inside(other.backup.destination, b.destination))) {
        throw new Error('Questa destinazione backup e gia usata da un altra cartella.')
      }
    }
  }
  return m
}

/** Shortcuts are launcher files, never backup contents or files inside a remote mount. */
export function validateShortcutLocation(destination: string, mounts: MountConfig[]): void {
  if (typeof destination !== 'string' || !path.isAbsolute(destination)) throw new Error('Scegli una destinazione completa per il collegamento.')
  for (const m of mounts) {
    if (inside(destination, m.localPath) || (m.backup.destination && inside(destination, m.backup.destination))) {
      throw new Error('Salva il collegamento fuori dalle cartelle collegate e dalle destinazioni dei backup.')
    }
  }
}

export class ConfigStore {
  private data: StoredConfig
  private readonly file: string
  constructor() {
    this.file = path.join(app.getPath('userData'), 'config.json')
    mkdirSync(path.dirname(this.file), { recursive: true })
    if (!existsSync(this.file)) {
      this.data = defaults()
      this.flush()
    } else {
      const parsed: unknown = JSON.parse(readFileSync(this.file, 'utf8'))
      if (!parsed || typeof parsed !== 'object' || (parsed as StoredConfig).schemaVersion !== 1 || !Array.isArray((parsed as StoredConfig).mounts) || !(parsed as StoredConfig).settings || typeof (parsed as StoredConfig).settings !== 'object') {
        throw new Error('config.json non riconosciuto: fai una copia di sicurezza prima di intervenire.')
      }
      const upgrade = !('directoryRefreshSeconds' in (parsed as StoredConfig).settings)
      if (upgrade) {
        const copy = this.file + '.before-0.3.bak'
        if (!existsSync(copy)) copyFileSync(this.file, copy)
      }
      this.data = parsed as StoredConfig
      if (!('theme' in this.data.settings)) {
        const copy = this.file + '.before-0.2.bak'
        if (!existsSync(copy)) copyFileSync(this.file, copy)
      }
      this.data.settings = { ...defaults().settings, ...this.data.settings }
      if (!['system', 'light', 'dark'].includes(this.data.settings.theme)) this.data.settings.theme = 'system'
      this.data.mounts = this.data.mounts.map(m => ({
        ...m, autoConnect: Boolean(m.autoConnect),
        backup: {
          enabled: m.backup?.enabled ?? false,
          intervalMinutes: m.backup?.intervalMinutes ?? 0,
          destination: m.backup?.destination ?? '',
          retentionDays: m.backup?.retentionDays ?? 30,
          schedule: scheduleOf({ intervalMinutes: m.backup?.intervalMinutes ?? 0, schedule: m.backup?.schedule })
        }
      }))
      this.data.settings.directoryRefreshSeconds = validateRefreshSeconds(this.data.settings.directoryRefreshSeconds)
      for (const m of this.data.mounts) {
        m.directoryRefreshSeconds = m.directoryRefreshSeconds == null ? null : validateRefreshSeconds(m.directoryRefreshSeconds)
        if (m.backup.enabled && scheduleOf(m.backup).mode !== 'manual' && !m.nextBackupAt) {
          const schedule = scheduleOf(m.backup)
          const last = Date.parse(m.lastBackupAt ?? '')
          m.nextBackupAt = schedule.mode === 'interval' && Number.isFinite(last)
            ? nextScheduledAt(schedule, new Date(last))
            : schedule.mode === 'interval' ? new Date().toISOString() : nextScheduledAt(schedule, new Date())
        }
        m.backupTimeZone ??= localTimeZone()
      }
      if (upgrade) this.flush()
    }
  }
  get settings(): AppSettings { return structuredClone(this.data.settings) }
  get mounts(): MountConfig[] { return structuredClone(this.data.mounts) }
  find(id: string): MountConfig {
    const item = this.data.mounts.find(m => m.id === id)
    if (!item) throw new Error('Cartella non trovata.')
    return structuredClone(item)
  }
  saveMount(value: MountConfig): void {
    const item = validateMount(value, this.data.mounts)
    const index = this.data.mounts.findIndex(m => m.id === item.id)
    const previous = index >= 0 ? this.data.mounts[index] : undefined
    const changedSchedule = !previous || previous.backup.enabled !== item.backup.enabled || JSON.stringify(scheduleOf(previous.backup)) !== JSON.stringify(scheduleOf(item.backup))
    item.nextBackupAt = !item.backup.enabled ? undefined : changedSchedule
      ? nextScheduledAt(scheduleOf(item.backup), new Date()) : previous?.nextBackupAt
    item.backupTimeZone = changedSchedule ? localTimeZone() : previous?.backupTimeZone
    // The renderer may not set scheduling state or forge timestamps.
    item.lastBackupAt = previous?.lastBackupAt
    item.lastBackupAttemptAt = previous?.lastBackupAttemptAt
    if (index >= 0) {
      // Preserve timestamps when editing an existing mount.
      item.lastBackupAt = this.data.mounts[index].lastBackupAt
      item.lastBackupAttemptAt = this.data.mounts[index].lastBackupAttemptAt
      this.data.mounts[index] = item
    } else this.data.mounts.push(item)
    this.flush()
  }
  markBackupStarted(id: string): void {
    const m = this.data.mounts.find(m => m.id === id)
    if (!m) throw new Error('Cartella non trovata.')
    m.lastBackupAttemptAt = new Date().toISOString()
    this.flush()
  }
  reconcileScheduleTimeZone(): void {
    const zone = localTimeZone()
    let changed = false
    for (const m of this.data.mounts) {
      const schedule = scheduleOf(m.backup)
      if (m.backupTimeZone !== zone && (schedule.mode === 'daily' || schedule.mode === 'weekly')) {
        m.backupTimeZone = zone
        m.nextBackupAt = m.backup.enabled ? nextScheduledAt(schedule, new Date()) : undefined
        changed = true
      }
    }
    if (changed) this.flush()
  }
  markBackup(id: string, success: boolean): void {
    const index = this.data.mounts.findIndex(m => m.id === id)
    if (index < 0) return
    this.data.mounts[index].lastBackupAttemptAt = new Date().toISOString()
    if (success) {
      const now = new Date(), m = this.data.mounts[index]
      m.lastBackupAt = now.toISOString()
      m.nextBackupAt = m.backup.enabled ? nextScheduledAt(scheduleOf(m.backup), now) : undefined
      m.backupTimeZone = localTimeZone()
    }
    this.flush()
  }
  deleteMount(id: string): void {
    this.data.mounts = this.data.mounts.filter(m => m.id !== id)
    this.flush()
  }
  saveSettings(settings: AppSettings): void {
    if (!settings.rcloneExecutable?.trim()) throw new Error('Indica il percorso di rclone.')
    if (!/^\d+(?:\.\d+)?(?:K|M|G|T)?$/i.test(settings.cacheMaxSize.trim())) throw new Error('Cache massima non valida: usa per esempio 5G.')
    this.data.settings = {
      rcloneExecutable: settings.rcloneExecutable.trim(),
      cacheMaxSize: settings.cacheMaxSize.trim().toUpperCase(),
      startAtLogin: Boolean(settings.startAtLogin),
      closeToTray: Boolean(settings.closeToTray),
      theme: ['system', 'light', 'dark'].includes(settings.theme) ? settings.theme : 'system',
      defaultRemote: typeof settings.defaultRemote === 'string' ? settings.defaultRemote.trim() : '',
      directoryRefreshSeconds: validateRefreshSeconds(settings.directoryRefreshSeconds ?? DEFAULT_REFRESH_SECONDS)
    }
    this.flush()
  }
  private flush(): void {
    const temp = `${this.file}.${process.pid}.tmp`
    writeFileSync(temp, JSON.stringify(this.data, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
    try { renameSync(temp, this.file) } finally { if (existsSync(temp)) rmSync(temp) }
  }
}
````
<!-- DT-REPO-FILE-END F015 -->

<a id="file-f016"></a>
### F016 — `src/main/mounts.ts`
**11811 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F016","path":"src/main/mounts.ts","mode":"100644","encoding":"utf-8","bytes":11811,"lines":172,"sha256":"5d3acb20e4f56c02f69e4557e3981c839b0f0c53f5d3f171585c3bb90f6b9aa1","git_blob_sha1":"a252947c3db4360b2ab8c17472308d4bd65aae8f","fence":"````","final_lf":true} -->
````typescript
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, lstatSync, rmdirSync } from 'node:fs'
import path from 'node:path'
import type { ConnectionStatus, MountConfig } from '../shared/types'
import { ConfigStore, validateMount } from './store'
import { effectiveRefreshSeconds } from '../shared/refresh'
import { checkRemoteDirectory, errorDetails, remoteSpec, resolveRcloneExecutable, SFTP_FLAGS } from './diagnostics'
import { createControl, type ControlClient } from './control'
import { assessTransfers, unknownActivity, type PreflightResult } from './preflight'

type RuntimeMount = {
  status: ConnectionStatus; detail: string; config: MountConfig
  child?: ChildProcess; client?: ControlClient; secret?: string
  abort: AbortController; stopping?: boolean; refreshSeconds?: number
  mounted: boolean; requested: boolean; uncertain: boolean
  closed?: Promise<void>; connecting?: Promise<void>
  ownedDirectory?: {dev:number; ino:number}
}
const sleep = (ms:number): Promise<void> => new Promise(resolve => setTimeout(resolve,ms))
function isLinuxMounted(mountPoint:string): boolean {
  const lines = readFileSync('/proc/self/mountinfo','utf8').split('\n')
  return lines.some(line => (line.split(' ')[4] || '').replace(/\\([0-7]{3})/g, (_s,oct:string) => String.fromCharCode(parseInt(oct,8))) === path.resolve(mountPoint))
}
function isReady(mountPoint:string): boolean {
  return process.platform === 'win32' ? existsSync(mountPoint) : isLinuxMounted(mountPoint)
}
/** Validate, but never overwrite an existing Windows folder or nonempty Linux folder. */
export function checkMountDestination(localPath:string): void {
  if (!path.isAbsolute(localPath)) throw new Error('Scegli una posizione assoluta sul computer.')
  if (!existsSync(path.dirname(localPath))) throw new Error('La cartella superiore non esiste.')
  const parent = lstatSync(path.dirname(localPath))
  if (parent.isSymbolicLink()) throw new Error('Scegli una cartella reale, non un collegamento simbolico.')
  if (process.platform === 'win32' && existsSync(localPath)) throw new Error('La cartella finale esiste gia. Scegli una posizione nuova.')
  if (process.platform === 'linux' && existsSync(localPath)) {
    const st = lstatSync(localPath)
    if (st.isSymbolicLink() || !st.isDirectory() || isLinuxMounted(localPath) || readdirSync(localPath).length) throw new Error('La destinazione deve essere una cartella vuota e non collegata.')
  }
}
export class MountManager {
  private readonly mounts = new Map<string,RuntimeMount>()
  constructor(private store:ConfigStore, private changed:()=>void, private log:(line:string)=>void) {}
  state(id:string): {status:ConnectionStatus; detail:string} {
    const s=this.mounts.get(id);return {status:s?.status ?? 'disconnected',detail:s?.detail ?? 'Non collegata'}
  }
  hasRuntime(id:string): boolean {const s=this.mounts.get(id);return !!s && (!!s.child || s.requested || s.uncertain)}
  needsRefreshReconnect(id:string):boolean {
    const s=this.mounts.get(id);return !!s && ['connected','connecting'].includes(s.status) && s.refreshSeconds!==undefined && s.refreshSeconds!==effectiveRefreshSeconds(this.store.find(id),this.store.settings)
  }
  async connect(id:string):Promise<void> {
    const old=this.mounts.get(id)
    if(old?.status==='connecting') return old.connecting
    if(old?.child || old?.status==='disconnecting') {
      if(old.status==='connected') return
      throw new Error('Il collegamento precedente non e ancora terminato. Riprova a scollegarlo prima.')
    }
    const m=validateMount(this.store.find(id),this.store.mounts)
    const s:RuntimeMount={status:'connecting',detail:'Verifica della cartella sul server...',config:m,abort:new AbortController(),mounted:false,requested:false,uncertain:false,ownedDirectory:old?.config.localPath===m.localPath?old.ownedDirectory:undefined}
    this.mounts.set(id,s);this.changed()
    s.connecting=this.start(s).catch(error=>{
      if(s.abort.signal.aborted && !s.child) {s.status='disconnected';s.detail='Non collegata';this.changed();return}
      s.status='error';s.detail=error instanceof Error ? error.message : 'Collegamento non riuscito.'
      this.log(`${m.name}: ${s.detail}`);this.changed();throw error
    })
    return s.connecting
  }
  private async start(s:RuntimeMount):Promise<void> {
    const m=s.config, executable=this.store.settings.rcloneExecutable
    await checkRemoteDirectory(executable,m.remote,m.remotePath,s.abort.signal)
    if(s.abort.signal.aborted)return
    checkMountDestination(m.localPath)
    const control=await createControl()
    if(s.abort.signal.aborted)return
    s.client=control.client;s.secret=control.secret
    const args=['rcd','--rc-addr',`127.0.0.1:${control.client.port}`,'--rc-no-auth=false','--rc-web-gui=false','--rc-serve=false',
      '--contimeout','15s','--log-level','NOTICE',...SFTP_FLAGS]
    const child=spawn(resolveRcloneExecutable(executable),args,{env:control.env,shell:false,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']})
    s.child=child
    s.closed=new Promise(resolve=>{
      child.once('close',()=>{
        s.child=undefined
        if(s.stopping && !s.mounted && !s.uncertain){s.status='disconnected';s.detail='Non collegata'}
        else {s.status='error';s.detail='Il collegamento si e interrotto. I file temporanei sono stati conservati.';s.uncertain=s.requested || s.mounted}
        this.changed();resolve()
      })
    })
    let processError:Error|undefined
    child.once('error',e=>{processError=e;s.detail='Il componente di collegamento non e stato avviato.'})
    const output=(chunk:Buffer):void=>{
      const text=chunk.toString('utf8').split(s.secret!).join('[nascosto]')
      if(/ERROR|failed|fatal/i.test(text))this.log(`${m.name}: ${errorDetails(new Error(text))}`)
    }
    child.stdout?.on('data',output);child.stderr?.on('data',output)
    const deadline=performance.now()+12000
    let ready=false
    while(performance.now()<deadline){
      if(processError)throw processError
      if(!s.child)throw new Error('Il componente di collegamento si e interrotto durante l\'avvio.')
      try {const info=await s.client.call('core/pid',{},1500);if(info.pid!==child.pid)throw new Error('Identita del processo non verificata.');ready=true;break}catch {await sleep(150)}
    }
    if(!ready)throw new Error('Non riesco a verificare il componente locale. Nessuna chiusura forzata e stata eseguita.')
    const types=await s.client.call('mount/types')
    const mountType=process.platform==='win32'?'cmount':'mount'
    if(!Array.isArray(types.mountTypes) || !types.mountTypes.includes(mountType))throw new Error('Questa versione di rclone non supporta il collegamento richiesto.')
    if(process.platform==='linux' && !existsSync(m.localPath)){
      mkdirSync(m.localPath);const st=lstatSync(m.localPath);s.ownedDirectory={dev:st.dev,ino:st.ino}
    }
    s.refreshSeconds=effectiveRefreshSeconds(m,this.store.settings)
    s.detail='Collegamento della cartella al computer...';this.changed()
    s.requested=true;s.uncertain=true
    await s.client.call('mount/mount',{fs:remoteSpec(m.remote,m.remotePath),mountPoint:m.localPath,mountType,
      vfsOpt:{CacheMode:3,CacheMaxSize:this.store.settings.cacheMaxSize,CacheMaxAge:1200e9,CachePollInterval:60e9,WriteBack:10e9,DirCacheTime:s.refreshSeconds*1e9,PollInterval:0}},45000)
    s.mounted=true;s.requested=false;s.uncertain=false
    const until=performance.now()+10000
    while(!isReady(m.localPath) && performance.now()<until)await sleep(150)
    if(!isReady(m.localPath)) {s.uncertain=true;throw new Error('La cartella non e ancora visibile sul computer. Il motore e rimasto attivo; riprova il controllo.')}
    s.status='connected';s.detail='Cartella pronta';this.log(`${m.name}: collegata`);this.changed()
  }
  private async listed(s:RuntimeMount):Promise<boolean> {
    const list=await s.client!.call('mount/listmounts')
    if(!Array.isArray(list.mountPoints) || list.mountPoints.some(x=>!x || typeof x.MountPoint!=='string'))throw new Error('Elenco dei collegamenti non verificabile.')
    if(list.mountPoints.some(x=>x.MountPoint!==s.config.localPath))throw new Error('Il componente contiene collegamenti non previsti.')
    return list.mountPoints.some(x=>x.MountPoint===s.config.localPath)
  }
  async preflight(id:string):Promise<PreflightResult> {
    const s=this.mounts.get(id)
    if(!s)return {kind:'confirm',message:'La cartella non e collegata.'}
    if(['connecting','disconnecting'].includes(s.status))return {kind:'blocked',message:'Il collegamento sta cambiando stato. Attendi qualche istante e riprova.'}
    if(!s.child)return s.uncertain?unknownActivity():{kind:'confirm',message:'La cartella non e collegata.'}
    try {
      if(!s.client)return unknownActivity()
      const info=await s.client.call('core/pid')
      if(info.pid!==s.child.pid)return unknownActivity()
      if(!s.mounted && !s.requested && !s.uncertain && !(await this.listed(s)))return {kind:'confirm',message:'Nessuna cartella attiva nel componente.'}
      if(s.requested || s.uncertain)return unknownActivity()
      const [vfs,core,queue]=await Promise.all([s.client.call('vfs/stats'),s.client.call('core/stats'),s.client.call('vfs/queue')])
      return assessTransfers(vfs,core,queue)
    } catch{return unknownActivity()}
  }
  async disconnect(id:string):Promise<void> {
    const s=this.mounts.get(id)
    if(!s)return
    // A cancelled read-only connectivity check has never exposed a writable mount.
    if(s.status==='connecting' && !s.child){s.abort.abort();await s.connecting;s.status='disconnected';s.detail='Non collegata';this.changed();return}
    const check=await this.preflight(id)
    if(check.kind!=='confirm')throw new Error(check.message)
    if(!s.child)return
    s.status='disconnecting';s.detail='Scollegamento in corso...';s.stopping=true;this.changed()
    try{
      if(s.mounted){
        await s.client!.call('mount/unmount',{mountPoint:s.config.localPath},12000)
        if(await this.listed(s))throw new Error('La cartella risulta ancora collegata.')
        const deadline=performance.now()+6000
        while(isReady(s.config.localPath) && performance.now()<deadline)await sleep(150)
        if(isReady(s.config.localPath)) {s.uncertain=true;throw new Error('La posizione risulta ancora collegata. Nessuna chiusura forzata e stata eseguita.')}
        s.mounted=false
      }else if(await this.listed(s))throw new Error('La cartella risulta ancora collegata.')
      await s.client!.call('core/quit',{},4000).catch(error=>{if(s.child)throw error})
      let timer:ReturnType<typeof setTimeout>|undefined
      try{await Promise.race([s.closed,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Il componente non si e ancora chiuso. Riprova: non verra terminato forzatamente.')),7000)})])}finally{clearTimeout(timer)}
      s.status='disconnected';s.detail='Non collegata';s.uncertain=false
      this.log(`${s.config.name}: scollegata`)
    }catch(error){s.stopping=false;s.status=s.mounted?'connected':'error';s.detail=error instanceof Error?error.message:'Scollegamento non completato.';throw error}
    finally{this.changed()}
  }
  cleanupOwnedDirectory(id:string):void {
    const s=this.mounts.get(id)
    if(process.platform!=='linux' || !s || s.child || !s.ownedDirectory || !existsSync(s.config.localPath))return
    const st=lstatSync(s.config.localPath)
    if(st.isDirectory() && !st.isSymbolicLink() && st.dev===s.ownedDirectory.dev && st.ino===s.ownedDirectory.ino && !isLinuxMounted(s.config.localPath) && readdirSync(s.config.localPath).length===0)rmdirSync(s.config.localPath)
  }
  async disconnectAll():Promise<void> {for(const id of this.mounts.keys())await this.disconnect(id)}
}
````
<!-- DT-REPO-FILE-END F016 -->

<a id="file-f017"></a>
### F017 — `src/main/control.ts`
**3877 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F017","path":"src/main/control.ts","mode":"100644","encoding":"utf-8","bytes":3877,"lines":64,"sha256":"8b20dab2989a8768d0e3bcfd1e3280c62b940d0f2348f19268f6cc2755f86455","git_blob_sha1":"abeef6cef5cb5cdc983fc65851dde28f950b65fb","fence":"````","final_lf":true} -->
````typescript
import http from 'node:http'
import net from 'node:net'
import { randomBytes } from 'node:crypto'

export type ControlMethod = 'core/pid' | 'core/version' | 'core/stats' | 'core/quit' | 'vfs/stats' | 'vfs/queue'
  | 'mount/types' | 'mount/mount' | 'mount/unmount' | 'mount/listmounts'
const METHODS = new Set<ControlMethod>(['core/pid','core/version','core/stats','core/quit','vfs/stats','vfs/queue','mount/types','mount/mount','mount/unmount','mount/listmounts'])

/** Private to the main process. No arbitrary URL, no renderer RPC proxy, no redirects. */
export class ControlClient {
  constructor(readonly port: number, private readonly secret: string) {
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !secret) throw new Error('Controllo locale non valido.')
  }
  call(method: ControlMethod, parameters: Record<string, unknown> = {}, timeoutMs = 4000): Promise<Record<string, unknown>> {
    if (!METHODS.has(method)) return Promise.reject(new Error('Comando di controllo non consentito.'))
    const body = JSON.stringify(parameters)
    return new Promise((resolve, reject) => {
      let done = false
      const finish = (error?: Error, value?: Record<string, unknown>): void => {
        if (done) return
        done = true; clearTimeout(timer)
        error ? reject(error) : resolve(value!)
      }
      const request = http.request({hostname:'127.0.0.1', port:this.port, path:`/${method}`, method:'POST', agent:false,
        headers:{Authorization:`Basic ${Buffer.from(`drive-tambu:${this.secret}`).toString('base64')}`, 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(body)}}, response => {
        let text = '', size = 0
        response.setEncoding('utf8')
        response.on('data', (data: string) => {
          size += Buffer.byteLength(data)
          if (size > 2 * 1024 * 1024) { finish(new Error('Risposta del controllo troppo grande.')); response.destroy(); request.destroy(); return }
          text += data
        })
        response.on('error', () => finish(new Error('Risposta del controllo interrotta.')))
        response.on('end', () => {
          // Backend error bodies can contain paths, parameters and credentials. Never forward them.
          if (response.statusCode !== 200) { finish(new Error(`Il controllo ${method} non e riuscito (HTTP ${response.statusCode}).`)); return }
          try {
            const value: unknown = JSON.parse(text)
            if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
            finish(undefined, value as Record<string, unknown>)
          } catch { finish(new Error('Il componente ha restituito una risposta non valida.')) }
        })
      })
      const timer = setTimeout(() => { finish(new Error('Il controllo locale non ha risposto in tempo.')); request.destroy() }, timeoutMs)
      request.on('error', () => finish(new Error('Il componente di collegamento non risponde.')))
      request.end(body)
    })
  }
}
export async function createControl(): Promise<{client:ControlClient; env:NodeJS.ProcessEnv; secret:string}> {
  const port = await new Promise<number>((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') { server.close(); reject(new Error('Porta locale non disponibile.')); return }
      server.close(error => error ? reject(error) : resolve(address.port))
    })
  })
  const secret = randomBytes(32).toString('hex')
  // Do not inherit flags that could expose RC, serve files or launch a web GUI.
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^RCLONE_RC_/i.test(k)))
  return {client:new ControlClient(port,secret), secret, env:{...env,RCLONE_RC_USER:'drive-tambu',RCLONE_RC_PASS:secret}}
}
````
<!-- DT-REPO-FILE-END F017 -->

<a id="file-f018"></a>
### F018 — `src/main/preflight.ts`
**2516 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F018","path":"src/main/preflight.ts","mode":"100644","encoding":"utf-8","bytes":2516,"lines":28,"sha256":"f7e29b5270e81fde97b85b7e12f8d44bc010fa46ead4f5ae5c144a4d75d6c5b6","git_blob_sha1":"8cd23bc1121ac6fa454d9ac7451b1484175ed212","fence":"````","final_lf":true} -->
````typescript
/** Best-effort observation of stock rclone. This is NOT a write barrier. */
export interface PreflightResult {
  kind: 'confirm' | 'blocked' | 'unknown'
  message: string
  queued?: number
  active?: number
}
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const count = (x: unknown): x is number => Number.isSafeInteger(x) && (x as number) >= 0
const optionalList = (x: unknown): boolean => x === undefined || x === null || Array.isArray(x)
export const unknownActivity = (): PreflightResult => ({kind: 'unknown', message: 'Non riesco a verificare i trasferimenti. La cartella resta collegata. Riprova tra poco.'})
export function assessTransfers(vfs: unknown, core: unknown, queue: unknown): PreflightResult {
  if (!object(vfs) || !object(vfs.diskCache) || !object(core) || !object(queue)) return unknownActivity()
  const d = vfs.diskCache
  if (!['uploadsQueued', 'uploadsInProgress', 'erroredFiles'].every(k => count(d[k])) || typeof d.outOfSpace !== 'boolean'
    || !['bytes', 'checks', 'transfers', 'errors'].every(k => count(core[k]))
    || !optionalList(core.transferring) || !optionalList(core.checking)
    || !Object.hasOwn(queue, 'queue') || (queue.queue !== null && !Array.isArray(queue.queue))) return unknownActivity()
  const queued = Math.max(d.uploadsQueued as number, Array.isArray(queue.queue) ? queue.queue.length : 0)
  const active = (d.uploadsInProgress as number) + (Array.isArray(core.transferring) ? core.transferring.length : 0)
    + (Array.isArray(core.checking) ? core.checking.length : 0)
  if (d.outOfSpace) return {kind:'blocked', message:'Lo spazio temporaneo sul computer non basta. Libera spazio senza cancellare i file temporanei di Drive Tambu, poi riprova.', queued, active}
  if ((d.erroredFiles as number) > 0) return {kind:'blocked', message:'Ci sono salvataggi locali da verificare. La cartella resta collegata; trovi i dettagli in Attivita.', queued, active}
  if (queued || active) return {kind:'blocked', message: queued ? `Ci sono ${queued} file ancora da inviare. Attendi il completamento oppure continua in background.` : 'Ci sono trasferimenti o controlli in corso. Attendi il completamento oppure continua in background.', queued, active}
  // core.errors/fatalError are historical counters, not evidence of a current problem.
  // inUse is NOT the number of files still open by other applications.
  return {kind:'confirm', message:'Non risultano trasferimenti in corso.', queued:0, active:0}
}
````
<!-- DT-REPO-FILE-END F018 -->

<a id="file-f019"></a>
### F019 — `src/main/operations.ts`
**2921 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F019","path":"src/main/operations.ts","mode":"100644","encoding":"utf-8","bytes":2921,"lines":60,"sha256":"a1223767d43601d59d5e7d6608d30eb9632d092696aac2aa9861234c44780e81","git_blob_sha1":"5205689612d3580b2113f5ee2737a35c1af3ae1c","fence":"````","final_lf":true} -->
````typescript
import { randomUUID } from 'node:crypto'
import type { OperationView, OperationReply } from '../shared/types'
import type { PreflightResult } from './preflight'

interface OperationRequest {
  kind: OperationView['kind']; name?: string; from?: string; to?: string
  requiresConfirmation: boolean
}
interface Pending {
  request:OperationRequest; view:OperationView
  check:()=>Promise<PreflightResult>; execute:()=>Promise<void>; finish:(success:boolean)=>void
}
/** Serializes app actions only. External applications can still begin writes. */
export class OperationCoordinator {
  private pending:Pending|null=null
  constructor(private hooks:{changed:()=>void;pause:()=>void;resume:()=>void;hide:()=>void}){}
  get busy():boolean{return this.pending!==null}
  get view():OperationView|null{return this.pending?structuredClone(this.pending.view):null}
  async run(request:OperationRequest,check:()=>Promise<PreflightResult>,execute:()=>Promise<void>):Promise<boolean>{
    if(this.pending)throw new Error('Completa o annulla l\'operazione gia aperta.')
    const promise=new Promise<boolean>(finish=>{
      this.pending={request,check,execute,finish,view:{id:randomUUID(),kind:request.kind,name:request.name,from:request.from,to:request.to,phase:'checking',message:'Controllo dei trasferimenti...'}}
    })
    this.hooks.pause();this.hooks.changed()
    void this.evaluate(this.pending!,false)
    return promise
  }
  private async evaluate(p:Pending,confirmed:boolean):Promise<void>{
    p.view.phase='checking';p.view.message='Controllo dei trasferimenti...';this.hooks.changed()
    try{
      const result=await p.check()
      if(this.pending!==p)return
      if(result.kind!=='confirm'){
        p.view.phase='blocked';p.view.message=result.message;this.hooks.changed();return
      }
      if(!confirmed && p.request.requiresConfirmation){
        p.view.phase='confirm';p.view.message=result.message;this.hooks.changed();return
      }
      p.view.phase='working';p.view.message='Completo l\'operazione...';this.hooks.changed()
      await p.execute()
      if(this.pending===p)this.complete(p,true)
    }catch(error){
      if(this.pending!==p)return
      p.view.phase='blocked';p.view.message=error instanceof Error?error.message:'Operazione non completata. Riprova.';this.hooks.changed()
    }
  }
  private complete(p:Pending,success:boolean):void{
    this.pending=null;this.hooks.resume();this.hooks.changed();p.finish(success)
  }
  async respond(id:string,reply:OperationReply):Promise<void>{
    const p=this.pending
    if(!p || p.view.id!==id)return
    if(p.view.phase==='working')return
    if(reply==='cancel' || reply==='background'){
      this.complete(p,false);if(reply==='background')this.hooks.hide();return
    }
    if(reply==='confirm' && p.view.phase==='confirm')await this.evaluate(p,true)
    else if(reply==='retry' && p.view.phase==='blocked')await this.evaluate(p,false)
  }
}
````
<!-- DT-REPO-FILE-END F019 -->

<a id="file-f020"></a>
### F020 — `src/main/backups.ts`
**9646 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F020","path":"src/main/backups.ts","mode":"100644","encoding":"utf-8","bytes":9646,"lines":189,"sha256":"5c93cf37bf1d15c8bc8fbd9481b51c1bfed6c888ee0b582160978655143b1900","git_blob_sha1":"8cd9d24d3708247436d7f8307b8b3ffd9e533a32","fence":"````","final_lf":true} -->
````typescript
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, lstatSync, rmSync, readFileSync, writeFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { ConfigStore, validateMount } from './store'
import { remoteSpec, runRclone, resolveRcloneExecutable, READ_FLAGS, SFTP_FLAGS, errorDetails } from './diagnostics'
import type { BackupStatus, MountConfig, BackupProgress } from '../shared/types'
import { isBackupDue } from '../shared/schedule'
import { JsonLogReader, progressFromStats } from './backup-progress'

interface Job { state: BackupStatus; detail: string; progress?: BackupProgress; process?: ChildProcess; abort?: AbortController }

function inside(child: string, parent: string): boolean {
  const c = path.resolve(child)
  const p = path.resolve(parent)
  const relative = path.relative(process.platform === 'win32' ? p.toLowerCase() : p, process.platform === 'win32' ? c.toLowerCase() : c)
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative))
}

function verifyDestination(m: MountConfig, others: MountConfig[]): void {
  const root = m.backup.destination
  if (!root || !path.isAbsolute(root)) throw new Error('Imposta una destinazione locale per il backup.')
  for (const item of others) {
    if (inside(root, item.localPath)) throw new Error('Destinazione backup all interno di una cartella montata: operazione bloccata.')
  }
}


// Safety marker: never run a destructive sync inside an arbitrary existing directory.
function ensureManagedDestination(root: string, mountId: string): void {
  const marker = path.join(root, '.drive-tambu-backup.json')
  if (existsSync(root)) {
    if (existsSync(marker)) {
      const data: unknown = JSON.parse(readFileSync(marker, 'utf8'))
      if (!data || typeof data !== 'object' || (data as { mountId?: string }).mountId !== mountId) {
        throw new Error('La cartella backup e associata a un altro collegamento.')
      }
      return
    }
    if (readdirSync(root).length > 0) {
      throw new Error('La destinazione contiene file non gestiti da Drive Tambu. Crea una cartella dedicata e vuota.')
    }
  } else mkdirSync(root, { recursive: true })
  writeFileSync(marker, JSON.stringify({ format: 'drive-tambu-backup-v1', mountId }, null, 2), { flag: 'wx', mode: 0o600 })
}

function cleanupArchive(root: string, retentionDays: number): void {
  if (!retentionDays) return
  const archive = path.join(root, 'archivio')
  if (!existsSync(archive)) return
  const cutoff = Date.now() - retentionDays * 86400 * 1000
  for (const name of readdirSync(archive)) {
    if (!/^\d{4}-\d{2}-\d{2}_\d{6}$/.test(name)) continue
    const absolute = path.join(archive, name)
    const stats = lstatSync(absolute)
    if (!stats.isDirectory() || stats.isSymbolicLink()) continue
    const iso = `${name.slice(0, 10)}T${name.slice(11, 13)}:${name.slice(13, 15)}:${name.slice(15, 17)}`
    if (new Date(iso).getTime() < cutoff) rmSync(absolute, { recursive: true, force: true })
  }
}

export class BackupManager {
  private jobs = new Map<string, Job>()
  private timer: NodeJS.Timeout | undefined
  private startupTimer: NodeJS.Timeout | undefined
  private stopped = false
  private paused = false
  pauseScheduling(): void { this.paused = true }
  resumeScheduling(): void { this.paused = false }
  constructor(private store: ConfigStore, private changed: () => void, private log: (line: string) => void) {}

  state(id: string): { status: BackupStatus; detail: string; progress?: BackupProgress } {
    const entry = this.jobs.get(id)
    return { status: entry?.state ?? 'idle', detail: entry?.detail ?? 'In attesa', progress: entry?.progress ? { ...entry.progress } : undefined }
  }

  startScheduler(): void {
    if (this.timer && !this.stopped) return
    this.stopped = false
    const tick = (): void => { void this.checkSchedule().catch(error => this.log(`Programmazione backup: ${String(error)}`)) }
    this.timer = setInterval(tick, 15000)
    this.startupTimer = setTimeout(tick, 12000)
  }

  private async checkSchedule(): Promise<void> {
    if (this.stopped || this.paused) return
    if ([...this.jobs.values()].some(j => j.state === 'running')) return
    this.store.reconcileScheduleTimeZone()
    const now = new Date()
    const due = this.store.mounts.filter(m => isBackupDue(m, now))
      .sort((a, b) => Date.parse(a.nextBackupAt!) - Date.parse(b.nextBackupAt!))
    const m = due[0]
    if (m) {
      try { await this.run(m.id) } catch (error) { this.log(`Backup ${m.name}: ${String(error)}`) }
    }
  }

  async run(id: string): Promise<void> {
    if (this.paused) throw new Error('Completa o annulla prima l\'operazione aperta.')
    if (this.stopped) throw new Error('Il programma si sta chiudendo. Riaprilo prima di eseguire il backup.')
    const m = validateMount(this.store.find(id), this.store.mounts)
    if (!m.backup.enabled) throw new Error('Attiva prima il backup nelle impostazioni della cartella.')
    if ([...this.jobs.values()].some(j => j.state === 'running')) throw new Error('Un backup e gia in corso. Riprova dopo.')
    verifyDestination(m, this.store.mounts)
    const source = remoteSpec(m.remote, m.remotePath)
    const root = m.backup.destination
    const current = path.join(root, 'corrente')
    const archiveBase = path.join(root, 'archivio')
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15)
    // ISO timestamp above: YYYYMMDD_HHMMSS, format the archive name consistently.
    const stamp = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}_${timestamp.slice(9)}`
    const archive = path.join(archiveBase, stamp)
    const job: Job = { state: 'running', detail: 'Controllo dei file...', progress: progressFromStats({}), abort: new AbortController() }
    this.jobs.set(id, job)
    this.changed()
    try {
      this.store.markBackupStarted(id)
      const firstLevel = await runRclone(this.store.settings.rcloneExecutable, ['lsf', source, '--max-depth', '1', ...READ_FLAGS], 45000, job.abort?.signal)
      // Never mirror an unexpectedly empty source over an existing local backup.
      if (!firstLevel.trim() && existsSync(current) && readdirSync(current).length > 0) {
        throw new Error('La sorgente remota risulta vuota. Backup bloccato per proteggere i file locali.')
      }
      if (job.abort?.signal.aborted) throw new Error('Backup interrotto.')
      ensureManagedDestination(root, m.id)
      mkdirSync(current, { recursive: true })
      mkdirSync(archiveBase, { recursive: true })
      const args = [
        'sync', source, current,
        '--backup-dir', archive,
        '--delete-after',
        '--log-level', 'NOTICE',
        '--stats', '1s', '--stats-log-level', 'NOTICE', '--use-json-log', ...SFTP_FLAGS
      ]
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(resolveRcloneExecutable(this.store.settings.rcloneExecutable), args, { shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] })
        job.process = proc
        job.detail = 'Copia e archiviazione in corso...'
        this.changed()
        let lastError = ''
        const receive = (record: Record<string, unknown>): void => {
          if (record.stats && typeof record.stats === 'object' && !Array.isArray(record.stats)) {
            job.progress = progressFromStats(record.stats as Record<string, unknown>)
            job.detail = job.progress.phase === 'checking' ? 'Controllo dei file...' : job.progress.phase === 'finishing' ? 'Finalizzazione del backup...' : 'Copia in corso...'
            this.changed()
          }
          if (record.level === 'error' || record.level === 'fatal') lastError = errorDetails(new Error(String(record.msg ?? 'Backup non riuscito')))
        }
        const stdout = new JsonLogReader(receive), stderr = new JsonLogReader(receive)
        proc.stdout?.on('data', (chunk: Buffer) => stdout.push(chunk))
        proc.stderr?.on('data', (chunk: Buffer) => stderr.push(chunk))
        let settled = false
        const finish = (err?: Error): void => {
          if (settled) return
          settled = true
          job.process = undefined
          err ? reject(err) : resolve()
        }
        proc.once('error', e => finish(e))
        proc.once('close', code => {
          stdout.end(); stderr.end()
          finish(code === 0 && !job.abort?.signal.aborted ? undefined : new Error(lastError || `Backup interrotto o non riuscito (codice ${code ?? '?'}).`))
        })
      })
      try { cleanupArchive(root, m.backup.retentionDays) }
      catch (error) { this.log(`${m.name}: pulizia archivio non riuscita - ${String(error)}`) }
      this.store.markBackup(id, true)
      job.state = 'idle'
      job.progress = { ...(job.progress ?? progressFromStats({})), phase: 'complete', percent: 100 }
      job.detail = 'Backup completato'
      this.log(`${m.name}: backup completato`)
    } catch (error) {
      this.store.markBackup(id, false)
      job.state = 'error'
      job.detail = error instanceof Error ? error.message : String(error)
      this.log(`${m.name}: backup non riuscito - ${job.detail}`)
      throw error
    } finally {
      this.changed()
    }
  }

  stop(): void {
    if ([...this.jobs.values()].some(job => job.state === 'running')) throw new Error('Attendi il completamento del backup.')
    this.stopped = true
    if (this.timer) clearInterval(this.timer)
    if (this.startupTimer) clearTimeout(this.startupTimer)
    this.timer = undefined

  }
}
````
<!-- DT-REPO-FILE-END F020 -->

<a id="file-f021"></a>
### F021 — `src/main/backup-progress.ts`
**1917 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F021","path":"src/main/backup-progress.ts","mode":"100644","encoding":"utf-8","bytes":1917,"lines":41,"sha256":"0f359e458f9f197a5b90a24d5a29b4a1e573ffe25537e080d13ae06a7ddcb6ea","git_blob_sha1":"2ae5c025d46b2896964f0c67e0b205dde3bff1c0","fence":"````","final_lf":true} -->
````typescript
import { StringDecoder } from 'node:string_decoder'
import type { BackupProgress } from '../shared/types'

const count = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
export function progressFromStats(stats: Record<string, unknown>): BackupProgress {
  const bytes = count(stats.bytes), totalBytes = count(stats.totalBytes)
  return {
    phase: totalBytes > 0 ? (bytes >= totalBytes ? 'finishing' : 'copying') : 'checking',
    percent: totalBytes > 0 ? Math.min(99, Math.floor(bytes / totalBytes * 100)) : null,
    bytes, totalBytes, speed: count(stats.speed), checks: count(stats.checks), transfers: count(stats.transfers)
  }
}

/** rclone --use-json-log emits one JSON object per line, not per stream chunk. */
export class JsonLogReader {
  private decoder = new StringDecoder('utf8')
  private pending = ''
  private dropping = false
  constructor(private receive: (value: Record<string, unknown>) => void) {}
  push(chunk: Buffer): void { this.consume(this.decoder.write(chunk)) }
  end(): void { this.consume(this.decoder.end()); if (!this.dropping && this.pending) this.line(this.pending); this.pending = '' }
  private consume(text: string): void {
    for (const part of text.split(/(?<=\n)/)) {
      const complete = part.endsWith('\n')
      if (!this.dropping) {
        this.pending += part
        if (this.pending.length > 256 * 1024) { this.pending = ''; this.dropping = true }
      }
      if (complete) {
        if (!this.dropping) this.line(this.pending)
        this.pending = ''; this.dropping = false
      }
    }
  }
  private line(text: string): void {
    try {
      const value: unknown = JSON.parse(text)
      if (value && typeof value === 'object' && !Array.isArray(value)) this.receive(value as Record<string, unknown>)
    } catch { /* Ignore non-JSON lines; a nonzero process exit still fails the backup. */ }
  }
}
````
<!-- DT-REPO-FILE-END F021 -->

<a id="file-f022"></a>
### F022 — `src/main/diagnostics.ts`
**10076 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F022","path":"src/main/diagnostics.ts","mode":"100644","encoding":"utf-8","bytes":10076,"lines":130,"sha256":"e31bbaab92eadb000f2e0abfcbabe66caf2335c59b73d01c469145b53a5b0ee5","git_blob_sha1":"c8d8d0df8f9cffa3d53db80c5f32f9255b09767b","fence":"````","final_lf":true} -->
````typescript
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Dependencies, RemoteListing } from '../shared/types'
import type { ConfigStore } from './store'
import { childRemotePath, normalizeRemotePath, parentRemotePath } from '../shared/paths'

// Avoid remote shell/hash probes: the app only needs the SFTP subsystem.
// This also avoids additional SSH sessions through Cloudflare for every probe.
export const SFTP_FLAGS = ['--sftp-disable-hashcheck', '--sftp-shell-type', 'none']
export const READ_FLAGS = [...SFTP_FLAGS, '--contimeout', '15s', '--timeout', '30s', '--retries', '1', '--low-level-retries', '1']

export class ConnectionError extends Error {
  constructor(public readonly code: string, message: string, public readonly details = '') { super(message); this.name = 'ConnectionError' }
}
export function connectionError(error: unknown): ConnectionError {
  if (error instanceof ConnectionError) return error
  const e = error as { message?: string; stderr?: string; code?: string }
  const detail = (e?.stderr || e?.message || String(error)).trim().slice(-1800)
  if (e?.code === 'ENOENT') return new ConnectionError('missing-component', 'Il componente di collegamento non e stato trovato. Apri Impostazioni e premi Rileva di nuovo.', detail)
  if (/host key verification failed|REMOTE HOST IDENTIFICATION HAS CHANGED|knownhosts|host key.*mismatch/i.test(detail)) return new ConnectionError('host-key', 'Non e possibile verificare l\'identita del server. Non ignorare questo avviso: controlla la chiave del server.', detail)
  if (/permission denied.*publickey|unable to authenticate|authentication failed|no supported methods remain|sign_and_send_pubkey/i.test(detail)) return new ConnectionError('authentication', 'Il server non ha autorizzato l\'accesso. La chiave SSH deve essere disponibile e sbloccata sul computer.', detail)
  if (/WinFsp|cgofuse|fusermount|libfuse|fuse device not found/i.test(detail)) return new ConnectionError('filesystem', 'Manca il componente necessario per collegare le cartelle: WinFsp su Windows o FUSE su Linux. Controlla le Impostazioni.', detail)
  if (/didn.t find section|config.*section.*not found|couldn.t find.*remote/i.test(detail)) return new ConnectionError('missing-server', 'Questo server non e piu tra le connessioni salvate. Selezionalo nuovamente nelle Impostazioni.', detail)
  if (/config.*encrypt|configuration.*password|RCLONE_CONFIG_PASS|unable to decrypt/i.test(detail)) return new ConnectionError('locked-config', 'La configurazione della connessione e protetta da password e non e disponibile per l\'app.', detail)
  if (/directory not found|object not found|no such file|not a directory/i.test(detail)) return new ConnectionError('missing-folder', 'La cartella sul server non esiste o non e accessibile. Premi Sfoglia per sceglierne un\'altra.', detail)
  if (/permission denied|access denied/i.test(detail)) return new ConnectionError('permission', 'Non hai il permesso di accedere a questa cartella. Scegline un\'altra o controlla i permessi sul server.', detail)
  if (/timeout|timed out|deadline exceeded/i.test(detail)) return new ConnectionError('timeout', 'Il server non ha risposto in tempo. Riprova e verifica la connessione nelle Impostazioni.', detail)
  if (/connection refused|network is unreachable|no such host|could not resolve|name or service not known|connection reset/i.test(detail)) return new ConnectionError('network', 'Il server non e raggiungibile. Controlla la rete e che il server sia acceso, poi riprova.', detail)
  return new ConnectionError('unknown', 'Il collegamento non e riuscito. Apri i dettagli in Attivita per conoscere il messaggio del componente di connessione.', detail)
}
export function errorDetails(error: unknown): string {
  const e = connectionError(error)
  // Diagnostics never read or expose the rclone config or SSH private keys.
  return (e.details || e.message).replace(/(password|passphrase|token|secret)([=:]\s*)[^\s]+/gi, '$1$2[nascosto]')
}
export function remoteSpec(remote: string, remotePath: string): string {
  return `${remote}:${normalizeRemotePath(remote, remotePath)}`
}
export function resolveRcloneExecutable(configured: string): string {
  if (configured !== 'rclone' && configured !== 'rclone.exe') return configured
  if (process.platform !== 'win32') return configured
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Links', 'rclone.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'rclone', 'rclone.exe')
  ]
  return candidates.find((candidate): candidate is string => !!candidate && existsSync(candidate)) || configured
}

/** Stop only the process tree started by this app; never kill rclone by name. */
export function stopChild(child: ChildProcess, force = false): void {
  if (!child.pid || child.exitCode !== null) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    killer.on('error', () => { try { child.kill() } catch { /* already gone */ } })
  } else {
    try { process.kill(-child.pid, force ? 'SIGKILL' : 'SIGTERM') }
    catch { try { child.kill(force ? 'SIGKILL' : 'SIGTERM') } catch { /* already gone */ } }
  }
}

export function runRclone(executable: string, args: string[], timeout = 30000, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new ConnectionError('cancelled', 'Operazione annullata.')); return }
    let child: ChildProcess
    try { child = spawn(resolveRcloneExecutable(executable), args, { shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] }) }
    catch (error) { reject(connectionError(error)); return }
    let done = false, stdout = '', stderr = '', size = 0
    let timer: NodeJS.Timeout | undefined
    const finish = (error?: Error): void => {
      if (done) return
      done = true
      if (timer) clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      error ? reject(error) : resolve(stdout.trim())
    }
    const abort = (): void => { stopChild(child, true); finish(new ConnectionError('cancelled', 'Operazione annullata.')) }
    signal?.addEventListener('abort', abort, { once: true })
    timer = setTimeout(() => {
      stopChild(child, true)
      finish(new ConnectionError('timeout', 'Il server non ha risposto in tempo. Riprova e verifica la connessione nelle Impostazioni.', stderr))
    }, timeout)
    child.stdout?.setEncoding('utf8')
    child.stderr?.setEncoding('utf8')
    child.stdout?.on('data', (data: string) => {
      if (done) return
      size += Buffer.byteLength(data)
      if (size > 8 * 1024 * 1024) { stopChild(child, true); finish(new ConnectionError('large-list', 'Questa cartella contiene troppi elementi da mostrare. Apri direttamente una sottocartella.')); return }
      stdout += data
    })
    child.stderr?.on('data', (data: string) => { stderr = (stderr + data).slice(-8192) })
    child.once('error', error => finish(connectionError(error)))
    child.once('close', code => finish(code === 0 ? undefined : connectionError({ message: stderr || `Il processo e terminato con codice ${code ?? '?'}.` })))
    if (signal?.aborted) abort()
  })
}

export async function listRemoteDirectories(executable: string, remote: string, input: string, signal?: AbortSignal): Promise<RemoteListing> {
  const remotePath = normalizeRemotePath(remote, input)
  const output = await runRclone(executable, ['lsjson', remoteSpec(remote, remotePath), '--dirs-only', '--no-modtime', '--no-mimetype', ...READ_FLAGS], 40000, signal)
  let items: unknown
  try { items = JSON.parse(output) } catch { throw new ConnectionError('invalid-response', 'Il server ha restituito un elenco non valido. Riprova.') }
  if (!Array.isArray(items)) throw new ConnectionError('invalid-response', 'Il server ha restituito un elenco non valido. Riprova.')
  const entries = items.filter((v): v is { IsDir: true; Name: string } => !!v && typeof v === 'object' && v.IsDir === true && typeof v.Name === 'string')
    .map(v => ({ name: v.Name, path: childRemotePath(remotePath, v.Name) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'it', { numeric: true, sensitivity: 'base' }))
  return { remote, path: remotePath, parent: parentRemotePath(remotePath), entries }
}
export async function checkRemoteDirectory(executable: string, remote: string, remotePath: string, signal?: AbortSignal): Promise<void> {
  const output = await runRclone(executable, ['lsjson', remoteSpec(remote, remotePath), '--stat', '--no-modtime', '--no-mimetype', ...READ_FLAGS], 40000, signal)
  let item: { IsDir?: boolean }
  try { item = JSON.parse(output) } catch { throw new ConnectionError('invalid-response', 'Il server ha restituito una risposta non valida. Riprova.') }
  if (item?.IsDir !== true) throw new ConnectionError('not-directory', 'Il percorso scelto non e una cartella. Premi Sfoglia per scegliere una directory.')
}

export async function diagnostics(store: ConfigStore): Promise<Dependencies> {
  const binary = store.settings.rcloneExecutable
  const note = process.platform === 'win32' ? 'Per collegare le cartelle serve WinFsp installato.' : 'Per collegare le cartelle serve FUSE installato. Su Wayland il posizionamento del pannello dipende dal desktop.'
  try {
    const version = (await runRclone(binary, ['version'], 9000)).split('\n')[0]
    try {
      const remotes = (await runRclone(binary, ['listremotes'], 9000)).split(/\r?\n/).map(v => v.trim().replace(/:$/, '')).filter(Boolean)
      return { rclone: { ok: true, detail: version }, remotes, note }
    } catch (error) {
      return { rclone: { ok: true, detail: version }, remotes: [], note, connectionError: connectionError(error).message }
    }
  } catch (error) {
    return { rclone: { ok: false, detail: connectionError(error).message }, remotes: [], note }
  }
}
````
<!-- DT-REPO-FILE-END F022 -->

<a id="file-f023"></a>
### F023 — `src/main/shortcuts.ts`
**4463 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F023","path":"src/main/shortcuts.ts","mode":"100644","encoding":"utf-8","bytes":4463,"lines":78,"sha256":"a39c050286d56478f52600724d701457adc5cc2bae84ac1606c64fd5b3da7df6","git_blob_sha1":"67fc3360fe00858727be696716bf0a6177362ad4","fence":"````","final_lf":true} -->
````typescript
import { constants, openSync, closeSync, writeFileSync, fchmodSync, lstatSync } from 'node:fs'
import type { ConnectionStatus } from '../shared/types'

function validId(id: string): void {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{6,80}$/.test(id)) throw new Error('Identificativo del collegamento non valido.')
}
export function requestedFolder(argv: string[]): string | null {
  const positions = argv.flatMap((arg, index) => arg === '--open-folder' ? [index] : [])
  if (!positions.length) return null
  if (positions.length !== 1) throw new Error('Richiesta di collegamento non valida.')
  const id = argv[positions[0] + 1]
  validId(id)
  return id
}
export function shortcutName(name: string): string {
  let leaf = name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/, '').slice(0, 100) || 'Cartella'
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(leaf)) leaf = `Cartella-${leaf}`
  return leaf
}
const desktopString = (s: string): string => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
export function desktopEntry(executable: string, id: string, name: string): string {
  validId(id)
  if (!executable.startsWith('/') || /[\r\n\0]/.test(executable)) throw new Error('Percorso eseguibile non valido.')
  // Exec has its own quoting rules, followed by Desktop Entry string escaping.
  const quoted = '"' + desktopString(executable.replace(/[%\\`"$]/g, c => c === '%' ? '%%' : '\\' + c)) + '"'
  return `[Desktop Entry]\nType=Application\nVersion=1.0\nName=${desktopString(name)}\nComment=Apri la cartella con Drive Tambu\nExec=${quoted} --open-folder ${id}\nIcon=folder\nTerminal=false\nStartupNotify=true\n`
}
export function writeLinuxShortcut(destination: string, executable: string, id: string, name: string): void {
  if (!destination.endsWith('.desktop')) throw new Error('Il collegamento Linux deve avere estensione .desktop.')
  try {
    const stat = lstatSync(destination)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('La destinazione e un collegamento simbolico o non e un file regolare.')
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  const text = desktopEntry(executable, id, name)
  const fd = openSync(destination, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW, 0o755)
  try { writeFileSync(fd, text, 'utf8'); fchmodSync(fd, 0o755) } finally { closeSync(fd) }
}

type OpenerServices = {
  find(id: string): { localPath: string }
  state(id: string): { status: ConnectionStatus; detail: string }
  connect(id: string): Promise<void>
  open(path: string): Promise<string>
  stopping(): boolean
}
export class SavedFolderOpener {
  private pending = new Map<string, Promise<void>>()
  constructor(private services: OpenerServices, private timeoutMs = 120000, private pollMs = 250) {}
  open(id: string): Promise<void> {
    validId(id)
    const existing = this.pending.get(id)
    if (existing) return existing
    const promise = this.perform(id).finally(() => this.pending.delete(id))
    this.pending.set(id, promise)
    return promise
  }
  private async perform(id: string): Promise<void> {
    this.services.find(id) // Never create an unknown mount from command-line arguments.
    if (this.services.stopping()) throw new Error('Drive Tambu si sta chiudendo.')
    const initial = this.services.state(id).status
    if (initial === 'disconnecting') throw new Error('La cartella si sta scollegando. Riprova tra poco.')
    const start = Date.now()
    if (initial !== 'connected') await this.services.connect(id)
    while (Date.now() - start < this.timeoutMs) {
      if (this.services.stopping()) throw new Error('Apertura interrotta: Drive Tambu si sta chiudendo.')
      const state = this.services.state(id)
      if (state.status === 'connected') {
        const error = await this.services.open(this.services.find(id).localPath)
        if (error) throw new Error(error)
        return
      }
      if (state.status === 'error') throw new Error(state.detail || 'Non riesco a collegare la cartella.')
      if (state.status === 'disconnected' || state.status === 'disconnecting') throw new Error('Il collegamento e stato annullato. Riprova dall\'app.')
      await new Promise<void>(resolve => setTimeout(resolve, this.pollMs))
    }
    throw new Error('La cartella non e ancora disponibile. Controlla il collegamento nell\'app e riprova.')
  }
}
````
<!-- DT-REPO-FILE-END F023 -->

<a id="file-f024"></a>
### F024 — `src/main/window-layout.ts`
**715 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F024","path":"src/main/window-layout.ts","mode":"100644","encoding":"utf-8","bytes":715,"lines":13,"sha256":"cc8288af82e0f30b79408c0554560ac58735dbbc9985e54eb6e4bacfd00ad81e","git_blob_sha1":"8ae1164122d50f5febb3e8b9b92bcec3aa8f5766","fence":"````","final_lf":true} -->
````typescript
import type { WindowMode } from '../shared/types'
export type Bounds = { x: number; y: number; width: number; height: number }

export function layoutBounds(mode: WindowMode, area: Bounds): Bounds {
  const margin = Math.min(16, Math.floor(Math.min(area.width, area.height) / 10))
  const width = Math.min(mode === 'compact' ? 430 : 1180, area.width - margin * 2)
  const height = Math.min(mode === 'compact' ? 650 : 800, area.height - margin * 2)
  return {
    width, height,
    x: mode === 'compact' ? area.x + area.width - width - margin : area.x + Math.floor((area.width - width) / 2),
    y: mode === 'compact' ? area.y + area.height - height - margin : area.y + Math.floor((area.height - height) / 2)
  }
}
````
<!-- DT-REPO-FILE-END F024 -->

<a id="file-f025"></a>
### F025 — `src/preload/index.ts`
**2190 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F025","path":"src/preload/index.ts","mode":"100644","encoding":"utf-8","bytes":2190,"lines":34,"sha256":"971b59174ded3f342b0b94f83907367b2d206f5ed97f15242ae281611bfb7ed4","git_blob_sha1":"5f72f8eaa275ca7bf2e63e47b28bd76b0907150f","fence":"````","final_lf":true} -->
````typescript
import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, DriveAPI, MountConfig, WindowMode } from '../shared/types'

// Only a fixed, typed API is exposed. The renderer never receives raw ipcRenderer.
const api: DriveAPI = {
  respondToOperation: (id, reply) => ipcRenderer.invoke('drive:respondToOperation', id, reply),
  snapshot: () => ipcRenderer.invoke('drive:snapshot'),
  diagnostics: () => ipcRenderer.invoke('drive:diagnostics'),
  chooseDirectory: (name?: string) => ipcRenderer.invoke('drive:chooseDirectory', name),
  chooseExecutable: () => ipcRenderer.invoke('drive:chooseExecutable'),
  browseRemote: (remote, path, requestId) => ipcRenderer.invoke('drive:browseRemote', remote, path, requestId),
  cancelBrowse: requestId => ipcRenderer.invoke('drive:cancelBrowse', requestId),
  checkConnection: (remote, path) => ipcRenderer.invoke('drive:checkConnection', remote, path),
  setWindowMode: (mode: WindowMode) => ipcRenderer.invoke('drive:setWindowMode', mode),
  hideWindow: () => ipcRenderer.invoke('drive:hideWindow'),
  minimizeWindow: () => ipcRenderer.invoke('drive:minimizeWindow'),
  quit: () => ipcRenderer.invoke('drive:quit'),
  saveMount: (mount: MountConfig) => ipcRenderer.invoke('drive:saveMount', mount),
  deleteMount: (id: string) => ipcRenderer.invoke('drive:deleteMount', id),
  connect: (id: string) => ipcRenderer.invoke('drive:connect', id),
  disconnect: (id: string) => ipcRenderer.invoke('drive:disconnect', id),
  openMount: (id: string) => ipcRenderer.invoke('drive:openMount', id),
  createShortcut: (id: string) => ipcRenderer.invoke('drive:createShortcut', id),
  checkRemote: (id: string) => ipcRenderer.invoke('drive:checkRemote', id),
  backupNow: (id: string) => ipcRenderer.invoke('drive:backupNow', id),
  openBackup: (id: string) => ipcRenderer.invoke('drive:openBackup', id),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('drive:saveSettings', settings),
  onChanged: callback => {
    const listener = (): void => callback()
    ipcRenderer.on('drive:changed', listener)
    return () => ipcRenderer.removeListener('drive:changed', listener)
  }
}
contextBridge.exposeInMainWorld('drive', api)
````
<!-- DT-REPO-FILE-END F025 -->

<a id="file-f026"></a>
### F026 — `src/renderer/index.html`
**348 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F026","path":"src/renderer/index.html","mode":"100644","encoding":"utf-8","bytes":348,"lines":13,"sha256":"0fa2a7964f0cbe16a950f41ee10728fdb5fc91ee2ca5624fbe841ad8a76f7b11","git_blob_sha1":"6dd00c00ccad533a80b0ee1e3bd01c9a9c813914","fence":"````","final_lf":true} -->
````html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f7f8fc" />
    <title>Drive Tambu</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````
<!-- DT-REPO-FILE-END F026 -->

<a id="file-f027"></a>
### F027 — `src/renderer/src/main.tsx`
**226 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F027","path":"src/renderer/src/main.tsx","mode":"100644","encoding":"utf-8","bytes":226,"lines":8,"sha256":"fcd7e4b5c6b5132195f677d9e92ea31d7a36e2201239a48c1fbe4fa66fa66073","git_blob_sha1":"d24bbc1230f94f9568d2e22523139fd5bfbcc611","fence":"````","final_lf":true} -->
````tsx
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
````
<!-- DT-REPO-FILE-END F027 -->

<a id="file-f028"></a>
### F028 — `src/renderer/src/global.d.ts`
**119 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F028","path":"src/renderer/src/global.d.ts","mode":"100644","encoding":"utf-8","bytes":119,"lines":5,"sha256":"1e8767469034c5bdf94cba875a3a0975115cea1e949d664295aa82c60f5238a1","git_blob_sha1":"d8c42febcfc9af07d2d737897e256d6bcbb3f7e7","fence":"````","final_lf":true} -->
````typescript
import type { DriveAPI } from '../../shared/types'
declare global {
  interface Window { drive: DriveAPI }
}
export {}
````
<!-- DT-REPO-FILE-END F028 -->

<a id="file-f029"></a>
### F029 — `src/renderer/src/App.tsx`
**48986 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F029","path":"src/renderer/src/App.tsx","mode":"100644","encoding":"utf-8","bytes":48986,"lines":425,"sha256":"fe96df42a6d38ef565be967f78918e0395fec372c236b3005ff62753cc483c2b","git_blob_sha1":"987840b55499f95a7ea8029ad3228ceacb3f3f38","fence":"````","final_lf":true} -->
````tsx
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
````
<!-- DT-REPO-FILE-END F029 -->

<a id="file-f030"></a>
### F030 — `src/renderer/src/styles.css`
**28834 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F030","path":"src/renderer/src/styles.css","mode":"100644","encoding":"utf-8","bytes":28834,"lines":343,"sha256":"061b36cbce695cda3afada69b3bafa0d1be37807c87a61bd8647719cd3eef90f","git_blob_sha1":"160dfd5c3863c618b265f07b56d7ed663109914b","fence":"````","final_lf":true} -->
````css
:root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color-scheme: light;
  --bg: #f5f7fb; --surface: #ffffff; --surface-soft: #f8f9fc; --sidebar: #edf1f8;
  --text: #20283a; --muted: #66748b; --line: #e1e7f0; --input: #f8faff;
  --accent: #3478f6; --accent-hover: #2267e2; --accent-soft: #eaf1ff;
  --green: #237b59; --green-soft: #eaf7f0; --red: #b73143; --red-soft: #fff1f2;
  --amber: #93601b; --amber-soft: #fff5e4; --focus: #73a4ff;
  --shadow: 0 5px 25px rgb(26 43 73 / 4%); --modal-shadow: 0 24px 90px rgb(13 28 57 / 24%);
  font-synthesis: none; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased;
  font-size: 14px; line-height: 1.5; color: var(--text); background: var(--bg);
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #141820; --surface: #1e2430; --surface-soft: #242b39; --sidebar: #191e29;
  --text: #edf2fa; --muted: #a4b0c5; --line: #343d4e; --input: #181e29;
  --accent: #76a7ff; --accent-hover: #97bdff; --accent-soft: #293b58;
  --green: #86d6b2; --green-soft: #223e35; --red: #ffabb8; --red-soft: #482b36;
  --amber: #f3c98a; --amber-soft: #453b2b; --focus: #91b9ff;
  --shadow: 0 5px 25px rgb(0 0 0 / 9%); --modal-shadow: 0 24px 90px rgb(0 0 0 / 55%);
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; min-width: 0; overflow: hidden; }
body { background: var(--bg); color: var(--text); }
button, input, select { font: inherit; }
button { cursor: pointer; color: inherit; -webkit-app-region: no-drag; }
button, input, select, summary { -webkit-tap-highlight-color: transparent; }
button:disabled, input:disabled, select:disabled { cursor: not-allowed; opacity: .55; }
button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
input, select { width: 100%; min-width: 0; min-height: 42px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 11px; color: var(--text); background: var(--input); }
input::placeholder { color: var(--muted); opacity: .85; }
input:focus, select:focus { border-color: var(--accent); }
input[type="number"] { max-width: 230px; }
h1, h2, h3, p { margin: 0; }
h1 { font-size: 32px; letter-spacing: -1.1px; line-height: 1.2; font-weight: 700; }
h2 { font-size: 18px; letter-spacing: -.4px; line-height: 1.3; }
h3 { font-size: 15px; line-height: 1.4; }
svg { flex-shrink: 0; vertical-align: middle; }
* { scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
::selection { color: var(--text); background: var(--accent-soft); }
.app-shell { height: 100%; display: flex; overflow: hidden; min-width: 0; }
.sidebar { width: 230px; flex: 0 0 230px; padding: 30px 15px 18px; background: var(--sidebar); border-right: 1px solid var(--line); display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 11px; min-width: 0; user-select: none; }
.brand-icon { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 13px; background: var(--accent); color: #fff; flex-shrink: 0; box-shadow: 0 5px 12px rgb(52 120 246 / 18%); }
:root[data-theme="dark"] .brand-icon { background: #3478f6; }
.brand > div { display: flex; flex-direction: column; min-width: 0; }
.brand strong { font-size: 17px; font-weight: 650; letter-spacing: -.5px; white-space: nowrap; }
.brand div > span { font-size: 10px; color: var(--muted); white-space: nowrap; letter-spacing: .1px; }
.sidebar > .brand { padding: 0 7px 30px; -webkit-app-region: drag; }
.sidebar-label { font-size: 10px; color: var(--muted); font-weight: 700; letter-spacing: 1.7px; padding: 8px 13px 11px; }
.sidebar nav { display: grid; gap: 5px; }
.nav-item { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 46px; padding: 10px 13px; background: transparent; border: 0; border-radius: 12px; text-align: left; color: var(--muted); font-size: 13px; font-weight: 550; }
.nav-item b { margin-left: auto; font-size: 11px; min-width: 23px; border-radius: 7px; padding: 1px 6px; background: var(--surface); text-align: center; }
.nav-item:hover, .settings-link:hover { background: var(--surface-soft); color: var(--text); }
.nav-item.selected, .settings-link.selected { background: var(--accent-soft); color: var(--accent); }
.sidebar-bottom { margin-top: auto; padding-top: 24px; }
.settings-link { display: flex; align-items: center; gap: 9px; width: 100%; padding: 13px 11px; border: 1px solid var(--line); background: var(--surface); border-radius: 13px; text-align: left; }
.settings-link > span { display: flex; flex: 1; min-width: 0; flex-direction: column; }
.settings-link strong { font-size: 12px; font-weight: 600; }
.settings-link small { font-size: 10px; color: var(--muted); }
.app-version { display: block; margin-top: 15px; font-size: 10px; color: var(--muted); text-align: center; }
.main-view { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.titlebar { height: 60px; min-height: 60px; display: flex; gap: 12px; align-items: center; padding: 0 20px 0 32px; border-bottom: 1px solid var(--line); background: var(--surface); -webkit-app-region: drag; user-select: none; }
.titlebar-title { color: var(--muted); font-size: 12px; font-weight: 500; }
.titlebar-brand { display: none; }
.window-controls { display: flex; align-items: center; gap: 3px; margin-left: auto; -webkit-app-region: no-drag; }
.window-controls .button { width: 32px; min-height: 32px; padding: 0; border-radius: 9px; color: var(--muted); }
.window-controls .button:last-child:hover { color: var(--red); background: var(--red-soft); }
.view-scroll { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.page-block { max-width: 1200px; margin: 0 auto; padding: 36px 38px; }
.page-heading { margin-bottom: 26px; }
.page-heading p { color: var(--muted); font-size: 13px; margin-top: 9px; }
.hero { display: flex; gap: 16px; align-items: center; justify-content: space-between; }
.hero h1 > span { color: var(--accent); }
.eyebrow { display: block; font-weight: 700; font-size: 9px; letter-spacing: 2px; color: var(--accent); margin-bottom: 12px; }
.button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; padding: 9px 13px; border: 1px solid transparent; border-radius: 10px; white-space: nowrap; font-size: 12px; font-weight: 600; line-height: 1.4; transition: background .13s ease, border-color .13s ease, color .13s ease; }
.button-secondary { background: var(--surface); border-color: var(--line); color: var(--text); }
.button-secondary:hover:not(:disabled) { background: var(--surface-soft); border-color: var(--muted); }
.button-primary { background: var(--accent); color: #fff; box-shadow: 0 3px 8px rgb(52 120 246 / 12%); }
.button-primary:hover:not(:disabled) { background: var(--accent-hover); }
:root[data-theme="dark"] .button-primary { color: #13213a; box-shadow: none; }
.button-ghost { background: transparent; color: var(--muted); }
.button-ghost:hover:not(:disabled) { background: var(--surface-soft); color: var(--text); }
.button-danger { background: var(--red-soft); color: var(--red); border-color: var(--red); }
.button-danger:hover:not(:disabled) { filter: brightness(.97); }
.overview { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 0 0 25px; }
.overview > div { display: grid; grid-template-columns: 28px 1fr; column-gap: 9px; padding: 17px 18px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); box-shadow: var(--shadow); }
.overview svg { color: var(--accent); grid-row: span 2; align-self: center; }
.overview strong { font-size: 23px; letter-spacing: -.5px; line-height: 1.2; }
.overview span { color: var(--muted); font-size: 11px; margin-top: 3px; }
.library-toolbar { display: flex; gap: 14px; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.library-toolbar > p { color: var(--muted); font-size: 11px; }
.search-field { display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: var(--muted); min-width: 0; }
.search-field input { border: 0; background: transparent; min-height: 35px; padding: 8px 0; border-radius: 5px; font-size: 12px; }
.search-field input:focus-visible { outline-offset: 0; }
.library-toolbar .search-field { width: 200px; }
.mount-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 345px), 1fr)); gap: 16px; align-items: start; }
.mount-card { min-width: 0; border: 1px solid var(--line); border-radius: 18px; background: var(--surface); padding: 20px; box-shadow: var(--shadow); }
.mount-top { display: flex; align-items: center; gap: 12px; margin-bottom: 17px; }
.folder-icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; color: var(--accent); background: var(--accent-soft); }
.mount-heading { min-width: 0; flex: 1; }
.mount-heading h3 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -.2px; }
.mount-top > .button { padding: 7px; min-height: 32px; }
.status { display: inline-flex; align-items: center; gap: 5px; color: var(--muted); font-size: 10px; margin-top: 4px; }
.status i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-connected { color: var(--green); }
.status-error { color: var(--red); }
.status-connecting, .status-disconnecting { color: var(--amber); }
.location-row { display: flex; gap: 7px; align-items: center; color: var(--muted); font-size: 10px; background: var(--surface-soft); padding: 9px 10px; border-radius: 9px; }
.location-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.mount-bottom { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
.backup-caption { display: flex; gap: 6px; align-items: center; font-size: 10px; color: var(--muted); }
.mount-actions { display: flex; gap: 8px; justify-content: flex-end; }
.mount-actions .button { min-height: 35px; padding: 8px 11px; font-size: 11px; }
.backup-actions { display: flex; justify-content: space-between; flex-wrap: wrap; border-top: 1px solid var(--line); margin-top: 14px; padding-top: 7px; gap: 2px; }
.backup-actions .button { padding: 7px 3px; min-height: 30px; font-size: 10px; }
.mount-detail { margin-top: 12px; color: var(--muted); font-size: 11px; }
.privacy-note { display: flex; gap: 8px; align-items: flex-start; margin-top: 22px; color: var(--muted); font-size: 10px; line-height: 1.6; }
.privacy-note svg { margin-top: 1px; }
.empty-state { padding: 40px 24px; text-align: center; border: 1px dashed var(--line); border-radius: 18px; background: var(--surface); }
.empty-folder { display: inline-flex; padding: 22px; border-radius: 26px; background: var(--accent-soft); color: var(--accent); margin-bottom: 20px; }
.empty-state p { color: var(--muted); margin: 11px auto 23px; max-width: 350px; font-size: 12px; }
.empty-list { padding: 26px 16px; color: var(--muted); font-size: 12px; text-align: center; }
.compact-nav { display: none; }
/* One window, two layouts. These rules depend on the native mode, not screen size. */
[data-mode="compact"] .sidebar { display: none; }
[data-mode="compact"] .titlebar { height: 68px; min-height: 68px; padding: 0 14px 0 18px; gap: 8px; }
[data-mode="compact"] .titlebar-brand { display: block; }
[data-mode="compact"] .titlebar-title { display: none; }
[data-mode="compact"] .brand-icon { width: 34px; height: 34px; border-radius: 11px; }
[data-mode="compact"] .brand { gap: 9px; }
[data-mode="compact"] .brand strong { font-size: 15px; }
[data-mode="compact"] .brand div > span { font-size: 9px; }
[data-mode="compact"] .page-block { padding: 24px 18px; }
[data-mode="compact"] .page-heading { margin-bottom: 21px; }
[data-mode="compact"] h1 { font-size: 25px; letter-spacing: -.8px; }
[data-mode="compact"] .page-heading p { font-size: 11px; margin-top: 6px; }
[data-mode="compact"] .eyebrow { display: none; }
[data-mode="compact"] .hero { flex-wrap: wrap; gap: 15px; }
[data-mode="compact"] .hero > .button { font-size: 11px; padding: 9px 11px; }
[data-mode="compact"] .overview { display: none; }
[data-mode="compact"] .library-toolbar > p { font-size: 10px; }
[data-mode="compact"] .library-toolbar .search-field { width: 144px; }
[data-mode="compact"] .mount-list { grid-template-columns: minmax(0, 1fr); gap: 12px; }
[data-mode="compact"] .mount-card { padding: 17px; border-radius: 16px; }
[data-mode="compact"] .mount-bottom { gap: 12px; }
[data-mode="compact"] .privacy-note { font-size: 10px; }
[data-mode="compact"] .compact-nav { display: flex; align-items: center; justify-content: space-around; flex-shrink: 0; height: 64px; padding: 5px 8px; border-top: 1px solid var(--line); background: var(--surface); }
.compact-nav button { display: flex; flex: 1; align-items: center; justify-content: center; flex-direction: column; gap: 3px; height: 49px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); font-size: 10px; }
.compact-nav button.selected { color: var(--accent); background: var(--accent-soft); }
.compact-nav button:hover { color: var(--accent); }
/* Preferences */
.settings-page { max-width: 850px; }
.settings-panel { padding: 24px; margin-bottom: 17px; border: 1px solid var(--line); border-radius: 18px; background: var(--surface); box-shadow: var(--shadow); }
.section-title { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 19px; }
.section-title > svg { color: var(--accent); margin-top: 2px; }
.section-title h2 { font-size: 15px; letter-spacing: -.2px; }
.section-title p { font-size: 11px; color: var(--muted); margin-top: 4px; }
.button-row { display: flex; gap: 9px; flex-wrap: wrap; margin-top: 16px; }
.theme-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.theme-options > button { position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; min-height: 79px; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface-soft); font-size: 11px; color: var(--muted); }
.theme-options > button.selected { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
.theme-options > button > svg:last-child:not(:first-child) { position: absolute; right: 7px; top: 7px; }
.setting-switch { display: flex; gap: 18px; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid var(--line); }
.setting-switch strong { font-size: 12px; font-weight: 600; }
.setting-switch p { margin-top: 4px; color: var(--muted); font-size: 11px; }
.toggle { width: 38px; height: 23px; flex: 0 0 38px; border: 0; background: var(--line); padding: 3px; border-radius: 20px; display: flex; align-items: center; }
.toggle > span { display: block; width: 17px; height: 17px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 15%); transition: transform .15s ease; }
.toggle.on { background: var(--accent); }
.toggle.on > span { transform: translateX(15px); }
.advanced summary, .log-details summary { cursor: pointer; font-size: 12px; font-weight: 600; padding: 1px 0; color: var(--muted); }
.advanced[open] > summary, .log-details[open] > summary { margin-bottom: 20px; }
.advanced > p, .muted { color: var(--muted); font-size: 11px; }
.settings-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: var(--muted); font-size: 10px; padding: 7px 2px; }
[data-mode="compact"] .settings-panel { padding: 18px; }
[data-mode="compact"] .button-row .button { font-size: 11px; padding: 9px 10px; }
.activity-intro { display: flex; align-items: flex-start; gap: 13px; padding: 20px; margin-bottom: 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--surface); }
.activity-intro svg { color: var(--accent); }
.activity-intro h2 { font-size: 16px; }
.activity-intro p { color: var(--muted); font-size: 12px; margin-top: 7px; }
.log-details { border: 1px solid var(--line); padding: 18px; background: var(--surface); border-radius: 15px; }
.log-list { display: flex; flex-direction: column; gap: 0; max-height: 60vh; overflow: auto; }
.log-line { padding: 9px 0; border-bottom: 1px solid var(--line); font: 11px/1.6 ui-monospace, "Cascadia Mono", Consolas, monospace; color: var(--muted); overflow-wrap: anywhere; }
.log-line:last-child { border-bottom: 0; }
/* Dialogs remain inside the compact window. Only their bodies scroll. */
.modal-scrim { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgb(14 24 43 / 38%); backdrop-filter: blur(7px); z-index: 50; -webkit-app-region: no-drag; }
.modal { width: 100%; max-width: 610px; max-height: calc(100dvh - 40px); display: flex; flex-direction: column; min-height: 0; border-radius: 21px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--modal-shadow); outline: none; overflow: hidden; }
.modal-head { display: flex; flex-shrink: 0; align-items: flex-start; justify-content: space-between; gap: 15px; padding: 24px 25px 20px; border-bottom: 1px solid var(--line); }
.modal-head h2 { font-size: 21px; letter-spacing: -.6px; }
.modal-head p { color: var(--muted); font-size: 11px; margin-top: 5px; }
.modal-head > .button { width: 30px; min-height: 30px; padding: 0; }
.modal > form { display: flex; flex-direction: column; min-height: 0; }
.modal-body { padding: 22px 25px; overflow: auto; min-height: 0; overscroll-behavior: contain; }
.modal-foot { display: flex; align-items: center; justify-content: flex-end; gap: 9px; padding: 16px 25px; border-top: 1px solid var(--line); flex-shrink: 0; background: var(--surface); }
.foot-spacer { margin-right: auto; }
.modal-body > .modal-foot { padding: 18px 0 0; margin-top: 24px; }
.field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; min-width: 0; }
.field-label { font-size: 11px; font-weight: 650; }
.field-hint { display: block; color: var(--muted); font-size: 10px; line-height: 1.6; overflow-wrap: anywhere; }
.field-hint + .button { margin-top: 13px; }
.input-with-button { display: flex; align-items: stretch; gap: 8px; min-width: 0; }
.input-with-button > input { flex: 1; width: 0; font-size: 12px; }
.input-with-button > button { display: flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 11px; border: 1px solid var(--line); background: var(--surface-soft); border-radius: 10px; color: var(--accent); font-size: 11px; font-weight: 600; white-space: nowrap; }
.input-with-button > button:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-soft); }
.server-chip { display: flex; align-items: center; gap: 7px; border-radius: 8px; padding: 9px 11px; margin-bottom: 19px; width: fit-content; color: var(--muted); background: var(--surface-soft); font-size: 10px; }
.server-chip svg { color: var(--accent); }
.backup-form { border: 0; padding: 16px 0 0; margin: 0; min-width: 0; }
.backup-form legend { font-weight: 600; font-size: 11px; color: var(--accent); padding-top: 17px; }
.error-box, .success-box, .info-box { display: flex; align-items: flex-start; gap: 8px; border-radius: 11px; padding: 12px 13px; font-size: 11px; line-height: 1.6; margin: 12px 0; overflow-wrap: anywhere; }
.error-box { color: var(--red); background: var(--red-soft); }
.success-box { color: var(--green); background: var(--green-soft); }
.info-box { color: var(--muted); background: var(--accent-soft); }
.error-box svg, .success-box svg, .info-box > svg { margin-top: 2px; }
.info-box p { margin: 5px 0 12px; }
.modal-body > .error-box:first-child { margin-top: 0; }
.confirmation { text-align: center; padding: 10px 10px 0; }
.confirmation > svg { color: var(--red); margin-bottom: 12px; }
.confirmation p { color: var(--muted); font-size: 12px; margin-top: 12px; }
.remote-body { display: flex; flex-direction: column; gap: 14px; }
.browser-toolbar { display: flex; flex-wrap: wrap; gap: 7px; }
.browser-toolbar .button { min-height: 33px; padding: 7px 10px; font-size: 11px; }
.remote-list { border: 1px solid var(--line); border-radius: 12px; overflow: auto; max-height: 37vh; flex: 0 0 auto; }
.remote-row { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: var(--surface); padding: 11px 13px; min-height: 45px; text-align: left; border-bottom: 1px solid var(--line); }
.remote-row:last-child { border-bottom: 0; }
.remote-row:hover { background: var(--accent-soft); }
.remote-row > svg:first-child { color: var(--accent); }
.remote-row > svg:last-child { color: var(--muted); }
.remote-row > span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.browser-loading { display: flex; flex-direction: column; align-items: center; padding: 40px 10px; color: var(--muted); text-align: center; }
.browser-loading > svg { color: var(--accent); margin-bottom: 13px; }
.browser-loading p { font-size: 12px; }
.browser-loading span { font-size: 10px; margin-top: 6px; }
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; align-items: flex-start; width: max-content; max-width: min(560px, calc(100vw - 24px)); padding: 14px 16px; border-radius: 13px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--modal-shadow); z-index: 100; font-size: 12px; overflow-wrap: anywhere; }
.toast > span { flex: 1; min-width: 0; }
.toast > button { border: 0; padding: 2px; background: transparent; color: var(--muted); }
.toast-success > svg { color: var(--green); }
.toast-error > svg { color: var(--red); }
[data-mode="compact"] .toast { bottom: 77px; font-size: 11px; }
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; height: 100%; color: var(--muted); }
.loading-screen > p { font-size: 12px; }
.loading-screen .brand { color: var(--text); margin-bottom: 15px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 740px) {
  [data-mode="expanded"] .sidebar { width: 185px; flex-basis: 185px; padding-left: 10px; padding-right: 10px; }
  [data-mode="expanded"] .sidebar .brand { gap: 7px; padding-left: 1px; padding-right: 1px; }
  [data-mode="expanded"] .sidebar .brand strong { font-size: 14px; }
  [data-mode="expanded"] .sidebar .brand-icon { width: 34px; height: 34px; }
  [data-mode="expanded"] .page-block { padding: 25px 20px; }
  [data-mode="expanded"] .hero { flex-wrap: wrap; }
  [data-mode="expanded"] .overview { gap: 8px; }
  [data-mode="expanded"] .overview > div { padding: 12px; grid-template-columns: 1fr; }
  [data-mode="expanded"] .overview svg { display: none; }
}
@media (max-width: 520px) {
  .modal-scrim { padding: 8px; }
  .modal { max-height: calc(100dvh - 16px); border-radius: 17px; }
  .modal-head { padding: 19px 18px 16px; }
  .modal-head h2 { font-size: 19px; }
  .modal-body { padding: 18px; }
  .modal-foot { padding: 13px 15px; gap: 7px; }
  .modal-foot .button { font-size: 11px; padding: 9px 10px; }
  .hide-narrow { display: none; }
  .settings-footer { flex-wrap: wrap; }
}
@media (max-width: 370px) {
  [data-mode="compact"] .titlebar { padding-left: 12px; padding-right: 8px; }
  [data-mode="compact"] .brand { gap: 6px; }
  [data-mode="compact"] .brand strong { font-size: 13px; }
  [data-mode="compact"] .brand-icon { width: 29px; height: 29px; }
  [data-mode="compact"] .brand div > span { display: none; }
  [data-mode="compact"] .page-block { padding: 20px 13px; }
  [data-mode="compact"] .library-toolbar { flex-wrap: wrap; gap: 8px; }
  [data-mode="compact"] .library-toolbar .search-field { width: 100%; }
  .theme-options { gap: 6px; }
  .theme-options > button { padding: 9px; }
  .browser-toolbar .button { padding: 7px 8px; }
  .modal-foot { gap: 5px; padding-left: 11px; padding-right: 11px; }
  .modal-foot .button { padding-left: 8px; padding-right: 8px; font-size: 10px; }
  .modal-foot .button svg { width: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}

.activity-list { display: grid; gap: 10px; }
.activity-item { display: flex; gap: 12px; align-items: flex-start; background: var(--surface); border: 1px solid var(--line); border-radius: 13px; padding: 16px; }
.activity-item > svg { color: var(--accent); margin-top: 2px; }
.activity-item > div { min-width: 0; flex: 1; }
.activity-item p { font-size: 12px; overflow-wrap: anywhere; }
.activity-item time { font-size: 10px; color: var(--muted); margin-top: 4px; display: block; }
.activity-item details { margin-top: 10px; }
.activity-item summary { color: var(--muted); font-size: 11px; cursor: pointer; }
.activity-item pre { white-space: pre-wrap; overflow-wrap: anywhere; font: 11px/1.6 ui-monospace, Consolas, monospace; color: var(--muted); margin: 10px 0 0; }

/* Native theme is available before the first snapshot, avoiding a light loading flash. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
  color-scheme: dark;
  --bg: #141820; --surface: #1e2430; --surface-soft: #242b39; --sidebar: #191e29;
  --text: #edf2fa; --muted: #a4b0c5; --line: #343d4e; --input: #181e29;
  --accent: #76a7ff; --accent-hover: #97bdff; --accent-soft: #293b58;
  --green: #86d6b2; --green-soft: #223e35; --red: #ffabb8; --red-soft: #482b36;
  --amber: #f3c98a; --amber-soft: #453b2b; --focus: #91b9ff;
  --shadow: 0 5px 25px rgb(0 0 0 / 9%); --modal-shadow: 0 24px 90px rgb(0 0 0 / 55%);
  }
}

/* Scheduling and progress share the light/dark theme tokens. */
.duration-input { display: grid; grid-template-columns: minmax(0,1fr) minmax(100px,.8fr); gap: 9px; width: 100%; }
.duration-input input, .duration-input select { width: 100%; min-width: 0; }
.schedule-fields { display: grid; gap: 12px; }
.weekday-options { display: flex; flex-wrap: wrap; gap: 6px; }
.weekday-options button { border: 1px solid var(--line); background: var(--input); color: var(--muted); padding: 9px 10px; border-radius: 10px; font-size: 12px; min-width: 38px; cursor: pointer; }
.weekday-options button.selected { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.schedule-preview { display: flex; align-items: flex-start; gap: 8px; padding: 11px; background: var(--surface-soft); border-radius: 10px; font-size: 12px; }
.schedule-preview svg { flex-shrink: 0; margin-top: 2px; }
.refresh-preferences, .shortcut-preferences { border-top: 1px solid var(--line); padding-top: 16px; margin-top: 6px; }
.refresh-preferences > h3 { font-size: 13px; margin-bottom: 12px; }
.shortcut-preferences { display: grid; gap: 8px; padding-bottom: 16px; }
.shortcut-preferences > .button { justify-self: start; }
.shortcut-preferences .success-box { overflow-wrap: anywhere; }
.backup-caption { min-width: 0; }
.backup-caption span { overflow-wrap: anywhere; }
.backup-progress { padding-top: 10px; }
.progress-track { background: var(--surface-soft); height: 5px; overflow: hidden; border-radius: 10px; }
.progress-track > span { display: block; height: 100%; background: var(--accent); border-radius: inherit; transition: width .2s ease; }
.backup-progress p { font-size: 11px; color: var(--muted); margin-top: 7px; overflow-wrap: anywhere; }
.progress-checking, .next-backup { display: flex; align-items: center; gap: 6px; }
.next-backup { font-size: 11px; color: var(--muted); margin-top: 10px; }
.refresh-notice { font-size: 11px; color: var(--amber); background: var(--amber-soft); padding: 10px; border-radius: 9px; margin-top: 10px; }
@media (prefers-reduced-motion: reduce) { .progress-track > span { transition: none; } }

/* Guarded actions: observations, not a safety certificate. */
.operation-body { display: grid; gap: 16px; font-size: 12px; }
.operation-symbol { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 18px; color: var(--amber); background: var(--amber-soft); }
.operation-caution { padding: 14px; border: 1px solid var(--line); border-radius: 12px; color: var(--muted); background: var(--surface-soft); line-height: 1.7; }
.operation-paths { margin: 0; padding: 14px; background: var(--surface-soft); border-radius: 12px; min-width: 0; }
.operation-paths dt { color: var(--muted); font-size: 10px; }
.operation-paths dd { margin: 3px 0 12px; overflow-wrap: anywhere; font-size: 12px; }
.operation-paths dd:last-child { margin-bottom: 0; }
.operation-actions { flex-wrap: wrap; }
@media (max-width: 520px) { .operation-actions .background-action { width: 100%; } }
````
<!-- DT-REPO-FILE-END F030 -->

<a id="file-f031"></a>
### F031 — `src/renderer/src/remote-path-display.ts`
**845 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F031","path":"src/renderer/src/remote-path-display.ts","mode":"100644","encoding":"utf-8","bytes":845,"lines":16,"sha256":"4ad7121fb13ba86ec8e7570588f66fce9c16882f3d3ea10dfcec9a6f56de5fb6","git_blob_sha1":"56a6a3ee6a7706daef8e24867c9e61779a6975ef","fence":"````","final_lf":true} -->
````typescript
import { normalizeRemotePath } from '../../shared/paths'

/** UI notation only: rclone keeps using '' for Home and '/' for Root. */
export function displayRemotePath(value: string): string {
  if (value === '' || value === '.') return '~/'
  return value.startsWith('/') ? value : `~/${value}`
}

/** Parse user-edited display text, never canonical paths returned by the server. */
export function parseDisplayedRemotePath(remote: string, input: string): string {
  // Retain the existing validation for control characters and mismatched servers.
  const value = normalizeRemotePath(remote, input)
  // Strip one display prefix, not every tilde: ~/~/file may be a real directory.
  // An extra slash after ~/ must not turn a home-relative path into an absolute one.
  return value.startsWith('~/') ? value.slice(2).replace(/^\/+/, '') : value
}
````
<!-- DT-REPO-FILE-END F031 -->

<a id="file-f032"></a>
### F032 — `AGGIORNAMENTO-0.2.1.md`
**4211 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F032","path":"AGGIORNAMENTO-0.2.1.md","mode":"100644","encoding":"utf-8","bytes":4211,"lines":79,"sha256":"7813c99a1d08d15a31e31949f9f43dd91689188d8890f243ca8c437cca533f97","git_blob_sha1":"850df05f450f0fbd13b0b9e130cdc829fa045a59","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu 0.2.1 - patch Root e Home

Questa patch si applica al progetto 0.2.0 gia aggiornato e funzionante.
Contiene sorgenti e test, non un installer.

## Modifiche

- Nel selettore delle cartelle del server, il pulsante Server diventa Root.
- Root continua a richiedere e mostrare `/`.
- Home mostra `~/` come valore del campo, non soltanto come suggerimento.
- Le sottocartelle relative alla Home vengono mostrate come `~/Documenti`.
- Vai, Riprova e la navigazione Su convertono la notazione visiva nel percorso
  interno appropriato. La scelta di Home continua a salvare il percorso vuoto;
  non viene memorizzato un percorso fisso come `/home/server`.
- I percorsi assoluti rimangono assoluti. Una directory realmente chiamata `~`
  rimane raggiungibile e viene mostrata come `~/~`.
- Nessuna modifica ai montaggi annidati, ai controlli di sicurezza, ai backup,
  alle configurazioni delle connessioni o al server/Docker.

Il prefisso `~/` riguarda il campo del selettore. I percorsi interni e il formato
salvato delle cartelle esistenti non vengono migrati o riscritti.

## Installazione della patch nei sorgenti

1. In GitHub Desktop apri il repository drive-tambu-sync con
   Repository > Show in Explorer. Prima conserva o committa eventuali altre
   modifiche locali. Questa patch sostituisce App.tsx e package.json.
2. Estrai lo ZIP in una cartella temporanea e copia TUTTO il suo contenuto nella
   radice del repository, dove si trova package.json. Unisci le cartelle src e
   tests, sostituendo i file omonimi. Non cancellare le cartelle esistenti.
3. In Summary (required) scrivi `Fix Root e Home - 0.2.1`, poi esegui il commit
   e Push origin. I test vengono eseguiti dal workflow gia presente.
4. Scarica l'installer dall'artifact Windows della nuova esecuzione riuscita,
   non da una vecchia esecuzione. Il nome previsto e DriveTambu-0.2.1-Windows.exe.
5. Attendi la fine dei trasferimenti ed esci da Drive Tambu prima di installare.

Non copiare questi sorgenti nella cartella del programma installato.
Non devi modificare rclone, SSH, Docker o le cartelle sul server.

## File inclusi

- package.json: soltanto la versione, da 0.2.0 a 0.2.1.
- src/renderer/src/App.tsx: etichetta Root e gestione del campo del selettore.
- src/renderer/src/remote-path-display.ts: conversione della notazione visiva.
- tests/root-home.test.cjs: 12 nuovi test di regressione.
- AGGIORNAMENTO-0.2.1.md: queste istruzioni.

Base App.tsx verificata contro GitHub: blob 737e31ac3c047a20286635f893e121ed19ab4937.
Base package.json verificata contro GitHub: blob 4d13519e726bcfc44d17807896bb470941bc1a48.

## Verifica eseguita

- Prima della correzione: 10 dei 12 nuovi casi fallivano per etichette o percorsi
  diversi da quelli attesi; 2 controlli sul comportamento assoluto passavano.
- Dopo la correzione: 49 test totali superati, nessun fallimento
  (37 esistenti + 12 nuovi). I test del selettore eseguono i veri handler del
  componente, simulando gli hook React e il confine Electron/connessione.
- Controllo TypeScript completo del nuovo modulo di visualizzazione: superato.
- Controllo di sintassi/transpilazione dei due file di interfaccia: superato.
- Main process, preload, percorsi condivisi e workflow invariati byte per byte.

Non e stata eseguita una compilazione Electron completa o una prova con il
server reale: in questo ambiente il download delle dipendenze npm non era
raggiungibile (EAI_AGAIN). I controlli limitati sopra non equivalgono al
controllo TypeScript dell'intero progetto o alla verifica dell'installer.
GitHub Actions deve completare typecheck e packaging prima dell'installazione.

## Prova manuale dopo l'installazione

Apri Nuova cartella > Sfoglia sul server. Premi Root: deve apparire `/`.
Premi Home: deve apparire `~/`. Apri una sottocartella: deve apparire
`~/NomeCartella`. Premi Su e poi Vai: devi rimanere nella Home senza errori
causati dal simbolo `~`. Per questa verifica basta navigare, non creare file.

## Ripristino

Per annullare la patch, ripristina App.tsx e package.json dal commit precedente
alla patch e rimuovi soltanto il nuovo modulo e il nuovo test. Non annullare
l'aggiornamento 0.2.0. Non serve toccare la configurazione o i dati personali.
````
<!-- DT-REPO-FILE-END F032 -->

<a id="file-f033"></a>
### F033 — `AGGIORNAMENTO-0.2.md`
**4480 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F033","path":"AGGIORNAMENTO-0.2.md","mode":"100644","encoding":"utf-8","bytes":4480,"lines":45,"sha256":"692f9118c7b2539acc1d840f24adce095e3fe902db7abb31652a5486e3b2e119","git_blob_sha1":"9541a64a48f8a30a861c11aace4836d52871f342","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu 0.2.0 - come applicare l'aggiornamento

Questo archivio contiene i file di aggiornamento del CODICE SORGENTE. Non e un installer e non va copiato in AppData o nella cartella del programma installato.

Base verificata: repository FabioTambu/drive-tambu-sync, commit
483fc25987e25b8490ac8406b427062575fbfdbb (main del 17 ottobre 2026).
Le correzioni precedenti a TypeScript, --publish never e maintainer Linux sono conservate.

## Sul tuo computer

1. In GitHub Desktop apri il repository drive-tambu-sync e scegli Repository > Show in Explorer.
2. Prima di copiare, controlla in GitHub Desktop che non ci siano tue modifiche non salvate. Se ci sono, salvale con un commit o conserva una copia della cartella fuori dal repository.
3. Estrai lo ZIP in una cartella temporanea. Copia IL CONTENUTO estratto nella cartella del repository (quella che contiene package.json). Unisci le cartelle e sostituisci i file con lo stesso nome. Non creare una seconda cartella di progetto annidata.
4. Torna in GitHub Desktop. Le modifiche includono src, tests, package.json, README, documentazione e .github/workflows/build.yml.
5. Crea un commit, per esempio: Add friendly interface, server browser and dark mode. Premi Push origin.
6. GitHub Actions eseguira test automatici, controllo TypeScript e creazione degli installer. Aspetta il risultato dei job Windows e Linux: questa build 0.2.0 non e ancora stata eseguita da chi ha preparato lo ZIP.
7. Quando il job Windows e completo e il caricamento artifact e riuscito, scarica drive-tambu-win. L'installer avra versione 0.2.0.
8. Esci dalla versione Electron gia aperta prima dell'installazione. Aspetta la fine dei trasferimenti. Non cambiare o disinstallare la vecchia applicazione PowerShell.

Non e necessario eseguire rclone config, cambiare chiavi SSH o configurare di nuovo Cloudflare per riutilizzare la connessione casa gia salvata sullo stesso PC.

## Prima prova dell'app aggiornata

- Si apre il pannello compatto. Il pulsante Espandi in alto apre la finestra completa; l'altro pulsante la riporta al pannello.
- Impostazioni > Aspetto: Sistema, Chiaro, Scuro. La scelta e salvata.
- Impostazioni > Il tuo server > Verifica connessione: deve confermare l'accesso, non solo che rclone e installato.
- Nuova cartella > Cartella sul server > Sfoglia: naviga nelle directory. Home e la cartella personale dell'utente SSH; Server parte da /.
- Puoi incollare casa:/home/server/services/filebrowser/data/fabio. L'app elimina il prefisso casa: dal campo del percorso e lo aggiunge una sola volta al comando interno.
- Scegli la posizione sul computer con Sfoglia: il nome finale viene preparato senza cancellare cartelle gia esistenti.
- Prova inizialmente una directory non importante. Non usare contemporaneamente vecchia e nuova app sullo stesso punto di collegamento locale.
- Testa i backup separatamente con dati di prova. Un backup occupa spazio locale; non e una semplice vista del server.

## Configurazione esistente e ritorno indietro

Le cartelle della versione Electron 0.1.0 vengono mantenute. Alla prima lettura della vecchia configurazione viene conservato, nella stessa cartella dati dell'app, il file config.json.before-0.2.bak. Non vengono lette, esportate o modificate le chiavi private. Nessun file sul server viene cambiato applicando questo archivio.

Per annullare le modifiche del codice usa Revert sul commit di aggiornamento in GitHub Desktop, poi genera nuovamente la build. Non riportare indietro la configurazione mentre l'app e aperta. Per ripristinare anche quella, chiudi prima Drive Tambu e conserva una copia di config.json prima di usare il backup.

## Limiti da conoscere

La connessione reale al server e gli installer devono ancora essere collaudati. Lo ZIP non include rclone, WinFsp, FUSE, cloudflared o chiavi. Il riconoscimento automatico usa una connessione gia presente: non crea automaticamente un nuovo account SSH o una nuova connessione su un PC privo di configurazione.

Su Linux il comportamento del pannello e dell'icona di notifica dipende dal desktop. Su Wayland viene mantenuta una finestra nativa utilizzabile anche se il posizionamento in basso a destra non e consentito dal sistema.

La compilazione riuscita non equivale alla prova del server. Il timeout dovuto al percorso duplicato e corretto nel codice; eventuali problemi di autenticazione, rete o componenti del filesystem devono essere individuati con la verifica della connessione e i dettagli di Attivita.
````
<!-- DT-REPO-FILE-END F033 -->

<a id="file-f034"></a>
### F034 — `AGGIORNAMENTO-0.3.md`
**8935 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F034","path":"AGGIORNAMENTO-0.3.md","mode":"100644","encoding":"utf-8","bytes":8935,"lines":160,"sha256":"4c121af8faa072b2c1a208003423f71314b2a421a2f28d7a41560f4cf1cc6231","git_blob_sha1":"22fd6aab3fb113f1852454745604fe1a686c4c6b","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu 0.3.0 - backup, collegamenti e aggiornamento cartelle

Questo ZIP contiene sorgenti da applicare al repository, non un installer.
Base verificata: FabioTambu/drive-tambu-sync, commit
286e20ab36e990742c788981cf439460a36f8874 (versione 0.2.1).
Preserva Root/Home e le modifiche al testo della pagina principale.
Non modifica il server, Docker, SSH o la configurazione dei remote rclone.

## 1. Programmazione dei backup

Apri le impostazioni di una cartella, attiva "Backup su questo computer"
e scegli "Quando eseguire il backup":

- Solo manualmente: il pulsante Esegui backup avvia la copia.
- A intervalli regolari: numero libero e unita' minuti, ore, giorni o settimane.
  Sono ammessi intervalli equivalenti a un numero intero di minuti, da 1 minuto
  a 365 giorni. L'intervallo riparte dalla fine di un backup riuscito.
- Ogni giorno, a un'ora precisa: scegli ore e minuti.
- Nei giorni della settimana scelti: scegli uno o piu' giorni e l'ora.

Per ogni domenica alle 02:00: seleziona "Nei giorni della settimana scelti",
lascia acceso soltanto Dom, imposta 02:00 e premi Salva cartella.
In questa modalita' non viene usato un intervallo di 7 giorni dall'avvio:
il giorno e l'orario sono quelli del calendario locale del computer.

Computer acceso, non sospeso, e app aperta sono necessari. L'app non installa
un servizio di sistema e non accende o risveglia il PC. Al successivo avvio
viene recuperato un solo backup dovuto per cartella, senza riprodurre tutti
gli appuntamenti saltati. Un solo backup viene eseguito alla volta; quelli
successivi attendono. Il controllo delle scadenze avviene circa ogni 15 secondi,
con il primo controllo circa 12 secondi dopo l'avvio. Non e' una pianificazione
in tempo reale con garanzia di partenza al secondo esatto.

Un errore o un'interruzione ha un'attesa di almeno 10 minuti prima di un nuovo
tentativo automatico. Il backup manuale resta disponibile. Un backup manuale
riuscito riprogramma la prossima esecuzione: intervallo dalla sua conclusione,
oppure prossimo appuntamento futuro del calendario.

La data prevista e i tentativi sono salvati per sopravvivere ai riavvii.
Rinominare una cartella senza cambiare la programmazione non sposta la scadenza.
Una nuova programmazione a calendario parte dal prossimo appuntamento futuro,
non recupera appuntamenti precedenti alla sua creazione.

Ora legale/solare: nel caso Europe/Rome, le 02:00 inesistenti in primavera
slittano alle 03:00; le 02:00 ripetute in autunno valgono una volta sola, alla
prima occorrenza. Se cambia il fuso configurato nel sistema, gli appuntamenti
futuri a calendario sono ricalcolati nel nuovo fuso.

## 2. Avanzamento del backup

Le schede mostrano la percentuale stimata, una barra, i byte trasferiti e la
velocita' quando rclone fornisce il totale. Nella fase iniziale compare
"Controllo dei file..." e, appena disponibili, i contatori dei file verificati.
Il totale puo' cambiare durante la scansione: anche la stima puo' essere rivista.
Non viene mostrata una percentuale inventata quando il totale manca.
Il 100% non e' dichiarato prima dell'uscita corretta del processo e del salvataggio
dell'esito. Un processo fallito rimane un errore anche se aveva trasferito tutti
i byte. Gli errori restano consultabili in Attivita'.

Restano le protezioni esistenti sulle destinazioni, le versioni in archivio
e il blocco della sorgente completamente vuota sopra un backup non vuoto.
Queste protezioni non sostituiscono un backup indipendente e il collaudo reale.

## 3. Crea collegamento

Nelle impostazioni di una cartella gia' salvata trovi "Crea collegamento...".
La finestra di salvataggio propone il Desktop e permette una posizione diversa.
Il collegamento apre la cartella oppure avvia Drive Tambu e tenta di collegarla,
anche se "Collega automaticamente" e' disattivato. In caso di errore o attesa
eccessiva viene mostrato un messaggio.

Il lanciatore usa l'identificativo della cartella salvata: cambiando il percorso
locale nell'app, il collegamento continua a usare quello corrente. Rimuovere
quella cartella dall'app e ricrearla genera un identificativo nuovo: in quel
caso va ricreato anche il collegamento. Spostare/disinstallare l'eseguibile puo'
invalidare il lanciatore. Per AppImage, conserva il file in una posizione stabile.

Windows: .lnk. Linux: .desktop, creato eseguibile. Alcuni desktop Linux richiedono
anche l'azione locale "Consenti avvio" o equivalente. Non viene aggirata questa
protezione. La creazione e' disponibile nella versione installata/pacchettizzata,
non tramite npm run dev. I collegamenti non vengono scritti dentro le cartelle
remote collegate o nelle destinazioni dei backup.

## 4. Aggiornamento dell'elenco file

Impostazioni > Aggiornamento elenco file: numero e unita' liberi, predefinito
2 minuti. Sono ammessi da 5 secondi a 24 ore, come numero intero di secondi.
Nella singola cartella puoi disattivare "Usa l'intervallo generale" e scegliere
un valore diverso. Cambiare il generale non modifica le eccezioni.

E' il tempo di validita' dell'elenco delle directory memorizzato da rclone:
alla richiesta successiva dopo la scadenza viene riletto. Non e' un download
automatico di tutti i file e non garantisce il ridisegno della finestra di
Esplora file gia' aperta al secondo esatto.

I collegamenti attivi NON vengono interrotti quando salvi la preferenza.
La scheda indica quando il nuovo valore richiede di scollegare e ricollegare
la cartella: fallo dopo aver chiuso i file e completato i trasferimenti.

## 5. Cache temporanea (nessun nuovo controllo nell'interfaccia)

Tutti i nuovi processi di montaggio usano:
--vfs-cache-max-age 20m --vfs-cache-poll-interval 1m

I file inutilizzati da 20 minuti diventano eliminabili dalla gestione interna
di rclone. Non viene eseguita una cancellazione diretta della directory della
cache. File aperti o modifiche ancora da inviare non devono essere forzatamente
rimossi. La cache non e' necessariamente vuota a intervalli di 20 minuti.
Questo non elimina file sul server e non pulisce le copie di backup.
La regola si applica ai montaggi avviati con questa versione; prima di aggiornare
chiudi l'app normalmente, attendendo la fine dei trasferimenti.

## Applicare l'aggiornamento

1. In GitHub Desktop verifica di essere nel repository drive-tambu-sync e di
   avere gia' la versione 0.2.1. Conserva o committa altre modifiche locali.
2. Repository > Show in Explorer. Estrai lo ZIP in una cartella temporanea e
   copia TUTTO il contenuto nella radice del repository, dove c'e' package.json.
   Unisci src/tests/docs e sostituisci i file omonimi; non eliminare gli altri.
   Non copiare questi sorgenti nella directory del programma installato.
3. Nel campo Summary (required) scrivi "Aggiornamento Drive Tambu 0.3.0".
   Esegui Commit e Push origin.
4. Attendi GitHub Actions: test, typecheck e packaging. Scarica gli artifact
   della NUOVA esecuzione riuscita, non quelli di una build precedente.
5. Prima di installare, attendi la fine dei trasferimenti e dei backup ed esci
   da Drive Tambu. Il nome previsto per Windows e' DriveTambu-0.3.0-Windows.exe.
   Per Linux usa il pacchetto .deb o .AppImage corrispondente.
6. La configurazione precedente viene letta e migrata automaticamente, mantenendo
   ID, percorsi, intervalli, temi e preferenze. Viene salvata una copia
   config.json.before-0.3.bak accanto al config.json dell'app, se necessaria.
   Nessuna chiave privata o password e' contenuta nello ZIP.

Il repository online non e' stato modificato durante la preparazione della patch.

## Prima prova

Usa una piccola cartella di prova e una destinazione di backup dedicata.
Verifica salvataggio della programmazione domenica 02:00 e permanenza dopo
riavvio dell'app. Per una prova rapida scegli temporaneamente un orario tra
pochi minuti, oppure avvia un backup manuale per osservare l'avanzamento.
Prova il collegamento prima con la cartella collegata e poi con l'app chiusa.
Controlla che l'intervallo personalizzato di una cartella non cambi quando
modifichi il generale. Non forzare l'arresto durante trasferimenti importanti.

## Verifiche e limiti

Vedi docs/VERIFICA-0.3.md per i controlli realmente eseguiti.
Il pacchetto non e' un installer gia' compilato e non e' stato provato sul tuo
server reale. GitHub Actions deve completare typecheck e packaging; il collaudo
su Windows/Linux resta necessario, soprattutto per launcher e trasferimenti.

## Tornare alla versione precedente

Con l'app chiusa, ripristina dai commit precedenti soltanto i file cambiati e
rimuovi i nuovi file elencati nel manifesto docs/UPDATE-0.3-files.json, poi
ricompila la versione precedente. Conserva prima una copia della configurazione
corrente; per tornare alle impostazioni pre-migrazione esiste
config.json.before-0.3.bak. Non sovrascrivere una configurazione piu' recente
senza conservarla e non cancellare le directory dei dati, dei backup o della
cache con modifiche non ancora caricate.
````
<!-- DT-REPO-FILE-END F034 -->

<a id="file-f035"></a>
### F035 — `AGGIORNAMENTO-0.4.md`
**8284 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F035","path":"AGGIORNAMENTO-0.4.md","mode":"100644","encoding":"utf-8","bytes":8284,"lines":80,"sha256":"fa2276ba168bc4327b060dbd9dfcf1070ca9be003369eaeb2b91ae1c49a47f9e","git_blob_sha1":"53f60dd5a82daca95a3d0f8b5dd303cfdeacda46","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu 0.4.0 - controlli prima della disconnessione

Questo archivio contiene SORGENTI, non un installer. Baseline: main a8134367539ee6ef0942243d2735356d1fe6766d. Non modifica il repository online da solo.

## Installazione dell'aggiornamento dei sorgenti

1. In GitHub Desktop, apri Repository > Show in Explorer. Conserva eventuali modifiche personali non ancora salvate.
2. Copia il contenuto di questo ZIP nella cartella che contiene package.json. Unisci le cartelle e sostituisci i file omonimi. Non cancellare .git e non copiare nella directory del programma installato.
3. Elimina i due elementi sperimentali sostituiti da questa versione:
   - .github/workflows/storage-investigation.yml
   - tools/safety-probe (tutta questa sottocartella, NON la cartella tests)
   Puoi eliminare anche i vecchi LEGGIMI-fix-marker.md e LEGGIMI-fix-report.md, se presenti. L'elenco completo dei file rimossi e' in docs/UPDATE-0.4-files.json.
4. In GitHub Desktop verifica le modifiche e le eliminazioni. Summary: Aggiornamento Drive Tambu 0.4.0. Esegui Commit e Push origin.
5. Attendi il workflow Build Drive Tambu. Esegue test, controllo TypeScript, compilazione e creazione degli installer. La build completa NON e' stata eseguita in questo ambiente.
6. Avvia anche Actions > Drive Tambu - Verifica disconnessione > Run workflow > main. Questo nuovo workflow prova le classi di produzione con un server SFTP temporaneo sui runner Windows/Linux; non usa il server casa o le tue chiavi. Serve a verificare l'integrazione nativa nuova, non certifica assenza totale di perdita dati.
7. Dopo le verifiche, prima di installare DriveTambu-0.4.0-Windows.exe attendi che le copie della versione precedente siano finite ed esci dalla vecchia app. Il disinstallatore 0.3.0 non acquisisce retroattivamente le protezioni nuove.

Non usare Re-run jobs su un'esecuzione precedente: occorre il nuovo commit. Gli installer della versione 0.4.0 si trovano negli artifact della nuova build, non negli artifact dei test nativi.

## Cosa cambia

### Controllo delle operazioni e avviso

Rclone resta quello ufficiale: non c'e' un fork, un'estensione proprietaria o una sostituzione dell'eseguibile installato nel sistema.

L'app usa un processo ufficiale rclone rcd per cartella e le API locali autenticate di montaggio e statistiche. La porta ascolta solo su 127.0.0.1, con una password casuale per sessione che non passa al renderer. Non si apre una porta sul router.

Prima di Esci, Scollega, Rimuovi e Cambia posizione:
- gli invii in coda, trasferimenti/check attivi, errori attuali della cache, mancanza di spazio e backup coinvolti bloccano l'azione;
- una risposta assente, incompleta o non valida non diventa uno zero: l'azione rimane bloccata;
- i vecchi errori cumulativi del motore non bastano da soli a bloccare per sempre;
- senza attivita' rilevata viene comunque richiesta conferma, con l'invito a salvare e chiudere i documenti;
- dopo la conferma viene ripetuto il controllo, anche immediatamente prima di ogni smontaggio;
- se il controllo o lo smontaggio fallisce, non viene eseguito un kill forzato per superare il problema.

Il dialogo segue chiaro/scuro e le dimensioni dell'app. Riprova esegue un nuovo controllo, Torna all'app annulla la richiesta, Continua in background annulla la richiesta e nasconde/minimizza la finestra lasciando lavorare il programma. Non esiste una scadenza che trasformi uno stato incerto in permesso di chiudere.

Quando la X serve solo a nascondere la finestra, non smonta nulla. L'uscita senza cartelle/processi/backup attivi non richiede un avviso inutile.

Durante la richiesta sono sospesi i nuovi backup automatici e le azioni incompatibili dell'app, comprese le aperture da scorciatoia. Questo NON impedisce ad altri programmi di iniziare a scrivere. I backup gia' in corso non vengono terminati forzatamente.

### Cambio di posizione sul computer

Nelle impostazioni di una cartella esistente si puo' usare Cambia posizione... o modificare il campo locale. Al salvataggio il dialogo riepiloga vecchia e nuova posizione e richiede conferma. La posizione sul server resta bloccata finche' la cartella e' collegata.

Se il vecchio collegamento era attivo, l'app tenta quello nuovo e verifica che risulti montato. Se era scollegato, salva la nuova posizione senza avviarlo. Nome, identificativo, scorciatoie per identificativo e backup restano associati alla stessa cartella; i file remoti non vengono tagliati, copiati o cancellati per questo cambio.

Destinazioni occupate, montaggi annidati e conflitti con altri backup restano vietati. Gli errori ordinari tentano il ripristino del percorso precedente. Se un tentativo nuovo lascia un processo che non puo' essere verificato/arrestato, l'app conserva la sua posizione salvata e NON avvia un secondo montaggio: mostra la situazione da risolvere. Non e' una transazione garantita contro crash del sistema.

Su Windows il vecchio punto di montaggio scompare con lo smontaggio. Su Linux si rimuove un eventuale contenitore vuoto solo se la sessione lo riconosce come creato dall'app, con identita' invariata, non montato e senza contenuti; una cartella preesistente/non riconoscibile viene lasciata intatta. Nessuna cancellazione ricorsiva dei punti di montaggio.

### Disinstallazione Windows

Il nuovo disinstallatore aggiunge Elimina anche le impostazioni di Drive Tambu, inizialmente senza spunta, per un'installazione dell'utente corrente riconosciuta. Su installazioni di tutti gli utenti o identita' non riconosciuta la pulizia del profilo non viene consentita.

La selezione elimina solo config.json e le copie note config.json.before-0.2.bak e config.json.before-0.3.bak nelle directory applicative conosciute. Non elimina ricorsivamente AppData, i file remoti, i punti di montaggio, i backup, le chiavi, rclone.conf o la cache. Il server casa potra' quindi essere rilevato nuovamente dopo una reinstallazione, senza ripristinare l'elenco delle cartelle rimosso.

Aggiornamenti, reinstallazioni sopra la versione esistente, annullamento e modalita' silenziosa conservano le impostazioni. Non e' supportata l'opzione generica --delete-app-data che eliminerebbe l'intero profilo.

Quando trova Drive Tambu aperto, il nuovo installer chiede l'uscita tramite l'app e attende che l'utente abbia terminato quel passaggio. Non termina il processo con taskkill. Una richiesta silenziosa con app attiva si interrompe con errore, non forza la chiusura.

Queste personalizzazioni NSIS richiedono ancora compilazione ed esecuzione reale su Windows; i test locali verificano la policy del codice, non il funzionamento del disinstallatore nativo.

### Pulizia degli esperimenti

Sono rimossi il vecchio workflow di caratterizzazione e tools/safety-probe. Rimangono i test di regressione dell'app. La parte riutilizzabile della fixture SFTP e i test che ne verificano la preparazione sono sotto tests/native/helpers, a supporto del nuovo test delle CLASSI DI PRODUZIONE. I prototipi per una barriera nativa/fork non vengono aggiunti all'app.

Le due spaziature gia' corrette rimangono inalterate. Temi, Root/Home, backup programmati, progressi, intervalli e regola della cache a 20 minuti rimangono.

## Limite da conoscere

Il controllo e' preventivo e non una prova che nessun programma abbia un file aperto. Una coda vuota puo' coesistere con un documento aperto o con una nuova scrittura subito dopo il controllo. Per questo l'avviso rimane anche con esito favorevole. Non chiudere i programmi che stanno copiando tramite Task Manager per aggirare un blocco e non cancellare manualmente la cache per sbloccarlo.

Non e' stato implementato il precedente progetto di recupero transazionale completo o gestione atomica dei conflitti: e' stato sostituito, su richiesta, da questa soluzione con motore ufficiale, blocchi osservabili e rischio residuo segnalato.

## Prima prova

Usa dati artificiali in una cartella piccola: verifica il dialogo senza trasferimenti, annullalo, avvia un caricamento e prova Scollega (deve bloccare quando il caricamento e' rilevato). Termina la copia e premi Riprova: deve chiedere ancora conferma. Prova il cambio posizione e il disinstallatore prima in un ambiente senza documenti personali.

Leggi docs/VERIFICA-0.4.md per le prove eseguite e quelle ancora necessarie.
````
<!-- DT-REPO-FILE-END F035 -->

<a id="file-f036"></a>
### F036 — `FILE-DA-RIMUOVERE.txt`
**500 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F036","path":"FILE-DA-RIMUOVERE.txt","mode":"100644","encoding":"utf-8","bytes":500,"lines":12,"sha256":"95def296004b8a003d06a0e6cbd771c6454784c9546f3766234c0fb708f38d12","git_blob_sha1":"888a62a6ae3afdfd07c2a041b353c24c6998a5d4","fence":"````","final_lf":true} -->
````text
Dopo aver copiato i file dell'aggiornamento, elimina DAL REPOSITORY:

.github/workflows/storage-investigation.yml
tools/safety-probe/   (soltanto questa sottocartella)

Facoltativi, solo documenti obsoleti se presenti:
LEGGIMI-fix-marker.md
LEGGIMI-fix-report.md

Non eliminare build.yml, .git, la cartella tests o qualsiasi cartella di dati.
Non eliminare file nella cartella del programma installato o sul server.
La copia di uno ZIP sovrascrive file, ma non cancella automaticamente gli obsoleti.
````
<!-- DT-REPO-FILE-END F036 -->

<a id="file-f037"></a>
### F037 — `LEGGIMI-fix-marker.md`
**3891 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F037","path":"LEGGIMI-fix-marker.md","mode":"100644","encoding":"utf-8","bytes":3891,"lines":77,"sha256":"523de738d27a5b16e2507804508aa57c2baabebffc50bd599bca193bfece4b08","git_blob_sha1":"aea507985de7046a2c98be25080689af36add269","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu - correzione del file di controllo dei test nativi

Questa patch modifica soltanto gli strumenti di prova. Non e' un installer,
non abilita la chiusura protetta e non modifica l'app o i dati personali.

## Evidenza letta

Esecuzione GitHub Actions 39116390251, commit
6607555d7acaa53231239a4b809ccb51341a75fe (18 ottobre 2026).
I due artifact sono ora disponibili e sono stati scaricati:
sicurezza-ubuntu-24.04 e sicurezza-windows-2022.

Entrambi riportano un solo scenario avviato, basic-SFTP-mount-write-read,
fallito con: Mount marker timed out: ENOENT ... fixture-ready.txt.
Le prove di file aperti e di recupero non sono ancora state eseguite.
Questo esito non dimostra una perdita di file durante la chiusura.

## Difetto corretto e limite della diagnosi

Il codice creava fixture-ready.txt in mount(), dopo l'avvio del server SFTP
locale e la sua prima verifica. Il server rclone serve sftp possiede una
cache delle directory: una prima lettura precedente alla creazione puo'
continuare a mostrare un elenco senza il file di controllo.
E' un difetto d'ordine nella preparazione della prova, compatibile con i
report. Il suo effetto sul motore reale deve essere confermato dalla nuova
esecuzione: non si dichiara che fosse l'unica causa del fallimento nativo.

La patch:
- crea il file una sola volta in initialize(), prima di avviare il server;
- verifica il contenuto attraverso SFTP (cat, limitato a 64 byte), non
  soltanto l'esistenza della directory radice;
- non riscrive il file dopo l'avvio del server o durante il rimontaggio;
- mantiene il successivo controllo di lettura ATTRAVERSO il montaggio;
- lascia invariati timeout, autenticazione, parametri della cache del
  montaggio, versioni dei componenti e productionSafetyCertified: false.

Se fallisce il controllo SFTP iniziale, il report distinguera' quella fase
con Local SFTP marker readiness. Se invece il server serve il file ma il
montaggio non lo mostra, rimarra' il distinto errore Mount marker.

## Come applicarla

1. Apri GitHub Desktop > Repository > Show in Explorer.
2. Copia la cartella tools di questo ZIP nella cartella del repository;
   unisci le cartelle e sostituisci i due file omonimi:
   - tools/safety-probe/fixture.cjs
   - tools/safety-probe/tests/support.test.cjs
3. Crea il commit con Summary: Fix preparazione test SFTP. Premi Push origin.
4. Actions > Drive Tambu - Test nativi sicurezza > Run workflow > main.
   Avvia una nuova esecuzione; non riavviare i job del vecchio commit.

Non sostituire il workflow: la correzione dei report deve rimanere installata.
Non reinstallare Drive Tambu e non cambiare il profilo casa, SSH o Docker.

## Verifiche

Prima: i 13 test originali superati; i 4 nuovi test falliti per l'ordine
errato, per il controllo iniziale insufficiente e per la riscrittura.
Dopo: 17/17 test degli strumenti superati. Controllo sintassi Node superato.
Verificata anche l'applicazione dello ZIP al pacchetto precedente con la
correzione del workflow gia' presente, rieseguendo gli stessi 17 test.

I nuovi test eseguono il vero codice della fixture e usano file temporanei;
il confine con rclone e' simulato. NON sono un test nativo WinFsp/FUSE.
In questo ambiente il download del binario rclone non e' riuscito, quindi
non e' stato eseguito qui un nuovo montaggio reale. La revisione del diff
ha riguardato ordine di avvio, conservazione dei controlli e riavvio della
stessa fixture; non e' una revisione indipendente.

Nessuna modifica al repository online. Nessuna dichiarazione di sicurezza
in produzione o di completamento delle prove native.

Fonti primarie:
- https://rclone.org/commands/rclone_serve_sftp/#vfs-directory-cache
- https://rclone.org/commands/rclone_cat/
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
````
<!-- DT-REPO-FILE-END F037 -->

<a id="file-f038"></a>
### F038 — `README.md`
**9044 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F038","path":"README.md","mode":"100644","encoding":"utf-8","bytes":9044,"lines":164,"sha256":"a5a9d6ee3dca309dc0dbed170f348679ff5d0670611761ede69c632b466a2afc","git_blob_sha1":"7875ed149856cf811cf5d3c1e97c435651c8521d","fence":"````","final_lf":true} -->
````markdown
> Aggiornamento 0.4.0: controlli prima di uscita/disconnessione, cambio posizione e reset facoltativo delle preferenze. Vedi [istruzioni](AGGIORNAMENTO-0.4.md) e [verifiche e limiti](docs/VERIFICA-0.4.md). Nessun fork di rclone.

# Drive Tambu 2.0 - aggiornamento 0.2.0

Drive Tambu e un'app desktop multipiattaforma (Windows + Linux) per rendere accessibili sul computer cartelle che restano sul server Ubuntu, usando rclone. Interfaccia in React + TypeScript, processo desktop in Electron, backup in una cartella locale separata.

> Stato: **anteprima da collaudare / 0.2.0**. Questo archivio contiene il codice sorgente, non un installer gia compilato. Le build native e i montaggi devono ancora essere provati su un vero PC Windows e su Linux. Non sostituisce la precedente app PowerShell: installala e provala separatamente.

## Aggiornamento 0.2.0

Pannello compatto ed espandibile, temi Sistema/Chiaro/Scuro, selezione delle directory sul server, connessioni esistenti riconosciute automaticamente, correzione dei percorsi incollati e controlli di sicurezza aggiuntivi. Le impostazioni tecniche sono nelle opzioni avanzate, non nella creazione delle cartelle.

Leggi [come applicare l'aggiornamento](AGGIORNAMENTO-0.2.md) e [le verifiche e i limiti](docs/UPDATE-0.2.md). I test automatici non sostituiscono il collaudo di un installer e della connessione SSH reale.

## Requisiti

- Node.js 22 o successivo (per sviluppo e build).
- rclone installato e disponibile sul PATH oppure indicando il percorso dell'eseguibile nelle impostazioni.
- Windows: WinFsp installato (https://winfsp.dev/).
- Linux desktop: FUSE / `fusermount3` disponibile, e permessi per eseguire mount.
- Per usare Cloudflare Tunnel + SSH: OpenSSH, cloudflared e una configurazione `~/.ssh/config` funzionante **sul PC dove gira Drive Tambu**.

L'installer **non include** ancora rclone, WinFsp, OpenSSH o cloudflared; questi componenti devono essere installati separatamente. Il server Ubuntu e i tunnel non richiedono modifiche se il collegamento SSH gia funziona.

## Avvio per sviluppare

Apri il terminale nella directory di questo progetto:

```bash
npm install
npm run dev
```

Se vuoi verificare il codice prima del pacchetto:

```bash
npm test
npm run typecheck
npm run build
```

> Le dipendenze non sono scaricabili nell'ambiente che ha preparato questo aggiornamento. Sono passati 37 test Node sui percorsi, i controlli, la configurazione e i contratti dell'interfaccia. Typecheck completo, build Electron, installer e montaggi reali devono essere verificati in GitHub Actions e sul computer di destinazione. Vedi `docs/UPDATE-0.2.md`.

## Riferimento avanzato: prima configurazione su un computer nuovo

**Con una connessione gia salvata (per esempio `casa`) non eseguire nuovamente questi passaggi.** L'app la riconosce e la usa automaticamente. Questa sezione e soltanto documentazione per installazioni nuove: la versione 0.2.0 non include ancora un assistente di creazione delle chiavi o di installazione di tutti i componenti.

### Usare il server con Cloudflare Tunnel

La configurazione SSH sul computer deve funzionare **senza chiedere password e senza finestre di login interattive**:

```bash
ssh ssh.tamburini.dev
```

Per esempio, l'host puo avere una voce in `~/.ssh/config` simile a questa, da adattare alla tua configurazione reale:

```sshconfig
Host ssh.tamburini.dev
    User NOME_UTENTE
    IdentityFile ~/.ssh/id_ed25519
    ProxyCommand cloudflared access ssh --hostname %h
```

Poi configura un remote **SFTP con SSH esterno** in `rclone config`:

```ini
[server]
type = sftp
ssh = ssh ssh.tamburini.dev
```

Questo sfrutta OpenSSH e il suo `ProxyCommand` gia configurato; rclone non apre nuove porte sul modem. Testalo prima di aggiungerlo all'app:

```bash
rclone lsf server:/home/server
```

La stringa `ssh` di rclone non chiede password: occorre una chiave SSH funzionante. Se il tunnel richiede autenticazioni browser, va risolta la modalita non interattiva prima di abilitare l'avvio automatico.

## Aggiungere una cartella

1. Apri Drive Tambu e premi **Nuova cartella**.
2. Dai un nome. Se esiste un solo server salvato viene scelto automaticamente; con piu server puoi scegliere quale usare. Premi **Sfoglia** accanto a **Cartella sul server** e seleziona la directory. Puoi anche incollare un percorso completo, per esempio `casa:/home/server/services/filebrowser/data/fabio`.
3. Seleziona la **cartella superiore** sul PC: Drive Tambu propone un percorso finale con il nome della cartella.
4. Salva: l'app verifica prima l'accesso al server. Con **Collega automaticamente** attivo, il collegamento della nuova cartella parte da solo; altrimenti premi **Collega**. Quando diventa **Collegata**, premi **Apri**.

### Differenze tra Windows e Linux

- Windows: il percorso finale da montare **non deve esistere**. Deve esistere soltanto la directory superiore. Il filesystem resta visto tecnicamente come mount rclone, ma e accessibile come normale sottocartella da Esplora file. Occorre WinFsp.
- Linux: il percorso finale deve essere una directory **vuota**; l'app puo crearla. Occorre FUSE.
- Non spostare file nella cartella remota prima che appaia lo stato **Collegata**, e non considerare la cache locale come un backup.

## Backup

In modifica cartella puoi abilitare un backup **dal server verso il PC** e impostare intervallo e conservazione delle versioni. Scegli una destinazione locale dedicata, **vuota**, oppure inesistente, non dentro nessuna cartella montata.

La prima volta l'app crea il file `.drive-tambu-backup.json` per marcare la directory come gestita: se la cartella contiene dati sconosciuti, il backup viene bloccato per precauzione.

Struttura:

```text
BackupDocumenti/
  .drive-tambu-backup.json
  corrente/                 # specchio dei file del server
  archivio/
    2026-10-17_143000/     # versioni sostituite o eliminate
```

Il backup esegue `rclone sync` dalla sorgente remota verso `corrente` e sposta in `archivio` i file che verrebbero modificati o eliminati con `--backup-dir`. Esegue prima un controllo di raggiungibilita del remote; blocca una sorgente improvvisamente vuota quando esistono gia file in `corrente`. Non carica nulla verso il server. La pulizia dell'archivio si svolge solo dopo un backup concluso correttamente. L'app deve essere aperta, anche nell'area di notifica, per i backup programmati.

**Attenzione:** `sync` puo modificare/eliminare i file in `corrente` (salvando quelli precedenti nell'archivio). Testa sempre prima con una cartella di prova, specialmente se intendi usare la pulizia automatica. I backup locali non sostituiscono una strategia di backup off-site/3-2-1.

## Build Windows e Linux

Localmente su Windows:

```bash
npm run dist:win
```

Localmente su Linux:

```bash
npm run dist:linux
```

I pacchetti vengono creati in `release/`. Le build native sono separate per Windows e Linux.

Con GitHub Actions: crea un repository, carica i file, apri la sezione **Actions** e avvia **Build Drive Tambu**. Le build vengono caricate come artifact scaricabili. Quando crei un tag `v0.2.0`, dopo build riuscite, vengono allegate a una GitHub Release. Non caricare chiavi SSH o file `rclone.conf` sul repository.

## Funzioni implementate, da collaudare nell'app installata

- Interfaccia italiana rinnovata, con libreria cartelle, riepilogo, attivita e impostazioni.
- Salvataggio configurazione JSON locale e modifiche ai collegamenti.
- Elenco dei remote rclone esistenti e diagnostica.
- Montaggio/smontaggio rclone con rilevamento del filesystem, avvio automatico delle cartelle configurate, icona tray.
- Backup manuali e programmati, archivio versioni e retention, con protezione della destinazione.
- GitHub Actions per NSIS `.exe`, `.deb` e `.AppImage`.

## Cosa manca ancora / da verificare

- Test end-to-end Windows con WinFsp, Windows Defender, rinomina e backup su un server reale.
- Test su Linux desktop con FUSE nelle varie distribuzioni.
- Gestione di migrazione automatica dalla versione PowerShell (non disponibile senza i file reali attuali).
- Firma digitale Windows, aggiornamenti automatici, installazione guidata delle dipendenze, notifiche native e test automatizzati d'integrazione.
- Supporto macOS non incluso in questa prima base.

## Dove vengono salvati i dati

Electron salva `config.json` nella directory userData dell'app; il contenuto comprende percorsi, impostazioni e tempi dei backup, **non chiavi SSH o password**. Le credenziali restano a OpenSSH/rclone sul PC. L'attivita mostrata nell'app e limitata alla sessione.

## Struttura

```text
src/main/             Processo principale: rclone, backup, configurazione, IPC
src/preload/          API tipizzate e limitate verso React
src/renderer/         React e CSS, nessun accesso Node diretto
src/shared/           Tipi TypeScript condivisi
.github/workflows/   Build Windows e Linux
resources/           Icona originale Drive Tambu
```

Progetto iniziale. Prima di usare cartelle importanti, fare un test con dati sacrificabili e verificare i log e i backup.
````
<!-- DT-REPO-FILE-END F038 -->

<a id="file-f039"></a>
### F039 — `docs/ROADMAP.md`
**1283 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F039","path":"docs/ROADMAP.md","mode":"100644","encoding":"utf-8","bytes":1283,"lines":30,"sha256":"a7d8ef755f980a6db75569689b0ba18ade6db543396e4f734bcd1144f35291cd","git_blob_sha1":"92bcbb9f180b022241104ceffdd09fae733070b6","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu - percorso di sviluppo

## Versione 0.1.0 - base iniziale
- [x] Nuova interfaccia minimal in React/TypeScript
- [x] Electron main + preload + API IPC esplicita
- [x] Configurazione e monitoraggio processi rclone
- [x] Montaggio come cartella su Windows/Linux
- [x] Backup con versioni e verifiche basilari
- [x] Tray e impostazioni base per avvio automatico
- [x] GitHub Actions per Windows e Linux
- [ ] Build e prova reali Windows + Linux

## Versione 0.2.0 - stabilita
- [ ] Test di integrazione con rclone fittizio e server SFTP di prova
- [ ] Riconnessione con backoff e miglior reporting Cloudflare/SSH
- [ ] Diagnostica WinFsp/FUSE e wizard prerequisiti
- [ ] Avanzamento backup affidabile e storico persistente
- [ ] Interfaccia di ripristino da archivio
- [ ] Test di regressione sui backup in condizioni di rete assente

## Versione 0.3.0 - migrazione
- [ ] Analizzare i veri file della precedente Drive Tambu
- [ ] Importare i montaggi senza perdere i dati
- [ ] Testare i collegamenti Windows creati dalla vecchia app

## Prima release stabile
- [ ] Installazione pulita su Windows e Ubuntu Desktop
- [ ] Firma digitale e pacchettizzazione verificata
- [ ] Aggiornamenti sicuri da GitHub Releases
- [ ] Testare rimozione/migrazione/backup con dati di prova
````
<!-- DT-REPO-FILE-END F039 -->

<a id="file-f040"></a>
### F040 — `docs/UPDATE-0.2-files.json`
**2402 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F040","path":"docs/UPDATE-0.2-files.json","mode":"100644","encoding":"utf-8","bytes":2402,"lines":30,"sha256":"5a21d34261b8741d16d99fd9d332995e58b88e536489e2daee1368b29a611f98","git_blob_sha1":"40709822fff83232d70824638b2497305eb46114","fence":"````","final_lf":true} -->
````json
{
  "base_commit": "483fc25987e25b8490ac8406b427062575fbfdbb",
  "version": "0.2.0",
  "files": {
    ".github/workflows/build.yml": "b10445c7c5b1233716ee218752d3cd1a3199c868e33109a92423d9749b0e8245",
    "AGGIORNAMENTO-0.2.md": "692f9118c7b2539acc1d840f24adce095e3fe902db7abb31652a5486e3b2e119",
    "README.md": "76b10c8835625dff8b8ef9a08257246ebf78215deea0d513f4e9fd36183bb64d",
    "docs/UPDATE-0.2.md": "3e1e4f07b482172d56e54d5173df8f65fc1747f285860faa694eae2cd58f93b8",
    "package.json": "dde61da27e836a2b923af81c5eb01dd224c6e002b4e1c3874f0c92c771452879",
    "src/main/backups.ts": "256f883ea5406b04bcc1678450181038db42251f6b92d5a38ab29d96bcbb4ef2",
    "src/main/diagnostics.ts": "e31bbaab92eadb000f2e0abfcbabe66caf2335c59b73d01c469145b53a5b0ee5",
    "src/main/index.ts": "d67394eeae5ad0c700dc0f8a5f227459ce99a055b7952bdba4e1624b8f3717dd",
    "src/main/mounts.ts": "7d0ff0aa29df043fdca37bcc89050e7bddd6a6c95dae79558cf8aca2fcaa7083",
    "src/main/store.ts": "106c1db639c27078a2d65f7b0be721542b3bc80adeca272001f1f963c79285fa",
    "src/main/window-layout.ts": "cc8288af82e0f30b79408c0554560ac58735dbbc9985e54eb6e4bacfd00ad81e",
    "src/preload/index.ts": "6b8d3266e5011c2af1a5d5e2ce33e24bc6e3dfdfb50767ff92cf8096f29ed103",
    "src/renderer/src/App.tsx": "8526087389218a78e33a9e876d0b9f991eff9ce70bd9582ba8f086f7eba8d637",
    "src/renderer/src/styles.css": "c2887d39ac2a72d84fa32cf7bb2107e06c277cac232af516f4579f17ea6cfa06",
    "src/shared/paths.ts": "8a6b1ff8a2eb3203691124689044c7c9e8358614fc7bbeaa1b3b80b0a438e6fb",
    "src/shared/types.ts": "8ed70f91412701749338b13e0c4b35f1288005b327e2506f95c875e63ce21224",
    "tests/browser.test.cjs": "dd381e0f42e00f90068ef65b3a8ad8b8e44209bd92790400777335af8e6aa27b",
    "tests/layout.test.cjs": "0f823754eb8649abfc88bbf9b5698abedf8566bd7cd49acc8cf806e15dafa942",
    "tests/mounts.test.cjs": "0881cd8567222fbcc051d8b7f3f8e4516e260306002b0d1d0349bf941e5b60ea",
    "tests/register.cjs": "590e71d8314ad790f261d7eedfc950db53952e4f5dad7ec511c2257b4e79ceb0",
    "tests/remote.test.cjs": "1bbec11dc97ae58fd86971f177812b296e14ef99c58680c006d991c09cbfea9a",
    "tests/store.test.cjs": "1c8c7c6c2c06e3ef34c91a912d2760e59c62114619396039b64207cb8eb2327e",
    "tests/ui.test.cjs": "01935d635175b14532f6e2975c76b84b9535cfc241329864a3501f58d51df193",
    "tests/window.test.cjs": "37e2966929f6631dfc68142e86230f3860f3328cc9cabe7a2c2684c717dee1e1"
  }
}
````
<!-- DT-REPO-FILE-END F040 -->

<a id="file-f041"></a>
### F041 — `docs/UPDATE-0.2.md`
**5312 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F041","path":"docs/UPDATE-0.2.md","mode":"100644","encoding":"utf-8","bytes":5312,"lines":44,"sha256":"3e1e4f07b482172d56e54d5173df8f65fc1747f285860faa694eae2cd58f93b8","git_blob_sha1":"d324f543b25a8e6ebb626a7ee630b5af03108ca2","fence":"````","final_lf":true} -->
````markdown
# Drive Tambu 0.2.0 - aggiornamento dell'interfaccia e dei collegamenti

## Ambito

Aggiornamento dei flussi gia esistenti, senza sostituire Electron, React o rclone. Basato sul commit upstream 483fc25987e25b8490ac8406b427062575fbfdbb. Nessun cambiamento e stato pubblicato nel repository online: il connettore ha restituito HTTP 403 alla creazione del branch. La consegna e un archivio di aggiornamento da applicare localmente e pubblicare con GitHub Desktop.

## Modifiche

1. **Scelta del server automatica.** Il campo Remote rclone non e piu nel modulo. Una sola connessione esistente viene scelta automaticamente. Con piu connessioni, l'utente sceglie un server; il predefinito e nelle Impostazioni. Nessun nome viene inventato se non ci sono connessioni.
2. **Sfoglia sul server.** Directory soltanto, navigazione Home/root/genitore, ricerca, paginazione visuale, selezione, annullamento e gestione delle risposte obsolete. Le operazioni sono di lettura e non scaricano i contenuti dei file.
3. **Percorsi e connessione.** Un prefisso incollato uguale al server scelto viene normalizzato una sola volta. Un server diverso e un percorso Windows sono segnalati. Prima del montaggio viene verificata la directory remota; l'attesa per il filesystem locale e distinta. Richieste duplicate e annullamenti sono gestiti. I controlli SFTP non eseguono sonde hash tramite shell remota.
4. **Tema completo.** Sistema, Chiaro e Scuro persistenti; controlli, dialoghi dell'app, messaggi e finestra nativa ricevono il tema. Scelta rapida dalla barra superiore.
5. **Due viste.** Pannello predefinito 430 x 650, adattato all'area utile dello schermo, e finestra espansa ridimensionabile. Una sola finestra e gli stessi processi di collegamento; nessun riavvio dei montaggi al cambio di vista. Linux mantiene un accesso dalla barra delle applicazioni; Wayland conserva la cornice nativa come fallback.
6. **Impostazioni e chiarezza.** Intero pulsante in basso a sinistra cliccabile; navigazione inferiore nel pannello compatto. Lo stato di connessione non viene dedotto dalla sola presenza di rclone. Opzioni tecniche in una sezione avanzata, errori comprensibili e dettagli separati in Attivita.
7. **Controlli di sicurezza.** Configurazione precedente mantenuta con copia di sicurezza; destinazioni locali non sovrapposte; backup separati dai montaggi in entrambe le direzioni e tra loro; radice del filesystem bloccata. Nessuna cartella esistente viene cancellata per preparare un montaggio. Conferme prima di uscire o interrompere collegamenti in uso. API IPC limitate alla finestra principale; niente shell per l'esecuzione dei comandi.

## Verifiche eseguite

- **37 test automatici Node: passati.** Percorsi completi/relativi/root, prefissi duplicati, server errati, processi di controllo riusciti/mancanti/in timeout, navigazione e risposte del server, cancellazione, migrazione/persistenza della configurazione, conflitti dei backup, geometria del pannello, guardie IPC, cambio finestra/tema e contratti dei componenti dell'interfaccia.
- **18 layout statici controllati con Chromium:** due temi, tre schermate (cartelle, impostazioni, modulo), viste 430 x 650, 1180 x 800 e 320 x 440. Nessun debordamento orizzontale; tutti i footer dei dialoghi dentro la finestra. Questi controlli usano markup derivato dai componenti, dati dimostrativi e icone sostitutive: non sono screenshot dell'app Electron in esecuzione.
- Analisi e revisione locale dei percorsi, della cancellazione dei processi e delle guardie di accesso. Nessuna revisione indipendente da un altro sviluppatore e stata eseguita.
- I test sostituiscono soltanto le dipendenze native quando necessario. Quelli dei componenti sono test strutturali con hook simulati, non test end-to-end React. Non provano un montaggio reale, WinFsp o Cloudflare.

## Verifiche ancora necessarie

**Non dichiarare questo aggiornamento pronto per produzione prima del collaudo.**

- Installazione delle dipendenze e `npm run typecheck` completo: non completabili nell'ambiente di preparazione, che non riesce a raggiungere il registro npm. Il tentativo di controllo senza dipendenze segnala i moduli mancanti; non e un typecheck passato.
- `npm run build`, installer Windows e pacchetti Linux: da eseguire in GitHub Actions. Il workflow include ora `npm test` prima di typecheck e packaging.
- Avvio reale dell'app e preload sandboxed; dialoghi nativi, icona vicino all'orologio, riduzione/espansione, scala DPI e piu monitor su Windows/Linux.
- Connessione SSH dell'utente con rclone/cloudflared e WinFsp/FUSE reali. Testare una cartella piccola; simulare server irraggiungibile, credenziale mancante e annullamento. Non confondere la correzione del percorso con la dimostrazione che la rete o la chiave siano funzionanti.
- Backup con dati sacrificabili: prima copia, modifica, eliminazione, archiviazione, retention e interruzione. Non testare subito sui soli esemplari di file importanti.
- Verificare salvataggi e trasferimenti pendenti prima di scollegare o uscire: la versione usa conferme conservative, non una misura garantita di tutte le scritture in attesa.

## Sviluppo

```
npm install
npm test
npm run typecheck
npm run build
```

I test usano la dipendenza TypeScript gia presente e il test runner integrato in Node, senza aggiungere un framework di test.
````
<!-- DT-REPO-FILE-END F041 -->

<a id="file-f042"></a>
### F042 — `docs/UPDATE-0.3-files.json`
**5857 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F042","path":"docs/UPDATE-0.3-files.json","mode":"100644","encoding":"utf-8","bytes":5857,"lines":158,"sha256":"44e0cece59aa32aa77bacdcb8960e1786b192cd85bb2a478f710156c6e37f3c6","git_blob_sha1":"61aa3ff218699174dcc241801d6ac571d48eda44","fence":"````","final_lf":true} -->
````json
{
  "version": "0.3.0",
  "base_version": "0.2.1",
  "base_commit": "286e20ab36e990742c788981cf439460a36f8874",
  "description": "Changed source files and tests only. This manifest is also included, without a self-hash.",
  "files": [
    {
      "path": "AGGIORNAMENTO-0.3.md",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "4c121af8faa072b2c1a208003423f71314b2a421a2f28d7a41560f4cf1cc6231"
    },
    {
      "path": "docs/VERIFICA-0.3.md",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "033c9ec7e8c2f1399f0743deba42183842c08df93f5afee173874aea08fe2331"
    },
    {
      "path": "package.json",
      "action": "replace",
      "before_sha256": "77ffb183c9a81857f2877df757f793b24a906c08d7451d3a05add7f3096932df",
      "after_sha256": "d47794b7b05bf26227ee6669641f5066eca7d3bc460b9ef0c4c11fd10fdc5f50"
    },
    {
      "path": "src/main/backup-progress.ts",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "0f359e458f9f197a5b90a24d5a29b4a1e573ffe25537e080d13ae06a7ddcb6ea"
    },
    {
      "path": "src/main/backups.ts",
      "action": "replace",
      "before_sha256": "256f883ea5406b04bcc1678450181038db42251f6b92d5a38ab29d96bcbb4ef2",
      "after_sha256": "5ceb9a4b9b0c6a63bbc90d7ff364a0aeffa676e979bb87fbc8625299794fcbd3"
    },
    {
      "path": "src/main/index.ts",
      "action": "replace",
      "before_sha256": "d67394eeae5ad0c700dc0f8a5f227459ce99a055b7952bdba4e1624b8f3717dd",
      "after_sha256": "bc6b1eb037457e552d576bbff8bd1f1f95a1d64030721716e7163b6eccc20a38"
    },
    {
      "path": "src/main/mounts.ts",
      "action": "replace",
      "before_sha256": "7d0ff0aa29df043fdca37bcc89050e7bddd6a6c95dae79558cf8aca2fcaa7083",
      "after_sha256": "df7aebd45d84ae296168211b4fa4636d1b0cc2a4a71bb9926694e4e91bdf77ea"
    },
    {
      "path": "src/main/shortcuts.ts",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "a39c050286d56478f52600724d701457adc5cc2bae84ac1606c64fd5b3da7df6"
    },
    {
      "path": "src/main/store.ts",
      "action": "replace",
      "before_sha256": "106c1db639c27078a2d65f7b0be721542b3bc80adeca272001f1f963c79285fa",
      "after_sha256": "cf7ea12d7c92c157de687c18382f31791a41de2683922e7af2999963fdee4880"
    },
    {
      "path": "src/preload/index.ts",
      "action": "replace",
      "before_sha256": "6b8d3266e5011c2af1a5d5e2ce33e24bc6e3dfdfb50767ff92cf8096f29ed103",
      "after_sha256": "47c33e43474b4864c5e91899e351a71294736721d8ecaedffa1a7eb35d09ebb0"
    },
    {
      "path": "src/renderer/src/App.tsx",
      "action": "replace",
      "before_sha256": "ca62247324e3f91b7b88d7a55ba386cfb427f291e82a3752e8c5f4bad95199f9",
      "after_sha256": "9ca010331355540b5277e38eb0fc5e07e945dc989217b9cab154328e3c19fc97"
    },
    {
      "path": "src/renderer/src/styles.css",
      "action": "replace",
      "before_sha256": "c2887d39ac2a72d84fa32cf7bb2107e06c277cac232af516f4579f17ea6cfa06",
      "after_sha256": "1996fadb0fcf7b219477ab625ae1c8cc14e6e1da3a35afcaddb41d71099f479e"
    },
    {
      "path": "src/shared/refresh.ts",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "2370f9533fe25a099168a0c509ed14ba54349d61494209a0ce4e9ecf4edb4a8d"
    },
    {
      "path": "src/shared/schedule.ts",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "56e6ffe0d4c2864869f7546db49b558c36e922a3e4b3e7577484995e4c179271"
    },
    {
      "path": "src/shared/types.ts",
      "action": "replace",
      "before_sha256": "8ed70f91412701749338b13e0c4b35f1288005b327e2506f95c875e63ce21224",
      "after_sha256": "291fc250a29d26de82e7e0a8243b35cdd87895796ac4cb94e3dcf9f91f371030"
    },
    {
      "path": "tests/backups.test.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "54e14f684c50da1510bc9d022a80c1b7d50ba083e3b3400d714999e820842f10"
    },
    {
      "path": "tests/helpers/ui.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "370e1a63b9212e45b43a3d3e44da1f6702119467ebc2b116b27ea6db2e103f5c"
    },
    {
      "path": "tests/mounts.test.cjs",
      "action": "replace",
      "before_sha256": "0881cd8567222fbcc051d8b7f3f8e4516e260306002b0d1d0349bf941e5b60ea",
      "after_sha256": "a6768cea9c0bcc57e76644ce5afe97a793339b4f13789ba2c08e9314cb0c4635"
    },
    {
      "path": "tests/preferences.test.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "b5e2a434b05a64bc3b0c7e9302be790d1ad9a026e60ce18b1899fe0dee294f9a"
    },
    {
      "path": "tests/progress.test.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "0e6e9491026288f1c312006642e45f3be028b7ac9360329120b53da3407a8086"
    },
    {
      "path": "tests/schedule.test.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "01b712b9c4ac74394ca73d2ac7aae5ec950ea5aef42457550616c6f652c98974"
    },
    {
      "path": "tests/shortcuts.test.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "40f65796d0787c111f0aa5957264156dfb84977844b8729d7d455bf033a67d9b"
    },
    {
      "path": "tests/store.test.cjs",
      "action": "replace",
      "before_sha256": "1c8c7c6c2c06e3ef34c91a912d2760e59c62114619396039b64207cb8eb2327e",
      "after_sha256": "583dbcff2e018d2d728fd0875c7161aaa3108213e5b90da486cbcab7d558397e"
    },
    {
      "path": "tests/syntax.test.cjs",
      "action": "add",
      "before_sha256": null,
      "after_sha256": "8de52f0cc985bfd6920bcf7bcedeedc2b30be5be63c023b5b1be8bb876b03142"
    },
    {
      "path": "tests/window.test.cjs",
      "action": "replace",
      "before_sha256": "37e2966929f6631dfc68142e86230f3860f3328cc9cabe7a2c2684c717dee1e1",
      "after_sha256": "12293c44651700301b3ce99f3ae42349ca12043713ed7514ae5e6a5a0c9b286e"
    }
  ]
}
````
<!-- DT-REPO-FILE-END F042 -->

<a id="file-f043"></a>
### F043 — `docs/UPDATE-0.4-files.json`
**5343 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F043","path":"docs/UPDATE-0.4-files.json","mode":"100644","encoding":"utf-8","bytes":5343,"lines":159,"sha256":"030da4717d4b4f6a455c1cab2c67b1848d79fa89e8252295db7c66f5fc93a0c4","git_blob_sha1":"bdfeec6d88812cba14727be08dbd003f442cc772","fence":"````","final_lf":true} -->
````json
{
  "version": "0.4.0",
  "baseCommit": "a8134367539ee6ef0942243d2735356d1fe6766d",
  "contents": "source update, not installer",
  "files": [
    {
      "path": ".github/workflows/guarded-close.yml",
      "sha256": "10a2723d7db76ea779e834e44b8f66c39133d32eac5eb9f11cbd3b3aa21f505a"
    },
    {
      "path": "AGGIORNAMENTO-0.4.md",
      "sha256": "fa2276ba168bc4327b060dbd9dfcf1070ca9be003369eaeb2b91ae1c49a47f9e"
    },
    {
      "path": "FILE-DA-RIMUOVERE.txt",
      "sha256": "95def296004b8a003d06a0e6cbd771c6454784c9546f3766234c0fb708f38d12"
    },
    {
      "path": "README.md",
      "sha256": "a5a9d6ee3dca309dc0dbed170f348679ff5d0670611761ede69c632b466a2afc"
    },
    {
      "path": "build/installer.nsh",
      "sha256": "770074c3d2762bcc42b9628d610bc6bdef92ae51cab63c1da96bc517e3c5bd77"
    },
    {
      "path": "docs/VERIFICA-0.4.md",
      "sha256": "d542939ffbac24cbb812180f3bb43418c707457c852db353c7b3e3abeb63c3be"
    },
    {
      "path": "package.json",
      "sha256": "4a1e1887cd9dd3a2e9bc93f5688fb3febd08bae603ee9dbb6e759326e65dbad2"
    },
    {
      "path": "src/main/backups.ts",
      "sha256": "5c93cf37bf1d15c8bc8fbd9481b51c1bfed6c888ee0b582160978655143b1900"
    },
    {
      "path": "src/main/control.ts",
      "sha256": "8b20dab2989a8768d0e3bcfd1e3280c62b940d0f2348f19268f6cc2755f86455"
    },
    {
      "path": "src/main/index.ts",
      "sha256": "71caf45a417f5407416590cabd00935aee7dcabc11559f01413edb6575cb504e"
    },
    {
      "path": "src/main/mounts.ts",
      "sha256": "5d3acb20e4f56c02f69e4557e3981c839b0f0c53f5d3f171585c3bb90f6b9aa1"
    },
    {
      "path": "src/main/operations.ts",
      "sha256": "a1223767d43601d59d5e7d6608d30eb9632d092696aac2aa9861234c44780e81"
    },
    {
      "path": "src/main/preflight.ts",
      "sha256": "f7e29b5270e81fde97b85b7e12f8d44bc010fa46ead4f5ae5c144a4d75d6c5b6"
    },
    {
      "path": "src/main/store.ts",
      "sha256": "f61c7875f14452586a23dd2c0f3cb3b0e60afeaa00290699a9892eba918b118a"
    },
    {
      "path": "src/preload/index.ts",
      "sha256": "971b59174ded3f342b0b94f83907367b2d206f5ed97f15242ae281611bfb7ed4"
    },
    {
      "path": "src/renderer/src/App.tsx",
      "sha256": "fe96df42a6d38ef565be967f78918e0395fec372c236b3005ff62753cc483c2b"
    },
    {
      "path": "src/renderer/src/styles.css",
      "sha256": "061b36cbce695cda3afada69b3bafa0d1be37807c87a61bd8647719cd3eef90f"
    },
    {
      "path": "src/shared/types.ts",
      "sha256": "b3f0bfcf8c0787ffd7d9db223b20f3e633a9d7195ab3e55775eaea3135184e17"
    },
    {
      "path": "tests/backups.test.cjs",
      "sha256": "38111f83d4020a0b736778493f8ad7bbd127bbe31cc762164ed5c78ca6682253"
    },
    {
      "path": "tests/control.test.cjs",
      "sha256": "b9e47b85580d684250b0f9c9a4cd7d2c5d23fdafdf6aa4879b6e1359509c1bb2"
    },
    {
      "path": "tests/guarded-app.test.cjs",
      "sha256": "8919689b0304c3536073f72fd332144bd307fe1c57f641250da504a3e74dd2cb"
    },
    {
      "path": "tests/helpers/ui.cjs",
      "sha256": "8a2b34f7f705b2880a740b1e4e9a4a03fe5ff61dd5b35ed9a2f1f294a77faeec"
    },
    {
      "path": "tests/installer.test.cjs",
      "sha256": "d0ec319c0528734f26bb8a87b2b31b74523ad2f28c7daa7ddd08384f36dc2ab9"
    },
    {
      "path": "tests/mounts.test.cjs",
      "sha256": "f922fd1701f2becc9645f1a35989935cda2ae39ebf96cd971423425d82b7f386"
    },
    {
      "path": "tests/native-helpers.test.cjs",
      "sha256": "5bbc9dec0771b7598ea965a4aea0caf164987e57362c9f30040d5b0c833bf59b"
    },
    {
      "path": "tests/native-wiring.test.cjs",
      "sha256": "7e0bf129b1f062aee4649a53edcfa84d8272e106e9484d43e318448daa639282"
    },
    {
      "path": "tests/native/guarded.cjs",
      "sha256": "835a9f6235c7b01e5d4b21a62a728c70fa135ab4b76a52d42e90b7ce1456b3a0"
    },
    {
      "path": "tests/native/helpers/fixture.cjs",
      "sha256": "087b4e4d8088cb5dd80ccb08e865720d5ade1b0a19e58c42d644f2b6604c19bb"
    },
    {
      "path": "tests/native/helpers/support.cjs",
      "sha256": "675608cb07ef683c76a548e8ccfccdb245b8ec68d2bffa03fef0d73329e6915f"
    },
    {
      "path": "tests/native/helpers/writer.cjs",
      "sha256": "e45efdc204b455657ca286ad16ca92fa5b3f1fc407c8506bf2894e53d88b936d"
    },
    {
      "path": "tests/operation-ui.test.cjs",
      "sha256": "0f5e84e5746138ea1d25b14b3185fd18e3b3daf366cc6837361c8ddc590c1787"
    },
    {
      "path": "tests/operations.test.cjs",
      "sha256": "d6a59d72c7211df09b48b96a25e65a74a3f0539ea28a13e738d240503c33834d"
    },
    {
      "path": "tests/preflight.test.cjs",
      "sha256": "f6c8adeef87f994cbc9b596bae05a5654377d59c1d16278b251c3cbc58071df8"
    },
    {
      "path": "tests/window.test.cjs",
      "sha256": "eb9166464c6fedca21c764c618150d3d3f9ccfc01c7bed94f7ca9e4119cbbe34"
    }
  ],
  "removeDirectories": [
    "tools/safety-probe"
  ],
  "removeFiles": [
    ".github/workflows/storage-investigation.yml",
    "LEGGIMI-fix-marker.md",
    "LEGGIMI-fix-report.md",
    "tools/safety-probe/README.md",
    "tools/safety-probe/VERIFICA-RIPROVA.md",
    "tools/safety-probe/fixture.cjs",
    "tools/safety-probe/native.cjs",
    "tools/safety-probe/support.cjs",
    "tools/safety-probe/tests/support.test.cjs",
    "tools/safety-probe/writer.cjs"
  ],
  "retained": "regular tests and test-only SFTP fixtures; no custom rclone engine"
}
````
<!-- DT-REPO-FILE-END F043 -->

<a id="file-f044"></a>
### F044 — `docs/VERIFICA-0.3.md`
**4695 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F044","path":"docs/VERIFICA-0.3.md","mode":"100644","encoding":"utf-8","bytes":4695,"lines":77,"sha256":"033c9ec7e8c2f1399f0743deba42183842c08df93f5afee173874aea08fe2331","git_blob_sha1":"a38fdfb92fc1f6d8e02d28bb07ade0214230b6ab","fence":"````","final_lf":true} -->
````markdown
# Verifica di Drive Tambu 0.3.0

## Ambiente

Linux, Node.js 22.16.0, npm 10.9.2 e TypeScript globale 5.8.3.
Il repository richiede TypeScript ^5.9.0: la compilazione con le dipendenze
richieste resta responsabilita' della successiva esecuzione di GitHub Actions.
Base dei sorgenti verificata tramite il connettore GitHub: commit
286e20ab36e990742c788981cf439460a36f8874, versione 0.2.1.

## Controlli completati

- Suite completa: 106 test superati, 0 fallimenti, 0 annullati, 0 saltati
  nell'ambiente Linux di verifica. La base 0.2.1 aveva 49 test.
- Casi di programmazione: domenica 02:00, piu' giorni settimanali, orario
  giornaliero, intervalli liberi, manuale, dati non validi, ritardi, retry,
  cambio ora legale/solare Europe/Rome e mantenimento della scadenza al riavvio.
- Progresso: statistiche vere interpretate da JSON simulato al confine del
  processo, righe frammentate, UTF-8, limiti di memoria, dati non validi,
  percentuali e fallimento dopo il trasferimento di tutti i byte.
- Configurazione: lettura/scrittura di file temporanei reali, migrazione e copia
  pre-0.3, eccezioni agli intervalli generali, timestamp non falsificabili dalla UI.
- BackupManager: una sola esecuzione contemporanea, ripresa di una sola scadenza,
  controllo della sorgente vuota e reale aggiornamento degli stati del manager.
- Collegamenti: identificativo salvato, apertura con collegamento attivo o da
  avviare, nessuna creazione arbitraria da CLI, quoting .desktop, rifiuto di
  link simbolici e di destinazioni dentro cartelle collegate/backup.
- Confine Electron: registrazione e protezione IPC, snapshot delle statistiche,
  creazione del launcher, second-instance e riuso della finestra.
- UI: handler reali con hook React simulati, scelta dei giorni/ora, intervalli,
  salvataggio, barra e percentuale, messaggi di errore e appuntamento persistito.
- Test di sintassi aggiunto: tutti i sorgenti TS/TSX devono essere parsabili
  senza il recupero automatico del compilatore. Ha rilevato una parentesi
  mancante durante la preparazione, corretta prima di creare il pacchetto.
- Controllo strict TypeScript dei nuovi moduli non dipendenti da Electron:
  tipi condivisi, schedule, refresh, shortcuts, backup-progress: superato.
- Controllo sintassi/transpilazione: 16 sorgenti .ts/.tsx non dichiarativi,
  nessun errore di sintassi. Non equivale al typecheck completo del progetto.
- git diff --check: nessun errore di whitespace.
- Layout statici in Chromium: 18 combinazioni (3 schermate x 3 dimensioni x 2
  temi); nessun overflow orizzontale nei contenitori controllati, footer dei
  dialoghi nei limiti della finestra. Dimensioni: 320x520, 430x650, 1200x800.
  Il markup proviene dai componenti con hook/icone simulati: non e' una prova
  di un'app Electron reale ne' di tutti i comportamenti interattivi di React.

I nuovi casi di comportamento sono stati eseguiti anche prima delle relative
implementazioni per verificare il fallimento atteso. I test preesistenti non
sono stati disattivati. Un'attesa temporale fragile nel test del backup e'
stata sostituita con un'attesa della condizione effettiva di avvio del processo.
Il test di symlink salta su Windows (richiede permessi speciali); su Linux gira.

## Limiti espliciti

- npm non riusciva a raggiungere il registro (errore DNS EAI_AGAIN): non e'
  stato possibile installare le dipendenze dell'intero progetto.
- npm run typecheck: non completato; termina con TS2688, definizioni node non
  installate nel progetto. Con tipi globali sono stati verificati solo i moduli
  indipendenti sopra elencati, non sostituita la compilazione richiesta dal repo.
- Nessuna build Electron completa, firma o generazione installer locale.
- Nessuna prova sul server dell'utente o di un trasferimento rclone reale.
- Le chiamate native Electron, il processo rclone e React sono simulati nei
  test che attraversano quei confini; la persistenza temporanea su disco e
  la logica del progetto sono invece quelle reali.
- Nessuna revisione indipendente da parte di un secondo agente: controllo
  manuale del diff piu' verifiche automatiche.

Il workflow esistente gia' esegue npm test e npm run typecheck prima del
packaging su Windows e Linux. Deve completare tutti quei passaggi prima
che un installer sia considerato disponibile.

## Collaudo richiesto sul PC

Dopo la build, provare su dati di prova: salvataggio/ripristino delle scadenze,
un backup piccolo, il launcher con app chiusa e con app gia' aperta, cambio
intervallo con avviso di riconnessione, tema scuro e pannello compatto.
Sul desktop Linux verificare anche l'eventuale richiesta "Consenti avvio".
Non testare la chiusura forzata con modifiche importanti ancora da caricare.
````
<!-- DT-REPO-FILE-END F044 -->

<a id="file-f045"></a>
### F045 — `docs/VERIFICA-0.4.md`
**6366 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F045","path":"docs/VERIFICA-0.4.md","mode":"100644","encoding":"utf-8","bytes":6366,"lines":60,"sha256":"d542939ffbac24cbb812180f3bb43418c707457c852db353c7b3e3abeb63c3be","git_blob_sha1":"a1fee6472bc3e57a1d0b5256df712f7dba862d12","fence":"````","final_lf":true} -->
````markdown
# Verifica Drive Tambu 0.4.0

Data: 18 ottobre 2026. Baseline app confrontata col commit GitHub a8134367539ee6ef0942243d2735356d1fe6766d. Nessuna modifica al repository remoto o al server personale.

## Esito locale

- Suite completa: 168 test passati, 0 falliti, 0 saltati sul runtime Linux locale.
- I nuovi test di preflight/client HTTP, lifecycle, coordinatore, IPC, UI e policy NSIS sono stati preceduti da esecuzioni fallite; conservati i test utili della fixture SFTP, inclusa la regressione del marker.
- Il controllo TypeScript isolato di control.ts, preflight.ts, operations.ts e shared/types.ts passa in modalita' strict con target ES2022 e tipi Node installati.
- Il loader di test transpila il TypeScript; questo NON equivale al typecheck completo di Electron/React.
- 24 combinazioni di layout statico del dialogo (4 scenari, 2 temi, 3 dimensioni: 320x440, 420x640, 1100x760) verificate in Chromium: niente overflow orizzontale e pulsanti inferiori dentro la finestra. JSX espanso con helper di test e CSS reale; non e' un'esecuzione dell'app Electron, gli effetti React e le API native non sono simulati dal browser.
- Parsing degli script CommonJS, JSON e workflow controllato. Integrita' ZIP e applicazione del pacchetto a una copia della baseline controllate prima della consegna.

## Cosa esercitano i test

preflight: invii/trasferimenti/check, cache piena/errore, campi mancanti o malformati, array null di Go, errori cumulativi storici.
control: richieste HTTP reali su loopback, autenticazione, timeout, JSON invalido, comandi non consentiti e messaggi che non inoltrano il corpo di errore del backend.
mounts: codice di produzione con confine subprocess/RC simulato; unmount prima di quit, verifica del punto, nessun kill in caso di blocco o smontaggio fallito, destinazioni e ownership Linux.
operations: nonce, doppio controllo, risposta falsa/stale, cancellazione durante attesa, blocco di azioni concorrenti e ripresa della pianificazione.
guarded-app: handler IPC di produzione con Electron/driver simulati; uscita, rimozione, cambio percorso, annullamento, rollback ordinario, percorso scollegato.
backups: job gia' attivo continua durante la pausa; nuovi job/scheduler bloccati; stop rifiuta di interromperlo.
UI: handler delle componenti con helper React/JSX, non un browser React interattivo.
NSIS: controlli di policy sui sorgenti e confronto con gli hook ufficiali electron-builder v26; NON compilazione o esecuzione reale del disinstallatore.

## Revisioni e decisioni

Revisione separata svolta dallo stesso autore, senza un revisore indipendente disponibile. Il test nativo ha anche un controllo che riporta una disconnessione bloccata, anziche' aspettare una conferma umana inesistente nel runner. Corrette con regressioni le seguenti incongruenze:
- componente vivo ma stato errore: il comando Scollega deve restare accessibile;
- contenitore Linux creato dall'app: mantenere l'identita' tra riconnessioni della stessa sessione;
- dialogo bloccato dopo un fallimento parziale: non dire erroneamente che tutte le cartelle sono ancora montate;
- identificatore NSIS dell'installazione corrente: CurrentUser, non current;
- funzioni della pagina NSIS inserite tramite customHeader dopo le dichiarazioni MUI, non prima.

Decisione 1: l'ultimo requisito approvato sostituisce il progetto di barriera nativa/fork. Rclone rimane ufficiale; i controlli sono osservazioni e la conferma segnala il rischio residuo dei file aperti. Costo del compromesso: nuove scritture esterne possono iniziare dopo il controllo.
Decisione 2: rollback del cambio percorso per errori ordinari; se il nuovo processo rimane incerto, conservare la posizione nuova e non avviare un secondo motore. Costo: occorre risolvere il singolo collegamento rimasto in errore; nessuna garanzia di rollback transazionale contro un crash del sistema.

Non sono dichiarati altri interventi cosmetici minori rinviati; i limiti operativi sono quelli qui esplicitati.

## Da verificare prima di considerare collaudata la distribuzione

Il tentativo di installare le dipendenze npm in questo ambiente non e' riuscito per indisponibilita' della risoluzione rete. Non e' stato creato un lockfile artificiale. Il typecheck completo e' stato tentato: dipendenze/tipi electron, electron-vite e plugin React mancanti (con errori derivati); NON e' risultato verde. La build Electron e la creazione/avvio degli installer non sono state eseguite qui.

Build Drive Tambu su GitHub deve verificare: npm test, npm run typecheck, npm run dist:win e npm run dist:linux.

Il NUOVO workflow Drive Tambu - Verifica disconnessione esegue la classe MountManager e il coordinatore distribuiti con l'app, su file SFTP artificiali e runner temporanei. Deve confermare: caricamento pendente bloccato, warning non bypassato, ricontrollo, smontaggio richiesto al motore, chiusura del solo processo posseduto e hash remoto intatto. NON e' stato eseguito durante questo sviluppo locale.

Le vecchie prove verdi con rclone 1.74.4, WinFsp 2.1 e FUSE dimostrano soltanto gli scenari del vecchio script di caratterizzazione: non sono sostituibili a questo nuovo test dell'integrazione.

Da eseguire su Windows con installer reale: annullamento, uninstall con/senza spunta, update senza reset, app aperta con job attivo, profilo utente differente, checkbox e conservazione dei file esclusi. Il vecchio disinstallatore gia' installato non viene dichiarato protetto retroattivamente.

Questa versione non dimostra assenza totale di perdita dati, recupero di file parziali, controllo conflitti o sicurezza contro chiusure forzate del sistema. I test con simulazioni non certificano proprieta' dei driver.

## Riferimenti tecnici consultati

- https://rclone.org/rc/ (metodi ufficiali, statistiche e autenticazione)
- https://github.com/rclone/rclone/blob/v1.74.4/cmd/mountlib/rc.go (registrazione dei montaggi creati tramite RC)
- https://www.electron.build/v26/docs/nsis/ (personalizzazioni mediante include)
- https://github.com/electron-userland/electron-builder/blob/v26.0.12/packages/app-builder-lib/templates/nsis/include/allowOnlyOneInstallerInstance.nsh
- https://github.com/electron-userland/electron-builder/blob/v26.0.12/packages/app-builder-lib/templates/nsis/multiUser.nsh
- https://github.com/electron-userland/electron-builder/blob/v26.0.12/packages/app-builder-lib/templates/nsis/installer.nsi
````
<!-- DT-REPO-FILE-END F045 -->

<a id="file-f046"></a>
### F046 — `resources/design-preview.html`
**11218 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F046","path":"resources/design-preview.html","mode":"100644","encoding":"utf-8","bytes":11218,"lines":52,"sha256":"8d1fd4b70673b6fce88bf1a8de3f0e9be06a075984cf7ab848528716c660d014","git_blob_sha1":"b0a97c52814e065bf48aecc3be26f591593be1ab","fence":"````","final_lf":true} -->
````html
<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Drive Tambu - anteprima</title><link rel="stylesheet" href="../src/renderer/src/styles.css"><style>
.preview-caption{color:#b0a7c2;font-size:10px;letter-spacing:.3px;}
@media(min-width:1250px){.mount-card{padding:21px 21px 16px;}.stat-strip{margin-bottom:36px;}}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<symbol id="cloud" viewBox="0 0 24 24"><path d="M20 16.5a4.5 4.5 0 0 0-2.5-8.2 6.2 6.2 0 0 0-11.3 2A4 4 0 0 0 7 18h12a4 4 0 0 0 1-1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="folder" viewBox="0 0 24 24"><path d="M3 7.3a2 2 0 0 1 2-2h5l2.1 2.1H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="grid" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="activity" viewBox="0 0 24 24"><path d="M3 13h4l3-8 4 14 3-6h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></symbol>
<symbol id="settings" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="6" r="2.2" fill="white" stroke="currentColor" stroke-width="1.8"/><circle cx="16" cy="12" r="2.2" fill="white" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="18" r="2.2" fill="white" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="backup" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="4" y="15" width="16" height="5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 11.5l3 2 4-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="check" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6M4 6h5M15 18h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></symbol>
<symbol id="laptop" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2 20h20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></symbol>
<symbol id="shield" viewBox="0 0 24 24"><path d="M12 2l8 4v5c0 5-3 8-8 11-5-3-8-6-8-11V6l8-4zM8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="plus" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="arrow" viewBox="0 0 24 24"><path d="M8 16L16 8M8 8h8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="open" viewBox="0 0 24 24"><path d="M3 7h8l2 2h7v2M3 7v12h17l2-8H6L3 19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v6M12 7h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="chevron" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="unplug" viewBox="0 0 24 24"><path d="M8 3v5m8-5v5M5 9h14v4a7 7 0 0 1-14 0V9zm7 11v2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
</svg>
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand"><div class="brand-icon"><svg width="22" height="22"><use href="#cloud"/></svg></div><div class="brand-type"><strong>Drive Tambu</strong><span>PERSONAL CLOUD</span></div></div>
    <div class="sidebar-section-label">WORKSPACE</div>
    <nav class="sidebar-nav"><button class="nav-item selected"><svg width="18" height="18"><use href="#grid"/></svg><span>Le mie cartelle</span><span class="nav-counter">2</span></button><button class="nav-item"><svg width="18" height="18"><use href="#activity"/></svg><span>Attivita</span></button></nav>
    <div class="sidebar-section-label second-label">PREFERENZE</div><nav class="sidebar-nav"><button class="nav-item"><svg width="18" height="18"><use href="#settings"/></svg><span>Impostazioni</span></button></nav>
    <div class="sidebar-bottom"><div class="system-state"><span class="system-indicator system-good"></span><div><strong>Sistema pronto</strong><span>rclone rilevato</span></div><svg width="15" height="15"><use href="#chevron"/></svg></div><div class="sidebar-footer"><span>Drive Tambu</span><span>v0.1.0</span></div></div>
  </aside>
  <main class="main-view">
    <header class="topbar"><div class="breadcrumbs"><span>Workspace</span><svg width="15" height="15"><use href="#chevron"/></svg><strong>Le mie cartelle</strong></div><div class="topbar-actions"><div class="topbar-status"><span class="topbar-status-dot"></span> Anteprima visiva - dati di esempio</div><div class="avatar">DT</div></div></header>
    <div class="view-scroll"><div class="page-block">
      <section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="spark-dot"></span> SEMPLICE. TUO. OVUNQUE.</div><h1>Le tue cartelle<span class="hero-period">.</span></h1><p>Il tuo server, a portata di click. Tutto organizzato, sempre accessibile.</p></div><button class="button button-primary add-button"><svg width="18" height="18"><use href="#plus"/></svg> Nuova cartella</button></section>
      <section class="stat-strip"><div class="stat"><span class="stat-icon blue"><svg width="21" height="21"><use href="#folder"/></svg></span><div><strong>02</strong><span>Cartelle</span></div></div><div class="stat"><span class="stat-icon mint"><svg width="21" height="21"><use href="#check"/></svg></span><div><strong>01</strong><span>Collegate</span></div></div><div class="stat"><span class="stat-icon violet"><svg width="21" height="21"><use href="#backup"/></svg></span><div><strong>01</strong><span>Backup attivi</span></div></div></section>
      <div class="content-columns">
        <section class="files-column"><div class="section-toolbar"><div><h2>La tua libreria</h2><p>Gestisci cartelle, collegamenti e backup.</p></div><div class="search-field"><svg width="16" height="16"><use href="#search"/></svg><input placeholder="Cerca cartelle"></div></div>
          <div class="mount-list">
            <article class="mount-card"><div class="mount-top"><div class="mount-ident"><div class="folder-icon"><svg width="29" height="29"><use href="#folder"/></svg></div><div class="mount-text"><div class="mount-name-line"><h3>Documenti</h3><span class="status status-connected"><span class="status-dot"></span>Collegata</span></div><p>server:/srv/storage/documenti</p></div></div><button class="button button-ghost icon-button"><svg width="19" height="19"><use href="#more"/></svg></button></div><div class="location-row"><svg width="15" height="15"><use href="#laptop"/></svg><span>C:\Users\utente\Documenti\Drive Tambu\Documenti</span></div><div class="mount-bottom"><div class="mount-meta"><span class="meta-piece"><svg width="14" height="14"><use href="#backup"/></svg> Backup attivo</span><span class="meta-piece hide-small">Oggi 11:45</span></div><div class="mount-actions"><button class="button button-secondary"><svg width="15" height="15"><use href="#open"/></svg> Apri</button><button class="button button-secondary"><svg width="15" height="15"><use href="#unplug"/></svg> Scollega</button></div></div></article>
            <article class="mount-card"><div class="mount-top"><div class="mount-ident"><div class="folder-icon"><svg width="29" height="29"><use href="#folder"/></svg></div><div class="mount-text"><div class="mount-name-line"><h3>Progetti</h3><span class="status status-disconnected"><span class="status-dot"></span>Scollegata</span></div><p>server:/srv/storage/progetti</p></div></div><button class="button button-ghost icon-button"><svg width="19" height="19"><use href="#more"/></svg></button></div><div class="location-row"><svg width="15" height="15"><use href="#laptop"/></svg><span>C:\Users\utente\Documenti\Drive Tambu\Progetti</span></div><div class="mount-bottom"><div class="mount-meta"><span class="meta-piece muted"><svg width="14" height="14"><use href="#backup"/></svg> Backup disattivato</span></div><div class="mount-actions"><button class="button button-primary"><svg width="15" height="15"><use href="#arrow"/></svg> Collega</button></div></div></article>
          </div>
        </section>
        <aside class="insights-column"><div class="insight-card cloud-insight"><div class="insight-label"><span class="icon-badge"><svg width="18" height="18"><use href="#cloud"/></svg></span><span>IL TUO SPAZIO</span></div><div class="cloud-illustration"><div class="cloud-shape c1"></div><div class="cloud-shape c2"></div><div class="illustration-folder"><svg width="49" height="49"><use href="#folder"/></svg></div></div><h3>I tuoi file. Sempre dove servono.</h3><p>Lavora direttamente sui file del server, senza sincronizzare l'intero archivio sul computer.</p><div class="insight-bottom"><svg width="15" height="15"><use href="#shield"/></svg> Connessione protetta via SSH</div></div>
          <div class="insight-card backup-insight"><div class="insight-label"><span class="icon-badge purple"><svg width="18" height="18"><use href="#backup"/></svg></span><span>BACKUP LOCALI</span></div><h3>Un pensiero in meno.</h3><p>Conserva copie e versioni precedenti in una cartella separata.</p><div class="side-stat"><span>Cartelle protette</span><strong>1 <span>/ 2</span></strong></div><div class="progress-track"><div style="width:50%"></div></div></div>
          <button class="help-card"><svg width="17" height="17"><use href="#info"/></svg><span>Configura rclone e verifica le dipendenze</span><svg width="16" height="16"><use href="#chevron"/></svg></button>
        </aside>
      </div>
      </div><footer class="main-footer"><svg width="14" height="14"><use href="#shield"/></svg> Progettato per il tuo cloud, non per raccogliere i tuoi dati.<span>Windows + Linux</span></footer>
    </div>
  </main>
</div></body></html>
````
<!-- DT-REPO-FILE-END F046 -->

<a id="file-f047"></a>
### F047 — `tests/backups.test.cjs`
**6329 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F047","path":"tests/backups.test.cjs","mode":"100644","encoding":"utf-8","bytes":6329,"lines":87,"sha256":"38111f83d4020a0b736778493f8ad7bbd127bbe31cc762164ed5c78ca6682253","git_blob_sha1":"cfbe6cf78e0bc0e99aef9fe72c858cf5ba6ae8e7","fence":"````","final_lf":true} -->
````javascript
const {test,after} = require('node:test')
const assert=require('node:assert/strict'),Module=require('node:module'),fs=require('node:fs'),os=require('node:os'),path=require('node:path')
const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream')
const root=fs.mkdtempSync(path.join(os.tmpdir(),'dt-backups-'));let currentRoot=root, syncs=[],preflightEmpty=false
const oldLoad=Module._load
Module._load=function(id,...args){
 if(id==='electron')return {app:{getPath:()=>currentRoot}}
 if(id==='node:child_process')return {spawn:(_exe,args)=>{
  const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.exitCode=null
  child.kill=()=>{if(child.exitCode===null){child.exitCode=1;child.emit('close',1)};return true}
  if(args[0]==='lsf')setImmediate(()=>{child.stdout.write(preflightEmpty?'':'file.txt\n');child.exitCode=0;child.emit('close',0)})
  else if(args[0]==='sync')syncs.push({child,args})
  return child
 }}
 return oldLoad.call(this,id,...args)
}
const diagnostics=require('../src/main/diagnostics.ts');diagnostics.stopChild=c=>c.kill()
const {ConfigStore}=require('../src/main/store.ts'),{BackupManager}=require('../src/main/backups.ts')
Module._load=oldLoad
let counter=0
function fixture(){
 syncs=[];preflightEmpty=false;currentRoot=path.join(root,String(++counter))
 const store=new ConfigStore();const m={id:'mount-backup',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(currentRoot,'mount'),autoConnect:false,backup:{enabled:true,intervalMinutes:17,destination:path.join(currentRoot,'backup'),retentionDays:30}}
 store.saveMount(m);const manager=new BackupManager(store,()=>{},()=>{})
 return {store,manager,m}
}
const flush=()=>new Promise(r=>setImmediate(r))
async function waitForSync(){const deadline=Date.now()+5000;while(!syncs.length&&Date.now()<deadline)await new Promise(r=>setTimeout(r,2));assert.equal(syncs.length,1,'Expected a sync process after source preflight')}
function finish(code=0){const c=syncs.at(-1).child;c.exitCode=code;c.emit('close',code)}
after(()=>fs.rmSync(root,{recursive:true,force:true}))

test('backup emits genuine progress from JSON stats and never completes before process success',async()=>{
 const {store,manager,m}=fixture();const pending=manager.run(m.id);await waitForSync()
 try{
  assert.equal(syncs.length,1)
  const {args,child}=syncs[0]
  assert.ok(args.includes('--use-json-log'))
  assert.equal(args[args.indexOf('--stats-log-level')+1],'NOTICE')
  assert.ok(store.find(m.id).lastBackupAttemptAt)
  const line=JSON.stringify({level:'notice',stats:{bytes:420,totalBytes:1000,speed:10,checks:12}})+'\n'
  child.stderr.write(line.slice(0,16));child.stderr.write(line.slice(16));await flush()
  assert.equal(manager.state(m.id).progress.percent,42)
  child.stderr.write(JSON.stringify({stats:{bytes:1000,totalBytes:1000}})+'\n');await flush()
  assert.equal(manager.state(m.id).status,'running');assert.equal(manager.state(m.id).progress.percent,99)
  finish();await pending
  assert.equal(manager.state(m.id).progress.percent,100);assert.equal(manager.state(m.id).status,'idle')
  assert.ok(Date.parse(store.find(m.id).nextBackupAt)>=Date.parse(store.find(m.id).lastBackupAt)+17*60000)
 }finally{if(syncs.at(-1)?.child.exitCode===null)finish();await pending.catch(()=>{});manager.stop()}
})
test('a failed sync after reporting 100 percent is an error, never a completed backup',async()=>{
 const {store,manager,m}=fixture();const pending=manager.run(m.id);const caught=pending.catch(e=>e);await waitForSync()
 const child=syncs[0].child;child.stderr.write(JSON.stringify({stats:{bytes:10,totalBytes:10}})+'\n'+JSON.stringify({level:'error',msg:'Permission denied'})+'\n');finish(1)
 const error=await caught;assert.ok(error instanceof Error);assert.equal(manager.state(m.id).status,'error');assert.ok(!store.find(m.id).lastBackupAt);manager.stop()
})
test('simultaneous requests run at most one backup process',async()=>{
 const {manager,m}=fixture();const first=manager.run(m.id)
 await assert.rejects(manager.run(m.id),/gia in corso/);await waitForSync();assert.equal(syncs.length,1);finish();await first;manager.stop()
})
test('empty source protection still blocks mirroring over an existing local backup',async()=>{
 const {manager,m}=fixture();preflightEmpty=true
 fs.mkdirSync(path.join(m.backup.destination,'corrente'),{recursive:true});fs.writeFileSync(path.join(m.backup.destination,'corrente','safe'),'original')
 await assert.rejects(manager.run(m.id),/vuota/)
 assert.equal(syncs.length,0);assert.equal(fs.readFileSync(path.join(m.backup.destination,'corrente','safe'),'utf8'),'original');manager.stop()
})
test('overdue calendar backup is recovered once and its next date survives restart',async()=>{
 const {m}=fixture();m.backup.schedule={mode:'weekly',weekdays:[0],time:'02:00'};m.backup.intervalMinutes=0
 const file=path.join(currentRoot,'config.json');const data=JSON.parse(fs.readFileSync(file));data.mounts=[{...m,nextBackupAt:'2001-01-01T00:00:00.000Z',backupTimeZone:Intl.DateTimeFormat().resolvedOptions().timeZone}];fs.writeFileSync(file,JSON.stringify(data))
 const store=new ConfigStore(),manager=new BackupManager(store,()=>{},()=>{})
 const tick=manager.checkSchedule();await waitForSync();assert.equal(syncs.length,1);finish();await tick
 const next=store.find(m.id).nextBackupAt;assert.ok(Date.parse(next)>Date.now())
 await manager.checkSchedule();assert.equal(syncs.length,1)
 assert.equal(new ConfigStore().find(m.id).nextBackupAt,next);manager.stop()
})
test('operation pause blocks new backups and scheduling, then resume allows a run',async()=>{
 const {manager,m}=fixture();manager.pauseScheduling()
 await assert.rejects(manager.run(m.id),/operazione/i)
 await manager.checkSchedule();assert.equal(syncs.length,0)
 manager.resumeScheduling();const p=manager.run(m.id);await waitForSync();finish();await p;manager.stop()
})
test('operation pause preserves a running backup and stop refuses to interrupt it',async()=>{
 const {manager,m}=fixture();const p=manager.run(m.id);await waitForSync()
 try{
  manager.pauseScheduling();assert.equal(manager.state(m.id).status,'running')
  assert.throws(()=>manager.stop(),/completamento/i)
  assert.equal(syncs[0].child.exitCode,null)
 }finally{finish();await p;manager.resumeScheduling();manager.stop()}
})
````
<!-- DT-REPO-FILE-END F047 -->

<a id="file-f048"></a>
### F048 — `tests/browser.test.cjs`
**3170 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F048","path":"tests/browser.test.cjs","mode":"100644","encoding":"utf-8","bytes":3170,"lines":59,"sha256":"dd381e0f42e00f90068ef65b3a8ad8b8e44209bd92790400777335af8e6aa27b","git_blob_sha1":"7e71ca4c754f1f1bc165c091d85049fadf1b2d10","fence":"````","final_lf":true} -->
````javascript
const {test, after} = require('node:test')
const assert = require('node:assert/strict')
const cp = require('node:child_process')
const {EventEmitter} = require('node:events')
const {PassThrough} = require('node:stream')
const original = cp.spawn
let response = '[]', args, spawns = 0
// The OS process boundary is simulated; directory parsing, validation and navigation are real.
cp.spawn = (_exe, argv) => {
  spawns++; args = argv
  const child = new EventEmitter()
  child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.exitCode = null
  queueMicrotask(() => {child.stdout.write(response); child.exitCode = 0; child.emit('close', 0)})
  return child
}
after(() => {cp.spawn = original})
const {listRemoteDirectories, checkRemoteDirectory} = require('../src/main/diagnostics.ts')
const {selectedRemote} = require('../src/shared/paths.ts')
test('directory browser strips a pasted prefix once and only lists directories', async () => {
  response = JSON.stringify([{Name:'anno10',IsDir:true},{Name:'file.txt',IsDir:false},{Name:'anno2',IsDir:true}])
  const result = await listRemoteDirectories('rclone','casa','casa:/documenti')
  assert.equal(args[0], 'lsjson'); assert.equal(args[1], 'casa:/documenti')
  assert.ok(args.includes('--dirs-only')); assert.ok(!args.includes('--recursive'))
  assert.deepEqual(result.entries, [{name:'anno2',path:'/documenti/anno2'},{name:'anno10',path:'/documenti/anno10'}])
  assert.equal(result.parent, '/')
})
test('browsing home stays home-relative instead of switching to the server root', async () => {
  response = '[{"Name":"Documenti","IsDir":true}]'
  const result = await listRemoteDirectories('rclone','casa','')
  assert.equal(args[1], 'casa:'); assert.equal(result.parent,null)
  assert.equal(result.entries[0].path,'Documenti')
})
test('an empty directory is selectable and is not treated as a connection failure', async () => {
  response = '[]'
  const result = await listRemoteDirectories('rclone','casa','/vuota')
  assert.equal(result.path,'/vuota'); assert.deepEqual(result.entries,[])
})
test('invalid server output produces a clear error', async () => {
  response = 'not json'
  await assert.rejects(listRemoteDirectories('rclone','casa','/'), /elenco non valido/)
})
test('a browse cancelled before starting never launches a process', async () => {
  const controller = new AbortController(); controller.abort()
  const before = spawns
  await assert.rejects(listRemoteDirectories('rclone','casa','/',controller.signal), /annullata/)
  assert.equal(spawns,before)
})
test('preflight rejects files without pretending they are directories', async () => {
  response = '{"IsDir":false}'
  await assert.rejects(checkRemoteDirectory('rclone','casa','/file.txt'), /non e una cartella/)
  assert.ok(args.includes('--stat'))
})
test('only an existing sole or preferred server is selected automatically', () => {
  assert.equal(selectedRemote(['casa']), 'casa')
  assert.equal(selectedRemote([]), '')
  assert.equal(selectedRemote(['casa','ufficio']), '')
  assert.equal(selectedRemote(['casa','ufficio'],'ufficio'), 'ufficio')
  assert.equal(selectedRemote(['casa','ufficio'],'inesistente'), '')
})
````
<!-- DT-REPO-FILE-END F048 -->

<a id="file-f049"></a>
### F049 — `tests/control.test.cjs`
**1678 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F049","path":"tests/control.test.cjs","mode":"100644","encoding":"utf-8","bytes":1678,"lines":20,"sha256":"b9e47b85580d684250b0f9c9a4cd7d2c5d23fdafdf6aa4879b6e1359509c1bb2","git_blob_sha1":"c3540b9f82485285ba4d034b81fea7764afce023","fence":"````","final_lf":true} -->
````javascript
const {test}=require('node:test');const assert=require('node:assert/strict');const http=require('node:http')
let ControlClient
try {({ControlClient}=require('../src/main/control.ts'))}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}
async function serve(t,handler){const s=http.createServer(handler);await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>{s.closeAllConnections();s.close()});return s.address().port}
test('control talks only to loopback with session authentication and JSON',async t=>{
 const port=await serve(t,(q,s)=>{assert.equal(q.headers.authorization,'Basic '+Buffer.from('drive-tambu:secret').toString('base64'));assert.equal(q.url,'/core/pid');s.end('{"pid":42}')})
 assert.equal(typeof ControlClient,'function');assert.deepEqual(await new ControlClient(port,'secret').call('core/pid'),{pid:42})
})
test('HTTP errors do not leak response bodies or session credentials',async t=>{
 const port=await serve(t,(_,s)=>{s.statusCode=500;s.end('sensitive-path secret')})
 await assert.rejects(new ControlClient(port,'secret').call('vfs/stats'),e=>{assert.doesNotMatch(e.message,/secret|sensitive/);return true})
})
test('malformed responses and hanging services fail rather than returning empty stats',async t=>{
 const port=await serve(t,(q,s)=>{if(q.url==='/core/pid')s.end('not json')})
 const c=new ControlClient(port,'secret');await assert.rejects(c.call('core/pid'),/risposta/i);await assert.rejects(c.call('vfs/stats',{},40),/tempo/i)
})
test('refuses arbitrary RC commands and invalid ports',async()=>{
 assert.throws(()=>new ControlClient(0,'secret'))
 await assert.rejects(new ControlClient(45678,'secret').call('config/dump'),/consentito/i)
})
````
<!-- DT-REPO-FILE-END F049 -->

<a id="file-f050"></a>
### F050 — `tests/guarded-app.test.cjs`
**8629 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F050","path":"tests/guarded-app.test.cjs","mode":"100644","encoding":"utf-8","bytes":8629,"lines":81,"sha256":"8919689b0304c3536073f72fd332144bd307fe1c57f641250da504a3e74dd2cb","git_blob_sha1":"4460871f6f8582a6176cca1c555dd39b3407a5cf","fence":"````","final_lf":true} -->
````javascript
const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), Module = require('node:module')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-guard-'))
after(() => fs.rmSync(tmp, { recursive: true, force: true }))
const handlers = new Map(), windows = [], opened = []; let status='connected', checkKind='confirm', disconnected=0, connected=0, runningBackup=false, paused=false, failConnect=false, exits=0
const shortcutFile = path.join(tmp, process.platform === 'win32' ? 'Files.lnk' : 'Files.desktop')
fs.writeFileSync(path.join(tmp, 'config.json'), JSON.stringify({schemaVersion:1,settings:{rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'system',defaultRemote:'casa',startAtLogin:false,closeToTray:true,directoryRefreshSeconds:120},mounts:[{id:'shortcut-123',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(tmp,'linked'),autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}]}))
class Window extends EventEmitter {
  constructor(options) { super(); this.options = options; this.bounds = { x: 0, y: 0, width: options.width, height: options.height }; this.visible = false;
    this.webContents = new EventEmitter(); this.webContents.mainFrame = {}; this.webContents.send = () => {}; this.webContents.setWindowOpenHandler = () => {}; windows.push(this) }
  isDestroyed() { return false } isVisible() { return this.visible } isFocused() { return false } isMinimized() { return false } isMaximized() { return false }
  show() { this.visible = true } hide() { this.visible = false } focus() {} restore() {} unmaximize() {} minimize() {} close() { this.emit('close', {preventDefault() {}}) }
  setBounds(b) { this.bounds = b } getBounds() { return this.bounds } setMinimumSize() {} setResizable(b) { this.resizable = b }
  setAlwaysOnTop() {} setSkipTaskbar(b) { this.skipTaskbar = b } setBackgroundColor(color) { this.background = color }
  async loadFile() { this.emit('ready-to-show') } async loadURL() { this.emit('ready-to-show') }
}
const theme = new EventEmitter(); let source = 'system'
Object.defineProperty(theme, 'themeSource', { get: () => source, set: v => { source = v; theme.shouldUseDarkColors = v === 'dark'; theme.emit('updated') } })
theme.shouldUseDarkColors = false
const app = new EventEmitter()
Object.assign(app, {whenReady: () => Promise.resolve(), requestSingleInstanceLock: () => true, getVersion: () => '0.2.0', getPath: () => tmp, getAppPath: () => path.resolve(__dirname, '..'), quit: () => { let blocked=false; app.emit('before-quit',{preventDefault(){blocked=true}}); if(!blocked)exits++ }, isPackaged: false})
const screen = new EventEmitter(); Object.assign(screen, {getDisplayNearestPoint: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getDisplayMatching: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getCursorScreenPoint: () => ({x: 500, y: 500}), getPrimaryDisplay: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}})})
class Tray extends EventEmitter { setToolTip() {} setContextMenu() {} getBounds() { return {x: 1850, y: 1040, width: 20, height: 20} } }
const electron = { app, BrowserWindow: Window, screen, nativeTheme: theme, Tray,
  dialog: { showErrorBox: (_title, msg) => { throw new Error(msg) }, showMessageBox: async () => ({response: 0}), showSaveDialog: async () => ({canceled:false,filePath:shortcutFile}) },
  ipcMain: {handle: (name, fn) => handlers.set(name, fn)},
  nativeImage: {createFromPath: () => ({resize: () => ({})})}, Menu: {buildFromTemplate: v => v, setApplicationMenu: () => {}}, shell: {openPath: async p => {opened.push(p);return ''},writeShortcutLink:(dest,_operation,options)=>{fs.writeFileSync(dest,JSON.stringify(options));return true}} }
const original = Module._load
Module._load = function(id, ...args) {
  if (id === 'electron') return electron
  if (id === './backups') return {BackupManager: class {startScheduler(){} pauseScheduling(){paused=true} resumeScheduling(){paused=false} state(){return {status:runningBackup?'running':'idle',detail:''}} stop(){assert.equal(runningBackup,false)} }}
  if (id === './mounts') return {checkMountDestination: p=>{if(fs.existsSync(p))throw new Error('occupata')}, MountManager: class {
    state(){return {status,detail:''}} hasRuntime(){return status==='connected'} needsRefreshReconnect(){return false}
    async preflight(){return {kind:checkKind,message:checkKind==='confirm'?'Nessun trasferimento.':'Operazione bloccata.'}}
    async disconnect(){if(checkKind!=='confirm')throw new Error('blocked');disconnected++;status='disconnected'}
    async connect(){connected++;if(failConnect){failConnect=false;throw new Error('prova collegamento fallito')}status='connected'}
    cleanupOwnedDirectory(){} async disconnectAll(){disconnected++;status='disconnected'}
  }}
  return original.call(this, id, ...args)
}
require('../src/main/index.ts')
Module._load = original
const ready = () => new Promise(resolve => setImmediate(resolve))
function event() { return {sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame} }
const snapshot=()=>handlers.get('drive:snapshot')(event())
async function reply(value){const op=snapshot().operation;assert.ok(op);await handlers.get('drive:respondToOperation')(event(),op.id,value);await ready()}
test('disconnection is shown in-app and does not happen before confirmation',async()=>{
 await ready();const start=disconnected;const p=handlers.get('drive:disconnect')(event(),'shortcut-123');await ready()
 assert.equal(snapshot().operation.phase,'confirm');assert.equal(disconnected,start);assert.equal(paused,true)
 await reply('confirm');await p;assert.equal(disconnected,start+1);assert.equal(paused,false);status='connected'
})
test('unknown telemetry blocks removal without changing saved folder',async()=>{
 checkKind='unknown';const p=handlers.get('drive:deleteMount')(event(),'shortcut-123');await ready()
 assert.equal(snapshot().operation.phase,'blocked');await reply('confirm');assert.equal(snapshot().mounts.length,1)
 await reply('cancel');await p;checkKind='confirm'
})
test('active backup prevents exit and all incompatible new app operations',async()=>{
 runningBackup=true;app.quit();await ready();assert.equal(snapshot().operation.phase,'blocked');assert.equal(exits,0)
 await assert.rejects(handlers.get('drive:connect')(event(),'shortcut-123'),/operazione/i)
 await reply('background');runningBackup=false;assert.equal(paused,false)
})
test('local path may change with confirmation and same identity, reconnecting if active',async()=>{
 status='connected';const before=snapshot().mounts[0];const target=path.join(tmp,'new-place')
 const p=handlers.get('drive:saveMount')(event(),{...before,localPath:target});await ready()
 assert.equal(snapshot().operation.kind,'move');assert.equal(snapshot().mounts[0].localPath,before.localPath)
 await reply('confirm');assert.equal(await p,true);assert.equal(snapshot().mounts[0].localPath,target);assert.equal(snapshot().mounts[0].id,before.id);assert.equal(status,'connected')
})
test('cancelling relocation keeps the previous path and never disconnects',async()=>{
 const before=snapshot().mounts[0],n=disconnected;const p=handlers.get('drive:saveMount')(event(),{...before,localPath:path.join(tmp,'cancelled')});await ready();await reply('cancel');assert.equal(await p,false);assert.equal(snapshot().mounts[0].localPath,before.localPath);assert.equal(disconnected,n)
})
test('failed new connection restores old config and attempts old connection',async()=>{
 const before=snapshot().mounts[0];failConnect=true;const p=handlers.get('drive:saveMount')(event(),{...before,localPath:path.join(tmp,'failure')});await ready();await reply('confirm');assert.equal(snapshot().mounts[0].localPath,before.localPath);assert.equal(status,'connected');assert.equal(snapshot().operation.phase,'blocked');await reply('cancel');await p
})
test('local path change leaves an initially disconnected folder disconnected',async()=>{
 status='disconnected';const before=snapshot().mounts[0],n=connected;const p=handlers.get('drive:saveMount')(event(),{...before,localPath:path.join(tmp,'offline-place')});await ready();await reply('confirm');await p;assert.equal(status,'disconnected');assert.equal(connected,n)
})
test('no connected folders or jobs allows immediate quit without a warning',async()=>{
 status='disconnected';const before=exits;app.quit();await ready();assert.equal(exits,before+1);assert.equal(snapshot().operation,null)
})
````
<!-- DT-REPO-FILE-END F050 -->

<a id="file-f051"></a>
### F051 — `tests/helpers/ui.cjs`
**2919 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F051","path":"tests/helpers/ui.cjs","mode":"100644","encoding":"utf-8","bytes":2919,"lines":27,"sha256":"8a2b34f7f705b2880a740b1e4e9a4a03fe5ff61dd5b35ed9a2f1f294a77faeec","git_blob_sha1":"fc1f4641e3fd9716c313d17a12f993fb98d46438","fence":"````","final_lf":true} -->
````javascript
// Execute real component handlers while replacing only React/JSX and native APIs.
// This does not emulate React rendering effects or a real Electron window.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict')
let active
const react={
 useState(initial){const state=active,i=state.cursor++;if(!(i in state.slots))state.slots[i]=typeof initial==='function'?initial():initial;return [state.slots[i],v=>{state.slots[i]=typeof v==='function'?v(state.slots[i]):v}]},
 useRef(value){const state=active,i=state.cursor++;if(!(i in state.slots))state.slots[i]={current:value};return state.slots[i]},
 useEffect(){active.cursor++},useCallback(fn){active.cursor++;return fn},useMemo(fn){active.cursor++;return fn()}
}
const jsx={jsx:(type,props)=>({type,props:props||{}}),jsxs:(type,props)=>({type,props:props||{}}),Fragment:'fragment'}
const filename=path.resolve(__dirname,'../../src/renderer/src/App.tsx'),m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename))
const old=Module._load
try{
 Module._load=function(id,...args){if(id==='react')return react;if(id==='react/jsx-runtime')return jsx;if(id==='lucide-react')return new Proxy({},{get:(_t,key)=>props=>({type:'svg',props:{...props,'data-icon':key}})});return old.call(this,id,...args)}
 const out=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}})
 m._compile(out.outputText+'\nexports.testComponents={MountModal,MountCard,SettingsPage,OperationDialog:typeof OperationDialog===\'function\'?OperationDialog:null,ScheduleFields:typeof ScheduleFields===\'function\'?ScheduleFields:null};',filename)
}finally{Module._load=old}
function expand(n){if(n==null||typeof n==='boolean')return [];if(Array.isArray(n))return n.flatMap(expand);if(typeof n!=='object')return [n];if(typeof n.type==='function')return expand(n.type(n.props));return [{...n,children:expand(n.props.children)}]}
const flat=nodes=>nodes.flatMap(n=>typeof n==='object'?[n,...flat(n.children||[])]:[n])
const text=nodes=>flat(nodes).filter(n=>typeof n==='string'||typeof n==='number').join(' ').trim()
function renderComponent(name,props){
 const component=m.exports.testComponents[name];assert.equal(typeof component,'function',`${name} is implemented`)
 const state={slots:[],cursor:0};const render=()=>{active=state;state.cursor=0;return expand(component(props))}
 const find=predicate=>{const value=flat(render()).find(predicate);assert.ok(value,'Expected control exists');return value}
 return {render,find,props,byLabel:label=>find(n=>n.props?.['aria-label']===label),button:label=>find(n=>n.type==='button'&&(n.props['aria-label']===label||text(n.children)===label))}
}
module.exports={renderComponent,text,flat}
````
<!-- DT-REPO-FILE-END F051 -->

<a id="file-f052"></a>
### F052 — `tests/installer.test.cjs`
**2087 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F052","path":"tests/installer.test.cjs","mode":"100644","encoding":"utf-8","bytes":2087,"lines":15,"sha256":"d0ec319c0528734f26bb8a87b2b31b74523ad2f28c7daa7ddd08384f36dc2ab9","git_blob_sha1":"d9135582cf0dbd05effd0a70821dbd9946941059","fence":"````","final_lf":true} -->
````javascript
// Compile is checked by electron-builder in Windows CI; these assert the deletion/exit policy.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const root=path.resolve(__dirname,'..');const script=()=>fs.existsSync(path.join(root,'build/installer.nsh'))?fs.readFileSync(path.join(root,'build/installer.nsh'),'utf8'):''
test('NSIS customization is wired to the existing assisted installer',()=>{const p=require('../package.json');assert.equal(p.build.nsis.include,'build/installer.nsh');assert.equal(p.build.nsis.oneClick,false);assert.notEqual(p.build.nsis.deleteAppDataOnUninstall,true)})
test('uninstaller offers an unchecked reset option only outside silent updates',()=>{const s=script();assert.match(s,/NSD_CreateCheckbox/);assert.match(s,/NSD_Uncheck/);assert.match(s,/\$\{Silent\}/);assert.match(s,/\$\{isUpdated\}/);assert.match(s,/Elimina anche le impostazioni/);assert.match(s,/HKCU.*INSTALL_REGISTRY_KEY/s)})
test('installer asks app to quit and never invokes built-in force-stop fallback',()=>{const s=script();assert.match(s,/!macro customCheckAppRunning/);assert.match(s,/--request-exit/);assert.doesNotMatch(s,/taskkill|KillProcess|_CHECK_APP_RUNNING/);assert.match(s,/SetErrorLevel 2/);assert.match(s,/FindProcess/)})
test('reset deletes only configuration file allowlist, never directories or cache',()=>{const s=script();assert.match(s,/config\.json\.before-0\.3\.bak/);assert.doesNotMatch(s,/RMDir|Delete\s+[^\n]*\*/i);assert.match(s,/--delete-app-data/);assert.match(s,/REPARSE_POINT/);assert.doesNotMatch(s,/Delete\s+[^\n]*(rclone|known_hosts|cache)/i)})
test('current-user eligibility matches the stock NSIS CurrentUser installMode',()=>{
 assert.match(script(),/\$installMode == "CurrentUser"/)
})
test('custom page functions expand after the stock MUI interface is declared',()=>{
 const s=script();const header=s.indexOf('!macro customHeader');assert.ok(header>=0)
 assert.ok(s.indexOf('Function un.DriveSettingsPage')>header)
 assert.ok(s.indexOf('!insertmacro MUI_HEADER_TEXT')>header)
})
````
<!-- DT-REPO-FILE-END F052 -->

<a id="file-f053"></a>
### F053 — `tests/layout.test.cjs`
**835 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F053","path":"tests/layout.test.cjs","mode":"100644","encoding":"utf-8","bytes":835,"lines":18,"sha256":"0f823754eb8649abfc88bbf9b5698abedf8566bd7cd49acc8cf806e15dafa942","git_blob_sha1":"c452e599d18ea5ba47b865dc2923328554b93f6a","fence":"````","final_lf":true} -->
````javascript
const { test } = require('node:test')
const assert = require('node:assert/strict')
test('compact panel stays above the taskbar within a monitor work area', () => {
  const { layoutBounds } = require('../src/main/window-layout.ts')
  const b = layoutBounds('compact', { x: 0, y: 0, width: 1920, height: 1040 })
  assert.equal(b.width, 430)
  assert.equal(b.x + b.width, 1904)
  assert.equal(b.y + b.height, 1024)
})
test('layout supports small monitors and negative monitor coordinates', () => {
  const { layoutBounds } = require('../src/main/window-layout.ts')
  for (const mode of ['compact', 'expanded']) {
    const a = { x: -800, y: -100, width: 800, height: 500 }
    const b = layoutBounds(mode, a)
    assert.ok(b.x >= a.x && b.y >= a.y)
    assert.ok(b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height)
  }
})
````
<!-- DT-REPO-FILE-END F053 -->

<a id="file-f054"></a>
### F054 — `tests/mounts.test.cjs`
**6467 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F054","path":"tests/mounts.test.cjs","mode":"100644","encoding":"utf-8","bytes":6467,"lines":54,"sha256":"f922fd1701f2becc9645f1a35989935cda2ae39ebf96cd971423425d82b7f386","git_blob_sha1":"13129284d76231fdb33ec9c0960f99197d7b7f8a","fence":"````","final_lf":true} -->
````javascript
const {test,after}=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module')
const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream')
const fs=require('node:fs'),os=require('node:os'),path=require('node:path')
const root=fs.mkdtempSync(path.join(os.tmpdir(),'drive-mounts-'));after(()=>fs.rmSync(root,{recursive:true,force:true}))
let commands=[],rcCalls=[],rejectRemote=false,killCount=0,processes=[],ready=new Set(),pending=0,rcFails=false,unmountFails=false,pidCounter=100
const original=Module._load
const disk=()=>({diskCache:{uploadsQueued:pending,uploadsInProgress:0,erroredFiles:0,outOfSpace:false}})
Module._load=function(id,...rest){
 if(id==='electron')return {app:{getPath:()=>root}}
 if(id==='node:fs')return {...fs,existsSync:p=>ready.has(p)||fs.existsSync(p),readFileSync:(p,...a)=>p==='/proc/self/mountinfo'?[...ready].map(p=>`1 2 0:1 / ${p} rw - fuse.rclone remote rw`).join('\n'):fs.readFileSync(p,...a)}
 if(id==='node:child_process')return {spawn:(_exe,args)=>{
  commands.push(args);const c=new EventEmitter();c.pid=++pidCounter;c.stdout=new PassThrough();c.stderr=new PassThrough();c.exitCode=null;c.signalCode=null
  c.kill=()=>{killCount++;c.exitCode=1;c.emit('close',1);return true};processes.push(c)
  if(args[0]==='lsjson')setTimeout(()=>{if(rejectRemote)c.stderr.write('directory not found');else c.stdout.write('{"IsDir":true}');c.exitCode=rejectRemote?1:0;c.emit('close',c.exitCode)},5)
  return c
 }}
 if(id==='./control')return {createControl:async()=>({secret:'test-session-secret',env:{RCLONE_RC_USER:'drive-tambu',RCLONE_RC_PASS:'test-session-secret'},client:{port:12345,call:async(method,params={})=>{
  rcCalls.push({method,params});if(rcFails)throw new Error('offline')
  const child=processes.findLast(c=>c.exitCode===null)
  if(method==='core/pid')return {pid:child.pid}
  if(method==='mount/types')return {mountTypes:['mount','cmount']}
  if(method==='mount/mount'){ready.add(params.mountPoint);return {mountPoint:params.mountPoint}}
  if(method==='mount/listmounts')return {mountPoints:[...ready].map(p=>({MountPoint:p}))}
  if(method==='mount/unmount'){if(unmountFails)throw new Error('busy');ready.delete(params.mountPoint);return {}}
  if(method==='vfs/stats')return disk()
  if(method==='vfs/queue')return {queue:pending?[{id:1}]:[]}
  if(method==='core/stats')return {bytes:0,checks:0,errors:0,transfers:0}
  if(method==='core/quit'){child.exitCode=0;child.emit('close',0);return {}}
  throw new Error(method)
 }}})}
 return original.call(this,id,...rest)
}
const {MountManager}=require('../src/main/mounts.ts');Module._load=original
function setup(){commands=[];rcCalls=[];ready.clear();rejectRemote=false;rcFails=false;unmountFails=false;pending=0;killCount=0;processes=[]
 const m={id:'folder-123',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(root,crypto.randomUUID()),autoConnect:false,backup:{enabled:false,destination:'',intervalMinutes:0,retentionDays:30}}
 const settings={rcloneExecutable:'fixture',cacheMaxSize:'5G',directoryRefreshSeconds:120}
 const manager=new MountManager({find:()=>m,mounts:[m],get settings(){return settings}},()=>{},()=>{})
 return {manager,m,settings}
}
test('remote access is checked before starting a mount daemon',async()=>{const {manager,m}=setup();rejectRemote=true;await assert.rejects(manager.connect(m.id));assert.equal(commands.some(a=>a[0]==='rcd'),false)})
test('concurrent connect starts one official daemon and one RC mount',async()=>{const {manager,m}=setup();await Promise.all([manager.connect(m.id),manager.connect(m.id)]);assert.equal(commands.filter(a=>a[0]==='rcd').length,1);assert.equal(rcCalls.filter(c=>c.method==='mount/mount').length,1);await manager.disconnect(m.id)})
test('cancelling a read-only precheck does not start a mount',async()=>{const {manager,m}=setup();const p=manager.connect(m.id);await manager.disconnect(m.id);await p;assert.equal(commands.some(a=>a[0]==='rcd'),false)})
test('stock mount preserves full cache, 20-minute expiry and refresh override',async()=>{const {manager,m,settings}=setup();m.directoryRefreshSeconds=17;await manager.connect(m.id);const p=rcCalls.find(c=>c.method==='mount/mount').params;assert.equal(p.vfsOpt.CacheMode,3);assert.equal(p.vfsOpt.CacheMaxAge,1200e9);assert.equal(p.vfsOpt.CachePollInterval,60e9);assert.equal(p.vfsOpt.DirCacheTime,17e9);settings.directoryRefreshSeconds=600;assert.equal(manager.needsRefreshReconnect(m.id),false);m.directoryRefreshSeconds=null;assert.equal(manager.needsRefreshReconnect(m.id),true);await manager.disconnect(m.id)})
test('pending uploads prevent unmount and never call a process killer',async()=>{const {manager,m}=setup();await manager.connect(m.id);pending=1;assert.equal((await manager.preflight(m.id)).kind,'blocked');await assert.rejects(manager.disconnect(m.id));assert.equal(rcCalls.some(c=>c.method==='mount/unmount'),false);assert.equal(killCount,0);pending=0;await manager.disconnect(m.id)})
test('unreachable control blocks disconnection without kill fallback',async()=>{const {manager,m}=setup();await manager.connect(m.id);rcFails=true;assert.equal((await manager.preflight(m.id)).kind,'unknown');await assert.rejects(manager.disconnect(m.id));assert.equal(killCount,0);rcFails=false;await manager.disconnect(m.id)})
test('busy unmount never calls core quit and remains retryable',async()=>{const {manager,m}=setup();await manager.connect(m.id);unmountFails=true;await assert.rejects(manager.disconnect(m.id));assert.equal(killCount,0);assert.equal(rcCalls.some(c=>c.method==='core/quit'),false);unmountFails=false;await manager.disconnect(m.id)})
test('normal disconnection requests unmount, verifies absence and quits owned daemon',async()=>{const {manager,m}=setup();await manager.connect(m.id);await manager.disconnect(m.id);assert.equal(manager.state(m.id).status,'disconnected');const methods=rcCalls.map(x=>x.method);assert.ok(methods.indexOf('core/quit')>methods.indexOf('mount/unmount'));assert.equal(killCount,0)})
test('an app-created empty Linux mount directory remains owned after reconnect',async t=>{
 if(process.platform!=='linux'){t.skip('Linux-only empty-container ownership');return}
 const {manager,m}=setup();await manager.connect(m.id);await manager.disconnect(m.id)
 assert.equal(fs.existsSync(m.localPath),true)
 await manager.connect(m.id);await manager.disconnect(m.id);manager.cleanupOwnedDirectory(m.id)
 assert.equal(fs.existsSync(m.localPath),false)
})
````
<!-- DT-REPO-FILE-END F054 -->

<a id="file-f055"></a>
### F055 — `tests/native-helpers.test.cjs`
**9651 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F055","path":"tests/native-helpers.test.cjs","mode":"100644","encoding":"utf-8","bytes":9651,"lines":179,"sha256":"5bbc9dec0771b7598ea965a4aea0caf164987e57362c9f30040d5b0c833bf59b","git_blob_sha1":"343ac681451cbea44cfcdcbf1bc45265132ac462","fence":"````","final_lf":true} -->
````javascript
// Retained regression tests for the disposable native fixture, not a certification of app safety.
const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
let helpers = {}
try { helpers = require('./native/helpers/support.cjs') } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e }
const {assertHostedRunner, isolatedEnv, sha256, WriterClient} = helpers

test('refuses local or self-hosted execution', () => {
  assert.equal(typeof assertHostedRunner,'function')
  assert.throws(() => assertHostedRunner({}), /hosted/)
  assert.throws(() => assertHostedRunner({GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'self-hosted',RUNNER_TEMP:os.tmpdir()}), /hosted/)
  assert.doesNotThrow(() => assertHostedRunner({GITHUB_ACTIONS:'true',RUNNER_ENVIRONMENT:'github-hosted',RUNNER_TEMP:os.tmpdir()}))
})
test('isolates rclone overrides and SSH agent without removing executable PATH', () => {
  assert.equal(typeof isolatedEnv,'function')
  const root = path.join(os.tmpdir(),'fake-fixture')
  const env = isolatedEnv({PATH:'keep',RCLONE_CONFIG:'private',rclone_rc_pass:'secret',SSH_AUTH_SOCK:'agent'},root)
  assert.equal(env.PATH,'keep'); assert.equal(env.RCLONE_CONFIG,undefined)
  assert.equal(env.rclone_rc_pass,undefined); assert.equal(env.SSH_AUTH_SOCK,undefined)
  assert.equal(env.HOME,root); assert.equal(env.USERPROFILE,root)
})
test('hash function checks bytes, not size', () => {
  assert.equal(typeof sha256,'function')
  assert.notEqual(sha256(Buffer.from('abc')),sha256(Buffer.from('abd')))
  assert.equal(sha256(Buffer.from('abc')),crypto.createHash('sha256').update('abc').digest('hex'))
})
test('external writer acknowledges actual bytes and closes its handle', async t => {
  assert.equal(typeof WriterClient,'function')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-writer-test-'))
  const w=new WriterClient(root)
  t.after(async()=>{await w.dispose();await fs.rm(root,{recursive:true,force:true})})
  await w.call('open',{name:'test.bin',hex:Buffer.from('first').toString('hex')})
  await w.call('append',{hex:Buffer.from('-second').toString('hex')})
  await w.call('close')
  assert.equal(await fs.readFile(path.join(root,'test.bin'),'utf8'),'first-second')
})
test('external writer refuses paths outside its assigned mount and unknown commands', async t => {
  assert.equal(typeof WriterClient,'function')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-writer-test-'))
  const w=new WriterClient(root)
  t.after(async()=>{await w.dispose();await fs.rm(root,{recursive:true,force:true})})
  await assert.rejects(w.call('open',{name:'../outside',hex:'61'}),/name/)
  await assert.rejects(w.call('deleteAll',{}),/command/)
})
test('external writer does not overwrite an existing file', async t => {
  assert.equal(typeof WriterClient,'function')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-writer-test-'))
  await fs.writeFile(path.join(root,'test.bin'),'keep')
  const w=new WriterClient(root)
  t.after(async()=>{await w.dispose();await fs.rm(root,{recursive:true,force:true})})
  await assert.rejects(w.call('open',{name:'test.bin',hex:'61'}),/EEXIST/)
  assert.equal(await fs.readFile(path.join(root,'test.bin'),'utf8'),'keep')
})

test('fixture initialization failures redact temporary credentials before leaving the fixture', async t => {
  const {StorageFixture}=require('./native/helpers/fixture.cjs')
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'drive-fixture-failure-'))
  const originalInitialize=StorageFixture.prototype.initialize
  const originalDispose=StorageFixture.prototype.dispose
  StorageFixture.prototype.initialize=async function(){
    this.password='unique-test-password';this.rcSecret='unique-test-rc-secret';this.obscured='unique-test-obscured'
    throw new Error(`${this.password} ${this.rcSecret} ${this.obscured} cannot initialize`)
  }
  StorageFixture.prototype.dispose=async()=>{}
  try {
    await assert.rejects(StorageFixture.create('not-executed',root),error=>{
      assert.doesNotMatch(error.message,/unique-test-/)
      assert.match(error.message,/cannot initialize/)
      return true
    })
  } finally {
    StorageFixture.prototype.initialize=originalInitialize
    StorageFixture.prototype.dispose=originalDispose
    await fs.rm(root,{recursive:true,force:true})
  }
})

// Regression for the hosted run 39116390251: fixture-ready.txt must be
// visible before the SFTP server can cache an empty directory. These tests
// execute the actual fixture lifecycle, with only rclone's process boundary
// simulated. They are not evidence of a native mount or shutdown guarantee.
function markerFixtureModule() {
  const vm = require('node:vm')
  const syncFs = require('node:fs')
  const {EventEmitter} = require('node:events')
  const {PassThrough} = require('node:stream')
  const module = {exports:{}}
  const observed = {serverMarker:undefined, clientReads:[]}
  const spawn = (_executable,args) => {
    const child = new EventEmitter()
    child.stdout = new PassThrough(); child.stderr = new PassThrough()
    child.exitCode = null; child.signalCode = null
    queueMicrotask(() => {
      let code = 0
      if (args[0] === 'obscure') child.stdout.write('fixture-obscured-password\n')
      else if (args[0] === 'lsjson') child.stdout.write('{"IsDir":true}')
      else if (args[0] === 'cat') {
        observed.clientReads.push(args[1])
        if (observed.serverMarker === undefined) {
          child.stderr.write('object not found'); code = 1
        } else child.stdout.write(observed.serverMarker)
      } else {child.stderr.write('Unexpected fixture command'); code = 1}
      child.exitCode = code
      child.stdout.end(); child.stderr.end(); child.emit('close',code,null)
    })
    return child
  }
  const realSupport = require('./native/helpers/support.cjs')
  const testSupport = {...realSupport,
    // One readiness attempt removes the real-time delay, not its success test.
    waitFor:async (fn,_timeout,label) => {
      const value = await fn()
      if (!value) throw new Error(`${label}: condition not met`)
      return value
    },
    WriterClient:class {async dispose(){}}
  }
  const source = syncFs.readFileSync(path.join(__dirname,'./native/helpers/fixture.cjs'),'utf8')
  const sandbox = {module,exports:module.exports,Buffer,process,console,setTimeout,clearTimeout,
    require:id => id === 'node:child_process' ? {spawn} : id === './support.cjs' ? testSupport : require(id)}
  vm.runInNewContext(source,sandbox,{filename:'fixture.cjs'})
  return {StorageFixture:module.exports.StorageFixture,observed}
}
async function markerFixture(t) {
  const {StorageFixture,observed} = markerFixtureModule()
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'drive-marker-regression-'))
  const fixture = new StorageFixture('simulated-rclone',root)
  fixture.launch = () => {
    const marker = path.join(fixture.remote,'fixture-ready.txt')
    try { observed.serverMarker = require('node:fs').readFileSync(marker,'utf8') }
    catch (error) { if (error.code !== 'ENOENT') throw error; observed.serverMarker = undefined }
    return {assertAlive(){}}
  }
  t.after(async () => {await fixture.dispose();await fs.rm(root,{recursive:true,force:true})})
  return {fixture,observed}
}

test('marker is created before the first SFTP server starts', async t => {
  const {fixture,observed} = await markerFixture(t)
  await fixture.initialize()
  assert.equal(observed.serverMarker,'probe-ready','the first server view must already contain the marker')
  assert.equal(await fs.readFile(path.join(fixture.remote,'fixture-ready.txt'),'utf8'),'probe-ready')
  assert.ok(observed.clientReads.includes('probe:/fixture-ready.txt'),'readiness must read through SFTP')
})

test('SFTP readiness rejects a missing marker even when the root directory exists', async t => {
  const {fixture} = await markerFixture(t)
  await fs.mkdir(fixture.remote,{recursive:true})
  await assert.rejects(fixture.startServer(),/not found|marker|Marker/)
})

test('SFTP readiness rejects incorrect marker contents', async t => {
  const {fixture} = await markerFixture(t)
  await fs.mkdir(fixture.remote,{recursive:true})
  await fs.writeFile(path.join(fixture.remote,'fixture-ready.txt'),'wrong-content')
  await assert.rejects(fixture.startServer(),/marker|Marker/)
})
test('native test confirmation reports a blocked execution instead of hanging forever',async()=>{
 const {confirmAndWait}=require('./native/helpers/support.cjs')
 assert.equal(typeof confirmAndWait,'function')
 const {OperationCoordinator}=require('../src/main/operations.ts')
 const c=new OperationCoordinator({changed(){},pause(){},resume(){},hide(){}})
 const pending=c.run({kind:'disconnect',requiresConfirmation:true},async()=>({kind:'confirm',message:''}),async()=>{throw new Error('unmount failed in test')})
 await new Promise(r=>setImmediate(r))
 await assert.rejects(confirmAndWait(c,pending),/unmount failed/)
 assert.equal(await pending,false)
})
test('native test confirmation awaits the successful production operation',async()=>{
 const {confirmAndWait}=require('./native/helpers/support.cjs')
 assert.equal(typeof confirmAndWait,'function')
 const {OperationCoordinator}=require('../src/main/operations.ts')
 const c=new OperationCoordinator({changed(){},pause(){},resume(){},hide(){}})
 const pending=c.run({kind:'disconnect',requiresConfirmation:true},async()=>({kind:'confirm',message:''}),async()=>{})
 await new Promise(r=>setImmediate(r));assert.equal(await confirmAndWait(c,pending),true)
})
````
<!-- DT-REPO-FILE-END F055 -->

<a id="file-f056"></a>
### F056 — `tests/native-wiring.test.cjs`
**910 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F056","path":"tests/native-wiring.test.cjs","mode":"100644","encoding":"utf-8","bytes":910,"lines":4,"sha256":"7e0bf129b1f062aee4649a53edcfa84d8272e106e9484d43e318448daa639282","git_blob_sha1":"2b58885266fe36aa90f2efab661c2aa48ba1eaa7","fence":"````","final_lf":true} -->
````javascript
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const root=path.join(__dirname,'..')
test('native verification imports the production mount and operation controls, not a fork',()=>{const p=path.join(root,'tests/native/guarded.cjs');assert.ok(fs.existsSync(p));const s=fs.readFileSync(p,'utf8');assert.match(s,/src\/main\/mounts.ts/);assert.match(s,/src\/main\/operations.ts/);assert.match(s,/assertHostedRunner/);assert.match(s,/preflight/);assert.doesNotMatch(s,/productionSafetyCertified:true/)})
test('obsolete characterization tools no longer have an active workflow',()=>{assert.equal(fs.existsSync(path.join(root,'.github/workflows/storage-investigation.yml')),false);assert.equal(fs.existsSync(path.join(root,'tools/safety-probe/native.cjs')),false);assert.ok(fs.existsSync(path.join(root,'.github/workflows/guarded-close.yml')))})
````
<!-- DT-REPO-FILE-END F056 -->

<a id="file-f057"></a>
### F057 — `tests/native/guarded.cjs`
**4584 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F057","path":"tests/native/guarded.cjs","mode":"100644","encoding":"utf-8","bytes":4584,"lines":66,"sha256":"835a9f6235c7b01e5d4b21a62a728c70fa135ab4b76a52d42e90b7ce1456b3a0","git_blob_sha1":"f5cd4a3dea2ae9a89b9281145c50af6783689fdb","fence":"````","final_lf":true} -->
````javascript
// Disposable native integration of the PRODUCTION classes; not a losslessness certificate.
const fs=require('node:fs/promises'),path=require('node:path'),Module=require('node:module')
const assert=require('node:assert/strict'),crypto=require('node:crypto'),os=require('node:os')
const {assertHostedRunner,WriterClient,waitFor,sha256,confirmAndWait}=require('./helpers/support.cjs')
const {StorageFixture}=require('./helpers/fixture.cjs')
const output=path.resolve('.safety-probe-results',process.platform+'.json')
async function main(){
 assertHostedRunner()
 const report={purpose:'production-guarded-disconnection',productionSafetyCertified:false,platform:process.platform,status:'running',checks:[]}
 let fixture,manager;const children=[]
 const originalLoad=Module._load
 const childProcess=require('node:child_process')
 try{
  const executable=process.env.SAFETY_RCLONE;assert.ok(executable&&path.isAbsolute(executable))
  fixture=await StorageFixture.create(executable,process.env.RUNNER_TEMP)
  process.env.RCLONE_CONFIG=fixture.config
  // Use the real OS children and production code. Only Electron app paths are supplied by the test.
  Module._load=function(id,...args){
   if(id==='electron')return {app:{getPath:()=>fixture.home}}
   if(id==='node:child_process')return {...childProcess,spawn:(...params)=>{const c=childProcess.spawn(...params);children.push(c);return c}}
   return originalLoad.call(this,id,...args)
  }
  const {MountManager}=require('../../src/main/mounts.ts')
  const {OperationCoordinator}=require('../../src/main/operations.ts')
  Module._load=originalLoad
  const m={id:'native-folder',name:'Native test',remote:'probe',remotePath:'/',localPath:fixture.mountPoint,autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}
  const store={find:()=>m,mounts:[m],settings:{rcloneExecutable:executable,cacheMaxSize:'1G',directoryRefreshSeconds:120}}
  manager=new MountManager(store,()=>{},line=>{report.lastMessage=fixture.sanitize(line)})
  await manager.connect(m.id)
  assert.equal(manager.state(m.id).status,'connected')
  assert.equal(await fs.readFile(path.join(m.localPath,'fixture-ready.txt'),'utf8'),'probe-ready')
  report.checks.push('stock rclone mount visible through production manager')
  fixture.writer=new WriterClient(m.localPath)
  const bytes=crypto.randomBytes(65536),hash=sha256(bytes)
  await fixture.writer.call('open',{name:'guarded.bin',hex:bytes.toString('hex')})
  await fixture.writer.call('close')
  const busy=await manager.preflight(m.id)
  assert.equal(busy.kind,'blocked','Delayed upload must be blocked by production preflight')
  await assert.rejects(manager.disconnect(m.id))
  assert.equal(manager.state(m.id).status,'connected')
  report.checks.push('pending upload rejects real disconnection without stopping the engine')
  await fixture.waitHash('guarded.bin',hash)
  await waitFor(async()=> (await manager.preflight(m.id)).kind==='confirm',15000,'Idle observation after upload')
  let done=false
  const c=new OperationCoordinator({changed:()=>{},pause:()=>{},resume:()=>{},hide:()=>{}})
  const pending=c.run({kind:'disconnect',name:m.name,requiresConfirmation:true},()=>manager.preflight(m.id),async()=>{await manager.disconnect(m.id);done=true})
  await waitFor(async()=>c.view?.phase==='confirm',10000,'Mandatory warning')
  assert.equal(done,false);assert.equal(manager.state(m.id).status,'connected')
  assert.equal(await confirmAndWait(c,pending),true)
  assert.equal(manager.state(m.id).status,'disconnected');assert.equal(manager.hasRuntime(m.id),false)
  assert.equal(await fixture.remoteHash('guarded.bin'),hash)
  report.checks.push('explicit confirmation rechecks and closes the owned daemon; server hash unchanged')
  report.sha256=hash;report.status='completed'
 }catch(error){report.status='failed';report.error=fixture?fixture.sanitize(error.message):String(error.message);process.exitCode=1}
 finally{
  Module._load=originalLoad
  // Fixture files are artificial. Test-only cleanup may stop its own children on a failed assertion.
  if(fixture?.writer){await fixture.writer.dispose();fixture.writer=null}
  if(manager&&fixture){try{await manager.disconnect('native-folder')}catch{}}
  for(const child of children){if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM')}
  if(fixture)await fixture.dispose()
  await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2)+'\n')
  console.log(JSON.stringify(report,null,2))
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1})
````
<!-- DT-REPO-FILE-END F057 -->

<a id="file-f058"></a>
### F058 — `tests/native/helpers/fixture.cjs`
**7272 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F058","path":"tests/native/helpers/fixture.cjs","mode":"100644","encoding":"utf-8","bytes":7272,"lines":104,"sha256":"087b4e4d8088cb5dd80ccb08e865720d5ade1b0a19e58c42d644f2b6604c19bb","git_blob_sha1":"965ab46c4bac700af11576c3f81554647651a230","fence":"````","final_lf":true} -->
````javascript
// Sacrificial storage fixture. It never uses the user's saved remotes, server or keys.
const fs=require('node:fs/promises')
const fss=require('node:fs')
const path=require('node:path')
const crypto=require('node:crypto')
const {spawn}=require('node:child_process')
const {isolatedEnv,freePort,waitFor,sha256}=require('./support.cjs')

function sshString(b){const prefix=Buffer.alloc(4);prefix.writeUInt32BE(b.length);return Buffer.concat([prefix,b])}
function sshPositive(b){return sshString(b[0]&0x80?Buffer.concat([Buffer.from([0]),b]):b)}
function hostKey(){
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048})
  const jwk=publicKey.export({format:'jwk'})
  const wire=Buffer.concat([sshString(Buffer.from('ssh-rsa')),sshPositive(Buffer.from(jwk.e,'base64url')),sshPositive(Buffer.from(jwk.n,'base64url'))])
  return {pem:privateKey.export({format:'pem',type:'pkcs1'}),publicLine:'ssh-rsa '+wire.toString('base64')}
}
class TestProcess {
  constructor(executable,args,options) {
    this.out='';this.error='';this.startError=null
    this.child=spawn(executable,args,{...options,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']})
    this.child.stdout.on('data',d=>{this.out=(this.out+d.toString('utf8')).slice(-32768)})
    this.child.stderr.on('data',d=>{this.error=(this.error+d.toString('utf8')).slice(-32768)})
    this.child.on('error',e=>{this.startError=e})
    this.done=new Promise(resolve=>this.child.once('close',(code,signal)=>resolve({code,signal})))
  }
  async wait(timeout=10000) {
    let timer
    try {return await Promise.race([this.done,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Disposable test process did not exit')),timeout)})])}
    finally{clearTimeout(timer)}
  }
  assertAlive(){if(this.startError)throw this.startError;if(this.child.exitCode!==null||this.child.signalCode!==null)throw new Error('Disposable rclone process exited: '+this.error)}
  async stopForCleanup() {
    if(this.child.exitCode!==null||this.child.signalCode!==null)return
    // Test cleanup is intentionally different from the production safety policy.
    // PIDs are handles of children created by this fixture, never searched by name.
    this.child.kill('SIGTERM')
    try{await this.wait(2500)}catch{this.child.kill('SIGKILL');try{await this.wait(2500)}catch{}}
  }
}
async function runTool(executable,args,options={}) {
  const p=new TestProcess(executable,args,options)
  try{const ended=await p.wait(15000);if(p.startError)throw p.startError;if(ended.code!==0)throw new Error(p.error||'Test command failed');return p.out.trim()}
  finally{await p.stopForCleanup()}
}
function makeConfig(port,obscured,knownHosts){
  if(!Number.isInteger(port)||port<1||port>65535||/[\r\n]/.test(obscured+knownHosts))throw new Error('Invalid fixture configuration')
  return `[probe]\ntype = sftp\nhost = 127.0.0.1\nport = ${port}\nuser = probe\npass = ${obscured}\nknown_hosts_file = ${knownHosts.replace(/\\/g,'/')}\nkey_use_agent = false\ndisable_hashcheck = true\nshell_type = none\n`
}
class StorageFixture {
  constructor(executable,root){
    this.executable=executable;this.root=root;this.home=path.join(root,'home');this.cache=path.join(root,'cache')
    this.remote=path.join(root,'remote');this.mountPoint=path.join(root,'mount');this.config=path.join(root,'rclone.conf')
    this.hostKeyPath=path.join(root,'ssh-host-key');this.password=crypto.randomBytes(32).toString('hex');this.rcSecret=crypto.randomBytes(32).toString('hex')
    this.children=[];this.writer=null;this.mounted=false;this.daemon=null;this.server=null;this.obscured=''
  }
  static async create(executable,tempRoot){
    const root=await fs.mkdtemp(path.join(tempRoot,'drive-tambu-sacrificial-'))
    const f=new StorageFixture(executable,root)
    try{await f.initialize();return f}catch(e){const message=f.sanitize(e.message);await f.dispose();throw new Error(message)}
  }
  sanitize(text){return String(text).split(this.password).join('[temporary-secret]').split(this.rcSecret).join('[temporary-secret]').split(this.obscured||'NEVER_MATCH_EMPTY').join('[temporary-secret]').slice(-8000)}
  async initialize(){
    await fs.writeFile(path.join(this.root,'.fixture-owner'),'DriveTambu disposable CI fixture only\n',{mode:0o600})
    for(const dir of [this.home,this.cache,this.remote,'appdata','localappdata','config','state'].map(d=>path.isAbsolute(d)?d:path.join(this.home,d)))await fs.mkdir(dir,{recursive:true,mode:0o700})
    // Prepare before the first SFTP request: the server has its own VFS
    // directory cache. Creating this later can leave the marker invisible.
    await fs.writeFile(path.join(this.remote,'fixture-ready.txt'),'probe-ready',{flag:'wx',mode:0o600})
    this.env=isolatedEnv(process.env,this.home)
    await fs.writeFile(this.config,'',{mode:0o600})
    this.obscured=await runTool(this.executable,['obscure',this.password,'--config',this.config],{env:this.env,cwd:this.root})
    this.sftpPort=await freePort();this.rcPort=await freePort()
    while(this.rcPort===this.sftpPort)this.rcPort=await freePort()
    const key=hostKey();await fs.writeFile(this.hostKeyPath,key.pem,{mode:0o600})
    const kh=path.join(this.root,'known_hosts')
    await fs.writeFile(kh,`[127.0.0.1]:${this.sftpPort} ${key.publicLine}\n`,{mode:0o600})
    await fs.writeFile(path.join(this.root,'authorized_keys'),'')
    await fs.writeFile(this.config,makeConfig(this.sftpPort,this.obscured,kh),{mode:0o600})
    await this.startServer()
  }
  launch(args,extra={}){
    const p=new TestProcess(this.executable,[...args,'--config',this.config],{env:{...this.env,...extra},cwd:this.root})
    this.children.push(p);return p
  }
  async startServer(){
    this.server=this.launch(['serve','sftp',this.remote,'--addr',`127.0.0.1:${this.sftpPort}`,'--key',this.hostKeyPath,'--authorized-keys',path.join(this.root,'authorized_keys'),
      '--cache-dir',path.join(this.root,'server-cache'),'--log-level','NOTICE'],{RCLONE_USER:'probe',RCLONE_PASS:this.password})
    await waitFor(async()=>{
      this.server.assertAlive()
      const result=await runTool(this.executable,['cat','probe:/fixture-ready.txt','--count','64','--sftp-disable-hashcheck','--sftp-shell-type','none','--contimeout','1s','--timeout','2s','--retries','1','--low-level-retries','1','--config',this.config],{env:this.env,cwd:this.root})
      if(result!=='probe-ready')throw new Error('Local SFTP marker has unexpected contents')
      return true
    },20000,'Local SFTP marker readiness')
  }
  async stopServer(){if(this.server)await this.server.stopForCleanup();this.server=null}
  async remoteHash(name){try{return sha256(await fs.readFile(path.join(this.remote,name)))}catch(e){if(e.code==='ENOENT')return null;throw e}}
  async waitHash(name,expected){return waitFor(async()=>await this.remoteHash(name)===expected,60000,'SFTP content hash')}
  async dispose(){
    if(this.writer){await this.writer.dispose();this.writer=null}
    for(const child of this.children.reverse())await child.stopForCleanup()
    // Do not recursively delete a mount tree, even in tests. The ephemeral VM disposes
    // of this scratch directory. Only sanitized JSON reports are uploaded.
  }
}
module.exports={StorageFixture,TestProcess,runTool,hostKey,makeConfig}
````
<!-- DT-REPO-FILE-END F058 -->

<a id="file-f059"></a>
### F059 — `tests/native/helpers/support.cjs`
**4075 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F059","path":"tests/native/helpers/support.cjs","mode":"100644","encoding":"utf-8","bytes":4075,"lines":80,"sha256":"675608cb07ef683c76a548e8ccfccdb245b8ec68d2bffa03fef0d73329e6915f","git_blob_sha1":"65c0ddc843cc849c55d310daef56719a43b5cb4d","fence":"````","final_lf":true} -->
````javascript
// Test-only utilities. Never imported by the desktop application.
const path = require('node:path')
const crypto = require('node:crypto')
const {fork} = require('node:child_process')
const net = require('node:net')

function assertHostedRunner(env = process.env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.RUNNER_ENVIRONMENT !== 'github-hosted' || !path.isAbsolute(env.RUNNER_TEMP || '')) {
    throw new Error('This destructive characterization is restricted to disposable GitHub-hosted runners.')
  }
}
function isolatedEnv(base, home) {
  const env = Object.fromEntries(Object.entries(base).filter(([key]) => !/^RCLONE_/i.test(key) && !/^SSH_AUTH_SOCK$/i.test(key)))
  return {...env, HOME:home, USERPROFILE:home, APPDATA:path.join(home,'appdata'), LOCALAPPDATA:path.join(home,'localappdata'),
    XDG_CONFIG_HOME:path.join(home,'config'), XDG_CACHE_HOME:path.join(home,'cache'), XDG_STATE_HOME:path.join(home,'state')}
}
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const sleep = ms => new Promise(r=>setTimeout(r,ms))
async function waitFor(fn, timeoutMs, label) {
  const deadline=performance.now()+timeoutMs
  let lastError
  do {
    try { const value=await fn(); if (value) return value } catch(e) {lastError=e}
    await sleep(200)
  } while (performance.now()<deadline)
  throw new Error(`${label} timed out${lastError ? ': '+lastError.message : ''}`)
}
function freePort() {
  return new Promise((resolve,reject)=>{
    const server=net.createServer(); server.on('error',reject)
    server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(err=>err?reject(err):resolve(port))})
  })
}
class WriterClient {
  constructor(root) {
    if (!path.isAbsolute(root)) throw new Error('Writer root must be absolute')
    this.pending=new Map(); this.nextId=0; this.disposed=false
    this.child=fork(path.join(__dirname,'writer.cjs'),[],{env:{...process.env,PROBE_WRITER_ROOT:root},stdio:['ignore','ignore','ignore','ipc'],windowsHide:true})
    this.child.on('message',message=>{
      const request=this.pending.get(message.id);if(!request)return
      clearTimeout(request.timer);this.pending.delete(message.id)
      message.ok?request.resolve(message.value):request.reject(new Error(message.error))
    })
    const fail=e=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(e)}this.pending.clear()}
    this.child.on('error',fail);this.child.on('exit',()=>fail(new Error('Test writer exited before acknowledgment')))
  }
  call(op, params={}) {
    if(this.disposed||!this.child.connected) return Promise.reject(new Error('Test writer is closed'))
    const id=++this.nextId
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`Writer ${op}: timeout`))},15000)
      this.pending.set(id,{resolve,reject,timer})
      this.child.send({id,op,...params},err=>{if(err){clearTimeout(timer);this.pending.delete(id);reject(err)}})
    })
  }
  async dispose() {
    if(this.disposed)return
    // This is a sacrificial test writer only, never a user process.
    try {await this.call('close')} catch {}
    this.disposed=true
    if(this.child.connected)this.child.disconnect()
    if(this.child.exitCode===null&&this.child.signalCode===null){this.child.kill();await sleep(100)}
  }
}
module.exports={assertHostedRunner,isolatedEnv,sha256,WriterClient,waitFor,sleep,freePort}

// The coordinator intentionally leaves a blocked action pending for its UI.
// The headless regression must cancel/report that state, not wait for human input.
async function confirmAndWait(coordinator,pending) {
  const view=coordinator.view
  if(!view || view.phase!=='confirm')throw new Error('Expected a confirmation before the native operation')
  await coordinator.respond(view.id,'confirm')
  const remaining=coordinator.view
  if(remaining) {
    await coordinator.respond(remaining.id,'cancel')
    throw new Error(remaining.message || 'Native operation remained blocked')
  }
  return pending
}
module.exports.confirmAndWait=confirmAndWait
````
<!-- DT-REPO-FILE-END F059 -->

<a id="file-f060"></a>
### F060 — `tests/native/helpers/writer.cjs`
**1779 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F060","path":"tests/native/helpers/writer.cjs","mode":"100644","encoding":"utf-8","bytes":1779,"lines":35,"sha256":"e45efdc204b455657ca286ad16ca92fa5b3f1fc407c8506bf2894e53d88b936d","git_blob_sha1":"ed4369190eb165ad079c295752462a40a8727b1d","fence":"````","final_lf":true} -->
````javascript
// Separate process so blocked filesystem operations cannot block the test driver.
const fs=require('node:fs/promises')
const path=require('node:path')
const root=process.env.PROBE_WRITER_ROOT
if(!path.isAbsolute(root||''))process.exit(2)
let handle=null,queue=Promise.resolve()
function bytes(hex) {
  if(typeof hex!=='string'||hex.length>4*1024*1024||hex.length%2||!/^[0-9a-f]*$/i.test(hex)) throw new Error('Invalid payload')
  return Buffer.from(hex,'hex')
}
async function writeAll(buffer) {
  let offset=0
  while(offset<buffer.length){const {bytesWritten}=await handle.write(buffer,offset,buffer.length-offset,null);if(bytesWritten<=0)throw new Error('Short write');offset+=bytesWritten}
  await handle.sync() // Acknowledges local fsync only, NOT server delivery.
  return {acknowledgedBytes:offset}
}
async function dispatch(m) {
  if(m.op==='open') {
    if(handle)throw new Error('Writer already open')
    if(typeof m.name!=='string'||!/^[a-zA-Z0-9_-]+\.bin$/.test(m.name))throw new Error('Invalid test file name')
    const data=bytes(m.hex)
    handle=await fs.open(path.join(root,m.name),'wx+')
    return writeAll(data)
  }
  if(m.op==='append'){if(!handle)throw new Error('No open writer');return writeAll(bytes(m.hex))}
  if(m.op==='close'){if(handle){const h=handle;handle=null;await h.close()}return {closed:true}}
  throw new Error('Unknown writer command')
}
process.on('message',m=>{
  queue=queue.then(async()=>{
    try {const value=await dispatch(m);if(process.connected)process.send({id:m.id,ok:true,value})}
    catch(e){if(process.connected)process.send({id:m.id,ok:false,error:String(e.code||'error')+': '+e.message})}
  })
})
process.on('disconnect',()=>{void queue.finally(async()=>{try{if(handle)await handle.close()}finally{process.exit(0)}})})
````
<!-- DT-REPO-FILE-END F060 -->

<a id="file-f061"></a>
### F061 — `tests/operation-ui.test.cjs`
**2842 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F061","path":"tests/operation-ui.test.cjs","mode":"100644","encoding":"utf-8","bytes":2842,"lines":20,"sha256":"0f5e84e5746138ea1d25b14b3185fd18e3b3daf366cc6837361c8ddc590c1787","git_blob_sha1":"6906cad5a1a0c877177e889ef1d0e8bb98e44bf1","fence":"````","final_lf":true} -->
````javascript
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
````
<!-- DT-REPO-FILE-END F061 -->

<a id="file-f062"></a>
### F062 — `tests/operations.test.cjs`
**3421 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F062","path":"tests/operations.test.cjs","mode":"100644","encoding":"utf-8","bytes":3421,"lines":18,"sha256":"d6a59d72c7211df09b48b96a25e65a74a3f0539ea28a13e738d240503c33834d","git_blob_sha1":"8ac213532df6dab7a82f5945656746b146e49b56","fence":"````","final_lf":true} -->
````javascript
const {test}=require('node:test'),assert=require('node:assert/strict')
let OperationCoordinator
try{({OperationCoordinator}=require('../src/main/operations.ts'))}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e}
const clear=()=>({kind:'confirm',message:'No observed work'})
const tick=()=>new Promise(r=>setImmediate(r))
function setup(){assert.equal(typeof OperationCoordinator,'function');let paused=false,checks=0,executed=0,hidden=0;let result=clear()
 const c=new OperationCoordinator({changed:()=>{},pause:()=>{paused=true},resume:()=>{paused=false},hide:()=>{hidden++}})
 const start=(confirm=true)=>c.run({kind:'disconnect',name:'Docs',requiresConfirmation:confirm},async()=>{checks++;return result},async()=>{executed++})
 return {c,start,set:r=>result=r,stats:()=>({paused,checks,executed,hidden})}
}
test('idle observation still requires explicit confirmation and rechecks immediately',async()=>{const x=setup(),p=x.start();await tick();assert.equal(x.c.view.phase,'confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'confirm');assert.equal(await p,true);assert.equal(x.stats().checks,2);assert.equal(x.stats().executed,1);assert.equal(x.stats().paused,false)})
test('known pending writes block even if a forged confirmation is sent',async()=>{const x=setup();x.set({kind:'blocked',message:'Pending'});const p=x.start();await tick();assert.equal(x.c.view.phase,'blocked');await x.c.respond(x.c.view.id,'confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');assert.equal(await p,false)})
test('unknown status blocks, but background remains possible and resumes scheduling',async()=>{const x=setup();x.set({kind:'unknown',message:'Unknown'});const p=x.start();await tick();await x.c.respond(x.c.view.id,'background');assert.equal(await p,false);assert.equal(x.stats().hidden,1);assert.equal(x.stats().paused,false)})
test('activity starting during the warning blocks at the second check',async()=>{const x=setup(),p=x.start();await tick();x.set({kind:'blocked',message:'New upload'});await x.c.respond(x.c.view.id,'confirm');assert.equal(x.c.view.phase,'blocked');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');await p})
test('retry reevaluates status but never silently executes a destructive action',async()=>{const x=setup();x.set({kind:'unknown',message:'Unavailable'});const p=x.start();await tick();x.set(clear());await x.c.respond(x.c.view.id,'retry');assert.equal(x.c.view.phase,'confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');await p})
test('duplicate and stale requests cannot bypass or confirm another warning',async()=>{const x=setup(),p=x.start();await tick();await assert.rejects(x.start(),/operazione/i);await x.c.respond('old-id','confirm');assert.equal(x.stats().executed,0);await x.c.respond(x.c.view.id,'cancel');await p})
test('cancellation while telemetry is awaited invalidates its late reply',async()=>{const x=setup();let resolve;const p=x.c.run({kind:'quit',requiresConfirmation:true},()=>new Promise(r=>{resolve=r}),async()=>{throw new Error('must not run')});const id=x.c.view.id;await x.c.respond(id,'cancel');resolve(clear());await tick();assert.equal(await p,false);assert.equal(x.c.view,null)})
test('exit without mounts or background work needs no warning',async()=>{const x=setup();assert.equal(await x.start(false),true);assert.equal(x.stats().executed,1)})
````
<!-- DT-REPO-FILE-END F062 -->

<a id="file-f063"></a>
### F063 — `tests/preferences.test.cjs`
**6006 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F063","path":"tests/preferences.test.cjs","mode":"100644","encoding":"utf-8","bytes":6006,"lines":68,"sha256":"b5e2a434b05a64bc3b0c7e9302be790d1ad9a026e60ce18b1899fe0dee294f9a","git_blob_sha1":"69951ad809230ee9dd8a3e1b7ac03af2a2115c81","fence":"````","final_lf":true} -->
````javascript
const {test,afterEach}=require('node:test'),assert=require('node:assert/strict')
const {renderComponent,text,flat}=require('./helpers/ui.cjs')
const oldWindow=global.window;afterEach(()=>{if(oldWindow===undefined)delete global.window;else global.window=oldWindow})
function scheduleUI(schedule){const props={schedule,onChange:v=>{props.schedule=v}};return renderComponent('ScheduleFields',props)}
test('weekly schedule exposes chosen days and an editable exact time',()=>{
 const ui=scheduleUI({mode:'weekly',weekdays:[0],time:'02:00'})
 assert.equal(ui.byLabel('Ora del backup').props.value,'02:00')
 assert.equal(ui.button('Domenica').props['aria-pressed'],true)
 ui.button('Lunedi').props.onClick();assert.deepEqual([...ui.props.schedule.weekdays].sort(),[0,1])
 ui.byLabel('Ora del backup').props.onChange({target:{value:'03:17'}});assert.equal(ui.props.schedule.time,'03:17')
})
test('backup intervals accept arbitrary numbers instead of preset values',()=>{
 const ui=scheduleUI({mode:'interval',minutes:17})
 const input=ui.byLabel('Intervallo backup');assert.equal(input.type,'input');assert.equal(input.props.type,'number')
 input.props.onChange({target:{value:'23'}});assert.equal(ui.props.schedule.minutes,23)
 ui.byLabel('Unita intervallo backup').props.onChange({target:{value:'60'}});assert.equal(ui.props.schedule.minutes,23*60)
})
test('calendar and manual modes are selectable without overwriting folder paths',()=>{
 const ui=scheduleUI({mode:'manual'})
 ui.byLabel('Programmazione backup').props.onChange({target:{value:'weekly'}})
 assert.equal(ui.props.schedule.mode,'weekly');assert.equal(ui.props.schedule.time,'02:00');assert.deepEqual(ui.props.schedule.weekdays,[0])
 ui.byLabel('Programmazione backup').props.onChange({target:{value:'manual'}});assert.equal(ui.props.schedule.mode,'manual')
})
const m={id:'folder-123',name:'Files',remote:'casa',remotePath:'/files',localPath:'/home/me/Files',autoConnect:false,backup:{enabled:true,intervalMinutes:0,schedule:{mode:'weekly',weekdays:[0],time:'02:00'},destination:'/backup',retentionDays:30}}
const noop=()=>{}
test('saved folder provides the Create shortcut action with its stable identifier',async()=>{
 let chosen;global.window={drive:{createShortcut:async id=>{chosen=id;return '/Desktop/Files.lnk'}}}
 const ui=renderComponent('MountModal',{original:m,remotes:['casa'],onClose:noop,onSave:noop,onDelete:noop,onSettings:noop,defaultRefreshSeconds:120})
 await ui.button('Crea collegamento...').props.onClick();assert.equal(chosen,m.id);assert.ok(text(ui.render()).includes('Collegamento creato'))
})
test('per-folder refresh can opt out of the general interval and be saved',async()=>{
 let saved;const ui=renderComponent('MountModal',{original:m,remotes:['casa'],onClose:noop,onSave:async v=>{saved=v},onDelete:noop,onSettings:noop,defaultRefreshSeconds:120})
 ui.byLabel('Usa l\'intervallo generale').props.onClick()
 ui.byLabel('Intervallo aggiornamento cartella').props.onChange({target:{value:'3'}})
 ui.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await new Promise(r=>setImmediate(r))
 assert.equal(saved.directoryRefreshSeconds,180)
 assert.equal(saved.backup.schedule.mode,'weekly')
})
test('global refresh has an editable value and saves without altering other settings',async()=>{
 const settings={rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'dark',defaultRemote:'casa',directoryRefreshSeconds:120,startAtLogin:false,closeToTray:true};let saved
 const ui=renderComponent('SettingsPage',{snapshot:{settings,mounts:[],platform:'linux'},deps:{remotes:['casa'],rclone:{ok:true}},onSave:async s=>{saved=s},onCheck:noop,busy:false})
 ui.byLabel('Intervallo aggiornamento generale').props.onChange({target:{value:'3'}})
 await ui.button('Salva intervallo').props.onClick()
 assert.equal(saved.directoryRefreshSeconds,180);assert.equal(saved.theme,'dark')
})
test('backup card displays an actual percentage with an accessible progress bar',()=>{
 const ui=renderComponent('MountCard',{m:{...m,status:'connected',backupStatus:'running',backupProgress:{phase:'copying',percent:42,bytes:420,totalBytes:1000,speed:20,checks:12,transfers:1}},busy:false,onEdit:noop,onOpen:noop,onToggle:noop,onBackup:noop,onOpenBackup:noop})
 assert.ok(text(ui.render()).includes('42%'))
 assert.equal(ui.find(n=>n.props?.role==='progressbar').props['aria-valuenow'],42)
})
test('backup checking has activity counters but no made-up percentage',()=>{
 const ui=renderComponent('MountCard',{m:{...m,status:'connected',backupStatus:'running',backupProgress:{phase:'checking',percent:null,bytes:0,totalBytes:0,speed:0,checks:123,transfers:0}},busy:false,onEdit:noop,onOpen:noop,onToggle:noop,onBackup:noop,onOpenBackup:noop})
 assert.ok(text(ui.render()).includes('123'));assert.ok(!text(ui.render()).includes('%'))
})
test('a failed settings save does not report a successful interval update',async()=>{
 const settings={rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'dark',defaultRemote:'casa',directoryRefreshSeconds:120,startAtLogin:false,closeToTray:true}
 const ui=renderComponent('SettingsPage',{snapshot:{settings,mounts:[],platform:'linux'},deps:{remotes:['casa'],rclone:{ok:true}},onSave:async()=>{throw new Error('Impossibile salvare')},onCheck:noop,busy:false})
 await ui.button('Salva intervallo').props.onClick()
 assert.ok(text(ui.render()).includes('Impossibile salvare'));assert.ok(!text(ui.render()).includes('Intervallo salvato.'))
})

test('editing an unchanged schedule displays its saved appointment, not a new interval from now',()=>{
 const next=new Date(2031,0,12,2,17).toISOString()
 const original={...m,nextBackupAt:next,backup:{...m.backup,intervalMinutes:17,schedule:{mode:'interval',minutes:17}}}
 const ui=renderComponent('MountModal',{original,remotes:['casa'],onClose:noop,onSave:noop,onDelete:noop,onSettings:noop,defaultRefreshSeconds:120})
 const expected=new Date(next).toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'})
 assert.ok(text(ui.render()).includes(expected))
})
````
<!-- DT-REPO-FILE-END F063 -->

<a id="file-f064"></a>
### F064 — `tests/preflight.test.cjs`
**2351 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F064","path":"tests/preflight.test.cjs","mode":"100644","encoding":"utf-8","bytes":2351,"lines":26,"sha256":"f6c8adeef87f994cbc9b596bae05a5654377d59c1d16278b251c3cbc58071df8","git_blob_sha1":"cdc7a27860a138df87f6f12d2d5ee151e2fa3b44","fence":"````","final_lf":true} -->
````javascript
const {test}=require('node:test'); const assert=require('node:assert/strict')
let assessTransfers
try { ({assessTransfers}=require('../src/main/preflight.ts')) } catch(e) { if(e.code!=='MODULE_NOT_FOUND')throw e }
const vfs=()=>({diskCache:{uploadsQueued:0,uploadsInProgress:0,erroredFiles:0,outOfSpace:false}})
const core=()=>({bytes:0,errors:0,transfers:0,checks:0})
const queue=()=>({queue:[]})
// Regressions: treating missing fields as zero or checking only the queue would fail these tests.
test('empty observed queues permit a warning, never declare safe',()=>{
 assert.equal(typeof assessTransfers,'function');const r=assessTransfers(vfs(),core(),queue())
 assert.equal(r.kind,'confirm');assert.equal(r.safe,undefined)
})
for(const field of ['uploadsQueued','uploadsInProgress','erroredFiles']) test(`blocks current ${field}`,()=>{
 const x=vfs();x.diskCache[field]=1;assert.equal(assessTransfers(x,core(),queue()).kind,'blocked')
})
test('out of space is blocked',()=>{const x=vfs();x.diskCache.outOfSpace=true;assert.equal(assessTransfers(x,core(),queue()).kind,'blocked')})
test('active downloads and checks are blocked even with an empty upload queue',()=>{
 for(const field of ['transferring','checking']) assert.equal(assessTransfers(vfs(),{...core(),[field]:[{}]},queue()).kind,'blocked')
})
test('queue items block even when a previous statistics snapshot said zero',()=>assert.equal(assessTransfers(vfs(),core(),{queue:[{id:1}]}).kind,'blocked'))
test('historical transfer errors do not prevent closing forever',()=>assert.equal(assessTransfers(vfs(),{...core(),errors:6,fatalError:true,lastError:'old'},queue()).kind,'confirm'))
test('unknown or malformed status must not count as idle',()=>{
 for(const x of [null,{}, {diskCache:{}}, {diskCache:{...vfs().diskCache,uploadsQueued:-1}}, {diskCache:{...vfs().diskCache,outOfSpace:'false'}}])assert.equal(assessTransfers(x,core(),queue()).kind,'unknown')
 for(const x of [null,{}, {bytes:'0'}, {...core(),transferring:3}])assert.equal(assessTransfers(vfs(),x,queue()).kind,'unknown')
 for(const x of [null,{}, {queue:1}])assert.equal(assessTransfers(vfs(),core(),x).kind,'unknown')
})
test('explicit null optional activity arrays from Go are empty, not missing telemetry',()=>assert.equal(assessTransfers(vfs(),{...core(),transferring:null,checking:null},{queue:null}).kind,'confirm'))
````
<!-- DT-REPO-FILE-END F064 -->

<a id="file-f065"></a>
### F065 — `tests/progress.test.cjs`
**2809 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F065","path":"tests/progress.test.cjs","mode":"100644","encoding":"utf-8","bytes":2809,"lines":44,"sha256":"0e6e9491026288f1c312006642e45f3be028b7ac9360329120b53da3407a8086","git_blob_sha1":"dc57b7949a632e030b896fccebfd7c1d6defa73e","fence":"````","final_lf":true} -->
````javascript
const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path')
function api(){const f=path.join(__dirname,'../src/main/backup-progress.ts');assert.ok(fs.existsSync(f),'Statistics parser exists');return require(f)}
const line=stats=>JSON.stringify({level:'notice',msg:'stats',stats})+'\n'
test('real byte counters yield an estimated percentage',()=>{
  const {progressFromStats}=api()
  const p=progressFromStats({bytes:420,totalBytes:1000,checks:8,transfers:2,speed:40})
  assert.equal(p.percent,42); assert.equal(p.bytes,420); assert.equal(p.totalBytes,1000);assert.equal(p.phase,'copying')
})
test('checking without a total reports activity and no invented percentage',()=>{
  const p=api().progressFromStats({bytes:0,totalBytes:0,checks:72,transfers:0})
  assert.equal(p.percent,null);assert.equal(p.checks,72);assert.equal(p.phase,'checking')
})
test('running transfer at full bytes never announces completion before exit status',()=>{
  const p=api().progressFromStats({bytes:1000,totalBytes:1000})
  assert.equal(p.percent,99);assert.equal(p.phase,'finishing')
})
test('malformed/negative numeric stats do not leak NaN or negative UI counters',()=>{
  const p=api().progressFromStats({bytes:-1,totalBytes:'200',speed:Infinity,checks:null})
  assert.equal(p.percent,null);assert.equal(p.bytes,0);assert.equal(p.speed,0)
})
test('growing totals may revise the estimate rather than showing a fabricated monotonic value',()=>{
  const {progressFromStats}=api()
  assert.equal(progressFromStats({bytes:50,totalBytes:100}).percent,50)
  assert.equal(progressFromStats({bytes:60,totalBytes:200}).percent,30)
})
test('JSON log parser handles partial lines, multiple lines and split UTF-8',()=>{
  const received=[]; const {JsonLogReader}=api();const reader=new JsonLogReader(x=>received.push(x))
  const data=Buffer.from(line({bytes:5,totalBytes:10})+JSON.stringify({level:'error',msg:'perch\u00e9'})+'\n')
  for(const byte of data) reader.push(Buffer.from([byte]))
  reader.end()
  assert.equal(received.length,2);assert.equal(received[0].stats.bytes,5);assert.equal(received[1].msg,'perch\u00e9')
})
test('log reader handles a final unterminated line and ignores ordinary text',()=>{
  const got=[];const r=new (api().JsonLogReader)(x=>got.push(x))
  r.push(Buffer.from('a diagnostic\n'+line({checks:2})+JSON.stringify({level:'error',msg:'failed'})));r.end()
  assert.equal(got.length,2);assert.equal(got[1].msg,'failed')
})
test('a huge incomplete line is dropped, not interpreted after truncation',()=>{
  const got=[];const r=new (api().JsonLogReader)(x=>got.push(x))
  r.push(Buffer.from('x'.repeat(600000)));r.push(Buffer.from('\n'+line({checks:3})));r.end()
  assert.equal(got.length,1);assert.equal(got[0].stats.checks,3)
})
````
<!-- DT-REPO-FILE-END F065 -->

<a id="file-f066"></a>
### F066 — `tests/register.cjs`
**474 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F066","path":"tests/register.cjs","mode":"100644","encoding":"utf-8","bytes":474,"lines":11,"sha256":"590e71d8314ad790f261d7eedfc950db53952e4f5dad7ec511c2257b4e79ceb0","git_blob_sha1":"94faa6e0de83d6a0eb1e5f03f587b3097d6661d6","fence":"````","final_lf":true} -->
````javascript
// Test-only TypeScript loader. Production is compiled by electron-vite.
const ts = require('typescript')
const fs = require('node:fs')
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  const result = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  })
  module._compile(result.outputText, filename)
}
````
<!-- DT-REPO-FILE-END F066 -->

<a id="file-f067"></a>
### F067 — `tests/remote.test.cjs`
**1885 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F067","path":"tests/remote.test.cjs","mode":"100644","encoding":"utf-8","bytes":1885,"lines":32,"sha256":"1bbec11dc97ae58fd86971f177812b296e14ef99c58680c006d991c09cbfea9a","git_blob_sha1":"c49cc2b646862bc87fe1afd597c9b3f8e2bea9b1","fence":"````","final_lf":true} -->
````javascript
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { remoteSpec, runRclone } = require('../src/main/diagnostics.ts')

test('a pasted full server path contains exactly one connection prefix', () => {
  assert.equal(remoteSpec('casa', 'casa:/home/server/services/filebrowser/data/fabio'), 'casa:/home/server/services/filebrowser/data/fabio')
})
test('reject a pasted path belonging to another server, rather than silently switching', () => {
  assert.throws(() => remoteSpec('casa', 'ufficio:/documenti'), /server|connessione/i)
})
test('never interpret a Windows drive as a server path', () => {
  assert.throws(() => remoteSpec('casa', 'C:\\Users\\Fabio'), /computer|Windows/i)
})
test('preserve absolute, home-relative and colon-containing SFTP paths', () => {
  assert.equal(remoteSpec('casa', '/documenti/anno:2026'), 'casa:/documenti/anno:2026')
  assert.equal(remoteSpec('casa', 'documenti'), 'casa:documenti')
  assert.equal(remoteSpec('casa', ''), 'casa:')
})
test('reject control characters and command-like connection names', () => {
  assert.throws(() => remoteSpec('--config', '/tmp'), /server|connessione/i)
  assert.throws(() => remoteSpec('casa', '/tmp\nother'), /percorso/i)
})
test('run a process without a shell and retain a normal successful result', async () => {
  const out = await runRclone(process.execPath, ['-e', 'process.stdout.write("ok")'], 3000)
  assert.equal(out, 'ok')
})
test('a missing executable has an actionable message, not a raw ENOENT', async () => {
  await assert.rejects(runRclone('drive-tambu-no-such-binary-test', ['version'], 1000), /componente|rclone.*trovat|motore/i)
})
test('an unresponsive connection is reported as a timeout, without claiming a particular cause', async () => {
  await assert.rejects(runRclone(process.execPath, ['-e', 'setTimeout(() => {}, 10000)'], 150), /tempo|rispost/i)
})
````
<!-- DT-REPO-FILE-END F067 -->

<a id="file-f068"></a>
### F068 — `tests/root-home.test.cjs`
**8745 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F068","path":"tests/root-home.test.cjs","mode":"100644","encoding":"utf-8","bytes":8745,"lines":195,"sha256":"caeee0848f917697772defe52cfc8d23a20c3942041aa83bbccbb25d86713508","git_blob_sha1":"c9a9c5c3c349ed2132d709059be91ba91a42fa0b","fence":"````","final_lf":true} -->
````javascript
// Regression coverage for the actual RemoteBrowser component.
// React hooks/JSX and the Electron IPC boundary are simulated; handlers and
// path conversion are production code. No server or mount is contacted.
const { test, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const { normalizeRemotePath, childRemotePath, parentRemotePath } = require('../src/shared/paths.ts')

let active
const react = {
  useState(initial) {
    const state = active, index = state.cursor++
    if (!(index in state.slots)) state.slots[index] = typeof initial === 'function' ? initial() : initial
    return [state.slots[index], value => {
      state.slots[index] = typeof value === 'function' ? value(state.slots[index]) : value
    }]
  },
  useRef(value) {
    const index = active.cursor++
    if (!(index in active.slots)) active.slots[index] = { current: value }
    return active.slots[index]
  },
  useEffect() { active.cursor++ }, // Effects need a real DOM; navigation is driven by real handlers below.
  useCallback(fn) { active.cursor++; return fn },
  useMemo(fn) { active.cursor++; return fn() }
}
const jsx = {
  jsx: (type, props) => ({ type, props: props || {} }),
  jsxs: (type, props) => ({ type, props: props || {} }),
  Fragment: 'fragment'
}
const filename = path.resolve(__dirname, '../src/renderer/src/App.tsx')
const appModule = new Module(filename, module)
appModule.filename = filename
appModule.paths = Module._nodeModulePaths(path.dirname(filename))
const originalLoad = Module._load
try {
  Module._load = function (id, ...args) {
    if (id === 'react') return react
    if (id === 'react/jsx-runtime') return jsx
    if (id === 'lucide-react') return new Proxy({}, { get: (_target, name) => props => ({ type: 'svg', props: { ...props, 'data-icon': name } }) })
    return originalLoad.call(this, id, ...args)
  }
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
  })
  // Test-only export: the public production API is unchanged.
  appModule._compile(result.outputText + '\nexports.RemoteBrowserForTest = RemoteBrowser;\n', filename)
} finally { Module._load = originalLoad }
const RemoteBrowser = appModule.exports.RemoteBrowserForTest
const previousWindow = global.window
function restoreWindow() {
  if (previousWindow === undefined) delete global.window
  else global.window = previousWindow
}
afterEach(restoreWindow)

function expand(node) {
  if (node == null || typeof node === 'boolean') return []
  if (Array.isArray(node)) return node.flatMap(expand)
  if (typeof node !== 'object') return [node]
  if (typeof node.type === 'function') return expand(node.type(node.props))
  return [{ ...node, children: expand(node.props.children) }]
}
function flatten(nodes) { return nodes.flatMap(node => typeof node === 'object' ? [node, ...flatten(node.children)] : [node]) }
function text(nodes) { return flatten(nodes).filter(node => typeof node === 'string' || typeof node === 'number').join(' ').trim() }
function listing(remote, value) {
  const canonical = normalizeRemotePath(remote, value)
  return {
    remote, path: canonical, parent: parentRemotePath(canonical),
    entries: canonical === '' ? ['Documenti', '~'].map(name => ({ name, path: childRemotePath(canonical, name) })) : []
  }
}
function browser(initialPath = '') {
  const state = { slots: [], cursor: 0 }
  const calls = [], chosen = []
  let failNext = false
  global.window = { drive: {
    cancelBrowse: async () => {},
    browseRemote: async (remote, value) => {
      calls.push(value)
      if (failNext) { failNext = false; throw new Error('Server non raggiungibile') }
      return listing(remote, value)
    }
  } }
  const props = { remote: 'casa', initialPath, onChoose: value => chosen.push(value), onClose: () => {} }
  const render = () => { active = state; state.cursor = 0; return expand(RemoteBrowser(props)) }
  const find = predicate => {
    const node = flatten(render()).find(predicate)
    assert.ok(node, 'Expected UI control is present')
    return node
  }
  const input = () => find(node => node.type === 'input' && node.props['aria-label'] === 'Percorso da esplorare')
  const button = title => find(node => node.type === 'button' && node.props.title === title)
  const buttonText = value => find(node => node.type === 'button' && text(node.children) === value)
  return {
    calls, chosen, input, button, buttonText, render,
    failOnce() { failNext = true },
    type(value) { input().props.onChange({ target: { value } }) },
    async submit() {
      find(node => node.type === 'form').props.onSubmit({ preventDefault() {} })
      // The form intentionally starts an async handler with void.
      await new Promise(resolve => setImmediate(resolve))
    }
  }
}

test('server-root shortcut is labelled Root, not Server', () => {
  const ui = browser()
  assert.equal(text(ui.button('Cartella principale del server').children), 'Root')
})
test('Home is visible as ~/ on the first render, not an empty input', () => {
  assert.equal(browser().input().props.value, '~/')
})
test('Home navigation shows ~/ but sends the empty canonical path to IPC', async () => {
  const ui = browser('/tmp')
  await ui.button('Cartella personale sul server').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  assert.deepEqual(ui.calls, [''])
})
test('Root navigation still shows and requests the absolute /', async () => {
  const ui = browser('Documenti')
  await ui.button('Cartella principale del server').props.onClick()
  assert.equal(ui.input().props.value, '/')
  assert.deepEqual(ui.calls, ['/'])
})
test('Home subfolders display ~/Documenti and remain relative internally', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  await ui.buttonText('Documenti').props.onClick()
  assert.equal(ui.input().props.value, '~/Documenti')
  assert.deepEqual(ui.calls, ['', 'Documenti'])
  await ui.buttonText('Scegli questa cartella').props.onClick()
  assert.deepEqual(ui.chosen, ['Documenti'])
})
test('Up from a Home subfolder returns to visible ~/ and can select Home', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  await ui.buttonText('Documenti').props.onClick()
  await ui.button('Cartella superiore').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  assert.equal(ui.calls.at(-1), '')
  await ui.buttonText('Scegli questa cartella').props.onClick()
  assert.deepEqual(ui.chosen, [''])
})
test('Vai understands a typed ~/Documenti without requesting a literal tilde folder', async () => {
  const ui = browser()
  ui.type('~/Documenti')
  await ui.submit()
  assert.deepEqual(ui.calls, ['Documenti'])
  assert.equal(ui.input().props.value, '~/Documenti')
})
test('Vai round-trips the displayed Home without changing the requested directory', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  await ui.submit()
  assert.deepEqual(ui.calls, ['', ''])
})
test('retrying a failed Home request does not send the display-only prefix to IPC', async () => {
  const ui = browser('/tmp')
  ui.failOnce()
  await ui.button('Cartella personale sul server').props.onClick()
  assert.equal(ui.input().props.value, '~/')
  await ui.buttonText('Riprova').props.onClick()
  assert.deepEqual(ui.calls, ['', ''])
  assert.equal(ui.input().props.value, '~/')
})
test('absolute paths are displayed and submitted without a Home prefix', async () => {
  const ui = browser('/home/server/Documenti')
  assert.equal(ui.input().props.value, '/home/server/Documenti')
  await ui.submit()
  assert.deepEqual(ui.calls, ['/home/server/Documenti'])
})
test('a real directory named ~ remains reachable rather than being confused with Home', async () => {
  const ui = browser()
  await ui.button('Cartella personale sul server').props.onClick()
  await ui.buttonText('~').props.onClick()
  assert.equal(ui.input().props.value, '~/~')
  await ui.submit()
  assert.deepEqual(ui.calls, ['', '~', '~'])
  await ui.buttonText('Scegli questa cartella').props.onClick()
  assert.deepEqual(ui.chosen, ['~'])
})
test('pasted qualified Home paths retain exactly one selected-server prefix', async () => {
  const ui = browser()
  ui.type('casa:~/Documenti')
  await ui.submit()
  assert.deepEqual(ui.calls, ['Documenti'])
  assert.equal(ui.input().props.value, '~/Documenti')
})
````
<!-- DT-REPO-FILE-END F068 -->

<a id="file-f069"></a>
### F069 — `tests/schedule.test.cjs`
**4683 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F069","path":"tests/schedule.test.cjs","mode":"100644","encoding":"utf-8","bytes":4683,"lines":76,"sha256":"01b712b9c4ac74394ca73d2ac7aae5ec950ea5aef42457550616c6f652c98974","git_blob_sha1":"752a51f3535075dd56c319fae11616c5f7e3b35b","fence":"````","final_lf":true} -->
````javascript
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
````
<!-- DT-REPO-FILE-END F069 -->

<a id="file-f070"></a>
### F070 — `tests/shortcuts.test.cjs`
**4351 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F070","path":"tests/shortcuts.test.cjs","mode":"100644","encoding":"utf-8","bytes":4351,"lines":55,"sha256":"40f65796d0787c111f0aa5957264156dfb84977844b8729d7d455bf033a67d9b","git_blob_sha1":"62adbcb79ccdd4bff20b8ab2b3ab0b5face60dc7","fence":"````","final_lf":true} -->
````javascript
const {test,after}=require('node:test')
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os')
function api(){const f=path.join(__dirname,'../src/main/shortcuts.ts');assert.ok(fs.existsSync(f),'Shortcut implementation exists');return require(f)}
const root=fs.mkdtempSync(path.join(os.tmpdir(),'dt-shortcut-'));after(()=>fs.rmSync(root,{recursive:true,force:true}))
test('shortcut argument only accepts a saved identifier, never an arbitrary path or command',()=>{
 const {requestedFolder}=api()
 assert.equal(requestedFolder(['app','--open-folder','folder-123']),'folder-123')
 assert.equal(requestedFolder(['app']),null)
 for(const args of [['app','--open-folder'],['app','--open-folder','../../test'],['app','--open-folder','file;rm -rf'],['app','--open-folder','folder-123','--open-folder','folder-456']])assert.throws(()=>requestedFolder(args),/collegamento|identificativo/i)
})
test('shortcut filename cannot escape the selected parent directory',()=>{
 const {shortcutName}=api()
 assert.equal(shortcutName('../Files: personal'), '..-Files- personal')
 assert.ok(!shortcutName('CON').match(/^CON$/i))
 assert.equal(shortcutName('  '),'Cartella')
})
test('desktop launcher quotes the executable safely and includes only a saved ID',()=>{
 const {desktopEntry}=api()
 const text=desktopEntry('/home/user/My app 100%/Drive.AppImage','folder-123','A\nB')
 assert.ok(text.includes('Exec="/home/user/My app 100%%/Drive.AppImage" --open-folder folder-123'))
 assert.ok(!text.includes('Name=A\nB'))
 assert.ok(text.includes('Terminal=false'))
 assert.throws(()=>desktopEntry('/app\nbad','folder-123','name'),/eseguibile/)
})
test('Linux shortcut is a regular executable launcher, not a symlink to the mounted folder',()=>{
 const {writeLinuxShortcut}=api(), dest=path.join(root,'Files.desktop')
 writeLinuxShortcut(dest,'/usr/bin/drive-tambu','folder-123','Files')
 assert.ok(fs.statSync(dest).isFile());if(process.platform !== 'win32')assert.ok(fs.statSync(dest).mode&0o100)
 assert.ok(fs.readFileSync(dest,'utf8').includes('--open-folder folder-123'))
})
test('Linux launcher never follows a symlink and overwrites its target',t=>{
 if(process.platform === 'win32'){t.skip('POSIX symlink permissions; exercised on the Linux job');return}
 const {writeLinuxShortcut}=api(),target=path.join(root,'do-not-touch'),dest=path.join(root,'symlink.desktop')
 fs.writeFileSync(target,'safe');fs.symlinkSync(target,dest)
 assert.throws(()=>writeLinuxShortcut(dest,'/usr/bin/app','folder-123','Files'),/simbolico|collegamento|destinazione/i)
 assert.equal(fs.readFileSync(target,'utf8'),'safe')
})
test('opening a saved shortcut connects once, waits for readiness and uses the latest path',async()=>{
 const {SavedFolderOpener}=api();let calls=0,opened=[],state='disconnected'
 const opener=new SavedFolderOpener({find:()=>({localPath:'/new-location'}),state:()=>({status:state,detail:''}),connect:async()=>{calls++;state='connecting';setImmediate(()=>{state='connected'})},open:async p=>{opened.push(p);return ''},stopping:()=>false},200,2)
 await Promise.all([opener.open('folder-123'),opener.open('folder-123')])
 assert.equal(calls,1);assert.deepEqual(opened,['/new-location'])
})
test('shortcut waiting fails with a finite timeout and does not open an empty folder',async()=>{
 const {SavedFolderOpener}=api();let opened=false
 const opener=new SavedFolderOpener({find:()=>({localPath:'/mount'}),state:()=>({status:'connecting',detail:''}),connect:async()=>{},open:async()=>{opened=true;return ''},stopping:()=>false},10,2)
 await assert.rejects(opener.open('folder-123'),/disponibile|attesa/i);assert.equal(opened,false)
})
test('shortcut propagates missing saved folder and connection error without creating a path',async()=>{
 const {SavedFolderOpener}=api()
 const missing=new SavedFolderOpener({find:()=>{throw new Error('Cartella rimossa')},state:()=>({status:'disconnected'}),connect:async()=>{throw new Error('should not connect')},open:async()=>'',stopping:()=>false})
 await assert.rejects(missing.open('folder-123'),/rimossa/)
 const bad=new SavedFolderOpener({find:()=>({localPath:'/mount'}),state:()=>({status:'error',detail:'Accesso non autorizzato'}),connect:async()=>{},open:async()=>'',stopping:()=>false})
 await assert.rejects(bad.open('folder-123'),/Accesso non autorizzato/)
})
````
<!-- DT-REPO-FILE-END F070 -->

<a id="file-f071"></a>
### F071 — `tests/store.test.cjs`
**7195 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F071","path":"tests/store.test.cjs","mode":"100644","encoding":"utf-8","bytes":7195,"lines":132,"sha256":"583dbcff2e018d2d728fd0875c7161aaa3108213e5b90da486cbcab7d558397e","git_blob_sha1":"d30ed5a13af6ba4562f1b554e7289e089bc616c6","fence":"````","final_lf":true} -->
````javascript
const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const Module = require('node:module')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-store-'))
let dataRoot = root
const load = Module._load
// Only the platform boundary is replaced: ConfigStore reads/writes real temporary files.
Module._load = function(id, ...args) {
  if (id === 'electron') return { app: { getPath: () => dataRoot } }
  return load.call(this, id, ...args)
}
const { ConfigStore } = require('../src/main/store.ts')
Module._load = load
after(() => fs.rmSync(root, { recursive: true, force: true }))
let n = 0
function fresh() { dataRoot = path.join(root, String(++n)); return new ConfigStore() }
function mount(id = 'mount-123') {
  return { id, name: 'Documenti', remote: 'casa', remotePath: '/documenti', localPath: path.join(root, 'links', id), autoConnect: true,
    backup: { enabled: false, intervalMinutes: 60, destination: '', retentionDays: 30 } }
}
test('new settings follow the system theme and do not invent a server', () => {
  const store = fresh()
  assert.equal(store.settings.theme, 'system')
  assert.equal(store.settings.defaultRemote, '')
})
test('theme persists after restarting the app', () => {
  const store = fresh()
  store.saveSettings({ ...store.settings, theme: 'dark' })
  assert.equal(new ConfigStore().settings.theme, 'dark')
})
test('existing schema 1 settings and folders survive migration', () => {
  dataRoot = path.join(root, String(++n)); fs.mkdirSync(dataRoot)
  fs.writeFileSync(path.join(dataRoot, 'config.json'), JSON.stringify({schemaVersion: 1,
    settings: {rcloneExecutable: 'rclone', cacheMaxSize: '5G', startAtLogin: true, closeToTray: true}, mounts: [mount()]}))
  const store = new ConfigStore()
  assert.equal(store.mounts[0].remote, 'casa')
  assert.equal(store.settings.startAtLogin, true)
  assert.equal(store.settings.theme, 'system')
})
test('save canonicalizes a fully qualified pasted path', () => {
  const store = fresh(), m = mount()
  m.remotePath = 'casa:/documenti'
  store.saveMount(m)
  assert.equal(store.find(m.id).remotePath, '/documenti')
})
test('a backup may not contain a connected folder', () => {
  const store = fresh(), m = mount()
  m.backup.enabled = true; m.backup.destination = path.join(root, 'links')
  assert.throws(() => store.saveMount(m), /backup/i)
})
test('two backup destinations cannot overlap', () => {
  const store = fresh(), a = mount('mount-aaa'), b = mount('mount-bbb')
  a.backup.enabled = true; a.backup.destination = path.join(root, 'backups', 'a')
  b.backup.enabled = true; b.backup.destination = path.join(root, 'backups', 'a', 'nested')
  store.saveMount(a)
  assert.throws(() => store.saveMount(b), /backup/i)
})
test('system root is never accepted as the local linked folder', () => {
  const store = fresh(), m = mount()
  m.localPath = path.parse(root).root
  assert.throws(() => store.saveMount(m), /radice|principale|sistema/i)
})
test('a malformed folder name is rejected with a helpful validation message', () => {
  const store = fresh(), m = mount()
  m.name = 17
  assert.throws(() => store.saveMount(m), /Inserisci un nome/)
})
test('an incomplete settings file is rejected without overwriting the file', () => {
  dataRoot = path.join(root, String(++n)); fs.mkdirSync(dataRoot)
  const text = JSON.stringify({schemaVersion: 1, settings: null, mounts: []})
  const file = path.join(dataRoot, 'config.json'); fs.writeFileSync(file, text)
  assert.throws(() => new ConfigStore(), /config.json non riconosciuto/)
  assert.equal(fs.readFileSync(file, 'utf8'), text)
})

test('weekly schedule survives save and restart with a persisted next occurrence',()=>{
  const store=fresh(),m=mount();m.backup.enabled=true;m.backup.destination=path.join(root,'weekly-backup')
  m.backup.schedule={mode:'weekly',weekdays:[0],time:'02:00'}
  store.saveMount(m)
  const saved=store.find(m.id)
  assert.ok(saved.nextBackupAt,'Next run is persisted')
  assert.equal(new Date(saved.nextBackupAt).getDay(),0)
  assert.equal(new Date(saved.nextBackupAt).getHours(),2)
  assert.deepEqual(new ConfigStore().find(m.id).backup.schedule,m.backup.schedule)
})
test('editing the folder name does not postpone an existing scheduled backup',()=>{
  const store=fresh(),m=mount();m.backup.enabled=true;m.backup.destination=path.join(root,'interval-backup');m.backup.schedule={mode:'interval',minutes:17};store.saveMount(m)
  const first=store.find(m.id);assert.ok(first.nextBackupAt)
  store.saveMount({...first,name:'Renamed'})
  assert.equal(store.find(m.id).nextBackupAt,first.nextBackupAt)
})
test('global refresh setting is saved and per-folder overrides survive restart',()=>{
  const store=fresh();store.saveSettings({...store.settings,directoryRefreshSeconds:90})
  const m=mount();m.directoryRefreshSeconds=17;store.saveMount(m)
  const loaded=new ConfigStore()
  assert.equal(loaded.settings.directoryRefreshSeconds,90)
  assert.equal(loaded.find(m.id).directoryRefreshSeconds,17)
})
test('invalid frequency and invalid per-folder refresh are blocked before persistence',()=>{
  const store=fresh(),m=mount();m.directoryRefreshSeconds=-1
  assert.throws(()=>store.saveMount(m),/aggiornamento|intervallo/i)
  delete m.directoryRefreshSeconds;m.backup.schedule={mode:'weekly',weekdays:[],time:'02:00'}
  assert.throws(()=>store.saveMount(m),/giorn|programma/i)
})

test('shortcut destinations outside managed data are allowed and inside mount or backup are refused',()=>{
  const {validateShortcutLocation}=require('../src/main/store.ts'), m=mount()
  m.backup.destination=path.join(root,'backup-managed')
  assert.doesNotThrow(()=>validateShortcutLocation(path.join(root,'Desktop','Files.lnk'),[m]))
  assert.throws(()=>validateShortcutLocation(path.join(m.localPath,'Files.lnk'),[m]),/fuori/)
  assert.throws(()=>validateShortcutLocation(path.join(m.backup.destination,'Files.lnk'),[m]),/fuori/)
})
test('renderer input cannot rewrite stored scheduling timestamps',()=>{
  const store=fresh(),m=mount();m.backup.enabled=true;m.backup.destination=path.join(root,'timestamp-backup');store.saveMount(m)
  const saved=store.find(m.id)
  store.saveMount({...saved,nextBackupAt:'2100-01-01T00:00:00Z',lastBackupAt:'2100-01-01T00:00:00Z'})
  assert.equal(store.find(m.id).nextBackupAt,saved.nextBackupAt)
  assert.equal(store.find(m.id).lastBackupAt,saved.lastBackupAt)
})
test('upgrading a legacy config keeps an exact backup and preserves arbitrary intervals',()=>{
  dataRoot=path.join(root,String(++n));fs.mkdirSync(dataRoot)
  const m=mount();m.backup.intervalMinutes=17
  const text=JSON.stringify({schemaVersion:1,settings:{rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'dark',defaultRemote:'casa',startAtLogin:false,closeToTray:true},mounts:[m]})
  fs.writeFileSync(path.join(dataRoot,'config.json'),text)
  const store=new ConfigStore()
  assert.equal(fs.readFileSync(path.join(dataRoot,'config.json.before-0.3.bak'),'utf8'),text)
  assert.deepEqual(store.find(m.id).backup.schedule,{mode:'interval',minutes:17})
  assert.equal(store.settings.directoryRefreshSeconds,120)
})
````
<!-- DT-REPO-FILE-END F071 -->

<a id="file-f072"></a>
### F072 — `tests/syntax.test.cjs`
**910 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F072","path":"tests/syntax.test.cjs","mode":"100644","encoding":"utf-8","bytes":910,"lines":14,"sha256":"8de52f0cc985bfd6920bcf7bcedeedc2b30be5be63c023b5b1be8bb876b03142","git_blob_sha1":"cf220de3b51dc68d2ed9756cf68570a367009713","fence":"````","final_lf":true} -->
````javascript
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript')
test('all TypeScript and TSX sources parse without compiler recovery',()=>{
 const errors=[]
 function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name)
  if(entry.isDirectory())visit(file)
  else if(/\.tsx?$/.test(file)){
   const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)
   for(const diagnostic of source.parseDiagnostics){const where=source.getLineAndCharacterOfPosition(diagnostic.start||0);errors.push(`${file}:${where.line+1}:${where.character+1}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText,' ')}`)}
  }
 }}
 visit(path.join(__dirname,'../src'))
 assert.deepEqual(errors,[])
})
````
<!-- DT-REPO-FILE-END F072 -->

<a id="file-f073"></a>
### F073 — `tests/ui.test.cjs`
**4797 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F073","path":"tests/ui.test.cjs","mode":"100644","encoding":"utf-8","bytes":4797,"lines":74,"sha256":"01935d635175b14532f6e2975c76b84b9535cfc241329864a3501f58d51df193","git_blob_sha1":"6a3ac19e78b9b887ca7bd672403f78b9298df237","fence":"````","final_lf":true} -->
````javascript
// Shallow component contracts without a browser. Effects/native APIs are separate boundaries.
// These do not replace a packaged Electron/Windows smoke test.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), Module = require('node:module'), ts = require('typescript')
let hook = 0, overrides = {}, uid = 0
const react = {
  useState: initial => { const key = hook++; return [Object.hasOwn(overrides, key) ? overrides[key] : (typeof initial === 'function' ? initial() : initial), () => {}] },
  useEffect: () => {}, useLayoutEffect: () => {}, useMemo: fn => fn(), useCallback: fn => fn,
  useRef: value => ({current: value}), useId: () => `field-${++uid}`
}
const jsx = {jsx: (type, props) => ({type, props: props || {}}), jsxs: (type, props) => ({type, props: props || {}}), Fragment: 'fragment'}
const oldLoad = Module._load
Module._load = function(id, ...args) {
  if (id === 'react') return react
  if (id === 'react/jsx-runtime') return jsx
  if (id === 'lucide-react') return new Proxy({}, {get: (_t, key) => props => ({type: 'svg', props: {...props, 'data-icon': key}})})
  return oldLoad.call(this, id, ...args)
}
require.extensions['.tsx'] = (module, filename) => {
  let result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {fileName: filename, compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText
  if (filename.endsWith('/App.tsx') || filename.endsWith('\\App.tsx')) result += '\nexports.__components = { MountModal, SettingsPage, App };\n'
  module._compile(result, filename)
}
const components = require('../src/renderer/src/App.tsx').__components
Module._load = oldLoad
function tree(component, props, values = {}) {
  hook = 0; overrides = values
  function visit(node) {
    if (Array.isArray(node)) return node.flatMap(visit)
    if (node == null || typeof node === 'boolean') return []
    if (typeof node !== 'object') return [node]
    if (typeof node.type === 'function') return visit(node.type(node.props))
    return [{...node, children: visit(node.props?.children)}]
  }
  return visit(component(props))
}
function flatten(nodes) { return nodes.flatMap(n => typeof n === 'object' ? [n, ...flatten(n.children || [])] : [n]) }
function text(nodes) { return flatten(nodes).filter(n => typeof n === 'string' || typeof n === 'number').join(' ') }
const settings = {rcloneExecutable: 'rclone', cacheMaxSize: '5G', startAtLogin: false, closeToTray: true, theme: 'system', defaultRemote: ''}
const snap = {appVersion: '0.2.0', platform: 'win32', windowMode: 'compact', dark: false, settings, mounts: [], log: []}
const deps = {rclone: {ok: true, detail: 'rclone'}, remotes: ['casa'], note: ''}
const m = {id: 'folder-123', name: '', remote: 'casa', remotePath: '/', localPath: '', autoConnect: true, backup: {enabled: false, intervalMinutes: 60, destination: '', retentionDays: 30}}
const noop = () => {}

test('new folder has a server browser and does not ask for a technical rclone profile', () => {
  const nodes = tree(components.MountModal, {original: m, remotes: ['casa'], platform: 'win32', onClose: noop, onSave: noop, onDelete: noop, onSettings: noop, notify: noop, apiBusy: false})
  assert.ok(!text(nodes).includes('Remote rclone'))
  assert.ok(flatten(nodes).some(n => n.type === 'button' && n.props['aria-label'] === 'Sfoglia cartelle sul server'))
})
test('a user can select dark mode from settings', async () => {
  let saved
  const nodes = tree(components.SettingsPage, {snapshot: snap, deps, onSave: async s => {saved = s}, onCheck: noop, busy: false})
  const dark = flatten(nodes).find(n => n.type === 'button' && n.props['aria-label'] === 'Tema scuro')
  assert.ok(dark, 'Dark theme selector is visible')
  await dark.props.onClick()
  assert.equal(saved.theme, 'dark')
})
test('compact view exposes an Expand control that asks the main process to expand', async () => {
  let mode
  global.window = {drive: {setWindowMode: async m => {mode = m}}}
  const nodes = tree(components.App, {}, {0: snap, 1: deps})
  const button = flatten(nodes).find(n => n.type === 'button' && n.props['aria-label'] === 'Apri finestra completa')
  assert.ok(button, 'Expand control is visible')
  await button.props.onClick()
  assert.equal(mode, 'expanded')
})
test('the whole lower-left Settings control is a button, not a readiness claim', () => {
  const nodes = tree(components.App, {}, {0: {...snap, windowMode: 'expanded'}, 1: deps})
  const bottom = flatten(nodes).find(n => n.props?.className === 'sidebar-bottom')
  assert.ok(bottom)
  assert.ok(flatten(bottom.children).some(n => n.type === 'button' && text(n.children).includes('Impostazioni')))
  assert.ok(!text(nodes).includes('Sistema pronto'))
})
````
<!-- DT-REPO-FILE-END F073 -->

<a id="file-f074"></a>
### F074 — `tests/window.test.cjs`
**6959 byte originali** | UTF-8 integrale | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F074","path":"tests/window.test.cjs","mode":"100644","encoding":"utf-8","bytes":6959,"lines":84,"sha256":"eb9166464c6fedca21c764c618150d3d3f9ccfc01c7bed94f7ca9e4119cbbe34","git_blob_sha1":"573bbc2323c67c85b752b7ab707e53e6c49fb334","fence":"````","final_lf":true} -->
````javascript
const { test, after } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), Module = require('node:module')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-tambu-window-'))
after(() => fs.rmSync(tmp, { recursive: true, force: true }))
const handlers = new Map(), windows = [], opened = []
const shortcutFile = path.join(tmp, process.platform === 'win32' ? 'Files.lnk' : 'Files.desktop')
fs.writeFileSync(path.join(tmp, 'config.json'), JSON.stringify({schemaVersion:1,settings:{rcloneExecutable:'rclone',cacheMaxSize:'5G',theme:'system',defaultRemote:'casa',startAtLogin:false,closeToTray:true,directoryRefreshSeconds:120},mounts:[{id:'shortcut-123',name:'Files',remote:'casa',remotePath:'/files',localPath:path.join(tmp,'linked'),autoConnect:false,backup:{enabled:false,intervalMinutes:0,destination:'',retentionDays:30}}]}))
class Window extends EventEmitter {
  constructor(options) { super(); this.options = options; this.bounds = { x: 0, y: 0, width: options.width, height: options.height }; this.visible = false;
    this.webContents = new EventEmitter(); this.webContents.mainFrame = {}; this.webContents.send = () => {}; this.webContents.setWindowOpenHandler = () => {}; windows.push(this) }
  isDestroyed() { return false } isVisible() { return this.visible } isFocused() { return false } isMinimized() { return false } isMaximized() { return false }
  show() { this.visible = true } hide() { this.visible = false } focus() {} restore() {} unmaximize() {} minimize() {} close() { this.emit('close', {preventDefault() {}}) }
  setBounds(b) { this.bounds = b } getBounds() { return this.bounds } setMinimumSize() {} setResizable(b) { this.resizable = b }
  setAlwaysOnTop() {} setSkipTaskbar(b) { this.skipTaskbar = b } setBackgroundColor(color) { this.background = color }
  async loadFile() { this.emit('ready-to-show') } async loadURL() { this.emit('ready-to-show') }
}
const theme = new EventEmitter(); let source = 'system'
Object.defineProperty(theme, 'themeSource', { get: () => source, set: v => { source = v; theme.shouldUseDarkColors = v === 'dark'; theme.emit('updated') } })
theme.shouldUseDarkColors = false
const app = new EventEmitter()
Object.assign(app, {whenReady: () => Promise.resolve(), requestSingleInstanceLock: () => true, getVersion: () => '0.2.0', getPath: () => tmp, getAppPath: () => path.resolve(__dirname, '..'), quit: () => {}, isPackaged: false})
const screen = new EventEmitter(); Object.assign(screen, {getDisplayNearestPoint: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getDisplayMatching: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}}), getCursorScreenPoint: () => ({x: 500, y: 500}), getPrimaryDisplay: () => ({workArea: {x: 0, y: 0, width: 1920, height: 1040}})})
class Tray extends EventEmitter { setToolTip() {} setContextMenu() {} getBounds() { return {x: 1850, y: 1040, width: 20, height: 20} } }
const electron = { app, BrowserWindow: Window, screen, nativeTheme: theme, Tray,
  dialog: { showErrorBox: (_title, msg) => { throw new Error(msg) }, showMessageBox: async () => ({response: 0}), showSaveDialog: async () => ({canceled:false,filePath:shortcutFile}) },
  ipcMain: {handle: (name, fn) => handlers.set(name, fn)},
  nativeImage: {createFromPath: () => ({resize: () => ({})})}, Menu: {buildFromTemplate: v => v, setApplicationMenu: () => {}}, shell: {openPath: async p => {opened.push(p);return ''},writeShortcutLink:(dest,_operation,options)=>{fs.writeFileSync(dest,JSON.stringify(options));return true}} }
const original = Module._load
Module._load = function(id, ...args) {
  if (id === 'electron') return electron
  if (id === './backups') return {BackupManager: class { startScheduler() {} state() { return {status: 'running', detail: 'Copia...', progress:{phase:'copying',percent:42,bytes:42,totalBytes:100,speed:1,checks:1,transfers:0}} } stop() {} }}
  if (id === './mounts') return {MountManager: class { hasRuntime(){return true} state() { return {status: 'connected', detail: ''} } needsRefreshReconnect(){return true} async connect(){} async disconnectAll() {} }}
  return original.call(this, id, ...args)
}
require('../src/main/index.ts')
Module._load = original
const ready = () => new Promise(resolve => setImmediate(resolve))
function event() { return {sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame} }
test('starts in a compact panel, not a full-size application window', async () => {
  await ready()
  assert.equal(windows.length, 1)
  assert.equal(windows[0].bounds.width, 430)
  assert.equal(handlers.get('drive:snapshot')(event()).windowMode, 'compact')
})
test('expanding and shrinking reuse the same window and do not restart mounts', async () => {
  await ready()
  assert.equal(typeof handlers.get('drive:setWindowMode'), 'function')
  await handlers.get('drive:setWindowMode')(event(), 'expanded')
  assert.equal(windows.length, 1)
  assert.equal(windows[0].skipTaskbar, false)
  assert.equal(handlers.get('drive:snapshot')(event()).windowMode, 'expanded')
  await handlers.get('drive:setWindowMode')(event(), 'compact')
  assert.equal(windows[0].bounds.width, 430)
})
test('persisting dark mode updates both native dialogs and the renderer snapshot', async () => {
  await ready()
  const snap = handlers.get('drive:snapshot')(event())
  await handlers.get('drive:saveSettings')(event(), {...snap.settings, theme: 'dark'})
  assert.equal(theme.themeSource, 'dark')
  assert.equal(handlers.get('drive:snapshot')(event()).dark, true)
})
test('renderer APIs reject another window and subframes', async () => {
  await ready()
  assert.throws(() => handlers.get('drive:snapshot')({sender: {}}), /autorizzata/)
  assert.throws(() => handlers.get('drive:snapshot')({...event(), senderFrame: {}}), /autorizzata/)
})

test('snapshot forwards backup statistics and the refresh-reconnect notice',async()=>{
  await ready();const m=handlers.get('drive:snapshot')(event()).mounts[0]
  assert.equal(m.backupProgress.percent,42);assert.equal(m.refreshNeedsReconnect,true)
})
test('Create shortcut is a guarded IPC operation and writes the chosen launcher',async()=>{
  await ready();const handler=handlers.get('drive:createShortcut');assert.equal(typeof handler,'function')
  await assert.rejects(handler({sender:{}} ,'shortcut-123'),/autorizzata/)
  app.isPackaged=true
  try {const result=await handler(event(),'shortcut-123');assert.equal(result,shortcutFile);assert.ok(fs.readFileSync(result,'utf8').includes('--open-folder shortcut-123'))}
  finally {app.isPackaged=false}
})
test('second-instance shortcut arguments open the saved folder in the existing app',async()=>{
  await ready();app.emit('second-instance',{},['drive-tambu','--open-folder','shortcut-123']);await ready()
  assert.ok(opened.includes(path.join(tmp,'linked')));assert.equal(windows.length,1)
})
````
<!-- DT-REPO-FILE-END F074 -->

<a id="evidenze"></a>
## 12. Evidenze aggiuntive, esterne al repository corrente
I seguenti JSON provengono dagli artifact della caratterizzazione precedente: run `39120545584`, commit `a8134367539ee6ef0942243d2735356d1fe6766d`. Sono conservati per non perdere la distinzione emersa fra Windows e Linux. Non certificano la successiva integrazione 0.4.0 e non contengono i documenti personali dell'utente.
### E001 — win32.json
```json
{
  "id": "E001",
  "name": "win32.json",
  "origin": "GitHub Actions run 39120545584, attachment supplied in conversation",
  "bytes": 3001,
  "sha256": "5d3179c1c32eae35f242ad9224c634d2eae5c2fb1faa83b74fb46071440a4b53"
}
```
<!-- DT-EVIDENCE-BEGIN {"id":"E001","name":"win32.json","origin":"GitHub Actions run 39120545584, attachment supplied in conversation","bytes":3001,"sha256":"5d3179c1c32eae35f242ad9224c634d2eae5c2fb1faa83b74fb46071440a4b53"} -->
````json
{
  "format": 1,
  "purpose": "stock-rclone-characterization",
  "productionSafetyCertified": false,
  "platform": "win32",
  "node": "v22.23.3",
  "startedAt": "2026-10-18T10:46:25.337Z",
  "status": "completed",
  "scenarios": [
    {
      "name": "basic-SFTP-mount-write-read",
      "status": "completed",
      "bytes": 65536,
      "expectedSha256": "616a05fd5b3267afdc2f346368aa5e31a6c76266a96353ad701d798a9e0f5dab",
      "remoteSha256": "616a05fd5b3267afdc2f346368aa5e31a6c76266a96353ad701d798a9e0f5dab"
    },
    {
      "name": "open-writer-during-stock-unmount",
      "status": "completed",
      "initialBytesAcknowledged": 32768,
      "initialSha256": "ef1f102aed3904c861b8698e4408854cc7e0ac19b7d2e999f490be1e02bde123",
      "observedBeforeUnmount": {
        "kind": "known",
        "queued": 0,
        "uploading": 0,
        "errored": 0,
        "outOfSpace": false,
        "openWriters": "not-observed"
      },
      "note": "An acknowledged local fsync and an empty upload queue are not a write-barrier receipt.",
      "unmountWithOpenWriter": "accepted",
      "existingHandleWriteAfterRequest": "rejected-or-timeout",
      "writeDetail": "UNKNOWN: UNKNOWN: unknown error, write",
      "productionSafetyCertified": false
    },
    {
      "name": "closed-pending-file-recovery-after-daemon-restart",
      "status": "completed",
      "before": {
        "kind": "known",
        "queued": 1,
        "uploading": 0,
        "errored": 0,
        "outOfSpace": false,
        "openWriters": "not-observed"
      },
      "serverStoppedBeforeUnmount": true,
      "remoteSha256WhileOffline": null,
      "bytes": 131072,
      "expectedSha256": "c3cc96f60d8c376d1a3c2709a995bb683a090dff2334ddc1060141f1e7164868",
      "remoteSha256": "c3cc96f60d8c376d1a3c2709a995bb683a090dff2334ddc1060141f1e7164868",
      "note": "One COMPLETE CLOSED synthetic file after a controlled daemon restart; NOT sparse-file, crash, conflict or general recovery certification."
    }
  ],
  "limits": [
    "Not an implementation of a write barrier or an approval to terminate production mounts.",
    "Only synthetic closed-file recovery and open-handle behavior; not sparse-file recovery, conflicting edits, crash durability or uninstall safety."
  ],
  "osRelease": "10.0.20348",
  "commit": "a8134367539ee6ef0942243d2735356d1fe6766d",
  "runnerImage": {
    "os": "win22",
    "version": "20261012.333.1"
  },
  "rclone": {
    "sha256": "492648a3867dbc620188a305e05ff3216aecbf4622bf1a6b5b978ed9c939e18c",
    "version": "rclone v1.74.4\n- os/version: Microsoft Windows Server 2022 Datacenter 21H2 21H2 (64 bit)\n- os/kernel: 10.0.20348.5622 (x86_64)\n- os/type: windows\n- os/arch: amd64\n- go/version: go1.26.5\n- go/linking: static\n- go/tags: cmount"
  },
  "driver": {
    "name": "WinFsp",
    "version": "2025",
    "installerExit": "0",
    "installerSha256": "073a70e00f77423e34bed98b86e600def93393ba5822204fac57a29324db9f7a"
  },
  "finishedAt": "2026-10-18T10:46:37.068Z"
}
````
<!-- DT-EVIDENCE-END E001 -->
### E002 — linux.json
```json
{
  "id": "E002",
  "name": "linux.json",
  "origin": "GitHub Actions run 39120545584, attachment supplied in conversation",
  "bytes": 3186,
  "sha256": "2e0f9a2b65589f8268bb453903abe6fd1430b6b50c767658049e80a3bb14a0bb"
}
```
<!-- DT-EVIDENCE-BEGIN {"id":"E002","name":"linux.json","origin":"GitHub Actions run 39120545584, attachment supplied in conversation","bytes":3186,"sha256":"2e0f9a2b65589f8268bb453903abe6fd1430b6b50c767658049e80a3bb14a0bb"} -->
````json
{
  "format": 1,
  "purpose": "stock-rclone-characterization",
  "productionSafetyCertified": false,
  "platform": "linux",
  "node": "v22.23.3",
  "startedAt": "2026-10-18T10:46:20.579Z",
  "status": "completed",
  "scenarios": [
    {
      "name": "basic-SFTP-mount-write-read",
      "status": "completed",
      "bytes": 65536,
      "expectedSha256": "d4ba9e43fdd9e49fed752640aec1942386966aaa4042aeed2311ea279b88795b",
      "remoteSha256": "d4ba9e43fdd9e49fed752640aec1942386966aaa4042aeed2311ea279b88795b"
    },
    {
      "name": "open-writer-during-stock-unmount",
      "status": "completed",
      "initialBytesAcknowledged": 32768,
      "initialSha256": "00d44e7c0f2032d8a137374512032e4083138fb5aef2f0830ecd896bc06a9074",
      "observedBeforeUnmount": {
        "kind": "known",
        "queued": 0,
        "uploading": 0,
        "errored": 0,
        "outOfSpace": false,
        "openWriters": "not-observed"
      },
      "note": "An acknowledged local fsync and an empty upload queue are not a write-barrier receipt.",
      "unmountWithOpenWriter": "refused-or-timeout",
      "unmountDetail": "RC mount/unmount: HTTP 500: {\n\t\"error\": \"exit status 1: fusermount3: failed to unmount /home/runner/work/_temp/drive-tambu-sacrificial-iXqtk1/mount: Device or resource busy\",\n\t\"input\": {\n\t\t\"mountPoint\": \"/home/runner/work/_temp/drive-tambu-sacrificial-iXqtk1/mount\"\n\t},\n\t\"path\": \"mount/unmount\",\n\t\"status\": 500\n}\n",
      "existingHandleWriteAfterRequest": "acknowledged",
      "productionSafetyCertified": false
    },
    {
      "name": "closed-pending-file-recovery-after-daemon-restart",
      "status": "completed",
      "before": {
        "kind": "known",
        "queued": 1,
        "uploading": 0,
        "errored": 0,
        "outOfSpace": false,
        "openWriters": "not-observed"
      },
      "serverStoppedBeforeUnmount": true,
      "remoteSha256WhileOffline": null,
      "bytes": 131072,
      "expectedSha256": "faf1d89b137e1d49a7c3715bb12701cbd1e6d162c9dc9c979da00646f5be0950",
      "remoteSha256": "faf1d89b137e1d49a7c3715bb12701cbd1e6d162c9dc9c979da00646f5be0950",
      "note": "One COMPLETE CLOSED synthetic file after a controlled daemon restart; NOT sparse-file, crash, conflict or general recovery certification."
    }
  ],
  "limits": [
    "Not an implementation of a write barrier or an approval to terminate production mounts.",
    "Only synthetic closed-file recovery and open-handle behavior; not sparse-file recovery, conflicting edits, crash durability or uninstall safety."
  ],
  "osRelease": "6.17.0-1022-azure",
  "commit": "a8134367539ee6ef0942243d2735356d1fe6766d",
  "runnerImage": {
    "os": "ubuntu24",
    "version": "20261012.334.1"
  },
  "rclone": {
    "sha256": "9f56ca5edfac24a3ed37226c2ba1de69f1ec9e05fa2526cddee5cd97e202be6b",
    "version": "rclone v1.74.4\n- os/version: ubuntu 24.04 (64 bit)\n- os/kernel: 6.17.0-1022-azure (x86_64)\n- os/type: linux\n- os/arch: amd64\n- go/version: go1.26.5\n- go/linking: static\n- go/tags: none"
  },
  "driver": {
    "name": "FUSE",
    "version": "fusermount3 version: 3.14.0"
  },
  "finishedAt": "2026-10-18T10:46:30.583Z"
}
````
<!-- DT-EVIDENCE-END E002 -->
<a id="binari"></a>
## 13. Contenuti integrali: immagini e icone
Questi blocchi conservano i byte esatti delle risorse. Per ricostruire un file, decodificare il relativo Base64 e verificare lo SHA-256 del manifest. Non sono segnaposto, anteprime ridotte o collegamenti a risorse esterne. Per modifiche a codice e CSS questa sezione può essere ignorata.

<a id="file-f075"></a>
### F075 — `resources/icon.ico`
**49116 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F075","path":"resources/icon.ico","mode":"100644","encoding":"base64","bytes":49116,"lines":null,"sha256":"009910716552d6a819d4642963947822f4c49b4c98c3e08390ef17adf825ff2e","git_blob_sha1":"37d2a1aaa434c39f13a0265fb17d9e862b4c0b0f","fence":"````","final_lf":null} -->
````base64
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
````
<!-- DT-REPO-FILE-END F075 -->

<a id="file-f076"></a>
### F076 — `resources/icon.png`
**40222 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F076","path":"resources/icon.png","mode":"100644","encoding":"base64","bytes":40222,"lines":null,"sha256":"bbfaf0cbd6f75bbc043f664332963289a3517963bfc8f0f375aba2f439dbf650","git_blob_sha1":"e9a32bb782563f5fc98fe9bb47bc0caf906514fd","fence":"````","final_lf":null} -->
````base64
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
````
<!-- DT-REPO-FILE-END F076 -->

<a id="file-f077"></a>
### F077 — `resources/icons/128x128.png`
**11543 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F077","path":"resources/icons/128x128.png","mode":"100644","encoding":"base64","bytes":11543,"lines":null,"sha256":"82ef37992af12c1c5d3255ced79c4083aa07b6d4952374f7a9c3769aad990046","git_blob_sha1":"1d6c80e31f99a46d9b1334f273b24e9b8387486d","fence":"````","final_lf":null} -->
````base64
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
T9NpOk3PG/r/IE5Z6rWFsksAAAAASUVORK5CYII=
````
<!-- DT-REPO-FILE-END F077 -->

<a id="file-f078"></a>
### F078 — `resources/icons/16x16.png`
**759 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F078","path":"resources/icons/16x16.png","mode":"100644","encoding":"base64","bytes":759,"lines":null,"sha256":"39ea2122d8b786ec6d8f417f38980129da5618042e5f0fb613de77307853103f","git_blob_sha1":"a64db48ac8ab863179a400d2496579567037b400","fence":"````","final_lf":null} -->
````base64
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACvklEQVR4nE2TvYtcZRTGf+fc9947
Hzs7MeMHxriyrkYFC2ExCiYRtPCjELQUIZ1/gWARJJVgJ9iltRD/AAuLoEQULRI0MSi4GlYTN4m7
62xmZzJz733fcyzG3eTA4amep3g+hNXV/NULF/Sl907eMz760Wvt/sGVXDWwdwbRjPFklv7+Zzq7
sTn8Ze30U1/8DhXuIoC++P7XS93Dz3za77SP97olmQI+f3dwg6qGW6OK4W7NLOo3saneOf/h4Kqs
vnsm7668+VV/cN+xXhqlbqeQoIo7mM3J7lBViVu7M3Z2G/f2/dlsPP7BlhZOhGLlrROS945Nh1vJ
8zxLQJ4JOJS5kCtYAiUhCIIyHe3ErDjwPH/NXg4i5RE096aC55bFHx7g4AQVLq7Xcv3fJJgxvl0z
HNVUKVAUhQDuSZ4MRZZbFUUOdZVTbyzGIoeYoMzg8rLpr1eTZCo0MQcPnLtcybe/RRYKBMcDCQwh
w9kaW2hM5+oOBw+U8vqhEhWYNdAuYPVI9Esfb1M3kAEhkSEOdRKiiYQMQkDcoY5w9sfIzth4ejmw
MdLqiQe07LXgxhRKB+V/l3FFFVKiub4Zf749TevXNp3tkTFYVC5diSwNCMLcVGxekwDzqFSVTCEZ
od8LjwmWPXSv8OiDBZnCrIagZMkEFcUNEqDWJILC1q5ybdvod5DFDu1eR4t2AQIkgyJAq4Q/b0a2
d3OCgsVESIYExydVxgefVzwygJT8rib6fiNVhCsbzqwpaGV47UiQyFpSJIiwM1FuDn3uie0h+2gG
ZRCCuqeEEH0tFNo6N61m3xULrRd8NE2dQnC7s4M7AoK7YykRWt1QjyfnJ2HjrAAcPe2HJcXPkHB8
b4F3k/cFDTw5Zs33XtvbF8+01wV3QcQBefZU8wrmj5NMUkT2osLAUkI0Nxf746dPyi9BDHf5Dwpw
fUE6CwFOAAAAAElFTkSuQmCC
````
<!-- DT-REPO-FILE-END F078 -->

<a id="file-f079"></a>
### F079 — `resources/icons/24x24.png`
**1370 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F079","path":"resources/icons/24x24.png","mode":"100644","encoding":"base64","bytes":1370,"lines":null,"sha256":"32f4a821c9567d2271d43a2a49ac34ac52afe626014bef710b7dd6f26829a357","git_blob_sha1":"f0a79fe8ce595e988afeaef89854bf196fd67a4c","fence":"````","final_lf":null} -->
````base64
iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAFIUlEQVR4nG2VXYhdVxXHf2vtfe45
czMzyaSTSWgbg23wIQXRjA8VxMmDRcG+aJ30VRB8EkKhxQcfxvGDUi2IFh8UfC506INaUbAIYqkl
OLSI/dC0tDVtqKbJNJm5H+ecvdfy4dx7ZxI8sM5a7MNZ/7X/+7/WFkBPnz5d3PPptUPnVq7J19cK
vXTP5snx3MeOl71YVKEUgATEiSdDSskHg137z9WP2rcvXx/+962/XP7FE4+8A7C6+s1ie/uXLYAA
YXX1wfLB7eeat7737H3p+LkLvbI614thOaoEQcAdAHwSOpg7TWuM6ux7w2Sj2q62SZ7fvf7Ok6/8
7Oyl9fVnwtbW+Sxnzqz3Xnttq1n7/qtfqA6fenph4dBySUsVhRgUmSae+CmIO6SUGY0Te6OWUS20
ukDb1DvNeO/h7ceX/7ix4SpsbOhn0/mT5dG7X656xVLPR+181YtVGYmqiOxXfRDIDVIyxnXL3rBl
b5RpWpIXhwsz383N+FN/e/zw28rmpoXFE4/F/uJSGg9a0AIQHOkoFBFEcBGfeFzEXcSdmXXftcjN
sI1luRBC7zuIeLz/kRfn0N6X2tHYg0twM+rWEHHMQaWrWKWz/d04Zk7OjhmYg7uAS0zj5GbyxTMb
Ph/D8VPHQFY8JzFzBjUc7TsLlREDqApBhEHtDMYQg+DZSdlom0zTJJomQ5ccd4WcBeeOQ7v1ndHa
OVHtWBiMka+cLexbDyzmNltXMV3lwxp+8tyN+N6HrUTtFFQ3iXqcaRtnZxDoVX1CiB0YLh6QqEXl
uIMoKeP331v4QgU7QxXRTsfucLgPF768kG8Osqh2a+YdPTEI22+O+OlvBiFTEOLkJ4TYCVwApaPI
uTYk3hghqswed4ghsrgYZ20hk3Mxh6+tlX7p/eRPv1DL0aWK5AKT5kRc3V1wg3FLsAkkPhUnqKAp
Q7/skorAuIFxAjNndyRy97EengfuhjBJErvqBHWdqHOflrkKiQXiDsMRzBVw8Z+Ji2+09Evhoc+V
XL4hzSvvevONNZkv4kRm1jlpQWcjACaHI5jjMcL1m/nKv6+kf1y+kt7oBZq/vp753Us1n/9kwcoR
5alfj5gvLH7m41rabIzIvpSnFJmDOjiKIx09s+mDI1jK+MljyoWv9jm+JJw9Dfeditwxr9qvUDvQ
7dNxIlOArvUFQYkqGEjbwpHFcFcRuWtK0YklwRx2djv0kytKyjAYQxEhBgXCbTsYgccOzVx5/7qz
UEHKQMbb3A2NMqJOx2kR95XVixADzFfw3oeOSzdpcDsgU3dyNvplZOulxJF+wyfuDCRzEQ4ytl/Z
rfKF319MPPtCYr7fw3K3XgtEjbhZt6sgwriNPPnblirWuPktnOJ+62SdgrkwrIWq6KEqmHVdKI5H
TXNXnfqaxriQLXkQkUNlJBuI7g83mSSXg4d4AGR+DszAzRANnt12Kt37QP+8KWPgD1og7p7dIdtB
RUxvmNsqv81yBjfHnaQxCvjzF59avqm4S53siTRsb2qsCjdrMXef2Cz2Sezu+P4zjTFzd29Fe0Wu
m5ETfgAuuvFd5OUf9t9NTf0QZh/FubkCLQUJgqi4hC4mdDH/z1RESwllv8AZ5Gb88N9/Xv1rfX1L
BWBjw3VzU2z10dG9oep92y0/QLYVNwu3UzK7/6dr5riLIeGqiP6pGd740au/Wn6d9WcCW+fzTILr
6x62tiQDrG34fF1zIuU6zPTY3CrPevIuKUmO9cvygxd/LLu35/ofp8YsIgbOVQQAAAAASUVORK5C
YII=
````
<!-- DT-REPO-FILE-END F079 -->

<a id="file-f080"></a>
### F080 — `resources/icons/256x256.png`
**26909 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F080","path":"resources/icons/256x256.png","mode":"100644","encoding":"base64","bytes":26909,"lines":null,"sha256":"ddf39a18f5b1581176125c142a169090130330c3b5250628b2dd70f506c3709e","git_blob_sha1":"2f65ab8ca6569bdde6ae9c7e42d34f895d9f2b9f","fence":"````","final_lf":null} -->
````base64
iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAABo5ElEQVR4nO29ebwmVX0n/P2dqnqW
u3T3bbpBEAUaFW1c0AbEtZFoQI1LEluTyZvMmEkwyzjvzDgTTWLepuPMfDKvZvKOJMYwMTMaNRk7
LjFiInHrGAWRVkBpwQXFoIStl9v33mepqvN7/6g6VadOndqe5d7b8Hzh9lPL75w6dc75redXVQSA
kAVZtnPHdu/eTQAwHA4JAHzfpzAM6eyzz8ba2poAgKWlJfJ9n4IgoO3btyMIApqfn6f5+XnyfZ98
36fTTz+dfN+ndrtNvu/T0tISBUFAnuclf67r0uLiIvm+TwsLC+Q4TvI3NzdHQggSQlC32yUiIiEE
dTodIiJqtVoIw1DMz89D7RMRAaBWqwUARETkeZ46Ds/z4Hle5p49z8vcv7Zv6zdoNLnjj2AwAPi+
X3jOOG8e08uz7/tg5uRYvM3D4ZCHwyE4hu/7kFLyYDDg4XAIx3HkcDhEv99nKSVLKbnX63EYhiyl
5DAMeXV1lcMw5CAIOAxD9n2fgyBg3/eTv+FwyIPBgAeDAXuex/1+n3u9Hnuex2tra7yyssKe57Hr
ury8vMye5/GxY8cYADzP4/vvv58BwHEc9jyPAaDVajEAHDlyhI0+SPqi4FiuzyYBMcnKyhAEAfm+
vy7MEAQB6duu67J+rAwWxq51boaRoJSH9WTT/hZCkOd5tcd60pjC/J76fZgCwKb9czC1vw7f9wsH
Ydu2bQiCgE6cODF2Z3U6ncJzrutyUf3K8qh7HZ22pNxM+0cou1/ruRGFqrLeMsK+bNyngYWFBQKA
o0ePJsf09oRhSI7jFGnsUds50ftragFkLq7MmbJO3yhprF9bCEGu607UdJphdEzTklKCwdyeNorm
eRiGRfPfnI8bwicTdQHUzfq+n2G47du3AwCOHz9eWcfa2tpE2uJ5HrdaLetkU/5YmUZXZmmNyfpo
0/JVoEkwuFmHmk+bUdmo+Q0AO3fuTLbPOuusZHvClsnE6tIFQONKdRegwtwpxcLCAgBgfn4eADA3
N5ec63a7ue1Op4N+v19Zr+77B0FAmkbIBPJGnbBF5R6l5n8dWH3+UftfBW89z6tk/na7ndnvdDql
bqQONT+bYIIMP9V5NBULAFgfaawPqr5dZPoNh8NkW4/4F6FqYq6nv3mKodAKqOjTXH+qcWoyn9bT
9LchXsWqqwxt91XnXicy99xRL2QLADbF4uIiTp48mZPOk4Q5GdR+PEBqyTGeYB55nqcCmej1Ugb3
PCAISpdModP6/swCKAjuIwjydOoYc7QfC1eO6iDEcgBBQGAGmBlBQHDdyKIgagNgBMEAUkoEgYCU
SH7DEAgCB2EICBGOHA9aXFysZX2eKqgjACqhNH/sAmzaiU9E5Ps+EbWIWsBg4LhEIC8UCIKQztrm
DOa6DN9ligV4ci+tORfwNS0UKTLLvUbm/2zFEGzvAz8Svol08AGXeehHPNnywKtryTI4+44EgxkQ
8Ic+nHbIDGZ/OERHRDkCRL5stwFm5hYPWbJkTw5YsmQ37LMMQ5ZCsuOvckirvCa3iOXBokfkyz4L
hj+QQfBwGAQuAH/iwWLdPR4Oh6SC55sBIwuAVqvFw+Ews6R29tlnJ/6dCobEfrgAkmVAzM3Nke/7
CIKAOp0OHTt2jNrtNgkhqNVqUayByfO8ZNv3fWJmklKS7/vkOA75vk9SSup2uyqZKGdNrK355M23
wOy6Pru0QGG42AmD+Y7g7eeeOB5RdQAEzuG75h/jrToiDJhc10nMT9cFcEyS7jERQnLdfPdFh0Z1
f1wAQSXVemGsloQBwFHgLjBqcuByPCXUGUaQ8oTPDgdBAGYwAgIDHABAIOD7Tpz84yVJQgM5JxEE
YGYeDjssJfNg6MeJRNu4PxiwlMwBCTmULTyxfdfxX9z1sw/gwV0Ovne3/PS2V7duP7G70/NPyGP0
2JYvPHbogbDVmpODwf1JwxYXF/HAAw9Y3Zjt27djeXm5dvfs3r2btGSgKhDsCUBFx2ujSACM6peM
hIWFhcJkEBNm4EZneKXhhRDE7DrwurSwcDyY98BPOn/tOLon5d13nrf0vbXFxbWj3PrMF3a+ASRa
giEloX205/wkSHiACwFK7piIkptXvS2IAMiYIG0PYYii0EphB7L6x94HXLgzQWj1Vs6qGm1gOGAp
Y9psfzCHYHWV6H8wu5H9j+iH4cSmfivpHskMRvSL2A1gBiQYkACDkVySGRLELCWxJJYAiFnC7Ygv
+k/82vvvvedLDO5Qaxs7yz88fFH78Bd/JL3OW8Ofveeswwjffxraty7+Xx2gTWu83ZtrD/wTJ35k
vXOVbFbdK5UYm6GbYhQLoJEgMDPxtm7dmjD74uJihvHn5uYQmA4iIqb3fT/H/GpfWRKDgeeIToe2
OyeDp5x+fHXJ+6fwbx+86MwTy63OH96249ccxwmWh+LSULSfzr5Pztz8PMV8TgCYorYQiehIkghN
+VGhDNebJ+t3UOI02cc9x/yTFsPqAlq9sgFtKQRiBs/eGye7nG5LgEkXAPE5TukolhYkOR6weJ8B
iKgsUSJRouMkACc6zQzIYAjytr7AdzsvYCnBQsAXjM8NzjgBSPl6554/F5cv+mLtR4fPCe/9x20P
v3/wjnf/1/t+ad9l25z2RS7Nn+H05P3+3NycXFtbY5X4VrNHNh2UANi0frsNSiAAgC8EQXRE1xmG
T9l5z+pScEx+fnXP9v926+7nnxA7Lj1+0v9pEqLjdhfmBAGhwyC/DwgX4epqCAFONDyRQxTPKyJt
wme7h0DgwpzJml1ZodbXW+tXXqpJGzRariEA1J8qmAiA+JDS9NB/9brDlF7RMjNYIncMDEh/lXm4
ImVSt3CJ3K1wANna/m9ZOOi5jG+2zj2BM5/5tSve+v9+djE88uHzjrzpRx/869uO//SLd231z3ye
S70lAdwfAKsNOqc26loDY1kNVRZAY8Fgps7qMQAAOHHiRGadf1QMqe14vuCzvBPDC7f/cPD5Y89a
+u93vfglx3jpspOr/k8Kt7PD7XbBTqQJgrWTIQkwg4QDEFEIFsIhdZuEhNEjhZxaAMxkyABLtxQI
CyvY3CD76dzOBLEOzF8INWUraBVZ5QynmIo1Wo6GgvWCqddBjMjLSyS59FkygN6xkJkBEi7kcCu1
tlyOjnf5cX/Lb3z1ohu+8vxn0GdOrNz04c5Nr/zhni+h952rLp37584FXrDSD4Bljud8oRG12eBi
AtrfcRwOwzAJCOprtjt27Bgru6/b7aLf7yfJGEPqOJ3QwxULnz3+9eEFc7fJvTv/9JtX/kJPdn8W
jnea150HnFWwHCJYHQYgclgARMIBAEoYO71tWwforFnaQWWegA055i84XUwyPrh0t8HJ0Wg16z09
UFTeGvrSOJst+1wgNExporOpWmdkuEqIM4ccDlckM5jgLIjW1heR476o513x5v5LV27+7I+d/IPO
g1/6ymff/dMPvOYydFe2/OuuFD8Mzpifx/3330+e5/EZZ5xB6qnAMTGV+EDjGMDu3bsBFOcBmA8C
6Y8LB0FAegwASAOA8/PzWFtbw7Zt25LzehbgUHSdDgPP9L+0vEqL7tv7//HHHqYzfjWUzjPJay2w
3wdCn4PV42FkyhMB5GYayTS+tDMxEoM8wpi/gI6ByLji/L3VqrphH6iwbKLYLYIgHYLsGTbKxTUS
AU5EIDkYnpRgYghadFoLP8bu/I+tnvGiB5/z2/f+2Y9+cP27bvrzN/xg7znoDC/6vzvB0jDwVlbq
3sG4zD1yeZsAqM0jtkw47TkAaz2qTLfbpTpJQCeDgLa1t4qL1j66HLpnOO/t/PaLHgxP/xUJ93IB
Qhj0AL8fCoIQJIgJrkjC98oO1FpTFbDjVKlMFBvN/Btp8uvkFvp09kZbRADr2rnsGorrY5qc2W9e
RHc9bMIp1+C0BgI5IICZOegvS2IIcts7ncXHvtk/b9/Vz/nNV7y79+Bn3nXzn/78vU8A2guX/lxb
iO8m2m4zBgwnkghkg80dqIIeGwgCj3rtre7W1bsGj3e+H/6vhXdcsYyzfyWE8yKCAzlYZkngWNk7
Jp9H0Mx8Tv7JX7jMBLVBd05zV7KA1fkK5n+E+fsJz2krpua5onoJlAYPE0bNcmzkSmiqXgmCgspZ
r9WgMYsQ2wRJMuhERA4AcDBk3384JMdbcrac+ZtwX/4rz/mt+/547dufetfNB//VD/fs+Ym5wZa2
mFv9/iQSPCbuBoz0LIAy63VpZj4HYEq6bdu2JdtKOKgkIOUeqJeGiLnT3G4X+Jmv/+rD93l7trzH
u+bPj4pd/ycQ7ouCwQqH/WUJEgQSgoz4nM7jVBZoysb9jNGnHG1mt4lpXMLdFacng82g+Ys0clEw
tWTM6ggdfcvG7FX1JKeTyvRG6VIjmkEkyOXQZ3/1aEDCXXIWHvNb80977e3PeeuPXnP48CfWHjxy
aKXz2Nd6ikcmkUY/KUzkYaAwDOmcc85JXsagsgBVDkCTh2YG4jT3Of/0lmNBENBvPOOHB77efumX
qb3tx4PeCQ57JyVBEJEQgMmIsSSwRpjLL58JSBlFzJK1b0TjbEsWwYb4+6WXmiLz1zGwChdZSjpc
5QYQtIUAjT5h4ny+VkVSluWAWcCYYxTBlaHPQe+YzzLcTu2lg899W/+GS95y/1V3fentJ4Gz0d+x
Y1pv4RpJqNRtTKbySeYyq+h+q9WisLXV+YU73vLQ+86//ce+etZbPsALZ/17kLM1GKxkGD81xPSd
fINTKa45iAa51V/M1YRyzWRio/19S72lzZ+65h9D4alB1N0tq0WRD/IQAMi8cFHCgsyi0KdUSY/p
4xu7JAk1EYHI49BnOVxj4bRfItz29Ze+9eG3hRc9ne696ab+3NxlLpC+Wcu8E/tFp4OxpZH+EhD9
uJYDkLgDW7duTc4vLi6mtO4Zrjt0+dLbP7D8tiu+/dMrW877CFPrBcMTD/nMIRMoaSeRvYcSLcvm
8ciftElwNijJOJ+xAKH2bfo8W87aENvRdWT+urSldA1pTfKcNWW11orp9eAd2B6ozVgbbBwsu4je
BjZnRrYN5n7eaGCABAGC/LVjIQjobN3+1sdd9HsfvuiN/7Dj9tvfv9rdtc+t4QpMXRiUCYDCi0/S
hxk6Z7gvvvG/HndP3u//+Y/f+KF++3Hv49DnoL8ckiCvTjyelJYosNZMJEZ5oW9adCE7iel3bhjz
W5ipVOs3tmjq0Tapui5MrW/rc3VdfRTIjDWYFqPRWAYXZnmXWx4GEqNTOASI/onjgdNauKqz49K7
Ln3zD191+BMH1oCXAkisgLo8NVGhUPZS0BwKTJZCbNmyJRMDOHHiROZ8b26H95pPHXj4g6/9+hVf
vfRdH6Xu0pXB4KSElIKIHDBZZpJhDioL3dQIBbxY072sDjjVdyKzR6fBHQWX3QiTvzZ53A+1JpRZ
acrZ2iHNvYst8xxvVlys1LYr6N9yLyflbSLhhsO1kEBL1NryV5fuP/G7/mO3E3AkxDl7nfKWTQ8T
DUjY3gasXIDMq7q7XRoMXPcv/ujt//zO13/9J4Mt530covUCf/VYqPz8HOOaUptSo10JdVO45yYA
x9adkiEFE0IPGzRDDeafBjYD81eQ58avokyh/C1jYt0LNOhI32AbEReFk0r7N+MmZqLJeUlPRI70
ewxI0V7Y8jtn7n3TR3bv2+/gnkODc875l5MQAo2tg7HeCTgKXHdJnDH3GHn59991/Kp3/OB1/sJ5
72cZyHBwMiAhnLRny5uTKPiM72Ypl1gIBfEW06znzNlyTMuMboJTgPnrEBKUUNbNdcrRmKPSRLgW
jecomt9ecQ0WIkFgiOGJkwO3u/jShSf+u79+8q8f2X7PPe/tY/d+xY+1DdVxMZYFUBT4K6IL5053
19buD/pzW4L3vfKhj4SdMz4oQ59k6BNAbpk9lamUED//XQ2CEhL1pmjtZOEpMtOo9ZbKo41m/sLG
pVZc7owldqv74VZGLFTjaRtIo80V0d3LOv2rtH5d80FZHoT2cPVk6HQWr1o6/fxvP/PN970CRw4M
z77s99f1XVJ1BID1tsrW9m3naMsWZxErQ+bTwh+d+28+7M6f9tKgfzKEDAVFUjGLnI2lbeuWVjxJ
ODdZoj1p1mvYluNFXmqYAOvI/IV0TayUBu3NkZcxXsF5M25TlbwFpIZB6qqllWT5sMDqSygLLqSf
qqOLEx+Uc/MrR5f4KQQicsLhWgjGUmdu+0cvfvODr7j3pjf1ztn7v6aWoWti7BiAehLQdk59MaXd
Pl0E4tgQ2BmefOHvfcSd3/Hi4ORDQZTCS0nHFPnvWT8rleCkBZFyDdAGcRR7KmeOWi+Qtxi4cGdC
sMzbTav1M4T1XLra1WUYlHPlC4Yr2iRdDMTPHpAuUJA8QmIpnu7pbbC5nzp9ketD5ITBQDJL8ua2
fPTiN9/3insOvb7/hKs+WSYEJuYWjCwA1Np+1fcA/Pl52rp1KewNny0fvOzAR9z5nS/2Vx4KIIRr
m8w2g5CRmmOlVp7uPiaHKD82BH0GpMRVszpZlbBPjZL4z2Rwqvv7Jf6/1Yy2mfu1pr5BlLH44gvp
19LHv5bZX9Agm9VQOBfSg0RCyCAAh5Lc7tLHnvmm+17xnb972WD37v1TXx2YWCqw2l5aWkqi/tu3
PxHt1g6x++B1q9jzKx9253e8xF992Ac5br5T7LaTPkbFY6+dUbEBW1RPR8bMqzGrcqqn0enxcaox
/7RQ0gB96U8PDic+f2K16fNJFdCJUSND1HJ9s32Ge1JalkhwGIBDifaW7R+95M0PvPDIkQPDJzzh
f0zVHZjq14H9zjbvhoPvOfr5a76xz1k47ceHq8cCkPDKfTyD1Tkf+Cns0vhkLmkkDhKUuWeFyEjw
fOmK05NBHa00Shs2mvnrWkoqyGN5z07CxCmXA5y6BHaLsdhC0MvkSljdygJHoek4RGaqkDKQJByH
WvP/Ze/+z7nfeeaZAbB3anw6kYr1b6AptHY+wfnMx/7o6N7933qNWDrvz8NhLyRmp7xjLOaUdqas
qL4Em1jpJS4Z2fZN+jo2vWlGThoW5q9L26TeiZBP6vqGUq6u1zDpc/PIbllyrFzMqSKNKvJtqIgq
NewHNbtiGeAG/bXQ68w9v8eX/vWepWNiz9W/T8C+ifn9OqYjWc4913Wu/+DJFx741ovptMf9JYcB
IfSFZqDZy1WYTASLL8/IJvdUoIrGruPz5VORQBvP/HU1aVPaJuQ1iEotN9uhUaY8mzsWTVJwnXV3
b9h+TSLhBL1VvzU39zI67XUfPXzdxf6eq988FV6deKX+1q3kH3PCwb7f9zB32u+ScBwZBtHz+wAq
u1kfMxsp20n1Y4XmnulKlC3rFGiO3NFpzBrLjW1qk78uoRFpr6zOYofbh6yh4248HlxqXVoloGn2
NzT91XcNymiIPH+153vzW15+8X86+srD113s79nzJxMPCo4sAIryALb88yJ96eN/tupd/PMfcRe2
XxasnQwJUcS/WKArny16uXOUAFLD5E7q5ORf6zWaaMcqEtvqwSRRpA1r0japdyLkE+6DZtUVuYzp
4DDUG2NigugLIWkNZL60PD5u9fdHX38r9SgKId1wMAjcxYUPX/Lmoy88fPgN/u7dH5poUHAiFoBa
EvROv8D9u5s/sPzC3/32a9z5pav81RMBkXBq9VqV5reQ65I7c4mCpaT6sDsCUzcRH8nMX9GBVZZ7
aSGbSWaq9QKrauwxrZy3eZO1tkvFRCxDEDmu0+r+lz1X3+J1n7+LJxkPmJgL4Ox8snv40weXn/+2
777YWXrcB8JhPyCW9UwWKxdr0LQu10wBBlDyiZs6jSk5vQ6av/QyG838TfugrslfuwENoddZ5ogq
oTFBi9Gkrd2/qklEbtDvhU6n83xnxwUfOXzdxT72/trmEgC+v4P64QPhnjffsoU6238X5LgsAyTv
Wi9CQ0k/ybmhosDWIIKxWyWfrBhjIpUWa1LntJh/gogUHeq1V2lPq09uKWwbsLLxnpZg5QbDYbsN
Isfv9QO3M/8Te37z2Ktx6EUB9n5uIvGAiQgA58nnubf//Q1r3a1nvaW9ddtzwrUVn0AT9VUamaWN
J6m90EhmqV6wzpJDXeaflmZqUvWEGYRzG6PUW1LYYgEW3uuUNX8tuhJaghQyCKQr2h/Y8x/u3LHv
9AcZ2D+2JTB2KrC//Sli5Wuf6V/y8+/bLtoLb/BXViWogvkLJz4lqbtJWLBQ6luEd13/qqAN1rqb
Toy6GqXifuqdGJO2CfmE2pBzl5v0WaML1eSNgkDSyE3KtKHm9Kl1ARIs/dCd63apddavHzz42nD3
vn1jK9mxLQDhtbl7pMutC1/+PtHqLnEYMmxv6lA/hc7XOEjX4pPLqWsbF8y2wT77kn+bqMUxGeRR
w/w2ziob/kJOLLiQMaSkPjmu1pVUVqGCLE4+SytJ6+XkQEWbS2lHnO8MN+j1pdft/sdLfnv5hUc+
dKG/d0xXYCwBMH/upe59hz/Rbx34yytai0svCwe9EIRsgxJGjLfrpuIw6i3rNjX5ZTSaZpHkse6C
8RpZC5h4lDJ/AlvmpK2czpdjmubWWLCaN3VXqEqRr6S27mh0b0QsJQvhLhA7b4u+hT4exhIAx1Z6
EoBwujt+m6Vkzg1VUci1JAOHYX9Pv160QsskHwfRBI76RHStPhvH7K+irVt0o5l/wn0wUhfp8yCZ
Whn1Wiwc4mfz7QtBxa3JyYScpigv39RwrAXdoiFy/X4vdDvtF+757ZOXHzp0RbBnz5+M7AqMLADm
znuVe9/hT/Sfu//uK9zu/AuCfk/SuJ8a48hUs3KKhTZrypdUyxVWZpU2Kiw4Om1p0WkInyZVT7gP
lBFuXXVpVG99xiucHmYbytrD1k1jP1VytW9v7P6VABEcdq8BGAsLTxrZEhhZABw9KSUAEnPbfifS
uSN+Ej0xCRn51zpk0VRjclxvelqzUfTjVdl9dY/ZTlnqLL2HMc3dsaueNPNX9J2VF9ksx7nzpltm
2AcatICUdRzsmYBZ68NGYLtgxQMpE7KqCMIJB8PQ6Xh79/z2sbGsgJEEwNx5r3LvvekPes878N0r
3LmF5wf9niQSed+/BpRFlf2AFmV+TGmufwreViFrG5yj5MxWYvLVYPLE+htZ3jYTYM0rGZN8gm2o
L3CamEYGmXYRQpQ+npcbHL3HxXIZMn7VCdbqrNOI8nstm6z1YE1nYAkQseDONQBj166rR9LAjQXA
cDikE8OHwsv2fahLc6f9P5FTXTGIRdq54FxyqqSeVHAUVGN2R8Lp8W5FdmHdCdzkhaOPJuYfqf5c
X8bcqB9Xp6VxzGDyjOA3PjXOBO0jw6NEeNOJVNeqKqazPJ5Yp39JOGHfl07L23vJbx2/8uBBCkdZ
EagjALLNecITcM+h9w5727vbSYhnh8MhCNq7/KPW1bq4zTzUGbo0GFPWUFOta9KCEb8o1DQrCq6V
IakbjrYM+COC+etOzgra3OHceFQ0ylKBRMrYBQZfsptd+md7uTLEtNFPjSXBuuucaaPMM3lqBgAp
hecw2L0KAB48fWdjhd64wNbHP9vZ9yGmxfOf+yvu3LxgDkNUvUubkn8iaJ2d+5YCsjs5c0yjUU6D
ye/W2UfWTeuBVPhw7nglLBNu0zJ/00lfl6TM4qt1CTt1UXMzhgMBnHJncizTOFMKsKWeijYbvBod
q+XOFLBKidDKHU7Pu2HfJxLOzz1n/32nHzn4VB+1M6AiNBIAw+Hj6fB1BwZ3f/qaNuD9mhz4DnG8
7l9XYHPxQOZHxNah2miR8v2gxQVSwcFqg7KCxqb8zclXKEvqzArA/h25ojrL0IS2CfmEhU8Z81ts
8/xhk0Hj7fw4GELZUCARSVZ8m03KDGdu/Eugaf5atAByDE/Ghk1XWb5pZu9fIpaB7853dobDhZ8D
wHuubrYSpwuAyvt67GPPIACyfe4bLnfarUUZhiFAmUf3y7Qdc9VaQdZJt84Js8H6xChYZ8oxvDmZ
iiq3nC6c34awKmTEjdb6U2hDKfOX0po9G0n1IsY1DxYm+Ji7NqVjkQqZZ5J0HVQwF3JH1LvEGah0
g01BUILsPIdpTAv2JZicl+7e/43WrmPNluPKLIDcva4sniv2fYiF05q70um0PbCUdQa9bu5NsqF3
YhFzxqOViRGpYzASznIzKqvlI5qC5aBcA2FvUx08wpg/J1jrVsNmuYrCRopZNOacHcDMPOCMJZDT
UEpXGA1koPRjvzKurfDeSiWM5XDdsbAIKwUChPRDAPSi+dWd2w8epBAN3ABTABQ1iYHddPgTB/r/
dPC/t1jSzwRrQwBw62T22oWXLQc7e2cF1RlS2hDRio4NunjSlCb9WKsyNXt+MhVT1zkxJm0T8gkz
fy3aysBpfhBs8R79ULbb1TIcp3PNGOPiSV1wAb3+XHl9TzmgZltLmCJjZhTTpdevYjAi5sB35ztE
rYWfAYAmbkDtGMA5ey8RAKTzjJ+/3Gl3ljgMQ+RCa/loWnZ9v2Awkiisos0vs+TSg2U62HHR1J9L
aNW/5qgajcxtamu7nB+mnNIyhJxN49XGRjO/RagVVjUirSnv01Pav5zNHGRon3mzLozbArclSsG4
vllCrQpk+C9Hrx/I++3WhtYw0G36MFt1zgoR8KXDoJft+RP2mrgBtQXAcPFcAWYSXucqp92KzP8y
lEheC2l+EDj9XHOmf021rhXSg4G5io3BtAWP6ms1m94qKLTRzF+DSZtUWDk5K+pl29iZtEb/mgJC
NwNMIZFs65yc0Oc53hoENI5lW2pZMrJQWe8x2bU9EVV9ygoGiGM3gOlFrR/981ITN6CeANizh+77
xIHerrd8egtI/Gxk/nOxmcGAfX3UcoxhJGrYWSu7aZfySZfHg257l4ApvbNV5jk7qtOsgHM01rEe
VQJOinzCwqcp89v7vlhDJwxt1pMjyz92lqdXXEzZ/lJaxUCyjBz/SZ3eehFkeKy4OZT2Q5lvkxxt
kJiUChRiDn13rkOBv/R6oL4bYBMAhZfvhFu6EDSXktgZ2laB9ZhVQGZjA4kgKRsRJeTjTlaZfRmj
QVv3LbQSMpvGEpT2q8uK/HS2nChDEyZtQr7BzA8g/2nmouVA8xxSF0xmOr2oMZyMiU7DWRLrtY1q
TL4uLJIHWbbJmAt1fP6iOqsaxCCCQ6Bt9juwo5YFcPauf+EC4G07L7jane/McRj6mcVKFQcpYH4r
Cgk14aI0uVRnsr55UoLT8/njBtdrn3Bmi1CxTZpEuBiTtiyTsRZOAebPac+61eaWRc2Qm2YP2F7d
FV/Y1LFspvUCmfFnIC0k0zlhCm0zHpALGqPgdrnifP4WLfvZu+LMRgUySU0ZuGE/BJh/ac/vHdty
+DqqlRRUJQAYAMLeslpPCUkIw0aJQy9Jz1eY/qwzDlmoKNMpDLW8mh2h3CByLC+SwdYmmH5tQmbC
Za6VUyM50WA9Y62sgKSseBk2ivmTjab1ZoRltGON3eljYem2PGOm2j75zUTWEVke6nhyOC+AMmY/
7LeYmz8WmiyUdinyM9JfRqaB9VDI0xHvMXMbS3ev1a2u2gLYs4fuO4nhZf/+S11B7l45DHPlaj/Q
VXKj2TkT7xW9LpazZQhszwjTthP5JPUa7SOaaQcbrkT5bWTKj9IPI5M3YdIatJzbqF8v53wssx42
FAFr48TZ44XVcCqwdTJjSKtiBQUzLN/mZAIpVJnn5R03Uv9WgGUgRcttiXsuvAIAsK+av+sFAQ8d
CJZxbxdEL5J+CBBEqvlr3kFCVpBIoQ8wIyPpbAJGX9qzPTueqUsdS3xSY9IUlVOXYG1icbaMmSmW
q9WcRNNi/glWODLz54qwpc/stAXdF5c3+lIbvvTXdtDQFMl2KoBsUyI3TBXjVjD9YKQgJULEnF+V
qEVLBISh23bbJHE5AOxZqicAyqteWGAAEJ0newSs6d/35OokhYRW+ylHzPwmU2aYUR2S6b5uKrJZ
CEg0f64O01eNK9NfHGKtr6jtE0Lt+bGJmL9eBSajZp+nT7dT4Zrx8SurzQveXN2cb3Ku2XZdkasz
ghnsi4/ZypXlCJV9RoOK69SJOGQAIii/UooiCZHcyjnn/isXALYtnftL3sLcIoe+z5k361Vcp2DA
rOVZT+bg3MCpv9x6v16jTehLywAjG+U3pbKpMDJ0ardSK2iTsQFDTVCO1K7UygQN6zVjKPpurf4t
U8OWNiV1WhSBEiDJtnaxLF3JrRkEhXOezeMFzF9yL4UFmtBKuOFAAsS/8tz/9NBCnUCg0IqX10/c
BcVvWc7dCRkPN5Bl0lf4TGoAzaZw3k/LJHmY9egbjMzkSnLIVR2msDACh/ZVK+PdduYzBGYZ7d4q
wagvLJpOjrqnJ8L82T5J7yntCH0sYNJmrLXsmCii5AEssx6zSssUyZEUjFn2YEluesVBBsBkWglV
irNIyJRcLjW4O4MTTi33vv6jgxJBEj0nlXdbGkIpgb4oH21FEVnORty0PsvkUJA2UGT/TXaJAabo
pQ9mXWo/vhd9O5pW8WdKCGCmzMuPMpdkzqVnpveW/0yCFaaQKCMekUkrT0+E+c2T+m50k9IsE2+n
8RRdSKdMnrgEibbICgKtMUn9DCRvD2Kp/G99EmWakBsHW5dkb6csKp+lrTbhSy5a9pSSuZpGCBdc
P6xzqZqpwEzM6BSbvGXSqiDoV76THMkMjKY9NGWTr8OgzSifzLl0NrLkeEJFf1ECitQmmIyWrPQJ
l2GCokmvXbyo/0zmL6qniaxdJ1ob87OVlqGPgTqRGSej3oz21+pR50zXjLXKmDkaLxmPpwRY8xU4
nkRpBEI1QLtmVT8UwmB+xQONHoutQWehjWYtxEqn26lTTfnjwHv30j3vfX3/Gfs/v1U47i8FAx/I
WQ229U6zAyy0ifTMUrHxpx+3aknzKsp8VKZ55pLRZFDRw3Q7pbdVmWmMqTXMX8vAqKkWNyvHILUm
W92JYbSxssox6mU2G5Y3/XV2YmTvn/OEuTrUkVwfx7+cuGCpgLENX2bfMAH1uaXmTnZw9HdTFKXq
lq1usUFTkCvDKDlvq9w8TMTS971Oe4FarV8GqlOCa7kAcuASz6NjF2BK6qoECHW8OGUp5UzWDkXm
dmyx59Omq9IztR6nzEoFQCRjEx5I3l8iIzo1GVRgkVR2CBMkIfm0FFFkLFC0BhppEyOjq6aBV3wP
64SRrpljfvOgoTlldnTBaf6VGYfJMDhzVvvr55mTZbtEdzPHFj4r7Red5SQfKKalnOGWEYKWTjHu
CKZfbjP/7XOSKidI7bmTa6dF2RKIQbUsgNoxACIKjQNqFtSYUbrPT2o4rAUTtlKTg7Kdo4ceErdI
HdS1fWxTkiCNsc2LpMpH+fcEQOhxiKT9ETFTNLGUoEgEizof05NkFQ9NtQhJgAmkL3OWyMlM92Xa
Yzmvz+qCOnNyt4TWXi9lzOwMARkmuboY6Qytymsv7GCpVZVRw8lcYZXZp45xJNCzgiPV3ixjzw6s
VcmZfV3zR9tZYa53QlbMFWskNfbZV5LV0OaVq3vZ5XT7dY0i2aTpQugCYDQlxlWz03Y67UTWul5T
4pnGMJC3DExaiicZUazd81eKJg+DiSDiglGdKlAXtUYCEElgUDkq6XeLORKxOcZU7Uhab95zpLLA
2t3V6vAqAWHK0kJtVo82gTGFWNoKx6LMktILSF3tI3GykmJSExr6un9cJ+v0SsDIlEa5baoSma0n
5XKlrNK2czw++vWjX13qZV1WozcyNGwcNnWHdaCrxlUvVzamo9Qbo9wCOP10BgDRXrAHO+2iR1M1
MbtkVI+9dXp3mpLIJplMocDM6VAkUXtAqX+OC2T7M2b8eJ4IJUSUUqNUCAhE9Wh3FVsq8TapSYvk
1XC6LMj3V1x3fL6p5DUnXC36BhPDpM2b/Ol+JjjMOpW5ZdCzrsGjgpJ1as48CJYcyxyJt+PrJnHa
WLgoAZFcR/2jXA1Qbk6kdFnJbpebmgqz9q+apIYk0GirXqpdzPxlwfd6MAWAjddilEnDEuQmff5C
6WRWtn1Bi+JtZiUoOA2sEsCKQRVTESAEICUjkIBDiPx+SBBFvjyRYmyGJLXsp/x/pPtq5iRjSYmF
rxqguxlKeJi3gkyZbHeTVVDkCgEAXCdqn/Jzi9BUUJi0XFhBnvmzCyFpwzJMrT2BKbW61SqA0uaS
o38yDKxiAKwEAWkrOWnZfKSRU8EktUPafMqrpnh0c5ID8UCZmr+IdZoyqUlfEWeoXa8dNYOAK4RF
ywk9DhAdMFpSrPVzlKYWoZQuPpRaB6zt68IVUXOiz5QwVgeMQQBs7RIWOwLMqSZXWpcoHU8CILQA
gzqvkCyZkPIMSVWVKZPI5wJrEplD+YlTpA8UpQRwbDXqhG6L4Doo/LqRfacCbE5se0V1mF+vRxcm
5na6DKiv9ye1GYF5La7AKuAX0ymvI65PppfPeAGm66HzOWtSQbcQsjerAsimq6darE3Mml6yUUm2
bK6KERWygXpBwBMAdmgXq7JXDb63TXGZGE5ZIWLSJgyv+lKfDZSa71AaWwArg2jYn/fEttx1hstP
OsPlp57d4kEg0wDfVGCuqkrLsfFABPghcNO3h2LNB2781tB58CSj60WCQGp9nt2ogQzjFVVQpfnT
IiqCDyDzQhd9eTBhfnXhmLEzlkc85jmmjTk8VMcQ3z/pKwIp8+tBykxmmHaZ9IaUH6e7D7q7wNl6
ctBncnEgwJr/XzBmk9T8CjYBkOfXrQ1qTL6zhFRVJ1CGu3al3EVN20BDbP9Fpj4lZRiReR+yRH8I
POu8lnztxV35zHNb7DmALwE/AFquGF0rjoTJMr/CXAt49Z6WBICXXNiSh745EJ874jvLPUa3RQi0
wFtt6AyS0YeU27czvzLT0+OKydO6OXNOMVGkudU5PVKvTP60bsm6xaAFAXWhknn2I84AVDydCLlo
BSclNDS5LpQSba/Wr3Q/XhUSsEaqGn2ox2hDlZIvHd967wWt996w9kLcWxZpl0sLRrZjDH5OB0Zf
AcgSRVF2zgpXqQyrbAMYgEuMkwOG5xD2/+SW4AUXtJkBrPWBtWEcCzC9lVMUhOg+TvSi/fkO8JOX
tuWLn9qWf/r5NeeL3/LF9nlKmKQwgzQz2SNfOkubMj1r48qZMQbUGokKwqqhZ51xk2uyNlVSwaBn
/CU0GtOzuW0IAmhWhX5MbweAmCfiviF13dgRk7FwU72sqUEljJI2xjRJdyXzPc0ryXYmo5YyyM1P
yh/S2zcB1HMBjgNY0C5uaY/q3DQOG/8kWYGcEpeY/BkkczAVJgzlEkSD7jrAyT7jGee05OtfOCf3
nNPi5V5EKyiyDEpafkqCAKhHPUIJrPSATgu4+oq58HGn9flTtw6cMOQ4AJqWsmsRjdE5K4jtn9vO
yndWzAyDAbVjKrira/asJo7qUkwdkRjbQJIPIBOzAYmgYJUfgEgosdTPpbeqgoexr5DcN8cTi5ky
ggzxqy9SxaU6J10gToUBZ+Z8FZNSBV1zrc8aQT3rs9F3xEqva4N2f1RFm5j06cTRPQhbMNAVEfNf
9HiP/+DntoVCRJqx3nNQjwwoYeAH0bx73bM78nHbBf+PT664c23dXDcX9W21qQwpzpbQLbiMNceZ
OZcwW4b5FaViaM4ypAqogbUVgjjRRwX5QGDJyWoCxyo8Se5JsrnjuuLYQCYRiNUHrFnT/GmbkndQ
KPpkFUfGgtFQZGaU2tq3phVgKWClLWP+shCxjvFcgLxiZkqso6xdpw7qF9RCJbFEZEaSVpuly1WW
nosKpQ2KWyXBEAACCbgEvP6F86EQwPIa4DX+QvojAyr34EQPuPT8Fl+8y5Vf/vZQLHYJoQqL68hM
PM4czKVmJdqaNJpoPNWkyDK+xohqnzV7gqOHc5JoOiSkwZSJNmcAMt1OtD8YLFMNr8cOMm5FokSy
yySpEDJdV13IEcIkQ5ShrIFoXqqKSP/JXsDqf8X3WWKORixVGP4vKlGTNovxLICcXWQ5rc2lVKqY
Pn96PE3oyWr7RP5qomkwlPjd12wLLj63xSd6j17mVyBES6B9H3jjS7eEK72jdOePAup6lHn1VRaa
jw/V15zM8azMzsYDpH485rxMTcyaFRFn6atsTE04pMlX0bbUXAYwIFlCKodEqjapWEB6XT0wiNx+
ag0pF4Dj+FWi8ZmQOACMKHVbqhkoEpq0o7IKSwm6fIq6Jfpf4McXa/6aJxowP1AuAFJW2waDZ/Na
Qw8GstkKaznLsYwxoB2L+08ZqIKAlZ7Epbs8vvwpbV7uP7rM/jIQorhAtw286tL58MhHjrmSyZon
oGtzUzuq3YwtkLX/Uw2t6jGFRYZcReNlMqRKm6dMHFsK8XPXLJHEetLYghIa2esnboB6FTiUdtfK
JAE/1SLFhCkzSsj4pkVChzh5LHIjGEQi7RTVQUrCJlXpcQGLxs/0FeUPldBZTuQP1fw4mIvsbRQi
iXlm+L5oSqWl0gBeKm2tVgCnx9OhiqR1tCKg0cad/bPPXQgbCrxHBRwBrPaBpz2+zU892+Xb7hnS
vIoHFFhtGebVGTeJlqfHOVOmmPnV6fQ3lUJSaedYkyZMnuT6x+d1/97C/NllQ01vsBIElBVUNitA
zUolTOJ3x3PM6NH8Ewmd6g8i0urLs1F6RBOnrAyC/NkElUHEIgXbHPVdANMutyhzNpcE83emVZIp
mB7LxQmMGpixNmS84MktefGuFq/1MeXknlMbr7xkMfzmvQ+5oXqWU4v6p/9qHWj2vzKhdcZByowR
iSa6Y40eG/GaZlVcq340ZpRxJB5pgE/G0iqJ3CfTI43ap65EGoPgpI2Il441AaDiEHoCGStXQAk7
PWAtY55VzB/P7VgwRLR6MFATJAkPa+npOXBct4YCFinmHVu99aEEgN0K2L07qv44EKUCF7Yue6So
UZpcSKyAZMKZ/n/69F1SrYyWtnpDxhPP8NgTwBpnl/pmiEAEDEPgnJ0etxxGEER9x5QdnIwOirWx
2k5GhpEwCShNpk8nf3RMxtd1YqshdYU5k0ad+OVxkCHKx+HkOFOUsq0CdEo9MDj5SAzH5YBIuDhx
Od0CgIhpVUImp0t3EhwLKspYHInFQClPc/zFmcT0T/pLd3eVr6/3Zd66iPPU9VqyKGXoyTI/0MQC
SASn3dQphs3vLyrIub2kdPwx8kAyts4RLjjT40AWBFpnABDlAHRaAo87zeEb7+rRfFsPBhaPiS52
k2CgPrEN4y776q58EE6vF8yZNqhrqYg+YOQDqOMcWxGS4rz/WGXH9MoiUS/+SK8ZBx2TORv1QdsT
aLcEJDNaroiyV2QkNfR32+gCkpkjc1PGtVEkWaLa40xAnT20mJgSlur9kZpaQ5afiib05JkfaLQK
oJlAqs36CyKSRmlSz9ZKApLMM2j0cdm0s9KEIuXzq6W/rR3CRee0eRjMBEARCJEp3moDr3vBUrjr
MW3qtgWk+cFOC1jfIG1H067mA1jJiHN2autTIWslZgUFJfWkWli5FFD1anMn107tejmPMtmPhEen
JfDV76zRrd9dE21P4EcPB3AdYKHrxPGI2HwghoQAWMbanwEZxucUH6RMHlkJesfE/5B6pJy0e1F+
tNHpuflsOTEh5gfGWAZM2pDaZyXQhQEVj1yudoKUSewWahaFzBj4Ei1XTLQzHmkQBPT6wAVnd/jp
53RmPaVh7Qrg5FoY+iHjhsPL4ivfWqVDt68KBmNhToAgEabPhMcKS7k82WSi2BwAlPrKzOdUYeZe
dWdYCrW02YRHsbEASFg5uQHdj1dERjBQQRdmnO0D/QoMGT/1pxcynn2faf5aIAKGPtAf1lwXehSA
GXAdgS1zUeLIL75ku/yFl2zHjUdW5f/+9FFx45FVAQCLcx6CMM2OVO+BTN4epV7xlvH9lQ1DiXWg
ZjojERFaY+Jf63y2Kc06N1iftNYrwdzOlsThyrwBrFGjSmIBBbSpOShjQRsJltrfI5wBgArMzRIl
TARxXOn4moQQAs/bPc/P2T0f3nRkTf7PTz0sPn/7itixxYtT0jlm6MglAInYdxF5dxaInlhlAJDJ
qkEO6cslDYzh7zdkjQazQk/kNRptuwf9FUjWRkU+EJsq3fTvND8Q4Hh5aIYZxod6mYvriDi5DFjt
Ac/fPcd/9GuPC9/0UztDMGMYxHmIyctJ9VgHx0oJyCRaaPNYi3ak/+rTOPfkYPFuKUZgDVMAFFbB
pVQl9niGlqybZkgASANLetep7ptZADNMA0JESVQnehKSgX/7ih3yv/3SWYGUjCCUEMRIvymhPfWq
hEAS6YzZ3mQaTk4VMJrtga2avq7F066DJhZA9CPVXkXDMo1vEtxQyzaqLxO215aUZgJghunBEZFF
cHRV4sVPn+d3/upjgyBkBGH0Wdw0ASr7HAM0KyD6N2KWJIjNOuebc3h8zd/UKweaCICq2osimGRu
WKyA3AcX0n+Ng0jeIz8mSPvj2d+j7g9Ix78ILVfg2KrEFU+f53f+6llBGEbuQFILA8gIgQh6inSC
5H0Z6SlO/tVpOVe0EFrRukVM1HslWAEIeiYU0ug/Z6nyzYuPyXRbXTSzTM3pccSdylzTJLK2N64W
wDAE+TI61PfxKH+O8NEFBuA5kF78hriOFz3zZ5upniYE/uBXzwp+43/e5zJLqO9DJdl+HK0KMESy
DEgUTas0vZi1q2i/emJFjndKbiK/2RgNlwFrmP2lrdGXS/KHU8mZzRuIcgHUPqPZe9bSVg9CUCBB
fR+OqQlmeHRhGEIM4+cj1nw4SiB0PEiV+a/guQJHVyJ34F++ZCl8x1895DzmtFbkEsTcHT2qTIBQ
eceZSZ1LHEKcVZhqW3NeVzP/OIyvUOQClNRNxp4huWyugO3lBpzfzV00OZh9wDj3uHEJCJG2PzGA
szyAuxYzvzo3Y/5HJ3QXEIgEwqoP59gavFUfwjSDPVdguS/xr688TV7+9HleXg3jZ1Ck9qh1/CRj
hkOjSZwuGsST2px4ddM0Jsj8wCReW1up9WMkJo7N3wdy+dHqTSvackv6nrjqC6qrnBjAOTGAOwyj
hwZnDD+DDboLsBYLgkGYruATASyBhTZw9cu2h2olIH3MWMb8zqkbrLYzMLVfQ58fk2N+oOrz4FVQ
1k0uL6CKzZTRY9Lpn2HOvhUgjY1UBwF1rT9j/BmaQgmCkwO4K37KI44jcKIn8dzdc/zcp3T5ZC/6
zoS+zs/MSQwgb7eagcE0DBhtlEzsusxfVyHHGNECyCf3lC4LJo2iTBpwliQ1i5KXQ3K2A9Of4jtU
zL88gOuHs1cFzDAeVn04y4NskNgB8Port4fRo8ZKy7MZwTa2LZq/FNp8b8L8DVEuAK65xl5lI5Pf
LKpWDoriAuZyoab91RNkBUJAZ369hhlmGBUCUXxACQFHCCz3JJ534Ry/6GnzfLIfxQI4fjdVGtCL
fpk1AZFkDGoXyB3Qz1k3K2kB1I4pjBEDyLNXVXKQ7u/njmsBExDpXxeIibQ8a0tvmMw/wwyTQjy3
EiEgObICLn1yVwYBJ1+G1pOAUsYuDHFnkAYOdcXJNUrWIShGMwGQa03VUgWZuQ927pW2vGAbSJOm
KT0BGMoZ888wPehCwHWAng9ctWdRnrnkYjCUsRBIg3+ZV57ZuDj3Hg3tQk2CfWNGBJtlAtYAsRkf
KPgiTUEWYO6yyjJg1l4JnVag+mt1kC7vzTDDNKCEwMCHIAI8h9BX2WRAmhSka6dEKNhq1OniULUZ
GCzDBCZ8LQHgdLaWXCqvvUlzBrJmvFnOSHwwr5JYD+qcRTSSxPIATmB+2m6GGaYAAnDSF05vCNqy
4PCzzm9z3+co2szqnQEaLMuA+oOEKfPDOr2tXF7LL6iHyT0kXtBOAJrPXy+yacpAlgAov4xCAPxQ
0HAW7Z9hnbHck07XBfZcMCcHvvrsvNSYOn4ZqfLl03x2y69GV3XhCZu5zQWAjdMsyT25NX71DjTW
qcz6jICB/nJIFVPgbCetDmd5/DOsLwhAwIIkIAbD+AlBlQ6ovIDM59jUvDZUd2ahiyEzdBZMwced
TCYgAP1xh/RIHb2cTwZKKsr0XzZJiIgxkFFu/0z7z7DeYAC9MIoFZCL+DDujF+W0GMHs0gs2aVxN
1BcA5rq+xQ8pvW7y6STL+j/pO+Z1szS6seGHoCkIxRlmqASBEb0oiOMP/SgL12bGWxblK+ODbN+u
QsP4QDMLQE+YtlzXmhvAVBHp1yKgUMJTDywawYKYXErQ0J99E2SGjUH8cB8t91jI3BxNuTBy7bW5
rQ5yNq4NGI/WQ6OtgxEDgw1dAHtWfT40lz0RWfCUI+GcWaR/eYWgS5xM53Ck/dUnqGaYYb1BBAyG
wNPOn8fWOQdBqLkBGRjH45/kE6mZ4CBy87wWxjCDx0wEKrm2cSJrq1OWc61PRBWsD8SC1Y/fHD6T
ADNsBIgIQx942q4uFjoOQqkxOOmmcjqPKY4P5K1lw6xuos3H9IGbJwJZYnR5WhtXZjgeiXbPBBE5
s1qQsyzKfKYZZlhnEAG+z3AczZpN+MPUlBZLtrz2apIJMMJIqwBcFnc3VgX0E9YPIpgHlGwQmnBQ
kjP5FhxoEJIgmgmDGTYGBGDoM05fErjq0q1Y64X6dz9TsAoM6ilCJh+ouW+zhAswoYnfWAAUBiRr
qmYy4wiFKwCkWUZqCXDG7jNsLhABnqunuxsB7NyqgDWRZkOYH2goALJufJ0HeEw/J94qiAfooRBl
MSRyZbbaP0NNMEerzupv2m+Rl9oyddIA/QM3yT/ZZbTk30Kr2UAD/7fuG8ZqPz1n3iMApN8ALIMW
DDH9fZ0mqSulYxVQUdJxJgRmKIGaii0PUN+NJURflB760blJT6Gco8vpF4LtnKFapfHDhD8KykBt
CTDe47NJGL6uENCPqE7SRbQmHVkLpFCcS5AIgZkrMEMWkoG2F82gux+C/8/HEXoOyA/Bj9kGZ9cO
eAxg4GNKD44UZLQW7WeY36pe87QVSAyNBuzRXABo+cu1wUCdj4NGyt5IiMhYGLoQmGEzoGxE12uU
JAPdFnDvUQS33IP+PUcRBEFqPLoucM52uBefg87Z2+H2hpMWAtnK2HaUEfm+thUyG/835DM9ltgE
o1kAuXhdgStg+vqZsL52lCj59ne+Fsp8h23UG51hMmAgeQ22I1JT20YYhKm8ntbjmszAfBv47oPw
/+Y2rIUS3PFAbe0RMQbwvYcQ/OAoVl/xDMydvxPe2mDCeiSziKWsWsozdoWyt9VZi2REnmguANTn
0k2YQiDXIP3Os1qdYsaXiTWU9ZHMsMlMAKwvVCDNc6Kh6XQi5l/pASs9hhB5+U8EbF8kCBH5334Q
1RPK6COck+A9ZqDlAt95AP71t2PNIaDlRRmi5hTpeqBQAp+4DWsvfzrmzj0N3jCYlBCI7G5WjTIe
f09mflOruQ7JmLxQXwA09C3KoVkDWmAwa/wX2EAz5l83qFTruXbE8MdWGEMf+Nuv+BDE+PYPQ3zr
hyHaHmVlPwOuAzzvQg+SgSc+1sETznLguYRtC8BqH1Am+jgM6AhgdQD++zvQAyLBIgvmh+T4fAj8
/R3o/Ytnw+3EwmISsDOjsVLWRPPXWBCYBC9M9h161m8DWgmhNHwiNZEXAaDo3ULS/Fb4LP93qlBM
MdeOfr/2nQB3/lOIw9/2MRgCx1ckQhlF21suYTUw1X80pB/94gChBBa7BM8Fzj/Twe5zXFx8gYcz
thF6w8gyECMIAslAxwO++gMMVoeQc61qZlZWzOoQ8sh9GFy2C521iccDdGjr25M2+yckuCYrANSq
ANUTAra0SFMIqL6bKf7pgzXGZwa+/r0An7pliDu+H2AYAHPtyKddmKPkEXfJBQxEwGJMF0pgGAC3
fy/A4W9Hdb7w6R4uf3oLO7ZGgiAImzGiK4CTffAdP8Kw5dbX5DJyG+iOH2F44VlotxuUHQl1mF+f
4LrhWxAvnCQzTE4AFAb87LSRrMjGDdI+iIUAK1qVJzCx1s5gQMba0REp43/j+wGYI8bvtgEZB/+k
+dq7gjpZoxMEdFuEuXYUN/jwFwY4dLuPvU/3cPkzWti2QOgPI9raypLzbakLmXnB7KRhZLuWkQFT
j/SXYXwBULdBhPSVaXrZ5OEfNsgtbxOmeu8YmqEZ1Bp6b8D43zf0cfOdfsSwbUrOT2LiqXocB9gy
R1jtMT7yhQE+8zUf//IlHVxygYu+HzHnKf2SR1Obj0k7bqS/DBNIBCpAblWg5IUHKtFHDwxysRCY
YTJgREO0ZR64+c4A7/nbPtb6jLlOJGinZRozA2EsCBbnCIMh4w//eg17nuThV3+iC8dNYwNlIIL9
AZwaEGIKU4nif+r6/HWZv+nqQQP60d8JWOciRGm8r4xe77BcPEnkHySeyYCxoVar5trATUcCvOvj
PQyGjE4r9e3rgAr+6rYhlJEgmGsTvnzExx99vIeBz2h75W0IJLDYAV14FlrDAFzXYhAEDAPwhWeh
tdgBBSO6EDkwonXspsxfRdKU+RtiNAHQ6EIU+fClMYEyUWg8Rtz08jPkwABIRMxw7cd6uPZja3AI
8Nx6jE8UxQqEiDR5KLN/iqkcUc+UVwJnyzzh9rsD/MZ1q7j97gAL3ag+G2JGxu4z0Z5vQfhhtWIg
AvwQmG9B7D4T7WENK6MWVPC7LmoInYrv5RS0oTkm910AG5TmJ1SPjsoCKqArf5fADE3A8RLan3yi
hxuP+JhvE1QyZhlUAk8QAifWGCfXOArsddK/bpuw0CVIjvIGesPo1e51TG4Vixj6jGs/1sMd3w8x
3ykWAqEE5tugl1yILlAeOxCUBgxfciG68+0oMWgyqMmtyjyvu8Zfd56PwQ/TSQTizE+EsicH2fgt
WR2gGs8UzFCMkIFt88CNRwLc8q0A2+YJtsw5HYqpVnsMzyVsXyRceUEL3Q7hsqd48Jx0uDhm4jvv
DXHP/SF+8ECIb/4gxGqP0fIILbf8EV3JUX7Bap/xsS8N8KSz5+C5QGjR8BRbAU84Hd5PPANzf3Mb
1oZ+lApsuo09H+wI0NRSgatQ0zVgIH1cfkKuRBnKBcAoHVQ2mfRHfjV6s3xiMdjOATmXYIZ6UMkz
X74zwLs/0UPHQynzq5jW2iD67trTd7m46pIWznuMg8VulObbG2hWXgxm4Jnnu7jsyS5W+sDyKuMf
7xji87f5eOiERLdFcJ1iiyOUwHyHcOSeANd+rIc3vLxTbBkSsDoAztsB76eeifmih4HO25E+DLQ6
WOdVhrrMb8sHKKtzAph4IlBhu5J3plEafi5cQIZGm2YNzjA6GNE6/9qA8Z6/7UdmeQkTCooY0Q8Y
TzvPxZUXt/DUc12Aotz+lV5Up9Bf5ByDAPSGwNogigNsXSD89PPb2Pu0Fg7dHgmCE6tRwLFMCGyZ
I3zpiI9zzhD4mcvbeHg5SjG2tbU3BM5agvuqJSyUPQ48+ScBK9DU5K9IBEoLTAYTTQSq364mZvzm
1fbR254ah2tGRPQsKY1otzJHzPjeG6Klvm4rcgesV0JkWhMBv/7KOVxygQvJkbYHIgaqWn4T2nJA
EADLPjDfJfzUC9p48bNa+NO/7eMrd/lYnKNCdyAMoweK/u4rQ1xwtoOnnOOiV6C9BaUv/ThvB7wn
nh4xPCEKSg58rV3rhaIH52Ikp6Yc6S/DZARAHeZXPK9r97KCCW08jJssE5AIcBwQ8zo5JBRda5TM
N8nRct/Xvxfg5jt9zHWolPkRZ+394ks7ePaTXRxfwViP9BIBDkUMfXIN6LQIv/7KLv74b6L0YK/A
EmEADoCTfcb1Nw/xlMdXeKxx+4Y+MDDuad39faAyxK5P70b1ThATyQSs3a4coRb51/NGiwKOmyQB
gKKIcuCHCIjlujWKSEAItEcpywx86pahnpqRg1pa67YJB35hHtu3EI6vRpbDJKAEgbIu3rSviw9+
doC/+ocBdmwlBGG+TMjAQpdwx/dDfOP7AZ52nou1Ch9e3eNmhmL+2u1saiVM7ZVgSmLZIv1lKGpQ
5XsETPKCjMJ1AjPCxQU43/jO8B8/+aXjn9yxrbUYSrZM3clBCIFhKOVCm7qveN6W/9DyRDsI03fP
lUEyMN8Bbr87wDe+H2KuTVZtS4j8biLgF6/sYPsiYa0/OebP3E885CfXgFdc1sK9D0l89ds+FrtU
uOTHzPjULUM87bzJhq0mjgY+f219NoqLUHPcRnsl2Chav8ztN1OB9bLGIanoNxDxmrn/8LJca7dC
1w+nLAAcxmAopRjhS+hE0br9DYeHKJudRFH67a+/sotnP8WdqOYvuh4z4DiEf/vqLt7+Icad/xSg
28oLKPVA0pEfhLjt7gDP2FVtBaw7iqxWC5muPCtvoS6jmXTTtABGN/nLCFXUyO4Mskm+wSACtVpw
XEcIsjyyMEkIIcCuJNdplvmuIv//fFTitu+GaLmUBAOl9mCWiJf6nnaei0ueFPn802R+BSV02l3g
5c9u4c5/yspRQpxtGE/m5VWJm+/08awnuLmlx82MJLCvtH7dto/K/A3Q+NuAtR+hLFjDr0U7Ks06
ggjkCBJCQBCkM+0/IUgIosbjRQSc7DFedmkLS4uEQAInVjlJ13WTDD3ClRe3orm5jozliOgNQU89
18VTz3Ww2me0YkMnkMDx1SiT0BXAc3Z7OP9MBydW7cuBmxU1jYNsgWnQWtAoE1B9Ar0ObZN6M0ii
/VIj0WymTSAIYs01uOeB4QkBYDhlF8AVAr1ASn/IQRMDjOKlsSc+1sHuxzt45XNb+Na9IY7cE+Jr
3/FxbIWx0mNICTx7t4cLz9lA05qAqy5p4cg9IY6uMLptwtIC4YqLWrjwXAe7znTQcgnznTgHYRPM
AxvMrmNMMbNvAn0w3odBbERNKmRtWwcBgAA4tC8cbHAIoN8HTt/mPPmNP7Vzn+dQG0QTyyq3XhCA
ZLBD8AQJt8ljukoIDIaRv/2MXS6e9UQXr35eC3f+IMS9D4X4+t0Bzn+MQLsVJcqsd/+qNp57hoPH
7hC44HEunnauiyeeLbDQJYRh+lLRE1OOTYwOyq43qtj2qH1ZVbZgDsjiU1ZM6Y1Ak6kuigtG+f8c
98hGpwETQfQHwM7tzq7HnensUi/OnCb0hZeVFeVL1r+qevkmc8zgcfDtmU9wcdluF1de3EZ/yFhZ
2xjmIiB+YIjwH/fN4bRFgh9Gy4UraxGBsko2J/OnULM0Rc01ybpWQgmfjcKCE0sEqoSZCFSrOiVN
jZTgDTb/iIBeD9zvQzJLIhLr0iJmSUKM+gqMCCpDTwkDla7baRVn5K0X1GvDTqyliUfj3e3GgMHR
Q2sJM8edbhPaaj6P6R6MOnTr90qwmrSsbyQ7luyVjZ6s0XtKnKZxuXEw6Wvp6bobzfwKkje/li9F
osnr5ACrAjVuuGB8xh228bp6osyvicGi9Hq9U0+RJaAZHh3IT9mqCU9pIaqgbcL8DS3k5gKgKHBX
Rl9Ky3YS84lu1tyBTZISPMMMgJq7OkPb2Eqb4TGd/m+OhvKHCmqrOFiO6b4SrK7Jn7wZuISQchsz
zLB5ULhcla4KFCvDgqWtKTM/MI4F0JTOnuCH9MaLzH5AfSEoiV5tEn91hhkysPIxF50wCiK1bBmF
qby5qT9mULy+AGhyoRr+fi7YZxEYREUdt/HJADPMkENkzsY7hoHPSJWYDkoKanXAGhewMv+YaG4B
jLFOqU7nlzwtCdKkH9dExsz/n2FTglK9lFH6pmtbNH+L57VV907ICp7sgkvdYGZyRwVRfTIOcDYB
aCYDZthcMLS+Hq/KLAtyltwsn1gJKekk/X0bJiMAargHxaezC/wpoxt2Qu0HEWaYYX2hZwAnql+l
slJOs8VbmtBgRi5vuCgmPuH41/gCoFGkH3nNX1Uw0y+z6N8MmxWkWa66L4Dy/JXCSL8hOJoG+2o+
nTL1RCAu3NFhLJko6ZmcA0DxG3AKA4MzzLBR0LV5uqkH/bIBQH01K537hUv/TRPuppoIpF+objvs
mT75inRvIJamuY9B6EVnmGEzIfOC2JIVLJsVHK8GZKzl6FCD62vbNTl7KolA9bR+hPSpNkr8oKQb
M30UdSjnT8wwwyaASHR9LrWFcge046mPy+a8HifVfmouQONIv4ay8L0Kglj9fdO/mmGGTYjkuWst
cS2Z0nqkP1MIDMtrbjk9X4nNkgjEuY26dZfdpHIDdF9qhhk2GTIxO31HIKP5C1YFssveDa47Zlx8
YnkAIzF/RqiYkVLKb2sEs1yAGTYLKHmuWrNQKbUA7CtfpKXDjDCZx0wBVpiIAGjE/JblQNv9F3dJ
1LF+kPOYZphh3SE5el2ZIJG4AKQLg5wnG/v7ZgzQlhxXNMM3SyJQLtI/aWh+P0GAQWi5hAeXJW64
tYduGyN9KmuGGcYFA2h5hPuPSXzq5hXMd0Q8F7NmPoEQPR6cWgfZzOCGca3NkgjUJNKfobOaQ7lo
YfSXywWI/kIJOIJO7TfHzHDKgxloufHXjCi7lo/MK8GQKDPWtiM6FPCPRShMQcmOxELl6/tVhewH
s6mU5hbAcQczE1otgTv+KcDKlD5dNcMMVWDJaLeAO743wEqP4ehxACZA6K4AYJEGyW869ctWyZo0
rj5pY/YZOdhXB7b4QHoSSoJ2PMLt9/h4aFnCFbME4RnWHwzAcYBb7hpgucdwXcVK+Ug/62ymtH/d
Zb6mSrYhMzT+1FR2o0kh/UBuMTRLm0mgoMw+Q8BzCMtrEl/85gBznVkcYIb1BQNwHcKJFcYXvt7D
QteBDDVfPwkECsszbFSDf3RF2KBRI6C2AJgc89tAhkxIM6PYpAPATHAE4dZ7Agz9TfaRyBke8WAG
Oi3gzh/4eOB4CE9/dzlpOf0EgETWFdDfbQkUm/8j8llTI6Dxt+ZG9/lLCmYeB1DLJHpHiUyMIPrk
tYMb7xzglrt9zLVh/eT1DDNMDQx88DMn4fsEx6F4vqp5KsCkJwApmPGACSzzsXWzbiZww0xAoHrF
wiok6jB/UcXKBchmU0XeAeGvvrSWedfCDDNME6EEFrvAV+4a4pY7B1icc+KvF6cZq+mUNmNaenJb
gfafAPM3wTq8EaisaVmmT2VH1kyKTupJwAISAvMdga/dHeALR3xsnU8/Iz3DDNMAI/pK8TAA3n/D
SaQBP5E81MaZdX9EXwjKoET7W5fISxqD8RMCJycAioJ9RbSGRZFhfBt9LF2zrhKh5RHe9lfLuOW7
Pha7MyEww/TAEui0gf3/6xi+ctcwCv5JSoJQrOf9k0iZ3/JCkJz2HyHSPwmjd3KvBCs/UHLKDPSp
o5Q3neIzSVIFE1xHIAgJf/65HgIJeM4sHjDD5BGEwNIi8A+3DfAPt/exdcFByAbz6x+tybnM6TzO
Pe7eZEkwv1lMVANTeCVYE+a3HbJIxGQ5UOgUABFCSVjsCHztez72f3AZjgO4MyEwwwQRhMD2LcDn
bx3gwHuPodsW4Mz7/oS2HbsEahNaGnCOv+ssCcZowvyMjXolWA2Tv5o6Qe4zy0AiDPRVgVASts47
+MI3fVzzFyfhiMhXm7kDM4wLP4iY/9CtA7z1z45DCAFHOJGvHzN7RhDAfCtQ/Jso/RECfk2ZXzWl
BkZ/I1AT5q8qTnEHWZ4VsL4dSMu7VqsBQUjYvujgC98c4pq/OAnXxSwmMMPIkBxNxTNPizT/W99z
HI4QcB0RKdfkIZ4C5rf6/RaFVrgfo5L5C4IC6/tGoGbMb4chGc0nqoC0043YAMXnAklYWnDxpbt8
/MZ7l3Hr96LVASln2YIz1ANzZPJ3WgAY+MOPruJt7zsBIaIMVJmZe+kqgJ35UzehMfMbfF3M/KUE
lWieCJQ7MAHmV9Xk+sXWafp6qjLBkKzBhkzYMu/g1u+FePN7T+LQN4ZY6ALz3Uiqh3KWMjBDHlJG
jO+6wNICsNqT+M/vP4FrP7oCkIDnEkJAi0cRdCugjPmzca0ay3yjmPwjwq1NmWPQcYN9thOEzI0Z
VhQnkVUteEKM5HPLFL1bLZSExa5AEDIO/J8VPGuXh9c8t4M953toe8BqPxIEQRhVJQi1xmWGRwA4
GnPJEdMTRUHj+S7QcoEfPSzxgU/38PEv9nD0JOPMHQ7CkFKzn3XGNzR75tl+zYItZVJj4q0j8wNN
BICtATVP1WP+GEQpp7O2z1FnZ74RyPp2vBlLjlAyiAS6bcIt3wlwy3dP4jkXeLjoXBfPe0obO7YI
bIuTh9YGdgNkhkcmVC5/pxUpgeU1xo13+Pjqt4f43K0D/PChEAvdKNEsDKEF/CiymWNNngn2ZT79
pTO/HsOqMP3XmfmBkQRAAavU9wTqhP9TGs4eyAsBVSa2BAwrQTJhvisAZtx4l49/POLjfZ/v4enn
eNj9uCiR48ef2YbnRv5dRlrn1mlnONUhY+Y//G0f3/ieDyGAG27p4+ETEqt9xuKcwPZFJ3IX1aN8
abQ5rqUg2Jcx+6uY38AGMD/QWABMyN+vBMUMrR9KNX7ywJCy55C6AawzLUWyW8YH5zsOCEAQMm66
K8ChbwwhiPGxL/cyBoW1o9nWcNYv3WxgJkDbXLhy6W6dNkxUFtasjBtfmCz0KQMKh3ByVWJ5jeEI
YK4t4LkCO7ZG7mMo9RiT9qunoydMbboA8fxkk664PdV9W0s6jIQGAmC9mF9BNwPUITUQpjWgCYRc
HVFsAIgjuLHMmOsQFroCzIy1gfZmdv2nsr3x9ZtGYded+ceYNU3mXt3L6NZdlWLMWIIWqGmSCGF7
hdkUcobjCOzcCjBTsuQXhJG2zz6JGs+hUoamNC6dYf6im9ODguW3N5LkbUA7Ygyg+EITmYMJrUUI
AJrWj8yshH1VkCZjGajj8dsFKPLpJCNZ0nEcY5Yl321LG2R7BzEr2jr3p26lTj+U0FoVW2m9Fi6r
wXgJXUxbi/mb1FuXrKHsyj98o59Mz6nlvmzUPmV+/V/9fGbfOHaqMT8wjgCYOvMrFAiBzHE9ABP/
k3xpSKeJ6BJBoCa3Pmk4qURzQ8zB5PzkrJr4GQ0yGm1pN+Ymp4UjR2hD6Tdbxqi3FllTiwJA7qu6
hbSUTgmjTL6UzuiGW6CO6h11ijA/MKoAqMv8E2u8IQSSvkljBZm4AJCNDajZlAgHaGPK6bhkgjbx
hrGGE1WVEfuwxwfyzS6UZTVouYrWetJg/joMqtHWGr6mWr/K5G9Am78+2Q6mp5QwN7R2sRwvECZm
klqmglOH+YGmAoARpRjW0UwTb7xm0meKUIYJU0FgFtWtBE3DJ6aAkg+6JRFv6NqQkQYME+uxxkwl
47cBbbOxVQ2zaP66xesWGWXS1bWUqmhL6VJrTz+WU/bWtpHF7Mmb/8lupcmvXbSS+WtJh9JiTdHc
Aqgzr6bVeBXptxVSXKmYNJb2rC6ScQ2SQnEDREqTWAGsDW7aWDX0VJ7docgba13zEMzDtbSjMeEa
aujKZk/AnSklq9tnmvVmv0iJBE3kui5tOc/8xjKftWlVWl9rw2bQ+jqaZALKjWV+/afAlk4GImMf
JP9yupnSscrs0K0CIEox5rQcoJkA8fmiG2F78woxgYFsxpXVtUwENSvLmP1N6tXzQIC8B1ConQvc
pEQR1GB6Vbbw5Iab/LWefqklAMKuIGeA+cp2TpH58+QFQkD38wzfXAkDztAiO+DZRAKD1pwcCuYj
FaZmKkABz5a6VNZ6DZ09goaeSrCvptYf3VIyGVBz39iUBiaV0Gi1k5k0XwN6HKEUG8n8rJ6Lma9T
VcXDQMTYz+LEDx/qE+OzwiNwkWSZBvPHmrSYXPN1bVpXPbBhRmwRKXfS/kvqSjbVm151f1oU/Jn3
RiP/se04l5VBA9om9Z4KtCYEopfG6N/iU4xO6Ziqx88p7bvsf0bt8Xwovm6GMNrcGOZnIkeEQ3/g
ED4LAIePlVsClU8D7rkPzneufdJAMj5LLQGYAqCJuduUti55/usLeWSe3sqTp8ObHcRkn0TJ3NR2
qMZfAS0X0Vrr0a5dSVtcLxddt6Kt49AyaYJugvVmxjRTLPtxzoTlmWJFUHPOFE5GY/5tnNkPItcJ
fL+PwR2fAwAcLBcA9WMAhG6uqnXx95vUS7aDFlqLEDCX8rS0z5SsYKpkBryi1cZpMg5l9nNVmfcX
Uzfs29JrlrS1qt4ymPdVeM3G9doZr5Le6MLSKH4p4xfT2ovVkg4N2mCSMQjEQff8eQDHq+gbCADq
Rq/ki32qTcf8OihPVFUhGf5+wmu2KFNxvWUhozpMkvxWdkBePI2CydQypWuONcdIO6XFBtTcNa2F
Eeotol1vra+TUvS+i3m3V5SckkWlC6B8CCnlZ4NBMAC5UQJ9k1Y1oK3tJdSul2q5CCrGVxpH0MzK
SZjGVvO7tF51uqlpnNJWmvxTNPsb11uHrpA2GnY2+2skdzUz8KW0G8H8jEhPMUNS9LXcz55oP9TH
fk6XsgpQ/Uag2IcI77vjc+EgGBIcp16zMBLz16pz5JgDwTaYCfPXRRPaiVUxxkUnYlWNRpsMwZQt
xsrDjeaNfZ5UXWijmF+jlcJzIEh87jvXPmmw5z5U8mp9F2DXrjka0ADgxXqtqokNnZxUQlt3ZjVv
Q3N/24xPNG/DRjH/ejO+9ZSVtkSbj9CGTcD8AAiQYCllbb6u8U5A4j1Xs3f4LUvLYHq32xYAEJS3
qiY2enKW0ppaILEn6/0V0DZb5rO0ZYQ2WK9p0tWttyYtT6i/mvZt7l4r+1bDKc38zEK4nt/vLbth
8CcAcPi6Ej6N0eCloMSAdMmh4lY+Yph/8m0otEBHdmfq0VYWWZfJOf02jNW3Y9DaizUZgHyRStIi
2ujYXHvrYFDzqvUEgAoEEuHzYT/ogRwH5rrZjPkLB7FwchbWa5wcsW9nzD/hNhh8Xcz8pQSjXx85
rtOhAoCf3tLfMYwCgNWoZwHEgcAT8rufC4aBQ+RkyzXs7Np9My2fdFpat+7hR6C/n5BtNPOvw/hu
lMlfsfYWOi0HBHz5766lwe4jcKtWAIAGLsC+fexs2XKhQ0IcEq4Aq4zAEZi/Dt2kB3FTTM7Kek9N
5k+GYMrujO1U+YGKekeg3Sjmr6YlNxj4PqS8GQCOIPqMQRVqCgDiu5cgbnoT9Qh0PbkURvHGeqXV
IJ4Sk3NCtM2Y3zLLN5r5mwrWKZi7ZbQz5s9QMTmekEP/6NYzvvL3ACpTgBVqWwAqoii9wV/6awMm
uF6lUQJsuGaaRr1ltIW8UMr8I7ZBu1j1HGlYb12yDRCsM+bP0QVOywUR/cXpRy7nPVezV8f8Bxqu
Auzbx06wY+EoSXxOeE7qBpS0TPspxyOE+a0H6zL/iExai/nrYpMz/zTqLaMtHpIm0jdfpJK0AS1B
iHDo+yD65MGDFO6qeAJQR6NvA969BHH4DeQTROoGFOFUYv6mjNeE+UsrqktrL1qr2TPmb0Zbi6+b
DEDD66OWXa0TM5HryKF/dOuOzucA4GBN8x9oKAASN6A9+MtgdRCCXA+2W+MGfTNhJk0m5xQGZnKT
czLMX5e2Sb21yDaa+ScgsKsutFEmfzPmj83/tsvkiA+efgSNzH+g8efBUzeAgZvclgvWP7zNSaNq
NX6STJpUt9GTs7LeU5P5G/fvhJjUyvx1MSLtRjH/KPUShJCBJJbh3zU1/4HGAiDC4TeQ7zjirczB
kMjJNOiUMPknRNuM+S2zfKOZf5NbVTPmr2oKh06r5QSD/g23/fHCDfv2sXPwINVa/lNoLAAi/4Lp
uPzWl4N+uEzCddTjwY8W5i/khVLmH7EN2sUqi0yBSU8Nq2oytPZiTQageRuaBPss4yvJESDH+VuA
6e6l5vw8ggVAvOdquBceuTCEoD9yWwIABY8m5rcerMv8IzJpLeavixnzZ2iLh6SSwF6kCfPXRd4c
YiE8L+j1j5IYfgCo9/CPidFcgOsQHDxIIaH3zuHa8CiE61bezkYz/wQGsfnknIzJP2P+mnVO1Kqa
ntYHxmV+gEGB0/IA8DtvvXbLg3uurpf6a2IkAaAeEb7pwLajDH6n23YIoPEfEd7kPmmzeifD/HVp
m9RbRTI15i8Zs7yCa1hvXdSyqqZo8mN85o+0v+sG/f7RTnt4LcA0ivYHRhYAytxgEtS/1u8Nj5LN
CpjwIE51cpbQNmN+y02fQsw/LXO3jM7K/HVxijH/ZOYjBU7LI4DfedMfbDs6qvYHxhAAKhagrACn
7QD6i0I22uSfEG1z5h+/DbVM/mlZVXUxob6dMX/TepkFOc4ktD8wlgDIWgHB2qBHjusCXP8hIWDT
Mn8h39Rl/on7pFXXH51281tVk6O1F2syAM3bMGak36wrcOdaghnXjqv9gTEFAECMfRA3Hdh2NOTw
Z0kQMYv6jdlo5i/o7MLJ2YT566KWZhqv3kqyRwHzFw9fJYG9SBPmr4sKWoYMnVbb8Vf7X+C5ztv3
7WNnHO0PjC0AABykcN8+dm75z/MfDwfBIa/Tchhc3ahN6pM2n5zjM3+tZs+YfwpW1XRN/kkyPwAQ
HJBwBIHfevvv0+oDD4DG0f7AJASAwn4WIPk7UoYrggQX3v4m90mb1TsZ5q9L26TeKpKp9W/J+OYO
T0BgV9FuFPNPfsw4FJ4ngv7qx7/2rrl/2LePnUOHSlbeaqLipef1sedq9g5fR/6lv7W2v7PUvWaw
3PcB8jJEG23yl9A2Y/66fkN58Y1i/vXuW+updWjDI4X5wSyF1xFhMFxzd3Z2Hgb6OAAA1Cjv34aJ
WQCHr0Owdz+7W5e67xgsDz8hPNdlcJqXPGP+DG0tk3/CpvFGWVUz5i8grqcBGMIJIYNVluHrDl+D
3r4joEkwPzBBCyACC4Dknv0/nHPljgeF681JfyARfbO5vGRuo87lxqNtwuPWExOfnOPVW0m2qQXr
5GiLfc+G9Ta4/qT9/ZSU/fb8nDc8uXrNre9eOKAs7QZXK8XkYgAAAJL79rFzGNf1JfuvA8JVIies
6p6pMn+BpC2cnFNk/lpCf8b8zWi1Ti3u3yYD0PD6mCrzh47jucOV3ifk/Pw7IuYfL+pvYsIWQIQ0
HtDf39nWvqa/3B8QqG2jPTUm52SYvy5tk3prkW10/85M/uZtkFKS2xZSBmtucHTn4eseu6Ys7Aa1
VGLCFkCEw9ch2HM1e/2l9jsGy8PrW3OddiYeEGNTTM7Kek9N5k+U3cR90nLaGfOPVy8AQEomxxMg
GbIMX3f4zLP6+/axM2nmB6ZkAURgAoj3fYidH3x9+DHhOi8LfZ8J5GyEv194uEkgYKOZfzNMzhLa
GfOPV29EywzhBILEMBwOX3fbdQvXYx87aPiij7qYigUQgRj7WRx8LYWBeOh17Id94bQcZjnSB0XG
oS1UWNNgfsMnrUtbq966ZBsgWGfMX0DclJYxbM23PTkcvv226xauf8IbuT0t5gemagFE2LePnYO7
wZfKwUuFI/6aJYiDEKDqlQEAE2H+ZnWOb/LXKrbRk3NCtM37d3zaSsZvUm+D608r2JfeF/ted84L
1nrXy/nu67yTGEZBv/Gy/cowdQEAAMqEufS3Vl5OXvuvIZk4rBACM3+/Ee0jmvk3WOsD68j8/f71
T3yw86ro3X48dqpvFaboAmg4SOGeq9m7+b8uXI9B+EoIYnIcMBc8MzBj/ka0m4L5RzF3G15/o0z+
6TI/A8yDDPPvBkdf950u8wPrZQHEUMuDe97Sf5nbcv5GuK4I+r2QSDgJ0Yz5a9NybmN9rj/z98er
N6FlZhDYW5gT/qrG/ABwYPIRfxvWxwKIcfg68vdczd7h3+t8MhwGV0oOP+12uw6A5plNE2F+iyra
aOavqR2TybmOzG+93Iz5R2oDs5TkuMQQ0u8Nrtm6s/Pq5JXe68T8wDpbAArp+8v3i2e/9bc+7nRb
L/dX+yExHFCNJlk6u5THx66kmK6yyCk4OWsf3jDmbzIAzdswfX9fhsJpOyAOZTB81W1/vHA99rPA
AfB6mP06NkQAAMDe/eweAuRefF70wud+xHFbrwj9gWQpOeMSmKjLt1M2+WsVmzH/yLQbofWBKTJ/
XDmDfMfteozgKA8HP3/rnyx88glv5PZ3rqVBw9omgg0TAAAAZsI1IBwg+Zz9/k9I5o8Jx3OCfj8g
IjdLW1BF7YMFJzfa5G9Ae8ox/ylk8gNTZn4pGUTcWpgTw5P964f+g79w5D2PPzrNJJ86WNcYQA5E
jAMk9+9nceMB7xPhMLyKWf69N9dxmVmqLw4V4dHC/InvPY0JWhJHsPr7j0Dmj+Jxk69X0TJzILwu
MYQc9gbXbD2j8+oj73n80X0bzPzARlsAGvbu/Zx76NCLAuz7kHPpBa/+qON6r5CBDw5DH4ALIzjQ
PNhXl7a4+EYx/3prfeupWbCvcRuYOSSGEN4cMfyjMhj+wkb6+zZsrAWg4dChFwX7PsQOdu/jm/9z
65UcDl5Jgh52ux0PJIg5fZhoUzJ/U+24SZnf2rQZ8zdrAzMzs+94c47TniPp9/+md/yBJ932xwvX
77n6Fi+K8m888wObyALIIsqAuuTXT5xGW7v/BuDfcdstx+/1JQNMySeJFXlhPaW75U1oUOxUmpwl
tBsR7Csu1mQAmrdhOiY/MzNCQY7rdtuQfngDmH//8LXeDYC++rV5sEkFQLaznv2bvZeg1XoTmK8k
chAOesxEkpiKVwtmzN+IdiOY/xET7GNmBkLheK7jeQj6g4dJ8B9+7YG/eRsOvjZO6QU2i9bXsWkF
QASmPVfDVa9AuuR3+EpB4b8DcBWRg7DfYwaFRHCyMYJTM9iXkJ1KzP8oNvkZHIKZhdOKGb9/FETv
HA761x55z7ajwObU+jo2uQCIsH8/iwPXgEGRBI0Egfx3YL5KeA7CfggZ+gEIRNFbU9L7OkWYn3Mb
E2zDLNg3QeaPzHwCHNGaI+ECwVr/KAPX+sPBOxXj793P7qEDCDej1tdxSggAhX37PuQc/NA+mQoC
/0rhiBfKvv/L7lx7JwdA6PtgGUTCgCHM1YNCbDTzr7PWt56aMX9BvczMHBKRS8KD0/YgQwkZ+J+C
lP/gBMF1h6/b8hBw6jC+wiklABT27fuQc/DgviSSetEbl3e6i61fEkx74dJzheMtIkyFAREYDDe6
W4tAqDv3NuXkbE67uYJ92pmN7t+IWBWRACQBnmL6cBCApf+A02m/B1J+/vD/FwX3gFOP8RVOSQGg
sG8fOw/sBh06kH4h5Tlv59P9h3v/WsDZC4eeJ1xvgQQQ9iMSlgHA7HMkCZIgYjRqJdbCRk/OCdFu
LuYfIdI/sWBfepYBCYYEg4TjucwM4bYgvGjeKKYPfPn5/urxG+/6s50n45K0dz+cU5HxFU5pAZCC
ac/Vh93D113i6zNk737esTro/TKxswjIXwaJFhFtcbseOATCQQiGRNQNDBnG1kKu+iZNaUC2AWZ/
7jGzdYg5lGr+dY30R+NMII+EG9PFzO5EZYLe2rLwPMgg+KLX6X45GA5uHsr2F468i1ZULXv3s3v6
EfBmDu7VxSNEAGhgpr3XwDl0QAT6jLn0jbwF24Ggt/qc1tz8ZcHqmkck3sAkWswhiEm4c52FXI9w
/FfVU6z9Ekon60zzT+/6pX3LAAQQ9oaQMlwGMQvXI/b9GyG8GzkMgpbw3007tvg3H6BlvWjK9Ng0
STyTwCNPAOhgpj1vOOwunLmHdTdBYff++xcWcLrA0YcReq0Wua1fhhAtSI1UIsqXnOAT2hKAkICc
cL1p5ROuV9XVsF7VFL2KZgQjoqgPBKTb6Qp/tX9j2129KRycRs6ZYJPZFfZczd6uY5CPNKbX8cgW
ABlEyRj79kHcvQSxcCasQmGGRyf2XM1eNCcQm/WPTIY38SgSADZwJl9gzxsOu8CeDWzPDOuBVKsr
PDqYfYYZZphhhhlmmGGGGWaYYYYZZphhhhlmmGGGGWaYYYYZZnhU4P8HCzP9FO3vMPwAAAAASUVO
RK5CYII=
````
<!-- DT-REPO-FILE-END F080 -->

<a id="file-f081"></a>
### F081 — `resources/icons/32x32.png`
**1830 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F081","path":"resources/icons/32x32.png","mode":"100644","encoding":"base64","bytes":1830,"lines":null,"sha256":"86a63aab95da0ff8b244312a36ecc57b78c1e732a19afc181d4d8e39da87b44f","git_blob_sha1":"6705309b6963ebb8792f365a5cb52b9c496fe4cc","fence":"````","final_lf":null} -->
````base64
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
TkSuQmCC
````
<!-- DT-REPO-FILE-END F081 -->

<a id="file-f082"></a>
### F082 — `resources/icons/48x48.png`
**3260 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F082","path":"resources/icons/48x48.png","mode":"100644","encoding":"base64","bytes":3260,"lines":null,"sha256":"306dad442254465c88a672788bc193a8abce61768d994bea34baeb9e4cc622de","git_blob_sha1":"5025b5dbe8958a6fa6761c3b298e52a7eb932180","fence":"````","final_lf":null} -->
````base64
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
AAAASUVORK5CYII=
````
<!-- DT-REPO-FILE-END F082 -->

<a id="file-f083"></a>
### F083 — `resources/icons/512x512.png`
**40222 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F083","path":"resources/icons/512x512.png","mode":"100644","encoding":"base64","bytes":40222,"lines":null,"sha256":"bbfaf0cbd6f75bbc043f664332963289a3517963bfc8f0f375aba2f439dbf650","git_blob_sha1":"e9a32bb782563f5fc98fe9bb47bc0caf906514fd","fence":"````","final_lf":null} -->
````base64
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
````
<!-- DT-REPO-FILE-END F083 -->

<a id="file-f084"></a>
### F084 — `resources/icons/64x64.png`
**4713 byte originali** | Binario completo codificato Base64 | modo Git `100644`
<!-- DT-REPO-FILE-BEGIN {"id":"F084","path":"resources/icons/64x64.png","mode":"100644","encoding":"base64","bytes":4713,"lines":null,"sha256":"a0242c767d66622f16779b071c7f45d76c45a99ff026f6fbd10eb2c9c8dce2e6","git_blob_sha1":"dd1f568c85a9cf05fcb25f5f197a01fee4ada88d","fence":"````","final_lf":null} -->
````base64
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
````
<!-- DT-REPO-FILE-END F084 -->
<a id="ricostruzione"></a>
## 14. Integrità, ricostruzione e aggiornamento del dossier
Per ricostruire lo snapshot in una nuova directory, usare i blocchi `DT-REPO-FILE-BEGIN`/`DT-REPO-FILE-END`: i metadati indicano il percorso relativo e il formato. Per `utf-8`, il contenuto del blocco è il file; mantenere i fine riga LF e il newline finale. Per `base64`, decodificare il corpo ignorando solo gli spazi e i fine riga introdotti dalla codifica. Non copiare nel sorgente titolo, recinzione Markdown o metadati. Tutti i file di questo snapshot hanno modo Git `100644`.
Dopo l'estrazione, controllare numero di file, dimensione, SHA-256 e hash del blob Git. L'hash del blob è SHA-1 di `blob <numero-byte>\0` seguito dai byte del file. L'albero Git ricostruito deve essere `e52f20aef32376dbeb3c1b467b8727f4daf58dc4`. Non sovrascrivere una copia più recente del progetto senza un confronto. I rapporti E001/E002 sono allegati esterni, non file dello snapshot.
Verifica dell'export effettuata in questa sessione: 84/84 file ricostruiti dai blocchi, contenuti confrontati byte per byte, hash verificati e tree Git coincidente. Nessuna esecuzione dell'app o disinstallazione è stata svolta per produrre il dossier.
Questo documento non si aggiorna da solo. Dopo una modifica futura, rigenerare inventario, contenuti e hash dal nuovo commit; non cambiare soltanto il numero di versione in copertina. Il repository resta la fonte da confrontare per sapere se questa istantanea è ancora attuale.
**Fine del dossier. Inventario atteso: 84 file del repository (74 testo, 10 binari) + 2 rapporti esterni.**
<!-- DT-DOSSIER-END {"repository_files":84,"evidence_files":2,"git_tree":"e52f20aef32376dbeb3c1b467b8727f4daf58dc4"} -->
