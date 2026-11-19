import { HERO_BANNER_IMAGE, UI_STRINGS } from './data/curriculum.js';
import { MAP_LOCATIONS } from './data/mapData.js';
import { ARTWORKS, FLASHCARD_DECKS } from './data/vocab.js';
import {
  checkIsAdmin,
  createDictionaryEntry,
  createKoudmenPost,
  createLessonArticle,
  deleteDictionaryEntry,
  deleteLessonArticle,
  initFirebase,
  loadUserProgressFromCloud,
  observeAuth,
  resendVerificationEmail,
  resetUserPassword,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeDictionary,
  subscribeKoudmen,
  subscribeLessons,
  syncUserProgressToCloud,
  upvoteKoudmenPost
} from './firebase.js';
import {
  captureSpokenPhrase,
  clearAllVoiceRecordings,
  playSfx,
  speakTermSequence,
  startNatureSounds,
  stopNatureSounds,
  triggerHaptic
} from './services/audioEngine.js';
import {
  escapeHtml,
  renderCurriculumAndOralLabs,
  renderLevelsAndLessons,
  renderWordOfTheDayWidget
} from './views/curriculumAndQuiz.js';
import {
  getActiveFlashcardList,
  renderDictionarySection,
  renderFlashcardDecksGrid,
  renderFlashcardModal,
  renderHandsFreeModal
} from './views/flashcardsAndDictionary.js';
import {
  destroyLeafletMap,
  renderCommunityAndInstitutions,
  renderGalleryModal,
  renderMartiniqueMapSection
} from './views/mapAndKoudmen.js';
import {
  renderAdminStudio,
  renderProgressDashboard,
  renderSettingsDrawer
} from './views/progressAndAdmin.js';

const STORAGE_KEYS = {
  PROGRESS: 'kreyol_matinik_student_progress_v2',
  SETTINGS: 'kreyol_study_settings_v1',
  COLLECTION: 'kreyol_collection_state_v1',
  RECORD_META: 'kreyol_recordings_meta_v1',
  DAILY_GOAL: 'kreyol_daily_study_goal_v1',
  THEME: 'kreyol_matinik_theme',
  KOUDMEN_LOCAL: 'kreyol_koudmen_local_v3',
  UPVOTED: 'kreyol_koudmen_upvoted_v3'
};

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEFAULT_SETTINGS = {
  wordPronunciation: true,
  translationPlayback: true,
  soundEffects: true,
  vibration: true,
  voiceURI: '',
  speechRate: 0.9,
  mainVolume: 0.9,
  ambientVolume: 0.35,
  reduceMotion: Boolean(prefersReduced),
  iphoneDuoLayout: false,
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

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

// =========================================================
// APPLICATION STORE
// =========================================================
const savedProg = readJson(STORAGE_KEYS.PROGRESS, {});
const savedGoal = readJson(STORAGE_KEYS.DAILY_GOAL, {});
const savedColl = readJson(STORAGE_KEYS.COLLECTION, {});

const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

const ctx = {
  strings: UI_STRINGS,
  user: null,
  isAdmin: false,
  settings: { ...DEFAULT_SETTINGS, ...readJson(STORAGE_KEYS.SETTINGS, {}) },
  progress: {
    modules: { module1: false, module2: false, module3: false, ...(savedProg.modules || {}) },
    quizzes: { quiz1: false, quiz2: false, quiz3: false, ...(savedProg.quizzes || {}) },
    listenedWords: Array.isArray(savedProg.listenedWords) ? savedProg.listenedWords : [],
    reviewedCards: Array.isArray(savedProg.reviewedCards) ? savedProg.reviewedCards : [],
    xp: Number(savedProg.xp || 0),
    streak: Number(savedProg.streak || 1),
    lastActivityDate: savedProg.lastActivityDate || todayIso()
  },
  collection: {
    points: Number(savedColl.points || 0),
    visitedSites: Array.isArray(savedColl.visitedSites) ? savedColl.visitedSites : [],
    termStats: savedColl.termStats && typeof savedColl.termStats === 'object' ? savedColl.termStats : {}
  },
  dailyGoal: {
    target: Number(savedGoal.target || 10),
    completedToday: savedGoal.lastDate === todayIso() ? Number(savedGoal.completedToday || 0) : 0,
    lastDate: todayIso(),
    celebratedToday: savedGoal.lastDate === todayIso() ? Boolean(savedGoal.celebratedToday) : false
  },
  recordedMeta: readJson(STORAGE_KEYS.RECORD_META, {}),
  focusTimer: {
    durationMin: 25,
    remainingSec: 25 * 60,
    running: false,
    muted: false,
    track: 'rainforest',
    intervalId: null
  },
  cloud: {
    lessons: [],
    dictionary: [],
    koudmen: []
  },
  state: {
    lang: 'en',
    isDark: false,
    wotdIdx: dayOfYear % 12,
    openAccordions: new Set(['acc-curriculum', 'acc-progress']),
    activeModule: 'module1',
    activeOralTab: 'module',
    curriculumSearch: '',
    audioQuizIdx: 0,
    audioQuizScore: 0,
    audioSpeed: 1.0,
    speakingIdx: 0,
    speakingScore: 0,
    fcDeckKey: 'greetings',
    fcIndex: 0,
    fcFlipped: false,
    fcSwipeFeedback: null,
    fcSpeakAlongActive: false,
    fcSpeakAlongCue: null,
    hfDeckKey: 'greetings',
    hfIndex: 0,
    hfPlaying: false,
    hfLoopTimer: null,
    hfVoiceCmds: false,
    dictSearch: '',
    dictLevel: 'all',
    dictLimit: 12,
    mapCategory: 'all',
    mapMode: 'osm',
    selectedSiteId: 'fort-de-france',
    gallerySiteId: 'fort-de-france',
    galleryIdx: 0,
    koudmenTopic: 'all',
    showKoudmenForm: false,
    localKoudmenPosts: readJson(STORAGE_KEYS.KOUDMEN_LOCAL, []),
    upvotedPostIds: readJson(STORAGE_KEYS.UPVOTED, []),
    tutorHistory: [],
    tutorLoading: false,
    lastCoachData: null,
    tourStep: 0,
    adminImageUrl: '',
    adminFileUrl: '',
    adminFileName: '',
    adminUploadLabel: ''
  },
  actions: {}
};

// =========================================================
// STORE MUTATIONS & HELPERS
// =========================================================
let toastTimer = null;
let cloudSyncTimer = null;

function notify(msg) {
  const toastEl = document.getElementById('kmToast');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600);
}

function fireConfetti(opts = {}) {
  if (ctx.settings.reduceMotion) return;
  if (typeof window.confetti === 'function') {
    window.confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 }, ...opts });
  }
}

function checkDailyStreak() {
  const today = todayIso();
  const prev = ctx.progress.lastActivityDate;
  if (!prev) {
    ctx.progress.lastActivityDate = today;
    ctx.progress.streak = 1;
  } else if (prev !== today) {
    const diffDays = Math.floor((new Date(today).getTime() - new Date(prev).getTime()) / 86400000);
    if (diffDays === 1) {
      ctx.progress.streak += 1;
      notify(`Daily Streak increased to ${ctx.progress.streak} days!`);
    } else if (diffDays > 1) {
      ctx.progress.streak = 1;
    }
    ctx.progress.lastActivityDate = today;
  }
}

function saveProgress() {
  writeJson(STORAGE_KEYS.PROGRESS, ctx.progress);
  writeJson(STORAGE_KEYS.COLLECTION, ctx.collection);
  writeJson(STORAGE_KEYS.DAILY_GOAL, ctx.dailyGoal);
  scheduleCloudSync();
}

function scheduleCloudSync() {
  if (!ctx.user || !ctx.user.emailVerified) return;
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    syncUserProgressToCloud(ctx.user, {
      xp: ctx.progress.xp,
      streak: ctx.progress.streak,
      collectionPoints: ctx.collection.points,
      modules: ctx.progress.modules,
      quizzes: ctx.progress.quizzes,
      reviewedCards: ctx.progress.reviewedCards,
      listenedWords: ctx.progress.listenedWords,
      visitedSites: ctx.collection.visitedSites
    }).catch((err) => console.warn('Cloud sync skipped:', err.message));
  }, 1000);
}

function getTermStats(termId) {
  if (!ctx.collection.termStats[termId]) {
    ctx.collection.termStats[termId] = { right: 0, almost: 0, wrong: 0, memory: 20 };
  }
  return ctx.collection.termStats[termId];
}

function getSmartReviewCount() {
  let count = 0;
  Object.values(ctx.collection.termStats).forEach((st) => {
    if (st.wrong > 0 || st.almost > 0 || st.memory < 70) count += 1;
  });
  return Math.max(count, 5);
}

function rerenderProgressAndNav() {
  renderProgressDashboard(document.getElementById('progressMount'), ctx);
  renderLevelsAndLessons(document.getElementById('levelsMount'), ctx);
  renderHeaderAuthButton();
}

ctx.actions = {
  notify,
  fireConfetti,
  playSfx: (type) => {
    triggerHaptic(ctx.settings.vibration, type === 'right' ? 20 : 12);
    playSfx(ctx.settings, type);
  },
  getTermStats,
  getSmartReviewCount,
  saveSettings: () => {
    writeJson(STORAGE_KEYS.SETTINGS, ctx.settings);
    applyBodyClasses();
    renderSettingsDrawer(document.getElementById('settingsDrawerBackdrop'), ctx);
  },
  rerenderCurrentViews: () => {
    renderCurriculumAndOralLabs(document.getElementById('curriculumMount'), ctx);
    const fcBackdrop = document.getElementById('flashcardModalBackdrop');
    if (fcBackdrop?.classList.contains('open')) renderFlashcardModal(fcBackdrop, ctx);
  },
  awardXp: (amount, msg) => {
    checkDailyStreak();
    ctx.progress.xp += amount;
    saveProgress();
    if (msg) notify(msg);
    rerenderProgressAndNav();
  },
  addCollectionPoints: (pts) => {
    ctx.collection.points += pts;
    saveProgress();
    rerenderProgressAndNav();
  },
  incrementDailyGoal: (n = 1) => {
    const today = todayIso();
    if (ctx.dailyGoal.lastDate !== today) {
      ctx.dailyGoal.lastDate = today;
      ctx.dailyGoal.completedToday = 0;
      ctx.dailyGoal.celebratedToday = false;
    }
    ctx.dailyGoal.completedToday += n;
    if (ctx.dailyGoal.completedToday >= ctx.dailyGoal.target && !ctx.dailyGoal.celebratedToday) {
      ctx.dailyGoal.celebratedToday = true;
      ctx.progress.xp += 20;
      notify(`Daily Goal achieved! +20 bonus XP!`);
      fireConfetti({ particleCount: 90, spread: 80 });
    }
    saveProgress();
    rerenderProgressAndNav();
  },
  setDailyGoalTarget: (tgt) => {
    ctx.dailyGoal.target = tgt;
    saveProgress();
    notify(`Daily study goal set to ${tgt} activities`);
    rerenderProgressAndNav();
  },
  registerWordListened: (word) => {
    const clean = String(word || '').trim().toLowerCase();
    if (!clean) return;
    checkDailyStreak();
    if (!ctx.progress.listenedWords.includes(clean)) {
      ctx.progress.listenedWords.push(clean);
      ctx.progress.xp += 10;
      ctx.actions.incrementDailyGoal(1);
    }
    saveProgress();
    rerenderProgressAndNav();
  },
  toggleModuleComplete: (modId) => {
    const prev = Boolean(ctx.progress.modules[modId]);
    ctx.progress.modules[modId] = !prev;
    if (!prev) {
      ctx.progress.xp += 30;
      ctx.collection.points += 20;
      ctx.actions.playSfx('right');
      fireConfetti({ particleCount: 95, spread: 80 });
      notify(modId === 'module1' ? 'Badge Unlocked: Beginner! First module complete (+30 XP)' : 'Module completed! +30 XP');
    } else {
      ctx.progress.xp = Math.max(0, ctx.progress.xp - 30);
    }
    saveProgress();
    rerenderProgressAndNav();
  },
  completeQuiz: (quizId) => {
    if (!ctx.progress.quizzes[quizId]) {
      ctx.progress.quizzes[quizId] = true;
      ctx.progress.xp += 25;
      ctx.collection.points += 15;
    }
    ctx.actions.incrementDailyGoal(1);
    saveProgress();
    rerenderProgressAndNav();
  },
  markCardReviewed: (cardKey) => {
    if (!ctx.progress.reviewedCards.includes(cardKey)) {
      ctx.progress.reviewedCards.push(cardKey);
      ctx.progress.xp += 2;
      saveProgress();
      rerenderProgressAndNav();
    }
  },
  gradeFlashcardTerm: (termId, outcome) => {
    const st = getTermStats(termId);
    if (outcome === 'right') {
      st.right += 1;
      st.memory = Math.min(100, st.memory + 20);
      ctx.collection.points += 8;
      ctx.progress.xp += 6;
      ctx.actions.playSfx('right');
      ctx.actions.incrementDailyGoal(1);
    } else if (outcome === 'almost') {
      st.almost += 1;
      st.memory = Math.min(90, st.memory + 8);
      ctx.collection.points += 5;
      ctx.progress.xp += 3;
      ctx.actions.playSfx('almost');
      ctx.actions.incrementDailyGoal(1);
    } else {
      st.wrong += 1;
      st.memory = Math.max(10, st.memory - 15);
      ctx.collection.points += 3;
      ctx.actions.playSfx('wrong');
    }
    saveProgress();
    rerenderProgressAndNav();
  },
  saveVoiceMeta: (termId, sec) => {
    ctx.recordedMeta[termId] = { updatedAt: Date.now(), sec };
    writeJson(STORAGE_KEYS.RECORD_META, ctx.recordedMeta);
  },
  markSiteVisited: (siteId) => {
    if (!ctx.collection.visitedSites.includes(siteId)) {
      ctx.collection.visitedSites.push(siteId);
      ctx.collection.points += 5;
      ctx.progress.xp += 5;
      notify(`Explored ${MAP_LOCATIONS[siteId]?.name || siteId}! +5 Collection Points`);
      saveProgress();
      rerenderProgressAndNav();
    }
  },
  openFlashcards: (deckKey = 'greetings') => {
    ctx.state.fcDeckKey = deckKey && (deckKey === '__smart__' || FLASHCARD_DECKS[deckKey]) ? deckKey : 'greetings';
    ctx.state.fcIndex = 0;
    ctx.state.fcFlipped = false;
    ctx.state.fcSwipeFeedback = null;
    ctx.state.fcSpeakAlongCue = null;
    const el = document.getElementById('flashcardModalBackdrop');
    if (el) {
      el.classList.add('open');
      renderFlashcardModal(el, ctx);
    }
  },
  openSmartReview: () => ctx.actions.openFlashcards('__smart__'),
  closeFlashcards: () => {
    ctx.state.fcSpeakAlongActive = false;
    document.getElementById('flashcardModalBackdrop')?.classList.remove('open');
  },
  openHandsFree: (open) => {
    const el = document.getElementById('handsFreeBackdrop');
    if (!el) return;
    if (open) {
      el.classList.add('open');
      renderHandsFreeModal(el, ctx);
    } else {
      ctx.state.hfPlaying = false;
      ctx.state.hfVoiceCmds = false;
      if (ctx.state.hfLoopTimer) clearTimeout(ctx.state.hfLoopTimer);
      window.speechSynthesis?.cancel();
      el.classList.remove('open');
    }
  },
  speakHandsFreeCurrent: () => {
    const deck = FLASHCARD_DECKS[ctx.state.hfDeckKey] || FLASHCARD_DECKS.greetings;
    const card = deck.cards[ctx.state.hfIndex % deck.cards.length];
    const trans = ctx.state.lang === 'fr' ? card.fr : card.en;
    speakTermSequence(card.word, trans, {
      settings: ctx.settings,
      lang: ctx.state.lang,
      onListened: ctx.actions.registerWordListened,
      onFinished: () => {
        if (ctx.state.hfPlaying) {
          ctx.state.hfLoopTimer = setTimeout(() => {
            if (!ctx.state.hfPlaying) return;
            ctx.state.hfIndex = (ctx.state.hfIndex + 1) % deck.cards.length;
            const backdrop = document.getElementById('handsFreeBackdrop');
            if (backdrop?.classList.contains('open')) {
              renderHandsFreeModal(backdrop, ctx);
              ctx.actions.speakHandsFreeCurrent();
            }
          }, 1200);
        }
      }
    });
  },
  toggleHandsFreeLoop: () => {
    ctx.state.hfPlaying = !ctx.state.hfPlaying;
    const backdrop = document.getElementById('handsFreeBackdrop');
    if (backdrop) renderHandsFreeModal(backdrop, ctx);
    if (ctx.state.hfPlaying) {
      ctx.actions.speakHandsFreeCurrent();
    } else {
      if (ctx.state.hfLoopTimer) clearTimeout(ctx.state.hfLoopTimer);
      window.speechSynthesis?.cancel();
    }
  },
  toggleHfVoiceCommands: async () => {
    ctx.state.hfVoiceCmds = !ctx.state.hfVoiceCmds;
    const backdrop = document.getElementById('handsFreeBackdrop');
    if (backdrop) renderHandsFreeModal(backdrop, ctx);
    if (ctx.state.hfVoiceCmds) {
      notify('Voice commands ready: say "Next", "Back", or "Stop"');
      const res = await captureSpokenPhrase({ lang: 'en-US', timeoutMs: 4500 });
      const cmd = (res.transcript || '').toLowerCase();
      if (cmd.includes('next')) document.getElementById('hfNextBtn')?.click();
      else if (cmd.includes('back') || cmd.includes('prev')) document.getElementById('hfPrevBtn')?.click();
      else if (cmd.includes('stop')) ctx.actions.toggleHandsFreeLoop();
      ctx.state.hfVoiceCmds = false;
      if (backdrop?.classList.contains('open')) renderHandsFreeModal(backdrop, ctx);
    }
  },
  openGallery: (siteId, idx = 0) => {
    ctx.state.gallerySiteId = siteId;
    ctx.state.galleryIdx = idx;
    const el = document.getElementById('galleryModalBackdrop');
    if (el) {
      el.classList.add('open');
      renderGalleryModal(el, ctx);
    }
  },
  closeGallery: () => document.getElementById('galleryModalBackdrop')?.classList.remove('open'),
  openSettings: (open) => {
    const el = document.getElementById('settingsDrawerBackdrop');
    if (!el) return;
    if (open) {
      el.classList.add('open');
      renderSettingsDrawer(el, ctx);
    } else {
      el.classList.remove('open');
    }
  },
  openAuthModal: (open) => {
    const el = document.getElementById('authModalBackdrop');
    if (!el) return;
    if (open) {
      el.classList.add('open');
      renderAuthModal(el);
    } else {
      el.classList.remove('open');
    }
  },
  openResetModal: (open) => {
    const el = document.getElementById('resetModalBackdrop');
    if (el) el.classList.toggle('open', Boolean(open));
  },
  shareProgress: async () => {
    const text = `I earned ${ctx.progress.xp} XP & ${ctx.collection.points} Collection Points learning Martinican Creole (Kréyòl Matinik)!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Kréyòl Matinik Progress', text, url: window.location.href });
        notify('Progress shared!');
        return;
      } catch (e) {}
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      notify('Achievement summary copied to clipboard!');
    } else {
      notify(text);
    }
  },
  runAgenticCoach: async (mountEl) => {
    try {
      const totals = Object.values(ctx.collection.termStats).reduce(
        (acc, t) => ({ right: acc.right + (t.right || 0), almost: acc.almost + (t.almost || 0), wrong: acc.wrong + (t.wrong || 0) }),
        { right: 0, almost: 0, wrong: 0 }
      );
      const res = await fetch('/api/agentic-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLang: ctx.state.lang,
          stats: {
            xp: ctx.progress.xp,
            collectionPoints: ctx.collection.points,
            rightCount: totals.right,
            almostCount: totals.almost,
            wrongCount: totals.wrong,
            recordedCount: Object.keys(ctx.recordedMeta).length,
            visitedCommunes: ctx.collection.visitedSites
          }
        })
      });
      const data = await res.json();
      if (data.coach) {
        ctx.state.lastCoachData = data.coach;
        renderProgressDashboard(document.getElementById('progressMount'), ctx);
      }
    } catch (err) {
      notify('Unable to load study coach right now.');
    }
  },
  setFocusDuration: (mins) => {
    if (ctx.focusTimer.running) ctx.actions.toggleFocusTimer();
    ctx.focusTimer.durationMin = mins;
    ctx.focusTimer.remainingSec = mins * 60;
    rerenderProgressAndNav();
  },
  toggleFocusTimer: () => {
    const ft = ctx.focusTimer;
    if (ft.running) {
      clearInterval(ft.intervalId);
      ft.intervalId = null;
      ft.running = false;
      stopNatureSounds();
    } else {
      ft.running = true;
      if (!ft.muted) startNatureSounds(ft.track, ctx.settings.ambientVolume);
      ft.intervalId = setInterval(() => {
        if (ft.remainingSec > 0) {
          ft.remainingSec -= 1;
          const clock = document.getElementById('focusClockDigits');
          if (clock) {
            const m = String(Math.floor(ft.remainingSec / 60)).padStart(2, '0');
            const s = String(ft.remainingSec % 60).padStart(2, '0');
            clock.textContent = `${m}:${s}`;
          }
        } else {
          clearInterval(ft.intervalId);
          ft.intervalId = null;
          ft.running = false;
          stopNatureSounds();
          playSfx(ctx.settings, 'chime');
          fireConfetti({ particleCount: 100, spread: 80 });
          ctx.progress.xp += 25;
          ctx.actions.incrementDailyGoal(2);
          notify('Session complete! +25 XP earned!');
          rerenderProgressAndNav();
        }
      }, 1000);
    }
    rerenderProgressAndNav();
  },
  resetFocusTimer: () => {
    if (ctx.focusTimer.intervalId) clearInterval(ctx.focusTimer.intervalId);
    ctx.focusTimer.running = false;
    ctx.focusTimer.remainingSec = ctx.focusTimer.durationMin * 60;
    stopNatureSounds();
    rerenderProgressAndNav();
  },
  toggleFocusMute: () => {
    ctx.focusTimer.muted = !ctx.focusTimer.muted;
    if (ctx.focusTimer.muted) stopNatureSounds();
    else if (ctx.focusTimer.running) startNatureSounds(ctx.focusTimer.track, ctx.settings.ambientVolume);
    rerenderProgressAndNav();
  },
  changeFocusTrack: (track) => {
    ctx.focusTimer.track = track;
    if (ctx.focusTimer.running && !ctx.focusTimer.muted) {
      startNatureSounds(track, ctx.settings.ambientVolume);
    }
  },
  publishKoudmenQuestion: async ({ authorName, topic, title, body }) => {
    if (ctx.user?.emailVerified) {
      try {
        await createKoudmenPost({ authorName, topic, title, body }, ctx.user);
        ctx.actions.awardXp(15, 'Question published to cloud Koudmen (+15 XP)');
        ctx.actions.incrementDailyGoal(1);
        return;
      } catch (err) {
        notify('Saved locally (cloud offline).');
      }
    }
    const post = {
      id: `local-kd-${Date.now()}`,
      topic,
      authorName,
      title,
      body,
      upvotes: 1,
      timeLabel: 'Just now (Local)',
      answers: []
    };
    ctx.state.localKoudmenPosts.unshift(post);
    writeJson(STORAGE_KEYS.KOUDMEN_LOCAL, ctx.state.localKoudmenPosts);
    ctx.actions.awardXp(15, 'Question posted to Community Koudmen (+15 XP)');
    ctx.actions.incrementDailyGoal(1);
  },
  upvoteKoudmen: async (postId, isCloud, currentVotes) => {
    if (ctx.state.upvotedPostIds.includes(postId)) {
      notify('You already upvoted this thread.');
      return;
    }
    if (isCloud) {
      if (!ctx.user?.emailVerified) {
        notify('Sign in with a verified account to upvote cloud posts.');
        ctx.actions.openAuthModal(true);
        return;
      }
      await upvoteKoudmenPost(postId, currentVotes);
    }
    ctx.state.upvotedPostIds.push(postId);
    writeJson(STORAGE_KEYS.UPVOTED, ctx.state.upvotedPostIds);
    ctx.actions.awardXp(5, 'Upvoted Koudmen post (+5 XP)');
  },
  openTutorWithPrompt: (text) => {
    const backdrop = document.getElementById('tutorDrawerBackdrop');
    if (backdrop) backdrop.classList.add('open');
    const input = document.getElementById('tutorInputField');
    if (input) {
      input.value = text;
      submitTutorChat(text);
    }
  },
  adminCreateLesson: async (lessonData) => {
    try {
      await createLessonArticle(lessonData, ctx.user);
      ctx.state.adminImageUrl = '';
      ctx.state.adminFileUrl = '';
      ctx.state.adminFileName = '';
      ctx.state.adminUploadLabel = '';
      notify('Lesson published to Firestore!');
    } catch (err) {
      notify(`Could not publish lesson: ${err.message}`);
    }
  },
  adminCreateDictEntry: async (entryData) => {
    try {
      await createDictionaryEntry(entryData, ctx.user);
      notify(`Added "${entryData.word}" to live dictionary!`);
    } catch (err) {
      notify(`Could not add entry: ${err.message}`);
    }
  },
  adminDeleteLesson: async (id) => {
    await deleteLessonArticle(id);
    notify('Lesson deleted.');
  },
  adminDeleteDictEntry: async (id) => {
    await deleteDictionaryEntry(id);
    notify('Dictionary entry removed.');
  }
};

// =========================================================
// SHELL RENDERING & ACCORDION CONTROLLER
// =========================================================
function applyBodyClasses() {
  document.body.classList.toggle('dark-mode', Boolean(ctx.state.isDark));
  document.body.classList.toggle('reduce-motion', Boolean(ctx.settings.reduceMotion));
  document.body.classList.toggle('iphone-duo-layout', Boolean(ctx.settings.iphoneDuoLayout));
}

function jumpToAccordion(accId) {
  ctx.state.openAccordions.clear();
  ctx.state.openAccordions.add(accId);
  syncAccordionDom();
  const target = document.getElementById(accId);
  if (target) {
    target.scrollIntoView({ behavior: ctx.settings.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  if (accId === 'acc-map') {
    setTimeout(() => renderMartiniqueMapSection(document.getElementById('mapMount'), ctx), 120);
  }
}

function syncAccordionDom() {
  document.querySelectorAll('.km-accordion').forEach((el) => {
    const isOpen = ctx.state.openAccordions.has(el.id);
    el.setAttribute('data-open', isOpen ? 'true' : 'false');
    el.querySelector('.km-accordion-trigger')?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

function renderAppShell() {
  const root = document.getElementById('app');
  if (!root) return;
  const lang = ctx.state.lang;
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  root.innerHTML = `
    <!-- Strictly 3-Zone Single-Row Top Bar -->
    <header class="km-topbar no-print">
      <div class="km-topbar-inner">
        <a href="#top" class="km-brand" aria-label="Kréyòl Matinik Home">
          <span class="km-brand-mark"><i class="fas fa-feather-pointed"></i></span>
          <span>${escapeHtml(t.brandTitle)}</span>
        </a>

        <nav class="km-nav-links" aria-label="Primary Navigation">
          <button type="button" class="km-nav-link" data-jump="acc-curriculum">${escapeHtml(t.navLearn)}</button>
          <button type="button" class="km-nav-link" id="navCardsBtn">${escapeHtml(t.navCards)}</button>
          <button type="button" class="km-nav-link" data-jump="acc-dictionary">${escapeHtml(t.navDictionary)}</button>
          <button type="button" class="km-nav-link" data-jump="acc-map">${escapeHtml(t.navMap)}</button>
          <button type="button" class="km-nav-link" data-jump="acc-koudmen">${escapeHtml(t.navCommunity)}</button>
        </nav>

        <button type="button" class="km-cta-btn" id="headerAccountBtn">
          <i class="fas fa-user-circle"></i>
          <span>${escapeHtml(t.signInCta)}</span>
        </button>
      </div>
    </header>

    <!-- Slim Workspace Utility Bar -->
    <div class="km-utility-strip no-print">
      <div class="km-motto-banner">${escapeHtml(t.motto)}</div>
      <div class="km-utility-actions">
        <div class="km-seg-group" role="group" aria-label="Interface language selector">
          <button type="button" class="km-seg-btn ${lang === 'mq' ? 'active' : ''}" data-set-lang="mq">MQ</button>
          <button type="button" class="km-seg-btn ${lang === 'fr' ? 'active' : ''}" data-set-lang="fr">FR</button>
          <button type="button" class="km-seg-btn ${lang === 'en' ? 'active' : ''}" data-set-lang="en">EN</button>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="themeToggleBtn" aria-label="Toggle light and dark theme">
          <i class="fas ${ctx.state.isDark ? 'fa-sun' : 'fa-moon'}"></i>
          <span>${ctx.state.isDark ? 'Light' : 'Dark'}</span>
        </button>
        <button type="button" class="km-btn km-btn-sm" id="tourBtn"><i class="fas fa-route"></i> ${escapeHtml(t.btnStartTour)}</button>
        <button type="button" class="km-btn km-btn-sm" id="settingsBtn"><i class="fas fa-sliders"></i> ${escapeHtml(t.btnSettings)}</button>
        <button type="button" class="km-btn km-btn-sm km-btn-primary" id="tutorBtn"><i class="fas fa-comments"></i> ${escapeHtml(t.btnAskTutor)}</button>
        <button type="button" class="km-btn km-btn-sm" data-jump="acc-admin"><i class="fas fa-pen-to-square"></i> ${escapeHtml(t.btnAdmin)}</button>
      </div>
    </div>

    <main class="km-shell" id="top">
      <!-- HERO + WORD OF THE DAY + 3-STEP START -->
      <section class="km-card km-hero-section">
        <div class="km-hero-grid">
          <div style="display:flex; flex-direction:column; justify-content:space-between; gap:0.85rem;">
            <div>
              <div class="km-meta-line">GEREC Orthography · Archives Territoriales de Martinique · UNESCO Preservation Spirit</div>
              <h1 class="km-hero-title">${escapeHtml(t.heroTitle)}</h1>
              <p class="km-hero-sub">${escapeHtml(t.heroSubtitle)}</p>
            </div>
            <div id="wotdMount"></div>
          </div>

          <div class="km-hero-visual">
            <img src="${HERO_BANNER_IMAGE}" alt="Martinican Creole wooden veranda overlooking lush Mount Pelee rainforest" referrerpolicy="no-referrer">
            <div class="km-hero-caption">
              Madinina Heritage Study · Living Oral Traditions, Music &amp; Parishes
            </div>
          </div>
        </div>

        <div class="km-steps-grid">
          <button type="button" class="km-step-btn" data-jump="acc-curriculum">
            <strong>${escapeHtml(t.step1Title)}</strong>
            <span>${escapeHtml(t.step1Desc)}</span>
          </button>
          <button type="button" class="km-step-btn" id="step2CardsBtn">
            <strong>${escapeHtml(t.step2Title)}</strong>
            <span>${escapeHtml(t.step2Desc)}</span>
          </button>
          <button type="button" class="km-step-btn" data-jump="acc-map">
            <strong>${escapeHtml(t.step3Title)}</strong>
            <span>${escapeHtml(t.step3Desc)}</span>
          </button>
        </div>
      </section>

      <div class="km-duo-split">
        <!-- 1. PROGRESS, GOAL, FOCUS TIMER, BADGES & COLLECTION -->
        <section class="km-accordion" id="acc-progress" data-open="true">
          <button type="button" class="km-accordion-trigger" aria-expanded="true">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.progressHeading)}</span>
              <span class="km-accordion-sub">Daily Streak · Focus Timer · Collection Points · Achievement Badges</span>
            </div>
            <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="km-accordion-body" id="progressMount"></div>
        </section>

        <!-- 2. LEARNING LEVELS, MICRO-LESSONS & FUN FACTS -->
        <section class="km-accordion" id="acc-levels" data-open="false">
          <button type="button" class="km-accordion-trigger" aria-expanded="false">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.levelsTitle)}</span>
              <span class="km-accordion-sub">Smart Spaced Review · 4 Heritage Tiers · Cultural Fun Facts</span>
            </div>
            <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="km-accordion-body" id="levelsMount"></div>
        </section>
      </div>

      <!-- 3. CURRICULUM MODULES, PRINT GUIDE, SELF-RECORDING, AUDIO QUIZ & SPEAKING LAB -->
      <section class="km-accordion" id="acc-curriculum" data-open="true">
        <button type="button" class="km-accordion-trigger" aria-expanded="true">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">${escapeHtml(t.curriculumTitle)} &amp; ${escapeHtml(t.oralLabTitle)}</span>
            <span class="km-accordion-sub">Searchable GEREC Tables · Print Study Guide · Listening Quiz · AI Speaking Check</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="curriculumMount"></div>
      </section>

      <div class="km-duo-split">
        <!-- 4. 20 VISUAL MOTION FLASHCARD DECKS -->
        <section class="km-accordion" id="acc-flashcards" data-open="false">
          <button type="button" class="km-accordion-trigger" aria-expanded="false">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.flashcardDecksTitle)}</span>
              <span class="km-accordion-sub">Ken Burns Island Scenes · Swipe Right/Left · Speak-Along · Hands-Free Loop</span>
            </div>
            <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="km-accordion-body" id="flashcardsDecksMount"></div>
        </section>

        <!-- 5. ILLUSTRATED VOCABULARY DICTIONARY -->
        <section class="km-accordion" id="acc-dictionary" data-open="false">
          <button type="button" class="km-accordion-trigger" aria-expanded="false">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.dictionaryTitle)}</span>
              <span class="km-accordion-sub">Filter by Level · Live Cloud &amp; GEREC Entries · Spoken Phonetics</span>
            </div>
            <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="km-accordion-body" id="dictionaryMount"></div>
        </section>
      </div>

      <!-- 6. MARTINIQUE CULTURAL MAP (OSM + SVG) -->
      <section class="km-accordion" id="acc-map" data-open="false">
        <button type="button" class="km-accordion-trigger" aria-expanded="false">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">${escapeHtml(t.mapTitle)}</span>
            <span class="km-accordion-sub">OpenStreetMap &amp; SVG · 12 Communes · Historical Heritage · Landscape Gallery</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="mapMount"></div>
      </section>

      <!-- 7. COMMUNITY KOUDMEN & HERITAGE INSTITUTIONS -->
      <section class="km-accordion" id="acc-koudmen" data-open="false">
        <button type="button" class="km-accordion-trigger" aria-expanded="false">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">${escapeHtml(t.koudmenTitle)} &amp; Archives Partners</span>
            <span class="km-accordion-sub">Peer Q&amp;A · Archives Territoriales de Martinique · Institut du Créole · Alliance Française · UNESCO</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="koudmenMount"></div>
      </section>

      <!-- 8. ADMIN RICH-TEXT CONTENT STUDIO -->
      <section class="km-accordion" id="acc-admin" data-open="false">
        <button type="button" class="km-accordion-trigger" aria-expanded="false">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">Admin Content Studio</span>
            <span class="km-accordion-sub">Rich-Text Lesson Authoring · Image &amp; Study File Uploads · Dictionary Publisher</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="adminMount"></div>
      </section>

      <footer class="km-meta-line" style="text-align:center; padding:0.75rem 0;">
        Kréyòl Matinik · ${escapeHtml(t.footerRights)} · <a href="https://www.patrimoines-martinique.org/" target="_blank" rel="noopener noreferrer" style="color:var(--cobalt);">patrimoines-martinique.org</a>
      </footer>
    </main>

    <!-- One-Hand Bottom Thumb Dock -->
    <nav class="km-onehand-dock no-print" aria-label="One-hand quick navigation">
      <button type="button" class="km-dock-btn" data-jump="acc-curriculum"><i class="fas fa-seedling"></i><span>${escapeHtml(t.navLearn)}</span></button>
      <button type="button" class="km-dock-btn" id="dockCardsBtn"><i class="fas fa-layer-group"></i><span>${escapeHtml(t.navCards)}</span></button>
      <button type="button" class="km-dock-btn" id="dockHandsFreeBtn"><i class="fas fa-headphones"></i><span>Audio</span></button>
      <button type="button" class="km-dock-btn" data-jump="acc-dictionary"><i class="fas fa-book-bookmark"></i><span>${escapeHtml(t.navDictionary)}</span></button>
      <button type="button" class="km-dock-btn" data-jump="acc-map"><i class="fas fa-map-location-dot"></i><span>${escapeHtml(t.navMap)}</span></button>
    </nav>

    <!-- Floating Back-to-Top -->
    <button type="button" id="backToTopBtn" class="km-back-top-btn no-print" aria-label="Back to top">
      <i class="fas fa-arrow-up"></i><span>Top</span>
    </button>

    <!-- Toast Notification -->
    <div id="kmToast" class="km-toast" role="status" aria-live="polite"></div>

    <!-- Modals & Drawers -->
    <div id="flashcardModalBackdrop" class="km-modal-backdrop"></div>
    <div id="handsFreeBackdrop" class="km-modal-backdrop"></div>
    <div id="galleryModalBackdrop" class="km-modal-backdrop"></div>
    <div id="tourModalBackdrop" class="km-modal-backdrop"></div>
    <div id="authModalBackdrop" class="km-modal-backdrop"></div>
    <div id="resetModalBackdrop" class="km-modal-backdrop">
      <div class="km-modal-card" style="max-width:420px;" role="dialog" aria-modal="true" aria-label="Confirm Reset Progress">
        <h3 style="font-size:1.2rem; margin-bottom:0.4rem;">Reset Study Progress?</h3>
        <p style="font-size:0.9rem; color:var(--ink-secondary); margin-bottom:1.1rem;">This resets your saved XP, quiz completions, collection points, and voice recordings on this browser.</p>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="km-btn km-btn-sm" id="cancelResetBtn">Cancel</button>
          <button type="button" class="km-btn km-btn-sm" id="confirmResetBtn" style="background:var(--crimson); border-color:var(--crimson); color:#fff;">Reset All</button>
        </div>
      </div>
    </div>
    <div id="settingsDrawerBackdrop" class="km-drawer-backdrop"></div>
    <div id="tutorDrawerBackdrop" class="km-drawer-backdrop"></div>
  `;

  syncAccordionDom();
  wireGlobalShellEvents();
  renderAllViews();
}

function renderHeaderAuthButton() {
  const btn = document.getElementById('headerAccountBtn');
  if (!btn) return;
  const t = UI_STRINGS[ctx.state.lang] || UI_STRINGS.en;
  if (ctx.user) {
    const label = ctx.user.displayName || ctx.user.email?.split('@')[0] || t.accountLabel;
    btn.innerHTML = `<i class="fas fa-user-check"></i><span>${escapeHtml(label.slice(0, 14))}</span>`;
  } else {
    btn.innerHTML = `<i class="fas fa-user-circle"></i><span>${escapeHtml(t.signInCta)}</span>`;
  }
}

function renderAllViews() {
  renderHeaderAuthButton();
  renderWordOfTheDayWidget(document.getElementById('wotdMount'), ctx);
  renderProgressDashboard(document.getElementById('progressMount'), ctx);
  renderLevelsAndLessons(document.getElementById('levelsMount'), ctx);
  renderCurriculumAndOralLabs(document.getElementById('curriculumMount'), ctx);
  renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
  renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
  renderMartiniqueMapSection(document.getElementById('mapMount'), ctx);
  renderCommunityAndInstitutions(document.getElementById('koudmenMount'), ctx);
  renderAdminStudio(document.getElementById('adminMount'), ctx);
  renderTutorDrawer();
}

// =========================================================
// AI TUTOR DRAWER (MAN MAYOTTE)
// =========================================================
function renderTutorDrawer() {
  const backdrop = document.getElementById('tutorDrawerBackdrop');
  if (!backdrop) return;
  backdrop.innerHTML = `
    <div class="km-drawer-panel" role="dialog" aria-modal="true" aria-label="Man Mayotte AI Heritage Tutor">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <strong style="font-size:1.12rem;">Man Mayotte · Heritage Tutor</strong>
          <div class="km-meta-line">GEREC Martinican Creole · Cultural Storytelling</div>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="closeTutorBtn" aria-label="Close AI Tutor"><i class="fas fa-times"></i></button>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="km-btn km-btn-sm" data-tutor-quick="Explain the aspect particles ka, té, and ké in Martinican Creole.">ka / té / ké grammar</button>
        <button type="button" class="km-btn km-btn-sm" data-tutor-quick="Give me a lively Fort-de-France market dialogue in Creole.">Market dialogue</button>
        <button type="button" class="km-btn km-btn-sm" data-tutor-quick="Share two Martinican Creole proverbs and their meaning.">Creole proverbs</button>
      </div>

      <div id="tutorMessagesList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:0.65rem; padding:0.25rem 0;">
        <div class="km-subpanel" style="font-size:0.88rem;">
          <strong>Bonjou! Mwen sé Man Mayotte.</strong> Ask me how to phrase something in genuine Kréyòl Matinik, decode GEREC grammar, or explore the history behind Martinique's parishes.
        </div>
        ${ctx.state.tutorHistory.map((m) => `
          <div class="km-subpanel" style="font-size:0.88rem; ${m.role === 'user' ? 'background:var(--cobalt-soft); align-self:flex-end; max-width:88%;' : ''}">
            <div>${m.html || escapeHtml(m.content)}</div>
            ${m.creoleClip ? `<button type="button" class="km-btn km-btn-sm" data-tutor-speak="${escapeHtml(m.creoleClip)}" style="margin-top:6px;"><i class="fas fa-volume-up"></i> Listen to Creole</button>` : ''}
          </div>
        `).join('')}
      </div>

      <form id="tutorChatForm" style="display:flex; gap:6px;">
        <input type="text" id="tutorInputField" class="km-input" placeholder="Ask about Creole grammar, words, or Martinique..." required>
        <button type="submit" class="km-btn km-btn-primary" id="tutorSendBtn" ${ctx.state.tutorLoading ? 'disabled' : ''}>
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  `;

  backdrop.querySelector('#closeTutorBtn')?.addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.querySelectorAll('[data-tutor-quick]').forEach((b) => {
    b.addEventListener('click', () => submitTutorChat(b.getAttribute('data-tutor-quick')));
  });
  backdrop.querySelectorAll('[data-tutor-speak]').forEach((b) => {
    b.addEventListener('click', () => {
      speakTermSequence(b.getAttribute('data-tutor-speak'), '', { settings: ctx.settings, lang: ctx.state.lang, btnEl: b });
    });
  });
  backdrop.querySelector('#tutorChatForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = backdrop.querySelector('#tutorInputField')?.value.trim();
    if (val) submitTutorChat(val);
  });
}

async function submitTutorChat(userText) {
  if (ctx.state.tutorLoading || !userText) return;
  ctx.state.tutorHistory.push({ role: 'user', content: userText });
  ctx.state.tutorLoading = true;
  renderTutorDrawer();

  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: ctx.state.tutorHistory.slice(-6).map((h) => ({ role: h.role, content: h.content })),
        currentLang: ctx.state.lang,
        userContext: {
          xp: ctx.progress.xp,
          collectionPoints: ctx.collection.points,
          streak: ctx.progress.streak,
          recordedCount: Object.keys(ctx.recordedMeta).length
        }
      })
    });
    const data = await res.json();
    const reply = data.reply || "Mwen la pou édé'w!";
    const formatted = escapeHtml(reply)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    const clipMatch = reply.match(/«([^»]+)»/) || reply.match(/"([^"]+)"/);
    ctx.state.tutorHistory.push({
      role: 'assistant',
      content: reply,
      html: formatted,
      creoleClip: clipMatch ? clipMatch[1] : ''
    });
    ctx.actions.awardXp(5);
  } catch (err) {
    ctx.state.tutorHistory.push({ role: 'assistant', content: 'Pardon — unable to reach tutor server right now.' });
  } finally {
    ctx.state.tutorLoading = false;
    renderTutorDrawer();
  }
}

// =========================================================
// GUIDED TOUR & AUTH MODAL
// =========================================================
const TOUR_STEPS = [
  { emoji: '🌺', title: '1 · Listen to Word of the Day', body: 'Start at the top card every day. Tap Listen to hear authentic GEREC Creole pronunciation and Practice for +5 XP.', acc: 'top' },
  { emoji: '📚', title: '2 · Study Modules & Record Your Voice', body: 'Open the 3 Heritage Modules to hear words, record your own pronunciation locally, take quizzes, or test Speaking AI.', acc: 'acc-curriculum' },
  { emoji: '🃏', title: '3 · Swipe Motion Flashcards & Speak-Along', body: 'Open 20 visual decks. Swipe Right when you know a word, Left for review, or turn on Speak-Along for instant match checks.', acc: 'acc-flashcards' },
  { emoji: '🗺️', title: '4 · Explore Madinina on OSM & SVG Maps', body: 'Click communes, historical sites like Cap 110, or secret spots to unlock Collection Points and open landscape photo galleries.', acc: 'acc-map' },
  { emoji: '⏱️', title: '5 · Deep Study Timer & Cloud Account', body: 'Set your Daily Study Goal, play rainforest/ocean nature audio while studying, and Sign In to keep progress synced across devices.', acc: 'acc-progress' }
];

function renderTourModal() {
  const el = document.getElementById('tourModalBackdrop');
  if (!el) return;
  const step = TOUR_STEPS[ctx.state.tourStep];
  el.innerHTML = `
    <div class="km-modal-card" style="max-width:460px;" role="dialog" aria-modal="true" aria-label="Guided Tour">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="km-meta-line km-mono">1-Minute Tour · Step ${ctx.state.tourStep + 1} / ${TOUR_STEPS.length}</span>
        <button type="button" class="km-btn km-btn-sm" id="tourCloseBtn"><i class="fas fa-times"></i></button>
      </div>
      <div style="font-size:2.2rem; margin-top:0.5rem;">${step.emoji}</div>
      <h3 style="font-size:1.25rem; margin:0.25rem 0;">${escapeHtml(step.title)}</h3>
      <p style="font-size:0.92rem; color:var(--ink-secondary);">${escapeHtml(step.body)}</p>
      <div style="display:flex; justify-content:space-between; gap:8px; margin-top:1.1rem;">
        <button type="button" class="km-btn km-btn-sm" id="tourPrevBtn" ${ctx.state.tourStep === 0 ? 'disabled' : ''}>← Back</button>
        <button type="button" class="km-btn km-btn-sm km-btn-primary" id="tourNextBtn">
          ${ctx.state.tourStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step →'}
        </button>
      </div>
    </div>
  `;
  el.querySelector('#tourCloseBtn')?.addEventListener('click', () => el.classList.remove('open'));
  el.querySelector('#tourPrevBtn')?.addEventListener('click', () => {
    if (ctx.state.tourStep > 0) {
      ctx.state.tourStep -= 1;
      renderTourModal();
    }
  });
  el.querySelector('#tourNextBtn')?.addEventListener('click', () => {
    if (ctx.state.tourStep < TOUR_STEPS.length - 1) {
      ctx.state.tourStep += 1;
      renderTourModal();
    } else {
      el.classList.remove('open');
      if (step.acc && step.acc !== 'top') jumpToAccordion(step.acc);
    }
  });
}

function renderAuthModal(backdrop) {
  if (!backdrop) return;
  const user = ctx.user;

  backdrop.innerHTML = `
    <div class="km-modal-card" style="max-width:450px;" role="dialog" aria-modal="true" aria-label="Account and Cloud Sync">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <div>
          <strong style="font-size:1.18rem;">Keep Your Creole Progress</strong>
          <div class="km-meta-line">Sync XP, streaks, artifacts, and Admin Studio across devices</div>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="authCloseBtn"><i class="fas fa-times"></i></button>
      </div>

      ${user ? `
        <div class="km-subpanel" style="margin-bottom:0.85rem;">
          <strong>${escapeHtml(user.displayName || user.email)}</strong>
          <div class="km-meta-line">${escapeHtml(user.email || '')} · ${user.emailVerified ? 'Verified Account ✓' : 'Verification pending'} ${ctx.isAdmin ? '· Admin Studio Active' : ''}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:0.65rem;">
            ${!user.emailVerified ? `<button type="button" class="km-btn km-btn-sm km-btn-primary" id="authResendBtn">Resend Verification Email</button>` : ''}
            <button type="button" class="km-btn km-btn-sm" id="authSignOutBtn" style="color:var(--crimson);">Sign Out</button>
          </div>
        </div>
      ` : ''}

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:0.85rem;">
        <button type="button" class="km-btn" id="authGoogleBtn"><i class="fab fa-google" style="color:#ea4335;"></i> Google</button>
        <button type="button" class="km-btn" id="authAppleBtn"><i class="fab fa-apple"></i> Apple</button>
      </div>

      <form id="authEmailForm" style="display:flex; flex-direction:column; gap:0.55rem;">
        <input type="text" id="authNameIn" class="km-input" placeholder="Display Name (for Sign Up)">
        <input type="email" id="authEmailIn" class="km-input" placeholder="Email address" required>
        <input type="password" id="authPassIn" class="km-input" placeholder="Password (6+ characters)" required>
        <div style="display:flex; gap:8px;">
          <button type="submit" class="km-btn km-btn-primary" style="flex:1;">Sign In</button>
          <button type="button" class="km-btn" id="authRegisterBtn" style="flex:1;">Create Account</button>
        </div>
        <button type="button" id="authForgotBtn" style="background:none; border:none; color:var(--cobalt); font-size:0.82rem; font-weight:600; text-align:left; cursor:pointer; padding:4px 0;">
          Forgot password? Send reset link
        </button>
      </form>
    </div>
  `;

  backdrop.querySelector('#authCloseBtn')?.addEventListener('click', () => ctx.actions.openAuthModal(false));
  backdrop.querySelector('#authGoogleBtn')?.addEventListener('click', async () => {
    try { await signInWithGoogle(); notify('Signed in with Google!'); ctx.actions.openAuthModal(false); }
    catch (err) { notify(err.message); }
  });
  backdrop.querySelector('#authAppleBtn')?.addEventListener('click', async () => {
    try { await signInWithApple(); notify('Signed in with Apple!'); ctx.actions.openAuthModal(false); }
    catch (err) { notify(err.message); }
  });
  backdrop.querySelector('#authEmailForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const em = backdrop.querySelector('#authEmailIn').value;
    const pw = backdrop.querySelector('#authPassIn').value;
    try { await signInWithEmail(em, pw); notify('Signed in!'); ctx.actions.openAuthModal(false); }
    catch (err) { notify(err.message); }
  });
  backdrop.querySelector('#authRegisterBtn')?.addEventListener('click', async () => {
    const nm = backdrop.querySelector('#authNameIn').value;
    const em = backdrop.querySelector('#authEmailIn').value;
    const pw = backdrop.querySelector('#authPassIn').value;
    try {
      await signUpWithEmail(em, pw, nm);
      notify('Account created! Check your inbox to verify your email.');
      renderAuthModal(backdrop);
    } catch (err) { notify(err.message); }
  });
  backdrop.querySelector('#authForgotBtn')?.addEventListener('click', async () => {
    const em = backdrop.querySelector('#authEmailIn').value;
    if (!em) { notify('Enter your email above first.'); return; }
    try { await resetUserPassword(em); notify('Password reset email sent!'); }
    catch (err) { notify(err.message); }
  });
  backdrop.querySelector('#authResendBtn')?.addEventListener('click', async () => {
    try { await resendVerificationEmail(); notify('Verification email resent!'); }
    catch (err) { notify(err.message); }
  });
  backdrop.querySelector('#authSignOutBtn')?.addEventListener('click', async () => {
    await signOutUser();
    notify('Signed out.');
    ctx.actions.openAuthModal(false);
  });
}

// =========================================================
// GLOBAL EVENT WIRING
// =========================================================
function wireGlobalShellEvents() {
  // Accordion toggles
  document.querySelectorAll('.km-accordion-trigger').forEach((trig) => {
    trig.addEventListener('click', () => {
      const acc = trig.closest('.km-accordion');
      if (!acc) return;
      if (ctx.state.openAccordions.has(acc.id)) ctx.state.openAccordions.delete(acc.id);
      else ctx.state.openAccordions.add(acc.id);
      syncAccordionDom();
      if (acc.id === 'acc-map' && ctx.state.openAccordions.has('acc-map')) {
        destroyLeafletMap();
        renderMartiniqueMapSection(document.getElementById('mapMount'), ctx);
      }
    });
  });

  // Jump buttons (Nav, Steps, Dock, Admin)
  document.querySelectorAll('[data-jump]').forEach((el) => {
    el.addEventListener('click', () => jumpToAccordion(el.getAttribute('data-jump')));
  });

  // Language switcher
  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.lang = btn.getAttribute('data-set-lang');
      renderAppShell();
    });
  });

  // Theme toggle
  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    ctx.state.isDark = !ctx.state.isDark;
    try { localStorage.setItem(STORAGE_KEYS.THEME, ctx.state.isDark ? 'dark' : 'light'); } catch (e) {}
    applyBodyClasses();
    renderAppShell();
    notify(ctx.state.isDark ? 'Midnight dark mode enabled' : 'Daylight mode enabled');
  });

  // Modals & Drawers
  document.getElementById('navCardsBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('greetings'));
  document.getElementById('step2CardsBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('greetings'));
  document.getElementById('dockCardsBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('greetings'));
  document.getElementById('dockHandsFreeBtn')?.addEventListener('click', () => ctx.actions.openHandsFree(true));
  document.getElementById('settingsBtn')?.addEventListener('click', () => ctx.actions.openSettings(true));
  document.getElementById('headerAccountBtn')?.addEventListener('click', () => ctx.actions.openAuthModal(true));
  document.getElementById('tutorBtn')?.addEventListener('click', () => document.getElementById('tutorDrawerBackdrop')?.classList.add('open'));
  document.getElementById('tourBtn')?.addEventListener('click', () => {
    ctx.state.tourStep = 0;
    document.getElementById('tourModalBackdrop')?.classList.add('open');
    renderTourModal();
  });

  // Safe In-App Reset
  document.getElementById('cancelResetBtn')?.addEventListener('click', () => ctx.actions.openResetModal(false));
  document.getElementById('confirmResetBtn')?.addEventListener('click', async () => {
    ctx.progress = { modules: { module1: false, module2: false, module3: false }, quizzes: { quiz1: false, quiz2: false, quiz3: false }, listenedWords: [], reviewedCards: [], xp: 0, streak: 1, lastActivityDate: todayIso() };
    ctx.collection = { points: 0, visitedSites: [], termStats: {} };
    ctx.recordedMeta = {};
    writeJson(STORAGE_KEYS.RECORD_META, {});
    await clearAllVoiceRecordings();
    saveProgress();
    ctx.actions.openResetModal(false);
    renderAllViews();
    notify('Study progress reset cleanly.');
  });

  // Backdrop dismiss clicks
  ['flashcardModalBackdrop', 'handsFreeBackdrop', 'galleryModalBackdrop', 'tourModalBackdrop', 'authModalBackdrop', 'resetModalBackdrop', 'settingsDrawerBackdrop', 'tutorDrawerBackdrop'].forEach((id) => {
    const bd = document.getElementById(id);
    if (!bd) return;
    bd.addEventListener('click', (e) => {
      if (e.target === bd) {
        if (id === 'handsFreeBackdrop') ctx.actions.openHandsFree(false);
        else if (id === 'flashcardModalBackdrop') ctx.actions.closeFlashcards();
        else bd.classList.remove('open');
      }
    });
  });

  // Back-to-Top scroll listener
  const topBtn = document.getElementById('backToTopBtn');
  window.addEventListener('scroll', () => {
    if (topBtn) topBtn.classList.toggle('visible', window.scrollY > 260);
  }, { passive: true });
  topBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: ctx.settings.reduceMotion ? 'auto' : 'smooth' });
  });
}

// Keyboard shortcuts for open Flashcard Modal & Escape close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ctx.actions.closeFlashcards();
    ctx.actions.openHandsFree(false);
    ctx.actions.closeGallery();
    ctx.actions.openSettings(false);
    ctx.actions.openAuthModal(false);
    ctx.actions.openResetModal(false);
    document.getElementById('tourModalBackdrop')?.classList.remove('open');
    document.getElementById('tutorDrawerBackdrop')?.classList.remove('open');
    return;
  }
  const fcBackdrop = document.getElementById('flashcardModalBackdrop');
  if (fcBackdrop?.classList.contains('open')) {
    const list = getActiveFlashcardList(ctx);
    if (e.key === 'ArrowRight' && ctx.state.fcIndex < list.length - 1) {
      ctx.state.fcIndex += 1;
      ctx.state.fcFlipped = false;
      ctx.state.fcSwipeFeedback = null;
      renderFlashcardModal(fcBackdrop, ctx);
    } else if (e.key === 'ArrowLeft' && ctx.state.fcIndex > 0) {
      ctx.state.fcIndex -= 1;
      ctx.state.fcFlipped = false;
      ctx.state.fcSwipeFeedback = null;
      renderFlashcardModal(fcBackdrop, ctx);
    } else if (e.key === ' ' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      ctx.state.fcFlipped = !ctx.state.fcFlipped;
      renderFlashcardModal(fcBackdrop, ctx);
    }
  }
});

// =========================================================
// BOOTSTRAP
// =========================================================
async function bootstrap() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  ctx.state.isDark = savedTheme ? savedTheme === 'dark' : sysDark;
  checkDailyStreak();
  applyBodyClasses();
  renderAppShell();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  try {
    const fb = await initFirebase();
    if (fb?.db) {
      subscribeLessons((items) => {
        ctx.cloud.lessons = items;
        renderLevelsAndLessons(document.getElementById('levelsMount'), ctx);
        renderAdminStudio(document.getElementById('adminMount'), ctx);
      });
      subscribeDictionary((items) => {
        ctx.cloud.dictionary = items;
        renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
        renderAdminStudio(document.getElementById('adminMount'), ctx);
      });
      subscribeKoudmen((items) => {
        ctx.cloud.koudmen = items;
        renderCommunityAndInstitutions(document.getElementById('koudmenMount'), ctx);
      });
    }
    observeAuth(async (user) => {
      ctx.user = user || null;
      ctx.isAdmin = user ? await checkIsAdmin(user) : false;
      if (user?.emailVerified) {
        const cloudProg = await loadUserProgressFromCloud(user).catch(() => null);
        if (cloudProg) {
          ctx.progress.xp = Math.max(ctx.progress.xp, Number(cloudProg.xp || 0));
          ctx.collection.points = Math.max(ctx.collection.points, Number(cloudProg.collectionPoints || 0));
          ctx.progress.streak = Math.max(ctx.progress.streak, Number(cloudProg.streak || 1));
          ctx.progress.modules = { ...ctx.progress.modules, ...(cloudProg.modules || {}) };
          ctx.progress.quizzes = { ...ctx.progress.quizzes, ...(cloudProg.quizzes || {}) };
          if (Array.isArray(cloudProg.visitedSites)) {
            ctx.collection.visitedSites = Array.from(new Set([...ctx.collection.visitedSites, ...cloudProg.visitedSites]));
          }
          saveProgress();
        } else {
          scheduleCloudSync();
        }
      }
      if (ctx.isAdmin) ctx.state.openAccordions.add('acc-admin');
      renderAllViews();
      syncAccordionDom();
    });
  } catch (err) {
    console.warn('Running in offline-first mode:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
