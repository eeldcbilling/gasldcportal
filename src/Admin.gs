/**
 * Admin.gs - functions for the Admin panel. Every function checks isAdmin_() itself, because the
 * browser cannot be trusted: hiding the menu item alone would not protect anything.
 */

function requireAdmin_() {
  if (!isAdmin_()) throw new Error('Admin only.');
}

/** Status of the data folder and the data. */
function adminStatus() {
  requireAdmin_();
  var id = props_().getProperty('DATA_FOLDER_ID') || '';
  var out = { folderId: id, folderName: null, problem: null };
  if (id) {
    try {
      out.folderName = DriveApp.getFolderById(id).getName();
      var d = base_();
      out.generated = d.portal.generated;
      out.months = d.portal.months.length;
      out.consumers = d.consumers.length;
      out.payments = allPayments_().length;
    } catch (e) {
      out.problem = e.message;
    }
  }
  return out;
}

/** Saves the Drive folder ID of "LDC Portal Data" (checked: the folder must open). */
function adminSetFolder(id) {
  requireAdmin_();
  id = String(id || '').trim();
  if (!/^[\w-]{10,}$/.test(id)) throw new Error('That does not look like a Drive folder ID.');
  var name = DriveApp.getFolderById(id).getName(); // throws if the folder cannot be opened
  props_().setProperty('DATA_FOLDER_ID', id);
  adminReload();
  return name;
}

/** Empties the cache so the next page load reads Drive again (use after a new export). */
function adminReload() {
  requireAdmin_();
  props_().setProperty('CACHE_NONCE', String(Date.now()));
  return true;
}

/** Rebuilds the payment index files from the single payment files. */
function adminRebuildIndexes() {
  requireAdmin_();
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Busy - try again.');
  try { return rebuildIndexes_(); } finally { lock.releaseLock(); }
}

/** One-time copy of the old portal's payments (see importOldPayments_ in Payments.gs). */
function adminImportOld() {
  requireAdmin_();
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Busy - try again.');
  try { return importOldPayments_(); } finally { lock.releaseLock(); }
}

/** Removes the imported old payments again, so they can be imported afresh. */
function adminRollbackOld() {
  requireAdmin_();
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Busy - try again.');
  try { return rollbackOldPayments_(); } finally { lock.releaseLock(); }
}
