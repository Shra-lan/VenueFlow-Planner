import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Retrieve the API key from Vercel Environment Variables
    const apiKey = process.env.CUSTOM_GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ 
        error: "Gemini API key is missing. Please add CUSTOM_GEMINI_KEY to your Vercel Environment Variables." 
      });
    }

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the VenueFlow Smart Guide, an AI assistant for Wembley Stadium.
You help attendees find their way around, answer questions about facilities, and provide event information.
Be concise, friendly, and helpful. Keep responses under 3 sentences when possible.
If asked about gate wait times, mention that they can check the live wait times on the Recommended Path panel.`;

    const formattedHistory = history ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) : [];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.status(200).json({ response: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const errorMessage = error.message || "Failed to generate response";
    res.status(500).json({ error: errorMessage });
  }
}
