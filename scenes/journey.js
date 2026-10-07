/* =========================================================
   CINEMATIC JOURNEY
   India → Bhubaneswar → Flight → Globe → Philippines
   ========================================================= */

(function () {
  'use strict';

  const Story = window.Story;

  if (!Story || !window.gsap || !window.ScrollTrigger) {
    console.warn('Journey scene waiting for GSAP / Story.');
    return;
  }

  function initJourney() {

    const journey = document.querySelector('.journey');

    if (!journey) {
      console.warn('Journey scene not found.');
      return;
    }

    /*
     * Master cinematic timeline.
     *
     * These scenes are intentionally placeholders.
     * We will build the visuals one by one.
     */

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: journey,
        start: 'top top',
        end: 'bottom bottom',
        scrub: Story.scrubValue || 1,
        invalidateOnRefresh: true
      }
    });

    /* -----------------------------------------------------
       01 — WALKING THROUGH INDIA
       ----------------------------------------------------- */

    timeline
      .to('.journey__india', {
        opacity: 1,
        duration: 1
      })

      .to('.journey__india', {
        scale: 1.12,
        y: '-4vh',
        duration: 2,
        ease: 'none'
      });

    /* -----------------------------------------------------
       02 — BHUBANESWAR
       ----------------------------------------------------- */

    timeline
      .to('.journey__india', {
        opacity: 0,
        duration: 1
      })

      .to('.journey__bhubaneswar', {
        opacity: 1,
        duration: 1
      })

      .to('.journey__bhubaneswar', {
        scale: 1.08,
        duration: 2,
        ease: 'none'
      });

    /* -----------------------------------------------------
       03 — AIRPORT / DEPARTURE
       ----------------------------------------------------- */

    timeline
      .to('.journey__bhubaneswar', {
        opacity: 0,
        duration: 1
      })

      .to('.journey__airport', {
        opacity: 1,
        duration: 1
      });

    /* -----------------------------------------------------
       04 — AIRPLANE
       ----------------------------------------------------- */

    timeline
      .to('.journey__airport', {
        opacity: 0,
        duration: 1
      })

      .to('.journey__flight', {
        opacity: 1,
        duration: 1
      })

      .to('.journey__flight-plane', {
        x: '55vw',
        y: '-18vh',
        rotate: -8,
        duration: 4,
        ease: 'power1.inOut'
      });

    /* -----------------------------------------------------
       05 — GLOBE
       ----------------------------------------------------- */

    timeline
      .to('.journey__flight', {
        opacity: 0,
        duration: 1
      })

      .to('.journey__globe', {
        opacity: 1,
        duration: 1
      })

      .to('.journey__globe-earth', {
        rotation: 22,
        scale: 1.18,
        duration: 4,
        ease: 'none'
      });

    /* -----------------------------------------------------
       06 — PHILIPPINES ARRIVAL
       ----------------------------------------------------- */

    timeline
      .to('.journey__globe', {
        opacity: 0,
        duration: 1
      })

      .to('.journey__philippines', {
        opacity: 1,
        duration: 1
      })

      .to('.journey__philippines', {
        scale: 1.10,
        duration: 3,
        ease: 'none'
      });

    /* -----------------------------------------------------
       07 — ENDLESS FEELING
       ----------------------------------------------------- */

    timeline.to('.journey__philippines', {
      opacity: 0,
      duration: 2
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJourney);
  } else {
    initJourney();
  }

})();
