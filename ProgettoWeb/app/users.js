const express = require('express'); 
const db = require("./db.js");
const app = express.Router(); 


// Visualizzazione dettagli di un'utente tramite ID
app.get("/:id", async (req, res) => {
    const mongo = await db.connect2db();
    // Creazione della query per cercare l'utente con l'ID specificato
    let query = { id: parseInt(req.params.id) };

    // Cerco l'utente nella collezione "users" del database
    const user = await mongo.collection('users').findOne(query);

    // Se l'utente non esiste, restituisco un errore
    if (user == null) {
        return res.status(403).send("Errore: utente inesistente");
    }

    res.json(user);
});


// Visualizzazione dettagli di un'utente tramite una query q
app.get("", async (req, res) => {
    const mongo = await db.connect2db();
    // Recupero il parametro di ricerca "q"
    let q = req.query.q;

    // Se "q" è definito, creo una query che cerca documenti in cui il campo "username" contiene la stringa specificata in "q".
    // La ricerca utilizza l'operatore "$regex" per effettuare un match parziale e "$options: 'i'" per ignorare la distinzione tra maiuscole e minuscole.
    // Se "q" non è definito, la query sarà un oggetto vuoto "{}" e restituirà tutti i documenti senza applicare alcun filtro.
    let query = q ? { username: { $regex: q, $options: "i" } } : {};

    // Cerco gli utenti nella collezione "users", escludendo il campo "password" dai risultati
    const users = await mongo.collection('users').find(query, { projection: { password: 0 } }).toArray();

    // Se non ci sono utenti corrispondenti, restituisco un errore 404
    if (users.length === 0) {
        return res.status(404).send("Errore: nessun elemento corrispondente trovato");
    }

    // Restituisco la lista degli utenti corrispondenti in formato JSON
    res.json(users);
});

// Esporto il router per poterlo utilizzare in altri file
module.exports = app;
