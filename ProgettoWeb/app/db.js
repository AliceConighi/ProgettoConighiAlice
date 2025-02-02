const { MongoClient } = require('mongodb');  // Importazione del modulo MongoClient da mongodb
const URI = "mongodb://mongohost";           // URI del server MongoDB
let cachedDB;                                // Variabile per memorizzare una connessione al database già esistente

// Esportazione della funzione per connettersi al database
module.exports = {
    // Funzione asincrona per connettersi al database
    connect2db: async () => {

        // Controllo se esiste già una connessione memorizzata
        if (cachedDB) {
            console.log("Recupero connessione esistente");
            return cachedDB; // Restituisco la connessione esistente
        }

        try {
            // Se non c'è una connessione esistente, ne creo una nuova
            console.log("Creo nuova connessione");
            const client = await MongoClient.connect(URI);      // Connessione al server MongoDB
            cachedDB = client.db("aste");                       // Memorizzo la connessione al database "aste"
            return cachedDB;                            
        } catch (err) {
            console.log("Errore: connessione non riuscita");    // Messaggio di log per indicare un errore
            return null;
        }
    }
}
