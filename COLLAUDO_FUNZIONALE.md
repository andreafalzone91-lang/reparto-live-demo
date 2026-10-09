# SerioFlow — collaudo per replica identica

La replica può essere dichiarata conforme soltanto se supera queste prove su computer, iPhone/iPad e Android.

## Foto deck e aggiornamento produzione

- [ ] Amministratore, CT, Vice CT e Processista vedono **Foto deck** in Avanzamento Produzione.
- [ ] Operatore, Carrellista, Logistica e Direttore non vedono il comando.
- [ ] Senza foto, senza codice salvato o con quantità assorbita superiore al totale la conferma viene bloccata.
- [ ] Se si selezionano due linee, quelle due vengono aggiornate e tutte le altre tornano bianche e senza produzione.
- [ ] Digitando un codice presente nell'archivio compare automaticamente il nome flacone.
- [ ] Prima dell'invio compare il riepilogo obbligatorio.
- [ ] Dopo la foto parte la lettura automatica orizzontale di linea, codice, assorbito e totale.
- [ ] Ogni riga deve essere confermata singolarmente dopo il confronto con la fotografia.
- [ ] Il salvataggio finale resta disabilitato finché non viene confermata anche la lista delle linee da svuotare.
- [ ] Una lettura incompleta o un codice non presente nell'archivio non può essere salvato.
- [ ] **Archivio foto** conserva immagine, dati applicati, autore, ora e dispositivo.
- [ ] L'aggiornamento arriva su un secondo dispositivo e viene registrato nello storico delle linee.

## A. Apertura e PWA

- [ ] L'app si apre via HTTPS senza errori JavaScript.
- [ ] Titolo e icona sono SerioFlow.
- [ ] È installabile sulla schermata Home.
- [ ] L'header rispetta notch, Dynamic Island e barre di sistema.
- [ ] La barra inferiore non copre i contenuti.
- [ ] Il layout non richiede zoom ed evita lo zoom involontario.
- [ ] Chiudendo e riaprendo la PWA la sessione rimane valida.
- [ ] Una nuova versione sostituisce la cache precedente.

## B. Login e amministrazione

- [ ] Registrazione con nome, cognome, username, e-mail e due password.
- [ ] Password inferiori a 8 caratteri rifiutate.
- [ ] Password diverse rifiutate.
- [ ] Nuovo profilo in attesa dell'Amministratore.
- [ ] Utente non approvato non vede i dati del reparto.
- [ ] Solo Amministratore approva, blocca, riattiva e assegna il ruolo.
- [ ] Login con e-mail e password.
- [ ] Login con username e password.
- [ ] Recupero e cambio password.
- [ ] QR personale generabile, stampabile, revocabile e rigenerabile.
- [ ] Il QR non sostituisce la password.
- [ ] Dispositivo non approvato bloccato per utenti normali.
- [ ] Amministratore vede registro dispositivi e accessi.
- [ ] Modalità “Visualizza come” non modifica il ruolo reale.

## C. Visibilità dei ruoli

- [ ] Amministratore, Direttore, CT, Vice CT e Processista vedono tutte le linee.
- [ ] Operatore/Carrellista vedono solo le linee assegnate.
- [ ] Operatore senza linea vede “In attesa di affidamento”.
- [ ] Solo Amministratore, Direttore, CT e Vice CT affidano linee.
- [ ] Assegnazione aggiunta/rimossa genera notifica al destinatario.
- [ ] Operatore non può creare flaconi o cambiare stato.
- [ ] Responsabili possono eseguire anche conferme operative.
- [ ] Barra inferiore visibile ad Amministratore, Direttore, CT e Vice CT in Magazzino Live.
- [ ] Barra inferiore nascosta agli altri ruoli.

## D. Archivio flaconi

- [ ] Ricerca solo dopo digitazione di codice o nome.
- [ ] Nessun elenco infinito o cronologia di ricerche.
- [ ] Risultati mostrano codice e nome, non la foto.
- [ ] Selezione mostra riepilogo con nome, codice e foto.
- [ ] Creazione richiede nome, codice e almeno una linea.
- [ ] Codice esistente precompila i dati durante la modifica.
- [ ] Foto aggiungibile anche dalla scheda linea se mancante.
- [ ] Foto iPhone/HEIC convertita in JPEG e visibile.
- [ ] Modifica aggiorna tutte le linee che usano quel codice.
- [ ] Eliminazione disponibile soltanto ai responsabili.
- [ ] Eliminare un codice in uso non interrompe il ciclo corrente.

## E. Avvio e avanzamento

- [ ] Avvio richiede codice d'archivio e quantità positiva.
- [ ] È possibile scegliere pezzi oppure O.T.
- [ ] Riepilogo finale richiede conferma prima dell'avvio.
- [ ] La linea diventa verde In corso.
- [ ] Mostra linea, nome, codice, foto, avanzamento, stato e affidatario.
- [ ] Aggiornamento avanzamento sostituisce il totale precedente, non lo somma.
- [ ] Impossibile superare l'obiettivo.
- [ ] Home e pagina Avanzamento mostrano lo stesso valore.
- [ ] È visibile l'ora dell'ultimo aggiornamento.
- [ ] La giornata produttiva cambia alle 06:00.

## F. Pre-raclage

- [ ] Da In corso il responsabile vede soltanto l'azione Pre-raclage e modifica quantità.
- [ ] Quantità proposta iniziale 10.000, modificabile.
- [ ] Conferma porta la linea ad arancione.
- [ ] Operatore riceve punto esclamativo e pulsante Prendo in carico.
- [ ] Presa in carico registra persona e ora.
- [ ] BB1 e BB2 partono pieni e alternano Pieno/Vuoto.
- [ ] Vasca parte piena e passa Piena/Metà/Quasi vuota.
- [ ] Risposta non parte senza livello vasca.
- [ ] Risposta operatore scompare dall'operatore e compare a CT/Vice CT.
- [ ] CT vede la vignetta grafica ridotta, non una risposta lunga.
- [ ] La linea rimane arancione dopo la risposta.

## G. Big Bag aggiuntivo

- [ ] Disponibile dopo risposta Pre-raclage e dopo risposta Raclage.
- [ ] Compare la conferma “Sei sicuro?”.
- [ ] “No” non crea alcuna richiesta.
- [ ] “Sì” crea una richiesta numerata e mirata alla linea.
- [ ] Seconda richiesta bloccata finché la prima non è caricata.
- [ ] Operatore può prenderla in carico.
- [ ] Solo assegnatario o responsabile può confermare il caricamento.
- [ ] Raclage/Scarico bloccati fino alla conferma del caricamento.
- [ ] Dopo il caricamento è possibile richiederne un altro.

## H. Raclage

- [ ] Chiama Raclage rende la linea gialla.
- [ ] Operatore riceve avviso e prende in carico.
- [ ] Vasca parte Piena.
- [ ] Piena propone 3.000 pezzi.
- [ ] Metà propone 1.500 pezzi.
- [ ] Quasi vuota propone 500 pezzi.
- [ ] Vuota propone 0 pezzi.
- [ ] Quantità precisa facoltativa sostituisce la proposta.
- [ ] Risposta arriva a CT/Vice CT con vignetta, livello e quantità.
- [ ] Operatore può correggere la propria risposta prima della chiusura.
- [ ] Responsabile può indicare risposta non corretta.
- [ ] Responsabile può richiedere un altro Big Bag.
- [ ] Responsabile può avviare lo Scarico.

## I. Scarico e fine

- [ ] Avvia Scarico rende la linea blu.
- [ ] Operatore vede Prendo in carico scarico.
- [ ] Doppia presa in carico impedita.
- [ ] Verifica mostra la casella vasca e linea completamente pulite.
- [ ] Conferma senza presa in carico rifiutata.
- [ ] Conferma senza casella rifiutata.
- [ ] Solo assegnatario o responsabile conclude.
- [ ] Linea diventa rossa Finito.
- [ ] CT/Vice CT vedono verifica completata.
- [ ] Il ciclo può proseguire con codice successivo.
- [ ] Chiudi ciclo richiede conferma e riporta a riposo.

## J. Codici successivi

- [ ] Ricerca per codice o nome con anteprima.
- [ ] Quantità obbligatoria.
- [ ] Fino a dieci codici per linea.
- [ ] Rimozione funzionante.
- [ ] Avvio usa il primo preparato.
- [ ] Codice avviato eliminato automaticamente dalla coda.
- [ ] Nuovo codice riparte verde con dati corretti.

## K. Notifiche e priorità

- [ ] Punto esclamativo lampeggia per Pre-raclage.
- [ ] Stessa logica per Raclage, Scarico e vasca vuota.
- [ ] “Risposta operatore richiesta” lampeggia finché gestita.
- [ ] Notifica cambia destinatario dopo la risposta.
- [ ] Timer compare appena nasce la richiesta.
- [ ] 0–5 minuti normale.
- [ ] 5–10 minuti più evidente.
- [ ] Oltre 10 minuti urgente/inoltrata a CT e Vice CT.
- [ ] Push ricevuta con PWA chiusa su dispositivo abilitato.
- [ ] Utente sospeso dall'Amministratore non riceve push.

## L. Storico e correzioni

- [ ] Ogni azione registra persona, ruolo, ora, linea e dispositivo.
- [ ] Lo storico remoto e locale mostrano gli eventi nello stesso ordine.
- [ ] Correzione manuale crea un nuovo evento.
- [ ] L'azione originale non viene cancellata.
- [ ] Annulla ultima azione ripristina lo stato precedente.
- [ ] Filtri per linea, codice, operatore, stato e data.
- [ ] Esportazione CSV leggibile.

## M. Resi e chat

- [ ] La chat corrente mostra il turno attivo in base all'orario italiano: 1 alle 06:00, 2 alle 14:00 e 3 alle 22:00.
- [ ] Il pulsante Chat di squadra apre direttamente la chat del CT presente nel turno, senza chiedere quale squadra scegliere.
- [ ] Le chat operative disponibili sono cinque, una per ogni persona con ruolo CT nel calendario; le quattro squadre guidate dai Vice CT confluiscono nella chat del CT attivo.
- [ ] Al cambio turno la nuova conversazione è vuota, senza cancellare i messaggi del turno concluso.
- [ ] CT e Vice CT possono aprire l'Archivio chat soltanto per la propria squadra.
- [ ] Amministratore e Direttore possono consultare gli archivi delle squadre disponibili.
- [ ] Le notifiche e il conteggio dei non letti considerano soltanto il turno attivo.

- [ ] Nuovo reso richiede linea, Big/Medium Bag, pezzi e barcode.
- [ ] Scanner usa la fotocamera posteriore.
- [ ] Inserimento manuale disponibile se la fotocamera fallisce.
- [ ] Reso arriva ai responsabili.
- [ ] Conferma associazione registra persona e ora.
- [ ] Tutto il personale del turno entra nella stessa chat del CT attivo.
- [ ] Amministratore e Direttore aprono direttamente la chat attiva e possono consultare gli archivi autorizzati.
- [ ] Messaggio nuovo genera contatore/campanella.

## N. Checklist mezzi e macchine

- [ ] Area Checklist apribile dalla Home.
- [ ] Consegna e riconsegna dispositivo funzionanti.
- [ ] Danno genera automaticamente una segnalazione dispositivo.
- [ ] Cinque muletti presenti con immagine.
- [ ] Cinque transpallet grandi presenti con immagine.
- [ ] Cinque transpallet piccoli presenti con immagine distinta.
- [ ] Sidel 0364, 0365, 0366 e 0367 presenti.
- [ ] Magic 0025 BM10 e 0028 BM11 presenti.
- [ ] Ogni famiglia apre una pagina separata.
- [ ] Tipi di difetto e gravità corrispondono alla specifica.
- [ ] Numero problemi aperti aggiornato sulla vignetta.
- [ ] Chiusura del problema registra autore e ora.
- [ ] Segnalazione generale richiede foto, luogo e descrizione.
- [ ] Stati generale: Nuova → Presa in carico → Risolta → Chiusa.
- [ ] Segnalazione generale sincronizzata su un secondo dispositivo.
- [ ] Segnalazioni specifiche restano locali, come nella versione originale.

## O. Test simultaneo minimo

Usare almeno due dispositivi:

1. login CT su dispositivo A;
2. login Operatore su dispositivo B;
3. affidare una linea;
4. avviare codice;
5. completare Pre-raclage con risposta;
6. richiedere e caricare Big Bag aggiuntivo;
7. completare Raclage;
8. avviare Scarico;
9. confermare pulizia;
10. controllare notifiche, tempi e storico su entrambi.

Se anche un solo passaggio non si sincronizza o viola il ruolo, la replica non è conforme.

## P. Turni importati — versione 144

- [ ] La Home mostra Turni come area disponibile e tutti gli utenti approvati possono aprirla in consultazione.
- [ ] La Home mostra Reparto Live come area autonoma, separata da Magazzino Live.
- [ ] Su Sidel 365 e 366 è possibile avviare manualmente un ordine con codice, formato, pezzi e Big Bag richiesti.
- [ ] A fine turno l'operatore registra il parziale e i Big Bag effettivamente associati; il totale continua oltre le 06:00.
- [ ] A fine produzione il totalone viene confrontato con i parziali e oltre l'1% viene richiesta una nota.
- [ ] Il CT può verificare la giornata conclusa e soltanto dopo il riepilogo appare alla Logistica.
- [ ] Sono presenti 41 persone e 10 squadre con i colori del prospetto aziendale.
- [ ] Il calendario parte dal 1° settembre 2026 e arriva al 31 dicembre 2026.
- [ ] Le viste Oggi, Settimana e Cerca persona funzionano.
- [ ] La ricerca trova anche il nome della squadra.
- [ ] Amministratore e Direttore possono correggere un turno senza perdere le altre assegnazioni.
- [ ] Amministratore e Direttore vedono il pulsante Importa Excel; tutti gli altri ruoli non lo vedono.
- [ ] Nome, mansione, squadra e colore sono modificabili dalla scheda persona.
- [ ] Nel calendario mensile il comando “Allarga nomi” mostra nome e cognome completi e “Riduci colonna nomi” ripristina la vista compatta; la preferenza resta memorizzata sul dispositivo.
- [ ] In ogni colonna del giorno le persone sono ordinate per ruolo: CT, Vice CT, Technologist, MO/WH, MO, Magazziniere, Baia, Manutenzione; i ruoli assenti non lasciano spazi vuoti.
- [ ] Le modifiche salvate restano sincronizzate nel documento `shared_state.payload.shifts`.
