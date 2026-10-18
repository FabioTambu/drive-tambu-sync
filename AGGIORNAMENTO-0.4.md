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
