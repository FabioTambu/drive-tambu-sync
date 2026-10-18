# Verifica patch 0.4.1 - collegamenti silenziosi

## Provenienza

- Baseline GitHub main letta tramite il connettore: commit
  4b3a01a2b8bc7b24d6cd023abd48a573fbbc2309, versione 0.4.0.
- Ricostruiti gli 84 file dal dossier completo fornito nella conversazione,
  con dimensioni, SHA-256 e blob Git verificati per ogni file.
- Albero Git ricostruito: e52f20aef32376dbeb3c1b467b8727f4daf58dc4,
  identico all'albero del commit upstream verificato.
- Lavoro in una copia isolata, ramo locale fix/silent-folder-shortcuts.
  Nessun push, pubblicazione, modifica al server o ai dati personali.

## Difetti coperti

1. Il secondo avvio chiamava showWindow prima ancora di interpretare la richiesta.
2. handleShortcut chiamava nuovamente showWindow per aprire una cartella.
3. Il primo avvio mostrava sempre la finestra all'evento ready-to-show.
4. I nuovi lanciatori non includevano il separatore -- verificato dall'utente.
5. Il secondo avvio si affidava solo all'ordine degli argv inoltrati da Electron.
6. Il lanciatore Linux dichiarava StartupNotify=true anche per l'avvio silenzioso.

## Test eseguiti

Runtime disponibile: Node.js v22.16.0, compilatore TypeScript globale.
Il progetto non include un package-lock.json e non ne e' stato creato uno fittizio.

- Baseline: 168 test passati, zero errori.
- Prima del fix: 12 fallimenti mirati tra i test di lancio/argomenti, con
  rimanenti casi di compatibilita' passati. Sono stati osservati i fallimenti
  dovuti a show/focus, argv non inoltrati, dati non validati e '--' mancante.
- Secondo ciclo: test StartupNotify fallito prima del cambio true -> false.
- Suite completa dopo la patch: 188 test passati, zero falliti/annullati/saltati
  nell'ambiente Linux di preparazione. Venti test in piu' della baseline.
- Comando: `NODE_PATH=$(npm root -g) npm test`.
- Controllo TypeScript isolato di src/main/shortcuts.ts e src/shared/types.ts:
  superato con --strict e le dichiarazioni Node installate con ts-node.
- node --check sui nuovi file CJS e git diff --check: superati.

Il nuovo harness esegue il VERO codice src/main/index.ts, shortcuts.ts, store.ts
ed operations.ts; sostituisce le API native Electron, i montaggi e i backup con
confini controllati. Usa solo un profilo temporaneo, mai rclone, chiavi o server
personali. Simula win32 e linux per verificare le decisioni del main, incluse le
chiamate show/focus, la consegna del percorso e il mantenimento dei blocchi.

Copre avvio a freddo e a caldo, ready-to-show ritardato, montaggio da richiesta
esplicita con autoConnect disattivato, pannello gia' visibile, avvio normale,
assenza della tray, seconda istanza che perde il lock, dati inoltrati originali,
argv riordinati, dati malformati, cartella non salvata, errore di connessione,
errore di apertura del file manager, operazione di sicurezza attiva e richiesta
di uscita dall'installer. Verifica anche gli argomenti del .lnk generato e il
contenuto del .desktop. Non costruisce un vero .lnk con Windows Shell.

## Verifica del pacchetto

Lo ZIP contiene 10 file da aggiungere o sostituire, nessuna eliminazione.
Applicato a una copia pulita degli 84 file della 0.4.0: tutti gli 89 file
risultanti coincidono byte per byte con la copia di lavoro aggiornata; anche
nella copia ottenuta dallo ZIP la suite completa passa con 188/188 test.
Integrita' ZIP e SHA-256 delle 9 voci nel manifest verificati; il decimo file
e' il manifest stesso, che non include il proprio hash.

## Controlli NON eseguiti con esito positivo qui

- npm install --ignore-scripts --package-lock=false: fallisce con EAI_AGAIN
  (registry.npmjs.org non risolvibile).
- npm run typecheck completo: bloccato dalla dipendenza locale @types/node
  assente (TS2688). Il typecheck isolato non sostituisce quello completo.
- npm run build: electron-vite non installato; nessuna build dichiarata riuscita.
- Nessun installer Windows/Linux generato qui, nessun test grafico su Electron
  installato e nessuna misurazione del tempo di apertura di Explorer.
- Nessuna nuova prova nativa dei montaggi: la loro implementazione non cambia.

Il workflow Build Drive Tambu deve eseguire test, typecheck e compilazione dopo
il caricamento della patch. Il collaudo sull'app installata deve ancora confermare
l'esperienza visiva e l'apertura dei collegamenti reali.

## Revisione e limiti

Revisione svolta dall'autore, non da un revisore indipendente. Controllati anche
il percorso di errore e l'assenza di modifiche a trasferimenti, impostazioni,
cache, backup, pulizia dei punti di montaggio e disinstallazione.

Senza un'icona di notifica creata correttamente, il pannello viene mostrato
intenzionalmente: l'accessibilita' dell'app prevale sul silenzio. Su Linux alcuni
desktop possono non mostrare visibilmente una tray creata; la voce normale
nell'elenco delle applicazioni permette comunque di riaprire la finestra.
Il comportamento di minimizzazione/blur del pannello compatto resta invariato.

Un errore reale porta in primo piano l'app e il messaggio. Nessun timeout o
modalita' silenziosa autorizza a scavalcare il coordinatore di sicurezza.
I vecchi collegamenti non vengono cercati o modificati automaticamente sul PC.

## Riferimenti tecnici consultati

- Electron app, evento second-instance e requestSingleInstanceLock/additionalData:
  https://www.electronjs.org/docs/latest/api/app
- Electron BrowserWindow, show e ready-to-show:
  https://www.electronjs.org/docs/latest/api/browser-window

Questa e' una patch ai sorgenti, non una certificazione del filesystem o una
promessa di assenza di rischi residui nei montaggi.
