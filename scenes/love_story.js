/* =========================================================
   LOVE STORY: "Angel & Zainul"
   Builds its own section at the end of #story.

   Timeline (0 -> 1 = scroll through the scene):
     .02-.10  two lights appear (India left, Philippines right)
     .12-.50  lights travel along curved paths toward each other
     .50-.53  they meet: flash + shockwave + sparks
     .60-.78  heart constellation draws itself from the bottom up
     .74-.86  title card
     .87-.975 credits roll
     .98-1.0  end card

   EDIT YOUR STORY IN THE CONFIG BLOCK BELOW.
   ========================================================= */
(() => {
  'use strict';
  if (!window.Story) return;

  /* ---------- EDIT YOUR STORY HERE ---------- */
  const CONFIG = {
    left:  { name: 'ZAINUL', place: 'INDIA',       color: [255, 176, 87] },
    right: { name: 'ANGEL',  place: 'PHILIPPINES', color: [98, 224, 232] },

    // Order shown in the title card. Swap to ['ZAINUL', 'ANGEL'] if you prefer.
    title: ['ANGEL', 'ZAINUL'],
    subtitle: 'a love story',

    // from / to are positions on the scene timeline (0 to 1)
    captions: [
      { from: 0.05, to: 0.16, text: 'Two worlds.' },
      { from: 0.17, to: 0.29, text: 'Two skies. Two stories.' },
      { from: 0.30, to: 0.43, text: 'And one quiet pull between them.' },
      { from: 0.56, to: 0.70, text: 'Love doesn\u2019t measure distance.' }
    ],

    credits: [
      { role: 'A film about',  lines: ['Angel & Zainul'] },
      { role: 'Starring',      lines: ['Zainul', 'Angel'] },
      { role: 'Filmed on location in', lines: ['India', 'The Philippines', 'And everywhere in between'] },
      { role: 'Story by',      lines: ['Two hearts'] },
      { role: 'Directed by',   lines: ['Fate'] },
      { role: 'Produced by',   lines: ['Patience', 'Trust', 'Time'] },
      { role: 'Special thanks', lines: ['Every message sent across the miles'] }
    ],

    ending: 'To be continued\u2026'
  };

  const TAU = Math.PI * 2;
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeIO = t => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  window.Story.scenes.push(function initLoveStory() {
    const story = document.getElementById('story');
    if (!story || story.querySelector('.love')) return;
    const { isMobile, scrubValue } = window.Story;

    /* ---------- build the DOM ---------- */
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };

    const section = el('section', 'love');
    const stage = el('div', 'love__stage');
    const canvas = el('canvas', 'love__canvas');
    canvas.setAttribute('aria-hidden', 'true');
    const vignette = el('div', 'love__vignette');
    vignette.setAttribute('aria-hidden', 'true');

    const caps = el('div', 'love__caps');
    const capEls = CONFIG.captions.map(c => caps.appendChild(el('p', 'love__cap', c.text)));

    const titleBox = el('div', 'love__titlebox');
    const h2 = el('h2', 'love__title');
    const tA = el('span', 'love__t', CONFIG.title[0]);
    const amp = el('span', 'love__amp', '&');
    const tZ = el('span', 'love__t', CONFIG.title[1]);
    h2.append(tA, amp, tZ);
    const sub = el('p', 'love__sub', CONFIG.subtitle);
    titleBox.append(h2, sub);

    const credits = el('div', 'love__credits');
    const roll = el('div', 'love__roll');
    CONFIG.credits.forEach(c => {
      const block = el('div', 'love__block');
      if (c.role) block.appendChild(el('span', 'love__role', c.role));
      c.lines.forEach(line => block.appendChild(el('span', 'love__line', line)));
      roll.appendChild(block);
    });
    credits.appendChild(roll);

    const end = el('div', 'love__end');
    end.appendChild(el('p', null, CONFIG.ending));

    stage.append(canvas, vignette, caps, titleBox, credits, end);
    section.appendChild(stage);
    story.appendChild(section);

    /* ---------- canvas state ---------- */
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, S = 1;
    let M = { x: 0, y: 0 };
    let active = false, p = 0, frame = 0;

    const SL = { name: CONFIG.left.name,  place: CONFIG.left.place,  c: CONFIG.left.color,  ph: 0 };
    const SR = { name: CONFIG.right.name, place: CONFIG.right.place, c: CONFIG.right.color, ph: 2.1 };

    function layout() {
      M = { x: W * 0.5, y: H * 0.44 };
      S = Math.min(W * 0.027, H * 0.0135);   // heart scale
      SL.a = { x: W * 0.10, y: H * 0.70 }; SL.k = { x: W * 0.20, y: H * 0.10 };
      SR.a = { x: W * 0.90, y: H * 0.70 }; SR.k = { x: W * 0.80, y: H * 0.10 };
    }

    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      const d = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      if (w === W && h === H && d === dpr) return;
      W = w; H = h; dpr = d;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      layout();
    }

    /* ---------- stars, sparks, heart points (built once) ---------- */
    const stars = Array.from({ length: isMobile ? 90 : 170 }, () => ({
      x: Math.random(), y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      r: 0.5 + Math.random() * 1.3,
      ph: Math.random() * TAU,
      sp: 0.6 + Math.random() * 1.6
    }));

    const sparks = Array.from({ length: isMobile ? 60 : 110 }, (_, i) => ({
      a: Math.random() * TAU,
      s: 0.2 + Math.random() * 0.8,
      r: 0.8 + Math.random() * 2.2,
      c: i % 2,
      dir: Math.random() < 0.5 ? -1 : 1
    }));

    const heart = th => ({
      x: 16 * Math.pow(Math.sin(th), 3),
      y: 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)
    });
    // Two arms start at the bottom point and climb up both sides to meet at the top
    const ARM = 22;
    const armR = [], armL = [];
    for (let j = 0; j <= ARM; j++) {
      const f = j / ARM;
      armR.push(heart(Math.PI - f * Math.PI));
      armL.push(heart(Math.PI + f * Math.PI));
    }

    /* ---------- drawing pieces ---------- */
    function drawStars(t) {
      const fade = 1 - 0.6 * clamp01((p - 0.86) / 0.06);
      const drift = p * 0.12;
      ctx.fillStyle = '#fff';
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        let x = (s.x - drift * s.z) % 1;
        if (x < 0) x += 1;
        const tw = 0.65 + 0.35 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = (0.25 + 0.6 * s.z) * tw * fade;
        ctx.beginPath();
        ctx.arc(x * W, s.y * H, s.r * (0.6 + 0.5 * s.z), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawAura() {
      const a = clamp01((p - 0.52) / 0.12) * (1 - clamp01((p - 0.86) / 0.05));
      if (a <= 0) return;
      const r = Math.min(W, H) * 0.75;
      const g = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r);
      g.addColorStop(0, 'rgba(255,196,150,' + (0.20 * a) + ')');
      g.addColorStop(0.45, 'rgba(255,110,150,' + (0.07 * a) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function pos(side, u) {
      const v = 1 - u;
      return {
        x: v * v * side.a.x + 2 * v * u * side.k.x + u * u * M.x,
        y: v * v * side.a.y + 2 * v * u * side.k.y + u * u * M.y
      };
    }

    function drawLight(side, tt, alpha, t) {
      const c = side.c, R = Math.min(W, H);
      const bob = (1 - tt) * Math.sin(t * 1.3 + side.ph) * R * 0.006;
      const N = 34;
      for (let k = N; k >= 1; k--) {
        const u = tt - (k / N) * 0.26;
        if (u < 0) continue;
        const q = pos(side, u);
        const f = 1 - k / N;
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * f * f * 0.8) + ')';
        ctx.beginPath();
        ctx.arc(q.x, q.y + bob * f, R * (0.0025 + 0.007 * f), 0, TAU);
        ctx.fill();
      }
      const h = pos(side, tt);
      h.y += bob;
      const gr = R * 0.07;
      const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, gr);
      g.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      g.addColorStop(0.22, 'rgba(' + c.join(',') + ',' + (alpha * 0.75) + ')');
      g.addColorStop(1, 'rgba(' + c.join(',') + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(h.x, h.y, gr, 0, TAU);
      ctx.fill();
      return h;
    }

    function drawName(side, h, a) {
      const R = Math.min(W, H);
      const fs = Math.max(11, R * 0.024);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      if ('letterSpacing' in ctx) ctx.letterSpacing = (fs * 0.32) + 'px';
      ctx.font = '500 ' + fs + 'px Inter, sans-serif';
      ctx.fillStyle = 'rgba(246,239,228,' + a + ')';
      ctx.fillText(side.name, h.x, h.y + R * 0.075);
      ctx.font = '300 ' + (fs * 0.78) + 'px Inter, sans-serif';
      ctx.fillStyle = 'rgba(' + side.c.join(',') + ',' + (a * 0.85) + ')';
      ctx.fillText(side.place, h.x, h.y + R * 0.075 + fs * 1.5);
    }

    function drawBurst() {
      const bf = clamp01((p - 0.50) / 0.24);
      if (bf <= 0 || bf >= 1) return;
      const rad = Math.min(W, H) * 0.6;
      const e = easeOut(bf);
      ctx.strokeStyle = 'rgba(255,225,190,' + (0.55 * (1 - bf)) + ')';
      ctx.lineWidth = 1 + 5 * (1 - bf);
      ctx.beginPath();
      ctx.arc(M.x, M.y, e * rad * 1.1, 0, TAU);
      ctx.stroke();

      const fade = Math.pow(1 - bf, 1.4);
      for (let i = 0; i < sparks.length; i++) {
        const q = sparks[i];
        const ang = q.a + e * 0.7 * q.dir;
        const d = q.s * rad * e;
        const c = q.c ? SL.c : SR.c;
        ctx.fillStyle = 'rgba(' + c.join(',') + ',' + (fade * 0.9) + ')';
        ctx.beginPath();
        ctx.arc(M.x + Math.cos(ang) * d, M.y + Math.sin(ang) * d, q.r * (1 - bf * 0.5), 0, TAU);
        ctx.fill();
      }
    }

    function drawFlash() {
      const fl = Math.max(0, 1 - Math.abs(p - 0.52) / 0.03);
      if (fl <= 0) return;
      const r = Math.max(W, H) * 0.7;
      const g = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, r);
      g.addColorStop(0, 'rgba(255,248,235,' + fl + ')');
      g.addColorStop(0.4, 'rgba(255,200,150,' + (fl * 0.4) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // heart point -> screen, scaled about the heart's visual centre (M)
    const scr = (pt, k) => ({ x: M.x + pt.x * S * k, y: M.y - (pt.y + 2.5) * S * k });

    function drawArm(pts, vis, a, k, t) {
      if (vis <= 0) return;
      const last = Math.min(Math.floor(vis), ARM);
      ctx.beginPath();
      for (let j = 0; j <= last; j++) {
        const q = scr(pts[j], k);
        if (j) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
      }
      if (last < ARM) {
        const q0 = scr(pts[last], k), q1 = scr(pts[last + 1], k), f = vis - last;
        ctx.lineTo(q0.x + (q1.x - q0.x) * f, q0.y + (q1.y - q0.y) * f);
      }
      ctx.strokeStyle = 'rgba(255,222,185,' + (a * 0.6) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const base = Math.min(W, H) * 0.0042 * (k < 0.9 ? 0.75 : 1);
      for (let j = 0; j <= last; j++) {
        const q = scr(pts[j], k);
        const r = base * clamp01((vis - j) * 1.4) * (0.8 + 0.2 * Math.sin(t * 2 + j * 1.7));
        ctx.fillStyle = 'rgba(255,226,190,' + (a * 0.14) + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, r * 4, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,220,' + (a * 0.95) + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, TAU); ctx.fill();
      }
    }

    function drawHeart(t) {
      const ha = 1 - clamp01((p - 0.86) / 0.05);
      if (ha <= 0) return;
      const h1 = clamp01((p - 0.60) / 0.18);
      if (h1 <= 0) return;
      const pulse = h1 >= 1 ? 1 + 0.012 * Math.sin(t * 2.2) : 1;
      drawArm(armR, h1 * ARM, ha, pulse, t);
      drawArm(armL, h1 * ARM, ha, pulse, t);
      const h2 = clamp01((p - 0.66) / 0.16);
      if (h2 > 0) {
        drawArm(armR, h2 * ARM, ha * 0.45, 0.5 * pulse, t);
        drawArm(armL, h2 * ARM, ha * 0.45, 0.5 * pulse, t);
      }
    }

    function render() {
      if (!active || document.hidden || !W) return;
      if (document.documentElement.classList.contains('lowfx') && (frame++ & 1)) return;

      p = tl.progress();
      const t = performance.now() / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      drawStars(t);
      drawAura();

      // the two lights
      const tt = easeIO(clamp01((p - 0.12) / 0.38));
      const la = clamp01((p - 0.02) / 0.08) * (1 - clamp01((p - 0.50) / 0.03));
      if (la > 0) {
        const hl = drawLight(SL, tt, la, t);
        const hr = drawLight(SR, tt, la, t);
        const na = clamp01((p - 0.06) / 0.06) * (1 - clamp01((p - 0.34) / 0.08));
        if (na > 0) { drawName(SL, hl, na); drawName(SR, hr, na); }
      }

      drawBurst();
      drawHeart(t);
      drawFlash();
      ctx.globalAlpha = 1;
    }

    /* ---------- scroll timeline (text + credits) ---------- */
    const blurFrom = isMobile ? {} : { filter: 'blur(10px)' };
    const blurTo   = isMobile ? {} : { filter: 'blur(0px)' };
    const FADE = 0.025;

    const tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: scrubValue(),
        invalidateOnRefresh: true,
        onToggle: self => {
          active = self.isActive;
          section.classList.toggle('is-on', active);
          if (active) resize();
        }
      }
    });

    // 0. rise out of black
    tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0);

    // 1. captions
    CONFIG.captions.forEach((c, i) => {
      tl
        .fromTo(capEls[i],
          { opacity: 0, y: 22, ...blurFrom },
          { opacity: 1, y: 0, ...blurTo, duration: FADE }, c.from)
        .to(capEls[i], { opacity: 0, y: -16, duration: FADE }, c.to - FADE);
    });

    // 2. title card
    tl
      .fromTo([tA, tZ],
        { opacity: 0, y: 34, ...blurFrom },
        { opacity: 1, y: 0, ...blurTo, duration: 0.06, stagger: 0.025 }, 0.74)
      .fromTo(amp, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.04 }, 0.775)
      .fromTo(sub, { opacity: 0, y: 14 }, { opacity: 0.85, y: 0, duration: 0.05 }, 0.81)
      .to(titleBox, { opacity: 0, y: -24, duration: 0.04 }, 0.86);

    // 3. credits roll (from just below the screen to just above it)
    tl.fromTo(roll,
      { y: () => stage.clientHeight },
      { y: () => -roll.offsetHeight, duration: 0.105 }, 0.87);

    // 4. end card
    tl.fromTo(end, { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.978);

    // pad the timeline to exactly 1 so tl.progress() equals scene time
    tl.set({}, {}, 1);

    /* ---------- go ---------- */
    resize();
    gsap.ticker.add(render);
    let rz;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(resize, 150);
    });
  });
})();
