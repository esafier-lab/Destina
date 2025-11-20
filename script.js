const form = document.getElementById("tripForm");
const results = document.getElementById("results");
const itinerary = document.getElementById("itinerary");
const button = form.querySelector("button");

// Function to calculate minimum budget needed based on inputs
function calculateMinimumBudget(days, style, dietary) {
  // Minimum hotel price
  const minHotel = 70; // Old Town Lodge
  
  // Minimum activity price by style
  let minActivity;
  if (style === "Fun") minActivity = 20;
  else if (style === "Cultural") minActivity = 10;
  else minActivity = 0; // Religious
  
  // Minimum restaurant price (considering dietary restrictions)
  let minRestaurant = 12; // Cozy bakery (cheapest overall)
  
  if (dietary) {
    // Check minimum prices for each dietary restriction
    const dietaryMinPrices = {
      "kosher": 22,      // Kosher café
      "halal": 18,       // Halal street food
      "gluten-free": 12, // Cozy bakery (has gluten-free)
      "vegetarian": 20,  // Plant-based café
      "vegan": 20        // Plant-based café
    };
    
    if (dietaryMinPrices[dietary]) {
      minRestaurant = dietaryMinPrices[dietary];
    }
  }
  
  const minBudgetPerDay = minHotel + minRestaurant + minActivity;
  return minBudgetPerDay * days;
}

// Auto-calculate days from dates
document.getElementById("arrivalDate").addEventListener("change", updateDaysFromDates);
document.getElementById("departureDate").addEventListener("change", updateDaysFromDates);

function updateDaysFromDates() {
  const arrivalDate = document.getElementById("arrivalDate").value;
  const departureDate = document.getElementById("departureDate").value;
  
  if (arrivalDate && departureDate) {
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    
    if (departure > arrival) {
      const diffTime = departure - arrival;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      document.getElementById("days").value = diffDays;
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const destination = document.getElementById("destination").value.trim();
  const arrivalDate = document.getElementById("arrivalDate").value;
  const departureDate = document.getElementById("departureDate").value;
  const days = parseInt(document.getElementById("days").value);
  const budget = parseFloat(document.getElementById("budget").value);
  const season = document.getElementById("season").value;
  const style = document.getElementById("style").value;
  const dietary = document.getElementById("dietary").value;

  if (!destination || !arrivalDate || !departureDate || !days || !budget || !season || !style) {
    alert("Please fill in all required fields.");
    return;
  }

  // Validate dates
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  
  if (departure <= arrival) {
    alert("Departure date must be after arrival date.");
    return;
  }

  // Validate budget is positive
  if (budget <= 0 || isNaN(budget)) {
    alert("Please enter a valid budget amount greater than $0.");
    return;
  }

  // Check if budget meets minimum requirements
  const minBudget = calculateMinimumBudget(days, style, dietary);
  if (budget < minBudget) {
    const minPerDay = minBudget / days;
    alert(`Budget too low! For a ${style.toLowerCase()} trip${dietary ? ` with ${dietary} dietary restrictions` : ''} of ${days} day${days > 1 ? 's' : ''}, you need at least $${minBudget.toFixed(2)} total ($${minPerDay.toFixed(2)} per day).`);
    return;
  }

  showItinerary(destination, days, budget, season, style, dietary);
  button.textContent = "Regenerate Itinerary 🔄";
});

function showItinerary(destination, days, budget, season, style, dietary = "") {
  results.classList.remove("hidden");
  itinerary.innerHTML = "";

  // Calculate budget per day
  const budgetPerDay = budget / days;

  // Season-specific activity lists by travel style
  const funActivities = {
    summer: [
      { name: "Snorkeling at the beach", price: 45 },
      { name: "Beach volleyball or swimming", price: 20 },
      { name: "Day at the water park", price: 60 },
      { name: "Sunset cruise", price: 60 },
      { name: "Outdoor music festival", price: 50 },
      { name: "Parasailing or jet skiing", price: 70 },
      { name: "Boat ride on the lake", price: 40 },
      { name: "Outdoor adventure park", price: 55 },
      { name: "Kayaking or paddleboarding", price: 35 },
      { name: "Beach bonfire and s'mores", price: 25 },
      { name: "Surfing lessons", price: 65 },
      { name: "Dolphin watching tour", price: 55 },
      { name: "Outdoor movie night", price: 15 },
      { name: "Food truck festival", price: 30 },
      { name: "Beachside yoga class", price: 25 },
      { name: "Rooftop bar and live music", price: 40 },
      { name: "Outdoor escape room", price: 45 },
      { name: "Beach volleyball tournament", price: 20 },
      { name: "Stand-up paddleboard tour", price: 50 },
      { name: "Outdoor zipline course", price: 75 },
      { name: "Beachside bike rental", price: 20 },
      { name: "Outdoor concert in the park", price: 35 },
      { name: "Beach cleanup and eco-tour", price: 15 },
      { name: "Outdoor paintball or laser tag", price: 45 },
      { name: "Beachside volleyball court", price: 20 }
    ],
    winter: [
      { name: "Skiing or snowboarding", price: 80 },
      { name: "Ice skating rink", price: 25 },
      { name: "Indoor water park", price: 65 },
      { name: "Winter festival or holiday market", price: 30 },
      { name: "Hot springs or spa day", price: 70 },
      { name: "Snowshoeing or winter hike", price: 35 },
      { name: "Indoor rock climbing", price: 40 },
      { name: "Museum or indoor entertainment", price: 30 },
      { name: "Ice fishing experience", price: 45 },
      { name: "Sleigh ride or horse-drawn carriage", price: 50 },
      { name: "Indoor trampoline park", price: 35 },
      { name: "Winter photography workshop", price: 40 },
      { name: "Indoor go-kart racing", price: 45 },
      { name: "Holiday light tour", price: 25 },
      { name: "Indoor mini golf", price: 20 },
      { name: "Winter cooking class", price: 60 },
      { name: "Indoor bowling alley", price: 30 },
      { name: "Spa and wellness center", price: 75 },
      { name: "Indoor arcade and games", price: 25 },
      { name: "Winter wine tasting", price: 50 },
      { name: "Indoor escape room", price: 45 },
      { name: "Holiday market shopping", price: 20 },
      { name: "Indoor sports complex", price: 40 },
      { name: "Winter craft workshop", price: 35 },
      { name: "Indoor aquarium visit", price: 40 }
    ],
    fall: [
      { name: "Fall foliage tour", price: 40 },
      { name: "Apple picking or harvest festival", price: 25 },
      { name: "Hiking through autumn trails", price: 20 },
      { name: "Pumpkin patch or corn maze", price: 30 },
      { name: "Wine tasting tour", price: 55 },
      { name: "Outdoor photography walk", price: 15 },
      { name: "Harvest market visit", price: 20 },
      { name: "Scenic train ride", price: 50 },
      { name: "Hayride through the countryside", price: 30 },
      { name: "Fall color kayak tour", price: 45 },
      { name: "Apple cider tasting", price: 20 },
      { name: "Ghost tour or haunted walk", price: 35 },
      { name: "Fall farmers market", price: 15 },
      { name: "Scenic drive through mountains", price: 25 },
      { name: "Pumpkin carving workshop", price: 25 },
      { name: "Fall bike tour", price: 35 },
      { name: "Harvest dinner experience", price: 60 },
      { name: "Autumn bird watching", price: 20 },
      { name: "Fall festival with live music", price: 40 },
      { name: "Scenic overlook hike", price: 20 },
      { name: "Cider mill visit", price: 25 },
      { name: "Fall camping experience", price: 30 },
      { name: "Autumn equinox celebration", price: 30 },
      { name: "Fall color photography tour", price: 40 },
      { name: "Harvest moon viewing", price: 15 }
    ],
    spring: [
      { name: "Cherry blossom viewing", price: 15 },
      { name: "Spring flower garden tour", price: 25 },
      { name: "Outdoor picnic in the park", price: 20 },
      { name: "Bike tour through the city", price: 35 },
      { name: "Spring festival or fair", price: 40 },
      { name: "Wildlife watching tour", price: 45 },
      { name: "Outdoor yoga or wellness class", price: 30 },
      { name: "Scenic nature walk", price: 15 },
      { name: "Tulip festival visit", price: 30 },
      { name: "Spring bird watching", price: 20 },
      { name: "Outdoor farmers market", price: 15 },
      { name: "Spring kayak tour", price: 40 },
      { name: "Butterfly garden visit", price: 25 },
      { name: "Spring equinox celebration", price: 30 },
      { name: "Outdoor art festival", price: 35 },
      { name: "Spring hiking trail", price: 20 },
      { name: "Garden photography workshop", price: 40 },
      { name: "Spring bike rental", price: 25 },
      { name: "Wildflower viewing tour", price: 30 },
      { name: "Outdoor cooking class", price: 55 },
      { name: "Spring music festival", price: 45 },
      { name: "Botanical garden tour", price: 30 },
      { name: "Spring equinox yoga", price: 30 },
      { name: "Outdoor painting class", price: 40 },
      { name: "Spring nature photography", price: 35 }
    ]
  };

  const culturalActivities = {
    summer: [
      { name: "Visit an art museum", price: 25 },
      { name: "Take a historic city tour", price: 35 },
      { name: "Local cooking class", price: 65 },
      { name: "Explore the heritage village", price: 15 },
      { name: "Watch an outdoor cultural show", price: 30 },
      { name: "Visit the national monument", price: 10 },
      { name: "Browse a summer craft market", price: 20 },
      { name: "Take a guided architecture walk", price: 40 },
      { name: "Visit a local history museum", price: 20 },
      { name: "Attend a summer concert series", price: 35 },
      { name: "Explore ancient ruins", price: 30 },
      { name: "Visit a cultural center", price: 25 },
      { name: "Take a food and culture walking tour", price: 45 },
      { name: "Visit a traditional craft workshop", price: 40 },
      { name: "Attend a cultural dance performance", price: 40 },
      { name: "Explore a historic district", price: 15 },
      { name: "Visit a local art gallery", price: 20 },
      { name: "Take a photography tour of landmarks", price: 35 },
      { name: "Visit a traditional market", price: 15 },
      { name: "Attend a storytelling session", price: 25 },
      { name: "Explore a historic library", price: 10 },
      { name: "Visit a cultural heritage site", price: 20 },
      { name: "Take a traditional music workshop", price: 50 },
      { name: "Visit a local theater", price: 30 },
      { name: "Explore a historic cemetery", price: 10 }
    ],
    winter: [
      { name: "Visit an art museum", price: 25 },
      { name: "Take a historic city tour", price: 35 },
      { name: "Indoor cooking class", price: 65 },
      { name: "Explore the heritage village", price: 15 },
      { name: "Watch a theater performance", price: 45 },
      { name: "Visit the national monument", price: 10 },
      { name: "Browse a winter holiday market", price: 20 },
      { name: "Take a guided architecture walk", price: 40 },
      { name: "Visit a history museum", price: 20 },
      { name: "Attend a classical music concert", price: 50 },
      { name: "Explore an indoor cultural center", price: 25 },
      { name: "Visit a traditional craft studio", price: 35 },
      { name: "Take a winter food tour", price: 45 },
      { name: "Visit a local art gallery", price: 20 },
      { name: "Attend a cultural lecture", price: 25 },
      { name: "Explore a historic indoor market", price: 15 },
      { name: "Visit a traditional music venue", price: 40 },
      { name: "Take a photography class", price: 55 },
      { name: "Visit a cultural heritage museum", price: 25 },
      { name: "Attend a winter festival", price: 35 },
      { name: "Explore a historic library", price: 10 },
      { name: "Visit a local theater production", price: 45 },
      { name: "Take a traditional craft workshop", price: 40 },
      { name: "Visit a cultural exhibition", price: 30 },
      { name: "Explore a historic indoor site", price: 20 }
    ],
    fall: [
      { name: "Visit an art museum", price: 25 },
      { name: "Take a historic city tour", price: 35 },
      { name: "Local cooking class with seasonal ingredients", price: 65 },
      { name: "Explore the heritage village", price: 15 },
      { name: "Watch a folk dance show", price: 30 },
      { name: "Visit the national monument", price: 10 },
      { name: "Browse a fall harvest market", price: 20 },
      { name: "Take a guided architecture walk", price: 40 },
      { name: "Visit a local history museum", price: 20 },
      { name: "Attend a fall cultural festival", price: 40 },
      { name: "Explore historic autumn sites", price: 25 },
      { name: "Visit a traditional craft fair", price: 25 },
      { name: "Take a fall food and culture tour", price: 50 },
      { name: "Visit a cultural heritage center", price: 25 },
      { name: "Attend a traditional music concert", price: 45 },
      { name: "Explore a historic neighborhood", price: 15 },
      { name: "Visit a local art gallery", price: 20 },
      { name: "Take a photography tour", price: 35 },
      { name: "Visit a traditional harvest festival", price: 30 },
      { name: "Explore a historic library", price: 10 },
      { name: "Attend a cultural storytelling event", price: 25 },
      { name: "Visit a local theater", price: 35 },
      { name: "Take a traditional craft workshop", price: 40 },
      { name: "Visit a cultural exhibition", price: 30 },
      { name: "Explore a historic site", price: 20 }
    ],
    spring: [
      { name: "Visit an art museum", price: 25 },
      { name: "Take a historic city tour", price: 35 },
      { name: "Local cooking class", price: 65 },
      { name: "Explore the heritage village", price: 15 },
      { name: "Watch a spring cultural festival", price: 30 },
      { name: "Visit the national monument", price: 10 },
      { name: "Browse a spring craft market", price: 20 },
      { name: "Take a guided architecture walk", price: 40 },
      { name: "Visit a local history museum", price: 20 },
      { name: "Attend a spring concert series", price: 35 },
      { name: "Explore historic spring sites", price: 25 },
      { name: "Visit a traditional craft market", price: 25 },
      { name: "Take a spring food and culture tour", price: 50 },
      { name: "Visit a cultural heritage center", price: 25 },
      { name: "Attend a traditional dance performance", price: 40 },
      { name: "Explore a historic district", price: 15 },
      { name: "Visit a local art gallery", price: 20 },
      { name: "Take a photography workshop", price: 45 },
      { name: "Visit a spring cultural event", price: 30 },
      { name: "Explore a historic library", price: 10 },
      { name: "Attend a cultural lecture", price: 25 },
      { name: "Visit a local theater", price: 35 },
      { name: "Take a traditional music class", price: 50 },
      { name: "Visit a cultural exhibition", price: 30 },
      { name: "Explore a historic garden", price: 20 }
    ]
  };

  const religiousActivities = {
    summer: [
      { name: "Visit a historic synagogue or church", price: 0 },
      { name: "Attend a Shabbat or Sunday service", price: 0 },
      { name: "Walk a pilgrimage route", price: 10 },
      { name: "Explore sacred gardens", price: 15 },
      { name: "Visit a faith museum or cultural center", price: 20 },
      { name: "Join a community volunteer project", price: 0 },
      { name: "Attend an outdoor religious concert", price: 35 },
      { name: "Tour an ancient temple or monastery", price: 25 },
      { name: "Visit a historic mosque", price: 0 },
      { name: "Attend a religious study group", price: 0 },
      { name: "Explore a sacred cemetery", price: 10 },
      { name: "Visit a religious art gallery", price: 20 },
      { name: "Attend a community prayer service", price: 0 },
      { name: "Tour a historic religious site", price: 15 },
      { name: "Visit a faith-based library", price: 10 },
      { name: "Attend a religious lecture", price: 0 },
      { name: "Explore a meditation garden", price: 15 },
      { name: "Visit a religious heritage center", price: 20 },
      { name: "Attend a summer religious festival", price: 30 },
      { name: "Tour a sacred architectural site", price: 25 },
      { name: "Visit a religious community center", price: 0 },
      { name: "Attend a religious music performance", price: 35 },
      { name: "Explore a pilgrimage site", price: 15 },
      { name: "Visit a religious bookstore", price: 10 },
      { name: "Attend a community service event", price: 0 }
    ],
    winter: [
      { name: "Visit a historic synagogue or church", price: 0 },
      { name: "Attend a Shabbat or Sunday service", price: 0 },
      { name: "Walk a pilgrimage route", price: 10 },
      { name: "Explore sacred gardens (indoor)", price: 15 },
      { name: "Visit a faith museum or cultural center", price: 20 },
      { name: "Join a community volunteer project", price: 0 },
      { name: "Attend a holiday religious service", price: 0 },
      { name: "Tour an ancient temple or monastery", price: 25 },
      { name: "Visit a historic mosque", price: 0 },
      { name: "Attend a religious study session", price: 0 },
      { name: "Explore a sacred indoor space", price: 15 },
      { name: "Visit a religious art museum", price: 20 },
      { name: "Attend a community prayer gathering", price: 0 },
      { name: "Tour a historic religious building", price: 15 },
      { name: "Visit a faith-based library", price: 10 },
      { name: "Attend a religious lecture series", price: 0 },
      { name: "Explore a meditation center", price: 20 },
      { name: "Visit a religious heritage museum", price: 25 },
      { name: "Attend a winter holiday service", price: 0 },
      { name: "Tour a sacred architectural site", price: 25 },
      { name: "Visit a religious community center", price: 0 },
      { name: "Attend a religious music concert", price: 40 },
      { name: "Explore an indoor pilgrimage site", price: 15 },
      { name: "Visit a religious bookstore", price: 10 },
      { name: "Attend a community service event", price: 0 }
    ],
    fall: [
      { name: "Visit a historic synagogue or church", price: 0 },
      { name: "Attend a Shabbat or Sunday service", price: 0 },
      { name: "Walk a pilgrimage route", price: 10 },
      { name: "Explore sacred gardens", price: 15 },
      { name: "Visit a faith museum or cultural center", price: 20 },
      { name: "Join a community volunteer project", price: 0 },
      { name: "Attend a religious concert or event", price: 35 },
      { name: "Tour an ancient temple or monastery", price: 25 },
      { name: "Visit a historic mosque", price: 0 },
      { name: "Attend a religious study group", price: 0 },
      { name: "Explore a sacred cemetery", price: 10 },
      { name: "Visit a religious art gallery", price: 20 },
      { name: "Attend a community prayer service", price: 0 },
      { name: "Tour a historic religious site", price: 15 },
      { name: "Visit a faith-based library", price: 10 },
      { name: "Attend a religious lecture", price: 0 },
      { name: "Explore a meditation garden", price: 15 },
      { name: "Visit a religious heritage center", price: 20 },
      { name: "Attend a fall religious festival", price: 30 },
      { name: "Tour a sacred architectural site", price: 25 },
      { name: "Visit a religious community center", price: 0 },
      { name: "Attend a religious music performance", price: 35 },
      { name: "Explore a pilgrimage site", price: 15 },
      { name: "Visit a religious bookstore", price: 10 },
      { name: "Attend a community service event", price: 0 }
    ],
    spring: [
      { name: "Visit a historic synagogue or church", price: 0 },
      { name: "Attend a Shabbat or Sunday service", price: 0 },
      { name: "Walk a pilgrimage route", price: 10 },
      { name: "Explore sacred gardens", price: 15 },
      { name: "Visit a faith museum or cultural center", price: 20 },
      { name: "Join a community volunteer project", price: 0 },
      { name: "Attend a spring religious festival", price: 35 },
      { name: "Tour an ancient temple or monastery", price: 25 },
      { name: "Visit a historic mosque", price: 0 },
      { name: "Attend a religious study group", price: 0 },
      { name: "Explore a sacred garden in bloom", price: 15 },
      { name: "Visit a religious art gallery", price: 20 },
      { name: "Attend a community prayer service", price: 0 },
      { name: "Tour a historic religious site", price: 15 },
      { name: "Visit a faith-based library", price: 10 },
      { name: "Attend a religious lecture", price: 0 },
      { name: "Explore a meditation garden", price: 15 },
      { name: "Visit a religious heritage center", price: 20 },
      { name: "Attend a spring religious celebration", price: 30 },
      { name: "Tour a sacred architectural site", price: 25 },
      { name: "Visit a religious community center", price: 0 },
      { name: "Attend a religious music performance", price: 35 },
      { name: "Explore a pilgrimage site", price: 15 },
      { name: "Visit a religious bookstore", price: 10 },
      { name: "Attend a community service event", price: 0 }
    ]
  };

  const restaurants = [
    { name: "Top-rated restaurant", price: 50, dietary: [] },
    { name: "Local vegan café", price: 25, dietary: ["vegan", "vegetarian", "gluten-free"] },
    { name: "Traditional diner", price: 20, dietary: [] },
    { name: "Popular street food market", price: 15, dietary: [] },
    { name: "Cozy bakery", price: 12, dietary: ["gluten-free"] },
    { name: "Seaside grill", price: 40, dietary: [] },
    { name: "Fine dining experience", price: 80, dietary: [] },
    { name: "Family-owned eatery", price: 18, dietary: [] },
    { name: "Kosher deli & restaurant", price: 30, dietary: ["kosher"] },
    { name: "Kosher fine dining", price: 65, dietary: ["kosher"] },
    { name: "Kosher café", price: 22, dietary: ["kosher"] },
    { name: "Halal restaurant", price: 28, dietary: ["halal"] },
    { name: "Halal grill", price: 35, dietary: ["halal"] },
    { name: "Halal street food", price: 18, dietary: ["halal"] },
    { name: "Gluten-free bistro", price: 32, dietary: ["gluten-free"] },
    { name: "Vegetarian restaurant", price: 24, dietary: ["vegetarian", "vegan"] },
    { name: "Vegan fine dining", price: 55, dietary: ["vegan", "vegetarian"] },
    { name: "Plant-based café", price: 20, dietary: ["vegan", "vegetarian"] },
    { name: "Italian trattoria", price: 35, dietary: [] },
    { name: "Asian fusion restaurant", price: 42, dietary: [] },
    { name: "Mexican cantina", price: 28, dietary: [] },
    { name: "Farm-to-table restaurant", price: 48, dietary: [] },
    { name: "Sushi bar", price: 55, dietary: [] },
    { name: "BBQ joint", price: 32, dietary: [] },
    { name: "Mediterranean bistro", price: 38, dietary: [] },
    { name: "French bistro", price: 45, dietary: [] },
    { name: "Indian curry house", price: 30, dietary: [] },
    { name: "Thai restaurant", price: 28, dietary: [] },
    { name: "Pizza place", price: 22, dietary: [] },
    { name: "Burger joint", price: 18, dietary: [] },
    { name: "Seafood restaurant", price: 52, dietary: [] },
    { name: "Steakhouse", price: 65, dietary: [] },
    { name: "Rooftop restaurant", price: 58, dietary: [] },
    { name: "Café and brunch spot", price: 24, dietary: [] },
    { name: "Tapas bar", price: 40, dietary: [] },
    { name: "Ramen shop", price: 20, dietary: [] },
    { name: "Gastropub", price: 35, dietary: [] },
    { name: "Kosher pizza", price: 25, dietary: ["kosher"] },
    { name: "Kosher sushi", price: 50, dietary: ["kosher"] },
    { name: "Halal Mediterranean", price: 32, dietary: ["halal"] },
    { name: "Halal pizza", price: 24, dietary: ["halal"] },
    { name: "Gluten-free Italian", price: 38, dietary: ["gluten-free"] },
    { name: "Vegan sushi", price: 45, dietary: ["vegan", "vegetarian"] },
    { name: "Vegetarian Indian", price: 28, dietary: ["vegetarian", "vegan"] }
  ];

  const hotels = [
    { name: "Hotel Azul", price: 120 },
    { name: "CityView Suites", price: 150 },
    { name: "The Garden Inn", price: 90 },
    { name: "Coastal Resort", price: 180 },
    { name: "Old Town Lodge", price: 70 },
    { name: "Grand Horizon Hotel", price: 200 },
    { name: "Palm Breeze Apartments", price: 100 },
    { name: "Skyline Tower Hotel", price: 160 },
    { name: "Riverside Inn", price: 95 },
    { name: "Mountain View Hotel", price: 130 },
    { name: "Downtown Plaza Hotel", price: 140 },
    { name: "Seaside Boutique Hotel", price: 165 },
    { name: "Historic Manor Hotel", price: 110 },
    { name: "Modern City Hotel", price: 125 },
    { name: "Garden View Lodge", price: 85 },
    { name: "Executive Suites", price: 175 },
    { name: "Budget Inn", price: 75 },
    { name: "Luxury Resort", price: 220 },
    { name: "Business Hotel", price: 135 },
    { name: "Boutique Inn", price: 105 },
    { name: "Family Hotel", price: 115 },
    { name: "Eco-Friendly Lodge", price: 100 },
    { name: "Art Deco Hotel", price: 145 },
    { name: "Waterfront Hotel", price: 170 },
    { name: "Historic Inn", price: 95 },
    { name: "Modern Apartments", price: 120 },
    { name: "Countryside Lodge", price: 80 },
    { name: "Urban Hotel", price: 155 },
    { name: "Beachside Resort", price: 190 },
    { name: "City Center Hotel", price: 160 },
    { name: "Quaint Bed & Breakfast", price: 88 },
    { name: "Luxury Spa Hotel", price: 210 },
    { name: "Budget Motel", price: 72 },
    { name: "Designer Hotel", price: 180 },
    { name: "Traditional Inn", price: 92 }
  ];

  // Pick which activity list to use based on style and season
  let activities;
  if (style === "Fun") activities = funActivities[season] || funActivities.summer;
  else if (style === "Cultural") activities = culturalActivities[season] || culturalActivities.summer;
  else activities = religiousActivities[season] || religiousActivities.summer;

  // Filter restaurants by dietary restrictions if specified
  let filteredRestaurants = restaurants;
  let dietaryWarning = null;
  if (dietary) {
    filteredRestaurants = restaurants.filter(r => 
      r.dietary && r.dietary.includes(dietary)
    );
    
    // If no restaurants match the dietary restriction, show a warning
    if (filteredRestaurants.length === 0) {
      dietaryWarning = `⚠️ No ${dietary} restaurants found in our database. Showing all restaurants instead.`;
      filteredRestaurants = restaurants; // Fall back to all restaurants
    }
  }

  // Filter options that fit within budget per day
  // We need: activity + restaurant + hotel <= budgetPerDay
  const affordableActivities = activities.filter(a => a.price <= budgetPerDay);
  const affordableRestaurants = filteredRestaurants.filter(r => r.price <= budgetPerDay);
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
    // Calculate minimum required budget using the same function
    const minTotalBudget = calculateMinimumBudget(days, style, dietary);
    const minBudgetPerDay = minTotalBudget / days;
    
    itinerary.innerHTML = `
      <div class="card" style="background-color: #ffebee; border: 2px solid #f44336;">
        <h3>⚠️ Budget Too Low</h3>
        <p>Your budget of $${budget.toFixed(2)} for ${days} day${days > 1 ? 's' : ''} ($${budgetPerDay.toFixed(2)} per day) is too low to create a complete itinerary.</p>
        <p>For ${style} trips${dietary ? ` with ${dietary} dietary restrictions` : ''}, you need at least $${minBudgetPerDay.toFixed(2)} per day ($${minTotalBudget.toFixed(2)} total) to include activity, food, and lodging.</p>
      </div>
    `;
    return;
  }

  // Encode destination for Google Maps
  const encodedDest = encodeURIComponent(destination);

  // Show dietary warning if applicable
  if (dietaryWarning) {
    const warningCard = document.createElement("div");
    warningCard.className = "card";
    warningCard.style.backgroundColor = "#fff3cd";
    warningCard.style.border = "2px solid #ffc107";
    warningCard.innerHTML = `<p><strong>${dietaryWarning}</strong></p>`;
    itinerary.appendChild(warningCard);
  }

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

    // Check if restaurant matches dietary restriction
    const hasDietaryMatch = dietary && restaurant.dietary && restaurant.dietary.includes(dietary);
    const dietaryBadge = hasDietaryMatch 
      ? ` <span style="background-color: #4caf50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; font-weight: bold;">${dietary.toUpperCase()}</span>`
      : '';

    // Create itinerary card
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Day ${day}</h3>
      <p><strong>Morning:</strong> <a href="${activityLink}" target="_blank">${activity.name}</a> <span style="color: #666; font-size: 0.9em;">($${activity.price})</span></p>
      <p><strong>Afternoon:</strong> <a href="${restaurantLink}" target="_blank">${restaurant.name}</a>${dietaryBadge} <span style="color: #666; font-size: 0.9em;">($${restaurant.price})</span></p>
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
  const dietaryInfo = dietary ? `<p><strong>Dietary Preference:</strong> ${dietary.charAt(0).toUpperCase() + dietary.slice(1)}</p>` : '';
  summaryCard.innerHTML = `
    <h3>💰 Budget Summary</h3>
    ${dietaryInfo}
    <p><strong>Total Budget:</strong> $${budget.toFixed(2)}</p>
    <p><strong>Estimated Total Cost:</strong> $${totalUsed.toFixed(2)}</p>
    <p><strong>Remaining:</strong> $${(budget - totalUsed).toFixed(2)}</p>
  `;
  itinerary.appendChild(summaryCard);
}
