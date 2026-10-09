# SerioFlow — consegna completa per Antigravity

## Obiettivo della consegna

Questa cartella contiene l'applicazione **SerioFlow** completa, funzionante e nello stato esatto della versione 198.

La priorità della replica è:

1. **Magazzino Live**, con l'intero ciclo delle linee;
2. **Checklist mezzi e macchine**, mantenendo separate le famiglie di mezzi;
3. **Turni**, con il prospetto aziendale importato dal 1° settembre al 31 dicembre 2026;
4. autenticazione, ruoli, dispositivi, notifiche, storico e sincronizzazione necessari alle aree.

L'area **Turni** è consultabile dalla Home da tutti gli utenti approvati e contiene persone, squadre, colori e assegnazioni importati dal prospetto aziendale. Soltanto Amministratore e Direttore possono modificare i turni o importare un file Excel. L'area **Logistica** riceve anche i riepiloghi di Reparto Live già verificati dal CT.

L'area autonoma **Reparto Live** registra i conteggi produttivi delle Sidel 365 e 366. Gli ordini vengono inseriti manualmente dal foglio di produzione, gli operatori salvano parziale e Big Bag a fine turno e il totalone a fine produzione. Le produzioni restano cumulative tra giornate diverse; alle 06:00 il CT verifica il riepilogo prima che diventi visibile alla Logistica. Scostamenti superiori all'1% richiedono una nota.

## Istruzione fondamentale per l'agente

Prima di modificare il codice:

1. leggere interamente questo file;
2. leggere `MAGAZZINO_LIVE_FLUSSO_COMPLETO.md`;
3. leggere `CHECKLIST_MEZZI_MACCHINE_COMPLETA.md`;
4. leggere `BACKEND_SERVIZI_E_DATI.md`;
5. leggere `COLLAUDO_FUNZIONALE.md`;
6. analizzare `index.html`, `app.js`, tutti i CSS, `service-worker.js`, `manifest.json` e la cartella `supabase/`;
7. avviare l'app senza riscriverla e verificare il comportamento esistente;
8. conservare flussi, colori, testi, permessi e aspetto grafico salvo richiesta esplicita.

Non sostituire l'applicazione con una nuova interpretazione semplificata. La versione consegnata è il riferimento visivo e funzionale.

## Come importarla in Antigravity

Antigravity lavora su cartelle o repository. La procedura consigliata è:

1. estrarre lo ZIP;
2. aprire Antigravity;
3. creare un nuovo Project;
4. scegliere **Add Folder**;
5. selezionare la cartella estratta del progetto SerioFlow;
6. incollare all'agente il contenuto di `PROMPT_PER_ANTIGRAVITY.md`;
7. chiedere inizialmente soltanto un'analisi, senza autorizzare una riscrittura.

La documentazione ufficiale di Antigravity conferma che un Project può essere associato a una o più cartelle o repository locali.

## Come avviare l'app in locale

È una PWA statica in HTML, CSS e JavaScript. Non è richiesto un processo di compilazione.

Da terminale, nella cartella del progetto:

```bash
python3 -m http.server 8080
```

Poi aprire:

```text
http://localhost:8080/
```

Non aprire `index.html` con `file://` per i collaudi completi: Service Worker, notifiche, fotocamera e alcune funzioni richiedono un'origine HTTP/HTTPS.

## Versione online di riferimento

- Applicazione: <https://andreafalzone91-lang.github.io/reparto-live-demo/?versione=165>
- Repository: <https://github.com/andreafalzone91-lang/reparto-live-demo>
- Backend configurato: Supabase
- PWA cache: `serioflow-v198`

## Struttura dei file

| Percorso | Contenuto |
|---|---|
| `index.html` | Struttura principale, aree, caricamento librerie e fogli di stile |
| `app.js` | Tutta la logica dell'applicazione e dell'interfaccia |
| `styles.css` | Stili originali di base |
| `auth.css` | Login, registrazione, account e amministrazione |
| `design-v76.css` | Evoluzione del design responsive |
| `serioplast-v95.css` | Design finale, PWA, schede, checklist e adattamento dispositivi |
| `supabase.js` | Client Supabase distribuito localmente |
| `codifica-catalog.js` | Catalogo iniziale dei codici flacone |
| `turni-settembre-2026.js` | Persone, squadre, colori e calendario importati dal PDF aziendale |
| `service-worker.js` | Cache offline e ricezione notifiche push |
| `manifest.json` | Installazione PWA, nome, colori e icone |
| `icon.svg` | Icona vettoriale di riserva |
| `icon-192.png` | Icona PWA 192×192 |
| `icon-512.png` | Icona PWA 512×512 |
| `apple-touch-icon.png` | Icona per iPhone/iPad |
| `brand-logo.jpg` | Marchio grafico usato nell'interfaccia |
| `brand-bottle.png` | Simbolo del flacone |
| `brand-pattern.jpg` | Fondo grafico del design |
| `assets/forklifts/` | Immagine dei muletti |
| `assets/transpallet/` | Immagini delle due tipologie di transpallet |
| `assets/machines/` | Immagini Sidel e Magic |
| `supabase/*.sql` | Migrazioni disponibili per QR, dispositivi e chat |
| `supabase/functions/` | Edge Functions per QR e notifiche push |
| `SPECIFICA_APP_DEDICATA.md` | Specifica storica precedente |
| `MAGAZZINO_LIVE_FLUSSO_COMPLETO.md` | Ciclo completo della produzione |
| `CHECKLIST_MEZZI_MACCHINE_COMPLETA.md` | Funzionamento completo delle checklist |
| `BACKEND_SERVIZI_E_DATI.md` | Backend, tabelle, storage, realtime e sicurezza |
| `COLLAUDO_FUNZIONALE.md` | Prove necessarie per dichiarare la replica identica |
| `PROMPT_PER_ANTIGRAVITY.md` | Istruzioni pronte da fornire all'agente |
| `SHA256SUMS.txt` | Impronte dei file per controllare che nulla sia cambiato |

## Tecnologia effettiva

- HTML5;
- CSS responsive;
- JavaScript browser senza framework;
- PWA installabile;
- Supabase JavaScript client;
- Supabase Auth;
- PostgreSQL e RLS;
- Supabase Realtime;
- Supabase Storage;
- Supabase Edge Functions;
- Web Push con VAPID;
- libreria `qrcodejs` per generare QR;
- libreria `html5-qrcode` per leggere QR e barcode.

## Dipendenze esterne caricate dal browser

```text
https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js
```

Il client Supabase è già incluso nel file locale `supabase.js`.

## Backend attuale

Il frontend è configurato per usare:

```text
https://ghaxikrkosdeelqhfice.supabase.co
```

La chiave presente in `app.js` è una chiave **pubblicabile** del client. Non è una `service_role`.

Per mantenere l'app identica e collegata agli stessi dati, non cambiare URL o chiave pubblicabile. Per creare un ambiente Supabase indipendente occorre migrare schema, policy, funzioni, bucket e dati seguendo `BACKEND_SERVIZI_E_DATI.md`.

## Dati segreti non inclusi

Per sicurezza non possono essere estratti dal frontend e non devono essere inseriti nel pacchetto:

- chiave Supabase `service_role`;
- chiave privata VAPID;
- credenziali personali degli utenti;
- password;
- token di sessione;
- password del database.

Le Edge Functions si aspettano questi secret nel backend:

- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `VAPID_PUBLIC_KEY`;
- `VAPID_PRIVATE_KEY`;
- `VAPID_SUBJECT`.

## Cosa deve rimanere identico

- nome SerioFlow;
- grafica, spaziature, icone e disposizione responsive;
- Safe Area su iPhone/iPad e inset di sistema Android;
- impossibilità di effettuare zoom involontario;
- schede delle undici linee;
- ordine e colori degli stati;
- flusso In corso → Pre-raclage → Raclage → Scarico → Finito;
- vignette Big Bag e vasca;
- stime Raclage 3.000 / 1.500 / 500 / 0;
- Big Bag aggiuntivo con doppia conferma;
- ruoli e controlli di permesso;
- linee affidate agli operatori;
- modalità anteprima ruoli dell'Amministratore senza cambiare il ruolo reale;
- barra inferiore di Amministratore, Direttore, CT e Vice CT in Magazzino Live;
- dashboard, avanzamento, attività, correzione e codici successivi;
- storico non modificabile;
- notifiche visive, realtime e push;
- archivio flaconi, foto e catalogo;
- resi Big Bag/Medium Bag;
- cinque chat operative, una per ciascun CT, con apertura automatica della chat del CT presente nel turno 06–14, 14–22 o 22–06 e archivio storico protetto;
- checklist distinte per dispositivi, muletti, transpallet, Sidel, Magic e problemi generali;
- accesso con e-mail/username e password, QR personale e approvazione dell'Amministratore;
- registro dei dispositivi aziendali.

## Distinzione importante sulla persistenza

La versione consegnata utilizza due tipi di persistenza:

1. **Condivisa e sincronizzata tramite Supabase**: stato linee, archivio flaconi, avanzamenti, passaggi consegne, resi, segnalazioni generali, profili, dispositivi, storico, chat e push.
2. **Locale al singolo browser/dispositivo**: consegna rapida del dispositivo e segnalazioni specifiche di muletti, transpallet, Sidel e Magic.

Questa distinzione è il comportamento reale del codice attuale. Se Antigravity deve rendere condivise anche le checklist specifiche, deve essere trattata come una nuova modifica e non come una replica identica.

## Ambito rinviato

- Turni: calendario settembre–dicembre 2026 importato; sviluppo ulteriore da concordare;
- Logistica: non sviluppare ulteriormente;
- eventuale trasformazione nativa iOS/Android: decisione successiva;
- migrazione delle checklist locali verso database: decisione successiva.

## Regola di consegna

Prima di dichiarare concluso il lavoro, l'agente deve eseguire tutte le prove descritte in `COLLAUDO_FUNZIONALE.md`. Se una prova fallisce, la replica non può essere definita identica.
