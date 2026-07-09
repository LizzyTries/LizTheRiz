/* =============================================
   particles.js — Ember particle system + Loading particles
   ============================================= */
'use strict';

window.Particles = (function () {

  // ---- Ember canvas (background embers) ----
  let emberCanvas, emberCtx, embers = [], emberRAF;

  function initEmbers() {
    emberCanvas = document.getElementById('ember-canvas');
    if (!emberCanvas) return;
    emberCtx = emberCanvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) spawnEmber(true);
    emberRAF = requestAnimationFrame(tickEmbers);
  }

  function resize() {
    if (!emberCanvas) return;
    emberCanvas.width  = window.innerWidth;
    emberCanvas.height = window.innerHeight;
  }

  function spawnEmber(randomY = false) {
    const w = emberCanvas.width;
    const h = emberCanvas.height;
    embers.push({
      x:    Math.random() * w,
      y:    randomY ? Math.random() * h : h + 10,
      vx:   (Math.random() - 0.5) * 0.8,
      vy:   -(Math.random() * 1.5 + 0.4),
      size: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      life:  0,
      maxLife: Math.random() * 200 + 120,
      hue:  Math.random() * 30 + 0,    // 0–30 → orange-red
    });
  }

  function tickEmbers() {
    if (!emberCtx) return;
    emberCtx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.x    += e.vx + Math.sin(e.life * 0.04) * 0.3;
      e.y    += e.vy;
      e.life++;

      const progress = e.life / e.maxLife;
      const fadeAlpha = progress < 0.1
        ? progress / 0.1
        : progress > 0.7
          ? 1 - (progress - 0.7) / 0.3
          : 1;

      emberCtx.save();
      emberCtx.globalAlpha = e.alpha * fadeAlpha * 0.6;
      emberCtx.beginPath();
      emberCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      emberCtx.fillStyle = `hsl(${e.hue}, 100%, 60%)`;
      emberCtx.shadowBlur = 6;
      emberCtx.shadowColor = `hsl(${e.hue}, 100%, 50%)`;
      emberCtx.fill();
      emberCtx.restore();

      if (e.life >= e.maxLife || e.y < -10) {
        embers.splice(i, 1);
        spawnEmber(false);
      }
    }

    // Occasionally add a burst
    if (Math.random() < 0.02) {
      const burstX = Math.random() * emberCanvas.width;
      const burstY = emberCanvas.height * 0.6 + Math.random() * emberCanvas.height * 0.4;
      for (let b = 0; b < 3; b++) {
        embers.push({
          x: burstX + (Math.random() - 0.5) * 10,
          y: burstY,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 3 + 1),
          size: Math.random() * 1.5 + 0.5,
          alpha: 0.6,
          life: 0,
          maxLife: Math.random() * 80 + 40,
          hue: Math.random() * 20,
        });
      }
    }

    emberRAF = requestAnimationFrame(tickEmbers);
  }

  // ---- Loading screen particles ----
  let loadCanvas, loadCtx, loadParticles = [], loadRAF;

  function initLoadingParticles() {
    loadCanvas = document.getElementById('loading-particles');
    if (!loadCanvas) return;
    loadCtx = loadCanvas.getContext('2d');
    loadCanvas.width  = window.innerWidth;
    loadCanvas.height = window.innerHeight;

    for (let i = 0; i < 80; i++) spawnLoadParticle(true);
    loadRAF = requestAnimationFrame(tickLoadParticles);
  }

  function spawnLoadParticle(randomY = false) {
    const w = loadCanvas.width;
    const h = loadCanvas.height;
    loadParticles.push({
      x:    Math.random() * w,
      y:    randomY ? Math.random() * h : h + 5,
      vx:   (Math.random() - 0.5) * 0.6,
      vy:   -(Math.random() * 1.2 + 0.3),
      size: Math.random() * 2 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      life:  0,
      maxLife: Math.random() * 160 + 100,
      hue:  Math.random() * 20,
    });
  }

  function tickLoadParticles() {
    if (!loadCtx || !loadCanvas) return;
    loadCtx.clearRect(0, 0, loadCanvas.width, loadCanvas.height);

    for (let i = loadParticles.length - 1; i >= 0; i--) {
      const p = loadParticles[i];
      p.x    += p.vx + Math.sin(p.life * 0.05) * 0.2;
      p.y    += p.vy;
      p.life++;

      const t = p.life / p.maxLife;
      const a = t < 0.1 ? t / 0.1 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;

      loadCtx.save();
      loadCtx.globalAlpha = p.alpha * a * 0.7;
      loadCtx.beginPath();
      loadCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      loadCtx.fillStyle = `hsl(${p.hue}, 90%, 55%)`;
      loadCtx.shadowBlur = 8;
      loadCtx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
      loadCtx.fill();
      loadCtx.restore();

      if (p.life >= p.maxLife || p.y < -5) {
        loadParticles.splice(i, 1);
        spawnLoadParticle(false);
      }
    }

    loadRAF = requestAnimationFrame(tickLoadParticles);
  }

  function stopLoadingParticles() {
    if (loadRAF) cancelAnimationFrame(loadRAF);
    loadParticles = [];
    if (loadCanvas) {
      loadCtx.clearRect(0, 0, loadCanvas.width, loadCanvas.height);
    }
  }

  return {
    initEmbers,
    initLoadingParticles,
    stopLoadingParticles,
  };

})();
