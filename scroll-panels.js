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
  function settle() {
    if (blocked() || Date.now() < anchorUntil) return;
    const from = scrollY;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const stops = panels.map(panel => Math.min(max, panel.getBoundingClientRect().top + from));
    stops.push(max);
    const target = stops.reduce((best, stop) => Math.abs(stop - from) < Math.abs(best - from) ? stop : best, stops[0]);
    const distance = target - from;
    // Only guide near section boundaries, leaving the full catalog freely scrollable.
    if (Math.abs(distance) < 3 || Math.abs(distance) > innerHeight * .36) return;
    guiding = true;
    const start = performance.now();
    function step(now) {
      if (blocked()) { cancel(); return; }
      const progress = Math.min(1, (now - start) / 650);
      const eased = 1 - Math.pow(1 - progress, 4);
      window.scrollTo({ top: from + distance * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(step);
      else { guiding = false; anchorUntil = Date.now() + 150; }
    }
    frame = requestAnimationFrame(step);
  }
  function schedule() {
    clearTimeout(idle);
    if (!guiding && !blocked()) idle = setTimeout(settle, 240);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('wheel', cancel, { passive: true });
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
