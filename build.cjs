const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const out = path.join(root, 'dist');
// Copy only public assets; never include the local server or project files.
const files = ['index.html', 'styles.css', 'products.css', 'products.js', 'catalog-live.js', 'motion.js', 'scroll-panels.js', 'a_close_up_well_composed_craft_embroidery_style_l.png', '_headers'];
fs.mkdirSync(out, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(out, file));
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const asset = match[1];
  if (/^(https?:|mailto:|tel:)/.test(asset)) continue;
  if (!fs.existsSync(path.join(out, asset))) throw new Error(`Falta el archivo: ${asset}`);
}
console.log(`Web lista en ${out} (${files.length} archivos). Recursos verificados.`);
