import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '20mb' }));

  // Initialize Gemini client if API key is provided
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }

  // API endpoint for AI-assisted Kekkai OCR Screenshot Recognition
  app.post('/api/ocr-kekkai', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/png' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API is not configured on server (GEMINI_API_KEY missing). Use client-side CV mode.',
          fallback: true
        });
      }

      const prompt = `You are a Ninja Sage / Ninja Saga Kekkai Training board recognizer.
Analyze this game screenshot containing Kekkai runes.
There are 6 possible rune types, distinguishable by their border color and inner emblem:
1. "green" - Green border, pale green center with a 3-blade swirl / tomoe symbol
2. "red" - Red border, pale pink center with a spiral shell / magatama coil symbol
3. "blue" - Blue border, pale cyan center with two mountain peaks symbol
4. "black" - Black border, dark center with a white/silver lightning bolt symbol
5. "yellow" - Yellow/gold border, warm cream center with a flame / fire symbol
6. "white" - Silver/white border, white center with a wavy musical rest / vertical ribbon symbol

Look for the active guess row or the latest row of runes placed in the puzzle slots (typically 3 or 5 runes horizontally).
Also check if there is score feedback visible next to it (e.g., number of Green circles / correct position, and Yellow circles / wrong position).

Respond strictly with valid JSON with this exact structure:
{
  "detectedRunes": ["green", "red", "blue", "black", "yellow"],
  "feedback": {
    "green": 0,
    "yellow": 0
  },
  "confidence": 0.95,
  "notes": "Brief explanation of what was detected"
}
If feedback is not visible on screen, set green: 0, yellow: 0.
Valid values for detectedRunes elements are strictly: "green", "red", "blue", "black", "yellow", "white".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                  mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      let parsed = null;
      try {
        parsed = JSON.parse(text || '{}');
      } catch {
        parsed = { error: 'Failed to parse AI output', raw: text };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('OCR Error:', err);
      return res.status(500).json({
        error: err.message || 'Error processing OCR',
        fallback: true,
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: Date.now()
    });
  });

  // Setup Vite in development or serve static in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
