// D3.js Learning Insights Visualization: Vocabulary Acquisition & Daily Active Time

function isoDaysAgo(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toISOString().split('T')[0];
}

function shortDateLabel(iso, lang = 'en') {
  try {
    const [y, m, day] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, day));
    return dt.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  } catch (_e) {
    return iso.slice(5);
  }
}

export function getTotalAcquiredWordsCount(ctx) {
  const unique = new Set();
  (ctx?.progress?.listenedWords || []).forEach((w) => unique.add(`w:${String(w).toLowerCase()}`));
  (ctx?.progress?.reviewedCards || []).forEach((c) => unique.add(`c:${String(c)}`));
  Object.keys(ctx?.collection?.termStats || {}).forEach((k) => {
    const st = ctx.collection.termStats[k];
    if (st && (st.right > 0 || st.almost > 0)) unique.add(`c:${k}`);
  });
  return unique.size;
}

export function buildLearningInsightsSeries(ctx, rangeDays = 7) {
  const days = rangeDays === 14 ? 14 : 7;
  const log = ctx?.activityLog && typeof ctx.activityLog === 'object' ? ctx.activityLog : {};
  const today = new Date().toISOString().split('T')[0];
  const liveTotalWords = getTotalAcquiredWordsCount(ctx);
  const streakSet = new Set(Array.isArray(ctx?.progress?.streakHistory) ? ctx.progress.streakHistory : []);

  const rawPoints = [];
  let lastKnownWords = null;

  for (let i = days - 1; i >= 0; i -= 1) {
    const iso = isoDaysAgo(i);
    const entry = log[iso];
    const isToday = iso === today;

    let activeMinutes = 0;
    let wordsCount = null;

    if (entry && typeof entry === 'object') {
      activeMinutes = Math.round(((Number(entry.activeSeconds || 0) / 60) + Number.EPSILON) * 10) / 10;
      if (Number.isFinite(Number(entry.wordsCount))) {
        wordsCount = Number(entry.wordsCount);
      }
    }

    if (isToday) {
      wordsCount = Math.max(liveTotalWords, wordsCount || 0);
      if (activeMinutes === 0 && Number(ctx?.dailyGoal?.completedToday || 0) > 0) {
        activeMinutes = Math.min(45, Math.round(ctx.dailyGoal.completedToday * 1.5 * 10) / 10);
      }
    } else if (wordsCount === null) {
      if (lastKnownWords !== null) {
        wordsCount = lastKnownWords;
      } else if (streakSet.has(iso) && liveTotalWords > 0) {
        const ratio = Math.max(0.15, (days - i) / (days + 2));
        wordsCount = Math.round(liveTotalWords * ratio);
      } else {
        wordsCount = 0;
      }
    }

    lastKnownWords = wordsCount;
    rawPoints.push({
      iso,
      label: shortDateLabel(iso, ctx?.state?.lang),
      words: Math.max(0, Math.round(wordsCount)),
      activeMinutes: Math.max(0, activeMinutes),
      isToday
    });
  }

  // Ensure monotonic cumulative progression if older baseline gaps exist
  let runningMax = 0;
  return rawPoints.map((pt) => {
    runningMax = Math.max(runningMax, pt.words);
    return { ...pt, words: runningMax };
  });
}

export function renderLearningInsightsCard(container, ctx) {
  if (!container) return;
  const rangeDays = ctx.state.insightsRange === 14 ? 14 : 7;
  const series = buildLearningInsightsSeries(ctx, rangeDays);
  const totalWords = getTotalAcquiredWordsCount(ctx);
  const todayPt = series[series.length - 1] || { words: totalWords, activeMinutes: 0 };
  const firstPt = series[0] || { words: 0 };
  const netWordsGain = Math.max(0, todayPt.words - firstPt.words);
  const totalMinutes = Math.round(series.reduce((sum, p) => sum + p.activeMinutes, 0) * 10) / 10;
  const avgMinutes = Math.round((totalMinutes / Math.max(1, series.length)) * 10) / 10;

  container.innerHTML = `
    <section class="km-subpanel km-insights-card" aria-label="Learning Insights">
      <div class="km-insights-head">
        <div>
          <strong style="font-size:1.05rem;">Learning Insights</strong>
          <div class="km-meta-line">Vocabulary acquisition progress &amp; daily active study time (${rangeDays}-day window)</div>
        </div>
        <div class="km-seg-group km-seg-compact" role="group" aria-label="Insights timeframe">
          <button type="button" class="km-seg-btn ${rangeDays === 7 ? 'active' : ''}" data-insights-range="7">7D</button>
          <button type="button" class="km-seg-btn ${rangeDays === 14 ? 'active' : ''}" data-insights-range="14">14D</button>
        </div>
      </div>

      <div class="km-insights-kpis">
        <div class="km-insight-kpi">
          <span class="km-stat-label">Vocabulary Acquired</span>
          <strong class="km-mono tabular-nums" style="color:var(--cobalt);">${totalWords} terms</strong>
        </div>
        <div class="km-insight-kpi">
          <span class="km-stat-label">${rangeDays}D Net Growth</span>
          <strong class="km-mono tabular-nums">+${netWordsGain} terms</strong>
        </div>
        <div class="km-insight-kpi">
          <span class="km-stat-label">Active Today</span>
          <strong class="km-mono tabular-nums" style="color:var(--emerald);">${todayPt.activeMinutes} min</strong>
        </div>
        <div class="km-insight-kpi">
          <span class="km-stat-label">Daily Average</span>
          <strong class="km-mono tabular-nums">${avgMinutes} min/day</strong>
        </div>
      </div>

      <div class="km-insights-legend" aria-hidden="true">
        <span class="km-legend-item"><span class="km-legend-swatch km-legend-swatch--vocab"></span> Vocabulary Acquired (words)</span>
        <span class="km-legend-item"><span class="km-legend-swatch km-legend-swatch--time"></span> Daily Active Time (min)</span>
      </div>

      <div class="km-insights-chart-wrap" id="learningInsightsSvgMount">
        <div class="km-insights-tooltip" id="learningInsightsTooltip" hidden></div>
      </div>
    </section>
  `;

  container.querySelectorAll('[data-insights-range]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.state.insightsRange = Number(btn.getAttribute('data-insights-range')) === 14 ? 14 : 7;
      renderLearningInsightsCard(container, ctx);
    });
  });

  drawD3LineChart(
    container.querySelector('#learningInsightsSvgMount'),
    container.querySelector('#learningInsightsTooltip'),
    series,
    ctx
  );
}

function drawD3LineChart(mountEl, tooltipEl, series, ctx) {
  if (!mountEl) return;
  const d3 = typeof window !== 'undefined' ? window.d3 : null;
  if (!d3 || typeof d3.select !== 'function') {
    mountEl.innerHTML = `<div class="km-meta-line" style="padding:1rem 0;">Visualization library offline — ${series[series.length - 1]?.words || 0} words acquired across ${series.length} days.</div>`;
    return;
  }

  const existingSvg = mountEl.querySelector('svg');
  if (existingSvg) existingSvg.remove();

  const isDark = Boolean(ctx?.state?.isDark);
  const vocabColor = isDark ? '#60a5fa' : '#1d4ed8';
  const timeColor = isDark ? '#34d399' : '#047857';
  const gridColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)';
  const axisTextColor = isDark ? '#94a3b8' : '#475569';

  const width = 680;
  const height = 236;
  const margin = { top: 16, right: 44, bottom: 28, left: 42 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(mountEl)
    .insert('svg', ':first-child')
    .attr('class', 'km-insights-svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Line graph showing Martinican Creole vocabulary acquisition and daily active study minutes');

  const defs = svg.append('defs');
  const vocabGrad = defs.append('linearGradient')
    .attr('id', 'kmVocabAreaGrad')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
  vocabGrad.append('stop').attr('offset', '0%').attr('stop-color', vocabColor).attr('stop-opacity', 0.2);
  vocabGrad.append('stop').attr('offset', '100%').attr('stop-color', vocabColor).attr('stop-opacity', 0.01);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(series.map((d) => d.iso))
    .range([0, innerW])
    .padding(0.25);

  const maxWords = Math.max(10, d3.max(series, (d) => d.words) || 10);
  const maxMins = Math.max(15, Math.ceil((d3.max(series, (d) => d.activeMinutes) || 10) / 5) * 5);

  const yVocab = d3.scaleLinear().domain([0, Math.ceil(maxWords * 1.15)]).range([innerH, 0]).nice();
  const yTime = d3.scaleLinear().domain([0, Math.ceil(maxMins * 1.15)]).range([innerH, 0]).nice();

  // Horizontal gridlines aligned with left Y axis
  g.append('g')
    .attr('class', 'km-d3-grid')
    .call(d3.axisLeft(yVocab).ticks(4).tickSize(-innerW).tickFormat(''))
    .call((sel) => sel.select('.domain').remove())
    .call((sel) => sel.selectAll('line').attr('stroke', gridColor).attr('stroke-dasharray', '3,3'));

  // X Axis
  const tickEvery = series.length > 10 ? 2 : 1;
  const xTickValues = series.filter((_, idx) => idx % tickEvery === 0 || idx === series.length - 1).map((d) => d.iso);
  const labelMap = new Map(series.map((d) => [d.iso, d.label]));

  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(xTickValues).tickFormat((iso) => labelMap.get(iso) || iso).tickSize(0).tickPadding(9))
    .call((sel) => sel.select('.domain').attr('stroke', gridColor))
    .call((sel) => sel.selectAll('text').attr('fill', axisTextColor).style('font-size', '11px').style('font-family', 'var(--font-mono)'));

  // Left Y Axis (Words)
  g.append('g')
    .call(d3.axisLeft(yVocab).ticks(4).tickSize(0).tickPadding(7))
    .call((sel) => sel.select('.domain').remove())
    .call((sel) => sel.selectAll('text').attr('fill', vocabColor).style('font-size', '11px').style('font-family', 'var(--font-mono)'));

  // Right Y Axis (Minutes)
  g.append('g')
    .attr('transform', `translate(${innerW},0)`)
    .call(d3.axisRight(yTime).ticks(4).tickSize(0).tickPadding(7).tickFormat((v) => `${v}m`))
    .call((sel) => sel.select('.domain').remove())
    .call((sel) => sel.selectAll('text').attr('fill', timeColor).style('font-size', '11px').style('font-family', 'var(--font-mono)'));

  // Area fill under Vocabulary line
  const vocabArea = d3.area()
    .x((d) => x(d.iso))
    .y0(innerH)
    .y1((d) => yVocab(d.words))
    .curve(d3.curveMonotoneX);

  g.append('path')
    .datum(series)
    .attr('fill', 'url(#kmVocabAreaGrad)')
    .attr('d', vocabArea);

  // Smooth lines
  const vocabLine = d3.line()
    .x((d) => x(d.iso))
    .y((d) => yVocab(d.words))
    .curve(d3.curveMonotoneX);

  const timeLine = d3.line()
    .x((d) => x(d.iso))
    .y((d) => yTime(d.activeMinutes))
    .curve(d3.curveMonotoneX);

  g.append('path')
    .datum(series)
    .attr('fill', 'none')
    .attr('stroke', vocabColor)
    .attr('stroke-width', 2.5)
    .attr('stroke-linecap', 'round')
    .attr('d', vocabLine);

  g.append('path')
    .datum(series)
    .attr('fill', 'none')
    .attr('stroke', timeColor)
    .attr('stroke-width', 2.2)
    .attr('stroke-dasharray', '5,3')
    .attr('stroke-linecap', 'round')
    .attr('d', timeLine);

  // Interactive focus rule & dots
  const focusLine = g.append('line')
    .attr('y1', 0)
    .attr('y2', innerH)
    .attr('stroke', gridColor)
    .attr('stroke-width', 1.5)
    .style('opacity', 0);

  g.selectAll('.km-pt-vocab')
    .data(series)
    .enter()
    .append('circle')
    .attr('class', 'km-pt-vocab')
    .attr('cx', (d) => x(d.iso))
    .attr('cy', (d) => yVocab(d.words))
    .attr('r', (d) => (d.isToday ? 4.5 : 3))
    .attr('fill', vocabColor)
    .attr('stroke', isDark ? '#131c31' : '#ffffff')
    .attr('stroke-width', 1.5);

  g.selectAll('.km-pt-time')
    .data(series)
    .enter()
    .append('circle')
    .attr('class', 'km-pt-time')
    .attr('cx', (d) => x(d.iso))
    .attr('cy', (d) => yTime(d.activeMinutes))
    .attr('r', (d) => (d.isToday ? 4.5 : 3))
    .attr('fill', timeColor)
    .attr('stroke', isDark ? '#131c31' : '#ffffff')
    .attr('stroke-width', 1.5);

  const showPointTooltip = (pt) => {
    if (!pt || !tooltipEl) return;
    const cx = x(pt.iso);
    focusLine.attr('x1', cx).attr('x2', cx).style('opacity', 1);
    const pctLeft = ((margin.left + cx) / width) * 100;
    tooltipEl.hidden = false;
    tooltipEl.style.left = `${Math.max(12, Math.min(82, pctLeft))}%`;
    tooltipEl.innerHTML = `
      <div class="km-mono" style="font-weight:700;">${pt.label}${pt.isToday ? ' (Today)' : ''}</div>
      <div style="color:${vocabColor}; font-weight:600;">${pt.words} words acquired</div>
      <div style="color:${timeColor}; font-weight:600;">${pt.activeMinutes} min active</div>
    `;
  };

  const hidePointTooltip = () => {
    focusLine.style('opacity', 0);
    if (tooltipEl) tooltipEl.hidden = true;
  };

  g.append('rect')
    .attr('width', innerW)
    .attr('height', innerH)
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair')
    .on('pointermove touchstart', (event) => {
      const [mx] = d3.pointer(event);
      let nearest = series[0];
      let minDist = Infinity;
      series.forEach((pt) => {
        const dist = Math.abs(x(pt.iso) - mx);
        if (dist < minDist) {
          minDist = dist;
          nearest = pt;
        }
      });
      showPointTooltip(nearest);
    })
    .on('pointerleave', hidePointTooltip);
}
