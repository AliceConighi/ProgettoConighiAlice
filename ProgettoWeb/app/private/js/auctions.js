// Funzione per mostrare il pop-up
function showPopup(message) {
    // Ottengo l'elemento del pop-up e il contenitore del messaggio
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popupMessage");

    // Imposto il messaggio da mostrare
    popupMessage.textContent = message;

    // Rendo visibile il pop-up
    popup.style.display = "block";
}


// Funzione per chiudere il pop-up
function closePopup() {
    // Ottengo l'elemento del pop-up
    const popup = document.getElementById("popup");
    // Nascondo il pop-up
    popup.style.display = "none";
}


// Funzione per gestire gli errori del server
async function handleServerError(response) {
    try {
        // Controllo il tipo di contenuto della risposta del server
        const contentType = response.headers.get("Content-Type");

        // Se il contenuto è in formato JSON, lo analizzo e restituisco il messaggio di errore
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return data.message || "Errore sconosciuto"; // Restituisco un messaggio predefinito se non c'è un messaggio specifico
        }

        // Se il contenuto non è JSON, leggo il testo della risposta
        const text = await response.text();
        return text || "Errore sconosciuto."; // Restituisco un messaggio predefinito se il testo è vuoto
    } catch (e) {
        // In caso di errore durante la gestione della risposta, restituisco un messaggio di errore generico
        return "Errore durante la gestione della risposta del server";
    }
}


// Funzione per ottenere i dettagli di uno specifico utente
async function getUserDetails() {
    // Ottengo l'ID dell'utente dall'input
    const userId = document.getElementById("userId").value;

    // Ottengo il contenitore per visualizzare i risultati
    const resultsContainer = document.getElementById("userDetailsResults");

    // Pulisco i risultati precedenti
    resultsContainer.innerHTML = "";

    // Se l'ID dell'utente è presente
    if (userId) {
        try {
            // Invio una richiesta GET al server per ottenere i dettagli dell'utente
            const response = await fetch("/api/users/" + userId);

            // Se la risposta non è OK, gestisco l'errore
            if (!response.ok) throw new Error(await handleServerError(response));

            // Estraggo i dati dell'utente dalla risposta
            const user = await response.json();

            // Visualizzo i dettagli dell'utente nel contenitore
            resultsContainer.innerHTML = "<ul><li>ID: " + user.id + " - Username: " + user.username + " - Nome: " + user.nome + " - Cognome: " + user.cognome + "</li></ul>";
        } catch (error) {
            // Mostro un messaggio di errore nel pop-up
            showPopup(error.message);
        }
    }
}


// Funzione per cercare utenti tramite query
async function searchUsers() {
    // Ottengo la query di ricerca dall'input
    const query = document.getElementById("userQuery").value;

    // Ottengo il contenitore per visualizzare i risultati
    const resultsContainer = document.getElementById("userSearchResults");

    // Pulisco i risultati precedenti
    resultsContainer.innerHTML = "";

    // Se la query è presente
    if (query) {
        try {
            // Invio una richiesta GET al server per cercare gli utenti
            const response = await fetch("/api/users?q=" + query);

            // Se la risposta non è OK, gestisco l'errore
            if (!response.ok) throw new Error(await handleServerError(response));

            // Estraggo i dati degli utenti dalla risposta
            const users = await response.json();

            // Visualizzo i risultati della ricerca nel contenitore
            resultsContainer.innerHTML = "<ul>" + users.map(user => "<li>ID: " + user.id + " - Username: " + user.username + "</li>").join("") + "</ul>";
        } catch (error) {
            // Mostro un messaggio di errore nel pop-up
            showPopup(error.message);
        }
    }
}


// Funzione per ottenere i dettagli di una specifica asta
async function getAuctionDetails() {
    // Ottengo l'ID dell'asta dall'input
    const auctionId = document.getElementById("auctionId").value;

    // Ottengo il contenitore per visualizzare i risultati
    const resultsContainer = document.getElementById("auctionDetailsResults");

    // Pulisco i risultati precedenti
    resultsContainer.innerHTML = "";

    // Se l'ID dell'asta è presente
    if (auctionId) {
        try {
            // Invio una richiesta GET al server per ottenere i dettagli dell'asta
            const response = await fetch("/api/auctions/" + auctionId);

            // Se la risposta non è OK, gestisco l'errore
            if (!response.ok) throw new Error(await handleServerError(response));

            // Estraggo i dati dell'asta dalla risposta
            const auction = await response.json();

            // Visualizzo i dettagli dell'asta nel contenitore
            resultsContainer.innerHTML = "<ul><li>ID: " + auction.id + " - Titolo: " + auction.titolo + " - Scadenza: " + auction.scadenza + " - Creatore: " + auction.creatore + " - Offerta di partenza: €" + auction.offertaPartenza + " - Offerta Corrente: €" + auction.offertaCorrente + " - Vincitore: " + auction.vincitore + "</li></ul>";
        } catch (error) {
            // Mostro un messaggio di errore nel pop-up
            showPopup(error.message);
        }
    }
}


// Funzione per cercare aste tramite query
async function searchAuctions() {
    // Ottengo la query di ricerca dall'input
    const query = document.getElementById("auctionQuery").value;

    // Ottengo il contenitore per visualizzare i risultati
    const resultsContainer = document.getElementById("auctionSearchResults");

    // Pulisco i risultati precedenti
    resultsContainer.innerHTML = "";

    // Se la query è presente
    if (query) {
        try {
            // Invio una richiesta GET al server per cercare le aste
            const response = await fetch("/api/auctions?q=" + query);

            // Se la risposta non è OK, gestisco l'errore
            if (!response.ok) throw new Error(await handleServerError(response));

            // Estraggo i dati delle aste dalla risposta
            const auctions = await response.json();

            // Visualizzo i risultati della ricerca nel contenitore
            resultsContainer.innerHTML = "<ul>" + auctions.map(auction => "<li>ID: " + auction.id + " - Titolo: " + auction.titolo + " - Scadenza: " + auction.scadenza + " - Creatore: " + auction.creatore + " - Offerta di partenza: €" + auction.offertaPartenza + " - Offerta Corrente: €" + auction.offertaCorrente + " - Vincitore: " + auction.vincitore + "</li>").join("") + "</ul>";
        } catch (error) {
            // Mostro un messaggio di errore nel pop-up
            showPopup(error.message);
        }
    }
}
