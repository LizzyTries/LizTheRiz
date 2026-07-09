/* =============================================
   app.js — Main orchestration
   Bootstraps loading screen, particles, Steam fetch, and UI
   ============================================= */
'use strict';

(function () {

  const MESSAGES = [
    'Initializing vault...',
    'Connecting to Steam...',
    'Loading game data...',
    'Rendering interface...',
    'Almost ready...',
  ];

  let loadProgress = 0;
  const loadBar    = document.querySelector('.loading-bar');
  const loadStatus = document.querySelector('.loading-status');

  function setLoadProgress(pct, msgIndex) {
    loadProgress = pct;
    if (loadBar)    loadBar.style.width = pct + '%';
    if (loadStatus && MESSAGES[msgIndex]) loadStatus.textContent = MESSAGES[msgIndex];
  }

  async function dismissLoading() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    screen.classList.add('exit');
    screen.addEventListener('animationend', () => {
      screen.remove();
      Particles.stopLoadingParticles();
    }, { once: true });
  }

  async function boot() {
    // Start loading particles immediately
    Particles.initLoadingParticles();

    setLoadProgress(10, 0);
    await delay(300);

    setLoadProgress(25, 1);

    // Fetch wishlist (or demo data)
    let games;
    try {
      games = await Steam.fetchWishlist();
      setLoadProgress(70, 2);
    } catch (err) {
      console.error('[App] Fatal error fetching games:', err);
      games = [];
    }

    await delay(200);
    setLoadProgress(85, 3);

    // Init ember particles (background)
    Particles.initEmbers();

    await delay(200);
    setLoadProgress(100, 4);

    await delay(400);

    // Init UI with game data
    ui.init(games);

    // Dismiss loading screen
    await dismissLoading();

    // GSAP hero entrance if GSAP is available
    if (window.gsap) {
      initGSAP();
    }
  }

  function initGSAP() {
    // Register ScrollTrigger
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero text animation
    gsap.fromTo('.hero-eyebrow',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' }
    );
    gsap.fromTo('.hero-line',
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.2, ease: 'power3.out' }
    );
    gsap.fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.45, ease: 'power2.out' }
    );
    gsap.fromTo('.hero-actions',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.55, ease: 'power2.out' }
    );
    gsap.fromTo('.hero-stats',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, delay: 0.7, ease: 'power1.out' }
    );
    gsap.fromTo('.hero-featured',
      { opacity: 0, x: 32 },
      { opacity: 1, x: 0, duration: 0.9, delay: 0.3, ease: 'power3.out' }
    );

    // ScrollTrigger for sections
    if (window.ScrollTrigger) {
      // Stats section
      gsap.fromTo('.stat-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, stagger: 0.08, duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#stats', start: 'top 75%' }
        }
      );

      // Game cards
      ScrollTrigger.create({
        trigger: '#wishlist',
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo('.game-card',
            { opacity: 0, y: 24, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.45, ease: 'power2.out' }
          );
        }
      });

      // Sale section
      gsap.fromTo('.sale-card',
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, stagger: 0.06, duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#on-sale', start: 'top 75%' }
        }
      );

      // Calculator
      gsap.fromTo('.calc-wrap',
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#calculator', start: 'top 75%' }
        }
      );

      // About
      gsap.fromTo('.about-wrap',
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1, scale: 1, duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#about', start: 'top 75%' }
        }
      );
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ---- Start ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
