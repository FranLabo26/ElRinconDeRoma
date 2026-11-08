import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,parsePrice,parseCatalog,catalogResponse} from './catalog-source.mjs';
import worker from './worker.mjs';
const header = 'ID,Nombre,Tipo,Precio,Descripcion,Disponibilidad\n';
test('CSV con comas, comillas, saltos de línea y BOM', () => {
  assert.deepEqual(parseCSV('\uFEFFID,Descripcion\r\nx,"Tela, con ""flores""\ny encaje"'),[['ID','Descripcion'],['x','Tela, con "flores"\ny encaje']]);
  assert.throws(()=>parseCSV('ID\nx,"sin cerrar'));
});
test('Importes argentinos, cero y valores ausentes o incorrectos', () => {
  for(const [raw,value] of [['12500',12500],['$ 12.500,50',12500.5],['12500,5',12500.5],['12500.50',12500.5],['0',0],['',null],['-1',null],['Consultar',null],['1e6',null]]) assert.equal(parsePrice(raw),value,raw);
});
test('La relación es por ID, sin depender del orden de filas ni columnas', () => {
  const data=parseCatalog('Disponibilidad,Descripcion,Precio,Tipo,Nombre,ID\nSin stock,Suave,0,Hogar,Cesto,cesto\nDisponible,Tela,12000,Hogar,Bolso,bolso');
  assert.equal(data[0].id,'cesto'); assert.equal(data[0].price,0);assert.equal(data[0].availability,'unavailable');assert.equal(data[1].availability,'available');
  assert.equal(parseCatalog(header+'x,Nombre,Hogar,,Desc,Desconocido')[0].availability,'unknown');
  assert.equal(parseCatalog(header+'x,Nombre,Hogar,,Desc,A pedido')[0].availability,'made-to-order');
  assert.throws(()=>parseCatalog(header+'x,N,T,1,D,Consultar\nx,N,T,2,D,Disponible'));
  assert.throws(()=>parseCatalog('<html>Login Google</html>'));
});
test('El endpoint devuelve JSON fresco y falla ante una hoja privada o inválida', async()=>{
  const response=await catalogResponse(async()=>new Response(header+'x,N,T,2500,D,Disponible'));
  assert.equal((await response.json()).products[0].price,2500);assert.equal(response.headers.get('Cache-Control'),'no-store');
  await assert.rejects(catalogResponse(async()=>new Response('Login',{status:403})));
});
test('El Worker conserva los archivos estáticos y solo admite lectura del catálogo', async()=>{
  const response=await worker.fetch(new Request('https://roma.test/styles.css'),{ASSETS:{fetch:()=>new Response('css')}});
  assert.equal(await response.text(),'css');
  assert.equal((await worker.fetch(new Request('https://roma.test/api/catalogo',{method:'POST'}),{})).status,405);
});
