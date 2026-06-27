# Simple_encuesta

Página estática, responsive y mobile-first para medir la experiencia de contratación e instalación de SIMPLE by Junghanns.

## Cómo abrir la página

Abre `index.html` directamente en el navegador. También se conserva `encuesta-instalacion.html` por si quieres usar esa ruta específica.

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

Ejemplo local:

```text
index.html?codigo=SIMPLE123&nombre=Ana&asesor=Reyna&tecnico=Juan&zona=Interlomas
```

Si `codigo` viene en la URL, se muestra precargado. Si no viene, el formulario solicita el código antes de iniciar.

## Dónde configurar el webhook

En `encuesta-instalacion.js`, reemplaza el placeholder:

```js
const SURVEY_WEBHOOK_URL =
  window.SURVEY_WEBHOOK_URL || "PEGAR_AQUI_WEBHOOK_DE_GOOGLE_APPS_SCRIPT";
```

También puedes definir `window.SURVEY_WEBHOOK_URL` antes de cargar `encuesta-instalacion.js` si el hosting o backend lo inyecta.

El POST envía un JSON serializado con `Content-Type: text/plain;charset=utf-8` y `mode: "no-cors"`, útil para Google Apps Script y webhooks sencillos. El payload incluye `requiere_seguimiento`.

## Ejemplo de URL para WhatsApp

```text
https://TU_USUARIO.github.io/Simple_encuesta/?codigo=SIMPLE123&nombre=Ana&asesor=Reyna&tecnico=Juan&zona=Interlomas
```
