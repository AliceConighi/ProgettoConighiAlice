const express = require('express'); 
const db = require("./db.js");
const app = express.Router();

// Ricerca dei dettagli di un'offerta tramite il suo ID
app.get("/:id", async (req, res) => {
    const mongo = await db.connect2db();
    // Creazione della query per cercare l'offerta con l'ID specificato
    let query = { id: parseInt(req.params.id) };

    // Cerco l'offerta nella collezione "bids" del database
    const bid = await mongo.collection('bids').findOne(query);

    // Se l'offerta non esiste, restituisco un errore 403
    if(bid == null){
        return res.status(403).send("Errore: offerta inesistente");
    }

    res.json(bid);
});

module.exports = app;
