/**
 * Data.gs - reads the portal data written by the Round 1 export (format: DATA_FORMAT.md)
 * from the shared Drive folder "LDC Portal Data", and keeps it in CacheService so pages load fast.
 *
 * Folder ID is stored in Script Properties as DATA_FOLDER_ID (set from the Admin panel).
 * Rule: accurate result or no result - if a file is missing, duplicated or broken we stop with a
 * clear message, we never guess.
 */

var ADMIN_EMAIL = 'eeldcbilling@gmail.com';
var TZ = 'Asia/Kolkata';
var CACHE_SECONDS = 21600;   // 6 hours = CacheService maximum
var CHUNK = 30000;           // characters per cache piece (one value may hold at most 100 KB; Hindi = 3 bytes/char)

/** true only when the person viewing is signed in as the portal account. */
function isAdmin_() {
  try {
    return String(Session.getActiveUser().getEmail()).toLowerCase() === ADMIN_EMAIL;
  } catch (e) {
    return false;
  }
}

function props_() { return PropertiesService.getScriptProperties(); }

/** The "LDC Portal Data" folder. Throws a readable message when it is not set. */
function rootFolder_() {
  var id = props_().getProperty('DATA_FOLDER_ID');
  if (!id) throw new Error('The portal data folder is not set yet. Admin: open Admin Panel > Settings.');
  return DriveApp.getFolderById(id);
}

/** Sub folder by name; creates it only when create = true. Two folders with one name = error. */
function subFolder_(parent, name, create) {
  var it = parent.getFoldersByName(name);
  if (it.hasNext()) {
    var f = it.next();
    if (it.hasNext()) throw new Error('Two folders named "' + name + '" in Drive - please remove one.');
    return f;
  }
  return create ? parent.createFolder(name) : null;
}

/** Walks a path like ['data', 'bills'] from the root folder. */
function folderAt_(parts, create) {
  var f = rootFolder_();
  for (var i = 0; i < parts.length && f; i++) f = subFolder_(f, parts[i], create);
  return f;
}

/** One file by exact name inside a folder (null if missing, error if there are two). */
function fileIn_(folder, name) {
  var it = folder.getFilesByName(name);
  if (!it.hasNext()) return null;
  var f = it.next();
  if (it.hasNext()) throw new Error('Two files named "' + name + '" in Drive - please remove one.');
  return f;
}

function readJsonFile_(file) {
  var text = file.getBlob().getDataAsString('UTF-8').replace(/^﻿/, '');
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('File "' + file.getName() + '" is not valid JSON - re-run the export.');
  }
}

// ---------- cache helpers (big values are split into pieces) ----------

/** Every cache key starts with this; "Reload data" in the admin panel changes it = empties the cache. */
function cachePrefix_() {
  var n = props_().getProperty('CACHE_NONCE') || '0';
  return 'n' + n + ':';
}

function cacheGet_(key) {
  var c = CacheService.getScriptCache();
  key = cachePrefix_() + key;
  var head = c.get(key);
  if (head === null) return null;
  var n = Number(head), keys = [];
  for (var i = 0; i < n; i++) keys.push(key + ':' + i);
  var parts = n ? c.getAll(keys) : {};
  var s = '';
  for (var j = 0; j < keys.length; j++) {
    if (parts[keys[j]] == null) return null; // a piece was dropped by Google - treat as not cached
    s += parts[keys[j]];
  }
  return JSON.parse(s);
}

function cachePut_(key, value, seconds) {
  var c = CacheService.getScriptCache();
  key = cachePrefix_() + key;
  var s = JSON.stringify(value), all = {}, n = 0;
  for (var i = 0; i < s.length; i += CHUNK) all[key + ':' + (n++)] = s.substr(i, CHUNK);
  all[key] = String(n);
  // putAll accepts many keys at once; split into groups to stay well inside its limits
  var names = Object.keys(all);
  for (var g = 0; g < names.length; g += 200) {
    var part = {};
    names.slice(g, g + 200).forEach(function (k) { part[k] = all[k]; });
    c.putAll(part, seconds || CACHE_SECONDS);
  }
}

function cacheDrop_(key) {
  CacheService.getScriptCache().remove(cachePrefix_() + key);
}

// ---------- read data ----------

/** portal.json + consumers.json, checked. Cached 5 minutes so a new export shows up quickly. */
function base_() {
  var d = cacheGet_('base');
  if (d) return d;
  var folder = folderAt_(['data'], false);
  if (!folder) throw new Error('No "data" folder yet - the Round 1 export has not run.');
  var pf = fileIn_(folder, 'portal.json'), cf = fileIn_(folder, 'consumers.json');
  if (!pf || !cf) throw new Error('portal.json or consumers.json is missing - the Round 1 export has not run.');
  var portal = readJsonFile_(pf), consumers = readJsonFile_(cf);
  if (portal.format !== 1) throw new Error('portal.json has an unknown format (expected 1).');
  if (!Array.isArray(portal.months) || !Array.isArray(consumers)) throw new Error('portal.json / consumers.json are not in the agreed format.');
  var seen = {};
  consumers.forEach(function (c) {
    if (!c.id || seen[c.id]) throw new Error('consumers.json: empty or repeated id "' + c.id + '".');
    seen[c.id] = true;
  });
  portal.months.sort(function (a, b) { return a.ym < b.ym ? 1 : a.ym > b.ym ? -1 : 0; }); // newest first
  d = { ver: String(portal.generated), portal: portal, consumers: consumers };
  cachePut_('base', d, 300);
  return d;
}

/**
 * Reads every month file once and stores, per consumer, the list of their bills.
 * Also stores per-month totals for the dashboard. Runs again only when the export changes (ver).
 */
function buildIndex_(d) {
  var folder = folderAt_(['data', 'bills'], false);
  if (!folder) throw new Error('No "data/bills" folder yet - the Round 1 export has not run.');
  var byConsumer = {}, monthStats = [];
  d.consumers.forEach(function (c) { byConsumer[c.id] = []; });

  d.portal.months.forEach(function (m) {
    var name = String(m.file || '').split('/').pop();
    var f = fileIn_(folder, name);
    if (!f) throw new Error('Month file "' + name + '" is listed in portal.json but missing in Drive.');
    var mf = readJsonFile_(f);
    if (!Array.isArray(mf.bills)) throw new Error('Month file "' + name + '" has no bills list.');
    var st = { key: m.key, count: 0, billed: 0 };
    mf.bills.forEach(function (b) {
      if (b.cancelled || !b.consumer) return; // cancelled bills are never shown to consumers
      if (!byConsumer[b.consumer]) throw new Error('Bill ' + b.billNo + ' (' + m.label + ') names consumer "' + b.consumer + '" that is not in consumers.json.');
      byConsumer[b.consumer].push({
        month: m.key, label: m.label, ym: m.ym,
        billNo: String(b.billNo), billingTo: b.billingTo, address: b.address, nature: b.nature,
        capacityMW: b.capacityMW, invoiceDate: b.invoiceDate, dispatchDate: b.dispatchDate, dueDate: b.dueDate,
        taxable: b.taxable, rebate: b.rebate, surcharge: b.surcharge, total: Number(b.total),
        file: b.file
      });
      st.count++;
      st.billed += Number(b.total) || 0;
    });
    monthStats.push(st);
  });

  Object.keys(byConsumer).forEach(function (id) {
    byConsumer[id].sort(function (a, b) { return a.ym < b.ym ? 1 : a.ym > b.ym ? -1 : 0; }); // newest first
  });
  var idx = { byConsumer: byConsumer, monthStats: monthStats };
  cachePut_('idx:' + d.ver, idx); // one cache entry (split into pieces) for the whole index
  return idx;
}

/** The bill index (from cache, or built from Drive). */
function index_() {
  var d = base_();
  return cacheGet_('idx:' + d.ver) || buildIndex_(d);
}

/** All bills of one consumer, newest first. */
function consumerBills_(id) {
  var list = index_().byConsumer[id];
  if (!list) throw new Error('Unknown consumer.');
  return list;
}

/** Per-month bill counts and amounts (dashboard). */
function monthStats_() {
  return index_().monthStats;
}

/** Drive file ID of an archive PDF, looked up by name in bills/<month>/ (never stored IDs). */
function billFileId_(monthKey, fileName) {
  var key = 'fm:' + monthKey, map = cacheGet_(key);
  if (!map || !map[fileName]) {
    var folder = folderAt_(['bills', monthKey], false);
    if (!folder) throw new Error('The PDF folder for ' + monthKey + ' is not in Drive yet.');
    map = {};
    var it = folder.getFiles();
    while (it.hasNext()) {
      var f = it.next(), n = f.getName();
      map[n] = map[n] ? 'DUPLICATE' : f.getId();
    }
    cachePut_(key, map, 3600);
  }
  if (!map[fileName]) throw new Error('The PDF "' + fileName + '" is not in Drive yet.');
  if (map[fileName] === 'DUPLICATE') throw new Error('Two PDFs named "' + fileName + '" in Drive - please remove one.');
  return map[fileName];
}
