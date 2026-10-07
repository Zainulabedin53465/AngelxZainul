(function () {
  if (!/[?&]debug2/.test(location.search)) return;
  var box = document.createElement('pre');
  box.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483647;margin:0;padding:6px;font:11px/1.35 monospace;color:#0f0;background:rgba(0,0,0,.85);white-space:pre-wrap;pointer-events:none';
  window.addEventListener('DOMContentLoaded', function () { document.body.appendChild(box); });
  function tick() {
    var out = [];
    out.push('scrollY: ' + Math.round(scrollY) + ' | vh: ' + innerHeight + ' | triggers: ' + (window.ScrollTrigger ? ScrollTrigger.getAll().length : 'n/a'));
    var layers = document.querySelectorAll('.film-layer');
    out.push('film layers: ' + layers.length);
    var shown = 0;
    layers.forEach(function (l) {
      var r = l.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && shown < 2) {
        shown++;
        var s = l.querySelector('.film-stage');
        var cs = s ? getComputedStyle(s) : null;
        var depth = l.querySelector('.film-depth__near');
        out.push('> ' + l.dataset.film + ' | class: ' + l.className.replace(/film-layer/g, '').trim());
        out.push('  stage: ' + (s ? 'yes' : 'NO') + (cs ? ' vis=' + cs.visibility + ' op=' + (+cs.opacity).toFixed(2) + ' h=' + Math.round(s.getBoundingClientRect().height) : ''));
        out.push('  layerTop=' + Math.round(r.top) + ' layerH=' + Math.round(r.height) + ' depth=' + (depth ? 'yes' : 'NO'));
      }
    });
    box.textContent = out.join('\n');
  }
  setInterval(tick, 500);
  window.addEventListener('error', function (e) { box.textContent += '\nERR: ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno; });
})();
