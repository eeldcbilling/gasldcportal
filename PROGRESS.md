# Progress - Portal (Round 2)

Last updated: 03-Nov-2026.

## Done
- 02-Nov-2026: folder renamed to `E:\gas ldc portal\`; GitHub repo created by owner:
  https://github.com/eeldcbilling/gasldcportal.git (linked and first push 03-Nov-2026, branch `main`). Owner: plan for ~600 payment entries a month; PDFs uploaded manually in one go.
- 02-Nov-2026: three layouts (Glass / Minimal / Sidebar) and five palettes were shown to the owner (samples kept
  in `E:\ldc bills\portal-design\`, not needed for development). **Owner chose Minimal + Teal & Amber** and asked
  for Material-style click ripples in the accent colour. Final static reference saved in `design/`.
- 02-Nov-2026: owner answered PORTAL_SPEC.md 8.1-8.3: **JSON on Drive only** (no Firestore ever), **clasp
  accepted**, portal JSON = Round 1 export + Apps Script admin action adding Drive file IDs. Portal account:
  **eeldcbilling@gmail.com**.
- PC check 02-Nov-2026: Node v24.18.0, npm 11.16.0, clasp 3.3.0, git 2.56.0 installed. clasp was logged in as
  junediet4@gmail.com; owner switched it - now **eeldcbilling@gmail.com** (verified).
- 02-Nov-2026: owner chose a **synced folder** `E:\LDC Portal Data\` (Google Drive for desktop, Mirror) instead
  of manual upload - see PORTAL_SPEC.md section 7.

- 02-Nov-2026: Drive for desktop installed and syncing `E:\LDC Portal Data\`; it appears on drive.google.com
  under **Computers** (not My Drive) - fine for Apps Script via folder ID.
- 02-Nov-2026: Apps Script project created ("UPSLDC LDC Billing Portal", scriptId in `.clasp.json`; clasp 3.3
  rejects `--type webapp`, so standalone + `webapp` block in `appsscript.json`: execute as me, anyone anonymous,
  timezone Asia/Kolkata). **Shell built and pushed**: `Code.gs` (doGet, include), `index.html`, `css.html`
  (design CSS copied unchanged), `js.html` (nav, hash routing, theme, footer, ripple, toasts; unbuilt pages show
  a "being built" box). Test URL (owner only): head deployment `AKfycbxv18HJ6jEZccmZ5M9upVruS4OHUB7ZK5uWNSdysIM`
  -> `https://script.google.com/macros/s/<id>/dev`. No public deployment yet.

- 02-Nov-2026: **Dashboard, Download Bill, Update Payment, Billing History, Admin (basic) built and pushed**
  (PORTAL_SPEC.md section 3). Files: `Data.gs` (Drive + chunked cache), `Payments.gs`, `Admin.gs`, `Code.gs`
  (getBoot/getConsumer/getPayments/getBillPdf), `cssApp.html`, `js.html` (UI: combo, modal, DataTable, pdf),
  `jsPages.html`. Export contract: `DATA_FORMAT.md`. Server logic tested locally with mocked Google services
  (18 checks pass; test script was in the session scratchpad, not kept). Not yet tested in real Apps Script.

- 02-Nov-2026: Dashboard crash when no data (BOOT.months undefined) fixed. Owner bookmarked the test URL
  (`.../AKfycbxv18HJ6jEZccmZ5M9upVruS4OHUB7ZK5uWNSdysIM/dev`); extra deployments @1 "new" and @2 "qq" deleted
  on request - only the HEAD (test) deployment exists. Public deployment: create ONE later, update it in place.
- 02-Nov-2026: owner is now building the export in the Round 1 session, using `ROUND1_EXPORT_PROMPT.md`.

- 03-Nov-2026: export Aug-26 (453 bills) + Jul-26 (446) checked against DATA_FORMAT.md: 0 errors (455
  consumers, all bill consumers found, every `file` present, PDFs 0.56-0.64 MB, no nulls, all dates = month
  dates). `total` = `taxable` on every bill although 715 bills have rebate/surcharge - owner: **parked for
  now** (03-Nov-2026), raise again later (status paid/part/unpaid uses `total`).
- 03-Nov-2026: Download Bill no longer pre-selects the newest month (owner); pushed.
- 03-Nov-2026: owner set the data folder ID in Admin Panel and tested on the test URL with real data:
  Admin menu shows, bill view/download and payments CSV download **work**. Phone width OK. Owner made a
  public deployment (link to be given later). Raise Ticket parked by owner.
- 03-Nov-2026: duplicate UTR + bill now saved with an amber warning toast (owner); pushed, not yet tested.
- 03-Nov-2026: old portal payments: `tools/convert_old_payments.py` read 9 Excel files (1,157 rows) ->
  `E:\LDC Portal Data\import\old-payments.json`: 1,150 rows (7 exact repeats dropped), 1,147 entity
  matched, 219 linked to Jul/Aug-26 bills, 12 rows in `old payments excel\review.csv`. Admin button
  "Import old payments (once)" writes `submissions\old-portal\index.json`; tested locally with mocks; pushed.
- 03-Nov-2026: Admin "Roll back old import" (owner): moves only that index.json to Drive Trash; portal
  payments, bills, settings untouched; import works again after it. Drive lookups now skip trashed
  files/folders (Drive lists them). Mock test import -> rollback -> import OK; pushed.
- 03-Nov-2026: Update Payment page: payments table panel uses the full screen width (owner); heading/forms
  stay 1120px; remarks wrap (admin column). Phones unchanged. Pushed, owner to check.

## Next
0. Owner: look at `old payments excel\review.csv` (12 rows), then Admin > "Import old payments (once)";
   check Update Payment table (now full width) / Billing History / dashboard. Rollback button if wrong.
1. Owner: test duplicate UTR + bill warning; test that a payment the portal writes into `submissions\` comes
   down to the PC (Computers-synced folder).
2. Public deployment exists (owner, link to come): update it in place after testing; verify admin is
   detected there and consumers do not see Admin.
3. Parked by owner: total = taxable on every bill; Raise Ticket.
4. Open: Jan-26 old payments file?; old tickets (8.8); dashboard hero mini-bill sample figures; CIN/PAN/GSTIN/
   address correct?; further admin features (8.9); 8.11; widen Billing History too?
