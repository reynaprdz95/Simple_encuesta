# Simple_encuesta

Página estática, responsive y mobile-first para encuestas de SIMPLE by Junghanns.

## Cómo abrir la página

Abre `index.html` directamente en el navegador para la encuesta de contratación e instalación. También se conserva `encuesta-instalacion.html` por si quieres usar esa ruta específica.

Para la encuesta de satisfacción de servicio, abre `satisfaccion-servicio.html`. Se usa nombre de archivo sin acento para que el enlace sea más estable en WhatsApp, GitHub Pages y navegadores móviles.

Los assets de marca están en `assets/simple/`:

- `simple-logo.png`
- `simple-leaf-watermark.png`

## Cómo probar con parámetros de URL

La página lee automáticamente estos parámetros:

- `codigo`
- `nombre`
- `asesor`
- `tecnico`
- `zona`
- `fecha_instalacion`

Ejemplo local para contratación e instalación:

```text
index.html?codigo=SIMPLE123&nombre=Ana&asesor=Reyna&tecnico=Juan&zona=Interlomas
```

Ejemplo local para satisfacción de servicio:

```text
satisfaccion-servicio.html?codigo=SIMPLE123&nombre=Ana&zona=Interlomas
```

Si `codigo` viene en la URL, se muestra precargado. Si no viene, el formulario solicita el nombre del cliente antes de iniciar.

## Dónde configurar el webhook

En `config.js`, reemplaza el placeholder:

```js
window.SURVEY_WEBHOOK_URL = "PEGAR_AQUI_WEBHOOK_DE_GOOGLE_APPS_SCRIPT";
```

El POST envía un JSON serializado con `Content-Type: text/plain;charset=utf-8` y `mode: "no-cors"`, útil para Google Apps Script y webhooks sencillos. El payload incluye `requiere_seguimiento`.

## Cómo recibir respuestas en Google Sheets

1. Crea una hoja nueva en Google Sheets.
2. Entra a `Extensiones > Apps Script`.
3. Borra el código inicial y pega el contenido de `google-apps-script.gs`.
4. Guarda el proyecto.
5. Selecciona `Implementar > Nueva implementación`.
6. Tipo: `Aplicación web`.
7. Ejecutar como: `Yo`.
8. Quién tiene acceso: `Cualquier persona`.
9. Copia la URL de la aplicación web.
10. Pega esa URL en `config.js`.

Cuando la encuesta de contratación e instalación se envíe, Apps Script creará una pestaña llamada `Respuestas` y agregará las columnas necesarias.

Cuando la encuesta de satisfacción de servicio se envíe, Apps Script usará el campo `tipo_encuesta: "satisfaccion_servicio"` y creará o actualizará una pestaña llamada `Satisfaccion Servicio`.

Si Google Drive no permite crear o editar hojas por falta de almacenamiento, el script puede enviar las respuestas por email a `reynaprdz95@gmail.com` como respaldo.

## Cómo publicar en GitHub Pages

1. Crea un repositorio público en GitHub llamado `Simple_encuesta`.
2. Sube todos los archivos de esta carpeta.
3. En GitHub, entra a `Settings > Pages`.
4. En `Build and deployment`, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guarda la configuración.

La URL final quedará similar a:

```text
https://TU_USUARIO.github.io/Simple_encuesta/
```

## Ejemplo de URL para WhatsApp

Contratación e instalación:

```text
https://TU_USUARIO.github.io/Simple_encuesta/?codigo=SIMPLE123&nombre=Ana&asesor=Reyna&tecnico=Juan&zona=Interlomas
```

Satisfacción de servicio:

```text
https://TU_USUARIO.github.io/Simple_encuesta/satisfaccion-servicio.html?codigo=SIMPLE123&nombre=Ana&zona=Interlomas
```
