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
