import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const stand = req.query.stand as string;
    
    const apiKey = process.env.CUSTOM_GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ error: "Gemini API key is missing" });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are a real-time smart stadium AI for Wembley Stadium.
Generate exactly 4 customized, hyper-realistic, nearby venue amenities (Food, Restroom, Merch, Drinks) relative to the "${stand}" stand.
Return ONLY a valid JSON array of objects with these keys:
- type: (Must be exactly one of: "Droplets", "Utensils", "Coffee", "ShoppingBag")
- title: (Short compelling name, e.g. "Grill 105")
- desc: (Location description, e.g. "Level 1, ${stand} Concourse")
- wait: (Realistic wait time, e.g. "5 min wait" or "No wait")`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    });

    let jsonStr = "";
    try {
      jsonStr = response.text || "";
    } catch(e) {
      jsonStr = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    const parsedJSON = JSON.parse(jsonStr);
    res.json(parsedJSON);

  } catch (error: any) {
    console.error("Error in /api/recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
