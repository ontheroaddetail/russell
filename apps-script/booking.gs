/**
 * OTR EXT — Booking webhook (standalone Apps Script)
 *
 * SETUP
 *   1. Open the script:
 *      https://script.google.com/d/1jWUO13kevsqXBkNEOwmYyRBx_Aj2jjSD3zze645_n-Qr6ZEoTsx19KPx/edit
 *   2. Replace the default Code.gs with this whole file.
 *   3. Save (Ctrl/Cmd + S).
 *   4. Deploy → New deployment → Type: Web app
 *        Description: OTR EXT booking webhook
 *        Execute as: Me (onthewvroaddetail@gmail.com)
 *        Who has access: Anyone
 *      Click Deploy. Authorize when prompted (review + allow the access scopes).
 *   5. Copy the Web app URL.
 *   6. Paste it into .env.local as GOOGLE_BOOKING_WEBHOOK_URL.
 */

const SHEET_ID = '1MFIR5i2uqiFqKfRzCVCbY55witUzRuumdEVmFazFlKg';
// Use 'primary' for your main calendar, or paste a calendar ID for a dedicated calendar.
const CALENDAR_ID = 'primary';
const TIMEZONE = 'America/New_York';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendBookingRow(data);
    createBookingEvent(data);
    return jsonOut({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, hint: 'OTR booking webhook is live.' });
}

function appendBookingRow(d) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sheet.appendRow([
    d.timestamp || new Date().toISOString(),
    d.name || '',
    d.email || '',
    d.phone || '',
    d.services || '',
    d.address || '',
    d.city || '',
    d.serviceArea || '',
    d.date || '',
    d.timeWindow || '',
    d.notes || '',
    d.contactMethod || ''
  ]);
}

function createBookingEvent(d) {
  if (!d.date || typeof d.startHour !== 'number' || typeof d.endHour !== 'number') return;
  const cal = CalendarApp.getCalendarById(CALENDAR_ID === 'primary' ? Session.getActiveUser().getEmail() : CALENDAR_ID);
  if (!cal) throw new Error('Could not find calendar ' + CALENDAR_ID);
  const [y, m, day] = d.date.split('-').map(Number);
  const start = new Date(y, m - 1, day, d.startHour, 0, 0);
  const end = new Date(y, m - 1, day, d.endHour, 0, 0);
  const description = [
    'Customer: ' + (d.name || ''),
    'Phone: ' + (d.phone || ''),
    'Email: ' + (d.email || ''),
    'Preferred contact: ' + (d.contactMethod || ''),
    '',
    'Property type: ' + (d.propertyType || ''),
    'Services: ' + (d.services || ''),
    '',
    'Address: ' + (d.address || ''),
    'City: ' + (d.city || ''),
    'Service area: ' + (d.serviceArea || ''),
    '',
    'Notes: ' + (d.notes || '(none)')
  ].join('\n');
  cal.createEvent(
    (d.services || 'OTR booking') + ' — ' + (d.name || ''),
    start,
    end,
    { description: description, location: (d.address || '') + ', ' + (d.city || '') }
  );
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
