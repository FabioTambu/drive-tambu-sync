# Drive Tambu 0.2.0 - come applicare l'aggiornamento

Questo archivio contiene i file di aggiornamento del CODICE SORGENTE. Non e un installer e non va copiato in AppData o nella cartella del programma installato.

Base verificata: repository FabioTambu/drive-tambu-sync, commit
483fc25987e25b8490ac8406b427062575fbfdbb (main del 17 ottobre 2026).
Le correzioni precedenti a TypeScript, --publish never e maintainer Linux sono conservate.

## Sul tuo computer

1. In GitHub Desktop apri il repository drive-tambu-sync e scegli Repository > Show in Explorer.
2. Prima di copiare, controlla in GitHub Desktop che non ci siano tue modifiche non salvate. Se ci sono, salvale con un commit o conserva una copia della cartella fuori dal repository.
3. Estrai lo ZIP in una cartella temporanea. Copia IL CONTENUTO estratto nella cartella del repository (quella che contiene package.json). Unisci le cartelle e sostituisci i file con lo stesso nome. Non creare una seconda cartella di progetto annidata.
4. Torna in GitHub Desktop. Le modifiche includono src, tests, package.json, README, documentazione e .github/workflows/build.yml.
5. Crea un commit, per esempio: Add friendly interface, server browser and dark mode. Premi Push origin.
6. GitHub Actions eseguira test automatici, controllo TypeScript e creazione degli installer. Aspetta il risultato dei job Windows e Linux: questa build 0.2.0 non e ancora stata eseguita da chi ha preparato lo ZIP.
7. Quando il job Windows e completo e il caricamento artifact e riuscito, scarica drive-tambu-win. L'installer avra versione 0.2.0.
8. Esci dalla versione Electron gia aperta prima dell'installazione. Aspetta la fine dei trasferimenti. Non cambiare o disinstallare la vecchia applicazione PowerShell.

Non e necessario eseguire rclone config, cambiare chiavi SSH o configurare di nuovo Cloudflare per riutilizzare la connessione casa gia salvata sullo stesso PC.

## Prima prova dell'app aggiornata

- Si apre il pannello compatto. Il pulsante Espandi in alto apre la finestra completa; l'altro pulsante la riporta al pannello.
- Impostazioni > Aspetto: Sistema, Chiaro, Scuro. La scelta e salvata.
- Impostazioni > Il tuo server > Verifica connessione: deve confermare l'accesso, non solo che rclone e installato.
- Nuova cartella > Cartella sul server > Sfoglia: naviga nelle directory. Home e la cartella personale dell'utente SSH; Server parte da /.
- Puoi incollare casa:/home/server/services/filebrowser/data/fabio. L'app elimina il prefisso casa: dal campo del percorso e lo aggiunge una sola volta al comando interno.
- Scegli la posizione sul computer con Sfoglia: il nome finale viene preparato senza cancellare cartelle gia esistenti.
- Prova inizialmente una directory non importante. Non usare contemporaneamente vecchia e nuova app sullo stesso punto di collegamento locale.
- Testa i backup separatamente con dati di prova. Un backup occupa spazio locale; non e una semplice vista del server.

## Configurazione esistente e ritorno indietro

Le cartelle della versione Electron 0.1.0 vengono mantenute. Alla prima lettura della vecchia configurazione viene conservato, nella stessa cartella dati dell'app, il file config.json.before-0.2.bak. Non vengono lette, esportate o modificate le chiavi private. Nessun file sul server viene cambiato applicando questo archivio.

Per annullare le modifiche del codice usa Revert sul commit di aggiornamento in GitHub Desktop, poi genera nuovamente la build. Non riportare indietro la configurazione mentre l'app e aperta. Per ripristinare anche quella, chiudi prima Drive Tambu e conserva una copia di config.json prima di usare il backup.

## Limiti da conoscere

La connessione reale al server e gli installer devono ancora essere collaudati. Lo ZIP non include rclone, WinFsp, FUSE, cloudflared o chiavi. Il riconoscimento automatico usa una connessione gia presente: non crea automaticamente un nuovo account SSH o una nuova connessione su un PC privo di configurazione.

Su Linux il comportamento del pannello e dell'icona di notifica dipende dal desktop. Su Wayland viene mantenuta una finestra nativa utilizzabile anche se il posizionamento in basso a destra non e consentito dal sistema.

La compilazione riuscita non equivale alla prova del server. Il timeout dovuto al percorso duplicato e corretto nel codice; eventuali problemi di autenticazione, rete o componenti del filesystem devono essere individuati con la verifica della connessione e i dettagli di Attivita.
