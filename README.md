# El Rincón de Roma

Catálogo con fotos agrupadas por familia y precios/disponibilidad editables desde Google Sheets.

## Editar productos sin deploy

Planilla: https://docs.google.com/spreadsheets/d/1IZuo1xfbxESJ5Zc_Gal3VxasJ7apZxB51bvKCOL7lfw/edit

La pestaña Productos tiene 29 filas vinculadas por ID a las fotos. No cambiar los identificadores ni los encabezados; se pueden ordenar las filas completas.

- Nombre: nombre visible. Separar el subtítulo con ` · ` para conservar la segunda línea en cursiva.
- Tipo: referencia para administrar la planilla. Cambiar este campo no mueve la foto a otra familia; el diseño conserva los grupos existentes.
- Precio: importe numérico en pesos argentinos (12500 o 12500,50). Vacío o inválido muestra Consultar precio. Un cero explícito se muestra como $0.
- Descripcion: texto que aparece al abrir la foto.
- Disponibilidad: Disponible, A pedido, Sin stock o Consultar. Los productos sin stock siguen visibles. Vacío o desconocido muestra Consultar disponibilidad.

Solo la pestaña Productos está publicada como CSV. Su contenido es público; editar requiere acceso a la cuenta de Google. Mantener habilitada la republicación automática de cambios. La pestaña Como editar contiene instrucciones.

La web consulta /api/catalogo al cargar, cada 2 minutos mientras está visible y al volver a la pestaña tras un minuto. Google puede demorar unos minutos en reflejar los cambios. Si la hoja no está disponible, conserva fotos y descripciones originales y vuelve a Consultar precio/disponibilidad; no guarda precios viejos en el navegador.

Agregar una fila sola no agrega una foto: nuevas imágenes, productos y cambios de diseño requieren actualizar el código. Modificar precio, disponibilidad, nombre o descripción de productos existentes no requiere deploy.

## Cloudflare Workers

Producción conectada al repositorio, rama main. Build: `npm run build`. Deploy: `npx wrangler deploy`. Worker: nameless-mountain-48e1.

worker.mjs sirve /api/catalogo y delega los archivos públicos de dist al binding ASSETS. catalog-source.mjs lee el CSV público, valida filas e importes. No usa claves ni credenciales de Google. El enlace publicado se configura en ese archivo.

Esta versión necesita el Worker. Subir solo dist o el antiguo ZIP estático no instala /api/catalogo. El deploy desde Git incluye tanto el Worker como los archivos públicos. No editar dist directamente.

Referencia: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/

## Vista local y verificación

`npm run dev` → http://localhost:3000

`npm test` valida CSV, importes, estados, IDs repetidos, errores de Google y archivos estáticos.

`npm run build` y `npx wrangler deploy --dry-run` verifican la compilación y el paquete del Worker.

El servidor local reproduce el endpoint de Google Sheets. Reiniciarlo después de modificar server.cjs.

La planilla parte con precios vacíos y disponibilidad Consultar. Completar con los datos reales.
