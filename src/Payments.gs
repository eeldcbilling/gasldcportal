/**
 * Payments.gs - payments reported by consumers.
 * Storage (JSON on Drive only, PORTAL_SPEC.md section 6):
 *   submissions/<yyyy-mm>/P-<id>.json   one file per payment, never changed after it is written
 *   submissions/<yyyy-mm>/index.json    list of that month's payments (rebuildable from the P- files)
 * <yyyy-mm> = month the payment was submitted (India time).
 */

/** All payments (full detail, server side only), oldest first. */
function allPayments_() {
  var rows = cacheGet_('pay');
  if (rows) return rows;
  rows = [];
  var sub = folderAt_(['submissions'], false);
  if (sub) {
    var it = sub.getFolders();
    while (it.hasNext()) {
      var f = it.next();
      if (!/^\d{4}-\d{2}$/.test(f.getName())) continue;
      var idx = fileIn_(f, 'index.json');
      if (idx) rows = rows.concat(readJsonFile_(idx).rows || []);
    }
  }
  rows.sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; });
  cachePut_('pay', rows);
  return rows;
}

/** UTR compared without spaces and case, so "sbin 123" = "SBIN123". */
function utrKey_(u) { return String(u).replace(/\s+/g, '').toUpperCase(); }

/** What the public may see (owner, 02-Nov-2026): no remarks, UTR last 4 characters only. */
function maskPayment_(p) {
  var u = String(p.utr);
  return {
    id: p.id, ts: p.ts, consumer: p.consumer, name: p.name, month: p.month, label: p.label,
    billNo: p.billNo, date: p.date, amount: p.amount,
    utr: (u.length > 4 ? '••••' : '') + u.slice(-4)
  };
}

function viewPayments_(rows) {
  return isAdmin_() ? rows : rows.map(maskPayment_);
}

/** Sum of reported payments per bill: key "<month>|<billNo>". */
function paidByBill_() {
  var sum = {};
  allPayments_().forEach(function (p) {
    var k = p.month + '|' + p.billNo;
    sum[k] = (sum[k] || 0) + Number(p.amount);
  });
  return sum;
}

/** Paid / part / unpaid from reported payments (owner, 02-Nov-2026: portal payments sum). */
function statusOf_(total, paid) {
  if (paid <= 0) return 'unpaid';
  return paid + 0.005 >= total ? 'paid' : 'part';
}

/**
 * Saves one or more payments (each against one bill). All rows are checked first;
 * if any row is wrong nothing is saved and the problems are returned per row.
 * entries: [{ consumer, month, billNo, date: 'yyyy-mm-dd', utr, amount, remarks }]
 */
function submitPayments(entries) {
  if (!Array.isArray(entries) || !entries.length) throw new Error('Nothing to submit.');
  if (entries.length > 60) throw new Error('Please submit at most 60 bills at a time.');

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('The portal is busy - please try again in a minute.');
  try {
    cacheDrop_('pay'); // read fresh from Drive while locked
    var existing = allPayments_();
    var taken = {};
    existing.forEach(function (p) { taken[utrKey_(p.utr) + '|' + p.month + '|' + p.billNo] = p.id; });

    var d = base_();
    var names = {};
    d.consumers.forEach(function (c) { names[c.id] = c.name; });
    var today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    var errors = [], clean = [];

    entries.forEach(function (e, i) {
      var bad = [];
      if (!names[e.consumer]) bad.push('unknown consumer');
      var bill = null;
      if (!bad.length) {
        consumerBills_(e.consumer).forEach(function (b) { if (b.month === e.month && b.billNo === String(e.billNo)) bill = b; });
        if (!bill) bad.push('bill not found for this consumer');
      }
      var date = String(e.date || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date + 'T00:00:00').getTime())) bad.push('payment date missing');
      else if (date > today) bad.push('payment date is in the future');
      var utr = String(e.utr || '').trim();
      if (utr.length < 6) bad.push('UTR must have at least 6 characters');
      if (utr.length > 100) bad.push('UTR is too long');
      var amount = Number(e.amount);
      if (!(amount > 0) || amount > 1e10 || Math.abs(Math.round(amount * 100) - amount * 100) > 1e-6) bad.push('amount must be a positive number (max 2 decimals)');
      var remarks = String(e.remarks || '').trim();
      if (remarks.length > 500) bad.push('remarks are too long (max 500)');
      var k = utrKey_(utr) + '|' + e.month + '|' + e.billNo;
      if (!bad.length && taken[k]) bad.push('this UTR is already logged for this bill');
      if (bad.length) { errors.push({ row: i, billNo: e.billNo, problems: bad }); return; }
      taken[k] = 'new';
      clean.push({
        consumer: e.consumer, name: names[e.consumer], month: bill.month, label: bill.label,
        billNo: bill.billNo, date: date, utr: utr, amount: amount, remarks: remarks
      });
    });
    if (errors.length) return { ok: false, errors: errors };

    // write: one new file per payment (never overwritten), then the month index
    var now = new Date();
    var ym = Utilities.formatDate(now, TZ, 'yyyy-MM');
    var folder = folderAt_(['submissions', ym], true);
    var idxFile = fileIn_(folder, 'index.json');
    var index = idxFile ? readJsonFile_(idxFile) : { month: ym, rows: [] };
    var stamp = Utilities.formatDate(now, TZ, "yyyyMMdd'-'HHmmss");
    var ts = Utilities.formatDate(now, TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
    var saved = clean.map(function (p, i) {
      p.id = 'P-' + stamp + '-' + Utilities.getUuid().slice(0, 4).toUpperCase() + (i + 1);
      p.ts = ts;
      if (fileIn_(folder, p.id + '.json')) throw new Error('Internal: payment id clash, nothing saved. Please submit again.');
      return p;
    });
    saved.forEach(function (p) {
      folder.createFile(p.id + '.json', JSON.stringify(p, null, 1), 'application/json');
    });
    index.rows = index.rows.concat(saved);
    var text = JSON.stringify(index);
    if (idxFile) idxFile.setContent(text); else folder.createFile('index.json', text, 'application/json');

    cacheDrop_('pay');
    return { ok: true, saved: viewPayments_(saved) };
  } finally {
    lock.releaseLock();
  }
}

/** Rebuilds every month index from the P- files (admin repair tool; used if an index write failed). */
function rebuildIndexes_() {
  var sub = folderAt_(['submissions'], false), count = 0;
  if (!sub) return 0;
  var it = sub.getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (!/^\d{4}-\d{2}$/.test(f.getName())) continue;
    var rows = [], files = f.getFiles(), idxFile = null;
    while (files.hasNext()) {
      var x = files.next();
      if (x.getName() === 'index.json') { idxFile = x; continue; }
      if (/^P-.*\.json$/.test(x.getName())) rows.push(readJsonFile_(x));
    }
    rows.sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; });
    var text = JSON.stringify({ month: f.getName(), rows: rows });
    if (idxFile) idxFile.setContent(text); else f.createFile('index.json', text, 'application/json');
    count += rows.length;
  }
  cacheDrop_('pay');
  return count;
}
