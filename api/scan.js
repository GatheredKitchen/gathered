export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

    if (!ANTHROPIC_KEY) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    const { images } = req.body;

    if (!images || !images.length) {
      return res.status(400).json({ error: "No images provided" });
    }

    const imageBlocks = images.map(({ b64, mime }) => ({
      type: "image",
      source: { type: "base64", media_type: mime, data: b64 },
    }));

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              ...imageBlocks,
              {
                type: "text",
                text: `These ${images.length} image(s) may show different parts of the same recipe. Extract and combine all information into one complete recipe. Be generous — even if slightly blurry or cropped, extract what you can. Return ONLY raw JSON, no markdown:\n{"title":"","category":"Breakfast|Lunch|Dinner|Dessert|Snacks|Drinks|Sides","tags":[],"servings":4,"prepTime":"","cookTime":"","image":"🍽️","ingredients":[],"instructions":[],"notes":""}`,
              },
            ],
          },
        ],
      }),
    });

    const responseText = await anthropicRes.text();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({
        error: `Anthropic error ${anthropicRes.status}: ${responseText}`,
      });
    }

    const data = JSON.parse(responseText);
    const text = data.content?.find((b) => b.type === "text")?.text || "{}";
    const recipe = JSON.parse(text.replace(/```json|```/g, "").trim());

    return res.status(200).json({ recipe });

  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({
      error: err.message || "Something went wrong.",
    });
  }
}
