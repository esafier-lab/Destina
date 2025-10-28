// Destina MVP — Enhanced with real places, directions, and URL sharing
let form, itineraryEl, totalsEl, shareBtn, pdfBtn, directionsA, realResults, hotelsEl, foodEl, sightsEl;

// Initialize DOM elements when page loads
function initElements() {
  form = document.getElementById("trip-form");
  itineraryEl = document.getElementById("itinerary-content");
  totalsEl = document.getElementById("budget-summary");
  shareBtn = document.getElementById("copy-link-btn");
  pdfBtn = document.getElementById("print-pdf-btn");
  directionsA = document.getElementById("directions-link");
  realResults = document.getElementById("real-results");
  hotelsEl = document.getElementById("hotels-list");
  foodEl = document.getElementById("food-list");
  sightsEl = document.getElementById("sights-list");
}

function daysBetween(a,b){return Math.max(1, Math.round((b-a)/(1000*60*60*24)));}

/* ---------- Helpers: links & safe HTML ---------- */
const gmapsPlace = (name, lat, lon)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=&query=${lat},${lon}`;
const gmapsDir = (from,to)=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=driving`;
const bookingSearch = (dest)=>`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}`;
const yelpSearch = (q,dest)=>`https://www.yelp.com/search?find_desc=${encodeURIComponent(q)}&find_loc=${encodeURIComponent(dest)}`;

function esc(s){return (s??"").toString().replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));}

/* ---------- Geocoding & POIs ---------- */
/* Free endpoints for demos:
   - Nominatim (OSM) geocoding (no key; be gentle)
   - OpenTripMap places API (free key recommended). You can set KEY below.
*/
const OTM_KEY = ""; // Optional: add your OpenTripMap API key. Leave blank to use public demo endpoint.

async function geocode(place){
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;
  const r = await fetch(url,{headers:{'Accept':'application/json'}});
  const j = await r.json();
  if(!j.length) throw new Error("No results");
  const {lat,lon,display_name} = j[0];
  return {lat:parseFloat(lat), lon:parseFloat(lon), label:display_name};
}

async function fetchOTM(lat, lon, kinds, limit=8, radius=5000){
  const base = OTM_KEY
    ? `https://api.opentripmap.com/0.1/en/places/radius?apikey=${OTM_KEY}`
    : `https://api.opentripmap.com/0.1/en/places/radius?apikey=5ae2e3f221c38a28845f05b6112d1b2d`; // public demo key
  const url = `${base}&radius=${radius}&lon=${lon}&lat=${lat}&kinds=${encodeURIComponent(kinds)}&limit=${limit}&rate=2`;
  const r = await fetch(url);
  const j = await r.json();
  return (j.features||[]).map(f=>({
    id: f.properties.xid,
    name: f.properties.name || f.properties.kinds.split(",")[0],
    kinds: f.properties.kinds,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
  })).filter(x=>x.name && x.lat && x.lon);
}

async function getRealPlaces(dest, prefs){
  try{
    const g = await geocode(dest);
    // kinds ref: https://opentripmap.io/catalog
    const hotels = await fetchOTM(g.lat, g.lon, "accomodations,other_hotels,hostels", 6);
    const foodKinds = prefs.diet==="veg" ? "vegetarian,vegan,foods" : "restaurants,foods";
    const food = await fetchOTM(g.lat, g.lon, foodKinds, 6);
    const sightsKinds = prefs.style==="cultural" ? "museums,cultural,architecture" :
                        prefs.style==="religious" ? "religion,temples,churches,mosques" :
                        "interesting_places,monuments,parks";
    const sights = await fetchOTM(g.lat, g.lon, sightsKinds, 6);
    return {g, hotels, food, sights};
  }catch(e){
    // Fallback mock with links to general searches so demo always works
    return {
      g: {lat:0,lon:0,label:dest},
      hotels: [{name:`Top hotels in ${dest}`, lat:0, lon:0}],
      food: [{name:`Best restaurants in ${dest}`, lat:0, lon:0}],
      sights: [{name:`Things to do in ${dest}`, lat:0, lon:0}],
      fallback:true
    };
  }
}

/* ---------- Enhanced itinerary generator ---------- */
function mockGenerate({destination,start,end,budget,adults,kids,style,diet,origin}){
  const nights = daysBetween(new Date(start), new Date(end));
  const group = Number(adults)+Number(kids);
  const perDay = Math.max(50, Math.round(budget / Math.max(1,nights)));
  
  const base = [
    {type:"Lodging", name:`${destination} Inn`, cost: Math.round(perDay*0.5), time:"Check-in 15:00"},
    {type:"Food", name: diet==="kosher"?"Kosher Bistro": diet==="halal"?"Halal Grill": diet==="veg"?"Veggie Corner":"Local Eatery", cost: Math.round(perDay*0.25), time:"12:30"},
    {type:"Activity", name: style==="religious"?"Historic House of Worship": style==="cultural"?"City Museum":"River Walk",
     cost: Math.round(perDay*0.25), time:"10:00"}
  ];
  
  const days = Array.from({length: Math.min(3,nights||3)}, (_,i)=>({
    date: new Date(new Date(start||Date.now()).getTime()+ i*86400000).toISOString().slice(0,10),
    items: base.map((x,idx)=>({...x, id:`d${i}-i${idx}-${Math.random().toString(36).slice(2,6)}`, group }))
  }));
  
  return { destination, start, end, nights: nights||3, group, budget, perDay, style, diet, origin, days };
}

function render(state){
  const sums = {Lodging:0, Food:0, Activity:0};
  state.days.forEach(d=>d.items.forEach(it=>sums[it.type]+=it.cost));
  const total = sums.Lodging+sums.Food+sums.Activity;
  
  // Update budget summary
  totalsEl.innerHTML = `
    <h3>Budget Summary</h3>
    <div class="budget-breakdown">
      <div class="budget-item">
        <span>Accommodation:</span>
        <span>$${sums.Lodging}</span>
      </div>
      <div class="budget-item">
        <span>Food & Dining:</span>
        <span>$${sums.Food}</span>
      </div>
      <div class="budget-item">
        <span>Activities:</span>
        <span>$${sums.Activity}</span>
      </div>
      <div class="budget-item total">
        <span>Total Estimated:</span>
        <span>$${total}</span>
      </div>
      <div class="budget-item">
        <span>Your Budget:</span>
        <span>$${Number(state.budget).toLocaleString()}</span>
      </div>
      <div class="budget-item ${total <= state.budget ? 'budget-status-good' : total <= state.budget * 1.1 ? 'budget-status-warning' : 'budget-status-over'}">
        <span>Status:</span>
        <span>${total <= state.budget ? 'Within Budget ✅' : total <= state.budget * 1.1 ? 'Slightly Over ⚠️' : 'Over Budget ❌'}</span>
      </div>
    </div>
  `;

  // Update itinerary header
  document.getElementById('destination-display').textContent = state.destination;
  document.getElementById('trip-dates').textContent = 
    `${formatDate(state.start)} - ${formatDate(state.end)}`;
  document.getElementById('group-size').textContent = 
    `${state.group} traveler${state.group > 1 ? 's' : ''}`;
  
  const styleNames = {
    fun: '🎉 Fun & Adventure',
    cultural: '🏛️ Cultural & Historical',
    religious: '🕊️ Religious & Spiritual'
  };
  document.getElementById('trip-style-display').textContent = styleNames[state.style];

  // Generate itinerary content
  itineraryEl.innerHTML = state.days.map(d=>`
    <div class="day-section">
      <h3 class="day-title">Day ${d.date}</h3>
      <ul class="list">
        ${d.items.map(it=>`
          <li class="item" data-id="${esc(it.id)}">
            <div><strong>${esc(it.type)}</strong> — ${esc(it.name)} <small>(${esc(it.time)})</small> — $${esc(it.cost)}</div>
            <div class="controls">
              <button data-act="up" aria-label="Move up">↑</button>
              <button data-act="down" aria-label="Move down">↓</button>
              <button data-act="del" aria-label="Delete">Delete</button>
            </div>
          </li>
        `).join("")}
      </ul>
    </div>
  `).join("");

  // Add click handlers for itinerary controls
  itineraryEl.onclick = (e)=>{
    const btn = e.target.closest("button"); if(!btn) return;
    const li = e.target.closest(".item"); const id = li?.dataset.id; if(!id) return;
    const day = state.days.find(d=>d.items.some(x=>x.id===id));
    const idx = day.items.findIndex(x=>x.id===id);
    const act = btn.dataset.act;
    if(act==="del"){ day.items.splice(idx,1); }
    if(act==="up" && idx>0){ [day.items[idx-1], day.items[idx]] = [day.items[idx], day.items[idx-1]]; }
    if(act==="down" && idx<day.items.length-1){ [day.items[idx+1], day.items[idx]] = [day.items[idx], day.items[idx+1]]; }
    render(state);
    history.replaceState({}, "", "#" + encodeURIComponent(btoa(JSON.stringify(state))));
  };
}

/* ---------- Real places rendering ---------- */
function renderPlaces(sectionEl, list, dest){
  sectionEl.innerHTML = list.map(p=>{
    const mapUrl = gmapsPlace(p.name, p.lat, p.lon);
    const infoLinks = `
      <a href="${mapUrl}" target="_blank" rel="noopener">Google Maps</a>
      • <a href="${bookingSearch(dest)}" target="_blank" rel="noopener">Booking</a>
      • <a href="${yelpSearch(p.name, dest)}" target="_blank" rel="noopener">Yelp</a>
    `;
    return `<div class="cardlet">
      <strong>${esc(p.name)}</strong>
      <small class="muted">${esc((p.kinds||"").split(",").slice(0,3).join(", "))}</small>
      <div>${infoLinks}</div>
    </div>`;
  }).join("");
}

/* ---------- Tabs ---------- */
document.addEventListener("click",(e)=>{
  const t = e.target.closest(".tab"); if(!t) return;
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".tabpanel").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");
  document.getElementById(t.dataset.tab).classList.add("active");
});

/* ---------- Form handlers ---------- */
form.onsubmit = async (e)=>{
  e.preventDefault();
  console.log('Form submitted!'); // Debug log
  
  const fd = Object.fromEntries(new FormData(form).entries());
  console.log('Form data:', fd); // Debug log
  
  const state = mockGenerate(fd);
  console.log('Generated state:', state); // Debug log
  
  render(state);
  
  // Update directions link
  if(fd.origin) {
    directionsA.href = gmapsDir(fd.origin, fd.destination);
    directionsA.textContent = "🗺️ Get Directions";
  } else {
    directionsA.href = gmapsPlace(fd.destination, 0, 0);
    directionsA.textContent = "🗺️ View on Maps";
  }
  
  // Show itinerary section
  document.getElementById('input-section').classList.add('hidden');
  document.getElementById('itinerary-section').classList.remove('hidden');
  
  // Update URL with state
  history.replaceState({}, "", "#" + encodeURIComponent(btoa(JSON.stringify(state))));

  // Fetch real places near destination
  try {
    const {hotels, food, sights} = await getRealPlaces(fd.destination, {style:fd.style, diet:fd.diet});
    renderPlaces(hotelsEl, hotels, fd.destination);
    renderPlaces(foodEl, food, fd.destination);
    renderPlaces(sightsEl, sights, fd.destination);
    realResults.classList.remove('hidden');
  } catch(e) {
    console.log('Real places fetch failed, using fallback');
    realResults.classList.remove('hidden');
  }
  
  // Scroll to itinerary
  document.getElementById('itinerary-section').scrollIntoView({ behavior: 'smooth' });
};

// Event handlers are now set up in the initializeApp function

function setDefaultDates() {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000);

  document.getElementById('start-date').value = nextWeek.toISOString().split('T')[0];
  document.getElementById('end-date').value = endDate.toISOString().split('T')[0];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/* ---------- Hydrate from URL (share) ---------- */
(function boot(){
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  
  function initializeApp() {
    console.log('Initializing Destina app...'); // Debug log
    
    // Initialize DOM elements
    initElements();
    
    // Set default dates
    setDefaultDates();
    
    // Set up event listeners
    if (shareBtn) {
      shareBtn.onclick = ()=>{
        navigator.clipboard.writeText(location.href).then(()=>{ 
          shareBtn.textContent="✅ Copied!"; 
          setTimeout(()=>shareBtn.textContent="📋 Copy Link",1200); 
        }).catch(() => {
          alert('Unable to copy link. Please copy manually from the address bar.');
        });
      };
    }
    
    if (pdfBtn) {
      pdfBtn.onclick = ()=> window.print();
    }
    
    const newTripBtn = document.getElementById('new-trip-btn');
    if (newTripBtn) {
      newTripBtn.onclick = () => {
        document.getElementById('itinerary-section').classList.add('hidden');
        document.getElementById('input-section').classList.remove('hidden');
        document.getElementById('trip-form').reset();
        setDefaultDates();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
    
    // Handle URL state
    if(location.hash.length>2){
      try{
        const raw = decodeURIComponent(location.hash.slice(1));
        const state = JSON.parse(atob(raw));
        render(state);
        realResults.classList.add('hidden'); // require fresh fetch for real places
        
        if(state.origin) {
          directionsA.href = gmapsDir(state.origin, state.destination);
          directionsA.textContent = "🗺️ Get Directions";
        } else {
          directionsA.href = gmapsPlace(state.destination, 0, 0);
          directionsA.textContent = "🗺️ View on Maps";
        }
        
        // Show itinerary section
        document.getElementById('input-section').classList.add('hidden');
        document.getElementById('itinerary-section').classList.remove('hidden');
      }catch(e){
        console.log('Failed to parse URL state');
      }
    }
    
    console.log('Destina app initialized successfully!'); // Debug log
  }
})();

// Add print styles
const printStyles = `
@media print {
    body {
        background: white !important;
    }
    
    .card {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
    }
    
    .action-buttons, .btn-small, .controls {
        display: none !important;
    }
    
    header, footer {
        color: black !important;
    }
    
    .real-results {
        display: none !important;
    }
}
`;

// Inject print styles
const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);