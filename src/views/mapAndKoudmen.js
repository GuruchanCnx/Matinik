import { DEFAULT_KOUDMEN_THREADS, HERITAGE_INSTITUTIONS } from '../data/curriculum.js';
import { MAP_LOCATIONS } from '../data/mapData.js';
import { speakTermSequence } from '../services/audioEngine.js';
import { escapeHtml } from './curriculumAndQuiz.js';

let leafletMapInstance = null;
let leafletMarkersLayer = null;

function projectLatLngToSvg(lat, lng) {
  // Maps Martinique bounds (~14.38..14.89 lat, -61.24..-60.81 lng) smoothly onto 340x400 SVG canvas
  const x = Math.max(24, Math.min(316, ((lng - (-61.24)) / (-60.81 - (-61.24))) * 280 + 30));
  const y = Math.max(24, Math.min(376, ((14.89 - lat) / (14.89 - 14.38)) * 340 + 30));
  return { x: Math.round(x), y: Math.round(y) };
}

export function renderMartiniqueMapSection(container, ctx) {
  if (!container) return;
  const filter = ctx.state.mapCategory || 'all';
  const mode = ctx.state.mapMode || 'osm';
  const entries = Object.values(MAP_LOCATIONS).filter((loc) => filter === 'all' || loc.category === filter);
  const selected = MAP_LOCATIONS[ctx.state.selectedSiteId] || entries[0] || MAP_LOCATIONS['fort-de-france'];
  const visited = ctx.collection.visitedSites || [];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.65rem; margin-bottom:0.9rem;">
      <div class="km-seg-group" role="tablist" aria-label="Map filter categories">
        <button type="button" class="km-seg-btn ${filter === 'all' ? 'active' : ''}" data-map-cat="all">All (${Object.keys(MAP_LOCATIONS).length})</button>
        <button type="button" class="km-seg-btn ${filter === 'commune' ? 'active' : ''}" data-map-cat="commune">12 Communes</button>
        <button type="button" class="km-seg-btn ${filter === 'historical' ? 'active' : ''}" data-map-cat="historical">Historical Sites</button>
        <button type="button" class="km-seg-btn ${filter === 'offbeat' ? 'active' : ''}" data-map-cat="offbeat">Off the Beaten Path</button>
      </div>

      <div class="km-seg-group" role="tablist" aria-label="Map engine switch">
        <button type="button" class="km-seg-btn ${mode === 'osm' ? 'active' : ''}" data-map-mode="osm"><i class="fas fa-earth-americas"></i> Live OSM Map</button>
        <button type="button" class="km-seg-btn ${mode === 'svg' ? 'active' : ''}" data-map-mode="svg"><i class="fas fa-compass"></i> SVG Island Map</button>
      </div>
    </div>

    <div class="km-map-layout">
      <div>
        ${mode === 'osm' ? `
          <div id="kmLeafletMap" class="km-leaflet-canvas"></div>
        ` : `
          <div class="km-svg-map-box">
            <svg viewBox="0 0 340 400" style="width:100%; height:360px;" role="img" aria-label="Interactive SVG map of Martinique">
              <defs>
                <linearGradient id="kmSeaGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#e0f2fe" />
                  <stop offset="100%" stop-color="#ecfdf5" />
                </linearGradient>
              </defs>
              <rect width="340" height="400" rx="14" fill="url(#kmSeaGrad)" />
              <!-- Stylized Martinique Madinina island outline -->
              <path d="M98 44 C122 36, 152 46, 178 72 C205 98, 224 128, 250 156 C272 178, 244 210, 232 232 C240 258, 266 286, 268 320 C268 352, 236 368, 206 356 C180 345, 162 318, 134 304 C112 292, 108 260, 126 232 C142 208, 128 186, 104 166 C82 146, 74 96, 86 64 Z"
                fill="#bbf7d0" stroke="#047857" stroke-width="2.5" />
              ${entries.map((loc) => {
                const pt = projectLatLngToSvg(loc.lat, loc.lng);
                const isSel = loc.id === selected.id;
                return `
                  <g class="km-svg-pin ${isSel ? 'active' : ''}" data-svg-site="${escapeHtml(loc.id)}" tabindex="0" role="button" aria-label="Select ${escapeHtml(loc.name)}">
                    <circle cx="${pt.x}" cy="${pt.y}" r="${isSel ? 8 : 6}" fill="${isSel ? '#047857' : '#1d4ed8'}" stroke="#ffffff" stroke-width="2" />
                    <text x="${pt.x + 9}" y="${pt.y + 4}" font-size="10" font-weight="${isSel ? '700' : '600'}" fill="#0f172a">${escapeHtml(loc.name.split(' ')[0])}</text>
                  </g>
                `;
              }).join('')}
            </svg>
          </div>
        `}

        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:0.75rem;">
          ${entries.map((loc) => `
            <button type="button" class="km-btn km-btn-sm ${loc.id === selected.id ? 'active' : ''}" data-site-select="${escapeHtml(loc.id)}">
              ${visited.includes(loc.id) ? '✓ ' : ''}${escapeHtml(loc.name)}
            </button>
          `).join('')}
        </div>
      </div>

      <article class="km-subpanel" style="display:flex; flex-direction:column; gap:0.65rem;">
        <div class="km-meta-line">${escapeHtml(selected.region)} · ${visited.length}/${Object.keys(MAP_LOCATIONS).length} explored</div>
        <h3 style="font-size:1.38rem;">${escapeHtml(selected.name)}</h3>
        <div style="font-weight:700; color:var(--cobalt); font-size:0.95rem;">${escapeHtml(selected.creoleName)}</div>
        <p style="font-size:0.9rem; color:var(--ink-secondary);">${escapeHtml(selected.fact)}</p>
        <div style="background:var(--surface-subtle); padding:0.7rem 0.85rem; border-radius:10px; font-size:0.86rem;">
          <strong>Living Tradition:</strong> ${escapeHtml(selected.tradition)}
        </div>
        <div style="font-size:0.86rem; font-style:italic; color:var(--emerald); font-weight:600;">
          ${escapeHtml(selected.proverb)}
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:0.25rem;">
          <button type="button" class="km-btn km-btn-sm km-btn-primary" id="mapListenBtn">
            <i class="fas fa-volume-up"></i> Listen Audio Greeting
          </button>
          <button type="button" class="km-btn km-btn-sm km-btn-emerald" id="mapViewGalleryBtn">
            <i class="fas fa-images"></i> View Gallery (${selected.gallery?.length || 1})
          </button>
          <button type="button" class="km-btn km-btn-sm" id="mapAskTutorBtn">
            <i class="fas fa-comments"></i> Ask Man Mayotte
          </button>
        </div>
      </article>
    </div>
  `;

  // Wire controls
  container.querySelectorAll('[data-map-cat]').forEach((b) => {
    b.addEventListener('click', () => {
      ctx.state.mapCategory = b.getAttribute('data-map-cat');
      const nextList = Object.values(MAP_LOCATIONS).filter((l) => ctx.state.mapCategory === 'all' || l.category === ctx.state.mapCategory);
      if (nextList.length && !nextList.some((l) => l.id === ctx.state.selectedSiteId)) {
        ctx.state.selectedSiteId = nextList[0].id;
      }
      destroyLeafletMap();
      renderMartiniqueMapSection(container, ctx);
    });
  });

  container.querySelectorAll('[data-map-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      ctx.state.mapMode = b.getAttribute('data-map-mode');
      destroyLeafletMap();
      renderMartiniqueMapSection(container, ctx);
    });
  });

  const handleSelectSite = (siteId) => {
    ctx.state.selectedSiteId = siteId;
    ctx.actions.markSiteVisited(siteId);
    destroyLeafletMap();
    renderMartiniqueMapSection(container, ctx);
  };

  container.querySelectorAll('[data-site-select]').forEach((b) => {
    b.addEventListener('click', () => handleSelectSite(b.getAttribute('data-site-select')));
  });
  container.querySelectorAll('[data-svg-site]').forEach((pin) => {
    pin.addEventListener('click', () => handleSelectSite(pin.getAttribute('data-svg-site')));
  });

  container.querySelector('#mapListenBtn')?.addEventListener('click', (e) => {
    speakTermSequence(selected.audioPhrase || selected.name, '', {
      settings: { ...ctx.settings, translationPlayback: false },
      lang: ctx.state.lang,
      btnEl: e.currentTarget,
      onListened: ctx.actions.registerWordListened
    });
  });

  container.querySelector('#mapViewGalleryBtn')?.addEventListener('click', () => {
    ctx.actions.openGallery(selected.id, 0);
  });

  container.querySelector('#mapAskTutorBtn')?.addEventListener('click', () => {
    ctx.actions.openTutorWithPrompt(`Tell me the cultural story, Creole toponymy, and oral heritage of ${selected.name} (${selected.creoleName}) in Martinique.`);
  });

  if (mode === 'osm') {
    initLeafletCanvas(container.querySelector('#kmLeafletMap'), entries, selected, handleSelectSite);
  }
}

export function destroyLeafletMap() {
  if (leafletMapInstance) {
    try { leafletMapInstance.remove(); } catch (e) {}
    leafletMapInstance = null;
    leafletMarkersLayer = null;
  }
}

function initLeafletCanvas(mapEl, entries, selected, onSelect) {
  if (!mapEl || typeof window.L === 'undefined') return;
  try {
    leafletMapInstance = window.L.map(mapEl, { scrollWheelZoom: false }).setView([selected.lat || 14.6415, selected.lng || -61.0242], 10);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMapInstance);

    leafletMarkersLayer = window.L.layerGroup().addTo(leafletMapInstance);
    entries.forEach((loc) => {
      const isSel = loc.id === selected.id;
      const color = loc.category === 'historical' ? '#b45309' : loc.category === 'offbeat' ? '#047857' : '#1d4ed8';
      const marker = window.L.circleMarker([loc.lat, loc.lng], {
        radius: isSel ? 10 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: isSel ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.92
      }).addTo(leafletMarkersLayer);

      marker.bindTooltip(`${loc.name} · ${loc.creoleName.split('•')[0]}`, { direction: 'top' });
      marker.on('click', () => onSelect(loc.id));
    });
    setTimeout(() => {
      if (leafletMapInstance) leafletMapInstance.invalidateSize();
    }, 180);
  } catch (e) {
    console.warn('Leaflet render skipped:', e.message);
  }
}

export function renderGalleryModal(backdrop, ctx) {
  if (!backdrop) return;
  const site = MAP_LOCATIONS[ctx.state.gallerySiteId] || MAP_LOCATIONS['fort-de-france'];
  const gallery = site.gallery || [];
  if (!gallery.length) return;
  const idx = (ctx.state.galleryIdx || 0) % gallery.length;
  const current = gallery[idx];

  backdrop.innerHTML = `
    <div class="km-modal-card" role="dialog" aria-modal="true" aria-label="Martinique Commune Gallery">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:0.75rem;">
        <div>
          <strong style="font-size:1.12rem;">${escapeHtml(site.name)} · Landscape Gallery</strong>
          <div class="km-meta-line km-mono">Photo ${idx + 1} / ${gallery.length}</div>
        </div>
        <button type="button" class="km-btn km-btn-sm" id="galCloseBtn" aria-label="Close gallery"><i class="fas fa-times"></i></button>
      </div>

      <img src="${escapeHtml(current.src)}" alt="${escapeHtml(current.title)}" referrerpolicy="no-referrer"
        style="width:100%; height:290px; object-fit:cover; border-radius:14px; border:1px solid var(--hairline);">

      <div style="margin-top:0.75rem;">
        <strong>${escapeHtml(current.title)}</strong>
        <div style="font-size:0.86rem; color:var(--ink-secondary);">${escapeHtml(current.caption)}</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:0.85rem;">
        <button type="button" class="km-btn km-btn-sm" id="galPrevBtn"><i class="fas fa-arrow-left"></i> Prev</button>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${gallery.map((g, i) => `
            <img src="${escapeHtml(g.src)}" alt="${escapeHtml(g.title)}" referrerpolicy="no-referrer" data-gal-thumb="${i}"
              style="width:52px; height:38px; object-fit:cover; border-radius:7px; cursor:pointer; border:2px solid ${i === idx ? 'var(--cobalt)' : 'transparent'};">
          `).join('')}
        </div>
        <button type="button" class="km-btn km-btn-sm" id="galNextBtn">Next <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;

  backdrop.querySelector('#galCloseBtn')?.addEventListener('click', () => ctx.actions.closeGallery());
  backdrop.querySelector('#galPrevBtn')?.addEventListener('click', () => {
    ctx.state.galleryIdx = (idx - 1 + gallery.length) % gallery.length;
    renderGalleryModal(backdrop, ctx);
  });
  backdrop.querySelector('#galNextBtn')?.addEventListener('click', () => {
    ctx.state.galleryIdx = (idx + 1) % gallery.length;
    renderGalleryModal(backdrop, ctx);
  });
  backdrop.querySelectorAll('[data-gal-thumb]').forEach((img) => {
    img.addEventListener('click', () => {
      ctx.state.galleryIdx = Number(img.getAttribute('data-gal-thumb'));
      renderGalleryModal(backdrop, ctx);
    });
  });
}

// =========================================================
// COMMUNITY KOUDMEN + INSTITUTIONAL PILLARS
// =========================================================
export function renderCommunityAndInstitutions(container, ctx) {
  if (!container) return;
  const topicFilter = ctx.state.koudmenTopic || 'all';
  const lang = ctx.state.lang;

  // Combine live Firestore threads + local posts + curated starter heritage threads
  const cloudPosts = (ctx.cloud.koudmen || []).map((p) => ({
    id: p.id,
    topic: p.topic || 'grammar',
    authorName: p.authorName || 'Community Learner',
    authorId: p.authorId,
    title: p.title,
    body: p.body,
    upvotes: Number(p.upvotes || 0),
    timeLabel: 'Cloud Community',
    isCloud: true,
    answers: []
  }));

  const localPosts = ctx.state.localKoudmenPosts || [];
  const allPosts = [...cloudPosts, ...localPosts, ...DEFAULT_KOUDMEN_THREADS].filter(
    (p) => topicFilter === 'all' || p.topic === topicFilter
  );

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.9rem;">
      <div class="km-seg-group" role="tablist" aria-label="Koudmen discussion filters">
        <button type="button" class="km-seg-btn ${topicFilter === 'all' ? 'active' : ''}" data-kd-topic="all">All Topics</button>
        <button type="button" class="km-seg-btn ${topicFilter === 'grammar' ? 'active' : ''}" data-kd-topic="grammar">Grammar</button>
        <button type="button" class="km-seg-btn ${topicFilter === 'culture' ? 'active' : ''}" data-kd-topic="culture">Traditions</button>
        <button type="button" class="km-seg-btn ${topicFilter === 'pronunciation' ? 'active' : ''}" data-kd-topic="pronunciation">Pronunciation</button>
        <button type="button" class="km-seg-btn ${topicFilter === 'history' ? 'active' : ''}" data-kd-topic="history">History</button>
      </div>
      <button type="button" class="km-btn km-btn-sm km-btn-primary" id="kdToggleFormBtn">
        <i class="fas fa-plus"></i> Ask a Koudmen Question
      </button>
    </div>

    <form id="kdQuestionForm" class="km-subpanel" style="display:${ctx.state.showKoudmenForm ? 'block' : 'none'}; margin-bottom:1rem;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; margin-bottom:0.65rem;">
        <input type="text" id="kdAuthorInput" class="km-input" value="${escapeHtml(ctx.user?.displayName || '')}"
          placeholder="${lang === 'fr' ? 'Votre nom (ex. Sophie L.)' : 'Your name (e.g. Doudou972)'}" required>
        <select id="kdTopicSelect" class="km-select">
          <option value="grammar">Creole Grammar (ka / té / ké)</option>
          <option value="culture">Traditions & Koudmen</option>
          <option value="pronunciation">Pronunciation & GEREC</option>
          <option value="history">Martinican Heritage History</option>
        </select>
      </div>
      <input type="text" id="kdTitleInput" class="km-input" style="margin-bottom:0.65rem;"
        placeholder="${lang === 'fr' ? 'Titre de votre question...' : 'Question headline...'}" required>
      <textarea id="kdBodyInput" class="km-textarea" rows="3" style="margin-bottom:0.65rem;"
        placeholder="Ask about Creole grammar, everyday sayings, or cultural traditions..." required></textarea>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <span class="km-meta-line">${ctx.user?.emailVerified ? 'Publishing directly to verified cloud Koudmen.' : 'Posting locally — Sign In (verified email) to sync posts to cloud.'}</span>
        <button type="submit" class="km-btn km-btn-sm km-btn-emerald"><i class="fas fa-paper-plane"></i> Publish Question (+15 XP)</button>
      </div>
    </form>

    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(310px, 1fr)); gap:0.85rem;">
      ${allPosts.map((post) => {
        const upvotedLocal = (ctx.state.upvotedPostIds || []).includes(post.id);
        const totalVotes = post.upvotes + (!post.isCloud && upvotedLocal ? 1 : 0);
        return `
          <article class="km-vocab-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div class="km-meta-line">${escapeHtml(post.topic)} · ${escapeHtml(post.authorName)} · ${escapeHtml(post.timeLabel)}</div>
              <button type="button" class="km-btn km-btn-sm ${upvotedLocal ? 'active' : ''}" data-kd-upvote="${escapeHtml(post.id)}" data-kd-cloud="${post.isCloud ? '1' : '0'}" data-kd-votes="${post.upvotes}">
                <i class="fas fa-thumbs-up"></i> <span class="km-mono">${totalVotes}</span>
              </button>
            </div>
            <strong style="font-size:1rem;">${escapeHtml(post.title)}</strong>
            <p style="font-size:0.86rem; color:var(--ink-secondary);">${escapeHtml(post.body)}</p>
            ${(post.answers || []).map((ans) => `
              <div style="background:var(--surface-subtle); padding:0.65rem 0.78rem; border-radius:10px; font-size:0.84rem; margin-top:4px;">
                <div class="km-meta-line" style="color:var(--emerald);">${escapeHtml(ans.author)}</div>
                <div style="margin-top:2px;">${ans.text}</div>
              </div>
            `).join('')}
          </article>
        `;
      }).join('')}
    </div>

    <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--hairline);">
      <h3 style="font-size:1.18rem; margin-bottom:0.25rem;">${escapeHtml(ctx.strings[lang]?.heritagePillarsTitle || 'Institutional & Language Preservation Alignment')}</h3>
      <p class="km-meta-line" style="margin-bottom:0.85rem;">${escapeHtml(ctx.strings[lang]?.motto || '')}</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(235px, 1fr)); gap:0.85rem;">
        ${HERITAGE_INSTITUTIONS.map((inst) => `
          <article class="km-subpanel" style="display:flex; flex-direction:column; gap:0.35rem;">
            <div class="km-meta-line"><i class="fas ${inst.icon}" style="color:var(--emerald);"></i> ${escapeHtml(inst.creoleTag)}</div>
            <strong style="font-size:0.98rem;">${escapeHtml(inst.name)}</strong>
            <p style="font-size:0.83rem; color:var(--ink-secondary); flex:1;">${escapeHtml(inst.description)}</p>
            <a href="${escapeHtml(inst.url)}" target="_blank" rel="noopener noreferrer" class="km-btn km-btn-sm" style="margin-top:4px;">
              <i class="fas fa-arrow-up-right-from-square"></i> ${escapeHtml(inst.domainLabel)}
            </a>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-kd-topic]').forEach((b) => {
    b.addEventListener('click', () => {
      ctx.state.koudmenTopic = b.getAttribute('data-kd-topic');
      renderCommunityAndInstitutions(container, ctx);
    });
  });

  container.querySelector('#kdToggleFormBtn')?.addEventListener('click', () => {
    ctx.state.showKoudmenForm = !ctx.state.showKoudmenForm;
    renderCommunityAndInstitutions(container, ctx);
  });

  container.querySelector('#kdQuestionForm')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const authorName = container.querySelector('#kdAuthorInput')?.value.trim() || 'Matinik Learner';
    const topic = container.querySelector('#kdTopicSelect')?.value || 'grammar';
    const title = container.querySelector('#kdTitleInput')?.value.trim();
    const body = container.querySelector('#kdBodyInput')?.value.trim();
    if (!title || !body) return;

    await ctx.actions.publishKoudmenQuestion({ authorName, topic, title, body });
    ctx.state.showKoudmenForm = false;
    renderCommunityAndInstitutions(container, ctx);
  });

  container.querySelectorAll('[data-kd-upvote]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const postId = btn.getAttribute('data-kd-upvote');
      const isCloud = btn.getAttribute('data-kd-cloud') === '1';
      const currentVotes = Number(btn.getAttribute('data-kd-votes') || 0);
      await ctx.actions.upvoteKoudmen(postId, isCloud, currentVotes);
      renderCommunityAndInstitutions(container, ctx);
    });
  });
}
