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
