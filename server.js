import fs from 'fs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '6mb' }));
app.use(express.static(__dirname));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/vendor/firebase', express.static(path.join(__dirname, 'node_modules', 'firebase')));

// Lazy initialization of Gemini client
let aiClient = null;
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }
  return aiClient;
}

function withTimeout(promise, ms = 6000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini request timeout')), ms))
  ]);
}

const VALID_DECK_KEYS = [
  'greetings', 'family', 'home', 'food', 'market',
  'daily', 'music', 'history', 'verbs', 'adjectives',
  'numbers', 'time', 'colors', 'weather', 'animals',
  'nature', 'clothing', 'transport', 'proverbs', 'expressions'
];

// Agentic AI Tutor endpoint for Martinican Creole
app.post('/api/tutor', async (req, res) => {
  try {
    const {
      message,
      history = [],
      conversationHistory = [],
      currentLang = 'en',
      userContext = {}
    } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const recentHistory = Array.isArray(history) && history.length
      ? history
      : (Array.isArray(conversationHistory) ? conversationHistory : []);

    const ai = getAIClient();
    if (ai) {
      try {
        const langName = currentLang === 'fr'
          ? 'French'
          : currentLang === 'mq'
            ? 'Martinican Creole (with brief English/French clarifications)'
            : 'English';

        const learnerSummary = userContext && typeof userContext.xp === 'number'
          ? `Learner snapshot: ${userContext.xp} XP, ${userContext.collectionPoints || 0} Collection Points, Streak: ${userContext.streak || 1} day(s), Recordings saved: ${userContext.recordedCount || 0}.`
          : '';

        const systemInstruction = `You are "Man Mayotte", an expert, warm, and encouraging cultural ambassador and language tutor specializing strictly in authentic Martinican Creole (Kréyòl Matinik, GEREC orthography).
Key guidelines:
1. Preserve authentic Martinican Creole (Fort-de-France, Saint-Pierre, Sainte-Marie, and rural communes). Never mix Haitian Creole forms ("yon", "avèk" as sole preposition) — use Martinican "an", "épi / èk", "mwen", "manmay", "doudou", "ti bren", "m'ap kenbe", "ka / té / ké".
2. Respond primarily in ${langName}, keeping explanations concise, structured, and educational.
3. Always provide accurate GEREC Creole spelling, simple phonetic pronunciation in [brackets], and clear meanings.
4. Highlight Martinican oral heritage, bèlè, koudmen solidarity, or historical geography when helpful.
${learnerSummary}`;

        const prompt = `User query: "${message}"\n\nRecent conversation context: ${JSON.stringify(recentHistory.slice(-4))}`;

        const response = await withTimeout(ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: { systemInstruction }
        }), 6000);

        const replyText = response.text || "Mwen la pou édé'w! (I'm here to help you!) How can I assist with your Creole studies?";
        return res.json({ reply: replyText, source: 'gemini' });
      } catch (geminiErr) {
        console.warn('Gemini tutor error, using curated heritage tutor:', geminiErr.message);
      }
    }

    // Curated Martinican heritage fallback responses when GEMINI_API_KEY is not configured
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('bonjou') || lower.includes('hello') || lower.includes('greet') || lower.includes('bonjour')) {
      reply = `**Bonjou ! (Hello!)** \n\nIn Martinique, greetings carry warmth and communal respect:\n- **Bonjou** [bohn-zhoo]: Good morning / Hello (daytime)\n- **Bonswa** [bohn-swah]: Good evening\n- **Kouman ou yé ?** [koo-mahn oo yay]: How are you?\n- **M'ap kenbe !** [mahp kahn-bay]: I'm holding strong / Doing well!\n\n*Cultural note*: Entering a Martinican bakery or market, people always greet everyone aloud with *"Bonjou tout moun!"*`;
    } else if (lower.includes('kenbe') || lower.includes('meaning')) {
      reply = `**"M'ap kenbe"** literally translates to *"I am holding on"*, and idiomatically means *"I'm doing well / staying resilient"*. It captures the buoyant, proud spirit of Martinique.`;
    } else if (lower.includes('food') || lower.includes('manger') || lower.includes('colombo') || lower.includes('manje') || lower.includes('manjé')) {
      reply = `**Kwizin Kréyòl (Martinican Gastronomy):**\n- **Kolombo kabrit** [koh-lohm-boh kah-breet]: Spiced Martinican goat curry\n- **Féwòs zaboka** [fay-rohs zah-boh-kah]: Avocado mashed with salted codfish (**lanmori**), chili, and manioc flour\n- **Ti-nain lanmori** [tee-nehn lahn-moh-ree]: Steamed green bananas with salted codfish\n- **Kasav** [kah-sahv]: Traditional manioc flatbread\n\n*Try saying*: « Ban mwen an ti bren kolombo souplé ! »`;
    } else if (lower.includes('market') || lower.includes('maché') || lower.includes('marché') || lower.includes('dialogue')) {
      reply = `**At Gran Maché Fòdfrans (Fort-de-France Market):**\n- **Ou**: « Bonjou manmay ! Konben mango-a yé ? » (Hello friend! How much are the mangoes?)\n- **Machann**: « Bonjou doudou, sé dé éwo pou twa bèl mango. » (Hello darling, it's two euros for three nice mangoes.)\n- **Ou**: « Ban mwen an ti sak souplé ! Mèsi anpil ! » (Give me a small bag please! Thank you very much!)`;
    } else if (lower.includes('grammar') || lower.includes('verb') || lower.includes('ka') || lower.includes('té') || lower.includes('ké')) {
      reply = `**Martinican Creole Aspect Markers (Pa ni konjigezon!):**\nVerbs stay invariant; place particles directly before the verb:\n- **ka** = ongoing / habitual (*Mwen ka palé* — I am speaking)\n- **té** = past (*Mwen té palé* — I spoke)\n- **ké** = future (*Mwen ké palé* — I will speak)\n- **té ké** = conditional (*Mwen té ké palé* — I would speak)\n- **pa** = negation before particles (*Mwen pa ka konprann*)`;
    } else if (lower.includes('saint-pierre') || lower.includes('pelée') || lower.includes('pelee') || lower.includes('volcano')) {
      reply = `**Senpyè (Saint-Pierre) & Montany Pèlé:**\nBefore May 8, 1902, Saint-Pierre was the *Little Paris of the Antilles*. Prisoner **Ludger Sylbaris (Cyparis)** famously survived inside his thick stone cell (**Kacho Siparis**).\n- Creole proverb: « Montany Pèlé ka dòmi, mé i pa mò. »`;
    } else if (lower.includes('diamant') || lower.includes('cap 110') || lower.includes('rocher')) {
      reply = `**Djanman (Le Diamant) & Mémoryal Kap 110:**\nFacing 110° East toward the Gulf of Guinea at Anse Caffard, **Kap 110** features 15 monumental white sculptures by Laurent Valère honoring victims of the 1830 shipwreck.\n- Offshore rises the basalt **Wòch Djanman**. Expression: « Doubout pou libèté ! »`;
    } else if (lower.includes('bélè') || lower.includes('bèlè') || lower.includes('bele') || lower.includes('sainte-marie')) {
      reply = `**Sanmari (Sainte-Marie) & Bèlè Heritage:**\nSainte-Marie is the cradle of **Bèlè** — uniting the **tanbou bèlè** drum, **ti-bwa** wooden sticks, **lavwa** call-and-response vocals, and circle dances.\n- « Bèlè sé nanm Matinik ! » (Bèlè is the soul of Martinique!)`;
    } else if (lower.includes('proverb') || lower.includes('pawòl') || lower.includes('quote')) {
      reply = `**Traditional Martinican Proverbs (Pawòl Matinik):**\n- « Dèyè mòn, toujou ni mòn. » [deh-yeh mohn too-zhoo nee mohn] — Beyond every hill lies another hill (Perseverance).\n- « Sé kouto sèl ki sav sa ki an tchè jiromon. » — Only the knife knows what lies inside the pumpkin's heart.\n- « Tout bèt an lanmè ka manjé moun, mé sé réken ki ni mové non. » — Every creature in the sea nibbles, yet only the shark gets blamed.`;
    } else if (lower.includes('koudmen') || lower.includes('solidarity')) {
      reply = `**Koudmen (Collective Mutual Aid):**\nRooted in rural Martinican solidarity, neighbors come together without pay to raise a wooden house (**déplazé an kaz**), harvest yams, or clear land, accompanied by **tanbou bèlè** rhythms and shared Creole dishes.`;
    } else if (lower.includes('thank')) {
      reply = `**Saying Thank You in Martinican Creole:**\n- **Mèsi** [meh-see]: Thank you\n- **Mèsi anpil** [meh-see ahn-peel]: Thank you very much\n- **Mèsi doudou** [meh-see doo-doo]: Thank you, dear\n\n*Response*: « Pa ni pwoblèm! » (You're welcome / No problem!)`;
    } else {
      reply = `**Bonjou ! Mwen sé Man Mayotte.**\nAsk me anything about authentic **Kréyòl Matinik** (GEREC spelling):\n- Translate phrases into Martinican Creole\n- Learn aspect particles (**ka**, **té**, **ké**, **pa**)\n- Discover historical sites like **Kap 110**, **Kacho Siparis**, or **Chato Dibik**\n- Practice everyday dialogues for markets and coastal communes!`;
    }

    return res.json({ reply, source: 'fallback' });
  } catch (err) {
    console.error('Tutor API error:', err);
    return res.status(500).json({ error: 'Failed to generate tutor response' });
  }
});

// Agentic Cultural Study Coach endpoint (Adaptive Recommendations & Mini Challenge)
app.post('/api/agentic-coach', async (req, res) => {
  try {
    const { currentLang = 'en', stats = {} } = req.body || {};
    const xp = Number(stats.xp || 0);
    const collectionPoints = Number(stats.collectionPoints || 0);
    const rightCount = Number(stats.rightCount || 0);
    const almostCount = Number(stats.almostCount || 0);
    const wrongCount = Number(stats.wrongCount || 0);
    const recordedCount = Number(stats.recordedCount || 0);
    const visitedCommunes = Array.isArray(stats.visitedCommunes) ? stats.visitedCommunes : [];

    const ai = getAIClient();
    if (ai) {
      try {
        const langLabel = currentLang === 'fr' ? 'French' : currentLang === 'mq' ? 'Martinican Creole' : 'English';
        const coachPrompt = `You are an adaptive Martinican Creole (Kréyòl Matinik, GEREC orthography) heritage study coach.
Analyze this learner's telemetry and prescribe a personalized, culturally rooted next study step in ${langLabel}:
- XP: ${xp}
- Collection Points: ${collectionPoints}
- Answer accuracy telemetry: ${rightCount} Right, ${almostCount} Almost, ${wrongCount} Wrong
- Voice recordings recorded by learner: ${recordedCount}
- Map locations explored: ${visitedCommunes.join(', ') || 'none yet'}
- Allowed recommendedDeck values: ${VALID_DECK_KEYS.join(', ')}
- Allowed recommendedModule values: module1, module2, module3

Return strictly valid JSON with an encouragement, a specific focusArea, a recommendedDeck, a recommendedModule, a rich culturalInsight (mentioning an authentic Martinican landmark, custom, or GEREC nuance), and an interactive 4-option miniChallenge in Martinican Creole.`;

        const response = await withTimeout(ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: coachPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                encouragement: { type: Type.STRING },
                focusArea: { type: Type.STRING },
                recommendedDeck: { type: Type.STRING },
                recommendedModule: { type: Type.STRING },
                culturalInsight: { type: Type.STRING },
                miniChallenge: {
                  type: Type.OBJECT,
                  properties: {
                    creole: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['creole', 'phonetic', 'prompt', 'answer', 'options']
                }
              },
              required: ['encouragement', 'focusArea', 'recommendedDeck', 'recommendedModule', 'culturalInsight', 'miniChallenge']
            }
          }
        }), 6000);

        const parsed = JSON.parse(response.text);
        if (!VALID_DECK_KEYS.includes(parsed.recommendedDeck)) {
          parsed.recommendedDeck = 'greetings';
        }
        return res.json({ coach: parsed, source: 'gemini' });
      } catch (coachErr) {
        console.warn('Gemini coach error, using adaptive rule engine:', coachErr.message);
      }
    }

    // Deterministic adaptive study prescription fallback
    let recommendedDeck = 'greetings';
    let recommendedModule = 'module1';
    let focusArea = 'Everyday Polite Greetings & Oral Rhythm';
    let culturalInsight = 'In Sainte-Marie and Fort-de-France alike, greeting elders first shows deep respect ("respè"). Try recording your own voice side-by-side with the audio playback!';
    let miniChallenge = {
      creole: "Kouman ou yé jòdi-a?",
      phonetic: "[koo-mahn oo yay zhoh-dee-ah]",
      prompt: currentLang === 'fr'
        ? "Que veut dire « Kouman ou yé jòdi-a ? » en français ?"
        : currentLang === 'mq'
          ? "Ki sans « Kouman ou yé jòdi-a ? » ni ?"
          : "What does « Kouman ou yé jòdi-a? » mean?",
      answer: currentLang === 'fr' ? "Comment vas-tu aujourd'hui ?" : "How are you doing today?",
      options: currentLang === 'fr'
        ? ["Comment vas-tu aujourd'hui ?", "Où habites-tu maintenant ?", "À demain matin !", "Merci beaucoup mon ami"]
        : ["How are you doing today?", "Where do you live now?", "See you tomorrow morning!", "Thank you very much my friend"]
    };

    if (wrongCount > rightCount && (rightCount + wrongCount) > 0) {
      recommendedDeck = 'verbs';
      recommendedModule = 'module1';
      focusArea = currentLang === 'fr' ? 'Consolidation des verbes & particules (ka / té)' : 'Core Verb Markers (ka / té / ké) Review';
      culturalInsight = 'Martinican Creole verbs never conjugate by endings — mastering "ka" (ongoing), "té" (past), and "ké" (future) unlocks hundreds of sentences instantly.';
      miniChallenge = {
        creole: "Mwen ka palé Kréyòl Matinik",
        phonetic: "[mwehn kah pah-lay kray-ohl mah-tee-neek]",
        prompt: currentLang === 'fr'
          ? "Quelle particule indique une action en cours ?"
          : "Which particle signals an ongoing present action?",
        answer: "ka",
        options: ["ka", "té", "ké", "an"]
      };
    } else if (recordedCount < 2) {
      recommendedDeck = 'expressions';
      recommendedModule = 'module2';
      focusArea = currentLang === 'fr' ? 'Pratique orale & Auto-enregistrement' : 'Oral Pronunciation & Voice Self-Check';
      culturalInsight = 'Kréyòl is an oral treasury first! Record yourself saying "Doudou" or "Koudmen" locally to compare your cadence against Martinican rhythm.';
      miniChallenge = {
        creole: "Nou ansanm pou fè an koudmen!",
        phonetic: "[noo ahn-sahnm poo feh ahn kood-mehn]",
        prompt: currentLang === 'fr'
          ? "Que désigne un « koudmen » dans les mornes martiniquais ?"
          : "What does « an koudmen » mean in rural Martinique?",
        answer: currentLang === 'fr' ? "Une entraide collective solidaire" : "Collective neighborly mutual aid",
        options: currentLang === 'fr'
          ? ["Une entraide collective solidaire", "Un tambour traditionnel du nord", "Un fruit tropical sucré", "Une barque de pêcheurs"]
          : ["Collective neighborly mutual aid", "A traditional northern drum", "A sweet tropical fruit", "A fisherman's canoe"]
      };
    } else if (visitedCommunes.length < 3) {
      recommendedDeck = 'history';
      recommendedModule = 'module3';
      focusArea = currentLang === 'fr' ? 'Patrimoine des communes & lieux historiques' : 'Cultural Geography & Hidden Heritage Sites';
      culturalInsight = 'Explore Cap 110 in Le Diamant, the Cachot de Cyparis in Saint-Pierre, and Château Dubuc on the Caravelle peninsula on the interactive OSM map.';
      miniChallenge = {
        creole: "Dèyè mòn, toujou ni mòn",
        phonetic: "[deh-yeh mohn too-zhoo nee mohn]",
        prompt: currentLang === 'fr'
          ? "Que signifie ce proverbe célèbre de Martinique ?"
          : "What wisdom does this classic Martinican proverb express?",
        answer: currentLang === 'fr' ? "La persévérance face aux épreuves" : "Perseverance beyond every obstacle",
        options: currentLang === 'fr'
          ? ["La persévérance face aux épreuves", "Il faut cuisiner le soir", "La mer est toujours calme", "Ne jamais voyager seul"]
          : ["Perseverance beyond every obstacle", "Always cook dinner at dusk", "The ocean is always calm", "Never travel by boat"]
      };
    } else if (xp >= 100) {
      recommendedDeck = 'proverbs';
      recommendedModule = 'module3';
      focusArea = currentLang === 'fr' ? 'Pawòl Matinik & Proverbes créoles' : 'Pawòl Matinik — Heritage Proverbs';
      culturalInsight = 'Your steady practice is paying off! Traditional proverbs (pawòl) preserve centuries of oral philosophy from the mornes and coastal villages.';
      miniChallenge = {
        creole: "Sé kouto sèl ki sav sa ki an tchè jiromon",
        phonetic: "[say koo-toh sehl kee sahv sah kee ahn tcheh zhee-roh-mohn]",
        prompt: currentLang === 'fr'
          ? "Que veut dire ce proverbe créole ?"
          : "What is the deeper meaning of this proverb?",
        answer: currentLang === 'fr' ? "Seul l'intéressé connaît ses vrais sentiments" : "Only you truly know what is inside your heart",
        options: currentLang === 'fr'
          ? ["Seul l'intéressé connaît ses vrais sentiments", "Il faut aiguiser son couteau chaque jour", "Les giraumons poussent en saison sèche", "Tout le monde aime la soupe au marché"]
          : ["Only you truly know what is inside your heart", "Always sharpen your kitchen knife", "Pumpkins only grow in dry season", "Everyone loves market soup"]
      };
    }

    const encouragement = currentLang === 'fr'
      ? `Bèl travay ! Avec ${xp} XP et ${collectionPoints} Points de Collection, vous faites vivre le Kréyòl Matinik.`
      : currentLang === 'mq'
        ? `Fòs épi kouraj ! Épi ${xp} XP épi ${collectionPoints} Pwen Kòlèksyon, ou ka fè Kréyòl Matinik vivan !`
        : `Great momentum! With ${xp} XP and ${collectionPoints} Collection Points, you are actively keeping Kréyòl Matinik alive.`;

    return res.json({
      coach: {
        encouragement,
        focusArea,
        recommendedDeck,
        recommendedModule,
        culturalInsight,
        miniChallenge
      },
      source: 'adaptive'
    });
  } catch (err) {
    console.error('Agentic Coach API error:', err);
    return res.status(500).json({ error: 'Failed to generate coach recommendation' });
  }
});

// Safe local file/image upload endpoint for Admin Console (avoids >1MB Firestore limits)
app.post('/api/upload', (req, res) => {
  try {
    const { filename, dataUrl } = req.body || {};
    if (!filename || typeof filename !== 'string' || !dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'filename and dataUrl are required' });
    }
    const match = dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid base64 dataUrl' });
    }
    const mime = match[1];
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'text/plain', 'audio/mpeg', 'audio/wav', 'audio/webm'
    ];
    if (!allowedMimes.includes(mime)) {
      return res.status(400).json({ error: `Unsupported file type: ${mime}` });
    }
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'File exceeds 4MB upload limit' });
    }
    const cleanBase = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const savedName = `${Date.now()}_${cleanBase}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, savedName), buffer);
    return res.json({
      url: `/uploads/${savedName}`,
      name: cleanBase,
      mime,
      size: buffer.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to store uploaded file' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
