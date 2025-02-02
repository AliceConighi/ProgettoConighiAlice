const express = require('express');
const db = require("./db.js");
const app = express.Router();
const verifyToken = require("./verifyToken.js");

// Recupero tutte le aste create dall'utente autenticato
app.get('/myauctions', verifyToken, async (req, res) => {
    const mongo = await db.connect2db();
    const username = req.user.username;
        
    // Query per trovare tutte le aste create dall'utente autenticato
    const auctions = await mongo.collection('auctions').find({ creatore: username }).toArray();

    // Controllo se non sono state trovate aste per l'utente
    if (!auctions || auctions.length === 0) {
        return res.status(404).json("Errore: nessuna asta trovata per l'utente");
    }

    res.status(200).json(auctions);
});


// Recupero le informazioni del profilo dell'utente autenticato
app.get("/whoami", verifyToken, async (req, res) => {
    const mongo = await db.connect2db();
    let query = { username: req.user.username };

    // Cerco l'utente nel database, escludendo il campo password per motivi di sicurezza
    const user = await mongo.collection('users').findOne(query, { projection: { password: 0 } });

    // Controllo se l'utente non esiste nel database
    if (user == null) {
        return res.status(404).send("Errore: utente inesistente");
    }

    res.json(user);
});


// Recupero tutte le aste vinte dall'utente autenticato
app.get('/mywonauctions', verifyToken, async (req, res) => {
    const mongo = await db.connect2db();
    const username = req.user.username;

    // Query per trovare tutte le aste vinte dall'utente autenticato
    const wonAuctions = await mongo.collection('auctions').find({ vincitore: username }).toArray();

    // Controllo se non sono state trovate aste vinte per l'utente
    if (!wonAuctions || wonAuctions.length === 0) {
        return res.status(404).json("Errore: nessuna asta vinta trovata");
    }

    res.status(200).json(wonAuctions);
});


module.exports = app;
