/* =============================================
   stats.js — Statistics calculations and rendering
   ============================================= */
'use strict';

window.Stats = (function () {

  // ---- Animate number count-up ----
  function animateCount(el, target, duration = 1200, prefix = '', suffix = '', decimals = 0) {
    if (!el) return;
    const start = performance.now();
    const startVal = 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ---- Genre breakdown ----
  function getGenreBreakdown(games) {
    const counts = {};
    games.forEach(g => {
      (g.tags || []).slice(0, 3).forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([genre, count]) => ({ genre, count }));
  }

  function getTopGenre(games) {
    const breakdown = getGenreBreakdown(games);
    return breakdown.length > 0 ? breakdown[0].genre : '—';
  }

  // ---- Render stats section ----
  function renderStats(games) {
    const totalGames   = games.length;
    const totalValCents = games.reduce((s, g) => s + (g.isFree ? 0 : g.priceCents), 0);
    const origValCents  = games.reduce((s, g) => s + (g.isFree ? 0 : g.originalPrice), 0);
    const onSaleCount  = games.filter(g => g.onSale).length;
    const savingsCents = origValCents - totalValCents;
    const avgCents     = totalGames > 0 ? Math.round(totalValCents / totalGames) : 0;
    const topGenre     = getTopGenre(games);

    // Stat cards — animate on first view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        animateCount(document.getElementById('stat-total'),   totalGames, 900);
        animateCount(document.getElementById('stat-value'),   totalValCents / 100, 1100, '$', '', 2);
        animateCount(document.getElementById('stat-sale'),    onSaleCount, 700);
        animateCount(document.getElementById('stat-savings'), savingsCents / 100, 1100, '$', '', 2);
        animateCount(document.getElementById('stat-avg'),     avgCents / 100, 800, '$', '', 2);

        const topGenreEl = document.getElementById('stat-top-genre');
        if (topGenreEl) topGenreEl.textContent = topGenre;

        // Hero stats
        animateCount(document.getElementById('hero-count'),  totalGames, 800);
        animateCount(document.getElementById('hero-value'),  totalValCents / 100, 1000, '$', '', 0);
        animateCount(document.getElementById('hero-sales'),  onSaleCount, 700);

        // Genre bars
        renderGenreBars(games);

        // Calculator
        renderCalculator(games, origValCents, totalValCents, savingsCents);
      });
    }, { threshold: 0.2 });

    const statsEl = document.getElementById('stats');
    if (statsEl) observer.observe(statsEl);
  }

  // ---- Render genre bar chart ----
  function renderGenreBars(games) {
    const container = document.getElementById('genre-bars');
    if (!container) return;

    const breakdown = getGenreBreakdown(games);
    const max = breakdown[0]?.count || 1;

    container.innerHTML = breakdown.map(({ genre, count }) => `
      <div class="genre-bar-row">
        <span class="genre-bar-label">${escHtml(genre)}</span>
        <div class="genre-bar-track">
          <div class="genre-bar-fill" style="width:0%" data-target="${(count / max * 100).toFixed(1)}"></div>
        </div>
        <span class="genre-bar-count">${count}</span>
      </div>
    `).join('');

    // Animate bars
    requestAnimationFrame(() => {
      container.querySelectorAll('.genre-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    });
  }

  // ---- Build genre filter chips ----
  function buildGenreFilters(games) {
    const container = document.getElementById('genre-filters');
    if (!container) return;

    const breakdown = getGenreBreakdown(games);
    const allChip = container.querySelector('[data-genre="all"]');

    breakdown.forEach(({ genre }) => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.genre = genre;
      btn.textContent = genre;
      container.appendChild(btn);
    });
  }

  // ---- Render calculator ----
  function renderCalculator(games, origCents, saleCents, savingsCents) {
    const fmt = (c) => c > 0 ? `$${(c / 100).toFixed(2)}` : '$0.00';
    const fullEl    = document.getElementById('calc-full');
    const saleEl    = document.getElementById('calc-sale');
    const saveEl    = document.getElementById('calc-savings');
    const pctEl     = document.getElementById('donut-pct');
    const progress  = document.getElementById('donut-progress');

    if (fullEl) fullEl.textContent = fmt(origCents);
    if (saleEl) saleEl.textContent = fmt(saleCents);
    if (saveEl) saveEl.textContent = fmt(savingsCents);

    const pct = origCents > 0 ? Math.round((savingsCents / origCents) * 100) : 0;
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Animate donut
    if (progress) {
      const circumference = 314;
      const offset = circumference - (pct / 100) * circumference;
      // Trigger after a short delay so transition fires
      setTimeout(() => {
        progress.style.strokeDashoffset = offset;
      }, 600);
    }
  }

  // ---- Render on-sale section ----
  function renderOnSale(games) {
    const container = document.getElementById('sale-grid');
    if (!container) return;

    const saleGames = games.filter(g => g.onSale);

    if (saleGames.length === 0) {
      container.innerHTML = '<p class="loading-msg" style="color:var(--text-muted)">No wishlist games currently on sale.</p>';
      return;
    }

    container.innerHTML = saleGames.map(g => `
      <div class="sale-card" onclick="window.ui.openModal(${g.appid})">
        <img class="sale-thumb" src="${g.capsule}" alt="${escHtml(g.name)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="sale-thumb-placeholder" style="display:none">🎮</div>
        <div class="sale-info">
          <div class="sale-title">${escHtml(g.name)}</div>
          <div class="sale-prices">
            <span class="sale-orig">${Steam.formatOriginalPrice(g.originalPrice)}</span>
            <span class="sale-now">${Steam.formatPrice(g.priceCents, g.isFree, g.isTBD)}</span>
            <span class="sale-pct">-${g.discountPct}%</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    renderStats,
    renderOnSale,
    buildGenreFilters,
    getGenreBreakdown,
    getTopGenre,
    escHtml,
  };

})();
