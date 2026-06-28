const SPREADSHEET_ID = "";
const NOTIFICATION_EMAIL = "reynaprdz95@gmail.com";

const INSTALLATION_HEADERS = [
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

const SERVICE_HEADERS = [
  "fecha_respuesta",
  "tipo_encuesta",
  "codigo",
  "nombre",
  "asesor",
  "tecnico",
  "zona",
  "fecha_instalacion",
  "satisfaccion_general",
  "calidad_agua",
  "eventualidad_equipo_servicio",
  "tiempo_respuesta_soporte",
  "probabilidad_recomendacion",
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
  const payload = parsePayload(event);
  const surveyConfig = getSurveyConfig(payload);
  let savedToSheet = false;
  let sheetError = "";

  if (SPREADSHEET_ID) {
    try {
      const sheet = getSheet(surveyConfig);
      const row = surveyConfig.headers.map((header) => payload[header] ?? "");

      sheet.appendRow(row);
      savedToSheet = true;
    } catch (error) {
      sheetError = error.message;
    }
  }

  if (!savedToSheet) {
    sendResponseEmail(payload, surveyConfig, sheetError);
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      survey: surveyConfig.key,
      sheet_name: surveyConfig.sheetName,
      saved_to_sheet: savedToSheet,
      sent_email: !savedToSheet,
      requiere_seguimiento: Boolean(payload.requiere_seguimiento),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getSurveyConfig(payload) {
  if (payload.tipo_encuesta === "satisfaccion_servicio") {
    return {
      key: "satisfaccion_servicio",
      label: "Satisfacción de servicio",
      sheetName: "Satisfaccion Servicio",
      headers: SERVICE_HEADERS,
    };
  }

  return {
    key: "contratacion_instalacion",
    label: "Contratación e instalación",
    sheetName: "Respuestas",
    headers: INSTALLATION_HEADERS,
  };
}

function getSheet(surveyConfig) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(surveyConfig.sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(surveyConfig.sheetName);
  }

  const firstRowValues = sheet.getRange(1, 1, 1, surveyConfig.headers.length).getValues()[0];
  const hasHeaders = firstRowValues.some((value) => value);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, surveyConfig.headers.length).setValues([surveyConfig.headers]);
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
      tipo_encuesta: "error_payload",
      comentario_mejora: `No se pudo leer el payload: ${event.postData.contents}`,
      requiere_seguimiento: true,
    };
  }
}

function sendResponseEmail(payload, surveyConfig, sheetError) {
  const subjectPrefix = payload.requiere_seguimiento ? "Seguimiento requerido" : "Nueva respuesta";
  const clientReference = payload.nombre || payload.codigo || "sin cliente";
  const subject = `${subjectPrefix} - SIMPLE ${surveyConfig.label} - ${clientReference}`;
  const lines = surveyConfig.headers.map((header) => `${header}: ${payload[header] ?? ""}`);

  if (sheetError) {
    lines.push("");
    lines.push(`Nota técnica: no se pudo guardar en Sheets. ${sheetError}`);
  }

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject,
    body: lines.join("\n"),
  });
}
