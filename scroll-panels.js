(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
      const progress = Math.min(1, (now - start) / 1500);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      window.scrollTo({ top: from + distance * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(step);
      else { guiding = false; anchorUntil = Date.now() + 180; }
    }
    frame = requestAnimationFrame(step);
  }
  const catalog = document.querySelector('#catalogo').closest('[data-scroll-panel]');
  const catalogTop = () => catalog.getBoundingClientRect().top + scrollY;
  let previousY = scrollY, direction = 1;
  let introComplete = scrollY >= catalogTop() - 2;
  function settle() {
    if (touching || document.hidden || document.querySelector('dialog[open]') || Date.now() < anchorUntil) return;
    const from = scrollY;
    const firstStop = catalogTop();
    // Guide only forward from the opening. The rest of the page never snaps back.
    if (!introComplete && direction > 0 && from > 2 && from < firstStop - 2) {
      moveTo(firstStop);
      return;
    }

  }
  function schedule() {
    clearTimeout(idle);
    if (!guiding && !blocked()) idle = setTimeout(settle, 240);
  }
  window.addEventListener('scroll', () => { if (!guiding) { direction = scrollY >= previousY ? 1 : -1; } previousY = scrollY; if (scrollY >= catalogTop() - 2) introComplete = true; if (scrollY <= 2 && !guiding) introComplete = false; schedule(); }, { passive: true });
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.querySelector('dialog[open]')) return;
    if (guiding) { event.preventDefault(); return; }
    if (!introComplete && event.deltaY > 0 && scrollY < catalogTop() - 2) {
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
