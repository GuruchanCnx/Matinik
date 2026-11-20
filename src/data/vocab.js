// Authentic GEREC Martinican Creole Vocabulary, 20 Flashcard Decks & Cultural Collection Artifacts

export const ARTIFACTS_CATALOG = [
  { id: 'tanbou', name: 'Tanbou Bèlè', en: 'Ancestral drum of Sainte-Marie', fr: 'Tambour traditionnel bèlè', icon: '🥁', pointsRequired: 20 },
  { id: 'madras', name: 'Tèt Maré Madras', en: 'Heritage madras headpiece', fr: 'Coiffe traditionnelle madras', icon: '🎀', pointsRequired: 50 },
  { id: 'yole', name: 'Yòl Bwa Dréssé', en: 'UNESCO Martinican racing yole', fr: 'Yole ronde martiniquaise', icon: '⛵', pointsRequired: 90 },
  { id: 'canari', name: 'Kannari Tè', en: 'Trois-Îlets clay cooking pot', fr: 'Canari en terre cuite', icon: '🏺', pointsRequired: 140 },
  { id: 'bakoua', name: 'Chapo Bakwa', en: 'Woven pandanus straw hat', fr: 'Chapeau bakoua artisanal', icon: '👒', pointsRequired: 200 },
  { id: 'lambi', name: 'Konk Lanbi', en: 'Ceremonial conch shell horn', fr: 'Conque de lambi', icon: '🐚', pointsRequired: 280 },
  { id: 'calebasse', name: 'Kalbas Gravé', en: 'Carved calabash gourd vessel', fr: 'Calebasse gravée', icon: '🥥', pointsRequired: 380 },
  { id: 'pelee', name: 'Flanbo Pèlé', en: 'Guardian of Creole Memory', fr: 'Gardien de la mémoire créole', icon: '🌋', pointsRequired: 500 }
];

export const CURRICULUM_TERMS = {
  module1: [
    {
      id: 'm1-bonjou', word: 'Bonjou', pos: 'Greeting', pronounce: '[bohn-zhoo]',
      en: 'Good morning / Hello', fr: 'Bonjour / Salut',
      otherTranslations: 'Good day, respectful daytime greeting',
      definition: 'Polite daytime greeting spoken to elders, neighbors, and shopkeepers across Martinique.',
      example: 'Bonjou tout moun an gran maché-a!',
      exampleTranslation: 'Good morning everyone at the main market!',
      synonyms: 'Sali (informal)', antonyms: 'Orevwa, A plita',
      collocations: 'Bonjou doudou · Bonjou manman · Bonjou mèsyé'
    },
    {
      id: 'm1-bonswa', word: 'Bonswa', pos: 'Greeting', pronounce: '[bohn-swah]',
      en: 'Good evening / Good afternoon', fr: 'Bonsoir',
      otherTranslations: 'Good dusk, late-afternoon salutation',
      definition: 'Warm greeting used once the afternoon sun lowers or at twilight gatherings (krik-krak).',
      example: 'Bonswa fanmi-a, kouman zòt pasé lajounen-an?',
      exampleTranslation: 'Good evening family, how did you spend the day?',
      synonyms: 'Bonjou (daytime)', antonyms: 'Bonn nwit',
      collocations: 'Bonswa tout moun · Bonswa doudou'
    },
    {
      id: 'm1-kouman', word: 'Kouman ou yé?', pos: 'Phrase', pronounce: '[koo-mahn oo yay]',
      en: 'How are you?', fr: 'Comment vas-tu ? / Comment allez-vous ?',
      otherTranslations: 'How are things with you?, How do you feel?',
      definition: 'Standard Martinican question asking politely about someone’s health and spirit.',
      example: 'Bonjou frè mwen, kouman ou yé maten-an?',
      exampleTranslation: 'Good morning my brother, how are you this morning?',
      synonyms: 'Sa k’ap fèt? · Kouman sa yé?', antonyms: '—',
      collocations: 'Kouman ou yé jòdi-a? · Kouman zòt yé?'
    },
    {
      id: 'm1-kenbe', word: "M'ap kenbe", pos: 'Idiom', pronounce: '[mahp kahn-bay]',
      en: "I'm doing well / Hanging in there", fr: 'Je vais bien / Je tiens bon',
      otherTranslations: 'Holding strong, keeping upbeat',
      definition: 'Iconic Martinican reply meaning literally "I am holding on", expressing resilience and vitality.',
      example: "M'ap kenbe rèd épi tjè kontan, mèsi anpil!",
      exampleTranslation: "I'm holding strong with a glad heart, thank you very much!",
      synonyms: 'Mwen anfòm · Sa ka woulé', antonyms: 'Mwen las · Mwen malad',
      collocations: "M'ap kenbe rèd · Kenbe fò"
    },
    {
      id: 'm1-sakapfet', word: "Sa k'ap fèt?", pos: 'Greeting', pronounce: '[sah kahp feht]',
      en: "What's happening? / What's up?", fr: "Quoi de neuf ? / Qu'est-ce qui se passe ?",
      otherTranslations: "What's going on?, How's it rolling?",
      definition: 'Friendly, relaxed conversational opener heard among friends in Fort-de-France and coastal towns.',
      example: "Ébé zanmi mwen, sa k'ap fèt jòdi-a?",
      exampleTranslation: "Hey my friend, what's happening today?",
      synonyms: 'Sa ka woulé? · Ki nouvel?', antonyms: 'Ayen pa ka fèt',
      collocations: "Sa k'ap fèt manmay? · Sa k'ap fèt doudou?"
    },
    {
      id: 'm1-mesi', word: 'Mèsi anpil', pos: 'Expression', pronounce: '[meh-see ahn-peel]',
      en: 'Thank you very much', fr: 'Merci beaucoup',
      otherTranslations: 'Many thanks, deeply appreciated',
      definition: 'Combines "mèsi" (thanks) with "anpil" (a great deal) to express sincere gratitude.',
      example: 'Mèsi anpil pou bèl koudmen-tala!',
      exampleTranslation: 'Thank you very much for this wonderful helping hand!',
      synonyms: 'Mèsi · Gran mèsi', antonyms: 'Pa ni pwoblèm (reply)',
      collocations: 'Mèsi anpil doudou · Mèsi Bondyé'
    },
    {
      id: 'm1-aplita', word: 'A plita', pos: 'Farewell', pronounce: '[ah plee-tah]',
      en: 'See you later / Goodbye', fr: 'À plus tard / Au revoir',
      otherTranslations: 'Until later, catch you soon',
      definition: 'Warm parting phrase implying you expect to cross paths again soon in the neighborhood.',
      example: "Mwen ka alé la, a plita manmay!",
      exampleTranslation: "I'm heading off now, see you later folks!",
      synonyms: 'A dèmen · Nou ka wè', antonyms: 'Bonjou · Bévini',
      collocations: 'A plita si Bondyé vlé · Pran swen kò’w'
    }
  ],
  module2: [
    {
      id: 'm2-fanmi', word: 'Fanmi', pos: 'Noun', pronounce: '[fahn-mee]',
      en: 'Family', fr: 'Famille',
      otherTranslations: 'Extended kin, relatives, household circle',
      definition: 'Encompasses parents, grandparents, godparents (marenn / parenn), and close neighbors.',
      example: 'Fanmi mwen ka rété Sent-Mari épi Fòdfrans.',
      exampleTranslation: 'My family lives in Sainte-Marie and Fort-de-France.',
      synonyms: 'Moun lakay · Paran', antonyms: 'Étranjé',
      collocations: 'Tout fanmi-a · Fanmi pwòch'
    },
    {
      id: 'm2-manman', word: 'Manman', pos: 'Noun', pronounce: '[mahn-mahn]',
      en: 'Mother', fr: 'Mère / Maman',
      otherTranslations: 'Mom, matriarch, cherished mother',
      definition: 'Pillar of the Martinican household; also appears in joyful exclamations like "Bonda manman!".',
      example: 'Manman mwen ka fè an bon soup jiromon.',
      exampleTranslation: 'My mother is making a delicious pumpkin soup.',
      synonyms: 'Manmi', antonyms: 'Papa',
      collocations: 'Manman mwen · Gran-manman'
    },
    {
      id: 'm2-papa', word: 'Papa', pos: 'Noun', pronounce: '[pah-pah]',
      en: 'Father', fr: 'Père / Papa',
      otherTranslations: 'Dad, elder father figure',
      definition: 'Respectful and affectionate term for father.',
      example: 'Papa mwen ka travay an jaden bannann.',
      exampleTranslation: 'My father works in the banana garden.',
      synonyms: 'Dadi', antonyms: 'Manman',
      collocations: 'Papa mwen · Gran-papa'
    },
    {
      id: 'm2-timanmay', word: 'Timanmay / Timoun', pos: 'Noun', pronounce: '[tee-mahn-my]',
      en: 'Child / Children', fr: 'Enfant / Enfants',
      otherTranslations: 'Kids, youth, young folks',
      definition: '"Timanmay" is distinctly cherished in Martinique alongside "timoun" for children and youth.',
      example: 'Timanmay-la ka jwé anba pyé mango-a.',
      exampleTranslation: 'The children are playing beneath the mango tree.',
      synonyms: 'Manmay · Ti-moun', antonyms: 'Granmoun',
      collocations: 'Ti-manmay lékol · Timanmay lakou'
    },
    {
      id: 'm2-granmoun', word: 'Granmoun', pos: 'Noun', pronounce: '[grahn-moon]',
      en: 'Elder / Older person', fr: 'Personne âgée / Aîné(e)',
      otherTranslations: 'Adult, senior, ancestor in spirit',
      definition: 'Elders hold honored status as keepers of Creole oral wisdom, proverbs, and bèlè.',
      example: 'Kouté pawòl granmoun pou ou pran sajès.',
      exampleTranslation: 'Listen to the elders’ words to gain wisdom.',
      synonyms: 'Ansyen · Lòt jénérasyon', antonyms: 'Timanmay',
      collocations: 'Pawòl granmoun · Granmoun lontan'
    },
    {
      id: 'm2-kaz', word: 'Kaz', pos: 'Noun', pronounce: '[kahz]',
      en: 'House / Home', fr: 'Maison / Case créole',
      otherTranslations: 'Dwelling, traditional Creole wooden cottage',
      definition: 'Traditional Creole home often built of wood with louvered jalousie shutters and a veranda.',
      example: 'Kaz-la ni an bèl galri ki ka gadé lanmè-a.',
      exampleTranslation: 'The house has a lovely veranda overlooking the sea.',
      synonyms: 'Kay · Lakay', antonyms: 'Lari-a (the street)',
      collocations: 'An kaz-la · Lakay mwen · Bati an kaz'
    },
    {
      id: 'm2-koudmen', word: 'Koudmen', pos: 'Noun', pronounce: '[kood-mehn]',
      en: 'Community mutual aid / Helping hand', fr: 'Entraide solidaire / Coup de main',
      otherTranslations: 'Collective labor, neighborly solidarity',
      definition: 'Sacred rural Martinican custom where neighbors gather freely to help build, harvest, or support one another.',
      example: 'Sé koudmen ki fè kominoté-a rété doubout.',
      exampleTranslation: 'It is mutual solidarity that keeps the community standing tall.',
      synonyms: 'Solidarité · Ba lanmen', antonyms: 'Égoyism',
      collocations: 'Fè an koudmen · Ba an koudmen'
    },
    {
      id: 'm2-frese', word: 'Frè é sè', pos: 'Noun phrase', pronounce: '[freh ay seh]',
      en: 'Brother & Sister', fr: 'Frère et Sœur',
      otherTranslations: 'Siblings, kindred spirits',
      definition: 'Used literally for siblings and warmly among close community members in Martinique.',
      example: 'Tout moun Matinik sé frè é sè an koudmen.',
      exampleTranslation: 'Everyone in Martinique is brother and sister in solidarity.',
      synonyms: 'Konpè / Konmè (close friends)', antonyms: '—',
      collocations: 'Frè mwen · Sè mwen'
    }
  ],
  module3: [
    {
      id: 'm3-manje', word: 'Manjé', pos: 'Noun / Verb', pronounce: '[mahn-zhay]',
      en: 'Food / To eat', fr: 'Nourriture / Manger',
      otherTranslations: 'Meal, dish, dining together',
      definition: 'Refers both to nourishing Martinican dishes and the act of sharing a meal.',
      example: 'Manjé-tala santi bon toubannman!',
      exampleTranslation: 'This food smells completely wonderful!',
      synonyms: 'Repa · Pli', antonyms: 'Bwè (to drink)',
      collocations: 'Manjé kréyòl · Fè manjé'
    },
    {
      id: 'm3-lanmori', word: 'Lanmori', pos: 'Noun', pronounce: '[lahn-moh-ree]',
      en: 'Salted codfish', fr: 'Morue salée',
      otherTranslations: 'Cured Atlantic cod staple',
      definition: 'Cornerstone of Martinican cuisine featured in Féwòs zaboka, Chiktay, and Ti-nain lanmori.',
      example: 'Nou ka désalé lanmori-a avan fè chiktay.',
      exampleTranslation: 'We desalt the codfish before preparing chiktay.',
      synonyms: 'Pwason salé', antonyms: 'Pwason frè',
      collocations: 'Ti-nain lanmori · Akra lanmori'
    },
    {
      id: 'm3-kolombo', word: 'Kolombo', pos: 'Noun', pronounce: '[koh-lohm-boh]',
      en: 'Colombo curry dish', fr: 'Plat au colombo',
      otherTranslations: 'Spiced Indo-Martinican stew (goat, chicken, or pork)',
      definition: 'Fragrant spice blend of roasted coriander, cumin, turmeric, fenugreek, and bois d’Inde.',
      example: 'Dimanch-tala nou ké manjé kolombo kabrit.',
      exampleTranslation: 'This Sunday we will eat goat colombo.',
      synonyms: 'Kari Matinik', antonyms: '—',
      collocations: 'Kolombo kabrit · Kolombo poul · Poud kolombo'
    },
    {
      id: 'm3-kasav', word: 'Kasav', pos: 'Noun', pronounce: '[kah-sahv]',
      en: 'Cassava flatbread', fr: 'Galette de manioc',
      otherTranslations: 'Amerindian manioc griddle cake',
      definition: 'Ancestral Kalinago/Carib manioc bread baked on a hot plate, often filled with coconut or cod.',
      example: 'Kasav koko cho chwit toubannman!',
      exampleTranslation: 'Warm coconut cassava bread is utterly delicious!',
      synonyms: 'Galèt manyòk', antonyms: 'Pen blan',
      collocations: 'Kasav koko · Kasav lanmori · Farin manyòk'
    },
    {
      id: 'm3-fewos', word: 'Féwòs zaboka', pos: 'Noun', pronounce: '[fay-rohs zah-boh-kah]',
      en: 'Spicy avocado, manioc & codfish dip', fr: 'Féroce d’avocat à la morue',
      otherTranslations: 'Martinican avocado-codfish specialty',
      definition: 'Rich blend of ripe avocado, flaked codfish, manioc flour, lime, and bird’s eye chili (piman zwazo).',
      example: 'Féwòs zaboka ka pèché bouch an ti bren!',
      exampleTranslation: 'Féroce d’avocat wakes up your palate a little bit!',
      synonyms: 'Antré kréyòl', antonyms: '—',
      collocations: 'Féwòs piman · Farin manyòk'
    },
    {
      id: 'm3-dlo', word: 'Dlo', pos: 'Noun', pronounce: '[dloh]',
      en: 'Water', fr: 'Eau',
      otherTranslations: 'Fresh spring water, coconut water (dlo koko)',
      definition: 'Essential noun from French "de l’eau"; Martinique is celebrated for volcanic spring waters.',
      example: 'Ban mwen an vè dlo frè souplé.',
      exampleTranslation: 'Give me a glass of cool water please.',
      synonyms: 'Dlo sous', antonyms: 'Dife (fire)',
      collocations: 'Dlo koko · Dlo frè · Dlo lanmè'
    },
    {
      id: 'm3-dous', word: 'Dous', pos: 'Adjective', pronounce: '[doos]',
      en: 'Sweet / Gentle', fr: 'Doux / Sucré / Agréable',
      otherTranslations: 'Mild, tender, pleasant',
      definition: 'Describes sweet fruits, gentle breezes, or a calm, kind temperament.',
      example: 'Mango jòdi-a dous kou myèl!',
      exampleTranslation: 'Today’s mangoes are as sweet as honey!',
      synonyms: 'Sikré · Trankil', antonyms: 'Amè (bitter) · Pikant (spicy)',
      collocations: 'Dous anpil · Pawòl dous'
    },
    {
      id: 'm3-chwit', word: 'Chwit', pos: 'Adjective', pronounce: '[shweet]',
      en: 'Delicious / Flavorful', fr: 'Délicieux / Savoureux / Chic',
      otherTranslations: 'Tasty, delightful, wonderful',
      definition: 'Classic Martinican praise for an unforgettable dish, song, or lively moment.',
      example: 'Manjé-tala chwit toubannman!',
      exampleTranslation: 'This dish is completely delicious!',
      synonyms: 'Bon anpil · Délisyé', antonyms: 'Pa bon · Fad',
      collocations: 'Chwit anpil · Chwit toubannman'
    }
  ]
};

// Complete 20 Flashcard Decks + 25+ Expanded Flashcards, Explanations, Fun Facts & AI Illustrations
export const ARTWORKS = {
  greetings: './src/assets/images/flashcard_greetings_scene_1795116463426.jpg',
  veranda: './src/assets/images/learning_path_veranda_1795183599209.jpg',
  market: './src/assets/images/flashcard_market_cuisine_1795116463413.jpg',
  tropicalMarket: './src/assets/images/culinary_tropical_market_1795183598823.jpg',
  colombo: './src/assets/images/culinary_colombo_feast_1795183598683.jpg',
  music: './src/assets/images/flashcard_music_bele_1795116463374.jpg',
  nature: './src/assets/images/flashcard_nature_pelee_1795116463051.jpg',
  weatherBay: './src/assets/images/weather_tropical_bay_1795183599193.jpg',
  cap110: './src/assets/images/cap_110_memorial_1795183599176.jpg',
  grandRiviere: './src/assets/images/grand_riviere_cliffs_1795183598643.jpg',
  dictionary: './src/assets/images/dictionary_heritage_banner_1795116464309.jpg'
};

export const LEARNING_LEVELS = [
  {
    id: 'beginner',
    step: 1,
    creoleTitle: 'Nivo 1 • Ti-Manmay',
    title: 'Level 1: First Roots',
    minXp: 0,
    badge: '🌱',
    summary: 'Warm greetings, essential manners, numbers, and everyday family words.',
    recommendedDecks: ['greetings', 'family', 'numbers', 'colors']
  },
  {
    id: 'intermediate',
    step: 2,
    creoleTitle: 'Nivo 2 • Mawon',
    title: 'Level 2: Island Conversations',
    minXp: 60,
    badge: '🌺',
    summary: 'Market dialogues, food specialties, weather, and aspect particles (ka, té, ké).',
    recommendedDecks: ['market', 'food', 'verbs', 'daily', 'weather']
  },
  {
    id: 'advanced',
    step: 3,
    creoleTitle: 'Nivo 3 • Bèlè',
    title: 'Level 3: Culture & Heritage',
    minXp: 160,
    badge: '🥁',
    summary: 'Bèlè drum traditions, coastal communes, nature, and authentic island idioms.',
    recommendedDecks: ['music', 'nature', 'animals', 'clothing', 'transport', 'expressions']
  },
  {
    id: 'master',
    step: 4,
    creoleTitle: 'Nivo 4 • Mèt Kréyòl',
    title: 'Level 4: Elder Wisdom',
    minXp: 300,
    badge: '👑',
    summary: 'Historical resistance, pawòl proverbs, and fluent oral storytelling.',
    recommendedDecks: ['history', 'proverbs', 'adjectives', 'time']
  }
];

export const FUN_FACTS_CATALOG = [
  {
    id: 'ff-greetings',
    icon: '🌞',
    level: 'beginner',
    title: 'Greeting Everyone Aloud',
    creole: 'Bonjou tout moun!',
    fact: 'In Martinique, walking into a bakery, waiting room, or bus without saying "Bonjou tout moun!" is considered impolite — every stranger returns your greeting warmly.',
    image: ARTWORKS.greetings
  },
  {
    id: 'ff-yole',
    icon: '⛵',
    level: 'intermediate',
    title: 'Keel-Free UNESCO Boats',
    creole: 'Yòl bwa dréssé',
    fact: 'Martinican round yoles have no keel and no rudder! Sailors balance the boat by leaning out on long wooden poles called "bwa dréssé" during the famous Tour des Yoles.',
    image: ARTWORKS.nature
  },
  {
    id: 'ff-bele',
    icon: '🥁',
    level: 'advanced',
    title: 'Three Pillars of Bèlè',
    creole: 'Tanbou, Ti-bwa & Lavwa',
    fact: 'UNESCO-recognized Martinican Bèlè unites the carved cask drum (tanbou), two bamboo rhythm sticks (ti-bwa) tapped on its back, and call-and-response community singing (lavwa).',
    image: ARTWORKS.music
  },
  {
    id: 'ff-madras',
    icon: '🎀',
    level: 'intermediate',
    title: 'Secret Code of Madras Points',
    creole: 'Tèt maré kat pwent',
    fact: 'Traditional Madras headwraps communicate social cues by the number of tied peaks: 1 point = single, 2 points = engaged/taken, 3 points = married, 4 points = heart open!',
    image: ARTWORKS.market
  },
  {
    id: 'ff-gerec',
    icon: '📖',
    level: 'master',
    title: 'GEREC Standardized Writing',
    creole: 'Kréyòl Matinik',
    fact: 'Unlike French silent letters, Martinican GEREC orthography writes every spoken sound cleanly: "ou" is always [oo], "an" is nasal [ahn], and "w" replaces rolled French R in words like "wouj".',
    image: ARTWORKS.dictionary
  },
  {
    id: 'ff-madinina',
    icon: '🌺',
    level: 'beginner',
    title: 'Island of Flowers',
    creole: 'Madinina — Lilèt a Flè',
    fact: 'Long before 1492, Kalinago peoples named Martinique "Madinina" or "Ioüanacaéra" — celebrated as the Island of Flowers and Lush Springs.',
    image: ARTWORKS.nature
  }
];

export const MICRO_LESSONS = [
  {
    id: 'ml-particles',
    level: 'beginner',
    duration: '2 min',
    title: 'Secret to Every Creole Verb: ka / té / ké',
    creoleHook: 'Mwen ka palé • Mwen té palé • Mwen ké palé',
    explanation: 'Martinican Creole verbs never change their endings! Put "ka" before a verb for present/ongoing, "té" for past, and "ké" for future.',
    funFact: 'Just 3 tiny words unlock over 500 verbs right away — no irregular verb tables needed!',
    practiceTerm: 'Mwen ka palé Kréyòl',
    deck: 'verbs'
  },
  {
    id: 'ml-market',
    level: 'intermediate',
    duration: '2 min',
    title: 'Polite Market Phrases in Fort-de-France',
    creoleHook: 'Bonjou machann! Konben mango-a yé?',
    explanation: 'Start with a warm greeting, ask "Konben..." (How much), and finish with "Ban mwen an ti bren... souplé" (Give me a little... please).',
    funFact: 'Saying "Mèsi doudou" to a market vendor often earns an extra ripe mango ("ti-dousè") in your bag!',
    practiceTerm: 'Konben sa yé?',
    deck: 'market'
  },
  {
    id: 'ml-koudmen',
    level: 'advanced',
    duration: '2 min',
    title: 'Koudmen & Community Values',
    creoleHook: 'Nou ansanm pou fè an koudmen!',
    explanation: 'Koudmen literally means "a hand-strike together" — neighbors helping build a wooden kaz or clear a hillside garden for free, followed by shared kolombo.',
    funFact: 'In rural communes like Gros-Morne and Sainte-Marie, villagers physically lifted entire wooden houses onto new lots during a koudmen!',
    practiceTerm: 'Nou ansanm!',
    deck: 'family'
  },
  {
    id: 'ml-proverbs',
    level: 'master',
    duration: '3 min',
    title: 'Speaking with Pawòl (Proverbs)',
    creoleHook: 'Dèyè mòn, toujou ni mòn.',
    explanation: 'Martinican elders weave metaphorical proverbs ("pawòl") into everyday conversation to advise gently without confrontation.',
    funFact: 'Even small everyday observations in Creole use vivid nature imagery from hills (mòn), rivers, and sea creatures.',
    practiceTerm: 'Dèyè mòn, toujou ni mòn',
    deck: 'proverbs'
  }
];

function c(
  word, pos, pronounce, en, fr, ex, exTrans,
  other = '', def = '', syn = '', ant = '', coll = '',
  level = 'beginner', explanation = '', funFact = '', image = ARTWORKS.greetings
) {
  return {
    word, pos, pronounce, en, fr, ex,
    exampleTranslation: exTrans || en,
    otherTranslations: other || `${fr} · ${en}`,
    definition: def || `Authentic Martinican Creole (Kréyòl Matinik) expression meaning "${en}".`,
    synonyms: syn || '—',
    antonyms: ant || '—',
    collocations: coll || ex,
    level,
    explanation: explanation || `${def || `In Kréyòl Matinik, "${word}" means "${en}".`} Say it gently as ${pronounce}.`,
    funFact: funFact || `In Martinique, "${word}" is part of everyday oral heritage preserved across generations.`,
    image
  };
}

export const FLASHCARD_DECKS = {
  greetings: {
    title: 'Greetings & Salutations (Salitasyon)',
    level: 'beginner',
    image: ARTWORKS.greetings,
    cards: [
      c('Bonjou', 'Greeting', '[bohn-zhoo]', 'Good morning / Hello', 'Bonjour', 'Bonjou manman, kouman ou yé?', 'Good morning Mom, how are you?', 'Good day', 'Respectful daytime greeting in Martinique.', 'Sali', 'A plita', 'Bonjou tout moun', 'beginner', 'Use "Bonjou" from sunrise until late afternoon whenever entering any room or shop.', 'Everyone in a Martinican bakery answers "Bonjou!" together as a mark of respect.', ARTWORKS.greetings),
      c('Bonswa', 'Greeting', '[bohn-swah]', 'Good evening', 'Bonsoir', 'Bonswa tout moun!', 'Good evening everyone!', 'Good afternoon/evening', 'Greeting used from late afternoon through evening.', 'Bonjou', 'Bonn nwit', 'Bonswa doudou', 'beginner', 'Switch from "Bonjou" to "Bonswa" once the tropical afternoon sun starts to dip around 4–5 PM.', 'At twilight krik-krak storytelling gatherings, "Bonswa tout moun!" opens the circle.', ARTWORKS.greetings),
      c('Kouman ou yé?', 'Phrase', '[koo-mahn oo yay]', 'How are you?', 'Comment vas-tu ?', 'Kouman ou yé jòdi-a?', 'How are you today?', 'How are you holding up?', 'Standard warm inquiry about well-being.', "Sa k'ap fèt?", '—', 'Kouman zòt yé?', 'beginner', 'Literally "How do you be?" — replace "ou" (singular you) with "zòt" when greeting a group!', 'Notice "yé" only appears at the end of questions in Creole — you never put it inside statements.', ARTWORKS.greetings),
      c("M'ap kenbe", 'Idiom', '[mahp kahn-bay]', 'Doing well / Hanging in there', 'Je vais bien / Je tiens bon', "M'ap kenbe rèd, mèsi anpil!", "I'm holding strong, thank you!", 'Staying strong', 'Reflects buoyant Martinican resilience.', 'Mwen anfòm', 'Mwen las', "M'ap kenbe doudou", 'beginner', 'Literally "I am holding on" — adding "rèd" (firmly) or "dousman" (gently) gives it lively island nuance.', 'This reply captures the cheerful perseverance of daily island life.', ARTWORKS.greetings),
      c("Sa k'ap fèt?", 'Greeting', '[sah kahp feht]', "What's up? / What's new?", 'Quoi de neuf ?', "Sa k'ap fèt frè mwen?", "What's up my brother?", "What's happening?", 'Informal daily greeting among friends.', 'Sa ka woulé?', '—', "Sa k'ap fèt jòdi-a?", 'beginner', 'Best used with friends, classmates, and cousins; stick to "Bonjou" with elders!', 'Often answered with "Ayen di gran!" (Nothing much!) or "Sa ka woulé!" (All rolling smoothly!).', ARTWORKS.greetings),
      c('A plita', 'Farewell', '[ah plee-tah]', 'See you later', 'À plus tard', 'A plita doudou, pran swen kò’w!', 'See you later sweetheart, take care!', 'Until later', 'Warm everyday parting expression.', 'A dèmen', 'Bonjou', 'A plita si Bondyé vlé', 'beginner', 'Comes from "à plus tard" — signals warmth because island life brings neighbors together again soon.', 'Elders often add "si Bondyé vlé" (if God wills) out of gentle tradition.', ARTWORKS.greetings),
      c('Bévini', 'Greeting', '[bay-vee-nee]', 'Welcome!', 'Bienvenue !', 'Bévini lakay nou an Matinik!', 'Welcome to our home in Martinique!', 'Glad you arrived', 'Warm phrase welcoming guests onto the veranda.', 'Byenvini', 'Orevwa', 'Bévini doudou', 'beginner', 'Used to greet visitors arriving at your home ("lakay"), festival, or commune.', 'Hospitality ("akèy") is central in Martinique — guests are always offered cool juice or coffee.', ARTWORKS.greetings),
      c('Eskizé mwen', 'Phrase', '[ehs-kee-zay mwehn]', 'Excuse me / Sorry', 'Excusez-moi / Pardon', 'Eskizé mwen, ki lè i yé souplé?', 'Excuse me, what time is it please?', 'Pardon me', 'Polite way to ask a question or pass through a crowd.', 'Padon', '—', 'Eskizé mwen manmay', 'beginner', 'Notice "mwen" means both "I" and "me" in Kréyòl Matinik — no separate object pronoun needed!', 'Combine with "souplé" (please) to sound naturally courteous everywhere.', ARTWORKS.greetings),
      c('Souplé', 'Expression', '[soo-play]', 'Please', "S'il te plaît / S'il vous plaît", 'Ban mwen an ti dlo souplé.', 'Give me a little water please.', 'Kindly', 'Short, musical Creole form of French "s’il vous plaît".', 'Si i plé’w', '—', 'Mèsi · Souplé', 'beginner', 'Place "souplé" smoothly at the end of any request for water, directions, or market fruit.', 'Works equally well with both elders and friends.', ARTWORKS.greetings)
    ]
  },
  family: {
    title: 'Family & Loved Ones (Fanmi)',
    level: 'beginner',
    image: ARTWORKS.veranda,
    cards: [
      c('Fanmi', 'Noun', '[fahn-mee]', 'Family', 'Famille', 'Fanmi nou an gran anpil.', 'Our family is very big.', 'Relatives, kin', 'Multigenerational circle plus godparents.', 'Paran', 'Étranjé', 'Tout fanmi-a', 'beginner', 'Put possessive words AFTER the noun: "fanmi mwen" = my family, "fanmi nou" = our family.', 'In Martinique, godparents ("marenn" & "parenn") hold lifelong family status.', ARTWORKS.greetings),
      c('Manman', 'Noun', '[mahn-mahn]', 'Mother / Mom', 'Mère / Maman', 'Manman mwen sé léspwa mwen.', 'My mother is my hope.', 'Mom, matriarch', 'Term of deep respect and affection for mother.', 'Manmi', 'Papa', 'Manman mwen', 'beginner', 'Pronounced with two crisp nasal vowels [mahn-mahn]. "Gran-manman" means grandmother.', 'Mothers and grandmothers ("gran-manman") are celebrated as keepers of home recipes and proverbs.', ARTWORKS.greetings),
      c('Papa', 'Noun', '[pah-pah]', 'Father / Dad', 'Père / Papa', 'Papa mwen ka travay an jaden.', 'My father works in the garden.', 'Dad', 'Affectionate term for father.', 'Dadi', 'Manman', 'Papa mwen', 'beginner', 'Identical spelling in English/French/Creole, spoken with open clear [ah] vowels.', 'Traditions like wooden yole building and gardening are passed proudly from papa to child.', ARTWORKS.greetings),
      c('Timanmay', 'Noun', '[tee-mahn-my]', 'Child / Children', 'Enfant / Enfants', 'Timanmay-la ka jwé an lakou-a.', 'The children are playing in the yard.', 'Youth, kids', 'Iconic Martinican Creole word for children.', 'Timoun', 'Granmoun', 'Ti-manmay lékol', 'beginner', 'Add "-la" at the end ("timanmay-la") for "the child" and "-yo" ("timanmay-yo") for "the children".', '"Timanmay" is a signature Martinican word you rarely hear outside Martinique & Guadeloupe!', ARTWORKS.greetings),
      c('Granmoun', 'Noun', '[grahn-moon]', 'Elder / Senior', 'Aîné / Personne âgée', 'Nou dwèt respekté granmoun.', 'We must respect elders.', 'Ancestors, seniors', 'Keepers of oral Creole storytelling and wisdom.', 'Ansyen', 'Timanmay', 'Pawòl granmoun', 'beginner', 'Combines "gran" (big/wise) + "moun" (person). Also describes an adult vs child.', 'Saying "Bonjou granmoun!" with warmth earns an instant smile.', ARTWORKS.greetings),
      c('Koudmen', 'Noun', '[kood-mehn]', 'Mutual aid / Solidarity', 'Entraide solidaire', 'Sé koudmen ki fè nou fò.', 'Mutual aid is what makes us strong.', 'Collective help', 'Rural communal solidarity tradition.', 'Solidarité', 'Égoyism', 'Fè an koudmen', 'intermediate', 'Literally "a stroke of the hand" — neighbors uniting freely to build, harvest, or celebrate.', 'Used in Martinique for centuries during house-raisings ("déplazé kaz") and yam harvests.', ARTWORKS.greetings),
      c('Zanmi', 'Noun', '[zahn-mee]', 'Friend', 'Ami(e)', 'Ou sé an bon zanmi pou mwen.', 'You are a good friend to me.', 'Companion, pal', 'From French "les amis", fused into a singular root noun.', 'Kanmarad', 'Lénmi', 'Bon zanmi', 'beginner', 'Notice how many Creole nouns absorbed the "z" sound from French plural "les": zanmi, zòrèy (ear), zétwal (star).', 'Close neighborhood friends also affectionately call each other "konpè" or "konmè".', ARTWORKS.greetings),
      c('Marenn / Parenn', 'Noun', '[mah-rehn / pah-rehn]', 'Godmother / Godfather', 'Marraine / Parrain', 'Marenn mwen pòté an bèl kado.', 'My godmother brought a lovely gift.', 'Mentors, spiritual elders', 'Key extended-family elders in Martinican life.', 'Fanmi', '—', 'Marenn mwen', 'intermediate', 'Unlike distant godparents elsewhere, in Martinique marenn and parenn actively guide children through school and holidays.', 'Children traditionally visit their marenn on New Year’s morning for blessings!', ARTWORKS.greetings)
    ]
  },
  home: {
    title: 'House & Home (Kaz)',
    level: 'beginner',
    image: ARTWORKS.greetings,
    cards: [
      c('Kaz', 'Noun', '[kahz]', 'House / Home', 'Maison / Case', 'Kaz-la bèl toubannman.', 'The house is completely beautiful.', 'Dwelling, cottage', 'Traditional Martinican wooden home.', 'Kay', 'Lari', 'An kaz mwen', 'beginner', 'Refers to the traditional Caribbean wooden house with decorative gingerbread trim ("dantal").', 'Saint-Pierre and Fort-de-France preserve 19th-century Creole kaz architecture.', ARTWORKS.greetings),
      c('Jaden', 'Noun', '[zhah-dehn]', 'Creole Garden', 'Jardin créole', 'Ni bèl flè nan jaden-an.', 'There are lovely flowers in the garden.', 'Orchard plot', 'Ecological mixed-crop Creole garden.', 'Tè', '—', 'Jaden kréyòl', 'beginner', 'Grows fruit trees, medicinal herbs ("rimèd razyé"), and root crops together naturally without chemicals.', 'The traditional "jaden kréyòl" is studied by agronomists worldwide as a model of biodiversity!', ARTWORKS.nature),
      c('Kwizin', 'Noun', '[kwee-zeen]', 'Kitchen', 'Cuisine', 'Manman mwen nan kwizin-lan.', 'My mother is in the kitchen.', 'Cookhouse', 'Heart of family hospitality and spice.', '—', '—', 'Kwizin kréyòl', 'beginner', 'Notice definite article "-lan" follows nasal endings like "kwizin-lan" or "jaden-an"!', 'Historically many rural kaz kept a fragrant outdoor charcoal kitchen ("fwayé").', ARTWORKS.market),
      c('Chanm', 'Noun', '[shahnm]', 'Bedroom / Room', 'Chambre', 'Chanm mwen an klè anpil.', 'My room is very bright.', 'Chamber', 'Sleeping room cooled by trade winds.', 'Pyès', '—', 'Chanm dòmi', 'beginner', 'Pronounced with a single nasalized vowel [shahnm], dropping the trailing French "-bre".', 'Wooden louvers ("persyèn") let Caribbean sea breezes cool bedrooms naturally.', ARTWORKS.greetings),
      c('Galri / Véranda', 'Noun', '[gahl-ree]', 'Porch / Veranda', 'Galerie / Véranda', 'Nou ka bwè kafé anlè galri-a.', 'We drink coffee out on the porch.', 'Balcony, front deck', 'Social heart of the Creole home facing the street.', 'Balcon', '—', 'Anlè galri-a', 'intermediate', 'Families sit on the galri at dusk ("lè brinn") to greet passing neighbors.', 'Many historic Fort-de-France balconies feature ornate wrought-iron railings.', ARTWORKS.greetings)
    ]
  },
  food: {
    title: 'Martinican Cuisine (Manjé Kréyòl)',
    level: 'intermediate',
    image: ARTWORKS.colombo,
    cards: [
      c('Manjé', 'Noun / Verb', '[mahn-zhay]', 'Food / To eat', 'Nourriture / Manger', 'Manjé-tala chwit anpil.', 'This food is very delicious.', 'Meal, cuisine', 'Both noun and action of eating.', 'Repa', 'Bwè', 'Manjé kréyòl', 'beginner', 'Works both as a noun ("an bon manjé") and a verb ("nou ka manjé").', 'Sunday family lunches in Martinique often stretch happily all afternoon!', ARTWORKS.colombo),
      c('Lanmori', 'Noun', '[lahn-moh-ree]', 'Salted codfish', 'Morue salée', 'Ti-nain lanmori sé délis Matinik.', 'Green bananas with codfish is a delicacy.', 'Salted cod', 'Essential island protein ingredient.', 'Pwason salé', 'Pwason frè', 'Akra lanmori', 'intermediate', 'Soaked overnight to remove salt, then flaked into crispy akra fritters or savory chiktay.', 'Ti-nain lanmori (green bananas + salted cod) is Martinique’s iconic Sunday breakfast!', ARTWORKS.market),
      c('Kolombo', 'Noun', '[koh-lohm-boh]', 'Colombo curry dish', 'Plat au colombo', 'Nou fè kolombo pou fèt-la.', 'We made colombo for the celebration.', 'Spiced curry stew', 'Martinique’s beloved aromatic spice dish.', 'Kari', '—', 'Kolombo kabrit', 'intermediate', 'Named after Colombo (Sri Lanka) via 19th-century Tamil heritage; uses roasted coriander, turmeric, cumin & bois d’Inde.', 'Every household has its own secret balance of "poud kolombo" and fragrant habanero!', ARTWORKS.colombo),
      c('Kasav', 'Noun', '[kah-sahv]', 'Cassava flatbread', 'Galette de manioc', 'Kasav dous an bouch mwen.', 'Cassava bread tastes sweet.', 'Manioc cake', 'Amerindian culinary heritage bread.', 'Galèt manyòk', 'Pen', 'Kasav koko', 'intermediate', 'Made from grated manioc flour toasted on hot cast-iron griddles — zero wheat flour!', 'A living gift from Martinique’s ancestral Kalinago & Taíno peoples.', ARTWORKS.tropicalMarket),
      c('Chwit', 'Adjective', '[shweet]', 'Delicious / Flavorful', 'Délicieux / Savoureux', 'Soup-la chwit toubannman!', 'The soup is totally delicious!', 'Tasty, delightful', 'Warm Martinican expression of praise.', 'Bon anpil', 'Fad', 'Chwit toubannman', 'intermediate', 'A uniquely joyful Martinican exclamation meaning top-tier tasty, lively, or stylish!', 'Try saying "Manjé-a chwit toubannman!" after a good meal and watch the cook beam.', ARTWORKS.colombo),
      c('Zaboka', 'Noun', '[zah-boh-kah]', 'Avocado', 'Avocat', 'Ban mwen an bèl zaboka mi.', 'Give me a nice ripe avocado.', 'Alligator pear', 'Creamy local staple blended into Féwòs zaboka.', '—', '—', 'Féwòs zaboka', 'intermediate', 'Absorbed the "z" sound from French "les avocats". Martinique grows giant buttery varieties!', 'Mashed with codfish and manioc flour, zaboka makes the famous spicy dip "Féwòs".', ARTWORKS.tropicalMarket),
      c('Akra', 'Noun', '[ah-krah]', 'Crispy spiced cod fritters', 'Accras de morue', 'Nou ka manjé akra cho avan diné.', 'We eat warm accras before dinner.', 'Fritters', 'Golden bite-sized island appetizer.', 'Bényé', '—', 'Akra lanmori', 'intermediate', 'Spiced with chives ("ziyon"), garlic, parsley, and bird’s eye chili — also made with malanga!', 'The name derives from West African Yoruba "àkàrà" bean cakes.', ARTWORKS.market)
    ]
  },
  market: {
    title: 'Market & Shopping (Maché)',
    level: 'intermediate',
    image: ARTWORKS.tropicalMarket,
    cards: [
      c('Maché', 'Noun', '[mah-shay]', 'Market', 'Marché', 'Annou alé nan Gran Maché Fòdfrans.', "Let's go to Fort-de-France Grand Market.", 'Marketplace', 'Vibrant covered hub for spices and produce.', 'Boutik', '—', 'Gran Maché', 'beginner', 'Also means "to walk" as a verb! Context tells you instantly whether it means market or walking.', 'Fort-de-France’s Grand Marché Couvert bursts with cinnamon bark, vanilla pods, and madras.', ARTWORKS.market),
      c('Lajan', 'Noun', '[lah-zhahn]', 'Money', 'Argent', 'Konben lajan sa kouté?', 'How much money does this cost?', 'Cash, currency', 'Used for commerce and pricing.', 'Moné', 'Gratis', 'Ban mwen lajan', 'beginner', 'From French "l’argent" — pronounced smoothly without a final t.', 'In friendly neighborhood shops, vendors still wrap change with a warm "Mèsi doudou!"', ARTWORKS.market),
      c('Achté', 'Verb', '[ahsh-tay]', 'To buy', 'Acheter', 'Mwen vlé achté bannann jòdi-a.', 'I want to buy plantains today.', 'Purchase', 'Always invariant; pairs with ka/té/ké.', 'Pran', 'Vann', 'Achté fwi', 'intermediate', 'Use "Mwen vlé achté..." (I want to buy) or "Mwen ké achté..." (I will buy).', 'Green cooking bananas are called "ti-nain", while sweet yellow bananas are "bannann jòn" or "fig".', ARTWORKS.market),
      c('Konben?', 'Interrogative', '[kohn-behn]', 'How much? / How many?', 'Combien ?', 'Konben pou dé mango?', 'How much for two mangoes?', 'What price?', 'Key market bargaining question.', 'Ki pri?', '—', 'Konben sa yé?', 'beginner', 'Short, friendly, and essential anywhere you shop: "Konben sa yé?" = How much is this?', 'Look for fragrant "mango jili" (Julie mangoes) in summer market baskets!', ARTWORKS.market),
      c('Piman', 'Noun', '[pee-mahn]', 'Chili pepper', 'Piment', 'Mété an ti bren piman sèlman!', 'Put just a little bit of chili only!', 'Hot pepper', 'Aromatic Caribbean scotch bonnet & bird’s eye chili.', 'Piman zwazo', 'Dous', 'Piman fò', 'intermediate', 'Martinique’s "piman véjétaryen" gives amazing tropical aroma with zero burn!', 'Local cooks say a drop of lime tames overly fiery piman sauce.', ARTWORKS.market)
    ]
  },
  daily: {
    title: 'Daily Routines (Lavi Chak Jou)',
    level: 'intermediate',
    image: ARTWORKS.greetings,
    cards: [
      c('Dòmi', 'Verb', '[doh-mee]', 'To sleep', 'Dormir', 'Mwen ké dòmi bonnè.', 'I will sleep early.', 'Rest, slumber', 'Daily rest verb.', 'Pòzé', 'Lévé', 'Alé dòmi', 'beginner', 'Pair with "ka" for sleeping now ("I ka dòmi") or "ké" for tonight ("Mwen ké dòmi").', 'Tropical crickets ("krikèt") serenade every evening across the island hills.', ARTWORKS.nature),
      c('Lévé', 'Verb', '[lay-vay]', 'To wake up / Rise', 'Se lever', 'Mwen ka lévé a sis è di maten.', 'I wake up at 6 in the morning.', 'Get up, stand', 'Also means to lift or rise early.', 'Doubout', 'Dòmi', 'Lévé bonmaten', 'beginner', 'Means both "wake up" and "lift/raise up" ("Lévé lanmen’w!" = Raise your hand!).', 'Fishermen in Le Prêcheur launch canoes at dawn ("douvanjou") before the sun crests.', ARTWORKS.nature),
      c('Travay', 'Verb / Noun', '[trah-veye]', 'To work / Job', 'Travailler / Travail', 'Nou ka travay an kouraj.', 'We work with courage.', 'Labor, craft', 'Describes honest daily craft.', 'Djòb', 'Ripo', 'Travay rèd', 'intermediate', 'Used seamlessly as verb ("Mwen ka travay") and noun ("Travay-la fin").', 'Traditional crafts include basketry ("vanri") in Morne-des-Esses and pottery in Trois-Îlets.', ARTWORKS.market),
      c('Bényen', 'Verb', '[behn-yehn]', 'To swim / Bathe', 'Se baigner', 'Annou alé bényen nan lanmè!', "Let's go swim in the sea!", 'Take a dip', 'Essential weekend island leisure!', 'Najé', '—', 'Bényen lanmè', 'beginner', 'Family Sundays at Les Salines or Anse Dufour are called "alé bényen" — bathing in the sea.', 'After swimming, families gather under coconut palms for sorbet and grilled fish!', ARTWORKS.nature)
    ]
  },
  music: {
    title: 'Music & Bèlè Culture (Mizik & Kilti)',
    level: 'advanced',
    image: ARTWORKS.music,
    cards: [
      c('Bèlè', 'Noun', '[beh-leh]', 'Traditional Bèlè drum & dance', 'Bèlè (danse et tambour)', 'Tanbou bèlè-a ka bat fò.', 'The bèlè drum beats strong.', 'Sainte-Marie heritage art', 'Living Afro-Martinican rhythmic heritage.', 'Mizik tradisyonèl', '—', 'Dans bèlè', 'advanced', 'Born in rural plantations and hills around Sainte-Marie, Bèlè unites dance steps, drum dialogues, and community song.', 'The Maison du Bèlè in Sainte-Marie hosts lively evening "swaré bèlè" circles open to learners!', ARTWORKS.music),
      c('Tanbou', 'Noun', '[tahn-boo]', 'Drum', 'Tambour', 'Mizisyen-an ka karésé tanbou-a.', 'The musician caresses the drum.', 'Bèlè drum', 'Carved wooden cask drum played horizontally.', '—', '—', 'Bat tanbou', 'advanced', 'Notice the nasal ending "-ou" in "tanbou". The drummer ("tanbouyé") sits straddling the drum!', 'The tanbouyé responds directly to the lead dancer’s footwork in real-time improvisation.', ARTWORKS.music),
      c('Ti-bwa', 'Noun', '[tee-bwah]', 'Rhythm hardwood sticks', 'Ti-bois (baguettes)', 'Ti-bwa-a ka ba kadans-lan.', 'The ti-bwa sets the cadence.', 'Percussion sticks', 'Bamboo/hardwood sticks struck on drum back.', '—', '—', 'Jwé ti-bwa', 'advanced', 'Literally "little wood" — two hardwood sticks beaten on bamboo or the wooden back of the drum.', 'It plays the unchanging rhythmic timeline ("kata") that anchors the entire circle.', ARTWORKS.music),
      c('Chanté', 'Verb / Noun', '[shahn-tay]', 'To sing / Song', 'Chanter / Chant', 'Tout moun ka chanté an lawonn.', 'Everyone sings in the circle.', 'Chant, lavwa', 'Call-and-response choral singing.', 'Lavwa', 'Pézé', 'Chanté ansanm', 'intermediate', 'One lead voice ("lavwa") calls out lines while the circle ("répondè") answers in harmony.', 'Christmas caroling gatherings called "Chanté Nwèl" bring entire neighborhoods together in December!', ARTWORKS.music),
      c('Zouk', 'Noun', '[zook]', 'Zouk music & joyful gathering', 'Zouk / Fête dansante', 'Mizik zouk fè tout moun dansé.', 'Zouk music got everyone dancing.', 'Caribbean dance genre', 'Born in the French Antilles in the 1980s — originally meant a lively neighborhood party!', 'Bal', '—', 'Dansé zouk', 'intermediate', 'Before becoming a global music genre via Kassav’, "zouk" meant an upbeat local house dance.', 'Kassav’ blended carnival biguine, mazurka, and modern synthesizers into a worldwide anthem.', ARTWORKS.music)
    ]
  },
  history: {
    title: 'Martinique History (Istwa Matinik)',
    level: 'master',
    image: ARTWORKS.cap110,
    cards: [
      c('Libèté', 'Noun', '[lee-beh-tay]', 'Freedom / Emancipation', 'Liberté / Émancipation', '22 Mé sé fèt libèté an Matinik.', 'May 22 is Emancipation Day in Martinique.', 'Liberation', 'Commemorating 1848 slave insurrection victory.', 'Lémansipasyon', 'Èsklavaj', '22 Mé Libèté', 'master', 'May 22, 1848 is Martinique’s proudest national holiday, won by enslaved people rising up before decree arrival.', 'Romain, an enslaved drummer, sounded the conch horn and revolt at Le Prêcheur.', ARTWORKS.cap110),
      c('Mawon', 'Noun / Adj', '[mah-rohn]', 'Maroon freedom fighter', 'Marron / Résistant', 'Mawon-yo té doubout pou libèté.', 'The Maroons stood tall for freedom.', 'Resister', 'Escaped freedom fighters of the lush mornes.', 'Rézistan', '—', 'Nèg mawon', 'master', 'Means both historical freedom seekers in the forested mountains and bold independence today.', 'Notice "mawon" also names Martinique’s deep chestnut brown hue!', ARTWORKS.grandRiviere),
      c('Zansèt', 'Noun', '[zahn-seht]', 'Ancestors', 'Ancêtres', 'Nou ka onoré mémwa zansèt nou.', 'We honor the memory of our ancestors.', 'Forebears', 'Honored in Cap 110 and cultural ceremonies.', 'Granmoun lontan', 'Désandan', 'Mémwa zansèt', 'master', 'Honoring zansèt connects Kalinago, African, Indian, and island-born heritage across time.', 'Monumental white statues at Cap 110 in Le Diamant gaze east across the Atlantic in remembrance.', ARTWORKS.cap110),
      c('Konk Lanbi', 'Noun', '[kohnk lahn-bee]', 'Conch shell horn', 'Conque de lambi', 'Son lanbi-a té ka révéyé tout mòn-yo.', 'The conch horn sound awakened all the hills.', 'Signal horn', 'Used historically for mountain signals and freedom calls.', 'Kòn', '—', 'Souflé lanbi', 'advanced', 'Carved from the giant queen conch shell; produces a deep, resonant tone audible miles across valleys.', 'Today you still hear lanbi horns at Bèlè festivals and Tour des Yoles finishes!', ARTWORKS.dictionary)
    ]
  },
  verbs: {
    title: 'Essential Action Verbs (Vèb)',
    level: 'intermediate',
    image: ARTWORKS.dictionary,
    cards: [
      c('Palé', 'Verb', '[pah-lay]', 'To speak / Talk', 'Parler', 'Mwen ka palé Kréyòl Matinik.', 'I speak Martinican Creole.', 'Converse', 'Core verb; invariant before particles ka/té/ké.', 'Kozé', 'Té kò’w', 'Palé klè', 'beginner', 'Drop the French "-r": parler -> palé. Pair with "ka" (now), "té" (past), "ké" (future).', '"Palé bèl" means speaking eloquently, while "palé an tjè" means speaking from the heart.', ARTWORKS.dictionary),
      c('Kouté', 'Verb', '[koo-tay]', 'To listen', 'Écouter', 'Kouté granmoun pou pran leson.', 'Listen to elders to learn.', 'Heed, hear', 'Vital for oral transmission.', 'Tann', 'Pa kouté', 'Kouté mizik', 'beginner', 'Distinct from "tann" (to hear passively): "kouté" is attentive, respectful listening.', 'Elders begin tales with "Kouté pou tann, tann pou konprann!"', ARTWORKS.dictionary),
      c('Vini', 'Verb', '[vee-nee]', 'To come', 'Venir', 'Vini wè mwen lakay mwen!', 'Come see me at my home!', 'Arrive', 'Warm hospitality invitation.', 'Rivé', 'Alé', 'Vini doudou', 'beginner', 'Short, welcoming command or verb — opposite of "alé" (to go).', 'Combined with "rivé" it means "to arrive" or "turn out".', ARTWORKS.greetings),
      c('Konnèt', 'Verb', '[koh-neht]', 'To know / Be familiar with', 'Connaître', 'Ou konnèt listwa peyi-a?', 'Do you know the island’s history?', 'Recognize', 'Distinguished from "sav" (know a fact).', 'Sav', 'Bliyé', 'Konnèt moun', 'intermediate', 'Use "konnèt" for people, places, and histories; use "sav" for facts and skills ("Mwen sav najé").', 'Mirroring French connaître vs savoir, mastered cleanly in two words!', ARTWORKS.dictionary),
      c('Aprann', 'Verb', '[ah-prahn]', 'To learn / To teach', 'Apprendre', 'Nou ka aprann Kréyòl ansanm!', 'We are learning Creole together!', 'Study, instruct', 'Means both learning and teaching depending on context.', 'Etidyé', 'Bliyé', 'Aprann palé', 'beginner', '"Mwen ka aprann Kréyòl" (I am learning) and "Li ka aprann mwen" (They teach me).', 'Shared learning in pairs ("nou ansanm") builds fluency twice as fast.', ARTWORKS.dictionary)
    ]
  },
  adjectives: {
    title: 'Descriptive Adjectives (Adjèktif)',
    level: 'intermediate',
    image: ARTWORKS.nature,
    cards: [
      c('Bèl', 'Adjective', '[behl]', 'Beautiful / Lovely', 'Beau / Belle', 'Plaj Salin-lan bèl toubannman.', 'Salines beach is completely beautiful.', 'Handsome, fine', 'Placed before or after nouns.', 'Jòlòt', 'Lèd', 'Bèl peyi', 'beginner', 'Notice "bèl" stays identical for masculine and feminine nouns ("an bèl kaz", "an bèl jou").', '"Bèl pawòl" means uplifting, poetic words!', ARTWORKS.nature),
      c('Fò', 'Adjective', '[foh]', 'Strong / Loud / Skilled', 'Fort(e)', 'Van-an ka souflé fò anlè kòt-la.', 'The wind blows strong along the coast.', 'Powerful', 'Used both physically and culturally.', 'Kòstò', 'Fèb', 'Kenbe fò', 'beginner', 'Follows verbs as an adverb too: "Palé fò!" = Speak up loudly!', '"Kenbe fò!" is used to encourage friends going through big exams or life moments.', ARTWORKS.music),
      c('Cho', 'Adjective', '[shoh]', 'Hot / Warm / Lively', 'Chaud(e)', 'Solèy-la cho jòdi-a!', 'The sun is hot today!', 'Spicy, energetic', 'Also describes vibrant music or chili.', 'Chofé', 'Frè / Fwèt', 'Solèy cho', 'beginner', 'Silent trailing consonants drop cleanly in GEREC spelling: chaud -> cho.', 'During carnival ("Kannaval"), lively street rhythms are praised as "cho toubannman!"', ARTWORKS.music),
      c('Piti / Ti', 'Adjective', '[pee-tee]', 'Small / Little', 'Petit(e)', 'Ban mwen an ti bren dlo.', 'Give me a little bit of water.', 'Gentle', 'Short form "ti-" conveys affection (ti-kè).', 'Ti bren', 'Gran', 'An ti moman', 'beginner', 'Put "ti" BEFORE nouns to sound warm and friendly ("an ti kafé", "ti-kè mwen" = little heart).', 'Almost every affectionate nickname in Martinique begins with "Ti-"!', ARTWORKS.greetings)
    ]
  },
  numbers: {
    title: 'Numbers & Counting (Nonm)',
    level: 'beginner',
    image: ARTWORKS.market,
    cards: [
      c('Youn / An', 'Number', '[yoon / ahn]', 'One / A', 'Un / Une', 'Ban mwen youn souplé.', 'Give me one please.', 'Single', '"An" functions as article "a", "youn" when counting alone.', 'Sèl', 'Zéro', 'Youn apré lòt', 'beginner', 'Use "an" before nouns ("an mango"), and "youn" at the end or when counting ("youn, dé, twa").', 'Never confuse Martinican "an" with Haitian "yon" — "an" is pure Martinican Creole!', ARTWORKS.market),
      c('Dé', 'Number', '[day]', 'Two', 'Deux', 'Nou ni dé poul nan lakou-a.', 'We have two hens in the yard.', 'A pair', 'Clean nasal-free vowel [day].', 'An pè', '—', 'Dé ti mo', 'beginner', 'Always pronounced cleanly like English "day" without rounding your lips.', '"Dé ti mo" means "a couple quick words".', ARTWORKS.market),
      c('Twa', 'Number', '[twah]', 'Three', 'Trois', 'Sé twa éwo pou mango-a.', "It's three euros for the mangoes.", 'Trio', 'Used daily in market prices.', '—', '—', 'Twa fwa', 'beginner', 'Crisp single syllable [twah] — remember "w" replaces French R in GEREC!', 'Counting mangoes and avocados at the market is great daily practice.', ARTWORKS.market),
      c('Kat', 'Number', '[kaht]', 'Four', 'Quatre', 'Kat zanmi ka alé Lémaren.', 'Four friends are going to Le Marin.', 'Quartet', 'Clear crisp final t.', '—', '—', 'Kat kwen peyi-a', 'beginner', 'Drops the trailing French "-re", leaving crisp [kaht].', '"Kat kwen peyi-a" means "the four corners of the island".', ARTWORKS.market),
      c('Senk', 'Number', '[sehnk]', 'Five', 'Cinq', 'Mwen ka vini a senk è.', "I'm coming at five o'clock.", '—', 'Standard counting number five.', '—', '—', 'Senk minit', 'beginner', 'Pairs directly with "è" (hour) for telling time: "senk è" = 5 o’clock!', 'Early island workdays often wrap up around 4 or 5 PM for beach swims.', ARTWORKS.market),
      c('Dis', 'Number', '[dees]', 'Ten', 'Dix', 'Nou ni dis minit pou rivé.', 'We have ten minutes to arrive.', 'Tenth', 'Clean counting anchor ten.', '—', '—', 'Dis éwo', 'beginner', 'Always sound the final "s" [dees] when counting alone or before nouns.', 'Helpful for bus fares and market totals!', ARTWORKS.market)
    ]
  },
  time: {
    title: 'Time & Seasons (Lè & Dat)',
    level: 'intermediate',
    image: ARTWORKS.nature,
    cards: [
      c('Jòdi-a', 'Adverb', '[zhoh-dee-ah]', 'Today', "Aujourd'hui", 'Jòdi-a fè bèl tan.', 'Today the weather is lovely.', 'This day', 'Always carries "-a" definite suffix.', 'Maten-an', 'Yè / Dèmen', 'Jòdi-a menm', 'beginner', 'Pronounced smoothly in three syllables [zhoh-dee-ah] — always keep the final "-a"!', 'Great opener: "Kouman ou yé jòdi-a?" (How are you today?).', ARTWORKS.greetings),
      c('Dèmen', 'Adverb', '[deh-mehn]', 'Tomorrow', 'Demain', 'Nou ka wè dèmen si Bondyé vlé!', 'See you tomorrow God willing!', 'Next day', 'Used in hopeful farewells.', 'Lòt jou', 'Yè', 'A dèmen', 'beginner', 'Pairs naturally with future marker "ké": "Dèmen mwen ké vini".', 'Short farewell "A dèmen!" is heard outside every school gate and office.', ARTWORKS.greetings),
      c('Yè', 'Adverb', '[yeh]', 'Yesterday', 'Hier', 'Yè swa nou té ka dansé bèlè.', 'Last night we were dancing bèlè.', 'Past day', 'Pairs naturally with past marker "té".', 'Avan yè', 'Dèmen', 'Yè oswa', 'intermediate', 'Pair "yè" with "té" (past) or "té ka" (was doing) for effortless storytelling!', '"Yè oswa" means last night.', ARTWORKS.music),
      c('Lontan', 'Adverb', '[lohn-tahn]', 'A long time ago / Long ago', 'Autrefois / Longtemps', 'Lontan granmoun té ka rakonté kont.', 'Long ago elders told folktales.', 'Olden days', 'Evokes treasured oral memory.', 'Avan', 'Konnyé-a', 'Tan lontan', 'intermediate', '"Tan lontan" literally means "olden times" — treasured in Martinican folklore and songs.', 'Storytellers open tales about olden days with "Krik? — Krak!"', ARTWORKS.music)
    ]
  },
  colors: {
    title: 'Island Colors (Koulè)',
    level: 'beginner',
    image: ARTWORKS.nature,
    cards: [
      c('Wouj', 'Adjective', '[woozh]', 'Red', 'Rouge', 'Flè balizyé-a wouj vif.', 'The heliconia flower is bright red.', 'Crimson', 'Vibrant color on traditional yole sails.', 'Kramwazi', 'Blan', 'Wouj Matinik', 'beginner', 'Remember Martinican "w" replaces French R in front of vowels: rouge -> wouj!', 'Red balisier (heliconia) flowers bloom wild along northern rainforest trails.', ARTWORKS.nature),
      c('Vè', 'Adjective', '[veh]', 'Green', 'Vert', 'Mòn Matinik vè tout lannen-an.', 'Martinique’s hills stay green all year.', 'Emerald', 'From rainforest ferns to sugarcane.', 'Vèdoyant', '—', 'Bwa vè', 'beginner', 'Short crisp vowel [veh] — never pronounce the trailing t!', 'Martinique’s lush emerald peaks earned it the nickname "Green Pearl of the Antilles".', ARTWORKS.nature),
      c('Blé', 'Adjective', '[blay]', 'Blue', 'Bleu', 'Lanmè Karayib-la blé toubannman.', 'The Caribbean Sea is deep blue.', 'Azure', 'Echoes turquoise lagoons of Sainte-Anne.', 'Tirkiz', '—', 'Syèl blé', 'beginner', 'Open clean [blay] vowel — used for sky ("syèl blé") and deep sea ("lanmè blé").', 'At Anse Michel and Sainte-Anne, turquoise shallows shift from emerald to cobalt blue.', ARTWORKS.nature),
      c('Jòn', 'Adjective', '[zhohn]', 'Yellow', 'Jaune', 'Solèy Matinik jòn kou lò.', 'Martinique’s sun is yellow as gold.', 'Golden', 'Color of ripe mango and citrus.', 'Doré', 'Nwè', 'Jòn sitron', 'beginner', 'Crisp single syllable [zhohn] matching golden madras stripes and ripe mangoes.', 'Madras cloth weaves canary yellow, crimson, and indigo into sunny island patterns.', ARTWORKS.market)
    ]
  },
  weather: {
    title: 'Tropical Weather (Tan-an)',
    level: 'intermediate',
    image: ARTWORKS.weatherBay,
    cards: [
      c('Lapli', 'Noun', '[lah-plee]', 'Rain', 'Pluie', 'Lapli ka tonbé anlè Mònwouj.', 'Rain is falling over Morne-Rouge.', 'Shower, downpour', 'Short tropical showers are "ti grin lapli".', 'Grin lapli', 'Solèy', 'Lapli fin', 'beginner', 'Combines French "la pluie" into one word; say "Lapli ka tonbé!" when a shower starts.', 'Quick warm showers often create double rainbows over Fort-de-France bay!', ARTWORKS.weatherBay),
      c('Solèy', 'Noun', '[soh-leye]', 'Sun', 'Soleil', 'Solèy-la ka kléré bèl.', 'The sun is shining bright.', 'Sunshine', 'Vital energy of Caribbean harvests.', 'Chalè', 'Lapli', 'Solèy lévé', 'beginner', 'Ends in a gentle "-y" glide [soh-leye].', 'Martinique enjoys nearly 3,000 hours of tropical sunshine a year!', ARTWORKS.weatherBay),
      c('Alizé / Van', 'Noun', '[vahn]', 'Trade wind / Breeze', 'Alizé / Vent', 'Bèl ti van-an ka fréchi kaz-la.', 'The lovely breeze cools the house.', 'Island breeze', 'Atlantic trade winds cool the eastern shore.', 'Bris', 'Kalmi', 'Van lanmè', 'intermediate', 'Notice "van" is nasal [vahn] — pairs with "-an" definite suffix ("van-an").', 'Eastern trade winds ("alizé") power traditional racing yoles along the Atlantic coast.', ARTWORKS.weatherBay),
      c('Siklòn', 'Noun', '[see-klohn]', 'Hurricane / Cyclone', 'Cyclone', 'Nan sézon siklòn nou ka paré.', 'In hurricane season we prepare.', 'Storm', 'Season spans June to November.', 'Lòraj', 'Kalmi', 'Tan siklòn', 'intermediate', 'Follows GEREC spelling "siklòn" cleanly instead of "cyclone".', 'Island communities practice "koudmen" preparedness together before every rainy season.', ARTWORKS.weatherBay)
    ]
  },
  animals: {
    title: 'Island Fauna (Bèt Matinik)',
    level: 'advanced',
    image: ARTWORKS.nature,
    cards: [
      c('Krab', 'Noun', '[krahb]', 'Land Crab', 'Crabe de terre', 'Krab farisi sé manjé Pak!', 'Stuffed crabs are an Easter delicacy!', 'Matoutou crab', 'Celebrated in traditional Easter dish Matoutou.', 'Matoutou', '—', 'Krab farisi', 'intermediate', 'Spelled with "k" and "b" — pairs with rice and colombo spices at Easter beaches!', 'Families camp along the coast at Easter ("Pak") to cook traditional Matoutou de crabe.', ARTWORKS.market),
      c('Manikou', 'Noun', '[mah-nee-koo]', 'Martinican Opossum', 'Manicou (opossum)', 'Manikou-a ka sòti lannwit.', 'The manicou comes out at night.', 'Didelphis marsupialis', 'Nocturnal marsupial in Martinican folklore.', '—', '—', 'Bèt an bwa', 'advanced', 'Word of Kalinago origin naming the island’s nocturnal marsupial.', 'Clever "Konpè Manikou" appears in traditional Creole evening folktales!', ARTWORKS.nature),
      c('Kolibri', 'Noun', '[koh-lee-bree]', 'Hummingbird', 'Colibri', 'Ti kolibri-a ka bwè flè ibiskis.', 'The hummingbird drinks from hibiscus flowers.', 'Fou-fou', 'Sacred emblem of Martinique’s biodiversity.', 'Fou-fou', '—', 'Ti kolibri', 'beginner', 'Affectionately also called "ti fou-fou" because its wings beat so fast they hum!', 'Martinique hosts four stunning hummingbird species including the emerald-throated Madère.', ARTWORKS.nature),
      c('Pwason', 'Noun', '[pwah-sohn]', 'Fish', 'Poisson', 'Pèchè-a pòté pwason frè.', 'The fisher brought fresh fish.', 'Catch of the sea', 'Staple in court-bouillon and blaff.', 'Vivano · Taza', '—', 'Pwason frè', 'beginner', 'Note the "w" glide [pwah-sohn]. Grilled red snapper ("vivano") is a coastal favorite.', 'In fishing villages like Case-Pilote, conch horns signal when boats return with fresh catch.', ARTWORKS.market)
    ]
  },
  nature: {
    title: 'Volcanic Nature & Sea (Lanati)',
    level: 'advanced',
    image: ARTWORKS.nature,
    cards: [
      c('Mòn', 'Noun', '[mohn]', 'Hill / Mountain', 'Morne / Colline', 'Dèyè mòn, toujou ni mòn.', 'Beyond every hill lies another hill.', 'Volcanic ridge', 'Central word in Martinican topography & proverbs.', 'Montany', 'Plenn', 'Anlè mòn-lan', 'intermediate', 'Names dozens of towns across Martinique: Morne-Rouge (Mònwouj), Gros-Morne (Gwomòn), Morne-Vert.', 'Volcanic slopes shelter cool cloud forests and wild tree ferns!', ARTWORKS.nature),
      c('Lanmè', 'Noun', '[lahn-meh]', 'The Sea / Ocean', 'La mer', 'Lanmè Karayib-la kalm maten-an.', 'The Caribbean Sea is calm this morning.', 'Sea waters', 'Separates Caribbean calm shore from wild Atlantic.', 'Loséan', 'Latè', 'Bò lanmè-a', 'beginner', 'Combines "la mer" into a single word "lanmè" — "bò lanmè-a" means the seaside.', 'Martinique’s west coast faces calm Caribbean waters, while the east faces the Atlantic.', ARTWORKS.nature),
      c('Larivyè', 'Noun', '[lah-ree-vyeh]', 'River', 'Rivière', 'Dlo larivyè-a frè kou glas.', 'The river water is cool as ice.', 'Stream', 'Flows down Mount Pelée and the Pitons du Carbet.', 'Kaskad', '—', 'Larivyè Gwanrivyè', 'intermediate', 'Even towns like Rivière-Pilote (Rivyè-Pilòt) and Grand’Rivière celebrate these mountain streams.', 'Over 70 rivers tumble down Martinique’s volcanic peaks!', ARTWORKS.nature),
      c('Pyé-bwa', 'Noun', '[pyay-bwah]', 'Tree', 'Arbre', 'Nou ka rété anba lonbraj pyé-bwa.', 'We rest under the shade of the tree.', 'Woodland tree', 'Notice "pyé" prefixes most fruit trees (pyé-mango).', 'Bwa', 'Flè', 'Anba pyé-bwa', 'intermediate', '"Pyé-" (foot/trunk) prefixes almost any fruit to name the tree: pyé-koko (coconut palm), pyé-mango!', 'Anba lonbraj pyé-bwa (under tree shade) is everyone’s favorite afternoon hangout.', ARTWORKS.nature),
      c('Flè', 'Noun', '[fleh]', 'Flower', 'Fleur', 'Matinik sé lilèt a flè.', 'Martinique is the island of flowers.', 'Blossom', 'Honors the island’s indigenous name Madinina.', 'Bouké', '—', 'Flè ibiskis', 'beginner', 'Simple crisp syllable [fleh] — never round your lips heavily.', 'Tropical hibiscus, bougainvillea, and red balisier bloom year-round in every parish.', ARTWORKS.nature)
    ]
  },
  clothing: {
    title: 'Traditional Attire (Rad & Lèz)',
    level: 'advanced',
    image: ARTWORKS.market,
    cards: [
      c('Madras', 'Noun', '[mah-drahs]', 'Madras plaid textile', 'Tissu madras', 'Tèt-maré madras-la ni kat pwent!', 'The madras headwrap has four points!', 'Checkered heritage cloth', 'Each tied point historically signals marital availability.', 'Tèt-maré', '—', 'Ròb madras', 'advanced', 'Arrived from Madras (Chennai, India) in the 19th century and became a centerpiece of Martinican identity.', '1 point = free, 2 = taken, 3 = married, 4 = heart open to romance!', ARTWORKS.market),
      c('Bakwa', 'Noun', '[bahk-wah]', 'Woven straw hat', 'Chapeau bakoua', 'Chapo bakwa ka pwotéjé kont solèy.', 'The bakoua hat shields from the sun.', 'Fisherman/farmer hat', 'Crafted from dried pandanus leaves.', 'Chapo pay', '—', 'Chapo bakwa', 'advanced', 'Hand-braided from pandanus ("bakwa") leaves harvested near the coast.', 'Conical shape sheds both scorching sun and sudden tropical showers!', ARTWORKS.market),
      c('Ròb', 'Noun', '[rohb]', 'Dress / Gown', 'Robe', 'Li mété bèl ròb gran wòb li pou bèlè.', 'She wore her grand robe for the bèlè dance.', 'Traditional gown', 'Worn in cultural processions and folkloric dance.', 'Kostim', 'Pantalon', 'Gran wòb', 'intermediate', 'Traditional "gran wòb" dresses swirl dramatically during Bèlè and Mazurka dances.', 'White lace petticoats ("jipon") peek out beneath bright madras skirts.', ARTWORKS.music),
      c('Soulyé', 'Noun', '[sool-yay]', 'Shoes', 'Chaussures', 'Mété soulyé ou avan sòti.', 'Put on your shoes before going out.', 'Footwear', 'Everyday wardrobe noun.', 'Sandal', 'Pyé-atè', 'Bèl soulyé', 'beginner', 'Fun proverb: "Sé soulyé ki sav si chòsèt ni twou" (Only the shoe knows if the sock has holes!).', 'At the beach, everyone kicks off soulyé to walk barefoot ("pyé-atè").', ARTWORKS.greetings)
    ]
  },
  transport: {
    title: 'Island Travel & Boats (Transpò)',
    level: 'advanced',
    image: ARTWORKS.nature,
    cards: [
      c('Yòl', 'Noun', '[yohl]', 'Traditional Martinican Yole', 'Yole ronde', 'Yòl-la ka glisé anlè vag-la!', 'The yole glides across the waves!', 'Sailing craft', 'UNESCO-recognized wooden boat without keel.', 'Kannòt', 'Loto', 'Tour des Yoles', 'advanced', 'Inspired by Kalinago dugouts and French coastal yawls — steered solely with a single stern paddle!', 'Inscribed on UNESCO’s Intangible Cultural Heritage list in 2020.', ARTWORKS.nature),
      c('Loto', 'Noun', '[loh-toh]', 'Car / Automobile', 'Voiture', 'Nou pran loto pou alé Sentann.', 'We took the car to go to Sainte-Anne.', 'Vehicle', 'Daily transport across the island.', 'Machin', 'A pyé', 'An loto-a', 'beginner', 'Notice "l’auto" fused cleanly into "loto". Add "-a" for "the car" ("loto-a").', 'Driving across Martinique’s winding mountain Trace road passes lush giant tree ferns.', ARTWORKS.nature),
      c('Bato', 'Noun', '[bah-toh]', 'Ferry / Boat', 'Bateau / Vedette', 'Bato-a ka travèsé bè Fòdfrans.', 'The ferry crosses Fort-de-France bay.', 'Vessel', 'Commuter vedettes connect Trois-Îlets and capital.', 'Vèdèt', 'Avyon', 'Pran bato', 'beginner', 'Quick 20-minute commuter boats ("vèdèt") cross Fort-de-France bay daily with ocean breezes.', 'From the water you see Fort Saint-Louis rising dramatically over the capital!', ARTWORKS.nature),
      c('Chimèn', 'Noun', '[shee-mehn]', 'Road / Path / Trail', 'Chemin / Route', 'Chimèn Mònwouj ka monté nan nyaj.', 'The Morne-Rouge road climbs into the clouds.', 'Mountain trail', 'Used both literally and metaphorically.', 'Lawout', '—', 'Bon chimèn', 'intermediate', 'Saying "Bon chimèn!" wishes a traveler a safe, blessed journey.', 'Historic stone footpaths still link coastal villages to lush northern waterfalls.', ARTWORKS.nature)
    ]
  },
  proverbs: {
    title: 'Martinican Proverbs (Pawòl Matinik)',
    level: 'master',
    image: ARTWORKS.dictionary,
    cards: [
      c('Dèyè mòn, toujou ni mòn', 'Proverb', '[deh-yeh mohn too-zhoo nee mohn]', 'Beyond every mountain lies another mountain', 'Derrière les mornes, il y a toujours des mornes', 'Pa dékourajé: dèyè mòn, toujou ni mòn!', "Don't lose heart: keep climbing forward!", 'Perseverance wisdom', 'One of the most famous Caribbean proverbs of resilience.', 'Kouraj', '—', 'Pawòl lontan', 'master', 'Reminds listeners that life brings challenge after challenge — keep steady courage like climbing hills.', 'Born among Maroon freedom fighters navigating Martinique’s steep volcanic ridges.', ARTWORKS.nature),
      c('Zafè kabrit pa zafè mouton', 'Proverb', '[zah-feh kah-breet pah zah-feh moo-tohn]', 'The goat’s business is not the sheep’s', 'Les affaires du cabri ne sont pas celles du mouton', 'Rété an zafè’w: zafè kabrit pa zafè mouton.', 'Mind your own path calmly.', 'Mind your own affairs', 'Advice against meddling in another person’s life.', 'Okipé zafè’w', '—', 'Pawòl sajès', 'master', 'Playful barnyard metaphor teaching healthy boundaries and self-respect.', 'Goats and sheep graze side by side in pastures yet keep distinct natures!', ARTWORKS.dictionary),
      c('Sé kouto sèl ki sav sa ki an tchè jiromon', 'Proverb', '[say koo-toh sehl kee sahv]', 'Only the knife knows what lies inside the pumpkin', 'Seul le couteau sait ce qui est au cœur du giraumon', 'Nou pa pé jijé pèsonn: sé kouto sèl ki sav.', 'We cannot judge anyone: only they know their heart.', 'Empathy proverb', 'Teaches compassion because hidden struggles remain unseen.', 'Konpasyon', '—', 'An tchè jiromon', 'master', 'On the outside a green pumpkin looks tough and quiet; only opening it reveals its sweetness inside.', 'One of the deepest proverbs of empathy in Martinican oral literature.', ARTWORKS.market),
      c('Tout bèt an lanmè ka manjé moun, mé sé réken ki ni mové non', 'Proverb', '[toot beht ahn lahn-meh]', 'All sea creatures nibble, yet only the shark gets blamed', 'Tous les poissons mangent, seul le requin a mauvaise réputation', 'Pwan gad — sé réken sèl ki ni mové non.', 'Scapegoats carry blame for what many do quietly.', 'Social satire proverb', 'Classic Martinican proverb on unfair reputation.', '—', '—', 'Lanmè Matinik', 'master', 'Humorous ocean wisdom pointing out how unfair rumors stick to one loud reputation.', 'Spoken with a knowing wink during lively village debates!', ARTWORKS.nature),
      c('Ti hach ka bat gwo bwa', 'Proverb', '[tee ahsh kah baht gwoh bwah]', 'A small axe fells a mighty tree', 'Petite hache abat grand bois', 'Kontinyé chak jou: ti hach ka bat gwo bwa!', 'Keep practicing daily: small steady steps conquer big goals!', 'Consistency proverb', 'Encourages steady patient effort over rushing.', 'Pasyans', '—', 'Ti pa ti pa', 'master', 'Encourages language learners too: 5 minutes of Kréyòl every day builds real fluency!', 'Pairs beautifully with "Ti pa ti pa, zwazo ka fè nich li" (Little by little, the bird builds its nest).', ARTWORKS.dictionary)
    ]
  },
  expressions: {
    title: 'Everyday Idioms (Èksprésyon Kouran)',
    level: 'intermediate',
    image: ARTWORKS.greetings,
    cards: [
      c('An ti bren', 'Idiom', '[ahn tee brehn]', 'A little bit / Just a touch', 'Un petit peu', 'Ban mwen an ti bren piman souplé.', 'Give me just a little chili please.', 'A pinch, slightly', 'Quintessential Martinican quantity phrase.', 'An ti kal', 'Anpil', 'An ti bren dlo', 'beginner', 'Useful for food, time, or language ("Mwen ka palé Kréyòl an ti bren" = I speak a little Creole!).', 'Hearing "an ti bren" instantly marks someone as speaking genuine Martinican Creole!', ARTWORKS.market),
      c('Pa ni pwoblèm', 'Expression', '[pah nee pwoh-blehm]', 'No problem / Anytime', 'Pas de problème', 'Pa ni pwoblèm doudou, nou ansanm!', 'No problem sweetheart, we are together!', "You're welcome", 'Warm reassurance of hospitality.', 'Pa ni traka', 'Ni pwoblèm', 'Pa ni pwoblèm ditou', 'beginner', '"Pa ni..." means "There isn’t / Don’t have" — the universal helper for polite answers!', 'Say it whenever someone thanks you ("Mèsi anpil!" -> "Pa ni pwoblèm!").', ARTWORKS.greetings),
      c('Sé sa menm!', 'Expression', '[say sah mehm]', 'That is exactly right!', "C'est exactement ça !", 'Sé sa menm ou ka chaché!', 'That is exactly what you were looking for!', 'Spot on!, True!', 'Punchy conversational affirmation.', 'Sé vré', 'Pa sa ditou', 'Sé sa menm manmay', 'intermediate', 'Pronounce "menm" with a crisp nasal hum [mehm]. Great way to agree enthusiastically!', 'Also heard during quizzes and lively Bèlè applause!', ARTWORKS.music),
      c('Toubannman', 'Adverb', '[too-bahn-mahn]', 'Completely / Utterly / Truly', 'Complètement / Tout à fait', 'Paysaj Senpyè bèl toubannman!', 'Saint-Pierre’s scenery is utterly stunning!', 'Through and through', 'Distinctively expressive Martinican intensifier.', 'Anpil · Toutafè', 'Tibrin', 'Bèl toubannman', 'intermediate', 'Place at the end of a compliment to turn it into pure enthusiasm: "Chwit toubannman!"', 'Beloved across all 34 communes of Martinique!', ARTWORKS.nature),
      c('Doudou', 'Term of endearment', '[doo-doo]', 'Sweetheart / Dear', 'Chéri(e) / Doudou', 'Mèsi doudou, pasé an bèl jounen!', 'Thanks dear, have a lovely day!', 'Darling, friend', 'Spoken warmly by elders, vendors, and loved ones.', 'Chéri · Ti-kè', '—', 'Bonjou doudou', 'beginner', 'Used kindly across generations — even older women at the market greet young shoppers as "doudou".', 'Comes from "doux" (sweet/gentle) doubled for extra affection!', ARTWORKS.greetings),
      c('Plis fòs!', 'Expression', '[plees fohs]', 'More strength / Keep going!', 'Courage / Force à toi !', 'Plis fòs pou tout zélèv-la!', 'More strength to all the learners!', 'Stay strong!', 'Uplifting modern & traditional Martinican encouragement.', 'Kouraj!', '—', 'Plis fòs manmay!', 'intermediate', 'Shared when cheering friends at yole races, community projects, or study milestones.', 'Combines "plis" (more) and "fòs" (strength/energy).', ARTWORKS.music)
    ]
  }
};

