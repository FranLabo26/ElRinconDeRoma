const productDialog = document.querySelector('#product-dialog');
const productTiles = [...document.querySelectorAll('.product-tile')];
const scene = productDialog.querySelector('.carousel-scene');
const center = scene.querySelector('.carousel-card');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let lastProduct, currentProduct = 0, moving = false, animations = [];
const wrap = index => (index + productTiles.length) % productTiles.length;
const cards = [-2, -1, 0, 1, 2].map(slot => {
  const card = slot === 0 ? center : center.cloneNode(true);
  card.dataset.slot = slot;
  card.style.setProperty('--slot', slot);
  if (slot !== 0) {
    card.removeAttribute('id');
    card.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    card.setAttribute('aria-hidden', 'true');
    card.inert = true;
  }
  scene.append(card);
  return card;
});
function render(index) {
  currentProduct = wrap(index);
  cards.forEach(card => {
    const slot = Number(card.dataset.slot);
    const tile = productTiles[wrap(currentProduct + slot)];
    const source = tile.querySelector('img');
    const image = card.querySelector('.dialog-photo img');
    image.src = source.getAttribute('src');
    image.alt = source.alt;
    image.width = source.getAttribute('width');
    image.height = source.getAttribute('height');
    card.querySelector('h2').textContent = tile.querySelector('.tile-title').innerText;
    card.querySelector('.dialog-copy > p:not(.eyebrow)').textContent = tile.querySelector('.product-description').textContent;
    card.querySelector('.dialog-counter').textContent = `${wrap(currentProduct + slot) + 1} / ${productTiles.length}`;
    let views = card.querySelector('.product-views');
    if (!views) {
      views = document.createElement('div');
      views.className = 'product-views';
      views.setAttribute('role', 'group');
      views.setAttribute('aria-label', 'Fotos del producto');
      card.querySelector('.dialog-copy').insertBefore(views, card.querySelector('.dialog-contact'));
    }
    views.replaceChildren();
    if (slot === 0 && tile.dataset.extraImage) {
      const photos = [
        { src: source.getAttribute('src'), alt: source.alt, label: 'Exterior' },
        { src: tile.dataset.extraImage, alt: tile.dataset.extraAlt, label: 'Interior' }
      ];
      photos.forEach((photo, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'product-view';
        button.setAttribute('aria-pressed', String(index === 0));
        button.setAttribute('aria-label', `Ver ${photo.label.toLowerCase()} del producto`);
        const thumbnail = document.createElement('img');
        thumbnail.src = photo.src;
        thumbnail.alt = '';
        button.append(thumbnail, document.createTextNode(photo.label));
        button.addEventListener('click', () => {
          if (moving || button.getAttribute('aria-pressed') === 'true') return;
          views.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
          image.src = photo.src;
          image.alt = photo.alt;
          if (!reducedMotion.matches) image.animate([
            { opacity: .3, transform: `translateX(${index === 0 ? -18 : 18}px)` },
            { opacity: 1, transform: 'translateX(0)' }
          ], { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' });
        });
        views.append(button);
      });
    }
    card.scrollTop = 0;
  });
}
async function navigate(direction) {
  if (moving || !productDialog.open) return;
  moving = true;
  const step = center.getBoundingClientRect().width + 24;
  if (!reducedMotion.matches) {
    animations = cards.map(card => {
      const slot = Number(card.dataset.slot);
      const next = slot - direction;
      return card.animate([
        { transform: `translateX(calc(-50% + ${slot * step}px)) scale(${slot === 0 ? 1 : .94})`, opacity: slot === 0 ? 1 : .6 },
        { transform: `translateX(calc(-50% + ${next * step}px)) scale(${next === 0 ? 1 : .94})`, opacity: next === 0 ? 1 : .6 }
      ], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    });
    await Promise.allSettled(animations.map(animation => animation.finished));
  }
  if (productDialog.open) render(currentProduct + direction);
  animations.forEach(animation => animation.cancel());
  animations = [];
  moving = false;
}
productTiles.forEach((tile, index) => tile.addEventListener('click', () => {
  lastProduct = tile;
  render(index);
  productDialog.showModal();
  document.documentElement.classList.add('product-open');
}));
productDialog.querySelector('.dialog-prev').addEventListener('click', () => navigate(-1));
productDialog.querySelector('.dialog-next').addEventListener('click', () => navigate(1));
productDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    navigate(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
let touch;
scene.addEventListener('touchstart', event => { touch = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }, { passive: true });
scene.addEventListener('touchend', event => {
  if (!touch) return;
  const dx = event.changedTouches[0].clientX - touch.x;
  const dy = event.changedTouches[0].clientY - touch.y;
  touch = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1);
}, { passive: true });
productDialog.querySelector('.dialog-close').addEventListener('click', () => productDialog.close());
scene.addEventListener('click', event => { if (event.target === scene) productDialog.close(); });
productDialog.addEventListener('close', () => {
  animations.forEach(animation => animation.cancel());
  document.documentElement.classList.remove('product-open');
  lastProduct?.focus({ preventScroll: true });
});
center.querySelector('.dialog-contact').addEventListener('click', () => productDialog.close());
