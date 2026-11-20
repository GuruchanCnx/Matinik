import { ARTWORKS, CURRICULUM_TERMS, FLASHCARD_DECKS } from '../data/vocab.js';
import {
  captureSpokenPhrase,
  computeSpeechSimilarity,
  isActivelyRecording,
  replayUserVoiceRecording,
  speakTermSequence,
  toggleTermVoiceRecording
} from '../services/audioEngine.js';
import {
  escapeHtml,
  renderCustomAudioPlayerBarHtml,
  wireCustomAudioPlayers
} from './curriculumAndQuiz.js';
import { getMilestoneForDeck, getUnlockedVocabularyDecks } from './learningPathAndCulture.js';

export function renderFlashcardDecksGrid(container, ctx) {
  if (!container) return;
  const dueCount = ctx.actions.getSmartReviewCount();
  const entries = Object.entries(FLASHCARD_DECKS);
  const unlockedSet = getUnlockedVocabularyDecks(ctx);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:0.9rem;">
      <div class="km-meta-line">${unlockedSet.size} / ${entries.length} Decks Unlocked via Learning Path · Swipe Right (Known) / Left (Review) · Speak-Along</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="km-btn km-btn-sm km-btn-primary" id="fcSmartReviewBtn">
          <i class="fas fa-brain"></i> Smart Review (${dueCount} due)
        </button>
        <button type="button" class="km-btn km-btn-sm km-btn-emerald" id="fcHandsFreeLaunchBtn">
          <i class="fas fa-headphones"></i> Hands-Free Loop
        </button>
      </div>
    </div>

    <div class="km-vocab-grid">
      ${entries.map(([key, deck]) => {
        const isUnlocked = unlockedSet.has(key);
        const milestone = getMilestoneForDeck(key);
        return `
          <article class="km-vocab-card ${isUnlocked ? '' : 'is-deck-locked'}" style="padding:0; overflow:hidden; ${isUnlocked ? '' : 'opacity:0.86;'}">
            <img src="${escapeHtml(deck.image || ARTWORKS.dictionary)}" alt="${escapeHtml(deck.title)}" referrerpolicy="no-referrer" style="width:100%; height:124px; object-fit:cover; ${isUnlocked ? '' : 'filter:grayscale(0.35);'}">
            <div style="padding:0.9rem; display:flex; flex-direction:column; gap:0.35rem; flex:1;">
              <div class="km-meta-line">${escapeHtml(deck.level)} · ${deck.cards.length} cards · ${isUnlocked ? 'Unlocked' : `Unlocks Stage ${milestone.step}`}</div>
              <strong style="font-size:0.98rem;">${escapeHtml(deck.title)}</strong>
              <div style="margin-top:auto; padding-top:0.5rem;">
                ${isUnlocked ? `
                  <button type="button" class="km-btn km-btn-sm km-btn-primary" style="width:100%;" data-fc-deck="${escapeHtml(key)}">
                    <i class="fas fa-play"></i> Open Deck
                  </button>
                ` : `
                  <button type="button" class="km-btn km-btn-sm" style="width:100%;" data-fc-unlock-path="${escapeHtml(milestone.id)}">
                    <i class="fas fa-lock"></i> Unlock on Learning Path (Stage ${milestone.step})
                  </button>
                `}
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  container.querySelector('#fcSmartReviewBtn')?.addEventListener('click', () => ctx.actions.openSmartReview());
  container.querySelector('#fcHandsFreeLaunchBtn')?.addEventListener('click', () => ctx.actions.openHandsFree(true));
  container.querySelectorAll('[data-fc-deck]').forEach((btn) => {
    btn.addEventListener('click', () => ctx.actions.openFlashcards(btn.getAttribute('data-fc-deck')));
  });
  container.querySelectorAll('[data-fc-unlock-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.selectedPathId = btn.getAttribute('data-fc-unlock-path');
      ctx.actions.jumpToAccordion('acc-path');
    });
  });
}

export function getMergedDictionaryEntries(ctx) {
  const map = new Map();
  const add = (entry) => {
    const key = String(entry.word || '').trim().toLowerCase();
    if (!key || map.has(key)) return;
    map.set(key, entry);
  };

  (ctx.cloud.dictionary || []).forEach((d) =>
    add({
      id: `cloud-${d.id}`,
      word: d.word,
      pos: d.pos || 'Noun',
      pronounce: d.pronounce || '',
      en: d.en,
      fr: d.fr,
      level: d.level || 'beginner',
      explanation: d.explanation || '',
      funFact: d.funFact || '',
      example: d.example || '',
      image: d.imageUrl || ARTWORKS.dictionary,
      isAdmin: true
    })
  );

  Object.values(CURRICULUM_TERMS).flat().forEach((t) =>
    add({
      id: t.id,
      word: t.word,
      pos: t.pos,
      pronounce: t.pronounce,
      en: t.en,
      fr: t.fr,
      level: 'beginner',
      explanation: t.definition,
      funFact: t.collocations,
      example: t.example,
      image: ARTWORKS.dictionary
    })
  );

  Object.entries(FLASHCARD_DECKS).forEach(([dkKey, dk]) => {
    dk.cards.forEach((c, idx) =>
      add({
        id: `dict-${dkKey}-${idx}`,
        word: c.word,
        pos: c.pos,
        pronounce: c.pronounce,
        en: c.en,
        fr: c.fr,
        level: c.level || dk.level || 'beginner',
        explanation: c.explanation || c.definition,
        funFact: c.funFact || '',
        example: c.ex,
        image: c.image || dk.image || ARTWORKS.dictionary
      })
    );
  });

  return Array.from(map.values());
}

export function renderDictionarySection(container, ctx) {
  if (!container) return;
  const q = (ctx.state.dictSearch || '').trim().toLowerCase();
  const lvl = ctx.state.dictLevel || 'all';
  const all = getMergedDictionaryEntries(ctx);

  const filtered = all.filter((e) => {
    if (lvl !== 'all' && e.level !== lvl) return false;
    if (!q) return true;
    return `${e.word} ${e.en} ${e.fr} ${e.explanation} ${e.example}`.toLowerCase().includes(q);
  });

  const shown = filtered.slice(0, ctx.state.dictLimit || 12);

  container.innerHTML = `
    <div style="display:flex; gap:0.55rem; flex-wrap:wrap; align-items:center; margin-bottom:0.85rem;">
      <input type="search" id="dictSearchInput" class="km-input" style="flex:1; min-width:210px;"
        value="${escapeHtml(ctx.state.dictSearch || '')}"
        placeholder="Search Martinican Creole word, English, or French...">
      <select id="dictLevelSelect" class="km-select" style="width:auto; min-width:155px;" aria-label="Filter dictionary by difficulty">
        <option value="all" ${lvl === 'all' ? 'selected' : ''}>All Levels (${all.length})</option>
        <option value="beginner" ${lvl === 'beginner' ? 'selected' : ''}>Beginner</option>
        <option value="intermediate" ${lvl === 'intermediate' ? 'selected' : ''}>Intermediate</option>
        <option value="advanced" ${lvl === 'advanced' ? 'selected' : ''}>Advanced</option>
        <option value="master" ${lvl === 'master' ? 'selected' : ''}>Master Elder</option>
      </select>
    </div>

    <div class="km-meta-line">Showing ${shown.length} of ${filtered.length} curated GEREC entries</div>

    <div class="km-dict-grid">
      ${shown.map((e) => `
        <article class="km-vocab-card" style="padding:0; overflow:hidden;">
          <img src="${escapeHtml(e.image)}" alt="${escapeHtml(e.word)}" referrerpolicy="no-referrer" style="width:100%; height:112px; object-fit:cover;">
          <div style="padding:0.88rem; display:flex; flex-direction:column; gap:0.35rem; flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <div class="km-meta-line">${escapeHtml(e.pos)} · ${escapeHtml(e.level)}${e.isAdmin ? ' · Studio' : ''}</div>
                <strong style="font-size:1.06rem; color:var(--ink-primary);">${escapeHtml(e.word)}</strong>
                ${e.pronounce ? `<div class="km-meta-line km-mono">${escapeHtml(e.pronounce)}</div>` : ''}
              </div>
            </div>
            ${renderCustomAudioPlayerBarHtml(e.id, e.word, e.example, ctx.settings)}
            <div style="font-weight:700; font-size:0.9rem;">${escapeHtml(e.en)} <span class="km-meta-line">· ${escapeHtml(e.fr)}</span></div>
            ${e.explanation ? `<div style="font-size:0.82rem; color:var(--ink-secondary);">${escapeHtml(e.explanation)}</div>` : ''}
            ${e.example ? `<div style="font-size:0.81rem; font-style:italic; color:var(--cobalt);">« ${escapeHtml(e.example)} »</div>` : ''}
            ${e.funFact ? `<div class="km-meta-line" style="margin-top:auto;">Heritage: ${escapeHtml(e.funFact)}</div>` : ''}
          </div>
        </article>
      `).join('')}
    </div>

    ${filtered.length > shown.length ? `
      <div style="margin-top:1rem; text-align:center;">
        <button type="button" class="km-btn" id="dictLoadMoreBtn">Show 12 More Words (${filtered.length - shown.length} remaining)</button>
      </div>
    ` : ''}
  `;

  const dictTracks = new Map();
  shown.forEach((e) => {
    dictTracks.set(e.id, {
      text: e.word,
      exampleText: e.example || '',
      translationText: ctx.state.lang === 'fr' ? e.fr : e.en
    });
  });
  wireCustomAudioPlayers(container, dictTracks, ctx);

  const sInput = container.querySelector('#dictSearchInput');
  if (sInput) {
    sInput.addEventListener('input', (ev) => {
      ctx.state.dictSearch = ev.target.value;
      ctx.state.dictLimit = 12;
      const pos = ev.target.selectionStart;
      renderDictionarySection(container, ctx);
      const next = container.querySelector('#dictSearchInput');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });
  }

  container.querySelector('#dictLevelSelect')?.addEventListener('change', (ev) => {
    ctx.state.dictLevel = ev.target.value;
    ctx.state.dictLimit = 12;
    renderDictionarySection(container, ctx);
  });

  container.querySelector('#dictLoadMoreBtn')?.addEventListener('click', () => {
    ctx.state.dictLimit = (ctx.state.dictLimit || 12) + 12;
    renderDictionarySection(container, ctx);
  });
}

// =========================================================
// FLASHCARD MODAL (SWIPE, SPEAK-ALONG, EXPLANATIONS, VOICE)
// =========================================================
export function getActiveFlashcardList(ctx) {
  if (ctx.state.fcDeckKey === '__smart__') {
    const dueCards = [];
    Object.entries(FLASHCARD_DECKS).forEach(([dKey, deck]) => {
      deck.cards.forEach((card, i) => {
        const tid = `fc-${dKey}-${i}`;
        const st = ctx.actions.getTermStats(tid);
        if (st.wrong > 0 || st.almost > 0 || st.memory < 70 || dueCards.length < 10) {
          dueCards.push({ ...card, _deckTitle: 'Smart Spaced Review', _tid: tid, _deckImage: deck.image });
        }
      });
    });
    return dueCards.slice(0, 20);
  }
  const deck = FLASHCARD_DECKS[ctx.state.fcDeckKey] || FLASHCARD_DECKS.greetings;
  return deck.cards.map((card, i) => ({
    ...card,
    _deckTitle: deck.title,
    _tid: `fc-${ctx.state.fcDeckKey}-${i}`,
    _deckImage: deck.image
  }));
}

export function renderFlashcardModal(backdrop, ctx) {
  if (!backdrop) return;
  const list = getActiveFlashcardList(ctx);
  if (!list.length) return;
  if (ctx.state.fcIndex >= list.length) ctx.state.fcIndex = 0;
  if (ctx.state.fcIndex < 0) ctx.state.fcIndex = 0;

  const card = list[ctx.state.fcIndex];
  const s = ctx.settings;
  const lang = ctx.state.lang;
  const primaryTrans = lang === 'fr' ? card.fr : card.en;
  const stats = ctx.actions.getTermStats(card._tid);
  const isRec = isActivelyRecording(card._tid);
  const recMeta = ctx.recordedMeta[card._tid];
  const swipeFb = ctx.state.fcSwipeFeedback;
  const speakCue = ctx.state.fcSpeakAlongCue;

  backdrop.innerHTML = `
    <div class="km-modal-card" role="dialog" aria-modal="true" aria-label="Interactive Flashcard Study">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <div>
          <strong style="font-size:1.08rem;">${escapeHtml(card._deckTitle)}</strong>
          <div class="km-meta-line km-mono">Card ${ctx.state.fcIndex + 1} / ${list.length} · Drag or Swipe Right / Left</div>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="fcCloseBtn" aria-label="Close flashcards"><i class="fas fa-times"></i></button>
      </div>

      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:0.65rem;">
        <select id="fcDeckSelect" class="km-select" style="flex:1; min-width:180px;">
          <option value="__smart__" ${ctx.state.fcDeckKey === '__smart__' ? 'selected' : ''}>Smart Spaced Review Queue</option>
          ${Object.entries(FLASHCARD_DECKS).map(([k, d]) => {
            const isUnl = getUnlockedVocabularyDecks(ctx).has(k);
            const ms = getMilestoneForDeck(k);
            return `<option value="${escapeHtml(k)}" ${ctx.state.fcDeckKey === k ? 'selected' : ''} ${isUnl ? '' : 'disabled'}>${isUnl ? '' : '🔒 '}${escapeHtml(d.title)} (${d.cards.length})${isUnl ? '' : ` — Stage ${ms.step}`}</option>`;
          }).join('')}
        </select>
        <button type="button" class="km-btn km-btn-sm ${ctx.state.fcSpeakAlongActive ? 'km-btn-emerald' : ''}" id="fcSpeakAlongBtn">
          <i class="fas fa-microphone-lines"></i> ${ctx.state.fcSpeakAlongActive ? 'Speak-Along: Active' : 'Speak-Along Mode'}
        </button>
      </div>

      <div class="km-fc-art-stage">
        <img src="${escapeHtml(card.image || card._deckImage || ARTWORKS.greetings)}" alt="${escapeHtml(card.word)}" referrerpolicy="no-referrer">
        <div class="km-fc-art-caption">${escapeHtml(card.word)} · ${escapeHtml(card.en)}</div>
      </div>

      <div class="km-fc-face" id="fcSwipeSurface" tabindex="0">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap;">
          <div>
            ${s.partOfSpeech ? `<div class="km-meta-line">${escapeHtml(card.pos || 'Term')} · ${escapeHtml(card.level || 'beginner')}</div>` : ''}
            <h2 style="font-size:1.95rem; margin-top:0.15rem;">${escapeHtml(card.word)}</h2>
            ${s.pronunciation ? `<div class="km-meta-line km-mono">${escapeHtml(card.pronounce)}</div>` : ''}
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="km-btn km-btn-sm ${isRec ? 'playing' : recMeta ? 'recorded' : ''}" id="fcRecBtn" title="Record pronunciation">
              ${isRec ? '<span class="km-live-mic-dot"></span> Stop' : '<i class="fas fa-microphone"></i>'}
            </button>
            ${recMeta ? `<button type="button" class="km-btn km-btn-sm" id="fcReplayBtn" title="Play saved voice"><i class="fas fa-play"></i></button>` : ''}
          </div>
        </div>

        <div style="margin-top:0.75rem;">
          ${renderCustomAudioPlayerBarHtml(card._tid, card.word, s.example && card.ex ? card.ex : '', s)}
        </div>

        ${ctx.state.fcFlipped ? `
          <div style="margin-top:0.95rem; padding-top:0.85rem; border-top:1px solid var(--hairline); display:flex; flex-direction:column; gap:0.4rem;">
            <div style="font-size:1.12rem; font-weight:700; color:var(--emerald);">${escapeHtml(card.en)} <span class="km-meta-line">· ${escapeHtml(card.fr)}</span></div>
            ${s.otherTranslations && card.other ? `<div style="font-size:0.86rem; color:var(--ink-secondary);"><strong>Other nuances:</strong> ${escapeHtml(card.other)}</div>` : ''}
            ${s.definition && card.definition ? `<div style="font-size:0.86rem; color:var(--ink-secondary);">${escapeHtml(card.definition)}</div>` : ''}
            ${s.example && card.ex ? `<div style="font-size:0.9rem; font-style:italic; color:var(--cobalt);">« ${escapeHtml(card.ex)} »</div>` : ''}
            ${s.exampleTranslation && card.exTrans ? `<div style="font-size:0.83rem; color:var(--ink-muted);">${escapeHtml(card.exTrans)}</div>` : ''}
            ${s.synonymsAntonyms ? `<div class="km-meta-line">Synonyms: ${escapeHtml(card.syn || '—')} · Opposites: ${escapeHtml(card.ant || '—')}</div>` : ''}
            ${s.collocations && card.coll ? `<div class="km-meta-line">Collocations: ${escapeHtml(card.coll)}</div>` : ''}
          </div>
        ` : `
          <div style="margin-top:1.15rem; font-size:0.88rem; color:var(--ink-secondary);">
            Tap card or press <kbd>Space</kbd> to reveal translations, example dialogue, and cultural nuance.
          </div>
        `}
      </div>

      ${speakCue ? `
        <div role="status" aria-live="polite" style="margin-top:0.75rem; padding:0.78rem 0.95rem; border-radius:12px; background:${speakCue.matched ? 'var(--emerald-soft)' : 'var(--ochre-soft)'}; color:var(--ink-primary); font-weight:600; font-size:0.9rem;">
          ${speakCue.matched ? '✅ <strong>Matches!</strong>' : '🔁 <strong>No-Match — Keep Practicing:</strong>'} ${escapeHtml(speakCue.message)}
        </div>
      ` : ''}

      ${swipeFb ? `
        <div role="status" aria-live="polite" style="margin-top:0.75rem; padding:0.82rem 0.95rem; border-radius:12px; background:${swipeFb.outcome === 'right' ? 'var(--emerald-soft)' : swipeFb.outcome === 'almost' ? 'var(--ochre-soft)' : 'var(--crimson-soft)'};">
          <div style="font-weight:700; font-size:0.92rem;">${escapeHtml(swipeFb.headline)}</div>
          <div style="font-size:0.85rem; color:var(--ink-secondary); margin-top:3px;"><strong>Explanation:</strong> ${escapeHtml(card.explanation || card.definition)}</div>
          ${card.funFact ? `<div style="font-size:0.82rem; color:var(--ink-primary); margin-top:3px;"><strong>Fun Fact:</strong> ${escapeHtml(card.funFact)}</div>` : ''}
        </div>
      ` : ''}

      ${s.memoryBar || s.learningStats ? `
        <div style="margin-top:0.75rem;">
          ${s.memoryBar ? `<div class="km-progress-track" style="height:6px;"><div class="km-progress-fill" style="width:${stats.memory}%;"></div></div>` : ''}
          ${s.learningStats ? `<div class="km-meta-line km-mono" style="margin-top:4px;">Memory ${stats.memory}% · Right ${stats.right} · Almost ${stats.almost} · Wrong ${stats.wrong}</div>` : ''}
        </div>
      ` : ''}

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; margin-top:0.85rem;">
        <button type="button" class="km-btn" id="fcWrongBtn" style="border-color:var(--crimson); color:var(--crimson);">← Review (+3 Pts)</button>
        <button type="button" class="km-btn" id="fcAlmostBtn" style="border-color:var(--ochre); color:var(--ochre);">Almost (+5 Pts)</button>
        <button type="button" class="km-btn km-btn-emerald" id="fcRightBtn">Got It! → (+8 Pts)</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:0.75rem;">
        <button type="button" class="km-btn km-btn-sm" id="fcPrevCardBtn" ${ctx.state.fcIndex === 0 ? 'disabled' : ''}><i class="fas fa-arrow-left"></i> Previous</button>
        <button type="button" class="km-btn km-btn-sm" id="fcFlipBtn"><i class="fas fa-rotate"></i> Flip Card</button>
        <button type="button" class="km-btn km-btn-sm" id="fcNextCardBtn" ${ctx.state.fcIndex >= list.length - 1 ? 'disabled' : ''}>Next <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;

  // Register reviewed card
  ctx.actions.markCardReviewed(card._tid);

  backdrop.querySelector('#fcCloseBtn')?.addEventListener('click', () => ctx.actions.closeFlashcards());
  backdrop.querySelector('#fcDeckSelect')?.addEventListener('change', (e) => {
    ctx.state.fcDeckKey = e.target.value;
    ctx.state.fcIndex = 0;
    ctx.state.fcFlipped = false;
    ctx.state.fcSwipeFeedback = null;
    ctx.state.fcSpeakAlongCue = null;
    renderFlashcardModal(backdrop, ctx);
  });

  const fcTracks = new Map([
    [card._tid, {
      text: card.word,
      exampleText: s.example && card.ex ? card.ex : '',
      translationText: primaryTrans
    }]
  ]);
  wireCustomAudioPlayers(backdrop, fcTracks, ctx);

  backdrop.querySelector('#fcRecBtn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleTermVoiceRecording(card._tid, {
      onSaved: (id, sec) => {
        ctx.actions.saveVoiceMeta(id, sec);
        ctx.actions.notify('Voice saved for comparison!');
        renderFlashcardModal(backdrop, ctx);
      },
      onError: (msg) => ctx.actions.notify(msg)
    });
    renderFlashcardModal(backdrop, ctx);
  });

  backdrop.querySelector('#fcReplayBtn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.currentTarget.classList.add('playing');
    await replayUserVoiceRecording(card._tid, {
      onDone: () => renderFlashcardModal(backdrop, ctx)
    });
  });

  // Speak-Along: TTS -> Pause -> SpeechRecognition -> Matches / No-Match
  backdrop.querySelector('#fcSpeakAlongBtn')?.addEventListener('click', () => {
    ctx.state.fcSpeakAlongActive = !ctx.state.fcSpeakAlongActive;
    if (!ctx.state.fcSpeakAlongActive) {
      ctx.state.fcSpeakAlongCue = null;
      renderFlashcardModal(backdrop, ctx);
      return;
    }
    ctx.state.fcSpeakAlongCue = { matched: true, message: 'Listening cleanly after voice prompt...' };
    renderFlashcardModal(backdrop, ctx);
    speakTermSequence(card.word, '', {
      settings: { ...ctx.settings, translationPlayback: false },
      lang: ctx.state.lang,
      onFinished: () => {
        if (!ctx.state.fcSpeakAlongActive) return;
        setTimeout(async () => {
          const res = await captureSpokenPhrase({ lang: 'fr-FR', timeoutMs: 4200 });
          if (!res.supported) {
            ctx.state.fcSpeakAlongCue = {
              matched: true,
              message: 'Practiced aloud! Speech Recognition is limited on this browser, so self-record to compare.'
            };
            ctx.actions.playSfx('almost');
          } else if (!res.transcript) {
            ctx.state.fcSpeakAlongCue = {
              matched: false,
              message: `No speech detected for "${card.word}". Listen and repeat clearly.`
            };
            ctx.actions.playSfx('wrong');
          } else {
            const score = computeSpeechSimilarity(res.transcript, card.word);
            const matched = score >= 55;
            ctx.state.fcSpeakAlongCue = {
              matched,
              message: `${score}% match — heard "${res.transcript}".`
            };
            ctx.actions.playSfx(matched ? 'right' : 'wrong');
            if (matched) ctx.actions.awardXp(8, `Speak-Along Match on "${card.word}" (+8 XP)`);
          }
          renderFlashcardModal(backdrop, ctx);
        }, 350);
      }
    });
  });

  // Flip & Touch Swipe
  const faceEl = backdrop.querySelector('#fcSwipeSurface');
  let dragStartX = null;
  if (faceEl) {
    faceEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, input, .km-audio-player')) return;
      dragStartX = e.clientX;
    });
    faceEl.addEventListener('pointerup', (e) => {
      if (e.target.closest('button, input, .km-audio-player')) return;
      if (dragStartX !== null) {
        const dx = e.clientX - dragStartX;
        dragStartX = null;
        if (dx > 60) {
          handleSwipeGrade('right');
          return;
        }
        if (dx < -60) {
          handleSwipeGrade('wrong');
          return;
        }
      }
      ctx.state.fcFlipped = !ctx.state.fcFlipped;
      renderFlashcardModal(backdrop, ctx);
    });
  }

  const handleSwipeGrade = (outcome) => {
    ctx.actions.gradeFlashcardTerm(card._tid, outcome);
    const headlines = {
      right: 'Got It! (+8 Collection Pts · +6 XP)',
      almost: 'Almost! Scheduled for soon review (+5 Collection Pts)',
      wrong: 'Marked for Spaced Review (+3 Collection Pts)'
    };
    ctx.state.fcSwipeFeedback = { outcome, headline: headlines[outcome] };
    ctx.state.fcFlipped = true;
    renderFlashcardModal(backdrop, ctx);
  };

  backdrop.querySelector('#fcWrongBtn')?.addEventListener('click', () => handleSwipeGrade('wrong'));
  backdrop.querySelector('#fcAlmostBtn')?.addEventListener('click', () => handleSwipeGrade('almost'));
  backdrop.querySelector('#fcRightBtn')?.addEventListener('click', () => handleSwipeGrade('right'));
  backdrop.querySelector('#fcFlipBtn')?.addEventListener('click', () => {
    ctx.state.fcFlipped = !ctx.state.fcFlipped;
    renderFlashcardModal(backdrop, ctx);
  });
  backdrop.querySelector('#fcPrevCardBtn')?.addEventListener('click', () => {
    if (ctx.state.fcIndex > 0) {
      ctx.state.fcIndex -= 1;
      ctx.state.fcFlipped = false;
      ctx.state.fcSwipeFeedback = null;
      ctx.state.fcSpeakAlongCue = null;
      renderFlashcardModal(backdrop, ctx);
    }
  });
  backdrop.querySelector('#fcNextCardBtn')?.addEventListener('click', () => {
    if (ctx.state.fcIndex < list.length - 1) {
      ctx.state.fcIndex += 1;
      ctx.state.fcFlipped = false;
      ctx.state.fcSwipeFeedback = null;
      ctx.state.fcSpeakAlongCue = null;
      renderFlashcardModal(backdrop, ctx);
    }
  });
}

// =========================================================
// HANDS-FREE IMMERSION PLAYER
// =========================================================
export function renderHandsFreeModal(backdrop, ctx) {
  if (!backdrop) return;
  const deck = FLASHCARD_DECKS[ctx.state.hfDeckKey] || FLASHCARD_DECKS.greetings;
  const cards = deck.cards;
  if (ctx.state.hfIndex >= cards.length) ctx.state.hfIndex = 0;
  const card = cards[ctx.state.hfIndex];
  const lang = ctx.state.lang;
  const trans = lang === 'fr' ? card.fr : card.en;

  backdrop.innerHTML = `
    <div class="km-modal-card" role="dialog" aria-modal="true" aria-label="Hands-Free Immersion">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <strong style="font-size:1.1rem;"><i class="fas fa-headphones" style="color:var(--cobalt);"></i> Hands-Free Creole Audio Loop</strong>
          <div class="km-meta-line km-mono">${escapeHtml(deck.title)} · ${ctx.state.hfIndex + 1} / ${cards.length}</div>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="hfCloseBtn" aria-label="Close hands-free modal"><i class="fas fa-times"></i></button>
      </div>

      <select id="hfDeckSelect" class="km-select" style="margin-top:0.85rem;">
        ${Object.entries(FLASHCARD_DECKS).map(([k, d]) => `<option value="${escapeHtml(k)}" ${ctx.state.hfDeckKey === k ? 'selected' : ''}>${escapeHtml(d.title)}</option>`).join('')}
      </select>

      <div class="km-subpanel" style="text-align:center; margin:0.95rem 0; padding:1.4rem;">
        <div class="km-creole-head" style="font-size:1.85rem;">${escapeHtml(card.word)}</div>
        <div class="km-meta-line km-mono">${escapeHtml(card.pronounce)}</div>
        <div style="font-weight:700; font-size:1.05rem; margin-top:0.35rem; color:var(--cobalt);">${escapeHtml(trans)}</div>
        <div style="font-size:0.88rem; color:var(--ink-secondary); font-style:italic; margin-top:0.35rem;">« ${escapeHtml(card.ex)} »</div>
      </div>

      <div style="display:flex; justify-content:center; align-items:center; gap:0.75rem; flex-wrap:wrap;">
        <button type="button" class="km-btn" id="hfPrevBtn"><i class="fas fa-backward-step"></i> Prev</button>
        <button type="button" class="km-btn ${ctx.state.hfPlaying ? 'km-btn-emerald' : 'km-btn-primary'}" id="hfPlayLoopBtn">
          <i class="fas ${ctx.state.hfPlaying ? 'fa-pause' : 'fa-play'}"></i>
          ${ctx.state.hfPlaying ? 'Pause Loop' : 'Start Audio Loop'}
        </button>
        <button type="button" class="km-btn" id="hfNextBtn">Next <i class="fas fa-forward-step"></i></button>
      </div>

      <div style="text-align:center; margin-top:0.85rem;">
        <button type="button" class="km-btn km-btn-sm ${ctx.state.hfVoiceCmds ? 'active' : ''}" id="hfVoiceCmdToggle">
          <i class="fas fa-microphone"></i> Voice Commands ("Next" / "Back" / "Stop"): ${ctx.state.hfVoiceCmds ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  `;

  backdrop.querySelector('#hfCloseBtn')?.addEventListener('click', () => ctx.actions.openHandsFree(false));
  backdrop.querySelector('#hfDeckSelect')?.addEventListener('change', (e) => {
    ctx.state.hfDeckKey = e.target.value;
    ctx.state.hfIndex = 0;
    renderHandsFreeModal(backdrop, ctx);
  });
  backdrop.querySelector('#hfPrevBtn')?.addEventListener('click', () => {
    ctx.state.hfIndex = (ctx.state.hfIndex - 1 + cards.length) % cards.length;
    renderHandsFreeModal(backdrop, ctx);
    ctx.actions.speakHandsFreeCurrent();
  });
  backdrop.querySelector('#hfNextBtn')?.addEventListener('click', () => {
    ctx.state.hfIndex = (ctx.state.hfIndex + 1) % cards.length;
    renderHandsFreeModal(backdrop, ctx);
    ctx.actions.speakHandsFreeCurrent();
  });
  backdrop.querySelector('#hfPlayLoopBtn')?.addEventListener('click', () => ctx.actions.toggleHandsFreeLoop());
  backdrop.querySelector('#hfVoiceCmdToggle')?.addEventListener('click', () => ctx.actions.toggleHfVoiceCommands());
}
