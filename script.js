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

  // Calculate budget per day
  const budgetPerDay = budget / days;

  // Lists of options with prices by travel style
  const funActivities = [
    { name: "Snorkeling at the beach", price: 45 },
    { name: "Food truck tour around town", price: 30 },
    { name: "Day at the amusement park", price: 80 },
    { name: "Sunset cruise", price: 60 },
    { name: "Outdoor music festival", price: 50 },
    { name: "Ziplining or parasailing", price: 70 },
    { name: "Boat ride on the lake", price: 40 },
    { name: "Mountain hike or canyon walk", price: 20 }
  ];

  const culturalActivities = [
    { name: "Visit an art museum", price: 25 },
    { name: "Take a historic city tour", price: 35 },
    { name: "Local cooking class", price: 65 },
    { name: "Explore the heritage village", price: 15 },
    { name: "Watch a folk dance show", price: 30 },
    { name: "Visit the national monument", price: 10 },
    { name: "Browse a craft market", price: 20 },
    { name: "Take a guided architecture walk", price: 40 }
  ];

  const religiousActivities = [
    { name: "Visit a historic synagogue or church", price: 0 },
    { name: "Attend a Shabbat or Sunday service", price: 0 },
    { name: "Walk a pilgrimage route", price: 10 },
    { name: "Explore sacred gardens", price: 15 },
    { name: "Visit a faith museum or cultural center", price: 20 },
    { name: "Join a community volunteer project", price: 0 },
    { name: "Attend a religious concert or event", price: 35 },
    { name: "Tour an ancient temple or monastery", price: 25 }
  ];

  const restaurants = [
    { name: "Top-rated restaurant", price: 50 },
    { name: "Local vegan café", price: 25 },
    { name: "Traditional diner", price: 20 },
    { name: "Popular street food market", price: 15 },
    { name: "Cozy bakery", price: 12 },
    { name: "Seaside grill", price: 40 },
    { name: "Fine dining experience", price: 80 },
    { name: "Family-owned eatery", price: 18 }
  ];

  const hotels = [
    { name: "Hotel Azul", price: 120 },
    { name: "CityView Suites", price: 150 },
    { name: "The Garden Inn", price: 90 },
    { name: "Coastal Resort", price: 180 },
    { name: "Old Town Lodge", price: 70 },
    { name: "Grand Horizon Hotel", price: 200 },
    { name: "Palm Breeze Apartments", price: 100 },
    { name: "Skyline Tower Hotel", price: 160 }
  ];

  // Pick which activity list to use
  let activities;
  if (style === "Fun") activities = funActivities;
  else if (style === "Cultural") activities = culturalActivities;
  else activities = religiousActivities;

  // Filter options that fit within budget per day
  // We need: activity + restaurant + hotel <= budgetPerDay
  const affordableActivities = activities.filter(a => a.price <= budgetPerDay);
  const affordableRestaurants = restaurants.filter(r => r.price <= budgetPerDay);
  const affordableHotels = hotels.filter(h => h.price <= budgetPerDay);

  // Further filter to ensure combinations are possible
  // Find combinations where activity + restaurant + hotel <= budgetPerDay
  const validCombinations = [];
  
  affordableActivities.forEach(activity => {
    affordableRestaurants.forEach(restaurant => {
      affordableHotels.forEach(hotel => {
        const totalCost = activity.price + restaurant.price + hotel.price;
        if (totalCost <= budgetPerDay) {
          validCombinations.push({ activity, restaurant, hotel, totalCost });
        }
      });
    });
  });

  // Check if we have valid combinations
  if (validCombinations.length === 0) {
    // Calculate minimum required budget based on travel style
    const minHotel = 70; // Old Town Lodge
    const minRestaurant = 12; // Cozy bakery
    const minActivity = style === "Fun" ? 20 : (style === "Cultural" ? 10 : 0);
    const minBudgetPerDay = minHotel + minRestaurant + minActivity;
    const minTotalBudget = minBudgetPerDay * days;
    
    itinerary.innerHTML = `
      <div class="card" style="background-color: #ffebee; border: 2px solid #f44336;">
        <h3>⚠️ Budget Too Low</h3>
        <p>Your budget of $${budget.toFixed(2)} for ${days} day${days > 1 ? 's' : ''} ($${budgetPerDay.toFixed(2)} per day) is too low to create a complete itinerary.</p>
        <p>For ${style} trips, you need at least $${minBudgetPerDay.toFixed(2)} per day ($${minTotalBudget.toFixed(2)} total) to include activity, food, and lodging.</p>
      </div>
    `;
    return;
  }

  // Encode destination for Google Maps
  const encodedDest = encodeURIComponent(destination);

  // Track used combinations to avoid repetition
  const usedCombinations = new Set();
  let totalUsed = 0;

  // Generate daily itinerary
  for (let day = 1; day <= days; day++) {
    // Find a valid combination that hasn't been used (or reuse if we run out)
    let combination;
    let attempts = 0;
    
    // Safety check: ensure we have valid combinations
    if (validCombinations.length === 0) {
      itinerary.innerHTML = `
        <div class="card" style="background-color: #ffebee; border: 2px solid #f44336;">
          <h3>⚠️ Budget Too Low</h3>
          <p>Your budget of $${budget.toFixed(2)} for ${days} day${days > 1 ? 's' : ''} ($${budgetPerDay.toFixed(2)} per day) is too low to create a complete itinerary.</p>
          <p>Please increase your budget to at least $${(days * 70).toFixed(2)} to get options that include activity, food, and lodging.</p>
        </div>
      `;
      return;
    }
    
    do {
      combination = validCombinations[Math.floor(Math.random() * validCombinations.length)];
      attempts++;
      // If we've tried many times, just use any valid combination
      if (attempts > 50) break;
    } while (usedCombinations.has(JSON.stringify(combination)) && usedCombinations.size < validCombinations.length);
    
    usedCombinations.add(JSON.stringify(combination));

    let { activity, restaurant, hotel, totalCost } = combination;
    
    // Double-check that this combination is within budget (safety check)
    // This should never happen since we pre-filter, but adding as safeguard
    if (totalCost > budgetPerDay) {
      console.error('Invalid combination selected:', totalCost, 'exceeds', budgetPerDay);
      // Find a cheaper combination as fallback
      const fallback = validCombinations.find(c => c.totalCost <= budgetPerDay);
      if (fallback) {
        ({ activity, restaurant, hotel, totalCost } = fallback);
      } else {
        // If no valid combination exists, skip this day
        continue;
      }
    }
    
    totalUsed += totalCost;

    // Build live Google Maps search links
    const activityLink = `https://www.google.com/maps/search/${encodeURIComponent(activity.name)}+in+${encodedDest}`;
    const restaurantLink = `https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}+in+${encodedDest}`;
    const hotelLink = `https://www.google.com/maps/search/${encodeURIComponent(hotel.name)}+in+${encodedDest}`;

    // Create itinerary card
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Day ${day}</h3>
      <p><strong>Morning:</strong> <a href="${activityLink}" target="_blank">${activity.name}</a> <span style="color: #666; font-size: 0.9em;">($${activity.price})</span></p>
      <p><strong>Afternoon:</strong> <a href="${restaurantLink}" target="_blank">${restaurant.name}</a> <span style="color: #666; font-size: 0.9em;">($${restaurant.price})</span></p>
      <p><strong>Evening:</strong> <a href="${hotelLink}" target="_blank">${hotel.name}</a> <span style="color: #666; font-size: 0.9em;">($${hotel.price})</span></p>
      <p><em><strong>Day total: $${totalCost.toFixed(2)}</strong> (Budget: $${budgetPerDay.toFixed(2)})</em></p>
    `;
    itinerary.appendChild(card);
  }

  // Add summary card showing total budget

  const summaryCard = document.createElement("div");
  summaryCard.className = "card";
  summaryCard.style.backgroundColor = "#e8f5e9";
  summaryCard.style.border = "2px solid #4caf50";
  summaryCard.innerHTML = `
    <h3>💰 Budget Summary</h3>
    <p><strong>Total Budget:</strong> $${budget.toFixed(2)}</p>
    <p><strong>Estimated Total Cost:</strong> $${totalUsed.toFixed(2)}</p>
    <p><strong>Remaining:</strong> $${(budget - totalUsed).toFixed(2)}</p>
  `;
  itinerary.appendChild(summaryCard);
}
