# Prova nativa del ciclo di vita di rclone - solo macchine temporanee

Questo pacchetto aggiunge un workflow manuale. NON aggiorna Drive Tambu,
NON implementa una barriera alle scritture e NON abilita una chiusura protetta.
Non modifica src/, package.json, il workflow degli installer o test:storage.
Un workflow verde significa che la prova diagnostica e stata eseguita,
NON che la specifica di sicurezza sia soddisfatta.

## Perche questa prova

Il vecchio test:storage controllava soltanto i prerequisiti e poi falliva
intenzionalmente in assenza dell'adattatore. Non apriva un file su un vero mount.
Questa indagine distinta avvia rclone, un server SFTP locale e un processo
scrittore separato, sulle VM GitHub. Serve per misurare il comportamento reale
prima di scegliere una primitiva di arresto; il gate di rilascio resta chiuso.

## Esecuzione da GitHub Desktop

1. Copiare `.github` e `tools` nella radice del repository (unire le cartelle).
   Non eliminare altre directory e non copiare nella cartella dell'app installata.
2. Commit con titolo `Add isolated native storage investigation`, poi Push origin.
3. Aprire Actions > Drive Tambu - Test nativi sicurezza > Run workflow > main.
4. A fine esecuzione scaricare gli artifact `sicurezza-windows-2022` e
   `sicurezza-ubuntu-24.04`. Anche un esito rosso puo contenere il report utile.
   Se il job fallisce durante l'installazione dei prerequisiti, servono anche
   le righe del passaggio fallito: setup.json da solo non contiene il log.

Non e necessario installare nuovi programmi o avviare comandi sul PC personale.
Il workflow puo consumare minuti della quota Actions del repository privato.
I file sono nuovi: per rimuovere la prova basta annullare il relativo commit.

## Prove effettivamente programmate

- Round trip: creazione/chiusura di un file sintetico da 64 KiB nel mount,
  consegna al server SFTP locale e confronto SHA-256 byte per byte.
- File tenuto aperto: scrittura confermata localmente, osservazione dei contatori,
  richiesta di mount/unmount e ulteriore scrittura attraverso lo stesso handle.
  Si registra se unmount rifiuta, accetta o va in timeout. Nessuno di questi esiti
  da solo viene dichiarato una barriera o una prova di conservazione.
- Recupero limitato: file COMPLETO e CHIUSO da 128 KiB, presente nella coda e non
  ancora consegnato; arresto del server fittizio, smontaggio, uscita del daemon,
  ritorno del server, riavvio con stessa cache, anticipo della scadenza degli
  invii di test e verifica del contenuto remoto mediante SHA-256.

La terza prova non simula un crash del sistema, un guasto del disco, modifiche
concorrenti, dati sparsi incompleti o un disinstallatore. Il report riporta sempre
productionSafetyCertified: false. Non viene prodotto un installer o una release.

## Isolamento e limiti

L'esecuzione nativa e rifiutata fuori da runner GitHub-hosted. Le directory
nascono con un nome casuale dentro RUNNER_TEMP. Non esistono input per un server
esterno: l'unico remote e probe:/, SFTP su 127.0.0.1. Si generano password e
chiavi SSH usa-e-getta. La chiave host viene registrata prima della connessione
nel known_hosts privato; non si disattiva la verifica SSH. Variabili RCLONE_ e
SSH agent ereditati vengono escluse. Configurazione, HOME e cache sono private
della fixture, diverse dai profili esistenti. Il protocollo RC e locale e
protetto da password casuale; non e presente --rc-no-auth.

La pulizia della PROVA puo terminare i soli processi figli creati per dati
sacrificabili. Questa NON e la politica da usare nell'app. Non viene eseguita
alcuna cancellazione ricorsiva della radice dei mount. Il filesystem della VM
e eliminato da GitHub al termine del job; negli artifact vanno soltanto JSON
sanificati, non cache, password o chiavi. Non usare questi script come comandi
per smontare cartelle personali. Il controllo di ambiente e una protezione da
uso accidentale, non una sandbox contro un processo malevolo.

Rclone e bloccato alla versione 1.74.4; WinFsp alla 2.1.25156. Gli hash degli
archivi sono verificati prima dell'installazione. Il report registra anche
la versione/hash del binario realmente eseguito. Non sono necessariamente
le versioni installate sul PC dell'utente; un futuro collaudo dovra riguardare
anche la combinazione distribuita. Nessuna versione del PC viene aggiornata.

## Verifiche locali, distinte dalle prove native

`node --test tools/safety-probe/tests/support.test.cjs` verifica le utility
senza npm. Il processo scrittore e reale e usa directory temporanee locali.
La sintassi di tutti i file JavaScript e controllabile con `node --check`.
La chiamata `node tools/safety-probe/native.cjs` in questo container si ferma
al guard del runner; NON sono stati eseguiti i mount Windows/Linux qui.

## Fonti primarie verificate il 18 ottobre 2026

- https://rclone.org/commands/rclone_mount/ (cache e recupero)
- https://rclone.org/rc/ (mount, unmount, queue, queue-set-expiry)
- https://rclone.org/commands/rclone_serve_sftp/ (server temporaneo)
- https://rclone.org/sftp/ (known_hosts)
- https://downloads.rclone.org/v1.74.4/SHA256SUMS (hash bloccati)
- https://github.com/winfsp/winfsp/releases/tag/v2.1 (MSI e SHA-256)
- https://docs.github.com/en/actions/reference/runners/github-hosted-runners

Il creatore di rclone distingue inoltre attesa/sospensione degli scrittori,
smontaggio e completamento degli invii nella discussione:
https://forum.rclone.org/t/how-to-detect-and-handle-failed-uploads-when-using-rclone-mount-with-vfs-cache/52466

Le fonti non certificano la sicurezza di Drive Tambu. Queste sono prove di
caratterizzazione preparate per essere eseguite, non esiti nativi gia osservati.
