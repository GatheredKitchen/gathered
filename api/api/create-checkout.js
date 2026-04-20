// /api/create-checkout.js — Creates a Stripe Checkout session for upgrading to Pro

export const config = {
  maxDuration: 20,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, userEmail } = req.body;
    if (!userId || !userEmail) {
      return res.status(400).json({ error: "Missing userId or userEmail" });
    }

    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    const PRICE_ID = process.env.STRIPE_PRICE_ID;

    if (!STRIPE_SECRET || !PRICE_ID) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const origin = req.headers.origin || "https://usegathered.app";

    // Create Stripe Checkout session via REST API
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price]", PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("customer_email", userEmail);
    params.append("client_reference_id", userId);
    params.append("success_url", `${origin}/?upgraded=true`);
    params.append("cancel_url", `${origin}/?upgrade_canceled=true`);
    params.append("metadata[user_id]", userId);
    params.append("subscription_data[metadata][user_id]", userId);
    params.append("allow_promotion_codes", "true");
    params.append("billing_address_collection", "auto");

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", session);
      return res.status(stripeRes.status).json({
        error: session.error?.message || "Stripe checkout failed",
      });
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
