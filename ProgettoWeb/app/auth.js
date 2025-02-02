const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db.js");
const app = express.Router();


// Login di un utente
app.post("/signin", async (req, res) => {
    const { username, password } = req.body;        // Estraggo username e password
    const mongo = await db.connect2db();
    const u = { username, password };               // Creo un oggetto con le credenziali
    const user = await mongo.collection('users').findOne(u); // Cerco un utente con queste credenziali nel database
    console.log(user);

    if(user !== null){
        // Se l'utente esiste, genero un token JWT con il suo username come payload
        const payload = { username: user.username };
        let token = jwt.sign(payload, "un segreto");    // Uso una chiave segreta per firmare il token
        res.cookie('token', token, {httpOnly: true});   // Imposto il token come cookie HTTP-only
        res.redirect("/auctions.html");                 // Reindirizzo l'utente alla pagina delle aste
    } else {
        // Se l'utente non esiste, restituisco un errore 403
        res.status(403).send("Errore: login non riuscito");
    }
});


// Registrazione di un utente
app.post("/signup", async (req, res) => {
    const mongo = await db.connect2db();

    // Estraggo i dati dal corpo della richiesta
    let username = req.body.username;
    let password = req.body.password;
    let nome = req.body.nome;
    let cognome = req.body.cognome;

    // Trovo l'ultimo ID inserito nella collezione 'users' per generare un nuovo ID incrementale
    const ultimoId = await mongo.collection('users').findOne({}, { sort: { id: -1 } });
    let id = ultimoId?.id !== undefined ? ultimoId.id : -1; // Se non ci sono utenti, parto da -1
    id++;

    // Creo un oggetto utente con i dati ricevuti
    let user = { id, username, password, nome, cognome };
    let query = { username: username };                             // Creo una query per verificare se l'username esiste già
    const check = await mongo.collection('users').findOne(query);   // Controllo se l'username è già registrato
    
    if (check !== null){
        // Se l'username esiste, restituisco un errore 403
        return res.status(403).send("Errore: username già esistente");
    }

    // Inserisco il nuovo utente nel database
    await mongo.collection('users').insertOne(user);
    res.json(user);
});


module.exports = app;