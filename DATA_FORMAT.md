# Portal data format (contract between Round 1 export and the portal)

Version 1, 02-Nov-2026. The portal (this folder) reads exactly this. Round 1 tool writes it.
Shared folder: `E:\LDC Portal Data\` (Google Drive for desktop, account eeldcbilling@gmail.com).

## Who writes what
| Path inside `E:\LDC Portal Data\` | Written by | Notes |
|---|---|---|
| `data\portal.json` | Round 1 export | month list + dates; written LAST (portal uses `generated` as data version) |
| `data\consumers.json` | Round 1 export | one row per consumer |
| `data\bills\<mmm-yy>.json` | Round 1 export | one file per finalised month |
| `bills\<mmm-yy>\<archive file>.pdf` | Round 1 export (copy of `archive\<mmm-yy>\`) | same names as archive |
| `submissions\...` | **Portal only** | payments/tickets; Round 1 may read, never write |

Rules: UTF-8 JSON, no BOM. Values verbatim from the source (no trimming, no fixing). Dates ISO `yyyy-mm-dd`
or `null` when the source cell is empty - never guessed. Amounts are numbers (rupees, as stored). Only
**finalised** months are exported. Never write into `submissions\`. Write each file to a temp name, then
rename (so the portal never reads a half-written file).

## data\portal.json
```json
{
  "format": 1,
  "generated": "2026-11-02T15:30:00+05:30",
  "months": [
    { "key": "aug-26", "label": "Aug-26", "ym": "2026-08",
      "billDate": "2026-09-08", "dispatchDate": "2026-09-10", "dueDate": "2026-09-17",
      "bills": 453, "file": "bills/aug-26.json" }
  ]
}
```
- `months`: every exported month, any order (portal sorts by `ym`, newest = current month on the portal).
- `key` = archive folder name; `label` = text shown (combined periods e.g. `"Oct 24-Mar 25"`);
  `ym` = month used for sorting (`yyyy-mm` of the folder month).
- `billDate` / `dispatchDate` / `dueDate`: month-level dates shown to consumers; `null` if not one single
  value in the source (portal then shows the per-bill dates only).

## data\consumers.json
```json
[ { "id": "Dharampal.sec67", "name": "110000093 - ACC Cement Ltd. Amethi-Tikaria",
    "code": "110000093", "type": "LTA Consumer", "address": "..." } ]
```
- `id` = Round 1 **short name** (unique, the key used everywhere). `name`/`type`/`address` from the master
  where linked, else the latest `Billing to` / address. `code` = 9-digit party code or `null`.
- No e-mail/phone (portal is public).

## data\bills\<mmm-yy>.json
```json
{ "key": "aug-26", "label": "Aug-26", "ym": "2026-08",
  "bills": [
    { "billNo": "6733", "consumer": "Dharampal.sec67", "billingTo": "110000... - ...",
      "address": "...", "nature": "LTA consumer", "capacityMW": 1.5,
      "invoiceDate": "2026-09-08", "dispatchDate": "2026-09-10", "dueDate": "2026-09-17",
      "taxable": 805.22, "rebate": 0, "surcharge": 0, "total": 950.16,
      "file": "6733_Dharampal.sec67_aug.26.pdf", "cancelled": false } ] }
```
- One row per bill of the month. `billNo` as text. `consumer` = short name (`null` for cancelled bills).
- `file` = exact archive file name inside `bills\<mmm-yy>\`.
- Cancelled bills: `"cancelled": true`, `consumer: null` (portal hides them from consumers).
- Optional numbers (`capacityMW`, `taxable`, `rebate`, `surcharge`) may be `null`. `total` required.
