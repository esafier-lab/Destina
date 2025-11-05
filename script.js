const form = document.getElementById("tripForm");
const results = document.getElementById("results");
const itinerary = document.getElementById("itinerary");
const button = form.querySelector("button");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const destination = document.getElementById("destination").value.trim();
  const days = parseInt(document.getElementById("days").value);
  const budget = parseFloat(document.getElementById("budget").value);
  const style = document.getElementById("style").value;

  if (!destination || !days || !budget || !style) {
    alert("Please fill in all fields.");
    return;
  }

  showItinerary(destination, days, budget, style);
  button.textContent = "Regenerate Itinerary 🔄";
});

function showItinerary(destination, days, budget, style) {
  results.classList.remove("hidden");
  itinerary.innerHTML = "";

  // Lists of options by travel style
  const funActivities = [
    "Snorkeling at the beach",
    "Food truck tour around town",
    "Day at the amusement park",
    "Sunset cruise",
    "Outdoor music festival",
    "Ziplining or parasailing",
    "Boat ride on the lake",
    "Mountain hike or canyon walk"
  ];

  const culturalActivities = [
    "Visit an art museum",
    "Take a historic city tour",
    "Local cooking class",
    "Explore the heritage village",
    "Watch a folk dance show",
    "Visit the national monument",
    "Browse a craft market",
    "Take a guided architecture walk"
  ];

  const religiousActivities = [
    "Visit a historic synagogue or church",
    "Attend a Shabbat or Sunday service",
    "Walk a pilgrimage route",
    "Explore sacred gardens",
    "Visit a faith museum or cultural center",
    "Join a community volunteer project",
    "Attend a religious concert or event",
    "Tour an ancient temple or monastery"
  ];

  const restaurants = [
    "Top-rated restaurant",
    "Local vegan café",
    "Traditional diner",
    "Popular street food market",
    "Cozy bakery",
    "Seaside grill",
    "Fine dining experience",
    "Family-owned eatery"
  ];

  const hotels = [
    "Hotel Azul",
    "CityView Suites",
    "The Garden Inn",
    "Coastal Resort",
    "Old Town Lodge",
    "Grand Horizon Hotel",
    "Palm Breeze Apartments",
    "Skyline Tower Hotel"
  ];

  // Pick which activity list to use
  let activities;
  if (style === "Fun") activities = funActivities;
  else if (style === "Cultural") activities = culturalActivities;
  else activities = religiousActivities;

  // Encode destination for Google Maps
  const encodedDest = encodeURIComponent(destination);

  // Generate daily itinerary
  for (let day = 1; day <= days; day++) {
    // Random unique choices each day
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const hotel = hotels[Math.floor(Math.random() * hotels.length)];

    // Build live Google Maps search links
    const activityLink = `https://www.google.com/maps/search/${encodeURIComponent(activity)}+in+${encodedDest}`;
    const restaurantLink = `https://www.google.com/maps/search/${encodeURIComponent(restaurant)}+in+${encodedDest}`;
    const hotelLink = `https://www.google.com/maps/search/${encodeURIComponent(hotel)}+in+${encodedDest}`;

    // Create itinerary card
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Day ${day}</h3>
      <p><strong>Morning:</strong> <a href="${activityLink}" target="_blank">${activity}</a></p>
      <p><strong>Afternoon:</strong> <a href="${restaurantLink}" target="_blank">${restaurant}</a></p>
      <p><strong>Evening:</strong> <a href="${hotelLink}" target="_blank">${hotel}</a></p>
      <p><em>Est. cost: $${(budget / days).toFixed(0)}</em></p>
    `;
    itinerary.appendChild(card);
  }
}
