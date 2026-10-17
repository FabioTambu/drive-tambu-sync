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
