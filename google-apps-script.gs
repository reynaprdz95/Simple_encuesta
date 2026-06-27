const SHEET_NAME = "Respuestas";

const HEADERS = [
  "fecha_respuesta",
  "codigo",
  "nombre",
  "asesor",
  "tecnico",
  "zona",
  "fecha_instalacion",
  "facilidad_contratacion",
  "claridad_informacion",
  "atencion_contratacion",
  "agendamiento_instalacion",
  "calificacion_instalacion",
  "comentario_mejora",
  "requiere_seguimiento",
  "user_agent",
  "url_origen",
];

function doGet() {
  return ContentService.createTextOutput("SIMPLE encuesta webhook activo").setMimeType(
    ContentService.MimeType.TEXT
  );
}

function doPost(event) {
  const sheet = getSheet();
  const payload = parsePayload(event);
  const row = HEADERS.map((header) => payload[header] ?? "");

  sheet.appendRow(row);

  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      requiere_seguimiento: Boolean(payload.requiere_seguimiento),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRowValues = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = firstRowValues.some((value) => value);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(event.postData.contents);
  } catch (error) {
    return {
      fecha_respuesta: new Date().toISOString(),
      comentario_mejora: `No se pudo leer el payload: ${event.postData.contents}`,
      requiere_seguimiento: true,
    };
  }
}
