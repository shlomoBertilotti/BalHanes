const billsData = [
  { amount: 200, alt: "200 Shekel bill", src: "200shekel.png" },
  { amount: 100, alt: "100 Shekel bill", src: "100shekel.png" },
  { amount: 50, alt: "50 Shekel bill", src: "50shekel.png" },
  { amount: 20, alt: "20 Shekel bill", src: "20shekel.png" },
];

const coinsData = [
  { amount: 10, alt: "10 Shekel coin", src: "10shekel.png" },
  { amount: 5, alt: "5 Shekel coin", src: "5shekel.png" },
  { amount: 2, alt: "2 Shekel coin", src: "2shekel.png" },
  { amount: 1, alt: "1 Shekel coin", src: "1shekel.png" },
  { amount: 0.5, alt: "Half Shekel coin", src: "halfShekel.png" },
];

const billsContainer = document.getElementById("bills");
const coinsContainer = document.getElementById("coins");
const pushka = document.getElementById("pushka");
const message = document.getElementById("message");

function createCard({ amount, alt, src }, type) {
  const card = document.createElement("div");
  card.className = type === "bill" ? "bill-card" : "coin-card";
  card.setAttribute("draggable", "true");
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "listitem");
  card.setAttribute("aria-label", `${amount} Shekel`);

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  card.appendChild(img);

  card.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", amount);
    e.dataTransfer.effectAllowed = "move";
  });

  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      donate(amount, card);
    }
  });

  return card;
}

billsData.forEach(bill => {
  billsContainer.appendChild(createCard(bill, "bill"));
});

coinsData.forEach(coin => {
  coinsContainer.appendChild(createCard(coin, "coin"));
});

pushka.addEventListener("dragover", e => e.preventDefault());

pushka.addEventListener("drop", e => {
  e.preventDefault();
  const amount = e.dataTransfer.getData("text/plain");
  if (!amount) return;

  const allCards = [...document.querySelectorAll(".bill-card, .coin-card")];
  const draggedCard = allCards.find(c =>
    c.getAttribute("aria-label").startsWith(amount)
  );

  donate(amount, draggedCard);
});

function donate(amount, draggedCard) {
  if (!confirm(`Do you want to donate ₪${amount}?`)) {
    message.textContent = "Donation cancelled.";
    return;
  }

  message.textContent = `Thank you for donating ₪${amount}!`;

  let donations = JSON.parse(localStorage.getItem("donations") || "[]");
  donations.push({ amount: Number(amount), date: new Date().toISOString() });
  localStorage.setItem("donations", JSON.stringify(donations));

  if (!draggedCard) return;

  const flyCard = draggedCard.cloneNode(true);
  flyCard.classList.add("fly-in");
  document.body.appendChild(flyCard);

  const rect = draggedCard.getBoundingClientRect();
  flyCard.style.left = rect.left + "px";
  flyCard.style.top = rect.top + "px";

  flyCard.getBoundingClientRect(); // trigger layout

  const pushkaRect = pushka.getBoundingClientRect();
  const targetX = pushkaRect.left + pushkaRect.width / 2 - rect.width / 2;
  const targetY = pushkaRect.top + pushkaRect.height / 2 - rect.height / 2;

  flyCard.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(0.1)`;
  flyCard.style.opacity = "0";

  flyCard.addEventListener("transitionend", () => {
    flyCard.remove();
  }, { once: true });
}
