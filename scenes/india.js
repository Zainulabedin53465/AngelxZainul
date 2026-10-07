/* =========================================================
   SCENE 02: INDIA
   One scrubbed timeline spanning the whole runway. Timeline
   time 0 -> 1 maps to scroll progress through the scene.
   ========================================================= */
(() => {
  'use strict';
  const { isMobile, scrubValue, splitChars, createEmbers } = window.Story;

  window.Story.scenes.push(function initIndiaScene() {
    createEmbers(document.querySelector('.runway--india .embers'), isMobile ? 8 : 24);

    const chars = splitChars(document.querySelector('.india__word'));

    // Small blur only on desktop; phones use opacity + movement only
    const blurFrom = isMobile ? {} : { filter: 'blur(8px)' };
    const blurTo   = isMobile ? {} : { filter: 'blur(0px)' };

    const tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: {
        trigger: '.runway--india',
        start: 'top top',
        end: 'bottom bottom',
        scrub: scrubValue()
      }
    });

    tl
      // Camera push-in: near layer zooms the most = depth
      .to('.runway--india .layer--far',  { scale: 1.06 }, 0)
      .to('.runway--india .layer--mid',  { scale: 1.14 }, 0)
      .to('.runway--india .layer--near', { scale: 1.30 }, 0)
      .to('.runway--india .sun',         { yPercent: -18, scale: 1.2 }, 0)
      .to('.runway--india .backdrop',    { scale: 1.1 }, 0)

      // Text reveal
      .fromTo(chars,
        { opacity: 0, y: 30, ...blurFrom },
        { opacity: 1, y: 0, ...blurTo, stagger: 0.03, duration: 0.18 }, 0.08)
      .fromTo('.india__sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.15 }, 0.3)

      // TRANSITION OUT: the world drifts left (we are travelling east)
      // while the text leaves and the scene fades to black.
      .to('.runway--india .layer--far',  { xPercent: -2.5, duration: 0.2 }, 0.8)
      .to('.runway--india .layer--mid',  { xPercent: -4.5, duration: 0.2 }, 0.8)
      .to('.runway--india .layer--near', { xPercent: -7,   duration: 0.2 }, 0.8)
      .to('.india__text', { opacity: 0, y: -40, duration: 0.12 }, 0.76)
      .to('.india__fade', { opacity: 1, duration: 0.15 }, 0.85);
  });
})();
