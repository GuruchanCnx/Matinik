import { HERITAGE_MODULES } from '../data/curriculum.js';
import { MAP_LOCATIONS } from '../data/mapData.js';
import { FLASHCARD_DECKS } from '../data/vocab.js';
import { sanitizeLocationSlug, sanitizeSafeUrl } from '../firebase.js';
import { escapeHtml, sanitizeRichHtml } from './curriculumAndQuiz.js';

function getDefaultVocabCards() {
  return [
    { word: '', pronounce: '', pos: 'Phrase', en: '', fr: '', ex: '' }
  ];
}

export function renderAdminStudioWorkspace(container, ctx) {
  if (!container) return;

  const rbac = ctx.rbac || {
    authorized: Boolean(ctx.isAdmin),
    role: ctx.isAdmin ? 'admin' : ctx.user ? 'learner' : 'guest',
    emailVerified: Boolean(ctx.user?.emailVerified),
    uid: ctx.user?.uid || '',
    email: ctx.user?.email || '',
    source: 'none',
    reason: ctx.user ? 'Role verification pending.' : 'Sign in with a verified administrator account.'
  };

  const tab = ctx.state.adminTab || 'vocab';
  const searchQ = (ctx.state.adminSearch || '').trim().toLowerCase();

  const totalVocabSets = new Set([
    ...Object.keys(FLASHCARD_DECKS),
    ...(ctx.cloud.vocabSets || []).map((v) => v.id)
  ]).size;
  const totalCulturalSites = new Set([
    ...Object.keys(MAP_LOCATIONS),
    ...(ctx.cloud.mapLocations || []).map((m) => m.id)
  ]).size;
  const totalModules = HERITAGE_MODULES.length + (ctx.cloud.lessons || []).length;
  const totalDictAndProverbs = (ctx.cloud.dictionary || []).length + (ctx.cloud.proverbs || []).length;

  const roleSummaryText = rbac.authorized
    ? `Verified Admin · ${rbac.email} (${rbac.source === 'admins-collection' ? 'Firestore /admins RBAC' : 'Verified Primary Admin'})`
    : ctx.user
      ? `${rbac.emailVerified ? 'Standard Learner' : 'Unverified Email'} · ${rbac.email || rbac.uid}`
      : 'Guest Session · Not Signed In';

  container.innerHTML = `
    <div class="km-admin-studio-page">
      <!-- Top Studio Header Bar -->
      <div class="km-card km-admin-topbar">
        <div class="km-admin-breadcrumb-col">
          <div class="km-meta-line">Kréyòl Matinik / Admin Studio</div>
          <h1 class="km-admin-heading">Curriculum, Vocabulary &amp; Heritage Site Manager</h1>
          <div class="km-meta-line km-rbac-line ${rbac.authorized ? 'is-ok' : 'is-warn'}">
            <i class="fas ${rbac.authorized ? 'fa-shield-halved' : 'fa-lock'}" aria-hidden="true"></i>
            <span>${escapeHtml(roleSummaryText)}</span>
          </div>
        </div>
        <div class="km-admin-top-actions">
          <button type="button" class="km-btn km-btn-sm" id="adminReverifyRbacBtn">
            <i class="fas fa-rotate"></i> Re-verify RBAC
          </button>
          <button type="button" class="km-btn km-btn-sm km-btn-primary" id="adminExitStudioBtn">
            <i class="fas fa-arrow-left"></i> Back to Learning
          </button>
        </div>
      </div>

      ${!rbac.authorized ? renderRbacDeniedGate(ctx, rbac) : `
        <!-- KPI Overview Row -->
        <div class="km-stats-row km-admin-kpi-row">
          <div class="km-stat-tile">
            <div class="km-stat-label">Vocabulary Sets</div>
            <div class="km-stat-val tabular-nums">${totalVocabSets}</div>
            <div class="km-meta-line">${(ctx.cloud.vocabSets || []).length} live in Firestore</div>
          </div>
          <div class="km-stat-tile">
            <div class="km-stat-label">Cultural Sites</div>
            <div class="km-stat-val tabular-nums">${totalCulturalSites}</div>
            <div class="km-meta-line">${(ctx.cloud.mapLocations || []).length} live OSM pins</div>
          </div>
          <div class="km-stat-tile">
            <div class="km-stat-label">Learning Modules</div>
            <div class="km-stat-val tabular-nums">${totalModules}</div>
            <div class="km-meta-line">${(ctx.cloud.lessons || []).length} cloud micro-lessons</div>
          </div>
          <div class="km-stat-tile">
            <div class="km-stat-label">Dictionary &amp; Proverbs</div>
            <div class="km-stat-val tabular-nums">${totalDictAndProverbs}</div>
            <div class="km-meta-line">${(ctx.cloud.dictionary || []).length} terms · ${(ctx.cloud.proverbs || []).length} proverbs</div>
          </div>
          <div class="km-stat-tile">
            <div class="km-stat-label">Firebase RBAC</div>
            <div class="km-stat-val tabular-nums" style="color:var(--emerald);">Admin</div>
            <div class="km-meta-line">Verified UID ${escapeHtml((rbac.uid || '').slice(0, 8))}</div>
          </div>
        </div>

        <!-- Tab Navigation & Quick Filter -->
        <div class="km-admin-toolbar">
          <div class="km-seg-group" role="tablist" aria-label="Admin Studio sections">
            <button type="button" role="tab" aria-selected="${tab === 'vocab'}" class="km-seg-btn ${tab === 'vocab' ? 'active' : ''}" data-admin-tab="vocab">
              Vocabulary Sets
            </button>
            <button type="button" role="tab" aria-selected="${tab === 'sites'}" class="km-seg-btn ${tab === 'sites' ? 'active' : ''}" data-admin-tab="sites">
              Cultural Sites
            </button>
            <button type="button" role="tab" aria-selected="${tab === 'modules'}" class="km-seg-btn ${tab === 'modules' ? 'active' : ''}" data-admin-tab="modules">
              Learning Modules
            </button>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex:1; justify-content:flex-end; min-width:220px;">
            <input type="search" id="adminFilterInput" class="km-input" style="max-width:300px;"
              value="${escapeHtml(ctx.state.adminSearch || '')}"
              placeholder="Filter ${tab === 'vocab' ? 'vocabulary sets' : tab === 'sites' ? 'cultural sites' : 'modules & terms'}...">
          </div>
        </div>

        <!-- Tab Workspace Content -->
        <div class="km-card km-admin-body">
          ${tab === 'vocab' ? renderVocabSetsTab(ctx, searchQ) : tab === 'sites' ? renderCulturalSitesTab(ctx, searchQ) : renderLearningModulesTab(ctx, searchQ)}
        </div>
      `}
    </div>
  `;

  container.querySelector('#adminExitStudioBtn')?.addEventListener('click', () => {
    ctx.actions.setAppView('learner');
  });

  container.querySelector('#adminReverifyRbacBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    await ctx.actions.reverifyAdminRbac();
    if (document.body.contains(btn)) btn.disabled = false;
  });

  if (!rbac.authorized) {
    container.querySelector('#rbacSignInBtn')?.addEventListener('click', () => ctx.actions.openAuthModal(true));
    container.querySelector('#rbacResendVerifyBtn')?.addEventListener('click', () => ctx.actions.resendVerification());
    container.querySelector('#rbacRetryCheckBtn')?.addEventListener('click', () => ctx.actions.reverifyAdminRbac());
    return;
  }

  container.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.adminTab = btn.getAttribute('data-admin-tab');
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  const filterEl = container.querySelector('#adminFilterInput');
  if (filterEl) {
    filterEl.addEventListener('input', (ev) => {
      ctx.state.adminSearch = ev.target.value;
      const pos = ev.target.selectionStart;
      renderAdminStudioWorkspace(container, ctx);
      const next = container.querySelector('#adminFilterInput');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });
  }

  if (tab === 'vocab') wireVocabSetsTab(container, ctx);
  else if (tab === 'sites') wireCulturalSitesTab(container, ctx);
  else wireLearningModulesTab(container, ctx);
}

function renderRbacDeniedGate(ctx, rbac) {
  const hasUser = Boolean(ctx.user);
  const needsVerification = hasUser && !rbac.emailVerified;

  return `
    <section class="km-card km-rbac-gate" aria-label="Firebase Role-Based Access Control">
      <div style="max-width:620px; display:flex; flex-direction:column; gap:0.75rem;">
        <div class="km-meta-line">Firebase Auth · Role-Based Access Control</div>
        <h2 style="font-size:1.45rem;">Administrator Clearance Required</h2>
        <p style="font-size:0.94rem; color:var(--ink-secondary); line-height:1.58;">
          ${escapeHtml(rbac.reason || 'Admin Studio mutations are protected by Firebase Auth verification, Firestore /admins/{uid} rules, and server-side Bearer token checks.')}
        </p>

        <div class="km-rbac-checklist">
          <div class="km-rbac-check-row">
            <span>Firebase Authentication</span>
            <strong class="km-mono">${hasUser ? `Signed in (${escapeHtml(rbac.email || rbac.uid)})` : 'Not signed in'}</strong>
          </div>
          <div class="km-rbac-check-row">
            <span>Verified Email Claim</span>
            <strong class="km-mono">${rbac.emailVerified ? 'Verified' : 'Unverified'}</strong>
          </div>
          <div class="km-rbac-check-row">
            <span>Assigned Role</span>
            <strong class="km-mono">${escapeHtml(rbac.role)}</strong>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:0.25rem;">
          ${!hasUser ? `
            <button type="button" class="km-btn km-btn-primary" id="rbacSignInBtn">
              <i class="fas fa-user-shield"></i> Sign In with Firebase Auth
            </button>
          ` : ''}
          ${needsVerification ? `
            <button type="button" class="km-btn km-btn-primary" id="rbacResendVerifyBtn">
              <i class="fas fa-envelope"></i> Resend Verification Email
            </button>
          ` : ''}
          <button type="button" class="km-btn" id="rbacRetryCheckBtn">
            <i class="fas fa-rotate"></i> Check Admin Role Again
          </button>
          ${hasUser ? `
            <button type="button" class="km-btn" id="rbacSignInBtn">
              Switch Account
            </button>
          ` : ''}
        </div>
      </div>
    </section>
  `;
}

// =========================================================
// TAB 1: VOCABULARY SETS MANAGER (/vocabSets)
// =========================================================
function renderVocabSetsTab(ctx, searchQ) {
  if (!ctx.state.adminVocabDraft) {
    ctx.state.adminVocabDraft = {
      id: '',
      title: '',
      level: 'beginner',
      unlockStep: 1,
      imageUrl: '',
      cards: getDefaultVocabCards()
    };
  }
  const draft = ctx.state.adminVocabDraft;

  const cloudById = new Map((ctx.cloud.vocabSets || []).map((s) => [s.id, s]));
  const combined = [];

  (ctx.cloud.vocabSets || []).forEach((s) => {
    combined.push({
      id: s.id,
      title: s.title,
      level: s.level || 'beginner',
      unlockStep: Number(s.unlockStep || 1),
      cardCount: Array.isArray(s.cards) ? s.cards.length : Number(s.cardCount || 0),
      cards: s.cards || [],
      imageUrl: s.imageUrl || '',
      isCloud: true
    });
  });

  Object.entries(FLASHCARD_DECKS).forEach(([k, d]) => {
    if (cloudById.has(k)) return;
    combined.push({
      id: k,
      title: d.title,
      level: d.level || 'beginner',
      unlockStep: 1,
      cardCount: (d.cards || []).length,
      cards: d.cards || [],
      imageUrl: d.image || '',
      isCloud: false
    });
  });

  const filtered = combined.filter((item) => {
    if (!searchQ) return true;
    return `${item.id} ${item.title} ${item.level}`.toLowerCase().includes(searchQ);
  });

  return `
    <div class="km-admin-split">
      <!-- Vocabulary Set Editor -->
      <form id="studioVocabForm" class="km-admin-form-col">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong style="font-size:1.04rem;">${draft.id ? `Editing Set: ${escapeHtml(draft.title || draft.id)}` : 'Create Vocabulary Set'}</strong>
          <button type="button" class="km-btn km-btn-sm" id="studioVocabResetBtn">New Set</button>
        </div>

        <div class="km-admin-grid-2">
          <div>
            <label class="km-stat-label" for="svId">Deck Slug ID</label>
            <input type="text" id="svId" class="km-input" value="${escapeHtml(draft.id)}" placeholder="e.g. market_spices (auto if blank)">
          </div>
          <div>
            <label class="km-stat-label" for="svTitle">Set Title *</label>
            <input type="text" id="svTitle" class="km-input" value="${escapeHtml(draft.title)}" placeholder="e.g. Maché &amp; Spices" required>
          </div>
          <div>
            <label class="km-stat-label" for="svLevel">Difficulty Level</label>
            <select id="svLevel" class="km-select">
              ${['beginner', 'intermediate', 'advanced', 'master'].map((lv) => `<option value="${lv}" ${draft.level === lv ? 'selected' : ''}>${lv}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="km-stat-label" for="svUnlockStep">Learning Path Unlock Stage</label>
            <select id="svUnlockStep" class="km-select">
              ${[1, 2, 3, 4, 5, 6].map((st) => `<option value="${st}" ${Number(draft.unlockStep) === st ? 'selected' : ''}>Stage ${st}${st === 1 ? ' (Unlocked Immediately)' : ''}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end;">
          <div style="flex:1; min-width:200px;">
            <label class="km-stat-label" for="svImageUrl">Cover Image Path or URL</label>
            <input type="text" id="svImageUrl" class="km-input" value="${escapeHtml(draft.imageUrl)}" placeholder="./src/assets/images/... or uploaded">
          </div>
          <label class="km-btn km-btn-sm" style="cursor:pointer;">
            <i class="fas fa-image"></i> Upload Cover
            <input type="file" id="svImageUploadInput" accept="image/*" style="display:none;">
          </label>
        </div>

        <div class="km-admin-cards-head">
          <strong style="font-size:0.92rem;">Vocabulary Terms in Set (${draft.cards.length} / 30)</strong>
          <button type="button" class="km-btn km-btn-sm" id="svAddCardBtn"><i class="fas fa-plus"></i> Add Term</button>
        </div>

        <div class="km-admin-card-rows">
          ${draft.cards.map((c, idx) => `
            <div class="km-admin-card-row" data-card-idx="${idx}">
              <div class="km-admin-grid-3">
                <input type="text" class="km-input" data-vc-field="word" value="${escapeHtml(c.word)}" placeholder="Creole Word *" required>
                <input type="text" class="km-input" data-vc-field="en" value="${escapeHtml(c.en)}" placeholder="English *" required>
                <input type="text" class="km-input" data-vc-field="fr" value="${escapeHtml(c.fr)}" placeholder="French *" required>
              </div>
              <div class="km-admin-grid-3" style="margin-top:6px;">
                <input type="text" class="km-input" data-vc-field="pronounce" value="${escapeHtml(c.pronounce || '')}" placeholder="Phonetics [bohn-zhoo]">
                <input type="text" class="km-input" data-vc-field="pos" value="${escapeHtml(c.pos || 'Phrase')}" placeholder="Part of Speech">
                <div style="display:flex; gap:6px;">
                  <input type="text" class="km-input" data-vc-field="ex" value="${escapeHtml(c.ex || '')}" placeholder="Example sentence">
                  <button type="button" class="km-btn km-btn-sm" data-vc-remove="${idx}" aria-label="Remove term" ${draft.cards.length <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <button type="submit" class="km-btn km-btn-primary">
          <i class="fas fa-cloud-arrow-up"></i> Save Vocabulary Set to Firestore
        </button>
      </form>

      <!-- Vocabulary Sets Registry Table -->
      <div class="km-admin-list-col">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:0.65rem;">
          <strong style="font-size:1rem;">Vocabulary Sets Directory (${filtered.length})</strong>
          <button type="button" class="km-btn km-btn-sm" id="svSeedAllBtn">
            <i class="fas fa-cloud-arrow-up"></i> Sync 20 Curated Sets
          </button>
        </div>

        ${!filtered.length ? `
          <div class="km-admin-empty">
            No vocabulary sets match « ${escapeHtml(searchQ)} ». Clear the filter or create a new set on the left.
          </div>
        ` : `
          <div class="km-admin-table-wrap">
            <table class="km-admin-table">
              <thead>
                <tr>
                  <th>Set Title</th>
                  <th>Level</th>
                  <th>Stage</th>
                  <th style="text-align:right;">Terms</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((item) => `
                  <tr>
                    <td>
                      <strong>${escapeHtml(item.title)}</strong>
                      <div class="km-meta-line km-mono">${escapeHtml(item.id)} · ${item.isCloud ? 'Firestore Live' : 'Curated Local'}</div>
                    </td>
                    <td>${escapeHtml(item.level)}</td>
                    <td class="km-mono tabular-nums">Stage ${item.unlockStep}</td>
                    <td class="km-mono tabular-nums" style="text-align:right;">${item.cardCount}</td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button type="button" class="km-btn km-btn-sm" data-edit-vocab="${escapeHtml(item.id)}">Edit</button>
                      ${item.isCloud ? `<button type="button" class="km-btn km-btn-sm" data-del-vocab="${escapeHtml(item.id)}" style="color:var(--crimson);">Delete</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function wireVocabSetsTab(container, ctx) {
  const syncDraftFromDom = () => {
    const draft = ctx.state.adminVocabDraft;
    if (!draft) return;
    draft.id = container.querySelector('#svId')?.value || '';
    draft.title = container.querySelector('#svTitle')?.value || '';
    draft.level = container.querySelector('#svLevel')?.value || 'beginner';
    draft.unlockStep = Number(container.querySelector('#svUnlockStep')?.value || 1);
    draft.imageUrl = container.querySelector('#svImageUrl')?.value || '';
    draft.cards = Array.from(container.querySelectorAll('.km-admin-card-row')).map((row) => ({
      word: row.querySelector('[data-vc-field="word"]')?.value || '',
      en: row.querySelector('[data-vc-field="en"]')?.value || '',
      fr: row.querySelector('[data-vc-field="fr"]')?.value || '',
      pronounce: row.querySelector('[data-vc-field="pronounce"]')?.value || '',
      pos: row.querySelector('[data-vc-field="pos"]')?.value || 'Phrase',
      ex: row.querySelector('[data-vc-field="ex"]')?.value || ''
    }));
  };

  container.querySelector('#studioVocabResetBtn')?.addEventListener('click', () => {
    ctx.state.adminVocabDraft = {
      id: '',
      title: '',
      level: 'beginner',
      unlockStep: 1,
      imageUrl: '',
      cards: getDefaultVocabCards()
    };
    renderAdminStudioWorkspace(container, ctx);
  });

  container.querySelector('#svAddCardBtn')?.addEventListener('click', () => {
    syncDraftFromDom();
    if (ctx.state.adminVocabDraft.cards.length >= 30) {
      ctx.actions.notify('Maximum 30 cards per vocabulary set.');
      return;
    }
    ctx.state.adminVocabDraft.cards.push({ word: '', pronounce: '', pos: 'Phrase', en: '', fr: '', ex: '' });
    renderAdminStudioWorkspace(container, ctx);
  });

  container.querySelectorAll('[data-vc-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncDraftFromDom();
      const idx = Number(btn.getAttribute('data-vc-remove'));
      if (ctx.state.adminVocabDraft.cards.length > 1) {
        ctx.state.adminVocabDraft.cards.splice(idx, 1);
        renderAdminStudioWorkspace(container, ctx);
      }
    });
  });

  container.querySelector('#svImageUploadInput')?.addEventListener('change', (e) => {
    syncDraftFromDom();
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileViaApi(file, ctx, (url) => {
      ctx.state.adminVocabDraft.imageUrl = url;
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelector('#studioVocabForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    syncDraftFromDom();
    const d = ctx.state.adminVocabDraft;
    await ctx.actions.adminSaveVocabSet({
      id: sanitizeLocationSlug(d.id || d.title),
      title: d.title,
      level: d.level,
      unlockStep: d.unlockStep,
      imageUrl: d.imageUrl,
      cards: d.cards
    });
  });

  container.querySelector('#svSeedAllBtn')?.addEventListener('click', () => {
    ctx.actions.adminSeedVocabSets();
  });

  container.querySelectorAll('[data-edit-vocab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-vocab');
      const cloudMatch = (ctx.cloud.vocabSets || []).find((v) => v.id === id);
      const localMatch = FLASHCARD_DECKS[id];
      const src = cloudMatch || localMatch;
      if (!src) return;
      ctx.state.adminVocabDraft = {
        id,
        title: src.title || id,
        level: src.level || 'beginner',
        unlockStep: Number(cloudMatch?.unlockStep || 1),
        imageUrl: cloudMatch?.imageUrl || localMatch?.image || '',
        cards: (src.cards || []).slice(0, 30).map((c) => ({
          word: c.word || '',
          en: c.en || '',
          fr: c.fr || '',
          pronounce: c.pronounce || '',
          pos: c.pos || 'Phrase',
          ex: c.ex || ''
        }))
      };
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelectorAll('[data-del-vocab]').forEach((btn) => {
    btn.addEventListener('click', () => ctx.actions.adminDeleteVocabSet(btn.getAttribute('data-del-vocab')));
  });
}

// =========================================================
// TAB 2: CULTURAL SITE DATA MANAGER (/mapLocations)
// =========================================================
function renderCulturalSitesTab(ctx, searchQ) {
  if (!ctx.state.adminSiteDraft) {
    ctx.state.adminSiteDraft = {
      id: '',
      name: '',
      creoleName: '',
      category: 'historical',
      region: '',
      lat: '',
      lng: '',
      audioPhrase: '',
      fact: '',
      tradition: '',
      proverb: '',
      imageUrl: ''
    };
  }
  const d = ctx.state.adminSiteDraft;
  const cloudById = new Map((ctx.cloud.mapLocations || []).map((m) => [m.id, m]));
  const combined = [];

  (ctx.cloud.mapLocations || []).forEach((m) => {
    combined.push({ ...m, isCloud: true });
  });
  Object.values(MAP_LOCATIONS).forEach((loc) => {
    if (cloudById.has(loc.id)) return;
    combined.push({
      id: loc.id,
      name: loc.name,
      creoleName: loc.creoleName,
      category: loc.category,
      region: loc.region,
      lat: loc.lat,
      lng: loc.lng,
      audioPhrase: loc.audioPhrase || loc.name,
      fact: loc.fact,
      tradition: loc.tradition || '',
      proverb: loc.proverb || '',
      imageUrl: loc.gallery?.[0]?.src || '',
      isCloud: false
    });
  });

  const filtered = combined.filter((loc) => {
    if (!searchQ) return true;
    return `${loc.id} ${loc.name} ${loc.creoleName} ${loc.region} ${loc.category}`.toLowerCase().includes(searchQ);
  });

  return `
    <div class="km-admin-split">
      <form id="studioSiteForm" class="km-admin-form-col">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong style="font-size:1.04rem;">${d.id ? `Editing Site: ${escapeHtml(d.name || d.id)}` : 'Add Cultural Map Site'}</strong>
          <button type="button" class="km-btn km-btn-sm" id="studioSiteResetBtn">New Site</button>
        </div>

        <div class="km-admin-grid-2">
          <div>
            <label class="km-stat-label" for="ssId">Site Slug ID</label>
            <input type="text" id="ssId" class="km-input" value="${escapeHtml(d.id)}" placeholder="Auto from name if blank">
          </div>
          <div>
            <label class="km-stat-label" for="ssName">Site Name *</label>
            <input type="text" id="ssName" class="km-input" value="${escapeHtml(d.name)}" placeholder="e.g. Anse Turin" required>
          </div>
          <div>
            <label class="km-stat-label" for="ssCreole">Creole Title *</label>
            <input type="text" id="ssCreole" class="km-input" value="${escapeHtml(d.creoleName)}" placeholder="e.g. Lans Tiren" required>
          </div>
          <div>
            <label class="km-stat-label" for="ssCat">Category</label>
            <select id="ssCat" class="km-select">
              <option value="historical" ${d.category === 'historical' ? 'selected' : ''}>Historical Site</option>
              <option value="offbeat" ${d.category === 'offbeat' ? 'selected' : ''}>Off the Beaten Path</option>
              <option value="commune" ${d.category === 'commune' ? 'selected' : ''}>Commune</option>
            </select>
          </div>
          <div>
            <label class="km-stat-label" for="ssRegion">Region / Parish *</label>
            <input type="text" id="ssRegion" class="km-input" value="${escapeHtml(d.region)}" placeholder="e.g. Nord Caraïbe" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>
              <label class="km-stat-label" for="ssLat">Lat *</label>
              <input type="number" step="any" id="ssLat" class="km-input" value="${escapeHtml(d.lat)}" placeholder="14.731" required>
            </div>
            <div>
              <label class="km-stat-label" for="ssLng">Lng *</label>
              <input type="number" step="any" id="ssLng" class="km-input" value="${escapeHtml(d.lng)}" placeholder="-61.178" required>
            </div>
          </div>
        </div>

        <input type="text" id="ssAudio" class="km-input" value="${escapeHtml(d.audioPhrase)}" placeholder="Creole spoken greeting or audio phrase">
        <textarea id="ssFact" class="km-textarea" rows="3" placeholder="Historical or cultural story shown on map card *" required>${escapeHtml(d.fact)}</textarea>

        <div class="km-admin-grid-2">
          <input type="text" id="ssTradition" class="km-input" value="${escapeHtml(d.tradition)}" placeholder="Living heritage tradition">
          <input type="text" id="ssProverb" class="km-input" value="${escapeHtml(d.proverb)}" placeholder="Related Creole proverb">
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end;">
          <div style="flex:1; min-width:200px;">
            <label class="km-stat-label" for="ssImage">Photo URL or Upload</label>
            <input type="text" id="ssImage" class="km-input" value="${escapeHtml(d.imageUrl)}" placeholder="./src/assets/images/... or uploaded">
          </div>
          <label class="km-btn km-btn-sm" style="cursor:pointer;">
            <i class="fas fa-image"></i> Upload Photo
            <input type="file" id="ssImageUploadInput" accept="image/*" style="display:none;">
          </label>
        </div>

        <button type="submit" class="km-btn km-btn-emerald">
          <i class="fas fa-map-pin"></i> Save Cultural Site to Firestore
        </button>
      </form>

      <div class="km-admin-list-col">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:0.65rem;">
          <strong style="font-size:1rem;">Martinique Cultural Sites (${filtered.length})</strong>
          <button type="button" class="km-btn km-btn-sm" id="ssSeedAllBtn">
            <i class="fas fa-cloud-arrow-up"></i> Sync 22 Curated Sites
          </button>
        </div>

        ${!filtered.length ? `
          <div class="km-admin-empty">
            No cultural sites match « ${escapeHtml(searchQ)} ».
          </div>
        ` : `
          <div class="km-admin-table-wrap">
            <table class="km-admin-table">
              <thead>
                <tr>
                  <th>Site &amp; Parish</th>
                  <th>Category</th>
                  <th>Coords</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((loc) => `
                  <tr>
                    <td>
                      <strong>${escapeHtml(loc.name)}</strong>
                      <div class="km-meta-line">${escapeHtml(loc.region)} · ${loc.isCloud ? 'Firestore Live' : 'Curated Local'}</div>
                    </td>
                    <td>${escapeHtml(loc.category)}</td>
                    <td class="km-mono tabular-nums">${Number(loc.lat).toFixed(2)}, ${Number(loc.lng).toFixed(2)}</td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button type="button" class="km-btn km-btn-sm" data-edit-site="${escapeHtml(loc.id)}">Edit</button>
                      ${loc.isCloud ? `<button type="button" class="km-btn km-btn-sm" data-del-site="${escapeHtml(loc.id)}" style="color:var(--crimson);">Delete</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function wireCulturalSitesTab(container, ctx) {
  const syncSiteFromDom = () => {
    const d = ctx.state.adminSiteDraft;
    if (!d) return;
    d.id = container.querySelector('#ssId')?.value || '';
    d.name = container.querySelector('#ssName')?.value || '';
    d.creoleName = container.querySelector('#ssCreole')?.value || '';
    d.category = container.querySelector('#ssCat')?.value || 'historical';
    d.region = container.querySelector('#ssRegion')?.value || '';
    d.lat = container.querySelector('#ssLat')?.value || '';
    d.lng = container.querySelector('#ssLng')?.value || '';
    d.audioPhrase = container.querySelector('#ssAudio')?.value || '';
    d.fact = container.querySelector('#ssFact')?.value || '';
    d.tradition = container.querySelector('#ssTradition')?.value || '';
    d.proverb = container.querySelector('#ssProverb')?.value || '';
    d.imageUrl = container.querySelector('#ssImage')?.value || '';
  };

  container.querySelector('#studioSiteResetBtn')?.addEventListener('click', () => {
    ctx.state.adminSiteDraft = {
      id: '', name: '', creoleName: '', category: 'historical', region: '',
      lat: '', lng: '', audioPhrase: '', fact: '', tradition: '', proverb: '', imageUrl: ''
    };
    renderAdminStudioWorkspace(container, ctx);
  });

  container.querySelector('#ssImageUploadInput')?.addEventListener('change', (e) => {
    syncSiteFromDom();
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileViaApi(file, ctx, (url) => {
      ctx.state.adminSiteDraft.imageUrl = url;
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelector('#studioSiteForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    syncSiteFromDom();
    const d = ctx.state.adminSiteDraft;
    await ctx.actions.adminCreateMapLocation({
      id: sanitizeLocationSlug(d.id || d.name),
      name: d.name,
      creoleName: d.creoleName,
      category: d.category,
      region: d.region,
      lat: d.lat,
      lng: d.lng,
      audioPhrase: d.audioPhrase,
      fact: d.fact,
      tradition: d.tradition,
      proverb: d.proverb,
      imageUrl: sanitizeSafeUrl(d.imageUrl) || ''
    });
  });

  container.querySelector('#ssSeedAllBtn')?.addEventListener('click', () => {
    ctx.actions.adminSeedMapLocations();
  });

  container.querySelectorAll('[data-edit-site]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-site');
      const cloudMatch = (ctx.cloud.mapLocations || []).find((m) => m.id === id);
      const localMatch = MAP_LOCATIONS[id];
      const src = cloudMatch || localMatch;
      if (!src) return;
      ctx.state.adminSiteDraft = {
        id,
        name: src.name || '',
        creoleName: src.creoleName || '',
        category: src.category || 'historical',
        region: src.region || '',
        lat: src.lat ?? '',
        lng: src.lng ?? '',
        audioPhrase: src.audioPhrase || '',
        fact: src.fact || '',
        tradition: src.tradition || '',
        proverb: src.proverb || '',
        imageUrl: cloudMatch?.imageUrl || localMatch?.gallery?.[0]?.src || ''
      };
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelectorAll('[data-del-site]').forEach((btn) => {
    btn.addEventListener('click', () => ctx.actions.adminDeleteMapLocation(btn.getAttribute('data-del-site')));
  });
}

// =========================================================
// TAB 3: LEARNING MODULES, DICTIONARY & PROVERBS
// =========================================================
function renderLearningModulesTab(ctx, searchQ) {
  if (!ctx.state.adminLessonDraft) {
    ctx.state.adminLessonDraft = {
      id: '',
      title: '',
      level: 'beginner',
      creoleSummary: '',
      bodyHtml: '<p>Write cultural notes, dialogue lines, or grammar tips here...</p>',
      funFact: '',
      imageUrl: ctx.state.adminImageUrl || '',
      attachmentName: ctx.state.adminFileName || '',
      attachmentUrl: ctx.state.adminFileUrl || ''
    };
  }
  const ld = ctx.state.adminLessonDraft;

  const cloudLessons = (ctx.cloud.lessons || []).filter((l) => {
    if (!searchQ) return true;
    return `${l.title} ${l.creoleSummary} ${l.level}`.toLowerCase().includes(searchQ);
  });

  return `
    <div class="km-admin-split">
      <!-- Rich-Text Learning Module Editor -->
      <form id="studioLessonForm" class="km-admin-form-col">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong style="font-size:1.04rem;">${ld.id ? `Editing Module: ${escapeHtml(ld.title)}` : 'Publish Rich-Text Learning Module'}</strong>
          <button type="button" class="km-btn km-btn-sm" id="studioLessonResetBtn">New Module</button>
        </div>

        <input type="text" id="slTitle" class="km-input" value="${escapeHtml(ld.title)}" placeholder="Module title *" required>
        <div class="km-admin-grid-2">
          <select id="slLevel" class="km-select">
            ${['beginner', 'intermediate', 'advanced', 'master'].map((lv) => `<option value="${lv}" ${ld.level === lv ? 'selected' : ''}>${lv}</option>`).join('')}
          </select>
          <input type="text" id="slSummary" class="km-input" value="${escapeHtml(ld.creoleSummary)}" placeholder="Creole phrase hook *" required>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="km-btn km-btn-sm" data-studio-rte="bold"><b>B</b></button>
          <button type="button" class="km-btn km-btn-sm" data-studio-rte="italic"><i>I</i></button>
          <button type="button" class="km-btn km-btn-sm" data-studio-rte="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
        </div>
        <div id="slBodyRte" class="km-rte-editor" contenteditable="true" aria-label="Rich text module editor">${sanitizeRichHtml(ld.bodyHtml)}</div>

        <input type="text" id="slFunFact" class="km-input" value="${escapeHtml(ld.funFact)}" placeholder="Optional cultural fun fact">

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <label class="km-btn km-btn-sm" style="cursor:pointer;">
            <i class="fas fa-image"></i> Upload Picture
            <input type="file" id="slImageInput" accept="image/*" style="display:none;">
          </label>
          <label class="km-btn km-btn-sm" style="cursor:pointer;">
            <i class="fas fa-paperclip"></i> Upload Study PDF/Audio
            <input type="file" id="slFileInput" accept=".pdf,.txt,audio/*,image/*" style="display:none;">
          </label>
          <span class="km-meta-line">${escapeHtml(ld.attachmentName || ld.imageUrl ? 'Media attached' : '')}</span>
        </div>

        <button type="submit" class="km-btn km-btn-primary">
          <i class="fas fa-cloud-arrow-up"></i> ${ld.id ? 'Update Learning Module' : 'Publish Learning Module to Firestore'}
        </button>
      </form>

      <!-- Cloud Modules Table + Quick Publishers -->
      <div class="km-admin-list-col" style="display:flex; flex-direction:column; gap:1rem;">
        <div>
          <strong style="font-size:1rem;">Published Learning Modules (${cloudLessons.length} Cloud · ${HERITAGE_MODULES.length} Core)</strong>
          ${!cloudLessons.length ? `
            <div class="km-admin-empty" style="margin-top:0.55rem;">
              No custom cloud learning modules yet. Publish your first rich-text lesson on the left.
            </div>
          ` : `
            <div class="km-admin-table-wrap" style="margin-top:0.55rem;">
              <table class="km-admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Level</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${cloudLessons.map((l) => `
                    <tr>
                      <td>
                        <strong>${escapeHtml(l.title)}</strong>
                        <div class="km-meta-line">${escapeHtml(l.creoleSummary || '')}</div>
                      </td>
                      <td>${escapeHtml(l.level)}</td>
                      <td style="text-align:right; white-space:nowrap;">
                        <button type="button" class="km-btn km-btn-sm" data-edit-lesson="${escapeHtml(l.id)}">Edit</button>
                        <button type="button" class="km-btn km-btn-sm" data-del-lesson="${escapeHtml(l.id)}" style="color:var(--crimson);">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Quick Dictionary Term & Proverb Publishers -->
        <form id="studioDictQuickForm" class="km-subpanel" style="display:flex; flex-direction:column; gap:0.55rem;">
          <strong style="font-size:0.95rem;">Quick Add Dictionary Term (${(ctx.cloud.dictionary || []).length} Cloud)</strong>
          <div class="km-admin-grid-2">
            <input type="text" id="sdqWord" class="km-input" placeholder="Creole word *" required>
            <input type="text" id="sdqPos" class="km-input" placeholder="Part of speech" value="Noun" required>
            <input type="text" id="sdqEn" class="km-input" placeholder="English *" required>
            <input type="text" id="sdqFr" class="km-input" placeholder="French *" required>
          </div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="sdqPron" class="km-input" placeholder="Phonetics">
            <select id="sdqLevel" class="km-select" style="width:160px;">
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
              <option value="master">master</option>
            </select>
          </div>
          <button type="submit" class="km-btn km-btn-sm km-btn-emerald">Save Dictionary Term</button>
        </form>

        <form id="studioProverbQuickForm" class="km-subpanel" style="display:flex; flex-direction:column; gap:0.55rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <strong style="font-size:0.95rem;">Hero Proverbs (${(ctx.cloud.proverbs || []).length} Cloud)</strong>
            <button type="button" class="km-btn km-btn-sm" id="studioSeedProverbsBtn">Sync 10 Curated Proverbs</button>
          </div>
          <input type="text" id="spqCreole" class="km-input" placeholder="Creole proverb *" required>
          <div class="km-admin-grid-2">
            <input type="text" id="spqEn" class="km-input" placeholder="English meaning *" required>
            <input type="text" id="spqFr" class="km-input" placeholder="French meaning *" required>
          </div>
          <button type="submit" class="km-btn km-btn-sm km-btn-primary">Publish Proverb</button>
        </form>
      </div>
    </div>
  `;
}

function wireLearningModulesTab(container, ctx) {
  const syncLessonFromDom = () => {
    const ld = ctx.state.adminLessonDraft;
    if (!ld) return;
    ld.title = container.querySelector('#slTitle')?.value || '';
    ld.level = container.querySelector('#slLevel')?.value || 'beginner';
    ld.creoleSummary = container.querySelector('#slSummary')?.value || '';
    ld.bodyHtml = container.querySelector('#slBodyRte')?.innerHTML || '';
    ld.funFact = container.querySelector('#slFunFact')?.value || '';
  };

  container.querySelectorAll('[data-studio-rte]').forEach((b) => {
    b.addEventListener('click', () => {
      document.execCommand(b.getAttribute('data-studio-rte'), false, null);
    });
  });

  container.querySelector('#studioLessonResetBtn')?.addEventListener('click', () => {
    ctx.state.adminLessonDraft = {
      id: '',
      title: '',
      level: 'beginner',
      creoleSummary: '',
      bodyHtml: '<p>Write cultural notes, dialogue lines, or grammar tips here...</p>',
      funFact: '',
      imageUrl: '',
      attachmentName: '',
      attachmentUrl: ''
    };
    renderAdminStudioWorkspace(container, ctx);
  });

  container.querySelector('#slImageInput')?.addEventListener('change', (e) => {
    syncLessonFromDom();
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileViaApi(file, ctx, (url) => {
      ctx.state.adminLessonDraft.imageUrl = url;
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelector('#slFileInput')?.addEventListener('change', (e) => {
    syncLessonFromDom();
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileViaApi(file, ctx, (url, name) => {
      ctx.state.adminLessonDraft.attachmentUrl = url;
      ctx.state.adminLessonDraft.attachmentName = name;
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelector('#studioLessonForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    syncLessonFromDom();
    const ld = ctx.state.adminLessonDraft;
    if (ld.id) {
      await ctx.actions.adminUpdateLesson(ld.id, ld);
    } else {
      await ctx.actions.adminCreateLesson(ld);
    }
  });

  container.querySelectorAll('[data-edit-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-lesson');
      const lesson = (ctx.cloud.lessons || []).find((l) => l.id === id);
      if (!lesson) return;
      ctx.state.adminLessonDraft = {
        id: lesson.id,
        title: lesson.title || '',
        level: lesson.level || 'beginner',
        creoleSummary: lesson.creoleSummary || '',
        bodyHtml: lesson.bodyHtml || '',
        funFact: lesson.funFact || '',
        imageUrl: lesson.imageUrl || '',
        attachmentName: lesson.attachmentName || '',
        attachmentUrl: lesson.attachmentUrl || ''
      };
      renderAdminStudioWorkspace(container, ctx);
    });
  });

  container.querySelectorAll('[data-del-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => ctx.actions.adminDeleteLesson(btn.getAttribute('data-del-lesson')));
  });

  container.querySelector('#studioDictQuickForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await ctx.actions.adminCreateDictEntry({
      word: container.querySelector('#sdqWord')?.value,
      pos: container.querySelector('#sdqPos')?.value,
      pronounce: container.querySelector('#sdqPron')?.value,
      level: container.querySelector('#sdqLevel')?.value,
      en: container.querySelector('#sdqEn')?.value,
      fr: container.querySelector('#sdqFr')?.value
    });
  });

  container.querySelector('#studioProverbQuickForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await ctx.actions.adminCreateProverb({
      creole: container.querySelector('#spqCreole')?.value,
      en: container.querySelector('#spqEn')?.value,
      fr: container.querySelector('#spqFr')?.value
    });
  });

  container.querySelector('#studioSeedProverbsBtn')?.addEventListener('click', () => {
    ctx.actions.adminSeedProverbs();
  });
}

async function uploadFileViaApi(file, ctx, onDone) {
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) {
    ctx.actions.notify('File exceeds 4MB limit.');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const idToken = ctx.user?.getIdToken ? await ctx.user.getIdToken() : '';
      if (!idToken) {
        ctx.actions.notify('Verified admin sign-in required for uploads.');
        return;
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ filename: file.name, dataUrl: reader.result })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      ctx.actions.notify(`Uploaded ${data.name}`);
      onDone(data.url, data.name);
    } catch (err) {
      ctx.actions.notify(err.message || 'Upload error');
    }
  };
  reader.readAsDataURL(file);
}
