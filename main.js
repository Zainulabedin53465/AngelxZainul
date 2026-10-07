/* =========================================================
   main.js: CORE ENGINE
   Scenes live in /scenes and register themselves with
   window.Story.scenes. This file runs them after setup.

   Structure:
     1. setup + shared helpers (exposed as window.Story)
     2. performance tools
     3. smooth scroll
     4. opening sequence
     5. global scroll animations
     6. init
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';

  let lenis = null;

  /* -------------------------------------------------------
     1. SHARED HELPERS
     ------------------------------------------------------- */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    const chars = [];
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
      chars.push(span);
    }
    return chars;
  }

  // Floating particles. Pure CSS animation = no JS work per frame.
  function createEmbers(container, count) {
    if (!container) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const e = document.createElement('span');
      e.className = 'ember';
      const size = 2 + Math.random() * 3;
      e.style.left = Math.random() * 100 + '%';
      e.style.width = e.style.height = size + 'px';
      e.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      e.style.setProperty('--dur', (9 + Math.random() * 10) + 's');
      e.style.animationDelay = (-Math.random() * 18) + 's';
      frag.appendChild(e);
    }
    container.appendChild(frag);
  }

  // Shared API for scene files. With Lenis active, ScrollTrigger must NOT
  // add its own extra smoothing, so scrubValue() returns true.
  window.Story = {
    reduceMotion,
    isMobile,
    scenes: [],
    scrubValue: () => (lenis ? true : 0.6),
    splitChars,
    createEmbers
  };

  // Fallback for reduced motion / missing libraries: show everything, no animation
  function showStatic() {
    document.querySelectorAll('.title__line').forEach(el => (el.style.visibility = 'visible'));
    const cue = document.querySelector('.cue');
    if (cue) cue.style.opacity = 1;
    document.querySelectorAll('.bar').forEach(el => (el.style.transform = 'scaleY(0.18)'));
    document.querySelectorAll('.india__sub, .ph__sub').forEach(el => (el.style.opacity = 1));
    document.querySelectorAll('.ph__fade').forEach(el => (el.style.opacity = 0));
  }

  /* -------------------------------------------------------
     2. PERFORMANCE TOOLS
     ------------------------------------------------------- */

  // Marks scenes with .is-live while on (or near) screen. CSS pauses
  // infinite animations in scenes you can't see.
  function watchScenes() {
    const scenes = document.querySelectorAll('[data-scene], [data-film]');
    if (!('IntersectionObserver' in window)) {
      scenes.forEach(s => s.classList.add('is-live'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('is-live', e.isIntersecting));
    }, { rootMargin: '10% 0px' });
    scenes.forEach(s => io.observe(s));
  }

  // Add ?fps to the URL to see the frame rate. If FPS stays under 40 for
  // 3 seconds, "lowfx" mode switches off grain, embers and mist.
  function watchPerformance() {
    const root = document.documentElement;
    let fpsEl = null;
    if (new URLSearchParams(location.search).has('fps')) {
      fpsEl = document.createElement('div');
      fpsEl.style.cssText =
        'position:fixed;top:12px;right:12px;z-index:200;padding:4px 8px;' +
        'font:12px monospace;color:#c9a45c;background:rgba(0,0,0,.6);border-radius:4px';
      document.body.appendChild(fpsEl);
    }

    let frames = 0;
    let last = performance.now();
    let slowSeconds = 0;

    gsap.ticker.add(() => {
      frames++;
      const now = performance.now();
      if (now - last < 1000) return;

      const fps = (frames * 1000) / (now - last);
      frames = 0;
      last = now;

      const low = root.classList.contains('lowfx');
      if (fpsEl) fpsEl.textContent = Math.round(fps) + ' fps' + (low ? ' | low fx' : '');

      if (!document.hidden && !low) {
        slowSeconds = fps < 22 ? slowSeconds + 1 : 0;
        if (slowSeconds >= 6) {
          root.classList.add('lowfx');
          console.log('[story] low FPS detected, switching to low-effects mode');
        }
      }
    });

    document.addEventListener('visibilitychange', () => {
      frames = 0; last = performance.now(); slowSeconds = 0;
    });
  }

  /* -------------------------------------------------------
     3. SMOOTH SCROLL
     ------------------------------------------------------- */
  function initSmoothScroll() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ force3D: true });
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (!hasLenis || reduceMotion || isMobile) return;

    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* -------------------------------------------------------
     4. OPENING SEQUENCE
     ------------------------------------------------------- */
  function playOpening() {
    const lineOne = document.querySelector('.title__line--one');
    const lineTwo = document.querySelector('.title__line--two');
    const charsOne = splitChars(lineOne);
    const charsTwo = splitChars(lineTwo);
    const allChars = [...charsOne, ...charsTwo];

    gsap.set(allChars, { opacity: 0, y: 24, filter: 'blur(14px)' });
    gsap.set('.cue', { opacity: 0 });

    lineOne.style.visibility = 'visible';
    lineTwo.style.visibility = 'visible';

    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        gsap.set(allChars, { clearProps: 'filter,willChange' });
        watchPerformance();
      }
    });

    // INTRO TIMING (seconds). Total is about 4s, then scrolling unlocks.
    tl
      .to('.bar', { scaleY: 0.18, duration: 1.6, ease: 'expo.inOut' }, 0.2)
      .to(charsOne, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, stagger: 0.05 }, 0.7)
      .to(charsTwo, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.045 }, '>-0.5')
      .to('.cue', { opacity: 1, duration: 0.8 }, '>-0.2');
  }

  /* -------------------------------------------------------
     5. GLOBAL SCROLL ANIMATIONS
     ------------------------------------------------------- */
  function initGlobalScroll() {
    const scrub = window.Story.scrubValue();

    // OPENING SCROLL-OUT TIMING (edit these)
    const OPEN = {
      zoom: 1.25,          // title zoom over the whole scene
      fadeStart: '8% top', // title starts dissolving here...
      fadeEnd: '75% top',  // ...and is gone here
      cueEnd: '12% top'    // SCROLL cue disappears quickly
    };

    gsap.to('.title', {
      scale: OPEN.zoom, ease: 'none',
      scrollTrigger: { trigger: '.scene--opening', start: 'top top', end: 'bottom top', scrub }
    });

    gsap.to('.title', {
      opacity: 0, ease: 'power1.in',
      scrollTrigger: { trigger: '.scene--opening', start: OPEN.fadeStart, end: OPEN.fadeEnd, scrub }
    });

    gsap.to('.cue', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.scene--opening', start: 'top top', end: OPEN.cueEnd, scrub }
    });

    gsap.to('.glow', {
      yPercent: -60, ease: 'none',
      scrollTrigger: { trigger: '.scene--opening', start: 'top top', end: 'bottom top', scrub }
    });

    gsap.to('.progress__fill', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub }
    });
  }

  /* -------------------------------------------------------
     6. INIT
     Scene files are plain <script> tags, so they have all
     registered themselves before DOMContentLoaded fires.
     ------------------------------------------------------- */
  function init() {
    if (!hasGSAP) {
      showStatic();
      return;
    }

    watchScenes();
    initSmoothScroll();

    if (reduceMotion) {
      showStatic();
      return;
    }

    playOpening();
    initGlobalScroll();

    // One broken scene must never take the others down with it
    window.Story.scenes.forEach(initScene => {
      try { initScene(); }
      catch (err) { console.error('[story] scene failed to start:', err); }
    });

    // All triggers exist now: measure everything once
    ScrollTrigger.refresh();
    if (document.readyState === 'complete') ScrollTrigger.refresh();
    else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Wait for fonts, but never more than 2.5s (slow or blocked network)
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    const timeout = new Promise(resolve => setTimeout(resolve, 2500));
    Promise.race([fontsReady, timeout]).then(init);
  });

})();
