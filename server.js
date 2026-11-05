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
    } else if (lower.includes('saint-pierre') || lower.includes('st-pierre') || lower.includes('pelée') || lower.includes('pelee') || lower.includes('volcano')) {
      reply = `**Saint-Pierre (Senpyè) & Mount Pelée (Montany Pèlé):** 🌋\nSaint-Pierre was known as the *"Little Paris of the Antilles"* before the catastrophic volcanic eruption of Mount Pelée on May 8, 1902.\n- **Ludger Sylbaris (Cyparis)** miraculously survived in his thick stone prison cell.\n- Creole idiom: *"Montany Pèlé ka dòmi mé i pa mò"* (Mount Pelée is sleeping, but she is not dead).\n- Today, Saint-Pierre is a UNESCO World Heritage site and cultural treasure of Martinique.`;
    } else if (lower.includes('diamant') || lower.includes('cap 110') || lower.includes('rocher')) {
      reply = `**Le Diamant (Djanman) & Memorial Cap 110:** 🗿\n- **Rocher du Diamant**: A majestic 175-meter volcanic basalt offshore rock, historic British naval stronghold (*HMS Diamond Rock*).\n- **Cap 110 Mémoire de l'Anse Caffard**: 15 solemn white triangular statues sculpted by Laurent Valère, facing the Atlantic toward the Gulf of Guinea to commemorate the tragic 1830 shipwreck of an illegal slave vessel.\n- Local motto: *"Doubout pou la viktwa"* (Standing tall for freedom).`;
    } else if (lower.includes('bélè') || lower.includes('bele') || lower.includes('sainte-marie') || lower.includes('drum')) {
      reply = `**Sainte-Marie & Traditional Martinican Bélè:** 🥁\nSainte-Marie is the sanctuary of **Bélè**, an authentic Afro-Caribbean art form blending ancestral percussion on the *tanbou bèlè*, the *ti-bwa* sticks, call-and-response chant (*lavwa*), and communal dance.\n- Masters like Ti-Émile and Félix Casérus preserved these polyrhythms.\n- Expression: *"Bélè sé nanm Matinik"* (Bélè is the soul of Martinique)!`;
    } else if (lower.includes('proverb') || lower.includes('pawòl') || lower.includes('quote')) {
      reply = `**Traditional Martinican Creole Proverbs (Pawòl Matinik):** 📜\n1. *"Zafè kabrit pa zafè mouton"* [zah-feh kah-breet pah zah-feh moo-tohn]\n   → Mind your own affairs.\n2. *"Sé kouto sèl ki sav sa ki an tchè jiromon"* [say koo-toh sehl kee sahv sah kee ahn tcheh zhee-roh-mohn]\n   → Only the knife knows what is inside the pumpkin's heart (Only you know your inner struggles).\n3. *"Dèyè mòn, toujou ni mòn"* [deh-yeh mohn, too-zhoo nee mohn]\n   → Beyond every mountain lies another mountain (Patience and resilience through life's trials).`;
    } else if (lower.includes('koudmen') || lower.includes('solidarity')) {
      reply = `**Koudmen (Coup de main):** 🤝\n*Koudmen* is the bedrock of rural Martinican social fabric! Neighbors unite without money to harvest cane, raise a traditional Creole wooden house (*kaz*), or repair a fishing boat (*yòl*), followed by singing, accordion, and a communal meal (*manjé kréyòl*). It symbolizes absolute solidarity.`;
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

