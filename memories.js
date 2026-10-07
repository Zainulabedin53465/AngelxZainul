(function () {
  const tabs = document.getElementById("memTabs");
  const grid = document.getElementById("memGrid");
  const box = document.getElementById("memLightbox");
  const big = document.getElementById("memLightImg");
  let current = [], idx = 0;

  const folders = Object.keys(MEMORY_IMAGES).filter(k => MEMORY_IMAGES[k].length);
  const all = folders.flatMap(k => MEMORY_IMAGES[k]);

  function show(list) {
    current = list;
    grid.innerHTML = "";
    list.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = encodeURI(src);
      img.loading = i < 9 ? "eager" : "lazy";
      img.decoding = "async";
      img.onload = () => img.classList.add("show");
      img.onclick = () => open(i);
      grid.appendChild(img);
    });
  }

  function open(i) { idx = i; big.src = encodeURI(current[i]); box.classList.add("open"); }
  function step(d) { idx = (idx + d + current.length) % current.length; big.src = encodeURI(current[idx]); }

  [["all", all], ...folders.map(f => [f, MEMORY_IMAGES[f]])].forEach(([name, list], n) => {
    const b = document.createElement("button");
    b.textContent = name;
    if (n === 0) b.classList.add("active");
    b.onclick = () => {
      tabs.querySelectorAll("button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      show(list);
    };
    tabs.appendChild(b);
  });

  document.getElementById("memClose").onclick = () => box.classList.remove("open");
  document.getElementById("memPrev").onclick = () => step(-1);
  document.getElementById("memNext").onclick = () => step(1);
  box.onclick = e => { if (e.target === box) box.classList.remove("open"); };
  document.addEventListener("keydown", e => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") box.classList.remove("open");
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // start downloading every photo in the background once the page has loaded
  const warm = () => all.forEach(src => { const im = new Image(); im.decoding = "async"; im.src = encodeURI(src); });
  if (document.readyState === "complete") setTimeout(warm, 500);
  else window.addEventListener("load", () => setTimeout(warm, 500));

  show(all);
})();
