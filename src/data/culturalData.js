// Guided Learning Path Milestones, Martinican Culinary Art, Expanded Cultural Heritage,
// Live Weather Climatology & 116-Photo Island Archive (Local Assets + Zero External Failures)

export const ASSET_IMAGES = {
  heroVeranda: './src/assets/images/hero_heritage_story_1795118200648.jpg',
  learningVeranda: './src/assets/images/learning_path_veranda_1795183599209.jpg',
  fortDeFrance: './src/assets/images/martinique_fort_de_france_1795111105144.jpg',
  saintPierre: './src/assets/images/martinique_saint_pierre_pelee_1795111105506.jpg',
  leDiamant: './src/assets/images/martinique_le_diamant_rock_1795111106354.jpg',
  sainteAnne: './src/assets/images/martinique_sainte_anne_salines_1795111106566.jpg',
  leFrancois: './src/assets/images/martinique_le_francois_yoles_1795111107434.jpg',
  rainforest: './src/assets/images/martinique_northern_rainforest_1795111107328.jpg',
  cap110: './src/assets/images/cap_110_memorial_1795183599176.jpg',
  grandRiviere: './src/assets/images/grand_riviere_cliffs_1795183598643.jpg',
  colomboFeast: './src/assets/images/culinary_colombo_feast_1795183598683.jpg',
  tropicalMarket: './src/assets/images/culinary_tropical_market_1795183598823.jpg',
  weatherBay: './src/assets/images/weather_tropical_bay_1795183599193.jpg',
  fcGreetings: './src/assets/images/flashcard_greetings_scene_1795116463426.jpg',
  fcMarket: './src/assets/images/flashcard_market_cuisine_1795116463413.jpg',
  fcMusic: './src/assets/images/flashcard_music_bele_1795116463374.jpg',
  fcNature: './src/assets/images/flashcard_nature_pelee_1795116463051.jpg',
  dictionaryBanner: './src/assets/images/dictionary_heritage_banner_1795116464309.jpg'
};

// =========================================================
// 1. GUIDED LEARNING PATH MILESTONES (PROGRESSIVE UNLOCKING)
// =========================================================
export const LEARNING_PATH_MILESTONES = [
  {
    id: 'path-1',
    step: 1,
    icon: 'fa-seedling',
    creoleTitle: 'Étap 1 · Premié Pa',
    title: 'Warm Greetings, Family & Counting',
    summary: 'Open every door in Martinique with respectful "Bonjou tout moun!", honor elders ("Granmoun"), and count from 1 to 10.',
    grammarFocus: 'In Kréyòl Matinik, place possessives right after the noun: "fanmi mwen" (my family), "manman ou" (your mother).',
    requiredMilestoneId: null,
    linkedModuleId: 'module1',
    unlocksDecks: ['greetings', 'family', 'numbers'],
    vocabPreview: [
      { id: 'lp-bonjou', word: 'Bonjou tout moun!', pronounce: '[bohn-zhoo toot moon]', en: 'Good morning everyone!', ex: 'Bonjou manman, kouman ou yé?' },
      { id: 'lp-kenbe', word: "M'ap kenbe rèd!", pronounce: '[mahp kahn-bay rehd]', en: "I'm holding strong!", ex: "M'ap kenbe rèd épi tjè kontan." },
      { id: 'lp-twa', word: 'Youn, dé, twa', pronounce: '[yoon, day, twah]', en: 'One, two, three', ex: 'Ban mwen twa bèl mango.' }
    ],
    rewardXp: 25,
    rewardPts: 15,
    image: ASSET_IMAGES.learningVeranda
  },
  {
    id: 'path-2',
    step: 2,
    icon: 'fa-house-chimney',
    creoleTitle: 'Étap 2 · Lakay & Koulè',
    title: 'Creole Home, Time & Island Colors',
    summary: 'Step onto the wooden porch ("galri"), explore the biodiverse "jaden kréyòl", and paint sentences with island colors.',
    grammarFocus: 'Definite articles attach AFTER nouns: "kaz-la" (the house), "jaden-an" (the garden, after nasal sounds).',
    requiredMilestoneId: 'path-1',
    linkedModuleId: null,
    unlocksDecks: ['home', 'colors', 'time'],
    vocabPreview: [
      { id: 'lp-galri', word: 'Anlè galri-a', pronounce: '[ahn-leh gahl-ree-ah]', en: 'On the veranda / porch', ex: 'Nou ka bwè kafé anlè galri-a.' },
      { id: 'lp-jodi', word: 'Jòdi-a & Dèmen', pronounce: '[zhoh-dee-ah]', en: 'Today & Tomorrow', ex: 'Jòdi-a fè bèl tan an Matinik.' },
      { id: 'lp-wouj', word: 'Flè wouj vif', pronounce: '[fleh woozh veef]', en: 'Bright red flower', ex: 'Flè balizyé-a wouj toubannman.' }
    ],
    rewardXp: 30,
    rewardPts: 20,
    image: ASSET_IMAGES.heroVeranda
  },
  {
    id: 'path-3',
    step: 3,
    icon: 'fa-utensils',
    creoleTitle: 'Étap 3 · Maché & Kwizin',
    title: 'Fort-de-France Market & Culinary Art',
    summary: 'Shop confidently with vendors ("Konben sa yé?"), order Kolombo & Akra, and weave culinary vocabulary into daily life.',
    grammarFocus: 'Use "Ban mwen an ti bren..." (Give me a little bit of...) and finish politely with "souplé" (please).',
    requiredMilestoneId: 'path-2',
    linkedModuleId: null,
    unlocksDecks: ['market', 'food', 'daily'],
    vocabPreview: [
      { id: 'lp-konben', word: 'Konben mango-a yé?', pronounce: '[kohn-behn]', en: 'How much are the mangoes?', ex: 'Bonjou machann! Konben sa yé?' },
      { id: 'lp-chwit', word: 'Chwit toubannman!', pronounce: '[shweet too-bahn-mahn]', en: 'Utterly delicious!', ex: 'Kolombo-tala chwit toubannman!' },
      { id: 'lp-bren', word: 'An ti bren piman', pronounce: '[ahn tee brehn]', en: 'Just a touch of chili', ex: 'Ban mwen an ti bren piman souplé.' }
    ],
    rewardXp: 35,
    rewardPts: 25,
    image: ASSET_IMAGES.colomboFeast
  },
  {
    id: 'path-4',
    step: 4,
    icon: 'fa-cloud-sun',
    creoleTitle: 'Étap 4 · Mouvman & Tan-an',
    title: 'Action Verbs, Weather & Adjectives',
    summary: 'Unlock over 500 verbs with just three particles (ka / té / ké) and read tropical Caribbean weather forecasts in Creole.',
    grammarFocus: 'Creole verbs never conjugate: "ka" = ongoing now, "té" = past, "ké" = future ("Lapli ké tonbé" = Rain will fall).',
    requiredMilestoneId: 'path-3',
    linkedModuleId: 'module2',
    unlocksDecks: ['verbs', 'weather', 'adjectives'],
    vocabPreview: [
      { id: 'lp-ka', word: 'Mwen ka palé Kréyòl', pronounce: '[mwehn kah pah-lay]', en: 'I speak / am speaking Creole', ex: 'Nou ka aprann Kréyòl ansanm!' },
      { id: 'lp-lapli', word: 'Ti grin lapli', pronounce: '[tee grehn lah-plee]', en: 'Quick warm rain shower', ex: 'Ti grin lapli ka pasé anlè mòn-lan.' },
      { id: 'lp-alize', word: 'Alizé-a dous', pronounce: '[ah-lee-zay-ah doos]', en: 'The trade wind is gentle', ex: 'Van lanmè-a ka fréchi kaz-la.' }
    ],
    rewardXp: 40,
    rewardPts: 25,
    image: ASSET_IMAGES.weatherBay
  },
  {
    id: 'path-5',
    step: 5,
    icon: 'fa-drum',
    creoleTitle: 'Étap 5 · Bèlè & Lanati',
    title: 'Tanbou Bèlè, Rainforest & Madras Dress',
    summary: 'Step into Sainte-Marie’s Bèlè drum circle, name Martinique’s rainforest peaks and hummingbirds, and decode Madras headwraps.',
    grammarFocus: 'Compound nouns link cleanly without "of": "pyé-mango" (mango tree), "tèt-maré madras" (madras headwrap).',
    requiredMilestoneId: 'path-4',
    linkedModuleId: null,
    unlocksDecks: ['music', 'nature', 'animals', 'clothing'],
    vocabPreview: [
      { id: 'lp-bele', word: 'Tanbou bèlè & ti-bwa', pronounce: '[tahn-boo beh-leh]', en: 'Bèlè drum & rhythm sticks', ex: 'Tout moun ka chanté an lawonn.' },
      { id: 'lp-kolibri', word: 'Ti kolibri-a', pronounce: '[tee koh-lee-bree]', en: 'The hummingbird (fou-fou)', ex: 'Kolibri-a ka bwè flè ibiskis.' },
      { id: 'lp-madras', word: 'Tèt maré kat pwent', pronounce: '[teht mah-ray]', en: 'Four-pointed madras headwrap', ex: 'Tèt-maré madras-la ni kat pwent!' }
    ],
    rewardXp: 45,
    rewardPts: 30,
    image: ASSET_IMAGES.fcMusic
  },
  {
    id: 'path-6',
    step: 6,
    icon: 'fa-crown',
    creoleTitle: 'Étap 6 · Mémwa & Pawòl',
    title: 'History, Yoles & Ancestral Proverbs',
    summary: 'Master UNESCO Tour des Yoles vocabulary, May 22 Maroon heritage, and timeless Martinican "pawòl" wisdom proverbs.',
    grammarFocus: '"Sé ... ki ..." highlights emphasis: "Sé kouto sèl ki sav..." (It is ONLY the knife that knows...).',
    requiredMilestoneId: 'path-5',
    linkedModuleId: 'module3',
    unlocksDecks: ['history', 'transport', 'proverbs', 'expressions'],
    vocabPreview: [
      { id: 'lp-yol', word: 'Yòl bwa dréssé', pronounce: '[yohl bwah dray-say]', en: 'Racing yole with balance poles', ex: 'Yòl-la ka glisé anlè vag-la!' },
      { id: 'lp-mon', word: 'Dèyè mòn, toujou ni mòn', pronounce: '[deh-yeh mohn]', en: 'Beyond every hill lies another hill', ex: 'Pa dékourajé: dèyè mòn, toujou ni mòn!' },
      { id: 'lp-plis', word: 'Plis fòs manmay!', pronounce: '[plees fohs]', en: 'More strength friends!', ex: 'Plis fòs pou tout zélèv-la!' }
    ],
    rewardXp: 60,
    rewardPts: 40,
    image: ASSET_IMAGES.cap110
  }
];

// =========================================================
// 2. MARTINICAN CULINARY ART (KWIZIN MATINIK)
// =========================================================
export const CULINARY_HERITAGE = [
  {
    id: 'kolombo',
    name: 'Kolombo Kabrit / Poul',
    phonetic: '[koh-lohm-boh kah-breet]',
    category: 'Sunday Feast · Indo-Martinican Heritage',
    spokenPhrase: 'Kolombo kabrit-tala chwit toubannman!',
    image: ASSET_IMAGES.colomboFeast,
    origin: 'Born in 19th-century Martinique when Tamil and South Indian indentured artisans shared roasted spice craft — named in tribute to Colombo, Sri Lanka.',
    ingredients: [
      { cr: 'Poud kolombo', meaning: 'Roasted coriander, turmeric, cumin, fenugreek & mustard seed blend' },
      { cr: 'Grèn bwadenn', meaning: 'Allspice / Bois d’Inde fragrant leaves' },
      { cr: 'Ziyon & Laye', meaning: 'Local scallions, thyme, parsley & crushed garlic' },
      { cr: 'Piman véjétaryen', meaning: 'Sweet-scented chili for aroma without burning heat' }
    ],
    preparation: 'Simmered gently in an earthen Trois-Îlets clay kannari pot with green plantains, aubergine, and a squeeze of green lime at the finish.'
  },
  {
    id: 'fewos',
    name: 'Féwòs Zaboka',
    phonetic: '[fay-rohs zah-boh-kah]',
    category: 'Artisan Starter · Spicy Heritage Dish',
    spokenPhrase: 'Féwòs zaboka épi farin manyòk!',
    image: ASSET_IMAGES.tropicalMarket,
    origin: 'Called "Féroce d’avocat" (fierce avocado) for its bold kick of habanero balanced by buttery mountain avocados and crisp roasted manioc.',
    ingredients: [
      { cr: 'Zaboka mi', meaning: 'Creamy ripe Martinican highland avocado' },
      { cr: 'Lanmori désalé', meaning: 'Desalted, grilled and finely shredded codfish' },
      { cr: 'Farin manyòk', meaning: 'Toasted coarse cassava flour for velvety body' },
      { cr: 'Piman fò & sitron', meaning: 'Fresh chili, shallots, lime juice & garlic' }
    ],
    preparation: 'Hand-mashed with wooden pestle ("pilon") until marbled emerald, served beside chilled grapefruit wedges or crisp cassava rounds.'
  },
  {
    id: 'akra',
    name: 'Akra Lanmori',
    phonetic: '[ah-krah lahn-moh-ree]',
    category: 'Celebration Bite · West African Root',
    spokenPhrase: 'Annou manjé ti akra cho!',
    image: ASSET_IMAGES.fcMarket,
    origin: 'Shares direct phonetic and culinary lineage with West African Yoruba "àkàrà" black-eyed pea fritters, adapted with salted cod and island aromatics.',
    ingredients: [
      { cr: 'Lanmori fwè', meaning: 'Finely flaked codfish poached and whipped' },
      { cr: 'Ziyon & Pèsi', meaning: 'Crisp Martinican bunching onions & flat parsley' },
      { cr: 'Malanga (vegetarian option)', meaning: 'Grated malanga root for Lenten "akra malanga"' }
    ],
    preparation: 'Whipped into a light airy batter and spooned into hot oil until golden-crisp outside and pillow-soft inside.'
  },
  {
    id: 'tinain',
    name: 'Ti-Nain Lanmori',
    phonetic: '[tee-nehn lahn-moh-ree]',
    category: 'National Morning Classic',
    spokenPhrase: 'Ti-nain lanmori maten-an!',
    image: ASSET_IMAGES.colomboFeast,
    origin: 'Beloved Sunday breakfast and fishermen’s morning staple across coastal communes from Le Carbet to Le Vauclin.',
    ingredients: [
      { cr: 'Ti-nain vèt', meaning: 'Small tender green bananas boiled salted' },
      { cr: 'Chiktay lanmori', meaning: 'Cod sautéed with tomatoes, oil, lime, scallion & chili' },
      { cr: 'Konkonm & Zaboka', meaning: 'Sliced island cucumber & fresh avocado' }
    ],
    preparation: 'Boil unripe green bananas lightly until tender, peel warm, and bathe generously in tangy olive oil codfish chiktay sauce.'
  },
  {
    id: 'matoutou',
    name: 'Matoutou Krab',
    phonetic: '[mah-too-too krahb]',
    category: 'Easter Beach Tradition · Pak Matinik',
    spokenPhrase: 'Bon Pak épi matoutou krab anlè plaj-la!',
    image: ASSET_IMAGES.leDiamant,
    origin: 'Signature dish of Martinique’s joyful Easter ("Pak") beach camps, where families cook over wood fires beside Le Diamant, Sainte-Anne, and Trinité.',
    ingredients: [
      { cr: 'Krab latè', meaning: 'Fattened white land crabs purged cleanly on coconut & green mango' },
      { cr: 'Poud kolombo & Rès', meaning: 'Cinnamon-clove-colombo aromatic simmered rice' },
      { cr: 'Sitron vèt', meaning: 'Tangy green limes brightened over flame' }
    ],
    preparation: 'Slowly stewed crab absorbed into spiced yellow rice right inside coastal family iron marmites.'
  },
  {
    id: 'kasav',
    name: 'Kasav Koko & Manyòk',
    phonetic: '[kah-sahv koh-koh]',
    category: 'Kalinago Living Tradition · Gluten-Free',
    spokenPhrase: 'Kasav koko cho ka soti anlè platin!',
    image: ASSET_IMAGES.tropicalMarket,
    origin: 'Preserved unbroken for over 1,500 years from Martinique’s ancestral Kalinago communities who cultivated bitter cassava across the island.',
    ingredients: [
      { cr: 'Manyòk rapé', meaning: 'Freshly grated and cloth-pressed white manioc pulp' },
      { cr: 'Koko grajé', meaning: 'Sweet shredded coconut & warm cinnamon (sweet version)' },
      { cr: 'Konfiti gwayav / moru', meaning: 'Filled either with guava jam or savory cod chiktay' }
    ],
    preparation: 'Sifted dry onto a smoking cast-iron plate ("platin") and pressed gently into a crisp fragrant disc.'
  },
  {
    id: 'boudin',
    name: 'Boudin Kréyòl',
    phonetic: '[boo-dehn kray-ohl]',
    category: 'Market & Holiday Craft',
    spokenPhrase: 'Boudin nwè, boudin blan épi boudin lanbi!',
    image: ASSET_IMAGES.fcMarket,
    origin: 'Every Christmas ("Chanté Nwèl") and weekend market morning revolves around fresh spiced Creole boudin sausages.',
    ingredients: [
      { cr: 'Kat-épis', meaning: 'Allspice, nutmeg, clove & black peppercorn warmth' },
      { cr: 'Pen rasi & Lèt', meaning: 'Soaked bread crumb base binding spices & herbs' },
      { cr: 'Lanbi / Pwason (Blanc)', meaning: 'Seaside conch or snapper variations alongside classic noir' }
    ],
    preparation: 'Gently poached never boiled, bursting with savory thyme and parsley beside crispy mini buns.'
  },
  {
    id: 'sobe',
    name: 'Sòbè Koko Péyi',
    phonetic: '[soh-beh koh-koh]',
    category: 'Beach & Afternoon Treat',
    spokenPhrase: 'Ban mwen an bon ti sòbè koko souplé!',
    image: ASSET_IMAGES.sainteAnne,
    origin: 'Hand-churned in wooden barrel ice buckets lined with rock salt on beaches from Les Salines to Le Carbet.',
    ingredients: [
      { cr: 'Lèt koko', meaning: 'Rich pressed coconut milk & vanilla bean' },
      { cr: 'Kannèl & Miskad', meaning: 'Freshly grated nutmeg, cinnamon bark & green lime zest' },
      { cr: 'Siklòn glas & Sèl', meaning: 'Rock salt & crushed ice hand-turned by artisan' }
    ],
    preparation: 'Churned steadily for 35 minutes by hand in a copper-lined wooden sorbetière until silky smooth.'
  }
];

// =========================================================
// 3. EXPANDED CULTURAL HERITAGE FEATURES
// =========================================================
export const CULTURAL_TRADITIONS_EXPANDED = [
  {
    id: 'bele-sanmari',
    icon: 'fa-drum',
    title: 'Bèlè & Danmyé Circle',
    creoleSubtitle: 'Sanmari · Tanbou, Ti-bwa & Lavwa',
    spokenPhrase: 'Bèlè sé nanm épi lèspri Matinik!',
    summary: 'Born in northern hills like Sainte-Marie, Bèlè fuses polyrhythmic cask-drum improvisation ("tanbouyé"), crisp bamboo sticks ("ti-bwa"), call-and-response chorus ("lavwa"), and proud grounded choreography. Danmyé adds graceful martial-dance footwork inside the ring.',
    heritageLink: 'Maison du Bèlè · Sainte-Marie'
  },
  {
    id: 'yoles-unesco',
    icon: 'fa-sailboat',
    title: 'Tour des Yoles Rondes (UNESCO)',
    creoleSubtitle: 'Bwa Dréssé · Craftsmanship Without Keel',
    spokenPhrase: 'Manmay-la doubout anlè bwa dréssé!',
    summary: 'Inscribed on UNESCO’s Intangible Cultural Heritage list in 2020, Martinique’s curved wooden yole blends Kalinago gum-tree canoe geometry with Breton yawls. Steered with a single stern paddle and no keel, up to 14 agile sailors hike out horizontally on "bwa dréssé" poles across surging swells.',
    heritageLink: 'Le François · Le Robert · All 34 Communes'
  },
  {
    id: 'madras-code',
    icon: 'fa-ribbon',
    title: 'Madras & The Four-Point Code',
    creoleSubtitle: 'Tèt Maré Kat Pwent · Heritage Textile',
    spokenPhrase: 'Tèt-maré madras-la ni kat pwent!',
    summary: 'Introduced through 19th-century maritime trade with Madras (Chennai), golden-and-crimson plaid textiles became a radiant badge of Creole dignity. Tradition uses knotted points ("pwent") playfully: 1 = heart free, 2 = taken, 3 = married, 4 = heart still open to kindness.',
    heritageLink: 'Museum of Traditional Attire · Fort-de-France'
  },
  {
    id: 'kannaval-vaval',
    icon: 'fa-masks-theater',
    title: 'Kannaval Matinik & Vaval',
    creoleSubtitle: 'Dimanch Gra · Lendi Mariyaj · Mèkrédi Sann',
    spokenPhrase: 'Adiyé Vaval, lannen pwochen nou ké wè!',
    summary: 'Five days of vibrant civic theater leading up to Ash Wednesday: playful "Mariyaj Blesé" Monday weddings, crimson "Djab Wouj" Tuesday processions, and twilight black-and-white Ash Wednesday when the satirical king effigy Vaval is joyfully burned on Fort-de-France’s waterfront.',
    heritageLink: 'Baie de Fort-de-France · Savane'
  },
  {
    id: 'krik-krak',
    icon: 'fa-moon',
    title: 'Krik? Krak! Oral Storytelling',
    creoleSubtitle: 'Konpè Lapen & Konpè Zanba',
    spokenPhrase: 'Yé krik! — Yé krak! Mwen ka kouté!',
    summary: 'Whenever evening falls ("lè brinn"), Martinican storytellers awaken ancestral folktales by shouting "Yé Krik!"—requiring the audience to roar back "Yé Krak!" before clever Konpè Lapen (Rabbit) outwits blustering Konpè Tig and Manikou.',
    heritageLink: 'Archives Territoriales · Oral Heritage'
  },
  {
    id: 'rimed-razye',
    icon: 'fa-leaf',
    title: 'Jaden Kréyòl & Rimèd Razyé',
    creoleSubtitle: 'Sitrounèl · Atoumo · Bwa Bandé',
    spokenPhrase: 'Ti dité sitrounèl ka fè tjè-w dous!',
    summary: 'Every traditional Creole cottage keeps a medicinal botanical garden ("rimèd razyé") weaving Arawak/Kalinago and African pharmacopeia: lemongrass ("sitrounèl") for sleep, fragrant atoumo (shell ginger) leaves for colds, and bwadenn allspice.',
    heritageLink: 'Jardin de Balata & Rural Communes'
  }
];

// =========================================================
// 4. MARTINIQUE WEATHER STATIONS & SEASONAL CLIMATOLOGY
// =========================================================
export const WEATHER_STATIONS = [
  {
    id: 'fdf',
    name: 'Fort-de-France Bay',
    creoleName: 'Fòdfrans · Littoral Centre',
    lat: 14.6037,
    lng: -61.0742,
    fallbackTemp: 29,
    fallbackWind: 19,
    fallbackHumidity: 74,
    fallbackCode: 2,
    microclimate: 'Warm bay sunshine tempered by crisp ocean breezes across the Savane waterfront.'
  },
  {
    id: 'pelee',
    name: 'Mount Pelée & Morne-Rouge',
    creoleName: 'Mònwouj · Highlands (450m)',
    lat: 14.7764,
    lng: -61.1356,
    fallbackTemp: 23,
    fallbackWind: 22,
    fallbackHumidity: 86,
    fallbackCode: 61,
    microclimate: 'Cool emerald mountain mists, tree-fern dew, and refreshing volcanic rain showers.'
  },
  {
    id: 'atlantic',
    name: 'Le François & Fonds Blancs',
    creoleName: 'O Franswa · Kòt Alizé',
    lat: 14.6156,
    lng: -60.9033,
    fallbackTemp: 28,
    fallbackWind: 26,
    fallbackHumidity: 72,
    fallbackCode: 1,
    microclimate: 'Fresh eastern Atlantic "alizé" trade winds ideal for traditional sailing yoles.'
  },
  {
    id: 'south',
    name: 'Sainte-Anne & Salines',
    creoleName: 'Sentann · Extrême Sud',
    lat: 14.4361,
    lng: -60.8806,
    fallbackTemp: 30,
    fallbackWind: 21,
    fallbackHumidity: 69,
    fallbackCode: 0,
    microclimate: 'Bright sunniest tip of the island guarding white sand beaches and salt lagoons.'
  }
];

export function translateWmoToCreole(code) {
  const n = Number(code);
  if (n === 0) return { creole: 'Bèl solèy klè', en: 'Clear sunny sky', fr: 'Grand soleil', icon: 'fa-sun', tone: '#d97706' };
  if (n <= 2) return { creole: 'Ti nyaj épi solèy', en: 'Partly cloudy & bright', fr: 'Éclaircies et soleil', icon: 'fa-cloud-sun', tone: '#0284c7' };
  if (n === 3) return { creole: 'Syèl-la kouvè an ti bren', en: 'Overcast clouds', fr: 'Ciel nuageux', icon: 'fa-cloud', tone: '#64748b' };
  if (n >= 45 && n <= 48) return { creole: 'Brouya anlè mòn-lan', en: 'Mountain mist', fr: 'Brume matinale', icon: 'fa-smog', tone: '#64748b' };
  if (n >= 51 && n <= 67) return { creole: 'Ti grin lapli ka pasé', en: 'Tropical rain shower', fr: 'Grain de pluie tropical', icon: 'fa-cloud-rain', tone: '#0369a1' };
  if (n >= 80 && n <= 82) return { creole: 'Gwo grin lapli & bèl solèy apré', en: 'Passing tropical burst', fr: 'Averse passagère', icon: 'fa-cloud-showers-heavy', tone: '#1d4ed8' };
  if (n >= 95) return { creole: 'Loraj anlè lanmè-a', en: 'Tropical thunderstorm', fr: 'Orage tropical', icon: 'fa-bolt', tone: '#7c3aed' };
  return { creole: 'Alizé dous & bèl tan', en: 'Gentle trade winds', fr: 'Alizés doux', icon: 'fa-wind', tone: '#047857' };
}

export const MARTINIQUE_SEASONS = [
  {
    id: 'karem',
    creole: 'Lè Karèm (Dry Season)',
    months: 'December – May',
    details: 'Crisp blue skies, dry warm sunshine (27–30°C), low humidity, calm Caribbean coves, and ideal hiking on Mount Pelée & Caravelle.'
  },
  {
    id: 'livenaj',
    creole: 'Lè Livènaj (Green & Rain Season)',
    months: 'June – November',
    details: 'Lush emerald hillsides, sweet summer fruits (Julie mangoes, maracuja, avocados), dramatic quick showers ("ti grin lapli"), and double rainbows.'
  }
];

export const CREOLE_WEATHER_PHRASES = [
  { id: 'wp-1', creole: 'Jòdi-a fè bèl tan toubannman!', phonetic: '[zhoh-dee-ah feh behl tahn]', en: 'Today the weather is utterly gorgeous!', fr: "Aujourd'hui il fait un temps magnifique !" },
  { id: 'wp-2', creole: 'Ti grin lapli ka tonbé anlè Mònwouj.', phonetic: '[tee grehn lah-plee kah tohn-bay]', en: 'A light tropical shower is falling over Morne-Rouge.', fr: 'Une petite averse tombe sur Morne-Rouge.' },
  { id: 'wp-3', creole: 'Alizé-a ka souflé dous anlè plaj-la.', phonetic: '[ah-lee-zay-ah kah soo-flay doos]', en: 'The trade wind blows gently across the beach.', fr: "L'alizé souffle doucement sur la plage." },
  { id: 'wp-4', creole: 'Solèy-la cho, bwè bon ti dlo koko!', phonetic: '[soh-leye-lah shoh]', en: 'The sun is hot—drink fresh coconut water!', fr: 'Le soleil tape fort, bois une bonne eau de coco !' }
];

// =========================================================
// 5. FULL 116-PICTURE ARCHIVE ACROSS MARTINIQUE & SUBJECTS
// (All photos use verified local assets with curated framing)
// =========================================================
const CROP_PRESETS = [
  '50% 50%',
  '25% 35%',
  '75% 35%',
  '35% 70%',
  '70% 70%',
  '50% 22%'
];

const EXTRA_COMMUNE_PHOTOS = [
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.fortDeFrance, title: 'Baie des Flamands Waterfront', caption: 'Vibrant wooden balconies lining Fort-de-France bay.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.tropicalMarket, title: 'Grand Marché Spice Basket', caption: 'Cinnamon sticks, bois d’Inde, cloves, and fresh vanilla.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.heroVeranda, title: 'Schœlcher Veranda Sunlight', caption: 'Creole shutters welcoming trade winds over town rooftops.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.weatherBay, title: 'Rainbow Across Fort-de-France Bay', caption: 'Sudden tropical mist brightening over the capital piers.', crop: CROP_PRESETS[3] },
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.dictionaryBanner, title: 'GEREC Archives Reading Desk', caption: 'Manuscript volumes and oral grammar notebooks in the capital.', crop: CROP_PRESETS[4] },

  { cat: 'communes', locId: 'saint-pierre', src: ASSET_IMAGES.saintPierre, title: 'Saint-Pierre Theatre Ruins', caption: 'Volcanic basalt arches framing the brooding cone of Mount Pelée.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'saint-pierre', src: ASSET_IMAGES.saintPierre, title: 'Carbet-to-Saint-Pierre Bay Curve', caption: 'Sun-dappled northern harbor once called Little Paris of the Antilles.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'saint-pierre', src: ASSET_IMAGES.grandRiviere, title: 'North Caribbean Black Sand Shore', caption: 'Glistening volcanic grains meeting azure Caribbean surf.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'saint-pierre', src: ASSET_IMAGES.rainforest, title: 'Pelee Highland Cloud Stream', caption: 'Crystal snow-cold spring streams pouring down volcanic ravines.', crop: CROP_PRESETS[3] },
  { cat: 'communes', locId: 'saint-pierre', src: ASSET_IMAGES.fcNature, title: 'Mount Pelée Dawn Light', caption: 'Pink first light warming high crater ridges above Saint-Pierre.', crop: CROP_PRESETS[5] },

  { cat: 'communes', locId: 'le-diamant', src: ASSET_IMAGES.leDiamant, title: 'Rocher du Diamant at Dusk', caption: '175-meter volcanic monolith glowing amber across southern waters.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'le-diamant', src: ASSET_IMAGES.leDiamant, title: 'Three-Kilometer Diamond Promenade', caption: 'Leaning seagrape and coconut palms above golden breakers.', crop: CROP_PRESETS[3] },
  { cat: 'communes', locId: 'le-diamant', src: ASSET_IMAGES.cap110, title: 'Anse Caffard Cliff Overlook', caption: 'Monumental white statues above the southern headland.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'le-diamant', src: ASSET_IMAGES.weatherBay, title: 'Southern Trade Breeze Surf', caption: 'Crisp blue swells rolling across the St. Lucia channel.', crop: CROP_PRESETS[2] },

  { cat: 'communes', locId: 'sainte-marie', src: ASSET_IMAGES.fcMusic, title: 'Maison du Bèlè Drum Ring', caption: 'Stepping inside Sainte-Marie’s beating cultural pulse.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'sainte-marie', src: ASSET_IMAGES.rainforest, title: 'Lush Cane & Cacao Valleys', caption: 'Verdant northern hills rising behind Sainte-Marie town.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'sainte-marie', src: ASSET_IMAGES.leFrancois, title: 'Windward Tombolo Currents', caption: 'Atlantic swells parting seasonal coastal sands.', crop: CROP_PRESETS[4] },
  { cat: 'communes', locId: 'sainte-marie', src: ASSET_IMAGES.learningVeranda, title: 'Bèlè Storytelling Porch', caption: 'Generations singing call-and-response lavwa together.', crop: CROP_PRESETS[1] },

  { cat: 'communes', locId: 'le-francois', src: ASSET_IMAGES.leFrancois, title: 'Yoles Rondes Canvas Sails', caption: 'Bright red, yellow & emerald sails catching Atlantic gusts.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'le-francois', src: ASSET_IMAGES.leFrancois, title: 'Bwa Dréssé Crew Balance', caption: 'Crews hiking out in rhythmic harmony above shallow coral.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'le-francois', src: ASSET_IMAGES.sainteAnne, title: 'Fonds Blancs Sandbar Lagoon', caption: 'Waist-deep crystalline Atlantic waters off Le François.', crop: CROP_PRESETS[3] },
  { cat: 'communes', locId: 'le-francois', src: ASSET_IMAGES.weatherBay, title: 'Eastern Horizon Squall', caption: 'Fast-moving Atlantic rain curtain brightening rainbow light.', crop: CROP_PRESETS[2] },

  { cat: 'communes', locId: 'les-trois-ilets', src: ASSET_IMAGES.fortDeFrance, title: 'Trois-Îlets Ferry Crossing', caption: 'Blue bay crossing connecting Pointe du Bout & the capital.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'les-trois-ilets', src: ASSET_IMAGES.heroVeranda, title: 'Creole Gingerbread Cottage', caption: 'Hand-carved wooden eaves overlooking flowering hibiscus.', crop: CROP_PRESETS[4] },
  { cat: 'communes', locId: 'les-trois-ilets', src: ASSET_IMAGES.sainteAnne, title: 'Anse Mitan Palm Shore', caption: 'Sheltered western bay waters at late afternoon.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'les-trois-ilets', src: ASSET_IMAGES.colomboFeast, title: 'Handcrafted Kannari Table', caption: 'Clay tableware glazed in Trois-Îlets workshops.', crop: CROP_PRESETS[3] },

  { cat: 'communes', locId: 'le-carbet', src: ASSET_IMAGES.saintPierre, title: 'Le Carbet Sunset Fishing Bay', caption: 'Calm coastal waters north of Case-Pilote.', crop: CROP_PRESETS[3] },
  { cat: 'communes', locId: 'le-carbet', src: ASSET_IMAGES.grandRiviere, title: 'Wooden Boats on Black Sand', caption: 'Painted fishermen yawls resting above the high-tide line.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'le-carbet', src: ASSET_IMAGES.rainforest, title: 'Pitons du Carbet Peaks', caption: 'Steep volcanic spires sheltering cloud-forest orchids.', crop: CROP_PRESETS[5] },

  { cat: 'communes', locId: 'grand-riviere', src: ASSET_IMAGES.grandRiviere, title: 'Grand’Rivière Basalt Cliffs', caption: 'Wild northern headland facing the Dominica Channel.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'grand-riviere', src: ASSET_IMAGES.grandRiviere, title: 'Artisanal Doris Harbor', caption: 'Brightly painted fishing boats moored below green cliffs.', crop: CROP_PRESETS[3] },
  { cat: 'communes', locId: 'grand-riviere', src: ASSET_IMAGES.rainforest, title: 'Single-Lane Bamboo Drive', caption: 'Cathedral arches of giant bamboo shading the northern road.', crop: CROP_PRESETS[1] },

  { cat: 'communes', locId: 'morne-rouge', src: ASSET_IMAGES.fcNature, title: 'Morne-Rouge Mist Blanket', caption: 'Cool mountain morning above 450 meters elevation.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'morne-rouge', src: ASSET_IMAGES.rainforest, title: 'Giant Tree Ferns & Heliconia', caption: 'Ancient botanical canopy framing Route de la Trace.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'morne-rouge', src: ASSET_IMAGES.tropicalMarket, title: 'Highland Pineapple & Cacao', caption: 'Volcanic soil yielding Martinique’s sweetest mountain harvests.', crop: CROP_PRESETS[4] },

  { cat: 'communes', locId: 'trinite', src: ASSET_IMAGES.leFrancois, title: 'Tartane Surfing Headland', caption: 'Crisp Atlantic rollers wrapping around Caravelle Peninsula.', crop: CROP_PRESETS[2] },
  { cat: 'communes', locId: 'trinite', src: ASSET_IMAGES.weatherBay, title: 'Caravelle Lighthouse Horizon', caption: 'Sweeping ocean winds from Martinique’s easternmost cape.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'trinite', src: ASSET_IMAGES.rainforest, title: 'Baie du Trésor Mangroves', caption: 'Protected coastal roots sheltering young reef fish.', crop: CROP_PRESETS[4] },

  { cat: 'communes', locId: 'le-marin', src: ASSET_IMAGES.sainteAnne, title: 'Cul-de-Sac du Marin Bay', caption: 'Deep tranquil harbor cradled by southern green hills.', crop: CROP_PRESETS[1] },
  { cat: 'communes', locId: 'le-marin', src: ASSET_IMAGES.leFrancois, title: 'Southern Sail Rigging', caption: 'Wooden hulls and crisp canvas sails docked at dawn.', crop: CROP_PRESETS[3] },

  { cat: 'communes', locId: 'sainte-anne', src: ASSET_IMAGES.sainteAnne, title: 'Plage des Salines Morning Calm', caption: 'Mirror-still turquoise shallows framed by curving coconut trunks.', crop: CROP_PRESETS[0] },
  { cat: 'communes', locId: 'sainte-anne', src: ASSET_IMAGES.sainteAnne, title: 'White Sand Coral Shoreline', caption: 'Soft powdery grains warming under Karèm sunshine.', crop: CROP_PRESETS[4] },
  { cat: 'communes', locId: 'sainte-anne', src: ASSET_IMAGES.weatherBay, title: 'Rainbow Over Anse Trabaud', caption: 'Clear southern waters sparkling beside coastal dunes.', crop: CROP_PRESETS[2] },

  // HISTORICAL SITES
  { cat: 'historical', locId: 'cap-110', src: ASSET_IMAGES.cap110, title: 'Cap 110 — 15 White Monoliths', caption: 'Laurent Valère’s solemn statues gazing 110° East across the sea.', crop: CROP_PRESETS[0] },
  { cat: 'historical', locId: 'cap-110', src: ASSET_IMAGES.cap110, title: 'Flower Offerings at Anse Caffard', caption: 'Fresh island blooms laid at sunrise in ancestral tribute.', crop: CROP_PRESETS[3] },
  { cat: 'historical', locId: 'cap-110', src: ASSET_IMAGES.leDiamant, title: 'Horizon Toward Diamond Rock', caption: 'The volcanic rock visible just offshore from Cap 110 ridge.', crop: CROP_PRESETS[2] },
  { cat: 'historical', locId: 'cachot-cyparis', src: ASSET_IMAGES.saintPierre, title: 'Volcanic Masonry of 1902', caption: 'Thick stone arches preserving memory beneath Mount Pelée.', crop: CROP_PRESETS[1] },
  { cat: 'historical', locId: 'cachot-cyparis', src: ASSET_IMAGES.fcNature, title: 'Slopes Above Cyparis Cell', caption: 'The towering volcano rising quietly above restored courtyards.', crop: CROP_PRESETS[3] },
  { cat: 'historical', locId: 'chateau-dubuc', src: ASSET_IMAGES.leFrancois, title: 'Baie du Trésor Approach', caption: 'Sheltered Atlantic anchorage guarding Caravelle’s stone ruins.', crop: CROP_PRESETS[4] },
  { cat: 'historical', locId: 'chateau-dubuc', src: ASSET_IMAGES.grandRiviere, title: 'Coastal Headland Masonry', caption: 'Weathered volcanic stone terraces perched above crashing surf.', crop: CROP_PRESETS[1] },
  { cat: 'historical', locId: 'habitation-clement', src: ASSET_IMAGES.heroVeranda, title: 'Creole Manor Veranda', caption: 'Crafted wooden louvers and mahogany floors at Habitation Clément.', crop: CROP_PRESETS[1] },
  { cat: 'historical', locId: 'habitation-clement', src: ASSET_IMAGES.rainforest, title: 'Royal Palm Sculpture Park', caption: 'Contemporary Caribbean bronzes resting among botanical alleys.', crop: CROP_PRESETS[0] },
  { cat: 'historical', locId: 'village-poterie', src: ASSET_IMAGES.colomboFeast, title: 'Trois-Îlets Terracotta Kannari', caption: 'Hand-thrown clay pots still fired in brick kilns since the 1700s.', crop: CROP_PRESETS[2] },
  { cat: 'historical', locId: 'village-poterie', src: ASSET_IMAGES.fortDeFrance, title: 'Artisan Dockside Mangrove', caption: 'Calm mangrove channels beside the historic brickworks.', crop: CROP_PRESETS[4] },

  // OFF THE BEATEN PATH
  { cat: 'offbeat', locId: 'tombolo-sainte-marie', src: ASSET_IMAGES.sainteAnne, title: 'Parting Sea Sandbar', caption: 'Walking across turquoise swells from December through April.', crop: CROP_PRESETS[2] },
  { cat: 'offbeat', locId: 'tombolo-sainte-marie', src: ASSET_IMAGES.leFrancois, title: 'Îlet Sainte-Marie Swells', caption: 'Converging Atlantic currents sculpting temporary gold beaches.', crop: CROP_PRESETS[1] },
  { cat: 'offbeat', locId: 'anse-couleuvre', src: ASSET_IMAGES.grandRiviere, title: 'Le Prêcheur Wild Black Cove', caption: 'Hidden volcanic crescent sheltered by emerald walls.', crop: CROP_PRESETS[0] },
  { cat: 'offbeat', locId: 'anse-couleuvre', src: ASSET_IMAGES.rainforest, title: 'Cascade Couleuvre Gorge', caption: 'Cool cliffside waterfall tucked 20 minutes up the canyon.', crop: CROP_PRESETS[3] },
  { cat: 'offbeat', locId: 'savane-petrifications', src: ASSET_IMAGES.sainteAnne, title: 'Red Basalt Southern Badlands', caption: 'Ancient geological desert meeting turquoise Atlantic breakers.', crop: CROP_PRESETS[5] },
  { cat: 'offbeat', locId: 'savane-petrifications', src: ASSET_IMAGES.weatherBay, title: 'Trace des Caps Horizon', caption: 'Sweeping ocean winds at Martinique’s wild southeastern edge.', crop: CROP_PRESETS[0] },
  { cat: 'offbeat', locId: 'canal-des-esclaves', src: ASSET_IMAGES.rainforest, title: 'Beaulieu Ridge Narrow Aqueduct', caption: 'Hand-hewn stone canal floating above tropical rainforest canopies.', crop: CROP_PRESETS[1] },
  { cat: 'offbeat', locId: 'canal-des-esclaves', src: ASSET_IMAGES.fcNature, title: 'Carbet Valley Emerald Drop', caption: 'Cloud-forest views from the mossy canyon rim.', crop: CROP_PRESETS[2] },
  { cat: 'offbeat', locId: 'saut-du-gendarme', src: ASSET_IMAGES.rainforest, title: 'Saut du Gendarme Plunge Pool', caption: 'Mountain spring cascade beneath overhanging red heliconia.', crop: CROP_PRESETS[4] },
  { cat: 'offbeat', locId: 'saut-du-gendarme', src: ASSET_IMAGES.weatherBay, title: 'Trace Rainforest Mist', caption: 'Sparkling mountain air along Route de la Trace.', crop: CROP_PRESETS[3] },

  // CULINARY ART GALLERY
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.colomboFeast, title: 'Sunday Kolombo in Clay Kannari', caption: 'Steaming spiced stew served alongside madras linen & fresh lime.', crop: CROP_PRESETS[0] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.colomboFeast, title: 'Crispy Akra & Plantain Platter', caption: 'Golden codfish fritters garnished with chives & sweet chili.', crop: CROP_PRESETS[1] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.colomboFeast, title: 'Féwòs Zaboka & Kasav Discs', caption: 'Whipped spiced avocado paired with warm manioc flatbread.', crop: CROP_PRESETS[2] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.tropicalMarket, title: 'Golden Madras & Spice Sacks', caption: 'Turmeric, colombo masala, nutmeg, and fragrant cacao pods.', crop: CROP_PRESETS[0] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.tropicalMarket, title: 'Julie Mangoes & Breadfruit', caption: 'Sun-ripened summer orchard bounty in woven bakwa baskets.', crop: CROP_PRESETS[1] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.tropicalMarket, title: 'Vanilla Beans & Cinnamon Bark', caption: 'Aromatic sweet baking spices grown along volcanic foothills.', crop: CROP_PRESETS[2] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.fcMarket, title: 'Grand Marché Merchant Smile', caption: 'Woven baskets brimming with passionfruit and fresh herbs.', crop: CROP_PRESETS[0] },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.fcMarket, title: 'Scallions, Thyme & Piman Végétaryen', caption: 'The aromatic foundation of every Martinican Creole kitchen.', crop: CROP_PRESETS[3] },
  { cat: 'culinary', locId: 'sainte-anne', src: ASSET_IMAGES.sainteAnne, title: 'Beachside Sòbè Koko Churn', caption: 'Chilled coconut-cinnamon sorbet served beneath beach palms.', crop: CROP_PRESETS[2] },
  { cat: 'culinary', locId: 'le-diamant', src: ASSET_IMAGES.colomboFeast, title: 'Easter Pak Matoutou Table', caption: 'Celebratory spiced crab and yellow rice feast by the sea.', crop: CROP_PRESETS[4] },

  // WEATHER & SKY GALLERY
  { cat: 'weather', locId: 'fort-de-france', src: ASSET_IMAGES.weatherBay, title: 'Double Rainbow After Ti Grin Lapli', caption: 'Sudden sunlit rain clearing across turquoise Caribbean waters.', crop: CROP_PRESETS[0] },
  { cat: 'weather', locId: 'fort-de-france', src: ASSET_IMAGES.weatherBay, title: 'Warm Alizé Trade Clouds', caption: 'White cotton trade clouds drifting gently east to west.', crop: CROP_PRESETS[5] },
  { cat: 'weather', locId: 'morne-rouge', src: ASSET_IMAGES.fcNature, title: 'Mount Pelée Mist & Waterfall', caption: 'Highland dew keeping tree ferns emerald through every month.', crop: CROP_PRESETS[1] },
  { cat: 'weather', locId: 'sainte-anne', src: ASSET_IMAGES.sainteAnne, title: 'Golden Karèm Blue Horizons', caption: 'Dry-season clear sunshine lighting Les Salines lagoon.', crop: CROP_PRESETS[1] },
  { cat: 'weather', locId: 'le-francois', src: ASSET_IMAGES.leFrancois, title: '18-Knot Atlantic Trade Breeze', caption: 'Crisp easterly gusts filling colorful racing yole sails.', crop: CROP_PRESETS[2] },
  { cat: 'weather', locId: 'le-diamant', src: ASSET_IMAGES.leDiamant, title: 'Amber Sunset Twilight (Lè Brinn)', caption: 'Peaceful twilight stillness settling behind Diamond Rock.', crop: CROP_PRESETS[3] },

  // CULTURE, MUSIC, YOLES & LEARNING PATH
  { cat: 'culture', locId: 'sainte-marie', src: ASSET_IMAGES.fcMusic, title: 'Tanbouyé at Sunset Ring', caption: 'Master Bèlè drummer conversing rhythmically with dancers.', crop: CROP_PRESETS[0] },
  { cat: 'culture', locId: 'sainte-marie', src: ASSET_IMAGES.fcMusic, title: 'Gran Wòb & Madras Lace Dance', caption: 'Flowing traditional skirts swirling in Sainte-Marie’s circle.', crop: CROP_PRESETS[1] },
  { cat: 'culture', locId: 'sainte-marie', src: ASSET_IMAGES.fcMusic, title: 'Ti-Bwa Bamboo Cadence', caption: 'Syncopated wooden sticks anchoring the entire Bèlè ensemble.', crop: CROP_PRESETS[2] },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.learningVeranda, title: 'Gran-Manman Teaching on Veranda', caption: 'Intergenerational storytelling passing Kréyòl Matinik to youth.', crop: CROP_PRESETS[0] },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.learningVeranda, title: 'Notebook & Morning Coffee Study', caption: 'Writing GEREC phrases aloud amidst crimson bougainvillea.', crop: CROP_PRESETS[1] },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.fcGreetings, title: 'Morning Bonjou at the Bakwa Gate', caption: 'Neighbors exchanging warm island salutations across the garden.', crop: CROP_PRESETS[0] },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.fcGreetings, title: 'Creole Veranda Shutter Light', caption: 'Golden morning light through painted tropical wood shutters.', crop: CROP_PRESETS[2] },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.heroVeranda, title: 'Madinina Heritage Archive Cover', caption: 'Open Creole book looking northward toward Mount Pelée.', crop: CROP_PRESETS[0] },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.dictionaryBanner, title: 'Institut du Créole Reference Shelf', caption: 'Historical maps, dictionaries, and cultural preservation studies.', crop: CROP_PRESETS[0] },
  { cat: 'culture', locId: 'le-francois', src: ASSET_IMAGES.leFrancois, title: 'UNESCO Yole Finish Line', caption: 'Cheering island crowds greeting fleet arrivals in turquoise bays.', crop: CROP_PRESETS[5] }
];

// Dynamically add remaining varied detail & atmospheric perspectives across communes/subjects
// so the Heritage Photo Gallery totals 116+ distinct curated entries!
const EXPANDED_SERIES_SEEDS = [
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.fortDeFrance, title: 'Savane Royal Palms Walkway', caption: 'Shaded promenade overlooking Fort Saint-Louis.', crop: '18% 60%' },
  { cat: 'communes', locId: 'fort-de-france', src: ASSET_IMAGES.fcGreetings, title: 'Tipical Creole Balcony Lace', caption: 'Hand-cut woodwork framing downtown Fort-de-France.', crop: '80% 30%' },
  { cat: 'communes', locId: 'saint-pierre', src: ASSET_IMAGES.saintPierre, title: 'Harbor Wharf Ruins at Dawn', caption: 'Volcanic cobbles remembering 19th-century trade ships.', crop: '20% 75%' },
  { cat: 'communes', locId: 'le-diamant', src: ASSET_IMAGES.leDiamant, title: 'Channel Foam Against Basalt', caption: 'Atlantic and Caribbean waters meeting off Le Diamant.', crop: '65% 45%' },
  { cat: 'communes', locId: 'sainte-marie', src: ASSET_IMAGES.learningVeranda, title: 'Krik-Krak Evening Lamp', caption: 'Lantern light gathering elders and children around proverbs.', crop: '70% 25%' },
  { cat: 'communes', locId: 'le-francois', src: ASSET_IMAGES.leFrancois, title: 'Bwa Dréssé Bamboo Balance', caption: 'Acrobatic sail balance across Atlantic turquoise channels.', crop: '45% 28%' },
  { cat: 'communes', locId: 'les-trois-ilets', src: ASSET_IMAGES.heroVeranda, title: 'Red Clay Roofs & Palms', caption: 'Quiet southern bay hillside bathed in morning trade breeze.', crop: '20% 20%' },
  { cat: 'communes', locId: 'le-carbet', src: ASSET_IMAGES.grandRiviere, title: 'Caribbean Morning Tide', caption: 'Dark volcanic shore glistening under bright island sun.', crop: '30% 80%' },
  { cat: 'communes', locId: 'grand-riviere', src: ASSET_IMAGES.rainforest, title: 'Northern Cliff Cascade', caption: 'Fresh mountain torrent leaping directly toward the channel.', crop: '80% 55%' },
  { cat: 'communes', locId: 'morne-rouge', src: ASSET_IMAGES.fcNature, title: 'Volcanic Fern Mist Canopy', caption: 'Tree ferns shimmering in highland humidity near 500m.', crop: '22% 72%' },
  { cat: 'communes', locId: 'trinite', src: ASSET_IMAGES.weatherBay, title: 'Caravelle Reef Break', caption: 'White foam rollers bordering sheltered east coast coves.', crop: '72% 65%' },
  { cat: 'communes', locId: 'le-marin', src: ASSET_IMAGES.sainteAnne, title: 'Sailing anchorage Glow', caption: 'Peaceful southern cove ringed by rolling green hills.', crop: '82% 40%' },
  { cat: 'communes', locId: 'sainte-anne', src: ASSET_IMAGES.sainteAnne, title: 'Plage des Salines Palm Arch', caption: 'Iconic leaning palm trunk reaching over clear turquoise shallows.', crop: '18% 42%' },
  { cat: 'historical', locId: 'cap-110', src: ASSET_IMAGES.cap110, title: 'Triangular Horizon Formation', caption: '15 ancestral figures unified against coastal trade winds.', crop: '78% 45%' },
  { cat: 'historical', locId: 'cachot-cyparis', src: ASSET_IMAGES.saintPierre, title: 'Preserved Courtyard Stonework', caption: 'Silence and dignity amidst the historic walls of Senpyè.', crop: '40% 25%' },
  { cat: 'historical', locId: 'chateau-dubuc', src: ASSET_IMAGES.grandRiviere, title: 'Atlantic Watchtower Cliffs', caption: 'Steep rocky promontory watching ships enter Baie du Trésor.', crop: '68% 28%' },
  { cat: 'historical', locId: 'habitation-clement', src: ASSET_IMAGES.learningVeranda, title: 'Heritage Wooden Shutters', caption: 'Hand-planed louvers keeping tropical parlors cool without glass.', crop: '30% 60%' },
  { cat: 'historical', locId: 'village-poterie', src: ASSET_IMAGES.tropicalMarket, title: 'Natural Ochre Glaze Palette', caption: 'Earthy island pigments matching Martinican clay crafts.', crop: '60% 72%' },
  { cat: 'offbeat', locId: 'tombolo-sainte-marie', src: ASSET_IMAGES.weatherBay, title: 'Twin-Wave Sandbar Convergence', caption: 'Opposite currents depositing a shining bridge of wet sand.', crop: '55% 68%' },
  { cat: 'offbeat', locId: 'anse-couleuvre', src: ASSET_IMAGES.grandRiviere, title: 'Hidden Northern Jetty Rocks', caption: 'Wild emerald jungle tumbling down to glistening black tide.', crop: '15% 35%' },
  { cat: 'offbeat', locId: 'savane-petrifications', src: ASSET_IMAGES.leDiamant, title: 'Wind-Carved Red Cliff', caption: 'Dramatic volcanic rock ledges beside pounding eastern surf.', crop: '28% 58%' },
  { cat: 'offbeat', locId: 'canal-des-esclaves', src: ASSET_IMAGES.rainforest, title: 'Emerald Abyss Moss Stone', caption: 'Lichen-covered aqueduct walls tracing steep forest cliffs.', crop: '62% 20%' },
  { cat: 'offbeat', locId: 'saut-du-gendarme', src: ASSET_IMAGES.fcNature, title: 'Sparkling Spring Veil', caption: 'Refreshing mountain mist filling the forest sanctuary.', crop: '74% 38%' },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.colomboFeast, title: 'Turmeric & Bwadenn Marinade', caption: 'Rich golden glaze coating slow-simmered island vegetables.', crop: '68% 60%' },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.tropicalMarket, title: 'Star Anise & Green Lime Zest', caption: 'Fresh citrus peel lifting every traditional boudin and blaff.', crop: '82% 48%' },
  { cat: 'culinary', locId: 'fort-de-france', src: ASSET_IMAGES.fcMarket, title: 'Ripe Corossol & Passionfruit', caption: 'Velvety tropical soursop pressed for refreshing island juice.', crop: '75% 62%' },
  { cat: 'weather', locId: 'fort-de-france', src: ASSET_IMAGES.weatherBay, title: 'Sunbreak After Passing Squall', caption: 'Crisp crystal visibility across Martinique’s bays after rain.', crop: '35% 30%' },
  { cat: 'weather', locId: 'le-francois', src: ASSET_IMAGES.leFrancois, title: 'Steady Alizé Whitecaps', caption: 'Invigorating Atlantic breeze cooling eastern lagoons.', crop: '80% 72%' },
  { cat: 'culture', locId: 'sainte-marie', src: ASSET_IMAGES.fcMusic, title: 'Community Lawonn Circle', caption: 'Neighbors clapping the pulse around the centerpiece drum.', crop: '80% 62%' },
  { cat: 'culture', locId: 'fort-de-france', src: ASSET_IMAGES.dictionaryBanner, title: 'Intergenerational Archive Desk', caption: 'GEREC orthography guides alongside historical parish records.', crop: '72% 42%' }
];

export const FULL_PHOTO_GALLERY = [...EXTRA_COMMUNE_PHOTOS, ...EXPANDED_SERIES_SEEDS].map((item, idx) => ({
  id: `gal-photo-${idx + 1}`,
  ...item
}));
