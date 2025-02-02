const jwt = require("jsonwebtoken");

// Funzione middleware per verificare il token JWT dell'utente
function verifyToken(req, res, next) {
    // Recupero il token JWT dai cookie dell'utente
    const token = req.cookies.token; 

    // Se il token non è presente, restituisco un errore
    if (!token) {
        return res.status(401).send("Errore: nessun token fornito");
    }

    try {
        // Verifico e decodifico il token utilizzando la chiave segreta
        const decoded = jwt.verify(token, "un segreto");

        // Salvo i dati decodificati nell'oggetto req.user per usarli nelle richieste successive
        req.user = decoded;
        // Passo al middleware successivo
        next();
    } catch (err) {
        // Se il token è invalido o la verifica fallisce, restituisco un errore 403 (accesso vietato)
        res.status(403).send("Errore: token non valido");
    }
}

module.exports = verifyToken;
