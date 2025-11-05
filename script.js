const form = document.getElementById("tripForm");
const results = document.getElementById("results");
const itinerary = document.getElementById("itinerary");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const destination = document.getElementById("destination").value;
  const days = parseInt(document.getElementById("days").value);
  const budget = document.getElementById("budget").value;
  const style = document.getElementById("style").value;

  showItinerary(destination, days, budget, style);
});

function showItinerary(destination, days, budget, style) {
  results.classList.remove("hidden");
  itinerary.innerHTML = "";

  for (let day = 1; day <= days; day++) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Day ${day}</h3>
      <p><strong>Morning:</strong> ${style} tour in ${destination}</p>
      <p><strong>Afternoon:</strong> Local restaurant + market stroll</p>
      <p><strong>Evening:</strong> Relax at top-rated hotel</p>
      <p><em>Est. cost: $${(budget / days).toFixed(0)}</em></p>
    `;
    itinerary.appendChild(card);
  }
}
