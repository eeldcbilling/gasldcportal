"""
convert_old_payments.py - turns the old portal's payment Excel files into one import file for the new portal.

Run from the project folder:  python tools/convert_old_payments.py
Reads : old payments excel/*.xlsx  and  E:/LDC Portal Data/data/ (consumers + bills, Round 1 export)
Writes: E:/LDC Portal Data/import/old-payments.json   (Admin Panel > "Import old payments" reads it)
        old payments excel/review.csv                  (rows the owner should look at; not committed)

Rules agreed by the owner (03-Nov-2026):
- Rows that match a consumer AND a bill on the portal are linked to that bill; all other rows are still
  logged, without a bill link ("Old portal").
- Payment dates: text "dd/mm/yyyy" is read as written. Cells Excel turned into dates follow the file:
  December, Feb and March files = date is correct as stored; April..September files = the old portal
  swapped day and month, so it is swapped back - unless the swapped date would be after the submission
  time and the stored one is not (then stored). Every such case, and any date after its submission
  time, is listed in review.csv.
- Exact repeated rows (same type, name, invoice, date, UTR, amount, remarks) are dropped, first kept.
- Nothing is guessed: a consumer is matched only by a unique party code, or by the bill number on the portal.
"""
import csv, datetime as dt, glob, json, os, re, sys

DATA = 'E:/LDC Portal Data/'
SRC = 'old payments excel/'
# file name starts with. March has no submission times; its stored dates are correct (remarks agree, e.g.
# row 62 "payment 11.02.2026" = 2026-02-11; swapped they would fall after March).
SWAPPED_FILES = ('april', 'may', 'june', 'july', 'august', 'september')
AS_IS_FILES = ('december', 'feb', 'march')

import openpyxl

def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)

consumers = load(DATA + 'data/consumers.json')
portal = load(DATA + 'data/portal.json')
by_code = {}
for c in consumers:
    by_code.setdefault(c['code'], []).append(c)
by_id = {c['id']: c for c in consumers}
norm = lambda s: re.sub(r'\s+', ' ', s).strip().lower()  # same name = same text, ignoring case and spaces
names_seen = {}
for c in consumers:
    names_seen.setdefault(norm(c['name']), []).append(c)
by_name = {k: v[0] for k, v in names_seen.items() if len(v) == 1}
bills = {}  # billNo -> bill (+ month key / label)
for m in portal['months']:
    for b in load(DATA + 'data/' + m['file'])['bills']:
        if not b['cancelled']:
            bills[b['billNo']] = dict(b, month=m['key'], label=m['label'])

def text(v):
    """Cell value as text, without Excel's '.0' on whole numbers."""
    if v is None:
        return ''
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    if isinstance(v, dt.datetime):
        return v.strftime('%d/%m/%Y')
    return str(v).strip()

rows, review, seen = [], [], set()
dropped = 0
for path in sorted(glob.glob(SRC + '*.xlsx')):
    fname = os.path.basename(path)
    low = fname.lower()
    rule = 'swap' if low.startswith(SWAPPED_FILES) else 'as-is' if low.startswith(AS_IS_FILES) else None
    if rule is None:
        sys.exit('No date rule for file: ' + fname + ' - ask the owner.')
    ws = openpyxl.load_workbook(path, data_only=True).worksheets[0]
    for n, r in enumerate(ws.iter_rows(values_only=True), start=1):
        r = list(r[:9]) + [None] * (9 - len(r[:9]))
        if n == 1 or not any(text(c) for c in r):
            continue
        serial, typ, name, inv, pdate, utr, amount, remarks, ts = r
        problems = []

        # --- payment date ---
        if isinstance(pdate, dt.datetime):
            d = pdate
            if rule == 'swap' and d.day != d.month:
                s = d.replace(day=d.month, month=d.day)  # every such cell in these files has day <= 12
                # file-name hint: a swapped date after the submission time is impossible; the stored one is not
                if isinstance(ts, dt.datetime) and s.date() > ts.date() and d.date() <= ts.date():
                    problems.append('date kept as stored (swapped %s would be after submission)' % s.strftime('%d/%m/%Y'))
                else:
                    d = s
            date = d.strftime('%Y-%m-%d')
        else:
            m = re.fullmatch(r'(\d{2})/(\d{2})/(\d{4})', text(pdate))
            date = None
            if m:
                try:
                    date = dt.date(int(m[3]), int(m[2]), int(m[1])).isoformat()
                except ValueError:
                    pass
            if not date:
                problems.append('payment date not readable: ' + text(pdate))
        tsiso = ts.strftime('%Y-%m-%dT%H:%M:%S+05:30') if isinstance(ts, dt.datetime) else None
        if date and tsiso and date > tsiso[:10]:
            problems.append('payment date after submission time')

        # --- exact repeats ---
        key = (text(typ), text(name), text(inv), date, text(utr), amount, text(remarks))
        if key in seen:
            dropped += 1
            continue
        seen.add(key)

        # --- consumer and bill ---
        name_t = text(name)
        mcode = re.match(r'(\d{9})\s*-', name_t)
        cands = by_code.get(mcode[1], []) if mcode else []
        mnum = re.match(r'\d+', text(inv))
        bill = bills.get(mnum[0]) if mnum else None
        consumer = None
        if bill and any(c['id'] == bill['consumer'] for c in cands):
            consumer = by_id[bill['consumer']]          # code and bill agree
        elif len(cands) > 1 and norm(name_t) in by_name:
            consumer = by_name[norm(name_t)]             # shared code, but the exact full name is unique
            if bill:
                problems.append('bill %s belongs to %s, not this entity - bill not linked' % (bill['billNo'], bill['consumer']))
            bill = None
        elif len(cands) == 1:
            consumer = cands[0]                          # unique party code
            if bill:
                problems.append('bill %s belongs to %s, not this entity - bill not linked' % (bill['billNo'], bill['consumer']))
            bill = None
        else:
            bill = None
            problems.append('entity not matched (party code %s)' % (
                'used by %d consumers' % len(cands) if cands else 'not found' if mcode else 'missing'))

        if not isinstance(amount, (int, float)) or amount <= 0:
            problems.append('amount not a positive number')

        row = {
            'id': 'OLD-%s-%03d' % (re.sub(r'\W', '', low.split(' ')[0])[:4].upper(), n),
            'ts': tsiso,
            'consumer': consumer['id'] if consumer else None,
            'name': consumer['name'] if consumer else name_t,
            'month': bill['month'] if bill else None,
            'label': bill['label'] if bill else 'Old portal',
            'billNo': bill['billNo'] if bill else text(inv),
            'date': date,
            'utr': text(utr),
            'amount': amount,
            'remarks': text(remarks),
            'source': 'old-portal',
            'oldFile': fname,
            'oldRow': n,
        }
        rows.append(row)
        if problems:
            review.append([fname, n, name_t, text(inv), text(pdate), date, text(utr), amount, '; '.join(problems)])

out = {'format': 1, 'made': dt.datetime.now().strftime('%Y-%m-%dT%H:%M:%S+05:30'), 'rows': rows}
os.makedirs(DATA + 'import', exist_ok=True)
tmp = DATA + 'import/old-payments.json.tmp'
with open(tmp, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
os.replace(tmp, DATA + 'import/old-payments.json')
with open(SRC + 'review.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['file', 'excel row', 'name', 'invoice', 'date in excel', 'date used', 'utr', 'amount', 'problem'])
    w.writerows(review)

linked = sum(1 for r in rows if r['month'])
matched = sum(1 for r in rows if r['consumer'])
print('rows kept %d, exact repeats dropped %d' % (len(rows), dropped))
print('entity matched %d, not matched %d' % (matched, len(rows) - matched))
print('linked to a portal bill %d' % linked)
print('rows in review.csv %d' % len(review))
from collections import Counter
print(Counter(p.split(':')[0].split(' (')[0] for x in review for p in x[-1].split('; ')))
