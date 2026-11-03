/**
 * Code.gs - entry point of the web app and the functions the browser calls (google.script.run).
 * Pages are switched in the browser (js*.html); the browser asks the server only for data.
 * Functions ending with "_" are private (the browser cannot call them).
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('UPSLDC Billing Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Pastes the contents of another HTML file (css.html, js.html) into index.html.
 * Used in index.html as: <?!= include('css'); ?>
 */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** First call of every page load: who is viewing, months, consumers, dashboard numbers. */
function getBoot() {
  var out = { admin: isAdmin_(), ready: false, months: [], consumers: [], recent: [], payCount: 0, payTotal: 0, billsReported: 0 };
  try {
    var d = base_();
    var stats = monthStats_(), paid = paidByBill_(), pays = allPayments_();
    var byMonth = {};
    stats.forEach(function (s) { byMonth[s.key] = s; });

    // reported payments per bill month
    var rep = {};
    pays.forEach(function (p) { rep[p.month] = (rep[p.month] || 0) + Number(p.amount); });

    out.ready = true;
    out.generated = d.portal.generated;
    out.months = d.portal.months.map(function (m) {
      var s = byMonth[m.key] || { count: 0, billed: 0 };
      return {
        key: m.key, label: m.label, ym: m.ym, billDate: m.billDate, dispatchDate: m.dispatchDate, dueDate: m.dueDate,
        bills: s.count, billed: s.billed, reported: rep[m.key] || 0
      };
    });
    out.consumers = d.consumers.map(function (c) { return { id: c.id, name: c.name, code: c.code, type: c.type }; });
    out.payCount = pays.length;
    out.payTotal = pays.reduce(function (t, p) { return t + Number(p.amount); }, 0);
    out.billsReported = Object.keys(paid).length;
    out.recent = viewPayments_(pays.slice(-8).reverse());
  } catch (err) {
    out.message = err.message;
  }
  return out;
}

/** One consumer: all bills (with reported paid amount and status) and their payments. */
function getConsumer(id) {
  var bills = consumerBills_(String(id));
  var paid = paidByBill_();
  bills = bills.map(function (b) {
    var p = paid[b.month + '|' + b.billNo] || 0;
    b.paid = p;
    b.status = statusOf_(b.total, p);
    return b;
  });
  var pays = allPayments_().filter(function (p) { return p.consumer === id; }).reverse();
  return { bills: bills, payments: viewPayments_(pays) };
}

/** All payments for the table on Update Payment (masked for the public, full for the admin). */
function getPayments() {
  return viewPayments_(allPayments_().slice().reverse());
}

/** The bill PDF of one consumer and month, as base64 (the Drive file itself stays private). */
function getBillPdf(id, month, billNo) {
  var bill = null;
  consumerBills_(String(id)).forEach(function (b) { if (b.month === month && b.billNo === String(billNo)) bill = b; });
  if (!bill) throw new Error('Bill not found.');
  var blob = DriveApp.getFileById(billFileId_(bill.month, bill.file)).getBlob();
  return { name: bill.file, data: Utilities.base64Encode(blob.getBytes()) };
}
