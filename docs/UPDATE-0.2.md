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
