/* =========================================================
   SCENE 03: PHILIPPINES
   Opens on black. A light streak sweeps across, the black
   fades out, and the world pans in from the right (the
   continuation of India's leftward drift).
   ========================================================= */
(() => {
  'use strict';
  const { isMobile, scrubValue, splitChars, createEmbers } = window.Story;

  window.Story.scenes.push(function initPhilippinesScene() {
    createEmbers(document.querySelector('.runway--ph .embers'), isMobile ? 6 : 16);

    const chars = splitChars(document.querySelector('.ph__word'));

    const blurFrom = isMobile ? {} : { filter: 'blur(8px)' };
    const blurTo   = isMobile ? {} : { filter: 'blur(0px)' };

    const tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: {
        trigger: '.runway--ph',
        start: 'top top',
        end: 'bottom bottom',
        scrub: scrubValue()
      }
    });

    tl
      // ARRIVAL: streak sweeps left -> right, black fades out
      .fromTo('.ph__streak', { xPercent: -140, opacity: 1 }, { xPercent: 140, opacity: 1, duration: 0.16 }, 0)
      .fromTo('.ph__fade',   { opacity: 1 }, { opacity: 0, duration: 0.14 }, 0.03)

      // Camera: pans in from the right while pushing forward.
      // Far layers move least, near layers most = parallax depth.
      .fromTo('.ph-layer--far',  { xPercent: 3, scale: 1 }, { xPercent: 0, scale: 1.06 }, 0)
      .fromTo('.ph-layer--mid',  { xPercent: 5, scale: 1 }, { xPercent: 0, scale: 1.14 }, 0)
      .fromTo('.ph-layer--near', { xPercent: 8, scale: 1 }, { xPercent: 0, scale: 1.28 }, 0)

      // Sun rises out of the sea
      .fromTo('.ph-sun', { yPercent: 60, scale: 1 }, { yPercent: -22, scale: 1.15 }, 0)
      .to('.runway--ph .backdrop', { scale: 1.1 }, 0)

      // Text reveal
      .fromTo(chars,
        { opacity: 0, y: 30, ...blurFrom },
        { opacity: 1, y: 0, ...blurTo, stagger: 0.025, duration: 0.16 }, 0.2)
      .fromTo('.ph__sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.15 }, 0.42)

      // Exit: text leaves, scene fades to black (handoff to the next scene)
      .to('.ph__text', { opacity: 0, y: -40, duration: 0.12 }, 0.76)
      .to('.ph__fade', { opacity: 1, duration: 0.15 }, 0.85);
  });
})();
