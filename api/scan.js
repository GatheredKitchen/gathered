export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { images } = req.body;

    if (!images || !images.length) {
      return res.status(400).json({ error: "No images provided" });
    }

    const ANTHROPIC_KEY = process.env.VITE_ANTHROPIC_KEY;

    if (!ANTHROPIC_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // Build image blocks for each uploaded image
    const imageBlocks = images.map(({ b64, mime }) => ({
      type: "image",
      source: { type: "base64", media_type: mime, data: b64 },
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              ...imageBlocks,
              {
                type: "text",
                text: `These ${images.length} image(s) may show different parts of the same recipe (e.g. ingredients on one page, instructions on another). Extract and combine all information into one complete recipe. If images appear to be different unrelated recipes, use only the first one. Be generous in your interpretation — even if the image is slightly blurry or cropped, extract what you can. Return ONLY raw JSON, no markdown fences:\n{"title":"","category":"Breakfast|Lunch|Dinner|Dessert|Snacks|Drinks|Sides","tags":[],"servings":4,"prepTime":"","cookTime":"","image":"🍽️","ingredients":[],"instructions":[],"notes":""}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `Anthropic API error ${response.status}`,
      });
    }

    const data = await response.json();
    const text =
      data.content?.find((b) => b.type === "text")?.text || "{}";
    const recipe = JSON.parse(text.replace(/```json|```/g, "").trim());

    return res.status(200).json({ recipe });
  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({
      error: err.message || "Something went wrong. Please try again.",
    });
  }
}
