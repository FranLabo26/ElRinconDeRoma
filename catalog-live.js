(() => {
  const tiles = [...document.querySelectorAll('.product-tile')];
  const defaults = new Map(tiles.map(tile => [tile.dataset.productId, {
    title:tile.querySelector('.tile-title').innerHTML,
    description:tile.querySelector('.product-description').textContent
  }]));
  const currency = new Intl.NumberFormat('es-AR', {style:'currency',currency:'ARS',maximumFractionDigits:2});
  const labels = {available:'Disponible', 'made-to-order':'A pedido', unavailable:'Sin stock', unknown:'Consultar disponibilidad'};
  let lastAttempt = 0, loading = false;
  function metadata(tile, target) {
    let meta = target.querySelector('.product-meta');
    if (!meta) {
      meta = document.createElement('div'); meta.className = 'product-meta';
      if (target.matches('.dialog-copy')) target.querySelector('h2').insertAdjacentElement('afterend',meta);
      else target.insertBefore(meta, target.querySelector('.tile-action'));
    }
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = tile.dataset.price ? currency.format(Number(tile.dataset.price)) : 'Consultar precio';
    const status = document.createElement('span');
    status.className = 'product-availability';
    status.dataset.status = tile.dataset.availability || 'unknown';
    status.textContent = labels[status.dataset.status] || labels.unknown;
    meta.replaceChildren(price,status);
  }
  window.RomaCatalog = {metadata};
  function update(products = []) {
    const records = new Map(products.map(item => [item.id,item]));
    tiles.forEach(tile => {
      const data = records.get(tile.dataset.productId);
      const fallback = defaults.get(tile.dataset.productId);
      tile.dataset.price = data?.price == null ? '' : String(data.price);
      tile.dataset.availability = data?.availability || 'unknown';
      const title = tile.querySelector('.tile-title');
      if (data?.name) {
        const [name, ...subtitle] = data.name.split(' · ');
        title.replaceChildren(document.createTextNode(name));
        if (subtitle.length) {
          const em = document.createElement('em'); em.textContent = subtitle.join(' · ');
          title.append(document.createElement('br'), em);
        }
      }
      else title.innerHTML = fallback.title;
      tile.querySelector('.product-description').textContent = data?.description || fallback.description;
      metadata(tile, tile.querySelector('.tile-caption'));
      const name = title.innerText.replace(/\s*\n\s*/g, ' ').trim();
      const details = [...tile.querySelector('.product-meta').children].map(item => item.textContent).join('. ');
      tile.setAttribute('aria-label', `Ver ${name}. ${details}`);
    });
    document.dispatchEvent(new Event('catalog-updated'));
  }
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true; lastAttempt = Date.now();
    try {
      const response = await fetch('/api/catalogo', {cache:'no-store',signal:AbortSignal.timeout(12000)});
      if (!response.ok) throw Error('Catálogo no disponible');
      const data = await response.json();
      if (!Array.isArray(data.products)) throw Error('Formato inválido');
      update(data.products);
    } catch { update(); }
    finally { loading = false; }
  }
  update(); refresh();
  setInterval(refresh, 120000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastAttempt > 60000) refresh(); });
})();
