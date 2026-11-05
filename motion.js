(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !Element.prototype.animate) return;
  document.documentElement.classList.add('motion-preparing');
  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.documentElement;
    const logo = document.querySelector('.logo-frame');
    const text = [...document.querySelectorAll('.announcement, .brand > span, header nav, .hero-copy > *, .art-note')];
    try {
      await Promise.race([
        Promise.allSettled([logo.querySelector('img').decode(), document.fonts.ready]),
        new Promise(resolve => setTimeout(resolve, 1800))
      ]);
      if (reduced.matches) return;
      const entrance = logo.animate([
        { transform: 'perspective(1000px) rotateY(-30deg) rotateX(35deg) translate(160px, -130px) skew(-20deg, 8deg)', opacity: 0 },
        { transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translate(0, 0) skew(0deg, 0deg) rotate(-5deg)', opacity: 1 }
      ], { duration: 850, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'both' });
      await entrance.finished;
      text.forEach((element, index) => {
        const note = element.classList.contains('art-note');
        element.animate([
          { opacity: 0, transform: `translateX(${note ? 24 : -28}px)${note ? ' rotate(-6deg)' : ''}` },
          { opacity: 1, transform: note ? 'translateX(0) rotate(-6deg)' : 'translateX(0)' }
        ], { duration: 800, delay: index * 65, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          if (!reduced.matches) entry.target.animate([
            { opacity: 0, transform: 'translateX(-20px)' },
            { opacity: 1, transform: 'translateX(0)' }
          ], { duration: 850, easing: 'cubic-bezier(.22,1,.36,1)' });
        });
      }, { threshold: .12 });
      document.querySelectorAll('.section-top > *, .collection-preview, .tile-caption, .collection-end, .story-copy > *, .contact > p, .contact > h2, .contact > a, footer > *').forEach(element => observer.observe(element));
    } finally {
      root.classList.remove('motion-preparing');
    }
  });
})();
