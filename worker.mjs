import { catalogResponse } from './catalog-source.mjs';
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/api/catalogo') {
      if (request.method !== 'GET') return new Response('Método no permitido', {status:405});
      try { return await catalogResponse(); }
      catch { return Response.json({error:'Catálogo temporalmente no disponible'}, {status:503,headers:{'Cache-Control':'no-store'}}); }
    }
    return env.ASSETS.fetch(request);
  }
};
