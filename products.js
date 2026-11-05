const productDialog = document.querySelector('#product-dialog');
let lastProduct;
const productTiles = [...document.querySelectorAll('.product-tile')];
let currentProduct = 0;
function showProduct(index) {
  currentProduct = (index + productTiles.length) % productTiles.length;
  const tile = productTiles[currentProduct];
  const photo = tile.querySelector('img');
  const enlarged = document.querySelector('#dialog-image');
  enlarged.src = photo.getAttribute('src');
  enlarged.alt = photo.alt;
  enlarged.width = photo.width;
  enlarged.height = photo.height;
  document.querySelector('#dialog-title').textContent = tile.querySelector('.tile-title').innerText;
  document.querySelector('#dialog-description').textContent = tile.querySelector('.product-description').textContent;
  document.querySelector('#dialog-counter').textContent = `${currentProduct + 1} / ${productTiles.length}`;
}
productTiles.forEach((tile, index) => {
  tile.addEventListener('click', () => {
    lastProduct = tile;
    showProduct(index);
    productDialog.showModal();
    document.documentElement.classList.add('product-open');
  });
});
productDialog.querySelector('.dialog-prev').addEventListener('click', () => showProduct(currentProduct - 1));
productDialog.querySelector('.dialog-next').addEventListener('click', () => showProduct(currentProduct + 1));
productDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showProduct(currentProduct + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
productDialog.querySelector('.dialog-close').addEventListener('click', () => productDialog.close());
productDialog.addEventListener('click', event => {
  if (event.target !== productDialog) return;
  const box = productDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) productDialog.close();
});
productDialog.addEventListener('close', () => {
  document.documentElement.classList.remove('product-open');
  lastProduct?.focus({ preventScroll: true });
});
productDialog.querySelector('.dialog-contact').addEventListener('click', () => productDialog.close());
