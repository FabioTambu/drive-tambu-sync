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
