/* =========================================================
   FILM PROPS: animated scenes inside the 12 film chapters.
   B.<chapter>() builds the HTML. A.<chapter>() adds the scroll
   animation on the chapter's own 0 -> 1 timeline:
     0 - .10 fade in   .10 - .80 live   .80 - 1 exit
   Must load AFTER film_layers.js (it needs the stages).
   ========================================================= */
(() => {
  'use strict';
  if (!window.Story) return;

  window.Story.scenes.push(function initFilmProps() {
    const { isMobile, scrubValue } = window.Story;
    const scrub = scrubValue();

    /* ---------- helpers ---------- */
    const N = n => (isMobile ? Math.ceil(n * 0.55) : n);   // fewer particles on phones
    const r = (a, b) => a + Math.random() * (b - a);
    const f = (v, d = 1) => (+v).toFixed(d);
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const g = (name, inner) => `<div class="fp-g fp-g--${name}">${inner}</div>`;

    const motes = (n, c = '255,230,190') => {
      let s = '';
      for (let i = 0; i < N(n); i++) {
        s += `<i class="fp-mote" style="left:${f(r(0, 100))}%;top:${f(r(20, 100))}%;--s:${f(r(2, 5.5))}px;--dur:${f(r(9, 20))}s;--dx:${f(r(-70, 70), 0)}px;--c:${c};animation-delay:${f(-r(0, 20))}s"></i>`;
      }
      return g('motes', s);
    };

    const birds = (n, col) => {
      let s = '';
      for (let i = 0; i < N(n); i++) {
        s += `<svg class="fp-bird" viewBox="0 0 40 16" style="top:${f(r(10, 42))}%;--sc:${f(r(0.6, 1.3), 2)};--dur:${f(r(16, 30))}s;--delay:${f(-r(0, 28))}s${col ? ';color:' + col : ''}"><path d="M0 8 Q10 0 20 8 Q30 0 40 8 Q30 5 20 13 Q10 5 0 8Z"/></svg>`;
      }
      return g('birds', s);
    };

    // string of bulbs hanging in a curve; C = control height (bigger = deeper sag)
    const strand = (n, cols, C = 150) => {
      let bulbs = '';
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const y = (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * C + t * t * 6;
        bulbs += `<i style="left:${f(t * 100)}%;top:${f(y)}%;--c:${cols[i % cols.length]};--d:${f(r(1, 2.6))}s;animation-delay:${f(-r(0, 3))}s"></i>`;
      }
      return g('strand', `<div class="fp-strand"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 6 Q50 ${C} 100 6"/></svg>${bulbs}</div>`);
    };

    const petals = (n, cols) => {
      let s = '';
      for (let i = 0; i < N(n); i++) {
        s += `<i class="fp-petal" style="left:${f(r(0, 100))}%;--w:${f(r(8, 15), 0)}px;--c:${pick(cols)};--dur:${f(r(9, 17))}s;--delay:${f(-r(0, 17))}s;--dx:${f(r(-120, 120), 0)}px"></i>`;
      }
      return g('petals', s);
    };

    const lanterns = n => {
      let s = '';
      for (let i = 0; i < N(n); i++) {
        s += `<i class="fp-lantern" style="left:${f(r(4, 96))}%;--w:${f(r(16, 30), 0)}px;--dur:${f(r(14, 26))}s;--delay:${f(-r(0, 24))}s;--sw:${f(r(-90, 90), 0)}px"></i>`;
      }
      return g('lanterns', s);
    };

    const star = (cx, cy, R, rr, n) => {
      let d = '';
      for (let i = 0; i < n * 2; i++) {
        const a = (Math.PI * i) / n - Math.PI / 2;
        const rad = i % 2 ? rr : R;
        d += (i ? 'L' : 'M') + f(cx + Math.cos(a) * rad) + ' ' + f(cy + Math.sin(a) * rad);
      }
      return d + 'Z';
    };

    const planeSVG = () => {
      let w = '';
      for (let i = 0; i < 9; i++) w += `<rect x="${86 + i * 13}" y="36" width="7" height="5" rx="2"/>`;
      return `<svg viewBox="0 0 240 80"><g fill="currentColor"><path d="M30 40 Q30 31 50 31 H205 Q232 33 237 41 Q232 49 205 51 H50 Q30 49 30 40Z"/><path d="M40 33 L16 4 H36 L68 33Z"/><path d="M112 47 L150 76 H172 L152 47Z"/><path d="M112 35 L150 8 H172 L152 35Z"/></g><g fill="#ffd98a" opacity=".8">${w}</g></svg>`;
    };

    const palm = side => {
      const body = `<path d="M140 420 Q175 300 150 150" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/><path d="M150 150 Q95 95 15 130 Q95 118 150 150Z"/><path d="M150 150 Q85 130 5 200 Q95 158 150 150Z"/><path d="M150 150 Q120 80 70 55 Q128 95 150 150Z"/><path d="M150 150 Q152 70 180 40 Q166 100 150 150Z"/><path d="M150 150 Q205 95 285 130 Q205 118 150 150Z"/><path d="M150 150 Q215 130 295 200 Q205 158 150 150Z"/><path d="M150 150 Q178 80 235 58 Q172 95 150 150Z"/>`;
      return `<div class="fp-palm fp-palm--${side}"><svg viewBox="0 0 300 420"><g fill="currentColor"${side === 'r' ? ' transform="translate(300 0) scale(-1 1)"' : ''}>${body}</g></svg></div>`;
    };

    const burst = (x, y, col, d, delay) => {
      const n = isMobile ? 10 : 16;
      let rays = '';
      for (let i = 0; i < n; i++) rays += `<b style="--a:${f((i * 360) / n, 0)}deg"></b>`;
      return `<div class="fp-burst" style="left:${x}%;top:${y}%;--col:${col};--d:${d}px;--delay:${f(delay)}s">${rays}</div>`;
    };

    const rickshaw = cls =>
      `<div class="fp-rick ${cls}"><svg viewBox="0 0 200 100"><path d="M18 72 L22 44 Q52 18 102 24 L120 46 L142 50 L148 72Z" fill="currentColor"/><path d="M18 62 H146" stroke="#e8b43a" stroke-width="5"/><circle cx="42" cy="78" r="14" fill="#050305" stroke="#3a2a2a" stroke-width="4"/><circle cx="126" cy="78" r="14" fill="#050305" stroke="#3a2a2a" stroke-width="4"/><circle cx="147" cy="58" r="5" fill="#fff0b8"/><path d="M150 56 L196 42 L196 76Z" fill="rgba(255,240,180,.22)"/></svg></div>`;

    /* =======================================================
       B: BUILDERS (what each chapter contains)
       ======================================================= */
    const B = {};

    B.dawn = () =>
      g('band', '<div class="fp-band"></div>') +
      g('rays', '<div class="fp-raywrap"><div class="fp-rays"></div></div>') +
      birds(6) + motes(26, '255,214,150');

    B.home = () => {
      let w = '';
      for (let i = 0; i < N(16); i++) {
        w += `<i class="fp-win" style="left:${f(r(3, 92))}%;bottom:${f(r(14, 40))}%;--d:${f(r(4, 11))}s;animation-delay:${f(-r(0, 8))}s"></i>`;
      }
      return g('beam', '<div class="fp-beam"></div>') + g('win', w) +
        strand(18, ['#ffd48a', '#ff9a5a', '#ffe9b0', '#ff7d6b'], 150) + motes(30, '255,205,140');
    };

    B.preparation = () => {
      const cols = ['#e07a3a', '#c9a45c', '#3aa6b0', '#c24a6a', '#7a5cc0', '#e8d9b0'];
      const items = cols.map(c => `<i class="fp-cloth" style="--c:${c}"></i>`).join('');
      const suitcase = `<div class="fp-case"><svg viewBox="0 0 240 190"><path d="M88 40 V26 Q88 16 98 16 H142 Q152 16 152 26 V40" fill="none" stroke="#c9a45c" stroke-width="7" stroke-linecap="round"/><rect x="14" y="40" width="212" height="140" rx="18" fill="#2b1a14" stroke="#c9a45c" stroke-width="3"/><rect x="14" y="40" width="212" height="34" rx="18" fill="#3a2419"/><path d="M56 40 V180 M184 40 V180" stroke="#c9a45c" stroke-width="5" opacity=".7"/><rect x="104" y="70" width="32" height="22" rx="4" fill="#c9a45c"/><circle cx="120" cy="81" r="4" fill="#2b1a14"/></svg><div class="fp-click"></div></div>`;
      return suitcase + items + motes(16, '255,214,150');
    };

    B.food = () => {
      const glass = `<div class="fp-chai"><svg viewBox="0 0 120 150"><ellipse cx="60" cy="140" rx="52" ry="8" fill="#d9c9a8" opacity=".85"/><path d="M18 28 H102 L93 130 Q60 142 27 130Z" fill="#b8641f"/><path d="M18 28 H102 L100 44 Q60 54 20 44Z" fill="#e9b86a"/><path d="M18 28 H102 L93 130 Q60 142 27 130Z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/></svg><i class="fp-wisp" style="--d:0s;--dx:-10px"></i><i class="fp-wisp" style="--d:-1.8s;--dx:12px"></i><i class="fp-wisp" style="--d:-3.6s;--dx:-4px"></i></div>`;
      const bowls = [['#d9822b', 0], ['#8a3b1a', 60], ['#e7c35a', 120], ['#5f8a34', 180], ['#b83a2a', 240], ['#efe3c0', 300]]
        .map(([c, a]) => `<circle cx="${f(100 + Math.cos((a * Math.PI) / 180) * 54)}" cy="${f(100 + Math.sin((a * Math.PI) / 180) * 54)}" r="21" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`).join('');
      const thali = `<div class="fp-thali"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="98" fill="#c9bfa8" stroke="#c9a45c" stroke-width="3"/><circle cx="100" cy="100" r="86" fill="#d8cfba"/>${bowls}<circle cx="100" cy="100" r="22" fill="#f6efe0"/></svg></div>`;
      let sp = '';
      const gl = ['\u2726', '\u273A', '\u274B', '\u273F', '\u2727'];
      for (let i = 0; i < N(16); i++) {
        sp += `<i class="fp-spice" style="left:${f(r(5, 95))}%;top:${f(r(40, 100))}%;--s:${f(r(14, 30), 0)}px;--c:${pick(['#e8a23a', '#c9622c', '#f1d089', '#b04a2a', '#8fb04a'])};--dur:${f(r(8, 16))}s;--dx:${f(r(-60, 60), 0)}px;animation-delay:${f(-r(0, 14))}s">${pick(gl)}</i>`;
      }
      return glass + thali + g('spice', sp) + motes(12, '255,200,130');
    };

    B.street = () => {
      const signs =
        `<div class="fp-sign" style="left:6%;top:22%;--c:#ff5a8a">CHAI</div>` +
        `<div class="fp-sign" style="right:7%;top:19%;--c:#4ad8e8">SWEETS</div>` +
        `<div class="fp-sign" style="left:8%;top:60%;--c:#ffd04a">CINEMA</div>`;
      let st = '';
      for (let i = 0; i < N(9); i++) {
        st += `<i class="fp-streak" style="top:${f(r(62, 92))}%;--dur:${f(r(2.4, 5))}s;--delay:${f(-r(0, 5))}s;--c:${pick(['#ffd48a', '#ff6a5a', '#fff3d0'])}"></i>`;
      }
      return g('windows', '<div class="fp-windows"></div>') + g('signs', signs) + g('streaks', st) +
        '<div class="fp-signal"><i></i><i></i><i></i></div>' +
        rickshaw('fp-rick--a') + rickshaw('fp-rick--b') + motes(14, '255,180,120');
    };

    B.culture = () => {
      let m = '<circle class="m-p" r="96"/><circle class="m-p" r="70"/><circle class="m-p" r="34"/>';
      for (let k = 0; k < 12; k++) m += `<ellipse class="m-f" cx="0" cy="-52" rx="11" ry="26" transform="rotate(${k * 30})"/>`;
      for (let k = 0; k < 24; k++) m += `<ellipse class="m-f" cx="0" cy="-84" rx="5" ry="12" transform="rotate(${k * 15})"/>`;
      for (let k = 0; k < 12; k++) m += `<circle class="m-d" cx="0" cy="-22" r="2.6" transform="rotate(${k * 30})"/>`;
      m += '<circle class="m-d" r="5"/>';
      return `<div class="fp-mandala"><svg viewBox="-100 -100 200 200">${m}</svg></div>` +
        petals(22, ['#f39a1f', '#ffb43a', '#e8741a', '#c8321e']) + motes(16, '255,190,90');
    };

    B.festival = () => {
      const cols = ['#ff5a8a', '#ffd04a', '#4ad8e8', '#ff8a3a', '#9a6bff', '#7dff9a'];
      const pos = [[14, 24], [32, 12], [68, 14], [86, 26], [24, 46], [76, 44]].slice(0, isMobile ? 4 : 6);
      const bursts = pos.map(([x, y], i) => burst(x, y, cols[i % cols.length], f(r(110, 190), 0), -r(0, 4.2))).join('');
      const powder = [['10%', '62%', '#ff3d8a'], ['88%', '58%', '#ffd400'], ['30%', '88%', '#18c8e8'], ['70%', '90%', '#ff7a00']]
        .map(([l, t, c]) => `<i style="left:${l};top:${t};margin:-26vmin 0 0 -26vmin;--c:${c}"></i>`).join('');
      let diyas = '';
      for (let i = 0; i < (isMobile ? 6 : 10); i++) diyas += `<i class="fp-diya" style="--d:${f(-r(0, 0.6), 2)}s"></i>`;
      return g('powder', powder) + g('bursts', bursts) +
        strand(20, ['#ff5a8a', '#ffd04a', '#4ad8e8', '#ff8a3a'], 150) +
        lanterns(10) + g('diyas', diyas) + motes(16, '255,210,150');
    };

    B.departure = () =>
      `<div class="fp-board"><span>BHUBANESWAR</span><em>\u2708</em><span>PHILIPPINES</span><b class="fp-status">BOARDING</b></div>` +
      g('runway', '<div class="fp-runway"></div>') +
      `<div class="fp-plane fp-plane--dep"><div class="fp-bob">${planeSVG()}<i class="fp-beacon"></i></div></div>` +
      motes(14, '180,210,255');

    B.flight = () => {
      let cl = '', ln = '';
      for (let i = 0; i < N(7); i++) {
        cl += `<i class="fp-cloud" style="top:${f(r(46, 92))}%;--w:${f(r(26, 46), 0)}vw;--h:${f(r(10, 22), 0)}vh;--dur:${f(r(16, 34))}s;--delay:${f(-r(0, 30))}s"></i>`;
      }
      for (let i = 0; i < N(8); i++) {
        ln += `<i class="fp-streak" style="top:${f(r(8, 96))}%;--dur:${f(r(1.2, 2.8))}s;--delay:${f(-r(0, 3))}s;--c:#cfe0ff"></i>`;
      }
      const d = 'M60 250 Q500 -50 940 250';
      const route = `<div class="fp-route"><svg viewBox="0 0 1000 300"><path class="base" d="${d}"/><path class="prog" d="${d}"/><circle class="pin" cx="60" cy="250" r="5"/><circle class="pin" cx="940" cy="250" r="5"/><circle class="dot" cx="60" cy="250" r="8"/><text x="60" y="288" text-anchor="middle">INDIA</text><text x="940" y="288" text-anchor="middle">PHILIPPINES</text></svg></div>`;
      return '<div class="fp-window"></div>' + g('clouds', cl) + g('lines', ln) + route +
        `<div class="fp-plane fp-plane--fl"><div class="fp-bob">${planeSVG()}<i class="fp-beacon"></i></div></div>` +
        motes(18, '190,210,255');
    };

    B.arrival = () => {
      const waves = [['6%', 18], ['2%', 26], ['11%', 34]]
        .map(([b, d]) => `<div class="fp-wave" style="--b:${b};--dur:${d}s"></div>`).join('');
      const jeep = `<div class="fp-jeep"><svg viewBox="0 0 260 110"><path d="M8 80 V44 Q8 30 22 30 H178 L222 56 H246 Q256 58 256 68 V80Z" fill="currentColor"/><path d="M26 38 H96 V56 H26Z M104 38 H170 L196 56 H104Z" fill="#ffd98a" opacity=".75"/><rect x="8" y="64" width="248" height="6" fill="#e0502a"/><circle cx="64" cy="82" r="15" fill="#06090b" stroke="#1d2f38" stroke-width="4"/><circle cx="204" cy="82" r="15" fill="#06090b" stroke="#1d2f38" stroke-width="4"/><circle cx="250" cy="62" r="4" fill="#fff4c4"/></svg></div>`;
      return g('glimmer', '<div class="fp-glim"></div>') + waves + birds(5, '#0c2a33') + jeep +
        palm('l') + palm('r') + motes(16, '255,230,170');
    };

    B.philippines = () => {
      const parol = ([x, w, len, c, dur]) =>
        `<div class="fp-parol" style="left:${x}%;--w:${w}px;--len:${len}vh;--c:${c};--dur:${dur}s"><i></i><svg viewBox="0 0 100 100"><path d="${star(50, 50, 48, 24, 8)}" fill="${c}"/><path d="${star(50, 50, 30, 15, 8)}" fill="rgba(255,255,255,.55)"/><path d="M42 94 L38 124 M50 96 V130 M58 94 L62 124" stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"/></svg></div>`;
      const list = [[12, 110, 16, '#ffcf4a', 4.2], [30, 80, 26, '#ff5a6a', 5.1], [70, 86, 22, '#4ad8a0', 4.7], [88, 120, 14, '#ff9a3a', 5.6]];
      const parols = (isMobile ? list.slice(0, 3) : list).map(parol).join('');
      const fcols = ['#e0402a', '#f4b82a', '#2a7be0', '#f0f0e8'];
      let fl = '';
      for (let i = 0; i < 15; i++) {
        const t = (i + 0.5) / 15;
        const x = t * 100;
        const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 36 + t * t * 4;
        fl += `<polygon points="${f(x - 2.2, 2)},${f(y, 2)} ${f(x + 2.2, 2)},${f(y, 2)} ${f(x, 2)},${f(y + 8, 2)}" fill="${fcols[i % 4]}"/>`;
      }
      const bunting = `<div class="fp-bunting"><svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M0 4 Q50 36 100 4"/>${fl}</svg></div>`;
      const kubo = `<div class="fp-kubo"><svg viewBox="0 0 300 220"><g fill="currentColor"><path d="M10 104 L150 12 L290 104Z"/><rect x="52" y="104" width="196" height="46"/><rect x="60" y="150" width="8" height="62"/><rect x="146" y="150" width="8" height="62"/><rect x="232" y="150" width="8" height="62"/><path d="M96 150 L84 212 M118 150 L106 212" stroke="currentColor" stroke-width="5"/></g><rect class="lit" x="76" y="116" width="34" height="22"/><rect class="lit" x="190" y="116" width="34" height="22"/></svg></div>`;
      return g('bunting', bunting) + g('parols', parols) + kubo +
        petals(16, ['#fffdf5', '#f6f0dc']) + motes(26, '220,255,150');
    };

    B.together = () => {
      let fl = '', hl = '';
      for (let i = 0; i < N(14); i++) {
        fl += `<i class="fp-flow" style="left:${f(r(2, 44))}%;top:${f(r(18, 78))}%;--s:${f(r(2, 5))}px;--c:255,170,90;--fx:${f(r(30, 52), 0)}vw;--fy:${f(r(-6, 6), 0)}vh;--dur:${f(r(4, 9))}s;--delay:${f(-r(0, 9))}s"></i>`;
        fl += `<i class="fp-flow" style="left:${f(r(56, 98))}%;top:${f(r(18, 78))}%;--s:${f(r(2, 5))}px;--c:90,220,235;--fx:-${f(r(30, 52), 0)}vw;--fy:${f(r(-6, 6), 0)}vh;--dur:${f(r(4, 9))}s;--delay:${f(-r(0, 9))}s"></i>`;
      }
      for (let i = 0; i < N(14); i++) {
        hl += `<i class="fp-heart" style="left:${f(r(6, 94))}%;--s:${f(r(14, 34), 0)}px;--dur:${f(r(7, 13))}s;--delay:${f(-r(0, 13))}s;--dx:${f(r(-60, 60), 0)}px">\u2665</i>`;
      }
      return '<div class="fp-orb fp-orb--l"></div><div class="fp-orb fp-orb--r"></div><div class="fp-seam"></div><div class="fp-merge"></div>' +
        g('flow', fl) + g('hearts', hl);
    };

    B.future = () => {
      let sh = '';
      for (let i = 0; i < N(5); i++) {
        sh += `<i class="fp-shoot" style="left:${f(r(0, 70))}%;top:${f(r(4, 40))}%;--delay:${f(-r(0, 9))}s;--dur:${f(r(6, 11))}s"></i>`;
      }
      return '<div class="fp-horizon"></div>' +
        g('road', '<div class="fp-road"><div class="rd"></div><div class="dash"></div></div>') +
        g('shoot', sh) + lanterns(9) + motes(24, '255,225,170');
    };

    /* =======================================================
       A: SCROLL ANIMATION per chapter (positions are 0 -> 1)
       ======================================================= */
    const A = {};

    A.dawn = (tl, q) => {
      tl.fromTo(q('.fp-g--rays'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.1, duration: 0.75 }, 0.02)
        .fromTo(q('.fp-g--band'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 }, 0)
        .fromTo(q('.fp-g--birds'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.12);
    };

    A.home = (tl, q) => {
      tl.fromTo(q('.fp-g--beam'), { opacity: 0, xPercent: -12 }, { opacity: 1, xPercent: 4, duration: 0.75 }, 0.02)
        .fromTo(q('.fp-g--win'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.08)
        .fromTo(q('.fp-g--strand'), { yPercent: -100 }, { yPercent: 0, duration: 0.14, ease: 'power2.out' }, 0.02);
    };

    A.preparation = (tl, q) => {
      const items = q('.fp-cloth');
      tl.fromTo(q('.fp-case'), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.16, ease: 'power2.out' }, 0.02)
        .fromTo(items,
          {
            x: i => (i % 2 ? 1 : -1) * window.innerWidth * (0.28 + 0.04 * i),
            y: i => -window.innerHeight * (0.34 - 0.04 * i),
            rotation: i => (i % 2 ? 1 : -1) * (40 + i * 10),
            opacity: 0
          },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.14, stagger: 0.05, ease: 'power2.in' }, 0.14)
        .to(items, { opacity: 0, scale: 0.4, duration: 0.04, stagger: 0.05 }, 0.30)
        .to(q('.fp-case'), { scale: 1.06, duration: 0.05 }, 0.58)
        .to(q('.fp-case'), { scale: 1, duration: 0.05 }, 0.63)
        .fromTo(q('.fp-click'), { scale: 0.4, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.16 }, 0.58);
    };

    A.food = (tl, q) => {
      tl.fromTo(q('.fp-chai'), { xPercent: -60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.06)
        .fromTo(q('.fp-thali'), { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.12)
        .fromTo(q('.fp-g--spice'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1);
    };

    A.street = (tl, q) => {
      tl.fromTo(q('.fp-g--windows'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.02)
        .fromTo(q('.fp-g--signs'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.06)
        .fromTo(q('.fp-rick--a'), { x: '-35vw' }, { x: '135vw', duration: 0.8 }, 0.06)
        .fromTo(q('.fp-rick--b'), { x: '135vw' }, { x: '-35vw', duration: 0.8 }, 0.14);
    };

    A.culture = (tl, q) => {
      tl.fromTo(q('.fp-mandala'), { rotation: -40, scale: 0.55, opacity: 0 }, { rotation: 60, scale: 1.1, opacity: 1, duration: 0.85 }, 0)
        .fromTo(q('.fp-g--petals'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.1);
    };

    A.festival = (tl, q) => {
      tl.fromTo(q('.fp-g--powder i'), { scale: 0.2, opacity: 0 }, { scale: 1.5, opacity: 0.85, duration: 0.5, stagger: 0.08, ease: 'power1.out' }, 0.1)
        .fromTo(q('.fp-g--bursts'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.08)
        .fromTo(q('.fp-g--diyas'), { yPercent: 100 }, { yPercent: 0, duration: 0.14, ease: 'power2.out' }, 0.02)
        .fromTo(q('.fp-g--strand'), { yPercent: -100 }, { yPercent: 0, duration: 0.14, ease: 'power2.out' }, 0.02);
    };

    A.departure = (tl, q) => {
      tl.fromTo(q('.fp-g--runway'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.02)
        .fromTo(q('.fp-board'), { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: 'power2.out' }, 0.04)
        .fromTo(q('.fp-plane--dep'), { x: '-30vw', y: 0, rotation: 0 },
          { x: '78vw', y: '-52vh', rotation: -13, duration: 0.72, ease: 'power1.in' }, 0.12);
    };

    A.flight = (tl, q, wrap) => {
      const path = wrap.querySelector('.fp-route .prog');
      const dot = wrap.querySelector('.fp-route .dot');
      if (path && dot) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        const proxy = { p: 0 };
        tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.7 }, 0.08)
          .fromTo(proxy, { p: 0 }, {
            p: 1, duration: 0.7,
            onUpdate() {
              const pt = path.getPointAtLength(proxy.p * len);
              dot.setAttribute('cx', pt.x);
              dot.setAttribute('cy', pt.y);
            }
          }, 0.08);
      }
      tl.fromTo(q('.fp-g--clouds'), { xPercent: 8 }, { xPercent: -14, duration: 0.9 }, 0)
        .fromTo(q('.fp-plane--fl'), { x: '-8vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.18 }, 0.04);
    };

    A.arrival = (tl, q) => {
      tl.fromTo(q('.fp-g--glimmer'), { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: 0.4 }, 0.04)
        .fromTo(q('.fp-jeep'), { x: '-45vw' }, { x: '110vw', duration: 0.8 }, 0.08)
        .fromTo(q('.fp-palm--l'), { xPercent: -30 }, { xPercent: 0, duration: 0.3, ease: 'power2.out' }, 0)
        .fromTo(q('.fp-palm--r'), { xPercent: 30 }, { xPercent: 0, duration: 0.3, ease: 'power2.out' }, 0);
    };

    A.philippines = (tl, q) => {
      tl.fromTo(q('.fp-g--bunting'), { yPercent: -100 }, { yPercent: 0, duration: 0.16, ease: 'power2.out' }, 0)
        .fromTo(q('.fp-g--parols'), { yPercent: -110 }, { yPercent: 0, duration: 0.2, ease: 'back.out(1.2)' }, 0.03)
        .fromTo(q('.fp-kubo'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.2 }, 0.1);
    };

    A.together = (tl, q) => {
      tl.fromTo(q('.fp-orb--l'), { x: '-30vw', scale: 0.8 }, { x: 0, scale: 1.25, duration: 0.55, ease: 'power2.inOut' }, 0.06)
        .fromTo(q('.fp-orb--r'), { x: '30vw', scale: 0.8 }, { x: 0, scale: 1.25, duration: 0.55, ease: 'power2.inOut' }, 0.06)
        .fromTo(q('.fp-seam'), { opacity: 0.8, scaleY: 0.4 }, { opacity: 0, scaleY: 1, duration: 0.5 }, 0.06)
        .fromTo(q('.fp-merge'), { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.3, duration: 0.06 }, 0.58)
        .to(q('.fp-merge'), { opacity: 0, scale: 2.4, duration: 0.2 }, 0.64)
        .fromTo(q('.fp-g--hearts'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.6);
    };

    A.future = (tl, q) => {
      tl.fromTo(q('.fp-horizon'), { scale: 0.5, opacity: 0 }, { scale: 1.4, opacity: 1, duration: 0.8 }, 0)
        .fromTo(q('.fp-g--road'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.04)
        .fromTo(q('.fp-g--lanterns'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1);
    };

    /* ---------- attach to every chapter ---------- */
    document.querySelectorAll('.film-layer').forEach(layer => {
      const key = layer.dataset.film;
      const stage = layer.querySelector('.film-stage');
      if (!stage || !B[key] || stage.querySelector('.fp')) return;

      const wrap = document.createElement('div');
      wrap.className = 'fp fp--' + key;
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = B[key]();

      const content = stage.querySelector('.film-content');
      if (content) stage.insertBefore(wrap, content); else stage.appendChild(wrap);

      if (!A[key]) return;
      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: { trigger: layer, start: 'top top', end: 'bottom bottom', scrub }
      });
      A[key](tl, sel => wrap.querySelectorAll(sel), wrap);
      tl.set({}, {}, 1);
    });
  });
})();
