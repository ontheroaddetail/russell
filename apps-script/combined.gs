/**
 * OTR EXT — combined Booking + Quote webhook (backwards-compatible)
 *
 * Routes by request shape:
 *   - {type: "booking", ...EXT payload} → OTR EXT Bookings + Calendar
 *   - {type: "quote", ...EXT payload}   → OTR EXT Quotes
 *   - {firstName, vehicleType, ...}      → legacy OTR Detail flow (unchanged)
 *
 * SETUP (one-time)
 *   1. Open OTR Booking Backend in Apps Script (the script that owns the
 *      currently-deployed /macros/s/.../exec URL).
 *   2. Replace the entire Code.gs with this whole file. Save (Ctrl/Cmd + S).
 *   3. Deploy → Manage deployments → ✏️ on the existing deployment →
 *      Version: New version → Deploy. URL stays the same.
 *
 * Result: your existing OTR Detail bookings keep working AND the new OTR EXT
 * site can use the same URL.
 */

// === OTR EXT (new) sheet IDs + tab gids ===
const OTR_EXT_BOOKING_SHEET_ID = '1MFIR5i2uqiFqKfRzCVCbY55witUzRuumdEVmFazFlKg';
const OTR_EXT_BOOKING_TAB_GID = 2146938087; // the tab Russell wants bookings in
const OTR_EXT_QUOTE_SHEET_ID = '1pz1m0Qi15zBMC9DzPzySdEn_HFWynRrAXabEkVyQUMs';
const OTR_EXT_QUOTE_TAB_GID = 1250599366; // the tab Russell wants quotes in
// 'primary' = your main calendar.
const OTR_EXT_CALENDAR_ID = 'primary';

/** Find the sheet (tab) inside a spreadsheet by its gid. Falls back to the first tab. */
function getSheetByGid(spreadsheetId, gid) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === gid) return sheets[i];
  }
  return sheets[0];
}

// === Legacy OTR Detail config (kept identical to the original deployment) ===
const LEGACY_SHEET_NAME = 'Sheet1';
const LEGACY_CALENDAR_ID = '267e1b947a3c8bc565a80068fe12895a35c49976ea0db0a17d25b91747024 8cc@group.calendar.google.com'.replace(/\s/g, '');
const LEGACY_DEFAULT_DURATION_HOURS = 3;
const LEGACY_NOTIFY_EMAIL = 'OnTheWVRoadDetail@gmail.com';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    // Route 1: explicit type field on new EXT payloads.
    const type = (d.type || '').toLowerCase();
    if (type === 'booking') return handleExtBooking(d);
    if (type === 'quote') return handleExtQuote(d);

    // Route 2: legacy car-detail payload identified by its fields.
    if (d.firstName !== undefined || d.vehicleType !== undefined) {
      return handleLegacyBooking(d);
    }

    return jsonOut({ ok: false, error: 'Unknown payload shape (missing type / firstName).' });
  } catch (err) {
    console.error(err);
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({ ok: true, hint: 'OTR webhook live — accepts EXT (type=booking|quote) and legacy Detail payloads.' });
}

// ---------------- OTR EXT booking ----------------
function handleExtBooking(d) {
  const sheet = getSheetByGid(OTR_EXT_BOOKING_SHEET_ID, OTR_EXT_BOOKING_TAB_GID);
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

  if (d.date && typeof d.startHour === 'number' && typeof d.endHour === 'number') {
    const calId = OTR_EXT_CALENDAR_ID === 'primary' ? Session.getActiveUser().getEmail() : OTR_EXT_CALENDAR_ID;
    const cal = CalendarApp.getCalendarById(calId);
    if (cal) {
      const parts = String(d.date).split('-').map(Number);
      const start = new Date(parts[0], parts[1] - 1, parts[2], d.startHour, 0, 0);
      const end = new Date(parts[0], parts[1] - 1, parts[2], d.endHour, 0, 0);
      cal.createEvent(
        (d.services || 'OTR booking') + ' — ' + (d.name || ''),
        start,
        end,
        {
          description: extBookingDescription(d),
          location: (d.address || '') + ', ' + (d.city || '')
        }
      );
    }
  }

  return jsonOut({ ok: true, type: 'booking' });
}

function extBookingDescription(d) {
  return [
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
}

// ---------------- OTR EXT quote ----------------
function handleExtQuote(d) {
  const sheet = getSheetByGid(OTR_EXT_QUOTE_SHEET_ID, OTR_EXT_QUOTE_TAB_GID);
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
  return jsonOut({ ok: true, type: 'quote' });
}

// ---------------- Legacy OTR Detail booking (preserved verbatim) ----------------
function handleLegacyBooking(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(LEGACY_SHEET_NAME)
             || SpreadsheetApp.getActive().getSheets()[0];
  sheet.appendRow([
    new Date(),
    (data.firstName || '') + ' ' + (data.lastName || ''),
    data.email || '',
    data.phone || '',
    data.address || '',
    data.vehicleType || '',
    ((data.vehicleMake || '') + ' ' + (data.vehicleModel || '')).trim(),
    data.packages || '',
    data.subtotal || 0,
    data.coupon || '',
    (data.discountPct || 0) + '%',
    data.discountAmt || 0,
    data.total || 0,
    data.preferredDate || '',
    data.backupDate || '',
    data.timeOfDay || '',
    data.notes || ''
  ]);

  const calendar = CalendarApp.getCalendarById(LEGACY_CALENDAR_ID);
  if (calendar && data.preferredDate) {
    let startHour = 8;
    const t = (data.timeOfDay || '').toLowerCase();
    if (t.indexOf('afternoon') >= 0) startHour = 12;
    if (t.indexOf('evening') >= 0) startHour = 16;

    const dp = (data.preferredDate || '').split('-');
    const start = new Date(parseInt(dp[0], 10), parseInt(dp[1], 10) - 1, parseInt(dp[2], 10), startHour, 0, 0);
    const end = new Date(start.getTime() + LEGACY_DEFAULT_DURATION_HOURS * 60 * 60 * 1000);

    const title = 'OTR — ' + (data.firstName || '') + ' ' + (data.lastName || '') + ' — ' + (data.packages || '');
    const description =
      'Customer: ' + (data.firstName || '') + ' ' + (data.lastName || '') + '\n' +
      'Phone: ' + (data.phone || '') + '\n' +
      'Email: ' + (data.email || '') + '\n' +
      'Address: ' + (data.address || '') + '\n\n' +
      'Vehicle: ' + ((data.vehicleMake || '') + ' ' + (data.vehicleModel || '')).trim() +
      ' (' + (data.vehicleType || '') + ')\n' +
      'Services: ' + (data.packagesDetail || data.packages || '') + '\n' +
      'Subtotal: $' + (data.subtotal || 0) + '\n' +
      (data.coupon ? 'Coupon: ' + data.coupon + ' (-' + (data.discountPct || 0) + '%, -$' + (data.discountAmt || 0) + ')\n' : '') +
      'Total: $' + (data.total || 0) + '\n\n' +
      'Time pref: ' + (data.timeOfDay || '') + '\n' +
      (data.backupDate ? 'Backup date: ' + data.backupDate + '\n' : '') +
      'Notes: ' + (data.notes || '(none)');

    calendar.createEvent(title, start, end, {
      description: description,
      location: data.address || ''
    });
  }

  if (LEGACY_NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: LEGACY_NOTIFY_EMAIL,
      subject: 'New OTR Booking — ' + (data.firstName || '') + ' ' + (data.lastName || ''),
      body:
        'New booking submitted via the website.\n\n' +
        'Name: ' + (data.firstName || '') + ' ' + (data.lastName || '') + '\n' +
        'Phone: ' + (data.phone || '') + '\n' +
        'Email: ' + (data.email || '') + '\n' +
        'Address: ' + (data.address || '') + '\n\n' +
        'Vehicle: ' + (data.vehicleMake || '') + ' ' + (data.vehicleModel || '') +
        ' (' + (data.vehicleType || '') + ')\n' +
        'Services: ' + (data.packages || '') + '\n' +
        'Total: $' + (data.total || 0) +
        (data.coupon ? '  (Coupon: ' + data.coupon + ')' : '') + '\n\n' +
        'Date: ' + (data.preferredDate || '') +
        (data.backupDate ? '  (backup: ' + data.backupDate + ')' : '') + '\n' +
        'Time: ' + (data.timeOfDay || '') + '\n\n' +
        'Notes: ' + (data.notes || '(none)') + '\n\n' +
        '— logged in your OTR Bookings sheet'
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
