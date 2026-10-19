# Drive Tambu 0.5.1

Connessione guidata SSH/SFTP dall'app, rclone e cloudflared ufficiali inclusi nel pacchetto, installazione autorizzata dei componenti di sistema mancanti.

**Istruzioni correnti:** [migliorie di configurazione 0.5.1](AGGIORNAMENTO-0.5.1.md), [primo avvio 0.5.0](AGGIORNAMENTO-0.5.0.md). **Stato delle verifiche:** [rapporto 0.5.1](docs/VERIFICA-0.5.1.md), [rapporto 0.5.0](docs/VERIFICA-0.5.0.md). La patch dei sorgenti non equivale a un installer compilato o a un collaudo nativo riuscito.

Windows e Linux x64. Per installazioni nuove su Mint/Ubuntu/Debian preferire il `.deb`. Rclone e cloudflared vengono scaricati durante la build con versioni e SHA256 fissati, senza modificare quelli del sistema. L'installazione di WinFsp/FUSE/OpenSSH richiede il consenso del sistema operativo quando necessario. Le connessioni e le chiavi esistenti restano al loro posto.

Nella 0.5.1 il wizard propone automaticamente la cartella delle chiavi SSH nel selettore e suggerisce i percorsi piu comuni, con indicazioni sotto ogni campo. Non legge ne copia i contenuti delle chiavi; la scelta rimane esplicita.

Il wizard offre host SSH esistente, SSH diretto e Cloudflare Tunnel. Usa chiavi già autorizzate o un agente funzionante; non crea chiavi, non modifica il server e non memorizza password SSH. Le nuove connessioni restano private dell'app e vengono elencate solo dopo il controllo SFTP.

## Sviluppo e build della 0.5.1

```text
npm install
npm test
npm run typecheck
npm run dev
npm run dist:win
npm run dist:linux
```

Eseguire il comando dist sul relativo sistema. Per preparare i componenti nativi durante lo sviluppo: `npm run prepare:vendor`. Le distribuzioni verificano il bundle anche dopo il confezionamento. In GitHub Actions il test SFTP nativo deve riuscire prima dell'upload degli installer; non eseguire il test usa-e-getta sulle macchine personali.

## Documentazione storica conservata (fino alla 0.4.1)

La parte seguente descrive versioni precedenti. Le indicazioni sui componenti da installare manualmente e le dichiarazioni dei vecchi ambienti di build non sostituiscono le istruzioni 0.5.0 e 0.5.1 qui sopra.

---

> Patch 0.4.1: collegamenti con apertura silenziosa del pannello e argomenti corretti. Vedi [istruzioni](AGGIORNAMENTO-0.4.1.md) e [verifiche](docs/VERIFICA-0.4.1.md).

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
