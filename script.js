import { supabase } from "./supabaseClient.js";

/* =========================
   GLOBAL SETUP
========================= */

window.supabase = supabase;
console.log("Supabase attached");

const loginBtn = document.getElementById("google-login");
const payBtn = document.getElementById("pay-button");
const form = document.getElementById("tripForm");
const results = document.getElementById("results");
const itinerary = document.getElementById("itinerary");
const submitBtn = form.querySelector("button");

/* =========================
   AUTO-CALCULATE DAYS
========================= */

const arrivalInput = document.getElementById("arrivalDate");
const departureInput = document.getElementById("departureDate");
const daysInput = document.getElementById("days");

function updateDaysFromDates() {
  if (!arrivalInput.value || !departureInput.value) return;

  const arrival = new Date(arrivalInput.value);
  const departure = new Date(departureInput.value);

  if (departure > arrival) {
    const diffTime = departure - arrival;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysInput.value = diffDays;
  }
}

arrivalInput?.addEventListener("change", updateDaysFromDates);
departureInput?.addEventListener("change", updateDaysFromDates);

/* =========================
   GOOGLE LOGIN
========================= */

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });

    if (error) {
      console.error(error);
      alert("Google login failed");
    }
  });
}

/* =========================
   AUTH UI
========================= */

async function initAuthUI() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) showUser(session.user);
  updatePaymentUI();
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) showUser(session.user);
  updatePaymentUI();
});

function showUser(user) {
  const header = document.querySelector("header");
  if (loginBtn) loginBtn.style.display = "none";

  let info = document.getElementById("user-info");
  if (!info) {
    info = document.createElement("p");
    info.id = "user-info";
    header.appendChild(info);
  }

  info.textContent = `Signed in as ${user.email}`;
}

/* =========================
   PAYMENT UI
========================= */

async function updatePaymentUI() {
  if (!payBtn) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    payBtn.style.display = "none";
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("has_paid")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error(error);
    payBtn.style.display = "none";
    return;
  }

  payBtn.style.display = data.has_paid ? "none" : "inline-block";
}

/* =========================
   STRIPE CHECKOUT
========================= */

async function startCheckout() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("Please sign in first.");
    return;
  }

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(data);
    alert("Checkout failed");
    return;
  }

  window.location.href = data.url;
}

if (payBtn) payBtn.addEventListener("click", startCheckout);

/* =========================
   FORM SUBMIT (PAYWALL)
========================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* 1️⃣ Require login */
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("Please sign in with Google first.");
    return;
  }

  /* 2️⃣ Require payment */
  const { data, error } = await supabase
    .from("users")
    .select("has_paid")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error(error);
    alert("Unable to verify payment.");
    return;
  }

  if (!data.has_paid) {
    alert("Please pay to generate your itinerary.");
    payBtn.scrollIntoView({ behavior: "smooth" });
    return; // 🔒 HARD BLOCK
  }

  /* 3️⃣ PAID USERS ONLY */
  const destination = document.getElementById("destination").value.trim();
  const arrivalDate = document.getElementById("arrivalDate").value;
  const departureDate = document.getElementById("departureDate").value;
  const days = parseInt(document.getElementById("days").value);
  const budget = parseFloat(document.getElementById("budget").value);
  const season = document.getElementById("season").value;
  const style = document.getElementById("style").value;
  const dietary = document.getElementById("dietary").value;

  showItinerary(
    destination,
    days,
    budget,
    season,
    style,
    dietary
  );

  submitBtn.textContent = "Regenerate Itinerary 🔄";
});

/* =========================
   ITINERARY LOGIC
========================= */

function showItinerary(destination, days, budget, season, style, dietary) {
  results.classList.remove("hidden");
  itinerary.innerHTML = "";

  const perDay = budget / days;

  for (let i = 1; i <= days; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Day ${i}</h3>
      <p>Explore ${destination}</p>
      <p>Style: ${style}</p>
      <p>Season: ${season}</p>
      <p>Budget per day: $${perDay.toFixed(2)}</p>
    `;
    itinerary.appendChild(card);
  }
}

/* =========================
   INIT
========================= */

initAuthUI();
