// controllers/aiController.js
const Listing = require("../models/Listing");
const groqClient = require("../utils/groqClient");


// ==========================================
// 1) AI WORKER RECOMMENDATION
// ==========================================
exports.recommendWorkers = async (req, res) => {
  try {
    let { service, budget, topK = 3 } = req.body;

    // ⭐ Validate service string
    if (!service || typeof service !== "string" || service.trim() === "") {
      return res.status(400).json({
        ok: false,
        message: "Service must be a non-empty string"
      });
    }

    // ⭐ Ensure budget is a number
    budget = Number(budget) || 0;

    // ⭐ Step 1 — SAFE Mongo search
    const listings = await Listing.find({
      title: { $regex: service, $options: "i" },
    }).populate("owner");

    if (listings.length === 0) {
      return res.json({
        ok: true,
        results: [],
        message: "No workers found for this service",
      });
    }

    // ⭐ Step 2 — Score workers
    const scored = listings.map((item) => {
      let score = 0;

      score += (item.rating || 0) * 10;                      // rating score
      score += item.owner.experience                         // experience score
        ? parseInt(item.owner.experience) * 3
        : 0;

      const diff = Math.abs(item.price - budget);            // price score
      score += diff === 0 ? 20 : Math.max(0, 20 - diff / 10);

      return { listing: item, score };
    });

    // ⭐ Step 3 — Sort by score
    scored.sort((a, b) => b.score - a.score);

    // ⭐ Step 4 — Top K
    const topWorkers = scored.slice(0, topK);

    // ⭐ AI Prompt Summary
    const summary = topWorkers
      .map(
        (w, index) => `#${index + 1}
Name: ${w.listing.owner.name}
Service: ${w.listing.title}
Rating: ${w.listing.rating}
Experience: ${w.listing.owner.experience || "N/A"} years
Price: ${w.listing.price}
Score: ${w.score}
`
      )
      .join("\n");

    const prompt = `
You are an AI assistant helping customers find the best workers.
Here are the top candidates:

${summary}

Return ONLY valid JSON:
[
  {
    "rank": 1,
    "reason": "short reason",
    "confidence": "high/medium/low"
  }
]
`;

    // ⭐ Step 5 — Groq AI Call
    const aiResponse = await groqClient.post("/chat/completions", {
      model: process.env.GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    // ⭐ Safe JSON Parsing
    let reasoning = [];
    try {
      reasoning = JSON.parse(aiResponse.data.choices[0].message.content);
    } catch {
      reasoning = [{ rank: 1, reason: "AI explanation unavailable", confidence: "low" }];
    }

    // ⭐ Attach AI reasoning
    const finalResults = topWorkers.map((worker, i) => ({
      listing: worker.listing,
      score: worker.score,
      ai: reasoning[i] || {},
    }));

    return res.json({ ok: true, results: finalResults });

  } catch (err) {
    console.log("AI RECOMMEND ERROR:", err);
    return res.status(500).json({ message: "AI error" });
  }
};


// ==========================================
// 2) AI WORKER IMPROVEMENT ADVICE
// ==========================================
exports.workerAdvice = async (req, res) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: "listingId is required" });
    }

    const listing = await Listing.findById(listingId).populate("owner");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ⭐ Safe values (no empty strings)
    const workerName = listing.owner.name || "Unknown";
    const service = listing.title || "Service";
    const price = listing.price || 0;
    const rating = listing.rating || 0;
    const experience = listing.owner.experience || "0";
    const bio = listing.owner.bio || "No bio provided";
    const category = listing.category || "General";

    const prompt = `
You are an AI coach helping workers improve their service profile.

Worker Profile:
Name: ${workerName}
Service: ${service}
Price: ${price}
Rating: ${rating}
Experience: ${experience} years
Bio: ${bio}
Category: ${category}

Provide 5 practical improvement tips.
Return ONLY valid JSON:

{
  "tips": [
    "tip1",
    "tip2",
    "tip3",
    "tip4",
    "tip5"
  ]
}
`;

    const aiResponse = await groqClient.post("/chat/completions", {
      model: process.env.GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let tips = [];
    try {
      const parsed = JSON.parse(aiResponse.data.choices[0].message.content);
      tips = parsed.tips || ["AI output missing tips"];
    } catch (e) {
      tips = ["Could not parse AI output."];
    }

    return res.json({
      ok: true,
      advice: tips,
    });

  } catch (err) {
    console.log("AI ADVICE ERROR:", err);
    return res.status(500).json({ message: "AI error" });
  }
};

