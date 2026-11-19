import { ARTIFACTS_CATALOG, CURRICULUM_TERMS, FLASHCARD_DECKS } from './data/vocab.js';
import { MAP_LOCATIONS } from './data/mapData.js';

// =========================================================
// 1. PERSISTENT SETTINGS (ALL 14 CONTROLS FROM UI SCREENSHOTS)
// =========================================================
const SETTINGS_KEY = 'kreyol_study_settings_v1';
const COLLECTION_KEY = 'kreyol_collection_state_v1';
const RECORD_META_KEY = 'kreyol_recordings_meta_v1';

const DEFAULT_SETTINGS = {
  // Audio & Tactile
  wordPronunciation: true,
  translationPlayback: true,
  soundEffects: true,
  vibration: true,
  // Card & Study Content
  partOfSpeech: true,
  pronunciation: true,
  otherTranslations: true,
  definition: true,
  example: true,
  exampleTranslation: true,
  synonymsAntonyms: true,
  collocations: true,
  memoryBar: true,
  learningStats: true
};

let studySettings = { ...DEFAULT_SETTINGS };
let collectionState = {
  points: 0,
  visitedSites: [],
  termStats: {} // { [termId]: { right: 0, almost: 0, wrong: 0, memory: 20 } }
};
let recordedMeta = {}; // { [termId]: { updatedAt, durationSec } }

function loadAllNewState() {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) studySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
  } catch (e) {}
  try {
    const c = localStorage.getItem(COLLECTION_KEY);
    if (c) {
      const parsed = JSON.parse(c);
      collectionState = {
        points: Number(parsed.points || 0),
        visitedSites: Array.isArray(parsed.visitedSites) ? parsed.visitedSites : [],
        termStats: parsed.termStats && typeof parsed.termStats === 'object' ? parsed.termStats : {}
      };
    }
  } catch (e) {}
  try {
    const r = localStorage.getItem(RECORD_META_KEY);
    if (r) recordedMeta = JSON.parse(r) || {};
  } catch (e) {}
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(studySettings)); } catch (e) {}
}
function saveCollection() {
  try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(collectionState)); } catch (e) {}
}
function saveRecordMeta() {
  try { localStorage.setItem(RECORD_META_KEY, JSON.stringify(recordedMeta)); } catch (e) {}
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getLang() {
  return typeof window.currentLang === 'string' ? window.currentLang : 'en';
}

function notify(msg) {
  if (typeof window.showToast === 'function') window.showToast(msg);
}

// =========================================================
// 2. SOUND EFFECTS & HAPTIC VIBRATION
// =========================================================
let sfxAudioCtx = null;
function playSfx(type = 'tap') {
  if (!studySettings.soundEffects) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!sfxAudioCtx) sfxAudioCtx = new AC();
    if (sfxAudioCtx.state === 'suspended') sfxAudioCtx.resume();
    const now = sfxAudioCtx.currentTime;
    const osc = sfxAudioCtx.createOscillator();
    const gain = sfxAudioCtx.createGain();
    if (type === 'right') {
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else if (type === 'almost') {
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    } else if (type === 'wrong') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(175, now + 0.16);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else {
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }
    osc.connect(gain);
    gain.connect(sfxAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  } catch (e) {}
}

function triggerHaptic(pattern = 18) {
  if (!studySettings.vibration) return;
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) {}
}

// Speak Creole + Optional Translation Playback
function speakTermSequence(creoleText, translationText, btnEl, onFinished) {
  if (!('speechSynthesis' in window)) {
    notify('Speech audio is unavailable in this browser.');
    if (onFinished) onFinished();
    return;
  }
  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang && (v.lang === 'fr-FR' || v.lang.startsWith('fr'))) || voices[0];
  const enVoice = voices.find(v => v.lang && v.lang.startsWith('en')) || voices[0];

  const speakTranslation = () => {
    if (!studySettings.translationPlayback || !translationText) {
      if (btnEl) btnEl.classList.remove('playing');
      if (onFinished) onFinished();
      return;
    }
    const utt2 = new SpeechSynthesisUtterance(translationText);
    const lang = getLang();
    utt2.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    utt2.voice = lang === 'fr' ? frVoice : enVoice;
    utt2.rate = 0.96;
    utt2.onend = () => {
      if (btnEl) btnEl.classList.remove('playing');
      if (onFinished) onFinished();
    };
    utt2.onerror = () => {
      if (btnEl) btnEl.classList.remove('playing');
      if (onFinished) onFinished();
    };
    window.speechSynthesis.speak(utt2);
  };

  if (btnEl) btnEl.classList.add('playing');
  const utt1 = new SpeechSynthesisUtterance(creoleText);
  if (frVoice) utt1.voice = frVoice;
  utt1.lang = 'fr-FR';
  utt1.rate = 0.88;
  utt1.pitch = 1.04;
  utt1.onend = () => {
    if (typeof window.registerWordListened === 'function') {
      window.registerWordListened(creoleText);
    }
    setTimeout(speakTranslation, 220);
  };
  utt1.onerror = () => {
    if (btnEl) btnEl.classList.remove('playing');
    if (onFinished) onFinished();
  };
  window.speechSynthesis.speak(utt1);
}

// =========================================================
// 3. LOCAL INDEXEDDB VOICE RECORDING STUDIO
// =========================================================
const DB_NAME = 'kreyol_voice_studio_db';
const STORE_NAME = 'recordings';
let dbPromise = null;
let activeMediaRecorder = null;
let activeRecordingTermId = null;
let activeRecordingChunks = [];
let activePlaybackAudio = null;

function openVoiceDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB unsupported'));
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function saveVoiceBlob(termId, blob) {
  const db = await openVoiceDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, termId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function getVoiceBlob(termId) {
  const db = await openVoiceDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(termId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function clearVoiceDb() {
  try {
    const db = await openVoiceDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch (e) {}
  recordedMeta = {};
  saveRecordMeta();
}

async function toggleTermRecording(termId) {
  if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
    activeMediaRecorder.stop();
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    notify('Microphone recording is not supported in this browser.');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    activeRecordingChunks = [];
    activeRecordingTermId = termId;
    const startTs = Date.now();
    activeMediaRecorder = new MediaRecorder(stream);

    activeMediaRecorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) activeRecordingChunks.push(ev.data);
    };
    activeMediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(activeRecordingChunks, { type: activeMediaRecorder.mimeType || 'audio/webm' });
      const durationSec = Math.max(1, Math.round((Date.now() - startTs) / 1000));
      try {
        await saveVoiceBlob(termId, blob);
        const firstTime = !recordedMeta[termId];
        recordedMeta[termId] = { updatedAt: new Date().toISOString(), durationSec };
        saveRecordMeta();
        if (firstTime) awardCollectionPoints(8, 'Voice pronunciation recorded (+8 Collection Pts)');
        else notify('Voice pronunciation updated & saved locally!');
        playSfx('right');
        triggerHaptic([15, 30, 15]);
      } catch (err) {
        notify('Could not store recording locally.');
      }
      activeRecordingTermId = null;
      refreshAllDynamicViews();
    };

    activeMediaRecorder.start();
    triggerHaptic(20);
    notify('Recording... Speak clearly, then tap Stop.');
    refreshAllDynamicViews();
  } catch (err) {
    notify('Microphone permission denied or unavailable.');
  }
}

async function playUserRecording(termId) {
  try {
    const blob = await getVoiceBlob(termId);
    if (!blob) {
      notify('No local recording found for this term yet.');
      return;
    }
    if (activePlaybackAudio) {
      activePlaybackAudio.pause();
      activePlaybackAudio = null;
    }
    const url = URL.createObjectURL(blob);
    activePlaybackAudio = new Audio(url);
    activePlaybackAudio.onended = () => URL.revokeObjectURL(url);
    await activePlaybackAudio.play();
    playSfx('tap');
  } catch (e) {
    notify('Could not play local recording.');
  }
}

async function compareNativeAndMine(termId, creoleWord, translationText) {
  speakTermSequence(creoleWord, translationText, null, () => {
    setTimeout(() => playUserRecording(termId), 350);
  });
}

// =========================================================
// 4. COLLECTION POINTS FRAMEWORK & LEARNING STATS
// =========================================================
function getTermStat(termId) {
  if (!collectionState.termStats[termId]) {
    collectionState.termStats[termId] = { right: 0, almost: 0, wrong: 0, memory: 15 };
  }
  return collectionState.termStats[termId];
}

function awardCollectionPoints(pts, reasonMsg) {
  const prevArtifacts = ARTIFACTS_CATALOG.filter(a => collectionState.points >= a.pointsRequired).length;
  collectionState.points += pts;
  saveCollection();
  const nextArtifacts = ARTIFACTS_CATALOG.filter(a => collectionState.points >= a.pointsRequired).length;
  if (nextArtifacts > prevArtifacts) {
    const newlyUnlocked = ARTIFACTS_CATALOG[nextArtifacts - 1];
    notify(`Artifact Unlocked: ${newlyUnlocked.icon} ${newlyUnlocked.name}! (+${pts} pts)`);
    if (typeof window.confetti === 'function') {
      window.confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
    }
  } else if (reasonMsg) {
    notify(reasonMsg);
  }
  renderCollectionPanels();
}

function rateTermVerdict(termId, verdict) {
  const stat = getTermStat(termId);
  let pts = 1;
  if (verdict === 'right') {
    stat.right += 1;
    stat.memory = Math.min(100, stat.memory + 22);
    pts = 10;
    playSfx('right');
    triggerHaptic(20);
  } else if (verdict === 'almost') {
    stat.almost += 1;
    stat.memory = Math.min(100, stat.memory + 10);
    pts = 5;
    playSfx('almost');
    triggerHaptic(12);
  } else {
    stat.wrong += 1;
    stat.memory = Math.max(5, stat.memory - 15);
    pts = 1;
    playSfx('wrong');
    triggerHaptic([25, 30, 25]);
  }
  collectionState.termStats[termId] = stat;
  if (typeof window.incrementDailyGoalProgress === 'function') window.incrementDailyGoalProgress(1);
  awardCollectionPoints(pts, `+${pts} Collection Pts (${verdict.toUpperCase()})`);
  refreshAllDynamicViews();
}

function renderCollectionPanels() {
  const unlockedCount = ARTIFACTS_CATALOG.filter(a => collectionState.points >= a.pointsRequired).length;
  const html = `
    <div class="collection-top-row">
      <div>
        <strong style="font-size:1rem;">Kòlèksyon Matinik • Heritage Collection Points</strong>
        <div style="font-size:0.82rem; color:var(--ink-secondary);">Earn points via Right/Almost ratings, recordings, and cultural map discoveries (${unlockedCount}/${ARTIFACTS_CATALOG.length} unlocked)</div>
      </div>
      <div class="collection-points-metric"><i class="fas fa-gem"></i> ${collectionState.points} pts</div>
    </div>
    <div class="artifacts-strip">
      ${ARTIFACTS_CATALOG.map(a => {
        const isUnlocked = collectionState.points >= a.pointsRequired;
        return `
          <div class="artifact-tile ${isUnlocked ? 'unlocked' : 'locked'}" title="${escapeHtml(a.en)}">
            <div class="artifact-icon-line">
              <span>${a.icon}</span>
              <i class="fas ${isUnlocked ? 'fa-check-circle' : 'fa-lock'}" style="font-size:0.75rem; color:${isUnlocked ? 'var(--emerald-ok)' : 'var(--ink-secondary)'};"></i>
            </div>
            <div class="artifact-name">${escapeHtml(a.name)}</div>
            <div class="artifact-req">${isUnlocked ? 'Collected' : `${a.pointsRequired} pts`}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  const currMount = document.getElementById('curriculumCollectionPanel');
  const fcMount = document.getElementById('flashcardsCollectionPanel');
  if (currMount) currMount.innerHTML = html;
  if (fcMount) fcMount.innerHTML = html;
}

// =========================================================
// 5. SETTINGS SHEET RENDERER & SYNC
// =========================================================
const SETTINGS_SCHEMA = [
  { group: 'Audio & Tactile Feedback' },
  { key: 'wordPronunciation', label: 'Word pronunciation', desc: '' },
  { key: 'translationPlayback', label: 'Terms translation playback', desc: '' },
  { key: 'soundEffects', label: 'Sound effects', desc: '' },
  { key: 'vibration', label: 'Vibration', desc: '' },
  { group: 'Card & Curriculum Elements' },
  { key: 'partOfSpeech', label: 'Part of speech', desc: '' },
  { key: 'pronunciation', label: 'Pronunciation', desc: '' },
  { key: 'otherTranslations', label: 'Other translations', desc: 'More ways to say it in your language' },
  { key: 'definition', label: 'Definition', desc: 'The meaning, in the language you learn' },
  { key: 'example', label: 'Example', desc: '' },
  { key: 'exampleTranslation', label: 'Example translation', desc: 'The example in your language' },
  { key: 'synonymsAntonyms', label: 'Synonyms and antonyms', desc: 'Similar and opposite words' },
  { key: 'collocations', label: 'Collocations', desc: 'Words it often goes with' },
  { key: 'memoryBar', label: 'Memory bar', desc: '' },
  { key: 'learningStats', label: 'Learning stats', desc: 'Your right, almost and wrong answers' }
];

function renderSettingsSheet() {
  const body = document.getElementById('settingsSheetRows');
  if (!body) return;
  body.innerHTML = SETTINGS_SCHEMA.map(item => {
    if (item.group) {
      return `<div class="settings-group-label">${escapeHtml(item.group)}</div>`;
    }
    const checked = studySettings[item.key] ? 'checked' : '';
    return `
      <div class="setting-row">
        <div>
          <div class="setting-label">${escapeHtml(item.label)}</div>
          ${item.desc ? `<div class="setting-desc">${escapeHtml(item.desc)}</div>` : ''}
        </div>
        <label class="km-switch" aria-label="${escapeHtml(item.label)}">
          <input type="checkbox" data-setting-key="${item.key}" ${checked}>
          <span class="km-switch-slider"></span>
        </label>
      </div>
    `;
  }).join('');

  body.querySelectorAll('input[data-setting-key]').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const key = e.target.getAttribute('data-setting-key');
      studySettings[key] = e.target.checked;
      saveSettings();
      playSfx('tap');
      triggerHaptic(12);
      refreshAllDynamicViews();
    });
  });
}

window.openStudySettings = (open = true) => {
  const backdrop = document.getElementById('settingsDrawerBackdrop');
  if (!backdrop) return;
  if (open) {
    renderSettingsSheet();
    backdrop.classList.add('open');
  } else {
    backdrop.classList.remove('open');
  }
};

// =========================================================
// 6. CURRICULUM ENRICHED CARDS (LIVE SETTINGS + VOICE STUDIO)
// =========================================================
function renderCurriculumModuleCards(modKey, searchFilter = '') {
  const mount = document.getElementById(`enriched-${modKey}`);
  if (!mount) return;
  const terms = CURRICULUM_TERMS[modKey] || [];
  const q = searchFilter.trim().toLowerCase();
  const filtered = q
    ? terms.filter(t => `${t.word} ${t.en} ${t.fr} ${t.example} ${t.definition}`.toLowerCase().includes(q))
    : terms;

  if (!filtered.length) {
    mount.innerHTML = `<p style="color:var(--ink-secondary); padding:1rem;">No terms in this module match "${escapeHtml(searchFilter)}".</p>`;
    return;
  }

  const lang = getLang();
  mount.innerHTML = filtered.map(t => {
    const stat = getTermStat(t.id);
    const hasRec = Boolean(recordedMeta[t.id]);
    const isRecNow = activeRecordingTermId === t.id;
    const meaningMain = lang === 'fr' ? t.fr : t.en;

    return `
      <article class="vocab-term-card" data-term-id="${t.id}">
        <div class="vocab-card-head">
          <div>
            ${studySettings.partOfSpeech ? `<div class="vocab-pos-text">${escapeHtml(t.pos)}</div>` : ''}
            <div class="vocab-creole-main">${escapeHtml(t.word)}</div>
            ${studySettings.pronunciation ? `<div class="vocab-phonetic">${escapeHtml(t.pronounce)}</div>` : ''}
          </div>
          <button type="button" class="one-tap-btn" data-act="listen" data-id="${t.id}" title="Listen">
            <i class="fas fa-volume-up"></i> Listen
          </button>
        </div>

        <div class="vocab-meaning-main">${escapeHtml(meaningMain)}</div>

        ${studySettings.otherTranslations ? `<div class="vocab-meta-line"><strong>Other translations:</strong> ${escapeHtml(t.otherTranslations)}</div>` : ''}
        ${studySettings.definition ? `<div class="vocab-meta-line"><strong>Definition:</strong> ${escapeHtml(t.definition)}</div>` : ''}
        ${studySettings.example ? `<div class="vocab-meta-line"><strong>Example:</strong> <em>"${escapeHtml(t.example)}"</em></div>` : ''}
        ${studySettings.exampleTranslation ? `<div class="vocab-meta-line"><strong>Translation:</strong> ${escapeHtml(t.exampleTranslation)}</div>` : ''}
        ${studySettings.synonymsAntonyms ? `<div class="vocab-meta-line"><strong>Synonyms / Antonyms:</strong> ${escapeHtml(t.synonyms)} · ${escapeHtml(t.antonyms)}</div>` : ''}
        ${studySettings.collocations ? `<div class="vocab-meta-line"><strong>Collocations:</strong> ${escapeHtml(t.collocations)}</div>` : ''}

        ${studySettings.memoryBar ? `
          <div class="memory-bar-wrap">
            <div class="memory-bar-head"><span>Memory strength</span><span>${stat.memory}%</span></div>
            <div class="memory-bar-track"><div class="memory-bar-fill" style="width:${stat.memory}%"></div></div>
          </div>
        ` : ''}

        ${studySettings.learningStats ? `
          <div class="learning-stats-line">
            <span class="stat-right">Right: ${stat.right}</span>
            <span class="stat-almost">Almost: ${stat.almost}</span>
            <span class="stat-wrong">Wrong: ${stat.wrong}</span>
          </div>
        ` : ''}

        <div class="term-action-bar">
          <button type="button" class="one-tap-btn ${isRecNow ? 'recording' : ''}" data-act="record" data-id="${t.id}">
            <i class="fas ${isRecNow ? 'fa-stop' : 'fa-microphone'}"></i> ${isRecNow ? 'Stop' : (hasRec ? 'Re-record' : 'Record')}
          </button>
          ${hasRec ? `
            <button type="button" class="one-tap-btn" data-act="playmine" data-id="${t.id}">
              <i class="fas fa-play"></i> My Voice (${recordedMeta[t.id].durationSec}s)
            </button>
            <button type="button" class="one-tap-btn" data-act="compare" data-id="${t.id}">
              <i class="fas fa-code-compare"></i> Compare
            </button>
          ` : ''}
        </div>

        <div class="rate-row">
          <button type="button" class="rate-btn right" data-act="rate" data-verdict="right" data-id="${t.id}">✓ Right (+10)</button>
          <button type="button" class="rate-btn almost" data-act="rate" data-verdict="almost" data-id="${t.id}">~ Almost (+5)</button>
          <button type="button" class="rate-btn wrong" data-act="rate" data-verdict="wrong" data-id="${t.id}">✕ Review (+1)</button>
        </div>
      </article>
    `;
  }).join('');

  mount.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const act = btn.getAttribute('data-act');
      const term = terms.find(x => x.id === id);
      if (!term) return;
      const trans = lang === 'fr' ? term.fr : term.en;
      if (act === 'listen') speakTermSequence(term.word, trans, btn);
      else if (act === 'record') toggleTermRecording(id);
      else if (act === 'playmine') playUserRecording(id);
      else if (act === 'compare') compareNativeAndMine(id, term.word, trans);
      else if (act === 'rate') rateTermVerdict(id, btn.getAttribute('data-verdict'));
    });
  });
}

function renderAllCurriculumModules(searchFilter = '') {
  renderCurriculumModuleCards('module1', searchFilter);
  renderCurriculumModuleCards('module2', searchFilter);
  renderCurriculumModuleCards('module3', searchFilter);
}

// Enhance existing search bar to also filter enriched curriculum cards
const prevSearchHandler = window.handleCurriculumSearch;
window.handleCurriculumSearch = (query) => {
  if (typeof prevSearchHandler === 'function') prevSearchHandler(query);
  renderAllCurriculumModules(query || '');
};

// =========================================================
// 7. COMPLETE 20-DECK FLASHCARDS + MEMORY + VOICE + COLLECTION
// =========================================================
let fcDeckKey = 'greetings';
let fcIndex = 0;
let fcFlipped = false;

function currentFcTermId() {
  return `fc-${fcDeckKey}-${fcIndex}`;
}

function renderEnhancedFlashcard() {
  const deck = FLASHCARD_DECKS[fcDeckKey] || FLASHCARD_DECKS.greetings;
  const card = deck.cards[fcIndex] || deck.cards[0];
  const termId = currentFcTermId();
  const stat = getTermStat(termId);
  const lang = getLang();

  fcFlipped = false;
  const inner = document.getElementById('flashcardInner');
  if (inner) inner.classList.remove('flipped');

  const titleEl = document.getElementById('flashcardDeckTitle');
  const counterEl = document.getElementById('flashcardCounter');
  if (titleEl) titleEl.textContent = deck.title;
  if (counterEl) counterEl.textContent = `Card ${fcIndex + 1} of ${deck.cards.length}`;

  const frontWord = document.getElementById('fcFrontWord');
  const frontPron = document.getElementById('fcFrontPronounce');
  const frontPos = document.getElementById('fcFrontPos');
  if (frontWord) frontWord.textContent = card.word;
  if (frontPron) {
    frontPron.textContent = card.pronounce;
    frontPron.style.display = studySettings.pronunciation ? 'block' : 'none';
  }
  if (frontPos) {
    frontPos.textContent = card.pos;
    frontPos.style.display = studySettings.partOfSpeech ? 'inline-block' : 'none';
  }

  const backEn = document.getElementById('fcBackEn');
  const backFr = document.getElementById('fcBackFr');
  const backEx = document.getElementById('fcBackEx');
  const backDetails = document.getElementById('fcLinguisticDetails');
  if (backEn) backEn.textContent = card.en;
  if (backFr) backFr.textContent = card.fr;
  if (backEx) {
    backEx.style.display = studySettings.example ? 'block' : 'none';
    backEx.textContent = `"${card.ex}"`;
  }
  if (backDetails) {
    const bits = [];
    if (studySettings.otherTranslations) bits.push(`<div><strong>Other translations:</strong> ${escapeHtml(card.otherTranslations)}</div>`);
    if (studySettings.definition) bits.push(`<div><strong>Definition:</strong> ${escapeHtml(card.definition)}</div>`);
    if (studySettings.exampleTranslation) bits.push(`<div><strong>Example translation:</strong> ${escapeHtml(card.exampleTranslation)}</div>`);
    if (studySettings.synonymsAntonyms) bits.push(`<div><strong>Synonyms / Antonyms:</strong> ${escapeHtml(card.synonyms)} · ${escapeHtml(card.antonyms)}</div>`);
    if (studySettings.collocations) bits.push(`<div><strong>Collocations:</strong> ${escapeHtml(card.collocations)}</div>`);
    backDetails.innerHTML = bits.join('');
    backDetails.style.display = bits.length ? 'flex' : 'none';
  }

  // Memory bar & Learning stats inside Flashcard modal
  const statsMount = document.getElementById('fcMemoryStatsMount');
  if (statsMount) {
    let html = '';
    if (studySettings.memoryBar) {
      html += `
        <div class="memory-bar-wrap" style="margin-bottom:6px;">
          <div class="memory-bar-head"><span>Card memory bar</span><span>${stat.memory}%</span></div>
          <div class="memory-bar-track"><div class="memory-bar-fill" style="width:${stat.memory}%"></div></div>
        </div>`;
    }
    if (studySettings.learningStats) {
      html += `
        <div class="learning-stats-line" style="justify-content:center;">
          <span class="stat-right">Right: ${stat.right}</span>
          <span class="stat-almost">Almost: ${stat.almost}</span>
          <span class="stat-wrong">Wrong: ${stat.wrong}</span>
        </div>`;
    }
    statsMount.innerHTML = html;
  }

  // Voice recording bar inside Flashcard modal
  const recBar = document.getElementById('fcRecorderBar');
  if (recBar) {
    const hasRec = Boolean(recordedMeta[termId]);
    const isRecNow = activeRecordingTermId === termId;
    recBar.innerHTML = `
      <button type="button" class="one-tap-btn ${isRecNow ? 'recording' : ''}" id="fcRecBtn">
        <i class="fas ${isRecNow ? 'fa-stop' : 'fa-microphone'}"></i> ${isRecNow ? 'Stop Mic' : (hasRec ? 'Re-record' : 'Record Yourself')}
      </button>
      ${hasRec ? `<button type="button" class="one-tap-btn" id="fcPlayMineBtn"><i class="fas fa-play"></i> Play My Voice</button>` : ''}
      <button type="button" class="rate-btn right" style="padding:6px 12px;" id="fcRateRight">✓ Right</button>
      <button type="button" class="rate-btn almost" style="padding:6px 12px;" id="fcRateAlmost">~ Almost</button>
      <button type="button" class="rate-btn wrong" style="padding:6px 12px;" id="fcRateWrong">✕ Wrong</button>
    `;
    document.getElementById('fcRecBtn')?.addEventListener('click', () => toggleTermRecording(termId));
    document.getElementById('fcPlayMineBtn')?.addEventListener('click', () => playUserRecording(termId));
    document.getElementById('fcRateRight')?.addEventListener('click', () => rateTermVerdict(termId, 'right'));
    document.getElementById('fcRateAlmost')?.addEventListener('click', () => rateTermVerdict(termId, 'almost'));
    document.getElementById('fcRateWrong')?.addEventListener('click', () => rateTermVerdict(termId, 'wrong'));
  }

  const frontListen = document.querySelector('.flashcard-front .listen-btn');
  if (frontListen) {
    frontListen.onclick = (e) => {
      e.stopPropagation();
      speakTermSequence(card.word, lang === 'fr' ? card.fr : card.en, frontListen);
    };
  }

  const prevBtn = document.getElementById('fcPrevBtn');
  const nextBtn = document.getElementById('fcNextBtn');
  if (prevBtn) prevBtn.disabled = (fcIndex === 0);
  if (nextBtn) nextBtn.disabled = (fcIndex === deck.cards.length - 1);

  if (window.userProgress) {
    if (!window.userProgress.reviewedCards) window.userProgress.reviewedCards = [];
    const k = `${fcDeckKey}-${fcIndex}`;
    if (!window.userProgress.reviewedCards.includes(k)) {
      window.userProgress.reviewedCards.push(k);
      window.userProgress.xp += 2;
      if (typeof window.incrementDailyGoalProgress === 'function') window.incrementDailyGoalProgress(1);
      if (typeof window.saveProgress === 'function') window.saveProgress();
      if (typeof window.updateProgressUI === 'function') window.updateProgressUI();
    }
  }

  if (studySettings.wordPronunciation) {
    setTimeout(() => {
      speakTermSequence(card.word, lang === 'fr' ? card.fr : card.en, frontListen);
    }, 180);
  }
}

window.openFlashcards = (deckKey) => {
  fcDeckKey = (deckKey && FLASHCARD_DECKS[deckKey]) ? deckKey : 'greetings';
  fcIndex = 0;
  const modal = document.getElementById('flashcardModal');
  if (modal) {
    modal.classList.add('open');
    renderEnhancedFlashcard();
  }
};
window.nextFlashcard = () => {
  const deck = FLASHCARD_DECKS[fcDeckKey] || FLASHCARD_DECKS.greetings;
  if (fcIndex < deck.cards.length - 1) {
    fcIndex++;
    renderEnhancedFlashcard();
  }
};
window.prevFlashcard = () => {
  if (fcIndex > 0) {
    fcIndex--;
    renderEnhancedFlashcard();
  }
};
window.flipFlashcard = () => {
  const inner = document.getElementById('flashcardInner');
  if (!inner) return;
  fcFlipped = !fcFlipped;
  inner.classList.toggle('flipped', fcFlipped);
  triggerHaptic(10);
};

// Update accurate card counts on the 20 deck cards
function syncDeckCardCounts() {
  document.querySelectorAll('.flashcards-grid .flashcard').forEach(el => {
    const oc = el.getAttribute('onclick') || '';
    const m = oc.match(/openFlashcards\('([^']+)'\)/);
    if (m && FLASHCARD_DECKS[m[1]]) {
      const countEl = el.querySelector('.count');
      if (countEl) countEl.textContent = `${FLASHCARD_DECKS[m[1]].cards.length} interactive cards`;
    }
  });
}

// =========================================================
// 8. HANDS-FREE IMMERSION MODE + VOICE COMMANDS
// =========================================================
let hfDeckKey = 'greetings';
let hfIndex = 0;
let hfPlaying = false;
let hfTimer = null;
let hfVoiceCmdActive = false;
let hfRecognition = null;

function renderHandsFreeStage() {
  const deck = FLASHCARD_DECKS[hfDeckKey] || FLASHCARD_DECKS.greetings;
  const card = deck.cards[hfIndex] || deck.cards[0];
  const lang = getLang();
  const cEl = document.getElementById('hfCreoleWord');
  const pEl = document.getElementById('hfPhonetic');
  const tEl = document.getElementById('hfTranslation');
  const eEl = document.getElementById('hfExample');
  const cntEl = document.getElementById('hfCounter');
  if (cEl) cEl.textContent = card.word;
  if (pEl) pEl.textContent = card.pronounce;
  if (tEl) tEl.textContent = lang === 'fr' ? card.fr : card.en;
  if (eEl) eEl.textContent = `"${card.ex}"`;
  if (cntEl) cntEl.textContent = `${deck.title} · ${hfIndex + 1} / ${deck.cards.length}`;
}

function playHandsFreeStep() {
  if (!hfPlaying) return;
  renderHandsFreeStage();
  const deck = FLASHCARD_DECKS[hfDeckKey] || FLASHCARD_DECKS.greetings;
  const card = deck.cards[hfIndex];
  const trans = getLang() === 'fr' ? card.fr : card.en;
  speakTermSequence(card.word, trans, null, () => {
    if (!hfPlaying) return;
    hfTimer = setTimeout(() => {
      hfIndex = (hfIndex + 1) % deck.cards.length;
      playHandsFreeStep();
    }, 1400);
  });
}

window.openHandsFreeModal = (open = true) => {
  const ov = document.getElementById('handsFreeOverlay');
  if (!ov) return;
  if (open) {
    const sel = document.getElementById('hfDeckSelect');
    if (sel && sel.options.length === 0) {
      Object.keys(FLASHCARD_DECKS).forEach(k => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = FLASHCARD_DECKS[k].title;
        sel.appendChild(opt);
      });
      sel.value = hfDeckKey;
    }
    ov.classList.add('open');
    renderHandsFreeStage();
  } else {
    hfPlaying = false;
    if (hfTimer) clearTimeout(hfTimer);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopHfVoiceCommands();
    ov.classList.remove('open');
    updateHfButtons();
  }
};

function updateHfButtons() {
  const btn = document.getElementById('hfPlayPauseBtn');
  if (btn) btn.innerHTML = hfPlaying ? '<i class="fas fa-pause"></i> Pause Loop' : '<i class="fas fa-play"></i> Start Audio Loop';
}

window.toggleHandsFreeLoop = () => {
  hfPlaying = !hfPlaying;
  if (hfTimer) clearTimeout(hfTimer);
  updateHfButtons();
  if (hfPlaying) {
    playHandsFreeStep();
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

window.hfNextCard = () => {
  const deck = FLASHCARD_DECKS[hfDeckKey] || FLASHCARD_DECKS.greetings;
  hfIndex = (hfIndex + 1) % deck.cards.length;
  renderHandsFreeStage();
  if (hfPlaying) playHandsFreeStep();
};

window.hfPrevCard = () => {
  const deck = FLASHCARD_DECKS[hfDeckKey] || FLASHCARD_DECKS.greetings;
  hfIndex = (hfIndex - 1 + deck.cards.length) % deck.cards.length;
  renderHandsFreeStage();
  if (hfPlaying) playHandsFreeStep();
};

window.changeHandsFreeDeck = (key) => {
  hfDeckKey = key;
  hfIndex = 0;
  renderHandsFreeStage();
  if (hfPlaying) playHandsFreeStep();
};

function stopHfVoiceCommands() {
  hfVoiceCmdActive = false;
  if (hfRecognition) {
    try { hfRecognition.stop(); } catch (e) {}
    hfRecognition = null;
  }
  const b = document.getElementById('hfVoiceCmdBtn');
  if (b) b.textContent = 'Voice Commands: Off';
}

window.toggleHfVoiceCommands = () => {
  if (hfVoiceCmdActive) {
    stopHfVoiceCommands();
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    notify('Voice commands are unavailable in this browser.');
    return;
  }
  hfRecognition = new SR();
  hfRecognition.continuous = true;
  hfRecognition.interimResults = false;
  hfRecognition.lang = 'en-US';
  hfRecognition.onresult = (ev) => {
    const phrase = ev.results[ev.results.length - 1][0].transcript.toLowerCase();
    if (phrase.includes('next')) window.hfNextCard();
    else if (phrase.includes('back') || phrase.includes('previous')) window.hfPrevCard();
    else if (phrase.includes('repeat')) renderHandsFreeStage();
    else if (phrase.includes('stop') || phrase.includes('pause')) {
      hfPlaying = false;
      updateHfButtons();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  };
  hfRecognition.onend = () => { if (hfVoiceCmdActive) try { hfRecognition.start(); } catch (e) {} };
  try {
    hfRecognition.start();
    hfVoiceCmdActive = true;
    const b = document.getElementById('hfVoiceCmdBtn');
    if (b) b.textContent = 'Voice Commands: Listening ("Next", "Back", "Stop")';
  } catch (e) {
    notify('Could not start voice command listener.');
  }
};

// =========================================================
// 9. OSM LEAFLET MAP + HISTORICAL & OFF-BEATEN-PATH + GALLERY
// =========================================================
let leafletMap = null;
let leafletMarkers = [];
let currentMapFilter = 'all';
let currentMapMode = 'osm'; // 'osm' or 'svg'
let activeSiteId = 'fort-de-france';
let activeGalleryPhotos = [];
let activeGalleryIdx = 0;

function initOsmMap() {
  const container = document.getElementById('osmMapContainer');
  if (!container || typeof window.L === 'undefined') return;
  if (!leafletMap) {
    leafletMap = window.L.map('osmMapContainer', { scrollWheelZoom: false }).setView([14.6415, -61.0242], 10);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(leafletMap);
  }
  renderOsmMarkers();
}

function renderOsmMarkers() {
  if (!leafletMap) return;
  leafletMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletMarkers = [];

  const colorMap = {
    commune: '#254EDB',
    historical: '#DC2626',
    offbeat: '#059669'
  };

  Object.values(MAP_LOCATIONS).forEach(loc => {
    if (currentMapFilter !== 'all' && loc.category !== currentMapFilter) return;
    const marker = window.L.circleMarker([loc.lat, loc.lng], {
      radius: loc.id === activeSiteId ? 10 : 7,
      fillColor: colorMap[loc.category] || '#254EDB',
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.92
    }).addTo(leafletMap);

    marker.bindPopup(`<strong>${escapeHtml(loc.name)}</strong><br><small>${escapeHtml(loc.creoleName)}</small>`);
    marker.on('click', () => window.selectCommune(loc.id));
    leafletMarkers.push(marker);
  });

  renderSiteChips();
}

function renderSiteChips() {
  const chipsContainer = document.getElementById('communeChipsContainer');
  if (!chipsContainer) return;
  chipsContainer.innerHTML = '';
  Object.values(MAP_LOCATIONS).forEach(loc => {
    if (currentMapFilter !== 'all' && loc.category !== currentMapFilter) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `commune-chip ${loc.id === activeSiteId ? 'active' : ''}`;
    const tag = loc.category === 'historical' ? '🏛 ' : (loc.category === 'offbeat' ? '🌿 ' : '');
    btn.textContent = `${tag}${loc.name}`;
    btn.onclick = () => window.selectCommune(loc.id);
    chipsContainer.appendChild(btn);
  });
}

window.filterMapSites = (cat) => {
  currentMapFilter = cat;
  document.querySelectorAll('.map-filter-btn[data-map-filter]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-map-filter') === cat);
  });
  renderOsmMarkers();
};

window.toggleMapViewMode = (mode) => {
  currentMapMode = mode;
  const osmWrap = document.getElementById('osmMapContainer');
  const svgWrap = document.getElementById('svgMapFallbackWrap');
  if (osmWrap) osmWrap.style.display = mode === 'osm' ? 'block' : 'none';
  if (svgWrap) svgWrap.style.display = mode === 'svg' ? 'block' : 'none';
  document.querySelectorAll('.map-filter-btn[data-map-view]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-map-view') === mode);
  });
  if (mode === 'osm' && leafletMap) {
    setTimeout(() => leafletMap.invalidateSize(), 120);
  }
};

window.selectCommune = (siteKey) => {
  const data = MAP_LOCATIONS[siteKey];
  if (!data) return;
  activeSiteId = siteKey;
  window.currentSelectedCommune = siteKey;

  document.querySelectorAll('.commune-pin').forEach(p => p.classList.remove('active'));
  document.getElementById(`pin-${siteKey}`)?.classList.add('active');

  if (!collectionState.visitedSites.includes(siteKey)) {
    collectionState.visitedSites.push(siteKey);
    awardCollectionPoints(10, `Discovered ${data.name}! (+10 Collection Pts)`);
  }

  const titleEl = document.getElementById('communeTitle');
  const creoleEl = document.getElementById('communeCreoleName');
  const badgeEl = document.getElementById('communeRegionBadge');
  const factEl = document.getElementById('communeFactText');
  const tradEl = document.getElementById('communeTraditionText');
  const provEl = document.getElementById('communeProverbText');
  const listenEl = document.getElementById('communeListenLabel');

  if (titleEl) titleEl.textContent = data.name;
  if (creoleEl) creoleEl.textContent = data.creoleName;
  if (badgeEl) badgeEl.textContent = data.region;
  if (factEl) factEl.textContent = data.fact;
  if (tradEl) tradEl.textContent = data.tradition;
  if (provEl) provEl.textContent = data.proverb;
  if (listenEl) listenEl.textContent = `Listen: "${data.name}"`;

  if (leafletMap && currentMapMode === 'osm') {
    leafletMap.panTo([data.lat, data.lng], { animate: true });
    renderOsmMarkers();
  } else {
    renderSiteChips();
  }
};

window.speakCommuneAudio = () => {
  const data = MAP_LOCATIONS[activeSiteId];
  if (data) speakTermSequence(data.audioPhrase || data.name, data.name, document.getElementById('communeListenBtn'));
};

window.askTutorAboutCurrentCommune = () => {
  const data = MAP_LOCATIONS[activeSiteId];
  if (!data) return;
  if (typeof window.toggleAiTutor === 'function') window.toggleAiTutor(true);
  if (typeof window.sendQuickPrompt === 'function') {
    window.sendQuickPrompt(`Tell me the cultural history and local Creole expressions of ${data.name} in Martinique.`);
  }
};

// Commune Photo Gallery Modal
window.openCommuneGallery = () => {
  const data = MAP_LOCATIONS[activeSiteId];
  if (!data) return;
  activeGalleryPhotos = data.gallery || [];
  activeGalleryIdx = 0;
  const modal = document.getElementById('galleryModalOverlay');
  if (!modal) return;
  document.getElementById('galleryModalTitle').textContent = `${data.name} — Landscape & Heritage Gallery`;
  renderGallerySlide();
  modal.classList.add('open');
};

window.closeCommuneGallery = () => {
  document.getElementById('galleryModalOverlay')?.classList.remove('open');
};

function renderGallerySlide() {
  const slide = activeGalleryPhotos[activeGalleryIdx];
  if (!slide) return;
  const img = document.getElementById('galleryHeroImg');
  const capTitle = document.getElementById('galleryCaptionTitle');
  const capBody = document.getElementById('galleryCaptionBody');
  const thumbs = document.getElementById('galleryThumbsRow');

  if (img) {
    img.src = slide.src;
    img.alt = slide.title;
  }
  if (capTitle) capTitle.textContent = slide.title;
  if (capBody) capBody.textContent = slide.caption;
  if (thumbs) {
    thumbs.innerHTML = activeGalleryPhotos.map((p, i) => `
      <button type="button" class="gallery-thumb-btn ${i === activeGalleryIdx ? 'active' : ''}" data-gidx="${i}" aria-label="View ${escapeHtml(p.title)}">
        <img src="${p.src}" alt="${escapeHtml(p.title)}" referrerpolicy="no-referrer">
      </button>
    `).join('');
    thumbs.querySelectorAll('[data-gidx]').forEach(b => {
      b.addEventListener('click', () => {
        activeGalleryIdx = Number(b.getAttribute('data-gidx'));
        renderGallerySlide();
      });
    });
  }
}

window.galleryNext = () => {
  if (!activeGalleryPhotos.length) return;
  activeGalleryIdx = (activeGalleryIdx + 1) % activeGalleryPhotos.length;
  renderGallerySlide();
};
window.galleryPrev = () => {
  if (!activeGalleryPhotos.length) return;
  activeGalleryIdx = (activeGalleryIdx - 1 + activeGalleryPhotos.length) % activeGalleryPhotos.length;
  renderGallerySlide();
};

// =========================================================
// 10. AGENTIC CULTURAL STUDY COACH + SAFER TUTOR & BUG FIXES
// =========================================================
window.requestAgenticCoach = async () => {
  const out = document.getElementById('agenticCoachResult');
  const btn = document.getElementById('agenticCoachBtn');
  if (!out || !btn) return;
  btn.disabled = true;
  out.style.display = 'block';
  out.innerHTML = `<div style="padding:0.6rem 0; color:var(--ink-secondary);"><i class="fas fa-spinner fa-spin"></i> Analyzing your mastery stats, recordings & island trail...</div>`;

  let rightCount = 0, almostCount = 0, wrongCount = 0;
  Object.values(collectionState.termStats).forEach(s => {
    rightCount += s.right || 0;
    almostCount += s.almost || 0;
    wrongCount += s.wrong || 0;
  });

  try {
    const res = await fetch('/api/agentic-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentLang: getLang(),
        stats: {
          xp: window.userProgress ? window.userProgress.xp : 0,
          collectionPoints: collectionState.points,
          rightCount,
          almostCount,
          wrongCount,
          recordedCount: Object.keys(recordedMeta).length,
          visitedCommunes: collectionState.visitedSites
        }
      })
    });
    const data = await res.json();
    const c = data.coach;
    if (!c) throw new Error('Invalid coach payload');

    out.innerHTML = `
      <div style="margin-top:0.75rem; border-top:1px solid var(--hairline); padding-top:0.75rem;">
        <div style="font-weight:700; color:var(--cobalt);">${escapeHtml(c.focusArea)}</div>
        <p style="margin:4px 0 8px; font-size:0.9rem;">${escapeHtml(c.encouragement)}</p>
        <p style="margin:0 0 10px; font-size:0.86rem; color:var(--ink-secondary);"><strong>Cultural Note:</strong> ${escapeHtml(c.culturalInsight)}</p>
        <div style="background:var(--surface-card); border:1px solid var(--hairline); border-radius:12px; padding:0.85rem;">
          <div style="font-size:0.8rem; text-transform:uppercase; color:var(--ink-secondary); font-weight:700;">Adaptive Mini-Challenge</div>
          <div style="font-size:1.1rem; font-weight:800; margin-top:4px;">${escapeHtml(c.miniChallenge.creole)} <span style="font-weight:400; font-size:0.86rem; color:var(--ink-secondary);">${escapeHtml(c.miniChallenge.phonetic)}</span></div>
          <div style="font-size:0.9rem; margin:4px 0 6px;">${escapeHtml(c.miniChallenge.prompt)}</div>
          <div id="coachChallengeOptions">
            ${(c.miniChallenge.options || []).map(opt => `<button type="button" class="coach-challenge-opt" data-opt="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join('')}
          </div>
          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="one-tap-btn" id="coachLaunchDeckBtn"><i class="fas fa-layer-group"></i> Practice "${escapeHtml(c.recommendedDeck)}" Deck</button>
            <button type="button" class="one-tap-btn" id="coachListenChallengeBtn"><i class="fas fa-volume-up"></i> Listen</button>
          </div>
        </div>
      </div>
    `;

    out.querySelectorAll('.coach-challenge-opt').forEach(optBtn => {
      optBtn.addEventListener('click', () => {
        const chosen = optBtn.getAttribute('data-opt');
        if (chosen === c.miniChallenge.answer) {
          optBtn.classList.add('correct');
          playSfx('right');
          triggerHaptic(20);
          awardCollectionPoints(10, 'Agentic Mini-Challenge Solved! (+10 Collection Pts)');
        } else {
          optBtn.classList.add('wrong');
          playSfx('wrong');
          triggerHaptic([20, 25, 20]);
        }
      });
    });

    document.getElementById('coachLaunchDeckBtn')?.addEventListener('click', () => window.openFlashcards(c.recommendedDeck));
    document.getElementById('coachListenChallengeBtn')?.addEventListener('click', () => speakTermSequence(c.miniChallenge.creole, c.miniChallenge.answer));
  } catch (e) {
    out.innerHTML = `<p style="color:var(--crimson-wrong); font-size:0.9rem;">Could not load study coach right now. Try again shortly.</p>`;
  } finally {
    btn.disabled = false;
  }
};

// Fix Confirm/Alert/Prompt usage & add Speaking Practice voice studio hook
window.resetUserProgress = () => {
  const modal = document.getElementById('confirmResetModal');
  if (modal) modal.classList.add('open');
};
window.closeConfirmResetModal = () => {
  document.getElementById('confirmResetModal')?.classList.remove('open');
};
window.confirmFullReset = async () => {
  window.closeConfirmResetModal();
  if (window.userProgress) {
    window.userProgress = {
      modules: { module1: false, module2: false, module3: false },
      quizzes: { quiz1: false, quiz2: false, quiz3: false },
      listenedWords: [],
      reviewedCards: [],
      xp: 0,
      streak: 1,
      lastActivityDate: null
    };
    if (typeof window.saveProgress === 'function') window.saveProgress();
    if (typeof window.updateProgressUI === 'function') window.updateProgressUI();
  }
  collectionState = { points: 0, visitedSites: [], termStats: {} };
  saveCollection();
  await clearVoiceDb();
  refreshAllDynamicViews();
  notify('All progress, collection points, and voice recordings reset.');
};

// Upgrade speakCreole to respect Settings & avoid window.alert()
window.speakCreole = (text, btnElement) => {
  speakTermSequence(text, '', btnElement);
  triggerHaptic(10);
};

// Refresh helper
function refreshAllDynamicViews() {
  const searchVal = document.getElementById('curriculumSearchInput')?.value || '';
  renderAllCurriculumModules(searchVal);
  renderCollectionPanels();
  if (document.getElementById('flashcardModal')?.classList.contains('open')) {
    renderEnhancedFlashcard();
  }
}

// Inject Recording button inside Speaking Practice Card
function hookSpeakingPracticeRecorder() {
  const card = document.querySelector('.speaking-practice-card .speech-actions-strip') || document.getElementById('speakingPracticeRecorderMount');
  if (!card) return;
  card.innerHTML = `
    <button type="button" class="one-tap-btn" id="spRecordLocalBtn"><i class="fas fa-microphone"></i> Record & Save Locally</button>
    <button type="button" class="one-tap-btn" id="spPlayLocalBtn"><i class="fas fa-play"></i> Replay My Voice</button>
  `;
  document.getElementById('spRecordLocalBtn')?.addEventListener('click', () => {
    const idx = typeof window.speakingCurrentIndex === 'number' ? window.speakingCurrentIndex : 0;
    toggleTermRecording(`speech-practice-${idx}`);
  });
  document.getElementById('spPlayLocalBtn')?.addEventListener('click', () => {
    const idx = typeof window.speakingCurrentIndex === 'number' ? window.speakingCurrentIndex : 0;
    playUserRecording(`speech-practice-${idx}`);
  });
}

// =========================================================
// 11. BOOTSTRAP
// =========================================================
function bootstrapAppEnhancements() {
  loadAllNewState();
  syncDeckCardCounts();
  renderAllCurriculumModules();
  renderCollectionPanels();
  initOsmMap();
  window.selectCommune('fort-de-france');
  hookSpeakingPracticeRecorder();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAppEnhancements);
} else {
  bootstrapAppEnhancements();
}
