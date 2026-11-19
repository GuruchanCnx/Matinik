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

// Complete 20 Flashcard Decks (fixes 11 previously missing decks + enriches all with GEREC fields)
function c(word, pos, pronounce, en, fr, ex, exTrans, other = '', def = '', syn = '', ant = '', coll = '') {
  return {
    word, pos, pronounce, en, fr, ex,
    exampleTranslation: exTrans || en,
    otherTranslations: other || `${fr} · ${en}`,
    definition: def || `Authentic Martinican Creole (Kréyòl Matinik) expression meaning "${en}".`,
    synonyms: syn || '—',
    antonyms: ant || '—',
    collocations: coll || ex
  };
}

export const FLASHCARD_DECKS = {
  greetings: {
    title: 'Greetings & Salutations (Salitasyon)',
    cards: [
      c('Bonjou', 'Greeting', '[bohn-zhoo]', 'Good morning / Hello', 'Bonjour', 'Bonjou manman, kouman ou yé?', 'Good morning Mom, how are you?', 'Good day', 'Respectful daytime greeting in Martinique.', 'Sali', 'A plita', 'Bonjou tout moun'),
      c('Bonswa', 'Greeting', '[bohn-swah]', 'Good evening', 'Bonsoir', 'Bonswa tout moun!', 'Good evening everyone!', 'Good afternoon/evening', 'Greeting used from late afternoon through evening.', 'Bonjou', 'Bonn nwit', 'Bonswa doudou'),
      c('Kouman ou yé?', 'Phrase', '[koo-mahn oo yay]', 'How are you?', 'Comment vas-tu ?', 'Kouman ou yé jòdi-a?', 'How are you today?', 'How are you holding up?', 'Standard warm inquiry about well-being.', "Sa k'ap fèt?", '—', 'Kouman zòt yé?'),
      c("M'ap kenbe", 'Idiom', '[mahp kahn-bay]', 'Doing well / Hanging in there', 'Je vais bien / Je tiens bon', "M'ap kenbe rèd, mèsi anpil!", "I'm holding strong, thank you!", 'Staying strong', 'Reflects buoyant Martinican resilience.', 'Mwen anfòm', 'Mwen las', "M'ap kenbe doudou"),
      c("Sa k'ap fèt?", 'Greeting', '[sah kahp feht]', "What's up? / What's new?", 'Quoi de neuf ?', "Sa k'ap fèt frè mwen?", "What's up my brother?", "What's happening?", 'Informal daily greeting among friends.', 'Sa ka woulé?', '—', "Sa k'ap fèt jòdi-a?"),
      c('A plita', 'Farewell', '[ah plee-tah]', 'See you later', 'À plus tard', 'A plita doudou, pran swen kò’w!', 'See you later sweetheart, take care!', 'Until later', 'Warm everyday parting expression.', 'A dèmen', 'Bonjou', 'A plita si Bondyé vlé')
    ]
  },
  family: {
    title: 'Family & Loved Ones (Fanmi)',
    cards: [
      c('Fanmi', 'Noun', '[fahn-mee]', 'Family', 'Famille', 'Fanmi nou an gran anpil.', 'Our family is very big.', 'Relatives, kin', 'Multigenerational circle plus godparents.', 'Paran', 'Étranjé', 'Tout fanmi-a'),
      c('Manman', 'Noun', '[mahn-mahn]', 'Mother / Mom', 'Mère / Maman', 'Manman mwen sé léspwa mwen.', 'My mother is my hope.', 'Mom, matriarch', 'Term of deep respect and affection for mother.', 'Manmi', 'Papa', 'Manman mwen'),
      c('Papa', 'Noun', '[pah-pah]', 'Father / Dad', 'Père / Papa', 'Papa mwen ka travay an jaden.', 'My father works in the garden.', 'Dad', 'Affectionate term for father.', 'Dadi', 'Manman', 'Papa mwen'),
      c('Timanmay', 'Noun', '[tee-mahn-my]', 'Child / Children', 'Enfant / Enfants', 'Timanmay-la ka jwé an lakou-a.', 'The children are playing in the yard.', 'Youth, kids', 'Iconic Martinican Creole word for children.', 'Timoun', 'Granmoun', 'Ti-manmay lékol'),
      c('Granmoun', 'Noun', '[grahn-moon]', 'Elder / Senior', 'Aîné / Personne âgée', 'Nou dwèt respekté granmoun.', 'We must respect elders.', 'Ancestors, seniors', 'Keepers of oral Creole storytelling and wisdom.', 'Ansyen', 'Timanmay', 'Pawòl granmoun'),
      c('Koudmen', 'Noun', '[kood-mehn]', 'Mutual aid / Solidarity', 'Entraide solidaire', 'Sé koudmen ki fè nou fò.', 'Mutual aid is what makes us strong.', 'Collective help', 'Rural communal solidarity tradition.', 'Solidarité', 'Égoyism', 'Fè an koudmen')
    ]
  },
  home: {
    title: 'House & Home (Kaz)',
    cards: [
      c('Kaz', 'Noun', '[kahz]', 'House / Home', 'Maison / Case', 'Kaz-la bèl toubannman.', 'The house is completely beautiful.', 'Dwelling, cottage', 'Traditional Martinican wooden home.', 'Kay', 'Lari', 'An kaz mwen'),
      c('Jaden', 'Noun', '[zhah-dehn]', 'Creole Garden', 'Jardin créole', 'Ni bèl flè nan jaden-an.', 'There are lovely flowers in the garden.', 'Orchard plot', 'Ecological mixed-crop Creole garden.', 'Tè', '—', 'Jaden kréyòl'),
      c('Kwizin', 'Noun', '[kwee-zeen]', 'Kitchen', 'Cuisine', 'Manman mwen nan kwizin-lan.', 'My mother is in the kitchen.', 'Cookhouse', 'Heart of family hospitality and spice.', '—', '—', 'Kwizin kréyòl'),
      c('Chanm', 'Noun', '[shahnm]', 'Bedroom / Room', 'Chambre', 'Chanm mwen an klè anpil.', 'My room is very bright.', 'Chamber', 'Sleeping room cooled by trade winds.', 'Pyès', '—', 'Chanm dòmi')
    ]
  },
  food: {
    title: 'Martinican Cuisine (Manjé Kréyòl)',
    cards: [
      c('Manjé', 'Noun / Verb', '[mahn-zhay]', 'Food / To eat', 'Nourriture / Manger', 'Manjé-tala chwit anpil.', 'This food is very delicious.', 'Meal, cuisine', 'Both noun and action of eating.', 'Repa', 'Bwè', 'Manjé kréyòl'),
      c('Lanmori', 'Noun', '[lahn-moh-ree]', 'Salted codfish', 'Morue salée', 'Ti-nain lanmori sé délis Matinik.', 'Green bananas with codfish is a delicacy.', 'Salted cod', 'Essential island protein ingredient.', 'Pwason salé', 'Pwason frè', 'Akra lanmori'),
      c('Kolombo', 'Noun', '[koh-lohm-boh]', 'Colombo curry dish', 'Plat au colombo', 'Nou fè kolombo pou fèt-la.', 'We made colombo for the celebration.', 'Spiced curry stew', 'Martinique’s beloved aromatic spice dish.', 'Kari', '—', 'Kolombo kabrit'),
      c('Kasav', 'Noun', '[kah-sahv]', 'Cassava flatbread', 'Galette de manioc', 'Kasav dous an bouch mwen.', 'Cassava bread tastes sweet.', 'Manioc cake', 'Amerindian culinary heritage bread.', 'Galèt manyòk', 'Pen', 'Kasav koko'),
      c('Chwit', 'Adjective', '[shweet]', 'Delicious / Flavorful', 'Délicieux / Savoureux', 'Soup-la chwit toubannman!', 'The soup is totally delicious!', 'Tasty, delightful', 'Warm Martinican expression of praise.', 'Bon anpil', 'Fad', 'Chwit toubannman')
    ]
  },
  market: {
    title: 'Market & Shopping (Maché)',
    cards: [
      c('Maché', 'Noun', '[mah-shay]', 'Market', 'Marché', 'Annou alé nan Gran Maché Fòdfrans.', "Let's go to Fort-de-France Grand Market.", 'Marketplace', 'Vibrant covered hub for spices and produce.', 'Boutik', '—', 'Gran Maché'),
      c('Lajan', 'Noun', '[lah-zhahn]', 'Money', 'Argent', 'Konben lajan sa kouté?', 'How much money does this cost?', 'Cash, currency', 'Used for commerce and pricing.', 'Moné', 'Gratis', 'Ban mwen lajan'),
      c('Achté', 'Verb', '[ahsh-tay]', 'To buy', 'Acheter', 'Mwen vlé achté bannann jòdi-a.', 'I want to buy plantains today.', 'Purchase', 'Always invariant; pairs with ka/té/ké.', 'Pran', 'Vann', 'Achté fwi'),
      c('Konben?', 'Interrogative', '[kohn-behn]', 'How much? / How many?', 'Combien ?', 'Konben pou dé mango?', 'How much for two mangoes?', 'What price?', 'Key market bargaining question.', 'Ki pri?', '—', 'Konben sa yé?')
    ]
  },
  daily: {
    title: 'Daily Routines (Lavi Chak Jou)',
    cards: [
      c('Dòmi', 'Verb', '[doh-mee]', 'To sleep', 'Dormir', 'Mwen ké dòmi bonnè.', 'I will sleep early.', 'Rest, slumber', 'Daily rest verb.', 'Pòzé', 'Lévé', 'Alé dòmi'),
      c('Lévé', 'Verb', '[lay-vay]', 'To wake up / Rise', 'Se lever', 'Mwen ka lévé a sis è di maten.', 'I wake up at 6 in the morning.', 'Get up, stand', 'Also means to lift or rise early.', 'Doubout', 'Dòmi', 'Lévé bonmaten'),
      c('Travay', 'Verb / Noun', '[trah-veye]', 'To work / Job', 'Travailler / Travail', 'Nou ka travay an kouraj.', 'We work with courage.', 'Labor, craft', 'Describes honest daily craft.', 'Djòb', 'Ripo', 'Travay rèd'),
      c('Bényen', 'Verb', '[behn-yehn]', 'To swim / Bathe', 'Se baigner', 'Annou alé bényen nan lanmè!', "Let's go swim in the sea!", 'Take a dip', 'Essential weekend island leisure!', 'Najé', '—', 'Bényen lanmè')
    ]
  },
  music: {
    title: 'Music & Bèlè Culture (Mizik & Kilti)',
    cards: [
      c('Bèlè', 'Noun', '[beh-leh]', 'Traditional Bèlè drum & dance', 'Bèlè (danse et tambour)', 'Tanbou bèlè-a ka bat fò.', 'The bèlè drum beats strong.', 'Sainte-Marie heritage art', 'Living Afro-Martinican rhythmic heritage.', 'Mizik tradisyonèl', '—', 'Dans bèlè'),
      c('Tanbou', 'Noun', '[tahn-boo]', 'Drum', 'Tambour', 'Mizisyen-an ka karésé tanbou-a.', 'The musician caresses the drum.', 'Bèlè drum', 'Carved wooden cask drum played horizontally.', '—', '—', 'Bat tanbou'),
      c('Ti-bwa', 'Noun', '[tee-bwah]', 'Rhythm hardwood sticks', 'Ti-bois (baguettes)', 'Ti-bwa-a ka ba kadans-lan.', 'The ti-bwa sets the cadence.', 'Percussion sticks', 'Bamboo/hardwood sticks struck on drum back.', '—', '—', 'Jwé ti-bwa'),
      c('Chanté', 'Verb / Noun', '[shahn-tay]', 'To sing / Song', 'Chanter / Chant', 'Tout moun ka chanté an lawonn.', 'Everyone sings in the circle.', 'Chant, lavwa', 'Call-and-response choral singing.', 'Lavwa', 'Pézé', 'Chanté ansanm')
    ]
  },
  history: {
    title: 'Martinique History (Istwa Matinik)',
    cards: [
      c('Libèté', 'Noun', '[lee-beh-tay]', 'Freedom / Emancipation', 'Liberté / Émancipation', '22 Mé sé fèt libèté an Matinik.', 'May 22 is Emancipation Day in Martinique.', 'Liberation', 'Commemorating 1848 slave insurrection victory.', 'Lémansipasyon', 'Èsklavaj', '22 Mé Libèté'),
      c('Mawon', 'Noun / Adj', '[mah-rohn]', 'Maroon freedom fighter', 'Marron / Résistant', 'Mawon-yo té doubout pou libèté.', 'The Maroons stood tall for freedom.', 'Resister', 'Escaped freedom fighters of the lush mornes.', 'Rézistan', '—', 'Nèg mawon'),
      c('Zansèt', 'Noun', '[zahn-seht]', 'Ancestors', 'Ancêtres', 'Nou ka onoré mémwa zansèt nou.', 'We honor the memory of our ancestors.', 'Forebears', 'Honored in Cap 110 and cultural ceremonies.', 'Granmoun lontan', 'Désandan', 'Mémwa zansèt')
    ]
  },
  verbs: {
    title: 'Essential Action Verbs (Vèb)',
    cards: [
      c('Palé', 'Verb', '[pah-lay]', 'To speak / Talk', 'Parler', 'Mwen ka palé Kréyòl Matinik.', 'I speak Martinican Creole.', 'Converse', 'Core verb; invariant before particles ka/té/ké.', 'Kozé', 'Té kò’w', 'Palé klè'),
      c('Kouté', 'Verb', '[koo-tay]', 'To listen', 'Écouter', 'Kouté granmoun pou pran leson.', 'Listen to elders to learn.', 'Heed, hear', 'Vital for oral transmission.', 'Tann', 'Pa kouté', 'Kouté mizik'),
      c('Vini', 'Verb', '[vee-nee]', 'To come', 'Venir', 'Vini wè mwen lakay mwen!', 'Come see me at my home!', 'Arrive', 'Warm hospitality invitation.', 'Rivé', 'Alé', 'Vini doudou'),
      c('Konnèt', 'Verb', '[koh-neht]', 'To know / Be familiar with', 'Connaître', 'Ou konnèt listwa peyi-a?', 'Do you know the island’s history?', 'Recognize', 'Distinguished from "sav" (know a fact).', 'Sav', 'Bliyé', 'Konnèt moun')
    ]
  },
  adjectives: {
    title: 'Descriptive Adjectives (Adjèktif)',
    cards: [
      c('Bèl', 'Adjective', '[behl]', 'Beautiful / Lovely', 'Beau / Belle', 'Plaj Salin-lan bèl toubannman.', 'Salines beach is completely beautiful.', 'Handsome, fine', 'Placed before or after nouns.', 'Jòlòt', 'Lèd', 'Bèl peyi'),
      c('Fò', 'Adjective', '[foh]', 'Strong / Loud / Skilled', 'Fort(e)', 'Van-an ka souflé fò anlè kòt-la.', 'The wind blows strong along the coast.', 'Powerful', 'Used both physically and culturally.', 'Kòstò', 'Fèb', 'Kenbe fò'),
      c('Cho', 'Adjective', '[shoh]', 'Hot / Warm / Lively', 'Chaud(e)', 'Solèy-la cho jòdi-a!', 'The sun is hot today!', 'Spicy, energetic', 'Also describes vibrant music or chili.', 'Chofé', 'Frè / Fwèt', 'Solèy cho'),
      c('Piti / Ti', 'Adjective', '[pee-tee]', 'Small / Little', 'Petit(e)', 'Ban mwen an ti bren dlo.', 'Give me a little bit of water.', 'Gentle', 'Short form "ti-" conveys affection (ti-kè).', 'Ti bren', 'Gran', 'An ti moman')
    ]
  },
  numbers: {
    title: 'Numbers & Counting (Nonm)',
    cards: [
      c('Youn / An', 'Number', '[yoon / ahn]', 'One / A', 'Un / Une', 'Ban mwen youn souplé.', 'Give me one please.', 'Single', '"An" functions as article "a", "youn" when counting alone.', 'Sèl', 'Zéro', 'Youn apré lòt'),
      c('Dé', 'Number', '[day]', 'Two', 'Deux', 'Nou ni dé poul nan lakou-a.', 'We have two hens in the yard.', 'A pair', 'Clean nasal-free vowel [day].', 'An pè', '—', 'Dé ti mo'),
      c('Twa', 'Number', '[twah]', 'Three', 'Trois', 'Sé twa éwo pou mango-a.', "It's three euros for the mangoes.", 'Trio', 'Used daily in market prices.', '—', '—', 'Twa fwa'),
      c('Kat', 'Number', '[kaht]', 'Four', 'Quatre', 'Kat zanmi ka alé Lémaren.', 'Four friends are going to Le Marin.', 'Quartet', 'Clear crisp final t.', '—', '—', 'Kat kwen peyi-a'),
      c('Senk', 'Number', '[sehnk]', 'Five', 'Cinq', 'Mwen ka vini a senk è.', "I'm coming at five o'clock.", '—', 'Standard counting number five.', '—', '—', 'Senk minit')
    ]
  },
  time: {
    title: 'Time & Seasons (Lè & Dat)',
    cards: [
      c('Jòdi-a', 'Adverb', '[zhoh-dee-ah]', 'Today', "Aujourd'hui", 'Jòdi-a fè bèl tan.', 'Today the weather is lovely.', 'This day', 'Always carries "-a" definite suffix.', 'Maten-an', 'Yè / Dèmen', 'Jòdi-a menm'),
      c('Dèmen', 'Adverb', '[deh-mehn]', 'Tomorrow', 'Demain', 'Nou ka wè dèmen si Bondyé vlé!', 'See you tomorrow God willing!', 'Next day', 'Used in hopeful farewells.', 'Lòt jou', 'Yè', 'A dèmen'),
      c('Yè', 'Adverb', '[yeh]', 'Yesterday', 'Hier', 'Yè swa nou té ka dansé bèlè.', 'Last night we were dancing bèlè.', 'Past day', 'Pairs naturally with past marker "té".', 'Avan yè', 'Dèmen', 'Yè oswa'),
      c('Lontan', 'Adverb', '[lohn-tahn]', 'A long time ago / Long ago', 'Autrefois / Longtemps', 'Lontan granmoun té ka rakonté kont.', 'Long ago elders told folktales.', 'Olden days', 'Evokes treasured oral memory.', 'Avan', 'Konnyé-a', 'Tan lontan')
    ]
  },
  colors: {
    title: 'Island Colors (Koulè)',
    cards: [
      c('Wouj', 'Adjective', '[woozh]', 'Red', 'Rouge', 'Flè balizyé-a wouj vif.', 'The heliconia flower is bright red.', 'Crimson', 'Vibrant color on traditional yole sails.', 'Kramwazi', 'Blan', 'Wouj Matinik'),
      c('Vè', 'Adjective', '[veh]', 'Green', 'Vert', 'Mòn Matinik vè tout lannen-an.', 'Martinique’s hills stay green all year.', 'Emerald', 'From rainforest ferns to sugarcane.', 'Vèdoyant', '—', 'Bwa vè'),
      c('Blé', 'Adjective', '[blay]', 'Blue', 'Bleu', 'Lanmè Karayib-la blé toubannman.', 'The Caribbean Sea is deep blue.', 'Azure', 'Echoes turquoise lagoons of Sainte-Anne.', 'Tirkiz', '—', 'Syèl blé'),
      c('Jòn', 'Adjective', '[zhohn]', 'Yellow', 'Jaune', 'Solèy Matinik jòn kou lò.', 'Martinique’s sun is yellow as gold.', 'Golden', 'Color of ripe mango and citrus.', 'Doré', 'Nwè', 'Jòn sitron')
    ]
  },
  weather: {
    title: 'Tropical Weather (Tan-an)',
    cards: [
      c('Lapli', 'Noun', '[lah-plee]', 'Rain', 'Pluie', 'Lapli ka tonbé anlè Mònwouj.', 'Rain is falling over Morne-Rouge.', 'Shower, downpour', 'Short tropical showers are "ti grin lapli".', 'Grin lapli', 'Solèy', 'Lapli fin'),
      c('Solèy', 'Noun', '[soh-leye]', 'Sun', 'Soleil', 'Solèy-la ka kléré bèl.', 'The sun is shining bright.', 'Sunshine', 'Vital energy of Caribbean harvests.', 'Chalè', 'Lapli', 'Solèy lévé'),
      c('Alizé / Van', 'Noun', '[vahn]', 'Trade wind / Breeze', 'Alizé / Vent', 'Bèl ti van-an ka fréchi kaz-la.', 'The lovely breeze cools the house.', 'Island breeze', 'Atlantic trade winds cool the eastern shore.', 'Bris', 'Kalmi', 'Van lanmè'),
      c('Siklòn', 'Noun', '[see-klohn]', 'Hurricane / Cyclone', 'Cyclone', 'Nan sézon siklòn nou ka paré.', 'In hurricane season we prepare.', 'Storm', 'Season spans June to November.', 'Lòraj', 'Kalmi', 'Tan siklòn')
    ]
  },
  animals: {
    title: 'Island Fauna (Bèt Matinik)',
    cards: [
      c('Krab', 'Noun', '[krahb]', 'Land Crab', 'Crabe de terre', 'Krab farisi sé manjé Pak!', 'Stuffed crabs are an Easter delicacy!', 'Matoutou crab', 'Celebrated in traditional Easter dish Matoutou.', 'Matoutou', '—', 'Krab farisi'),
      c('Manikou', 'Noun', '[mah-nee-koo]', 'Martinican Opossum', 'Manicou (opossum)', 'Manikou-a ka sòti lannwit.', 'The manicou comes out at night.', 'Didelphis marsupialis', 'Nocturnal marsupial in Martinican folklore.', '—', '—', 'Bèt an bwa'),
      c('Kolibri', 'Noun', '[koh-lee-bree]', 'Hummingbird', 'Colibri', 'Ti kolibri-a ka bwè flè ibiskis.', 'The hummingbird drinks from hibiscus flowers.', 'Fou-fou', 'Sacred emblem of Martinique’s biodiversity.', 'Fou-fou', '—', 'Ti kolibri'),
      c('Pwason', 'Noun', '[pwah-sohn]', 'Fish', 'Poisson', 'Pèchè-a pòté pwason frè.', 'The fisher brought fresh fish.', 'Catch of the sea', 'Staple in court-bouillon and blaff.', 'Vivano · Taza', '—', 'Pwason frè')
    ]
  },
  nature: {
    title: 'Volcanic Nature & Sea (Lanati)',
    cards: [
      c('Mòn', 'Noun', '[mohn]', 'Hill / Mountain', 'Morne / Colline', 'Dèyè mòn, toujou ni mòn.', 'Beyond every hill lies another hill.', 'Volcanic ridge', 'Central word in Martinican topography & proverbs.', 'Montany', 'Plenn', 'Anlè mòn-lan'),
      c('Lanmè', 'Noun', '[lahn-meh]', 'The Sea / Ocean', 'La mer', 'Lanmè Karayib-la kalm maten-an.', 'The Caribbean Sea is calm this morning.', 'Sea waters', 'Separates Caribbean calm shore from wild Atlantic.', 'Loséan', 'Latè', 'Bò lanmè-a'),
      c('Larivyè', 'Noun', '[lah-ree-vyeh]', 'River', 'Rivière', 'Dlo larivyè-a frè kou glas.', 'The river water is cool as ice.', 'Stream', 'Flows down Mount Pelée and the Pitons du Carbet.', 'Kaskad', '—', 'Larivyè Gwanrivyè'),
      c('Pyé-bwa', 'Noun', '[pyay-bwah]', 'Tree', 'Arbre', 'Nou ka rété anba lonbraj pyé-bwa.', 'We rest under the shade of the tree.', 'Woodland tree', 'Notice "pyé" prefixes most fruit trees (pyé-mango).', 'Bwa', 'Flè', 'Anba pyé-bwa')
    ]
  },
  clothing: {
    title: 'Traditional Attire (Rad & Lèz)',
    cards: [
      c('Madras', 'Noun', '[mah-drahs]', 'Madras plaid textile', 'Tissu madras', 'Tèt-maré madras-la ni kat pwent!', 'The madras headwrap has four points!', 'Checkered heritage cloth', 'Each tied point historically signals marital availability.', 'Tèt-maré', '—', 'Ròb madras'),
      c('Bakwa', 'Noun', '[bahk-wah]', 'Woven straw hat', 'Chapeau bakoua', 'Chapo bakwa ka pwotéjé kont solèy.', 'The bakoua hat shields from the sun.', 'Fisherman/farmer hat', 'Crafted from dried pandanus leaves.', 'Chapo pay', '—', 'Chapo bakwa'),
      c('Ròb', 'Noun', '[rohb]', 'Dress / Gown', 'Robe', 'Li mété bèl ròb gran wòb li pou bèlè.', 'She wore her grand robe for the bèlè dance.', 'Traditional gown', 'Worn in cultural processions and folkloric dance.', 'Kostim', 'Pantalon', 'Gran wòb'),
      c('Soulyé', 'Noun', '[sool-yay]', 'Shoes', 'Chaussures', 'Mété soulyé ou avan sòti.', 'Put on your shoes before going out.', 'Footwear', 'Everyday wardrobe noun.', 'Sandal', 'Pyé-atè', 'Bèl soulyé')
    ]
  },
  transport: {
    title: 'Island Travel & Boats (Transpò)',
    cards: [
      c('Yòl', 'Noun', '[yohl]', 'Traditional Martinican Yole', 'Yole ronde', 'Yòl-la ka glisé anlè vag-la!', 'The yole glides across the waves!', 'Sailing craft', 'UNESCO-recognized wooden boat without keel.', 'Kannòt', 'Loto', 'Tour des Yoles'),
      c('Loto', 'Noun', '[loh-toh]', 'Car / Automobile', 'Voiture', 'Nou pran loto pou alé Sentann.', 'We took the car to go to Sainte-Anne.', 'Vehicle', 'Daily transport across the island.', 'Machin', 'A pyé', 'An loto-a'),
      c('Bato', 'Noun', '[bah-toh]', 'Ferry / Boat', 'Bateau / Vedette', 'Bato-a ka travèsé bè Fòdfrans.', 'The ferry crosses Fort-de-France bay.', 'Vessel', 'Commuter vedettes connect Trois-Îlets and capital.', 'Vèdèt', 'Avyon', 'Pran bato'),
      c('Chimèn', 'Noun', '[shee-mehn]', 'Road / Path / Trail', 'Chemin / Route', 'Chimèn Mònwouj ka monté nan nyaj.', 'The Morne-Rouge road climbs into the clouds.', 'Mountain trail', 'Used both literally and metaphorically.', 'Lawout', '—', 'Bon chimèn')
    ]
  },
  proverbs: {
    title: 'Martinican Proverbs (Pawòl Matinik)',
    cards: [
      c('Dèyè mòn, toujou ni mòn', 'Proverb', '[deh-yeh mohn too-zhoo nee mohn]', 'Beyond every mountain lies another mountain', 'Derrière les mornes, il y a toujours des mornes', 'Pa dékourajé: dèyè mòn, toujou ni mòn!', "Don't lose heart: keep climbing forward!", 'Perseverance wisdom', 'One of the most famous Caribbean proverbs of resilience.', 'Kouraj', '—', 'Pawòl lontan'),
      c('Zafè kabrit pa zafè mouton', 'Proverb', '[zah-feh kah-breet pah zah-feh moo-tohn]', 'The goat’s business is not the sheep’s', 'Les affaires du cabri ne sont pas celles du mouton', 'Rété an zafè’w: zafè kabrit pa zafè mouton.', 'Mind your own path calmly.', 'Mind your own affairs', 'Advice against meddling in another person’s life.', 'Okipé zafè’w', '—', 'Pawòl sajès'),
      c('Sé kouto sèl ki sav sa ki an tchè jiromon', 'Proverb', '[say koo-toh sehl kee sahv]', 'Only the knife knows what lies inside the pumpkin', 'Seul le couteau sait ce qui est au cœur du giraumon', 'Nou pa pé jijé pèsonn: sé kouto sèl ki sav.', 'We cannot judge anyone: only they know their heart.', 'Empathy proverb', 'Teaches compassion because hidden struggles remain unseen.', 'Konpasyon', '—', 'An tchè jiromon'),
      c('Tout bèt an lanmè ka manjé moun, mé sé réken ki ni mové non', 'Proverb', '[toot beht ahn lahn-meh]', 'All sea creatures nibble, yet only the shark gets blamed', 'Tous les poissons mangent, seul le requin a mauvaise réputation', 'Pwan gad — sé réken sèl ki ni mové non.', 'Scapegoats carry blame for what many do quietly.', 'Social satire proverb', 'Classic Martinican proverb on unfair reputation.', '—', '—', 'Lanmè Matinik')
    ]
  },
  expressions: {
    title: 'Everyday Idioms (Èksprésyon Kouran)',
    cards: [
      c('An ti bren', 'Idiom', '[ahn tee brehn]', 'A little bit / Just a touch', 'Un petit peu', 'Ban mwen an ti bren piman souplé.', 'Give me just a little chili please.', 'A pinch, slightly', 'Quintessential Martinican quantity phrase.', 'An ti kal', 'Anpil', 'An ti bren dlo'),
      c('Pa ni pwoblèm', 'Expression', '[pah nee pwoh-blehm]', 'No problem / Anytime', 'Pas de problème', 'Pa ni pwoblèm doudou, nou ansanm!', 'No problem sweetheart, we are together!', "You're welcome", 'Warm reassurance of hospitality.', 'Pa ni traka', 'Ni pwoblèm', 'Pa ni pwoblèm ditou'),
      c('Sé sa menm!', 'Expression', '[say sah mehm]', 'That is exactly right!', "C'est exactement ça !", 'Sé sa menm ou ka chaché!', 'That is exactly what you were looking for!', 'Spot on!, True!', 'Punchy conversational affirmation.', 'Sé vré', 'Pa sa ditou', 'Sé sa menm manmay'),
      c('Toubannman', 'Adverb', '[too-bahn-mahn]', 'Completely / Utterly / Truly', 'Complètement / Tout à fait', 'Paysaj Senpyè bèl toubannman!', 'Saint-Pierre’s scenery is utterly stunning!', 'Through and through', 'Distinctively expressive Martinican intensifier.', 'Anpil · Toutafè', 'Tibrin', 'Bèl toubannman'),
      c('Doudou', 'Term of endearment', '[doo-doo]', 'Sweetheart / Dear', 'Chéri(e) / Doudou', 'Mèsi doudou, pasé an bèl jounen!', 'Thanks dear, have a lovely day!', 'Darling, friend', 'Spoken warmly by elders, vendors, and loved ones.', 'Chéri · Ti-kè', '—', 'Bonjou doudou')
    ]
  }
};
