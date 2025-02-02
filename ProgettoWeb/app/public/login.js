// Mostra il pop-up con un messaggio specifico
function showPopup(message) {
    // Ottengo gli elementi del pop-up e dello sfondo
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popupMessage");
    const popupBackground = document.getElementById("popupBackground");

    // Imposto il messaggio nel pop-up
    popupMessage.textContent = message;

    // Rendo visibili il pop-up e lo sfondo
    popup.style.display = "block";
    popupBackground.style.display = "block";
}

// Chiude il pop-up
function closePopup() {
    // Ottengo gli elementi del pop-up e dello sfondo
    const popup = document.getElementById("popup");
    const popupBackground = document.getElementById("popupBackground");

    // Nascondo il pop-up e lo sfondo
    popup.style.display = "none";
    popupBackground.style.display = "none";
}

// Gestione del form di login
const loginForm = document.getElementById("loginForm"); // Ottengo il form di login
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault(); // Impedisco il comportamento predefinito del form (invio della pagina)

    // Prendo i valori inseriti nei campi di input
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Invio una richiesta POST al server per effettuare il login
        const response = await fetch("/api/auth/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"          // Specifico che sto inviando dati in formato JSON
            },
            body: JSON.stringify({ username, password })    // Passo i dati del login come corpo della richiesta
        });

        if (response.ok) {
            // Se il login ha successo, reindirizzo l'utente alla pagina delle aste
            window.location.href = "/auctions.html";
        } else {
            // Se il login fallisce, mostro un messaggio di errore nel pop-up
            showPopup("Errore: credenziali non valide");
        }
    } catch (error) {
        // Se c'è un errore di connessione, mostro un messaggio di errore nel pop-up
        showPopup(error.message);
    }
});

// Gestione del form di registrazione
const registerForm = document.getElementById("registerForm"); // Ottengo il form di registrazione
registerForm.addEventListener("submit", async function(event) {
    event.preventDefault(); // Impedisco il comportamento predefinito del form

    // Prendo i valori inseriti nei campi di input
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const nome = document.getElementById("nome").value;
    const cognome = document.getElementById("cognome").value;

    try {
        // Invio una richiesta POST al server per effettuare la registrazione
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // Specifico che sto inviando dati in formato JSON
            },
            body: JSON.stringify({ username, password, nome, cognome }) // Passo i dati della registrazione come corpo della richiesta
        });

        if (response.ok) {
            // Se la registrazione ha successo, mostro un messaggio di successo nel pop-up
            showPopup("Registrazione completata con successo! Puoi ora effettuare il login.");
        } else {
            // Se la registrazione fallisce, mostro il messaggio di errore restituito dal server
            const error = await response.text();
            showPopup("Errore durante la registrazione: " + error);
        }
    } catch (error) {
        // Se c'è un errore di connessione, mostro un messaggio di errore nel pop-up
        showPopup("Errore di connessione: " + error.message);
    }
});
