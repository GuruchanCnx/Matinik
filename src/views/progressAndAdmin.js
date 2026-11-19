import { BADGES_CATALOG } from '../data/curriculum.js';
import { ARTIFACTS_CATALOG, LEARNING_LEVELS } from '../data/vocab.js';
import {
  getSortedVoices,
  setNatureAmbientVolume,
  speakTermSequence
} from '../services/audioEngine.js';
import { escapeHtml } from './curriculumAndQuiz.js';

function formatClock(sec) {
  const s = Math.max(0, Number(sec || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function getLevelName(xp) {
  const n = Number(xp || 0);
  if (n >= 300) return 'Mèt Kréyòl (Master)';
  if (n >= 150) return 'Bèlè (Advanced)';
  if (n >= 50) return 'Mawon (Explorer)';
  return 'Ti-Manmay (Starter)';
}

export function renderProgressDashboard(container, ctx) {
  if (!container) return;
  const p = ctx.progress;
  const modsDone = Object.values(p.modules || {}).filter(Boolean).length;
  const quizzesDone = Object.values(p.quizzes || {}).filter(Boolean).length;
  const listenedCount = (p.listenedWords || []).length;
  const pct = Math.min(100, Math.round((modsDone / 3) * 45 + (quizzesDone / 3) * 45 + Math.min(listenedCount, 10)));

  const g = ctx.dailyGoal;
  const goalPct = Math.min(100, Math.round((g.completedToday / Math.max(1, g.target)) * 100));
  const circ = 251.32;
  const offset = circ - (goalPct / 100) * circ;

  const ft = ctx.focusTimer;
  const collPts = Number(ctx.collection.points || 0);
  const flashcardPts = Number(ctx.collection.flashcardPoints || 0);
  const lessonPts = Number(ctx.collection.lessonPoints || 0);
  const mapPts = Number(ctx.collection.mapPoints || 0);
  const reviewedCount = (p.reviewedCards || []).length;
  const visitedCount = (ctx.collection.visitedSites || []).length;
  const sourceDenom = Math.max(1, flashcardPts + lessonPts + mapPts);

  const LEVEL_CAPS = [60, 160, 300, 500];
  let activeLvlIdx = 0;
  LEARNING_LEVELS.forEach((lvl, i) => {
    if (p.xp >= lvl.minXp) activeLvlIdx = i;
  });

  container.innerHTML = `
    <div class="km-stats-row">
      <div class="km-stat-tile">
        <div class="km-stat-label">Experience</div>
        <div class="km-stat-val" id="dashXpVal">${p.xp} XP</div>
        <div class="km-meta-line">${escapeHtml(getLevelName(p.xp))}</div>
      </div>
      <div class="km-stat-tile">
        <div class="km-stat-label">Daily Streak</div>
        <div class="km-stat-val">${p.streak || 1} Day${(p.streak || 1) === 1 ? '' : 's'}</div>
        <div class="km-meta-line">Keep habit alive</div>
      </div>
      <div class="km-stat-tile">
        <div class="km-stat-label">Collection Pts</div>
        <div class="km-stat-val">${collPts} Pts</div>
        <div class="km-meta-line">${ARTIFACTS_CATALOG.filter((a) => collPts >= a.pointsRequired).length} / ${ARTIFACTS_CATALOG.length} artifacts</div>
      </div>
      <div class="km-stat-tile">
        <div class="km-stat-label">Modules &amp; Quizzes</div>
        <div class="km-stat-val">${modsDone}/3 · ${quizzesDone}/3</div>
        <div class="km-meta-line">${listenedCount} words heard</div>
      </div>
      <div class="km-stat-tile">
        <div class="km-stat-label">Course Mastery</div>
        <div class="km-stat-val">${pct}%</div>
        <div class="km-meta-line">GEREC path</div>
      </div>
    </div>

    <div class="km-progress-track" aria-label="Course completion percentage">
      <div class="km-progress-fill" style="width:${pct}%;"></div>
    </div>

    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:0.85rem;">
      <button type="button" class="km-btn km-btn-sm km-btn-primary" id="shareAchievementBtn">
        <i class="fas fa-share-nodes"></i> Share Achievement
      </button>
      <button type="button" class="km-btn km-btn-sm" id="runAgenticCoachBtn">
        <i class="fas fa-wand-magic-sparkles"></i> Agentic Study Coach
      </button>
      <button type="button" class="km-btn km-btn-sm" id="triggerResetBtn" style="color:var(--crimson);">
        <i class="fas fa-rotate-left"></i> Reset Progress
      </button>
    </div>

    <div id="agenticCoachMount" style="margin-top:0.85rem;"></div>

    <div class="km-goal-focus-grid">
      <!-- Daily Study Goal -->
      <section class="km-subpanel" aria-label="Daily Study Goal">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <strong style="font-size:1rem;"><i class="fas fa-bullseye" style="color:var(--cobalt);"></i> Daily Study Goal</strong>
          <span class="km-meta-line km-mono">${g.completedToday} / ${g.target} done</span>
        </div>

        <div style="display:flex; align-items:center; gap:1rem; margin-top:0.75rem;">
          <div class="km-goal-ring-wrap">
            <svg class="km-goal-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
              <circle class="km-goal-ring-bg" cx="50" cy="50" r="40"></circle>
              <circle class="km-goal-ring-fg ${goalPct >= 100 ? 'completed' : ''}" cx="50" cy="50" r="40" style="stroke-dashoffset:${offset};"></circle>
            </svg>
            <div class="km-goal-ring-center">
              <span>${goalPct}%</span>
              <span style="font-size:0.78rem;">${goalPct >= 100 ? '🏆' : '🎯'}</span>
            </div>
          </div>

          <div style="flex:1; display:flex; flex-direction:column; gap:0.5rem;">
            <div class="km-meta-line">Target activities per day:</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${[5, 10, 15, 25].map((tgt) => `
                <button type="button" class="km-btn km-btn-sm ${g.target === tgt ? 'active' : ''}" data-goal-target="${tgt}">${tgt}</button>
              `).join('')}
            </div>
            <div style="font-size:0.84rem; color:var(--ink-secondary);">
              ${goalPct >= 100 ? 'Target completed today! +20 bonus XP earned.' : `${Math.max(0, g.target - g.completedToday)} practice activity left today.`}
            </div>
          </div>
        </div>
      </section>

      <!-- Deep Focus Timer + Nature Soundscape -->
      <section class="km-subpanel" aria-label="Deep Study Focus Timer">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong style="font-size:1rem;"><i class="fas fa-leaf" style="color:var(--emerald);"></i> Focus Timer &amp; Nature Audio</strong>
          <button type="button" class="km-btn km-btn-sm ${ft.muted ? '' : 'active'}" id="ftMuteBtn">
            <i class="fas ${ft.muted ? 'fa-volume-xmark' : 'fa-volume-high'}"></i> ${ft.muted ? 'Muted' : 'Nature On'}
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-top:0.55rem;">
          <div class="km-focus-clock tabular-nums" id="focusClockDigits">${formatClock(ft.remainingSec)}</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${[15, 25, 45].map((m) => `
              <button type="button" class="km-btn km-btn-sm ${ft.durationMin === m ? 'active' : ''}" data-ft-min="${m}">${m}m</button>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:0.4rem;">
          <button type="button" class="km-btn km-btn-sm ${ft.running ? 'km-btn-emerald' : 'km-btn-primary'}" id="ftToggleBtn">
            <i class="fas ${ft.running ? 'fa-pause' : 'fa-play'}"></i> ${ft.running ? 'Pause' : 'Start Focus'}
          </button>
          <button type="button" class="km-btn km-btn-sm" id="ftResetBtn"><i class="fas fa-rotate-left"></i> Reset</button>
          <select id="ftTrackSelect" class="km-select" style="width:auto; min-height:36px; flex:1;" aria-label="Nature ambient sound">
            <option value="rainforest" ${ft.track === 'rainforest' ? 'selected' : ''}>Rainforest Breeze</option>
            <option value="waves" ${ft.track === 'waves' ? 'selected' : ''}>Diamond Ocean Waves</option>
            <option value="crickets" ${ft.track === 'crickets' ? 'selected' : ''}>Twilight Crickets</option>
          </select>
        </div>
      </section>
    </div>

    <!-- Cultural Progress Section: Collection Points Breakdown & Level Mastery Bars -->
    <section class="km-subpanel km-cultural-progress" aria-label="Cultural Progress">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <strong style="font-size:1.05rem;"><i class="fas fa-award" style="color:var(--ochre);"></i> Cultural Progress</strong>
          <div class="km-meta-line">Collection points earned from completed flashcards, lessons, and island heritage sites</div>
        </div>
        <div class="km-mono" style="font-weight:700; font-size:0.95rem; color:var(--cobalt);">${collPts} Total Pts · ${p.xp} XP</div>
      </div>

      <div class="km-source-breakdown">
        <div class="km-source-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="km-stat-label">Flashcards</span>
            <span class="km-mono" style="font-weight:700; color:var(--cobalt);">${flashcardPts} Pts</span>
          </div>
          <div class="km-meta-line">${reviewedCount} card${reviewedCount === 1 ? '' : 's'} completed &amp; graded</div>
          <div class="km-level-bar-track">
            <div class="km-level-bar-fill" style="width:${flashcardPts > 0 ? Math.max(8, Math.round((flashcardPts / sourceDenom) * 100)) : 0}%;"></div>
          </div>
        </div>

        <div class="km-source-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="km-stat-label">Lessons &amp; Quizzes</span>
            <span class="km-mono" style="font-weight:700; color:var(--emerald);">${lessonPts} Pts</span>
          </div>
          <div class="km-meta-line">${modsDone}/3 modules · ${quizzesDone}/3 quizzes passed</div>
          <div class="km-level-bar-track">
            <div class="km-level-bar-fill is-completed" style="width:${lessonPts > 0 ? Math.max(8, Math.round((lessonPts / sourceDenom) * 100)) : 0}%;"></div>
          </div>
        </div>

        <div class="km-source-tile">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="km-stat-label">Heritage Sites</span>
            <span class="km-mono" style="font-weight:700; color:var(--ochre);">${mapPts} Pts</span>
          </div>
          <div class="km-meta-line">${visitedCount} / 22 Martinique locations explored</div>
          <div class="km-level-bar-track">
            <div class="km-level-bar-fill" style="background:var(--ochre); width:${mapPts > 0 ? Math.max(8, Math.round((mapPts / sourceDenom) * 100)) : 0}%;"></div>
          </div>
        </div>
      </div>

      <div>
        <div class="km-meta-line" style="margin-bottom:0.55rem;">Learning Level Progress Bars</div>
        <div class="km-level-bars-list">
          ${LEARNING_LEVELS.map((lvl, idx) => {
            const cap = LEVEL_CAPS[idx] || (lvl.minXp + 200);
            const span = Math.max(1, cap - lvl.minXp);
            const isCompleted = p.xp >= cap;
            const isActive = idx === activeLvlIdx && !isCompleted;
            const pctFill = isCompleted
              ? 100
              : p.xp >= lvl.minXp
                ? Math.max(4, Math.min(99, Math.round(((p.xp - lvl.minXp) / span) * 100)))
                : 0;
            const gainedInTier = Math.max(0, Math.min(span, p.xp - lvl.minXp));
            const statusText = isCompleted
              ? 'Completed ✓'
              : p.xp >= lvl.minXp
                ? `In Progress · ${pctFill}%`
                : `Unlocks at ${lvl.minXp} XP`;
            return `
              <div class="km-level-bar-row ${isCompleted ? 'is-completed' : isActive ? 'is-active' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <strong style="font-size:0.9rem;">${lvl.badge} ${escapeHtml(lvl.creoleTitle)}</strong>
                  <span class="km-meta-line" style="color:${isCompleted ? 'var(--emerald)' : isActive ? 'var(--cobalt)' : 'var(--ink-muted)'};">${statusText}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--ink-secondary);">
                  <span>${escapeHtml(lvl.title)}</span>
                  <span class="km-mono">${gainedInTier} / ${span} XP</span>
                </div>
                <div class="km-level-bar-track" role="progressbar" aria-valuenow="${pctFill}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(lvl.title)} progress">
                  <div class="km-level-bar-fill ${isCompleted ? 'is-completed' : pctFill === 0 ? 'is-locked' : ''}" style="width:${pctFill}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <div style="margin-top:1.15rem;">
      <strong style="font-size:0.98rem;">Kòlèksyon Matinik · Cultural Heritage Artifacts</strong>
      <div class="km-artifacts-grid">
        ${ARTIFACTS_CATALOG.map((art) => {
          const unlocked = collPts >= art.pointsRequired;
          return `
            <div class="km-subpanel" style="padding:0.75rem; opacity:${unlocked ? 1 : 0.55}; border-color:${unlocked ? 'var(--emerald)' : 'var(--hairline)'};">
              <div style="font-size:1.5rem;">${art.icon}</div>
              <strong style="font-size:0.88rem; display:block; margin-top:2px;">${escapeHtml(art.name)}</strong>
              <div class="km-meta-line">${unlocked ? 'Collected' : `${art.pointsRequired} Pts`}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div style="margin-top:1.15rem;">
      <strong style="font-size:0.98rem;">Achievement Badges</strong>
      <div class="km-badges-grid">
        ${BADGES_CATALOG.map((b) => {
          const unlocked = b.check(p);
          return `
            <div class="km-badge-card ${unlocked ? 'unlocked' : ''}" id="badge-${b.id}">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.45rem;">${b.icon}</span>
                <span class="km-meta-line" style="color:${unlocked ? 'var(--emerald)' : 'var(--ink-muted)'};">
                  ${unlocked ? 'Unlocked ✓' : 'Locked'}
                </span>
              </div>
              <strong style="font-size:0.92rem; display:block; margin-top:4px;">${escapeHtml(b.title)}</strong>
              <div class="km-meta-line">${escapeHtml(b.rule)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Wire dashboard controls
  container.querySelector('#shareAchievementBtn')?.addEventListener('click', () => ctx.actions.shareProgress());
  container.querySelector('#triggerResetBtn')?.addEventListener('click', () => ctx.actions.openResetModal(true));

  container.querySelector('#runAgenticCoachBtn')?.addEventListener('click', async (e) => {
    const mount = container.querySelector('#agenticCoachMount');
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
    await ctx.actions.runAgenticCoach(mount);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Agentic Study Coach';
  });

  if (ctx.state.lastCoachData) {
    renderAgenticCoachCard(container.querySelector('#agenticCoachMount'), ctx.state.lastCoachData, ctx);
  }

  container.querySelectorAll('[data-goal-target]').forEach((b) => {
    b.addEventListener('click', () => ctx.actions.setDailyGoalTarget(Number(b.getAttribute('data-goal-target'))));
  });

  container.querySelectorAll('[data-ft-min]').forEach((b) => {
    b.addEventListener('click', () => ctx.actions.setFocusDuration(Number(b.getAttribute('data-ft-min'))));
  });
  container.querySelector('#ftToggleBtn')?.addEventListener('click', () => ctx.actions.toggleFocusTimer());
  container.querySelector('#ftResetBtn')?.addEventListener('click', () => ctx.actions.resetFocusTimer());
  container.querySelector('#ftMuteBtn')?.addEventListener('click', () => ctx.actions.toggleFocusMute());
  container.querySelector('#ftTrackSelect')?.addEventListener('change', (e) => ctx.actions.changeFocusTrack(e.target.value));
}

export function renderAgenticCoachCard(mount, coach, ctx) {
  if (!mount || !coach) return;
  const ch = coach.miniChallenge;
  mount.innerHTML = `
    <div class="km-subpanel" style="border-color:var(--cobalt); background:var(--cobalt-soft);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap;">
        <div>
          <div class="km-meta-line" style="color:var(--cobalt);">Adaptive Heritage Recommendation · ${escapeHtml(coach.focusArea)}</div>
          <strong style="font-size:0.98rem;">${escapeHtml(coach.encouragement)}</strong>
        </div>
        <button type="button" class="km-btn km-btn-sm km-btn-primary" id="coachLaunchDeckBtn">Practice Recommended Deck</button>
      </div>
      <p style="font-size:0.86rem; color:var(--ink-secondary); margin:0.45rem 0;">${escapeHtml(coach.culturalInsight)}</p>
      ${ch ? `
        <div style="background:var(--surface-solid); padding:0.85rem; border-radius:12px; margin-top:0.55rem;">
          <div class="km-meta-line km-mono">${escapeHtml(ch.creole)} ${escapeHtml(ch.phonetic)}</div>
          <strong style="display:block; margin:4px 0 6px;">${escapeHtml(ch.prompt)}</strong>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:6px;">
            ${(ch.options || []).map((opt) => `
              <button type="button" class="km-btn km-btn-sm" data-coach-opt="${escapeHtml(opt)}">${escapeHtml(opt)}</button>
            `).join('')}
          </div>
          <div id="coachChallengeFeedback" style="font-size:0.84rem; margin-top:6px;"></div>
        </div>
      ` : ''}
    </div>
  `;

  mount.querySelector('#coachLaunchDeckBtn')?.addEventListener('click', () => {
    ctx.actions.openFlashcards(coach.recommendedDeck || 'greetings');
  });

  mount.querySelectorAll('[data-coach-opt]').forEach((b) => {
    b.addEventListener('click', () => {
      const picked = b.getAttribute('data-coach-opt');
      const right = picked === ch?.answer;
      const fb = mount.querySelector('#coachChallengeFeedback');
      if (right) {
        b.classList.add('km-btn-emerald');
        ctx.actions.playSfx('right');
        ctx.actions.awardXp(20, 'Coach mini-challenge solved (+20 XP)');
        ctx.actions.addCollectionPoints(15);
        ctx.actions.fireConfetti({ particleCount: 50 });
        if (fb) fb.innerHTML = '<span style="color:var(--emerald); font-weight:700;">Bèl travay! +20 XP &amp; +15 Collection Points!</span>';
      } else {
        b.style.borderColor = 'var(--crimson)';
        ctx.actions.playSfx('wrong');
        if (fb) fb.innerHTML = `<span style="color:var(--crimson);">Answer: <strong>${escapeHtml(ch?.answer || '')}</strong></span>`;
      }
    });
  });
}

// =========================================================
// VOICE, SOUND MIXER & ALL 14 STUDY PREFERENCES DRAWER
// =========================================================
const STUDY_SWITCH_DEFS = [
  { key: 'wordPronunciation', title: 'Word pronunciation', sub: 'Auto-read Creole terms aloud' },
  { key: 'translationPlayback', title: 'Terms translation playback', sub: 'Speak EN / FR translation after Creole' },
  { key: 'soundEffects', title: 'Sound effects', sub: 'Audio cues on right, almost, wrong answers' },
  { key: 'vibration', title: 'Vibration', sub: 'Haptic tactile pulse on mobile taps' },
  { key: 'partOfSpeech', title: 'Part of speech', sub: 'Display grammatical category' },
  { key: 'pronunciation', title: 'Pronunciation', sub: 'Show phonetic bracket guide [bohn-zhoo]' },
  { key: 'otherTranslations', title: 'Other translations', sub: 'More ways to say it in your language' },
  { key: 'definition', title: 'Definition', sub: 'The meaning in the language you learn' },
  { key: 'example', title: 'Example', sub: 'Authentic Martinican sentence usage' },
  { key: 'exampleTranslation', title: 'Example translation', sub: 'Translation of the sentence example' },
  { key: 'synonymsAntonyms', title: 'Synonyms and antonyms', sub: 'Similar and opposite Creole words' },
  { key: 'collocations', title: 'Collocations', sub: 'Words it often goes with' },
  { key: 'memoryBar', title: 'Memory bar', sub: 'Spaced-repetition retention strength bar' },
  { key: 'learningStats', title: 'Learning stats', sub: 'Your right, almost, and wrong counts' }
];

export function renderSettingsDrawer(backdrop, ctx) {
  if (!backdrop) return;
  const s = ctx.settings;
  const voices = getSortedVoices();

  backdrop.innerHTML = `
    <div class="km-drawer-panel" role="dialog" aria-modal="true" aria-label="Voice, Sound and Study Preferences">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <strong style="font-size:1.15rem;">Voice, Sound &amp; Study Settings</strong>
          <div class="km-meta-line">Customize AI voices, nature mixer, motion, and 14 study toggles</div>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="closeSettingsBtn" aria-label="Close settings"><i class="fas fa-times"></i></button>
      </div>

      <div class="km-subpanel" style="display:flex; flex-direction:column; gap:0.65rem;">
        <strong style="font-size:0.94rem;">AI Voice &amp; Audio Mixer</strong>
        <label style="font-size:0.84rem;">
          Synthesized Voice Model
          <select id="voiceModelSelect" class="km-select" style="margin-top:4px;">
            <option value="">Auto (Best French/Creole Voice)</option>
            ${voices.slice(0, 24).map((v) => `<option value="${escapeHtml(v.voiceURI)}" ${s.voiceURI === v.voiceURI ? 'selected' : ''}>${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('')}
          </select>
        </label>

        <label style="font-size:0.84rem; display:flex; justify-content:space-between; align-items:center;">
          <span>Speech Speed <strong class="km-mono">${Number(s.speechRate).toFixed(2)}x</strong></span>
          <input type="range" id="speechRateRange" min="0.65" max="1.2" step="0.05" value="${s.speechRate}">
        </label>

        <label style="font-size:0.84rem; display:flex; justify-content:space-between; align-items:center;">
          <span>Voice &amp; App Audio <strong class="km-mono">${Math.round(s.mainVolume * 100)}%</strong></span>
          <input type="range" id="mainVolRange" min="0" max="1" step="0.05" value="${s.mainVolume}">
        </label>

        <label style="font-size:0.84rem; display:flex; justify-content:space-between; align-items:center;">
          <span>Nature Ambient Volume <strong class="km-mono">${Math.round(s.ambientVolume * 100)}%</strong></span>
          <input type="range" id="ambientVolRange" min="0" max="1" step="0.05" value="${s.ambientVolume}">
        </label>

        <button type="button" class="km-btn km-btn-sm" id="testVoiceBtn"><i class="fas fa-volume-up"></i> Test Selected Voice</button>
      </div>

      <div class="km-subpanel">
        <strong style="font-size:0.94rem;">Ergonomics &amp; Accessibility</strong>
        <div class="km-switch-row">
          <div>
            <div style="font-weight:700; font-size:0.9rem;">Reduce Motion</div>
            <div class="km-meta-line">Disable parallax zoom, confetti &amp; transitions</div>
          </div>
          <label class="km-switch-toggle">
            <input type="checkbox" id="toggleReduceMotion" ${s.reduceMotion ? 'checked' : ''}>
            <span class="km-switch-slider"></span>
          </label>
        </div>
        <div class="km-switch-row" style="border-bottom:none;">
          <div>
            <div style="font-weight:700; font-size:0.9rem;">iPhone DUO Split Layout</div>
            <div class="km-meta-line">Dual side-by-side workspace panels on wide screens</div>
          </div>
          <label class="km-switch-toggle">
            <input type="checkbox" id="toggleIphoneDuo" ${s.iphoneDuoLayout ? 'checked' : ''}>
            <span class="km-switch-slider"></span>
          </label>
        </div>
      </div>

      <div class="km-subpanel">
        <strong style="font-size:0.94rem;">Card &amp; Study Details (14 Toggles)</strong>
        ${STUDY_SWITCH_DEFS.map((def) => `
          <div class="km-switch-row">
            <div>
              <div style="font-weight:600; font-size:0.88rem;">${escapeHtml(def.title)}</div>
              <div class="km-meta-line">${escapeHtml(def.sub)}</div>
            </div>
            <label class="km-switch-toggle">
              <input type="checkbox" data-setting-toggle="${def.key}" ${s[def.key] ? 'checked' : ''}>
              <span class="km-switch-slider"></span>
            </label>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  backdrop.querySelector('#closeSettingsBtn')?.addEventListener('click', () => ctx.actions.openSettings(false));
  backdrop.querySelector('#voiceModelSelect')?.addEventListener('change', (e) => {
    s.voiceURI = e.target.value;
    ctx.actions.saveSettings();
  });
  backdrop.querySelector('#speechRateRange')?.addEventListener('input', (e) => {
    s.speechRate = Number(e.target.value);
    ctx.actions.saveSettings();
  });
  backdrop.querySelector('#mainVolRange')?.addEventListener('input', (e) => {
    s.mainVolume = Number(e.target.value);
    ctx.actions.saveSettings();
  });
  backdrop.querySelector('#ambientVolRange')?.addEventListener('input', (e) => {
    s.ambientVolume = Number(e.target.value);
    setNatureAmbientVolume(s.ambientVolume);
    ctx.actions.saveSettings();
  });
  backdrop.querySelector('#testVoiceBtn')?.addEventListener('click', (e) => {
    speakTermSequence('Bonjou Matinik! Nou ka palé Kréyòl.', 'Good morning Martinique!', {
      settings: s,
      lang: ctx.state.lang,
      btnEl: e.currentTarget
    });
  });

  backdrop.querySelector('#toggleReduceMotion')?.addEventListener('change', (e) => {
    s.reduceMotion = e.target.checked;
    ctx.actions.saveSettings();
  });
  backdrop.querySelector('#toggleIphoneDuo')?.addEventListener('change', (e) => {
    s.iphoneDuoLayout = e.target.checked;
    ctx.actions.saveSettings();
  });

  backdrop.querySelectorAll('[data-setting-toggle]').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      const key = chk.getAttribute('data-setting-toggle');
      s[key] = e.target.checked;
      ctx.actions.saveSettings();
      ctx.actions.rerenderCurrentViews();
    });
  });
}

// =========================================================
// ADMIN RICH-TEXT CONTENT STUDIO (LESSONS + DICTIONARY + UPLOAD)
// =========================================================
export function renderAdminStudio(container, ctx) {
  if (!container) return;
  if (!ctx.isAdmin) {
    container.innerHTML = `
      <div class="km-subpanel">
        <strong>Admin Content Studio</strong>
        <p style="font-size:0.88rem; color:var(--ink-secondary); margin-top:0.35rem;">
          Authorized educators (verified admins such as <code>banheruka@gmail.com</code>) can author rich-text Creole micro-lessons with images/study PDFs and publish live dictionary entries synced to Firestore.
        </p>
        ${!ctx.user ? `<button type="button" class="km-btn km-btn-sm km-btn-primary" id="adminSignInPromptBtn" style="margin-top:0.65rem;">Sign In as Admin</button>` : '<div class="km-meta-line" style="margin-top:0.5rem;">Signed-in account does not hold Admin privileges.</div>'}
      </div>
    `;
    container.querySelector('#adminSignInPromptBtn')?.addEventListener('click', () => ctx.actions.openAuthModal(true));
    return;
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:1rem;">
      <!-- Publish Rich-Text Lesson -->
      <form id="adminLessonForm" class="km-subpanel" style="display:flex; flex-direction:column; gap:0.65rem;">
        <strong style="font-size:1rem;">Publish Rich-Text Micro-Lesson</strong>
        <input type="text" id="adminLessonTitle" class="km-input" placeholder="Lesson title (e.g. Ordering Fresh Fruit at Fòdfrans)" required>
        <div style="display:flex; gap:8px;">
          <select id="adminLessonLevel" class="km-select">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="master">Master</option>
          </select>
          <input type="text" id="adminLessonSummary" class="km-input" placeholder="Creole phrase hook..." required>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="km-btn km-btn-sm" data-rte-cmd="bold"><b>B</b></button>
          <button type="button" class="km-btn km-btn-sm" data-rte-cmd="italic"><i>I</i></button>
          <button type="button" class="km-btn km-btn-sm" data-rte-cmd="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
        </div>
        <div id="adminLessonRte" class="km-rte-editor" contenteditable="true" aria-label="Rich text lesson editor">Write cultural notes, dialogue lines, or grammar tips here...</div>

        <input type="text" id="adminLessonFunFact" class="km-input" placeholder="Optional cultural fun fact...">

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <label class="km-btn km-btn-sm" style="cursor:pointer;">
            <i class="fas fa-image"></i> Upload Picture
            <input type="file" id="adminImageInput" accept="image/*" style="display:none;">
          </label>
          <label class="km-btn km-btn-sm" style="cursor:pointer;">
            <i class="fas fa-paperclip"></i> Upload Study PDF/Audio
            <input type="file" id="adminFileInput" accept=".pdf,.txt,audio/*,image/*" style="display:none;">
          </label>
          <span class="km-meta-line" id="adminUploadStatus">${escapeHtml(ctx.state.adminUploadLabel || '')}</span>
        </div>

        <button type="submit" class="km-btn km-btn-primary"><i class="fas fa-cloud-arrow-up"></i> Publish Lesson to Firestore</button>
      </form>

      <!-- Publish Dictionary Word + Cloud Lists -->
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <form id="adminDictForm" class="km-subpanel" style="display:flex; flex-direction:column; gap:0.6rem;">
          <strong style="font-size:1rem;">Add Dictionary Entry</strong>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <input type="text" id="adWord" class="km-input" placeholder="Creole word *" required>
            <input type="text" id="adPos" class="km-input" placeholder="Part of speech (Noun)" value="Noun" required>
            <input type="text" id="adPron" class="km-input" placeholder="Phonetics [mohn]">
            <select id="adLevel" class="km-select">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="master">Master</option>
            </select>
            <input type="text" id="adEn" class="km-input" placeholder="English meaning *" required>
            <input type="text" id="adFr" class="km-input" placeholder="French meaning *" required>
          </div>
          <input type="text" id="adEx" class="km-input" placeholder="Example sentence in Creole">
          <button type="submit" class="km-btn km-btn-emerald"><i class="fas fa-book-medical"></i> Save Dictionary Term</button>
        </form>

        <div class="km-subpanel">
          <strong style="font-size:0.95rem;">Published Cloud Content (${ctx.cloud.lessons.length} Lessons · ${ctx.cloud.dictionary.length} Terms)</strong>
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:0.55rem; max-height:200px; overflow-y:auto;">
            ${ctx.cloud.lessons.map((l) => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:0.84rem;">
                <span>📘 ${escapeHtml(l.title)}</span>
                <button type="button" class="km-btn km-btn-sm" data-del-lesson="${escapeHtml(l.id)}" style="color:var(--crimson);">Delete</button>
              </div>
            `).join('')}
            ${ctx.cloud.dictionary.map((d) => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:0.84rem;">
                <span>📖 ${escapeHtml(d.word)} — ${escapeHtml(d.en)}</span>
                <button type="button" class="km-btn km-btn-sm" data-del-dict="${escapeHtml(d.id)}" style="color:var(--crimson);">Delete</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire RTE buttons
  container.querySelectorAll('[data-rte-cmd]').forEach((b) => {
    b.addEventListener('click', () => {
      document.execCommand(b.getAttribute('data-rte-cmd'), false, null);
    });
  });

  // Upload handlers -> /api/upload
  const handleFileUpload = async (file, kind) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      ctx.actions.notify('File exceeds 4MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl: reader.result })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        if (kind === 'image') ctx.state.adminImageUrl = data.url;
        else {
          ctx.state.adminFileUrl = data.url;
          ctx.state.adminFileName = data.name;
        }
        ctx.state.adminUploadLabel = `Uploaded: ${data.name}`;
        ctx.actions.notify(`Uploaded ${data.name}`);
        renderAdminStudio(container, ctx);
      } catch (err) {
        ctx.actions.notify(err.message || 'Upload error');
      }
    };
    reader.readAsDataURL(file);
  };

  container.querySelector('#adminImageInput')?.addEventListener('change', (e) => handleFileUpload(e.target.files?.[0], 'image'));
  container.querySelector('#adminFileInput')?.addEventListener('change', (e) => handleFileUpload(e.target.files?.[0], 'file'));

  container.querySelector('#adminLessonForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await ctx.actions.adminCreateLesson({
      title: container.querySelector('#adminLessonTitle')?.value,
      level: container.querySelector('#adminLessonLevel')?.value,
      creoleSummary: container.querySelector('#adminLessonSummary')?.value,
      bodyHtml: container.querySelector('#adminLessonRte')?.innerHTML,
      funFact: container.querySelector('#adminLessonFunFact')?.value,
      imageUrl: ctx.state.adminImageUrl || '',
      attachmentName: ctx.state.adminFileName || '',
      attachmentUrl: ctx.state.adminFileUrl || ''
    });
  });

  container.querySelector('#adminDictForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await ctx.actions.adminCreateDictEntry({
      word: container.querySelector('#adWord')?.value,
      pos: container.querySelector('#adPos')?.value,
      pronounce: container.querySelector('#adPron')?.value,
      level: container.querySelector('#adLevel')?.value,
      en: container.querySelector('#adEn')?.value,
      fr: container.querySelector('#adFr')?.value,
      example: container.querySelector('#adEx')?.value
    });
  });

  container.querySelectorAll('[data-del-lesson]').forEach((b) => {
    b.addEventListener('click', () => ctx.actions.adminDeleteLesson(b.getAttribute('data-del-lesson')));
  });
  container.querySelectorAll('[data-del-dict]').forEach((b) => {
    b.addEventListener('click', () => ctx.actions.adminDeleteDictEntry(b.getAttribute('data-del-dict')));
  });
}
