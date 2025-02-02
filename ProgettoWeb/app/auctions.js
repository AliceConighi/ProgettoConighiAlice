const express = require("express");
const db = require("./db.js");
const app = express.Router();
const moment = require("moment");                   // Libreria per la gestione delle date
const verifyToken = require("./verifyToken.js");

// Creazione di un'asta
app.post("/", verifyToken, async (req, res) => {
    const mongo = await db.connect2db();
    // Estraggo i dati dal corpo della richiesta
    let titolo = req.body.titolo;                   // Titolo dell'asta
    let descrizione = req.body.descrizione;         // Descrizione dell'asta
    let scadenza = moment(req.body.scadenza);       // Data di scadenza dell'asta
    let dataCorr = moment(new Date());              // Data corrente, per fare confronti
    let offerta = parseInt(req.body.offerta);       // Offerta iniziale
    let user = req.user.username;                   // Utente
    let vincitore = "nessuna offerta";              // Imposto il vincitore iniziale come "nessuna offerta"

    // Controllo se l'utente è autenticato
    if (user == null) {
        return res.status(403).send("Errore: utente non autenticato!");
    }
    // Controllo se l'offerta di partenza è valida
    if (offerta <= 0) {
        return res.status(403).send("Errore: l'offerta è negativa!");
    }

    // Formatto le date per fare confronti più semplici
    scadenzaFormat = scadenza.format("DD/MM/YYYY"); 
    dataCorrFormat = dataCorr.format("DD/MM/YYYY"); 

    // Divido le date in giorno, mese e anno per confrontarle manualmente
    let [giornoData, meseData, annoData] = scadenzaFormat.split("/").map(Number); 
    let [giornoCorr, meseCorr, annoCorr] = dataCorrFormat.split("/").map(Number);

    // Controllo se la data di scadenza è nel passato
    if (annoData < annoCorr || (annoData === annoCorr && meseData < meseCorr)
        || (annoData === annoCorr && meseData === meseCorr && giornoData < giornoCorr)) {
        return res.status(403).send("Errore: data inserita non valida");
    }

    // Recupero l'ultimo ID delle aste dal database per generare un ID univoco
    // Cerco l'ultima asta inserita, ordinata per ID in modo decrescente
    // Se esiste un ID precedente, lo uso, altrimenti parto da -1
    const ultimoId = await mongo.collection('auctions').findOne({}, { sort: { id: -1 } }); 
    let id = ultimoId?.id !== undefined ? ultimoId.id : -1; 
    id++;   // Incremento l'ID per creare un nuovo ID univoco

    // Creo l'oggetto asta con tutti i dati necessari
    let auction = { id, titolo, descrizione, scadenza: scadenzaFormat, creatore: user, offertaPartenza: offerta, offertaCorrente: offerta, vincitore };
    // Inserisco l'asta nel database
    await mongo.collection('auctions').insertOne(auction);
    res.json(auction);
});


// Visualizzazione dettagli di un'asta tramite ID
app.get("/:id", async (req, res) => {
    const mongo = await db.connect2db();
    let query = { id: parseInt(req.params.id) };                        // Query per cercare l'asta tramite ID

    const auction = await mongo.collection('auctions').findOne(query);  // Recupero dell'asta

    if (auction == null) {
        return res.status(403).send("Errore: asta inesistente");
    }
    
    res.json(auction);
});


// Elenco delle aste filtrando tramite un parametro di ricerca q
app.get("", async (req, res) => {
    const mongo = await db.connect2db();

    // Parametro di ricerca
    let q = req.query.q; 
    // Se "q" è definito, creo una query che cerca documenti in cui il campo "titolo" contiene il valore di "q" (ignorando maiuscole/minuscole grazie a "$options: 'i'").
    // Altrimenti, se "q" non è definito, la query sarà vuota e restituirà tutti i documenti.
    let query = q ? { titolo: { $regex: q, $options: "i" } } : {};

    const auctions = await mongo.collection('auctions').find(query).toArray();  // Recupero delle aste
    
    // Gestione del caso in cui non sono stati trovati elementi corrispondenti
    if (auctions.length === 0) {
        return res.status(404).send("Errore: nessun elemento corrispondente trovato"); 
    }

    res.json(auctions);
});


// Modifica di un'asta
app.put("/:id", verifyToken, async (req, res) => {
    const mongo = await db.connect2db(); 
    let idAsta = parseInt(req.params.id);           // ID dell'asta da modificare
    let titolo = req.body.titolo;                   // Nuovo titolo
    let descrizione = req.body.descrizione;         // Nuova descrizione
    const username = req.user.username;             // Username dell'utente autenticato

    let query = { id: idAsta }; // Query per cercare l'asta

    // Verifico se l'asta esiste e se l'utente è il creatore
    const auction = await mongo.collection('auctions').findOne(query);
    if (auction == null) {
        return res.status(404).send("Errore: asta inesistente");
    }
    if (auction.creatore !== username) {
        return res.status(403).json("Errore: non sei autorizzato a modificare questa asta");
    }

    // Creazione del nuovo oggetto asta
    let id = auction.id;
    let scadenza = auction.scadenza;
    let offerta = auction.offertaPartenza;
    let creatore = auction.creatore;

    let newAuction = { id, titolo, descrizione, scadenza, offerta, creatore };
    await mongo.collection('auctions').updateOne(query, { $set: newAuction }); // Aggiornamento nel database
    res.json(newAuction);
});


// Cancellazione di un'asta
app.delete("/:id", verifyToken, async (req, res) => {
    const mongo = await db.connect2db(); 
    let idAsta = parseInt(req.params.id);       // ID dell'asta da cancellare
    const username = req.user.username;         // Username dell'utente autenticato

    let query = { id: idAsta }; // Query per cercare l'asta

    // Verifico se l'asta esiste e se l'utente è il creatore
    const auction = await mongo.collection('auctions').findOne(query);
    if (auction == null) {
        return res.status(404).send("Errore: asta inesistente");
    }
    if (auction.creatore !== username) {
        return res.status(403).json({ error: "Non sei autorizzato a modificare questa asta" });
    }

    await mongo.collection('auctions').deleteOne(auction); // Cancellazione dell'asta
    res.json(auction);
});


// Creazione di un'offerta per un'asta
app.post("/:id/bids", verifyToken, async (req, res) => {
    const mongo = await db.connect2db(); 
    let idAsta = parseInt(req.params.id);           // Recupero l'ID dell'asta 
    let user = req.user.username; 
    let offerta = parseInt(req.body.offerta);       // Estraggo l'importo dell'offerta

    // Ottengo la data corrente e la formatto
    let dataCorr = moment(new Date());
    let dataCorrFormat = dataCorr.format("DD/MM/YYYY");

    // Recupero i dettagli dell'asta dal database
    let query = { id: idAsta };
    const auction = await mongo.collection('auctions').findOne(query);
    if (auction == null) {
        return res.status(404).send("Errore: asta non trovata");
    }

    // Controllo se l'asta è scaduta
    let scadenza = moment(auction.scadenza); // Ottengo la data di scadenza dell'asta
    if (dataCorr.isAfter(scadenza)) {
        return res.status(403).send("Errore: l'asta è scaduta");
    }

    // Recupero l'offerta più alta esistente per questa asta dalla collezione "bids"
    const offertaMax = await mongo.collection('bids').findOne(
        { idAsta: idAsta },         // Cerco solo le offerte relative a questa asta
        { sort: { offerta: -1 } }   // Ordino per importo decrescente
    );

    // Determino la soglia minima per l'offerta
    let soglia = offertaMax ? offertaMax.offerta : auction.offertaCorrente;

    // Verifico se l'offerta è valida (deve essere maggiore della soglia)
    if (offerta <= soglia) {
        return res.status(403).send(`Errore: l'offerta deve essere maggiore di €${soglia}`);
    }

    // Genero un nuovo ID per l'offerta
    const ultimoId = await mongo.collection('bids').findOne({}, { sort: { id: -1 } });
    let id = ultimoId?.id !== undefined ? ultimoId.id : -1;
    id++;

    // Creo l'offerta e la inserisco nel database
    let off = { id, utente: user, data: dataCorrFormat, offerta: offerta, idAsta };
    await mongo.collection('bids').insertOne(off);

    // Aggiorno i dettagli dell'asta con la nuova offerta corrente e il vincitore
    await mongo.collection('auctions').updateOne(
        { id: idAsta },
        { $set: { offertaCorrente: offerta, vincitore: user } }
    );
    res.json(off);
});


// Visualizzazione delle offerte per un'asta
app.get("/:id/bids", async (req, res) => {
    const mongo = await db.connect2db();      
    let id = parseInt(req.params.id);       // ID dell'asta

    let query = { id }; // Query per cercare l'asta

    const auction = await mongo.collection('auctions').findOne(query); // Recupero dell'asta
    if (auction == null) {
        return res.status(403).send("Errore: asta inesistente");
    }

    let offertaPartenza = auction.offertaPartenza;  // Offerta di partenza
    let queryAsta = { idAsta: id };                 // Query per cercare le offerte relative all'asta
    const bids = await mongo.collection('bids').find(queryAsta).toArray();  // Recupero delle offerte
    res.json({ offertaPartenza, bids });
});


module.exports = app;