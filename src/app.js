import { DAILY_AFFIRMATION_PROVERBS, HERO_BANNER_IMAGE, HERITAGE_MODULES, UI_STRINGS } from './data/curriculum.js';
import { LEARNING_PATH_MILESTONES } from './data/culturalData.js';
import { MAP_LOCATIONS } from './data/mapData.js';
import { ARTWORKS, FLASHCARD_DECKS, MICRO_LESSONS } from './data/vocab.js';
import {
  createDictionaryEntry,
  createKoudmenPost,
  createLessonArticle,
  createMapLocation,
  createProverbEntry,
  deleteDictionaryEntry,
  deleteLessonArticle,
  deleteMapLocation,
  deleteVocabSet,
  fetchRandomProverbFromFirestore,
  initFirebase,
  loadUserProgressFromCloud,
  observeAuth,
  resendVerificationEmail,
  resetUserPassword,
  saveVocabSet,
  seedCuratedMapLocations,
  seedCuratedProverbs,
  seedCuratedVocabSets,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeDictionary,
  subscribeKoudmen,
  subscribeLessons,
  subscribeMapLocations,
  subscribeProverbs,
  subscribeVocabSets,
  syncUserProgressToCloud,
  updateLessonArticle,
  upvoteKoudmenPost,
  verifyAdminAccess
} from './firebase.js';
import {
  captureSpokenPhrase,
  clearAllVoiceRecordings,
  onTermAudioStateChange,
  playSfx,
  speakTermSequence,
  startNatureSounds,
  stopNatureSounds,
  triggerHaptic,
  unlockMobileAudio
} from './services/audioEngine.js';
import {
  escapeHtml,
  renderCurriculumAndOralLabs,
  renderDailyAffirmationWidget,
  renderLevelsAndLessons,
  renderWordOfTheDayWidget,
  syncAudioPlayerBarsDom
} from './views/curriculumAndQuiz.js';
import {
  getActiveFlashcardList,
  getMergedDictionaryEntries,
  getMergedFlashcardDecks,
  renderDictionarySection,
  renderFlashcardDecksGrid,
  renderFlashcardModal,
  renderHandsFreeModal
} from './views/flashcardsAndDictionary.js';
import {
  fetchMartiniqueWeather,
  renderCulinaryWeatherCultureSection,
  renderHeroWeatherChip,
  renderLearningPathSection
} from './views/learningPathAndCulture.js';
import {
  getTotalAcquiredWordsCount,
  renderLearningInsightsCard
} from './views/learningInsightsChart.js';
import {
  destroyLeafletMap,
  getMergedMapLocations,
  refreshDynamicMapMarkers,
  renderCommunityAndInstitutions,
  renderGalleryModal,
  renderMartiniqueMapSection
} from './views/mapAndKoudmen.js';
import {
  renderAdminStudio,
  renderProgressDashboard,
  renderSettingsDrawer
} from './views/progressAndAdmin.js';
import { renderAdminStudioWorkspace } from './views/adminStudioView.js';

const STORAGE_KEYS = {
  PROGRESS: 'kreyol_matinik_student_progress_v2',
  SETTINGS: 'kreyol_study_settings_v1',
  COLLECTION: 'kreyol_collection_state_v1',
  RECORD_META: 'kreyol_recordings_meta_v1',
  DAILY_GOAL: 'kreyol_daily_study_goal_v1',
  ACTIVITY_LOG: 'kreyol_daily_activity_log_v1',
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
const savedActivityLog = readJson(STORAGE_KEYS.ACTIVITY_LOG, {});

const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

const ctx = {
  strings: UI_STRINGS,
  user: null,
  isAdmin: false,
  rbac: {
    authorized: false,
    role: 'guest',
    emailVerified: false,
    uid: '',
    email: '',
    source: 'none',
    reason: 'Sign in with a verified administrator account.'
  },
  settings: { ...DEFAULT_SETTINGS, ...readJson(STORAGE_KEYS.SETTINGS, {}) },
  progress: {
    modules: { module1: false, module2: false, module3: false, ...(savedProg.modules || {}) },
    quizzes: { quiz1: false, quiz2: false, quiz3: false, ...(savedProg.quizzes || {}) },
    pathCompleted: Array.isArray(savedProg.pathCompleted) ? savedProg.pathCompleted : [],
    listenedWords: Array.isArray(savedProg.listenedWords) ? savedProg.listenedWords : [],
    reviewedCards: Array.isArray(savedProg.reviewedCards) ? savedProg.reviewedCards : [],
    xp: Number(savedProg.xp || 0),
    streak: Number(savedProg.streak || 1),
    lastActivityDate: savedProg.lastActivityDate || todayIso(),
    streakFiredToday: savedProg.streakFiredToday || '',
    streakHistory: Array.isArray(savedProg.streakHistory) && savedProg.streakHistory.length ? savedProg.streakHistory : [todayIso()]
  },
  collection: {
    points: Number(savedColl.points || 0),
    flashcardPoints: Number(
      savedColl.flashcardPoints ??
      Object.values(savedColl.termStats || {}).reduce((sum, st) => sum + (st.right || 0) * 8 + (st.almost || 0) * 5 + (st.wrong || 0) * 3, 0)
    ),
    lessonPoints: Number(
      savedColl.lessonPoints ??
      (Object.values(savedProg.modules || {}).filter(Boolean).length * 20 +
       Object.values(savedProg.quizzes || {}).filter(Boolean).length * 15)
    ),
    mapPoints: Number(savedColl.mapPoints ?? ((savedColl.visitedSites || []).length * 5)),
    visitedSites: Array.isArray(savedColl.visitedSites) ? savedColl.visitedSites : [],
    termStats: savedColl.termStats && typeof savedColl.termStats === 'object' ? savedColl.termStats : {}
  },
  activityLog: savedActivityLog && typeof savedActivityLog === 'object' ? savedActivityLog : {},
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
    koudmen: [],
    mapLocations: [],
    proverbs: [],
    vocabSets: []
  },
  state: {
    lang: 'en',
    isDark: false,
    activeView: 'learner',
    mobileMenuOpen: false,
    topbarSearch: '',
    wotdIdx: dayOfYear % 12,
    dailyAffirmation: null,
    deferredInstallPrompt: null,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    openAccordions: new Set(['acc-path', 'acc-curriculum', 'acc-progress']),
    selectedPathId: 'path-1',
    cultureTab: 'culinary',
    selectedDishId: 'kolombo',
    weatherCache: null,
    weatherLoading: false,
    galleryCat: 'all',
    galleryQuery: '',
    galleryLimit: 24,
    archiveGalleryList: null,
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
    streakJustIgnited: false,
    insightsRange: 7,
    tourStep: 0,
    adminTab: 'vocab',
    adminSearch: '',
    adminVocabDraft: null,
    adminSiteDraft: null,
    adminLessonDraft: null,
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
  if (!Array.isArray(ctx.progress.streakHistory)) {
    ctx.progress.streakHistory = [];
  }
  if (!ctx.progress.streakHistory.includes(today)) {
    ctx.progress.streakHistory = [...ctx.progress.streakHistory, today].slice(-14);
  }
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

let lastUserInteractionAt = Date.now();
let studyHeartbeatId = null;

function recordActiveStudySeconds(sec = 0) {
  const today = todayIso();
  const prev = ctx.activityLog[today] && typeof ctx.activityLog[today] === 'object'
    ? ctx.activityLog[today]
    : { activeSeconds: 0, wordsCount: 0 };
  const nextSec = Math.min(28800, Math.max(0, Number(prev.activeSeconds || 0) + Number(sec || 0)));
  ctx.activityLog[today] = {
    activeSeconds: nextSec,
    wordsCount: Math.max(Number(prev.wordsCount || 0), getTotalAcquiredWordsCount(ctx))
  };
  const cutoffIso = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  Object.keys(ctx.activityLog).forEach((k) => {
    if (k < cutoffIso) delete ctx.activityLog[k];
  });
  writeJson(STORAGE_KEYS.ACTIVITY_LOG, ctx.activityLog);
}

function startStudyHeartbeat() {
  if (typeof window === 'undefined' || studyHeartbeatId) return;
  const markActive = () => { lastUserInteractionAt = Date.now(); };
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((evt) => {
    window.addEventListener(evt, markActive, { passive: true });
  });
  studyHeartbeatId = setInterval(() => {
    if (document.hidden) return;
    if (Date.now() - lastUserInteractionAt > 90000) return;
    recordActiveStudySeconds(15);
    if (ctx.state.activeView === 'learner' && ctx.state.openAccordions.has('acc-progress')) {
      const mount = document.getElementById('learningInsightsMount');
      if (mount) renderLearningInsightsCard(mount, ctx);
    }
  }, 15000);
}

function saveProgress() {
  recordActiveStudySeconds(0);
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
  jumpToAccordion: (accId) => jumpToAccordion(accId),
  setAppView: (viewName) => {
    const target = viewName === 'admin' ? 'admin' : 'learner';
    ctx.state.activeView = target;
    const learnerEl = document.getElementById('learnerMainView');
    const adminEl = document.getElementById('adminStudioMount');
    const dockEl = document.querySelector('.km-onehand-dock');
    const navAdminBtn = document.getElementById('navAdminStudioBtn');
    if (learnerEl) learnerEl.hidden = target === 'admin';
    if (adminEl) {
      adminEl.hidden = target !== 'admin';
      if (target === 'admin') {
        renderAdminStudioWorkspace(adminEl, ctx);
      }
    }
    if (dockEl) dockEl.style.display = target === 'admin' ? 'none' : '';
    if (navAdminBtn) navAdminBtn.classList.toggle('active', target === 'admin');
    window.scrollTo({ top: 0, behavior: ctx.settings.reduceMotion ? 'auto' : 'smooth' });
  },
  reverifyAdminRbac: async () => {
    const verdict = await verifyAdminAccess(ctx.user);
    ctx.rbac = verdict;
    ctx.isAdmin = Boolean(verdict.authorized);
    renderAdminStudio(document.getElementById('adminMount'), ctx);
    if (ctx.state.activeView === 'admin') {
      renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
    }
    notify(verdict.authorized ? 'Admin RBAC verified.' : verdict.reason || 'Admin clearance unavailable.');
    return verdict;
  },
  resendVerification: async () => {
    try {
      await resendVerificationEmail();
      notify('Verification email sent — check your inbox, then tap Re-verify RBAC.');
    } catch (err) {
      notify(err.message || 'Could not send verification email.');
    }
  },
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
  addCollectionPoints: (pts, source = 'lessons') => {
    const val = Number(pts || 0);
    ctx.collection.points += val;
    if (source === 'flashcards') ctx.collection.flashcardPoints += val;
    else if (source === 'map') ctx.collection.mapPoints += val;
    else ctx.collection.lessonPoints += val;
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
    recordActiveStudySeconds(10);
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
    const today = todayIso();
    if (!prev) {
      checkDailyStreak();
      ctx.progress.streak = Math.max(1, Number(ctx.progress.streak || 0));
      ctx.progress.streakFiredToday = today;
      if (!ctx.progress.streakHistory.includes(today)) {
        ctx.progress.streakHistory = [...ctx.progress.streakHistory, today].slice(-14);
      }
      ctx.state.streakJustIgnited = true;
      setTimeout(() => { ctx.state.streakJustIgnited = false; }, 1800);
      ctx.progress.xp += 30;
      ctx.collection.points += 20;
      ctx.collection.lessonPoints += 20;
      ctx.actions.playSfx('right');
      fireConfetti({ particleCount: 95, spread: 80 });
      notify(modId === 'module1'
        ? 'Module complete! Streak Fire lit! (+30 XP, +20 Pts)'
        : 'Module completed! Streak Fire lit! (+30 XP, +20 Pts)');
    } else {
      ctx.progress.xp = Math.max(0, ctx.progress.xp - 30);
      ctx.collection.points = Math.max(0, ctx.collection.points - 20);
      ctx.collection.lessonPoints = Math.max(0, ctx.collection.lessonPoints - 20);
      const anyModuleLeft = Object.values(ctx.progress.modules).some(Boolean);
      if (!anyModuleLeft) {
        ctx.progress.streakFiredToday = '';
        ctx.state.streakJustIgnited = false;
      }
    }
    saveProgress();
    renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
    renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
    rerenderProgressAndNav();
  },
  completePathMilestone: (milestone) => {
    if (!milestone || !milestone.id) return;
    if (!Array.isArray(ctx.progress.pathCompleted)) ctx.progress.pathCompleted = [];
    if (!ctx.progress.pathCompleted.includes(milestone.id)) {
      ctx.progress.pathCompleted.push(milestone.id);
      if (milestone.linkedModuleId) {
        ctx.progress.modules[milestone.linkedModuleId] = true;
      }
      const today = todayIso();
      checkDailyStreak();
      ctx.progress.streakFiredToday = today;
      ctx.state.streakJustIgnited = true;
      setTimeout(() => { ctx.state.streakJustIgnited = false; }, 1800);
      ctx.progress.xp += Number(milestone.rewardXp || 30);
      ctx.collection.points += Number(milestone.rewardPts || 20);
      ctx.collection.lessonPoints += Number(milestone.rewardPts || 20);
      ctx.actions.playSfx('right');
      fireConfetti({ particleCount: 95, spread: 80 });
      ctx.actions.incrementDailyGoal(1);
      saveProgress();
      renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
      renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
      rerenderProgressAndNav();
      notify(`${milestone.creoleTitle} mastered! Unlocked ${milestone.unlocksDecks.length} vocabulary decks!`);
    }
  },
  completeQuiz: (quizId) => {
    if (!ctx.progress.quizzes[quizId]) {
      ctx.progress.quizzes[quizId] = true;
      ctx.progress.xp += 25;
      ctx.collection.points += 15;
      ctx.collection.lessonPoints += 15;
    }
    ctx.actions.incrementDailyGoal(1);
    saveProgress();
    rerenderProgressAndNav();
  },
  markCardReviewed: (cardKey) => {
    if (!ctx.progress.reviewedCards.includes(cardKey)) {
      ctx.progress.reviewedCards.push(cardKey);
      ctx.progress.xp += 2;
      ctx.collection.points += 2;
      ctx.collection.flashcardPoints += 2;
      saveProgress();
      rerenderProgressAndNav();
    }
  },
  gradeFlashcardTerm: (termId, outcome) => {
    const st = getTermStats(termId);
    recordActiveStudySeconds(12);
    if (outcome === 'right') {
      st.right += 1;
      st.memory = Math.min(100, st.memory + 20);
      ctx.collection.points += 8;
      ctx.collection.flashcardPoints += 8;
      ctx.progress.xp += 6;
      ctx.actions.playSfx('right');
      ctx.actions.incrementDailyGoal(1);
    } else if (outcome === 'almost') {
      st.almost += 1;
      st.memory = Math.min(90, st.memory + 8);
      ctx.collection.points += 5;
      ctx.collection.flashcardPoints += 5;
      ctx.progress.xp += 3;
      ctx.actions.playSfx('almost');
      ctx.actions.incrementDailyGoal(1);
    } else {
      st.wrong += 1;
      st.memory = Math.max(10, st.memory - 15);
      ctx.collection.points += 3;
      ctx.collection.flashcardPoints += 3;
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
      ctx.collection.mapPoints += 5;
      ctx.progress.xp += 5;
      const merged = getMergedMapLocations(ctx);
      notify(`Explored ${merged[siteId]?.name || MAP_LOCATIONS[siteId]?.name || siteId}! +5 Collection Points`);
      saveProgress();
      rerenderProgressAndNav();
    }
  },
  openFlashcards: (deckKey = 'greetings') => {
    const allDecks = getMergedFlashcardDecks(ctx);
    ctx.state.fcDeckKey = deckKey && (deckKey === '__smart__' || allDecks[deckKey]) ? deckKey : 'greetings';
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
    const allDecks = getMergedFlashcardDecks(ctx);
    const deck = allDecks[ctx.state.hfDeckKey] || allDecks.greetings || FLASHCARD_DECKS.greetings;
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
    ctx.state.archiveGalleryList = null;
    ctx.state.gallerySiteId = siteId;
    ctx.state.galleryIdx = idx;
    const el = document.getElementById('galleryModalBackdrop');
    if (el) {
      el.classList.add('open');
      renderGalleryModal(el, ctx);
    }
  },
  openArchiveGallery: (list, idx = 0) => {
    ctx.state.archiveGalleryList = Array.isArray(list) ? list : null;
    ctx.state.galleryIdx = idx;
    const el = document.getElementById('galleryModalBackdrop');
    if (el) {
      el.classList.add('open');
      renderGalleryModal(el, ctx);
    }
  },
  closeGallery: () => {
    ctx.state.archiveGalleryList = null;
    document.getElementById('galleryModalBackdrop')?.classList.remove('open');
  },
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
  runAgenticCoach: async () => {
    const totals = Object.values(ctx.collection.termStats).reduce(
      (acc, t) => ({ right: acc.right + (t.right || 0), almost: acc.almost + (t.almost || 0), wrong: acc.wrong + (t.wrong || 0) }),
      { right: 0, almost: 0, wrong: 0 }
    );
    try {
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
      if (!res.ok) throw new Error('Coach endpoint unavailable');
      const data = await res.json();
      if (data.coach) {
        ctx.state.lastCoachData = data.coach;
        renderProgressDashboard(document.getElementById('progressMount'), ctx);
        return;
      }
    } catch (_err) {
      // Offline / static-host adaptive heritage recommendation fallback (e.g. GitHub Pages)
      const visitedLen = (ctx.collection.visitedSites || []).length;
      const recDeck = totals.wrong > totals.right ? 'verbs' : visitedLen < 3 ? 'history' : 'greetings';
      ctx.state.lastCoachData = {
        encouragement: `Fòs épi kouraj! With ${ctx.progress.xp} XP and ${ctx.collection.points} Collection Points, keep building daily fluency.`,
        focusArea: recDeck === 'verbs' ? 'Core Verb Markers (ka / té / ké)' : recDeck === 'history' ? 'Cultural Geography & Heritage Sites' : 'Daily Greetings & Pronunciation',
        recommendedDeck: recDeck,
        recommendedModule: recDeck === 'history' ? 'module3' : 'module1',
        culturalInsight: 'Practice 2 minutes aloud with "Speak-Along" or visit Kap 110 & Senpyè on the interactive OSM map to deepen cultural memory.',
        miniChallenge: {
          creole: 'Nou ansanm pou fè an koudmen!',
          phonetic: '[noo ahn-sahnm poo feh ahn kood-mehn]',
          prompt: 'What does « an koudmen » represent in Martinican communities?',
          answer: 'Collective neighborly mutual aid',
          options: ['Collective neighborly mutual aid', 'A carnival percussion solo', 'A volcanic mountain pass', 'A tropical storm warning']
        }
      };
      renderProgressDashboard(document.getElementById('progressMount'), ctx);
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
      ctx.state.adminLessonDraft = null;
      notify('Lesson published to Firestore!');
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Could not publish lesson: ${err.message}`);
    }
  },
  adminUpdateLesson: async (lessonId, lessonData) => {
    try {
      await updateLessonArticle(lessonId, lessonData, ctx.user);
      ctx.state.adminLessonDraft = null;
      notify('Learning module updated in Firestore!');
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Could not update module: ${err.message}`);
    }
  },
  adminCreateDictEntry: async (entryData) => {
    try {
      await createDictionaryEntry(entryData, ctx.user);
      notify(`Added "${entryData.word}" to live dictionary!`);
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Could not add entry: ${err.message}`);
    }
  },
  adminDeleteLesson: async (id) => {
    try {
      await deleteLessonArticle(id, ctx.user);
      notify('Lesson deleted.');
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Delete denied: ${err.message}`);
    }
  },
  adminDeleteDictEntry: async (id) => {
    try {
      await deleteDictionaryEntry(id, ctx.user);
      notify('Dictionary entry removed.');
    } catch (err) {
      notify(`Delete denied: ${err.message}`);
    }
  },
  adminCreateMapLocation: async (locData) => {
    try {
      const createdId = await createMapLocation(locData, ctx.user);
      ctx.state.adminImageUrl = '';
      if (createdId) {
        ctx.state.selectedSiteId = createdId;
        if (ctx.state.adminSiteDraft) ctx.state.adminSiteDraft.id = createdId;
      }
      notify(`Saved cultural site "${locData.name}" to Firestore!`);
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Could not save cultural site: ${err.message}`);
    }
  },
  adminDeleteMapLocation: async (id) => {
    try {
      await deleteMapLocation(id, ctx.user);
      if (ctx.state.adminSiteDraft?.id === id) ctx.state.adminSiteDraft = null;
      notify('Cloud map marker removed.');
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Delete denied: ${err.message}`);
    }
  },
  adminSeedMapLocations: async () => {
    try {
      notify('Syncing heritage sites to Firestore...');
      const count = await seedCuratedMapLocations(MAP_LOCATIONS, ctx.user);
      notify(`Synced ${count} Martinique heritage sites to Firestore!`);
    } catch (err) {
      notify(`Map seed failed: ${err.message}`);
    }
  },
  adminSaveVocabSet: async (setData) => {
    try {
      const savedId = await saveVocabSet(setData, ctx.user);
      if (ctx.state.adminVocabDraft) ctx.state.adminVocabDraft.id = savedId;
      notify(`Saved vocabulary set "${setData.title}" to Firestore!`);
      renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
      renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
      renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Could not save vocabulary set: ${err.message}`);
    }
  },
  adminDeleteVocabSet: async (setId) => {
    try {
      await deleteVocabSet(setId, ctx.user);
      if (ctx.state.adminVocabDraft?.id === setId) ctx.state.adminVocabDraft = null;
      notify('Cloud vocabulary set deleted.');
      renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
      renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
      renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Delete denied: ${err.message}`);
    }
  },
  adminSeedVocabSets: async () => {
    try {
      notify('Syncing curated vocabulary decks to Firestore...');
      const count = await seedCuratedVocabSets(FLASHCARD_DECKS, LEARNING_PATH_MILESTONES, ctx.user);
      notify(`Synced ${count} vocabulary sets to Firestore!`);
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Vocabulary seed failed: ${err.message}`);
    }
  },
  refreshDailyAffirmation: async (excludeId = '') => {
    let picked = null;
    try {
      if (navigator.onLine !== false) {
        const cloudRandom = await fetchRandomProverbFromFirestore();
        if (cloudRandom && (cloudRandom.id !== excludeId || (ctx.cloud.proverbs || []).length <= 1)) {
          picked = cloudRandom;
        }
      }
    } catch (_err) {
      // Fall back smoothly to local pool if offline or network blocked
    }
    if (!picked) {
      const pool = (ctx.cloud.proverbs && ctx.cloud.proverbs.length)
        ? ctx.cloud.proverbs
        : DAILY_AFFIRMATION_PROVERBS;
      const candidates = pool.length > 1 && excludeId
        ? pool.filter((p) => p.id !== excludeId)
        : pool;
      picked = candidates[Math.floor(Math.random() * candidates.length)] || DAILY_AFFIRMATION_PROVERBS[0];
    }
    ctx.state.dailyAffirmation = picked;
    renderDailyAffirmationWidget(document.getElementById('dailyAffirmationMount'), ctx);
  },
  adminCreateProverb: async (data) => {
    try {
      const id = await createProverbEntry(data, ctx.user);
      ctx.state.dailyAffirmation = { id, ...data, isCloud: true };
      renderDailyAffirmationWidget(document.getElementById('dailyAffirmationMount'), ctx);
      notify(`Published proverb "${data.creole}" to Firestore!`);
      if (ctx.state.activeView === 'admin') {
        renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
      }
    } catch (err) {
      notify(`Could not publish proverb: ${err.message}`);
    }
  },
  adminSeedProverbs: async () => {
    try {
      notify('Syncing heritage proverbs to Firestore...');
      const count = await seedCuratedProverbs(DAILY_AFFIRMATION_PROVERBS, ctx.user);
      notify(`Synced ${count} Creole proverbs to Firestore!`);
    } catch (err) {
      notify(`Proverb sync failed: ${err.message}`);
    }
  }
};

// =========================================================
// SHELL RENDERING & ACCORDION CONTROLLER
// =========================================================
function isIosSafariNotStandalone() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  return isIos && !isStandalone;
}

function canShowInstallButton() {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  if (isStandalone) return false;
  return Boolean(ctx.state.deferredInstallPrompt) || isIosSafariNotStandalone();
}

function applyBodyClasses() {
  document.body.classList.toggle('dark-mode', Boolean(ctx.state.isDark));
  document.body.classList.toggle('reduce-motion', Boolean(ctx.settings.reduceMotion));
  document.body.classList.toggle('iphone-duo-layout', Boolean(ctx.settings.iphoneDuoLayout));
}

function jumpToAccordion(accId) {
  if (ctx.state.activeView === 'admin') {
    ctx.actions.setAppView('learner');
  }
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
    <!-- Unified Single-Bar Frosted Liquid Glass Header (All Nav & Workspace Actions Integrated) -->
    <header class="km-topbar no-print" id="kmTopbar">
      <div class="km-topbar-inner">
        <a href="#top" class="km-brand" aria-label="Kréyòl Matinik Home">
          <span class="km-brand-mark"><i class="fas fa-feather-pointed"></i></span>
          <span>${escapeHtml(t.brandTitle)}</span>
        </a>

        <div class="km-topbar-navwrap" id="kmTopbarNavwrap">
          <nav class="km-nav-links" aria-label="Primary Navigation">
            <button type="button" class="km-nav-link" data-jump="acc-path">${escapeHtml(t.navPath)}</button>
            <button type="button" class="km-nav-link" data-jump="acc-curriculum">${escapeHtml(t.navLearn)}</button>
            <button type="button" class="km-nav-link" id="navCardsBtn">${escapeHtml(t.navCards)}</button>
            <button type="button" class="km-nav-link" data-jump="acc-culture">${escapeHtml(t.navCulture)}</button>
            <button type="button" class="km-nav-link" data-jump="acc-dictionary">${escapeHtml(t.navDictionary)}</button>
            <button type="button" class="km-nav-link" data-jump="acc-map">${escapeHtml(t.navMap)}</button>
            <button type="button" class="km-nav-link" data-jump="acc-koudmen">${escapeHtml(t.navCommunity)}</button>
          </nav>

          <div class="km-topbar-search" id="kmTopbarSearchWrap">
            <i class="fas fa-search km-topbar-search-icon" aria-hidden="true"></i>
            <input type="search" id="topbarGlobalSearch" class="km-topbar-search-input"
              value="${escapeHtml(ctx.state.topbarSearch || '')}"
              placeholder="${escapeHtml(t.searchPlaceholder || 'Search words, lessons, or sites...')}"
              autocomplete="off"
              aria-label="Search vocabulary, lessons, or cultural sites">
            <div class="km-search-results" id="topbarSearchResults" role="listbox" aria-label="Search results"></div>
          </div>

          <div class="km-topbar-tools">
            <div class="km-seg-group km-seg-compact" role="group" aria-label="Interface language selector">
              <button type="button" class="km-seg-btn ${lang === 'mq' ? 'active' : ''}" data-set-lang="mq">MQ</button>
              <button type="button" class="km-seg-btn ${lang === 'fr' ? 'active' : ''}" data-set-lang="fr">FR</button>
              <button type="button" class="km-seg-btn ${lang === 'en' ? 'active' : ''}" data-set-lang="en">EN</button>
            </div>
            <button type="button" class="km-nav-tool-btn" id="themeToggleBtn" aria-label="Toggle light and dark theme" title="Toggle Dark/Light Theme">
              <i class="fas ${ctx.state.isDark ? 'fa-sun' : 'fa-moon'}"></i>
              <span class="km-tool-label">${ctx.state.isDark ? 'Light' : 'Dark'}</span>
            </button>
            <button type="button" class="km-nav-tool-btn" id="tourBtn" title="${escapeHtml(t.btnStartTour)}">
              <i class="fas fa-route"></i>
              <span class="km-tool-label">${escapeHtml(t.btnStartTour)}</span>
            </button>
            <button type="button" class="km-nav-tool-btn" id="settingsBtn" title="${escapeHtml(t.btnSettings)}">
              <i class="fas fa-sliders"></i>
              <span class="km-tool-label">${escapeHtml(t.btnSettings)}</span>
            </button>
            <button type="button" class="km-nav-tool-btn km-nav-tool-accent" id="tutorBtn" title="${escapeHtml(t.btnAskTutor)}">
              <i class="fas fa-comments"></i>
              <span>${escapeHtml(t.btnAskTutor)}</span>
            </button>
            <button type="button" class="km-nav-tool-btn" id="installAppBtn" title="Install Kréyòl Matinik App" ${canShowInstallButton() ? '' : 'hidden'}>
              <i class="fas fa-download"></i>
              <span class="km-tool-label">Install</span>
            </button>
            <button type="button" class="km-nav-tool-btn ${ctx.state.activeView === 'admin' ? 'active' : ''}" id="navAdminStudioBtn" title="${escapeHtml(t.btnAdmin)}">
              <i class="fas fa-pen-to-square"></i>
              <span class="km-tool-label">${escapeHtml(t.btnAdmin)}</span>
            </button>
          </div>
        </div>

        <div class="km-topbar-end">
          <button type="button" class="km-cta-btn" id="headerAccountBtn">
            <i class="fas fa-user-circle"></i>
            <span>${escapeHtml(t.signInCta)}</span>
          </button>
          <button type="button" class="km-mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle navigation menu" aria-expanded="false">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="km-shell" id="top">
      <div id="offlineStatusBanner" class="km-offline-banner no-print" role="status" aria-live="polite" ${ctx.state.isOffline ? '' : 'hidden'}>
        <i class="fas fa-cloud-arrow-down" aria-hidden="true"></i>
        <span>Offline mode active — cached Creole vocabulary, curriculum tables, and proverbs remain ready.</span>
      </div>

      <div id="learnerMainView" ${ctx.state.activeView === 'admin' ? 'hidden' : ''}>
      <!-- ENGAGING EDITORIAL HERO WALL: PICTURE BANNER MOVED TO TOP + EDITORIAL & WORD OF THE DAY -->
      <section class="km-card km-hero-section km-hero-wall">
        <div class="km-hero-visual km-hero-top-banner">
          <img src="${HERO_BANNER_IMAGE}" alt="Martinican Creole wooden veranda overlooking lush Mount Pelee rainforest" referrerpolicy="no-referrer">
          <div class="km-hero-scrim km-hero-top-scrim">
            <span class="km-hero-kicker">MADININA · LIVING HERITAGE ARCHIVE</span>
            <div class="km-hero-caption-title">Bèlè, Kwizin, Koudmen &amp; Oral Memory</div>
            <div class="km-hero-caption-sub">GEREC Phonetic Standard · Martinique OpenStreetMap Trail · 115+ Gallery Archive</div>
          </div>
        </div>

        <div class="km-hero-grid" style="margin-top:1.35rem;">
          <div class="km-hero-editorial">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
              <div class="km-hero-eyebrow">
                <span>${escapeHtml(t.motto)}</span>
              </div>
              <div id="heroWeatherChip"></div>
            </div>
            <h1 class="km-hero-title" id="heroGreetingTitle">${escapeHtml(t.heroTitle)}</h1>
            <p class="km-hero-sub">${escapeHtml(t.heroSubtitle)}</p>

            <div class="km-hero-cta-row">
              <button type="button" class="km-btn km-btn-primary km-hero-cta-main" data-jump="acc-path">
                <i class="fas fa-route"></i> Follow Learning Path
              </button>
              <button type="button" class="km-btn" id="heroCardsBtn">
                <i class="fas fa-layer-group"></i> 20 Visual Flashcard Decks
              </button>
              <button type="button" class="km-btn km-btn-emerald" data-jump="acc-map">
                <i class="fas fa-map-location-dot"></i> Culture Map
              </button>
            </div>

            <div class="km-editorial-steps" aria-label="Three-step heritage learning flow">
              <button type="button" class="km-editorial-step" data-jump="acc-curriculum">
                <span class="km-step-index km-mono">01.</span>
                <div>
                  <strong>${escapeHtml(t.step1Title.replace(/^\d+\.\s*/, ''))}</strong>
                  <span>${escapeHtml(t.step1Desc)}</span>
                </div>
              </button>
              <button type="button" class="km-editorial-step" data-jump="acc-path">
                <span class="km-step-index km-mono">02.</span>
                <div>
                  <strong>${escapeHtml(t.step2Title.replace(/^\d+\.\s*/, ''))}</strong>
                  <span>${escapeHtml(t.step2Desc)}</span>
                </div>
              </button>
              <button type="button" class="km-editorial-step" data-jump="acc-map">
                <span class="km-step-index km-mono">03.</span>
                <div>
                  <strong>${escapeHtml(t.step3Title.replace(/^\d+\.\s*/, ''))}</strong>
                  <span>${escapeHtml(t.step3Desc)}</span>
                </div>
              </button>
            </div>
          </div>

          <div class="km-hero-showcase">
            <div id="wotdMount"></div>
            <div id="dailyAffirmationMount"></div>
          </div>
        </div>

        <div class="km-heritage-strip" aria-label="Heritage Institutions and Curriculum Scope">
          <div class="km-heritage-cell">
            <span class="km-heritage-num km-mono">6 Stages · 20 Decks</span>
            <span class="km-heritage-label">Guided Path Progressively Unlocks Decks</span>
          </div>
          <div class="km-heritage-cell">
            <span class="km-heritage-num km-mono">GEREC + Weather</span>
            <span class="km-heritage-label">Mobile Speech, Culinary Art &amp; Live Tan-an</span>
          </div>
          <div class="km-heritage-cell">
            <span class="km-heritage-num km-mono">115+ Photos</span>
            <span class="km-heritage-label">OSM Heritage Trail &amp; Visual Archive</span>
          </div>
          <div class="km-heritage-cell">
            <span class="km-heritage-num km-mono">UNESCO</span>
            <span class="km-heritage-label">Intangible Language Preservation</span>
          </div>
        </div>
      </section>

      <!-- GUIDED LEARNING PATH · INTERACTIVE MILESTONE MAP -->
      <section class="km-accordion" id="acc-path" data-open="true">
        <button type="button" class="km-accordion-trigger" aria-expanded="true">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">${escapeHtml(t.pathTitle)}</span>
            <span class="km-accordion-sub">Interactive Milestone Map · Dynamically Unlocks New Creole Vocabulary Sets as You Advance</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="learningPathMount"></div>
      </section>

      <div class="km-duo-split">
        <!-- 1. PROGRESS, GOAL, FOCUS TIMER, BADGES & COLLECTION -->
        <section class="km-accordion" id="acc-progress" data-open="true">
          <button type="button" class="km-accordion-trigger" aria-expanded="true">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.progressHeading)}</span>
              <span class="km-accordion-sub">Daily Streak Fire · Focus Timer · Collection Points · Achievement Badges</span>
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
            <span class="km-accordion-sub">Custom Audio Player · Searchable GEREC Tables · Listening Quiz · AI Speaking Check</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="curriculumMount"></div>
      </section>

      <!-- 4. MARTINICAN CULINARY ART, LIVE WEATHER & 115+ PHOTO GALLERY -->
      <section class="km-accordion" id="acc-culture" data-open="false">
        <button type="button" class="km-accordion-trigger" aria-expanded="false">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">${escapeHtml(t.cultureTitle)}</span>
            <span class="km-accordion-sub">Kwizin Matinik · Open-Meteo Live Weather · Cultural Heritage · 115+ Island Pictures</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="cultureMount"></div>
      </section>

      <div class="km-duo-split">
        <!-- 5. 20 VISUAL MOTION FLASHCARD DECKS -->
        <section class="km-accordion" id="acc-flashcards" data-open="false">
          <button type="button" class="km-accordion-trigger" aria-expanded="false">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.flashcardDecksTitle)}</span>
              <span class="km-accordion-sub">Unlocked via Learning Path · Ken Burns Motion · Swipe Right/Left · Speak-Along</span>
            </div>
            <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="km-accordion-body" id="flashcardsDecksMount"></div>
        </section>

        <!-- 6. ILLUSTRATED VOCABULARY DICTIONARY -->
        <section class="km-accordion" id="acc-dictionary" data-open="false">
          <button type="button" class="km-accordion-trigger" aria-expanded="false">
            <div class="km-accordion-heading">
              <span class="km-accordion-title">${escapeHtml(t.dictionaryTitle)}</span>
              <span class="km-accordion-sub">Filter by Level · Live Cloud &amp; GEREC Entries · Custom Audio Player</span>
            </div>
            <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
          </button>
          <div class="km-accordion-body" id="dictionaryMount"></div>
        </section>
      </div>

      <!-- 7. MARTINIQUE CULTURAL MAP (OPENSTREETMAP) -->
      <section class="km-accordion" id="acc-map" data-open="false">
        <button type="button" class="km-accordion-trigger" aria-expanded="false">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">${escapeHtml(t.mapTitle)}</span>
            <span class="km-accordion-sub">OpenStreetMap Live · 12 Communes · Historical Sites · Off the Beaten Path · Landscape Galleries</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="mapMount"></div>
      </section>

      <!-- 8. COMMUNITY KOUDMEN & HERITAGE INSTITUTIONS -->
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

      <!-- 9. ADMIN RICH-TEXT CONTENT STUDIO -->
      <section class="km-accordion" id="acc-admin" data-open="false">
        <button type="button" class="km-accordion-trigger" aria-expanded="false">
          <div class="km-accordion-heading">
            <span class="km-accordion-title">Admin Content Studio</span>
            <span class="km-accordion-sub">Rich-Text Lesson Authoring · Image &amp; Study File Uploads · Dictionary &amp; Map Publisher</span>
          </div>
          <span class="km-accordion-chevron"><i class="fas fa-chevron-down"></i></span>
        </button>
        <div class="km-accordion-body" id="adminMount"></div>
      </section>
      </div>

      <!-- DEDICATED ADMIN STUDIO VIEW (FIREBASE AUTH RBAC PROTECTED) -->
      <div id="adminStudioMount" ${ctx.state.activeView === 'admin' ? '' : 'hidden'}></div>

      <footer class="km-meta-line" style="text-align:center; padding:0.75rem 0;">
        Kréyòl Matinik · ${escapeHtml(t.footerRights)} · <a href="https://www.patrimoines-martinique.org/" target="_blank" rel="noopener noreferrer" style="color:var(--cobalt);">patrimoines-martinique.org</a>
      </footer>
    </main>

    <!-- One-Hand Bottom Thumb Dock -->
    <nav class="km-onehand-dock no-print" aria-label="One-hand quick navigation" ${ctx.state.activeView === 'admin' ? 'style="display:none;"' : ''}>
      <button type="button" class="km-dock-btn" data-jump="acc-path"><i class="fas fa-route"></i><span>Path</span></button>
      <button type="button" class="km-dock-btn" data-jump="acc-curriculum"><i class="fas fa-seedling"></i><span>${escapeHtml(t.navLearn)}</span></button>
      <button type="button" class="km-dock-btn" id="dockCardsBtn"><i class="fas fa-layer-group"></i><span>${escapeHtml(t.navCards)}</span></button>
      <button type="button" class="km-dock-btn" data-jump="acc-culture"><i class="fas fa-utensils"></i><span>Culture</span></button>
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
        <p style="font-size:0.9rem; color:var(--ink-secondary); margin-bottom:1.1rem;">This resets your saved XP, quiz completions, collection points, milestone path, and voice recordings on this browser.</p>
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

function getFirebaseUserDisplayName() {
  if (!ctx.user) return '';
  const raw = (ctx.user.displayName || ctx.user.email?.split('@')[0] || '').trim();
  return raw ? raw.slice(0, 40) : '';
}

function renderHeroGreeting() {
  const titleEl = document.getElementById('heroGreetingTitle');
  if (!titleEl) return;
  const t = UI_STRINGS[ctx.state.lang] || UI_STRINGS.en;
  const name = getFirebaseUserDisplayName();
  if (name) {
    titleEl.innerHTML = `<span class="km-hero-user-greet">Bonjou, ${escapeHtml(name)}!</span> ${escapeHtml(t.heroTitle)}`;
  } else {
    titleEl.textContent = t.heroTitle;
  }
}

function renderHeaderAuthButton() {
  const btn = document.getElementById('headerAccountBtn');
  if (!btn) return;
  const t = UI_STRINGS[ctx.state.lang] || UI_STRINGS.en;
  if (ctx.user) {
    const label = getFirebaseUserDisplayName() || t.accountLabel;
    btn.innerHTML = `<i class="fas fa-user-check"></i><span>${escapeHtml(label.slice(0, 14))}</span>`;
  } else {
    btn.innerHTML = `<i class="fas fa-user-circle"></i><span>${escapeHtml(t.signInCta)}</span>`;
  }
}

function renderAllViews() {
  renderHeaderAuthButton();
  renderHeroGreeting();
  renderHeroWeatherChip(ctx);
  renderWordOfTheDayWidget(document.getElementById('wotdMount'), ctx);
  renderDailyAffirmationWidget(document.getElementById('dailyAffirmationMount'), ctx);
  renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
  renderProgressDashboard(document.getElementById('progressMount'), ctx);
  renderLevelsAndLessons(document.getElementById('levelsMount'), ctx);
  renderCurriculumAndOralLabs(document.getElementById('curriculumMount'), ctx);
  renderCulinaryWeatherCultureSection(document.getElementById('cultureMount'), ctx);
  renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
  renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
  renderMartiniqueMapSection(document.getElementById('mapMount'), ctx);
  renderCommunityAndInstitutions(document.getElementById('koudmenMount'), ctx);
  renderAdminStudio(document.getElementById('adminMount'), ctx);
  if (ctx.state.activeView === 'admin') {
    renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
  }
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

function offlineTutorFallback(userText) {
  const lower = String(userText || '').toLowerCase();
  if (lower.includes('ka') || lower.includes('té') || lower.includes('ké') || lower.includes('grammar')) {
    return '**Martinican Creole Aspect Markers (Pa ni konjigezon!):**\nPlace particles right before invariant verbs:\n- **ka** = ongoing (*Mwen ka palé Kréyòl*)\n- **té** = past (*Mwen té wè manman mwen*)\n- **ké** = future (*Nou ké pati dèmen*)\n- **pa** = negation (*Mwen pa ka konprann*)';
  }
  if (lower.includes('market') || lower.includes('maché') || lower.includes('food')) {
    return '**Gran Maché Fòdfrans Dialogue:**\n- « Bonjou manmay ! Konben mango-a yé ? » (Hello friend! How much are the mangoes?)\n- « Sé dé éwo pou twa bèl mango, doudou. » (Two euros for three lovely mangoes.)\n- « Ban mwen an ti bren piman souplé ! » (Give me a small bit of chili please!)';
  }
  if (lower.includes('proverb') || lower.includes('pawòl')) {
    return '**Pawòl Matinik (Traditional Proverbs):**\n- « Dèyè mòn, toujou ni mòn. » — Beyond every hill lies another hill (Perseverance).\n- « Sé kouto sèl ki sav sa ki an tchè jiromon. » — Only the knife knows what lies inside the pumpkin’s heart.';
  }
  return '**Bonjou ! Mwen sé Man Mayotte.**\nHere is a daily phrase to practice aloud:\n- « Kouman ou yé jòdi-a ? — M\'ap kenbe doudou ! » (How are you today? — I am holding strong!)\nAsk me about GEREC grammar (**ka / té / ké**), market expressions, or Martinican communes like **Kap 110**, **Senpyè**, and **Sanmari**.';
}

async function submitTutorChat(userText) {
  if (ctx.state.tutorLoading || !userText) return;
  ctx.state.tutorHistory.push({ role: 'user', content: userText });
  ctx.state.tutorLoading = true;
  renderTutorDrawer();

  let reply = '';
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
    if (!res.ok) throw new Error('Tutor API unavailable');
    const data = await res.json();
    reply = data.reply || offlineTutorFallback(userText);
  } catch (_err) {
    reply = offlineTutorFallback(userText);
  }

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
  ctx.state.tutorLoading = false;
  renderTutorDrawer();
}

// =========================================================
// GUIDED TOUR & AUTH MODAL
// =========================================================
const TOUR_STEPS = [
  { emoji: '🌺', title: '1 · Listen to Word of the Day', body: 'Start at the Hero Wall Word of the Day. Play crisp GEREC audio on any desktop, phone, or tablet and practice for +5 XP.', acc: 'top' },
  { emoji: '🧭', title: '2 · Advance Along the Guided Learning Path', body: 'Complete stages on the Milestone Map to dynamically unlock new themed flashcard decks and earn Collection Points.', acc: 'acc-path' },
  { emoji: '🍲', title: '3 · Explore Kwizin, Weather & 115+ Photos', body: 'Discover Colombo, Féwòs, live Open-Meteo Creole weather forecasts across 4 microclimates, and over 115 island images.', acc: 'acc-culture' },
  { emoji: '🗺️', title: '4 · Explore Madinina on OpenStreetMap', body: 'Tap communes, historical memorials like Cap 110, or offbeat locations on the live OpenStreetMap trail to open galleries.', acc: 'acc-map' },
  { emoji: '🔥', title: '5 · Daily Streak Fire & Deep Study Timer', body: 'Light your daily Streak Fire by completing modules, study with nature audio, and Sign In to keep progress synced across devices.', acc: 'acc-progress' }
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
      renderAllViews();
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

  // Mobile Menu Collapse Toggle inside Unified Header
  const topbar = document.getElementById('kmTopbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenu = () => {
    ctx.state.mobileMenuOpen = false;
    topbar?.classList.remove('menu-open');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
  };
  mobileMenuBtn?.addEventListener('click', () => {
    ctx.state.mobileMenuOpen = !ctx.state.mobileMenuOpen;
    topbar?.classList.toggle('menu-open', ctx.state.mobileMenuOpen);
    mobileMenuBtn.setAttribute('aria-expanded', ctx.state.mobileMenuOpen ? 'true' : 'false');
  });

  // Topbar Global Quick Search (Vocabulary, Lessons, Cultural Sites)
  const searchInput = document.getElementById('topbarGlobalSearch');
  const searchResultsEl = document.getElementById('topbarSearchResults');
  const searchWrap = document.getElementById('kmTopbarSearchWrap');
  let activeMatches = [];

  const closeSearchDropdown = () => {
    if (searchResultsEl) searchResultsEl.classList.remove('open');
  };

  const buildTopbarSearchMatches = (rawQuery) => {
    const q = String(rawQuery || '').trim().toLowerCase();
    if (!q) return [];
    const results = [];

    // 1. Vocabulary matches
    const vocabList = getMergedDictionaryEntries(ctx);
    let vocabHits = 0;
    for (const v of vocabList) {
      const hay = `${v.word} ${v.en} ${v.fr} ${v.pronounce} ${v.explanation}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          kind: 'vocab',
          badge: 'Vocabulary',
          icon: 'fa-book-open',
          title: v.word,
          sub: `${v.en} · ${v.fr}`,
          word: v.word
        });
        vocabHits += 1;
        if (vocabHits >= 4) break;
      }
    }

    // 2. Lesson matches (Modules, Path Milestones, Micro-Lessons, Admin Cloud Lessons)
    let lessonHits = 0;
    const langKey = ctx.state.lang || 'en';
    for (const mod of HERITAGE_MODULES) {
      const mTitle = mod.title[langKey] || mod.title.en;
      const mIntro = mod.intro[langKey] || mod.intro.en;
      if (`${mTitle} ${mIntro} ${mod.grammarTitle}`.toLowerCase().includes(q)) {
        results.push({
          kind: 'module',
          badge: 'Lesson',
          icon: 'fa-seedling',
          title: mTitle,
          sub: mIntro.slice(0, 72),
          id: mod.id
        });
        lessonHits += 1;
      }
    }
    if (lessonHits < 4) {
      for (const ms of LEARNING_PATH_MILESTONES) {
        if (`${ms.creoleTitle} ${ms.title} ${ms.summary} ${ms.grammarFocus}`.toLowerCase().includes(q)) {
          results.push({
            kind: 'path',
            badge: 'Lesson',
            icon: 'fa-route',
            title: `${ms.creoleTitle} — ${ms.title}`,
            sub: `Stage ${ms.step} · ${ms.grammarFocus}`,
            id: ms.id
          });
          lessonHits += 1;
          if (lessonHits >= 4) break;
        }
      }
    }
    if (lessonHits < 4) {
      for (const ml of MICRO_LESSONS) {
        if (`${ml.title} ${ml.creoleHook} ${ml.explanation}`.toLowerCase().includes(q)) {
          results.push({
            kind: 'level',
            badge: 'Lesson',
            icon: 'fa-bolt',
            title: ml.title,
            sub: `${ml.duration} · ${ml.creoleHook}`,
            id: ml.id
          });
          lessonHits += 1;
          if (lessonHits >= 4) break;
        }
      }
    }
    if (lessonHits < 4) {
      for (const cl of (ctx.cloud.lessons || [])) {
        if (`${cl.title} ${cl.creoleSummary}`.toLowerCase().includes(q)) {
          results.push({
            kind: 'level',
            badge: 'Lesson',
            icon: 'fa-feather-pointed',
            title: cl.title,
            sub: cl.creoleSummary || 'Admin Studio Lesson',
            id: cl.id
          });
          lessonHits += 1;
          if (lessonHits >= 4) break;
        }
      }
    }

    // 3. Cultural Sites matches (12 Communes, Historical Sites, Offbeat & Firestore Map Sites)
    let siteHits = 0;
    const allSites = Object.values(getMergedMapLocations(ctx));
    for (const loc of allSites) {
      if (`${loc.name} ${loc.creoleName} ${loc.region} ${loc.fact}`.toLowerCase().includes(q)) {
        results.push({
          kind: 'site',
          badge: 'Cultural Site',
          icon: 'fa-map-location-dot',
          title: loc.name,
          sub: loc.creoleName || loc.region,
          id: loc.id
        });
        siteHits += 1;
        if (siteHits >= 4) break;
      }
    }

    return results;
  };

  const navigateToSearchResult = (item) => {
    if (!item) return;
    closeSearchDropdown();
    closeMobileMenu();
    if (item.kind === 'vocab') {
      ctx.state.dictSearch = item.word;
      ctx.state.dictLevel = 'all';
      ctx.state.dictLimit = 12;
      renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
      jumpToAccordion('acc-dictionary');
    } else if (item.kind === 'module') {
      ctx.state.activeModule = item.id;
      ctx.state.activeOralTab = 'module';
      ctx.state.curriculumSearch = '';
      renderCurriculumAndOralLabs(document.getElementById('curriculumMount'), ctx);
      jumpToAccordion('acc-curriculum');
    } else if (item.kind === 'path') {
      ctx.state.selectedPathId = item.id;
      renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
      jumpToAccordion('acc-path');
    } else if (item.kind === 'level') {
      renderLevelsAndLessons(document.getElementById('levelsMount'), ctx);
      jumpToAccordion('acc-levels');
    } else if (item.kind === 'site') {
      ctx.state.mapCategory = 'all';
      ctx.state.selectedSiteId = item.id;
      jumpToAccordion('acc-map');
      ctx.actions.markSiteVisited(item.id);
    }
  };

  const renderSearchDropdown = () => {
    if (!searchResultsEl || !searchInput) return;
    const q = searchInput.value.trim();
    if (!q) {
      activeMatches = [];
      closeSearchDropdown();
      return;
    }
    activeMatches = buildTopbarSearchMatches(q);
    if (!activeMatches.length) {
      searchResultsEl.innerHTML = `<div class="km-search-empty">No matching vocabulary, lessons, or sites for « ${escapeHtml(q)} ».</div>`;
      searchResultsEl.classList.add('open');
      return;
    }
    searchResultsEl.innerHTML = activeMatches.map((m, idx) => `
      <button type="button" class="km-search-result-item" data-search-pick="${idx}" role="option">
        <span class="km-search-badge km-search-badge--${escapeHtml(m.kind)}">
          <i class="fas ${escapeHtml(m.icon)}"></i> ${escapeHtml(m.badge)}
        </span>
        <div class="km-search-text">
          <strong>${escapeHtml(m.title)}</strong>
          <span>${escapeHtml(m.sub)}</span>
        </div>
      </button>
    `).join('');
    searchResultsEl.classList.add('open');

    searchResultsEl.querySelectorAll('[data-search-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const picked = activeMatches[Number(btn.getAttribute('data-search-pick'))];
        navigateToSearchResult(picked);
      });
    });
  };

  searchInput?.addEventListener('input', (ev) => {
    ctx.state.topbarSearch = ev.target.value;
    renderSearchDropdown();
  });

  searchInput?.addEventListener('focus', () => {
    if (searchInput.value.trim()) renderSearchDropdown();
  });

  searchInput?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (!activeMatches.length && searchInput.value.trim()) {
        activeMatches = buildTopbarSearchMatches(searchInput.value);
      }
      if (activeMatches.length) {
        navigateToSearchResult(activeMatches[0]);
      }
    } else if (ev.key === 'Escape') {
      closeSearchDropdown();
      searchInput.blur();
    }
  });

  document.addEventListener('click', (ev) => {
    if (searchWrap && !searchWrap.contains(ev.target)) {
      closeSearchDropdown();
    }
  });

  // Jump buttons (Nav, Steps, Dock, Admin)
  document.querySelectorAll('[data-jump]').forEach((el) => {
    el.addEventListener('click', () => {
      closeMobileMenu();
      jumpToAccordion(el.getAttribute('data-jump'));
    });
  });

  // Language switcher
  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.lang = btn.getAttribute('data-set-lang');
      closeMobileMenu();
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
  document.getElementById('navAdminStudioBtn')?.addEventListener('click', () => {
    closeMobileMenu();
    ctx.actions.setAppView(ctx.state.activeView === 'admin' ? 'learner' : 'admin');
  });
  document.getElementById('navCardsBtn')?.addEventListener('click', () => { closeMobileMenu(); ctx.actions.openFlashcards('greetings'); });
  document.getElementById('heroCardsBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('greetings'));
  document.getElementById('step2CardsBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('greetings'));
  document.getElementById('dockCardsBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('greetings'));
  document.getElementById('dockHandsFreeBtn')?.addEventListener('click', () => ctx.actions.openHandsFree(true));
  document.getElementById('settingsBtn')?.addEventListener('click', () => { closeMobileMenu(); ctx.actions.openSettings(true); });
  document.getElementById('headerAccountBtn')?.addEventListener('click', () => { closeMobileMenu(); ctx.actions.openAuthModal(true); });
  document.getElementById('tutorBtn')?.addEventListener('click', () => {
    closeMobileMenu();
    document.getElementById('tutorDrawerBackdrop')?.classList.add('open');
  });
  document.getElementById('tourBtn')?.addEventListener('click', () => {
    closeMobileMenu();
    ctx.state.tourStep = 0;
    document.getElementById('tourModalBackdrop')?.classList.add('open');
    renderTourModal();
  });
  document.getElementById('installAppBtn')?.addEventListener('click', async () => {
    closeMobileMenu();
    const promptEv = ctx.state.deferredInstallPrompt;
    if (promptEv) {
      try {
        promptEv.prompt();
        const choice = await promptEv.userChoice;
        ctx.state.deferredInstallPrompt = null;
        if (choice?.outcome === 'accepted') {
          notify('Kréyòl Matinik installed for offline study!');
          const btn = document.getElementById('installAppBtn');
          if (btn) btn.hidden = true;
        }
      } catch (_err) {}
    } else if (isIosSafariNotStandalone()) {
      notify('On iPhone/iPad: tap Share in Safari, then choose "Add to Home Screen".');
    }
  });

  // Safe In-App Reset
  document.getElementById('cancelResetBtn')?.addEventListener('click', () => ctx.actions.openResetModal(false));
  document.getElementById('confirmResetBtn')?.addEventListener('click', async () => {
    const today = todayIso();
    ctx.progress = {
      modules: { module1: false, module2: false, module3: false },
      quizzes: { quiz1: false, quiz2: false, quiz3: false },
      pathCompleted: [],
      listenedWords: [],
      reviewedCards: [],
      xp: 0,
      streak: 1,
      lastActivityDate: today,
      streakFiredToday: '',
      streakHistory: [today]
    };
    ctx.state.streakJustIgnited = false;
    ctx.state.selectedPathId = 'path-1';
    ctx.collection = { points: 0, flashcardPoints: 0, lessonPoints: 0, mapPoints: 0, visitedSites: [], termStats: {} };
    ctx.activityLog = {};
    ctx.recordedMeta = {};
    writeJson(STORAGE_KEYS.RECORD_META, {});
    writeJson(STORAGE_KEYS.ACTIVITY_LOG, {});
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
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.state.isDark = savedTheme ? savedTheme === 'dark' : sysDark;
    checkDailyStreak();
    recordActiveStudySeconds(0);
    applyBodyClasses();
    renderAppShell();
    startStudyHeartbeat();
    onTermAudioStateChange(syncAudioPlayerBarsDom);
  } catch (renderErr) {
    console.error('UI initialization fallback:', renderErr);
    const root = document.getElementById('app');
    if (root) {
      root.innerHTML = `<div style="max-width:540px;margin:3rem auto;padding:1.5rem;border:1px solid #cbd5e1;border-radius:16px;font-family:sans-serif;">
        <h2>Kréyòl Matinik</h2>
        <p style="margin-top:0.5rem;color:#475569;">Please refresh the page to reload learning modules.</p>
      </div>`;
    }
    return;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  // Unlock iOS / Android mobile & tablet audio cleanly on first gesture
  const handleFirstMobileTouch = () => {
    unlockMobileAudio();
  };
  window.addEventListener('touchstart', handleFirstMobileTouch, { capture: true, once: true, passive: true });
  window.addEventListener('pointerdown', handleFirstMobileTouch, { capture: true, once: true, passive: true });

  // Fetch live Martinique weather in background cleanly
  fetchMartiniqueWeather(ctx).then(() => {
    renderHeroWeatherChip(ctx);
    const cultureMount = document.getElementById('cultureMount');
    if (cultureMount && ctx.state.cultureTab === 'weather') {
      renderCulinaryWeatherCultureSection(cultureMount, ctx);
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('Service Worker registration skipped:', err?.message || err);
    });
  }

  const updateOnlineBanner = () => {
    ctx.state.isOffline = !navigator.onLine;
    const banner = document.getElementById('offlineStatusBanner');
    if (banner) banner.hidden = !ctx.state.isOffline;
    if (ctx.state.isOffline) {
      notify('Offline mode active — core Creole vocabulary & lessons cached locally.');
    }
  };
  window.addEventListener('offline', updateOnlineBanner);
  window.addEventListener('online', () => {
    updateOnlineBanner();
    notify('Connection restored — cloud sync active.');
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    ctx.state.deferredInstallPrompt = e;
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) installBtn.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    ctx.state.deferredInstallPrompt = null;
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) installBtn.hidden = true;
  });

  try {
    const fb = await initFirebase();
    if (fb?.db) {
      subscribeLessons((items) => {
        ctx.cloud.lessons = items;
        renderLevelsAndLessons(document.getElementById('levelsMount'), ctx);
        renderAdminStudio(document.getElementById('adminMount'), ctx);
        if (ctx.state.activeView === 'admin') {
          renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
        }
      });
      subscribeDictionary((items) => {
        ctx.cloud.dictionary = items;
        renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
        renderAdminStudio(document.getElementById('adminMount'), ctx);
        if (ctx.state.activeView === 'admin') {
          renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
        }
      });
      subscribeKoudmen((items) => {
        ctx.cloud.koudmen = items;
        renderCommunityAndInstitutions(document.getElementById('koudmenMount'), ctx);
      });
      subscribeMapLocations((items) => {
        ctx.cloud.mapLocations = items;
        refreshDynamicMapMarkers(ctx);
        renderAdminStudio(document.getElementById('adminMount'), ctx);
        if (ctx.state.activeView === 'admin') {
          renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
        }
      });
      subscribeVocabSets((items) => {
        ctx.cloud.vocabSets = items;
        renderFlashcardDecksGrid(document.getElementById('flashcardsDecksMount'), ctx);
        renderLearningPathSection(document.getElementById('learningPathMount'), ctx);
        renderDictionarySection(document.getElementById('dictionaryMount'), ctx);
        if (ctx.state.activeView === 'admin') {
          renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
        }
      });
      subscribeProverbs((items) => {
        ctx.cloud.proverbs = items;
        renderAdminStudio(document.getElementById('adminMount'), ctx);
        if (ctx.state.activeView === 'admin') {
          renderAdminStudioWorkspace(document.getElementById('adminStudioMount'), ctx);
        }
        if ((!ctx.state.dailyAffirmation || !ctx.state.dailyAffirmation.isCloud) && items.length) {
          ctx.state.dailyAffirmation = items[Math.floor(Math.random() * items.length)];
          renderDailyAffirmationWidget(document.getElementById('dailyAffirmationMount'), ctx);
        }
      });
      fetchRandomProverbFromFirestore()
        .then((prov) => {
          if (prov) {
            ctx.state.dailyAffirmation = prov;
            renderDailyAffirmationWidget(document.getElementById('dailyAffirmationMount'), ctx);
          }
        })
        .catch(() => {});
    }
    observeAuth(async (user) => {
      ctx.user = user || null;
      ctx.rbac = user
        ? await verifyAdminAccess(user)
        : {
            authorized: false,
            role: 'guest',
            emailVerified: false,
            uid: '',
            email: '',
            source: 'none',
            reason: 'Sign in with a verified administrator account.'
          };
      ctx.isAdmin = Boolean(ctx.rbac.authorized);
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
