/* =============================================
   ui.js — UI interactions, game cards, filtering, modal, nav
   ============================================= */
'use strict';

window.ui = (function () {

  let allGames     = [];
  let filteredGames = [];
  let activeGenre  = 'all';
  let activeSort   = 'rank';
  let searchQuery  = '';

  // ---- Helpers ----
  function esc(s) { return Stats.escHtml(s); }

  function formatReview(pct, desc) {
    if (!desc || desc === 'No reviews yet') return '<span style="color:var(--text-muted)">No reviews yet</span>';
    const color = pct >= 80 ? '#2ecc71' : pct >= 60 ? '#f39c12' : '#e74c3c';
    return `<span style="color:${color}">${esc(desc)}</span> (${pct}%)`;
  }

  // ---- Game card HTML ----
  function buildCard(game) {
    const price = Steam.formatPrice(game.priceCents, game.isFree, game.isTBD);
    const origPrice = game.discountPct > 0 ? Steam.formatOriginalPrice(game.originalPrice) : '';
    const priceClass = game.isFree ? 'free' : game.isTBD ? 'tbd' : '';
    const topTags = (game.tags || []).slice(0, 2);

    return `
    <div class="game-card card-enter" data-appid="${game.appid}" onclick="window.ui.openModal(${game.appid})">
      <div class="card-tilt-shine"></div>
      <div class="card-img-wrap">
        <img class="card-img" src="${esc(game.capsule)}" alt="${esc(game.name)}"
             loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="card-img-placeholder" style="display:none">🎮</div>
        <div class="card-overlay"></div>
        <div class="card-rank">#${game.rank + 1}</div>
        ${game.onSale ? `<div class="card-sale-badge">-${game.discountPct}%</div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${esc(game.name)}</div>
        ${topTags.length ? `<div class="card-genres">${topTags.map(t => `<span class="card-genre">${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="card-footer">
          <div class="card-price-wrap">
            ${origPrice ? `<span class="card-price-orig">${esc(origPrice)}</span>` : ''}
            <span class="card-price ${priceClass}">${esc(price)}</span>
            ${game.discountPct > 0 ? `<span class="card-discount">-${game.discountPct}%</span>` : ''}
          </div>
          <span class="card-wishlist-pos">🎮 #${game.rank + 1}</span>
        </div>
      </div>
    </div>`;
  }

  // ---- Render game grid ----
  function renderGames(games) {
    const grid = document.getElementById('game-grid');
    const empty = document.getElementById('empty-state');
    const countEl = document.getElementById('results-count');
    if (!grid) return;

    if (games.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      if (countEl) countEl.textContent = '0 games';
      return;
    }

    if (empty) empty.classList.add('hidden');
    if (countEl) countEl.textContent = `${games.length} game${games.length !== 1 ? 's' : ''}`;

    grid.innerHTML = games.map(buildCard).join('');

    // Stagger entrance
    const cards = grid.querySelectorAll('.card-enter');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('card-enter-active');
      }, i * 50);
    });

    // Apply tilt effect
    cards.forEach(applyCardTilt);
  }

  // ---- 3D card tilt on mouse move ----
  function applyCardTilt(card) {
    const shine = card.querySelector('.card-tilt-shine');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top)  / rect.height;
      const tiltX = (y - 0.5) * 10;
      const tiltY = (0.5 - x) * 10;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.01)`;
      if (shine) {
        shine.style.setProperty('--mx', `${x * 100}%`);
        shine.style.setProperty('--my', `${y * 100}%`);
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  // ---- Filtering & Sorting ----
  function applyFilters() {
    let games = [...allGames];

    if (activeGenre !== 'all') {
      games = games.filter(g => (g.tags || []).includes(activeGenre));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      games = games.filter(g => g.name.toLowerCase().includes(q) || (g.tags || []).some(t => t.toLowerCase().includes(q)));
    }

    switch (activeSort) {
      case 'price-asc':
        games.sort((a, b) => {
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          return a.priceCents - b.priceCents;
        });
        break;
      case 'price-desc':
        games.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'discount':
        games.sort((a, b) => b.discountPct - a.discountPct);
        break;
      case 'name':
        games.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // rank
        games.sort((a, b) => a.rank - b.rank);
    }

    filteredGames = games;
    renderGames(games);
  }

  function resetFilters() {
    activeGenre  = 'all';
    activeSort   = 'rank';
    searchQuery  = '';
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.genre === 'all'));
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'rank';
    applyFilters();
  }

  // ---- Featured card in hero ----
  function renderFeatured(games) {
    const wrap = document.getElementById('hero-featured');
    if (!wrap || !games.length) return;

    // Pick first game with a sale, else first game
    const featured = games.find(g => g.onSale) || games[0];

    wrap.innerHTML = `
      <div class="featured-card floating" onclick="window.ui.openModal(${featured.appid})">
        <img class="featured-img" src="${esc(featured.capsule)}" alt="${esc(featured.name)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="featured-img-placeholder" style="display:none">🎮</div>
        <div class="featured-body">
          <span class="featured-badge">Featured</span>
          <div class="featured-title">${esc(featured.name)}</div>
          <div class="featured-meta">
            <div class="featured-price">
              ${featured.discountPct > 0 ? `<span class="price-original">${Steam.formatOriginalPrice(featured.originalPrice)}</span>` : ''}
              <span class="price-current">${Steam.formatPrice(featured.priceCents, featured.isFree, featured.isTBD)}</span>
              ${featured.discountPct > 0 ? `<span class="price-discount">-${featured.discountPct}%</span>` : ''}
            </div>
            <div class="featured-genres">
              ${(featured.tags || []).slice(0, 2).map(t => `<span class="genre-tag">${esc(t)}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  // ---- Modal ----
  function openModal(appid) {
    const game = allGames.find(g => g.appid === appid);
    if (!game) return;

    const overlay = document.getElementById('modal-overlay');
    const inner   = document.getElementById('modal-inner');
    if (!overlay || !inner) return;

    const price    = Steam.formatPrice(game.priceCents, game.isFree, game.isTBD);
    const origPrice = game.discountPct > 0 ? Steam.formatOriginalPrice(game.originalPrice) : '';

    inner.innerHTML = `
      <img class="modal-header-img" src="${esc(game.capsule)}" alt="${esc(game.name)}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
      <div class="modal-header-img-placeholder" style="display:none">🎮</div>
      <div class="modal-body">
        <h2 class="modal-title">${esc(game.name)}</h2>
        ${game.desc ? `<p class="modal-desc">${esc(game.desc)}</p>` : ''}
        <div class="modal-genres">
          ${(game.tags || []).slice(0, 5).map(t => `<span class="genre-tag">${esc(t)}</span>`).join('')}
        </div>
        <div class="modal-meta">
          <div class="modal-meta-item">
            <span class="modal-meta-label">Price</span>
            <span class="modal-meta-value">
              ${origPrice ? `<del style="color:var(--text-muted);font-size:0.85rem;margin-right:6px">${origPrice}</del>` : ''}
              ${price}
              ${game.discountPct > 0 ? `<span style="color:#2ecc71;margin-left:6px">(-${game.discountPct}%)</span>` : ''}
            </span>
          </div>
          <div class="modal-meta-item">
            <span class="modal-meta-label">Release</span>
            <span class="modal-meta-value">${esc(game.releaseDate)}</span>
          </div>
          <div class="modal-meta-item">
            <span class="modal-meta-label">Reviews</span>
            <span class="modal-meta-value">${game.reviewDesc || '—'} ${game.reviewPct ? `(${game.reviewPct}%)` : ''}</span>
          </div>
          <div class="modal-meta-item">
            <span class="modal-meta-label">Wishlist Position</span>
            <span class="modal-meta-value">#${game.rank + 1}</span>
          </div>
        </div>
        <div class="modal-actions">
          <a href="${esc(game.steamUrl)}" target="_blank" class="btn-primary">View on Steam ↗</a>
        </div>
      </div>`;

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ---- Random game ----
  function pickRandom() {
    if (!allGames.length) return;
    const game = allGames[Math.floor(Math.random() * allGames.length)];
    openModal(game.appid);
  }

  // ---- Nav active link on scroll ----
  function initScrollSpy() {
    const sections = ['wishlist', 'stats', 'on-sale', 'about'];
    const navLinks = document.querySelectorAll('.nav-link');
    const nav = document.getElementById('main-nav');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Nav background on scroll
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ---- Event listeners ----
  function initEvents() {
    // Search
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        searchClear.classList.toggle('visible', searchQuery.length > 0);
        applyFilters();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        searchClear.classList.remove('visible');
        applyFilters();
      });
    }

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        applyFilters();
      });
    }

    // Genre filter chips (delegated)
    const filtersWrap = document.getElementById('genre-filters');
    if (filtersWrap) {
      filtersWrap.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeGenre = chip.dataset.genre;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c === chip));
        applyFilters();
      });
    }

    // Random game buttons
    document.getElementById('random-btn')?.addEventListener('click', pickRandom);
    document.getElementById('random-btn-mobile')?.addEventListener('click', pickRandom);

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Hamburger menu
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('nav-mobile');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
      mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => mobileNav.classList.remove('open'));
      });
    }

    // Close mobile nav on outside click
    document.addEventListener('click', (e) => {
      if (mobileNav && !mobileNav.contains(e.target) && !hamburger?.contains(e.target)) {
        mobileNav.classList.remove('open');
      }
    });

    // Mouse glow follow
    const glow = document.getElementById('mouse-glow');
    if (glow && window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
      }, { passive: true });
    }
  }

  // ---- Parallax ----
  function initParallax() {
    const heroGrad = document.querySelector('.hero-bg-gradient');
    if (!heroGrad) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroGrad.style.transform = `translateY(${y * 0.3}px)`;
    }, { passive: true });
  }

  // ---- Scroll reveal ----
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children')
      .forEach(el => observer.observe(el));
  }

  // ---- Footer timestamp ----
  function setFooterTime() {
    const el = document.getElementById('footer-update-time');
    if (el) el.textContent = new Date().toLocaleString();
  }

  // ---- Steam profile link ----
  function setSteamProfileLink() {
    const link = document.getElementById('steam-profile-link');
    if (link && Steam.STEAM_ID !== 'YOUR_STEAM_ID_HERE') {
      link.href = `https://store.steampowered.com/wishlist/profiles/${Steam.STEAM_ID}`;
    }
  }

  // ---- Public API ----
  function init(games) {
    allGames = games;
    filteredGames = [...games];

    renderFeatured(games);
    Stats.buildGenreFilters(games);
    applyFilters();
    Stats.renderStats(games);
    Stats.renderOnSale(games);
    initEvents();
    initScrollSpy();
    initParallax();
    initReveal();
    setFooterTime();
    setSteamProfileLink();

    // Add reveal classes to section headers
    document.querySelectorAll('.section-header').forEach(el => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
    });
    document.querySelectorAll('.stat-card').forEach(el => {
      el.classList.add('reveal');
    });
    document.querySelectorAll('.sale-card, .genre-chart, .calc-wrap, .about-wrap').forEach(el => {
      el.classList.add('reveal-scale');
    });

    // Trigger reveal observer re-scan
    requestAnimationFrame(initReveal);
  }

  return {
    init,
    openModal,
    closeModal,
    pickRandom,
    resetFilters,
    applyFilters,
  };

})();
