
/**
 * Google Apps Script for Memo CRUD Operations
 * 
 * Instructions:
 * 1. Open your Spreadsheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code and paste this.
 * 4. Click 'Deploy' > 'New Deployment'.
 * 5. Select 'Web App'.
 * 6. Execute as: 'Me'.
 * 7. Who has access: 'Anyone' (or yourself, but 'Anyone' is easiest for development).
 * 8. Copy the Web App URL and paste it into your .env.local as APPS_SCRIPT_URL.
 */

const SHEET_NAME = 'Sheet1';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const json = rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action; // 'create', 'update', 'delete'
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  if (action === 'create') {
    const newRow = headers.map(h => params[h] || '');
    sheet.appendRow(newRow);
    return response('success', 'Created');
  }
  
  if (action === 'update') {
    const id = params.timestamp;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        const newRow = headers.map(h => params[h] || '');
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
        return response('success', 'Updated');
      }
    }
    return response('error', 'Not found');
  }
  
  if (action === 'delete') {
    const id = params.timestamp;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.deleteRow(i + 1);
        return response('success', 'Deleted');
      }
    }
    return response('error', 'Not found');
  }
}

function response(status, message) {
  return ContentService.createTextOutput(JSON.stringify({ status, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
