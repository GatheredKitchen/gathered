// /api/customer-portal.js — Opens Stripe Customer Portal for managing/canceling subscription

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
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: "Missing customerId" });

    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET) return res.status(500).json({ error: "Stripe not configured" });

    const origin = req.headers.origin || "https://usegathered.app";

    const params = new URLSearchParams();
    params.append("customer", customerId);
    params.append("return_url", origin);

    const stripeRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      return res.status(stripeRes.status).json({
        error: session.error?.message || "Portal session failed",
      });
    }

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Portal error:", err);
    return res.status(500).json({ error: err.message || "Portal failed" });
  }
}
