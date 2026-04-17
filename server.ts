import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.CUSTOM_GEMINI_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ 
          error: "Gemini API key is missing or invalid. Please check the Secrets panel in AI Studio settings." 
        });
      }

      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the VenueFlow Smart Guide, an AI assistant for Wembley Stadium.
You help attendees find their way around, answer questions about facilities, and provide event information.
You have access to Google Search! If users ask about real-time weather, traffic, today's schedule, or news outside of your system knowledge, feel free to give them live answers.
Be concise, friendly, and helpful. Keep responses under 3 sentences when possible.
If asked about gate wait times, mention that they can check the live wait times on the Recommended Path panel.`;

      // Strictly clean and alternate the history
      const cleanedHistory: any[] = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          const role = msg.role === 'user' ? 'user' : 'model';
          const text = msg.text ? String(msg.text).trim() : "";
          if (!text) continue; // Skip empty messages entirely

          if (cleanedHistory.length === 0) {
            if (role === 'user') {
              cleanedHistory.push({ role, parts: [{ text }] });
            }
          } else {
            if (cleanedHistory[cleanedHistory.length - 1].role !== role) {
              cleanedHistory.push({ role, parts: [{ text }] });
            } else {
              cleanedHistory[cleanedHistory.length - 1].parts[0].text += "\n" + text;
            }
          }
        }
      }

      const msgText = message.trim() || " ";
      if (cleanedHistory.length > 0 && cleanedHistory[cleanedHistory.length - 1].role === 'user') {
        cleanedHistory[cleanedHistory.length - 1].parts[0].text += "\n" + msgText;
      } else {
        cleanedHistory.push({ role: 'user', parts: [{ text: msgText }] });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: cleanedHistory,
        tools: [
          { googleSearch: {} }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      let reply = "";
      try {
        reply = response.text || "";
      } catch(e) {
        reply = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
      
      if (!reply) {
        reply = "I'm sorry, I couldn't access that live information right now.";
      }

      res.json({ response: reply });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      const errorMessage = error.message || "Failed to generate response";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
