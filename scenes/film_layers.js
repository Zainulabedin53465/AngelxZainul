/* =========================================================
   FILM LAYERS: 12 cinematic chapters
   Same camera language as India / Philippines:
   far -> mid -> near planes move at different speeds.

   ONE timing table (T) drives every chapter. Each number is a
   position on the chapter's own 0 -> 1 scroll timeline.
   Chapter scroll LENGTH lives in film.css (--film-length).
   ========================================================= */
(() => {
  'use strict';
  if (!window.Story) return;

  window.Story.scenes.push(function initFilmLayers() {
    const layers = [...document.querySelectorAll('.film-layer')];
    if (!layers.length) return;

    const { isMobile, scrubValue } = window.Story;
    const scrub = scrubValue();

    /* ---------- TIMING TABLE (edit these, not the code) ---------- */
    const T = {
      fadeIn:    { at: 0.00, dur: 0.10 },  // chapter rises out of black
      label:     { at: 0.10, dur: 0.12 },  // small caps line
      title:     { at: 0.14, dur: 0.18 },  // big heading
      text:      { at: 0.28, dur: 0.15 },  // sentence
      exitText:  { at: 0.74, dur: 0.12 },  // text lifts away
      exitWorld: { at: 0.80, dur: 0.20 },  // world drifts left faster
      fadeOut:   { at: 0.88, dur: 0.12 }   // chapter sinks into black
    };

    /* ---------- CAMERA (far moves least, near moves most) ---------- */
    const CAM = {
      scale: { far: 1.045, mid: 1.10, near: 1.18 },
      drift: { far: -1.2,  mid: -2.2, near: -3.8 },
      exit:  { far: -3,    mid: -5,   near: -7 }
    };

    layers.forEach(layer => {
      /* Build the pinned stage + 3 depth planes (once) */
      let stage = layer.querySelector(':scope > .film-stage');
      if (!stage) {
        stage = document.createElement('div');
        stage.className = 'film-stage';
        while (layer.firstChild) stage.appendChild(layer.firstChild);

        const depth = document.createElement('div');
        depth.className = 'film-depth';
        depth.innerHTML =
          '<div class="film-depth__far"></div>' +
          '<div class="film-depth__mid"></div>' +
          '<div class="film-depth__near"></div>';
        stage.insertBefore(depth, stage.firstChild);
        layer.appendChild(stage);
      }
      layer.classList.add('is-armed');

      const plane = {
        far:  stage.querySelector('.film-depth__far'),
        mid:  stage.querySelector('.film-depth__mid'),
        near: stage.querySelector('.film-depth__near')
      };
      const content = stage.querySelector('.film-content');
      const label = content && content.querySelector('span');
      const title = content && content.querySelector('h2');
      const text  = content && content.querySelector('p');

      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: {
          trigger: layer,
          start: 'top top',
          end: 'bottom bottom',
          scrub,
          // only the active chapter is painted (big performance win)
          onToggle: self => layer.classList.toggle('is-on', self.isActive)
        }
      });

      /* 1. Chapter rises out of black */
      tl.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: T.fadeIn.dur }, T.fadeIn.at);

      /* 2. Camera: push-in the whole way; slow drift, then faster exit
            drift. The two xPercent tweens meet at exitWorld.at, no overlap. */
      ['far', 'mid', 'near'].forEach(k => {
        tl
          .to(plane[k], { scale: CAM.scale[k] }, 0)
          .to(plane[k], { xPercent: CAM.drift[k], duration: T.exitWorld.at }, 0)
          .to(plane[k], { xPercent: CAM.exit[k],  duration: T.exitWorld.dur }, T.exitWorld.at);
      });

      /* 3. Text reveal: label -> title -> sentence */
      const blurFrom = isMobile ? {} : { filter: 'blur(8px)' };
      const blurTo   = isMobile ? {} : { filter: 'blur(0px)' };

      if (label) {
        tl.fromTo(label,
          { opacity: 0, y: 18 },
          { opacity: 0.72, y: 0, duration: T.label.dur }, T.label.at);
      }
      if (title) {
        tl.fromTo(title,
          { opacity: 0, y: 30, ...blurFrom },
          { opacity: 1, y: 0, ...blurTo, duration: T.title.dur }, T.title.at);
      }
      if (text) {
        tl.fromTo(text,
          { opacity: 0, y: 20 },
          { opacity: 0.68, y: 0, duration: T.text.dur }, T.text.at);
      }

      /* 4. Exit: text lifts away, then the chapter sinks into black */
      if (content) {
        tl.to(content, { opacity: 0, y: -40, duration: T.exitText.dur }, T.exitText.at);
      }
      tl.to(stage, { opacity: 0, duration: T.fadeOut.dur }, T.fadeOut.at);
    });
  });
})();
