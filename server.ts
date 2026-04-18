import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import chatHandler from "./api/chat.ts";
import recommendationsHandler from "./api/recommendations.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes - Piping to our modular Vercel handlers for local testing
  app.post("/api/chat", async (req, res) => {
    // @ts-ignore - Safely routing express req/res to Vercel signature locally
    await chatHandler(req, res);
  });

  app.get("/api/recommendations", async (req, res) => {
    // @ts-ignore - Safely routing express req/res to Vercel signature locally
    await recommendationsHandler(req, res);
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
