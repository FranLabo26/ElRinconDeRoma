# El Rincón de Roma

Web estática, preparada para Cloudflare Pages. No necesita servidor Node en el hosting, base de datos ni instalar dependencias.

## Subir directamente a Cloudflare Pages

1. Entrar al panel de Cloudflare → Workers & Pages → Create application → Pages → Use direct upload.
2. Elegir un nombre para el proyecto, por ejemplo `el-rincon-de-roma`.
3. Subir `el-rincon-de-roma-cloudflare.zip` o arrastrar la carpeta `dist`.
4. Publicar. Cloudflare mostrará la dirección de la web.

El ZIP tiene `index.html` en la raíz. Subir solamente el ZIP o `dist`, no la carpeta completa del proyecto.

Guía oficial: https://developers.cloudflare.com/pages/get-started/direct-upload/

## Si se conecta un repositorio Git a Pages

- Framework: None.
- Comando de compilación: `npm run build`.
- Directorio de salida: `dist`.
- Directorio raíz: el del proyecto.

## Actualizar la web

Editar los archivos originales de esta carpeta y ejecutar:

```powershell
npm run build
Compress-Archive -Path .\dist\* -DestinationPath .\el-rincon-de-roma-cloudflare.zip -Force
```

Luego crear una nueva implementación en el mismo proyecto de Cloudflare y subir el ZIP actualizado. No editar `dist` directamente: se genera desde los originales. Las fotos de `assets` se incluyen automáticamente en la compilación.

## Ver localmente

```powershell
npm run dev
```

Abrir http://localhost:3000. Si el servidor ya está funcionando, no hace falta iniciarlo otra vez.

## Estado del contenido

El catálogo incluye tres creaciones navideñas con fotos. Los nombres son de presentación y se pueden ajustar. Faltan precios y el medio de contacto para tomar pedidos. La página puede publicarse tal como está; no tiene pagos ni pedidos habilitados. Las tipografías se cargan desde Google Fonts, con alternativas locales si no están disponibles.


## Publicación automática desde GitHub (Worker existente)

La configuración `wrangler.jsonc` apunta a `nameless-mountain-48e1`, el Worker que aparecía vinculado al dominio de Roma. Confirmar que ese siga siendo el nombre del proyecto en Cloudflare antes de conectar.

En ese mismo Worker, abrir Settings → Builds → Connect y seleccionar el repositorio de esta web:

- Rama de producción: `main`.
- Directorio raíz: `/`.
- Comando de build: `npm run build`.
- Comando de deploy: `npx wrangler deploy`.
- Activar los despliegues automáticos de la rama de producción.

Cloudflare compila `dist` desde los archivos originales. No se suben `dist`, ZIPs ni credenciales a Git. El servidor `server.cjs` se usa solamente para la vista local.

Después de conectar, ejecutar el primer build y comprobar que la versión publicada muestre los diez productos y las flechas del carrusel. Los siguientes pushes a `main` dispararán el deploy automáticamente.

Documentación: https://developers.cloudflare.com/workers/ci-cd/builds/
