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
        // Controllo il tipo di contenuto della risposta
        const contentType = response.headers.get("Content-Type");

        // Se il contenuto è JSON, provo a leggerlo come JSON
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return data.message || "Errore sconosciuto.";
        }

        // Altrimenti leggo il corpo come testo
        const text = await response.text();
        return text || "Errore sconosciuto.";
    } catch (e) {
        // In caso di errore durante la lettura, restituisco un messaggio generico
        return "Errore durante la gestione della risposta del server.";
    }
}

// Recupero le informazioni personali
async function fetchUserInfo() {
    // Ottengo il riferimento al contenitore delle informazioni personali
    const userInfoDiv = document.getElementById("userInfo");

    try {
        // Eseguo una richiesta GET per ottenere le informazioni dell'utente
        const response = await fetch("/api/whoami", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        });

        if (response.ok) {
            // Se la richiesta va a buon fine, mostro i dati dell'utente
            const data = await response.json();
            userInfoDiv.innerHTML = `
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Nome:</strong> ${data.nome || "Non specificato"}</p>
                <p><strong>Cognome:</strong> ${data.cognome || "Non specificato"}</p>
            `;
        } else {
            // Se la richiesta fallisce, mostro un messaggio di errore
            userInfoDiv.innerHTML = "<p>Errore durante il caricamento delle informazioni personali.</p>";
        }
    } catch (error) {
        // Gestisco eventuali errori durante la richiesta
        userInfoDiv.innerHTML = "<p>Errore: " + error.message + "</p>";
    }
}

// Recupero le aste dell'utente corrente
async function fetchMyAuctions() {
    // Ottengo il riferimento al contenitore delle aste
    const auctionsDiv = document.getElementById("myAuctions");

    try {
        // Eseguo una richiesta GET per ottenere le aste dell'utente
        const response = await fetch("/api/myauctions", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        });

        if (response.ok) {
            // Se la richiesta va a buon fine, mostro le aste
            const auctions = await response.json();
            auctionsDiv.innerHTML = auctions.map(auction => `
                <div class="auction">
                    <h4>${auction.titolo}</h4>
                    <p><strong>ID:</strong> ${auction.id}</p>
                    <p><strong>Descrizione:</strong> ${auction.descrizione}</p>
                <p><strong>Data di Scadenza:</strong> ${auction.scadenza}</p>
                    <p><strong>Offerta di Partenza:</strong> €${auction.offertaPartenza}</p>
                    <p><strong>Offerta Corrente:</strong> €${auction.offertaCorrente || "Nessuna offerta"}</p>
                </div>
            `).join("");
        } else {
            // Se non ci sono aste, mostro un messaggio
            auctionsDiv.innerHTML = "<p>Non ci sono aste disponibili.</p>";
        }
    } catch (error) {
        // Gestisco eventuali errori durante la richiesta
        auctionsDiv.innerHTML = "<p>Errore: " + error.message + "</p>";
    }
}

// Gestione dell'invio del modulo per creare un'asta
const createForm = document.getElementById("createAuctionForm");
createForm.addEventListener("submit", async function (event) {
    // Impedisco il comportamento predefinito del modulo
    event.preventDefault();

    // Recupero i valori dai campi del modulo
    const titolo = document.getElementById("titolo").value;
    const descrizione = document.getElementById("descrizione").value;
    const scadenza = document.getElementById("scadenza").value;
    const offerta = document.getElementById("offerta").value;

    try {
        // Eseguo una richiesta POST per creare una nuova asta
        const response = await fetch("/api/auctions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ titolo, descrizione, scadenza, offerta })
        });

        if (response.ok) {
            // Se la richiesta va a buon fine, mostro un messaggio di successo
            showPopup("Asta creata con successo");
            fetchMyAuctions();
        } else {
            // Se la richiesta fallisce, gestisco l'errore
            const errorMessage = await handleServerError(response);
            showPopup(errorMessage);
        }
    } catch (error) {
        // Gestisco eventuali errori durante la richiesta
        showPopup(error.message);
    }
});

// Gestione dell'invio del modulo per modificare un'asta
const updateForm = document.getElementById("updateAuctionForm");
updateForm.addEventListener("submit", async function (event) {
    // Impedisco il comportamento predefinito del modulo
    event.preventDefault();

    // Recupero i valori dai campi del modulo
    const id = document.getElementById("updateAuctionId").value;
    const titolo = document.getElementById("updateTitolo").value;
    const descrizione = document.getElementById("updateDescrizione").value;

    try {
        // Eseguo una richiesta PUT per aggiornare l'asta
        const response = await fetch("/api/auctions/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ titolo, descrizione })
        });

        if (response.ok) {
            // Se la richiesta va a buon fine, mostro un messaggio di successo
            showPopup("Asta modificata con successo");
            fetchMyAuctions();
        } else {
            // Se la richiesta fallisce, gestisco l'errore
            const errorMessage = await handleServerError(response);
            showPopup(errorMessage);
        }
    } catch (error) {
        // Gestisco eventuali errori durante la richiesta
        showPopup(error.message);
    }
});

// Gestione dell'invio del modulo per eliminare un'asta
const deleteForm = document.getElementById("deleteAuctionForm");
deleteForm.addEventListener("submit", async function (event) {
    // Impedisco il comportamento predefinito del modulo
    event.preventDefault();

    // Recupero l'ID dell'asta da eliminare
    const id = document.getElementById("deleteAuctionId").value;

    try {
        // Eseguo una richiesta DELETE per eliminare l'asta
        const response = await fetch("/api/auctions/" + id, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        });

        if (response.ok) {
            // Se la richiesta va a buon fine, mostro un messaggio di successo
            showPopup("Asta eliminata con successo");
            fetchMyAuctions();
        } else {
            // Se la richiesta fallisce, gestisco l'errore
            const errorMessage = await handleServerError(response);
            showPopup(errorMessage);
        }
    } catch (error) {
        // Gestisco eventuali errori durante la richiesta
        showPopup(error.message);
    }
});

// Avvio il caricamento delle informazioni personali e delle aste al caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
    fetchUserInfo();
    fetchMyAuctions();
});
