const express = require('express');
const cookieParser = require('cookie-parser');

// Importazione dei moduli necessari
const auth = require('./auth.js');              // Gestione dell'autenticazione (login, registrazione, ecc.)
const auctions = require('./auctions.js');      // Gestione delle aste
const users = require('./users.js');            // Gestione degli utenti
const bids = require('./bids.js');              // Gestione delle offerte
const whoami = require('./whoami.js');          // Endpoint per identificare l'utente autenticato

const app = express(); // Creazione dell'applicazione Express

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// Monta il router per l'autenticazione sotto il percorso "/api/auth"
app.use("/api/auth", auth);
// Monta il router per la gestione degli utenti sotto il percorso "/api/users"
app.use("/api/users", users);
// Monta il router per la gestione delle offerte sotto il percorso "/api/bids"
app.use("/api/bids", bids);
// Monta il router per identificare l'utente autenticato sotto il percorso "/api/"
app.use("/api", whoami);
// Serve i file statici dalla directory "public"
app.use(express.static('public'));
// Monta il router per la gestione delle aste sotto il percorso "/api/auctions"
app.use("/api/auctions", auctions);
// Serve i file statici dalla directory "private"
app.use(express.static('private'));

// Avvia il server sulla porta 3000
app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
