// Public product information only. Never add credentials to this configuration.
export const sourceUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTW53vBOITe0R5_lnZKG-TNBR_mg8Fp_uRbe6wF5zOafZRLJVuirtIBJWrxhwkK4jR7bBC8L48W1u_q/pub?gid=582191192&single=true&output=csv';

export function parseCSV(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || !cell) quoted = !quoted;
      else throw Error('CSV inválido');
    } else if (!quoted && (ch === ',' || ch === '\n' || ch === '\r')) {
      row.push(cell); cell = '';
      if (ch !== ',') {
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
        if (ch === '\r' && text[i + 1] === '\n') i++;
      }
    } else cell += ch;
  }
  if (quoted) throw Error('CSV incompleto');
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}
const clean = value => String(value || '').trim();
const normalize = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function parsePrice(value) {
  let number = clean(value).replace(/(?:ARS|\$|\s)/gi, '');
  if (!number) return null;
  // Sheets exports the displayed currency using the sheet's Argentine locale.
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(number)) number = number.replace(/\./g, '').replace(',', '.');
  else if (/^\d+(?:,\d{1,2})?$/.test(number)) number = number.replace(',', '.');
  else if (!/^\d+\.\d{1,2}$/.test(number)) return null;
  const result = Number(number);
  return Number.isFinite(result) && result >= 0 && result <= 1e9 ? result : null;
}
export function parseCatalog(text) {
  const [headers, ...rows] = parseCSV(text);
  if (!headers) throw Error('Catálogo vacío');
  const keys = headers.map(normalize);
  for (const key of ['id', 'nombre', 'tipo', 'precio', 'descripcion', 'disponibilidad']) {
    if (!keys.includes(key)) throw Error(`Falta la columna ${key}`);
  }
  const seen = new Set();
  return rows.map(row => {
    const value = key => clean(row[keys.indexOf(key)]);
    const id = value('id');
    if (!id) return null;
    if (!/^[a-z0-9-]+$/.test(id) || seen.has(id)) throw Error('ID inválido o repetido');
    seen.add(id);
    const availability = ({disponible:'available', 'a pedido':'made-to-order', 'sin stock':'unavailable', consultar:'unknown'})[normalize(value('disponibilidad'))] || 'unknown';
    return { id, name:value('nombre').slice(0,180), type:value('tipo').slice(0,100), price:parsePrice(value('precio')), description:value('descripcion').slice(0,2000), availability };
  }).filter(Boolean);
}
export async function catalogResponse(fetcher = fetch) {
  const response = await fetcher(sourceUrl, {signal:AbortSignal.timeout(10000), headers:{Accept:'text/csv'}});
  if (!response.ok) throw Error('No se pudo consultar Google Sheets');
  const text = await response.text();
  if (text.length > 500000) throw Error('Catálogo demasiado grande');
  const products = parseCatalog(text);
  if (!products.length) throw Error('Catálogo sin productos');
  return Response.json({products, updatedAt:new Date().toISOString()}, {headers:{'Cache-Control':'no-store'}});
}
