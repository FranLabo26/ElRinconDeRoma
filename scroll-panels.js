(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const panels = [...document.querySelectorAll('[data-scroll-panel]')];
  let idle, frame, guiding = false, touching = false, anchorUntil = 0;
  const blocked = () => reduced.matches || touching || document.hidden || !!document.querySelector('dialog[open]');
  function cancel() {
    clearTimeout(idle);
    cancelAnimationFrame(frame);
    guiding = false;
  }
  function moveTo(target) {
    cancel();
    const from = scrollY;
    const distance = target - from;
    if (Math.abs(distance) < 2) return;
    if (reduced.matches) { window.scrollTo({top: target, behavior: 'instant'}); return; }
    guiding = true;
    const start = performance.now();
    function step(now) {
      if (blocked()) { cancel(); return; }
      const progress = Math.min(1, (now - start) / 850);
      const eased = 1 - Math.pow(1 - progress, 4);
      window.scrollTo({ top: from + distance * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(step);
      else { guiding = false; anchorUntil = Date.now() + 180; }
    }
    frame = requestAnimationFrame(step);
  }
  const catalog = document.querySelector('#catalogo').closest('[data-scroll-panel]');
  const catalogTop = () => catalog.getBoundingClientRect().top + scrollY;
  let previousY = scrollY, direction = 1;
  function settle() {
    if (touching || document.hidden || document.querySelector('dialog[open]') || Date.now() < anchorUntil) return;
    const from = scrollY;
    const firstStop = catalogTop();
    // The welcome screen always resolves to an endpoint, never halfway.
    if (from > 2 && from < firstStop - 2) {
      moveTo(direction > 0 ? firstStop : 0);
      return;
    }
    if (reduced.matches) return;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const stops = panels.map(panel => Math.min(max, panel.getBoundingClientRect().top + from));
    stops.push(max);
    const target = stops.reduce((best, stop) => Math.abs(stop - from) < Math.abs(best - from) ? stop : best, stops[0]);
    if (Math.abs(target - from) >= 3 && Math.abs(target - from) <= innerHeight * .36) moveTo(target);
  }
  function schedule() {
    clearTimeout(idle);
    if (!guiding && !blocked()) idle = setTimeout(settle, 240);
  }
  window.addEventListener('scroll', () => { if (!guiding) { direction = scrollY >= previousY ? 1 : -1; } previousY = scrollY; schedule(); }, { passive: true });
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.querySelector('dialog[open]')) return;
    if (guiding) { event.preventDefault(); return; }
    if (event.deltaY > 0 && scrollY < catalogTop() - 2) {
      event.preventDefault();
      direction = 1;
      moveTo(catalogTop());
    } else cancel();
  }, { passive: false });
  window.addEventListener('pointerdown', cancel, { passive: true });
  window.addEventListener('touchstart', () => { touching = true; cancel(); }, { passive: true });
  window.addEventListener('touchend', () => { touching = false; schedule(); }, { passive: true });
  window.addEventListener('touchcancel', () => { touching = false; cancel(); }, { passive: true });
  window.addEventListener('keydown', cancel);
  document.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) { cancel(); anchorUntil = Date.now() + 1400; }
  });
  window.addEventListener('resize', cancel, { passive: true });
  reduced.addEventListener('change', cancel);
  document.querySelector('#product-dialog')?.addEventListener('close', cancel);
})();
