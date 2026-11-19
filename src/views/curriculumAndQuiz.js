import {
  AUDIO_QUIZ_BANK,
  HERITAGE_MODULES,
  SPEAKING_PRACTICE_PHRASES,
  WORD_OF_THE_DAY_LIST
} from '../data/curriculum.js';
import {
  CURRICULUM_TERMS,
  FLASHCARD_DECKS,
  FUN_FACTS_CATALOG,
  LEARNING_LEVELS,
  MICRO_LESSONS
} from '../data/vocab.js';
import {
  captureSpokenPhrase,
  computeSpeechSimilarity,
  isActivelyRecording,
  replayUserVoiceRecording,
  speakTermSequence,
  toggleTermVoiceRecording
} from '../services/audioEngine.js';

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sanitizeRichHtml(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${rawHtml || ''}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';
  root.querySelectorAll('script,style,iframe,object,embed,link').forEach((el) => el.remove());
  root.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const n = attr.name.toLowerCase();
      const v = attr.value.toLowerCase().trim();
      if (n.startsWith('on') || (v.startsWith('javascript:') && (n === 'href' || n === 'src'))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return root.innerHTML;
}

export function renderWordOfTheDayWidget(container, ctx) {
  if (!container) return;
  const item = WORD_OF_THE_DAY_LIST[ctx.state.wotdIdx % WORD_OF_THE_DAY_LIST.length];
  const lang = ctx.state.lang;
  const t = ctx.strings[lang] || ctx.strings.en;
  const translation = lang === 'fr' ? item.fr : item.en;

  container.innerHTML = `
    <div class="km-wotd-box" id="wotdCard">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <span class="km-meta-line">${escapeHtml(t.wotdLabel)}</span>
        <div style="display:flex; gap:6px;">
          <button type="button" class="km-btn km-btn-sm" id="wotdShuffleBtn" title="Next phrase"><i class="fas fa-shuffle"></i></button>
          <button type="button" class="km-btn km-btn-sm km-btn-primary" id="wotdListenBtn"><i class="fas fa-volume-up"></i> Listen</button>
        </div>
      </div>
      <div class="km-wotd-word" id="wotdWord">${escapeHtml(item.word)}</div>
      <div class="km-meta-line km-mono">${escapeHtml(item.pronounce)} · ${escapeHtml(translation)}</div>
      <div style="font-size:0.86rem; color:var(--ink-secondary); font-style:italic;">« ${escapeHtml(item.ex)} »</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
        <button type="button" class="km-btn km-btn-sm km-btn-emerald" id="wotdPracticeBtn">
          <i class="fas fa-check"></i> Practice (+5 XP)
        </button>
        <button type="button" class="km-btn km-btn-sm" id="wotdAskTutorBtn">
          <i class="fas fa-comments"></i> Ask Man Mayotte
        </button>
      </div>
    </div>
  `;

  container.querySelector('#wotdShuffleBtn')?.addEventListener('click', () => {
    ctx.state.wotdIdx = (ctx.state.wotdIdx + 1) % WORD_OF_THE_DAY_LIST.length;
    renderWordOfTheDayWidget(container, ctx);
  });

  container.querySelector('#wotdListenBtn')?.addEventListener('click', (e) => {
    speakTermSequence(item.word, translation, {
      settings: ctx.settings,
      lang: ctx.state.lang,
      btnEl: e.currentTarget,
      onListened: ctx.actions.registerWordListened
    });
  });

  container.querySelector('#wotdPracticeBtn')?.addEventListener('click', (e) => {
    ctx.actions.registerWordListened(item.word);
    ctx.actions.awardXp(5, `Practiced "${item.word}" (+5 XP)`);
    ctx.actions.incrementDailyGoal(1);
    ctx.actions.fireConfetti({ particleCount: 45, spread: 60 });
    e.currentTarget.disabled = true;
    e.currentTarget.innerHTML = '<i class="fas fa-check-circle"></i> Practiced';
  });

  container.querySelector('#wotdAskTutorBtn')?.addEventListener('click', () => {
    ctx.actions.openTutorWithPrompt(`Explain the meaning, pronunciation, and Martinican cultural story of "${item.word}".`);
  });
}

export function renderLevelsAndLessons(container, ctx) {
  if (!container) return;
  const xp = Number(ctx.progress.xp || 0);
  const dueCount = ctx.actions.getSmartReviewCount();
  let activeIdx = 0;
  LEARNING_LEVELS.forEach((lvl, i) => {
    if (xp >= lvl.minXp) activeIdx = i;
  });

  const mergedLessons = [
    ...ctx.cloud.lessons.map((cl) => ({
      id: cl.id,
      level: cl.level,
      duration: 'Admin Lesson',
      title: cl.title,
      creoleHook: cl.creoleSummary,
      explanationHtml: sanitizeRichHtml(cl.bodyHtml),
      funFact: cl.funFact || '',
      imageUrl: cl.imageUrl || '',
      attachmentName: cl.attachmentName || '',
      attachmentUrl: cl.attachmentUrl || '',
      practiceTerm: cl.creoleSummary,
      deck: 'greetings'
    })),
    ...MICRO_LESSONS.map((ml) => ({ ...ml }))
  ];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:0.85rem;">
      <div>
        <strong style="font-size:1.02rem;">Progression Path · <span class="km-mono">${xp} XP</span></strong>
        <div class="km-meta-line">Step through Ti-Manmay, Mawon, Bèlè, and Elder Pawòl mastery</div>
      </div>
      <button type="button" class="km-btn km-btn-primary" id="smartReviewLaunchBtn">
        <i class="fas fa-brain"></i> Smart Review (${dueCount} due)
      </button>
    </div>

    <div class="km-levels-grid">
      ${LEARNING_LEVELS.map((lvl, idx) => {
        const unlocked = xp >= lvl.minXp;
        const isCurr = idx === activeIdx;
        return `
          <div class="km-subpanel" style="display:flex; flex-direction:column; gap:0.4rem; ${isCurr ? 'border-color:var(--cobalt);' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:1.4rem;">${lvl.badge}</span>
              <span class="km-meta-line" style="color:${unlocked ? 'var(--emerald)' : 'var(--ink-muted)'};">
                ${unlocked ? (isCurr ? 'Active Tier' : 'Unlocked') : `${lvl.minXp} XP`}
              </span>
            </div>
            <strong style="font-size:0.96rem;">${escapeHtml(lvl.creoleTitle)} · ${escapeHtml(lvl.title)}</strong>
            <div style="font-size:0.83rem; color:var(--ink-secondary); flex:1;">${escapeHtml(lvl.summary)}</div>
            <button type="button" class="km-btn km-btn-sm" data-open-deck="${escapeHtml(lvl.recommendedDecks[0])}">
              <i class="fas fa-layer-group"></i> Practice Level Cards
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <h3 style="margin-top:1.35rem; font-size:1.12rem;">2-Minute Micro-Lessons</h3>
    <div class="km-vocab-grid">
      ${mergedLessons.map((ls) => `
        <article class="km-vocab-card">
          ${ls.imageUrl ? `<img src="${escapeHtml(ls.imageUrl)}" alt="${escapeHtml(ls.title)}" referrerpolicy="no-referrer" style="width:100%; height:136px; object-fit:cover; border-radius:10px;">` : ''}
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <span class="km-meta-line">${escapeHtml(ls.level)} · ${escapeHtml(ls.duration)}</span>
            <button type="button" class="km-btn km-btn-sm" data-ls-listen="${escapeHtml(ls.practiceTerm || ls.creoleHook)}">
              <i class="fas fa-volume-up"></i> Listen
            </button>
          </div>
          <strong style="font-size:1.02rem;">${escapeHtml(ls.title)}</strong>
          <div style="font-weight:700; color:var(--cobalt); font-size:0.9rem;">« ${escapeHtml(ls.creoleHook)} »</div>
          <div style="font-size:0.85rem; color:var(--ink-secondary);">${ls.explanationHtml || escapeHtml(ls.explanation)}</div>
          ${ls.funFact ? `<div style="font-size:0.8rem; color:var(--ink-primary); background:var(--cobalt-soft); padding:0.5rem 0.7rem; border-radius:9px;"><strong>Cultural Note:</strong> ${escapeHtml(ls.funFact)}</div>` : ''}
          ${ls.attachmentUrl ? `<a href="${escapeHtml(ls.attachmentUrl)}" download="${escapeHtml(ls.attachmentName || 'study-guide')}" class="km-btn km-btn-sm"><i class="fas fa-paperclip"></i> Download ${escapeHtml(ls.attachmentName || 'File')}</a>` : ''}
          <button type="button" class="km-btn km-btn-sm km-btn-primary" data-open-deck="${escapeHtml(ls.deck || 'greetings')}">
            <i class="fas fa-clone"></i> Study Matching Deck
          </button>
        </article>
      `).join('')}
    </div>

    <h3 style="margin-top:1.35rem; font-size:1.12rem;">Martinican Heritage Fun Facts</h3>
    <div class="km-vocab-grid">
      ${FUN_FACTS_CATALOG.map((ff) => `
        <article class="km-vocab-card" style="padding:0; overflow:hidden;">
          <img src="${escapeHtml(ff.image)}" alt="${escapeHtml(ff.title)}" referrerpolicy="no-referrer" style="width:100%; height:135px; object-fit:cover;">
          <div style="padding:0.9rem; display:flex; flex-direction:column; gap:0.35rem;">
            <strong>${ff.icon} ${escapeHtml(ff.title)}</strong>
            <div style="font-size:0.84rem; font-weight:700; color:var(--cobalt);">${escapeHtml(ff.creole)}</div>
            <div style="font-size:0.84rem; color:var(--ink-secondary);">${escapeHtml(ff.fact)}</div>
          </div>
        </article>
      `).join('')}
    </div>
  `;

  container.querySelector('#smartReviewLaunchBtn')?.addEventListener('click', () => ctx.actions.openSmartReview());
  container.querySelectorAll('[data-open-deck]').forEach((btn) => {
    btn.addEventListener('click', () => ctx.actions.openFlashcards(btn.getAttribute('data-open-deck')));
  });
  container.querySelectorAll('[data-ls-listen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      speakTermSequence(btn.getAttribute('data-ls-listen'), '', {
        settings: ctx.settings,
        lang: ctx.state.lang,
        btnEl: btn,
        onListened: ctx.actions.registerWordListened
      });
    });
  });
}

export function renderCurriculumAndOralLabs(container, ctx) {
  if (!container) return;
  const lang = ctx.state.lang;
  const activeModId = ctx.state.activeModule || 'module1';
  const activeLab = ctx.state.activeOralTab || 'module';
  const searchQuery = ctx.state.curriculumSearch || '';
  const modObj = HERITAGE_MODULES.find((m) => m.id === activeModId) || HERITAGE_MODULES[0];

  const rawTerms = CURRICULUM_TERMS[modObj.id] || [];
  const filteredTerms = searchQuery.trim()
    ? Object.entries(CURRICULUM_TERMS).flatMap(([mKey, list]) =>
        list
          .filter((item) => {
            const hay = `${item.word} ${item.en} ${item.fr} ${item.example} ${item.definition}`.toLowerCase();
            return hay.includes(searchQuery.trim().toLowerCase());
          })
          .map((item) => ({ ...item, moduleOrigin: mKey }))
      )
    : rawTerms;

  const isCompleted = Boolean(ctx.progress.modules?.[modObj.id]);
  const q = modObj.quiz;
  const modTitle = modObj.title[lang] || modObj.title.en;
  const modIntro = modObj.intro[lang] || modObj.intro.en;
  const challengeText = modObj.practiceChallenge[lang] || modObj.practiceChallenge.en;

  container.innerHTML = `
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
      <div class="km-seg-group" role="tablist" aria-label="Curriculum and Oral Modes">
        <button type="button" class="km-seg-btn ${activeLab === 'module' ? 'active' : ''}" data-oral-tab="module"><i class="fas fa-book-open"></i> Modules & Quiz</button>
        <button type="button" class="km-seg-btn ${activeLab === 'audio' ? 'active' : ''}" data-oral-tab="audio"><i class="fas fa-headphones"></i> Audio Listening Quiz</button>
        <button type="button" class="km-seg-btn ${activeLab === 'speaking' ? 'active' : ''}" data-oral-tab="speaking"><i class="fas fa-microphone"></i> Speaking AI Lab</button>
      </div>

      ${activeLab === 'module' ? `
        <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
          ${HERITAGE_MODULES.map((m) => `
            <button type="button" class="km-btn km-btn-sm ${m.id === activeModId ? 'active' : ''}" data-mod-select="${m.id}">
              Module ${m.num} ${ctx.progress.modules?.[m.id] ? '✓' : ''}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>

    ${activeLab === 'module' ? `
      <div class="no-print" style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:1rem;">
        <input type="search" id="curriculumSearchInput" class="km-input" style="flex:1; min-width:220px;"
          value="${escapeHtml(searchQuery)}"
          placeholder="${lang === 'fr' ? 'Rechercher dans le vocabulaire créole...' : lang === 'mq' ? 'Chaché mo kréyòl...' : 'Search vocabulary across all 3 modules (e.g. Bonjou, Colombo, Koudmen)...'}">
        <button type="button" class="km-btn km-btn-sm" id="printModuleBtn"><i class="fas fa-print"></i> Print Study Guide</button>
        <button type="button" class="km-btn km-btn-sm ${isCompleted ? 'km-btn-emerald' : 'km-btn-primary'}" id="markModuleDoneBtn">
          <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-flag-checkered'}"></i>
          ${isCompleted ? `Module ${modObj.num} Completed` : `Mark Module ${modObj.num} Complete (+30 XP)`}
        </button>
      </div>

      <div class="km-subpanel" style="margin-bottom:1rem;">
        <h3 style="font-size:1.25rem; margin-bottom:0.35rem;">${escapeHtml(modTitle)}</h3>
        <p style="font-size:0.92rem; color:var(--ink-secondary); margin-bottom:0.75rem;">${escapeHtml(modIntro)}</p>
        <div style="background:var(--surface-subtle); padding:0.75rem 0.9rem; border-radius:10px; font-size:0.86rem;">
          <strong>${escapeHtml(modObj.grammarTitle)}:</strong>
          <ul style="margin:0.35rem 0 0 1.2rem;">
            ${modObj.grammarNotes.map((n) => `<li>${n}</li>`).join('')}
          </ul>
        </div>
      </div>

      ${searchQuery ? `<div class="km-meta-line" style="margin-bottom:0.5rem;">Showing ${filteredTerms.length} matching vocabulary term(s)</div>` : ''}

      <div class="km-vocab-grid" id="moduleVocabGrid">
        ${filteredTerms.map((term) => renderTermStudyCardHtml(term, ctx)).join('')}
      </div>

      <div class="km-subpanel no-print" style="margin-top:1.15rem;">
        <div style="font-weight:700; font-size:0.94rem; margin-bottom:0.25rem;"><i class="fas fa-microphone-lines" style="color:var(--cobalt);"></i> Oral Practice Challenge</div>
        <div style="font-size:0.88rem; color:var(--ink-secondary);">${escapeHtml(challengeText)}</div>
      </div>

      <div class="km-subpanel no-print" style="margin-top:1rem;" id="quizContainerBox">
        <div class="km-meta-line">Module ${modObj.num} Check · Keyboard accessible (↑ ↓ arrows + Enter)</div>
        <h4 style="font-size:1.08rem; margin-top:0.3rem;">${escapeHtml(q.question[lang] || q.question.en)}</h4>
        <div class="km-quiz-options" role="radiogroup" aria-label="Module quiz options">
          ${q.options.map((opt) => `
            <button type="button" class="km-quiz-option" role="radio" aria-checked="false" data-quiz-id="${q.id}" data-correct="${opt.correct ? 'true' : 'false'}">
              <span><strong>${opt.letter}.</strong> ${escapeHtml(opt[lang] || opt.en)}</span>
              <span class="quiz-opt-status"></span>
            </button>
          `).join('')}
        </div>
        <div id="moduleQuizFeedback" role="status" aria-live="polite" style="display:none; margin-top:0.85rem; padding:0.8rem; border-radius:10px; font-size:0.9rem;"></div>
      </div>
    ` : activeLab === 'audio' ? renderAudioQuizHtml(ctx) : renderSpeakingLabHtml(ctx)}
  `;

  // Wire oral tab toggles
  container.querySelectorAll('[data-oral-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.activeOralTab = btn.getAttribute('data-oral-tab');
      renderCurriculumAndOralLabs(container, ctx);
    });
  });

  // Module switcher
  container.querySelectorAll('[data-mod-select]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.activeModule = btn.getAttribute('data-mod-select');
      ctx.state.curriculumSearch = '';
      renderCurriculumAndOralLabs(container, ctx);
    });
  });

  // Search input
  const searchInput = container.querySelector('#curriculumSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      ctx.state.curriculumSearch = e.target.value;
      const pos = e.target.selectionStart;
      renderCurriculumAndOralLabs(container, ctx);
      const nextInput = container.querySelector('#curriculumSearchInput');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(pos, pos);
      }
    });
  }

  // Print & Module Completion
  container.querySelector('#printModuleBtn')?.addEventListener('click', () => {
    ctx.actions.notify(`Preparing print study guide for Module ${modObj.num}...`);
    setTimeout(() => window.print(), 200);
  });

  container.querySelector('#markModuleDoneBtn')?.addEventListener('click', () => {
    ctx.actions.toggleModuleComplete(modObj.id);
    renderCurriculumAndOralLabs(container, ctx);
  });

  // Wire term Listen / Record / Replay buttons
  wireVocabCardActions(container, ctx, () => renderCurriculumAndOralLabs(container, ctx));

  // Wire Quiz options + Keyboard Arrows/Enter
  const quizOptions = Array.from(container.querySelectorAll('.km-quiz-option'));
  quizOptions.forEach((optEl, idx) => {
    optEl.addEventListener('click', () => {
      const isCorrect = optEl.getAttribute('data-correct') === 'true';
      quizOptions.forEach((o) => {
        o.classList.remove('correct', 'incorrect');
        o.setAttribute('aria-checked', 'false');
        const st = o.querySelector('.quiz-opt-status');
        if (st) st.innerHTML = '';
      });
      optEl.setAttribute('aria-checked', 'true');
      const fb = container.querySelector('#moduleQuizFeedback');

      if (isCorrect) {
        optEl.classList.add('correct');
        optEl.querySelector('.quiz-opt-status').innerHTML = '<i class="fas fa-check-circle"></i>';
        ctx.actions.playSfx('right');
        ctx.actions.fireConfetti();
        ctx.actions.completeQuiz(q.id);
        if (fb) {
          fb.style.display = 'block';
          fb.style.background = 'var(--emerald-soft)';
          fb.style.color = 'var(--ink-primary)';
          fb.innerHTML = q.explanationCorrect;
        }
      } else {
        optEl.classList.add('incorrect');
        optEl.querySelector('.quiz-opt-status').innerHTML = '<i class="fas fa-times-circle"></i>';
        const rightBtn = quizOptions.find((o) => o.getAttribute('data-correct') === 'true');
        if (rightBtn) rightBtn.classList.add('correct');
        ctx.actions.playSfx('wrong');
        if (fb) {
          fb.style.display = 'block';
          fb.style.background = 'var(--crimson-soft)';
          fb.style.color = 'var(--ink-primary)';
          fb.innerHTML = q.explanationWrong;
        }
      }
    });

    optEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        quizOptions[(idx + 1) % quizOptions.length].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        quizOptions[(idx - 1 + quizOptions.length) % quizOptions.length].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        optEl.click();
      }
    });
  });

  // Wire Audio Listening Quiz
  if (activeLab === 'audio') {
    wireAudioQuizHandlers(container, ctx);
  }
  // Wire Speaking Lab
  if (activeLab === 'speaking') {
    wireSpeakingLabHandlers(container, ctx);
  }
}

function renderTermStudyCardHtml(term, ctx) {
  const s = ctx.settings;
  const lang = ctx.state.lang;
  const primaryTrans = lang === 'fr' ? term.fr : term.en;
  const isRecActive = isActivelyRecording(term.id);
  const recMeta = ctx.recordedMeta[term.id];
  const stats = ctx.actions.getTermStats(term.id);

  return `
    <article class="km-vocab-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div>
          ${s.partOfSpeech ? `<div class="km-meta-line">${escapeHtml(term.pos)}${term.moduleOrigin ? ` · ${escapeHtml(term.moduleOrigin)}` : ''}</div>` : ''}
          <div class="km-creole-head">${escapeHtml(term.word)}</div>
          ${s.pronunciation ? `<div class="km-meta-line km-mono">${escapeHtml(term.pronounce)}</div>` : ''}
        </div>
        <div class="no-print" style="display:flex; gap:5px; flex-wrap:wrap;">
          <button type="button" class="km-btn km-btn-sm km-btn-primary" data-term-listen="${escapeHtml(term.word)}" data-term-trans="${escapeHtml(primaryTrans)}" title="Listen">
            <i class="fas fa-volume-up"></i> Listen
          </button>
          <button type="button" class="km-btn km-btn-sm ${isRecActive ? 'playing' : recMeta ? 'recorded' : ''}" data-term-rec="${escapeHtml(term.id)}" title="Record voice">
            ${isRecActive ? '<span class="km-live-mic-dot"></span> Stop' : '<i class="fas fa-microphone"></i>'}
          </button>
          ${recMeta ? `<button type="button" class="km-btn km-btn-sm" data-term-replay="${escapeHtml(term.id)}" title="Replay my voice"><i class="fas fa-play"></i></button>` : ''}
        </div>
      </div>

      <div style="font-weight:700; font-size:0.96rem;">${escapeHtml(term.en)} <span class="km-meta-line">· ${escapeHtml(term.fr)}</span></div>
      ${s.otherTranslations && term.otherTranslations ? `<div style="font-size:0.82rem; color:var(--ink-secondary);"><strong>Other nuance:</strong> ${escapeHtml(term.otherTranslations)}</div>` : ''}
      ${s.definition && term.definition ? `<div style="font-size:0.83rem; color:var(--ink-secondary);">${escapeHtml(term.definition)}</div>` : ''}
      ${s.example && term.example ? `<div style="font-size:0.84rem; font-style:italic; color:var(--cobalt);">« ${escapeHtml(term.example)} »</div>` : ''}
      ${s.exampleTranslation && term.exampleTranslation ? `<div style="font-size:0.8rem; color:var(--ink-muted);">${escapeHtml(term.exampleTranslation)}</div>` : ''}
      ${s.synonymsAntonyms && (term.synonyms || term.antonyms) ? `<div class="km-meta-line">Synonyms: ${escapeHtml(term.synonyms)} · Opposites: ${escapeHtml(term.antonyms)}</div>` : ''}
      ${s.collocations && term.collocations ? `<div class="km-meta-line">Collocations: ${escapeHtml(term.collocations)}</div>` : ''}

      ${s.memoryBar ? `
        <div class="km-progress-track" style="height:6px; margin-top:4px;">
          <div class="km-progress-fill" style="width:${stats.memory}%;"></div>
        </div>
      ` : ''}
      ${s.learningStats ? `
        <div class="km-meta-line km-mono">Memory ${stats.memory}% · Right ${stats.right} · Almost ${stats.almost} · Wrong ${stats.wrong}</div>
      ` : ''}
    </article>
  `;
}

export function wireVocabCardActions(container, ctx, onRerender) {
  container.querySelectorAll('[data-term-listen]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakTermSequence(btn.getAttribute('data-term-listen'), btn.getAttribute('data-term-trans'), {
        settings: ctx.settings,
        lang: ctx.state.lang,
        btnEl: btn,
        onListened: ctx.actions.registerWordListened
      });
    });
  });

  container.querySelectorAll('[data-term-rec]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const termId = btn.getAttribute('data-term-rec');
      await toggleTermVoiceRecording(termId, {
        onSaved: (id, sec) => {
          ctx.actions.saveVoiceMeta(id, sec);
          ctx.actions.notify('Voice saved locally! Tap Play to compare with native pronunciation.');
          onRerender();
        },
        onError: (msg) => ctx.actions.notify(msg)
      });
      onRerender();
    });
  });

  container.querySelectorAll('[data-term-replay]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const termId = btn.getAttribute('data-term-replay');
      btn.classList.add('playing');
      await replayUserVoiceRecording(termId, {
        onMissing: () => {
          btn.classList.remove('playing');
          ctx.actions.notify('Record your pronunciation first using the mic button.');
        },
        onDone: () => btn.classList.remove('playing')
      });
    });
  });
}

function renderAudioQuizHtml(ctx) {
  const idx = ctx.state.audioQuizIdx % AUDIO_QUIZ_BANK.length;
  const q = AUDIO_QUIZ_BANK[idx];
  const letters = ['A', 'B', 'C', 'D'];
  return `
    <div class="km-subpanel">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <span class="km-meta-line km-mono">Audio Drill ${idx + 1} / ${AUDIO_QUIZ_BANK.length} · Score ${ctx.state.audioQuizScore}</span>
        <div class="km-seg-group">
          <button type="button" class="km-seg-btn ${ctx.state.audioSpeed === 1.0 ? 'active' : ''}" data-aq-speed="1.0">1.0x Normal</button>
          <button type="button" class="km-seg-btn ${ctx.state.audioSpeed === 0.78 ? 'active' : ''}" data-aq-speed="0.78">0.8x Clear</button>
        </div>
      </div>

      <div style="text-align:center; padding:1.25rem 0;">
        <button type="button" class="km-btn km-btn-primary" id="aqPlayPromptBtn" style="min-height:54px; padding:0.75rem 1.4rem; font-size:1rem;">
          <i class="fas fa-volume-high"></i> Play Spoken Creole Phrase
        </button>
        <div class="km-meta-line" style="margin-top:0.5rem;">Listen closely, then pick the matching English &amp; French meaning below.</div>
      </div>

      <div class="km-quiz-options" role="radiogroup">
        ${q.options.map((opt, i) => `
          <button type="button" class="km-quiz-option" role="radio" aria-checked="false" data-aq-opt="${i}" data-correct="${opt.correct ? 'true' : 'false'}">
            <span><strong>${letters[i]}.</strong> ${escapeHtml(opt.en)} <span class="km-meta-line">(${escapeHtml(opt.fr)})</span></span>
            <span class="quiz-opt-status"></span>
          </button>
        `).join('')}
      </div>

      <div id="aqFeedbackBox" style="display:none; margin-top:0.85rem; padding:0.85rem; border-radius:10px; font-size:0.9rem;"></div>
      <div style="margin-top:0.85rem; text-align:right;">
        <button type="button" class="km-btn km-btn-primary" id="aqNextBtn" style="display:none;">Next Audio Phrase <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;
}

function wireAudioQuizHandlers(container, ctx) {
  const idx = ctx.state.audioQuizIdx % AUDIO_QUIZ_BANK.length;
  const q = AUDIO_QUIZ_BANK[idx];
  const playPrompt = (btn) => {
    speakTermSequence(q.creolePhrase, '', {
      settings: { ...ctx.settings, speechRate: ctx.state.audioSpeed || 0.9, translationPlayback: false },
      lang: ctx.state.lang,
      btnEl: btn,
      onListened: ctx.actions.registerWordListened
    });
  };

  container.querySelector('#aqPlayPromptBtn')?.addEventListener('click', (e) => playPrompt(e.currentTarget));

  const opts = Array.from(container.querySelectorAll('[data-aq-opt]'));
  let answered = false;
  opts.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const isRight = btn.getAttribute('data-correct') === 'true';
      const fb = container.querySelector('#aqFeedbackBox');
      const nextBtn = container.querySelector('#aqNextBtn');
      btn.setAttribute('aria-checked', 'true');

      if (isRight) {
        btn.classList.add('correct');
        btn.querySelector('.quiz-opt-status').innerHTML = '<i class="fas fa-check-circle"></i>';
        ctx.state.audioQuizScore += 1;
        ctx.actions.playSfx('right');
        ctx.actions.awardXp(15, 'Listening comprehension correct (+15 XP)');
        ctx.actions.incrementDailyGoal(1);
        ctx.actions.fireConfetti({ particleCount: 60 });
        if (fb) {
          fb.style.display = 'block';
          fb.style.background = 'var(--emerald-soft)';
          fb.innerHTML = `<strong>Sé sa menm!</strong> ${escapeHtml(q.creolePhrase)} — ${escapeHtml(q.explanation)}`;
        }
      } else {
        btn.classList.add('incorrect');
        btn.querySelector('.quiz-opt-status').innerHTML = '<i class="fas fa-times-circle"></i>';
        const right = opts.find((o) => o.getAttribute('data-correct') === 'true');
        if (right) right.classList.add('correct');
        ctx.actions.playSfx('wrong');
        if (fb) {
          fb.style.display = 'block';
          fb.style.background = 'var(--crimson-soft)';
          fb.innerHTML = `<strong>Spoken phrase:</strong> ${escapeHtml(q.creolePhrase)} — ${escapeHtml(q.explanation)}`;
        }
      }
      if (nextBtn) nextBtn.style.display = 'inline-flex';
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); opts[(i + 1) % opts.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length].focus(); }
      else if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
    });
  });

  container.querySelectorAll('[data-aq-speed]').forEach((b) => {
    b.addEventListener('click', () => {
      ctx.state.audioSpeed = Number(b.getAttribute('data-aq-speed'));
      renderCurriculumAndOralLabs(container, ctx);
    });
  });

  container.querySelector('#aqNextBtn')?.addEventListener('click', () => {
    ctx.state.audioQuizIdx = (ctx.state.audioQuizIdx + 1) % AUDIO_QUIZ_BANK.length;
    renderCurriculumAndOralLabs(container, ctx);
  });
}

function renderSpeakingLabHtml(ctx) {
  const idx = ctx.state.speakingIdx % SPEAKING_PRACTICE_PHRASES.length;
  const p = SPEAKING_PRACTICE_PHRASES[idx];
  const isRec = isActivelyRecording(`speaking-${p.id}`);
  const hasSaved = Boolean(ctx.recordedMeta[`speaking-${p.id}`]);

  return `
    <div class="km-subpanel">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <span class="km-meta-line km-mono">Speaking Phrase ${idx + 1} / ${SPEAKING_PRACTICE_PHRASES.length} · Score ${ctx.state.speakingScore} pts</span>
        <button type="button" class="km-btn km-btn-sm" id="spNextPhraseBtn">Next Phrase <i class="fas fa-arrow-right"></i></button>
      </div>

      <div style="margin:1rem 0; padding:1rem; border-radius:12px; background:var(--surface-subtle);">
        <div class="km-creole-head" style="font-size:1.55rem;">${escapeHtml(p.creole)}</div>
        <div class="km-meta-line km-mono">${escapeHtml(p.phonetic)}</div>
        <div style="font-weight:700; margin-top:4px;">${escapeHtml(p.en)} <span class="km-meta-line">· ${escapeHtml(p.fr)}</span></div>
        <div style="font-size:0.84rem; color:var(--ink-secondary); margin-top:4px;"><strong>Tip:</strong> ${escapeHtml(p.tip)}</div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="km-btn km-btn-primary" id="spListenModelBtn"><i class="fas fa-volume-up"></i> Listen Native Model</button>
        <button type="button" class="km-btn km-btn-emerald" id="spSpeechCheckBtn"><i class="fas fa-microphone"></i> Check Pronunciation (AI)</button>
        <button type="button" class="km-btn ${isRec ? 'playing' : hasSaved ? 'recorded' : ''}" id="spSelfRecordBtn">
          ${isRec ? '<span class="km-live-mic-dot"></span> Stop Recording' : '<i class="fas fa-circle"></i> Record & Save Locally'}
        </button>
        ${hasSaved ? `<button type="button" class="km-btn" id="spReplayBtn"><i class="fas fa-play"></i> Replay My Voice</button>` : ''}
      </div>

      <div id="spSpeechStatus" role="status" aria-live="polite" style="margin-top:0.85rem; font-size:0.9rem; color:var(--ink-secondary);">
        Tap <strong>Check Pronunciation</strong> to grade your spoken match, or record locally to compare side-by-side.
      </div>
    </div>
  `;
}

function wireSpeakingLabHandlers(container, ctx) {
  const idx = ctx.state.speakingIdx % SPEAKING_PRACTICE_PHRASES.length;
  const p = SPEAKING_PRACTICE_PHRASES[idx];

  container.querySelector('#spListenModelBtn')?.addEventListener('click', (e) => {
    speakTermSequence(p.creole, '', {
      settings: { ...ctx.settings, translationPlayback: false },
      lang: ctx.state.lang,
      btnEl: e.currentTarget,
      onListened: ctx.actions.registerWordListened
    });
  });

  container.querySelector('#spSpeechCheckBtn')?.addEventListener('click', async () => {
    const statusEl = container.querySelector('#spSpeechStatus');
    if (statusEl) statusEl.innerHTML = '<span class="km-live-mic-dot"></span> Listening... speak clearly into your microphone!';
    const res = await captureSpokenPhrase({
      lang: 'fr-FR',
      onInterim: (txt) => {
        if (statusEl && txt) statusEl.innerHTML = `<span class="km-live-mic-dot"></span> Heard: "<em>${escapeHtml(txt)}</em>"`;
      }
    });

    if (!res.supported) {
      ctx.state.speakingScore += 10;
      ctx.actions.awardXp(10, 'Speaking practice completed (+10 XP)');
      if (statusEl) statusEl.innerHTML = `<strong>Speech Recognition unavailable here</strong> — practiced aloud with self-check! Use <em>Record &amp; Save Locally</em> to hear yourself back.`;
      return;
    }

    if (!res.transcript) {
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--ochre);">No spoken words captured (${escapeHtml(res.error || 'quiet mic')}). Listen to the model and try again.</span>`;
      return;
    }

    const score = computeSpeechSimilarity(res.transcript, p.creole);
    if (score >= 70) {
      ctx.state.speakingScore += 15;
      ctx.actions.playSfx('right');
      ctx.actions.awardXp(15, `${score}% Pronunciation Match (+15 XP)`);
      ctx.actions.incrementDailyGoal(1);
      ctx.actions.fireConfetti({ particleCount: 55 });
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--emerald); font-weight:700;">${score}% Match · Bèl vwa!</span> Heard: "<em>${escapeHtml(res.transcript)}</em>"`;
    } else if (score >= 45) {
      ctx.state.speakingScore += 5;
      ctx.actions.playSfx('almost');
      ctx.actions.awardXp(5, `${score}% Match — Good progress (+5 XP)`);
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--ochre); font-weight:700;">${score}% Match · Almost there!</span> Heard: "<em>${escapeHtml(res.transcript)}</em>" · ${escapeHtml(p.tip)}`;
    } else {
      ctx.actions.playSfx('wrong');
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--crimson); font-weight:700;">${score}% Match · Keep practicing!</span> Heard: "<em>${escapeHtml(res.transcript)}</em>"`;
    }
  });

  container.querySelector('#spSelfRecordBtn')?.addEventListener('click', async () => {
    await toggleTermVoiceRecording(`speaking-${p.id}`, {
      onSaved: (id, sec) => {
        ctx.actions.saveVoiceMeta(id, sec);
        ctx.actions.notify('Speaking recording saved locally!');
        renderCurriculumAndOralLabs(container, ctx);
      },
      onError: (msg) => ctx.actions.notify(msg)
    });
    renderCurriculumAndOralLabs(container, ctx);
  });

  container.querySelector('#spReplayBtn')?.addEventListener('click', async (e) => {
    e.currentTarget.classList.add('playing');
    await replayUserVoiceRecording(`speaking-${p.id}`, {
      onDone: () => renderCurriculumAndOralLabs(container, ctx)
    });
  });

  container.querySelector('#spNextPhraseBtn')?.addEventListener('click', () => {
    ctx.state.speakingIdx = (ctx.state.speakingIdx + 1) % SPEAKING_PRACTICE_PHRASES.length;
    renderCurriculumAndOralLabs(container, ctx);
  });
}
