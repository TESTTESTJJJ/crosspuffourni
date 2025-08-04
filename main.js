// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
  const panierIcon = document.getElementById("panier-icon-container");
  const panierModal = document.getElementById("panier-modal");
  const fermerPanierBtn = document.getElementById("fermer-panier");
  const panierItemsContainer = document.getElementById("panier-items");
  const panierCount = document.getElementById("panier-count");
  const panierTotalElem = document.getElementById("panier-total");
  const paypalContainer = document.getElementById("paypal-button-container");

  // Le panier est un tableau d'objets {name, price, quantity}
  let panier = [];

  // Mise à jour compteur panier visible
  function updatePanierCount() {
    const totalQty = panier.reduce((acc, item) => acc + item.quantity, 0);
    panierCount.textContent = totalQty;
  }

  // Affiche le panier dans la modal
  function afficherPanier() {
    panierItemsContainer.innerHTML = "";

    if (panier.length === 0) {
      panierItemsContainer.innerHTML = "<p>Votre panier est vide.</p>";
      panierTotalElem.textContent = "0.00";
      paypalContainer.innerHTML = "";
      return;
    }

    panier.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("panier-item");
      itemDiv.style.marginBottom = "10px";
      itemDiv.style.borderBottom = "1px solid #39d778";
      itemDiv.style.paddingBottom = "5px";

      itemDiv.innerHTML = `
        <strong>${item.name}</strong><br/>
        Prix unitaire: ${item.price.toFixed(2)} €<br/>
        Quantité: 
        <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="quantite-input" style="width:50px;"/>
        <button data-index="${index}" class="btn-supprimer" style="background:#d33; color:#fff; border:none; padding:3px 7px; margin-left:10px; cursor:pointer; border-radius:4px;">×</button>
      `;

      panierItemsContainer.appendChild(itemDiv);
    });

    const total = panier.reduce((acc, item) => acc + item.price * item.quantity, 0);
    panierTotalElem.textContent = total.toFixed(2);

    // Recrée le bouton PayPal avec le total mis à jour
    renderPaypalButton(total);
  }

  // Ajoute un produit au panier ou augmente quantité si déjà présent
  function ajouterAuPanier(name, price) {
    const existingIndex = panier.findIndex(item => item.name === name);
    if (existingIndex !== -1) {
      panier[existingIndex].quantity++;
    } else {
      panier.push({ name, price, quantity: 1 });
    }
    updatePanierCount();
  }

  // Supprime un produit du panier selon son index
  function supprimerProduit(index) {
    panier.splice(index, 1);
    updatePanierCount();
  }

  // Met à jour la quantité d'un produit dans le panier
  function updateQuantite(index, nouvelleQuantite) {
    if (nouvelleQuantite < 1) return;
    panier[index].quantity = nouvelleQuantite;
    updatePanierCount();
  }

  // Affiche / masque la modal panier
  function togglePanierModal() {
    if (panierModal.style.display === "none" || panierModal.style.display === "") {
      afficherPanier();
      panierModal.style.display = "block";
    } else {
      panierModal.style.display = "none";
    }
  }

  // Initialise le bouton PayPal avec le montant total
  function renderPaypalButton(total) {
    paypalContainer.innerHTML = "";
    if (total <= 0) return;

    paypal.Buttons({
      style: {
        color: "blue",
        shape: "rect",
        label: "pay",
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: total.toFixed(2),
              currency_code: "EUR",
            },
            description: "Achat puffs jetables CrossPuffourni"
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(details => {
          alert(`Paiement réussi par ${details.payer.name.given_name}! Merci pour votre achat.`);
          panier = [];
          updatePanierCount();
          togglePanierModal();
        });
      },
      onError: err => {
        alert("Une erreur est survenue lors du paiement. Veuillez réessayer.");
        console.error(err);
      }
    }).render("#paypal-button-container");
  }

  // Gestion des clics "Ajouter au panier"
  document.querySelectorAll(".btn-ajout-panier").forEach(button => {
    button.addEventListener("click", () => {
      const produit = button.closest(".carte-produit");
      const name = produit.getAttribute("data-name");
      const price = parseFloat(produit.getAttribute("data-price"));
      ajouterAuPanier(name, price);
      alert(`Produit "${name}" ajouté au panier.`);
    });
  });

  // Affiche modal au clic sur l'icône panier
  panierIcon.addEventListener("click", togglePanierModal);

  // Ferme modal au clic sur bouton fermer
  fermerPanierBtn.addEventListener("click", () => {
    panierModal.style.display = "none";
  });

  // Délégation d'événements sur les inputs quantité et boutons supprimer dans panier
  panierItemsContainer.addEventListener("input", (e) => {
    if (e.target.classList.contains("quantite-input")) {
      const index = parseInt(e.target.getAttribute("data-index"), 10);
      const newQty = parseInt(e.target.value, 10);
      if (!isNaN(newQty) && newQty > 0) {
        updateQuantite(index, newQty);
        afficherPanier();
      }
    }
  });

  panierItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-supprimer")) {
      const index = parseInt(e.target.getAttribute("data-index"), 10);
      supprimerProduit(index);
      afficherPanier();
    }
  });

  // Initialise compteur au chargement
  updatePanierCount();
});
