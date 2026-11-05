(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const panels = [...document.querySelectorAll('[data-scroll-panel]')];
  let frame;
  function refresh() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const height = document.documentElement.clientHeight;
      panels.forEach(panel => {
        // Long panels scroll normally until their bottom reaches the viewport.
        // Only then do they hold while the next section slides over them.
        panel.style.setProperty('--panel-top', `${Math.min(0, height - panel.offsetHeight)}px`);
      });
      document.documentElement.classList.toggle('stacked-scroll', !reduced.matches);
    });
  }
  const observer = new ResizeObserver(refresh);
  panels.forEach(panel => observer.observe(panel));
  window.addEventListener('resize', refresh, { passive: true });
  reduced.addEventListener('change', refresh);
  document.fonts.ready.then(refresh);
  refresh();
})();
