/* =============================================
   steam.js — Steam API integration
   Uses a CORS proxy to fetch wishlist data.
   Replace STEAM_ID with your actual Steam ID.
   ============================================= */
'use strict';

window.Steam = (function () {

  // ---- Configuration ---- //
  // Set your 64-bit Steam ID here (find it at steamid.io)
  const STEAM_ID = '76561199091154546';
  

  // CORS proxy options (uncomment one that works for you, or self-host)
  // Option 1: Steam's own wishlist JSON endpoint (works if Steam allows it)
  // Option 2: Use a free CORS proxy
  const WISHLIST_URL = `https://store.steampowered.com/wishlist/profiles/${STEAM_ID}/wishlistdata/?p=0&v=`;

  // Fallback demo games if the Steam API is unavailable
  const DEMO_GAMES = [
    {
      appid: 1091500,
      name: "Cyberpunk 2077",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg",
      review_score: 7,
      review_desc: "Very Positive",
      reviews_total: "312,447",
      reviews_percent: 86,
      release_date: "Dec 10, 2020",
      release_string: "Dec 10, 2020",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 50, price: 2999 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1610000000,
      background: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/page_bg_generated_v6b.jpg",
      rank: 0,
      tags: ["RPG", "Open World", "Sci-fi", "Action", "Story Rich"],
      is_free_game: false,
      desc: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    },
    {
      appid: 413150,
      name: "Stardew Valley",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/capsule_616x353.jpg",
      review_score: 9,
      review_desc: "Overwhelmingly Positive",
      reviews_total: "803,221",
      reviews_percent: 98,
      release_date: "Feb 26, 2016",
      release_string: "Feb 26, 2016",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 0, price: 1499 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1612000000,
      background: "",
      rank: 1,
      tags: ["Farming Sim", "RPG", "Relaxing", "Pixel Graphics", "Multiplayer"],
      is_free_game: false,
      desc: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
    },
    {
      appid: 1172470,
      name: "Apex Legends",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg",
      review_score: 7,
      review_desc: "Very Positive",
      reviews_total: "1,203,451",
      reviews_percent: 81,
      release_date: "Nov 4, 2020",
      release_string: "Nov 4, 2020",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 0, price: 0 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1615000000,
      background: "",
      rank: 2,
      tags: ["Battle Royale", "Shooter", "Free to Play", "Action", "Multiplayer"],
      is_free_game: true,
      desc: "A free-to-play hero shooter battle royale game where legendary challengers fight for glory, fame, and fortune on the fringes of the Frontier.",
    },
    {
      appid: 1086940,
      name: "Baldur's Gate 3",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/capsule_616x353.jpg",
      review_score: 9,
      review_desc: "Overwhelmingly Positive",
      reviews_total: "567,234",
      reviews_percent: 97,
      release_date: "Aug 3, 2023",
      release_string: "Aug 3, 2023",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 20, price: 5999 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1620000000,
      background: "",
      rank: 3,
      tags: ["RPG", "Co-op", "Turn-Based", "Story Rich", "Fantasy"],
      is_free_game: false,
      desc: "An epic RPG set in the universe of Dungeons & Dragons. Gather your party and return to the Forgotten Realms.",
    },
    {
      appid: 814380,
      name: "Sekiro: Shadows Die Twice",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/capsule_616x353.jpg",
      review_score: 9,
      review_desc: "Overwhelmingly Positive",
      reviews_total: "254,122",
      reviews_percent: 96,
      release_date: "Mar 22, 2019",
      release_string: "Mar 22, 2019",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 0, price: 5999 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1622000000,
      background: "",
      rank: 4,
      tags: ["Action", "Soulslike", "Difficult", "Samurai", "Singleplayer"],
      is_free_game: false,
      desc: "Carve your own clever path to vengeance in the award-winning adventure from developer FromSoftware, creators of the Dark Souls series.",
    },
    {
      appid: 1449560,
      name: "Hollow Knight: Silksong",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1449560/capsule_616x353.jpg",
      review_score: 0,
      review_desc: "No reviews yet",
      reviews_total: "0",
      reviews_percent: 0,
      release_date: "Coming Soon",
      release_string: "Coming Soon",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 0, price: 1499 }],
      type: "Game",
      screenshots: [],
      review_css: "",
      priority: 0,
      added: 1625000000,
      background: "",
      rank: 5,
      tags: ["Metroidvania", "Platformer", "Indie", "Action", "Difficult"],
      is_free_game: false,
      desc: "Discover a vast, haunted kingdom in this sweeping action-adventure. Explore a land of silk and song, new heroes, new enemies, and ancient mysteries.",
    },
    {
      appid: 1817190,
      name: "Marvel's Spider-Man: Miles Morales",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817190/capsule_616x353.jpg",
      review_score: 8,
      review_desc: "Very Positive",
      reviews_total: "43,221",
      reviews_percent: 93,
      release_date: "Nov 18, 2022",
      release_string: "Nov 18, 2022",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 35, price: 4999 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1628000000,
      background: "",
      rank: 6,
      tags: ["Action", "Superhero", "Open World", "Story Rich", "Singleplayer"],
      is_free_game: false,
      desc: "Experience the rise of Miles Morales as the new champion of Marvel's New York in the latest chapter of the critically acclaimed Marvel's Spider-Man universe.",
    },
    {
      appid: 2215430,
      name: "Hades II",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/capsule_616x353.jpg",
      review_score: 9,
      review_desc: "Overwhelmingly Positive",
      reviews_total: "67,445",
      reviews_percent: 95,
      release_date: "Early Access",
      release_string: "Early Access",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 0, price: 2499 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1630000000,
      background: "",
      rank: 7,
      tags: ["Roguelike", "Action", "Indie", "Mythology", "Singleplayer"],
      is_free_game: false,
      desc: "The next rogue-like dungeon crawler from the award-winning independent studio Supergiant Games, continuing the critically acclaimed Hades.",
    },
    {
      appid: 1888160,
      name: "Among Us",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/capsule_616x353.jpg",
      review_score: 7,
      review_desc: "Very Positive",
      reviews_total: "512,000",
      reviews_percent: 84,
      release_date: "Nov 16, 2018",
      release_string: "Nov 16, 2018",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 0, price: 499 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1635000000,
      background: "",
      rank: 8,
      tags: ["Social Deduction", "Multiplayer", "Indie", "Party", "Co-op"],
      is_free_game: false,
      desc: "A multiplayer game of teamwork and betrayal for 4-15 players online or via local WiFi.",
    },
    {
      appid: 1245620,
      name: "Elden Ring",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg",
      review_score: 9,
      review_desc: "Overwhelmingly Positive",
      reviews_total: "633,901",
      reviews_percent: 96,
      release_date: "Feb 25, 2022",
      release_string: "Feb 25, 2022",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 40, price: 5999 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1637000000,
      background: "",
      rank: 9,
      tags: ["Soulslike", "Open World", "Action", "Dark Fantasy", "RPG"],
      is_free_game: false,
      desc: "A vast open-world action RPG from FromSoftware and George R.R. Martin. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
    },
    {
      appid: 1517290,
      name: "Battlefield 2042",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/1517290/capsule_616x353.jpg",
      review_score: 5,
      review_desc: "Mixed",
      reviews_total: "213,445",
      reviews_percent: 55,
      release_date: "Nov 19, 2021",
      release_string: "Nov 19, 2021",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 75, price: 5999 }],
      type: "Game",
      screenshots: [],
      review_css: "mixed",
      priority: 0,
      added: 1639000000,
      background: "",
      rank: 10,
      tags: ["Shooter", "Multiplayer", "FPS", "Military", "Action"],
      is_free_game: false,
      desc: "Battlefield 2042 is a first-person shooter that marks the return to the iconic all-out warfare of the franchise.",
    },
    {
      appid: 2050650,
      name: "Hogwarts Legacy",
      capsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/capsule_616x353.jpg",
      review_score: 8,
      review_desc: "Very Positive",
      reviews_total: "189,332",
      reviews_percent: 87,
      release_date: "Feb 10, 2023",
      release_string: "Feb 10, 2023",
      platform_icons: "",
      subs: [{ id: 0, discount_block: "", discount_pct: 50, price: 5999 }],
      type: "Game",
      screenshots: [],
      review_css: "positive",
      priority: 0,
      added: 1641000000,
      background: "",
      rank: 11,
      tags: ["Open World", "RPG", "Magic", "Adventure", "Singleplayer"],
      is_free_game: false,
      desc: "Experience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret that threatens to tear the wizarding world apart.",
    },
  ];

  // ---- Normalize raw Steam wishlist entry ----
  function normalizeGame(appid, raw, rank) {
    // Safely get price from subs
    const sub = Array.isArray(raw.subs) && raw.subs.length > 0 ? raw.subs[0] : null;
    const discountPct  = sub ? (sub.discount_pct || 0) : 0;
    const priceCents   = sub ? (sub.price || 0) : 0;
    const originalPrice = discountPct > 0
      ? Math.round(priceCents / (1 - discountPct / 100))
      : priceCents;

    // Extract genres/tags
    const tags = raw.tags ? Object.values(raw.tags) : [];

    return {
      appid:        parseInt(appid),
      name:         raw.name || 'Unknown Game',
      capsule:      raw.capsule_v2 || raw.capsule || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_616x353.jpg`,
      background:   raw.background || '',
      desc:         raw.desc || '',
      tags,
      rank,
      discountPct,
      priceCents,
      originalPrice,
      isFree:       raw.is_free_game || priceCents === 0,
      isTBD:        !sub && !raw.is_free_game,
      releaseDate:  raw.release_string || raw.release_date || 'Unknown',
      reviewScore:  raw.review_score || 0,
      reviewDesc:   raw.review_desc || '',
      reviewPct:    raw.reviews_percent || 0,
      onSale:       discountPct > 0,
      steamUrl:     `https://store.steampowered.com/app/${appid}`,
    };
  }

  // ---- Fetch wishlist from Steam (via CORS proxy) ----
  async function fetchWishlist() {
    // Update badge
    const badge = document.getElementById('steam-badge');
    const statusText = document.getElementById('steam-status-text');

    if (STEAM_ID === 'YOUR_STEAM_ID_HERE') {
      console.warn('[Steam] No Steam ID set — using demo data.');
      if (statusText) statusText.textContent = 'Demo mode';
      if (badge) badge.classList.add('error');
      return normalizeDemoGames();
    }

    try {
      // Try fetching via a CORS proxy
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(WISHLIST_URL)}`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data || typeof data !== 'object') throw new Error('Invalid response');
      if (data.success === 2) throw new Error('Wishlist is private');

      const games = [];
      let rank = 0;
      for (const [appid, raw] of Object.entries(data)) {
        if (appid === 'success') continue;
        games.push(normalizeGame(appid, raw, rank++));
      }
      // Steam returns them sorted by priority, but let's ensure sort
      games.sort((a, b) => a.rank - b.rank);

      if (statusText) statusText.textContent = 'Connected';
      if (badge) badge.classList.add('connected');

      return games;
    } catch (err) {
      console.warn('[Steam] Fetch failed:', err.message, '— using demo data.');
      if (statusText) statusText.textContent = 'Demo mode';
      if (badge) badge.classList.add('error');
      return normalizeDemoGames();
    }
  }

  function normalizeDemoGames() {
    return DEMO_GAMES.map((g, i) => {
      const sub = g.subs[0];
      const discountPct  = sub.discount_pct || 0;
      const priceCents   = sub.price || 0;
      const originalPrice = discountPct > 0
        ? Math.round(priceCents / (1 - discountPct / 100))
        : priceCents;
      return {
        appid:        g.appid,
        name:         g.name,
        capsule:      g.capsule,
        background:   g.background,
        desc:         g.desc,
        tags:         g.tags,
        rank:         i,
        discountPct,
        priceCents,
        originalPrice,
        isFree:       g.is_free_game || priceCents === 0,
        isTBD:        false,
        releaseDate:  g.release_string,
        reviewScore:  g.review_score,
        reviewDesc:   g.review_desc,
        reviewPct:    g.reviews_percent,
        onSale:       discountPct > 0,
        steamUrl:     `https://store.steampowered.com/app/${g.appid}`,
      };
    });
  }

  // ---- Helpers ----
  function formatPrice(cents, isFree, isTBD) {
    if (isFree)  return 'FREE';
    if (isTBD)   return 'TBD';
    if (!cents)  return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatOriginalPrice(cents) {
    if (!cents) return '';
    return `$${(cents / 100).toFixed(2)}`;
  }

  function totalValue(games) {
    return games.reduce((sum, g) => sum + (g.isFree ? 0 : g.priceCents), 0);
  }

  function totalOriginalValue(games) {
    return games.reduce((sum, g) => sum + (g.isFree ? 0 : g.originalPrice), 0);
  }

  function onSaleGames(games) {
    return games.filter(g => g.onSale);
  }

  return {
    fetchWishlist,
    formatPrice,
    formatOriginalPrice,
    totalValue,
    totalOriginalValue,
    onSaleGames,
    STEAM_ID,
  };

})();
