// Martinique Interactive OpenStreetMap Locations + Commune Landscape Galleries

export const IMG_FORT_DE_FRANCE = './src/assets/images/martinique_fort_de_france_1795111105144.jpg';
export const IMG_SAINT_PIERRE = './src/assets/images/martinique_saint_pierre_pelee_1795111105506.jpg';
export const IMG_LE_DIAMANT = './src/assets/images/martinique_le_diamant_rock_1795111106354.jpg';
export const IMG_SAINTE_ANNE = './src/assets/images/martinique_sainte_anne_salines_1795111106566.jpg';
export const IMG_LE_FRANCOIS = './src/assets/images/martinique_le_francois_yoles_1795111107434.jpg';
export const IMG_RAINFOREST = './src/assets/images/martinique_northern_rainforest_1795111107328.jpg';
export const IMG_CAP_110 = './src/assets/images/cap_110_memorial_1795183599176.jpg';
export const IMG_GRAND_RIVIERE = './src/assets/images/grand_riviere_cliffs_1795183598643.jpg';
export const IMG_WEATHER_BAY = './src/assets/images/weather_tropical_bay_1795183599193.jpg';
export const IMG_COLOMBO = './src/assets/images/culinary_colombo_feast_1795183598683.jpg';
export const IMG_TROPICAL_MARKET = './src/assets/images/culinary_tropical_market_1795183598823.jpg';
export const IMG_VERANDA = './src/assets/images/learning_path_veranda_1795183599209.jpg';

export const MAP_LOCATIONS = {
  // === 12 ICONIC COMMUNES ===
  'fort-de-france': {
    id: 'fort-de-france',
    category: 'commune',
    name: 'Fort-de-France',
    creoleName: 'Fòdfrans • Capital of Martinique',
    region: 'Centre / Baie de Fort-de-France',
    lat: 14.6037,
    lng: -61.0742,
    audioPhrase: 'Fòdfrans! Bonjou tout moun!',
    fact: 'Fort-de-France is the beating cultural and administrative heart of Martinique. Home to the colorful Grand Marché couvert filled with tropical spices, the metallic lace dome of Bibliothèque Schœlcher, and Fort Saint-Louis.',
    tradition: 'At the Grand Marché, merchants greet you warmly with "Bonjou doudou" while offering cinnamon bark, Bois Bandé, pure vanilla pods, and fresh ti-nains.',
    proverb: '"An Fòdfrans tout moun ka kouri, mé tout moun ka di bonjou!" (In Fort-de-France everybody rushes, yet everyone still greets one another!)',
    gallery: [
      { src: IMG_FORT_DE_FRANCE, title: 'Baie de Fort-de-France & Creole Waterfront', caption: 'Historic colonial rooftops framing Fort Saint-Louis and the turquoise bay.' },
      { src: IMG_TROPICAL_MARKET, title: 'Grand Marché Couvert Spice Stalls', caption: 'Vibrant madras cloths stacked with vanilla pods, turmeric, and Julie mangoes.' },
      { src: IMG_COLOMBO, title: 'Capital Street Kitchens & Kwizin Kréyòl', caption: 'Steaming artisanal Colombo and crisp cod accras prepared daily across Fort-de-France.' },
      { src: IMG_WEATHER_BAY, title: 'Rainbow Horizon Over the Bay', caption: 'Sudden sunlit trade showers brightening coastal piers and sailing vessels.' },
      { src: IMG_RAINFOREST, title: 'Route de la Trace Foothills', caption: 'Minutes north of Fort-de-France, the emerald rainforest canopy climbs toward Balata.' }
    ]
  },
  'saint-pierre': {
    id: 'saint-pierre',
    category: 'commune',
    name: 'Saint-Pierre',
    creoleName: 'Senpyè • Little Paris of the Antilles',
    region: 'Nord Caraïbe / Foot of Mount Pelée',
    lat: 14.7433,
    lng: -61.1763,
    audioPhrase: 'Senpyè, lavil istorik Matinik',
    fact: 'Until May 8, 1902, Saint-Pierre was the dazzling cultural jewel of the Caribbean. Today its evocative volcanic stone ruins beneath Mount Pelée form a UNESCO-recognized heritage memory landscape.',
    tradition: 'Remembering Ludger Sylbaris (Cyparis), whose subterranean stone cell preserved his life during the eruption.',
    proverb: '"Montany Pèlé ka dòmi, mé i pa mò!" (Mount Pelée sleeps, yet she lives in memory!)',
    gallery: [
      { src: IMG_SAINT_PIERRE, title: 'Saint-Pierre Ruins & Mount Pelée', caption: 'Golden hour over volcanic ruins looking toward the misty summit of Mount Pelée.' },
      { src: IMG_RAINFOREST, title: 'Volcanic Slopes & Cascades', caption: 'Emerald gorges and waterfalls feeding the fertile volcanic soils of northern Martinique.' },
      { src: IMG_LE_DIAMANT, title: 'Caribbean Volcanic Coastline', caption: 'Sweeping golden bays along Martinique’s sheltered Caribbean western coast.' }
    ]
  },
  'le-diamant': {
    id: 'le-diamant',
    category: 'commune',
    name: 'Le Diamant',
    creoleName: 'Djanman • Home of the Sacred Rock',
    region: 'Sud Caraïbe',
    lat: 14.4792,
    lng: -61.0286,
    audioPhrase: 'Djanman, Wòch Djanman ak Anse Kafard',
    fact: 'Celebrated for its three-kilometer palm-fringed beach facing the iconic 175-meter basalt Rocher du Diamant offshore islet.',
    tradition: 'Honoring ancestral remembrance along Anse Caffard and coastal fishing traditions at dawn.',
    proverb: '"Doubout pou libèté!" (Standing tall and steadfast for freedom!)',
    gallery: [
      { src: IMG_LE_DIAMANT, title: 'Plage du Diamant & Rocher du Diamant', caption: 'Basalt volcanic sea stack rising out of the sapphire Caribbean at golden hour.' },
      { src: IMG_SAINTE_ANNE, title: 'Southern Turquoise Lagoons', caption: 'Coconut-lined sandy coves stretching across southern Martinique.' },
      { src: IMG_FORT_DE_FRANCE, title: 'South-West Coastal Horizon', caption: 'Warm Caribbean trade winds greeting coastal villages.' }
    ]
  },
  'sainte-marie': {
    id: 'sainte-marie',
    category: 'commune',
    name: 'Sainte-Marie',
    creoleName: 'Sanmari • Cradle of Martinican Bèlè',
    region: 'Nord Atlantique',
    lat: 14.7836,
    lng: -60.9922,
    audioPhrase: 'Sanmari, bèso bèlè Matinik',
    fact: 'Celebrated across the Caribbean as the living sanctuary of traditional Bèlè music, dance, and agrarian storytelling, plus the seasonal Tombolo sandbar.',
    tradition: 'Tanbou bèlè drumming, ti-bwa wooden rhythm sticks, and communal call-and-response lavwa circles.',
    proverb: '"Bèlè sé nanm Matinik!" (Bèlè is the very soul of Martinique!)',
    gallery: [
      { src: IMG_RAINFOREST, title: 'Lush Northern Hills of Sainte-Marie', caption: 'Rich tropical canopy feeding historic cacao, cane, and botanical estates.' },
      { src: IMG_VERANDA, title: 'Intergenerational Storytelling Veranda', caption: 'Elders and youth sharing Creole bèlè heritage in Sainte-Marie.' },
      { src: IMG_LE_FRANCOIS, title: 'Atlantic Lagoon & Reefs', caption: 'Windward Atlantic waters shaping the seasonal Sainte-Marie coastline.' },
      { src: IMG_FORT_DE_FRANCE, title: 'Creole Cultural Heritage', caption: 'Architectural and musical traditions carried from rural mornes to town squares.' }
    ]
  },
  'le-francois': {
    id: 'le-francois',
    category: 'commune',
    name: 'Le François',
    creoleName: 'O Franswa • The 8 Islets & Yoles',
    region: 'Atlantique Sud',
    lat: 14.6156,
    lng: -60.9033,
    audioPhrase: 'O Franswa, yòl bwa dréssé ak fon blan',
    fact: 'Famous for its 8 coral islets, the crystal turquoise Fonds Blancs sandbars, and as the heartland of the UNESCO-listed Tour des Yoles Rondes.',
    tradition: 'Sailing wooden keel-less yoles steered by acrobatic crews balancing out on bwa dréssé poles.',
    proverb: '"Yòl-la pa ni gouvènay, sé kouraj manmay ki ka mennen’y!" (The yole has no fixed rudder; crew courage steers it!)',
    gallery: [
      { src: IMG_LE_FRANCOIS, title: 'Yoles Rondes at Fonds Blancs', caption: 'Colorful canvas sails skimming over shallow coral sandbars near Le François.' },
      { src: IMG_SAINTE_ANNE, title: 'Coral Reef Shallows', caption: 'Translucent Atlantic turquoise pools sheltered by barrier reefs.' },
      { src: IMG_FORT_DE_FRANCE, title: 'Island Maritime Craft', caption: 'Centuries-old wooden boatbuilding preserved by local masters.' }
    ]
  },
  'les-trois-ilets': {
    id: 'les-trois-ilets',
    category: 'commune',
    name: 'Les Trois-Îlets',
    creoleName: 'Twa-Zilè • Pottery & Creole Cottages',
    region: 'Sud / Baie Sud',
    lat: 14.5392,
    lng: -61.0339,
    audioPhrase: 'Twa-Zilè, vilaj potri ak bèl kaz kréyòl',
    fact: 'Across the bay from Fort-de-France, known for 18th-century red clay pottery traditions, mangrove lagoons, and Creole heritage.',
    tradition: 'Crafting traditional clay cooking pots (kannari) and roof tiles from local earth.',
    proverb: '"Sé tè ki ka fè kannari!" (It is the earth itself that shapes the cooking pot!)',
    gallery: [
      { src: IMG_FORT_DE_FRANCE, title: 'Across the Bay to Fòdfrans', caption: 'Commuter vedettes link Les Trois-Îlets with the capital waterfront daily.' },
      { src: IMG_LE_DIAMANT, title: 'Southern Bay Coastline', caption: 'Sheltered beaches and palm coves framing the south peninsula.' },
      { src: IMG_SAINTE_ANNE, title: 'Caribbean Palm Shores', caption: 'Golden beaches along the southern tourist and cultural route.' }
    ]
  },
  'le-carbet': {
    id: 'le-carbet',
    category: 'commune',
    name: 'Le Carbet',
    creoleName: 'O Kabé • Fishing Rafts & Art',
    region: 'Nord Caraïbe',
    lat: 14.7119,
    lng: -61.1822,
    audioPhrase: 'O Kabé, bwa flo ak lapèch tradisyonèl',
    fact: 'Historic coastal town where Paul Gauguin painted in 1887 and where dark volcanic sands meet clear Caribbean surf.',
    tradition: 'Traditional fishermen launching lightweight wooden log rafts (bwa flo) into coastal swells.',
    proverb: '"Pwason ka viv an dlo, mé sé filé ki ka pran’y." (Fish live in water, yet patience and the net catch them.)',
    gallery: [
      { src: IMG_SAINT_PIERRE, title: 'Northern Caribbean Bay', caption: 'Looking north from Le Carbet toward Saint-Pierre and Mount Pelée.' },
      { src: IMG_RAINFOREST, title: 'Pitons du Carbet Highlands', caption: 'Towering rainforest peaks rising directly behind the black sand coast.' },
      { src: IMG_LE_DIAMANT, title: 'Calm Caribbean Horizons', caption: 'Sunlit coastal waters prized by island fishers.' }
    ]
  },
  'grand-riviere': {
    id: 'grand-riviere',
    category: 'commune',
    name: "Grand'Rivière",
    creoleName: 'Gwanrivyè • Northern End of the World',
    region: 'Nord Sauvage',
    lat: 14.8736,
    lng: -61.1797,
    audioPhrase: 'Gwanrivyè, bout latè Matinik',
    fact: 'Martinique’s northernmost village at the foot of sheer volcanic cliffs facing the Dominica Channel, reached via lush rainforest roads.',
    tradition: 'Artisanal wooden doris fishing in powerful Atlantic swells and cacao craftsmanship.',
    proverb: '"Rivyè ki ka désann pa ka rété pou wòch!" (A rushing river does not halt for stones; keep moving forward!)',
    gallery: [
      { src: IMG_GRAND_RIVIERE, title: 'Grand’Rivière Volcanic Cliffs & Boats', caption: 'Towering emerald headlands above glistening black-sand waters and bright wooden boats.' },
      { src: IMG_RAINFOREST, title: 'Emerald Gorges of Grand’Rivière', caption: 'Giant tree ferns, wild heliconia, and volcanic waterfalls bordering the village.' },
      { src: IMG_SAINT_PIERRE, title: 'Shadow of Mount Pelée', caption: 'Volcanic ridges separating Grand’Rivière from the western coast.' }
    ]
  },
  'morne-rouge': {
    id: 'morne-rouge',
    category: 'commune',
    name: 'Le Morne-Rouge',
    creoleName: 'Mònwouj • Misty Volcano Highlands',
    region: 'Nord Montagne',
    lat: 14.7764,
    lng: -61.1356,
    audioPhrase: 'Mònwouj, fréchè mòn ak montany Pèlé',
    fact: 'Perched at 450m elevation below Mount Pelée, famed for mist-draped tree ferns, anthuriums, and cool highland air.',
    tradition: 'Mountain horticulture, bamboo basketry, and spiced Creole hot cacao.',
    proverb: '"Dèyè mòn, toujou ni mòn!" (Beyond every mountain lies another mountain.)',
    gallery: [
      { src: IMG_RAINFOREST, title: 'Highland Cloud Forest', caption: 'Volcanic mists swirling around tree ferns and waterfalls near Morne-Rouge.' },
      { src: IMG_SAINT_PIERRE, title: 'Above Saint-Pierre Bay', caption: 'Dramatic elevation drop from mountain pastures to the Caribbean Sea.' }
    ]
  },
  'trinite': {
    id: 'trinite',
    category: 'commune',
    name: 'La Trinité & Tartane',
    creoleName: 'Trinité ak Tatan • Caravelle Peninsula',
    region: 'Nord Atlantique',
    lat: 14.7378,
    lng: -60.9628,
    audioPhrase: 'Trinité ak Tatan, Chato Dibik ak lapèch',
    fact: 'Gateway to the protected Presqu’île de la Caravelle nature reserve, windswept Atlantic coves, and Tartane surfing beaches.',
    tradition: 'Early morning artisanal fish landing directly onto Tartane sands.',
    proverb: '"Lanmè pa ni branch!" (The sea has no branches to cling to; respect the ocean!)',
    gallery: [
      { src: IMG_LE_FRANCOIS, title: 'Atlantic Bays & Sailboats', caption: 'Bright trade-wind waters flanking the Caravelle headland.' },
      { src: IMG_RAINFOREST, title: 'Coastal Mangrove Trails', caption: 'Protected ecological reserves weaving through Caravelle Peninsula.' }
    ]
  },
  'le-marin': {
    id: 'le-marin',
    category: 'commune',
    name: 'Le Marin',
    creoleName: 'O Maren • Historic Bay & Marina',
    region: 'Sud Atlantique',
    lat: 14.4714,
    lng: -60.8706,
    audioPhrase: 'O Maren, bèl bè ak légliz istorik',
    fact: 'Anchored around one of the deepest sheltered bays in the Lesser Antilles, boasting an 18th-century Baroque church.',
    tradition: 'Maritime boatbuilding mingling with weekend Creole seafood gatherings.',
    proverb: '"Bato ka pasé, mé tras dlo ka rété." (Boats pass by, yet the memory in the wake endures.)',
    gallery: [
      { src: IMG_SAINTE_ANNE, title: 'Southern Peninsula Coves', caption: 'Just minutes east, sandy coral lagoons welcome yachts and fishermen.' },
      { src: IMG_LE_FRANCOIS, title: 'Traditional Sail Heritage', caption: 'Southern seafaring communities preserving Creole marine vocabulary.' }
    ]
  },
  'sainte-anne': {
    id: 'sainte-anne',
    category: 'commune',
    name: 'Sainte-Anne',
    creoleName: 'Sentann • Plage des Salines',
    region: 'Extrême Sud',
    lat: 14.4361,
    lng: -60.8806,
    audioPhrase: 'Sentann, Plaj Salin ak sab blan',
    fact: 'Martinique’s southernmost commune, famous for Plage des Salines, historic salt pans, and arid coastal trails.',
    tradition: 'Sunday family Creole picnics beneath coconut palms with boudin, boucané chicken, and hand-turned coconut sorbet.',
    proverb: '"Sé chalè solèy ki ka dousi fwi!" (It is the sun’s warmth that sweetens the fruit!)',
    gallery: [
      { src: IMG_SAINTE_ANNE, title: 'Plage des Salines Panorama', caption: 'Curving white sands and turquoise waters shaded by leaning palms.' },
      { src: IMG_LE_DIAMANT, title: 'Southern Sunset Coast', caption: 'Golden Caribbean light across Martinique’s southern coastline.' }
    ]
  },

  // === HISTORICAL SITES (OSM HERITAGE TRAIL) ===
  'cap-110': {
    id: 'cap-110',
    category: 'historical',
    name: 'Mémorial Cap 110',
    creoleName: 'Kap 110 • Anse Caffard Memorial',
    region: 'Historical Heritage · Le Diamant',
    lat: 14.4686,
    lng: -61.0453,
    audioPhrase: 'Mémoryal Kap san dis, mémwa zansèt nou',
    fact: 'Fifteen monumental 2.5-meter white statues by Martinican sculptor Laurent Valère standing in triangular formation facing 110° East toward the Gulf of Guinea, commemorating an 1830 shipwreck of enslaved Africans.',
    tradition: 'Annual lantern and floral tributes preserving ancestral dignity and oral remembrance.',
    proverb: '"Mémwa pa ka néyé." (Memory never drowns.)',
    gallery: [
      { src: IMG_CAP_110, title: 'Mémorial Cap 110 — 15 Ancestral Statues', caption: 'Sculptor Laurent Valère’s monumental stone figures gazing 110° East toward the Atlantic horizon.' },
      { src: IMG_LE_DIAMANT, title: 'Coastline Above Anse Caffard', caption: 'Dramatic southern cliffs overlooking Diamond Rock near Cap 110.' },
      { src: IMG_WEATHER_BAY, title: 'Diamond Channel Horizons', caption: 'Warm sunbeams and passing coastal mists beside Anse Caffard.' }
    ]
  },
  'cachot-cyparis': {
    id: 'cachot-cyparis',
    category: 'historical',
    name: 'Kacho Siparis (Cachot de Cyparis)',
    creoleName: 'Kacho Siparis • Survivor Cell of 1902',
    region: 'Historical Heritage · Saint-Pierre',
    lat: 14.7458,
    lng: -61.1748,
    audioPhrase: 'Kacho Siparis an Senpyè',
    fact: 'Thick-walled stone dungeon cell in Saint-Pierre where prisoner Ludger Sylbaris survived the catastrophic 1902 pyroclastic eruption of Mount Pelée.',
    tradition: 'Preserved architectural testimony taught in every Martinican school.',
    proverb: '"Lavi toujou ka trouvé an chimèn." (Life always finds a hidden path.)',
    gallery: [
      { src: IMG_SAINT_PIERRE, title: 'Historic Ruins of Saint-Pierre', caption: 'Remaining stone masonry preserved at the base of Mount Pelée.' }
    ]
  },
  'chateau-dubuc': {
    id: 'chateau-dubuc',
    category: 'historical',
    name: 'Château Dubuc',
    creoleName: 'Chato Dibik • Caravelle Ruins',
    region: 'Historical Heritage · La Trinité',
    lat: 14.7697,
    lng: -60.8925,
    audioPhrase: 'Chato Dibik anlè la Karavèl',
    fact: '17th-century coastal estate ruins overlooking Baie du Trésor on the Caravelle peninsula, exploring maritime trade, sugar heritage, and coastal defense.',
    tradition: 'Guided heritage trails connecting historical stonework with wild Atlantic mangrove forests.',
    proverb: '"Wòch ka palé lè ou sav kouté." (Old stones speak when you know how to listen.)',
    gallery: [
      { src: IMG_LE_FRANCOIS, title: 'Baie du Trésor & Atlantic Waters', caption: 'Sheltered windward waters guarding the Caravelle headland.' }
    ]
  },
  'habitation-clement': {
    id: 'habitation-clement',
    category: 'historical',
    name: 'Habitation Clément',
    creoleName: 'Abitasyon Kléman • Architectural Heritage',
    region: 'Historical Heritage · Le François',
    lat: 14.6022,
    lng: -60.9069,
    audioPhrase: 'Abitasyon Kléman, lakilti épi istwa',
    fact: 'Historic 18th-century Creole wooden manor, botanical park, and contemporary Caribbean art foundation celebrating Martinican sculpture and literature.',
    tradition: 'Preserves traditional Creole timber joinery and agricultural heritage.',
    proverb: '"Rasin ka tchenbé pyé-bwa-a." (Deep roots hold the whole tree upright.)',
    gallery: [
      { src: IMG_LE_FRANCOIS, title: 'Le François Rolling Coast', caption: 'Lush estate valleys descending toward Le François lagoons.' }
    ]
  },
  'village-poterie': {
    id: 'village-poterie',
    category: 'historical',
    name: 'Village de la Poterie',
    creoleName: 'Vilaj Potri • Brick & Clay Craft',
    region: 'Historical Heritage · Les Trois-Îlets',
    lat: 14.5347,
    lng: -61.0189,
    audioPhrase: 'Vilaj Potri Twa-Zilè',
    fact: 'One of Martinique’s oldest continuously active artisanal workshops, firing clay kilns since the 1700s beside peaceful mangrove channels.',
    tradition: 'Traditional clay potters shaping water coolers (kalbas/kruch) and cooking kannari.',
    proverb: '"Lanmen ki ka travay pa ka janmen las." (Hands that craft heritage rarely tire.)',
    gallery: [
      { src: IMG_FORT_DE_FRANCE, title: 'Mangrove Bay Waters', caption: 'Tranquil bay inlets linking artisan workshops to Fort-de-France.' }
    ]
  },

  // === OFF THE BEATEN PATH (ZÒN SÉKRÉ) ===
  'tombolo-sainte-marie': {
    id: 'tombolo-sainte-marie',
    category: 'offbeat',
    name: 'Tombolo de Sainte-Marie',
    creoleName: 'Tonbolo Sanmari • Walking Sandbar',
    region: 'Off the Beaten Path · Nord Atlantique',
    lat: 14.7897,
    lng: -60.9886,
    audioPhrase: 'Tonbolo Sanmari, chimèn anlè lanmè',
    fact: 'A rare natural sandbar bridge that emerges from the Atlantic only between December and April, allowing visitors to walk directly to Îlet Sainte-Marie.',
    tradition: 'Seasonal coastal walk celebrated by locals who gather when Atlantic currents part the sand.',
    proverb: '"Chak bagay ni lè’y." (Everything in nature has its exact season.)',
    gallery: [
      { src: IMG_SAINTE_ANNE, title: 'Golden Sandbar Horizons', caption: 'Shifting coastal sands sculpted by Atlantic trade currents.' }
    ]
  },
  'anse-couleuvre': {
    id: 'anse-couleuvre',
    category: 'offbeat',
    name: 'Anse Couleuvre & Black Sand Trail',
    creoleName: 'Lans Koulèv • Wild Black Sand Cove',
    region: 'Off the Beaten Path · Le Prêcheur',
    lat: 14.8419,
    lng: -61.2219,
    audioPhrase: 'Lans Koulèv, sab nwè épi lanati sovaj',
    fact: 'Hidden at the end of a dramatic single-lane jungle road in Le Prêcheur: a glistening volcanic black-sand beach framed by towering jungle cliffs and hidden waterfalls.',
    tradition: 'Start of the legendary 18km Prêcheur–Grand’Rivière rainforest coastal hike.',
    proverb: '"Pli lwen chimèn-lan yé, pli bèl sékrè-a yé." (The farther the trail, the richer the secret.)',
    gallery: [
      { src: IMG_GRAND_RIVIERE, title: 'Anse Couleuvre Black Sand Shores', caption: 'Wild northern volcanic sands framed by towering rainforest walls.' },
      { src: IMG_RAINFOREST, title: 'Jungle Trail to Anse Couleuvre', caption: 'Deep rainforest canyons and cascading falls tucked behind black sand shores.' }
    ]
  },
  'savane-petrifications': {
    id: 'savane-petrifications',
    category: 'offbeat',
    name: 'Savane des Pétrifications',
    creoleName: 'Savann Pétrifikasyon • Coastal Badlands',
    region: 'Off the Beaten Path · Sainte-Anne',
    lat: 14.3986,
    lng: -60.8617,
    audioPhrase: 'Savann Pétrifikasyon an Sentann',
    fact: 'An unexpected semi-arid volcanic landscape at the southern tip of Martinique featuring fossilized ancient tree fragments and dramatic red basalt cliffs above wild Atlantic surf.',
    tradition: 'End point of the Trace des Caps trail where desert cacti meet crashing turquoise waves.',
    proverb: '"Même anba solèy rèd, lavi ka pousé." (Even beneath fierce sun, life takes root.)',
    gallery: [
      { src: IMG_SAINTE_ANNE, title: 'Southern Coastal Wilderness', caption: 'Untamed Atlantic vistas just east of Plage des Salines.' }
    ]
  },
  'canal-des-esclaves': {
    id: 'canal-des-esclaves',
    category: 'offbeat',
    name: 'Canal des Esclaves (Beaulieu Ridge)',
    creoleName: 'Kannal Bolyé • Cliffside Jungle Aqueduct',
    region: 'Off the Beaten Path · Fonds-Saint-Denis',
    lat: 14.7253,
    lng: -61.1475,
    audioPhrase: 'Kannal Bolyé an mitan gran bwa',
    fact: 'A dizzying 18th-century stone aqueduct winding high along emerald canyon ridges of the Pitons du Carbet, built by enslaved laborers and now a solemn rainforest walk.',
    tradition: 'Respectful mountain hike preserving oral memory of the laborers who carved stone into sheer volcanic slopes.',
    proverb: '"Dlo ka kouri, istwa ka rété." (Water rushes past, history remains carved in stone.)',
    gallery: [
      { src: IMG_RAINFOREST, title: 'Canopy of Fonds-Saint-Denis', caption: 'Towering rainforest cliffs traversed by the historic stone aqueduct.' }
    ]
  },
  'saut-du-gendarme': {
    id: 'saut-du-gendarme',
    category: 'offbeat',
    name: 'Cascade Saut du Gendarme',
    creoleName: 'So Jandanm • Secret Waterfall Pool',
    region: 'Off the Beaten Path · Fonds-Saint-Denis',
    lat: 14.7422,
    lng: -61.1219,
    audioPhrase: 'Kaskad So Jandanm, dlo frè Matinik',
    fact: 'Tucked deep inside the Route de la Trace tropical forest, a serene 10-meter volcanic cascade plunging into a crystal emerald swimming basin.',
    tradition: 'Weekend local retreat where families gather to cool off in spring-fed mountain water.',
    proverb: '"Dlo sous ka rafwéchi kò épi lèspri." (Spring water refreshes both body and spirit.)',
    gallery: [
      { src: IMG_RAINFOREST, title: 'Saut du Gendarme Rainforest Pool', caption: 'Cool mountain falls shaded by giant tropical tree ferns.' }
    ]
  }
};
