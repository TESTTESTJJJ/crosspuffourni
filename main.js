// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
  const paypalButtons = document.querySelectorAll(".paypal-button");

  paypalButtons.forEach((el) => {
    const name = el.getAttribute("data-name");
    const price = el.getAttribute("data-price");

    paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'black',
        shape: 'pill',
        label: 'buynow'
      },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            description: name,
            amount: {
              currency_code: "EUR",
              value: price
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert("Merci " + details.payer.name.given_name + ", votre commande a été enregistrée !");
        });
      },
      onError: function(err) {
        console.error(err);
        alert("Une erreur est survenue lors du paiement. Merci de réessayer.");
      }
    }).render(el);
  });
});
