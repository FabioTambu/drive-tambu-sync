# Drive Tambu - esito della riprova sulla sicurezza

Data: 18 ottobre 2026.
Base online verificata: e8c21452844a52f6cb8aae5fa2e92230864b1a53, versione 0.3.0.
Ambito: indagine del Task 1 del piano approvato; nessuna nuova garanzia abilitata nell'app.

## Perche il precedente esito non dimostrava impossibilita

L'adattatore precedente restituiva esplicitamente unsupported e il test nativo
si fermava alla verifica dei prerequisiti. Non esisteva una prova di montaggio
SFTP reale che potesse decidere il comportamento di arresto.
La mancanza di un runtime Windows/FUSE locale e un limite dell'ambiente di
prova, non una prova che un'implementazione non possa essere costruita.
Resta una distinzione essenziale: osservare una coda vuota non impedisce a
un altro programma di aprire o scrivere un file immediatamente dopo.

## Nuovo lavoro effettivamente prodotto

Il pacchetto aggiunge soltanto .github/workflows/storage-investigation.yml e
tools/safety-probe/. Non modifica i sorgenti dell'app, package.json, il workflow
degli installer o il precedente test:storage bloccante.
Il workflow e manuale e prepara due VM GitHub-hosted distinte, Windows e Linux.
Rclone, WinFsp e FUSE vengono preparati sulle VM, non sul PC personale.
Un server SFTP usa-e-getta su 127.0.0.1 permette prove con file artificiali.

Le tre prove sono: invio di un file chiuso con confronto SHA-256, osservazione
di un file aperto durante unmount, recupero di un file completo chiuso dopo
arresto del server temporaneo e riavvio del daemon con la stessa cache.
Il report riporta productionSafetyCertified: false anche in caso di workflow
verde. Non e un adattatore di arresto, una prova di crash durability o un
collaudo completo dei requisiti di recupero, conflitto e disinstallazione.

## Verifiche eseguite qui

- Test-first delle utility: 12 fallimenti prima dell'implementazione, poi 12
  successi. I casi dello scrittore usano un vero processo Node separato e file
  temporanei ordinari; non un montaggio rclone.
- Test della rimozione delle credenziali temporanee dagli errori di setup:
  fallimento riprodotto prima della correzione, poi superato.
- Esecuzione finale delle utility: 13 test, 13 superati, 0 fallimenti.
- Suite di sviluppo precedente: 127 test, 127 superati, 0 fallimenti. Il normale
  progetto online aveva 106 test; i 21 aggiuntivi sono quelli del precedente
  archivio di sviluppo, non vengono aggiunti da questo pacchetto diagnostico.
- node --check: tutti i file JavaScript del pacchetto verificati.
- YAML: attivazione soltanto manuale, permissions contents: read, matrix con
  windows-2022 e ubuntu-24.04, otto passi, artifact limitati ai report JSON.
- Chiave host temporanea: formato della chiave pubblica SSH verificato con una
  seconda libreria crittografica rispetto alla chiave privata generata.
- Esecuzione dello script nativo qui: rifiuto atteso, exit 1, nessuno scenario
  nativo eseguito. Il runtime non e una VM GitHub-hosted; non ha /dev/fuse,
  rclone o Windows/WinFsp. Il report locale resta blocked-or-failed e false.
- Tentativo effettivo di scaricare rclone: fallito per risoluzione del dominio.
  Non e stato nascosto o convertito in un test superato.

Non sono stati effettuati montaggi Windows/Linux reali in questo ambiente.
Non e stata costruita una nuova versione Electron. Il workflow non e stato
caricato o avviato nel repository online; nessun file del server e stato usato.

## Revisione e decisioni

Revisione dell'autore, senza revisore indipendente disponibile. Il controllo ha
riguardato isolamento, credenziali, processi figli, timeout, affermazioni del
report e separazione dai sorgenti di produzione. Un problema di redazione
errori in inizializzazione e stato riprodotto con test fallente e corretto.

Decisione 1: aggiungere una caratterizzazione separata al posto di far passare
il vecchio test bloccante. Motivo: permette osservazioni native senza fingere
che esista una barriera; costo: richiede l'esecuzione del nuovo workflow prima
di scegliere e validare l'adattatore di produzione.
Decisione 2: correggere il controllo locale del numero di passi YAML da sette
a otto dopo verifica del file. Nessuna modifica al comportamento del workflow;
costo: nessuno per il prodotto, correzione della verifica.

Nessun fork di rclone o componente nativo viene introdotto nell'app.
Nessun rilascio della chiusura protetta e autorizzato da questo pacchetto.
Non sono registrate altre correzioni minori rimandate per questo pacchetto.

## Interpretazione degli esiti futuri

- Setup rosso: leggere il passo di installazione fallito, non dedurre che la
  chiusura protetta sia impossibile.
- Prova file aperto: accettazione e rifiuto dello smontaggio sono osservazioni,
  non attestazioni di conservazione sicura delle scritture.
- Prova di recupero verde: dimostra solo il caso sintetico completo/chiuso
  descritto, non tutti i casi di dati incompleti o modifiche concorrenti.
- Dopo questi risultati resta da implementare e validare il coordinatore e
  l'adattatore; il programma installato continua ad avere il comportamento 0.3.0.
