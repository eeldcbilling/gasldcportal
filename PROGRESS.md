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

## Next
0. When the owner returns: check `E:\LDC Portal Data\data\` against DATA_FORMAT.md, then test the portal.
1. Owner: open test URL as eeldcbilling (authorise Drive on first open), Admin Panel > paste folder ID of
   `LDC Portal Data` > Save. Check that the Admin menu shows (Session.getActiveUser) - **verify also on the
   public deployment later**: admin must be detected there too, consumers must not see it.
2. Round 1 session builds the export (prompt: `ROUND1_EXPORT_PROMPT.md`; due-date source is open there). Until then pages
   say "Bill data is not available yet".
3. To test with real data: PDF view (new tab via blob) and download inside the Apps Script iframe; whether
   files the portal writes into the Computers-synced folder come down to the PC.
4. Open: dashboard hero mini-bill sample figures (keep/change?); CIN/PAN/GSTIN/address correct?; Raise Ticket;
   further admin features (8.9); 8.8, 8.11.
