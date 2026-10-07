(function () {
  const section = document.getElementById("memories");
  if (!section) return;

  const bg = document.createElement("div");
  bg.className = "mem-bg";
  bg.innerHTML = '<div class="nebula"></div><canvas></canvas>' +
    '<div class="strip left"></div><div class="strip right"></div><div class="vignette"></div>';
  section.prepend(bg);

  const canvas = bg.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, dpr, stars = [], shooters = [], running = false, last = 0;

  // layers: far = small & slow, near = big & fast
  const LAYERS = [
    { n: 90, speed: 6,  size: [0.4, 0.9], alpha: 0.5 },
    { n: 50, speed: 14, size: [0.8, 1.5], alpha: 0.75 },
    { n: 22, speed: 30, size: [1.4, 2.4], alpha: 1 }
  ];
  const COLORS = ["#ffffff", "#ffd6e7", "#ff9cc2", "#c9b8ff"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = section.clientWidth; H = section.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    LAYERS.forEach(L => {
      for (let i = 0; i < L.n; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: L.size[0] + Math.random() * (L.size[1] - L.size[0]),
          v: L.speed * (0.8 + Math.random() * 0.4),
          a: L.alpha, tw: Math.random() * Math.PI * 2,
          c: COLORS[(Math.random() * COLORS.length) | 0]
        });
      }
    });
  }

  function spawnShooter() {
    shooters.push({
      x: Math.random() * W * 0.8 + W * 0.1, y: -20,
      vx: (Math.random() - 0.3) * 200, vy: 380 + Math.random() * 220, life: 1
    });
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min((t - last) / 1000, 0.05); last = t;
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      s.y += s.v * dt;                       // scroll upward-to-down loop
      if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
      s.tw += dt * 2;
      ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(s.tw));
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }

    for (let i = shooters.length - 1; i >= 0; i--) {
      const m = shooters[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt * 0.5;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.15, m.y - m.vy * 0.15);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(1, "rgba(255,107,157,0)");
      ctx.globalAlpha = Math.max(m.life, 0);
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 0.15, m.y - m.vy * 0.15); ctx.stroke();
      if (m.life <= 0 || m.y > H + 50) shooters.splice(i, 1);
    }
    if (Math.random() < dt * 0.25) spawnShooter();   // about one every 4s

    requestAnimationFrame(frame);
  }

  function start() { if (running || reduce) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  resize();
  window.addEventListener("resize", resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(section);

  // only animate while the section is on screen
  new IntersectionObserver(e => (e[0].isIntersecting ? start() : stop())).observe(section);

  if (reduce) { // static stars if user prefers reduced motion
    stars.forEach(s => { ctx.globalAlpha = s.a; ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); });
  }
})();
