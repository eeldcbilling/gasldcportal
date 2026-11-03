# Prompt for the Round 1 Claude session (E:\ldc bills\) - build the portal export

Paste the text below into a new Claude Code chat opened in `E:\ldc bills\`.

---

Build a **portal export** for finalised months. The contract is `E:\gas ldc portal\DATA_FORMAT.md` -
read that file first; it wins over any default. (You may read only that one file from `E:\gas ldc portal\`.)

What to write, into `E:\LDC Portal Data\` (Google Drive for desktop syncs it to the portal):
- `data\portal.json` - month list with month-level bill date, dispatch date, due date (written LAST).
- `data\consumers.json` - one row per consumer, `id` = short name; no e-mail/phone.
- `data\bills\<mmm-yy>.json` - one file per finalised month, one row per bill (cancelled bills:
  `cancelled: true`, `consumer: null`).
- `bills\<mmm-yy>\` - copy of that month's `archive\<mmm-yy>\` PDFs, same file names.

Rules:
- Only finalised (locked) months. Values verbatim, dates ISO `yyyy-mm-dd` or `null`, never guessed.
- Never write into `E:\LDC Portal Data\submissions\` (the portal owns it; you may read it later).
- Write each file to a temp name, then rename. Never leave a half-written file.
- The export needs the consolidated Excel's `Dispatch date` (ignored so far, C5) and a **due date**.
  Ask me where the due date comes from - the real consolidated file has no Due Date column (B1).
  Also ask me if month-level dates differ between bills of one month (then month-level = null).
- Add an "Export to portal" button on the Finalize tab (per month, plus "export all finalised months"),
  show what will be written first, log each export in the audit log, update SPEC.md / PROGRESS.md.
- Stop and ask me whenever something is unclear - no assumptions.
