/**
 * BACKEND GENÉRICO (Chave/Valor) - Controle de Veículos
 * Cole este código inteiro no Google Apps Script (script.google.com),
 * substituindo qualquer versão anterior do Code.gs.
 *
 * Funciona como um "banco de dados" simples: guarda pares chave->valor
 * (o mesmo formato usado pelo armazenamento do Claude), então o app
 * web (index.html) usa exatamente a mesma lógica nas duas versões.
 */

function doGet(e) {
  var key = e.parameter.key;
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  var value = row ? sheet.getRange(row, 2).getValue() : null;
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', value: value }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  if (!payload.key) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Faltando "key"' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = getSheet_();
  var row = findRow_(sheet, payload.key);
  if (row) {
    sheet.getRange(row, 2).setValue(payload.value);
    sheet.getRange(row, 3).setValue(new Date());
  } else {
    sheet.appendRow([payload.key, payload.value, new Date()]);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function findRow_(sheet, key) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return i + 1;
  }
  return null;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('KV');
  if (!sheet) {
    sheet = ss.insertSheet('KV');
    sheet.appendRow(['Chave', 'Valor (JSON)', 'Atualizado em']);
  }
  return sheet;
}
