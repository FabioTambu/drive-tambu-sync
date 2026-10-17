# Drive Tambu - percorso di sviluppo

## Versione 0.1.0 - base iniziale
- [x] Nuova interfaccia minimal in React/TypeScript
- [x] Electron main + preload + API IPC esplicita
- [x] Configurazione e monitoraggio processi rclone
- [x] Montaggio come cartella su Windows/Linux
- [x] Backup con versioni e verifiche basilari
- [x] Tray e impostazioni base per avvio automatico
- [x] GitHub Actions per Windows e Linux
- [ ] Build e prova reali Windows + Linux

## Versione 0.2.0 - stabilita
- [ ] Test di integrazione con rclone fittizio e server SFTP di prova
- [ ] Riconnessione con backoff e miglior reporting Cloudflare/SSH
- [ ] Diagnostica WinFsp/FUSE e wizard prerequisiti
- [ ] Avanzamento backup affidabile e storico persistente
- [ ] Interfaccia di ripristino da archivio
- [ ] Test di regressione sui backup in condizioni di rete assente

## Versione 0.3.0 - migrazione
- [ ] Analizzare i veri file della precedente Drive Tambu
- [ ] Importare i montaggi senza perdere i dati
- [ ] Testare i collegamenti Windows creati dalla vecchia app

## Prima release stabile
- [ ] Installazione pulita su Windows e Ubuntu Desktop
- [ ] Firma digitale e pacchettizzazione verificata
- [ ] Aggiornamenti sicuri da GitHub Releases
- [ ] Testare rimozione/migrazione/backup con dati di prova
