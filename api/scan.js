export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
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

    const prompt = `You are reading ${images.length} image(s) of a recipe. The recipe may be:
- A handwritten recipe card (possibly rotated, faded, or with stains)
- A cookbook page
- A screenshot from a phone or website
- A typed printout

YOUR JOB: Read EXACTLY what is written on the image(s). Do NOT invent, substitute, or "fill in" anything that isn't actually visible. If the card is rotated, mentally rotate it and read it correctly.

CRITICAL RULES:
1. Copy ingredients EXACTLY as written — including unusual measurements like "1-18oz jar" or "5 Tbl" or "1 whole bag"
2. Preserve the cook's personal notes like "I use chocolate chip m&m's" — these go in the notes field or as part of the relevant ingredient
3. If an ingredient measurement is unclear, write what you see with "(unclear)" — do NOT guess
4. If you genuinely cannot read the recipe at all (image is too blurry, dark, or not actually a recipe), return exactly this: {"error":"unreadable"}
5. Preserve the recipe's actual title — do not make up a new one
6. Include baking temperature and time in the notes if mentioned
7. If multiple images are provided, combine them ONLY if they are clearly the same recipe. If they appear to be different recipes, use only the first one.

Return ONLY raw JSON, no markdown fences, no commentary. Format:
{
  "title": "exact title from the recipe",
  "category": "Breakfast|Lunch|Dinner|Dessert|Snacks|Drinks|Sides",
  "tags": ["relevant","tags"],
  "servings": 8,
  "prepTime": "X min",
  "cookTime": "X min",
  "image": "🍪",
  "ingredients": ["exact ingredient 1 as written", "exact ingredient 2 as written"],
  "instructions": ["step 1 exactly as written", "step 2 exactly as written"],
  "notes": "any personal notes, temperature, or special instructions from the card"
}`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              ...imageBlocks,
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const responseText = await anthropicRes.text();

    if (!anthropicRes.ok) {
      console.error("Anthropic API error:", responseText);
      return res.status(anthropicRes.status).json({
        error: `Scanning service error ${anthropicRes.status}`,
      });
    }

    const data = JSON.parse(responseText);
    const text = data.content?.find((b) => b.type === "text")?.text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();

    let recipe;
    try {
      recipe = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw text:", text);
      return res.status(422).json({
        error: "Couldn't read the recipe from that image. Try a clearer, well-lit photo with the recipe card facing up.",
      });
    }

    // Check if AI returned an error marker
    if (recipe.error === "unreadable") {
      return res.status(422).json({
        error: "Couldn't read the recipe clearly. Try better lighting, rotate the card so text is upright, or take multiple close-up photos.",
      });
    }

    // Validate we got something real
    if (!recipe.title || !recipe.ingredients || recipe.ingredients.length === 0) {
      return res.status(422).json({
        error: "No recipe details found. Make sure the full recipe card is visible in the photo.",
      });
    }

    return res.status(200).json({ recipe });

  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({
      error: err.message || "Something went wrong. Please try again.",
    });
  }
}
