(function () {
  const section = document.getElementById("memories");
  if (!section) return;

  const cine = document.createElement("div");
  cine.className = "cine";
  cine.innerHTML = `
    <div class="bar top"></div><div class="bar bot"></div>
    <div class="title">
      <div class="small">Final Scene</div>
      <div class="big">Our Memories</div>
      <div class="line"></div>
    </div>
    <div class="grain"></div>`;
  document.body.appendChild(cine);

  const wait = ms => new Promise(r => setTimeout(r, ms));
  let played = false;

  async function play() {
    if (played) return;
    played = true;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    cine.classList.add("on");
    await wait(50);
    cine.classList.add("closed");          // bars close, title fades in
    await wait(2800);                       // hold the title card
    cine.classList.add("opening");          // title out
    cine.classList.remove("closed");        // bars open
    section.classList.add("revealed");      // photos start focusing in
    await wait(1100);
    cine.classList.remove("on", "opening");
    document.body.style.overflow = prevOverflow;
  }

  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { obs.disconnect(); play(); }
  }, { threshold: 0.25 }).observe(section);
})();
