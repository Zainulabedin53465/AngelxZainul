/* chapters.js: 13 story chapters on ONE pinned stage, crossfaded by scroll.
   No GSAP / ScrollTrigger needed, so nothing can get stuck hidden. */
(() => {
  'use strict';
  const story = document.getElementById('story');
  const anchor = document.querySelector('.runway--ph');
  if (!story) return;

  const CH = [
    { l:'CHAPTER I · INDIA', h:'A new morning', s:'Every journey begins somewhere.',
      top:'#140b26', bot:'#e8944a', far:'#3a1f3a', fs:'hills', mid:'#1c0f1e', ms:'towers', near:'#0a0508',
      ox:50, oy:68, oc:'255,198,120', g:'✦', gc:'#ffd69a', dir:'up' },
    { l:'HOME', h:'The life we know', s:'Small rooms. Familiar streets. Ordinary moments.',
      top:'#1d120d', bot:'#c7703a', far:'#4a2616', fs:'hills', mid:'#2a150d', ms:'houses', near:'#120804',
      ox:30, oy:55, oc:'255,205,140', g:'•', gc:'#ffd48a', dir:'up' },
    { l:'BEFORE LEAVING', h:'We prepare', s:'Clothes are packed. Memories stay behind.',
      top:'#121722', bot:'#6e5a52', far:'#2c3042', fs:'hills', mid:'#1a1d2b', ms:'skyline', near:'#0a0b12',
      ox:70, oy:45, oc:'201,164,92', g:'•', gc:'#ffd69a', dir:'up' },
    { l:'FLAVOURS OF INDIA', h:'Food tastes like home', s:'Chai, spices, warmth, and the taste of familiar mornings.',
      top:'#2a1208', bot:'#e3a04f', far:'#5a2c12', fs:'hills', mid:'#351a0c', ms:'houses', near:'#160a05',
      ox:50, oy:60, oc:'255,179,71', g:'✿', gc:'#f1d089', dir:'up' },
    { l:'THE CITY', h:'India keeps moving', s:'People crossing. Lights changing. Life everywhere.',
      top:'#070815', bot:'#2d2a5e', far:'#14143a', fs:'skyline', mid:'#0c0c24', ms:'skyline', near:'#05050f',
      ox:50, oy:35, oc:'255,195,106', g:'•', gc:'#ffd48a', dir:'up' },
    { l:'TRADITION', h:'Stories passed down', s:'Music, clothing, celebration, family, and culture.',
      top:'#230a14', bot:'#c8843a', far:'#4d1a22', fs:'hills', mid:'#2a0e14', ms:'towers', near:'#110508',
      ox:50, oy:48, oc:'230,178,90', g:'❀', gc:'#f39a1f', dir:'dn' },
    { l:'CELEBRATION', h:'A thousand colors', s:'For a moment, everything feels alive.',
      top:'#12061e', bot:'#8a2f6a', far:'#3a1245', fs:'skyline', mid:'#220a2e', ms:'towers', near:'#0d0414',
      ox:32, oy:40, oc:'255,90,138', g:'✦', gc:'#ffd04a', dir:'up' },
    { l:'BHUBANESWAR', h:'Time to leave', s:'The familiar world slowly disappears behind us.',
      top:'#0e1422', bot:'#5f7194', far:'#243049', fs:'hills', mid:'#151c2e', ms:'skyline', near:'#080b14',
      ox:50, oy:62, oc:'168,200,255', g:'•', gc:'#b4d2ff', dir:'up' },
    { l:'THE JOURNEY', h:'Somewhere between two worlds', s:'Thousands of kilometres. One reason.',
      top:'#01030a', bot:'#14264a', far:'', fs:'', mid:'', ms:'', near:'',
      ox:60, oy:42, oc:'143,180,255', g:'✦', gc:'#ffffff', dir:'up' },
    { l:'PHILIPPINES', h:'A different world', s:'New streets. New sounds. A familiar feeling.',
      top:'#0a2535', bot:'#f0a868', far:'#1a4f5e', fs:'hills', mid:'#0e3340', ms:'waves', near:'#061a22',
      ox:50, oy:58, oc:'255,214,152', g:'•', gc:'#ffe2aa', dir:'up' },
    { l:'HER WORLD', h:'Where her story begins', s:'Culture, food, family, places, memories.',
      top:'#052c36', bot:'#f4c27a', far:'#17606a', fs:'hills', mid:'#0d4450', ms:'waves', near:'#052229',
      ox:62, oy:50, oc:'255,214,152', g:'❀', gc:'#fffdf5', dir:'dn' },
    { l:'CHAPTER II', h:'Two worlds become one', s:'The journey was never really about the distance.',
      top:'#7a2e1a', mid2:'#2a1030', bot:'#0d4a55', ang:100,
      far:'#3a2a45', fs:'hills', mid:'#1f1a30', ms:'skyline', near:'#0a0a14',
      ox:50, oy:42, oc:'255,226,190', g:'♥', gc:'#ff9db8', dir:'up' },
    { l:'THE NEXT CHAPTER', h:'Our story continues', s:"Some stories don't have an ending.",
      top:'#02030a', bot:'#b88a4a', far:'#1a1a2a', fs:'hills', mid:'', ms:'', near:'#05050a',
      ox:50, oy:64, oc:'255,200,122', g:'✦', gc:'#ffe1aa', dir:'up' }
  ];

  /* ---------- YOUR STORY (edit the words here) ---------- */
  const MSG = [
    { l: "CHAPTER I \u00b7 2019", h: "It began in 2019", d: "Two strangers. Two worlds. No plan.", s: "Then Angel appeared, and the morning felt different." },
    { l: "THE FIRST DAYS", h: "She chose him", d: "He never believed he was worth choosing.", s: "She saw what he could not see in himself." },
    { l: "EVERY DAY", h: "Always by his side", d: "On the days he had nothing to give,", s: "Angel stayed, and asked for nothing in return." },
    { l: "GRATITUDE", h: "He sees it. He appreciates it.", d: "Quiet sacrifices he noticed too late.", s: "Now he notices every single one." },
    { l: "THE QUESTION", h: "How does she love him?", d: "A girl this beautiful, this kind. Why him?", s: "He still does not know. He is grateful anyway." },
    { l: "HIS WORST NIGHTS", h: "The dark he brought", d: "There were times he doubted, pulled away, and nearly betrayed her trust.", s: "She could have left. She chose to understand." },
    { l: "HER GRACE", h: "She held on", d: "Where others would have walked away,", s: "Angel held him, and he found a way to begin again." },
    { l: "THE LESSON", h: "What he learned", d: "Love is not proven when it is easy.", s: "It is proven when someone stays through the dark." },
    { l: "THE DISTANCE", h: "India and the Philippines", d: "Thousands of kilometres of night between them.", s: "Every message was a sunrise." },
    { l: "THE PROMISE", h: "He promises", d: "He knows his mistakes. He does not hide from them.", s: "He chooses her, honestly, every single morning." },
    { l: "HER STRENGTH", h: "Her heart", d: "She carried more than she ever said.", s: "It is the brightest place he knows." },
    { l: "CHAPTER II", h: "Two worlds become one", d: "Through every dark night,", s: "they found the same morning." },
    { l: "THE NEXT CHAPTER", h: "Our story continues", d: "There will be hard nights again.", s: "And there will always be a morning with you." }
  ];
  CH.forEach((c, i) => Object.assign(c, MSG[i] || {}));

  const N = CH.length;
  const mobile = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- build ---------- */
  const lay = (cls, color, shape) =>
    color && shape ? `<div class="ch-lay ${cls} s-${shape}" style="background:${color}"></div>` : '';

  const fx = c => {
    let h = '';
    const n = mobile ? 10 : 22;
    for (let i = 0; i < n; i++) {
      h += `<i class="ch-p ${c.dir === 'dn' ? 'dn' : 'up'}" style="left:${rnd(2,98).toFixed(1)}%;--s:${rnd(10,22).toFixed(0)}px;--dx:${rnd(-60,60).toFixed(0)}px;--dur:${rnd(9,18).toFixed(1)}s;animation-delay:${(-rnd(0,18)).toFixed(1)}s">${c.g}</i>`;
    }
    return h;
  };

  const bgHTML = CH.map(c => {
    const grad = c.mid2
      ? `linear-gradient(${c.ang || 180}deg,${c.top},${c.mid2},${c.bot})`
      : `linear-gradient(${c.ang || 180}deg,${c.top},${c.bot})`;
    return `<div class="ch-bg" style="background:${grad};--gc:${c.gc}">
      <div class="ch-orb" style="left:${c.ox}%;top:${c.oy}%;background:radial-gradient(circle,rgba(${c.oc},.85) 0%,rgba(${c.oc},.25) 38%,rgba(${c.oc},0) 68%)"></div>
      ${lay('far', c.far, c.fs)}${lay('mid', c.mid, c.ms)}${lay('near', c.near, 'ground')}
      <div class="ch-fx">${fx(c)}</div><div class="ch-night"></div>
    </div>`;
  }).join('');

  const txHTML = CH.map(c =>
    `<div class="ch-t"><span class="ch-l">${c.l}</span><h2 class="ch-h">${c.h}</h2><div class="ch-two"><p class="ch-d">${c.d}</p><p class="ch-s">${c.s}</p></div></div>`
  ).join('');

  const sec = document.createElement('section');
  sec.id = 'chapters';
  sec.setAttribute('aria-label', 'Our journey');
  sec.style.setProperty('--ch-n', N);
  sec.innerHTML = `<div class="ch-stage">${bgHTML}${txHTML}</div>`;

  if (anchor && anchor.parentNode === story) anchor.after(sec);
  else story.appendChild(sec);

  const stage = sec.querySelector('.ch-stage');
  const bgs = [...sec.querySelectorAll('.ch-bg')];
  const txs = [...sec.querySelectorAll('.ch-t')];
  const orbs = bgs.map(b => b.querySelector('.ch-orb'));
  const fars = bgs.map(b => b.querySelector('.ch-lay.far'));
  const mids = bgs.map(b => b.querySelector('.ch-lay.mid'));
  const nears = bgs.map(b => b.querySelector('.ch-lay.near'));
  const nights = bgs.map(b => b.querySelector('.ch-night'));
  const darks = txs.map(t => t.querySelector('.ch-d'));
  const morns = txs.map(t => t.querySelector('.ch-s'));
  const cacheBg = new Array(N).fill(-1);
  const cacheTx = new Array(N).fill(-1);

  /* ---------- scroll ---------- */
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  let queued = false;

  function update() {
    queued = false;
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -50 || r.top > vh + 50) return;

    const total = r.height - stage.offsetHeight;
    const p = total > 0 ? clamp(-r.top / total) : 0;
    const pos = p * N;

    stage.style.opacity = Math.min(1, p / 0.015, (1 - p) / 0.02).toFixed(3);

    for (let i = 0; i < N; i++) {
      const c = i + 0.5, d = Math.abs(pos - c);

      const o = d < 0.5 ? 1 : d < 1 ? 1 - (d - 0.5) * 2 : 0;
      if (o !== cacheBg[i]) {
        cacheBg[i] = o;
        bgs[i].style.opacity = o;
        bgs[i].style.visibility = o > 0 ? 'visible' : 'hidden';
        bgs[i].classList.toggle('off', o === 0);
      }
      if (o > 0) {
        const s = pos - c;
        orbs[i].style.transform = `translate3d(0,${(-s * 8).toFixed(2)}vh,0) scale(${(1.05 + s * 0.1).toFixed(3)})`;
        if (fars[i])  fars[i].style.transform  = `translate3d(${(-s * 2).toFixed(2)}%,0,0)`;
        if (mids[i])  mids[i].style.transform  = `translate3d(${(-s * 4).toFixed(2)}%,0,0)`;
        if (nears[i]) nears[i].style.transform = `translate3d(${(-s * 6).toFixed(2)}%,0,0)`;
        const nt = s < -0.4 ? 0.62 : s < 0.1 ? 0.62 * (1 - (s + 0.4) / 0.5) : 0.35 * Math.min(1, (s - 0.1) / 0.4);
        nights[i].style.opacity = nt.toFixed(3);
      }

      const t = d < 0.3 ? 1 : d < 0.5 ? 1 - (d - 0.3) / 0.2 : 0;
      const key = t === 0 ? 0 : +(t.toFixed(3)) + pos;
      if (key !== cacheTx[i]) {
        cacheTx[i] = key;
        txs[i].style.opacity = t;
        txs[i].style.transform = `translate3d(0,${((c - pos) * 90).toFixed(1)}px,0)`;
        const sd = pos - c;
        darks[i].style.opacity = clamp((0.05 - sd) / 0.15);
        morns[i].style.opacity = clamp((sd + 0.1) / 0.15);
      }
    }
  }

  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', () => { queue(); setTimeout(queue, 300); });
  queue();
})();
