# UPSLDC LDC Billing Portal (Round 2) - Google Apps Script

Public web portal for UPSLDC LDC bill consumers: download bills, report payments, billing history, tickets.
Replaces the current slow GAS portal. Owner: LDC Billing Section, UPSLDC.
Folder: `E:\gas ldc portal\`. Repo (private): https://github.com/eeldcbilling/gasldcportal.git

**Read `PROGRESS.md` first, then only the section of `PORTAL_SPEC.md` you need.** PORTAL_SPEC.md wins over
any default. This folder is deliberately separate from the Round 1 offline tool (`E:\ldc bills\`) to keep
context small: do NOT read files in `E:\ldc bills\` unless the owner asks for it.

## Rules
1. **No assumptions, no guessing.** If anything is unclear or not in PORTAL_SPEC.md, stop and ask the owner -
   as often as needed. Never fill a gap with a "reasonable default". Never state a fact about data unchecked.
2. Build only features the owner has agreed (PORTAL_SPEC.md section 3). Open questions: section 8.
3. Owner knows PHP better than JavaScript: simple, commented code, no frameworks, no build step, no npm
   libraries inside the app (clasp is only the upload tool).
4. No credit card anywhere. No consumer login/PIN. Dedicated Google account for the portal.
5. No Google Sheets / Excel as database (accidental edits). Data = JSON (see PORTAL_SPEC.md section 6).
6. Never commit bill data, payment data, JSON data files, credentials or `.clasprc.json`.
7. Accurate result or no result: never guess a bill, never overwrite a stored submission.
8. UI must follow the final design in `design/` (PORTAL_SPEC.md section 4): same classes, colours, motion,
   WCAG AA contrast, visible focus, aria-labels on icon buttons, prefers-reduced-motion respected.
9. Keep token use low: read files in parts, don't re-read unchanged files, keep md files short and current.

## Layout
- `design/` - final static design reference (open `design/index.html` in a browser; sample data only).
- `PORTAL_SPEC.md` - decisions, pages, data, workflow, open questions.
- `PROGRESS.md` - status and next steps (update at the end of every session).
- `src/` - Apps Script project pushed with clasp (`clasp push` from this folder).
- `DATA_FORMAT.md` - JSON contract the Round 1 export writes and the portal reads.
- `tools/convert_old_payments.py` - one-off: old portal payment Excels -> `import\old-payments.json`.
- `ROUND1_EXPORT_PROMPT.md` - text the owner pastes into the Round 1 session to build that export.
