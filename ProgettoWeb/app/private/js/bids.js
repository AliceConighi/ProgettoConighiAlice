// Funzione per mostrare il pop-up
function showPopup(message) {
    // Ottengo il riferimento al pop-up e al contenitore del messaggio
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popupMessage");

    // Imposto il messaggio da mostrare nel pop-up
    popupMessage.textContent = message;

    // Rendo visibile il pop-up
    popup.style.display = "block";
}

// Funzione per chiudere il pop-up
function closePopup() {
    // Ottengo il riferimento al pop-up
    const popup = document.getElementById("popup");

    // Nascondo il pop-up
    popup.style.display = "none";
}

// Funzione per gestire gli errori del server
async function handleServerError(response) {
    try {
        // Recupero il tipo di contenuto della risposta
        const contentType = response.headers.get("Content-Type");

        // Se il contenuto è JSON, lo analizzo e restituisco il messaggio di errore
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return data.message || "Errore sconosciuto"; // Restituisco un messaggio predefinito se non specificato
        }

        // Se il contenuto non è JSON, leggo il testo della risposta
        const text = await response.text();
        return text || "Errore sconosciuto."; // Restituisco un messaggio predefinito se il testo è vuoto
    } catch (e) {
        // Gestisco eventuali errori durante l'elaborazione della risposta
        return "Errore durante la gestione della risposta del server";
    }
}

// Funzione per ottenere le offerte per un'asta
async function getBidsForAuction() {
    // Ottengo l'ID dell'asta dall'input
    const auctionId = document.getElementById("auctionId").value;

    // Controllo se l'ID è stato inserito
    if (!auctionId) {
        showPopup("Inserisci l'ID dell'asta");
        return;
    }

    try {
        // Eseguo una richiesta GET per ottenere le offerte relative all'asta
        const response = await fetch("/api/auctions/" + auctionId + "/bids");

        // Se la risposta non è OK, gestisco l'errore
        if (!response.ok) {
            const error = await handleServerError(response);
            showPopup(error);
            return;
        }

        // Analizzo i dati della risposta
        const data = await response.json();
        const bidsList = document.getElementById("bidsList");
        bidsList.innerHTML = ""; // Pulisco i risultati precedenti

        const offertaPartenza = data.offertaPartenza;
        const bids = data.bids; // Estraggo l'offerta di partenza e le offerte

        // Mostro l'offerta di partenza
        const startingBid = document.createElement("p");
        startingBid.textContent = "Offerta di partenza: €" + offertaPartenza;
        bidsList.appendChild(startingBid);

        // Mostro le offerte
        if (bids.length === 0) {
            // Se non ci sono offerte, mostro un messaggio
            const noBids = document.createElement("p");
            noBids.textContent = "Nessuna offerta per questa asta";
            bidsList.appendChild(noBids);
        } else {
            // Se ci sono offerte, le elenco
            bids.forEach(bid => {
                const bidItem = document.createElement("p");
                bidItem.textContent = "ID Offerta: " + bid.id + ", Utente: " + bid.utente + ", Data: " + bid.data + ", Importo: €" + bid.offerta;
                bidsList.appendChild(bidItem);
            });
        }
    } catch (error) {
        // Gestisco eventuali errori durante il recupero delle offerte
        console.error("Errore durante il recupero delle offerte:", error);
        showPopup("Errore durante il recupero delle offerte");
    }
}

// Funzione per creare una nuova offerta
async function createBid() {
    // Ottengo l'ID dell'asta e l'importo dell'offerta dagli input
    const auctionId = document.getElementById("auctionIdForBid").value;
    const bidAmount = document.getElementById("bidAmount").value;

    // Controllo se entrambi i campi sono stati compilati
    if (!auctionId || !bidAmount) {
        showPopup("Inserisci l'ID dell'asta e l'importo dell'offerta");
        return;
    }

    try {
        // Eseguo una richiesta POST per creare una nuova offerta
        const response = await fetch("/api/auctions/" + auctionId + "/bids", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ offerta: parseInt(bidAmount) }) // Invio i dati in formato JSON
        });

        // Se la risposta non è OK, gestisco l'errore
        if (!response.ok) {
            const error = await handleServerError(response);
            showPopup(error);
            return;
        }

        // Analizzo i dati della risposta e mostro un messaggio di successo
        const data = await response.json();
        showPopup("Offerta creata con successo, ID Offerta: " + data.id);
    } catch (error) {
        // Gestisco eventuali errori durante la creazione dell'offerta
        console.error("Errore durante la creazione dell'offerta:", error);
        showPopup("Errore durante la creazione dell'offerta");
    }
}

// Funzione per ottenere i dettagli di un'offerta
async function getBidDetails() {
    // Ottengo l'ID dell'offerta dall'input
    const bidId = document.getElementById("bidId").value;

    // Controllo se l'ID è stato inserito
    if (!bidId) {
        showPopup("Inserisci l'ID dell'offerta");
        return;
    }

    try {
        // Eseguo una richiesta GET per ottenere i dettagli dell'offerta
        const response = await fetch("/api/bids/" + bidId);

        // Se la risposta non è OK, gestisco l'errore
        if (!response.ok) {
            const error = await handleServerError(response);
            showPopup(error);
            return;
        }

        // Analizzo i dati della risposta
        const bid = await response.json();

        // Mostro i dettagli dell'offerta in un contenitore HTML
        const bidDetails = document.getElementById("bidDetails");
        bidDetails.innerHTML = 
            "<p>ID Offerta: " + bid.id + "</p>" +
            "<p>Utente: " + bid.utente + "</p>" +
            "<p>Data: " + bid.data + "</p>" +
            "<p>Importo: €" + bid.offerta + "</p>" +
            "<p>ID Asta: " + bid.idAsta + "</p>";
    } catch (error) {
        // Gestisco eventuali errori durante il recupero dei dettagli dell'offerta
        console.error("Errore durante il recupero dei dettagli dell'offerta:", error);
        showPopup("Errore durante il recupero dei dettagli dell'offerta");
    }
}
