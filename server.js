import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Lazy initialization of Gemini client
let aiClient = null;
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Agentic AI Tutor endpoint for Martinican Creole
app.post('/api/tutor', async (req, res) => {
  try {
    const { message, history = [], currentLang = 'en' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();
    if (ai) {
      try {
        const systemInstruction = `You are "Asistan Kréyòl", an expert, warm, and engaging AI language tutor and cultural ambassador specializing in authentic Martinican Creole (Kréyòl Matinik, GEREC orthography).
Key guidelines:
1. Focus strictly on Martinican Creole (from Fort-de-France, Saint-Pierre, and rural communes), NOT Haitian Creole or Guadeloupean variants. Note distinct Martinican aspects (e.g., "m'ap kenbe", "sa k'ap fèt", "ti bren", "anlè", "bay").
2. Answer the user's question clearly in the language they used or prefer (${currentLang === 'fr' ? 'French' : currentLang === 'mq' ? 'Martinican Creole' : 'English'}).
3. Always include accurate Martinican Creole spelling, phonetics in brackets (e.g., [bohn-zhoo]), and clear English/French translations.
4. Provide cultural context, folklore insights, or practical everyday usage tips when relevant.
5. Keep responses structured with clear formatting, bold terms, and bullet points.`;

        const prompt = `User query: "${message}"\n\nRecent context: ${JSON.stringify(history.slice(-3))}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction
          }
        });

        const replyText = response.text || "Mwen la pou édé'w! (I'm here to help you!) How can I assist with your Creole studies?";
        return res.json({ reply: replyText, source: 'gemini' });
      } catch (geminiErr) {
        console.warn('Gemini generateContent error, using fallback:', geminiErr.message);
      }
    }

    // Curated fallback responses when GEMINI_API_KEY is not configured
    const lower = message.toLowerCase();
    let reply = "";

    if (lower.includes('bonjou') || lower.includes('hello') || lower.includes('greet') || lower.includes('bonjour')) {
      reply = `**Bonjou! (Hello!)** 👋\n\nIn Martinique, greetings are respectful and warm:\n- **Bonjou** [bohn-zhoo]: Good morning / Hello (used throughout daytime)\n- **Bonswa** [bohn-swah]: Good evening\n- **Kouman ou yé?** [koo-mahn oo yay]: How are you?\n- **M'ap kenbe!** [mahp kahn-bay]: I'm doing well / Hanging in there!\n\n*Cultural tip*: In Martinique, it's customary to greet everyone individually when entering a shop or room!`;
    } else if (lower.includes('kenbe') || lower.includes('meaning')) {
      reply = `**"M'ap kenbe"** literally translates to *"I am holding on"*, but idiomatically means *"I am doing well / staying strong"*. It reflects the resilient, upbeat Caribbean spirit of Martinique!`;
    } else if (lower.includes('food') || lower.includes('manger') || lower.includes('colombo') || lower.includes('manje')) {
      reply = `**Kouzin Kréyòl (Martinican Cuisine):** 🍛\n- **Colombo kabrit**: Traditional curried goat with local spices\n- **Féroce d'avocat**: Avocado mashed with salted codfish (lanmori) and manioc flour\n- **Ti-punch**: White agricultural rum, cane syrup, and a squeeze of lime\n- **Kassav**: Cassava flatbread stuffed with coconut or guava jam\n\nTo order at the market: *"Ban mwen an ti bren colombo souplé"* (Give me a little colombo please).`;
    } else if (lower.includes('market') || lower.includes('maché') || lower.includes('marché') || lower.includes('dialogue')) {
      reply = `**Dialogue at Grand Marché de Fort-de-France:** 🧺\n- **Ou**: *"Bonjou manmay! Konben sa yé?"* (Hello friend! How much is this?)\n- **Machann**: *"Bonjou doudou, sé de éwo pou twa mango."* (Hello dear, it's 2 euros for three mangoes.)\n- **Ou**: *"Ban mwen de kilo souplé!"* (Give me two kilos please!)\n- **Machann**: *"Mèsi anpil, pasé an bon jounen!"* (Thank you very much, have a nice day!)`;
    } else if (lower.includes('grammar') || lower.includes('verb') || lower.includes('ka') || lower.includes('té') || lower.includes('ké')) {
      reply = `**Key Martinican Verb Aspect Markers:** ✍️\nCreole verbs don't conjugate with endings like French; they use pre-verbal markers:\n- **ka** = Progressive / present continuous (*Mwen ka pale* = I am speaking)\n- **té** = Past (*Mwen té pale* = I spoke)\n- **té ka** = Past continuous (*Mwen té ka pale* = I was speaking)\n- **ké** = Future (*Mwen ké pale* = I will speak)`;
    } else {
      reply = `**Bonjou! Mwen sé Asistan Kréyòl.** 🌋\nI am your interactive Martinican Creole tutor! Here is how you can practice with me:\n- Ask for translations: *"How do I say 'See you tomorrow' in Martinican Creole?"* -> **A dèmen!**\n- Explore vocabulary: Ask about food, family, animals, or nature.\n- Learn grammar: Ask how **ka**, **té**, and **ké** work.\n- Test your knowledge with custom phrases!`;
    }

    return res.json({ reply, source: 'fallback' });
  } catch (err) {
    console.error('Tutor API error:', err);
    return res.status(500).json({ error: 'Failed to generate tutor response' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

