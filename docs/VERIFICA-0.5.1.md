# Drive Tambu 0.5.1 - verifica delle modifiche

Data: 19 ottobre 2026. Base applicativa: Drive Tambu 0.5.0 presente nello ZIP consegnato in precedenza, derivato dallo snapshot 0.4.1 del dossier verificato.

## Ambito

- Aggiunti suggerimenti contestuali ai campi del wizard nelle tre modalita di connessione.
- Selezione della chiave SSH: dialogo nella directory `.ssh` dell'utente quando esiste, altrimenti nella home.
- Vengono proposti solo percorsi di chiavi private dal nome convenzionale realmente presenti; nessun file viene letto, nessuna identita selezionata senza il clic dell'utente, nessun file `.pub` suggerito.
- Il rilevamento delle chiavi e presente sia nel report iniziale sia in quello restituito dopo l'installazione dei componenti.
- Nessuna modifica ai servizi che eseguono SSH/SFTP, rclone, Cloudflare, montaggio e backup.

## Prove eseguite

- TDD: nuovi casi falliti sul codice 0.5.0, superati dopo la modifica.
- `node -r ./tests/register.cjs --test tests/setup-ipc.test.cjs tests/setup-ssh-key-hints.test.cjs tests/setup-ui.test.cjs`: **13/13 superati**.
- `npm test`: **233/233 superati**, nessun test fallito (esecuzione finale).
- `git diff --check`: nessuna differenza di spaziatura non valida.
- Analisi di sintassi TypeScript/TSX: inclusa nel test automatico, superata.

## Verifiche non eseguibili qui

- `npm run typecheck` bloccato dalla mancanza dei pacchetti `@types/node` nel runtime del progetto (TS2688); il registro npm non era accessibile nella precedente sessione. Non e un esito positivo del controllo TypeScript completo.
- Non sono stati eseguiti `npm run build`, electron-builder, installer Windows e Linux ne un montaggio reale tramite FUSE/WinFsp.
- Sono stati generati file HTML di anteprima con il renderer di prova, ma il browser headless non ha completato lo screenshot: la resa visiva nativa richiede ancora controllo manuale su entrambi i temi e su schermo compatto.

## Verifiche da eseguire prima di distribuire

Controllare che GitHub Actions completi installazione npm, test, `npm run typecheck`, build Windows/Linux, bundling dei componenti ufficiali verificati e il test SSH/SFTP nativo predisposto nella 0.5.0. Su PC Windows e Linux verificare il punto di apertura del dialogo `.ssh`, la sua assenza, i suggerimenti delle chiavi, il flusso di una connessione con/senza chiave selezionata, e il mantenimento delle connessioni esistenti. Usare una cartella di prova; evitare trasferimenti in corso durante l'aggiornamento.
