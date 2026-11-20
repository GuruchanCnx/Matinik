// Unified Audio Engine: Web Speech TTS, AI Voice Selector, Nature Soundscapes, SFX, SpeechRecognition & IndexedDB Recording Studio

const VOICE_DB_NAME = 'kreyol_voice_studio_db';
const VOICE_STORE_NAME = 'recordings';

let voiceDbPromise = null;
let sfxAudioCtx = null;
let natureAudioCtx = null;
let natureGainNode = null;
let natureSources = [];
let natureTargetGain = 0.14;
let activeMediaRecorder = null;
let activeRecordingChunks = [];
let activeRecordingTermId = null;
let activePlaybackAudio = null;
let mobileAudioUnlocked = false;
const activeUtteranceKeepAlive = new Set();

export function unlockMobileAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      if (!sfxAudioCtx) sfxAudioCtx = new AC();
      if (sfxAudioCtx.state === 'suspended') sfxAudioCtx.resume().catch(() => {});
      if (!mobileAudioUnlocked) {
        const silentBuf = sfxAudioCtx.createBuffer(1, 1, 22050);
        const silentSrc = sfxAudioCtx.createBufferSource();
        silentSrc.buffer = silentBuf;
        silentSrc.connect(sfxAudioCtx.destination);
        silentSrc.start(0);
      }
      if (natureAudioCtx && natureAudioCtx.state === 'suspended') {
        natureAudioCtx.resume().catch(() => {});
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
    mobileAudioUnlocked = true;
  } catch (e) {}
}

function runAfterSafeCancel(fn) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    fn();
    return;
  }
  const ss = window.speechSynthesis;
  if (ss.speaking || ss.pending) {
    try { ss.cancel(); } catch (e) {}
    // iOS Safari & Android Chrome drop synchronous speak() calls immediately after cancel()
    setTimeout(fn, 65);
  } else {
    fn();
  }
}

export function getSortedVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  return [...voices].sort((a, b) => {
    const score = (v) => (v.lang?.startsWith('fr') ? 0 : v.lang?.startsWith('en') ? 1 : 2);
    return score(a) - score(b);
  });
}

export function triggerHaptic(enabled, pattern = 16) {
  if (!enabled) return;
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) {}
}

export function playSfx(settings, type = 'tap') {
  if (!settings?.soundEffects) return;
  const volScale = Math.max(0.05, Math.min(1, Number(settings.mainVolume ?? 0.9)));
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
      gain.gain.setValueAtTime(0.14 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else if (type === 'almost') {
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.09 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    } else if (type === 'wrong') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(175, now + 0.16);
      gain.gain.setValueAtTime(0.1 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const cOsc = sfxAudioCtx.createOscillator();
        const cGain = sfxAudioCtx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(freq, now + idx * 0.11);
        cGain.gain.setValueAtTime(0.16 * volScale, now + idx * 0.11);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 1.0);
        cOsc.connect(cGain);
        cGain.connect(sfxAudioCtx.destination);
        cOsc.start(now + idx * 0.11);
        cOsc.stop(now + idx * 0.11 + 1.05);
      });
      return;
    } else {
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.05 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }
    osc.connect(gain);
    gain.connect(sfxAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  } catch (e) {}
}

export function speakTermSequence(creoleText, translationText, opts = {}) {
  const {
    settings = {},
    lang = 'en',
    btnEl = null,
    onListened = null,
    onFinished = null
  } = opts;

  unlockMobileAudio();

  if (!('speechSynthesis' in window)) {
    if (onFinished) onFinished();
    return false;
  }

  const voices = getSortedVoices();
  const chosenVoice = settings.voiceURI ? voices.find((v) => v.voiceURI === settings.voiceURI) : null;
  const frVoice = chosenVoice || voices.find((v) => v.lang && (v.lang === 'fr-FR' || v.lang.startsWith('fr'))) || null;
  const enVoice = voices.find((v) => v.lang && v.lang.startsWith('en')) || null;
  const mainVol = Math.max(0, Math.min(1, Number(settings.mainVolume ?? 0.9)));
  const speechRate = Math.max(0.65, Math.min(1.25, Number(settings.speechRate ?? 0.9)));

  let finishedOnce = false;
  let watchdog1 = null;
  let watchdog2 = null;

  const cleanup = () => {
    if (watchdog1) clearTimeout(watchdog1);
    if (watchdog2) clearTimeout(watchdog2);
    if (finishedOnce) return;
    finishedOnce = true;
    if (btnEl) btnEl.classList.remove('playing');
    if (onFinished) onFinished();
  };

  const speakTranslation = () => {
    if (!settings.translationPlayback || !translationText) {
      cleanup();
      return;
    }
    const utt2 = new SpeechSynthesisUtterance(translationText);
    utt2.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    if (lang === 'fr' && frVoice) utt2.voice = frVoice;
    else if (lang !== 'fr' && enVoice) utt2.voice = enVoice;
    utt2.rate = Math.min(1.2, speechRate + 0.05);
    utt2.volume = mainVol;
    activeUtteranceKeepAlive.add(utt2);

    const estMs2 = Math.max(1600, estimatePronunciationDuration(translationText, utt2.rate) * 1000 + 1800);
    watchdog2 = setTimeout(() => {
      activeUtteranceKeepAlive.delete(utt2);
      cleanup();
    }, estMs2);

    utt2.onend = () => {
      activeUtteranceKeepAlive.delete(utt2);
      cleanup();
    };
    utt2.onerror = () => {
      activeUtteranceKeepAlive.delete(utt2);
      cleanup();
    };
    window.speechSynthesis.speak(utt2);
  };

  if (btnEl) btnEl.classList.add('playing');

  runAfterSafeCancel(() => {
    const utt1 = new SpeechSynthesisUtterance(creoleText);
    if (frVoice) utt1.voice = frVoice;
    utt1.lang = frVoice?.lang || 'fr-FR';
    utt1.rate = speechRate;
    utt1.pitch = 1.04;
    utt1.volume = mainVol;
    activeUtteranceKeepAlive.add(utt1);

    let step1Done = false;
    const finishStep1 = () => {
      if (step1Done) return;
      step1Done = true;
      if (watchdog1) clearTimeout(watchdog1);
      activeUtteranceKeepAlive.delete(utt1);
      if (onListened) onListened(creoleText);
      setTimeout(speakTranslation, 200);
    };

    const estMs1 = Math.max(1800, estimatePronunciationDuration(creoleText, speechRate) * 1000 + 2200);
    watchdog1 = setTimeout(finishStep1, estMs1);

    utt1.onend = finishStep1;
    utt1.onerror = () => {
      activeUtteranceKeepAlive.delete(utt1);
      cleanup();
    };
    window.speechSynthesis.speak(utt1);
  });

  return true;
}

// =========================================================
// CUSTOM VOCABULARY AUDIO PLAYER (PLAY / PAUSE / SEEK BAR)
// =========================================================
const audioPlayerState = {
  trackId: null,
  fullText: '',
  translationText: '',
  words: [],
  settings: {},
  lang: 'en',
  onListened: null,
  status: 'idle', // 'idle' | 'playing' | 'paused'
  progressPct: 0,
  elapsedSec: 0,
  durationSec: 2.5,
  timerId: null,
  lastTickMs: 0,
  playToken: 0
};

const audioPlayerListeners = new Set();

export function onTermAudioStateChange(fn) {
  if (typeof fn !== 'function') return () => {};
  audioPlayerListeners.add(fn);
  return () => audioPlayerListeners.delete(fn);
}

export function getTermAudioPlayerState() {
  return {
    trackId: audioPlayerState.trackId,
    status: audioPlayerState.status,
    progressPct: audioPlayerState.progressPct,
    elapsedSec: audioPlayerState.elapsedSec,
    durationSec: audioPlayerState.durationSec
  };
}

export function formatAudioTime(sec) {
  const s = Math.max(0, Math.round(Number(sec || 0)));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export function estimatePronunciationDuration(text, speechRate = 0.9) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const rate = Math.max(0.65, Math.min(1.25, Number(speechRate || 0.9)));
  return Number(Math.max(1.8, (words.length * 0.56 + 0.55) / rate).toFixed(1));
}

function emitAudioPlayerState() {
  const snap = getTermAudioPlayerState();
  audioPlayerListeners.forEach((fn) => {
    try { fn(snap); } catch (e) {}
  });
}

function clearAudioTicker() {
  if (audioPlayerState.timerId) {
    clearInterval(audioPlayerState.timerId);
    audioPlayerState.timerId = null;
  }
}

function speakFromProgressOffset(startPct) {
  unlockMobileAudio();
  const token = ++audioPlayerState.playToken;
  clearAudioTicker();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    audioPlayerState.status = 'playing';
    audioPlayerState.lastTickMs = Date.now();
    audioPlayerState.timerId = setInterval(() => {
      if (token !== audioPlayerState.playToken || audioPlayerState.status !== 'playing') return;
      const now = Date.now();
      const dt = (now - audioPlayerState.lastTickMs) / 1000;
      audioPlayerState.lastTickMs = now;
      audioPlayerState.elapsedSec = Math.min(audioPlayerState.durationSec, audioPlayerState.elapsedSec + dt);
      audioPlayerState.progressPct = Math.min(100, Math.round((audioPlayerState.elapsedSec / audioPlayerState.durationSec) * 100));
      emitAudioPlayerState();
      if (audioPlayerState.elapsedSec >= audioPlayerState.durationSec) {
        if (audioPlayerState.onListened) audioPlayerState.onListened(audioPlayerState.fullText);
        stopTermAudioTrack();
      }
    }, 60);
    emitAudioPlayerState();
    return;
  }

  const words = audioPlayerState.words;
  const wordIdx = Math.min(Math.max(0, Math.floor((startPct / 100) * words.length)), Math.max(0, words.length - 1));
  const sliceText = words.slice(wordIdx).join(' ') || audioPlayerState.fullText;

  const voices = getSortedVoices();
  const s = audioPlayerState.settings || {};
  const chosenVoice = s.voiceURI ? voices.find((v) => v.voiceURI === s.voiceURI) : null;
  const frVoice = chosenVoice || voices.find((v) => v.lang && (v.lang === 'fr-FR' || v.lang.startsWith('fr'))) || null;
  const mainVol = Math.max(0, Math.min(1, Number(s.mainVolume ?? 0.9)));
  const speechRate = Math.max(0.65, Math.min(1.25, Number(s.speechRate ?? 0.9)));

  audioPlayerState.status = 'playing';
  audioPlayerState.lastTickMs = Date.now();

  audioPlayerState.timerId = setInterval(() => {
    if (token !== audioPlayerState.playToken || audioPlayerState.status !== 'playing') return;
    const now = Date.now();
    const dt = (now - audioPlayerState.lastTickMs) / 1000;
    audioPlayerState.lastTickMs = now;
    audioPlayerState.elapsedSec = Math.min(audioPlayerState.durationSec * 0.98, audioPlayerState.elapsedSec + dt);
    audioPlayerState.progressPct = Math.min(98, Math.round((audioPlayerState.elapsedSec / audioPlayerState.durationSec) * 100));
    emitAudioPlayerState();
  }, 60);

  runAfterSafeCancel(() => {
    if (token !== audioPlayerState.playToken) return;
    const utt = new SpeechSynthesisUtterance(sliceText);
    if (frVoice) utt.voice = frVoice;
    utt.lang = frVoice?.lang || 'fr-FR';
    utt.rate = speechRate;
    utt.pitch = 1.04;
    utt.volume = mainVol;
    activeUtteranceKeepAlive.add(utt);

    let finished = false;
    const finishPlayback = () => {
      if (finished || token !== audioPlayerState.playToken) return;
      finished = true;
      activeUtteranceKeepAlive.delete(utt);
      clearAudioTicker();
      audioPlayerState.elapsedSec = audioPlayerState.durationSec;
      audioPlayerState.progressPct = 100;
      emitAudioPlayerState();
      if (audioPlayerState.onListened) audioPlayerState.onListened(audioPlayerState.fullText);
      setTimeout(() => {
        if (token !== audioPlayerState.playToken) return;
        audioPlayerState.status = 'idle';
        audioPlayerState.elapsedSec = 0;
        audioPlayerState.progressPct = 0;
        emitAudioPlayerState();
      }, 260);
    };

    const remainingMs = Math.max(1800, (audioPlayerState.durationSec - audioPlayerState.elapsedSec) * 1000 + 2500);
    const watchdog = setTimeout(finishPlayback, remainingMs);

    utt.onend = () => {
      clearTimeout(watchdog);
      finishPlayback();
    };

    utt.onerror = () => {
      clearTimeout(watchdog);
      activeUtteranceKeepAlive.delete(utt);
      if (token !== audioPlayerState.playToken) return;
      clearAudioTicker();
      audioPlayerState.status = 'idle';
      emitAudioPlayerState();
    };

    window.speechSynthesis.speak(utt);
  });

  emitAudioPlayerState();
}

export function toggleTermAudioTrack(trackId, config = {}) {
  const {
    text = '',
    exampleText = '',
    translationText = '',
    settings = {},
    lang = 'en',
    onListened = null
  } = config;

  // Toggle Pause / Resume on currently active track
  if (audioPlayerState.trackId === trackId && audioPlayerState.status === 'playing') {
    audioPlayerState.status = 'paused';
    audioPlayerState.playToken += 1;
    clearAudioTicker();
    try { window.speechSynthesis?.cancel(); } catch (e) {}
    emitAudioPlayerState();
    return;
  }

  if (audioPlayerState.trackId === trackId && audioPlayerState.status === 'paused') {
    audioPlayerState.settings = settings;
    speakFromProgressOffset(audioPlayerState.progressPct);
    return;
  }

  // Start new track
  const spokenBundle = exampleText ? `${text}. ${exampleText}` : String(text || '');
  const durationSec = estimatePronunciationDuration(spokenBundle, settings.speechRate);

  audioPlayerState.trackId = trackId;
  audioPlayerState.fullText = text;
  audioPlayerState.translationText = translationText;
  audioPlayerState.words = spokenBundle.trim().split(/\s+/).filter(Boolean);
  audioPlayerState.settings = settings;
  audioPlayerState.lang = lang;
  audioPlayerState.onListened = onListened;
  audioPlayerState.durationSec = durationSec;
  audioPlayerState.elapsedSec = 0;
  audioPlayerState.progressPct = 0;

  speakFromProgressOffset(0);
}

export function seekTermAudioTrack(trackId, pct, config = {}) {
  const clamped = Math.max(0, Math.min(100, Number(pct || 0)));
  if (audioPlayerState.trackId !== trackId) {
    const spokenBundle = config.exampleText ? `${config.text || ''}. ${config.exampleText}` : String(config.text || '');
    const durationSec = estimatePronunciationDuration(spokenBundle, config.settings?.speechRate);
    audioPlayerState.trackId = trackId;
    audioPlayerState.fullText = config.text || '';
    audioPlayerState.translationText = config.translationText || '';
    audioPlayerState.words = spokenBundle.trim().split(/\s+/).filter(Boolean);
    audioPlayerState.settings = config.settings || {};
    audioPlayerState.lang = config.lang || 'en';
    audioPlayerState.onListened = config.onListened || null;
    audioPlayerState.durationSec = durationSec;
  }
  audioPlayerState.progressPct = clamped;
  audioPlayerState.elapsedSec = (clamped / 100) * audioPlayerState.durationSec;

  if (audioPlayerState.status === 'playing') {
    speakFromProgressOffset(clamped);
  } else {
    emitAudioPlayerState();
  }
}

export function stopTermAudioTrack() {
  audioPlayerState.playToken += 1;
  clearAudioTicker();
  try { window.speechSynthesis?.cancel(); } catch (e) {}
  audioPlayerState.status = 'idle';
  audioPlayerState.elapsedSec = 0;
  audioPlayerState.progressPct = 0;
  emitAudioPlayerState();
}

// =========================================================
// NATURE AMBIENT SYNTHESIZER (INDEPENDENT VOLUME)
// =========================================================
function ensureNatureAudio() {
  if (!natureAudioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) natureAudioCtx = new AC();
  }
  if (natureAudioCtx && natureAudioCtx.state === 'suspended') {
    natureAudioCtx.resume();
  }
}

export function setNatureAmbientVolume(vol) {
  const clamped = Math.max(0, Math.min(1, Number(vol) || 0));
  natureTargetGain = clamped === 0 ? 0.001 : Math.max(0.005, clamped * 0.36);
  if (natureGainNode && natureAudioCtx) {
    try {
      natureGainNode.gain.setTargetAtTime(natureTargetGain, natureAudioCtx.currentTime, 0.08);
    } catch (e) {}
  }
}

export function startNatureSounds(track = 'rainforest', ambientVol = 0.35) {
  try {
    ensureNatureAudio();
    if (!natureAudioCtx) return;
    stopNatureSounds(true);
    setNatureAmbientVolume(ambientVol);

    natureGainNode = natureAudioCtx.createGain();
    natureGainNode.gain.setValueAtTime(0.004, natureAudioCtx.currentTime);
    natureGainNode.gain.exponentialRampToValueAtTime(Math.max(0.002, natureTargetGain), natureAudioCtx.currentTime + 1.0);
    natureGainNode.connect(natureAudioCtx.destination);

    const bufferSize = natureAudioCtx.sampleRate * 4;
    const buffer = natureAudioCtx.createBuffer(1, bufferSize, natureAudioCtx.sampleRate);
    const out = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      out[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const src = natureAudioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    if (track === 'waves') {
      const filter = natureAudioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, natureAudioCtx.currentTime);
      const lfo = natureAudioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.11, natureAudioCtx.currentTime);
      const lfoGain = natureAudioCtx.createGain();
      lfoGain.gain.setValueAtTime(170, natureAudioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      src.connect(filter);
      filter.connect(natureGainNode);
      natureSources.push(src, lfo);
    } else if (track === 'crickets') {
      const filter = natureAudioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4400, natureAudioCtx.currentTime);
      filter.Q.setValueAtTime(4.5, natureAudioCtx.currentTime);
      const tremolo = natureAudioCtx.createOscillator();
      tremolo.frequency.setValueAtTime(15, natureAudioCtx.currentTime);
      const tGain = natureAudioCtx.createGain();
      tGain.gain.setValueAtTime(0.06, natureAudioCtx.currentTime);
      tremolo.connect(tGain.gain);
      tremolo.start();
      src.connect(filter);
      filter.connect(tGain);
      tGain.connect(natureGainNode);
      natureSources.push(src, tremolo);
    } else {
      const filter = natureAudioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, natureAudioCtx.currentTime);
      filter.Q.setValueAtTime(1.2, natureAudioCtx.currentTime);
      src.connect(filter);
      filter.connect(natureGainNode);
      natureSources.push(src);
    }

    src.start();
  } catch (e) {}
}

export function stopNatureSounds(immediate = false) {
  try {
    if (immediate) {
      natureSources.forEach((s) => { try { s.stop(); } catch (e) {} });
      natureSources = [];
      return;
    }
    if (natureGainNode && natureAudioCtx) {
      natureGainNode.gain.linearRampToValueAtTime(0.001, natureAudioCtx.currentTime + 0.4);
    }
    setTimeout(() => {
      natureSources.forEach((s) => { try { s.stop(); } catch (e) {} });
      natureSources = [];
    }, 420);
  } catch (e) {}
}

// =========================================================
// PHONETIC MATCH & SPEECH RECOGNITION
// =========================================================
export function normalizePhoneticString(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"«»!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

export function computeSpeechSimilarity(spokenRaw, targetCreole) {
  const cleanSpoken = normalizePhoneticString(spokenRaw);
  const cleanTarget = normalizePhoneticString(targetCreole);
  if (!cleanSpoken || !cleanTarget) return 0;

  const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);
  const charSim = maxLen > 0 ? (1 - levenshtein(cleanSpoken, cleanTarget) / maxLen) : 1;

  const spokenWords = cleanSpoken.split(' ');
  const targetWords = cleanTarget.split(' ');
  let matched = 0;
  targetWords.forEach((tw) => {
    if (spokenWords.some((sw) => sw === tw || levenshtein(sw, tw) <= 1)) {
      matched += 1;
    }
  });
  const wordSim = matched / targetWords.length;
  return Math.min(100, Math.max(0, Math.round((charSim * 0.5 + wordSim * 0.5) * 100)));
}

export function captureSpokenPhrase({ lang = 'fr-FR', timeoutMs = 5200, onInterim = null } = {}) {
  return new Promise((resolve) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      resolve({ supported: false, transcript: '', error: 'unsupported' });
      return;
    }
    try {
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      let finalText = '';
      let settled = false;
      const timer = setTimeout(() => {
        try { rec.stop(); } catch (e) {}
      }, timeoutMs);

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += ` ${piece}`;
          else interim += piece;
        }
        if (onInterim) onInterim((finalText || interim).trim());
      };

      rec.onerror = (ev) => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          resolve({ supported: true, transcript: finalText.trim(), error: ev.error || 'error' });
        }
      };

      rec.onend = () => {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          resolve({ supported: true, transcript: finalText.trim(), error: null });
        }
      };

      rec.start();
    } catch (err) {
      resolve({ supported: true, transcript: '', error: err.message });
    }
  });
}

// =========================================================
// LOCAL INDEXEDDB SELF-RECORDING STUDIO
// =========================================================
function openVoiceDb() {
  if (voiceDbPromise) return voiceDbPromise;
  voiceDbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB unsupported'));
    const req = window.indexedDB.open(VOICE_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(VOICE_STORE_NAME)) {
        db.createObjectStore(VOICE_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return voiceDbPromise;
}

export async function saveVoiceRecordingBlob(termId, blob) {
  const db = await openVoiceDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VOICE_STORE_NAME, 'readwrite');
    tx.objectStore(VOICE_STORE_NAME).put(blob, termId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadVoiceRecordingBlob(termId) {
  const db = await openVoiceDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VOICE_STORE_NAME, 'readonly');
    const req = tx.objectStore(VOICE_STORE_NAME).get(termId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllVoiceRecordings() {
  try {
    const db = await openVoiceDb();
    await new Promise((resolve) => {
      const tx = db.transaction(VOICE_STORE_NAME, 'readwrite');
      tx.objectStore(VOICE_STORE_NAME).clear();
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch (e) {}
}

export function isActivelyRecording(termId) {
  return Boolean(activeMediaRecorder && activeRecordingTermId === termId);
}

function pickBestRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  const candidates = ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

export async function toggleTermVoiceRecording(termId, { onSaved, onError } = {}) {
  unlockMobileAudio();
  if (activeMediaRecorder && activeRecordingTermId === termId) {
    try { activeMediaRecorder.stop(); } catch (e) {}
    return false;
  }

  if (activeMediaRecorder) {
    try { activeMediaRecorder.stop(); } catch (e) {}
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    if (onError) onError('Microphone recording is unavailable in this browser.');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    activeRecordingChunks = [];
    activeRecordingTermId = termId;
    const preferredMime = pickBestRecorderMimeType();
    const recorder = preferredMime ? new MediaRecorder(stream, { mimeType: preferredMime }) : new MediaRecorder(stream);
    activeMediaRecorder = recorder;
    const startedAt = Date.now();

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) activeRecordingChunks.push(ev.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const resolvedMime = recorder.mimeType || preferredMime || 'audio/mp4';
      const blob = new Blob(activeRecordingChunks, { type: resolvedMime });
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const finishedId = activeRecordingTermId;
      activeMediaRecorder = null;
      activeRecordingTermId = null;

      if (blob.size > 200) {
        await saveVoiceRecordingBlob(finishedId, blob);
        if (onSaved) onSaved(finishedId, durationSec);
      }
    };

    recorder.start();
    setTimeout(() => {
      if (activeMediaRecorder === recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    }, 6500);
    return true;
  } catch (err) {
    activeMediaRecorder = null;
    activeRecordingTermId = null;
    if (onError) onError('Please allow microphone access on your phone/tablet to save your pronunciation.');
    return false;
  }
}

export async function replayUserVoiceRecording(termId, { onMissing, onDone } = {}) {
  unlockMobileAudio();
  try {
    const blob = await loadVoiceRecordingBlob(termId);
    if (!blob) {
      if (onMissing) onMissing();
      return false;
    }
    if (activePlaybackAudio) {
      activePlaybackAudio.pause();
      activePlaybackAudio = null;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playsInline = true;
    audio.setAttribute('playsinline', '');
    activePlaybackAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (activePlaybackAudio === audio) activePlaybackAudio = null;
      if (onDone) onDone();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (activePlaybackAudio === audio) activePlaybackAudio = null;
      if (onMissing) onMissing();
    };
    await audio.play();
    return true;
  } catch (err) {
    if (onMissing) onMissing();
    return false;
  }
}
