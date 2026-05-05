/**
 * OTR EXT — Quote webhook (standalone Apps Script)
 *
 * SETUP
 *   1. Open the script:
 *      https://script.google.com/d/1ETSQBwqLoeOtWIC9LzTQh6s5YmlJR2KgToxC_YbmkdPNuM9TAwZbVkze/edit
 *   2. Replace the default Code.gs with this whole file.
 *   3. Save (Ctrl/Cmd + S).
 *   4. Deploy → New deployment → Type: Web app
 *        Description: OTR EXT quote webhook
 *        Execute as: Me (onthewvroaddetail@gmail.com)
 *        Who has access: Anyone
 *      Click Deploy. Authorize when prompted.
 *   5. Copy the Web app URL.
 *   6. Paste it into .env.local as GOOGLE_QUOTE_WEBHOOK_URL.
 */

const SHEET_ID = '1pz1m0Qi15zBMC9DzPzySdEn_HFWynRrAXabEkVyQUMs';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      d.timestamp || new Date().toISOString(),
      d.name || '',
      d.email || '',
      d.phone || '',
      d.address || '',
      d.city || '',
      d.serviceArea || '',
      d.services || '',
      d.sqftBySlug || '',
      d.customerEstimate || '',
      d.notes || '',
      d.status || 'new'
    ]);
    return jsonOut({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, hint: 'OTR quote webhook is live.' });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
