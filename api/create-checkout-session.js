console.log("ENV CHECK");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("ANON EXISTS:", !!process.env.SUPABASE_ANON_KEY);
console.log("SERVICE ROLE EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    // 🔍 Log env vars SAFELY (inside handler)
    console.log("PRICE ID:", process.env.STRIPE_PRICE_ID);
    console.log("SECRET KEY EXISTS:", !!process.env.STRIPE_SECRET_KEY);
    console.log("SITE URL:", process.env.SITE_URL);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("Missing STRIPE_PRICE_ID");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // 🔐 Get bearer token
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    // 🔐 Verify user session
    const supabaseAuth = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data: userData, error: userErr } =
      await supabaseAuth.auth.getUser(token);

    if (userErr || !userData?.user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const user = userData.user;

    // 🔑 Admin client
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 👤 Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { supabase_user_id: user.id }
    });

    await supabaseAdmin
      .from("users")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user.id);

    // 💳 Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customer.id,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${process.env.SITE_URL}/?success=1`,
      cancel_url: `${process.env.SITE_URL}/?canceled=1`,
      client_reference_id: user.id
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("CHECKOUT ERROR:", err.message);
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
