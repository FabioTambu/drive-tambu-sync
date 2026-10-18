# Drive Tambu - correzione del file di controllo dei test nativi

Questa patch modifica soltanto gli strumenti di prova. Non e' un installer,
non abilita la chiusura protetta e non modifica l'app o i dati personali.

## Evidenza letta

Esecuzione GitHub Actions 39116390251, commit
6607555d7acaa53231239a4b809ccb51341a75fe (18 ottobre 2026).
I due artifact sono ora disponibili e sono stati scaricati:
sicurezza-ubuntu-24.04 e sicurezza-windows-2022.

Entrambi riportano un solo scenario avviato, basic-SFTP-mount-write-read,
fallito con: Mount marker timed out: ENOENT ... fixture-ready.txt.
Le prove di file aperti e di recupero non sono ancora state eseguite.
Questo esito non dimostra una perdita di file durante la chiusura.

## Difetto corretto e limite della diagnosi

Il codice creava fixture-ready.txt in mount(), dopo l'avvio del server SFTP
locale e la sua prima verifica. Il server rclone serve sftp possiede una
cache delle directory: una prima lettura precedente alla creazione puo'
continuare a mostrare un elenco senza il file di controllo.
E' un difetto d'ordine nella preparazione della prova, compatibile con i
report. Il suo effetto sul motore reale deve essere confermato dalla nuova
esecuzione: non si dichiara che fosse l'unica causa del fallimento nativo.

La patch:
- crea il file una sola volta in initialize(), prima di avviare il server;
- verifica il contenuto attraverso SFTP (cat, limitato a 64 byte), non
  soltanto l'esistenza della directory radice;
- non riscrive il file dopo l'avvio del server o durante il rimontaggio;
- mantiene il successivo controllo di lettura ATTRAVERSO il montaggio;
- lascia invariati timeout, autenticazione, parametri della cache del
  montaggio, versioni dei componenti e productionSafetyCertified: false.

Se fallisce il controllo SFTP iniziale, il report distinguera' quella fase
con Local SFTP marker readiness. Se invece il server serve il file ma il
montaggio non lo mostra, rimarra' il distinto errore Mount marker.

## Come applicarla

1. Apri GitHub Desktop > Repository > Show in Explorer.
2. Copia la cartella tools di questo ZIP nella cartella del repository;
   unisci le cartelle e sostituisci i due file omonimi:
   - tools/safety-probe/fixture.cjs
   - tools/safety-probe/tests/support.test.cjs
3. Crea il commit con Summary: Fix preparazione test SFTP. Premi Push origin.
4. Actions > Drive Tambu - Test nativi sicurezza > Run workflow > main.
   Avvia una nuova esecuzione; non riavviare i job del vecchio commit.

Non sostituire il workflow: la correzione dei report deve rimanere installata.
Non reinstallare Drive Tambu e non cambiare il profilo casa, SSH o Docker.

## Verifiche

Prima: i 13 test originali superati; i 4 nuovi test falliti per l'ordine
errato, per il controllo iniziale insufficiente e per la riscrittura.
Dopo: 17/17 test degli strumenti superati. Controllo sintassi Node superato.
Verificata anche l'applicazione dello ZIP al pacchetto precedente con la
correzione del workflow gia' presente, rieseguendo gli stessi 17 test.

I nuovi test eseguono il vero codice della fixture e usano file temporanei;
il confine con rclone e' simulato. NON sono un test nativo WinFsp/FUSE.
In questo ambiente il download del binario rclone non e' riuscito, quindi
non e' stato eseguito qui un nuovo montaggio reale. La revisione del diff
ha riguardato ordine di avvio, conservazione dei controlli e riavvio della
stessa fixture; non e' una revisione indipendente.

Nessuna modifica al repository online. Nessuna dichiarazione di sicurezza
in produzione o di completamento delle prove native.

Fonti primarie:
- https://rclone.org/commands/rclone_serve_sftp/#vfs-directory-cache
- https://rclone.org/commands/rclone_cat/
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
