import {
  CREOLE_WEATHER_PHRASES,
  CULINARY_HERITAGE,
  CULTURAL_TRADITIONS_EXPANDED,
  FULL_PHOTO_GALLERY,
  LEARNING_PATH_MILESTONES,
  MARTINIQUE_SEASONS,
  WEATHER_STATIONS,
  translateWmoToCreole
} from '../data/culturalData.js';
import { FLASHCARD_DECKS } from '../data/vocab.js';
import {
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

// =========================================================
// PROGRESSIVE MILESTONE UNLOCKING ENGINE
// =========================================================
export function getCompletedMilestoneIds(ctx) {
  const set = new Set(Array.isArray(ctx?.progress?.pathCompleted) ? ctx.progress.pathCompleted : []);
  if (ctx?.progress?.modules?.module1) set.add('path-1');
  if (ctx?.progress?.modules?.module2) set.add('path-4');
  if (ctx?.progress?.modules?.module3) set.add('path-6');
  return set;
}

export function getMilestoneStatus(milestone, completedSet) {
  if (completedSet.has(milestone.id)) return 'completed';
  if (!milestone.requiredMilestoneId || completedSet.has(milestone.requiredMilestoneId)) return 'unlocked';
  return 'locked';
}

export function getUnlockedVocabularyDecks(ctx) {
  const completedSet = getCompletedMilestoneIds(ctx);
  const unlocked = new Set();
  LEARNING_PATH_MILESTONES.forEach((m) => {
    const status = getMilestoneStatus(m, completedSet);
    if (status === 'completed' || status === 'unlocked') {
      m.unlocksDecks.forEach((dk) => unlocked.add(dk));
    }
  });
  return unlocked;
}

export function getMilestoneForDeck(deckKey) {
  return LEARNING_PATH_MILESTONES.find((m) => m.unlocksDecks.includes(deckKey)) || LEARNING_PATH_MILESTONES[0];
}

// =========================================================
// GUIDED LEARNING PATH · INTERACTIVE MILESTONE MAP
// =========================================================
export function renderLearningPathSection(container, ctx) {
  if (!container) return;
  const completedSet = getCompletedMilestoneIds(ctx);
  const unlockedDecks = getUnlockedVocabularyDecks(ctx);

  // Determine currently selected milestone (default to first non-completed unlocked node)
  let selectedId = ctx.state.selectedPathId;
  if (!selectedId || !LEARNING_PATH_MILESTONES.some((m) => m.id === selectedId)) {
    const firstActive = LEARNING_PATH_MILESTONES.find((m) => getMilestoneStatus(m, completedSet) === 'unlocked')
      || LEARNING_PATH_MILESTONES[LEARNING_PATH_MILESTONES.length - 1];
    selectedId = firstActive.id;
    ctx.state.selectedPathId = selectedId;
  }

  const activeMilestone = LEARNING_PATH_MILESTONES.find((m) => m.id === selectedId) || LEARNING_PATH_MILESTONES[0];
  const activeStatus = getMilestoneStatus(activeMilestone, completedSet);
  const totalCompleted = LEARNING_PATH_MILESTONES.filter((m) => completedSet.has(m.id)).length;
  const pct = Math.round((totalCompleted / LEARNING_PATH_MILESTONES.length) * 100);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.85rem;">
      <div>
        <div class="km-meta-line km-mono">${totalCompleted} / ${LEARNING_PATH_MILESTONES.length} Milestones Mastered · ${unlockedDecks.size} / ${Object.keys(FLASHCARD_DECKS).length} Vocabulary Decks Unlocked</div>
        <div class="km-progress-track" style="height:8px; width:min(360px, 100%); margin-top:0.35rem;">
          <div class="km-progress-fill" style="width:${pct}%;"></div>
        </div>
      </div>
      <span class="km-meta-line">Complete each stage to unlock the next island vocabulary sets</span>
    </div>

    <div class="km-milestone-map" role="list" aria-label="Creole Learning Path Milestone Map">
      ${LEARNING_PATH_MILESTONES.map((m, idx) => {
        const status = getMilestoneStatus(m, completedSet);
        const isSelected = m.id === activeMilestone.id;
        return `
          <button type="button" class="km-milestone-node is-${status} ${isSelected ? 'is-selected' : ''}"
            data-path-node="${escapeHtml(m.id)}"
            aria-current="${isSelected ? 'step' : 'false'}"
            role="listitem">
            <div class="km-milestone-badge">
              <i class="fas ${status === 'completed' ? 'fa-check' : status === 'locked' ? 'fa-lock' : m.icon}"></i>
            </div>
            <div class="km-milestone-meta">
              <span class="km-mono" style="font-size:0.72rem; color:var(--ink-muted);">Stage ${m.step}</span>
              <strong>${escapeHtml(m.creoleTitle)}</strong>
              <span style="font-size:0.78rem; color:var(--ink-secondary);">${escapeHtml(m.title)}</span>
              <span style="font-size:0.72rem; font-weight:700; color:${status === 'completed' ? 'var(--emerald)' : status === 'unlocked' ? 'var(--cobalt)' : 'var(--ink-muted)'};">
                ${status === 'completed' ? '✓ Mastered' : status === 'unlocked' ? 'Unlocked · Active' : `Complete Stage ${idx} to Unlock`}
              </span>
            </div>
          </button>
        `;
      }).join('')}
    </div>

    <div class="km-subpanel km-path-detail" style="margin-top:1rem;">
      <div class="km-path-detail-grid">
        <div class="km-path-art-col">
          <img src="${escapeHtml(activeMilestone.image)}" alt="${escapeHtml(activeMilestone.title)}" referrerpolicy="no-referrer"
            style="width:100%; height:200px; object-fit:cover; border-radius:14px; border:1px solid var(--hairline);">
          <div style="margin-top:0.7rem;">
            <div class="km-meta-line km-mono">Dynamically Unlocks ${activeMilestone.unlocksDecks.length} Vocabulary Sets:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:0.45rem;">
              ${activeMilestone.unlocksDecks.map((dk) => {
                const deckObj = FLASHCARD_DECKS[dk];
                if (!deckObj) return '';
                const canOpen = activeStatus !== 'locked';
                return `
                  <button type="button" class="km-btn km-btn-sm ${canOpen ? 'km-btn-primary' : ''}"
                    data-path-open-deck="${escapeHtml(dk)}" ${canOpen ? '' : 'disabled'}>
                    <i class="fas ${canOpen ? 'fa-layer-group' : 'fa-lock'}"></i>
                    ${escapeHtml(deckObj.title)} (${deckObj.cards.length})
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.65rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
            <div>
              <div class="km-meta-line km-mono">STAGE ${activeMilestone.step} · ${activeStatus.toUpperCase()}</div>
              <h3 style="font-size:1.3rem;">${escapeHtml(activeMilestone.creoleTitle)} — ${escapeHtml(activeMilestone.title)}</h3>
            </div>
            <span class="km-meta-line km-mono">+${activeMilestone.rewardXp} XP · +${activeMilestone.rewardPts} Pts</span>
          </div>

          <p style="font-size:0.9rem; color:var(--ink-secondary);">${escapeHtml(activeMilestone.summary)}</p>

          <div style="background:var(--surface-solid); border:1px solid var(--hairline); border-radius:10px; padding:0.68rem 0.85rem; font-size:0.85rem;">
            <strong>GEREC Grammar Focus:</strong> ${escapeHtml(activeMilestone.grammarFocus)}
          </div>

          ${activeStatus === 'locked' ? `
            <div style="padding:0.9rem; border-radius:12px; background:var(--ochre-soft); font-size:0.88rem;">
              <strong><i class="fas fa-lock"></i> Locked Milestone:</strong> Complete <strong>Stage ${activeMilestone.step - 1}</strong> to unlock these Creole phrases and flashcard decks!
              <div style="margin-top:0.55rem;">
                <button type="button" class="km-btn km-btn-sm km-btn-primary" id="pathGoPrevReqBtn">
                  Go to Stage ${activeMilestone.step - 1}
                </button>
              </div>
            </div>
          ` : `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(225px, 1fr)); gap:0.65rem;">
              ${activeMilestone.vocabPreview.map((item) => {
                const isRec = isActivelyRecording(item.id);
                const recMeta = ctx.recordedMeta[item.id];
                return `
                  <article class="km-vocab-card" style="padding:0.8rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                      <div>
                        <strong style="font-size:1rem;">${escapeHtml(item.word)}</strong>
                        <div class="km-meta-line km-mono">${escapeHtml(item.pronounce)}</div>
                      </div>
                      <div style="display:flex; gap:4px;">
                        <button type="button" class="km-btn km-btn-sm ${isRec ? 'playing' : recMeta ? 'recorded' : ''}"
                          data-path-rec="${escapeHtml(item.id)}" title="Record your voice">
                          ${isRec ? '<span class="km-live-mic-dot"></span>' : '<i class="fas fa-microphone"></i>'}
                        </button>
                        ${recMeta ? `
                          <button type="button" class="km-btn km-btn-sm" data-path-replay="${escapeHtml(item.id)}" title="Play recording">
                            <i class="fas fa-play"></i>
                          </button>
                        ` : ''}
                      </div>
                    </div>
                    ${renderCustomAudioPlayerBarHtml(item.id, item.word, item.ex, ctx.settings)}
                    <div style="font-size:0.83rem; font-weight:600; color:var(--emerald);">${escapeHtml(item.en)}</div>
                    <div style="font-size:0.79rem; font-style:italic; color:var(--ink-muted);">« ${escapeHtml(item.ex)} »</div>
                  </article>
                `;
              }).join('')}
            </div>

            <div style="display:flex; gap:0.65rem; flex-wrap:wrap; margin-top:0.3rem;">
              <button type="button" class="km-btn ${activeStatus === 'completed' ? '' : 'km-btn-emerald'}" id="pathCompleteMilestoneBtn">
                <i class="fas ${activeStatus === 'completed' ? 'fa-check-double' : 'fa-flag-checkered'}"></i>
                ${activeStatus === 'completed'
                  ? 'Milestone Completed · Re-Review Lesson'
                  : `Complete Stage ${activeMilestone.step} & Unlock Next Vocabulary Sets`}
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  // Audio player wiring for preview terms
  const pathTracks = new Map();
  activeMilestone.vocabPreview.forEach((v) => {
    pathTracks.set(v.id, { text: v.word, exampleText: v.ex, translationText: v.en });
  });
  wireCustomAudioPlayers(container, pathTracks, ctx);

  container.querySelectorAll('[data-path-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.selectedPathId = btn.getAttribute('data-path-node');
      renderLearningPathSection(container, ctx);
    });
  });

  container.querySelector('#pathGoPrevReqBtn')?.addEventListener('click', () => {
    if (activeMilestone.requiredMilestoneId) {
      ctx.state.selectedPathId = activeMilestone.requiredMilestoneId;
      renderLearningPathSection(container, ctx);
    }
  });

  container.querySelectorAll('[data-path-open-deck]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dk = btn.getAttribute('data-path-open-deck');
      ctx.actions.openFlashcards(dk);
    });
  });

  container.querySelectorAll('[data-path-rec]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-path-rec');
      await toggleTermVoiceRecording(id, {
        onSaved: (tid, sec) => {
          ctx.actions.saveVoiceMeta(tid, sec);
          ctx.actions.notify(`Voice saved (${sec}s)!`);
          renderLearningPathSection(container, ctx);
        },
        onError: (msg) => ctx.actions.notify(msg)
      });
      renderLearningPathSection(container, ctx);
    });
  });

  container.querySelectorAll('[data-path-replay]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-path-replay');
      btn.classList.add('playing');
      await replayUserVoiceRecording(id, {
        onDone: () => btn.classList.remove('playing'),
        onMissing: () => ctx.actions.notify('Record your voice first.')
      });
    });
  });

  container.querySelector('#pathCompleteMilestoneBtn')?.addEventListener('click', () => {
    if (activeStatus !== 'completed') {
      ctx.actions.completePathMilestone(activeMilestone);
      const nextNode = LEARNING_PATH_MILESTONES.find((m) => m.requiredMilestoneId === activeMilestone.id);
      if (nextNode) ctx.state.selectedPathId = nextNode.id;
    } else {
      ctx.actions.openFlashcards(activeMilestone.unlocksDecks[0]);
    }
    renderLearningPathSection(container, ctx);
  });
}

// =========================================================
// MARTINIQUE LIVE WEATHER FETCHER (OPEN-METEO KEY-LESS API)
// =========================================================
export async function fetchMartiniqueWeather(ctx, forceRefresh = false) {
  const cache = ctx.state.weatherCache;
  if (!forceRefresh && cache && Date.now() - cache.fetchedAt < 10 * 60 * 1000) {
    return cache;
  }
  ctx.state.weatherLoading = true;
  try {
    const lats = WEATHER_STATIONS.map((s) => s.lat).join(',');
    const lngs = WEATHER_STATIONS.map((s) => s.lng).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=America%2FMartinique&forecast_days=4`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('Open-Meteo unavailable');
    const json = await res.json();
    const list = Array.isArray(json) ? json : [json];

    const merged = WEATHER_STATIONS.map((st, idx) => {
      const entry = list[idx] || {};
      const cur = entry.current || {};
      const daily = entry.daily || {};
      return {
        ...st,
        temp: Math.round(Number(cur.temperature_2m ?? st.fallbackTemp)),
        humidity: Math.round(Number(cur.relative_humidity_2m ?? st.fallbackHumidity)),
        wind: Math.round(Number(cur.wind_speed_10m ?? st.fallbackWind)),
        code: Number(cur.weather_code ?? st.fallbackCode),
        dailyTimes: Array.isArray(daily.time) ? daily.time.slice(0, 3) : ['Today', 'Tomorrow', 'Day +2'],
        dailyMax: Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max.slice(0, 3) : [st.fallbackTemp + 1, st.fallbackTemp + 1, st.fallbackTemp],
        dailyMin: Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min.slice(0, 3) : [st.fallbackTemp - 4, st.fallbackTemp - 4, st.fallbackTemp - 3],
        dailyRainPct: Array.isArray(daily.precipitation_probability_max) ? daily.precipitation_probability_max.slice(0, 3) : [25, 30, 20],
        dailyCodes: Array.isArray(daily.weather_code) ? daily.weather_code.slice(0, 3) : [st.fallbackCode, 2, 1],
        isLive: Boolean(cur.temperature_2m !== undefined)
      };
    });

    ctx.state.weatherCache = { fetchedAt: Date.now(), isLive: merged.some((m) => m.isLive), stations: merged };
  } catch (e) {
    ctx.state.weatherCache = {
      fetchedAt: Date.now(),
      isLive: false,
      stations: WEATHER_STATIONS.map((st) => ({
        ...st,
        temp: st.fallbackTemp,
        humidity: st.fallbackHumidity,
        wind: st.fallbackWind,
        code: st.fallbackCode,
        dailyTimes: ['Jòdi-a', 'Dèmen', 'Apré-dèmen'],
        dailyMax: [st.fallbackTemp + 1, st.fallbackTemp + 1, st.fallbackTemp],
        dailyMin: [st.fallbackTemp - 4, st.fallbackTemp - 4, st.fallbackTemp - 4],
        dailyRainPct: [20, 30, 15],
        dailyCodes: [st.fallbackCode, 2, 1],
        isLive: false
      }))
    };
  }
  ctx.state.weatherLoading = false;
  return ctx.state.weatherCache;
}

export function renderHeroWeatherChip(ctx) {
  const el = document.getElementById('heroWeatherChip');
  if (!el) return;
  const stations = ctx.state.weatherCache?.stations;
  const fdf = (stations && stations[0]) || { temp: 29, wind: 19, code: 2, isLive: false };
  const wmo = translateWmoToCreole(fdf.code);
  el.innerHTML = `
    <button type="button" class="km-hero-weather-btn" id="heroWeatherJumpBtn" title="View Martinique Live Weather & Creole Forecast">
      <i class="fas ${wmo.icon}" style="color:${wmo.tone};"></i>
      <span><strong>Fòdfrans ${fdf.temp}°C</strong> · ${escapeHtml(wmo.creole)} · Alizé ${fdf.wind} km/h</span>
    </button>
  `;
  el.querySelector('#heroWeatherJumpBtn')?.addEventListener('click', () => {
    ctx.state.cultureTab = 'weather';
    ctx.actions.jumpToAccordion('acc-culture');
  });
}

// =========================================================
// KWIZIN MATINIK, WEATHER, HERITAGE & 115+ PHOTO GALLERY HUB
// =========================================================
export function renderCulinaryWeatherCultureSection(container, ctx) {
  if (!container) return;
  const tab = ctx.state.cultureTab || 'culinary';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.7rem; margin-bottom:0.95rem;">
      <div class="km-seg-group" role="tablist" aria-label="Culture, Culinary, Weather & Photo Gallery">
        <button type="button" class="km-seg-btn ${tab === 'culinary' ? 'active' : ''}" data-cul-tab="culinary">
          <i class="fas fa-utensils"></i> Kwizin Matinik (${CULINARY_HERITAGE.length})
        </button>
        <button type="button" class="km-seg-btn ${tab === 'weather' ? 'active' : ''}" data-cul-tab="weather">
          <i class="fas fa-cloud-sun"></i> Live Weather (Tan-an)
        </button>
        <button type="button" class="km-seg-btn ${tab === 'traditions' ? 'active' : ''}" data-cul-tab="traditions">
          <i class="fas fa-drum"></i> Cultural Traditions (${CULTURAL_TRADITIONS_EXPANDED.length})
        </button>
        <button type="button" class="km-seg-btn ${tab === 'gallery' ? 'active' : ''}" data-cul-tab="gallery">
          <i class="fas fa-images"></i> Photo Gallery (${FULL_PHOTO_GALLERY.length})
        </button>
      </div>
    </div>

    <div id="cultureTabBody"></div>
  `;

  container.querySelectorAll('[data-cul-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.cultureTab = btn.getAttribute('data-cul-tab');
      renderCulinaryWeatherCultureSection(container, ctx);
    });
  });

  const body = container.querySelector('#cultureTabBody');
  if (tab === 'culinary') renderCulinaryTab(body, ctx);
  else if (tab === 'weather') renderWeatherTab(body, ctx);
  else if (tab === 'traditions') renderTraditionsTab(body, ctx);
  else renderFullGalleryTab(body, ctx);
}

function renderCulinaryTab(body, ctx) {
  const activeId = ctx.state.selectedDishId || CULINARY_HERITAGE[0].id;
  const dish = CULINARY_HERITAGE.find((d) => d.id === activeId) || CULINARY_HERITAGE[0];
  const trackId = `cul-${dish.id}`;

  body.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:0.45rem; margin-bottom:0.9rem;">
      ${CULINARY_HERITAGE.map((d) => `
        <button type="button" class="km-btn km-btn-sm ${d.id === dish.id ? 'km-btn-primary' : ''}" data-dish-select="${escapeHtml(d.id)}">
          ${escapeHtml(d.name)}
        </button>
      `).join('')}
    </div>

    <div class="km-culinary-spotlight km-subpanel">
      <div class="km-culinary-grid">
        <img src="${escapeHtml(dish.image)}" alt="${escapeHtml(dish.name)}" referrerpolicy="no-referrer"
          style="width:100%; height:245px; object-fit:cover; border-radius:14px; border:1px solid var(--hairline);">
        <div style="display:flex; flex-direction:column; gap:0.55rem;">
          <div class="km-meta-line km-mono">${escapeHtml(dish.category)}</div>
          <h3 style="font-size:1.45rem;">${escapeHtml(dish.name)}</h3>
          <div class="km-meta-line km-mono">${escapeHtml(dish.phonetic)}</div>
          ${renderCustomAudioPlayerBarHtml(trackId, dish.spokenPhrase, '', ctx.settings)}
          <p style="font-size:0.9rem; color:var(--ink-secondary);">${escapeHtml(dish.origin)}</p>
          <div style="background:var(--surface-solid); padding:0.7rem 0.85rem; border-radius:10px; border:1px solid var(--hairline); font-size:0.86rem;">
            <strong>Traditional Preparation:</strong> ${escapeHtml(dish.preparation)}
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:0.2rem;">
            <button type="button" class="km-btn km-btn-sm km-btn-emerald" id="culOpenFoodDeckBtn">
              <i class="fas fa-layer-group"></i> Practice Manjé Flashcards
            </button>
            <button type="button" class="km-btn km-btn-sm" id="culAskTutorBtn">
              <i class="fas fa-comments"></i> Ask Man Mayotte About Recipe
            </button>
          </div>
        </div>
      </div>

      <div style="margin-top:0.95rem;">
        <div class="km-meta-line" style="margin-bottom:0.45rem;">Key Creole Culinary Glossary</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:0.65rem;">
          ${dish.ingredients.map((ing) => `
            <div style="background:var(--surface-solid); border:1px solid var(--hairline); border-radius:10px; padding:0.62rem 0.78rem;">
              <strong style="font-size:0.9rem; color:var(--cobalt);">${escapeHtml(ing.cr)}</strong>
              <div style="font-size:0.82rem; color:var(--ink-secondary); margin-top:2px;">${escapeHtml(ing.meaning)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const tracks = new Map([[trackId, { text: dish.spokenPhrase, exampleText: '', translationText: dish.name }]]);
  wireCustomAudioPlayers(body, tracks, ctx);

  body.querySelectorAll('[data-dish-select]').forEach((b) => {
    b.addEventListener('click', () => {
      ctx.state.selectedDishId = b.getAttribute('data-dish-select');
      renderCulinaryTab(body, ctx);
    });
  });

  body.querySelector('#culOpenFoodDeckBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('food'));
  body.querySelector('#culAskTutorBtn')?.addEventListener('click', () => {
    ctx.actions.openTutorWithPrompt(`Share the traditional Creole names and family preparation ritual for ${dish.name} in Martinique.`);
  });
}

function renderWeatherTab(body, ctx) {
  const cache = ctx.state.weatherCache;
  if (!cache && !ctx.state.weatherLoading) {
    fetchMartiniqueWeather(ctx).then(() => {
      const mount = document.getElementById('cultureMount');
      if (ctx.state.cultureTab === 'weather' && mount) {
        renderWeatherTab(mount.querySelector('#cultureTabBody'), ctx);
      }
      renderHeroWeatherChip(ctx);
    });
  }

  const stations = cache?.stations || WEATHER_STATIONS.map((s) => ({
    ...s,
    temp: s.fallbackTemp,
    humidity: s.fallbackHumidity,
    wind: s.fallbackWind,
    code: s.fallbackCode,
    dailyTimes: ['Jòdi-a', 'Dèmen', 'Apré-dèmen'],
    dailyMax: [s.fallbackTemp + 1, s.fallbackTemp + 1, s.fallbackTemp],
    dailyMin: [s.fallbackTemp - 4, s.fallbackTemp - 4, s.fallbackTemp - 4],
    dailyRainPct: [20, 30, 15],
    dailyCodes: [s.fallbackCode, 2, 1],
    isLive: false
  }));

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.65rem; margin-bottom:0.85rem;">
      <div>
        <strong style="font-size:1.08rem;">Live Island Microclimates &amp; Creole Weather Forecast</strong>
        <div class="km-meta-line">${cache?.isLive ? 'Synced live from Open-Meteo Martinique Telemetry' : 'Seasonal Climatology Baseline (refreshing when online)'}</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="km-btn km-btn-sm" id="weatherRefreshBtn">
          <i class="fas fa-rotate ${ctx.state.weatherLoading ? 'fa-spin' : ''}"></i> Refresh Forecast
        </button>
        <button type="button" class="km-btn km-btn-sm km-btn-primary" id="weatherOpenDeckBtn">
          <i class="fas fa-layer-group"></i> Weather Deck
        </button>
      </div>
    </div>

    <div class="km-weather-grid">
      ${stations.map((st) => {
        const wmo = translateWmoToCreole(st.code);
        return `
          <article class="km-subpanel" style="display:flex; flex-direction:column; gap:0.45rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <div class="km-meta-line">${escapeHtml(st.creoleName)}</div>
                <strong style="font-size:1rem;">${escapeHtml(st.name)}</strong>
              </div>
              <span style="font-size:1.55rem; color:${wmo.tone};"><i class="fas ${wmo.icon}"></i></span>
            </div>
            <div style="display:flex; align-items:baseline; gap:0.65rem;">
              <span class="km-mono" style="font-size:1.75rem; font-weight:700; color:var(--ink-primary);">${st.temp}°C</span>
              <span style="font-weight:700; font-size:0.88rem; color:${wmo.tone};">${escapeHtml(wmo.creole)}</span>
            </div>
            <div class="km-meta-line km-mono">Wind (Alizé): ${st.wind} km/h · Humidity: ${st.humidity}%</div>
            <p style="font-size:0.81rem; color:var(--ink-secondary);">${escapeHtml(st.microclimate)}</p>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-top:auto; padding-top:0.45rem; border-top:1px solid var(--hairline);">
              ${st.dailyTimes.map((day, idx) => {
                const dw = translateWmoToCreole(st.dailyCodes[idx]);
                const lbl = idx === 0 ? 'Jòdi-a' : idx === 1 ? 'Dèmen' : String(day).slice(5);
                return `
                  <div style="text-align:center; font-size:0.75rem; background:var(--surface-solid); padding:0.35rem 0.25rem; border-radius:8px; border:1px solid var(--hairline);">
                    <div style="font-weight:700;">${escapeHtml(lbl)}</div>
                    <i class="fas ${dw.icon}" style="color:${dw.tone}; margin:3px 0;"></i>
                    <div class="km-mono">${Math.round(st.dailyMax[idx])}°/${Math.round(st.dailyMin[idx])}°</div>
                  </div>
                `;
              }).join('')}
            </div>
          </article>
        `;
      }).join('')}
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:0.75rem; margin-top:0.95rem;">
      ${MARTINIQUE_SEASONS.map((sn) => `
        <article class="km-vocab-card">
          <div class="km-meta-line km-mono">${escapeHtml(sn.months)}</div>
          <strong style="font-size:1rem;">${escapeHtml(sn.creole)}</strong>
          <p style="font-size:0.84rem; color:var(--ink-secondary);">${escapeHtml(sn.details)}</p>
        </article>
      `).join('')}
    </div>

    <div style="margin-top:0.95rem;">
      <div class="km-meta-line" style="margin-bottom:0.45rem;">Spoken Creole Weather Phrasebook (Tap Play)</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:0.65rem;">
        ${CREOLE_WEATHER_PHRASES.map((wp) => `
          <article class="km-vocab-card" style="padding:0.8rem;">
            <strong style="font-size:0.96rem;">${escapeHtml(wp.creole)}</strong>
            <div class="km-meta-line km-mono">${escapeHtml(wp.phonetic)}</div>
            ${renderCustomAudioPlayerBarHtml(wp.id, wp.creole, '', ctx.settings)}
            <div style="font-size:0.83rem; color:var(--emerald); font-weight:600;">${escapeHtml(ctx.state.lang === 'fr' ? wp.fr : wp.en)}</div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  const wTracks = new Map();
  CREOLE_WEATHER_PHRASES.forEach((wp) => {
    wTracks.set(wp.id, { text: wp.creole, exampleText: '', translationText: ctx.state.lang === 'fr' ? wp.fr : wp.en });
  });
  wireCustomAudioPlayers(body, wTracks, ctx);

  body.querySelector('#weatherRefreshBtn')?.addEventListener('click', async () => {
    await fetchMartiniqueWeather(ctx, true);
    renderWeatherTab(body, ctx);
    renderHeroWeatherChip(ctx);
    ctx.actions.notify('Martinique live weather updated!');
  });

  body.querySelector('#weatherOpenDeckBtn')?.addEventListener('click', () => ctx.actions.openFlashcards('weather'));
}

function renderTraditionsTab(body, ctx) {
  body.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(285px, 1fr)); gap:0.85rem;">
      ${CULTURAL_TRADITIONS_EXPANDED.map((tr) => `
        <article class="km-vocab-card">
          <div class="km-meta-line"><i class="fas ${escapeHtml(tr.icon)}" style="color:var(--emerald);"></i> ${escapeHtml(tr.heritageLink)}</div>
          <strong style="font-size:1.08rem;">${escapeHtml(tr.title)}</strong>
          <div style="font-size:0.82rem; font-weight:700; color:var(--cobalt);">${escapeHtml(tr.creoleSubtitle)}</div>
          <p style="font-size:0.85rem; color:var(--ink-secondary); flex:1;">${escapeHtml(tr.summary)}</p>
          <button type="button" class="km-btn km-btn-sm km-btn-primary" data-trad-speak="${escapeHtml(tr.spokenPhrase)}">
            <i class="fas fa-volume-up"></i> « ${escapeHtml(tr.spokenPhrase)} »
          </button>
        </article>
      `).join('')}
    </div>
  `;

  body.querySelectorAll('[data-trad-speak]').forEach((btn) => {
    btn.addEventListener('click', () => {
      speakTermSequence(btn.getAttribute('data-trad-speak'), '', {
        settings: { ...ctx.settings, translationPlayback: false },
        lang: ctx.state.lang,
        btnEl: btn,
        onListened: ctx.actions.registerWordListened
      });
    });
  });
}

function renderFullGalleryTab(body, ctx) {
  const cat = ctx.state.galleryCat || 'all';
  const q = (ctx.state.galleryQuery || '').trim().toLowerCase();
  const limit = ctx.state.galleryLimit || 24;

  const filtered = FULL_PHOTO_GALLERY.filter((item) => {
    if (cat !== 'all' && item.cat !== cat) return false;
    if (!q) return true;
    return `${item.title} ${item.caption} ${item.locId} ${item.cat}`.toLowerCase().includes(q);
  });

  const shown = filtered.slice(0, limit);
  const categories = [
    { key: 'all', label: `All (${FULL_PHOTO_GALLERY.length})` },
    { key: 'communes', label: 'Communes' },
    { key: 'historical', label: 'Historical' },
    { key: 'offbeat', label: 'Secret Spots' },
    { key: 'culinary', label: 'Culinary Art' },
    { key: 'weather', label: 'Weather & Skies' },
    { key: 'culture', label: 'Bèlè & Heritage' }
  ];

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.65rem; margin-bottom:0.85rem;">
      <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
        ${categories.map((c) => `
          <button type="button" class="km-btn km-btn-sm ${cat === c.key ? 'km-btn-primary' : ''}" data-gal-cat="${c.key}">
            ${escapeHtml(c.label)}
          </button>
        `).join('')}
      </div>
      <input type="search" id="galArchiveSearchInput" class="km-input" style="max-width:270px;"
        value="${escapeHtml(ctx.state.galleryQuery || '')}"
        placeholder="Search places, dishes, weather...">
    </div>

    <div class="km-meta-line" style="margin-bottom:0.75rem;">
      Showing ${shown.length} of ${filtered.length} island photographs · Tap any frame to inspect full view or explore commune
    </div>

    <div class="km-gallery-archive-grid">
      ${shown.map((photo, idx) => `
        <article class="km-gallery-photo-card" data-open-archive-idx="${idx}" tabindex="0" role="button" aria-label="View ${escapeHtml(photo.title)}">
          <div class="km-gallery-photo-frame">
            <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.title)}" loading="lazy" referrerpolicy="no-referrer"
              style="object-position:${escapeHtml(photo.crop || '50% 50%')};">
          </div>
          <div class="km-gallery-photo-meta">
            <span class="km-meta-line km-mono" style="text-transform:uppercase;">${escapeHtml(photo.cat)}</span>
            <strong style="font-size:0.9rem; line-height:1.25;">${escapeHtml(photo.title)}</strong>
            <span style="font-size:0.78rem; color:var(--ink-secondary); line-height:1.35;">${escapeHtml(photo.caption)}</span>
          </div>
        </article>
      `).join('')}
    </div>

    ${filtered.length > shown.length ? `
      <div style="text-align:center; margin-top:1rem;">
        <button type="button" class="km-btn km-btn-primary" id="galLoadMoreBtn">
          Load 24 More Island Pictures (${filtered.length - shown.length} remaining)
        </button>
      </div>
    ` : ''}
  `;

  body.querySelectorAll('[data-gal-cat]').forEach((b) => {
    b.addEventListener('click', () => {
      ctx.state.galleryCat = b.getAttribute('data-gal-cat');
      ctx.state.galleryLimit = 24;
      renderFullGalleryTab(body, ctx);
    });
  });

  const sInput = body.querySelector('#galArchiveSearchInput');
  if (sInput) {
    sInput.addEventListener('input', (ev) => {
      ctx.state.galleryQuery = ev.target.value;
      ctx.state.galleryLimit = 24;
      const pos = ev.target.selectionStart;
      renderFullGalleryTab(body, ctx);
      const next = body.querySelector('#galArchiveSearchInput');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });
  }

  body.querySelector('#galLoadMoreBtn')?.addEventListener('click', () => {
    ctx.state.galleryLimit = (ctx.state.galleryLimit || 24) + 24;
    renderFullGalleryTab(body, ctx);
  });

  body.querySelectorAll('[data-open-archive-idx]').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = Number(card.getAttribute('data-open-archive-idx') || 0);
      const photo = shown[idx];
      if (!photo) return;
      ctx.actions.openArchiveGallery(filtered, idx);
    });
  });
}
