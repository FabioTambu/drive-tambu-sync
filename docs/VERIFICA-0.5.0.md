# Verifica di Drive Tambu 0.5.0

Data: 19 ottobre 2026. Stato: implementazione dei sorgenti verificata localmente nei limiti sotto indicati; build e collaudo nativo ancora da eseguire in GitHub Actions e sui computer di destinazione.

## Provenienza

Dossier ricevuto: snapshot applicativo 0.4.1, commit `258c827f11bc225e7d1846732749945865949e2d`. Tutti gli 83 file sono stati ricostruiti e confrontati con byte e SHA256 del manifest del dossier. Il connettore GitHub ha verificato `main` al commit `378fc1c3478beffb681f2cf568e0bee5fc502938`: il commit successivo aggiunge soltanto il dossier.

Il lavoro è stato eseguito in una copia Git isolata, branch locale `feature/setup`, senza push, installazioni sul PC dell'utente o accesso al server personale. Commit applicativo locale: `12d0d14` (gli ulteriori commit documentali non cambiano il codice).

## Esiti realmente osservati

| Controllo | Esito | Limite |
|---|---|---|
| Test della baseline 0.4.1 | 188 superati | Confini nativi simulati nei test originali |
| Suite completa aggiornata `npm test` | **226 superati, 0 falliti** | 38 test in più; non è una prova dell'installer o del montaggio nativo |
| TypeScript strict dei nuovi moduli setup/runtime/profili e dei tipi setup | Superato | Verifica semantica dei moduli indipendenti da Electron/React, usando TypeScript e tipi Node disponibili localmente |
| Parsing di tutti i sorgenti TypeScript/TSX | Superato nella suite | Non sostituisce il controllo semantico completo dell'app |
| `npm install` | Non riuscito | DNS/registro npm non raggiungibile: `EAI_AGAIN registry.npmjs.org` |
| `npm run typecheck` completo | Non eseguibile fino al completamento di npm install | Arresto su tipi Node mancanti nel progetto; dipendenze Electron/React non installate |
| `npm run build` | Non eseguibile | `electron-vite: not found` |
| `npm run prepare:vendor -- --platform linux` | Interrotto senza produrre un bundle | `fetch failed` nel download nativo; nessun checksum saltato per proseguire |
| Test nativo SSH/SFTP | Non eseguito qui | Il guard rifiuta correttamente l'ambiente non GitHub-hosted; il workflow lo eseguirà sui runner temporanei |
| Controllo visivo del modulo | Rendering statico ispezionato a 430x730 e 1100x880, senza overflow orizzontale | Output dei componenti con React/IPC simulati; non è un test del vero ciclo React, Electron, icone native o focus OS |
| Whitespace Git | `git diff --check` superato | Controllo formale, non funzionale |

Non sono stati eseguiti installazione/disinstallazione su Windows o Linux reali, richieste UAC/polkit, montaggi FUSE/WinFsp con questa patch, login Cloudflare reale o prove di perdita della connessione. Non sono stati prodotti installer nella sessione di preparazione.

## Cosa coprono le nuove verifiche locali

I test coprono il riconoscimento di rclone troppo vecchio, precedenza del componente incluso rispetto al valore predefinito, rispetto dei percorsi personalizzati e passaggio del PATH ai processi figli. Verificano gli elenchi fissi per l'installazione, gli errori di autorizzazione, l'assenza di timeout che terminino un gestore pacchetti privilegiato e il fatto che un codice zero dell'installer non trasformi componenti ancora mancanti in componenti disponibili.

La configurazione delle connessioni verifica input strutturati, indirizzi che tentano di introdurre opzioni/comandi, percorsi problematici, identificativi casuali e nomi duplicati. La prova della chiave del server disattiva i metodi di autenticazione; un token lega la conferma al profilo e all'impronta. Annullamento, conferma falsa o scaduta, sostituzione del file known_hosts e accesso SFTP fallito non pubblicano una nuova connessione.

Sono testati gli argomenti con cui lettura, montaggio e backup selezionano il profilo privato: non basta che funzioni il solo pulsante del wizard. Il bridge espone metodi specifici e gli handler rifiutano altre finestre e sottoframe. Una configurazione in corso blocca azioni concorrenti e uscita; continuare in background non riattiva prematuramente lo scheduler.

I test del processo di setup avviano realmente piccoli processi Node locali: confermano il passaggio letterale degli argomenti senza shell, lo scarto di stdout/stderr contenenti token e il timeout dei soli controlli usa-e-getta. Questo non equivale a eseguire OpenSSH, cloudflared o un installer.

Il build helper rifiuta SHA256 errati, origini non ammesse e archivi privi dell'elemento esatto. L'hook afterPack rifiuta un albero di risorse incompleto o modificato. I test usano payload artificiali: i binari reali saranno scaricati e verificati nella build.

## Revisione del codice

Revisione eseguita dall'autore della patch, non da un revisore indipendente. Sono stati corretti e coperti con regressioni i percorsi known_hosts con spazi, la possibilità di espansioni di ambiente nei percorsi SSH e il vincolo della fiducia alla sola chiave esplicitamente confermata nelle nuove connessioni. La verifica dell'MSI mantiene un lock di lettura durante hash, firma e installazione per impedirne la sostituzione nello stesso intervallo.

Il pin di rclone è stato allineato alla **1.74.4**, già usata dal workflow nativo di disconnessione esistente; non viene introdotta una versione precedente a quella di quel test. Il progetto resta senza lockfile npm tracciato: i range delle dipendenze JavaScript non fissano tutto l'albero risolto.

## Verifiche aggiunte a GitHub Actions

`Build Drive Tambu` mantiene installazione npm, suite, typecheck, dist e artifact. Le operazioni dist scaricano gli originali con versioni e SHA256 fissati; l'hook afterPack ricontrolla le risorse effettivamente impacchettate. Prima dell'upload, `tests/native/setup.cjs` avvia un server SFTP su 127.0.0.1 in una macchina GitHub-hosted temporanea, usa chiavi artificiali, verifica la connessione privata attraverso OpenSSH reale, legge un marker e controlla il rifiuto di una chiave server sostituita. Sono inclusi percorsi con spazi.

Il test nativo non legge configurazioni personali. Le chiavi temporanee restano nella macchina usa-e-getta, mentre l'artifact `setup-native-win` o `setup-native-linux` contiene soltanto il JSON ripulito. Un errore nel test impedisce l'upload degli installer. La presenza del test nel workflow **non è evidenza di una sua esecuzione riuscita**.

Il workflow manuale `Drive Tambu - Verifica disconnessione` resta disponibile e invariato. Va eseguito anche sulla nuova versione per le prove dei montaggi e del controllo trasferimenti; non va confuso con il test di configurazione SFTP, che non monta un filesystem.

## Fonti e versioni fissate

Fonti primarie consultate, non risultati di una nuova esecuzione sui PC:

- Rclone SFTP e SSH esterno: https://rclone.org/sftp/
- Rclone 1.74.4, SHA256 ufficiali: https://downloads.rclone.org/v1.74.4/SHA256SUMS
- Licenza rclone del tag: https://github.com/rclone/rclone/blob/v1.74.4/COPYING
- Cloudflared 2026.10.1: https://github.com/cloudflare/cloudflared/releases/tag/2026.10.1
- Metadati asset Linux cloudflared: https://api.github.com/repos/cloudflare/cloudflared/releases/414072297/assets?per_page=1&page=12
- Metadati asset Windows cloudflared: https://api.github.com/repos/cloudflare/cloudflared/releases/414072297/assets?per_page=1&page=25
- Licenza cloudflared: https://github.com/cloudflare/cloudflared/blob/2026.10.1/LICENSE
- WinFsp 2.1.25156 e SHA256: https://github.com/winfsp/winfsp/releases/tag/v2.1
- Licenza WinFsp: https://github.com/winfsp/winfsp/blob/v2.1/License.txt
- Confezionamento electron-builder: https://www.electron.build/v26/docs/api/electron-builder.interface.platformspecificbuildoptions/

Gli SHA256 sono in `resources/vendor-manifest.json`; i testi originali delle licenze e l'avviso sui componenti esterni vengono raccolti dal processo di build. Non è stato svolto un audit legale sulla distribuzione commerciale del prodotto.

## Criterio per installare la nuova versione

Occorre una nuova esecuzione GitHub completata con successo, inclusi typecheck, confezionamento e test SFTP nativo, seguita da collaudo su dati di prova. Non si deduce il successo di quelle prove dai 226 test locali. Le istruzioni per aggiornamento, uso e ritorno alla versione precedente sono in `AGGIORNAMENTO-0.5.0.md`.
