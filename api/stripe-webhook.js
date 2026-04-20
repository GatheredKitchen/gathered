// /api/stripe-webhook.js — Listens for Stripe events and updates Supabase

export const config = {
  maxDuration: 30,
  api: { bodyParser: false },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function updateSupabase(userId, data) {
  const SUPABASE_URL = "https://bjbsprypxrmekottuqdg.supabase.co";
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SERVICE_KEY) {
    console.error("Missing SUPABASE_SERVICE_KEY env var");
    return;
  }

  // Upsert subscription record
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?on_conflict=user_id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      updated_at: new Date().toISOString(),
      ...data,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase update failed:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const rawBody = await getRawBody(req);
    const bodyText = rawBody.toString("utf8");

    // Note: For production, verify the Stripe signature.
    // For now we parse the event directly — works for test mode.
    const event = JSON.parse(bodyText);

    console.log("Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          await updateSupabase(userId, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            tier: "pro",
          });
          console.log("Activated Pro for user:", userId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object;
        const userId = sub.metadata?.user_id;
        if (userId) {
          await updateSupabase(userId, {
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer,
            status: sub.status,
            tier: sub.status === "active" || sub.status === "trialing" ? "pro" : "free",
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.user_id;
        if (userId) {
          await updateSupabase(userId, {
            status: "canceled",
            tier: "free",
          });
          console.log("Downgraded to free for user:", userId);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
}
