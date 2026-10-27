# Magazzino Live — flusso operativo completo

Documento operativo e tecnico della versione ufficiale 175 di **SerioFlow**.

Questo file descrive l'intero ciclo di una linea: dalla preparazione e messa **In corso** di un flacone fino alla conferma di fine produzione, scarico, pulizia e avvio del codice successivo.

## 1. Linee gestite

Il sistema gestisce le linee:

`KD`, `KP`, `KF`, `KR`, `KT`, `KA`, `KW`, `KK`, `KC`, `KO`, `KB`.

Ogni linea conserva in tempo reale:

- codice e nome del flacone;
- eventuale foto del flacone;
- quantità programmata e quantità assorbita;
- unità di misura: pezzi oppure O.T.;
- stato operativo corrente;
- operatore a cui è affidata;
- due Big Bag e livello della vasca;
- richiesta e caricamento di Big Bag aggiuntivi;
- quantità rimasta al Raclage;
- verifica finale della vasca e della linea;
- codici successivi già programmati;
- storico completo delle azioni.

## 2. Ruoli e permessi

| Funzione | Amministratore | CT | Vice CT | Processista | Operatore / Carrellista |
|---|---:|---:|---:|---:|---:|
| Creare o modificare flaconi | Sì | Sì | Sì | Sì | No |
| Avviare o cambiare codice | Sì | Sì | Sì | Sì | No |
| Modificare quantità da assorbire | Sì | Sì | Sì | Sì | No |
| Chiamare Pre-raclage, Raclage e Scarico | Sì | Sì | Sì | Sì | No |
| Richiedere un Big Bag aggiuntivo | Sì | Sì | Sì | Sì | No |
| Affidare o togliere linee | Sì | Sì | Sì | No | No |
| Prendere in carico una richiesta | Sì | Sì | Sì | Sì | Sì, se la linea è assegnata |
| Comunicare Big Bag e vasca | Sì | Sì | Sì | Sì | Sì, se la linea è assegnata |
| Comunicare la rimanenza Raclage | Sì | Sì | Sì | Sì | Sì, se la linea è assegnata |
| Confermare vasca e linea pulite | Sì | Sì | Sì | Sì | Sì, se la linea è assegnata |
| Correggere manualmente lo stato | Sì | Sì | Sì | Sì | No |
| Chiudere definitivamente il ciclo | Sì | Sì | Sì | Sì | No |

L'operatore vede e utilizza soltanto le linee che gli sono state affidate. Quando una linea viene aggiunta o rimossa, riceve una notifica di aggiornamento.

## 3. Stati e colori della linea

| Stato visibile | Colore | Significato |
|---|---|---|
| In corso | Verde | Produzione attiva |
| Pre-raclage | Arancione | Richiesta disponibilità flaconi |
| Raclage | Giallo | Verifica finale dei flaconi rimasti |
| Scarico linea | Blu | Scarico e pulizia in corso |
| Finito | Rosso | Linea verificata e ciclo terminato |

Stati tecnici interni usati per non perdere il punto esatto del flusso:

- `idle`: nessun codice in corso;
- `running`: produzione in corso;
- `pre`: richiesta Pre-raclage inviata;
- `progress`: richiesta presa in carico dall'operatore;
- `waiting-raclage`: risposta Pre-raclage inviata al responsabile;
- `raclage`: richiesta Raclage inviata;
- `waiting-ct`: risposta Raclage inviata al responsabile;
- `raclage-ok`: Raclage approvato;
- `unload`: scarico e verifica pulizia richiesti;
- `finished`: vasca e linea confermate pulite.

## 4. Sequenza completa

```text
Nessun codice
    ↓
Creazione/selezione flacone e quantità
    ↓
IN CORSO
    ↓
PRE-RACLAGE richiesto dal responsabile
    ↓
Operatore prende in carico
    ↓
Operatore comunica BB1, BB2 e vasca
    ↓
Responsabile verifica la risposta
    ├── richiede uno o più Big Bag aggiuntivi
    │       ↓
    │   operatore prende in carico e conferma il caricamento
    │       ↓
    └── chiama RACLAGE
            ↓
        Operatore prende in carico
            ↓
        Operatore comunica vasca e pezzi rimasti
            ↓
        Responsabile verifica la risposta
            ├── risposta non corretta → nuova verifica Raclage
            ├── ancora un Big Bag → presa in carico e caricamento
            └── avvia SCARICO
                    ↓
                Operatore prende in carico
                    ↓
                conferma vasca e linea completamente pulite
                    ↓
                  FINITO
                    ↓
        codice successivo oppure chiusura definitiva del ciclo
```

## 5. Avvio della produzione — In corso

### Operazione del responsabile

1. Seleziona la linea.
2. Apre **Crea o carica un codice**.
3. Cerca il flacone per codice o nome nell'archivio.
4. Seleziona il flacone e verifica il riepilogo con nome, codice ed eventuale foto.
5. Inserisce la quantità totale da assorbire.
6. Sceglie l'unità: **pezzi** oppure **O.T.**.
7. Conferma l'avvio.

### Risultato

- la linea diventa verde e mostra **In corso**;
- compaiono nome, codice e foto del flacone;
- compare l'avanzamento `assorbito / totale`;
- la quantità giornaliera parte da zero;
- l'azione viene registrata nello storico.

### Comando tecnico

`start-code`

Dati obbligatori: `bottle`, `target`, `unit`.

Controlli:

- il flacone deve esistere nell'archivio;
- la quantità deve essere maggiore di zero;
- soltanto i ruoli responsabili possono eseguire il comando.

## 6. Avanzamento della produzione

Il responsabile aggiorna il **totale raggiunto**, non la quantità del singolo turno.

Esempio:

- obiettivo: 50.000 pezzi;
- primo aggiornamento: 25.000 / 50.000;
- il turno seguente modifica il totale in 35.000 / 50.000;
- non vengono sommati automaticamente 25.000 e 35.000.

La giornata produttiva va dalle **06:00 alle 06:00** del giorno successivo. Al primo aggiornamento dopo le 06:00:

- il giorno precedente viene archiviato per la Logistica;
- l'assorbito giornaliero riparte da zero;
- il residuo del giorno precedente diventa la nuova quantità da assorbire.

### Comando tecnico

`update-production`

Controlli:

- il valore non può essere negativo;
- non può superare la quantità programmata;
- la Home mostra lo stesso avanzamento e l'ora dell'ultimo aggiornamento.
- quando rimangono da 1 a 20.000 pezzi, la scheda della linea mostra sotto l'ora un avviso rosso con la quantità ancora da assorbire; l'avviso non viene mostrato per produzioni espresse in O.T. o quando il residuo è zero.

### Aggiornamento tramite foto del deck

Amministratore, CT, Vice CT e Processista possono premere **Foto deck** dentro Avanzamento Produzione:

1. scattano la foto completa con il dispositivo oppure la scelgono dalla galleria;
2. il lettore OCR analizza ogni riga in orizzontale nell'ordine linea, codice flacone, quantità già assorbita e totale da assorbire;
   se la barra fra le due quantità non viene riconosciuta, usa in sicurezza le ultime due quantità successive al codice flacone;
3. il sistema prepara l'elenco delle righe riconosciute senza aggiornare la produzione;
4. il nome del flacone viene recuperato automaticamente dall'archivio in base al codice;
5. le letture incerte o incomplete vengono evidenziate e devono essere corrette manualmente;
6. la persona confronta ogni riga con la fotografia e spunta **Ho verificato questa riga**;
7. controlla il riepilogo finale, comprese le linee che verranno svuotate, e fornisce una seconda conferma;
8. soltanto dopo questa doppia verifica vengono salvati i dati condivisi.

Se una fascia verde non viene riconosciuta completamente, non blocca le righe lette: l'utente può confermare quelle corrette e le linee mancanti conservano i dati già presenti.

La foto non aggiorna direttamente i dati senza conferma. Se il codice non è presente nell'archivio, manca una quantità, la quantità assorbita supera il totale oppure una riga selezionata non è stata verificata, l'invio viene bloccato. La fotografia e il riepilogo applicato vengono conservati nell'**Archivio foto**, insieme ad autore, data, ora, dispositivo e conferma umana. Le linee non spuntate vengono svuotate e tornano bianche perché non risultano presenti nel deck; storico, operatore affidatario e coda dei codici successivi vengono conservati.

## 7. Pre-raclage

### Richiesta del responsabile

1. Tocca la linea verde.
2. Inserisce o conferma la quantità di flaconi mancanti, proposta inizialmente a **10.000**.
3. Premere **Conferma pre-raclage**.

### Risultato

- la linea diventa arancione;
- viene avviato il timer della richiesta;
- sull'operatore compare il punto esclamativo lampeggiante;
- l'operatore riceve la richiesta sulla linea assegnata.

### Comando tecnico

`save-pre`

Dati: codice corrente e `prePieces`.

## 8. Risposta dell'operatore al Pre-raclage

1. L'operatore preme **Prendo in carico**.
2. Il sistema registra nome e ora della presa in carico.
3. Si apre la rappresentazione della stazione vibrante.
4. Big Bag 1 e Big Bag 2 partono da **Pieno**: ogni Big Bag si tocca per alternare **Pieno/Vuoto**.
5. La vasca parte da **Piena** e si tocca per scegliere:
   - Piena;
   - Metà;
   - Quasi vuota.
6. L'operatore preme **Conferma e invia al CT**.

### Risultato

- la richiesta scompare dall'operatore;
- CT e Vice CT vedono il punto esclamativo lampeggiante e la dicitura **Risposta operatore da verificare**;
- la risposta è mostrata graficamente in una piccola vignetta con BB1, BB2 e vasca;
- la linea rimane arancione in Pre-raclage.

### Comandi tecnici

- `take-pre`: presa in carico;
- `submit-pre`: invio di `bag1`, `bag2` e `vatLevel`.

Controlli:

- può rispondere solo chi ha preso in carico la richiesta, oppure un responsabile;
- il livello della vasca è obbligatorio;
- se esiste un Big Bag aggiuntivo ancora non caricato, la risposta non può essere conclusa.

## 9. Big Bag aggiuntivo

Il pulsante **Ancora un big bag** è disponibile dopo la risposta dell'operatore:

- nella fase Pre-raclage;
- nella fase Raclage.

### Flusso

1. Il responsabile preme **Ancora un big bag**.
2. Il sistema chiede: **Sei sicuro di richiedere un altro big bag?**
3. Il responsabile può scegliere **Sì, richiedi** oppure **No, annulla**.
4. Se conferma, l'operatore riceve la richiesta mirata.
5. L'operatore preme **Prendo in carico big bag**.
6. Dopo il caricamento preme **Conferma big bag caricato**.
7. Il responsabile vede che il Big Bag è stato caricato e può proseguire oppure richiederne un altro.

Ogni nuova richiesta viene numerata. Non è possibile creare una seconda richiesta finché la precedente è ancora in attesa.

### Comandi tecnici

- `request-extra`: crea la richiesta;
- `take-extra`: registra chi la prende in carico;
- `extra-loaded`: conferma l'avvenuto caricamento.

Controlli:

- solo chi ha preso in carico il Big Bag può confermare il caricamento; un responsabile può intervenire;
- Raclage e Scarico non possono proseguire se il Big Bag richiesto non risulta caricato.

## 10. Chiamata Raclage

Quando il cliente comunica che si può procedere, il responsabile apre la linea e preme **Chiama Raclage**.

### Risultato

- la linea diventa gialla;
- parte un nuovo timer;
- l'operatore vede il punto esclamativo lampeggiante;
- la precedente assegnazione della singola attività viene azzerata, così il Raclage deve essere preso in carico esplicitamente.

### Comando tecnico

`call-raclage`

## 11. Risposta dell'operatore al Raclage

1. L'operatore preme **Prendo in carico**.
2. Si apre il disegno della vasca, inizialmente **Piena**.
3. Toccando la vasca sceglie uno dei livelli:
   - Piena → proposta automatica **3.000 pezzi**;
   - Metà → proposta automatica **1.500 pezzi**;
   - Quasi vuota → proposta automatica **500 pezzi**;
   - Vuota → proposta automatica **0 pezzi**.
4. Se vuole essere più preciso, può scrivere una quantità manuale. Il dato manuale sostituisce la proposta automatica.
5. Premere **Conferma e invia al CT**.

### Risultato

- CT e Vice CT vedono la risposta grafica con livello vasca e pezzi avanzati;
- compare il punto esclamativo lampeggiante per la risposta da verificare;
- la linea resta gialla.

### Comandi tecnici

- `take-raclage`: presa in carico;
- `submit-raclage`: invio di `raclageVatLevel` e `remainingPieces`.

Controlli:

- può rispondere solo chi ha preso in carico il Raclage, oppure un responsabile;
- livello vasca e quantità non possono essere negativi;
- l'operatore può riaprire **Modifica risposta raclage** se si accorge di un errore prima della conclusione.

## 12. Verifica del responsabile dopo il Raclage

Il responsabile può:

- premere **Avvia scarico** se la risposta è corretta e il cliente ha terminato;
- premere **Ancora un big bag** se occorre altro materiale;
- premere **Risposta non corretta** per riportare la linea alla verifica Raclage.

Il comando interno `ct-decision` conserva l'esito **OK/Non OK** quando viene usato dalla scheda completa. L'avvio dello Scarico equivale alla conferma operativa che si può procedere.

## 13. Scarico linea

### Richiesta del responsabile

Il responsabile preme **Avvia scarico** oppure **Raclage finito · Avvia scarico**.

### Risultato

- la linea diventa blu;
- viene inviato l'avviso di Scarico;
- parte il timer della verifica;
- l'operatore vede **Prendo in carico scarico**.

### Comando tecnico

`start-unload`

Il comando è bloccato se esiste un Big Bag aggiuntivo non ancora caricato.

## 14. Verifica vasca vuota e pulizia

1. L'operatore preme **Prendo in carico scarico**.
2. Esegue fisicamente il controllo della vasca e della linea.
3. Apre **Verifica vasca vuota**.
4. Seleziona **Vasca e linea completamente pulite**.
5. Preme **Conferma vasca e linea pulite**.

### Risultato

- la linea diventa rossa e mostra **Finito**;
- CT e Vice CT vedono **Verifica vasca vuota completata**;
- nome, ora, linea e dispositivo dell'operatore vengono registrati;
- il ciclo è pronto per il codice successivo o per la chiusura definitiva.

### Comandi tecnici

- `take-unload`: presa in carico dello Scarico;
- `confirm-clean`: conferma finale.

Controlli:

- la pulizia non può essere confermata senza una presa in carico;
- può confermarla solo chi ha preso in carico lo Scarico, oppure un responsabile;
- la casella di conferma della pulizia è obbligatoria.

## 15. Codice successivo

Per ogni linea è possibile preparare fino a dieci codici successivi. Il limite non viene mostrato nella schermata, ma viene applicato dal sistema.

Ogni voce della coda contiene:

- codice flacone;
- nome flacone;
- quantità da assorbire;
- unità pezzi/O.T.

Quando un codice preparato viene avviato:

- viene rimosso automaticamente dalla lista;
- la linea torna verde e **In corso**;
- avanzamento, risposta Raclage e pulizia vengono inizializzati per il nuovo ciclo.

### Comandi tecnici

- `queue-add`: aggiunge un codice programmato;
- `queue-remove`: rimuove una voce;
- `queue-start-next`: avvia il primo codice preparato;
- `next-load`: seleziona e avvia un codice non già preparato.

## 16. Chiusura definitiva del ciclo

Il pulsante **Chiudi ciclo** riporta la linea a riposo, ma conserva:

- storico delle attività;
- affidamento della linea;
- lista dei codici successivi.

### Comando tecnico

`reset`

È richiesta una conferma esplicita: **Chiudere definitivamente il ciclo della linea?**

## 17. Correzioni e annullamento errori

I responsabili possono aprire **Correggi Linea** e impostare manualmente:

- In corso;
- Pre-raclage;
- Raclage;
- Scarico;
- Finito.

### Comando tecnico

`set-stage`

Il pulsante **Annulla ultima azione** ripristina lo stato precedente della linea.

### Comando tecnico

`undo`

Le correzioni non cancellano lo storico originale: viene creata una nuova registrazione separata, identificata come correzione.

## 18. Notifiche, priorità e tempi

Il punto esclamativo lampeggiante indica sempre un'azione in attesa.

### Passaggio della notifica

- richiesta inviata dal responsabile → attenzione sull'operatore;
- presa in carico → registrazione del nome dell'operatore;
- risposta inviata dall'operatore → attenzione su CT e Vice CT;
- risposta gestita → l'avviso scompare;
- la stessa logica si applica a Pre-raclage, Big Bag aggiuntivo, Raclage, Scarico e verifica vasca vuota.

### Timer

- da 0 a 5 minuti: stato normale;
- da 5 a 10 minuti: richiesta resa più evidente;
- oltre 10 minuti: stato urgente, indicato come inoltrato a CT e Vice CT.

Le modifiche vengono sincronizzate tramite Supabase Realtime. Le notifiche push vengono inviate ai dispositivi registrati e abilitati dall'Amministratore.

## 19. Storico non modificabile

Ogni operazione registra:

- identificativo univoco;
- data e ora;
- linea;
- testo dell'operazione;
- persona che l'ha eseguita;
- ruolo;
- tipo/stato dell'evento;
- dispositivo e identificativo dispositivo;
- eventuale destinatario specifico della notifica.

Esempi di eventi:

- `Produzione iniziata`;
- `Pre-raclage chiamato`;
- `Pre-raclage preso in carico`;
- `Disponibilità: Big bag 1 ... Big bag 2 ... Vasca ...`;
- `Richiesto big bag aggiuntivo`;
- `Big bag aggiuntivo preso in carico`;
- `Big bag aggiuntivo caricato`;
- `Raclage chiamato`;
- `Verifica raclage presa in carico`;
- `Vasca ... pezzi avanzati`;
- `Scarico linea richiesto`;
- `Scarico linea preso in carico`;
- `Linea completamente pulita`;
- `Inizio carico programmato`;
- `Stato corretto manualmente`;
- `Ultima azione annullata`;
- `Linea riportata a riposo`.

Lo storico può essere filtrato per linea, codice, operatore, stato e data ed esportato in CSV.

## 20. Elenco dei comandi applicativi

| Comando | Azione |
|---|---|
| `assign-line` | Affida o rimuove una linea |
| `start-code` | Avvia un nuovo codice |
| `change-code` | Cambia il codice corrente |
| `set-production-plan` | Modifica la quantità totale da assorbire |
| `update-production` | Aggiorna il totale giornaliero assorbito |
| `handover` | Registra il passaggio consegne |
| `queue-add` | Aggiunge un codice successivo |
| `queue-remove` | Elimina un codice dalla coda |
| `queue-start-next` | Avvia il primo codice della coda |
| `save-pre` | Invia il Pre-raclage |
| `take-pre` | Prende in carico il Pre-raclage |
| `submit-pre` | Comunica Big Bag e vasca |
| `request-extra` | Richiede un altro Big Bag |
| `take-extra` | Prende in carico il Big Bag aggiuntivo |
| `extra-loaded` | Conferma il Big Bag caricato |
| `call-raclage` | Invia il Raclage |
| `take-raclage` | Prende in carico la verifica Raclage |
| `submit-raclage` | Comunica livello vasca e pezzi avanzati |
| `ct-decision` | Registra OK o Non OK del responsabile |
| `start-unload` | Avvia lo Scarico |
| `take-unload` | Prende in carico lo Scarico |
| `confirm-clean` | Conferma vasca e linea pulite |
| `next-load` | Avvia un nuovo codice dopo il termine |
| `set-stage` | Corregge manualmente la modalità della linea |
| `undo` | Annulla l'ultima azione sulla linea |
| `reset` | Chiude il ciclo e riporta la linea a riposo |

## 21. Regola fondamentale

Il sistema non sostituisce il controllo fisico dell'operatore. Serve a rendere ogni richiesta, presa in carico, risposta e decisione **visibile, tracciata e condivisa in tempo reale**, evitando telefonate ripetute, informazioni perse e passaggi di consegne incompleti.
